// sw.js — lightweight, always-fresh service worker
const VERSION = 'v1.0.' + Date.now();          // bump automatically each deploy
const PRECACHE = [
  '/', 'index.html', 'manifest.json',
  'logo-64.png', 'logo-192.png', 'logo-512.png'
];

// Take control immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategy:
//  - Navigations & HTML: network-first (so new deploys show immediately)
//  - Everything else: stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then(resp => {
          const copy = resp.clone();
          caches.open(VERSION).then(c => c.put('/', copy));
          return resp;
        })
        .catch(() => caches.match('/') || caches.match('index.html'))
    );
    return;
  }

  // stale-while-revalidate for assets
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkResp => {
        const copy = networkResp.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return networkResp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
