const CACHE_NAME = 'storymap-cache-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/app.bundle.js',
  '/app.css',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/screenshot1.jpg'
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});

