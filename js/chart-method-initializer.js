/**
 * ChartManager Method Initializer
 * Ensures all required chart methods are available on the window.chartManager object
 */

(function() {
    'use strict';
    
    console.log('=== CHART METHOD INITIALIZER STARTING ===');
    
    // Function to add the createProductionChart method if missing
    function ensureChartMethods() {
        if (!window.chartManager) {
            console.error('ChartManager not found, cannot add methods');
            return;
        }
        
        // Add createProductionChart method if missing
        if (typeof window.chartManager.createProductionChart !== 'function') {
            console.log('Adding createProductionChart method to ChartManager');
            
            window.chartManager.createProductionChart = function(canvasId, entityData) {
                console.log(`ChartManager: Creating production chart on ${canvasId}`);
                
                // Try to find the canvas with the given ID or known alias
                let canvas = document.getElementById(canvasId);
                if (!canvas && canvasId === 'production-by-entity-chart') {
                    console.log('Using revenue-by-entity-chart as alias for production chart');
                    canvas = document.getElementById('revenue-by-entity-chart');
                    if (canvas) canvasId = 'revenue-by-entity-chart';
                } else if (!canvas && canvasId === 'revenue-by-entity-chart') {
                    console.log('Using production-by-entity-chart as alias for revenue chart');
                    canvas = document.getElementById('production-by-entity-chart');
                    if (canvas) canvasId = 'production-by-entity-chart';
                }
                
                if (!canvas) {
                    console.error(`ChartManager: Canvas with id '${canvasId}' not found for production chart`);
                    return null;
                }
                
                // Use sample data if needed
                if (!entityData || typeof entityData !== 'object' || Object.keys(entityData).length === 0) {
                    console.log('Using sample entity data for production chart');
                    entityData = {
                        'Diamond Mining Corp': 150,
                        'Gold Rush Ltd': 85, 
                        'Copper Valley Mining': 2500,
                        'Rock Aggregates': 350,
                        'Mountain Iron': 1220
                    };
                }
                
                const labels = Object.keys(entityData);
                const values = Object.values(entityData);
                
                // Generate colors
                const colorSchemes = this.colorSchemes || {
                    primary: [
                        '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', '#adc8f5',
                        '#6b32a8', '#8a41d8', '#a463f3', '#bc86f8', '#d1a9fc', '#e5ccfe'
                    ]
                };
                
                const colors = labels.map((_, i) => colorSchemes.primary[i % colorSchemes.primary.length]);
                
                const chartData = {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors
                    }]
                };
                
                return this.create(canvasId, {
                    type: 'doughnut',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const value = context.raw;
                                        const total = values.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            };
        } else {
            console.log('createProductionChart method already exists');
        }
        
        // Log available methods
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(window.chartManager))
            .filter(method => typeof window.chartManager[method] === 'function');
            
        console.log('Available ChartManager methods:', methods);
    }
    
    // Run once when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Wait a moment to ensure ChartManager is initialized first
            setTimeout(ensureChartMethods, 100);
        });
    } else {
        setTimeout(ensureChartMethods, 100);
    }
    
    // Also run when window is fully loaded
    window.addEventListener('load', function() {
        // Extra check to ensure methods are available after everything else loads
        setTimeout(ensureChartMethods, 200);
    });
    
    // Call it once now in case ChartManager is already available
    setTimeout(ensureChartMethods, 0);
    
    console.log('=== CHART METHOD INITIALIZER LOADED ===');
})();
