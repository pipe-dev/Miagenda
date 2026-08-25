import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  Unsubscribe
} from 'firebase/firestore';
import { getFirebaseServices, ensureAnonymousAuth } from './firebase';
import { getCoupleId } from './storageService';
import { mutationQueue } from './mutationQueue';
import {
  cleanUndefined,
  sanitizeEventPayload,
  sanitizeTaskPayload,
  sanitizeGroceryPayload,
  sanitizeDedicationPayload,
  sanitizeCouponPayload,
  sanitizeMedicationPayload,
  sanitizeBattery,
  isWriteRateLimited
} from './securityService';
import {
  EventItem,
  TaskItem,
  SharedGroceryItem,
  DedicationItem,
  LoveCoupon,
  CoupleMoodStatus,
  UserProfile,
  ProfileConfig,
  MedicationItem
} from '../types';

// Helper to get active couple space path
const getSpaceId = () => getCoupleId();

// ==========================================
// REAL-TIME SUBSCRIBERS (LISTENERS EN VIVO)
// ==========================================

export const subscribeToCloudEvents = (
  onData: (events: EventItem[]) => void
): Unsubscribe | null => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    const spaceId = getSpaceId();
    const q = query(collection(db, 'couples', spaceId, 'events'));
    return onSnapshot(
      q,
      (snapshot) => {
        const events: EventItem[] = [];
        snapshot.forEach((doc) => {
          const raw = doc.data();
          if (raw && raw.id) {
            events.push(sanitizeEventPayload(raw));
          }
        });
        onData(events);
      },
      (error) => {
        console.warn('Firestore events listener error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up events subscription:', e);
    return null;
  }
};

export const subscribeToCloudTasks = (
  onData: (tasks: TaskItem[]) => void
): Unsubscribe | null => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    const spaceId = getSpaceId();
    const q = query(collection(db, 'couples', spaceId, 'tasks'));
    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: TaskItem[] = [];
        snapshot.forEach((doc) => {
          const raw = doc.data();
          if (raw && raw.id) {
            tasks.push(sanitizeTaskPayload(raw));
          }
        });
        onData(tasks);
      },
      (error) => {
        console.warn('Firestore tasks listener error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up tasks subscription:', e);
    return null;
  }
};

export const subscribeToCloudGroceries = (
  onData: (groceries: SharedGroceryItem[]) => void
): Unsubscribe | null => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    const spaceId = getSpaceId();
    const q = query(collection(db, 'couples', spaceId, 'groceries'));
    return onSnapshot(
      q,
      (snapshot) => {
        const groceries: SharedGroceryItem[] = [];
        snapshot.forEach((doc) => {
          const raw = doc.data();
          if (raw && raw.id) {
            groceries.push(sanitizeGroceryPayload(raw));
          }
        });
        onData(groceries);
      },
      (error) => {
        console.warn('Firestore groceries listener error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up groceries subscription:', e);
    return null;
  }
};

export const subscribeToCloudDedications = (
  onData: (dedications: DedicationItem[]) => void
): Unsubscribe | null => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    const spaceId = getSpaceId();
    const q = query(collection(db, 'couples', spaceId, 'dedications'));
    return onSnapshot(
      q,
      (snapshot) => {
        const dedications: DedicationItem[] = [];
        snapshot.forEach((doc) => {
          const raw = doc.data();
          if (raw && raw.id) {
            dedications.push(sanitizeDedicationPayload(raw));
          }
        });
        onData(dedications);
      },
      (error) => {
        console.warn('Firestore dedications listener error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up dedications subscription:', e);
    return null;
  }
};

export const subscribeToCloudCoupons = (
  onData: (coupons: LoveCoupon[]) => void
): Unsubscribe | null => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    const spaceId = getSpaceId();
    const q = query(collection(db, 'couples', spaceId, 'coupons'));
    return onSnapshot(
      q,
      (snapshot) => {
        const coupons: LoveCoupon[] = [];
        snapshot.forEach((doc) => {
          const raw = doc.data();
          if (raw && raw.id) {
            coupons.push(sanitizeCouponPayload(raw));
          }
        });
        onData(coupons);
      },
      (error) => {
        console.warn('Firestore coupons listener error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up coupons subscription:', e);
    return null;
  }
};

export const subscribeToCloudMedications = (
  onData: (medications: MedicationItem[]) => void
): Unsubscribe | null => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    const spaceId = getSpaceId();
    const q = query(collection(db, 'couples', spaceId, 'medications'));
    return onSnapshot(
      q,
      (snapshot) => {
        const meds: MedicationItem[] = [];
        snapshot.forEach((doc) => {
          const raw = doc.data();
          if (raw && raw.id) {
            meds.push(sanitizeMedicationPayload(raw));
          }
        });
        onData(meds);
      },
      (error) => {
        console.warn('Firestore medications listener error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up medications subscription:', e);
    return null;
  }
};

export const subscribeToCloudMoods = (
  onData: (moods: Record<UserProfile, CoupleMoodStatus>) => void
): Unsubscribe | null => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    const spaceId = getSpaceId();
    const q = query(collection(db, 'couples', spaceId, 'moods'));
    return onSnapshot(
      q,
      (snapshot) => {
        const moods: any = {};
        snapshot.forEach((doc) => {
          moods[doc.id] = doc.data() as CoupleMoodStatus;
        });
        if (Object.keys(moods).length > 0) {
          onData(moods);
        }
      },
      (error) => {
        console.warn('Firestore moods listener error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up moods subscription:', e);
    return null;
  }
};

export const subscribeToCloudProfileConfig = (
  onData: (config: ProfileConfig) => void
): Unsubscribe | null => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    const spaceId = getSpaceId();
    const docRef = doc(db, 'couples', spaceId, 'config', 'profiles');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as ProfileConfig);
        }
      },
      (error) => {
        console.warn('Firestore profileConfig listener error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up profileConfig subscription:', e);
    return null;
  }
};

// Fetch remote couple space details for invitation flow
export const fetchCloudCoupleConfig = async (coupleId: string): Promise<ProfileConfig | null> => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured || !coupleId) return null;
  try {
    const cleanId = coupleId.trim().toUpperCase();
    const docRef = doc(db, 'couples', cleanId, 'config', 'profiles');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ProfileConfig;
    }
  } catch (e) {
    console.warn('Error fetching remote couple config from cloud:', e);
  }
  return null;
};

// ==========================================
// CLOUD MUTATIONS (GUARDADO & BORRADO EN NUBE CON COLA Y SANITIZACIÓN)
// ==========================================

export const syncEventToCloud = async (event: EventItem) => {
  if (isWriteRateLimited()) return;
  const sanitized = sanitizeEventPayload(event);
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !sanitized.id) return;
    const spaceId = getSpaceId();
    await setDoc(doc(db, 'couples', spaceId, 'events', sanitized.id), cleanUndefined(sanitized));
  });
};

export const deleteEventFromCloud = async (eventId: string) => {
  if (isWriteRateLimited()) return;
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !eventId) return;
    const spaceId = getSpaceId();
    await deleteDoc(doc(db, 'couples', spaceId, 'events', eventId));
  });
};

export const syncTaskToCloud = async (task: TaskItem) => {
  if (isWriteRateLimited()) return;
  const sanitized = sanitizeTaskPayload(task);
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !sanitized.id) return;
    const spaceId = getSpaceId();
    await setDoc(doc(db, 'couples', spaceId, 'tasks', sanitized.id), cleanUndefined(sanitized));
  });
};

export const deleteTaskFromCloud = async (taskId: string) => {
  if (isWriteRateLimited()) return;
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !taskId) return;
    const spaceId = getSpaceId();
    await deleteDoc(doc(db, 'couples', spaceId, 'tasks', taskId));
  });
};

export const syncGroceryToCloud = async (grocery: SharedGroceryItem) => {
  if (isWriteRateLimited()) return;
  const sanitized = sanitizeGroceryPayload(grocery);
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !sanitized.id) return;
    const spaceId = getSpaceId();
    await setDoc(doc(db, 'couples', spaceId, 'groceries', sanitized.id), cleanUndefined(sanitized));
  });
};

export const deleteGroceryFromCloud = async (groceryId: string) => {
  if (isWriteRateLimited()) return;
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !groceryId) return;
    const spaceId = getSpaceId();
    await deleteDoc(doc(db, 'couples', spaceId, 'groceries', groceryId));
  });
};

export const syncDedicationToCloud = async (dedication: DedicationItem) => {
  if (isWriteRateLimited()) return;
  const sanitized = sanitizeDedicationPayload(dedication);
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !sanitized.id) return;
    const spaceId = getSpaceId();
    await setDoc(doc(db, 'couples', spaceId, 'dedications', sanitized.id), cleanUndefined(sanitized));
  });
};

export const deleteDedicationFromCloud = async (dedicationId: string) => {
  if (isWriteRateLimited()) return;
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !dedicationId) return;
    const spaceId = getSpaceId();
    await deleteDoc(doc(db, 'couples', spaceId, 'dedications', dedicationId));
  });
};

export const syncLoveCouponToCloud = async (coupon: LoveCoupon) => {
  if (isWriteRateLimited()) return;
  const sanitized = sanitizeCouponPayload(coupon);
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !sanitized.id) return;
    const spaceId = getSpaceId();
    await setDoc(doc(db, 'couples', spaceId, 'coupons', sanitized.id), cleanUndefined(sanitized));
  });
};

export const deleteLoveCouponFromCloud = async (couponId: string) => {
  if (isWriteRateLimited()) return;
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !couponId) return;
    const spaceId = getSpaceId();
    await deleteDoc(doc(db, 'couples', spaceId, 'coupons', couponId));
  });
};

export const syncMedicationToCloud = async (med: MedicationItem) => {
  if (isWriteRateLimited()) return;
  const sanitized = sanitizeMedicationPayload(med);
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !sanitized.id) return;
    const spaceId = getSpaceId();
    await setDoc(doc(db, 'couples', spaceId, 'medications', sanitized.id), cleanUndefined(sanitized));
  });
};

export const deleteMedicationFromCloud = async (medId: string) => {
  if (isWriteRateLimited()) return;
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !medId) return;
    const spaceId = getSpaceId();
    await deleteDoc(doc(db, 'couples', spaceId, 'medications', medId));
  });
};

export const syncCoupleMoodToCloud = async (mood: CoupleMoodStatus) => {
  if (!mood || !mood.isConfigured || mood.battery <= 0) return;
  if (isWriteRateLimited()) return;
  const cleanMood: CoupleMoodStatus = {
    profile: mood.profile,
    battery: sanitizeBattery(mood.battery),
    need: mood.need || 'cuddle',
    note: mood.note ? String(mood.note).slice(0, 150) : '',
    updatedAt: mood.updatedAt || new Date().toISOString(),
    isConfigured: true
  };
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured || !cleanMood.profile) return;
    const spaceId = getSpaceId();
    await setDoc(doc(db, 'couples', spaceId, 'moods', cleanMood.profile), cleanMood);
  });
};

export const syncProfileConfigToCloud = async (config: ProfileConfig) => {
  if (!config.isSetupComplete) return;
  if (isWriteRateLimited()) return;
  mutationQueue.enqueue(async () => {
    await ensureAnonymousAuth();
    const { db, isConfigured } = getFirebaseServices();
    if (!db || !isConfigured) return;
    const spaceId = config.coupleId || getSpaceId();
    const cloudPayload = cleanUndefined({
      ...config,
      partner1PhotoUrl: config.partner1PhotoUrl && config.partner1PhotoUrl.trim().length > 0 ? config.partner1PhotoUrl.trim() : null,
      partner2PhotoUrl: config.partner2PhotoUrl && config.partner2PhotoUrl.trim().length > 0 ? config.partner2PhotoUrl.trim() : null
    });
    await setDoc(doc(db, 'couples', spaceId, 'config', 'profiles'), cloudPayload);
  });
};

// ==========================================
// BULK FULL SYNC (SUBIR TODO EL HISTORIAL LOCAL)
// ==========================================
export const syncAllLocalDataToCloud = async (data: {
  events: EventItem[];
  tasks: TaskItem[];
  groceries: SharedGroceryItem[];
  dedications: DedicationItem[];
  coupons: LoveCoupon[];
  medications?: MedicationItem[];
  moods: Record<UserProfile, CoupleMoodStatus>;
  profileConfig: ProfileConfig;
}) => {
  if (!data.profileConfig?.isSetupComplete) return false;
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return false;

  try {
    const spaceId = getSpaceId();
    for (const evt of data.events) {
      await setDoc(doc(db, 'couples', spaceId, 'events', evt.id), sanitizeEventPayload(evt));
    }
    for (const tsk of data.tasks) {
      await setDoc(doc(db, 'couples', spaceId, 'tasks', tsk.id), sanitizeTaskPayload(tsk));
    }
    for (const gro of data.groceries) {
      await setDoc(doc(db, 'couples', spaceId, 'groceries', gro.id), sanitizeGroceryPayload(gro));
    }
    for (const ded of data.dedications) {
      await setDoc(doc(db, 'couples', spaceId, 'dedications', ded.id), sanitizeDedicationPayload(ded));
    }
    for (const cpn of data.coupons) {
      await setDoc(doc(db, 'couples', spaceId, 'coupons', cpn.id), sanitizeCouponPayload(cpn));
    }
    if (data.medications && Array.isArray(data.medications)) {
      for (const med of data.medications) {
        await setDoc(doc(db, 'couples', spaceId, 'medications', med.id), sanitizeMedicationPayload(med));
      }
    }
    if (data.moods) {
      for (const profileKey of Object.keys(data.moods) as UserProfile[]) {
        const m = data.moods[profileKey];
        if (m && m.isConfigured && m.battery > 0) {
          await setDoc(doc(db, 'couples', spaceId, 'moods', profileKey), {
            profile: m.profile,
            battery: sanitizeBattery(m.battery),
            need: m.need || 'cuddle',
            note: m.note ? String(m.note).slice(0, 150) : '',
            updatedAt: m.updatedAt || new Date().toISOString(),
            isConfigured: true
          });
        }
      }
    }
    const cleanProfiles = cleanUndefined({
      ...data.profileConfig,
      partner1PhotoUrl: data.profileConfig.partner1PhotoUrl && data.profileConfig.partner1PhotoUrl.trim().length > 0 ? data.profileConfig.partner1PhotoUrl.trim() : null,
      partner2PhotoUrl: data.profileConfig.partner2PhotoUrl && data.profileConfig.partner2PhotoUrl.trim().length > 0 ? data.profileConfig.partner2PhotoUrl.trim() : null
    });
    await setDoc(doc(db, 'couples', spaceId, 'config', 'profiles'), cleanProfiles);

    return true;
  } catch (e) {
    console.error('Error doing bulk sync to cloud:', e);
    return false;
  }
};

// ==========================================
// 📲 PUSH SUBSCRIPTIONS CLOUD STORAGE
// ==========================================
export const syncPushSubscriptionToCloud = async (
  profile: UserProfile,
  subscription: any
) => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return;

  try {
    await ensureAnonymousAuth();
    const spaceId = getSpaceId();
    const docRef = doc(db, 'couples', spaceId, 'push_subscriptions', profile);
    await setDoc(docRef, {
      profile,
      subscription: typeof subscription.toJSON === 'function' ? subscription.toJSON() : subscription,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Error saving push subscription to Firestore', e);
  }
};

export const getPartnerPushSubscriptionFromCloud = async (
  partnerProfile: UserProfile
): Promise<any | null> => {
  const { db, isConfigured } = getFirebaseServices();
  if (!db || !isConfigured) return null;

  try {
    await ensureAnonymousAuth();
    const spaceId = getSpaceId();
    const docRef = doc(db, 'couples', spaceId, 'push_subscriptions', partnerProfile);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return data?.subscription || null;
    }
  } catch (e) {
    console.warn('Error reading partner push subscription from Firestore', e);
  }
  return null;
};
