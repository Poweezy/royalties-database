// Chart Manager - Delegator to the main js/chart-manager.js implementation
// v3.0.0 - 2025-06-21
console.log('ChartManager delegator loaded - will use js/chart-manager.js implementation');

// This file just delegates to the main implementation
// It exists to maintain backward compatibility with existing code
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Check if the main chart manager is loaded
        if (window.chartManager) {
            console.log('Main chart manager detected - using existing implementation');
        } else {
            console.warn('Main chart manager not found - loading empty implementation');
            
            // Create an empty implementation as a fallback
            window.chartManager = {
                charts: new Map(),
                create: function(canvasId, config) {
                    console.warn('Using fallback chart manager. Please ensure js/chart-manager.js is loaded.');
                    return null;
                },
                destroy: function(canvasId) {},
                destroyAll: function() {}
            };
        }
    });
})();
