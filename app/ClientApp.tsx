'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

// Essential mascots and branding images to prefetch in background for instantaneous navigation
const BACKGROUND_PREFETCH_IMAGES = [
  '/mascot/logo.png',
  '/mascot/welcoming.png',
  '/mascot/success.png',
  '/mascot/wrong.png',
  '/mascot/warning.png',
  '/mascot/info.png',
  '/mascot/success.webp',
  '/mascot/wrong.webp',
  '/mascot/warning.webp',
  '/mascot/info.webp',
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
  '/pattern/pat1.svg',
  '/pattern/pat2.png',
  'https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png'
];

export default function ClientApp() {
  useEffect(() => {
    // 1. Register High-Performance Image Caching Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            // Keep SW updated silently if a new version is available
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[WAH Cache] Images cache updated in background');
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[WAH Cache] Service worker registration note:', err);
          });
      });
    }

    // 2. Pre-warm browser in-memory image cache for instant display
    const prewarmImages = () => {
      BACKGROUND_PREFETCH_IMAGES.forEach((src) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      });
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prewarmImages, { timeout: 2000 });
      } else {
        setTimeout(prewarmImages, 1000);
      }
    }
  }, []);

  return <App />;
}
