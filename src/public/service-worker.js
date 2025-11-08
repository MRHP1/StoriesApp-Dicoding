self.addEventListener('install', (event) => {
  // skipWaiting agar versi baru langsung aktif saat reload
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // claim agar SW segera mengontrol semua client terbuka
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.body || 'Ada pembaruan terbaru!',
    icon: '/favicon.png',
    data, // bawa data utk notificationclick
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const storyId = event.notification.data?.id;
  event.waitUntil(
    clients.openWindow(`#/story/${storyId || ''}`)
  );
});
