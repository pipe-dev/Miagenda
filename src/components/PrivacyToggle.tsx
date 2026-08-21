import React from 'react';
import { motion } from 'framer-motion';
import { PrivacyType } from '../types';
import { hapticService } from '../services/hapticService';

interface PrivacyToggleProps {
  activeTab: PrivacyType;
  onTabChange: (tab: PrivacyType) => void;
}

export default function PrivacyToggle({ activeTab, onTabChange }: PrivacyToggleProps) {
  const isMine = activeTab === 'mine';

  const handleTabSelect = (tab: PrivacyType) => {
    hapticService.playLightTap();
    onTabChange(tab);
  };

  return (
    <div className="w-full max-w-sm mx-auto my-3 px-2">
      {/* 3D Container */}
      <div className="sunken-well bg-white/70 p-1.5 rounded-full flex items-center justify-between relative shadow-inner border border-white/60">
        
        {/* Option 1: Mi Agenda (Solo Mío) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => handleTabSelect('mine')}
          className={`relative z-10 w-1/2 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors duration-200 select-none ${
            isMine ? 'text-white' : 'text-on-surface-variant active:text-primary'
          }`}
        >
          {isMine && (
            <motion.div
              layoutId="privacy-pill"
              className="absolute inset-0 rounded-full candy-btn"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <span className="relative z-10 material-symbols-outlined text-[18px]">
            {isMine ? 'lock' : 'lock_open'}
          </span>
          <span className="relative z-10">Mi Agenda</span>
        </motion.button>

        {/* Option 2: Compartido (Ambos) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => handleTabSelect('shared')}
          className={`relative z-10 w-1/2 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors duration-200 select-none ${
            !isMine ? 'text-white' : 'text-on-surface-variant active:text-primary'
          }`}
        >
          {!isMine && (
            <motion.div
              layoutId="privacy-pill"
              className="absolute inset-0 rounded-full candy-accent-bicolor"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <span className="relative z-10 material-symbols-outlined text-[18px]">
            favorite
          </span>
          <span className="relative z-10">Compartido</span>
        </motion.button>
      </div>
    </div>
  );
}
