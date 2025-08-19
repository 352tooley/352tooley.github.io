// sw.js - Simple service worker for caching

const CACHE_NAME = "sales-tracker-v1";
const urlsToCache = [
  "/",                // root
  "/index.html",      // main app
  "/manifest.json",   // manifest
  "/icon-192.png",    // app icons
  "/icon-512.png"
];

// Install and cache assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Serve cached files when offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Clean up old caches when updated
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
