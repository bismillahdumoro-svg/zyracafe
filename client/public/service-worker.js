const CACHE_VERSION = 'pos-offline-v1';
const CACHE_NAMES = {
  STATIC: `${CACHE_VERSION}-static`,
  API: `${CACHE_VERSION}-api`,
};

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// API endpoints to cache responses
const CACHEABLE_APIS = [
  '/api/products',
  '/api/categories',
  '/api/users',
  '/api/shifts',
  '/api/transactions',
  '/api/stock-adjustments',
  '/api/loans',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silently fail if assets can't be cached
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('pos-offline-') && name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Don't cache non-same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache API GET requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const cache = caches.open(CACHE_NAMES.API).then((c) => {
              c.put(request, response.clone());
              return response;
            });
            return cache;
          }
          return response;
        })
        .catch(() => {
          // Return cached response if offline
          return caches.match(request).then((cached) => {
            return (
              cached ||
              new Response(
                JSON.stringify({ offline: true, cached: false }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({ 'Content-Type': 'application/json' }),
                }
              )
            );
          });
        })
    );
    return;
  }

  // Network first for HTML/CSS/JS
  event.respondWith(
    fetch(request)
      .then((response) => {
        return caches.open(CACHE_NAMES.STATIC).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
