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

// Inverted Chibi Boy Peeking Down from Island (38px calibrated size)
const InvertedChibiBoy = ({
  isHoldingLetter = false,
  isDrinking = false
}: {
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
}) => {
  return (
    <div className="relative w-[38px] h-[38px] select-none pointer-events-none drop-shadow-md flex items-center justify-center rotate-180">
      <svg viewBox="0 0 44 44" className="w-[38px] h-[38px] overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft shadow */}
        <ellipse cx="22" cy="38" rx="9.5" ry="2.2" fill="rgba(0,0,0,0.13)" />

        {/* Cute Head */}
        <circle cx="22" cy="20" r="13" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.7" />

        {/* Boy styled hair */}
        <path d="M10 18C10 8.8 16 5.8 22 5.8C28 5.8 34 8.8 34 18C31 12.8 27 11.8 22 11.8C17 11.8 13 12.8 10 18Z" fill="#1e293b" />
        <path d="M9 18C11 14.8 14 13.8 17 13.8C15 16.8 14 18.8 14 19.8C12 19.8 10 18.8 9 18Z" fill="#1e293b" />
        <path d="M35 18C33 14.8 30 13.8 27 13.8C29 16.8 30 18.8 30 19.8C32 19.8 34 18.8 35 18Z" fill="#1e293b" />
        <path d="M16 8.8C19 7.2 25 7.2 28 8.8" stroke="#475569" strokeWidth="1.25" strokeLinecap="round" opacity="0.7" />

        {/* Sanrio Happy Eyes */}
        <circle cx="17.8" cy="20" r="2.1" fill="#0f172a" />
        <circle cx="26.2" cy="20" r="2.1" fill="#0f172a" />
        <circle cx="18.5" cy="19.2" r="0.75" fill="#ffffff" />
        <circle cx="26.9" cy="19.2" r="0.75" fill="#ffffff" />

        {/* Rosy Cheeks */}
        <ellipse cx="13.8" cy="23.6" rx="2.6" ry="1.7" fill="#ff80a0" opacity="0.85" />
        <ellipse cx="30.2" cy="23.6" rx="2.6" ry="1.7" fill="#ff80a0" opacity="0.85" />

        {/* Cute Smile */}
        <path d="M19.8 24.3C20.8 25.8 23.2 25.8 24.2 24.3" stroke="#0f172a" strokeWidth="1.45" strokeLinecap="round" />

        {/* Little hands gripping the island edge */}
        <ellipse cx="11.8" cy="6.8" rx="2.8" ry="2.1" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.1" />
        <ellipse cx="32.2" cy="6.8" rx="2.8" ry="2.1" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.1" />

        {/* Little blue shirt collar */}
        <path d="M17.8 31.5L22 35.5L26.2 31.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.1" />

        {/* Letter Prop */}
        {isHoldingLetter && (
          <g transform="translate(13.5, 24.5)">
            <rect x="0" y="0" width="17" height="11.5" rx="2" fill="#ffffff" stroke="#e11d48" strokeWidth="1.25" />
            <path d="M0 0L8.5 7.5L17 0" stroke="#e11d48" strokeWidth="1.25" fill="none" />
            <circle cx="8.5" cy="7.8" r="2.1" fill="#e11d48" />
          </g>
        )}

        {/* Coffee Cup Prop */}
        {isDrinking && (
          <g transform="translate(24.5, 21.5)">
            <rect x="0" y="0" width="8.5" height="10.5" rx="2" fill="#d97706" stroke="#ffffff" strokeWidth="1.1" />
            <path d="M8.5 2.5C10.5 2.5 10.5 8 8.5 8" stroke="#ffffff" strokeWidth="1.1" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Inverted Chibi Girl Peeking Down from Island (38px calibrated size)
const InvertedChibiGirl = ({
  isHoldingLetter = false,
  isDrinking = false
}: {
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
}) => {
  return (
    <div className="relative w-[38px] h-[38px] select-none pointer-events-none drop-shadow-md flex items-center justify-center rotate-180">
      <svg viewBox="0 0 44 44" className="w-[38px] h-[38px] overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hair flowing down */}
        <path d="M9.8 18C9.8 26.2 11.8 34.5 11.8 34.5C11.8 34.5 32.2 34.5 32.2 34.5C32.2 34.5 34.2 26.2 34.2 18" fill="#d97706" />

        {/* Cute Head */}
        <circle cx="22" cy="20" r="13" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.7" />

        {/* Cute bangs */}
        <path d="M10 18C10 8.8 15 5.8 22 5.8C29 5.8 34 8.8 34 18C32 12.8 27 11.8 22 11.8C17 11.8 12 12.8 10 18Z" fill="#eab308" />
        <path d="M12 15.8C15 12.8 20 12.8 23 14.8C26 12.8 30 12.8 32 15.8" stroke="#ca8a04" strokeWidth="1.25" strokeLinecap="round" />

        {/* Pink Ribbon Bow */}
        <g transform="translate(26, 3.8)">
          <ellipse cx="2" cy="3" rx="3" ry="2.1" fill="#f43f5e" />
          <ellipse cx="7.2" cy="3" rx="3" ry="2.1" fill="#f43f5e" />
          <circle cx="4.6" cy="3" r="1.9" fill="#ffffff" />
        </g>

        {/* Sanrio Sparkle Eyes with Eyelashes */}
        <circle cx="17.8" cy="20" r="2.1" fill="#451a03" />
        <circle cx="26.2" cy="20" r="2.1" fill="#451a03" />
        <circle cx="18.5" cy="19.2" r="0.75" fill="#ffffff" />
        <circle cx="26.9" cy="19.2" r="0.75" fill="#ffffff" />
        <path d="M16.2 17.8L15 16.6" stroke="#451a03" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M27.8 17.8L29 16.6" stroke="#451a03" strokeWidth="1.25" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <ellipse cx="13.8" cy="23.6" rx="2.6" ry="1.7" fill="#f43f5e" opacity="0.9" />
        <ellipse cx="30.2" cy="23.6" rx="2.6" ry="1.7" fill="#f43f5e" opacity="0.9" />

        {/* Cute Smile */}
        <path d="M19.8 24.3C20.8 25.8 23.2 25.8 24.2 24.3" stroke="#451a03" strokeWidth="1.45" strokeLinecap="round" />

        {/* Little hands gripping the island edge */}
        <ellipse cx="11.8" cy="6.8" rx="2.8" ry="2.1" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.1" />
        <ellipse cx="32.2" cy="6.8" rx="2.8" ry="2.1" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.1" />

        {/* Little pink dress collar */}
        <path d="M17.8 31.5L22 35.5L26.2 31.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.1" />

        {/* Letter Prop */}
        {isHoldingLetter && (
          <g transform="translate(13.5, 24.5)">
            <rect x="0" y="0" width="17" height="11.5" rx="2" fill="#ffffff" stroke="#e11d48" strokeWidth="1.25" />
            <path d="M0 0L8.5 7.5L17 0" stroke="#e11d48" strokeWidth="1.25" fill="none" />
            <circle cx="8.5" cy="7.8" r="2.1" fill="#e11d48" />
          </g>
        )}

        {/* Coffee Cup Prop */}
        {isDrinking && (
          <g transform="translate(24.5, 21.5)">
            <rect x="0" y="0" width="8.5" height="10.5" rx="2" fill="#ec4899" stroke="#ffffff" strokeWidth="1.1" />
            <path d="M8.5 2.5C10.5 2.5 10.5 8 8.5 8" stroke="#ffffff" strokeWidth="1.1" fill="none" />
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
      className="absolute companion-island-container left-1/2 -translate-x-1/2 z-30 cursor-pointer select-none flex items-center justify-center pointer-events-auto h-[38px] px-4"
      title="Toca para ver a la parejita asomarse y darse el beso ✨"
    >
      <AnimatePresence mode="wait">
        {/* 🌟 1. STORYBOARD ANIMATION (38px Calibrated) */}
        {isVisible ? (
          <div key={`story-cycle-${cycleKey}`} className="relative flex items-center justify-center w-40 h-[38px] overflow-visible">
            {hasUnreadDedication ? (
              /* 💌 Love letter delivery inverted peek */
              <motion.div
                initial={{ y: -38, opacity: 0 }}
                animate={{
                  y: [-38, -17, -17, 0, 0, -17, -38],
                  opacity: [0, 1, 1, 1, 1, 1, 0]
                }}
                transition={{ duration: 5.8, times: [0, 0.12, 0.22, 0.35, 0.82, 0.92, 1], ease: 'easeInOut' }}
                className="flex items-center space-x-1 bg-pink-100/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-pink-300 shadow-md"
              >
                {activeProfile === 'partner1' ? (
                  <InvertedChibiGirl isHoldingLetter />
                ) : (
                  <InvertedChibiBoy isHoldingLetter />
                )}
                <span className="text-[11px] font-black text-pink-700 animate-pulse">
                  ¡Tienes una cartita! 💌
                </span>
              </motion.div>
            ) : isPartnerLowBattery ? (
              /* ☕ Partner Low battery cozy coffee */
              <motion.div
                initial={{ y: -38, opacity: 0 }}
                animate={{
                  y: [-38, -17, -17, 0, 0, -17, -38],
                  opacity: [0, 1, 1, 1, 1, 1, 0]
                }}
                transition={{ duration: 5.8, times: [0, 0.12, 0.22, 0.35, 0.82, 0.92, 1], ease: 'easeInOut' }}
                className="flex items-center space-x-1.5 bg-amber-50/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-200 shadow-md"
              >
                {activeProfile === 'partner1' ? (
                  <InvertedChibiGirl isDrinking />
                ) : (
                  <InvertedChibiBoy isDrinking />
                )}
                <span className="text-[11px] font-extrabold text-amber-800">
                  {getPartnerDisplayName(activeProfile)} necesita apapacho ☕
                </span>
              </motion.div>
            ) : (
              /* 💑 2-STEP PEEK & 2-STEP HIDE STORYBOARD (38px) */
              <>
                {/* 👦 Chibi Boy: 
                    - 0.0s - 0.08s: y = -38 (escondido)
                    - 0.08s - 0.16s: y = -17 (asoma MITAD de cara por la izquierda)
                    - 0.16s - 0.24s: y = -17 (pausa mirando)
                    - 0.24s - 0.32s: y = 0 (baja completo)
                    - 0.32s - 0.40s: espera a la chica
                    - 0.40s - 0.58s: se desliza al centro (x: -40 -> -4.5)
                    - 0.58s - 0.78s: EL BESO en el centro (x: -4.5, y: 0)
                    - 0.78s - 0.88s: suben juntos hasta la MITAD (x: -4.5, y: -17)
                    - 0.88s - 0.94s: pausa juntos en mitad de cara
                    - 0.94s - 1.0s: suben completamente hasta esconderse (x: -4.5, y: -38)
                */}
                <motion.div
                  initial={{ y: -38, x: -40, opacity: 0 }}
                  animate={{
                    y: [-38, -17, -17, 0, 0, -4, -4, -17, -17, -38],
                    x: [-40, -40, -40, -40, -40, -4.5, -4.5, -4.5, -4.5, -4.5],
                    rotate: [0, 0, 0, 0, 0, 11, 11, 0, 0, 0],
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
                    scale: [0.2, 0.2, 0.2, 1.5, 1.15, 0.3],
                    y: [-2, -2, -2, 16, 25, 32]
                  }}
                  transition={{
                    duration: 5.8,
                    times: [0, 0.48, 0.56, 0.65, 0.76, 0.88],
                    ease: 'easeOut'
                  }}
                  className="absolute z-20 pointer-events-none text-sm flex items-center space-x-0.5"
                >
                  <span>💖</span>
                  <span className="text-[11px]">✨</span>
                </motion.div>

                {/* 👧 Chibi Girl: 
                    - 0.0s - 0.20s: y = -38 (espera)
                    - 0.20s - 0.28s: y = -17 (asoma MITAD de cara por la derecha)
                    - 0.28s - 0.36s: y = -17 (pausa mirando)
                    - 0.36s - 0.44s: y = 0 (baja completo)
                    - 0.44s - 0.58s: se desliza al centro (x: 40 -> 4.5)
                    - 0.58s - 0.78s: EL BESO en el centro (x: 4.5, y: 0)
                    - 0.78s - 0.88s: suben juntos hasta la MITAD (x: 4.5, y: -17)
                    - 0.88s - 0.94s: pausa juntos en mitad de cara
                    - 0.94s - 1.0s: suben completamente hasta esconderse (x: 4.5, y: -38)
                */}
                <motion.div
                  initial={{ y: -38, x: 40, opacity: 0 }}
                  animate={{
                    y: [-38, -38, -17, -17, 0, -4, -4, -17, -17, -38],
                    x: [40, 40, 40, 40, 40, 4.5, 4.5, 4.5, 4.5, 4.5],
                    rotate: [0, 0, 0, 0, 0, -11, -11, 0, 0, 0],
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
            className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-pink-200 shadow-sm text-xs font-bold text-pink-600 hover:scale-105 transition-transform"
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
