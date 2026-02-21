/* eslint-disable no-restricted-globals */

// Service Worker for Yeet Bank PWA
const CACHE_NAME = 'yeet-bank-v2';

// Install - only cache the root, skip hashed static files to avoid addAll failures
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache the app shell root — not hashed filenames which may not exist yet
      return cache.add('/').catch(() => null);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline, but skip API requests
self.addEventListener('fetch', (event) => {
  // Don't intercept API requests - let them go directly to the server
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || 
      url.hostname.includes('render.com') || 
      url.hostname.includes('localhost:8000')) {
    return; // Let the browser handle API requests normally
  }

  // Cache static assets only
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/');
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Yeet Bank',
    body: 'You have a new notification',
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/favicon-32x32.png',
    tag: 'default-notification',
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'Yeet Bank',
        body: data.body || data.message || 'You have a new notification',
        icon: data.icon || '/icons/android-chrome-192x192.png',
        badge: '/icons/favicon-32x32.png',
        tag: data.tag || 'notification',
        data: data.data || {},
        requireInteraction: data.requireInteraction || false,
      };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Sync any pending messages when back online
  console.log('Syncing messages...');
}
