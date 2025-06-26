/**
 * Chart Alias Fixer
 * Resolves inconsistencies between chart IDs across the application
 * @version 1.0.0
 * @date 2025-07-01
 */

(function() {
    'use strict';

    console.log('=== CHART ALIAS FIXER STARTING ===');

    // Define mapping between old and new chart IDs
    const chartAliases = {
        'production-by-entity-chart': 'revenue-by-entity-chart',
        'revenue-by-entity-chart': 'production-by-entity-chart'
    };

    // Create canvas element aliases for compatibility
    function createChartAliases() {
        console.log('Creating chart canvas aliases for backward compatibility...');
        
        Object.keys(chartAliases).forEach(originalId => {
            const aliasId = chartAliases[originalId];
            
            const originalCanvas = document.getElementById(originalId);
            if (originalCanvas && !document.getElementById(aliasId)) {
                console.log(`Creating alias canvas element for '${originalId}' as '${aliasId}'`);
                
                // Create a clone of the original canvas with the alias ID
                const aliasCanvas = document.createElement('canvas');
                aliasCanvas.id = aliasId;
                aliasCanvas.style.display = 'none'; // Hide it to avoid duplicate rendering
                aliasCanvas.dataset.aliasFor = originalId; // Mark as an alias
                
                // Insert the alias canvas next to the original
                originalCanvas.parentNode.insertBefore(aliasCanvas, originalCanvas.nextSibling);
            }
        });
        
        // Patch ChartManager methods if needed
        if (window.chartManager) {
            patchChartManagerMethods();
        }
        
        console.log('Chart aliases setup complete');
    }
    
    // Patch ChartManager methods to handle aliases
    function patchChartManagerMethods() {
        if (!window.chartManager) return;
        
        console.log('Patching ChartManager methods for alias support');
        
        // Store original create method
        const originalCreate = window.chartManager.create;
        
        // Override create method to check for aliases
        window.chartManager.create = function(canvasId, config) {
            // Check if there's an original canvas for this alias
            const aliasCanvas = document.getElementById(canvasId);
            if (aliasCanvas && aliasCanvas.dataset.aliasFor) {
                console.log(`Using original canvas '${aliasCanvas.dataset.aliasFor}' instead of alias '${canvasId}'`);
                return originalCreate.call(this, aliasCanvas.dataset.aliasFor, config);
            }
            
            // Check if there's an alias defined for this ID
            const aliasId = chartAliases[canvasId];
            const originalCanvas = aliasId ? document.getElementById(aliasId) : null;
            
            if (aliasId && originalCanvas && !document.getElementById(canvasId)) {
                console.log(`Canvas '${canvasId}' not found, using alias '${aliasId}' instead`);
                return originalCreate.call(this, aliasId, config);
            }
            
            // Default behavior
            return originalCreate.call(this, canvasId, config);
        };
        
        // Ensure createProductionChart exists
        if (!window.chartManager.createProductionChart && window.chartManager.createEntityChart) {
            console.log('Adding createProductionChart alias to ChartManager');
            window.chartManager.createProductionChart = window.chartManager.createEntityChart;
        }
        
        // Ensure both names are available for both functions
        if (window.chartManager.createProductionChart && !window.chartManager.createEntityChart) {
            console.log('Adding createEntityChart alias to ChartManager');
            window.chartManager.createEntityChart = window.chartManager.createProductionChart;
        }
    }
    
    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(createChartAliases, 800);
        });
    } else {
        // DOM already loaded, run immediately
        setTimeout(createChartAliases, 800);
    }

    // Also run after dashboard canvas fix
    window.addEventListener('chart-canvases-fixed', function() {
        setTimeout(createChartAliases, 300);
    });
    
    console.log('=== CHART ALIAS FIXER INITIALIZED ===');
})();
