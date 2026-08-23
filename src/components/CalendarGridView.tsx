import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { isEventActiveOnDate } from '../services/storageService';
import { EventItem, PrivacyType } from '../types';
import { hapticService } from '../services/hapticService';
import WeeklyTimeBalanceCard from './WeeklyTimeBalanceCard';
import CoupleSoftLockGate from './CoupleSoftLockGate';

interface CalendarGridViewProps {
  events: EventItem[];
  activeTab: PrivacyType;
  onSelectEvent: (event: EventItem) => void;
  onNewEvent: (dateStr: string) => void;
  onMoveEventDate?: (eventId: string, targetDateStr: string) => void;
  onEditEvent?: (event: EventItem) => void;
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

export default function CalendarGridView({
  events,
  activeTab,
  onSelectEvent,
  onNewEvent,
  onMoveEventDate,
  onEditEvent
}: CalendarGridViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);

  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  // Filter events based on active privacy tab: 'mine' vs 'shared'
  const filteredEvents = events.filter(event => {
    if (activeTab === 'mine') return event.privacy === 'mine';
    if (activeTab === 'shared') return event.privacy === 'shared';
    return true;
  });

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingEventId(eventId);
  };

  const handleDragEnd = () => {
    setDraggingEventId(null);
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain') || draggingEventId;
    if (eventId && onMoveEventDate) {
      onMoveEventDate(eventId, targetDateStr);
    }
    setDraggingEventId(null);
    setDragOverDate(null);
  };

    const calendarContent = (
    <>
      {/* 📊 Balance de Tiempo Semanal */}
      <div id="tour-cal-view-selector"><WeeklyTimeBalanceCard
        weekDays={weekDays}
        events={filteredEvents}
        activeTab={activeTab}
      /></div>

      {/* Drag & Drop Hint */}
      <div className="flex items-center justify-center space-x-1 text-[11px] font-bold text-on-surface-variant/70 mb-4 select-none">
        <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
        <span>Arrastra cualquier evento de un día a otro para reprogramarlo</span>
      </div>

      {/* Week Days List - Clean Minimalist with Full Drag & Drop Support */}
      <div id="tour-cal-grid" className="space-y-3.5">
        {weekDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = filteredEvents.filter((e) => isEventActiveOnDate(e, dateStr));
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const isDropTarget = dragOverDate === dateStr;

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDate(dateStr);
              }}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={(e) => handleDrop(e, dateStr)}
              className={`plush-card rounded-3xl p-4 border-2 transition-all duration-200 ${
                isDropTarget
                  ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg ring-2 ring-primary/20'
                  : isToday
                  ? 'border-primary/40 bg-white/90 shadow-md'
                  : 'border-white bg-white/70 shadow-xs hover:bg-white/90'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs ${
                      isToday
                        ? 'candy-btn text-white shadow-sm'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs sm:text-sm text-on-surface uppercase tracking-wide">
                      {format(day, 'EEEE', { locale: es })}
                    </span>
                    {isToday && (
                      <span className="ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Hoy
                      </span>
                    )}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  type="button"
                  onClick={() => {
                    hapticService.playLightTap();
                    onNewEvent(dateStr);
                  }}
                  className="w-7 h-7 rounded-full bg-white hover:bg-slate-50 text-primary flex items-center justify-center border border-slate-200 shadow-xs"
                  title="Añadir evento a este día"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </motion.button>
              </div>

              {/* Day Events List */}
              {dayEvents.length === 0 ? (
                <div
                  onClick={() => onNewEvent(dateStr)}
                  className="py-3 px-2 rounded-2xl border-2 border-dashed border-slate-200/80 text-center cursor-pointer hover:border-primary/40 hover:bg-white/50 transition-colors"
                >
                  <span className="text-xs font-bold text-on-surface-variant/60 flex items-center justify-center space-x-1">
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Añadir evento</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, evt.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        hapticService.playLightTap();
                        if (onEditEvent) onEditEvent(evt);
                        else onSelectEvent(evt);
                      }}
                      className={`p-3 rounded-2xl border border-white flex items-center justify-between cursor-pointer transition-all hover:shadow-sm ${
                        evt.privacy === 'shared'
                          ? 'bg-gradient-to-r from-pink-50/70 to-cyan-50/70'
                          : 'bg-white/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <span className="text-xs font-mono font-bold text-on-surface-variant shrink-0">
                          {formatTo12H(evt.startTime)}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-on-surface truncate">
                          {evt.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white ${
                            evt.privacy === 'shared' ? 'candy-accent-bicolor' : 'bg-primary'
                          }`}
                        >
                          {evt.privacy === 'shared' ? '👥' : '🔒'}
                        </span>
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40">
                          drag_indicator
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-32 pt-2">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span
            className="text-[11px] font-extrabold uppercase tracking-widest text-primary transition-colors duration-200"
            style={{ color: 'var(--primary)' }}
          >
            Vista Semanal
          </span>
          <h2 className="font-extrabold text-2xl text-on-surface tracking-tight select-none">
            {format(startDate, 'MMMM yyyy', { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
          </h2>
        </div>

        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-full border border-surface-variant shadow-sm">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              hapticService.playLightTap();
              setSelectedDate(addDays(selectedDate, -7));
            }}
            className="w-8 h-8 rounded-full text-on-surface-variant active:bg-surface-container flex items-center justify-center select-none"
            title="Semana anterior"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              hapticService.playLightTap();
              setSelectedDate(new Date());
            }}
            className="px-3 py-1 rounded-full text-xs font-bold text-primary active:bg-primary/10 select-none transition-colors duration-200"
            style={{ color: 'var(--primary)' }}
          >
            Hoy
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              hapticService.playLightTap();
              setSelectedDate(addDays(selectedDate, 7));
            }}
            className="w-8 h-8 rounded-full text-on-surface-variant active:bg-surface-container flex items-center justify-center select-none"
            title="Semana siguiente"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </motion.button>
        </div>
      </div>

      {/* 🌟 Enlace de Compartir con Pareja (con Bloqueo Suave en Compartido) */}
      {activeTab === 'shared' ? (
        <CoupleSoftLockGate
          featureTitle="Calendario Semanal Compartido"
          featureDescription="Para planificar juntos citas, fines de semana y ver los eventos sincronizados en tiempo real, conecta a tu pareja primero."
        >
          {calendarContent}
        </CoupleSoftLockGate>
      ) : (
        calendarContent
      )}
    </div>
  );
}
