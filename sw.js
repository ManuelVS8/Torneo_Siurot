const CACHE_NAME = 'ajedrez-siurot-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  './icono-192.png', // Recomendable cachear los iconos
  './icono-512.png'
];

// Instalación del Service Worker (Solo funciona en HTTPS o Localhost)
self.addEventListener('install', event => {
  self.skipWaiting(); // Activar el nuevo SW inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activación: Limpia cachés antiguas si hay nueva versión
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia de Red: Cache First, Network Fallback
// 1. Sirve desde caché si está disponible (Offline rápido).
// 2. Si falla, intenta descargar de red (Online).
// 3. Si la red funciona, actualiza la caché para la próxima vez.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Si tenemos respuesta en caché, la devolvemos
        if (response) {
          return response;
        }
        // Si no, buscamos en red (fetch normal)
        return fetch(event.request).then(networkResponse => {
          // Si la red funciona, guardamos copia en caché
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});