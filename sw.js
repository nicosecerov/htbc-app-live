const CACHE_NAME = 'htbc-terrain-build51-plan-resolution-68be054e';

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
  './assets/index-BW2HNc6l.css',
  './assets/index-BX4zRpB8.js',
  './assets/index-BorQeEEE.js',
  './assets/index-DF-Ztp3a.js',
  './assets/index-iRTBDCfJ.js',
  './assets/index-kur49yxy.js',
  './assets/native-geo-C1pssSbq.js',
  './assets/web-BHv1Vs4L.js',
  './assets/web-CTRVcQki.js',
  './assets/web-Qv0VtoFN.js',
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
