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

// Inverted Chibi Boy Peeking Down from Island (Upside down from top rim)
const InvertedChibiBoy = ({
  isHoldingLetter = false,
  isDrinking = false
}: {
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
}) => {
  return (
    <div className="relative w-8 h-8 select-none pointer-events-none drop-shadow-md flex items-center justify-center rotate-180">
      <svg viewBox="0 0 44 44" className="w-8 h-8 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cute Head */}
        <circle cx="22" cy="20" r="13" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.6" />

        {/* Boy styled hair */}
        <path d="M10 18C10 9 16 6 22 6C28 6 34 9 34 18C31 13 27 12 22 12C17 12 13 13 10 18Z" fill="#1e293b" />
        <path d="M9 18C11 15 14 14 17 14C15 17 14 19 14 20C12 20 10 19 9 18Z" fill="#1e293b" />
        <path d="M35 18C33 15 30 14 27 14C29 17 30 19 30 20C32 20 34 19 35 18Z" fill="#1e293b" />
        <path d="M16 9C19 7.5 25 7.5 28 9" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

        {/* Sanrio Happy Eyes */}
        <circle cx="18" cy="20" r="2" fill="#0f172a" />
        <circle cx="26" cy="20" r="2" fill="#0f172a" />
        <circle cx="18.8" cy="19.2" r="0.7" fill="#ffffff" />
        <circle cx="26.8" cy="19.2" r="0.7" fill="#ffffff" />

        {/* Rosy Cheeks */}
        <ellipse cx="14" cy="23.5" rx="2.5" ry="1.6" fill="#ff80a0" opacity="0.85" />
        <ellipse cx="30" cy="23.5" rx="2.5" ry="1.6" fill="#ff80a0" opacity="0.85" />

        {/* Cute Smile */}
        <path d="M20 24C21 25.5 23 25.5 24 24" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />

        {/* Little hands gripping the island edge */}
        <ellipse cx="12" cy="7" rx="2.5" ry="2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />
        <ellipse cx="32" cy="7" rx="2.5" ry="2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />

        {/* Little blue shirt collar */}
        <path d="M18 31L22 35L26 31" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />

        {/* Letter Prop */}
        {isHoldingLetter && (
          <g transform="translate(14, 25)">
            <rect x="0" y="0" width="16" height="11" rx="2" fill="#ffffff" stroke="#e11d48" strokeWidth="1.2" />
            <path d="M0 0L8 7L16 0" stroke="#e11d48" strokeWidth="1.2" fill="none" />
            <circle cx="8" cy="7.5" r="2" fill="#e11d48" />
          </g>
        )}

        {/* Coffee Cup Prop */}
        {isDrinking && (
          <g transform="translate(24, 22)">
            <rect x="0" y="0" width="8" height="10" rx="2" fill="#d97706" stroke="#ffffff" strokeWidth="1" />
            <path d="M8 2.5C10 2.5 10 7.5 8 7.5" stroke="#ffffff" strokeWidth="1.2" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Inverted Chibi Girl Peeking Down from Island (Upside down from top rim)
const InvertedChibiGirl = ({
  isHoldingLetter = false,
  isDrinking = false
}: {
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
}) => {
  return (
    <div className="relative w-8 h-8 select-none pointer-events-none drop-shadow-md flex items-center justify-center rotate-180">
      <svg viewBox="0 0 44 44" className="w-8 h-8 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hair flowing down */}
        <path d="M10 18C10 26 12 34 12 34C12 34 32 34 32 34C32 34 34 26 34 18" fill="#d97706" />

        {/* Cute Head */}
        <circle cx="22" cy="20" r="13" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.6" />

        {/* Cute bangs */}
        <path d="M10 18C10 9 15 6 22 6C29 6 34 9 34 18C32 13 27 12 22 12C17 12 12 13 10 18Z" fill="#eab308" />
        <path d="M12 16C15 13 20 13 23 15C26 13 30 13 32 16" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round" />

        {/* Pink Ribbon Bow */}
        <g transform="translate(26, 4)">
          <ellipse cx="2" cy="3" rx="2.8" ry="2" fill="#f43f5e" />
          <ellipse cx="7" cy="3" rx="2.8" ry="2" fill="#f43f5e" />
          <circle cx="4.5" cy="3" r="1.8" fill="#ffffff" />
        </g>

        {/* Sanrio Sparkle Eyes with Eyelashes */}
        <circle cx="18" cy="20" r="2" fill="#451a03" />
        <circle cx="26" cy="20" r="2" fill="#451a03" />
        <circle cx="18.8" cy="19.2" r="0.7" fill="#ffffff" />
        <circle cx="26.8" cy="19.2" r="0.7" fill="#ffffff" />
        <path d="M16.5 18L15.5 17" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M27.5 18L28.5 17" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <ellipse cx="14" cy="23.5" rx="2.5" ry="1.6" fill="#f43f5e" opacity="0.9" />
        <ellipse cx="30" cy="23.5" rx="2.5" ry="1.6" fill="#f43f5e" opacity="0.9" />

        {/* Cute Smile */}
        <path d="M20 24C21 25.5 23 25.5 24 24" stroke="#451a03" strokeWidth="1.4" strokeLinecap="round" />

        {/* Little hands gripping the island edge */}
        <ellipse cx="12" cy="7" rx="2.5" ry="2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />
        <ellipse cx="32" cy="7" rx="2.5" ry="2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />

        {/* Little pink dress collar */}
        <path d="M18 31L22 35L26 31" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />

        {/* Letter Prop */}
        {isHoldingLetter && (
          <g transform="translate(14, 25)">
            <rect x="0" y="0" width="16" height="11" rx="2" fill="#ffffff" stroke="#e11d48" strokeWidth="1.2" />
            <path d="M0 0L8 7L16 0" stroke="#e11d48" strokeWidth="1.2" fill="none" />
            <circle cx="8" cy="7.5" r="2" fill="#e11d48" />
          </g>
        )}

        {/* Coffee Cup Prop */}
        {isDrinking && (
          <g transform="translate(24, 22)">
            <rect x="0" y="0" width="8" height="10" rx="2" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
            <path d="M8 2.5C10 2.5 10 7.5 8 7.5" stroke="#ffffff" strokeWidth="1.2" fill="none" />
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

  // Trigger storyboard: 1. Asoma 1 luego el otro -> 2. Salen a juntarse -> 3. Beso con corazón -> 4. Suben a esconderse juntos
  const triggerStorySequence = () => {
    setIsVisible(true);
    setCycleKey((prev) => prev + 1);

    if (animTimerRef.current) clearTimeout(animTimerRef.current);

    // Sequence runs for 5.2 seconds then hides cleanly
    animTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5300);
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
      className="absolute companion-island-container left-1/2 -translate-x-1/2 z-30 cursor-pointer select-none flex items-center justify-center pointer-events-auto h-8 px-4"
      title="Toca para ver a la parejita asomarse y darse el beso ✨"
    >
      <AnimatePresence mode="wait">
        {/* 🌟 1. STORYBOARD ANIMATION */}
        {isVisible ? (
          <div key={`story-cycle-${cycleKey}`} className="relative flex items-center justify-center w-36 h-8 overflow-visible">
            {hasUnreadDedication ? (
              /* 💌 Love letter delivery inverted peek */
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{
                  y: [-30, 0, 0, 0, -30],
                  opacity: [0, 1, 1, 1, 0]
                }}
                transition={{ duration: 5.2, times: [0, 0.15, 0.85, 0.95, 1], ease: 'easeInOut' }}
                className="flex items-center space-x-1 bg-pink-100/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-pink-300 shadow-sm"
              >
                {activeProfile === 'partner1' ? (
                  <InvertedChibiGirl isHoldingLetter />
                ) : (
                  <InvertedChibiBoy isHoldingLetter />
                )}
                <span className="text-[10px] font-black text-pink-700 animate-pulse">
                  ¡Tienes una cartita! 💌
                </span>
              </motion.div>
            ) : isPartnerLowBattery ? (
              /* ☕ Partner Low battery cozy coffee */
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{
                  y: [-30, 0, 0, 0, -30],
                  opacity: [0, 1, 1, 1, 0]
                }}
                transition={{ duration: 5.2, times: [0, 0.15, 0.85, 0.95, 1], ease: 'easeInOut' }}
                className="flex items-center space-x-1.5 bg-amber-50/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-200 shadow-sm"
              >
                {activeProfile === 'partner1' ? (
                  <InvertedChibiGirl isDrinking />
                ) : (
                  <InvertedChibiBoy isDrinking />
                )}
                <span className="text-[10px] font-extrabold text-amber-800">
                  {getPartnerDisplayName(activeProfile)} necesita apapacho ☕
                </span>
              </motion.div>
            ) : (
              /* 💑 THE 4-STEP STORYBOARD */
              <>
                {/* 👦 Chibi Boy: 
                    1. Asoma primero por la izquierda (y: -30 -> 0 at x: -36)
                    2. Sale a juntarse al centro (x: -36 -> -4)
                    3. Se dan el beso (x: -4, y: 0)
                    4. Suben a esconderse JUNTOS al centro (x: -4, y: 0 -> -35)
                */}
                <motion.div
                  initial={{ y: -32, x: -36, opacity: 0 }}
                  animate={{
                    y: [-32, 0, 0, 0, 0, -32],
                    x: [-36, -36, -36, -4, -4, -4],
                    rotate: [0, 0, 0, 10, 10, 0],
                    opacity: [0, 1, 1, 1, 1, 0]
                  }}
                  transition={{
                    duration: 5.2,
                    times: [0, 0.15, 0.32, 0.58, 0.82, 1],
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
                    scale: [0.2, 0.2, 0.2, 1.4, 1.1, 0.3],
                    y: [-2, -2, -2, 14, 22, 28]
                  }}
                  transition={{
                    duration: 5.2,
                    times: [0, 0.45, 0.54, 0.65, 0.82, 0.95],
                    ease: 'easeOut'
                  }}
                  className="absolute z-20 pointer-events-none text-xs flex items-center space-x-0.5"
                >
                  <span>💖</span>
                  <span className="text-[10px]">✨</span>
                </motion.div>

                {/* 👧 Chibi Girl: 
                    1. Asoma DESPUÉS por la derecha (y: -30 -> 0 at x: 36, starts at 0.16)
                    2. Sale a juntarse al centro (x: 36 -> 4)
                    3. Se dan el beso (x: 4, y: 0)
                    4. Suben a esconderse JUNTOS al centro (x: 4, y: 0 -> -35)
                */}
                <motion.div
                  initial={{ y: -32, x: 36, opacity: 0 }}
                  animate={{
                    y: [-32, -32, 0, 0, 0, -32],
                    x: [36, 36, 36, 4, 4, 4],
                    rotate: [0, 0, 0, -10, -10, 0],
                    opacity: [0, 0, 1, 1, 1, 0]
                  }}
                  transition={{
                    duration: 5.2,
                    times: [0, 0.16, 0.34, 0.58, 0.82, 1],
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
            className="flex items-center space-x-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-pink-200 shadow-xs text-[10px] font-bold text-pink-600 hover:scale-105 transition-transform"
          >
            {hasUnreadDedication ? (
              <>
                <span>💌</span>
                <span className="text-[9px] font-black">1 Sorpresa</span>
              </>
            ) : (
              <>
                <span>☕</span>
                <span className="text-[9px] font-black">{getPartnerDisplayName(activeProfile)}</span>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
