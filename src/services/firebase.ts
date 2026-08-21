import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously, Auth, User } from 'firebase/auth';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const STORAGE_KEY_FIREBASE_CONFIG = 'daily_delight_firebase_custom_config_v1';

// Default config from Vite env if available
const getEnvConfig = (): FirebaseConfigOptions | null => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (apiKey && projectId && appId) {
    return {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId
    };
  }
  return null;
};

// Retrieve stored custom config or env config
export const getActiveFirebaseConfig = (): FirebaseConfigOptions | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading custom firebase config', e);
  }
  return getEnvConfig();
};

export const saveCustomFirebaseConfig = (config: FirebaseConfigOptions | null) => {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
  } else {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  }
};

import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let appCheckInstance: AppCheck | null = null;

// Silent Anonymous Authentication (100% Free, Scalable, 0 Friction)
export const ensureAnonymousAuth = async (): Promise<User | null> => {
  const { auth } = getFirebaseServices();
  if (!auth) return null;
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (err) {
    console.warn('[Firebase Anonymous Auth Info]:', err);
    return null;
  }
};

export const getFirebaseServices = (): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  isConfigured: boolean;
} => {
  const config = getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null, auth: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }

    // Initialize App Check if ReCaptcha Site Key is configured in .env
    const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (recaptchaKey && appInstance && !appCheckInstance && typeof window !== 'undefined') {
      try {
        appCheckInstance = initializeAppCheck(appInstance, {
          provider: new ReCaptchaV3Provider(recaptchaKey),
          isTokenAutoRefreshEnabled: true
        });
      } catch (e) {
        console.warn('[Firebase App Check Info]:', e);
      }
    }

    if (!authInstance && appInstance) {
      authInstance = getAuth(appInstance);
      // Silently sign in in background
      ensureAnonymousAuth().catch(() => {});
    }

    if (!dbInstance && appInstance) {
      dbInstance = getFirestore(appInstance);
      // Try to enable offline persistence if possible
      try {
        enableIndexedDbPersistence(dbInstance).catch(() => {});
      } catch (_) {}
    }

    return {
      app: appInstance,
      db: dbInstance,
      auth: authInstance,
      isConfigured: true
    };
  } catch (e) {
    console.error('Error initializing Firebase:', e);
    return { app: null, db: null, auth: null, isConfigured: false };
  }
};
