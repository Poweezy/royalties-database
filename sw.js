const CACHE_NAME = 'mining-royalties-v3.5';
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

// Handle message events - this helps with message channel errors
self.addEventListener('message', event => {
    try {
        if (event.data && event.data.type === 'SKIP_WAITING') {
            self.skipWaiting();
        }
    } catch (error) {
        console.debug('SW: Error handling message:', error);
    }
});

// Error handler for the service worker
self.addEventListener('error', event => {
    console.debug('SW: Error caught in service worker:', event.message);
    event.preventDefault();
});

// Enhanced fetch event with better error handling
self.addEventListener('fetch', event => {
    try {
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
                                        console.debug('SW: Cache put error:', error);
                                    });
                            }
                            
                            return response;
                        })
                        .catch(error => {
                            console.debug('SW: Network fetch error:', error);
                            return new Response('Network error', { status: 408, statusText: 'Network error' });
                        });
                })
                .catch(error => {
                    console.debug('SW: Cache match error:', error);
                    return new Response('Service worker error', { status: 500, statusText: 'SW Error' });
                })
        );
    } catch (error) {
        console.debug('SW: General fetch handler error:', error);
    }
});
