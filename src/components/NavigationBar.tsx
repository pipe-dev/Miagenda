import React from 'react';
import { motion } from 'framer-motion';
import { NavView } from '../types';
import { hapticService } from '../services/hapticService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

interface NavigationBarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  onOpenNewEvent: () => void;
  hasUnreadDedication: boolean;
}

export default function NavigationBar({
  currentView,
  onViewChange,
  onOpenNewEvent,
  hasUnreadDedication
}: NavigationBarProps) {
  const handleViewSelect = (view: NavView) => {
    hapticService.playLightTap();
    onViewChange(view);
  };

  const handleCreateClick = () => {
    hapticService.playPhysicalThud(0.32, 0.2);
    onOpenNewEvent();
  };

  const isToday = currentView === 'today';
  const isCalendar = currentView === 'calendar';
  const isTasks = currentView === 'tasks';
  const isMemories = currentView === 'memories';

  return (
    <nav id="tour-bottom-nav" className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 sm:pb-6 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-2xl border-2 border-white rounded-full p-2 shadow-[0_16px_40px_rgba(0,0,0,0.22),inset_0_2px_4px_rgba(255,255,255,1)] flex items-center justify-between select-none">
          
          {/* Tab 1: Hoy (Timeline) */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleViewSelect('today')}
            style={isToday ? { color: 'var(--primary)' } : undefined}
            className={`flex-1 py-1.5 rounded-full flex flex-col items-center justify-center transition-colors ${
              isToday
                ? 'font-bold'
                : 'text-on-surface-variant/70 font-medium'
            }`}
          >
            <LordIcon
              src={LORDICON_ICONS.timeline}
              size={24}
              primaryColor={isToday ? 'var(--primary)' : '#64748b'}
              secondaryColor={isToday ? 'var(--primary)' : '#94a3b8'}
            />
            <span className="text-[10px] mt-0.5 font-bold">Hoy</span>
          </motion.button>

          {/* Tab 2: Agenda (Calendario) */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleViewSelect('calendar')}
            style={isCalendar ? { color: 'var(--primary)' } : undefined}
            className={`flex-1 py-1.5 rounded-full flex flex-col items-center justify-center transition-colors ${
              isCalendar
                ? 'font-bold'
                : 'text-on-surface-variant/70 font-medium'
            }`}
          >
            <LordIcon
              src={LORDICON_ICONS.calendar}
              size={24}
              primaryColor={isCalendar ? 'var(--primary)' : '#64748b'}
              secondaryColor={isCalendar ? 'var(--primary)' : '#94a3b8'}
            />
            <span className="text-[10px] mt-0.5 font-bold">Agenda</span>
          </motion.button>

          {/* Central 3D Candy ➕ Button (Exact Dead Center) */}
          <div className="px-1 -mt-5">
            <motion.button
              whileTap={{ scale: 0.86, rotate: 90 }}
              onClick={handleCreateClick}
              className="w-14 h-14 rounded-full candy-btn text-white flex items-center justify-center shadow-lg"
              title="Crear Nueva Cita"
            >
              <LordIcon
                src={LORDICON_ICONS.plus}
                size={30}
                primaryColor="#ffffff"
                secondaryColor="#ffffff"
              />
            </motion.button>
          </div>

          {/* Tab 3: Tareas & Hogar & Pastillero */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleViewSelect('tasks')}
            style={isTasks ? { color: 'var(--primary)' } : undefined}
            className={`flex-1 py-1.5 rounded-full flex flex-col items-center justify-center transition-colors ${
              isTasks
                ? 'font-bold'
                : 'text-on-surface-variant/70 font-medium'
            }`}
          >
            <LordIcon
              src={LORDICON_ICONS.checklist}
              size={28}
              primaryColor={isTasks ? 'var(--primary)' : '#64748b'}
              secondaryColor={isTasks ? 'var(--primary)' : '#94a3b8'}
            />
            <span className="text-[10px] mt-0.5 font-bold">Tareas</span>
          </motion.button>

          {/* Tab 4: Recuerdos & Amor */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleViewSelect('memories')}
            style={isMemories ? { color: 'var(--primary)' } : undefined}
            className={`flex-1 py-1.5 rounded-full flex flex-col items-center justify-center relative transition-colors ${
              isMemories
                ? 'font-bold'
                : 'text-on-surface-variant/70 font-medium'
            }`}
          >
            {hasUnreadDedication && (
              <span className="absolute top-1 right-5 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
            <LordIcon
              src={LORDICON_ICONS.heart}
              size={24}
              primaryColor={isMemories ? 'var(--primary)' : '#64748b'}
              secondaryColor={isMemories ? 'var(--primary)' : '#94a3b8'}
            />
            <span className="text-[10px] mt-0.5 font-bold">Amor</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
