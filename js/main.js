/**
 * Mining Royalties Database - Main Entry Script
 * 
 * This script manages the initialization sequence and loads all required modules
 * in the correct order, with proper error handling.
 */

(function() {
    'use strict';
    
    console.log('Mining Royalties Manager v3.0 - Initializing...');
    
    // Core modules to load in sequence
    const coreModules = [
        'js/module-loader.js',
        'js/chart-manager.js',
        'js/component-initializer.js',
        'js/diagnostics.js'
    ];
    
    // Fix script to ensure navigation works properly
    const fixScript = 'fix.js';
    
    // Count of successful module loads
    let loadedModules = 0;
    
    /**
     * Load modules in sequence to ensure proper initialization order
     */
    function loadModulesInSequence() {
        if (loadedModules >= coreModules.length) {
            console.log('All core modules loaded successfully!');
            loadFixScript();
            return;
        }
        
        const modulePath = coreModules[loadedModules];
        const script = document.createElement('script');
        script.src = modulePath + '?v=' + Date.now(); // Cache busting
        
        script.onload = function() {
            console.log(`✅ Loaded: ${modulePath}`);
            loadedModules++;
            loadModulesInSequence();
        };
        
        script.onerror = function() {
            console.error(`❌ Failed to load: ${modulePath}`);
            loadedModules++;
            loadModulesInSequence();
        };
        
        document.head.appendChild(script);
    }
    
    /**
     * Load the navigation fix script
     */
    function loadFixScript() {
        const script = document.createElement('script');
        script.src = fixScript + '?v=' + Date.now();
        
        script.onload = function() {
            console.log('✅ Navigation fix script loaded successfully');
        };
        
        script.onerror = function() {
            console.error('❌ Failed to load navigation fix script');
        };
        
        document.head.appendChild(script);
    }
    
    // Wait for the DOM to be ready before loading modules
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApplication);
    } else {
        initializeApplication();
    }
    
    function initializeApplication() {
        console.log('DOM ready, starting application initialization');
        loadModulesInSequence();
    }
    
    // Handle global errors
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        
        // Show user-friendly error if there's a notification manager
        if (window.notificationManager) {
            window.notificationManager.show('An error occurred. Please check the console for details.', 'error');
        }
    });
})();