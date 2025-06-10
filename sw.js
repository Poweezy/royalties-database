const CACHE_NAME = 'mining-royalties-v1.7';
const CACHE_URLS = [
    '/',
    '/royalties.html',
    '/css/main.css',
    '/royalties.css',
    '/app.js',
    // External resources that should be cached
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Helper function to check if URL should be cached
function shouldCache(url) {
    if (url.startsWith('chrome-extension://') || 
        url.startsWith('moz-extension://') || 
        url.startsWith('safari-extension://')) {
        return false;
    }
    return true;
}

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                const validUrls = CACHE_URLS.filter(shouldCache);
                return cache.addAll(validUrls);
            })
            .catch(error => {
                console.error('Service Worker: Cache failed', error);
            })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
    const requestUrl = event.request.url;
    
    if (!shouldCache(requestUrl)) {
        console.log('Service Worker: Skipping unsupported URL:', requestUrl);
        return;
    }
    
    console.log('Service Worker: Fetching', requestUrl);
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Serving from cache:', requestUrl);
                    return response;
                }
                
                console.log('Service Worker: Fetching from network:', requestUrl);
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        if (shouldCache(requestUrl)) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(error => {
                                    console.warn('Service Worker: Cache put failed:', error);
                                });
                        }
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('Service Worker: Fetch failed:', requestUrl, error);
                        return new Response('Network error', { 
                            status: 500, 
                            statusText: 'Network Error' 
                        });
                    });
            })
    );
});

// Message event - simplified to avoid promise issues
self.addEventListener('message', event => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'CACHE_UPDATE') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => cache.addAll(CACHE_URLS.filter(shouldCache)))
                .catch(error => console.error('Service Worker: Cache update failed:', error))
        );
    }
    // Don't return true - this prevents the promise channel errors
});

// Error handlers
self.addEventListener('error', event => {
    console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
    event.preventDefault();
});
