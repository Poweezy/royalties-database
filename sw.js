/**
 * Mining Royalties Manager - Service Worker
 * @version 4.1.0
 * @date 2025-06-26
 */

const CACHE_NAME = 'mining-royalties-v4.1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/royalties.html',
  '/app.js',
  '/royalties.css',
  '/favicon.svg',
  '/manifest.json',
  '/js/utils.js',
  '/js/unified-component-loader.js',
  '/js/charts-consolidated.js',
  '/js/component-initializer.js',
  '/js/sidebar-manager.js',
  '/js/chart-manager.js',
  '/js/diagnostics.js',
  '/js/startup.js',
  // CSS files
  '/css/main.css',
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

// Install event - Cache core app shell files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        const validUrls = APP_SHELL.filter(url => 
          !url.startsWith('chrome-extension://') && 
          !url.startsWith('moz-extension://') && 
          !url.includes('removed-')
        );
        return cache.addAll(validUrls);
      })
      .catch(error => {
        console.error('Service Worker: Cache error:', error);
      })
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  // Take control of all clients immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                }).filter(Boolean)
            );
        })
    );
});

// Handle message events
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch event - Serve from cache or network
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Log fetch for debugging
  console.log('Service Worker: Fetching', requestUrl.pathname);
  
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      requestUrl.pathname.startsWith('/browser-sync/') ||
      requestUrl.protocol === 'chrome-extension:') {
    return;
  }
  
  // Special handling for component requests (try both paths)
  if (requestUrl.pathname.includes('/components/') || requestUrl.pathname.includes('/html/components/')) {
    event.respondWith(handleComponentRequest(event.request));
    return;
  }
  
  // For other assets - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if we have it
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', requestUrl.pathname);
          
          // Revalidate in the background unless it's a versioned asset
          if (!requestUrl.search.includes('v=')) {
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                // Update the cache with the new version
                if (networkResponse && networkResponse.ok && networkResponse.type !== 'opaque') {
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, networkResponse.clone()))
                    .catch(error => console.error('Cache update error:', error));
                }
                return networkResponse;
              })
              .catch(() => {
                // Network fetch failed, just serve cached version
                return cachedResponse;
              });
              
            // Return cached version while updating in the background
            return cachedResponse;
          }
          
          return cachedResponse;
        }
        
        // If not in cache, get from network
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache non-successful responses or opaque responses
            if (!networkResponse || !networkResponse.ok || networkResponse.type === 'opaque') {
              return networkResponse;
            }
            
            // Cache successful responses
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(error => console.error('Cache update error:', error));
              
            return networkResponse;
          })
          .catch(error => {
            console.error('Network fetch failed:', error);
            return new Response('Network error', { status: 408 });
          });
      })
      .catch(error => {
        console.error('Cache match error:', error);
        return new Response('Service Worker error', { status: 500 });
      })
  );
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
