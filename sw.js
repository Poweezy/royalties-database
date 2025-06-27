/**
 * Mining Royalties Manager - Service Worker
 * @version 3.5
 * @date 2025-06-27
 * @description Service worker for offline functionality and caching
 */

const CACHE_NAME = 'mining-royalties-v3.5';
const STATIC_CACHE = 'mining-royalties-static-v3.5';
const DYNAMIC_CACHE = 'mining-royalties-dynamic-v3.5';

// Files to cache immediately on installation
const STATIC_ASSETS = [
    // Main application files
    './',
    './royalties.html',
    './app.js',
    './manifest.json',
    './favicon.svg',
    
    // CSS files
    './royalties.css',
    './css/base.css',
    './css/variables.css',
    './css/layout.css',
    './css/components.css',
    './css/forms.css',
    './css/tables.css',
    './css/buttons.css',
    './css/badges.css',
    './css/utilities.css',
    './css/enhanced-styles.css',
    './css/main.css',
    
    // JavaScript modules
    './js/utils.js',
    './js/enhanced-notification-system.js',
    './js/unified-chart-solution.js',
    './js/ultimate-chart-solution.js',
    './js/magical-chart-solution.js',
    './js/final-system-unification.js',
    './js/unified-component-loader.js',
    
    // Component files
    './components/sidebar.html',
    './components/dashboard.html',
    './components/user-management.html',
    './components/royalty-records.html',
    './components/contract-management.html',
    './components/reporting-analytics.html',
    './components/communication.html',
    './components/notifications.html',
    './components/compliance.html',
    './components/regulatory-management.html',
    './components/profile.html',
    './components/dashboard-enhanced.html'
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
    '/api/',
    '/data/',
    '.json'
];

// Cache-first resources (use cache if available)
const CACHE_FIRST = [
    '.css',
    '.js',
    '.html',
    '.svg',
    '.ico'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker v3.5...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] Caching static assets...');
                return cache.addAll(STATIC_ASSETS.map(url => {
                    // Handle relative URLs properly
                    return new Request(url, { cache: 'reload' });
                })).catch(error => {
                    console.warn('[SW] Some static assets failed to cache:', error);
                    // Continue with installation even if some assets fail
                    return Promise.resolve();
                });
            }),
            
            // Initialize dynamic cache
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('[SW] Dynamic cache initialized');
                return Promise.resolve();
            })
        ]).then(() => {
            console.log('[SW] Installation complete');
            // Skip waiting to activate immediately
            return self.skipWaiting();
        }).catch(error => {
            console.error('[SW] Installation failed:', error);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker v3.5...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName.startsWith('mining-royalties')) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Claim all clients immediately
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Activation complete');
        }).catch(error => {
            console.error('[SW] Activation failed:', error);
        })
    );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Determine caching strategy based on request
    const strategy = getCachingStrategy(request);
    
    event.respondWith(
        handleRequest(request, strategy)
            .catch(error => {
                console.warn('[SW] Request failed:', request.url, error);
                return handleFallback(request);
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skipping waiting...');
        self.skipWaiting();
    } else if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION',
            version: CACHE_NAME
        });
    } else if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            clearAllCaches().then(() => {
                event.ports[0].postMessage({
                    type: 'CACHE_CLEARED',
                    success: true
                });
            }).catch(error => {
                event.ports[0].postMessage({
                    type: 'CACHE_CLEARED',
                    success: false,
                    error: error.message
                });
            })
        );
    }
});

// Determine caching strategy for a request
function getCachingStrategy(request) {
    const url = request.url;
    
    // Network first for API calls and dynamic data
    if (NETWORK_FIRST.some(pattern => url.includes(pattern))) {
        return 'network-first';
    }
    
    // Cache first for static assets
    if (CACHE_FIRST.some(pattern => url.includes(pattern))) {
        return 'cache-first';
    }
    
    // Default to network first
    return 'network-first';
}

// Handle request based on strategy
async function handleRequest(request, strategy) {
    switch (strategy) {
        case 'cache-first':
            return handleCacheFirst(request);
        case 'network-first':
            return handleNetworkFirst(request);
        default:
            return handleNetworkFirst(request);
    }
}

// Cache-first strategy
async function handleCacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Serve from cache and update in background
        updateCacheInBackground(request);
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        // Cache the response for future use
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Network-first strategy
async function handleNetworkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            console.log('[SW] Serving from cache (network failed):', request.url);
            return cachedResponse;
        }
        
        throw error;
    }
}

// Update cache in background
function updateCacheInBackground(request) {
    fetch(request).then(response => {
        if (response.ok) {
            caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(request, response);
            });
        }
    }).catch(error => {
        console.debug('[SW] Background update failed:', request.url);
    });
}

// Handle fallback responses
async function handleFallback(request) {
    const url = new URL(request.url);
    
    // For HTML requests, try to serve the main app
    if (request.headers.get('accept').includes('text/html')) {
        const cachedApp = await caches.match('./royalties.html');
        if (cachedApp) {
            return cachedApp;
        }
    }
    
    // For component requests, try to serve a generic fallback
    if (url.pathname.includes('/components/')) {
        return new Response(
            '<div class="offline-fallback"><h3>Content Unavailable</h3><p>This section is not available offline.</p></div>',
            {
                headers: { 'Content-Type': 'text/html' },
                status: 200
            }
        );
    }
    
    // Default fallback
    return new Response(
        'Content not available offline',
        {
            status: 503,
            statusText: 'Service Unavailable'
        }
    );
}

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => {
            if (cacheName.startsWith('mining-royalties')) {
                console.log('[SW] Clearing cache:', cacheName);
                return caches.delete(cacheName);
            }
        })
    );
}

// Error handling
self.addEventListener('error', event => {
    console.error('[SW] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.warn('[SW] Unhandled promise rejection:', event.reason);
    // Prevent the default handling (which would log to console)
    event.preventDefault();
});

console.log('[SW] Service worker script loaded v3.5');