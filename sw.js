const CACHE_NAME = 'whisper-game-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/audioManager.js',
    '/js/progressManager.js',
    '/js/platform.js',
    '/js/level.js',
    '/js/player.js',
    '/js/game.js',
    '/js/main.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    console.log('[SW] Установка');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кэширование ассетов');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => console.error('[SW] Ошибка кэширования:', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Активация');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('[SW] Удалён старый кэш:', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (!networkResponse || networkResponse.status !== 200 || event.request.method !== 'GET') {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    })
                    .catch(() => {
                        return new Response('Офлайн режим: игра уже установлена', {
                            status: 200,
                            headers: new Headers({ 'Content-Type': 'text/plain' })
                        });
                    });
            })
    );
});