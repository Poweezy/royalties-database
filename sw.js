const CACHE_NAME = 'mining-royalties-v4.0';
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
    '/components/reporting-analytics.html',
    '/components/communication.html',
    '/components/notifications.html',
    '/components/compliance.html',
    '/components/regulatory-management.html',
    '/components/profile.html',
    // Also cache the html/components versions as fallbacks
    '/html/components/sidebar.html',
    '/html/components/dashboard.html',
    '/html/components/user-management.html',
    '/html/components/royalty-records.html',
    '/html/components/contract-management.html',
    '/html/components/reporting-analytics.html',
    '/html/components/communication.html',
    '/html/components/notifications.html',
    '/html/components/compliance.html',
    '/html/components/regulatory-management.html',
    '/html/components/profile.html',
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
        url.startsWith('safari-extension://') ||
        url.includes('removed-')) {
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
        
        // Special handling for component requests (more robust)
        const url = new URL(requestUrl);
        const isComponentRequest = (
            url.pathname.includes('/components/') ||
            url.pathname.includes('/html/components/')
        );
        
        if (isComponentRequest) {
            event.respondWith(handleComponentRequest(event.request));
            return;
        }
        
        // Standard handling for non-component requests
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

// Helper function to handle component requests with multiple paths
async function handleComponentRequest(request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const componentName = pathParts[pathParts.length - 1]; // e.g., "sidebar.html"
    
    // Try from cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        console.log(`Service Worker: Serving cached component: ${componentName}`);
        return cachedResponse;
    }
    
    // Define alternate paths to try
    let paths = [];
    if (url.pathname.includes('/html/components/')) {
        // If we're looking in html/components, also try regular components
        paths = [
            request.url,                                  // Original path
            url.origin + `/components/${componentName}`,       // Alternative path without html/
            url.origin + `/templates/${componentName}`,        // Another possible path
        ];
    } else if (url.pathname.includes('/components/')) {
        // If we're looking in components, also try html/components
        paths = [
            request.url,                                       // Original path
            url.origin + `/html/components/${componentName}`,  // Alternative path with html/
            url.origin + `/templates/${componentName}`,        // Another possible path
        ];
    } else {
        // For any other path, try both components directories
        paths = [
            request.url,                                       // Original path
            url.origin + `/components/${componentName}`,       // Alternative path
            url.origin + `/html/components/${componentName}`,  // Another alternative path
        ];
    }
    
    // Try each path
    for (const path of paths) {
        try {
            // Skip any paths in removed or archived directories
            if (path.includes('removed-') || path.includes('archive-')) {
                console.log(`Service Worker: Skipping removed component: ${path}`);
                continue;
            }
            
            console.log(`Service Worker: Trying to fetch component from ${path}`);
            const response = await fetch(path);
            
            if (response.ok) {
                console.log(`Service Worker: Successfully fetched component from ${path}`);
                // Clone the response before caching
                const responseToCache = response.clone();
                
                // Cache the successful response
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, responseToCache);
                
                return response;
            }
        } catch (error) {
            console.warn(`Service Worker: Failed to fetch from ${path}:`, error.message);
            // Continue to next path
        }
    }
    
    // If all paths failed, return a more user-friendly error
    console.error(`Service Worker: All component paths failed for ${componentName}`);
    return new Response(
        `<div class="component-error">
            <h3>Component Load Error</h3>
            <p>Failed to load the "${componentName.replace('.html', '')}" component.</p>
            <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
        </div>`,
        { 
            headers: { 'Content-Type': 'text/html' },
            status: 200 // Return 200 to prevent further errors
        }
    );
}
