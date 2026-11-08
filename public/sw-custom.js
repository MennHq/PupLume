// PupLume PWA Custom Extensions: Web Share Target, Native Web Push & Deep Linking

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// -------------------------------------------------------------
// 1. Web Share Target Level 2 (Gallery / Camera Roll native share)
// -------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'POST') return;

  const url = new URL(event.request.url);
  if (url.pathname === '/share-target' || url.pathname.endsWith('/share-target')) {
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
          // Response.redirect requires an absolute URL in the Fetch spec
          const redirectTarget = new URL('/journal?action=shared-media', self.location.origin).href;
          return Response.redirect(redirectTarget, 303);
        } catch (err) {
          console.error('[SW] Share target processing error:', err);
          const fallbackTarget = new URL('/journal?action=shared-media', self.location.origin).href;
          return Response.redirect(fallbackTarget, 303);
        }
      })()
    );
  }
});

// -------------------------------------------------------------
// 2. Native Web Push Background Events
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
        // App is open: SUPPRESS native OS push toast! Show custom in-app alert.
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

// -------------------------------------------------------------
// 3. Notification click deep-linking & action handler
// -------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

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

      // 1. If PupLume window is already open, focus it and switch view
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

      // 2. If no window is open, launch a new window directly
      if (self.clients.openWindow) {
        return self.clients.openWindow(fullUrl);
      }
    })()
  );
});

// -------------------------------------------------------------
// 4. In-App Broadcast & Offline Alarms
// -------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      (async () => {
        const windowClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });

        const hasVisibleClient = windowClients.some(
          (c) => c.visibilityState === 'visible' && c.url.startsWith(self.location.origin)
        );

        if (hasVisibleClient) return;

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

  if (event.data && event.data.type === 'SCHEDULE_OFFLINE_ALARM') {
    const { title, options, targetTimestamp } = event.data;
    event.waitUntil(
      (async () => {
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
