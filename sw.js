const CACHE_NAME = 'mining-royalties-v3.4';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/royalties.html',    
    '/app.js',    
    '/js/chart-manager.js',
    '/js/module-loader.js',
    '/js/component-initializer.js',
    '/js/sidebar-manager.js',
    '/js/diagnostics.js',
    '/js/startup.js',
    // CSS files
    '/css/main.css',
    '/royalties.css',
    '/css/base.css',
    '/css/variables.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/forms.css',
    '/css/tables.css',
    '/css/buttons.css',
    '/css/badges.css',
    '/css/utilities.css',
    // Components - only keeping the ones used in royalties.html
    '/components/sidebar.html',
    '/components/dashboard.html',
    '/components/user-management.html',
    '/components/royalty-records.html',
    '/components/contract-management.html',
    '/components/audit-dashboard.html',
    '/components/reporting-analytics.html',
    '/components/communication.html',
    '/components/notifications.html',
    '/components/compliance.html',
    '/components/regulatory-management.html',
    '/components/profile.html',
    // External resources
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

// Message event - properly handled to avoid message channel errors
self.addEventListener('message', event => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'CACHE_UPDATE') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('Service Worker: Updating cache for CACHE_UPDATE message');
                    return cache.addAll(CACHE_URLS.filter(shouldCache));
                })
                .catch(error => {
                    console.error('Service Worker: Cache update failed:', error);
                })
        );
    } else if (event.data && event.data.type === 'REQUEST_VERSION') {
        // Respond to version requests synchronously, don't use postMessage
        console.log('Service Worker: Received version request');
    }
    
    // IMPORTANT: Never return a Promise or true from this handler
    // to avoid "message channel closed before response" errors
});

// Error handlers
self.addEventListener('error', event => {
    console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
    event.preventDefault();
});
