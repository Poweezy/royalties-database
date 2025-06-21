/**
 * Script Loading Guard
 * 
 * This script prevents duplicate loading of chart-related scripts
 * to avoid redeclaration errors and conflicts.
 * 
 * Version: 1.0.0 (2025-06-25)
 */

(function() {
    // Keep track of loaded scripts
    window.LOADED_SCRIPTS = window.LOADED_SCRIPTS || {};
    
    // Define critical scripts that should only be loaded once
    const criticalScripts = [
        'js/chart-manager.js',
        'chart-manager.js',
        'chart-manager-v2.js',
        'js/chart-initializer.js',
        'js/components/Chart.js'
    ];
    
    // Override createElement to intercept script additions
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        
        // Only intercept script elements
        if (tagName.toLowerCase() === 'script') {
            // Store the original setAttribute method
            const originalSetAttribute = element.setAttribute;
            
            // Override setAttribute to monitor src attributes
            element.setAttribute = function(name, value) {
                if (name.toLowerCase() === 'src') {
                    // Check if this is a critical script
                    const scriptPath = value.toLowerCase();
                    const isCritical = criticalScripts.some(criticalScript => 
                        scriptPath.includes(criticalScript.toLowerCase()));
                    
                    if (isCritical) {
                        // Check if already loaded
                        if (window.LOADED_SCRIPTS[value]) {
                            console.warn(`Preventing duplicate loading of: ${value}`);
                            // Create a dummy script instead
                            this.setAttribute = originalSetAttribute;
                            this.setAttribute('data-prevented', value);
                            this.setAttribute('type', 'text/plain');
                            return;
                        } else {
                            // Mark as loaded
                            window.LOADED_SCRIPTS[value] = true;
                            console.log(`Allowing first load of: ${value}`);
                        }
                    }
                }
                
                // Call original method for all other cases
                originalSetAttribute.call(this, name, value);
            };
        }
        
        return element;
    };
    
    // Enhanced script loading function that prevents duplicates
    window.loadScriptOnce = function(src, id) {
        // If already loaded, don't load again
        if (document.getElementById(id) || window.LOADED_SCRIPTS[src]) {
            console.log(`Script already loaded: ${src}`);
            return Promise.resolve();
        }
        
        // Mark as loaded immediately to prevent race conditions
        window.LOADED_SCRIPTS[src] = true;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.id = id;
            script.onload = () => {
                console.log(`Loaded script: ${src}`);
                resolve();
            };
            script.onerror = (err) => {
                console.error(`Failed to load script: ${src}`);
                window.LOADED_SCRIPTS[src] = false; // Reset the loaded flag
                reject(err);
            };
            document.head.appendChild(script);
        });
    };
    
    console.log('Script Loading Guard: Initialized');
})();
