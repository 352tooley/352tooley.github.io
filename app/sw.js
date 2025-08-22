// Minimal service worker (cache-first for assets, network-first for navigation)
// Version this file when you change cached files (e.g. CACHE_VERSION = 'v2')
const CACHE_VERSION = 'v1';
const CACHE_NAME = `summary-static-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  '/app/summary.html',
  '/app/admin.html',
  '/app/manifest.json',
  '/logo-256.png',
  // add any CSS/JS/assets you want cached at install time:
  // '/app/styles.css',
  // '/app/main.js',
];

// Install: pre-cache static resources
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(err => console.warn('SW precache failed:', err))
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch: navigation/network-first, cache-first for other assets
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass non-GET
  if (req.method !== 'GET') return;

  // For navigation requests, try network first (so user gets fresh content)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(networkResp => {
          // update cache in background
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkResp.clone()));
          return networkResp;
        })
        .catch(() => caches.match('/app/summary.html')) // fallback to summary page
    );
    return;
  }

  // For other requests, try cache first then network
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkResp => {
        // put a copy in cache (but don't bloat cache with third-party requests)
        if (url.origin === location.origin) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkResp.clone()));
        }
        return networkResp;
      });
    }).catch(err => {
      // final fallback: try to return a simple Response or an offline asset (if you add one)
      return new Response('', { status: 503, statusText: 'Service Unavailable' });
    })
  );
});
