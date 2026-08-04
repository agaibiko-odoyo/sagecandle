self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'Sage Candle', {
    body: data.body || '', icon: '/sage-logo.jpeg', badge: '/sage-logo.jpeg', data: { url: data.url || '/profile' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
