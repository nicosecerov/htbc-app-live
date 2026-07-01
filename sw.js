const CACHE_NAME = 'htbc-terrain-build50-home-signaler-serein-bb429af3';

const PRECACHE_URLS = [
  './',
  './manifest.webmanifest',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo-htbc-blanc.svg',
  './assets/logo-htbc-noir.svg',
  './assets/trails-osm-compact.json',
  // Les assets hashes du bundle (JS/CSS + htbc-config) sont injectes au build par
  // scripts/inject-sw-precache.mjs : sans eux, premiere ouverture hors ligne = ecran blanc.
  './htbc-config.js',
  './assets/index-B-bkPLpa.css',
  './assets/index-CSlJDFQ5.js',
  './assets/index-DcUDKe34.js',
  './assets/index-EtdCZhN3.js',
  './assets/index-O8HgeLcB.js',
  './assets/index-Uy8ioMN5.js',
  './assets/native-geo-Cr2Id_SQ.js',
  './assets/web-9dmXDKJc.js',
  './assets/web-DcBCsrQj.js',
  './assets/web-DnGfZPVY.js',
];

function scopedUrl(path) {
  return new URL(path, self.registration.scope).toString();
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS.map(scopedUrl)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(scopedUrl('./'))));
    return;
  }

  if (requestUrl.origin !== scopeUrl.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
