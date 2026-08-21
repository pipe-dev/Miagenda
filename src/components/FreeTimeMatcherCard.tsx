import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventItem } from '../types';
import { findSharedFreeWindows, FreeTimeWindow } from '../services/storageService';
import { hapticService } from '../services/hapticService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

interface FreeTimeMatcherCardProps {
  events: EventItem[];
  dateStr: string;
  onPlanSharedDate: (timeWindow: FreeTimeWindow) => void;
}

// 12-hour format parser
const formatTo12H = (time24?: string) => {
  if (!time24) return '';
  const parts = time24.split(':');
  const h24 = parseInt(parts[0] || '12', 10);
  const minute = parts[1] || '00';
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${minute} ${period}`;
};

const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
};

export default function FreeTimeMatcherCard({
  events,
  dateStr,
  onPlanSharedDate
}: FreeTimeMatcherCardProps) {
  // Collapsed by default
  const [isCollapsed, setIsCollapsed] = useState(true);
  const freeWindows = findSharedFreeWindows(events, dateStr);

  const handleToggleCollapse = () => {
    hapticService.playLightTap();
    setIsCollapsed(!isCollapsed);
  };

  const handlePlanClick = (win: FreeTimeWindow) => {
    hapticService.playPhysicalThud(0.28, 0.18);
    onPlanSharedDate(win);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 plush-card rounded-3xl p-4 sm:p-5 border-2 border-white relative overflow-hidden shadow-md"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,249,240,0.92) 100%)'
      }}
    >
      {/* Background Golden Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

      {/* Header Row - Entire row is clickable */}
      <div
        onClick={handleToggleCollapse}
        className="flex items-center justify-between cursor-pointer select-none active:opacity-85 transition-opacity"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center shadow-md shrink-0 border border-white">
            <LordIcon
              src={LORDICON_ICONS.sparkle}
              trigger="loop"
              size={22}
              primaryColor="#78350f"
              secondaryColor="#f59e0b"
            />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 leading-none block mb-0.5">
              COORDINACIÓN DE PAREJA
            </span>
            <h3 className="font-extrabold text-lg text-on-surface leading-tight select-none">
              Tiempo Libre para los Dos
            </h3>
          </div>
        </div>

        {/* Collapse / Expand Toggle Icon */}
        <div className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-on-surface-variant flex items-center justify-center border border-white shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[18px]">
            {isCollapsed ? 'expand_more' : 'expand_less'}
          </span>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-3.5 space-y-2.5"
          >
            {freeWindows.length === 0 ? (
              <div className="bg-white/70 rounded-2xl p-3 border border-white text-xs text-on-surface-variant leading-relaxed text-center">
                <p>Hoy tienen la agenda bastante ocupada con citas y compromisos.</p>
                <p className="font-bold text-primary mt-1" style={{ color: 'var(--primary)' }}>
                  ¡Revisa el Calendario Semanal para encontrar otro día libre juntos!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-on-surface-variant">
                  Ventanas de tiempo donde ambos están 100% libres de compromisos:
                </p>

                <div className="space-y-2 pt-1">
                  {freeWindows.map((win, idx) => (
                    <div
                      key={idx}
                      className="bg-white/90 rounded-2xl p-3 border border-amber-200/60 shadow-sm flex items-center justify-between transition-all hover:border-amber-300"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                        <div>
                          <p className="font-black text-sm sm:text-base text-on-surface leading-tight">
                            {formatTo12H(win.start)} - {formatTo12H(win.end)}
                          </p>
                          <span className="text-[10px] font-bold text-amber-800/80 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {formatDuration(win.durationMinutes)} de tiempo libre juntos
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        type="button"
                        onClick={() => handlePlanClick(win)}
                        className="px-3.5 py-2 rounded-full candy-accent-bicolor text-white font-extrabold text-xs shadow-md shrink-0 flex items-center space-x-1 select-none"
                      >
                        <span className="material-symbols-outlined text-[15px]">add_reaction</span>
                        <span>Planear Cita</span>
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
