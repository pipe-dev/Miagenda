import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventItem, TaskItem, UserProfile } from '../types';
import {
  isEventActiveOnDate,
  getLocalDateStr,
  getMinutesFromDayStart,
  isEventPassed
} from '../services/storageService';
import { hapticService } from '../services/hapticService';
import LordIcon, { LORDICON_ICONS } from './LordIcon';

interface MorningBriefingCardProps {
  events: EventItem[];
  tasks: TaskItem[];
  activeProfile: UserProfile;
  userName: string;
  onOpenNewEvent: () => void;
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

export default function MorningBriefingCard({
  events,
  tasks,
  activeProfile,
  userName,
  onOpenNewEvent
}: MorningBriefingCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const todayStr = getLocalDateStr();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
  const currentMinutesTotal = currentHour * 60 + currentMinutes;

  // Time of day greeting
  let greeting = 'Buenos días';
  if (currentHour >= 12 && currentHour < 19) {
    greeting = 'Buenas tardes';
  } else if (currentHour >= 19 || currentHour < 5) {
    greeting = 'Buenas noches';
  }

  // Filter today's active events sorted by time of day
  const todayEvents = events.filter((e) => isEventActiveOnDate(e, todayStr));
  const sortedEvents = [...todayEvents].sort(
    (a, b) => getMinutesFromDayStart(a.startTime) - getMinutesFromDayStart(b.startTime)
  );

  // Tomorrow's date and first active event
  const tomorrowStr = getLocalDateStr(new Date(Date.now() + 86400000));
  const tomorrowEvents = events
    .filter((e) => isEventActiveOnDate(e, tomorrowStr))
    .sort((a, b) => getMinutesFromDayStart(a.startTime) - getMinutesFromDayStart(b.startTime));
  const firstTomorrowEvent = tomorrowEvents[0];

  // Pending tasks
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Next upcoming event today (strictly not passed yet in human day cycle)
  const nextEvent = sortedEvents.find((e) => !isEventPassed(e, currentTimeStr));

  // Countdown to next event calculation
  let nextEventCountdownStr: string | null = null;
  if (nextEvent) {
    const nextEventMinutes = getMinutesFromDayStart(nextEvent.startTime);
    const diffMins = nextEventMinutes - currentMinutesTotal;
    if (diffMins > 0) {
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      nextEventCountdownStr = h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m} min`;
    } else {
      nextEventCountdownStr = 'en curso ahora';
    }
  }

  // Day progress percentage (from 6:00 AM / 360 min to 11:00 PM / 1380 min)
  const dayStartMin = 360; // 06:00 AM
  const dayEndMin = 1380; // 11:00 PM
  const dayProgressPercent = Math.min(
    100,
    Math.max(0, Math.round(((currentMinutesTotal - dayStartMin) / (dayEndMin - dayStartMin)) * 100))
  );

  // Latest event end time (when user is free)
  const lastEvent = sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1] : null;
  const freeTimeStr = lastEvent?.endTime || lastEvent?.startTime;

  const handleToggle = () => {
    hapticService.playLightTap();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 plush-card rounded-3xl p-4 sm:p-5 border-2 border-white relative overflow-hidden shadow-md group"
    >
      {/* Background Candy Glow Bubble */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-25"
        style={{ backgroundColor: 'var(--primary)' }}
      />

      {/* Header Row - Entire row is clickable */}
      <div
        onClick={handleToggle}
        className="flex items-center justify-between cursor-pointer select-none active:opacity-85 transition-opacity"
      >
        <div className="flex items-center space-x-3">
          {/* Time of day 3D Sphere */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md candy-btn shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <LordIcon
              src={LORDICON_ICONS.sun}
              trigger="loop"
              size={22}
              primaryColor="#ffffff"
              secondaryColor="#ffffff"
            />
          </div>

          <div>
            <span
              className="text-[10px] font-extrabold uppercase tracking-widest text-primary leading-none block mb-0.5"
              style={{ color: 'var(--primary)' }}
            >
              RESUMEN DEL DÍA
            </span>
            <h3 className="font-extrabold text-lg sm:text-xl text-on-surface leading-tight select-none">
              {greeting}, {userName}
            </h3>
          </div>
        </div>

        {/* Collapse / Expand Toggle Icon & Quick Countdown Badge if collapsed */}
        <div className="flex items-center space-x-2">
          {isCollapsed && nextEvent && nextEventCountdownStr && (
            <span className="hidden xs:inline-flex items-center space-x-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/80 border border-white text-primary shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Cita en {nextEventCountdownStr}</span>
            </span>
          )}
          <div className="w-7 h-7 rounded-full bg-white/70 hover:bg-white text-on-surface-variant flex items-center justify-center border border-white shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? 'expand_more' : 'expand_less'}
            </span>
          </div>
        </div>
      </div>

      {/* Briefing Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-3.5 space-y-3"
          >
            {/* Countdown Banner to Next Event (if available) */}
            {nextEvent && nextEventCountdownStr && (
              <div className="bg-white/90 rounded-2xl p-3 border border-primary/20 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl candy-btn text-white flex items-center justify-center shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary block leading-none">
                      {nextEventCountdownStr === 'en curso ahora' ? 'CITA EN CURSO' : `EN ${nextEventCountdownStr.toUpperCase()}`}
                    </span>
                    <p className="font-extrabold text-xs sm:text-sm text-on-surface truncate mt-0.5">
                      {nextEvent.title}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-on-surface-variant bg-white px-2.5 py-1 rounded-full border border-white/80 shadow-2xs shrink-0">
                  {formatTo12H(nextEvent.startTime)}
                </span>
              </div>
            )}

            {/* Quick Metrics Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-white/85 px-3 py-1.5 rounded-2xl border border-white flex items-center space-x-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{ color: 'var(--primary)' }}>
                  event
                </span>
                <span className="text-xs font-extrabold text-on-surface">
                  {todayEvents.length} {todayEvents.length === 1 ? 'Cita hoy' : 'Citas hoy'}
                </span>
              </div>

              <div className="bg-white/85 px-3 py-1.5 rounded-2xl border border-white flex items-center space-x-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  checklist
                </span>
                <span className="text-xs font-extrabold text-on-surface">
                  {pendingTasks.length} {pendingTasks.length === 1 ? 'Pendiente' : 'Pendientes'}
                </span>
              </div>

              {freeTimeStr && todayEvents.length > 0 && (
                <div className="bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200 flex items-center space-x-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    schedule
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    Libre desde las {formatTo12H(freeTimeStr)}
                  </span>
                </div>
              )}
            </div>

            {/* Smart Context Sentence */}
            <div className="bg-white/70 rounded-2xl p-3 border border-white/80 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {nextEvent ? (
                <span>
                  Tu próximo evento es <strong className="text-on-surface">"{nextEvent.title}"</strong> a las{' '}
                  <strong className="text-primary" style={{ color: 'var(--primary)' }}>
                    {formatTo12H(nextEvent.startTime)}
                  </strong>
                  .
                </span>
              ) : firstTomorrowEvent ? (
                <span>
                  🌙 Has completado tus citas de hoy. Mañana tu primer evento es{' '}
                  <strong className="text-on-surface">"{firstTomorrowEvent.title}"</strong> a las{' '}
                  <strong className="text-primary" style={{ color: 'var(--primary)' }}>
                    {formatTo12H(firstTomorrowEvent.startTime)}
                  </strong>
                  . ¡Que descanses!
                </span>
              ) : pendingTasks.length > 0 ? (
                <span>
                  No tienes más citas programadas para hoy. Tienes{' '}
                  <strong className="text-on-surface">{pendingTasks.length} tareas pendientes</strong> por completar a tu ritmo.
                </span>
              ) : (
                <span>
                  ✨ Has terminado tus actividades de hoy y mañana tienes la agenda libre. ¡Disfruta tu descanso!
                </span>
              )}
            </div>

            {/* Barra de Progreso del Día */}
            <div className="bg-white/80 rounded-2xl p-3 border border-white/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-on-surface">
                <span className="flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[14px] text-primary" style={{ color: 'var(--primary)' }}>
                    timelapse
                  </span>
                  <span>Avance de la jornada</span>
                </span>
                <span className="text-primary font-black" style={{ color: 'var(--primary)' }}>
                  {dayProgressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dayProgressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full candy-btn"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
