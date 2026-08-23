import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { getProfileConfig, saveProfileConfig, saveCoupleId, getCoupleId } from '../services/storageService';
import { fetchCloudCoupleConfig } from '../services/firestoreSync';
import { ensureAnonymousAuth } from '../services/firebase';
import { hapticService } from '../services/hapticService';

interface WelcomeScreenProps {
  onComplete: (activeProfile: UserProfile) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const initialConfig = getProfileConfig();

  // Asegura autenticación anónima inmediata en segundo plano
  useEffect(() => {
    ensureAnonymousAuth().catch(console.warn);
  }, []);

  // Check URL params for invite code (e.g., ?pareja=AMOR-4821 or ?join=AMOR-4821)
  const urlParams = new URLSearchParams(window.location.search);
  const inviteCodeFromUrl = urlParams.get('pareja') || urlParams.get('join') || urlParams.get('codigo');

  const [mode, setMode] = useState<'create' | 'join'>(inviteCodeFromUrl ? 'join' : 'create');
  const [inviteCodeInput, setInviteCodeInput] = useState(inviteCodeFromUrl || '');
  const [remoteCreatorName, setRemoteCreatorName] = useState<string | null>(null);
  const [remoteCreatorColor, setRemoteCreatorColor] = useState<'blue' | 'pink'>('pink');
  const [remoteCreatorSlot, setRemoteCreatorSlot] = useState<UserProfile>('partner2');
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [codeNotFound, setCodeNotFound] = useState(false);

  // Profile Slot & Name for the creator
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>(initialConfig.activeProfile || 'partner1');
  const [chosenColor, setChosenColor] = useState<'blue' | 'pink'>('blue');
  const [partner1Name, setPartner1Name] = useState(
    initialConfig.partner1Name === 'Tú' || initialConfig.maleName === 'Él' || initialConfig.maleName === 'Dani' ? '' : (initialConfig.partner1Name || '')
  );
  const [partner2Name, setPartner2Name] = useState(
    initialConfig.partner2Name === 'Pareja' || initialConfig.femaleName === 'Ella' ? '' : (initialConfig.partner2Name || '')
  );

  // Name / nickname and color for the invited partner when joining
  const [joinNickname, setJoinNickname] = useState('');
  const [joinColor, setJoinColor] = useState<'blue' | 'pink'>('pink');

  // Fetch and validate cloud couple info when in join mode
  useEffect(() => {
    if (mode !== 'join') {
      setCodeNotFound(false);
      setIsLoadingRemote(false);
      return;
    }

    const cleanCode = inviteCodeInput.replace(/^EJ:\s*/i, '').replace(/^EJEMPLO:\s*/i, '').trim().toUpperCase();
    if (cleanCode && cleanCode.length >= 6) {
      setIsLoadingRemote(true);
      setCodeNotFound(false);

      const timer = setTimeout(() => {
        fetchCloudCoupleConfig(cleanCode).then((remoteConfig) => {
          setIsLoadingRemote(false);
          if (remoteConfig && remoteConfig.isSetupComplete) {
            // Find who the creator really is:
            let creatorName = 'Tu pareja';
            let creatorSlot: UserProfile = remoteConfig.activeProfile || 'partner1';
            
            if (creatorSlot === 'partner2' && remoteConfig.partner2Name && remoteConfig.partner2Name !== 'Pareja') {
              creatorName = remoteConfig.partner2Name;
            } else if (creatorSlot === 'partner1' && remoteConfig.partner1Name && remoteConfig.partner1Name !== 'Pareja' && remoteConfig.partner1Name !== 'Tú') {
              creatorName = remoteConfig.partner1Name;
            } else if (remoteConfig.partner2Name && remoteConfig.partner2Name !== 'Pareja' && remoteConfig.partner2Name !== 'Tú') {
              creatorName = remoteConfig.partner2Name;
              creatorSlot = 'partner2';
            } else if (remoteConfig.partner1Name && remoteConfig.partner1Name !== 'Pareja' && remoteConfig.partner1Name !== 'Tú') {
              creatorName = remoteConfig.partner1Name;
              creatorSlot = 'partner1';
            }

            const cColor: 'blue' | 'pink' = (creatorSlot === 'partner2' ? remoteConfig.partner2Color : remoteConfig.partner1Color) 
              || (creatorSlot === 'partner2' ? 'pink' : 'blue');

            setRemoteCreatorName(creatorName);
            setRemoteCreatorColor(cColor);
            setRemoteCreatorSlot(creatorSlot);

            // Invitee gets the opposite slot in Firestore
            const inviteeSlot: UserProfile = creatorSlot === 'partner1' ? 'partner2' : 'partner1';
            setSelectedProfile(inviteeSlot);
            // Default join color to the other color, but invitee can freely change it to whatever they want!
            setJoinColor(cColor === 'pink' ? 'blue' : 'pink');
            setCodeNotFound(false);
          } else {
            setRemoteCreatorName(null);
            setCodeNotFound(true);
          }
        }).catch(() => {
          setIsLoadingRemote(false);
          setRemoteCreatorName(null);
          setCodeNotFound(true);
        });
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setRemoteCreatorName(null);
      setIsLoadingRemote(false);
      setCodeNotFound(false);
    }
  }, [inviteCodeInput, mode]);

  // Validation rules:
  // In Create Mode: Must write your name
  const currentTypedName = (selectedProfile === 'partner1' ? partner1Name : partner2Name).trim();
  const hasValidCreateName = currentTypedName.length > 0;

  // In Join Mode: Code must exist AND must write your name
  const currentJoinName = joinNickname.trim();
  const hasValidJoinName = currentJoinName.length > 0;
  const isJoinReady = Boolean(remoteCreatorName) && hasValidJoinName;

  const isFormValid = mode === 'create' ? hasValidCreateName : isJoinReady;

  const handleStart = () => {
    if (!isFormValid) {
      hapticService.playWarning();
      return;
    }

    hapticService.playSuccess();
    const cleanCode = inviteCodeInput.replace(/^EJ:\s*/i, '').replace(/^EJEMPLO:\s*/i, '').trim().toUpperCase();
    const finalCoupleId = mode === 'join' && cleanCode
      ? cleanCode
      : getCoupleId();

    let finalP1 = 'Tú';
    let finalP2 = 'Pareja';
    let finalP1Color: 'blue' | 'pink' = 'blue';
    let finalP2Color: 'blue' | 'pink' = 'pink';

    if (mode === 'create') {
      if (selectedProfile === 'partner1') {
        finalP1 = currentTypedName;
        finalP1Color = chosenColor;
        finalP2 = 'Pareja';
        finalP2Color = chosenColor === 'blue' ? 'pink' : 'blue';
      } else {
        finalP2 = currentTypedName;
        finalP2Color = chosenColor;
        finalP1 = 'Pareja';
        finalP1Color = chosenColor === 'pink' ? 'blue' : 'pink';
      }
    } else {
      // Joining mode
      if (selectedProfile === 'partner2') {
        finalP1 = remoteCreatorName || 'Tu pareja';
        finalP1Color = remoteCreatorColor;
        finalP2 = currentJoinName;
        finalP2Color = joinColor;
      } else {
        finalP1 = currentJoinName;
        finalP1Color = joinColor;
        finalP2 = remoteCreatorName || 'Tu pareja';
        finalP2Color = remoteCreatorColor;
      }
    }

    saveCoupleId(finalCoupleId);
    saveProfileConfig({
      partner1Name: finalP1,
      partner2Name: finalP2,
      partner1Color: finalP1Color,
      partner2Color: finalP2Color,
      activeProfile: selectedProfile,
      isSetupComplete: true,
      coupleId: finalCoupleId
    });

    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}

    onComplete(selectedProfile);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-on-surface">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white/95 rounded-[32px] p-6 sm:p-8 border-4 border-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3),inset_0_3px_6px_rgba(255,255,255,1)] my-auto"
      >
        {/* App Title Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full candy-btn text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <span className="material-symbols-outlined text-[24px]">favorite</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight italic drop-shadow-sm my-0.5">
            Mi Agenda
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-semibold mt-1 max-w-xs mx-auto">
            {mode === 'join' 
              ? 'Únete a la agenda compartida de tu pareja'
              : 'Elige tu avatar y escribe tu nombre'}
          </p>
        </div>

        {/* Mode Switcher Pills */}
        <div className="flex bg-surface-container-high/60 p-1 rounded-2xl mb-5 max-w-xs mx-auto border border-white">
          <button
            type="button"
            onClick={() => {
              hapticService.playLightTap();
              setMode('create');
              setCodeNotFound(false);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              mode === 'create'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Nueva Pareja
          </button>
          <button
            type="button"
            onClick={() => {
              hapticService.playLightTap();
              setMode('join');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              mode === 'join'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tengo un Código 🔑
          </button>
        </div>

        {/* JOIN INVITATION MODE */}
        {mode === 'join' ? (
          <div className="space-y-4 mb-6">
            <div className="bg-white/90 p-4 rounded-2xl border-2 border-primary/20 shadow-sm text-center">
              <label className="block text-[11px] font-black text-primary uppercase tracking-wider mb-2">
                Código de Pareja / Invitación:
              </label>
              <input
                type="text"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                placeholder="Pega el código aquí (ej: AMOR-XXXX)"
                className="w-full text-center px-4 py-3 rounded-xl bg-surface-container-high/40 border-2 border-primary/40 text-lg font-black tracking-widest text-primary focus:outline-none focus:ring-2 focus:ring-primary uppercase shadow-inner"
              />
              
              {/* Searching Indicator */}
              {isLoadingRemote && (
                <div className="text-xs text-primary font-bold mt-2.5 flex items-center justify-center space-x-1.5 animate-pulse">
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Verificando código en la nube...</span>
                </div>
              )}

              {/* Code Not Found Alert */}
              {codeNotFound && !isLoadingRemote && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-left space-y-1"
                >
                  <div className="flex items-center space-x-1.5 text-red-700">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>Código no encontrado</span>
                  </div>
                  <p className="text-[11px] text-red-600/90 font-medium">
                    Verifica que el código coincida exactamente con el de tu pareja (ej: AMOR-W49Q). Si es tu primera vez creando la agenda, selecciona la pestaña <b>"Nueva Pareja"</b>.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Found Partner Invitation Card */}
            {remoteCreatorName && !isLoadingRemote && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="plush-card rounded-2xl p-5 border-2 border-primary/30 bg-gradient-to-br from-white via-pink-50/40 to-sky-50/40 text-center space-y-4 shadow-md"
              >
                {/* Creator Header with Avatar */}
                <div className="flex items-center justify-center space-x-3">
                  <div className={`w-11 h-11 rounded-full text-white flex items-center justify-center shadow-sm border-2 border-white ${
                    remoteCreatorColor === 'blue'
                      ? 'bg-gradient-to-b from-[#56c6ff] via-[#008fbf] to-[#004c6a]'
                      : 'bg-gradient-to-b from-[#fca5d7] via-[#d6289b] to-[#73054f]'
                  }`}>
                    <span className="material-symbols-outlined text-[24px]">person</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-secondary leading-none block">
                      Invitación de Pareja
                    </span>
                    <p className="text-base text-on-surface font-black">
                      ¡<span className="text-primary font-black">{remoteCreatorName}</span> te ha invitado!
                    </p>
                  </div>
                </div>

                {/* Color Selector for the Invitee */}
                <div className="pt-1">
                  <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-wider mb-2 text-center">
                    Elige tu avatar y color preferido:
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    {/* Blue Choice */}
                    <button
                      type="button"
                      onClick={() => {
                        hapticService.playLightTap();
                        setJoinColor('blue');
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center space-y-1.5 ${
                        joinColor === 'blue'
                          ? 'bg-sky-50 border-[#007dab] shadow-md ring-2 ring-[#007dab]/20'
                          : 'bg-white/80 border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#56c6ff] via-[#008fbf] to-[#004c6a] text-white flex items-center justify-center border border-white shadow-xs">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <span className="text-xs font-black text-[#004c6a]">Azul</span>
                    </button>

                    {/* Pink Choice */}
                    <button
                      type="button"
                      onClick={() => {
                        hapticService.playLightTap();
                        setJoinColor('pink');
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center space-y-1.5 ${
                        joinColor === 'pink'
                          ? 'bg-pink-50 border-primary shadow-md ring-2 ring-primary/20'
                          : 'bg-white/80 border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#fca5d7] via-[#d6289b] to-[#73054f] text-white flex items-center justify-center border border-white shadow-xs">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <span className="text-xs font-black text-primary">Rosa</span>
                    </button>
                  </div>
                </div>

                {/* Nickname Input */}
                <div className="text-left bg-white/95 p-3 rounded-xl border border-primary/30 shadow-xs">
                  <label className="block text-[10px] font-black text-secondary uppercase tracking-wider mb-1">
                    Tu nombre o apodo:
                  </label>
                  <input
                    type="text"
                    value={joinNickname}
                    onChange={(e) => setJoinNickname(e.target.value)}
                    placeholder="Ej: Valentina, Mateo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-secondary/40 focus:border-secondary focus:outline-none text-xs font-black text-on-surface shadow-xs"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* CREATE / SETUP MODE */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Card 1: Perfil Azul */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                hapticService.playLightTap();
                setSelectedProfile('partner1');
                setChosenColor('blue');
              }}
              className={`rounded-3xl p-5 transition-all cursor-pointer relative flex flex-col items-center text-center select-none overflow-hidden ${
                selectedProfile === 'partner1'
                  ? 'bg-gradient-to-b from-[#eaf6ff] via-[#d4edff] to-[#bde3ff] border-4 border-[#007dab] shadow-[0_18px_36px_rgba(0,125,171,0.35),inset_0_4px_8px_rgba(255,255,255,1),inset_0_-6px_12px_rgba(0,90,125,0.25)] ring-4 ring-[#007dab]/20'
                  : 'bg-gradient-to-b from-[#fbfdff] via-[#f0f6fa] to-[#e4eef5] border-3 border-white shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_3px_6px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.06)] opacity-75 hover:opacity-100'
              }`}
            >
              <div className="absolute top-0 left-10 right-10 h-3 bg-gradient-to-b from-white/80 to-transparent rounded-b-full pointer-events-none" />

              {selectedProfile === 'partner1' && (
                <span className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gradient-to-b from-[#2bb7eb] to-[#006388] text-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,99,136,0.5),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </span>
              )}

              <div className="p-2 rounded-full bg-white/70 shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),0_2px_4px_rgba(255,255,255,0.9)] border border-white/90 mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#56c6ff] via-[#008fbf] to-[#004c6a] p-1 shadow-inner relative overflow-hidden flex items-center justify-center border-2 border-white/80 text-white">
                  <span className="material-symbols-outlined text-[32px]">person</span>
                </div>
              </div>

              {/* Casilla interactiva si es el seleccionado */}
              {selectedProfile === 'partner1' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full mt-1 p-2.5 rounded-2xl bg-white/90 shadow-inner border border-white" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="block text-[10px] font-black text-left text-[#004c6a] uppercase tracking-wider mb-1 pl-1">
                    Tu nombre o apodo:
                  </label>
                  <input
                    type="text"
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    placeholder="Ej: Mateo, Lucas"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-[#007dab]/40 focus:border-[#007dab] focus:outline-none text-xs font-black text-on-surface shadow-xs"
                    autoFocus
                  />
                </motion.div>
              ) : (
                <div className="w-full mt-2 py-3 px-2 rounded-2xl bg-white/50 border border-white text-center">
                  <p className="text-[11px] font-extrabold text-[#004c6a]">
                    Perfil Azul
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Toca para elegir este avatar
                  </p>
                </div>
              )}

              <div className="w-full mt-3 py-2 rounded-xl text-xs select-none transition-all">
                {selectedProfile === 'partner1' ? (
                  hasValidCreateName ? (
                    <span className="text-[#004c6a] font-extrabold">✓ Soy {currentTypedName}</span>
                  ) : (
                    <span className="text-slate-400 font-medium italic">Escribe tu nombre arriba ✍️</span>
                  )
                ) : (
                  <span className="text-slate-400 font-bold">Tu pareja lo usará</span>
                )}
              </div>
            </motion.div>

            {/* Card 2: Perfil Rosa */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                hapticService.playLightTap();
                setSelectedProfile('partner2');
                setChosenColor('pink');
              }}
              className={`rounded-3xl p-5 transition-all cursor-pointer relative flex flex-col items-center text-center select-none overflow-hidden ${
                selectedProfile === 'partner2'
                  ? 'bg-gradient-to-b from-[#fff0f7] via-[#fde1f0] to-[#fbcde7] border-4 border-primary shadow-[0_18px_36px_rgba(175,10,120,0.35),inset_0_4px_8px_rgba(255,255,255,1),inset_0_-6px_12px_rgba(140,10,100,0.25)] ring-4 ring-primary/20'
                  : 'bg-gradient-to-b from-[#fffafd] via-[#fbf2f8] to-[#f7e6f2] border-3 border-white shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_3px_6px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.06)] opacity-75 hover:opacity-100'
              }`}
            >
              <div className="absolute top-0 left-10 right-10 h-3 bg-gradient-to-b from-white/80 to-transparent rounded-b-full pointer-events-none" />

              {selectedProfile === 'partner2' && (
                <span className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gradient-to-b from-[#e632a6] to-[#8c0860] text-white flex items-center justify-center shadow-[0_4px_10px_rgba(175,10,120,0.5),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </span>
              )}

              <div className="p-2 rounded-full bg-white/70 shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),0_2px_4px_rgba(255,255,255,0.9)] border border-white/90 mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#fca5d7] via-[#d6289b] to-[#73054f] p-1 shadow-inner relative overflow-hidden flex items-center justify-center border-2 border-white/80 text-white">
                  <span className="material-symbols-outlined text-[32px]">person</span>
                </div>
              </div>

              {/* Casilla interactiva si es el seleccionado */}
              {selectedProfile === 'partner2' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full mt-1 p-2.5 rounded-2xl bg-white/90 shadow-inner border border-white" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="block text-[10px] font-black text-left text-primary uppercase tracking-wider mb-1 pl-1">
                    Tu nombre o apodo:
                  </label>
                  <input
                    type="text"
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    placeholder="Ej: Valentina, Camila"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border-2 border-primary/40 focus:border-primary focus:outline-none text-xs font-black text-on-surface shadow-xs"
                    autoFocus
                  />
                </motion.div>
              ) : (
                <div className="w-full mt-2 py-3 px-2 rounded-2xl bg-white/50 border border-white text-center">
                  <p className="text-[11px] font-extrabold text-primary">
                    Perfil Rosa
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Toca para elegir este avatar
                  </p>
                </div>
              )}

              <div className="w-full mt-3 py-2 rounded-xl text-xs select-none transition-all">
                {selectedProfile === 'partner2' ? (
                  hasValidCreateName ? (
                    <span className="text-primary font-extrabold">✓ Soy {currentTypedName}</span>
                  ) : (
                    <span className="text-slate-400 font-medium italic">Escribe tu nombre arriba ✍️</span>
                  )
                ) : (
                  <span className="text-slate-400 font-bold">Tu pareja lo usará</span>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Enter / Join Button */}
        <motion.button
          whileTap={isFormValid && !isLoadingRemote ? { scale: 0.96, y: 2 } : {}}
          onClick={handleStart}
          disabled={!isFormValid || isLoadingRemote}
          className={`w-full py-4 rounded-full font-black text-sm sm:text-base flex items-center justify-center space-x-2 select-none border border-white/30 transition-all ${
            isFormValid && !isLoadingRemote
              ? 'candy-btn text-white shadow-[0_12px_28px_rgba(175,10,120,0.45)] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border-transparent'
          }`}
        >
          <span>
            {mode === 'join' 
              ? (remoteCreatorName 
                  ? (hasValidJoinName ? `Entrar como ${currentJoinName}` : 'Escribe tu nombre para entrar')
                  : (isLoadingRemote ? 'Verificando código...' : 'Ingresa un código válido para unirte'))
              : (hasValidCreateName ? `Entrar como ${currentTypedName}` : 'Escribe tu nombre para entrar')}
          </span>
          <span className="material-symbols-outlined text-[20px] font-bold">
            {isFormValid && !isLoadingRemote ? 'arrow_forward' : 'lock'}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
