/**
 * Component Path Fix for Mining Royalties Manager
 * @version 1.0.0
 * @date 2025-06-26
 * @description Ensures components can be loaded from correct paths
 */

(function(window) {
    'use strict';
    
    console.log('Component Path Fix: Initializing...');
    
    // Create a utility function to make component paths consistent
    window.getCorrectComponentPath = function(componentName) {
        // Try to determine if we should use /components/ or /html/components/
        const possiblePaths = [
            `components/${componentName}.html`,
            `html/components/${componentName}.html`
        ];
        
        // Store the working paths to avoid repeated failures
        if (!window.workingComponentPaths) {
            window.workingComponentPaths = {};
        }
        
        // If we already know which path works for this component, use it
        if (window.workingComponentPaths[componentName]) {
            return window.workingComponentPaths[componentName];
        }
        
        // Default to first path, will be overridden later if needed
        return `components/${componentName}.html`;
    };
    
    // Patch fetch for component loading to ensure we find the right location
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string' && url.includes('/components/')) {
            // Extract component name from URL
            const urlObj = new URL(url, window.location.origin);
            const path = urlObj.pathname;
            
            // Check if this is a component request
            const componentMatch = path.match(/\/(?:html\/)?components\/([^\/]+)\.html/);
            if (componentMatch) {
                const componentName = componentMatch[1];
                
                // Try alternatives if we have failures stored
                if (window.failedComponentPaths && window.failedComponentPaths[componentName]) {
                    // Try the alternative path
                    const isHtmlPath = path.includes('html/components');
                    const alternativePath = isHtmlPath ? 
                        path.replace('html/components', 'components') :
                        path.replace('components', 'html/components');
                    
                    console.log(`Component Path Fix: Trying alternative path for ${componentName}: ${alternativePath}`);
                    const newUrl = url.replace(path, alternativePath);
                    return originalFetch(newUrl, options);
                }
            }
        }
        
        return originalFetch(url, options);
    };

    // Track failed loads to avoid repeated failures
    window.recordFailedComponentPath = function(path) {
        if (!window.failedComponentPaths) {
            window.failedComponentPaths = {};
        }
        
        // Extract component name from path
        const componentMatch = path.match(/\/(?:html\/)?components\/([^\/]+)\.html/);
        if (componentMatch) {
            const componentName = componentMatch[1];
            window.failedComponentPaths[componentName] = path;
            console.log(`Component Path Fix: Recorded failed path for ${componentName}: ${path}`);
        }
    };

    console.log('Component Path Fix: Initialized');
    
})(window);
