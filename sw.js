const STATIC_CACHE_NAME = 'mobi-trash-static-v17';
const DYNAMIC_CACHE_NAME = 'mobi-trash-dynamic-v17';

// CRITICAL: Precise list of all external dependencies used in importmap
const APP_SHELL_URLS = [
  '/',
  '/index.css',
  '/manifest.json',
  '/wifi-on.png',
  '/wifi-off.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
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

  // 1. Assets Strategy: Cache First (Vite bundles are immutable)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          return caches.open(STATIC_CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => null);
      })
    );
    return;
  }

  // 2. Image Strategy: Cache First, Fallback to Network (Optimized for speed)
  if (
    url.hostname.includes('ik.imagekit.io') ||
    url.hostname.includes('images.unsplash.com') ||
    url.hostname.includes('res.cloudinary.com') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            caches.open(DYNAMIC_CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
          }
          return networkResponse;
        }).catch(() => null);
      })
    );
    return;
  }

  // 3. Navigation Strategy: Network First (Ensures fresh index.html when online, falls back to cache when offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(networkResponse => {
        // Fix for Safari: "Response served by service worker has redirections"
        // We must return a non-redirected response for navigation requests.
        if (networkResponse.redirected) {
           const cleanResponse = new Response(networkResponse.body, {
             status: networkResponse.status,
             statusText: networkResponse.statusText,
             headers: networkResponse.headers
           });
           // Also update cache with the redirected body's final content
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
        // OFFLINE FALLBACK: If network fails, we return the cached version.
        return caches.match('/index.html').then(cachedResponse => {
          return cachedResponse || caches.match('/');
        });
      })
    );
    return;
  }

  // 4. Default Strategy: Stale-While-Revalidate (Balanced Speed & Freshness)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          caches.open(DYNAMIC_CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});