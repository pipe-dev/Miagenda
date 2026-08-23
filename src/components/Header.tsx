import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { getUserDisplayName, getUserProfileColor } from '../services/storageService';
import { hapticService } from '../services/hapticService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

interface HeaderProps {
  onStartTour?: () => void;
  activeProfile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onOpenSettings: () => void;
  onOpenProfileSetup?: () => void;
}

export default function Header({ activeProfile, onProfileChange, onOpenSettings, onOpenProfileSetup, onStartTour }: HeaderProps) {
  const isPartner1 = activeProfile === 'partner1';
  const profileColor = getUserProfileColor(activeProfile);
  const isBlue = profileColor === 'blue';
  const currentUserName = getUserDisplayName(activeProfile);

  return (
    <header className="w-full bg-white/92 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sticky top-0 z-40 safe-top-header pb-3 px-4 sm:px-6 transition-all duration-300">
      <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
        {/* Menu / Settings Button */}
        <div className="flex items-center space-x-1">
        <motion.button
          whileTap={{ scale: 0.88 }}
          id="tour-header-settings"
          onClick={() => {
            hapticService.playLightTap();
            onOpenSettings();
          }}
          className="text-on-surface p-1 active:opacity-70 flex items-center justify-center rounded-xl"
          title="Menú y Ajustes"
        >
          <LordIcon
            src={LORDICON_ICONS.settings}
            trigger="hover"
            size={26}
            primaryColor="#1e293b"
            secondaryColor="var(--primary)"
          />
        </motion.button>

        {onStartTour && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              hapticService.playLightTap();
              onStartTour();
            }}
            className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-primary flex items-center justify-center border border-white/80 shadow-2xs text-xs font-black"
            title="Ver Tutorial Guiado de esta pantalla"
          >
            <span className="material-symbols-outlined text-[17px]" style={{ color: 'var(--primary)' }}>help</span>
          </motion.button>
        )}
      </div>

        {/* Main Title */}
        <h1
          className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight italic drop-shadow-sm select-none transition-colors duration-200"
          style={{ color: 'var(--primary)' }}
        >
          Mi Agenda
        </h1>

        {/* User Avatar Doll (Blue Male vs Pink Female) with switch functionality */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            hapticService.playPhysicalThud(0.28, 0.18);
            onProfileChange(isPartner1 ? 'partner2' : 'partner1');
          }}
          className={`w-10 h-10 rounded-full p-0.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.12)] cursor-pointer select-none active:brightness-95 flex items-center justify-center border-2 ${
            isBlue ? 'bg-gradient-to-b from-[#7ed0ff] to-[#006388] border-white' : 'bg-gradient-to-b from-[#f9a8d4] to-[#af0a78] border-white'
          }`}
          id="tour-header-avatar"
          title={`Toca para cambiar perfil (Actualmente: ${currentUserName})`}
        >
          {isBlue ? (
            /* Blue Male Doll Avatar */
            <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 56C16 46 22 42 32 42C42 42 48 46 48 56" stroke="white" strokeWidth="4" strokeLinecap="round" fill="#004c6a" />
              <circle cx="32" cy="25" r="13" fill="#ffe0b2" stroke="white" strokeWidth="2.5" />
              <path d="M19 23C19 16 24 12 32 12C40 12 45 16 45 23C42 19 37 19 32 19C27 19 22 19 19 23Z" fill="#001824" />
              <circle cx="28" cy="25" r="1.5" fill="#001824" />
              <circle cx="36" cy="25" r="1.5" fill="#001824" />
              <path d="M29 30C30.5 31.5 33.5 31.5 35 30" stroke="#001824" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            /* Pink Female Doll Avatar with blonde hair */
            <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 56C16 46 22 42 32 42C42 42 48 46 48 56" stroke="white" strokeWidth="4" strokeLinecap="round" fill="#b2107b" />
              <path d="M17 24C17 37 20 48 20 48C20 48 44 48 44 48C44 48 47 37 47 24" fill="#d97706" />
              <path d="M18 25C18 36 21 46 21 46C21 46 43 46 43 46C43 46 46 36 46 25" fill="#eab308" />
              <circle cx="32" cy="25" r="12" fill="#ffe0b2" stroke="white" strokeWidth="2.5" />
              <path d="M19 22C19 14 24 10 32 10C40 10 45 14 45 22C42 17 37 17 32 17C27 17 22 17 19 22Z" fill="#facc15" />
              <path d="M22 17C26 13 32 13 36 17" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
              <circle cx="28" cy="25" r="1.5" fill="#451a03" />
              <circle cx="36" cy="25" r="1.5" fill="#451a03" />
              <path d="M29 30C30.5 31.5 33.5 31.5 35 30" stroke="#af0a78" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </motion.div>
      </div>
    </header>
  );
}
