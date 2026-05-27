/* ============================================================
   Lamar Myers Digital Business Card — Service Worker
   PWA offline caching & install support
   ============================================================ */

const CACHE_NAME = 'lamar-myers-biz-card-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap',
  'https://mlgmigguhljsiopctkkj.supabase.co/storage/v1/object/public/MY%20PORTFOLIO/LOGOS/lamar_myers_b.png',
  'https://mlgmigguhljsiopctkkj.supabase.co/storage/v1/object/public/MY%20PORTFOLIO/LOGOS/qr_logo_2.png'
];

/* ── INSTALL: cache core assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: remove old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH: network-first, fallback to cache ── */
self.addEventListener('fetch', event => {
  // Skip non-GET and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache fresh responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
