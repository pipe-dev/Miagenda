import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DedicationItem, CoupleMoodStatus, CoupleMoodNeed, UserProfile } from '../types';
import { getUserDisplayName } from '../services/storageService';
import InteractiveBatteryGauge, { getBatteryColor } from './InteractiveBatteryGauge';
import LoveCouponsVault from './LoveCouponsVault';
import CoupleSoftLockGate from './CoupleSoftLockGate';
import { hapticService } from '../services/hapticService';

interface MemoriesVaultProps {
  dedications: DedicationItem[];
  coupleMoods: Record<UserProfile, CoupleMoodStatus>;
  activeProfile: UserProfile;
  onNewDedication: () => void;
  onOpenMoodCheckin: () => void;
  onReplayDedication: (dedication: DedicationItem) => void;
  onDeleteDedication?: (dedication: DedicationItem) => void;
}

type TabMode = 'mood' | 'coupons' | 'vault';

const NEED_MAP: Record<CoupleMoodNeed, { label: string; icon: string; tagBg: string }> = {
  intimacy: { label: 'Intimidad & Pasión', icon: '🔥', tagBg: 'bg-rose-100 text-rose-700 border-rose-200' },
  cuddle: { label: 'Ternura & Apapacho', icon: '🧸', tagBg: 'bg-amber-100 text-amber-800 border-amber-200' },
  touch: { label: 'Contacto & Abrazos', icon: '🫂', tagBg: 'bg-purple-100 text-purple-700 border-purple-200' },
  talk: { label: 'Charla & Desahogo', icon: '💬', tagBg: 'bg-blue-100 text-blue-700 border-blue-200' },
  space: { label: 'Espacio & Calma', icon: '🌿', tagBg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  chill: { label: 'Plan chill & Pelis', icon: '🍿', tagBg: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  hangout: { label: 'Salir y despejarnos', icon: '🎉', tagBg: 'bg-pink-100 text-pink-700 border-pink-200' }
};

export default function MemoriesVault({
  dedications,
  coupleMoods,
  activeProfile,
  onNewDedication,
  onOpenMoodCheckin,
  onReplayDedication,
  onDeleteDedication
}: MemoriesVaultProps) {
  const [tabMode, setTabMode] = useState<TabMode>('mood');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const partnerProfile: UserProfile = activeProfile === 'partner1' ? 'partner2' : 'partner1';
  const defaultMood = (p: UserProfile): CoupleMoodStatus => ({
    profile: p,
    battery: 0,
    need: 'cuddle',
    note: '',
    updatedAt: new Date().toISOString(),
    isConfigured: false
  });

  const myStatus: CoupleMoodStatus = coupleMoods?.[activeProfile] || defaultMood(activeProfile);
  const partnerStatus: CoupleMoodStatus = coupleMoods?.[partnerProfile] || defaultMood(partnerProfile);

  const isMyConfigured = Boolean(myStatus && myStatus.battery > 0 && myStatus.isConfigured !== false);
  const isPartnerConfigured = Boolean(partnerStatus && partnerStatus.battery > 0 && partnerStatus.isConfigured !== false);

  const myColorInfo = getBatteryColor(isMyConfigured ? myStatus.battery : 0);
  const partnerColorInfo = getBatteryColor(isPartnerConfigured ? partnerStatus.battery : 0);

  const toggleAudio = (id: string) => {
    if (playingId === id) {
      if (audioRefs.current[id]) audioRefs.current[id]?.pause();
      setPlayingId(null);
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId]?.pause();
      }
      if (audioRefs.current[id]) {
        audioRefs.current[id]!.currentTime = 0;
        audioRefs.current[id]?.play();
        setPlayingId(id);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-32 pt-2">
      {/* 🌟 Segmented Switch: Energía vs Cupones vs Recuerdos */}
      <div className="flex justify-center items-center mb-6">
        <div className="sunken-well bg-white/75 p-1.5 rounded-full flex items-center space-x-1 border border-white/60 shadow-inner">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              hapticService.playLightTap();
              setTabMode('mood');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-colors relative select-none flex items-center space-x-1 ${
              tabMode === 'mood' ? 'text-white' : 'text-on-surface-variant active:text-primary'
            }`}
          >
            {tabMode === 'mood' && (
              <motion.div
                layoutId="memories-mode-pill"
                className="absolute inset-0 rounded-full candy-accent-bicolor"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="material-symbols-outlined text-[15px] relative z-10">battery_charging_full</span>
            <span className="relative z-10">Energía</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              hapticService.playLightTap();
              setTabMode('coupons');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-colors relative select-none flex items-center space-x-1 ${
              tabMode === 'coupons' ? 'text-white' : 'text-on-surface-variant active:text-primary'
            }`}
          >
            {tabMode === 'coupons' && (
              <motion.div
                layoutId="memories-mode-pill"
                className="absolute inset-0 rounded-full candy-accent-bicolor"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="material-symbols-outlined text-[15px] relative z-10">confirmation_number</span>
            <span className="relative z-10">Cupones 3D</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              hapticService.playLightTap();
              setTabMode('vault');
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-colors relative select-none flex items-center space-x-1 ${
              tabMode === 'vault' ? 'text-white' : 'text-on-surface-variant active:text-primary'
            }`}
          >
            {tabMode === 'vault' && (
              <motion.div
                layoutId="memories-mode-pill"
                className="absolute inset-0 rounded-full candy-accent-bicolor-reverse"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="material-symbols-outlined text-[15px] relative z-10">photo_library</span>
            <span className="relative z-10">Recuerdos</span>
          </motion.button>
        </div>
      </div>

      {/* 🌟 Bloqueo Suave / Onboarding de Conexión de Pareja */}
      <CoupleSoftLockGate
        featureTitle="Espacio de Amor & Vales de Pareja"
        featureDescription="Para enviar dedicatorias, regalar vales de amor interactivos y ver la batería de energía de tu pareja en tiempo real, conecta a tu pareja primero."
      >
        {/* ========================================================= */}
        {/* 🔋 VIEW 1: ENERGÍA & ESTADO DE PAREJA                     */}
      {/* ========================================================= */}
      {tabMode === 'mood' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                Conexión Diaria
              </span>
              <h2 className="font-extrabold text-2xl text-on-surface tracking-tight select-none">
                Batería & Energía
              </h2>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                hapticService.playPhysicalThud(0.28, 0.18);
                onOpenMoodCheckin();
              }}
              className="px-4 py-2 rounded-full candy-btn text-white text-xs sm:text-sm font-black shadow-md flex items-center space-x-1.5 select-none"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Actualizar mi estado</span>
            </motion.button>
          </div>

          {/* Dual Mood Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Mi Estado Actual */}
            <div className="plush-card rounded-3xl p-5 border-2 border-white shadow-md relative overflow-hidden bg-white/95 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-2xl candy-btn text-white flex items-center justify-center text-sm font-black shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant leading-none block mb-0.5">
                        Tu Estado Hoy
                      </span>
                      <h4 className="font-extrabold text-base text-on-surface">
                        {getUserDisplayName(activeProfile)}
                      </h4>
                    </div>
                  </div>

                  {myColorInfo && (
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full border flex items-center space-x-1 shadow-2xs ${myColorInfo.badgeBg}`}>
                      <span>{myColorInfo.icon}</span>
                      <span>{isMyConfigured ? `${myStatus.battery}%` : 'Sin configurar'}</span>
                    </span>
                  )}
                </div>

                {isMyConfigured ? (
                  <div className="flex items-center space-x-4 pt-1">
                    {/* Visual Battery Capsule */}
                    <div className="shrink-0">
                      <InteractiveBatteryGauge
                        value={myStatus.battery}
                        isInteractive={false}
                        size="md"
                      />
                    </div>

                    {/* Needs & Note */}
                    <div className="flex-1 space-y-2.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-on-surface-variant">Te apetece:</span>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs flex items-center space-x-1.5 ${NEED_MAP[myStatus.need].tagBg}`}>
                          <span>{NEED_MAP[myStatus.need].icon}</span>
                          <span className="truncate">{NEED_MAP[myStatus.need].label}</span>
                        </span>
                      </div>

                      {myStatus.note && (
                        <p className="text-xs text-on-surface font-medium bg-surface-container-high/50 p-2.5 rounded-2xl border border-white/80 italic leading-relaxed">
                          "{myStatus.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 pt-1">
                    <div className="shrink-0">
                      <InteractiveBatteryGauge
                        value={0}
                        isInteractive={false}
                        size="md"
                      />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <p className="text-xs text-on-surface-variant font-medium">
                        Aún no has registrado cómo te sientes hoy.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenMoodCheckin}
                        className="px-3.5 py-1.5 rounded-full candy-btn text-white text-xs font-black shadow-xs flex items-center space-x-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">tune</span>
                        <span>Ajustar mi energía</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-surface-variant/40 flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant font-bold">
                  {isMyConfigured ? `Actualizado ${new Date(myStatus.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Pendiente por registrar'}
                </span>
                <button
                  type="button"
                  onClick={onOpenMoodCheckin}
                  className="text-xs font-extrabold text-primary hover:underline"
                >
                  {isMyConfigured ? 'Cambiar' : 'Ajustar'}
                </button>
              </div>
            </div>

            {/* Card 2: Estado de mi Pareja */}
            <div className="plush-card rounded-3xl p-5 border-2 border-white shadow-md relative overflow-hidden bg-gradient-to-br from-white/95 to-pink-50/70 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-2xl candy-accent-bicolor text-white flex items-center justify-center text-sm font-black shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">favorite</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-secondary leading-none block mb-0.5">
                        Estado de tu Pareja
                      </span>
                      <h4 className="font-extrabold text-base text-on-surface">
                        {getUserDisplayName(partnerProfile)}
                      </h4>
                    </div>
                  </div>

                  {partnerColorInfo && (
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full border flex items-center space-x-1 shadow-2xs ${partnerColorInfo.badgeBg}`}>
                      <span>{partnerColorInfo.icon}</span>
                      <span>{isPartnerConfigured ? `${partnerStatus.battery}%` : 'Sin configurar'}</span>
                    </span>
                  )}
                </div>

                {isPartnerConfigured ? (
                  <div className="flex items-center space-x-4 pt-1">
                    {/* Visual Battery Capsule */}
                    <div className="shrink-0">
                      <InteractiveBatteryGauge
                        value={partnerStatus.battery}
                        isInteractive={false}
                        size="md"
                      />
                    </div>

                    {/* Needs & Note */}
                    <div className="flex-1 space-y-2.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-on-surface-variant">Le apetece:</span>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs flex items-center space-x-1.5 ${NEED_MAP[partnerStatus.need].tagBg}`}>
                          <span>{NEED_MAP[partnerStatus.need].icon}</span>
                          <span className="truncate">{NEED_MAP[partnerStatus.need].label}</span>
                        </span>
                      </div>

                      {partnerStatus.note && (
                        <p className="text-xs text-on-surface font-medium bg-white/90 p-2.5 rounded-2xl border border-pink-200/60 italic leading-relaxed shadow-2xs">
                          "{partnerStatus.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 pt-1">
                    <div className="shrink-0">
                      <InteractiveBatteryGauge
                        value={0}
                        isInteractive={false}
                        size="md"
                      />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-xs text-on-surface-variant font-medium">
                        {getUserDisplayName(partnerProfile)} aún no ha actualizado su estado hoy.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-surface-variant/40 flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant font-bold">
                  {isPartnerConfigured ? `Actualizado ${new Date(partnerStatus.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Pendiente por registrar'}
                </span>
                <span className="text-[10px] font-bold text-secondary">
                  ✨ Conexión activa
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 🎟️ VIEW 2: CUPONES DE AMOR CANJEABLES (3D GIFT CARDS)    */}
      {/* ========================================================= */}
      {tabMode === 'coupons' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <LoveCouponsVault activeProfile={activeProfile} />
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 📸 VIEW 3: RECUERDOS (DEDICATORIAS & FOTOS)               */}
      {/* ========================================================= */}
      {tabMode === 'vault' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                Cápsula del Tiempo
              </span>
              <h2 className="font-extrabold text-2xl text-on-surface tracking-tight select-none">
                Recuerdos & Fotos
              </h2>
            </div>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                hapticService.playPhysicalThud(0.28, 0.18);
                onNewDedication();
              }}
              className="px-4 py-2 rounded-full candy-btn text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md select-none"
            >
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
              <span>Nueva Dedicatoria</span>
            </motion.button>
          </div>

          {/* Dedications List */}
          {dedications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {dedications.map((ded, index) => {
                  const isFromMe = ded.from === activeProfile;
                  return (
                    <motion.div
                      key={ded.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.08, type: 'spring', stiffness: 350, damping: 25 }}
                      className="plush-card rounded-3xl p-4 sm:p-5 border border-white hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group shadow-md flex flex-col justify-between"
                    >
                      {/* Top sender tag */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            {ded.from === 'partner2' ? 'person' : 'person_outline'}
                          </span>
                          <span className="text-xs font-bold text-on-surface">
                            {isFromMe ? 'Tú enviaste' : `De: ${ded.authorName || getUserDisplayName(ded.from)}`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-on-surface-variant font-bold">
                            {new Date(ded.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {onDeleteDedication && (
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => {
                                hapticService.playWarning();
                                onDeleteDedication(ded);
                              }}
                              className="w-6 h-6 rounded-full bg-white/60 hover:bg-red-50 text-on-surface-variant hover:text-red-500 flex items-center justify-center transition-colors shadow-sm ml-1"
                              title="Eliminar recuerdo"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Note Content */}
                      <p className="text-sm font-semibold text-on-surface leading-relaxed mb-4">
                        "{ded.note}"
                      </p>

                      {/* Attached Photo */}
                      {ded.photoUrl && (
                        <div className="mb-4 rounded-2xl overflow-hidden shadow-inner border border-white/60 relative group-hover:scale-[1.02] transition-transform duration-300 aspect-video max-h-48">
                          <img
                            src={ded.photoUrl}
                            alt="Recuerdo de pareja"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Attached Audio Note */}
                      {ded.audioUrl && (
                        <div className="mb-4 bg-white/70 rounded-2xl p-2.5 border border-white flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                hapticService.playLightTap();
                                toggleAudio(ded.id);
                              }}
                              className="w-8 h-8 rounded-full candy-btn text-white flex items-center justify-center shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {playingId === ded.id ? 'pause' : 'play_arrow'}
                              </span>
                            </motion.button>
                            <span className="text-xs font-extrabold text-on-surface">
                              {playingId === ded.id ? 'Reproduciendo audio...' : 'Nota de voz'}
                            </span>
                          </div>
                          <audio
                            ref={(el) => { audioRefs.current[ded.id] = el; }}
                            src={ded.audioUrl}
                            onEnded={() => setPlayingId(null)}
                          />
                        </div>
                      )}

                      {/* Bottom Actions: Replay Surprise Modal */}
                      <div className="pt-2 border-t border-surface-variant/40 flex justify-end">
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            hapticService.playPhysicalThud(0.25, 0.15);
                            onReplayDedication(ded);
                          }}
                          className="px-3 py-1.5 rounded-full text-xs font-extrabold text-secondary hover:text-primary bg-white/60 hover:bg-white border border-white shadow-sm flex items-center space-x-1 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          <span>Ver sorpresa</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="plush-card rounded-3xl p-8 text-center my-6 border border-white shadow-sm">
              <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary mx-auto flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[28px]">favorite</span>
              </div>
              <h3 className="font-extrabold text-base text-on-surface mb-1">
                Tus Recuerdos están listos
              </h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
                Sorprende a tu pareja con una cartita de amor, una foto especial o un audio con confeti.
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onNewDedication}
                className="px-5 py-2.5 rounded-full candy-btn text-white text-xs sm:text-sm font-bold shadow-md"
              >
                + Enviar Primera Dedicatoria
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
      </CoupleSoftLockGate>
    </div>
  );
}
