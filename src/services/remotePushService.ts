import { getPartnerPushSubscriptionFromCloud } from './firestoreSync';
import { getActiveProfile, getProfileConfig } from './storageService';
import { UserProfile } from '../types';

export interface RemotePushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

class RemotePushService {
  // Send remote Web Push to partner via Vercel serverless /api/send-push
  public async sendPushToPartner(payload: RemotePushPayload): Promise<boolean> {
    const config = getProfileConfig();
    if (!config.isSetupComplete) return false;

    const activeProfile = getActiveProfile();
    const partnerProfile: UserProfile = activeProfile === 'partner1' ? 'partner2' : 'partner1';

    try {
      // 1. Fetch partner's Apple/Google push subscription from Firestore
      const subscription = await getPartnerPushSubscriptionFromCloud(partnerProfile);
      if (!subscription || !subscription.endpoint) {
        // Partner has not registered for Web Push yet on their device
        return false;
      }

      // 2. Dispatch via Vercel /api/send-push
      const response = await fetch('/api/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          payload: {
            title: payload.title,
            body: payload.body,
            url: payload.url || '/',
            tag: payload.tag || 'remote-' + Date.now()
          }
        })
      });

      if (!response.ok) {
        console.warn('Remote push response was not ok:', response.status);
        return false;
      }

      const data = await response.json();
      return Boolean(data.success);
    } catch (err) {
      console.warn('Could not send remote push to partner:', err);
      return false;
    }
  }
}

export const remotePushService = new RemotePushService();
