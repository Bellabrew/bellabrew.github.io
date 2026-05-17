const CACHE_NAME = 'sr-plantao-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.jsx',
  '/icon-192.png',
  '/icon-512.png',
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - Cache first, then network
self.addEventListener('fetch', event => {
  // Skip AdSense requests - always from network
  if(event.request.url.includes('googlesyndication') || 
     event.request.url.includes('googleads') ||
     event.request.url.includes('pagead')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if(response) return response;
      return fetch(event.request).then(response => {
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
