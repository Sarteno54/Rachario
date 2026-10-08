// Service worker de Rachario.
// Guarda la página en caché la primera vez que se abre con internet,
// y a partir de ahí la sirve aunque no haya conexión.

var CACHE_NAME = "rachario-v1";

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(["./", "./index.html"]).catch(function () {
        // si "./index.html" no existe con ese nombre exacto, no pasa nada,
        // se cacheará igualmente en el primer fetch real
      });
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetchPromise = fetch(event.request)
        .then(function (networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            var clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
          }
          return networkResponse;
        })
        .catch(function () { return cached; });

      return cached || fetchPromise;
    })
  );
});
