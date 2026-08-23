import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { getUserDisplayName, getUserProfileColor, getUserPhotoUrl } from '../services/storageService';
import { hapticService } from '../services/hapticService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

interface HeaderProps {
  onStartTour?: () => void;
  activeProfile: UserProfile;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export default function Header({ activeProfile, onOpenSettings, onOpenProfile, onStartTour }: HeaderProps) {
  const profileColor = getUserProfileColor(activeProfile);
  const isBlue = profileColor === 'blue';
  const currentUserName = getUserDisplayName(activeProfile);
  const userPhoto = getUserPhotoUrl(activeProfile);

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

        {/* User Avatar Photo / Blank Silhouette (Opens Profile Modal) */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            hapticService.playPhysicalThud(0.28, 0.18);
            onOpenProfile();
          }}
          className={`w-10 h-10 rounded-full p-0.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.12)] cursor-pointer select-none active:brightness-95 flex items-center justify-center border-2 overflow-hidden ${
            isBlue ? 'bg-gradient-to-b from-[#7ed0ff] to-[#006388] border-white' : 'bg-gradient-to-b from-[#f9a8d4] to-[#af0a78] border-white'
          }`}
          id="tour-header-avatar"
          title={`Mi Perfil: ${currentUserName} (Toca para editar foto, color o nombre)`}
        >
          {userPhoto ? (
            <img
              src={userPhoto}
              alt={currentUserName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            /* Clean blank avatar silhouette */
            <div className="w-full h-full flex items-center justify-center text-white bg-white/20 rounded-full">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}
