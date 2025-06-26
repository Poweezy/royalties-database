/**
 * Service Worker Cache Cleanup Script
 * This script helps with complete removal of legacy components
 * @version 2.1.0
 * @date 2025-07-04
 */

(function() {
    'use strict';
    
    console.log('=== COMPLETE CACHE CLEANUP STARTING ===');
    
    // PART 1: Service Worker Cache Cleanup
    async function cleanServiceWorkerCache() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported in this browser');
            return;
        }
        
        try {
            console.log('Checking service worker registration status...');
            const registration = await navigator.serviceWorker.ready;
            console.log('Service worker registration active:', registration);
            
            // First unregister any existing service workers to force a clean slate
            console.log('Unregistering existing service workers...');
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let reg of registrations) {
                await reg.unregister();
                console.log('Service worker unregistered');
            }
            
            // Now clean all caches
            console.log('Clearing all service worker caches...');
            const cacheNames = await caches.keys();
            console.log('Found caches:', cacheNames);
            
            // Clean each cache
            await Promise.all(cacheNames.map(async cacheName => {
                console.log(`Processing cache: ${cacheName}`);
                
                try {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    
                    // First remove legacy entries
                    const legacyRequests = requests.filter(req => 
                        req.url.includes('removed-') || 
                        req.url.includes('legacy-') || 
                        req.url.includes('archived-')
                    );
                    
                    console.log(`Found ${legacyRequests.length} legacy component requests in ${cacheName}`);
                    
                    // Delete each legacy request
                    await Promise.all(auditRequests.map(async req => {
                        console.log(`Removing: ${req.url}`);
                        await cache.delete(req);
                    }));
                    
                    // For mining-royalties cache, delete it entirely to force a fresh start
                    if (cacheName.includes('mining-royalties')) {
                        console.log(`Completely removing cache: ${cacheName}`);
                        await caches.delete(cacheName);
                    }
                } catch (e) {
                    console.error(`Error processing cache ${cacheName}:`, e);
                }
            }));
            
            console.log('Cache cleanup complete');
        } catch (e) {
            console.error('Service worker cache cleanup error:', e);
        }
        
        console.log('Registering new service worker with updated cache...');
        // Refreshing the page would register a new service worker
    }
    
    // PART 2: DOM Cleanup and Fixup
    function cleanupDOM() {
        console.log('Performing DOM cleanup for legacy elements...');
        
        // Remove any legacy sections if they exist
        const legacySections = document.getElementById('audit-dashboard');
        if (legacySections) {
            console.log('Found and removing legacy section');
            legacySections.remove();
        }
        
        // Remove any sidebar links to legacy components
        const legacyLinks = document.querySelectorAll('a[href="#audit-dashboard"], a[data-section="audit-dashboard"]');
        legacyLinks.forEach(link => {
            console.log('Found and removing legacy link:', link);
            link.remove();
        });
        
        // Check for and fix any other legacy references
        const possibleContainers = Array.from(document.querySelectorAll('*'));
        possibleContainers.forEach(el => {
            // Check element text content
            if (el.textContent && el.textContent.includes('audit dashboard') && 
                !el.closest('script') && el.tagName !== 'SCRIPT') {
                console.log('Found element with legacy text:', el);
                el.textContent = el.textContent.replace(/audit dashboard/gi, 'compliance');
            }
            
            // Check attributes for legacy references
            Array.from(el.attributes).forEach(attr => {
                if (attr.value && attr.value.includes('audit-dashboard')) {
                    console.log(`Found legacy reference in ${attr.name} attribute:`, el);
                    if (attr.name === 'href' && attr.value === '#audit-dashboard') {
                        el.setAttribute(attr.name, '#compliance');
                    } else if (attr.name === 'data-section' && attr.value === 'audit-dashboard') {
                        el.setAttribute(attr.name, 'compliance');
                    }
                }
            });
        });
        
        console.log('DOM cleanup complete');
    }
    
    // PART 3: Navigation and Module Loader Patching
    function patchNavigationSystem() {
        console.log('Patching navigation system...');
        
        // Patch navigation to prevent audit-dashboard from being loaded
        if (window.app && window.app.navigate) {
            const originalNavigate = window.app.navigate;
            window.app.navigate = function(section) {
                if (section === 'audit-dashboard') {
                    console.log('Navigation to audit-dashboard intercepted, redirecting to compliance');
                    section = 'compliance';
                }
                return originalNavigate.call(window.app, section);
            };
            console.log('App navigation patched');
        }
        
        // Remove audit-dashboard from valid sections
        if (window.sidebarManager && window.sidebarManager.validSections) {
            const index = window.sidebarManager.validSections.indexOf('audit-dashboard');
            if (index > -1) {
                window.sidebarManager.validSections.splice(index, 1);
                console.log('Removed audit-dashboard from sidebarManager.validSections');
            }
        }
        
        console.log('Navigation system patching complete');
    }
    
    // Execute all cleanup functions when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cleanServiceWorkerCache();
            cleanupDOM();
            patchNavigationSystem();
        });
    } else {
        cleanServiceWorkerCache();
        cleanupDOM();
        patchNavigationSystem();
    }
    
    // Add reload button to easily refresh the page after cleanup
    setTimeout(() => {
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Complete Cleanup & Reload';
        reloadButton.classList.add('btn', 'btn-warning', 'cleanup-reload-btn');
        reloadButton.style.position = 'fixed';
        reloadButton.style.bottom = '10px';
        reloadButton.style.right = '10px';
        reloadButton.style.zIndex = '9999';
        reloadButton.addEventListener('click', () => window.location.reload());
        document.body.appendChild(reloadButton);
    }, 2000);
    
    console.log('=== COMPLETE AUDIT DASHBOARD CLEANUP COMPLETE ===');
})();
