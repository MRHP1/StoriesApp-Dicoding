const CACHE_NAME = 'storymap-cache-v2';

const APP_SHELL = [
  '/',
  '/index.html',
  '/app.bundle.js',
  '/app.css',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/screenshot1.jpg',
  '/manifest.json'
];

// ---- INSTALL ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ---- ACTIVATE ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE_NAME) {
          await caches.delete(key);
        }
      }
    })
  );
  self.clients.claim();
});

// ---- FETCH ----
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.host.includes('story-api.dicoding.dev')) return; // jangan intercept API

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});


// ---- PUSH NOTIFICATION ----
self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'Notifikasi Baru',
      body: event.data?.text() || 'Ada update baru!'
    };
  }

  const title = data.title || 'Story Baru';
  const options = {
    body: data.options?.body || data.body || 'Ada update baru!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ---- NOTIFICATION CLICK → OPEN STORY DETAIL ----
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const storyId = event.notification.data?.id;

  event.waitUntil(
    clients.openWindow(storyId ? `#/story/${storyId}` : '/')
  );
});