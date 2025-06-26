/**
 * FINAL AUDIT DASHBOARD CLEANUP SOLUTION
 * This script handles complete removal of all audit dashboard traces
 * from the Mining Royalties Manager application.
 * 
 * @version 1.0.0
 * @date 2025-07-01
 */

(function() {
    'use strict';
    
    console.log('🧹 EXECUTING FINAL AUDIT DASHBOARD CLEANUP SOLUTION 🧹');
    
    // =============================================
    // === SERVICE WORKER CLEANUP AND REPLACEMENT ===
    // =============================================
    async function cleanupServiceWorker() {
        console.log('1️⃣ Starting service worker cleanup...');
        
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker not supported in this browser');
            return;
        }
        
        try {
            // Unregister ALL existing service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`Found ${registrations.length} service worker registrations`);
            
            for (const registration of registrations) {
                console.log(`Unregistering service worker: ${registration.scope}`);
                await registration.unregister();
                console.log('Service worker unregistered successfully');
            }
            
            // Force cache cleanup - delete ALL caches
            const caches = await window.caches.keys();
            console.log(`Found ${caches.length} caches to clean`);
            
            for (const cacheName of caches) {
                console.log(`Deleting cache: ${cacheName}`);
                await window.caches.delete(cacheName);
            }
            
            // Register a fresh clean service worker
            if (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                console.log('Registering fresh service worker...');
                try {
                    // Add cache buster to ensure we get the latest version
                    const registration = await navigator.serviceWorker.register('sw.js?v=' + Date.now());
                    console.log('New service worker registered successfully:', registration);
                } catch (error) {
                    console.error('Error registering new service worker:', error);
                }
            }
            
            console.log('Service worker cleanup complete!');
        } catch (error) {
            console.error('Service worker cleanup error:', error);
        }
    }
    
    // =======================================
    // === LOCAL STORAGE AND DATA CLEANUP ===
    // =======================================
    function cleanupLocalStorage() {
        console.log('2️⃣ Starting local storage cleanup...');
        
        try {
            // Look for audit dashboard related keys in localStorage
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                // Check if key or value contains audit dashboard references
                if (
                    key && (
                        key.includes('audit') || 
                        key.includes('dashboard') ||
                        key.includes('audit-dashboard')
                    )
                ) {
                    keysToRemove.push(key);
                } else if (
                    value && typeof value === 'string' && (
                        value.includes('audit-dashboard') ||
                        value.includes('audit dashboard')
                    )
                ) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove identified keys
            console.log(`Found ${keysToRemove.length} localStorage items to remove`);
            keysToRemove.forEach(key => {
                console.log(`Removing localStorage item: ${key}`);
                localStorage.removeItem(key);
            });
            
            console.log('Local storage cleanup complete!');
        } catch (error) {
            console.error('Local storage cleanup error:', error);
        }
    }
    
    // =======================================
    // === DOM AUDIT DASHBOARD REMOVAL ===
    // =======================================
    function removeFromDOM() {
        console.log('3️⃣ Starting DOM cleanup...');
        
        try {
            // Remove audit-dashboard section
            const auditDashboardSection = document.getElementById('audit-dashboard');
            if (auditDashboardSection) {
                console.log('Removing audit-dashboard section from DOM');
                auditDashboardSection.remove();
            }
            
            // Remove any nav links to audit-dashboard
            const auditDashboardLinks = document.querySelectorAll('a[href="#audit-dashboard"], a[data-section="audit-dashboard"]');
            console.log(`Found ${auditDashboardLinks.length} audit dashboard links to remove`);
            auditDashboardLinks.forEach(link => {
                console.log(`Removing link: ${link.textContent || link.innerText}`);
                link.remove();
            });
            
            // Check for any elements with audit-dashboard classes
            const auditDashboardClasses = document.querySelectorAll('[class*="audit-dashboard"], [class*="audit"], [id*="audit-dashboard"]');
            console.log(`Found ${auditDashboardClasses.length} elements with audit dashboard classes`);
            auditDashboardClasses.forEach(element => {
                if (
                    element.className.includes('audit-dashboard') || 
                    element.id && element.id.includes('audit-dashboard')
                ) {
                    console.log(`Removing element with audit dashboard class/id: ${element.id || element.className}`);
                    element.remove();
                }
            });
            
            console.log('DOM cleanup complete!');
        } catch (error) {
            console.error('DOM cleanup error:', error);
        }
    }
    
    // =======================================
    // === RUNTIME CODE PATCHING ===
    // =======================================
    function patchRuntimeCode() {
        console.log('4️⃣ Patching runtime code...');
        
        try {
            // Patch ModuleLoader to block audit-dashboard loading
            if (window.ModuleLoader && ModuleLoader.prototype) {
                const originalLoadComponent = ModuleLoader.prototype.loadComponent;
                
                // Replace with patched version
                ModuleLoader.prototype.loadComponent = function(componentId, container) {
                    // Block audit-dashboard
                    if (componentId === 'audit-dashboard' || componentId.includes('audit-dashboard')) {
                        console.warn('🚫 Blocked attempt to load audit-dashboard component');
                        return Promise.resolve({
                            success: false,
                            error: new Error('audit-dashboard component has been removed from this application')
                        });
                    }
                    
                    // Call original for other components
                    return originalLoadComponent.apply(this, arguments);
                };
                
                console.log('✅ ModuleLoader.loadComponent patched to block audit-dashboard');
            }
            
            // Patch navigation system
            if (window.app && window.app.navigate) {
                const originalNavigate = window.app.navigate;
                
                // Replace with patched version
                window.app.navigate = function(section) {
                    // Redirect audit-dashboard to compliance
                    if (section === 'audit-dashboard' || section && section.includes('audit-dashboard')) {
                        console.warn('🔄 Redirecting audit-dashboard navigation to compliance section');
                        return originalNavigate.call(this, 'compliance');
                    }
                    
                    // Call original for other sections
                    return originalNavigate.apply(this, arguments);
                };
                
                console.log('✅ app.navigate patched to redirect audit-dashboard');
            }
            
            // Update valid sections in sidebar manager
            if (window.sidebarManager && window.sidebarManager.validSections) {
                const index = window.sidebarManager.validSections.indexOf('audit-dashboard');
                if (index > -1) {
                    window.sidebarManager.validSections.splice(index, 1);
                    console.log('✅ Removed audit-dashboard from sidebarManager.validSections');
                }
            }
            
            console.log('Runtime code patching complete!');
        } catch (error) {
            console.error('Runtime code patching error:', error);
        }
    }
    
    // =======================================
    // === SHOW STATUS NOTIFICATION ===
    // =======================================
    function showStatusNotification() {
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: #4caf50;
                color: white;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                font-size: 14px;
                max-width: 400px;
            `;
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <div style="margin-right: 10px; font-size: 20px;">✅</div>
                    <div>
                        <strong style="display: block; margin-bottom: 5px;">Audit Dashboard Cleanup Complete</strong>
                        <div>All audit dashboard references have been removed from the application.</div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 10px;">
                    <button id="cleanup-reload-btn" style="padding: 5px 10px; background: white; color: #4caf50; border: none; border-radius: 3px; cursor: pointer;">
                        Restart Application
                    </button>
                </div>
            `;
            
            // Add to document
            document.body.appendChild(notification);
            
            // Add event listener to reload button
            document.getElementById('cleanup-reload-btn').addEventListener('click', function() {
                window.location.reload();
            });
            
            // Auto-remove after 20 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }, 20000);
        } catch (error) {
            console.error('Error showing status notification:', error);
        }
    }
    
    // =======================================
    // === EXECUTE ALL CLEANUP FUNCTIONS ===
    // =======================================
    async function executeCleanup() {
        console.group('🧹 AUDIT DASHBOARD FINAL CLEANUP');
        
        // Perform all cleanup operations
        await cleanupServiceWorker();
        cleanupLocalStorage();
        
        // Wait until DOM is ready before manipulating it
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                removeFromDOM();
                patchRuntimeCode();
                showStatusNotification();
            });
        } else {
            removeFromDOM();
            patchRuntimeCode();
            showStatusNotification();
        }
        
        console.groupEnd();
        console.log('✅ ALL CLEANUP OPERATIONS COMPLETED');
    }
    
    // Start cleanup process
    executeCleanup();
})();
