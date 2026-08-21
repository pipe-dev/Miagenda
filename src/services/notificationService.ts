import { audioService } from './audioService';
import { hapticService } from './hapticService';

const SETTINGS_KEY = 'mi_agenda_notifications_enabled';

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

  // Request browser/system notification permission
  public async requestPermission(): Promise<PermissionStatus> {
    if (!this.isSupported()) return 'unsupported';

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.setEnabled(true);
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
