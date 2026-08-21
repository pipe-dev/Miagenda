import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BKEjz8CtSrX7dNrGUvZULgaNTtagcgJdnM6ALFJhy90rUC8SXwxKKXJ_FHg-Q5maNurss9rRdj9EJoZ8nbaPEws';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'dzCiZCeoEYNT7erXcGzgCdsa7RDkWFVpGOVNKO2LkFw';

webpush.setVapidDetails(
  'mailto:notificaciones@miagenda.app',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  // CORS & Method Check
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, payload } = req.body || {};

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Missing push subscription object with endpoint' });
    }

    const pushPayload = JSON.stringify({
      title: payload?.title || 'Mi Agenda',
      body: payload?.body || 'Tienes una nueva actualización.',
      url: payload?.url || '/',
      tag: payload?.tag || 'remote-push-' + Date.now()
    });

    const result = await webpush.sendNotification(subscription, pushPayload, {
      TTL: 86400, // 24 hours queue on Apple APNs / Google FCM if phone is offline
      urgency: 'high'
    });

    return res.status(200).json({ success: true, statusCode: result.statusCode });
  } catch (error) {
    console.error('Error sending remote Web Push:', error);
    
    // Check if subscription has expired (e.g. 410 Gone / 404)
    if (error.statusCode === 410 || error.statusCode === 404) {
      return res.status(410).json({ error: 'Subscription expired or unregistered', expired: true });
    }

    return res.status(500).json({ error: error.message || 'Failed to dispatch push notification' });
  }
}
