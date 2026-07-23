/* Cucina ERP - Service Worker
   Strategia: cache-first per l'app shell (funziona offline), con
   aggiornamento in background (stale-while-revalidate) per le risorse GET
   same-origin. I dati restano in localStorage, quindi l'app è pienamente
   utilizzabile senza rete. */

const CACHE = 'cucina-erp-v10-6';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Le richieste di navigazione ripiegano sempre sulla index in cache (offline)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Stale-while-revalidate per il resto
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
