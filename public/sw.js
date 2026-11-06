// PupLume PWA & Background Push Service Worker
const CACHE_NAME = 'puplume-cache-v4';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/favicon.ico',
  '/icon.svg',
  '/puplume-logo.svg',
  '/smart-qr-collar-tag-logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch cache-first / stale-while-revalidate
self.addEventListener('fetch', (event) => {
  // Web Share Target API: handle media shared directly from Camera Roll or external apps
  if (event.request.method === 'POST' && event.request.url.includes('/share-target')) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const mediaFile = formData.get('media') || formData.get('photo') || formData.get('file');
          const title = formData.get('title') || '';
          const text = formData.get('text') || '';

          if (mediaFile && mediaFile instanceof Blob) {
            const cache = await caches.open('puplume-shared-media');
            await cache.put(
              '/shared-media-latest',
              new Response(mediaFile, {
                headers: {
                  'content-type': mediaFile.type || 'image/jpeg',
                  'x-shared-title': encodeURIComponent(title || text || 'Puppy Memory')
                }
              })
            );
          }
          return Response.redirect('/journal?action=shared-media', 303);
        } catch (err) {
          console.error('[SW] Share target processing error:', err);
          return Response.redirect('/journal', 303);
        }
      })()
    );
    return;
  }

  // Pass through non-GET, API calls, and external auth calls directly to network
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('clerk') ||
    event.request.url.includes('convex')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate for cached static assets
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {
            /* offline fallback */
          });
        return cachedResponse;
      }
      return fetch(event.request).catch(async () => {
        if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
          const cachedOffline = await caches.match('/offline.html');
          if (cachedOffline) return cachedOffline;
        }
      });
    })
  );
});

// -------------------------------------------------------------
// Native Web Push Background Events
// -------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'PupLume Alert', message: event.data.text() };
    }
  }

  const title = data.title || 'PupLume Puppy Care';
  const bodyText = data.message || data.body || 'You have an important puppy reminder.';
  const actionUrl = data.actionUrl || data.url || '/';
  const category = data.category || 'reminder';

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Check if PupLume is open and currently visible to the user
      const visibleClient = windowClients.find(
        (c) => c.visibilityState === 'visible' && c.url.startsWith(self.location.origin)
      );

      if (visibleClient) {
        // App is open: SUPPRESS native OS push toast! Show only the custom in-app heads-up alert.
        visibleClient.postMessage({
          type: 'SHOW_IN_APP_ALERT',
          payload: {
            id: data.tag || `notif-${Date.now()}`,
            title,
            message: bodyText,
            category,
            actionUrl,
            timestamp: Date.now(),
            puppyName: data.puppyName,
            taskId: data.taskId
          }
        });
        return;
      }

      // App is closed or in background: show native OS push notification
      const options = {
        body: bodyText,
        icon: data.icon || '/pwa-192x192.png',
        badge: data.badge || '/icon.svg',
        image: data.image || undefined,
        tag: data.tag || `puplume-${Date.now()}`,
        renotify: data.renotify !== false,
        requireInteraction: data.requireInteraction || false,
        silent: false,
        vibrate: [200, 100, 200],
        data: {
          url: actionUrl,
          category,
          timestamp: Date.now()
        },
        actions: [
          { action: 'open', title: 'Open PupLume' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      };

      await self.registration.showNotification(title, options);
    })()
  );
});

// Notification click deep-linking & action handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Determine target route & view
  let rawUrl = event.notification.data?.url || '/';
  let targetView = 'home';

  if (event.action === 'open_potty' || rawUrl.includes('potty')) {
    targetView = 'potty';
    rawUrl = '/potty';
  } else if (event.action === 'open_health' || rawUrl.includes('health')) {
    targetView = 'health';
    rawUrl = '/health';
  } else if (event.action === 'open_tasks' || rawUrl.includes('tasks') || rawUrl.includes('plan')) {
    targetView = 'tasks';
    rawUrl = '/tasks';
  } else if (rawUrl.replace(/^\/+/, '')) {
    targetView = rawUrl.replace(/^\/+/, '').split('?')[0];
  }

  const fullUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // 1. If PupLume window is already open, focus it and switch to the view
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          client.postMessage({
            type: 'NAVIGATE',
            view: targetView,
            url: rawUrl,
            action: event.action,
          });

          if ('focus' in client) {
            await client.focus();
          }

          if (client.navigate && client.url !== fullUrl) {
            try {
              await client.navigate(fullUrl);
            } catch (err) {
              console.debug('[SW] client.navigate note:', err);
            }
          }
          return;
        }
      }

      // 2. If no window is currently open, launch a new window directly to the route
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })()
  );
});

// Handle local broadcast messages from the frontend app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      (async () => {
        const windowClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });

        // If any PupLume window is visible in foreground, SUPPRESS native notification!
        const hasVisibleClient = windowClients.some(
          (c) => c.visibilityState === 'visible' && c.url.startsWith(self.location.origin)
        );

        if (hasVisibleClient) {
          return;
        }

        await self.registration.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/icon.svg',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          ...options,
        });
      })()
    );
  }

  // -------------------------------------------------------------
  // Zero-Internet "Airplane Mode" Local Alarms Scheduler
  // -------------------------------------------------------------
  if (event.data && event.data.type === 'SCHEDULE_OFFLINE_ALARM') {
    const { title, options, targetTimestamp } = event.data;
    event.waitUntil(
      (async () => {
        // Method A: Native TimestampTrigger (Chromium / modern Android)
        if ('showTrigger' in Notification.prototype && typeof TimestampTrigger !== 'undefined') {
          try {
            await self.registration.showNotification(title, {
              icon: '/pwa-192x192.png',
              badge: '/icon.svg',
              vibrate: [200, 100, 200],
              ...options,
              showTrigger: new TimestampTrigger(targetTimestamp)
            });
            return;
          } catch (triggerErr) {
            console.debug('[SW] TimestampTrigger fallback to SW timer:', triggerErr);
          }
        }

        // Method B: Service Worker Background Timer Fallback
        const delay = Math.max(0, targetTimestamp - Date.now());
        if (delay < 2147483647) {
          setTimeout(async () => {
            await self.registration.showNotification(title, {
              icon: '/pwa-192x192.png',
              badge: '/icon.svg',
              vibrate: [200, 100, 200],
              ...options
            });
          }, delay);
        }
      })()
    );
  }

  if (event.data && event.data.type === 'CANCEL_OFFLINE_ALARMS') {
    event.waitUntil(
      (async () => {
        const notifs = await self.registration.getNotifications();
        notifs.forEach(n => {
          if (event.data.tag) {
            if (n.tag === event.data.tag) n.close();
          } else {
            n.close();
          }
        });
      })()
    );
  }
});
