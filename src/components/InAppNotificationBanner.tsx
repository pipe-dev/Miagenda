import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticService } from '../services/hapticService';
import { audioService } from '../services/audioService';

interface InAppReminderDetail {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export default function InAppNotificationBanner({
  onNavigate
}: {
  onNavigate?: (view: 'today' | 'calendar' | 'tasks' | 'memories') => void;
}) {
  const [activeNotification, setActiveNotification] = useState<InAppReminderDetail | null>(null);

  useEffect(() => {
    const handleReminder = (e: any) => {
      const detail = e.detail as InAppReminderDetail;
      if (detail && detail.title) {
        setActiveNotification(detail);
        hapticService.playSuccess();
        audioService.playCompletionChime();
      }
    };

    window.addEventListener('in_app_reminder', handleReminder);
    return () => window.removeEventListener('in_app_reminder', handleReminder);
  }, []);

  // Auto-dismiss after 6.5 seconds
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  if (!activeNotification) return null;

  const handleClickAction = () => {
    hapticService.playLightTap();
    const url = activeNotification.url || '';
    if (onNavigate) {
      if (url.includes('view=calendar')) onNavigate('calendar');
      else if (url.includes('view=tasks')) onNavigate('tasks');
      else if (url.includes('view=memories')) onNavigate('memories');
      else onNavigate('today');
    }
    setActiveNotification(null);
  };

  return (
    <div className="fixed top-2.5 left-0 right-0 z-[100] flex justify-center px-3.5 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -45, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.y < -20) {
              hapticService.playLightTap();
              setActiveNotification(null);
            }
          }}
          className="pointer-events-auto w-full max-w-md bg-slate-900/95 text-white rounded-3xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.15)] backdrop-blur-xl border border-white/20 flex items-center justify-between gap-3 cursor-pointer select-none"
          onClick={handleClickAction}
        >
          {/* Left Icon with Ripple */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[22px] animate-bounce">
              notifications_active
            </span>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-black text-white tracking-tight truncate flex items-center gap-1.5">
              <span>{activeNotification.title}</span>
            </h4>
            <p className="text-[11px] text-slate-300 font-medium line-clamp-2 leading-tight mt-0.5">
              {activeNotification.body}
            </p>
          </div>

          {/* Action / Dismiss Button */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                hapticService.playLightTap();
                setActiveNotification(null);
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
