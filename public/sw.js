// Service Worker for Push Notifications & Background Sync (No file caching)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge any old asset caches completely so UI always loads fresh from server
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// PUSH NOTIFICATION RECEIVER (Remote Push)
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Mi Agenda',
    body: 'Tienes una nueva actualización en tu agenda.',
    url: '/',
    tag: 'mi-agenda-notification'
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch (err) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [350, 120, 350, 120, 350],
    tag: payload.tag || 'mi-agenda-notif-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    timestamp: Date.now(),
    data: {
      url: payload.url || '/',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// NOTIFICATION CLICK HANDLER (Deep Link to View)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// LOCAL NOTIFICATION TRIGGER FROM CLIENT
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_NOTIFICATION') {
    const { title, body, url, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [250, 100, 250],
      tag: tag || 'local-notif-' + Date.now(),
      renotify: true,
      data: { url: url || '/' }
    });
  }
});
