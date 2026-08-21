import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { downloadIcsFile } from '../services/calendarIcsService';
import {
  isEventActiveOnDate,
  getLocalDateStr,
  getMinutesFromDayStart,
  isEventPassed,
  FreeTimeWindow
} from '../services/storageService';
import { EventItem, PrivacyType, TaskItem, UserProfile } from '../types';
import MorningBriefingCard from './MorningBriefingCard';
import FreeTimeMatcherCard from './FreeTimeMatcherCard';
import CoupleSoftLockGate from './CoupleSoftLockGate';
import { hapticService } from '../services/hapticService';

interface TimelineViewProps {
  events: EventItem[];
  tasks: TaskItem[];
  activeProfile: UserProfile;
  userName: string;
  activeTab: PrivacyType;
  onTabChange?: (tab: PrivacyType) => void;
  onSelectEvent: (event: EventItem) => void;
  onNewEvent: () => void;
  onReorderEvents?: (reorderedEvents: EventItem[]) => void;
  onEditEvent?: (event: EventItem) => void;
  onPlanSharedDate?: (timeWindow: FreeTimeWindow) => void;
}

// 12-hour format parser (09:00 AM, 01:30 PM, 08:00 PM)
const formatTo12H = (time24?: string) => {
  if (!time24) return { hour: '12', minute: '00', period: 'PM' };
  const parts = time24.split(':');
  const h24 = parseInt(parts[0] || '12', 10);
  const minute = parts[1] || '00';
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return {
    hour: h12.toString().padStart(2, '0'),
    minute,
    period
  };
};

export default function TimelineView({
  events,
  tasks,
  activeProfile,
  userName,
  activeTab,
  onTabChange,
  onSelectEvent,
  onNewEvent,
  onReorderEvents,
  onEditEvent,
  onPlanSharedDate
}: TimelineViewProps) {
  const todayStr = getLocalDateStr();

  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Filter events for today including recurring events & active privacy tab
  const todayEvents = events.filter((e) => isEventActiveOnDate(e, todayStr));
  const filteredEvents = todayEvents.filter((event) => {
    if (activeTab === 'mine') return event.privacy === 'mine';
    if (activeTab === 'shared') return event.privacy === 'shared';
    return true;
  });

  // Active / Upcoming events first, past events sent to the bottom
  const activeEventsList = filteredEvents
    .filter((e) => !isEventPassed(e, currentTimeStr))
    .sort((a, b) => getMinutesFromDayStart(a.startTime) - getMinutesFromDayStart(b.startTime));
  const pastEventsList = filteredEvents
    .filter((e) => isEventPassed(e, currentTimeStr))
    .sort((a, b) => getMinutesFromDayStart(a.startTime) - getMinutesFromDayStart(b.startTime));
  const orderedDisplayEvents = [...activeEventsList, ...pastEventsList];

  const handleReorder = (newOrder: EventItem[]) => {
    if (onReorderEvents) {
      // Preserve other events not currently in this view
      const otherEvents = events.filter((e) => !filteredEvents.some((fe) => fe.id === e.id));
      onReorderEvents([...newOrder, ...otherEvents]);
    }
  };

    const timelineContent = (
    <>
      
      
      {/* Drag & Drop Hint */}
      {filteredEvents.length > 1 && (
        <div className="flex items-center justify-center space-x-1 text-[11px] font-bold text-on-surface-variant/70 mb-4 select-none">
          <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
          <span>Arrastra las tarjetas para reordenar tus citas de hoy</span>
        </div>
      )}

      {/* Timeline Container */}
      <div id="tour-today-timeline" className="relative">
        {/* Timeline Vertical Guide Line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-white/30 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)] pointer-events-none" />

        {orderedDisplayEvents.length === 0 ? (
          <div className="plush-card rounded-3xl p-8 text-center my-8 border border-white shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">calendar_today</span>
            </div>
            <h3 className="font-extrabold text-lg text-on-surface mb-1">
              No hay citas programadas para hoy
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              {activeTab === 'shared'
                ? 'Crea una nueva cita compartida para los dos.'
                : 'Añade una cita o tarea privada a tu agenda.'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticService.playPhysicalThud(0.28, 0.18);
                onNewEvent(todayStr);
              }}
              className="px-5 py-2.5 rounded-full text-xs font-extrabold text-white shadow-md select-none candy-btn"
            >
              + Crear Cita para Hoy
            </motion.button>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={orderedDisplayEvents}
            onReorder={handleReorderEvents}
            className="space-y-4 pt-2"
          >
            {orderedDisplayEvents.map((evt) => {
              const isPast = isEventPassed(evt);

              return (
                <Reorder.Item
                  key={evt.id}
                  value={evt}
                  className="touch-none select-none"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`plush-card rounded-3xl p-4 sm:p-5 border-2 border-white relative overflow-hidden transition-all duration-200 ${
                      isPast
                        ? 'opacity-60 saturate-50 bg-white/60'
                        : 'bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {/* Event author / privacy left accent strip */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                        evt.privacy === 'shared'
                          ? 'candy-accent-bicolor'
                          : evt.author === 'partner1'
                          ? 'bg-blue-500'
                          : 'bg-pink-500'
                      }`}
                    />

                    <div className="flex items-start justify-between pl-2">
                      <div className="flex-1 pr-2 min-w-0">
                        {/* Time & Title */}
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-mono">
                            {formatTo12H(evt.startTime)}
                            {evt.endTime ? ` - ${formatTo12H(evt.endTime)}` : ''}
                          </span>
                          {evt.isSurprise && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-300">
                              🎁 Sorpresa
                            </span>
                          )}
                        </div>

                        <h4
                          className={`font-black text-base sm:text-lg text-on-surface leading-snug ${
                            isPast ? 'line-through text-on-surface-variant' : ''
                          }`}
                        >
                          {evt.title}
                        </h4>

                        {evt.description && (
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {onEditEvent && (
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            type="button"
                            onClick={() => onEditEvent(evt)}
                            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-on-surface-variant hover:text-primary flex items-center justify-center border border-slate-100 shadow-xs transition-colors"
                            title="Editar cita"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </motion.button>
                        )}

                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          type="button"
                          onClick={() => handleDownloadIcs(evt)}
                          className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-on-surface-variant hover:text-primary flex items-center justify-center border border-slate-100 shadow-xs transition-colors"
                          title="Sincronizar con Google / Apple Calendar"
                        >
                          <span className="material-symbols-outlined text-[16px]">alarm</span>
                        </motion.button>

                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/40 cursor-grab active:cursor-grabbing hover:text-on-surface"
                          title="Arrastrar para ordenar"
                        >
                          <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Badges */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 pl-2">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white ${
                            evt.privacy === 'shared'
                              ? 'candy-accent-bicolor'
                              : 'bg-primary'
                          }`}
                        >
                          {evt.privacy === 'shared' ? '👥 Compartido' : '🔒 Privado'}
                        </span>

                        {evt.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                            {evt.category}
                          </span>
                        )}

                        {evt.recurrence && evt.recurrence !== 'none' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 flex items-center space-x-0.5">
                            <span className="material-symbols-outlined text-[12px]">repeat</span>
                            <span>
                              {evt.recurrence === 'weekly'
                                ? 'Semanal'
                                : evt.recurrence === 'weekdays'
                                ? 'L-V'
                                : evt.recurrence === 'daily'
                                ? 'Diario'
                                : Array.isArray(evt.repeatDays)
                                ? evt.repeatDays
                                    .map((d) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d])
                                    .join(', ')
                                : 'Personalizado'}
                            </span>
                          </span>
                        )}

                        {isPast && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center space-x-1">
                            <span className="material-symbols-outlined text-[12px]">done_all</span>
                            <span>Concluido</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>
    </>
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-32 pt-2">
      {/* 🌟 1. Smart Card: Morning Briefing (Mi Agenda) vs Free Time Matcher (Compartido) */}
      <div id="tour-morning-banner">
        {activeTab === 'mine' ? (
          <MorningBriefingCard
            events={events}
            tasks={tasks}
            activeProfile={activeProfile}
            userName={userName}
            onOpenNewEvent={onNewEvent}
          />
        ) : (
          <FreeTimeMatcherCard
            events={events}
            dateStr={todayStr}
            onPlanSharedDate={onPlanSharedDate || (() => onNewEvent())}
          />
        )}
      </div>

      {/* 🌟 2. Privacy Switch (Mi Agenda vs Compartido) */}
      <div id="tour-privacy-toggle" className="flex justify-center items-center mb-6">
        <div className="sunken-well bg-white/70 p-1.5 rounded-full flex items-center space-x-1 border border-white/60 shadow-inner">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => onTabChange && onTabChange('mine')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors relative select-none ${
              activeTab === 'mine'
                ? 'text-white'
                : 'text-on-surface-variant active:text-primary'
            }`}
          >
            {activeTab === 'mine' && (
              <motion.div
                layoutId="timeline-active-pill"
                className="absolute inset-0 rounded-full candy-btn"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="relative z-10">Mi Agenda</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => onTabChange && onTabChange('shared')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors relative select-none ${
              activeTab === 'shared'
                ? 'text-white'
                : 'text-on-surface-variant active:text-primary'
            }`}
          >
            {activeTab === 'shared' && (
              <motion.div
                layoutId="timeline-active-pill"
                className="absolute inset-0 rounded-full candy-accent-bicolor"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="relative z-10">Compartido</span>
          </motion.button>
        </div>
      </div>

      {/* 🌟 2.1 Contenido de Timeline (con Bloqueo Suave en Compartido) */}
      {activeTab === 'shared' ? (
        <CoupleSoftLockGate
          featureTitle="Agenda Compartida de Pareja"
          featureDescription="Para coordinar citas juntos, ver tiempos libres y sincronizarse en tiempo real, conecta a tu pareja primero."
        >
          {timelineContent}
        </CoupleSoftLockGate>
      ) : (
        timelineContent
      )}
    </div>
  );
}
