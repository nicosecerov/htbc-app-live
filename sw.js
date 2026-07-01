const CACHE_NAME = 'htbc-terrain-build51-plan-resolution-8661493f';

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
  './assets/index-CYsh1Fr_.js',
  './assets/index-DWLr-sBa.js',
  './assets/index-DaArYat_.js',
  './assets/index-DzmD9_gu.js',
  './assets/index-VJA_jWtm.js',
  './assets/native-geo-B5-ppoFI.js',
  './assets/web-BHzHXBqL.js',
  './assets/web-DvFTWCvq.js',
  './assets/web-Olnnb4L1.js',
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
