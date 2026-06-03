const STATIC_CACHE_NAME = 'mobi-trash-static-v17';
const DYNAMIC_CACHE_NAME = 'mobi-trash-dynamic-v17';

// CRITICAL: Precise list of all external dependencies used in importmap
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  '/wifi-on.png',
  '/wifi-off.png',
  // Images & Fonts
  'https://ik.imagekit.io/Btmobilecare/logo.png?updatedAt=1765729150142',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  // React Core
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1',
  // Firebase SDKs (Must cache for offline logic to initialize)
  'https://esm.sh/firebase@10.12.2/compat/app',
  'https://esm.sh/firebase@10.12.2/compat/auth',
  'https://esm.sh/firebase@10.12.2/compat/firestore',
  'https://esm.sh/firebase@10.12.2/compat/storage',
  // Utilities & UI
  'https://cdn.tailwindcss.com?plugins=typography',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
  'https://unpkg.com/html5-qrcode',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js',
  // Heavy Libs
  'https://esm.sh/@google/genai@0.14.0',
  'https://esm.sh/chart.js@4.4.3/auto',
  'https://esm.sh/recharts@^3.6.0',
  'https://esm.sh/@capacitor/core@^8.0.0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Bullet Speed: Pre-caching Core Assets...');
        // We use addAll but catch errors so one failing file doesn't break the whole install
        return Promise.all(
            APP_SHELL_URLS.map(url => {
                return cache.add(url).catch(err => console.warn('Failed to cache:', url, err));
            })
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Cleaning old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Image Strategy: Stale-While-Revalidate (Fastest for visual content)
  if (url.hostname.includes('ik.imagekit.io') || url.hostname.includes('images.unsplash.com') || url.hostname.includes('res.cloudinary.com')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse); // Fallback to cache if network fails
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 2. Navigation Strategy: Network First (Ensures fresh index.html when online, falls back to cache when offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(networkResponse => {
        // Fix for Safari: "Response served by service worker has redirections"
        if (networkResponse.redirected) {
           const cleanResponse = new Response(networkResponse.body, {
             status: networkResponse.status,
             statusText: networkResponse.statusText,
             headers: networkResponse.headers
           });
           if (networkResponse.ok) {
              caches.open(STATIC_CACHE_NAME).then(cache => cache.put('/index.html', cleanResponse.clone()));
           }
           return cleanResponse;
        }
        if (networkResponse.ok) {
          caches.open(STATIC_CACHE_NAME).then(cache => cache.put('/index.html', networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => {
        // OFFLINE: Return cached index.html or root
        return caches.match('/index.html').then(cachedResponse => {
          return cachedResponse || caches.match('/');
        });
      })
    );
    return;
  }

  // 3. Default Strategy: Network First, Fallback to Cache (The Fix)
  // This ensures the app shell (JS, CSS) is always fresh when online.
  event.respondWith(
    caches.open(DYNAMIC_CACHE_NAME).then(cache => {
      return fetch(request).then(networkResponse => {
        // If the fetch is successful, we cache the response and return it.
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // If the network fetch fails (offline), we try to get it from the cache.
        return cache.match(request);
      });
    })
  );
});