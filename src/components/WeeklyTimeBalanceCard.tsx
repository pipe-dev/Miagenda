import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EventItem, PrivacyType } from '../types';
import { isEventActiveOnDate } from '../services/storageService';
import { hapticService } from '../services/hapticService';

interface WeeklyTimeBalanceCardProps {
  weekDays: Date[];
  events: EventItem[];
  activeTab: PrivacyType;
}

interface CategoryStats {
  id: string;
  name: string;
  icon: string;
  hours: number;
  percentage: number;
  barColor: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
}

const timeToMinutes = (timeStr: string): number => {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export default function WeeklyTimeBalanceCard({
  weekDays,
  events,
  activeTab
}: WeeklyTimeBalanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute total hours per category for the 7 days of this active week
  let workHours = 0;
  let healthHours = 0;
  let errandHours = 0;
  let leisureHours = 0;

  weekDays.forEach((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter((e) => isEventActiveOnDate(e, dayStr));

    dayEvents.forEach((evt) => {
      const start = timeToMinutes(evt.startTime);
      let end = evt.endTime ? timeToMinutes(evt.endTime) : start + 60;
      if (end <= start) end = start + 60;
      const duration = (end - start) / 60;

      const titleLower = (evt.title || '').toLowerCase();
      const isHealth =
        titleLower.includes('gym') ||
        titleLower.includes('gimnasio') ||
        titleLower.includes('entreno') ||
        titleLower.includes('ejercicio') ||
        titleLower.includes('yoga') ||
        titleLower.includes('correr') ||
        titleLower.includes('deporte') ||
        titleLower.includes('nataci');

      if (evt.category === 'work') {
        workHours += duration;
      } else if (isHealth) {
        healthHours += duration;
      } else if (evt.category === 'reminder') {
        errandHours += duration;
      } else {
        // 'date' or 'special' or general personal free time
        leisureHours += duration;
      }
    });
  });

  const totalHours = workHours + healthHours + errandHours + leisureHours;

  const categories: CategoryStats[] = [
    {
      id: 'work',
      name: 'Trabajo & Proyectos',
      icon: '💼',
      hours: workHours,
      percentage: totalHours > 0 ? Math.round((workHours / totalHours) * 100) : 0,
      barColor: 'bg-cyan-600',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-900',
      borderColor: 'border-cyan-200'
    },
    {
      id: 'health',
      name: 'Salud & Ejercicio',
      icon: '🏋️',
      hours: healthHours,
      percentage: totalHours > 0 ? Math.round((healthHours / totalHours) * 100) : 0,
      barColor: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'errands',
      name: 'Diligencias & Hogar',
      icon: '📋',
      hours: errandHours,
      percentage: totalHours > 0 ? Math.round((errandHours / totalHours) * 100) : 0,
      barColor: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-900',
      borderColor: 'border-amber-200'
    },
    {
      id: 'leisure',
      name: activeTab === 'shared' ? 'Citas & Pareja' : 'Tiempo Libre & Ocio',
      icon: activeTab === 'shared' ? '💖' : '✨',
      hours: leisureHours,
      percentage: totalHours > 0 ? Math.round((leisureHours / totalHours) * 100) : 0,
      barColor: 'bg-pink-500',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-900',
      borderColor: 'border-pink-200'
    }
  ];

  // Workload and balance analysis
  const workPercentage = totalHours > 0 ? (workHours / totalHours) * 100 : 0;
  const isOverloaded = workPercentage >= 60 || workHours >= 35;
  const isHealthyBalance = totalHours > 0 && !isOverloaded && leisureHours + healthHours >= 3;

  const weekRangeLabel = `${format(weekDays[0], 'd MMM', { locale: es })} - ${format(
    weekDays[6],
    'd MMM',
    { locale: es }
  )}`;

  return (
    <div className="plush-card rounded-3xl p-4 sm:p-5 border-2 border-white mb-6 shadow-sm overflow-hidden select-none bg-white/90">
      {/* Header Row */}
      <div
        onClick={() => {
          hapticService.playLightTap();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl candy-accent-bicolor text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[22px]">insights</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary block leading-none">
                ESTADÍSTICAS ({weekRangeLabel})
              </span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-on-surface leading-tight mt-0.5">
              Balance de Tiempo Semanal
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-surface-container text-on-surface border border-surface-variant shadow-2xs">
            {totalHours.toFixed(1)}h total
          </span>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-7 h-7 rounded-full bg-white text-on-surface-variant flex items-center justify-center shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </motion.div>
        </div>
      </div>

      {/* Expandable Content Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {totalHours > 0 ? (
              <div className="pt-4 space-y-4">
                {/* Multi-Segment Distribution Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <span>Distribución de horas</span>
                    <span>100% de la semana</span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/60 p-0.5 space-x-0.5">
                    {categories.map((cat) => {
                      if (cat.percentage === 0) return null;
                      return (
                        <motion.div
                          key={cat.id}
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`h-full rounded-full ${cat.barColor}`}
                          title={`${cat.name}: ${cat.hours.toFixed(1)}h (${cat.percentage}%)`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 4 Category Pill Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-2.5 rounded-2xl border ${cat.bgLight} ${cat.borderColor} flex flex-col justify-between`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-base">{cat.icon}</span>
                        <span className={`text-[10px] font-black uppercase tracking-tight truncate ${cat.textColor}`}>
                          {cat.name.split(' ')[0]}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="font-extrabold text-xs sm:text-sm text-on-surface">
                          {cat.hours.toFixed(1)}h
                        </span>
                        <span className="text-[10px] font-black text-on-surface-variant">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Smart Advice Banner */}
                {isOverloaded ? (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center space-x-2.5 shadow-2xs">
                    <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">
                      warning
                    </span>
                    <p className="text-[11px] font-bold text-amber-900 leading-tight">
                      Semana con alta carga laboral ({workPercentage.toFixed(0)}%). Recuerda programar bloques de pausa y descanso.
                    </p>
                  </div>
                ) : isHealthyBalance ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center space-x-2.5 shadow-2xs">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                      check_circle
                    </span>
                    <p className="text-[11px] font-bold text-emerald-900 leading-tight">
                      ¡Excelente balance! Tienes un balance saludable entre compromisos, salud y tiempo libre.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              /* No events scheduled this week */
              <div className="pt-4 text-center py-2">
                <p className="text-xs font-semibold text-on-surface-variant">
                  No hay eventos con horario programados para esta semana.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
