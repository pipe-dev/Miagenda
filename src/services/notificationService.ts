import { audioService } from './audioService';
import { hapticService } from './hapticService';
import { syncPushSubscriptionToCloud } from './firestoreSync';
import { getActiveProfile } from './storageService';

const SETTINGS_KEY = 'mi_agenda_notifications_enabled';
export const VAPID_PUBLIC_KEY = 'BKEjz8CtSrX7dNrGUvZULgaNTtagcgJdnM6ALFJhy90rUC8SXwxKKXJ_FHg-Q5maNurss9rRdj9EJoZ8nbaPEws';

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  playSound?: boolean;
  triggerHaptic?: boolean;
}

export type PermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

// Helper: Convert Base64 URL safe to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

class NotificationService {
  // Check if browser supports notifications
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get current permission status
  public getPermission(): PermissionStatus {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as PermissionStatus;
  }

  // Check if user has enabled notifications in app settings
  public isEnabled(): boolean {
    if (typeof localStorage === 'undefined') return true;
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored === null ? true : stored === 'true';
  }

  // Toggle user preference in settings
  public setEnabled(enabled: boolean): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, String(enabled));
    }
  }

  // Register device with Apple APNs / Google Push Manager & sync to Firestore
  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      if (subscription) {
        const activeProfile = getActiveProfile();
        await syncPushSubscriptionToCloud(activeProfile, subscription);
      }

      return subscription;
    } catch (err) {
      console.warn('Could not subscribe to PushManager with VAPID', err);
      return null;
    }
  }

  // Request browser/system notification permission
  public async requestPermission(): Promise<PermissionStatus> {
    if (!this.isSupported()) return 'unsupported';

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.setEnabled(true);
        // Subscribe to Apple APNs / Google Push with VAPID
        await this.subscribeToPushNotifications();
        // Test chime & haptic
        hapticService.playSuccess();
        audioService.playCompletionChime();
      }
      return permission as PermissionStatus;
    } catch (e) {
      console.warn('Error requesting notification permission', e);
      return this.getPermission();
    }
  }

  // Send a native push/local notification
  public async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (!this.isEnabled()) return false;
    if (this.getPermission() !== 'granted') return false;

    const {
      title,
      body,
      url = '/',
      tag = 'notif-' + Date.now(),
      icon = '/icons/icon-192.png',
      playSound = true,
      triggerHaptic = true
    } = payload;

    // Optional audio & haptic feedback when notification triggers in app
    if (playSound) {
      audioService.playCompletionChime();
    }
    if (triggerHaptic) {
      hapticService.playSuccess();
    }

    try {
      // 1. Try Service Worker showNotification (Best for PWA & mobile)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body,
            icon,
            badge: '/icons/icon-192.png',
            vibrate: [250, 100, 250],
            tag,
            renotify: true,
            data: { url }
          });
          return true;
        }
      }

      // 2. Fallback to standard Window Notification
      const notif = new Notification(title, {
        body,
        icon,
        tag,
        data: { url }
      });

      notif.onclick = () => {
        window.focus();
        if (url && url !== '/') {
          window.location.href = url;
        }
        notif.close();
      };

      return true;
    } catch (err) {
      console.warn('Could not display notification', err);
      return false;
    }
  }

  // Helper: Send a test notification
  public async sendTestNotification(): Promise<boolean> {
    const perm = await this.requestPermission();
    if (perm !== 'granted') {
      return false;
    }

    return this.sendNotification({
      title: '✨ ¡Notificaciones activas en Mi Agenda!',
      body: 'Recibirás avisos de tus citas, dedicatorias sorpresa, tareas y pastillero.',
      url: '/?view=today',
      tag: 'test-notification'
    });
  }
}

export const notificationService = new NotificationService();
