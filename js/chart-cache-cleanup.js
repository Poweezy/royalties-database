/**
 * Chart Cache Cleanup
 * Removes any cached chart data or manager instances
 * @version 1.0.0
 * @date 2025-07-04
 */

(function() {
    'use strict';
    
    console.log('=== CHART CACHE CLEANUP STARTED ===');
    
    // Clear any chart.js instances
    function cleanupChartInstances() {
        if (window.Chart && window.Chart.instances) {
            console.log(`Cleaning up ${Object.keys(window.Chart.instances).length} Chart.js instances`);
            
            // Destroy all Chart.js instances
            Object.values(window.Chart.instances).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
            
            console.log('All Chart.js instances destroyed');
        }
    }
    
    // Clear chartManager instances
    function cleanupChartManager() {
        if (window.chartManager) {
            if (typeof window.chartManager.destroyAll === 'function') {
                console.log('Destroying all charts in chartManager');
                window.chartManager.destroyAll();
            }
            
            // Clear any internal chart storage
            if (window.chartManager._charts) {
                console.log(`Clearing ${Object.keys(window.chartManager._charts).length} stored charts`);
                Object.keys(window.chartManager._charts).forEach(key => {
                    if (window.chartManager._charts[key] && 
                        typeof window.chartManager._charts[key].destroy === 'function') {
                        window.chartManager._charts[key].destroy();
                    }
                });
                window.chartManager._charts = {};
            }
            
            // Clear charts Map if it exists
            if (window.chartManager.charts && 
                typeof window.chartManager.charts === 'object' && 
                typeof window.chartManager.charts.clear === 'function') {
                console.log('Clearing chartManager charts map');
                window.chartManager.charts.clear();
            }
        }
    }
    
    // Clear all canvas elements
    function resetCanvasElements() {
        const chartCanvases = [
            'revenue-trends-chart',
            'production-by-entity-chart', 
            'revenue-by-entity-chart',
            'status-distribution-chart',
            'payment-timeline-chart'
        ];
        
        chartCanvases.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                console.log(`Resetting canvas: ${id}`);
                const context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);
                // Force redraw
                canvas.width = canvas.width;
            }
        });
    }
    
    // Run all cleanup functions
    function runCleanup() {
        cleanupChartInstances();
        cleanupChartManager();
        resetCanvasElements();
        console.log('Chart cache cleanup completed');
    }
    
    // Run cleanup immediately 
    runCleanup();
    
    // And also after DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(runCleanup, 500);
    });
    
})();
