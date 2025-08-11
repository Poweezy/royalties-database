/**
 * Service Worker for Mining Royalties Manager
 * Handles caching and offline functionality
 */

const CACHE_NAME = 'royalties-manager-v1';
const ASSETS = [
    '/',
    '/royalties.html',
    '/royalties.css',
    '/favicon.svg',
    '/js/core/app.js',
    '/js/utils/security.js',
    '/js/utils/error-handler.js',
    '/js/services/auth.service.js',
    '/js/modules/ChartManager.js',
    '/js/modules/FileManager.js',
    '/js/modules/NavigationManager.js',
    '/js/modules/NotificationManager.js',
    '/js/modules/IconManager.js',
    '/js/semantic-search.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS);
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => {
                console.log('Service Worker activated');
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip for API calls
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                // Clone the request because it can only be used once
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response because it can only be used once
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return offline fallback for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// Handle sync event for offline data
self.addEventListener('sync', event => {
    if (event.tag === 'sync-royalties') {
        event.waitUntil(syncRoyalties());
    }
});

// Handle push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/favicon-192.png',
        badge: '/favicon-192.png'
    };

    event.waitUntil(
        self.registration.showNotification('Mining Royalties Manager', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Sync function for offline royalty records
async function syncRoyalties() {
    try {
        const offlineData = await getOfflineData();
        
        for (const record of offlineData) {
            await syncRecord(record);
        }
        
        await clearOfflineData();
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Helper functions for offline data management
async function getOfflineData() {
    const db = await openDatabase();
    const store = db.transaction('offline', 'readonly').objectStore('offline');
    return store.getAll();
}

async function clearOfflineData() {
    const db = await openDatabase();
    const store = db.transaction('offline', 'readwrite').objectStore('offline');
    return store.clear();
}

async function syncRecord(record) {
    const response = await fetch('/api/royalties', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
    });
    
    if (!response.ok) {
        throw new Error('Sync failed for record');
    }
    
    return response.json();
}

// IndexedDB setup for offline data
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('RoyaltiesDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            db.createObjectStore('offline', { keyPath: 'id', autoIncrement: true });
        };
    });
}
