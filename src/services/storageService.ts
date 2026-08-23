import { EventItem, DedicationItem, TaskItem, SharedGroceryItem, CoupleMoodStatus, LoveCoupon, MedicationItem, ProfileConfig, UserProfile } from '../types';
import {
  syncEventToCloud,
  deleteEventFromCloud,
  syncTaskToCloud,
  deleteTaskFromCloud,
  syncGroceryToCloud,
  deleteGroceryFromCloud,
  syncDedicationToCloud,
  deleteDedicationFromCloud,
  syncLoveCouponToCloud,
  deleteLoveCouponFromCloud,
  syncMedicationToCloud,
  deleteMedicationFromCloud,
  syncCoupleMoodToCloud,
  syncProfileConfigToCloud
} from './firestoreSync';

const STORAGE_KEYS = {
  EVENTS: 'daily_delight_events_v2',
  DEDICATIONS: 'daily_delight_dedications_v2',
  ACTIVE_PROFILE: 'daily_delight_active_profile_v2',
  TASKS: 'daily_delight_tasks_v2',
  SHARED_GROCERIES: 'daily_delight_shared_groceries_v2',
  COUPLE_MOODS: 'daily_delight_couple_moods_v2',
  LOVE_COUPONS: 'daily_delight_love_coupons_v2',
  MEDICATIONS: 'daily_delight_medications_v2',
};

export const getLocalDateStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMinutesFromDayStart = (timeStr: string): number => {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  const totalMins = (h || 0) * 60 + (m || 0);
  // Human day cycle starts at 05:00 AM (300 mins) and runs through late night until 04:59 AM
  if (totalMins >= 300) {
    return totalMins - 300;
  } else {
    return totalMins + 1440 - 300;
  }
};

export const isEventPassed = (event: EventItem, currentTimeStr?: string): boolean => {
  if (!currentTimeStr) {
    const now = new Date();
    currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
  const eventEndTime = event.endTime || event.startTime;
  return getMinutesFromDayStart(eventEndTime) < getMinutesFromDayStart(currentTimeStr);
};

// Initial default seed arrays (100% limpios listos para datos reales)
const DEFAULT_EVENTS: EventItem[] = [];
const DEFAULT_DEDICATIONS: DedicationItem[] = [];
const DEFAULT_TASKS: TaskItem[] = [];

export const getEvents = (): EventItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_EVENTS;
  } catch (e) {
    console.error('Error reading events from storage', e);
    return DEFAULT_EVENTS;
  }
};

export const saveEvent = (eventData: Partial<EventItem> & { title: string }): EventItem[] => {
  const events = getEvents();
  const coupleLinked = isCoupleLinked();
  const effectivePrivacy: PrivacyType = coupleLinked ? (eventData.privacy || 'mine') : 'mine';

  let updatedEvents: EventItem[];
  let savedItem: EventItem;
  if (eventData.id) {
    updatedEvents = events.map(e =>
      e.id === eventData.id
        ? ({ ...e, ...eventData, privacy: coupleLinked ? (eventData.privacy || e.privacy) : 'mine' } as EventItem)
        : e
    );
    savedItem = updatedEvents.find(e => e.id === eventData.id)!;
  } else {
    const newEvent: EventItem = {
      id: 'evt-' + Date.now(),
      title: eventData.title,
      description: eventData.description || '',
      date: eventData.date || new Date().toISOString().split('T')[0],
      startTime: eventData.startTime || '10:00',
      endTime: eventData.endTime || '11:00',
      privacy: effectivePrivacy,
      category: eventData.category || 'date',
      author: (eventData.author === 'partner2' || (eventData.author as any) === 'ella') ? 'partner2' : 'partner1',
      hasAlarm: eventData.hasAlarm ?? true,
      hasVoiceNote: eventData.hasVoiceNote ?? false,
      createdAt: new Date().toISOString()
    };
    updatedEvents = [newEvent, ...events];
    savedItem = newEvent;
  }
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
  if (savedItem) {
    syncEventToCloud(savedItem);
  }
  return updatedEvents;
};

export const deleteEvent = (id: string): EventItem[] => {
  const events = getEvents();
  const updatedEvents = events.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
  deleteEventFromCloud(id);
  return updatedEvents;
};

export const resetDefaultEvents = (): EventItem[] => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
  return [];
};

export const resetAppToCleanSlate = () => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.DEDICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SHARED_GROCERIES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.LOVE_COUPONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.COUPLE_MOODS, JSON.stringify(DEFAULT_COUPLE_MOODS));
  localStorage.setItem(PROFILE_CONFIG_KEY, JSON.stringify({
    partner1Name: 'Tú',
    partner2Name: 'Pareja',
    activeProfile: 'partner1',
    isSetupComplete: false
  }));
};

export const reorderEvents = (reorderedEvents: EventItem[]): EventItem[] => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(reorderedEvents));
  return reorderedEvents;
};

// Dedications methods
export const getDedications = (): DedicationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEDICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEDICATIONS, JSON.stringify(DEFAULT_DEDICATIONS));
      return DEFAULT_DEDICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_DEDICATIONS;
  } catch (e) {
    console.error('Error reading dedications', e);
    return DEFAULT_DEDICATIONS;
  }
};

export const saveDedication = (dedicationData: Omit<DedicationItem, 'id' | 'createdAt' | 'readBy'>): DedicationItem[] => {
  const dedications = getDedications();
  const newDedication: DedicationItem = {
    ...dedicationData,
    id: 'ded-' + Date.now(),
    createdAt: new Date().toISOString(),
    readBy: []
  };
  const updated = [newDedication, ...dedications];
  localStorage.setItem(STORAGE_KEYS.DEDICATIONS, JSON.stringify(updated));
  syncDedicationToCloud(newDedication);
  return updated;
};

export const deleteDedication = (id: string): DedicationItem[] => {
  const dedications = getDedications();
  const updated = dedications.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.DEDICATIONS, JSON.stringify(updated));
  deleteDedicationFromCloud(id);
  return updated;
};

export const markDedicationAsRead = (dedicationId: string, userProfile: UserProfile): DedicationItem[] => {
  const dedications = getDedications();
  let updatedItem: DedicationItem | null = null;
  const updated = dedications.map(d => {
    if (d.id === dedicationId) {
      const readList = d.readBy || [];
      if (!readList.includes(userProfile)) {
        updatedItem = { ...d, readBy: [...readList, userProfile] };
        return updatedItem;
      }
    }
    return d;
  });
  localStorage.setItem(STORAGE_KEYS.DEDICATIONS, JSON.stringify(updated));
  if (updatedItem) {
    syncDedicationToCloud(updatedItem);
  }
  return updated;
};

// Check for unread surprise dedication for active profile
export const getPendingSurprise = (activeProfile: UserProfile): DedicationItem | undefined => {
  const dedications = getDedications();
  return dedications.find(d => 
    (d.to === activeProfile || d.to === 'both') && 
    !(d.readBy && d.readBy.includes(activeProfile))
  );
};

// Active Profile ("partner1" or "partner2")
export const getActiveProfile = (): UserProfile => {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
  if (raw === 'partner2' || raw === 'ella') return 'partner2';
  return 'partner1';
};

export const setActiveProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, profile);
};

// Couple ID & Multi-space Management
const COUPLE_ID_KEY = 'daily_delight_couple_id_v1';

export const generateCoupleId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AMOR-${rand}`;
};

export const getCoupleId = (): string => {
  try {
    let id = localStorage.getItem(COUPLE_ID_KEY);
    if (!id) {
      id = generateCoupleId();
      localStorage.setItem(COUPLE_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return 'AMOR-1001';
  }
};

export const saveCoupleId = (coupleId: string) => {
  localStorage.setItem(COUPLE_ID_KEY, coupleId.trim().toUpperCase());
};

// Profile Configuration (Names and setup status)
const PROFILE_CONFIG_KEY = 'daily_delight_profile_config_v1';

export const getProfileConfig = (): ProfileConfig => {
  try {
    const raw = localStorage.getItem(PROFILE_CONFIG_KEY);
    const coupleId = getCoupleId();
    if (raw) {
      const parsed = JSON.parse(raw);
      const p1 = parsed.partner1Name || (parsed.maleName && parsed.maleName !== 'Él' && parsed.maleName !== 'Dani' ? parsed.maleName : '') || 'Tú';
      const p2 = parsed.partner2Name || (parsed.femaleName && parsed.femaleName !== 'Ella' ? parsed.femaleName : '') || 'Pareja';
      const rawActive = parsed.activeProfile || getActiveProfile();
      const active: UserProfile = (rawActive === 'partner2' || rawActive === 'ella') ? 'partner2' : 'partner1';
      return {
        partner1Name: p1,
        partner2Name: p2,
        partner1Color: parsed.partner1Color || 'blue',
        partner2Color: parsed.partner2Color || 'pink',
        activeProfile: active,
        isSetupComplete: Boolean(parsed.isSetupComplete || (p1 && p1 !== 'Tú') || (p2 && p2 !== 'Pareja')),
        coupleId: parsed.coupleId || coupleId,
        wakeTime: parsed.wakeTime || '07:00',
        wakeTimeWeekdays: parsed.wakeTimeWeekdays || parsed.wakeTime || '07:00',
        wakeTimeWeekend: parsed.wakeTimeWeekend || '09:00',
        sleepTime: parsed.sleepTime || '23:00',
        briefingTime: parsed.briefingTime || '08:00',
        enableBedtimeReminder: parsed.enableBedtimeReminder !== undefined ? Boolean(parsed.enableBedtimeReminder) : true,
        enableWakeAlarm: parsed.enableWakeAlarm !== undefined ? Boolean(parsed.enableWakeAlarm) : true
      };
    }
  } catch (e) {
    console.error('Error reading profile config', e);
  }
  return {
    partner1Name: 'Tú',
    partner2Name: 'Pareja',
    partner1Color: 'blue',
    partner2Color: 'pink',
    activeProfile: getActiveProfile(),
    isSetupComplete: false,
    coupleId: getCoupleId(),
    wakeTime: '07:00',
    wakeTimeWeekdays: '07:00',
    wakeTimeWeekend: '09:00',
    sleepTime: '23:00',
    briefingTime: '08:00',
    enableBedtimeReminder: true,
    enableWakeAlarm: true
  };
};

export const saveProfileConfig = (config: Partial<ProfileConfig> & { activeProfile?: UserProfile; isSetupComplete?: boolean }) => {
  const current = getProfileConfig();
  const p1 = config.partner1Name || current.partner1Name || 'Tú';
  const p2 = config.partner2Name || current.partner2Name || 'Pareja';
  const p1Color = config.partner1Color || current.partner1Color || 'blue';
  const p2Color = config.partner2Color || current.partner2Color || 'pink';
  const cId = config.coupleId || current.coupleId || getCoupleId();
  saveCoupleId(cId);

  const fullConfig: ProfileConfig = {
    partner1Name: p1,
    partner2Name: p2,
    partner1Color: p1Color,
    partner2Color: p2Color,
    activeProfile: config.activeProfile || current.activeProfile,
    isSetupComplete: config.isSetupComplete !== undefined ? config.isSetupComplete : current.isSetupComplete,
    coupleId: cId,
    wakeTime: config.wakeTime || current.wakeTime || '07:00',
    wakeTimeWeekdays: config.wakeTimeWeekdays || current.wakeTimeWeekdays || config.wakeTime || '07:00',
    wakeTimeWeekend: config.wakeTimeWeekend || current.wakeTimeWeekend || '09:00',
    sleepTime: config.sleepTime || current.sleepTime || '23:00',
    briefingTime: config.briefingTime || current.briefingTime || '08:00',
    enableBedtimeReminder: config.enableBedtimeReminder !== undefined ? config.enableBedtimeReminder : current.enableBedtimeReminder,
    enableWakeAlarm: config.enableWakeAlarm !== undefined ? config.enableWakeAlarm : current.enableWakeAlarm
  };
  localStorage.setItem(PROFILE_CONFIG_KEY, JSON.stringify(fullConfig));
  if (config.activeProfile) {
    setActiveProfile(config.activeProfile);
  }
  if (fullConfig.isSetupComplete) {
    syncProfileConfigToCloud(fullConfig);
  }
};

// Helper: Get user's personal daily schedule (evaluating weekday vs weekend)
export const getUserSchedule = (): {
  wakeTime: string;
  wakeTimeWeekdays: string;
  wakeTimeWeekend: string;
  sleepTime: string;
  briefingTime: string;
  enableBedtimeReminder: boolean;
  enableWakeAlarm: boolean;
  isWeekend: boolean;
} => {
  const config = getProfileConfig();
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const effectiveWakeTime = isWeekend
    ? (config.wakeTimeWeekend || '09:00')
    : (config.wakeTimeWeekdays || config.wakeTime || '07:00');

  return {
    wakeTime: effectiveWakeTime,
    wakeTimeWeekdays: config.wakeTimeWeekdays || config.wakeTime || '07:00',
    wakeTimeWeekend: config.wakeTimeWeekend || '09:00',
    sleepTime: config.sleepTime || '23:00',
    briefingTime: config.briefingTime || '08:00',
    enableBedtimeReminder: config.enableBedtimeReminder ?? true,
    enableWakeAlarm: config.enableWakeAlarm ?? true,
    isWeekend
  };
};

// Helper: Save user's personal daily schedule
export const saveUserSchedule = (schedule: Partial<ProfileConfig>) => {
  const current = getProfileConfig();
  saveProfileConfig({
    ...current,
    ...schedule
  });
};

// Helper: Get the profile color ('blue' | 'pink')
export const getUserProfileColor = (profile: UserProfile): 'blue' | 'pink' => {
  const config = getProfileConfig();
  if (profile === 'partner1') return config.partner1Color || 'blue';
  return config.partner2Color || 'pink';
};

// Helper: Get the display name of the current user
export const getUserDisplayName = (profile: UserProfile): string => {
  const config = getProfileConfig();
  if (profile === 'partner1') return config.partner1Name || 'Tú';
  return config.partner2Name || 'Pareja';
};

// Helper: Get the partner's display name
export const getPartnerDisplayName = (profile: UserProfile): string => {
  const config = getProfileConfig();
  if (profile === 'partner1') {
    return config.partner2Name || 'Pareja';
  } else {
    return config.partner1Name || 'Tú';
  }
};

// ==========================================
// 💑 COUPLE SPACE UNLOCK STATE (SOFT-LOCK)
// ==========================================
export const isCoupleLinked = (): boolean => {
  const config = getProfileConfig();
  const otherPartner = config.activeProfile === 'partner1' ? config.partner2Name : config.partner1Name;
  return Boolean(
    otherPartner &&
    otherPartner !== 'Pareja' &&
    otherPartner !== 'Tú' &&
    otherPartner.trim().length > 0
  );
};

export const isCoupleSpaceUnlocked = (): boolean => {
  return isCoupleLinked();
};

// ==========================================
// TASKS METHODS (To-Do List & Checklist)
// ==========================================
export const getAllTasks = (): TaskItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TASKS;
  } catch (e) {
    console.error('Error reading tasks', e);
    return DEFAULT_TASKS;
  }
};

export const getTasks = (profile: UserProfile): TaskItem[] => {
  const all = getAllTasks();
  return all.filter(t => t.author === profile);
};

export const saveTask = (taskData: Partial<TaskItem> & { title: string; author: UserProfile }): TaskItem[] => {
  const all = getAllTasks();
  let updated: TaskItem[];
  let savedTask: TaskItem;
  if (taskData.id) {
    updated = all.map(t => t.id === taskData.id ? { ...t, ...taskData } as TaskItem : t);
    savedTask = updated.find(t => t.id === taskData.id)!;
  } else {
    const newTask: TaskItem = {
      id: 'tsk-' + Date.now(),
      title: taskData.title.trim(),
      completed: false,
      priority: taskData.priority || 'normal',
      category: taskData.category || 'general',
      author: taskData.author,
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString()
    };
    updated = [newTask, ...all];
    savedTask = newTask;
  }
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  if (savedTask) syncTaskToCloud(savedTask);
  return updated.filter(t => t.author === taskData.author);
};

export const toggleTask = (id: string, profile: UserProfile): TaskItem[] => {
  const all = getAllTasks();
  let toggledItem: TaskItem | null = null;
  const updated = all.map(t => {
    if (t.id === id) {
      const isCompleted = !t.completed;
      toggledItem = {
        ...t,
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined
      };
      return toggledItem;
    }
    return t;
  });
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  if (toggledItem) syncTaskToCloud(toggledItem);
  return updated.filter(t => t.author === profile);
};

export const deleteTask = (id: string, profile: UserProfile): TaskItem[] => {
  const all = getAllTasks();
  const updated = all.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  deleteTaskFromCloud(id);
  return updated.filter(t => t.author === profile);
};

export const reorderTasks = (reorderedProfileTasks: TaskItem[], profile: UserProfile): TaskItem[] => {
  const all = getAllTasks();
  const otherTasks = all.filter(t => t.author !== profile);
  const combined = [...reorderedProfileTasks, ...otherTasks];
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(combined));
  return reorderedProfileTasks;
};

export const clearCompletedTasks = (profile: UserProfile): TaskItem[] => {
  const all = getAllTasks();
  const removed = all.filter(t => t.author === profile && t.completed);
  const updated = all.filter(t => !(t.author === profile && t.completed));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  removed.forEach(t => deleteTaskFromCloud(t.id));
  return updated.filter(t => t.author === profile);
};

// ==========================================
// RECURRENCE & EVENT DATE RESOLVER
// ==========================================
export const isEventActiveOnDate = (event: EventItem, targetDateStr: string): boolean => {
  if (event.date === targetDateStr) return true;
  if (!event.recurrence || event.recurrence === 'none') return false;

  // Do not recur before the original event start date
  if (targetDateStr < event.date) return false;

  const targetDate = new Date(targetDateStr + 'T00:00:00');
  const originalDate = new Date(event.date + 'T00:00:00');
  const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (event.recurrence === 'daily') {
    return true;
  }

  if (event.recurrence === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (event.recurrence === 'weekly') {
    return dayOfWeek === originalDate.getDay();
  }

  if (event.recurrence === 'custom' && Array.isArray(event.repeatDays)) {
    return event.repeatDays.includes(dayOfWeek);
  }

  return false;
};

export const getEventsForDate = (events: EventItem[], targetDateStr: string): EventItem[] => {
  return events.filter(evt => isEventActiveOnDate(evt, targetDateStr));
};

// ==========================================
// SHARED GROCERIES & HOME CHECKLIST
// ==========================================
const DEFAULT_SHARED_GROCERIES: SharedGroceryItem[] = [];

export const getSharedGroceries = (): SharedGroceryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHARED_GROCERIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHARED_GROCERIES, JSON.stringify(DEFAULT_SHARED_GROCERIES));
      return DEFAULT_SHARED_GROCERIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SHARED_GROCERIES;
  } catch (e) {
    console.error('Error reading shared groceries', e);
    return DEFAULT_SHARED_GROCERIES;
  }
};

export const saveSharedGrocery = (
  itemData: Partial<SharedGroceryItem> & { title: string; addedBy: UserProfile }
): SharedGroceryItem[] => {
  const all = getSharedGroceries();
  let updated: SharedGroceryItem[];
  let savedItem: SharedGroceryItem;
  if (itemData.id) {
    updated = all.map(g => g.id === itemData.id ? { ...g, ...itemData } as SharedGroceryItem : g);
    savedItem = updated.find(g => g.id === itemData.id)!;
  } else {
    const newItem: SharedGroceryItem = {
      id: 'gro-' + Date.now(),
      title: itemData.title.trim(),
      completed: false,
      category: itemData.category || 'groceries',
      addedBy: itemData.addedBy,
      createdAt: new Date().toISOString()
    };
    updated = [newItem, ...all];
    savedItem = newItem;
  }
  localStorage.setItem(STORAGE_KEYS.SHARED_GROCERIES, JSON.stringify(updated));
  if (savedItem) syncGroceryToCloud(savedItem);
  return updated;
};

export const toggleSharedGrocery = (id: string): SharedGroceryItem[] => {
  const all = getSharedGroceries();
  let toggledItem: SharedGroceryItem | null = null;
  const updated = all.map(g => {
    if (g.id === id) {
      const isCompleted = !g.completed;
      toggledItem = {
        ...g,
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined
      };
      return toggledItem;
    }
    return g;
  });
  localStorage.setItem(STORAGE_KEYS.SHARED_GROCERIES, JSON.stringify(updated));
  if (toggledItem) syncGroceryToCloud(toggledItem);
  return updated;
};

export const deleteSharedGrocery = (id: string): SharedGroceryItem[] => {
  const all = getSharedGroceries();
  const updated = all.filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEYS.SHARED_GROCERIES, JSON.stringify(updated));
  deleteGroceryFromCloud(id);
  return updated;
};

export const clearCompletedSharedGroceries = (): SharedGroceryItem[] => {
  const all = getSharedGroceries();
  const removed = all.filter(g => g.completed);
  const updated = all.filter(g => !g.completed);
  localStorage.setItem(STORAGE_KEYS.SHARED_GROCERIES, JSON.stringify(updated));
  removed.forEach(g => deleteGroceryFromCloud(g.id));
  return updated;
};

// ==========================================
// FREE TIME MATCHER (DETECTAR TIEMPO LIBRE JUNTOS)
// ==========================================
export interface FreeTimeWindow {
  start: string; // HH:mm
  end: string;   // HH:mm
  durationMinutes: number;
}

const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const findSharedFreeWindows = (events: EventItem[], targetDateStr: string): FreeTimeWindow[] => {
  // 1. Get all active events for both profiles on target date
  const activeEvents = events.filter(e => isEventActiveOnDate(e, targetDateStr));

  // 2. Active daytime bounds: 08:30 (510 min) to 22:30 (1350 min)
  const DAY_START = 510;  // 08:30 AM
  const DAY_END = 1350;   // 10:30 PM

  // 3. Extract busy intervals in minutes
  const busyIntervals: [number, number][] = activeEvents.map(evt => {
    const start = timeToMinutes(evt.startTime);
    let end = evt.endTime ? timeToMinutes(evt.endTime) : start + 60;
    if (end <= start) end = start + 60;
    return [Math.max(DAY_START, start), Math.min(DAY_END, end)];
  });

  // Sort by start time
  busyIntervals.sort((a, b) => a[0] - b[0]);

  // 4. Merge overlapping busy intervals
  const mergedBusy: [number, number][] = [];
  for (const interval of busyIntervals) {
    if (mergedBusy.length === 0) {
      mergedBusy.push(interval);
    } else {
      const last = mergedBusy[mergedBusy.length - 1];
      if (interval[0] <= last[1]) {
        last[1] = Math.max(last[1], interval[1]);
      } else {
        mergedBusy.push(interval);
      }
    }
  }

  // 5. Invert busy intervals to find free intervals >= 45 min
  const freeWindows: FreeTimeWindow[] = [];
  let currentPointer = DAY_START;

  for (const [busyStart, busyEnd] of mergedBusy) {
    if (busyStart > currentPointer) {
      const gap = busyStart - currentPointer;
      if (gap >= 45) {
        freeWindows.push({
          start: minutesToTime(currentPointer),
          end: minutesToTime(busyStart),
          durationMinutes: gap
        });
      }
    }
    currentPointer = Math.max(currentPointer, busyEnd);
  }

  if (DAY_END > currentPointer) {
    const gap = DAY_END - currentPointer;
    if (gap >= 45) {
      freeWindows.push({
        start: minutesToTime(currentPointer),
        end: minutesToTime(DAY_END),
        durationMinutes: gap
      });
    }
  }

  return freeWindows;
};

// ==========================================
// COUPLE MOOD & INTIMACY STATUS
// ==========================================
const DEFAULT_COUPLE_MOODS: Record<UserProfile, CoupleMoodStatus> = {
  partner1: {
    profile: 'partner1',
    battery: 0,
    need: 'cuddle',
    note: '',
    updatedAt: new Date().toISOString(),
    isConfigured: false
  },
  partner2: {
    profile: 'partner2',
    battery: 0,
    need: 'cuddle',
    note: '',
    updatedAt: new Date().toISOString(),
    isConfigured: false
  }
};

const normalizeBattery = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return Math.min(100, Math.max(0, Math.round(val)));
  if (val === 'high') return 90;
  if (val === 'normal') return 60;
  if (val === 'low') return 25;
  return 0;
};

export const getCoupleMoods = (): Record<UserProfile, CoupleMoodStatus> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPLE_MOODS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPLE_MOODS, JSON.stringify(DEFAULT_COUPLE_MOODS));
      return DEFAULT_COUPLE_MOODS;
    }
    const parsed = JSON.parse(raw) || {};
    const p1 = parsed?.partner1 || parsed?.dani || {};
    const p2 = parsed?.partner2 || parsed?.ella || {};
    const p1Battery = normalizeBattery(p1?.battery);
    const p2Battery = normalizeBattery(p2?.battery);
    return {
      partner1: {
        profile: 'partner1',
        battery: p1Battery,
        need: p1?.need || 'cuddle',
        note: p1?.note || '',
        updatedAt: p1?.updatedAt || new Date().toISOString(),
        isConfigured: p1?.isConfigured ?? (p1Battery > 0)
      },
      partner2: {
        profile: 'partner2',
        battery: p2Battery,
        need: p2?.need || 'cuddle',
        note: p2?.note || '',
        updatedAt: p2?.updatedAt || new Date().toISOString(),
        isConfigured: p2?.isConfigured ?? (p2Battery > 0)
      }
    };
  } catch (e) {
    console.error('Error reading couple moods', e);
    return DEFAULT_COUPLE_MOODS;
  }
};

export const saveCoupleMood = (status: CoupleMoodStatus): Record<UserProfile, CoupleMoodStatus> => {
  const current = getCoupleMoods();
  const batteryVal = normalizeBattery(status.battery);
  const updatedMood: CoupleMoodStatus = {
    ...status,
    battery: batteryVal,
    updatedAt: new Date().toISOString(),
    isConfigured: batteryVal > 0
  };
  const updated: Record<UserProfile, CoupleMoodStatus> = {
    ...current,
    [status.profile]: updatedMood
  };
  localStorage.setItem(STORAGE_KEYS.COUPLE_MOODS, JSON.stringify(updated));
  if (updatedMood.isConfigured && updatedMood.battery > 0) {
    syncCoupleMoodToCloud(updatedMood);
  }
  return updated;
};

// ==========================================
// 🎟️ CUPONES DE AMOR CANJEABLES (GIFT CARDS)
// ==========================================

export const DEFAULT_LOVE_COUPONS: LoveCoupon[] = [];

export const getLoveCoupons = (): LoveCoupon[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOVE_COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOVE_COUPONS, JSON.stringify(DEFAULT_LOVE_COUPONS));
      return DEFAULT_LOVE_COUPONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_LOVE_COUPONS;
  } catch (e) {
    console.error('Error reading love coupons', e);
    return DEFAULT_LOVE_COUPONS;
  }
};

export const saveLoveCoupon = (couponData: Omit<LoveCoupon, 'id' | 'createdAt' | 'redeemed'>): LoveCoupon[] => {
  const coupons = getLoveCoupons();
  const newCoupon: LoveCoupon = {
    ...couponData,
    id: 'coupon-' + Date.now(),
    redeemed: false,
    createdAt: new Date().toISOString()
  };
  const updated = [newCoupon, ...coupons];
  localStorage.setItem(STORAGE_KEYS.LOVE_COUPONS, JSON.stringify(updated));
  syncLoveCouponToCloud(newCoupon);
  return updated;
};

export const redeemLoveCoupon = (id: string): LoveCoupon[] => {
  const coupons = getLoveCoupons();
  let redeemedItem: LoveCoupon | null = null;
  const updated = coupons.map(c => {
    if (c.id === id) {
      redeemedItem = {
        ...c,
        redeemed: true,
        redeemedAt: new Date().toISOString()
      };
      return redeemedItem;
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.LOVE_COUPONS, JSON.stringify(updated));
  if (redeemedItem) syncLoveCouponToCloud(redeemedItem);
  return updated;
};

export const unredeemLoveCoupon = (id: string): LoveCoupon[] => {
  const coupons = getLoveCoupons();
  let unredeemedItem: LoveCoupon | null = null;
  const updated = coupons.map(c => {
    if (c.id === id) {
      unredeemedItem = {
        ...c,
        redeemed: false,
        redeemedAt: undefined
      };
      return unredeemedItem;
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.LOVE_COUPONS, JSON.stringify(updated));
  if (unredeemedItem) syncLoveCouponToCloud(unredeemedItem);
  return updated;
};

export const deleteLoveCoupon = (id: string): LoveCoupon[] => {
  const coupons = getLoveCoupons();
  const updated = coupons.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.LOVE_COUPONS, JSON.stringify(updated));
  deleteLoveCouponFromCloud(id);
  return updated;
};

// =========================================================================
// 🔋 AUTO-PROMPT DE ENERGÍA (30 MINUTOS TRAS TERMINAR LA AGENDA DEL DÍA)
// =========================================================================
export const checkShouldAutoPromptMood = (
  events: EventItem[],
  activeProfile: UserProfile
): boolean => {
  const todayStr = getLocalDateStr();
  const promptKey = `daily_delight_mood_prompted_${activeProfile}_${todayStr}`;
  if (localStorage.getItem(promptKey)) {
    return false;
  }

  // Filtrar eventos de hoy correspondientes al usuario (personales o compartidos)
  const todayEvents = events.filter(
    (e) => isEventActiveOnDate(e, todayStr) && (e.privacy === 'shared' || e.author === activeProfile)
  );

  if (todayEvents.length === 0) {
    return false;
  }

  // Encontrar la hora de finalización más tardía del día
  let latestEndMins = 0;
  for (const evt of todayEvents) {
    const endStr = evt.endTime || evt.startTime;
    const mins = getMinutesFromDayStart(endStr);
    if (mins > latestEndMins) {
      latestEndMins = mins;
    }
  }

  // Exactamente 30 minutos después de que termine la última cita
  const triggerMins = latestEndMins + 30;

  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const nowMins = getMinutesFromDayStart(currentTimeStr);

  return nowMins >= triggerMins;
};

export const markMoodPromptedForToday = (activeProfile: UserProfile) => {
  const todayStr = getLocalDateStr();
  const promptKey = `daily_delight_mood_prompted_${activeProfile}_${todayStr}`;
  localStorage.setItem(promptKey, 'true');
};

// ==========================================
// MEDICATIONS METHODS (Pastillero Compartido)
// ==========================================
const DEFAULT_MEDICATIONS: MedicationItem[] = [];

export const getMedications = (): MedicationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(DEFAULT_MEDICATIONS));
      return DEFAULT_MEDICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_MEDICATIONS;
  } catch (e) {
    console.error('Error reading medications:', e);
    return DEFAULT_MEDICATIONS;
  }
};

export const getMedicationsForUser = (user: UserProfile | 'both'): MedicationItem[] => {
  const all = getMedications();
  if (user === 'both') {
    return all.filter(m => m.forUser === 'both');
  }
  return all.filter(m => m.forUser === user || m.forUser === 'both');
};

export const saveMedication = (medData: Partial<MedicationItem> & { name: string; author: UserProfile }): MedicationItem[] => {
  const all = getMedications();
  let updated: MedicationItem[];
  let savedMed: MedicationItem;

  if (medData.id) {
    updated = all.map(m => m.id === medData.id ? { ...m, ...medData } as MedicationItem : m);
    savedMed = updated.find(m => m.id === medData.id)!;
  } else {
    const newMed: MedicationItem = {
      id: 'med-' + Date.now(),
      name: medData.name.trim(),
      dosage: medData.dosage?.trim() || '1 dosis',
      forUser: medData.forUser || 'both',
      frequency: medData.frequency || 'daily',
      times: medData.times && medData.times.length > 0 ? medData.times : ['08:00'],
      instructions: medData.instructions?.trim(),
      startDate: medData.startDate || getLocalDateStr(),
      endDate: medData.endDate,
      isContinuous: medData.isContinuous ?? true,
      hasAlarm: medData.hasAlarm ?? true,
      color: medData.color || (medData.forUser === 'partner2' || (medData.forUser as any) === 'ella' ? 'pink' : medData.forUser === 'partner1' || (medData.forUser as any) === 'dani' ? 'blue' : 'emerald'),
      takenHistory: medData.takenHistory || [],
      createdAt: new Date().toISOString(),
      author: medData.author
    };
    updated = [newMed, ...all];
    savedMed = newMed;
  }

  localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updated));
  syncMedicationToCloud(savedMed);
  return updated;
};

export const deleteMedication = (id: string): MedicationItem[] => {
  const all = getMedications();
  const updated = all.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updated));
  deleteMedicationFromCloud(id);
  return updated;
};

export const isMedicationTakenOnDate = (med: MedicationItem, dateStr: string = getLocalDateStr()): boolean => {
  if (!med.takenHistory || !Array.isArray(med.takenHistory)) return false;
  return med.takenHistory.some(d => d.startsWith(dateStr));
};

export const toggleMedicationTaken = (id: string, dateStr: string = getLocalDateStr()): MedicationItem[] => {
  const all = getMedications();
  let updatedMed: MedicationItem | null = null;

  const updated = all.map(m => {
    if (m.id === id) {
      const history = Array.isArray(m.takenHistory) ? [...m.takenHistory] : [];
      const isTaken = history.some(d => d.startsWith(dateStr));
      let newHistory: string[];

      if (isTaken) {
        // Desmarcar (quitar fecha de hoy)
        newHistory = history.filter(d => !d.startsWith(dateStr));
      } else {
        // Marcar como tomada hoy con timestamp
        newHistory = [...history, new Date().toISOString()];
      }

      const mod = { ...m, takenHistory: newHistory };
      updatedMed = mod;
      return mod;
    }
    return m;
  });

  localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updated));
  if (updatedMed) {
    syncMedicationToCloud(updatedMed);
  }
  return updated;
};



