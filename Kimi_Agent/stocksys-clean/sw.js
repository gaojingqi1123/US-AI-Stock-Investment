const CACHE_NAME = 'us-stock-v9';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});
