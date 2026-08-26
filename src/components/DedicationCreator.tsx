import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { audioRecorder, AudioRecordingResult } from '../services/audioService';
import { UserProfile, DedicationItem } from '../types';
import { getUserDisplayName, getUserProfileColor, getLocalDateStr } from '../services/storageService';
import { hapticService } from '../services/hapticService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

import { uploadImageToCloud, uploadAudioToCloud } from '../services/mediaUploadService';

interface DedicationCreatorProps {
  activeProfile: UserProfile;
  onClose: () => void;
  onSave: (dedication: Omit<DedicationItem, 'id' | 'createdAt' | 'readBy'>) => void;
}

export default function DedicationCreator({ activeProfile, onClose, onSave }: DedicationCreatorProps) {
  const partnerProfile: UserProfile = activeProfile === 'partner1' ? 'partner2' : 'partner1';
  const myColor = getUserProfileColor(activeProfile);
  const partnerColor = myColor === 'blue' ? 'pink' : 'blue';

  const [recipient, setRecipient] = useState<UserProfile>(partnerProfile);
  const [note, setNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioResult, setAudioResult] = useState<AudioRecordingResult | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const timerRef = useRef<any>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start voice note recording
  const handleStartRecord = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setRecordingSeconds(0);
      setAudioResult(null);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err) {
      alert('Por favor concede permisos de micrófono para grabar una nota de voz.');
    }
  };

  // Stop voice recording
  const handleStopRecord = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await audioRecorder.stopRecording();
      setIsRecording(false);
      setAudioResult(res);
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // Photo upload / camera
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit dedication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() && !photoPreview && !audioResult) {
      alert('Por favor escribe un mensaje, toma una foto o graba un audio para tu dedicatoria.');
      return;
    }

    setIsSubmitting(true);
    hapticService.playLightTap();

    try {
      let uploadedPhotoUrl: string | null = null;
      let uploadedAudioUrl: string | null = null;

      // 1. Upload photo to CDN if present
      if (photoFile) {
        uploadedPhotoUrl = await uploadImageToCloud(photoFile);
      } else if (photoPreview) {
        uploadedPhotoUrl = photoPreview;
      }

      // 2. Upload audio to Cloud if present
      if (audioResult && audioResult.blob) {
        uploadedAudioUrl = await uploadAudioToCloud(audioResult.blob);
      }

      const newDedication = {
        from: activeProfile,
        to: recipient,
        authorName: getUserDisplayName(activeProfile),
        note: note.trim(),
        photoUrl: uploadedPhotoUrl,
        audioUrl: uploadedAudioUrl,
        triggerDate: getLocalDateStr()
      };

      onSave(newDedication);
    } catch (err) {
      console.error('Error uploading media:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 140) {
      onClose();
    }
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
          initial={{ scale: 0.88, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="relative z-10 w-full max-w-lg max-h-[92vh] sm:max-h-[86vh] flex flex-col candy-modal-card rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden cursor-default"
        >
          {/* Pinned Dedication Header */}
          <div className="p-5 sm:p-6 pb-3 shrink-0 border-b border-white/60">
            <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-3 cursor-grab" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full candy-btn flex items-center justify-center text-white shadow-md">
                  <LordIcon
                    src={LORDICON_ICONS.heart}
                    trigger="loop"
                    size={24}
                    primaryColor="#ffffff"
                    secondaryColor="#ffffff"
                  />
                </div>
                <div>
                  <h2 className="font-extrabold text-xl sm:text-2xl text-primary tracking-tight">
                    Dedicatoria Sorpresa
                  </h2>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Envía un mensaje de amor con foto o audio
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/60 hover:bg-white text-on-surface-variant flex items-center justify-center shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto modal-scroll-area p-5 sm:p-6 space-y-4 overscroll-contain">
            {/* Recipient selection con colores dinamicos invertidos */}
            <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-2xl border border-white/80 shadow-2xs">
              <span className="text-xs font-bold text-on-surface-variant ml-1">Destinatario:</span>
              <div className="flex space-x-2">
                {/* Boton Pareja (Destinatario principal) */}
                <button
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    setRecipient(partnerProfile);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all select-none ${
                    recipient === partnerProfile
                      ? (partnerColor === 'blue' ? 'candy-btn-blue text-white shadow-md' : 'candy-btn-pink text-white shadow-md')
                      : (partnerColor === 'blue' ? 'bg-blue-50/70 text-blue-900 border border-blue-200/70 hover:bg-blue-100/80' : 'bg-pink-50/70 text-pink-900 border border-pink-200/70 hover:bg-pink-100/80')
                  }`}
                >
                  Para {getUserDisplayName(partnerProfile)}
                </button>

                {/* Boton Mi Perfil */}
                <button
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    setRecipient(activeProfile);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all select-none ${
                    recipient === activeProfile
                      ? (myColor === 'blue' ? 'candy-btn-blue text-white shadow-md' : 'candy-btn-pink text-white shadow-md')
                      : (myColor === 'blue' ? 'bg-blue-50/70 text-blue-900 border border-blue-200/70 hover:bg-blue-100/80' : 'bg-pink-50/70 text-pink-900 border border-pink-200/70 hover:bg-pink-100/80')
                  }`}
                >
                  Para {getUserDisplayName(activeProfile)}
                </button>
              </div>
            </div>

            {/* Photo Preview & Controls */}
            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-md max-h-48 group">
                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFile(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </motion.button>
                <div className="absolute bottom-2 left-2 glass-bead px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary">
                  Foto adjunta
                </div>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                className="hidden"
              />
            )}

            {/* Note Input - Estandar Sunken Plush Well */}
            <div className="sunken-well bg-slate-50/85 focus-within:bg-white rounded-2xl p-3.5 border-2 border-slate-200/90 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/15 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
              <label className="block text-[11px] font-extrabold text-on-surface-variant mb-1 uppercase tracking-wider">
                Mensaje / Carta de Amor
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Escribe tu dedicatoria, recordatorio o mensaje de amor..."
                className="w-full bg-transparent outline-none border-none resize-none font-semibold text-sm sm:text-base text-slate-800 placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* Media Attachments Action Row */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Left buttons: Photo & Mic */}
              <div className="flex items-center space-x-2">
                {/* Photo / Camera button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    photoPreview
                      ? 'bg-secondary text-white shadow-md'
                      : 'bg-surface-container-low text-secondary shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_2px_6px_rgba(0,0,0,0.06)] active:bg-white'
                  }`}
                  title="Tomar o subir foto"
                >
                  <LordIcon
                    src={LORDICON_ICONS.camera}
                    trigger="hover"
                    size={24}
                    primaryColor={photoPreview ? '#ffffff' : '#007dab'}
                    secondaryColor={photoPreview ? '#ffffff' : '#af0a78'}
                  />
                </motion.button>

                {/* Mic / Voice Note button */}
                {!isRecording && !audioResult && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={handleStartRecord}
                    className="w-12 h-12 rounded-full bg-surface-container-low text-primary shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_2px_6px_rgba(0,0,0,0.06)] active:bg-white flex items-center justify-center"
                    title="Grabar nota de voz"
                  >
                    <LordIcon
                      src={LORDICON_ICONS.microphone}
                      trigger="hover"
                      size={24}
                      primaryColor="#af0a78"
                      secondaryColor="#007dab"
                    />
                  </motion.button>
                )}

                {/* Recording in progress indicator */}
                {isRecording && (
                  <motion.button
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    type="button"
                    onClick={handleStopRecord}
                    className="px-4 h-12 rounded-full bg-red-500 text-white flex items-center space-x-2 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[20px]">stop</span>
                    <span className="text-xs font-bold">Detener ({recordingSeconds}s)</span>
                  </motion.button>
                )}

                {/* Audio Recorded Preview */}
                {audioResult && !isRecording && (
                  <div className="flex items-center space-x-2 bg-white/80 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => {
                        if (audioPreviewRef.current) {
                          if (audioPlaying) {
                            audioPreviewRef.current.pause();
                            setAudioPlaying(false);
                          } else {
                            audioPreviewRef.current.play();
                            setAudioPlaying(true);
                          }
                        }
                      }}
                      className="w-8 h-8 rounded-full candy-btn text-white flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {audioPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </motion.button>
                    <audio
                      ref={audioPreviewRef}
                      src={audioResult.dataUrl}
                      onEnded={() => setAudioPlaying(false)}
                      className="hidden"
                    />
                    <span className="text-[11px] font-bold text-primary">Nota lista</span>
                    <button
                      type="button"
                      onClick={() => setAudioResult(null)}
                      className="text-on-surface-variant active:text-red-500 text-xs ml-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="submit"
                disabled={isSubmitting}
                onClick={() => hapticService.playPhysicalThud(0.28, 0.18)}
                className="px-5 py-3 rounded-full candy-accent-bicolor text-white font-bold text-sm sm:text-base flex items-center space-x-2 shadow-lg select-none disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Subiendo...' : 'Enviar Detalle'}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {isSubmitting ? 'cloud_upload' : 'send'}
                </span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
