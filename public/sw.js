/**
 * WAH | وه — Progressive Web App (PWA) & Web Push Service Worker
 * 
 * Capabilities:
 * 1. Multi-tier caching: Cache-First for images, Stale-While-Revalidate for static assets, Network-First for pages.
 * 2. Complete Offline Resilience: Automatic fallback to /offline.html on network disconnect.
 * 3. Native Web Push Notifications: Background push event listener with customizable titles, vibration, icons & actions.
 * 4. Interactive Notification Clicks: Focuses open app window or opens direct deep-link route.
 */

const STATIC_CACHE = 'wah-static-v3';
const IMAGE_CACHE = 'wah-images-cache-v3';
const PAGES_CACHE = 'wah-pages-cache-v1';

const ALL_CURRENT_CACHES = [STATIC_CACHE, IMAGE_CACHE, PAGES_CACHE];

// Core shell and offline fallback assets
const CORE_PRECACHE_SHELL = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/mascot/logo.png',
  '/mascot/logo.webp',
  '/mascot/welcoming.png',
  '/mascot/success.png',
  '/mascot/wrong.png',
  '/mascot/warning.png',
  '/mascot/info.png',
  '/mascot/doors.png',
  '/mascot/char.png',
  '/mascot/pro.png',
  '/mascot/reels.png',
  '/mascot/saaed.png',
  '/mascot/athar.png',
  '/mascot/foods.png',
  '/mascot/events.png',
  '/mascot/fan.png',
  '/mascot/fav.png',
  '/mascot/make.png',
  '/pattern/pat1.svg',
  '/pattern/pat2.png',
  '/pattern/pat3.png',
  'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png'
];

/* =========================================================================
   1. INSTALL LIFECYCLE
   ========================================================================= */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.allSettled(
        CORE_PRECACHE_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[WAH SW] Optional precache warning for:', url, err);
          })
        )
      );
    })
  );
});

/* =========================================================================
   2. ACTIVATE LIFECYCLE (Cleanup obsolete caches)
   ========================================================================= */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!ALL_CURRENT_CACHES.includes(name)) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* =========================================================================
   3. HELPERS
   ========================================================================= */
function isImageRequest(request) {
  if (request.method !== 'GET') return false;
  if (request.destination === 'image') return true;

  try {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    if (/\.(png|jpg|jpeg|webp|avif|svg|ico|gif)$/i.test(path)) {
      return true;
    }

    if (
      path.startsWith('/mascot/') ||
      path.startsWith('/pattern/') ||
      path.startsWith('/uploads/') ||
      path.startsWith('/icons/') ||
      path.startsWith('/_next/image')
    ) {
      return true;
    }

    if (url.hostname.includes('res.cloudinary.com') || url.hostname.includes('images.unsplash.com')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function isStaticAsset(request) {
  if (request.method !== 'GET') return false;
  try {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();
    return (
      path.startsWith('/_next/static/') ||
      path.startsWith('/fonts/') ||
      /\.(css|js|woff2|woff|ttf|otf)$/i.test(path)
    );
  } catch {
    return false;
  }
}

/* =========================================================================
   4. FETCH EVENT LISTENER (Multi-tier Smart Caching)
   ========================================================================= */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and API calls (API must always hit the server directly)
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;

  // A. Navigation requests: Network-First with Offline Page fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const offlineFallback = await caches.match('/offline.html');
          if (offlineFallback) return offlineFallback;

          return new Response('غير متصل بالإنترنت', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // B. Image requests: Cache-First
  if (isImageRequest(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const clone = networkResponse.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, clone).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(async (fetchError) => {
            if (request.url.includes('/mascot/') || request.url.includes('/icons/')) {
              const fallback = await caches.match('/mascot/logo.png');
              if (fallback) return fallback;
            }
            return Promise.reject(fetchError);
          });
      })
    );
    return;
  }

  // C. Static CSS, JS, and Font Assets: Stale-While-Revalidate
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

/* =========================================================================
   5. WEB PUSH NOTIFICATIONS
   ========================================================================= */
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'وه | WAH — إشعار جديد 🏺';
  const body = data.body || data.message || 'لديك تنبيه جديد من منصة وه';
  const icon = data.icon || '/icons/icon-192x192.png';
  const badge = data.badge || '/icons/icon-192x192.png';
  const tag = data.tag || `wah-push-${Date.now()}`;
  const targetUrl = data.url || data.link || (data.actionPage ? `/?page=${data.actionPage}` : '/');

  const options = {
    body,
    icon,
    badge,
    tag,
    dir: 'rtl',
    lang: 'ar-EG',
    vibrate: [100, 50, 100],
    data: {
      url: targetUrl,
      actionPage: data.actionPage,
      metadata: data.metadata,
      dateOfArrival: Date.now()
    },
    actions: data.actions || [
      {
        action: 'open',
        title: 'عرض التفاصيل'
      }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/* =========================================================================
   6. NOTIFICATION CLICK HANDLING & DEEP LINKING
   ========================================================================= */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }

      // If no window is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

/* =========================================================================
   7. MESSAGE CHANNEL (Client-ServiceWorker communication)
   ========================================================================= */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
