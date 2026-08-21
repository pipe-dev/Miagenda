import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import confetti from 'canvas-confetti';
import { DedicationItem } from '../types';
import { getUserDisplayName } from '../services/storageService';

interface SurpriseModalProps {
  dedication: DedicationItem;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}

export default function SurpriseModal({ dedication, onClose, onAcknowledge }: SurpriseModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#af0a78', '#cf3192', '#ffafd5', '#cda0fe', '#FFE785']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentTime(curr);
    setAudioProgress((curr / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(100);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-inverse-surface/40 backdrop-blur-md cursor-pointer"
      >
        {/* Background glowing ambient orbs */}
        <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-primary-fixed-dim blur-3xl mix-blend-multiply"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-secondary-fixed-dim blur-3xl mix-blend-multiply"
          />
        </div>

        {/* Modal Container with Drag to dismiss & spring physics */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.4}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.85, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="relative z-10 w-full max-w-md my-auto candy-modal-card rounded-3xl p-5 sm:p-6 shadow-[0_30px_70px_rgba(175,10,120,0.35)] overflow-hidden cursor-default"
        >
          {/* Top Drag Indicator bar for native iOS feel */}
          <div className="w-12 h-1 bg-outline-variant/60 rounded-full mx-auto mb-3 cursor-grab" />

          {/* Top Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm shadow-md">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Detalle Sorpresa
                </span>
                <h3 className="font-bold text-lg text-on-surface leading-none">
                  De {dedication.authorName || getUserDisplayName(dedication.from)}
                </h3>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-on-surface-variant flex items-center justify-center shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </motion.button>
          </div>

          {/* Dedication Photo (if available) */}
          {dedication.photoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="relative rounded-2xl overflow-hidden mb-4 border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.1)] group"
            >
              <img
                src={dedication.photoUrl}
                alt="Foto dedicatoria"
                className="w-full max-h-64 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 right-2 glass-bead px-2.5 py-1 rounded-full text-[11px] font-bold text-primary flex items-center space-x-1">
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                <span>Para ti</span>
              </div>
            </motion.div>
          )}

          {/* Voice Note Player (if available) */}
          {dedication.audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 plush-card rounded-2xl p-3.5 border border-primary/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-primary">
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                  <span>Nota de voz para ti</span>
                </div>
                <span className="text-[11px] font-semibold text-on-surface-variant">
                  {formatTime(currentTime)} / {formatTime(audioDuration || 15)}
                </span>
              </div>

              <audio
                ref={audioRef}
                src={dedication.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                className="hidden"
              />

              {/* Player Controls & Waveform */}
              <div className="flex items-center space-x-3">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={togglePlayAudio}
                  className="w-12 h-12 rounded-full candy-btn text-white flex items-center justify-center shrink-0 shadow-md"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </motion.button>

                {/* Progress & Wave bars */}
                <div className="flex-1">
                  <div className="w-full bg-surface-variant/70 rounded-full h-3 overflow-hidden shadow-inner p-0.5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 px-1">
                    <span className="text-[10px] text-on-surface-variant font-medium">Toca reproducir</span>
                    <div className="flex space-x-0.5 items-end h-3">
                      {[40, 70, 100, 60, 90, 50, 80, 30].map((h, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full ${isPlaying ? 'bg-primary animate-pulse' : 'bg-outline-variant'}`}
                          style={{ height: `${isPlaying ? h : 30}%`, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dedication Text Note */}
          <div className="bg-white/80 rounded-2xl p-4 shadow-sm border border-white/60 mb-5">
            <p className="font-medium text-sm sm:text-base text-on-surface leading-relaxed italic">
              "{dedication.note || 'Un detalle sorpresa para alegrarte el día.'}"
            </p>
            <div className="mt-3 flex justify-between items-center text-[11px] text-on-surface-variant/80 font-semibold border-t border-surface-variant/50 pt-2">
              <span>{dedication.createdAt ? new Date(dedication.createdAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Hoy'}</span>
              <span className="text-primary font-bold">Para ti</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => onAcknowledge(dedication.id)}
              className="w-full py-3.5 rounded-full btn-golden-candy text-on-surface font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg select-none"
            >
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span>Guardar en Recuerdos</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
