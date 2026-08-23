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

// Kawaii Chibi Boy SVG Character (Sanrio / Sticker Style)
const ChibiBoy = ({
  isWalking = true,
  isHoldingLetter = false,
  isDrinking = false,
  isWaving = false
}: {
  isWalking?: boolean;
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
  isWaving?: boolean;
}) => {
  return (
    <motion.div
      animate={
        isWaving
          ? { y: [0, -4, 0], rotate: [-4, 4, -4] }
          : isWalking
          ? { y: [0, -3, 0], rotate: [-2, 2, -2] }
          : { y: [0, -1, 0] }
      }
      transition={{ repeat: Infinity, duration: isWaving ? 0.35 : isWalking ? 0.45 : 1.6, ease: 'easeInOut' }}
      className="relative w-8 h-8 select-none pointer-events-none drop-shadow-sm flex items-center justify-center"
    >
      <svg viewBox="0 0 48 48" className="w-8 h-8 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft shadow */}
        <ellipse cx="24" cy="45" rx="10" ry="2.5" fill="rgba(0,0,0,0.12)" />

        {/* Little feet */}
        <ellipse cx={isWalking ? 19 : 20} cy="42" rx="3.5" ry="2.2" fill="#004c6a" />
        <ellipse cx={isWalking ? 29 : 28} cy="42" rx="3.5" ry="2.2" fill="#004c6a" />

        {/* Body / Shirt */}
        <rect x="16" y="28" width="16" height="13" rx="6" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
        {/* White shirt collar */}
        <path d="M21 28L24 32L27 28" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

        {/* Cute Head */}
        <circle cx="24" cy="18" r="12" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.5" />

        {/* Hair - Cute boy styled bangs with shine */}
        <path d="M13 18C13 10 18 7 24 7C30 7 35 10 35 18C33 14 29 13 24 13C19 13 15 14 13 18Z" fill="#1e293b" />
        <path d="M12 18C14 15 17 14 19 14C17 17 16 19 16 20C14 20 13 19 12 18Z" fill="#1e293b" />
        <path d="M36 18C34 15 31 14 29 14C31 17 32 19 32 20C34 20 35 19 36 18Z" fill="#1e293b" />
        {/* Hair highlight */}
        <path d="M18 10C21 8.5 27 8.5 30 10" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

        {/* Sanrio Sparkle Eyes */}
        <circle cx="20" cy="19" r="1.8" fill="#0f172a" />
        <circle cx="28" cy="19" r="1.8" fill="#0f172a" />
        <circle cx="20.6" cy="18.3" r="0.6" fill="#ffffff" />
        <circle cx="28.6" cy="18.3" r="0.6" fill="#ffffff" />

        {/* Rosy Cheeks */}
        <ellipse cx="17" cy="21.5" rx="2" ry="1.2" fill="#ff99b6" opacity="0.75" />
        <ellipse cx="31" cy="21.5" rx="2" ry="1.2" fill="#ff99b6" opacity="0.75" />

        {/* Smile */}
        <path d="M22 22C23 23.5 25 23.5 26 22" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />

        {/* Letter Prop */}
        {isHoldingLetter && (
          <g transform="translate(17, 28)">
            <rect x="0" y="0" width="14" height="10" rx="1.5" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
            <path d="M0 0L7 6L14 0" stroke="#e11d48" strokeWidth="1" fill="none" />
            <circle cx="7" cy="6.5" r="1.8" fill="#e11d48" />
          </g>
        )}

        {/* Coffee Cup Prop */}
        {isDrinking && (
          <g transform="translate(26, 26)">
            <rect x="0" y="0" width="7" height="9" rx="1.5" fill="#d97706" stroke="#ffffff" strokeWidth="1" />
            <path d="M7 2C9 2 9 6 7 6" stroke="#ffffff" strokeWidth="1" fill="none" />
            {/* Steam */}
            <path d="M2 -3C1 -1 4 -2 3 0" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
          </g>
        )}

        {/* Waving Hand Prop */}
        {isWaving && (
          <g transform="translate(32, 14)">
            <circle cx="2" cy="2" r="3" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};

// Kawaii Chibi Girl SVG Character (Sanrio / Sticker Style)
const ChibiGirl = ({
  isWalking = true,
  isHoldingLetter = false,
  isDrinking = false,
  isWaving = false
}: {
  isWalking?: boolean;
  isHoldingLetter?: boolean;
  isDrinking?: boolean;
  isWaving?: boolean;
}) => {
  return (
    <motion.div
      animate={
        isWaving
          ? { y: [0, -4, 0], rotate: [4, -4, 4] }
          : isWalking
          ? { y: [0, -3, 0], rotate: [2, -2, 2] }
          : { y: [0, -1, 0] }
      }
      transition={{ repeat: Infinity, duration: isWaving ? 0.35 : isWalking ? 0.45 : 1.6, ease: 'easeInOut' }}
      className="relative w-8 h-8 select-none pointer-events-none drop-shadow-sm flex items-center justify-center"
    >
      <svg viewBox="0 0 48 48" className="w-8 h-8 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft shadow */}
        <ellipse cx="24" cy="45" rx="10" ry="2.5" fill="rgba(0,0,0,0.12)" />

        {/* Little feet */}
        <ellipse cx={isWalking ? 19 : 20} cy="42" rx="3.5" ry="2.2" fill="#be185d" />
        <ellipse cx={isWalking ? 29 : 28} cy="42" rx="3.5" ry="2.2" fill="#be185d" />

        {/* Pink Dress */}
        <path d="M17 28L14 41C14 41 24 43 34 41L31 28H17Z" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
        {/* White collar */}
        <path d="M21 28L24 31L27 28" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

        {/* Long hair background */}
        <path d="M12 18C12 28 14 36 14 36C14 36 34 36 34 36C34 36 36 28 36 18" fill="#d97706" />

        {/* Cute Head */}
        <circle cx="24" cy="18" r="12" fill="#ffebd3" stroke="#ffffff" strokeWidth="1.5" />

        {/* Cute bangs and front hair */}
        <path d="M13 18C13 10 18 7 24 7C30 7 35 10 35 18C33 14 28 13 24 13C20 13 15 14 13 18Z" fill="#eab308" />
        <path d="M15 16C18 13 23 13 26 15C29 13 33 13 35 16" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round" />

        {/* Pink Ribbon Bow in Hair */}
        <g transform="translate(29, 6)">
          <ellipse cx="2" cy="3" rx="2.5" ry="1.8" fill="#f43f5e" />
          <ellipse cx="6" cy="3" rx="2.5" ry="1.8" fill="#f43f5e" />
          <circle cx="4" cy="3" r="1.5" fill="#ffffff" />
        </g>

        {/* Sanrio Sparkle Eyes with Eyelashes */}
        <circle cx="20" cy="19" r="1.8" fill="#451a03" />
        <circle cx="28" cy="19" r="1.8" fill="#451a03" />
        <circle cx="20.6" cy="18.3" r="0.6" fill="#ffffff" />
        <circle cx="28.6" cy="18.3" r="0.6" fill="#ffffff" />
        {/* Eyelashes */}
        <path d="M18.5 17L17.5 16" stroke="#451a03" strokeWidth="1" strokeLinecap="round" />
        <path d="M29.5 17L30.5 16" stroke="#451a03" strokeWidth="1" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <ellipse cx="17" cy="21.5" rx="2.2" ry="1.4" fill="#f43f5e" opacity="0.8" />
        <ellipse cx="31" cy="21.5" rx="2.2" ry="1.4" fill="#f43f5e" opacity="0.8" />

        {/* Sweet Smile */}
        <path d="M22 22C23 23.5 25 23.5 26 22" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />

        {/* Letter Prop */}
        {isHoldingLetter && (
          <g transform="translate(17, 28)">
            <rect x="0" y="0" width="14" height="10" rx="1.5" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
            <path d="M0 0L7 6L14 0" stroke="#e11d48" strokeWidth="1" fill="none" />
            <circle cx="7" cy="6.5" r="1.8" fill="#e11d48" />
          </g>
        )}

        {/* Coffee Cup Prop */}
        {isDrinking && (
          <g transform="translate(26, 26)">
            <rect x="0" y="0" width="7" height="9" rx="1.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
            <path d="M7 2C9 2 9 6 7 6" stroke="#ffffff" strokeWidth="1" fill="none" />
            {/* Steam */}
            <path d="M2 -3C1 -1 4 -2 3 0" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
          </g>
        )}

        {/* Waving Hand Prop */}
        {isWaving && (
          <g transform="translate(32, 14)">
            <circle cx="2" cy="2" r="3" fill="#ffebd3" stroke="#ffffff" strokeWidth="1" />
          </g>
        )}
      </svg>
    </motion.div>
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
  const [isWaving, setIsWaving] = useState(false);
  const [tapBounce, setTapBounce] = useState(0);
  const [heartBurst, setHeartBurst] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check contextual triggers
  const isPartnerLowBattery = Boolean(partnerMood?.battery && partnerMood.battery > 0 && partnerMood.battery <= 35);
  const hasSharedEventToday = todayEvents.some((e) => e.privacy === 'shared');

  // Trigger apparition for duration (default: 12 seconds)
  const triggerApparition = (durationMs = 12000) => {
    setIsVisible(true);
    setIsWaving(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    // Wave goodbye 2.5 seconds before hiding
    setTimeout(() => {
      setIsWaving(true);
    }, Math.max(1000, durationMs - 2500));

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsWaving(false);
    }, durationMs);
  };

  // 1. Initial 12-second greeting upon opening the app
  useEffect(() => {
    triggerApparition(12000);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // 2. Periodic gentle stroll every 2.5 minutes (150 seconds)
  useEffect(() => {
    const periodicInterval = setInterval(() => {
      triggerApparition(10000);
    }, 150000);
    return () => clearInterval(periodicInterval);
  }, []);

  // 3. Periodic heart burst when characters meet
  useEffect(() => {
    const heartInterval = setInterval(() => {
      if (isVisible) {
        setHeartBurst(true);
        setTimeout(() => setHeartBurst(false), 2400);
      }
    }, 6000);
    return () => clearInterval(heartInterval);
  }, [isVisible]);

  // 4. Handle tap: wake up immediately or trigger contextual modal
  const handleCompanionTap = () => {
    hapticService.playPhysicalThud(0.25, 0.15);
    setTapBounce((b) => b + 1);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 2000);

    // Wake up for 10 seconds if asleep
    triggerApparition(10000);

    if (hasUnreadDedication && onOpenSurprise) {
      onOpenSurprise();
    } else if (isPartnerLowBattery && onOpenMoodCheckin) {
      onOpenMoodCheckin();
    }
  };

  // Peek mode: when walking is hidden, but a surprise or low battery needs subtle attention
  const shouldPeek = !isVisible && (hasUnreadDedication || isPartnerLowBattery);

  return (
    <div
      onClick={handleCompanionTap}
      className="absolute companion-island-container left-1/2 -translate-x-1/2 z-30 cursor-pointer select-none flex items-center justify-center pointer-events-auto h-8 px-4 group"
      title="Toca para interactuar con tu parejita ✨"
    >
      <AnimatePresence mode="wait">
        {/* 🌟 1. ACTIVE WALKING / GREETING MODE */}
        {isVisible ? (
          <motion.div
            key={`active-companion-${tapBounce}`}
            initial={{ opacity: 0, y: -8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center"
          >
            {/* 💌 CASE A: UNREAD DEDICATION (Messenger running with love letter) */}
            {hasUnreadDedication ? (
              <motion.div
                animate={{ x: [-15, 15, -15] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="flex items-center space-x-1 bg-pink-100/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-pink-300 shadow-xs"
              >
                {activeProfile === 'partner1' ? (
                  <ChibiGirl isWalking isHoldingLetter isWaving={isWaving} />
                ) : (
                  <ChibiBoy isWalking isHoldingLetter isWaving={isWaving} />
                )}
                <span className="text-[10px] font-black text-pink-700 animate-pulse">
                  ¡Tienes una cartita! 💌
                </span>
              </motion.div>
            ) : isPartnerLowBattery ? (
              /* 🔋 CASE B: PARTNER LOW BATTERY (Resting comfortably with coffee) */
              <motion.div
                animate={{ scale: [0.96, 1.04, 0.96] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                className="flex items-center space-x-1.5 bg-amber-50/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-200 shadow-xs"
              >
                {activeProfile === 'partner1' ? (
                  <ChibiGirl isWalking={false} isDrinking isWaving={isWaving} />
                ) : (
                  <ChibiBoy isWalking={false} isDrinking isWaving={isWaving} />
                )}
                <span className="text-[10px] font-extrabold text-amber-800">
                  {getPartnerDisplayName(activeProfile)} necesita apapacho ☕
                </span>
              </motion.div>
            ) : hasSharedEventToday ? (
              /* 🎈 CASE C: SHARED DATE TODAY (Walking together holding party balloon) */
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="flex items-center space-x-2 bg-purple-50/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-purple-200 shadow-xs"
              >
                <ChibiBoy isWalking isWaving={isWaving} />
                <motion.div
                  animate={{ rotate: [-6, 6, -6], y: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-xs"
                >
                  🎈
                </motion.div>
                <ChibiGirl isWalking isWaving={isWaving} />
              </motion.div>
            ) : (
              /* ✨ CASE D: NORMAL COUPLE STROLL (Walking, meeting & kissing with hearts) */
              <div className="relative flex items-center justify-center w-36 h-7">
                {/* Boy Walker */}
                <motion.div
                  animate={{
                    x: [-40, -6, -6, -40],
                    scaleX: [1, 1, -1, -1]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 8,
                    times: [0, 0.45, 0.55, 1],
                    ease: 'easeInOut'
                  }}
                  className="absolute"
                >
                  <ChibiBoy isWalking isWaving={isWaving} />
                </motion.div>

                {/* Floating Kiss Hearts at center meeting */}
                <AnimatePresence>
                  {heartBurst && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.4, y: 0 }}
                      animate={{ opacity: 1, scale: [0.8, 1.3, 1], y: -16 }}
                      exit={{ opacity: 0, scale: 0.6, y: -24 }}
                      transition={{ duration: 1.4 }}
                      className="absolute z-20 pointer-events-none text-xs flex items-center space-x-0.5"
                    >
                      <span>💖</span>
                      <span className="text-[10px]">✨</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Girl Walker */}
                <motion.div
                  animate={{
                    x: [40, 6, 6, 40],
                    scaleX: [-1, -1, 1, 1]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 8,
                    times: [0, 0.45, 0.55, 1],
                    ease: 'easeInOut'
                  }}
                  className="absolute"
                >
                  <ChibiGirl isWalking isWaving={isWaving} />
                </motion.div>
              </div>
            )}
          </motion.div>
        ) : shouldPeek ? (
          /* 👀 2. PEEK-A-BOO MODE (Subtle notification peek when resting) */
          <motion.div
            key="peek-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center space-x-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-pink-200/90 shadow-xs text-[10px] font-bold text-pink-600 hover:scale-105 transition-transform"
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
