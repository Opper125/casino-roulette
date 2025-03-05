const CACHE_NAME = 'casino-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/roulette.html',
    '/slots.html',
    '/admin.html',
    '/user-info.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    }
                );
            }).catch(() => {
                return caches.match('/index.html'); // Fallback to index.html if offline
            })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '{}');
    if (Object.keys(offlineData).length > 0) {
        try {
            const response = await fetch('https://casino-opper.netlify.app/.netlify/functions/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offlineData)
            });
            if (response.ok) {
                localStorage.setItem('offlineData', JSON.stringify(await response.json()));
                console.log('Data synced successfully');
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
}
