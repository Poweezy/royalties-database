/**
 * Startup Script for Mining Royalties Manager
 * v1.0.0 - 2025-06-25
 * 
 * Ensures all components are properly initialized in the correct order
 */
(function() {
    'use strict';
      // Initialization function
    function initializeApplication() {
        console.log('Startup: Application initialization beginning...');
        
        // Check for file:// protocol
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            console.log('Startup: Detected file:// protocol - using limited functionality mode');
        }
          // Step 1: Ensure app object is created
        if (!window.app && !window.royaltiesApp) {
            console.warn('Startup: App object not found! Application may not function correctly.');
            return;
        }
        
        // Ensure we have a consistent reference
        if (!window.app && window.royaltiesApp) {
            window.app = window.royaltiesApp;
            console.log('Startup: Using royaltiesApp as app reference');
        } else if (window.app && !window.royaltiesApp) {
            window.royaltiesApp = window.app;
            console.log('Startup: Using app as royaltiesApp reference');
        }
        
        // Step 2: Load sidebar if needed
        const sidebar = document.getElementById('sidebar');
        if (!sidebar || sidebar.children.length === 0) {
            console.log('Startup: Sidebar empty or not loaded, triggering load...');
            
            // Special handling for file:// protocol
            if (isFileProtocol && window.moduleLoader && window.moduleLoader.fallbackComponents && window.moduleLoader.fallbackComponents['sidebar']) {
                console.log('Startup: Using fallback sidebar for file:// protocol');
                sidebar.innerHTML = window.moduleLoader.fallbackComponents['sidebar'];
            } else {
                window.app.loadSidebar().catch(error => {
                    console.error('Startup: Failed to load sidebar:', error);
                    
                    // Try fallback on error if we have it
                    if (window.moduleLoader && window.moduleLoader.fallbackComponents && window.moduleLoader.fallbackComponents['sidebar']) {
                        console.log('Startup: Using fallback sidebar after load failure');
                        sidebar.innerHTML = window.moduleLoader.fallbackComponents['sidebar'];
                    }
                });
            }
        } else {
            console.log('Startup: Sidebar already loaded');
        }
        
        // Step 3: Initialize module loader if not already done
        if (window.moduleLoader && !window.moduleLoader.initialized) {
            console.log('Startup: Initializing module loader...');
            window.moduleLoader.initialize();
        }
          // Step 4: Run diagnostics in the background
        setTimeout(() => {
            if (window.appDiagnostics && window.appDiagnostics.runAll) {
                console.log('Startup: Running diagnostics...');
                window.appDiagnostics.runAll();
            }
            
            // Fix common issues automatically
            if (window.appDiagnostics && window.appDiagnostics.runDiagnosticsAndFix) {
                console.log('Startup: Applying automatic fixes...');
                window.appDiagnostics.runDiagnosticsAndFix();
            }
        }, 3000); // Wait 3 seconds before running diagnostics
        
        console.log('Startup: Application initialization complete');
    }
    
    // Run initialization when the page is fully loaded
    window.addEventListener('load', function() {
        console.log('Startup: Page fully loaded, initializing application...');
        
        // Wait a short delay to ensure all scripts have executed
        setTimeout(initializeApplication, 500);
    });
    
    // Also listen for DOMContentLoaded as a backup
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Startup: DOM content loaded');
    });
})();
