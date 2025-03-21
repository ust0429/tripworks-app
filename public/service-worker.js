// service-worker.js
const CACHE_NAME = 'echo-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
  '/favicon.ico'
];

// インストール時にキャッシュを行う
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// キャッシュを使ったリソースのフェッチ
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュが見つかればそれを返す
        if (response) {
          return response;
        }
        // キャッシュになければネットワークからフェッチ
        return fetch(event.request);
      })
  );
});

// キャッシュの更新
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// プッシュ通知の受信処理
self.addEventListener('push', (event) => {
  console.log('Push received:', event);
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (e) {
    console.error('Error parsing push data:', e);
  }
  
  const title = notificationData.title || 'echo';
  const options = {
    body: notificationData.body || 'アプリに新しい通知があります',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: notificationData.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 通知がクリックされたときの処理
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // 通知に含まれる data をもとに適切な URL を開く
  const data = event.notification.data || {};
  let url = '/';
  
  if (data.redirectUrl) {
    url = data.redirectUrl;
  } else if (data.notificationType) {
    // 通知タイプに応じたデフォルトのページにリダイレクト
    switch (data.notificationType) {
      case 'message':
        url = '/messages';
        break;
      case 'reservation':
        url = '/trips';
        break;
      case 'review':
        url = '/profile';
        break;
      case 'payment':
        url = '/payments';
        break;
      default:
        url = '/';
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // アプリが既に開いているタブがあれば、そのタブを使用
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        
        // アプリが開いていなければ、新しいタブで開く
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
