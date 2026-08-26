import {
  getEvents,
  getMedications,
  getTasks,
  getLocalDateStr,
  isEventActiveOnDate,
  getActiveProfile,
  getUserSchedule
} from './storageService';
import { notificationService } from './notificationService';
import { EventItem, MedicationItem } from '../types';

const NOTIFIED_CACHE_PREFIX = 'daily_delight_notified_';

// 12-hour formatter for notification text
const formatTime12H = (time24?: string): string => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${m} ${period}`;
};

class NotificationScheduler {
  private timerId: any = null;
  private isRunning: boolean = false;

  // Start background monitoring loop
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run initial check immediately
    this.checkScheduledReminders();

    // Check every 30 seconds
    this.timerId = setInterval(() => {
      this.checkScheduledReminders();
    }, 30000);
  }

  // Stop loop
  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  // Main check routine
  public checkScheduledReminders(): void {
    if (!notificationService.isEnabled()) {
      return;
    }

    const now = new Date();
    const todayStr = getLocalDateStr(now);
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHours * 60 + currentMinutes;
    const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

    const cacheKey = NOTIFIED_CACHE_PREFIX + todayStr;
    let notifiedSet = new Set<string>();
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) notifiedSet = new Set(JSON.parse(raw));
    } catch (e) {}

    const markNotified = (id: string) => {
      notifiedSet.add(id);
      localStorage.setItem(cacheKey, JSON.stringify(Array.from(notifiedSet)));
    };

    // 1. ⏰ CHECK UPCOMING EVENTS (15 min reminder and on-time alert)
    const events = getEvents();
    const todayEvents = events.filter((e) => isEventActiveOnDate(e, todayStr));

    todayEvents.forEach((event: EventItem) => {
      if (event.hasAlarm === false || !event.startTime) return;

      const [eh, em] = event.startTime.split(':').map(Number);
      const eventTimeMinutes = (eh || 0) * 60 + (em || 0);
      const diffMinutes = eventTimeMinutes - currentTimeMinutes;

      // 15 minutes before event
      const notif15Key = `evt_15m_${event.id}`;
      if (diffMinutes >= 14 && diffMinutes <= 16 && !notifiedSet.has(notif15Key)) {
        markNotified(notif15Key);
        notificationService.sendNotification({
          title: `⏰ Cita en 15 min: ${event.title}`,
          body: `Comienza a las ${formatTime12H(event.startTime)} ${event.description ? '• ' + event.description : ''}`,
          url: '/?view=today',
          tag: notif15Key
        });
      }

      // Exactly at event start time
      const notifStartKey = `evt_start_${event.id}`;
      if (diffMinutes >= 0 && diffMinutes <= 1 && !notifiedSet.has(notifStartKey)) {
        markNotified(notifStartKey);
        notificationService.sendNotification({
          title: `✨ ¡Es hora de tu cita! ${event.title}`,
          body: `Programada para las ${formatTime12H(event.startTime)}`,
          url: '/?view=today',
          tag: notifStartKey
        });
      }
    });

    // 2. 💊 CHECK MEDICATIONS & PILL REMINDERS (Active profile & shared)
    const activeProfile = getActiveProfile();
    const medications = getMedications().filter((m: MedicationItem) => 
      !m.forUser || m.forUser === 'both' || m.forUser === activeProfile || m.author === activeProfile
    );

    medications.forEach((med: MedicationItem) => {
      const times = med.times || [med.time || '08:00'];
      times.forEach((tStr, idx) => {
        const notifMedKey = `med_${med.id}_${idx}_${tStr}`;
        if (tStr === currentTimeStr && !notifiedSet.has(notifMedKey)) {
          markNotified(notifMedKey);
          notificationService.sendNotification({
            title: `💊 Hora de tu Medicamento`,
            body: `Es momento de tomar ${med.name}${med.dosage ? ' (' + med.dosage + ')' : ''}.`,
            url: '/?view=tasks',
            tag: notifMedKey
          });
        }
      });
    });

    // 3. ☀️ MORNING BRIEFING REMINDER (At user's configured briefingTime)
    const schedule = getUserSchedule();
    const briefingTime = schedule.briefingTime || '08:00';
    const morningKey = `morning_briefing_${todayStr}`;
    if (currentTimeStr === briefingTime && !notifiedSet.has(morningKey)) {
      markNotified(morningKey);
      const todayTasks = getTasks(activeProfile).filter(t => !t.completed);
      notificationService.sendNotification({
        title: '☀️ ¡Buenos días!',
        body: `Tienes ${todayEvents.length} cita(s) y ${todayTasks.length} tarea(s) pendientes para hoy.`,
        url: '/?view=today',
        tag: morningKey
      });
    }

    // 4. 🌙 BEDTIME PREPARATION REMINDER (1 hour before sleepTime)
    if (schedule.enableBedtimeReminder) {
      const [sleepH, sleepM] = (schedule.sleepTime || '23:00').split(':').map(Number);
      let prepH = (sleepH || 23) - 1;
      if (prepH < 0) prepH += 24;
      const prepTimeStr = `${prepH.toString().padStart(2, '0')}:${(sleepM || 0).toString().padStart(2, '0')}`;

      const bedtimeKey = `bedtime_prep_${todayStr}`;
      if (currentTimeStr === prepTimeStr && !notifiedSet.has(bedtimeKey)) {
        markNotified(bedtimeKey);
        notificationService.sendNotification({
          title: '🌙 Hora de prepararse para descansar',
          body: `Falta 1 hora para tu hora de dormir (${formatTime12H(schedule.sleepTime)}). ¡Desconéctate y relájate!`,
          url: '/?view=today',
          tag: bedtimeKey
        });
      }
    }

    // 5. ⏰ WAKE-UP ALARM (At today's effective wakeTime weekdays vs weekend)
    if (schedule.enableWakeAlarm) {
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const effectiveWakeTime = isWeekend 
        ? (schedule.wakeTimeWeekend || '09:00') 
        : (schedule.wakeTimeWeekdays || schedule.wakeTime || '07:00');

      const wakeKey = `wake_alarm_${todayStr}`;
      if (currentTimeStr === effectiveWakeTime && !notifiedSet.has(wakeKey)) {
        markNotified(wakeKey);
        const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const dayName = dayNames[now.getDay()] || 'hoy';
        notificationService.sendNotification({
          title: '⏰ ¡Hora de levantarse! ☀️',
          body: `¡Feliz ${dayName}! Es momento de iniciar tu jornada con toda la energía.`,
          url: '/?view=today',
          tag: wakeKey
        });
      }
    }
  }
}

export const notificationScheduler = new NotificationScheduler();
