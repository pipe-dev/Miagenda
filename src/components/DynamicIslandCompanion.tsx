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

// Chibi Boy Peeking Down from Island (Head + Little Hands holding the island edge)
const ChibiBoyPeeker = ({
  isKissing = false,
  isHoldingLetter = false,
  isDrinking = false,
  isWaving = false
}: {
  isKissing?: boolean;
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
  isWaving?: boolean;
}) => {
  return (
    <div className="relative w-8 h-8 select-none pointer-events-none drop-shadow-md flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="w-8 h-8 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft shadow */}
        <ellipse cx="22" cy="40" rx="9" ry="2" fill="rgba(0,0,0,0.15)" />

        {/* Cute Head hanging down */}
        <circle cx="22" cy="20" r="13" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.6" />

        {/* Boy styled hair hanging upside down/peeking */}
        <path d="M10 18C10 9 16 6 22 6C28 6 34 9 34 18C31 13 27 12 22 12C17 12 13 13 10 18Z" fill="#1e293b" />
        <path d="M9 18C11 15 14 14 17 14C15 17 14 19 14 20C12 20 10 19 9 18Z" fill="#1e293b" />
        <path d="M35 18C33 15 30 14 27 14C29 17 30 19 30 20C32 20 34 19 35 18Z" fill="#1e293b" />
        {/* Hair shine */}
        <path d="M16 9C19 7.5 25 7.5 28 9" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

        {/* Sanrio Sparkle Eyes (Looking toward center/partner) */}
        {isKissing ? (
          /* Happy curved closed eyes when kissing */
          <>
            <path d="M16 20C17.5 18.5 19.5 18.5 21 20" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M25 20C26.5 18.5 28.5 18.5 30 20" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
          </>
        ) : (
          /* Big sweet open eyes */
          <>
            <circle cx="18" cy="20" r="2" fill="#0f172a" />
            <circle cx="26" cy="20" r="2" fill="#0f172a" />
            <circle cx="18.8" cy="19.2" r="0.7" fill="#ffffff" />
            <circle cx="26.8" cy="19.2" r="0.7" fill="#ffffff" />
          </>
        )}

        {/* Rosy Cheeks (Blushing intensifies when kissing) */}
        <ellipse cx="14" cy="23.5" rx={isKissing ? 3 : 2.2} ry={isKissing ? 2 : 1.4} fill="#ff80a0" opacity={isKissing ? 0.95 : 0.75} />
        <ellipse cx="30" cy="23.5" rx={isKissing ? 3 : 2.2} ry={isKissing ? 2 : 1.4} fill="#ff80a0" opacity={isKissing ? 0.95 : 0.75} />

        {/* Cute Smile / Kiss mouth */}
        {isKissing ? (
          <path d="M21 25C22 26 24 26 25 25" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round" />
        ) : (
          <path d="M20 24C21 25.5 23 25.5 24 24" stroke="#0f172a" strokeWidth="1.3" strokeLinecap="round" />
        )}

        {/* Tiny hands holding the island edge at the top */}
        <ellipse cx="12" cy="8" rx="2.5" ry="2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />
        <ellipse cx="32" cy="8" rx="2.5" ry="2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />

        {/* Little blue collar */}
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
            <path d="M2 -3C1 -1 4 -2 3 0" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
          </g>
        )}

        {/* Waving Hand Prop */}
        {isWaving && (
          <g transform="translate(31, 12)">
            <circle cx="2" cy="2" r="3.5" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Chibi Girl Peeking Down from Island (Head + Sweet hair bow + Little Hands)
const ChibiGirlPeeker = ({
  isKissing = false,
  isHoldingLetter = false,
  isDrinking = false,
  isWaving = false
}: {
  isKissing?: boolean;
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
  isWaving?: boolean;
}) => {
  return (
    <div className="relative w-8 h-8 select-none pointer-events-none drop-shadow-md flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="w-8 h-8 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft shadow */}
        <ellipse cx="22" cy="40" rx="9" ry="2" fill="rgba(0,0,0,0.15)" />

        {/* Hair background flowing down */}
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
        {isKissing ? (
          /* Happy curved closed eyes when kissing */
          <>
            <path d="M16 20C17.5 18.5 19.5 18.5 21 20" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M25 20C26.5 18.5 28.5 18.5 30 20" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" />
          </>
        ) : (
          /* Sweet eyes with eyelashes */
          <>
            <circle cx="18" cy="20" r="2" fill="#451a03" />
            <circle cx="26" cy="20" r="2" fill="#451a03" />
            <circle cx="18.8" cy="19.2" r="0.7" fill="#ffffff" />
            <circle cx="26.8" cy="19.2" r="0.7" fill="#ffffff" />
            <path d="M16.5 18L15.5 17" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M27.5 18L28.5 17" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}

        {/* Rosy Cheeks (Blushing intensifies when kissing) */}
        <ellipse cx="14" cy="23.5" rx={isKissing ? 3 : 2.2} ry={isKissing ? 2 : 1.4} fill="#f43f5e" opacity={isKissing ? 0.95 : 0.8} />
        <ellipse cx="30" cy="23.5" rx={isKissing ? 3 : 2.2} ry={isKissing ? 2 : 1.4} fill="#f43f5e" opacity={isKissing ? 0.95 : 0.8} />

        {/* Cute Smile / Kiss mouth */}
        {isKissing ? (
          <path d="M21 25C22 26 24 26 25 25" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round" />
        ) : (
          <path d="M20 24C21 25.5 23 25.5 24 24" stroke="#451a03" strokeWidth="1.3" strokeLinecap="round" />
        )}

        {/* Tiny hands holding the island edge at the top */}
        <ellipse cx="12" cy="8" rx="2.5" ry="2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />
        <ellipse cx="32" cy="8" rx="2.5" ry="2" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />

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
            <path d="M2 -3C1 -1 4 -2 3 0" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
          </g>
        )}

        {/* Waving Hand Prop */}
        {isWaving && (
          <g transform="translate(31, 12)">
            <circle cx="2" cy="2" r="3.5" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.2" />
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
  const [isVisible, setIsVisible] = useState(true);
  const [isKissing, setIsKissing] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isPartnerLowBattery = Boolean(partnerMood?.battery && partnerMood.battery > 0 && partnerMood.battery <= 35);
  const hasSharedEventToday = todayEvents.some((e) => e.privacy === 'shared');

  // Trigger the peek, kiss and hide animation cycle
  const triggerPeekAnimation = () => {
    setIsVisible(true);
    setIsKissing(false);
    setIsWaving(false);
    setHeartBurst(false);

    if (animTimerRef.current) clearTimeout(animTimerRef.current);

    // 1. Move to center and start kissing at 3.5s
    setTimeout(() => {
      setIsKissing(true);
      setHeartBurst(true);
    }, 3500);

    // 2. Wave goodbye at 7.5s
    setTimeout(() => {
      setIsKissing(false);
      setIsWaving(true);
      setHeartBurst(false);
    }, 7500);

    // 3. Hide back into the island at 10.5s
    animTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsWaving(false);
    }, 10500);
  };

  // On App Mount: trigger peek & kiss greeting
  useEffect(() => {
    triggerPeekAnimation();
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Periodic greeting every 2.5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      triggerPeekAnimation();
    }, 150000);
    return () => clearInterval(interval);
  }, []);

  // Handle tap on island
  const handleCompanionTap = () => {
    hapticService.playPhysicalThud(0.25, 0.15);
    setTapCount((c) => c + 1);
    triggerPeekAnimation();

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
      title="Toca para que la parejita se asome ✨"
    >
      <AnimatePresence mode="wait">
        {/* 🌟 1. ACTIVE PEEK & KISS FROM ISLAND */}
        {isVisible ? (
          <motion.div
            key={`peeking-active-${tapCount}`}
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            className="relative flex items-center justify-center w-40 h-8"
          >
            {hasUnreadDedication ? (
              /* 💌 Dedicated Love Letter Messenger */
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="flex items-center space-x-1 bg-pink-100/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-pink-300 shadow-sm"
              >
                {activeProfile === 'partner1' ? (
                  <ChibiGirlPeeker isHoldingLetter isWaving={isWaving} />
                ) : (
                  <ChibiBoyPeeker isHoldingLetter isWaving={isWaving} />
                )}
                <span className="text-[10px] font-black text-pink-700 animate-pulse">
                  ¡Tienes una cartita! 💌
                </span>
              </motion.div>
            ) : isPartnerLowBattery ? (
              /* ☕ Partner Low Battery Cozy Coffee */
              <motion.div
                animate={{ y: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="flex items-center space-x-1.5 bg-amber-50/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-200 shadow-sm"
              >
                {activeProfile === 'partner1' ? (
                  <ChibiGirlPeeker isDrinking isWaving={isWaving} />
                ) : (
                  <ChibiBoyPeeker isDrinking isWaving={isWaving} />
                )}
                <span className="text-[10px] font-extrabold text-amber-800">
                  {getPartnerDisplayName(activeProfile)} necesita apapacho ☕
                </span>
              </motion.div>
            ) : hasSharedEventToday ? (
              /* 🎈 Shared Date Balloon */
              <div className="flex items-center space-x-2 bg-purple-50/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-purple-200 shadow-sm">
                <ChibiBoyPeeker isKissing={isKissing} isWaving={isWaving} />
                <span className="text-xs">🎈</span>
                <ChibiGirlPeeker isKissing={isKissing} isWaving={isWaving} />
              </div>
            ) : (
              /* 💑 Normal Couple Peek, Meet in Center, Kiss and Disappear */
              <>
                {/* Boy sliding from left to center */}
                <motion.div
                  animate={{
                    x: isKissing ? -5 : [-36, -5, -5, -36],
                    rotate: isKissing ? 8 : [0, 6, 6, 0]
                  }}
                  transition={{ duration: 10, times: [0, 0.35, 0.75, 1], ease: 'easeInOut' }}
                  className="absolute"
                >
                  <ChibiBoyPeeker isKissing={isKissing} isWaving={isWaving} />
                </motion.div>

                {/* Floating Heart burst during the kiss */}
                <AnimatePresence>
                  {heartBurst && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, y: 4 }}
                      animate={{ opacity: 1, scale: [0.8, 1.4, 1.1], y: 14 }}
                      exit={{ opacity: 0, scale: 0.5, y: 22 }}
                      transition={{ duration: 1.5 }}
                      className="absolute z-20 pointer-events-none text-xs flex items-center space-x-0.5"
                    >
                      <span>💖</span>
                      <span className="text-[10px]">✨</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Girl sliding from right to center */}
                <motion.div
                  animate={{
                    x: isKissing ? 5 : [36, 5, 5, 36],
                    rotate: isKissing ? -8 : [0, -6, -6, 0]
                  }}
                  transition={{ duration: 10, times: [0, 0.35, 0.75, 1], ease: 'easeInOut' }}
                  className="absolute"
                >
                  <ChibiGirlPeeker isKissing={isKissing} isWaving={isWaving} />
                </motion.div>
              </>
            )}
          </motion.div>
        ) : shouldShowNotificationPeek ? (
          /* 👀 2. Subtle peek on standby */
          <motion.div
            key="standby-peek"
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
