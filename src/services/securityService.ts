export const cleanUndefined = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as any;
  }
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = cleanUndefined(value);
    }
  }
  return clean;
};

import { getLocalDateStr } from './storageService';
/**
 * S.H.I.E.L.D. Security & Input Sanitization Service
 * - Input Sanitization (XSS, Script injection prevention)
 * - Schema & Boundary Validation
 * - Sensitive Data Filtering (DTO Response Validation)
 * - Rate Limiting & Debounce helpers
 */

// 1. Sanitize string inputs: escape HTML, strip tags, trim whitespace, limit max length
export const sanitizeString = (input: string | null | undefined, maxLength = 500): string => {
  if (typeof input !== 'string') return '';
  
  // Strip tags and escape dangerous entities
  let clean = input
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case "'": return '&#39;';
        case '"': return '&quot;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim();

  // Enforce max length boundary
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  return clean;
};

// 2. Safe Number & Percentage Sanitizer
export const sanitizeBattery = (val: any): number => {
  const parsed = typeof val === 'number' ? val : parseInt(String(val), 10);
  if (isNaN(parsed)) return 0;
  return Math.min(100, Math.max(0, Math.round(parsed)));
};

// 3. Validate and Sanitize Event Item before Cloud Write
export const sanitizeEventPayload = (event: any): any => {
  return cleanUndefined({
    id: sanitizeString(event.id || 'evt-' + Date.now(), 64),
    title: sanitizeString(event.title || '', 120),
    description: sanitizeString(event.description || '', 500),
    date: sanitizeString(event.date || getLocalDateStr(), 20),
    startTime: sanitizeString(event.startTime || '10:00', 10),
    endTime: sanitizeString(event.endTime || '11:00', 10),
    privacy: event.privacy === 'mine' ? 'mine' : 'shared',
    category: ['date', 'work', 'reminder', 'special'].includes(event.category) ? event.category : 'date',
    author: (event.author === 'partner2' || event.author === 'ella') ? 'partner2' : 'partner1',
    hasAlarm: Boolean(event.hasAlarm),
    hasVoiceNote: Boolean(event.hasVoiceNote),
    recurrence: ['none', 'daily', 'weekly', 'weekdays', 'custom'].includes(event.recurrence) ? event.recurrence : 'none',
    repeatDays: Array.isArray(event.repeatDays) ? event.repeatDays.filter((d: any) => typeof d === 'number' && d >= 0 && d <= 6) : undefined,
    createdAt: sanitizeString(event.createdAt || new Date().toISOString(), 35),
    location: event.location ? sanitizeString(event.location, 100) : undefined
  });
};

// 4. Validate and Sanitize Task Item
export const sanitizeTaskPayload = (task: any): any => {
  return cleanUndefined({
    id: sanitizeString(task.id || 'tsk-' + Date.now(), 64),
    title: sanitizeString(task.title || '', 150),
    completed: Boolean(task.completed),
    priority: ['urgent', 'low', 'normal'].includes(task.priority) ? task.priority : 'normal',
    category: ['general', 'work', 'home', 'errand'].includes(task.category) ? task.category : 'general',
    author: (task.author === 'partner2' || task.author === 'ella') ? 'partner2' : 'partner1',
    dueDate: task.dueDate ? sanitizeString(task.dueDate, 20) : undefined,
    createdAt: sanitizeString(task.createdAt || new Date().toISOString(), 35),
    completedAt: task.completedAt ? sanitizeString(task.completedAt, 35) : undefined
  });
};

// 5. Validate and Sanitize Grocery Item
export const sanitizeGroceryPayload = (grocery: any): any => {
  return cleanUndefined({
    id: sanitizeString(grocery.id || 'gro-' + Date.now(), 64),
    title: sanitizeString(grocery.title || '', 120),
    completed: Boolean(grocery.completed),
    category: ['groceries', 'pharmacy', 'home', 'bills'].includes(grocery.category) ? grocery.category : 'groceries',
    addedBy: (grocery.addedBy === 'partner2' || grocery.addedBy === 'ella') ? 'partner2' : 'partner1',
    createdAt: sanitizeString(grocery.createdAt || new Date().toISOString(), 35),
    completedAt: grocery.completedAt ? sanitizeString(grocery.completedAt, 35) : undefined
  });
};

// 6. Validate and Sanitize Dedication Item
export const sanitizeDedicationPayload = (ded: any): any => {
  const sanitizeTo = (val: any) => {
    if (val === 'partner1' || val === 'dani') return 'partner1';
    if (val === 'partner2' || val === 'ella') return 'partner2';
    return 'both';
  };

  return cleanUndefined({
    id: sanitizeString(ded.id || 'ded-' + Date.now(), 64),
    from: (ded.from === 'partner2' || ded.from === 'ella') ? 'partner2' : 'partner1',
    to: sanitizeTo(ded.to),
    authorName: sanitizeString(ded.authorName || '', 60),
    note: sanitizeString(ded.note || '', 1000),
    photoUrl: typeof ded.photoUrl === 'string' && (ded.photoUrl.startsWith('data:image/') || ded.photoUrl.startsWith('https://')) ? ded.photoUrl : null,
    audioUrl: typeof ded.audioUrl === 'string' && (ded.audioUrl.startsWith('data:audio/') || ded.audioUrl.startsWith('https://')) ? ded.audioUrl : null,
    createdAt: sanitizeString(ded.createdAt || new Date().toISOString(), 35),
    readBy: Array.isArray(ded.readBy) ? ded.readBy.map((p: any) => (p === 'partner2' || p === 'ella') ? 'partner2' : 'partner1') : [],
    triggerDate: ded.triggerDate ? sanitizeString(ded.triggerDate, 20) : undefined
  });
};

// 7. Validate and Sanitize Love Coupon
export const sanitizeCouponPayload = (coupon: any): any => {
  return cleanUndefined({
    id: sanitizeString(coupon.id || 'cpn-' + Date.now(), 64),
    title: sanitizeString(coupon.title || '', 100),
    description: sanitizeString(coupon.description || '', 300),
    icon: sanitizeString(coupon.icon || 'card_giftcard', 30),
    from: (coupon.from === 'partner2' || coupon.from === 'ella') ? 'partner2' : 'partner1',
    to: (coupon.to === 'partner2' || coupon.to === 'ella') ? 'partner2' : 'partner1',
    redeemed: Boolean(coupon.redeemed),
    redeemedAt: coupon.redeemedAt ? sanitizeString(coupon.redeemedAt, 35) : undefined,
    createdAt: sanitizeString(coupon.createdAt || new Date().toISOString(), 35)
  });
};

// 8. Validate and Sanitize Medication Item
export const sanitizeMedicationPayload = (med: any): any => {
  const sanitizeForUser = (val: any) => {
    if (val === 'partner1' || val === 'dani') return 'partner1';
    if (val === 'partner2' || val === 'ella') return 'partner2';
    return 'both';
  };

  return cleanUndefined({
    id: sanitizeString(med.id || 'med-' + Date.now(), 64),
    name: sanitizeString(med.name || '', 120),
    dosage: sanitizeString(med.dosage || '1 tableta', 60),
    forUser: sanitizeForUser(med.forUser),
    frequency: ['daily', 'interval', 'as_needed', 'specific_days'].includes(med.frequency) ? med.frequency : 'daily',
    times: Array.isArray(med.times) ? med.times.map((t: any) => sanitizeString(t, 10)).filter(Boolean) : ['08:00'],
    instructions: med.instructions ? sanitizeString(med.instructions, 300) : undefined,
    startDate: med.startDate ? sanitizeString(med.startDate, 20) : undefined,
    endDate: med.endDate ? sanitizeString(med.endDate, 20) : undefined,
    isContinuous: Boolean(med.isContinuous),
    hasAlarm: Boolean(med.hasAlarm),
    takenHistory: Array.isArray(med.takenHistory) ? med.takenHistory.map((d: any) => sanitizeString(d, 35)) : [],
    color: ['blue', 'pink', 'emerald', 'purple', 'amber'].includes(med.color) ? med.color : 'blue',
    createdAt: sanitizeString(med.createdAt || new Date().toISOString(), 35),
    author: (med.author === 'partner2' || med.author === 'ella') ? 'partner2' : 'partner1'
  });
};

// 9. Rate Limiter (Token bucket / throttle for client-side cloud actions)
const writeTimestamps: number[] = [];
const MAX_WRITES_PER_MINUTE = 60; // Max 60 mutations per minute to prevent abuse

export const isWriteRateLimited = (): boolean => {
  const now = Date.now();
  // Filter timestamps within last 60s
  const recent = writeTimestamps.filter(t => now - t < 60000);
  writeTimestamps.length = 0;
  writeTimestamps.push(...recent);

  if (writeTimestamps.length >= MAX_WRITES_PER_MINUTE) {
    console.warn('[SECURITY RATE LIMIT] Demasiadas operaciones simultáneas. Protegiendo la base de datos.');
    return true;
  }

  writeTimestamps.push(now);
  return false;
};
