import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import {
  getUserDisplayName,
  getUserProfileColor,
  getUserPhotoUrl,
  saveProfileConfig,
  getProfileConfig,
  getCoupleId,
  isCoupleLinked,
  getDaysTogether,
  getPartnerDisplayName
} from '../services/storageService';
import { uploadImageToCloud } from '../services/mediaUploadService';
import { hapticService } from '../services/hapticService';

interface ProfileModalProps {
  isOpen: boolean;
  activeProfile: UserProfile;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export default function ProfileModal({
  isOpen,
  activeProfile,
  onClose,
  onProfileUpdated
}: ProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(getUserDisplayName(activeProfile));
  const [color, setColor] = useState<'blue' | 'pink'>(getUserProfileColor(activeProfile));
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(getUserPhotoUrl(activeProfile));
  const [isUploading, setIsUploading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const coupleCode = getCoupleId();

  if (!isOpen) return null;

  // Handle Photo selection & ImgBB Upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      hapticService.playLightTap();
      const uploadedUrl = await uploadImageToCloud(file);
      setPhotoUrl(uploadedUrl);
      hapticService.playSuccess();
    } catch (err) {
      console.error('Error uploading profile photo to ImgBB:', err);
      hapticService.playWarning();
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = () => {
    hapticService.playWarning();
    setPhotoUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Save
  const handleSave = () => {
    hapticService.playSuccess();
    if (activeProfile === 'partner1') {
      saveProfileConfig({
        partner1Name: name.trim() || 'Tú',
        partner1Color: color,
        partner1PhotoUrl: photoUrl
      });
    } else {
      saveProfileConfig({
        partner2Name: name.trim() || 'Pareja',
        partner2Color: color,
        partner2PhotoUrl: photoUrl
      });
    }
    onProfileUpdated();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-inverse-surface/40 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="relative z-10 w-full max-w-md max-h-[92vh] sm:max-h-[86vh] flex flex-col candy-modal-card rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden cursor-default bg-white/95"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-2 shrink-0 border-b border-white/60">
            <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-3 cursor-grab" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full candy-btn text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[22px]">person</span>
                </div>
                <div>
                  <h2 className="font-extrabold text-xl sm:text-2xl text-primary tracking-tight">
                    Mi Perfil
                  </h2>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Personaliza tu foto, color y nombre
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/60 hover:bg-white text-on-surface-variant flex items-center justify-center shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </motion.button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto modal-scroll-area p-5 sm:p-6 space-y-6 overscroll-contain">
            {/* 📸 1. PHOTO SECTION */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-28 h-28 rounded-full p-1 border-4 shadow-xl cursor-pointer overflow-hidden flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                    color === 'blue'
                      ? 'border-sky-300 bg-sky-50 shadow-sky-200/50'
                      : 'border-pink-300 bg-pink-50 shadow-pink-200/50'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-extrabold text-primary">Subiendo...</span>
                    </div>
                  ) : photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    /* Blank Avatar Silhouette Placeholder */
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined text-[54px]">person</span>
                    </div>
                  )}
                </div>

                {/* Floating Camera Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full candy-btn text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform active:scale-90"
                  title="Cambiar foto"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {/* Photo Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-white candy-btn shadow-xs"
                >
                  {photoUrl ? 'Cambiar Foto' : '📷 Subir Foto'}
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    🗑️ Borrar Foto
                  </button>
                )}
              </div>
            </div>

            {/* 🎨 2. THEME COLOR TOGGLE */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-on-surface uppercase tracking-wider block">
                Alternar Color de Tema
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Blue theme option */}
                <button
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    setColor('blue');
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center space-x-2.5 transition-all ${
                    color === 'blue'
                      ? 'border-[#007dab] bg-sky-50 shadow-md ring-2 ring-[#007dab]/20'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#007dab] to-[#7ed0ff] shadow-xs" />
                  <div className="text-left">
                    <span className="text-xs font-black text-slate-800 block leading-tight">Azul Glaseado</span>
                    <span className="text-[10px] text-slate-500 font-bold">Estilo Fresco</span>
                  </div>
                </button>

                {/* Pink theme option */}
                <button
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    setColor('pink');
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center space-x-2.5 transition-all ${
                    color === 'pink'
                      ? 'border-[#af0a78] bg-pink-50 shadow-md ring-2 ring-[#af0a78]/20'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#af0a78] to-[#ffafd5] shadow-xs" />
                  <div className="text-left">
                    <span className="text-xs font-black text-slate-800 block leading-tight">Rosa Pastel</span>
                    <span className="text-[10px] text-slate-500 font-bold">Estilo Candy</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ✏️ 3. DISPLAY NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-on-surface uppercase tracking-wider block">
                Tu Nombre
              </label>
              <div className="plush-card rounded-2xl p-2 border-2 border-white shadow-xs focus-within:ring-2 focus-within:ring-primary">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre o apodo..."
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-on-surface outline-none"
                />
              </div>
            </div>

            {/* 💌 4. COUPLE STATUS / DAYS TOGETHER OR INVITE CODE */}
            {isCoupleLinked() ? (
              /* Conectados: Mostrar contador de días juntos */
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 border-2 border-pink-200/80 shadow-xs space-y-2.5 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </div>
                  <span className="text-xs font-black text-pink-700 uppercase tracking-wider">
                    Espacio de Pareja Conectado
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">
                    {name || 'Tú'} & {getPartnerDisplayName(activeProfile)}
                  </h4>
                  <div className="py-2 px-3.5 bg-white/85 rounded-xl border border-pink-100 shadow-2xs inline-block">
                    <p className="text-xs font-extrabold text-pink-700 flex items-center justify-center gap-1.5 flex-wrap">
                      <span>✨ Llevan compartiendo</span>
                      <span className="text-sm font-black text-pink-600 underline decoration-pink-300 decoration-2">
                        {getDaysTogether()} {getDaysTogether() === 1 ? 'día' : 'días'}
                      </span>
                      <span>la vida juntos</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* No conectados: Mostrar código para invitar */
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-2xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-secondary block">
                  Tu Código de Pareja
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-base text-primary tracking-widest">
                    {coupleCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(coupleCode);
                      hapticService.playLightTap();
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-3 py-1 rounded-full text-xs font-extrabold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    {copiedCode ? '¡Copiado! ✓' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 pt-2 shrink-0 border-t border-white/60 bg-white/50 flex justify-end space-x-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-on-surface-variant hover:bg-white/80 transition-colors"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full candy-btn text-white text-xs font-black shadow-md"
            >
              Guardar Cambios ✨
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
