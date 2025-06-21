/**
 * Script Loader Guard
 * 
 * This script prevents duplicate loading of key scripts and objects
 * in the Royalties Database application to avoid "already declared" errors.
 * 
 * Version: 1.0.0 (2025-06-22)
 */

(function() {
    // Already loaded guard
    if (window.SCRIPT_LOADER_GUARD_APPLIED) {
        return;
    }
    window.SCRIPT_LOADER_GUARD_APPLIED = true;
    
    console.log('Script Loader Guard: Initializing...');
    
    // Track loaded scripts and objects to prevent duplicate declarations
    window.loadedScripts = window.loadedScripts || {};
    window.loadedObjects = window.loadedObjects || {};
    
    // List of critical objects that should not be redeclared
    const guardedObjects = [
        'SimpleChartManager',
        'ModuleLoader',
        'AuditDashboardController',
        'ChartManager',
        'ComponentInitializer',
        'SidebarManager'
    ];
    
    // Backup original objects if they exist
    guardedObjects.forEach(objName => {
        if (window[objName] && !window.loadedObjects[objName]) {
            window.loadedObjects[objName] = window[objName];
            console.log(`Protected object: ${objName}`);
        }
    });
    
    // Override the script element creation to prevent duplicate script loading
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        
        // Only modify script elements
        if (tagName.toLowerCase() === 'script') {
            // Store original setter
            const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set;
            
            // Define a new setter for src property
            Object.defineProperty(element, 'src', {
                set: function(url) {
                    // Extract basename from URL (strip query params and path)
                    const urlObj = new URL(url, window.location.href);
                    const path = urlObj.pathname;
                    const basename = path.split('/').pop();
                    
                    // Check if this is a script we want to guard against reloading
                    const isGuardedScript = [
                        'module-loader.js',
                        'chart-manager.js',
                        'auditDashboardController.js',
                        'section-navigation-fix.js'
                    ].some(name => basename.includes(name));
                    
                    // If it's a script we're guarding and it was already loaded, skip reloading
                    if (isGuardedScript && window.loadedScripts[basename]) {
                        console.log(`🛑 Prevented duplicate loading of: ${basename}`);
                        // We set a non-existent URL to make the script "succeed" but not actually load anything
                        return originalSrcSetter.call(this, 'about:blank');
                    }
                    
                    // Otherwise, proceed with the original setter
                    window.loadedScripts[basename] = true;
                    return originalSrcSetter.call(this, url);
                },
                get: function() {
                    return Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').get.call(this);
                },
                enumerable: true
            });
        }
        return element;
    };
    
    // Function to safely check if an object exists globally
    function objectExists(name) {
        return typeof window[name] !== 'undefined';
    }
    
    // Function to monitor when new scripts are added and prevent duplicate class declarations
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'SCRIPT') {
                        // When a new script is added, we'll add an error handler
                        node.addEventListener('error', (e) => {
                            // Check if this was our "skip" URL
                            if (node.src === 'about:blank') {
                                // Prevent the error from propagating
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // Fake the load event
                                setTimeout(() => {
                                    const loadEvent = new Event('load');
                                    node.dispatchEvent(loadEvent);
                                }, 0);
                                
                                return false;
                            }
                        });
                    }
                });
            }
        });
    });
    
    // Start observing document for script additions
    observer.observe(document, { childList: true, subtree: true });
    
    console.log('Script Loader Guard: Initialized successfully');
    
    // Ensure we've restored any objects that might have been overwritten
    guardedObjects.forEach(objName => {
        if (window.loadedObjects[objName] && (!objectExists(objName) || window[objName] !== window.loadedObjects[objName])) {
            window[objName] = window.loadedObjects[objName];
            console.log(`Restored protected object: ${objName}`);
        }
    });
})();
