const CACHE_NAME = 'myqr-pro-cache-v126';
const ASSETS = [
  '/',
  '/index.html',
  '/qrcode.browser.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Event - cache initial shell assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching Assets');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up older caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Online First (Network First with Cache Fallback)
self.addEventListener('fetch', e => {
  // Only handle local GET requests
  if (!e.request.url.startsWith(self.location.origin) || e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // If response is successful, update cache dynamically
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network request fails (offline), fall back to cached response
        return caches.match(e.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Default fallback to index.html for page navigation
          if (e.request.mode === 'navigate' || e.request.url.endsWith('/') || e.request.url.endsWith('index.html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
