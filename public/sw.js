/**
 * WAH | وه — High-Performance Image Caching Service Worker
 * 
 * Strategy: Cache-First for ALL images (Logos, Mascots, Patterns, Cloudinary, Unsplash).
 * Once an image is downloaded once, it is cached persistently in the browser's Cache Storage
 * and served instantly with 0ms network latency on subsequent visits.
 */

const IMAGE_CACHE_NAME = 'wah-images-cache-v1';

// Critical core assets to pre-cache immediately on service worker installation
const CORE_PRECACHE_IMAGES = [
  '/mascot/logo.png',
  '/mascot/welcoming.png',
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
  '/mascot/favbrock.png',
  '/mascot/make.png',
  '/mascot/quiz.png',
  '/mascot/empty-cart.png',
  '/mascot/empty-search.png',
  '/pattern/pat1.svg',
  '/pattern/pat2.png',
  '/pattern/pat3.png',
  'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(IMAGE_CACHE_NAME).then((cache) => {
      // Pre-cache core assets gracefully so failure of any single optional file doesn't block installation
      return Promise.allSettled(
        CORE_PRECACHE_IMAGES.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[WAH SW] Precache warning for:', url, err);
          })
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith('wah-images-cache-') && name !== IMAGE_CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

function isImageRequest(request) {
  if (request.method !== 'GET') return false;
  if (request.destination === 'image') return true;

  try {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    // Check extensions
    if (/\.(png|jpg|jpeg|webp|avif|svg|ico|gif)$/i.test(path)) {
      return true;
    }

    // Check local image paths
    if (
      path.startsWith('/mascot/') ||
      path.startsWith('/pattern/') ||
      path.startsWith('/uploads/') ||
      path.startsWith('/_next/image')
    ) {
      return true;
    }

    // Check remote image CDNs (Cloudinary, Unsplash)
    if (url.hostname.includes('res.cloudinary.com')) {
      if (path.includes('/image/upload/') || /\.(png|jpg|jpeg|webp|avif|svg)$/i.test(path)) {
        return true;
      }
    }

    if (url.hostname.includes('images.unsplash.com')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!isImageRequest(request)) {
    return;
  }

  // Cache-First Strategy for Images
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(request)
        .then((networkResponse) => {
          // Verify response is valid (allow status 200 or opaque status 0 from cross-origin CDNs)
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseToCache = networkResponse.clone();
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch((fetchError) => {
          // If offline and request is an image, attempt fallback to core logo if available
          if (request.url.includes('/mascot/')) {
            return caches.match('/mascot/logo.png').then((fallback) => {
              return fallback || Promise.reject(fetchError);
            });
          }
          return Promise.reject(fetchError);
        });
    })
  );
});
