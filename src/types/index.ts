// Type definitions for Daily Delight PWA

export type UserProfile = 'partner1' | 'partner2';

export type PrivacyType = 'mine' | 'shared';

export type NavView = 'today' | 'calendar' | 'tasks' | 'memories' | 'settings';

export type EventCategory = 'date' | 'work' | 'reminder' | 'special';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'weekdays' | 'custom';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'normal' | 'urgent' | 'low';
  category?: 'general' | 'work' | 'home' | 'errand';
  author: UserProfile; // 'partner1' | 'partner2'
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  privacy: PrivacyType;
  category?: EventCategory;
  author: UserProfile;
  hasAlarm?: boolean;
  hasVoiceNote?: boolean;
  recurrence?: RecurrenceType;
  repeatDays?: number[]; // [0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat]
  createdAt: string;
  updatedAt?: string;
  sequence?: number;
  location?: string;
}

export interface DedicationItem {
  id: string;
  from: UserProfile;
  to: UserProfile | 'both';
  authorName?: string;
  note: string;
  photoUrl?: string | null;
  audioUrl?: string | null;
  createdAt: string;
  readBy?: UserProfile[];
  triggerDate?: string;
}

export interface ProfileConfig {
  partner1Name: string;
  partner2Name: string;
  partner1Color?: 'blue' | 'pink';
  partner2Color?: 'blue' | 'pink';
  partner1PhotoUrl?: string;
  partner2PhotoUrl?: string;
  maleName?: string;
  femaleName?: string;
  activeProfile: UserProfile;
  isSetupComplete: boolean;
  coupleId?: string;
  wakeTime?: string; // Fallback
  wakeTimeWeekdays?: string; // Lunes a Viernes (HH:mm)
  wakeTimeWeekend?: string; // Sábado y Domingo (HH:mm)
  sleepTime?: string; // Hora de acostarse (HH:mm)
  briefingTime?: string; // Hora del resumen matutino (HH:mm)
  enableBedtimeReminder?: boolean; // Aviso 1h antes de dormir
  enableWakeAlarm?: boolean; // Alarma al despertar
  connectedSince?: string; // Fecha de conexion de la pareja (ISO string)
}

export interface SharedGroceryItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'groceries' | 'pharmacy' | 'home' | 'bills';
  addedBy: UserProfile;
  createdAt: string;
  completedAt?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string; // e.g. "1 tableta", "10 ml"
  forUser: UserProfile | 'both'; // Para él, para ella, o botiquín común
  frequency: 'daily' | 'interval' | 'as_needed' | 'specific_days';
  times: string[]; // ["08:00", "14:00", "20:00"]
  instructions?: string; // e.g. "Tomar después de comer"
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isContinuous?: boolean; // Diario / indefinido
  hasAlarm?: boolean;
  takenHistory?: string[]; // Fechas ISO o strings "YYYY-MM-DD" en que se tomó
  color?: 'blue' | 'pink' | 'emerald' | 'purple' | 'amber';
  createdAt: string;
  author: UserProfile;
}

export type CoupleMoodNeed =
  | 'intimacy'      // 🔥 Intimidad & Pasión
  | 'cuddle'        // 🧸 Ternura & Apapacho
  | 'touch'         // 🫂 Contacto físico & Abrazos
  | 'talk'          // 💬 Charla & Desahogo
  | 'space'         // 🌿 Espacio & Calma
  | 'chill'         // 🍿 Plan chill & Pelis
  | 'hangout';      // 🎉 Salir y despejarnos

export interface CoupleMoodStatus {
  profile: UserProfile; // 'partner1' | 'partner2'
  battery: number; // 0 to 100 % (0 = Sin configurar)
  need: CoupleMoodNeed;
  note?: string;
  updatedAt: string;
  isConfigured?: boolean;
}

export type CouponTier = 'dorada' | 'platino' | 'suprema' | 'rosa' | 'bicolor';

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  icon: string;
  from: UserProfile;
  to: UserProfile;
  redeemed: boolean;
  redeemedAt?: string;
  createdAt: string;
  tier: CouponTier;
  customNote?: string;
}
