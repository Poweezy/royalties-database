/**
 * This script adds the required resource tracker and section navigation fix scripts
 * to fix the issue where other sections don't work after clicking on the audit dashboard.
 * 
 * To use:
 * 1. Load this script in a browser console when viewing the royalties.html page
 * 2. The script will dynamically inject the required scripts
 * 3. Check the console for confirmation
 */

(function() {
    console.log('Adding resource tracker and section navigation fix scripts...');
    
    // Create and add resource tracker script
    const resourceTrackerScript = document.createElement('script');
    resourceTrackerScript.src = 'js/resource-tracker.js?v=' + Date.now();
    resourceTrackerScript.onload = function() {        console.log('Resource tracker script loaded successfully');
        
        // Create and add module loader fix script
        const moduleLoaderFixScript = document.createElement('script');
        moduleLoaderFixScript.src = 'js/module-loader-fix.js?v=' + Date.now();
        moduleLoaderFixScript.onload = function() {
            console.log('Module loader fix script loaded successfully');
            
            // Next, create and add section navigation fix script
            const navigationFixScript = document.createElement('script');
            navigationFixScript.src = 'js/section-navigation-fix.js?v=' + Date.now();
            navigationFixScript.onload = function() {
                console.log('Navigation fix script loaded successfully');
                console.log('All fix scripts loaded. You should now be able to navigate between sections.');
            };
            navigationFixScript.onerror = function() {
                console.error('Failed to load navigation fix script');
            };
            document.head.appendChild(navigationFixScript);
        };
        moduleLoaderFixScript.onerror = function() {
            console.error('Failed to load module loader fix script');
        };
        document.head.appendChild(moduleLoaderFixScript);
        navigationFixScript.onerror = function() {
            console.error('Failed to load navigation fix script');
        };
        document.head.appendChild(navigationFixScript);
    };
    resourceTrackerScript.onerror = function() {
        console.error('Failed to load resource tracker script');
    };
    document.head.appendChild(resourceTrackerScript);
    
    console.log('Scripts injection initiated. Check console for results.');
})();