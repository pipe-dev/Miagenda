import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CoupleMoodStatus, EventItem } from '../types';
import { getUserDisplayName, getPartnerDisplayName } from '../services/storageService';
import { hapticService } from '../services/hapticService';

interface DynamicIslandCompanionProps {
  activeProfile: UserProfile;
  hasUnreadDedication?: boolean;
  partnerMood?: CoupleMoodStatus;
  todayEvents?: EventItem[];
  onOpenSurprise?: () => void;
  onOpenMoodCheckin?: () => void;
}

// Inverted Chibi Boy Peeking Down from Island (Upside down with hands holding the island edge)
const InvertedChibiBoy = ({
  isHoldingLetter = false,
  isDrinking = false
}: {
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
}) => {
  return (
    <div className="relative w-11 h-11 select-none pointer-events-none drop-shadow-lg flex items-center justify-center rotate-180">
      <svg viewBox="0 0 44 44" className="w-11 h-11 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft shadow */}
        <ellipse cx="22" cy="38" rx="10" ry="2.5" fill="rgba(0,0,0,0.14)" />

        {/* Cute Head */}
        <circle cx="22" cy="20" r="13.5" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.8" />

        {/* Boy styled hair */}
        <path d="M10 18C10 8.5 16 5.5 22 5.5C28 5.5 34 8.5 34 18C31 12.5 27 11.5 22 11.5C17 11.5 13 12.5 10 18Z" fill="#1e293b" />
        <path d="M9 18C11 14.5 14 13.5 17 13.5C15 16.5 14 18.5 14 19.5C12 19.5 10 18.5 9 18Z" fill="#1e293b" />
        <path d="M35 18C33 14.5 30 13.5 27 13.5C29 16.5 30 18.5 30 19.5C32 19.5 34 18.5 35 18Z" fill="#1e293b" />
        <path d="M16 8.5C19 7 25 7 28 8.5" stroke="#475569" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />

        {/* Sanrio Happy Eyes */}
        <circle cx="17.5" cy="20" r="2.2" fill="#0f172a" />
        <circle cx="26.5" cy="20" r="2.2" fill="#0f172a" />
        <circle cx="18.3" cy="19.1" r="0.8" fill="#ffffff" />
        <circle cx="27.3" cy="19.1" r="0.8" fill="#ffffff" />

        {/* Rosy Cheeks */}
        <ellipse cx="13.5" cy="23.8" rx="2.8" ry="1.8" fill="#ff80a0" opacity="0.85" />
        <ellipse cx="30.5" cy="23.8" rx="2.8" ry="1.8" fill="#ff80a0" opacity="0.85" />

        {/* Cute Smile */}
        <path d="M19.5 24.5C20.5 26.2 23.5 26.2 24.5 24.5" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />

        {/* Little hands gripping the island edge */}
        <ellipse cx="11.5" cy="6.5" rx="3" ry="2.2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.2" />
        <ellipse cx="32.5" cy="6.5" rx="3" ry="2.2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.2" />

        {/* Little blue shirt collar */}
        <path d="M17.5 31.5L22 36L26.5 31.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.2" />

        {/* Letter Prop */}
        {isHoldingLetter && (
          <g transform="translate(13, 24)">
            <rect x="0" y="0" width="18" height="12" rx="2" fill="#ffffff" stroke="#e11d48" strokeWidth="1.3" />
            <path d="M0 0L9 8L18 0" stroke="#e11d48" strokeWidth="1.3" fill="none" />
            <circle cx="9" cy="8" r="2.2" fill="#e11d48" />
          </g>
        )}

        {/* Coffee Cup Prop */}
        {isDrinking && (
          <g transform="translate(25, 21)">
            <rect x="0" y="0" width="9" height="11" rx="2" fill="#d97706" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M9 2.5C11 2.5 11 8.5 9 8.5" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Inverted Chibi Girl Peeking Down from Island (Upside down with hands holding the island edge)
const InvertedChibiGirl = ({
  isHoldingLetter = false,
  isDrinking = false
}: {
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
}) => {
  return (
    <div className="relative w-11 h-11 select-none pointer-events-none drop-shadow-lg flex items-center justify-center rotate-180">
      <svg viewBox="0 0 44 44" className="w-11 h-11 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hair flowing down */}
        <path d="M9.5 18C9.5 26.5 11.5 35 11.5 35C11.5 35 32.5 35 32.5 35C32.5 35 34.5 26.5 34.5 18" fill="#d97706" />

        {/* Cute Head */}
        <circle cx="22" cy="20" r="13.5" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.8" />

        {/* Cute bangs */}
        <path d="M10 18C10 8.5 15 5.5 22 5.5C29 5.5 34 8.5 34 18C32 12.5 27 11.5 22 11.5C17 11.5 12 12.5 10 18Z" fill="#eab308" />
        <path d="M12 15.5C15 12.5 20 12.5 23 14.5C26 12.5 30 12.5 32 15.5" stroke="#ca8a04" strokeWidth="1.3" strokeLinecap="round" />

        {/* Pink Ribbon Bow */}
        <g transform="translate(26, 3.5)">
          <ellipse cx="2" cy="3" rx="3.2" ry="2.2" fill="#f43f5e" />
          <ellipse cx="7.5" cy="3" rx="3.2" ry="2.2" fill="#f43f5e" />
          <circle cx="4.8" cy="3" r="2" fill="#ffffff" />
        </g>

        {/* Sanrio Sparkle Eyes with Eyelashes */}
        <circle cx="17.5" cy="20" r="2.2" fill="#451a03" />
        <circle cx="26.5" cy="20" r="2.2" fill="#451a03" />
        <circle cx="18.3" cy="19.1" r="0.8" fill="#ffffff" />
        <circle cx="27.3" cy="19.1" r="0.8" fill="#ffffff" />
        <path d="M16 17.5L14.8 16.3" stroke="#451a03" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M28 17.5L29.2 16.3" stroke="#451a03" strokeWidth="1.3" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <ellipse cx="13.5" cy="23.8" rx="2.8" ry="1.8" fill="#f43f5e" opacity="0.9" />
        <ellipse cx="30.5" cy="23.8" rx="2.8" ry="1.8" fill="#f43f5e" opacity="0.9" />

        {/* Cute Smile */}
        <path d="M19.5 24.5C20.5 26.2 23.5 26.2 24.5 24.5" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />

        {/* Little hands gripping the island edge */}
        <ellipse cx="11.5" cy="6.5" rx="3" ry="2.2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.2" />
        <ellipse cx="32.5" cy="6.5" rx="3" ry="2.2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.2" />

        {/* Little pink dress collar */}
        <path d="M17.5 31.5L22 36L26.5 31.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.2" />

        {/* Letter Prop */}
        {isHoldingLetter && (
          <g transform="translate(13, 24)">
            <rect x="0" y="0" width="18" height="12" rx="2" fill="#ffffff" stroke="#e11d48" strokeWidth="1.3" />
            <path d="M0 0L9 8L18 0" stroke="#e11d48" strokeWidth="1.3" fill="none" />
            <circle cx="9" cy="8" r="2.2" fill="#e11d48" />
          </g>
        )}

        {/* Coffee Cup Prop */}
        {isDrinking && (
          <g transform="translate(25, 21)">
            <rect x="0" y="0" width="9" height="11" rx="2" fill="#ec4899" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M9 2.5C11 2.5 11 8.5 9 8.5" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default function DynamicIslandCompanion({
  activeProfile,
  hasUnreadDedication = false,
  partnerMood,
  todayEvents = [],
  onOpenSurprise,
  onOpenMoodCheckin
}: DynamicIslandCompanionProps) {
  const [cycleKey, setCycleKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isPartnerLowBattery = Boolean(partnerMood?.battery && partnerMood.battery > 0 && partnerMood.battery <= 35);
  const hasSharedEventToday = todayEvents.some((e) => e.privacy === 'shared');

  // Trigger storyboard:
  // 1. Asoma 1 (mitad -> pausa -> completo)
  // 2. Asoma el otro (mitad -> pausa -> completo)
  // 3. Salen a juntarse al centro
  // 4. Beso con corazón
  // 5. Se esconden hasta la mitad juntos (pausa) y luego desaparecen
  const triggerStorySequence = () => {
    setIsVisible(true);
    setCycleKey((prev) => prev + 1);

    if (animTimerRef.current) clearTimeout(animTimerRef.current);

    // Sequence runs for 6.0 seconds then hides cleanly
    animTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  // 1. On Mount: trigger full storyboard
  useEffect(() => {
    triggerStorySequence();
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // 2. Periodic greeting every 2.5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      triggerStorySequence();
    }, 150000);
    return () => clearInterval(interval);
  }, []);

  // 3. Handle user tap: re-trigger the full sequence with haptics
  const handleCompanionTap = () => {
    hapticService.playPhysicalThud(0.28, 0.18);
    triggerStorySequence();

    if (hasUnreadDedication && onOpenSurprise) {
      onOpenSurprise();
    } else if (isPartnerLowBattery && onOpenMoodCheckin) {
      onOpenMoodCheckin();
    }
  };

  const shouldShowNotificationPeek = !isVisible && (hasUnreadDedication || isPartnerLowBattery);

  return (
    <div
      onClick={handleCompanionTap}
      className="absolute companion-island-container left-1/2 -translate-x-1/2 z-30 cursor-pointer select-none flex items-center justify-center pointer-events-auto h-11 px-4"
      title="Toca para ver a la parejita asomarse y darse el beso ✨"
    >
      <AnimatePresence mode="wait">
        {/* 🌟 1. STORYBOARD ANIMATION */}
        {isVisible ? (
          <div key={`story-cycle-${cycleKey}`} className="relative flex items-center justify-center w-48 h-11 overflow-visible">
            {hasUnreadDedication ? (
              /* 💌 Love letter delivery inverted peek */
              <motion.div
                initial={{ y: -44, opacity: 0 }}
                animate={{
                  y: [-44, -20, -20, 0, 0, -20, -44],
                  opacity: [0, 1, 1, 1, 1, 1, 0]
                }}
                transition={{ duration: 5.8, times: [0, 0.12, 0.22, 0.35, 0.82, 0.92, 1], ease: 'easeInOut' }}
                className="flex items-center space-x-1.5 bg-pink-100/95 backdrop-blur-xs px-3 py-1 rounded-full border border-pink-300 shadow-md"
              >
                {activeProfile === 'partner1' ? (
                  <InvertedChibiGirl isHoldingLetter />
                ) : (
                  <InvertedChibiBoy isHoldingLetter />
                )}
                <span className="text-xs font-black text-pink-700 animate-pulse">
                  ¡Tienes una cartita! 💌
                </span>
              </motion.div>
            ) : isPartnerLowBattery ? (
              /* ☕ Partner Low battery cozy coffee */
              <motion.div
                initial={{ y: -44, opacity: 0 }}
                animate={{
                  y: [-44, -20, -20, 0, 0, -20, -44],
                  opacity: [0, 1, 1, 1, 1, 1, 0]
                }}
                transition={{ duration: 5.8, times: [0, 0.12, 0.22, 0.35, 0.82, 0.92, 1], ease: 'easeInOut' }}
                className="flex items-center space-x-1.5 bg-amber-50/95 backdrop-blur-xs px-3 py-1 rounded-full border border-amber-200 shadow-md"
              >
                {activeProfile === 'partner1' ? (
                  <InvertedChibiGirl isDrinking />
                ) : (
                  <InvertedChibiBoy isDrinking />
                )}
                <span className="text-xs font-extrabold text-amber-800">
                  {getPartnerDisplayName(activeProfile)} necesita apapacho ☕
                </span>
              </motion.div>
            ) : (
              /* 💑 2-STEP PEEK & 2-STEP HIDE STORYBOARD (LARGER SIZE) */
              <>
                {/* 👦 Chibi Boy: 
                    - 0.0s - 0.08s: y = -44 (escondido)
                    - 0.08s - 0.16s: y = -20 (asoma MITAD de cara por la izquierda)
                    - 0.16s - 0.24s: y = -20 (pausa mirando)
                    - 0.24s - 0.32s: y = 0 (baja completo)
                    - 0.32s - 0.40s: espera a la chica
                    - 0.40s - 0.58s: se desliza al centro (x: -46 -> -5)
                    - 0.58s - 0.78s: EL BESO en el centro (x: -5, y: 0)
                    - 0.78s - 0.88s: suben juntos hasta la MITAD (x: -5, y: -20)
                    - 0.88s - 0.94s: pausa juntos en mitad de cara
                    - 0.94s - 1.0s: suben completamente hasta esconderse (x: -5, y: -44)
                */}
                <motion.div
                  initial={{ y: -44, x: -46, opacity: 0 }}
                  animate={{
                    y: [-44, -20, -20, 0, 0, -4, -4, -20, -20, -44],
                    x: [-46, -46, -46, -46, -46, -5, -5, -5, -5, -5],
                    rotate: [0, 0, 0, 0, 0, 12, 12, 0, 0, 0],
                    opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0]
                  }}
                  transition={{
                    duration: 5.8,
                    times: [0, 0.08, 0.16, 0.24, 0.38, 0.56, 0.76, 0.86, 0.93, 1],
                    ease: 'easeInOut'
                  }}
                  className="absolute"
                >
                  <InvertedChibiBoy />
                </motion.div>

                {/* 💖 Floating Heart Burst during kiss */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.2, y: -2 }}
                  animate={{
                    opacity: [0, 0, 0, 1, 1, 0],
                    scale: [0.2, 0.2, 0.2, 1.6, 1.2, 0.3],
                    y: [-2, -2, -2, 18, 28, 36]
                  }}
                  transition={{
                    duration: 5.8,
                    times: [0, 0.48, 0.56, 0.65, 0.76, 0.88],
                    ease: 'easeOut'
                  }}
                  className="absolute z-20 pointer-events-none text-base flex items-center space-x-1"
                >
                  <span>💖</span>
                  <span className="text-xs">✨</span>
                </motion.div>

                {/* 👧 Chibi Girl: 
                    - 0.0s - 0.20s: y = -44 (espera)
                    - 0.20s - 0.28s: y = -20 (asoma MITAD de cara por la derecha)
                    - 0.28s - 0.36s: y = -20 (pausa mirando)
                    - 0.36s - 0.44s: y = 0 (baja completo)
                    - 0.44s - 0.58s: se desliza al centro (x: 46 -> 5)
                    - 0.58s - 0.78s: EL BESO en el centro (x: 5, y: 0)
                    - 0.78s - 0.88s: suben juntos hasta la MITAD (x: 5, y: -20)
                    - 0.88s - 0.94s: pausa juntos en mitad de cara
                    - 0.94s - 1.0s: suben completamente hasta esconderse (x: 5, y: -44)
                */}
                <motion.div
                  initial={{ y: -44, x: 46, opacity: 0 }}
                  animate={{
                    y: [-44, -44, -20, -20, 0, -4, -4, -20, -20, -44],
                    x: [46, 46, 46, 46, 46, 5, 5, 5, 5, 5],
                    rotate: [0, 0, 0, 0, 0, -12, -12, 0, 0, 0],
                    opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0]
                  }}
                  transition={{
                    duration: 5.8,
                    times: [0, 0.18, 0.26, 0.34, 0.42, 0.56, 0.76, 0.86, 0.93, 1],
                    ease: 'easeInOut'
                  }}
                  className="absolute"
                >
                  <InvertedChibiGirl />
                </motion.div>
              </>
            )}
          </div>
        ) : shouldShowNotificationPeek ? (
          /* 👀 Standby subtle note */
          <motion.div
            key="standby-note"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-pink-200 shadow-sm text-xs font-bold text-pink-600 hover:scale-105 transition-transform"
          >
            {hasUnreadDedication ? (
              <>
                <span>💌</span>
                <span className="text-[10px] font-black">1 Sorpresa</span>
              </>
            ) : (
              <>
                <span>☕</span>
                <span className="text-[10px] font-black">{getPartnerDisplayName(activeProfile)}</span>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
