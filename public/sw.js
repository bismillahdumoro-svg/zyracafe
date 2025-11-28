const CACHE_NAME = "pos-app-v1";
const URLS_TO_CACHE = ["/", "/index.html"];

// Install: cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        console.warn("Caching failed - continuing without cache");
      });
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first strategy with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip API calls - these should be handled by app's online/offline logic
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Return cached response if fetch fails
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            // Return offline message if no cache
            return new Response(
              JSON.stringify({ 
                message: "Offline - Using cached data. Some features may be limited." 
              }),
              { 
                status: 503,
                headers: { "Content-Type": "application/json" }
              }
            );
          });
        })
    );
    return;
  }

  // Cache-first for all other requests
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone);
        });

        return response;
      });
    })
  );
});
