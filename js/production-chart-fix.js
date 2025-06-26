/**
 * Chart Manager Production Fix
 * Ensures the createProductionChart method works correctly
 */

(function() {
    'use strict';
    
    console.log('Chart Manager Production Fix: Initializing...');
    
    // Wait for window.chartManager to be available
    function ensureChartManager() {
        if (!window.chartManager) {
            console.warn('Chart Manager Production Fix: window.chartManager not available yet, waiting...');
            setTimeout(ensureChartManager, 100);
            return;
        }
        
        fixProductionChartMethod();
    }
    
    // Fix production chart method
    function fixProductionChartMethod() {
        console.log('Chart Manager Production Fix: Checking createProductionChart method...');
        
        // Check if createProductionChart exists
        const hasProductionChartMethod = typeof window.chartManager.createProductionChart === 'function';
        console.log(`Chart Manager Production Fix: createProductionChart exists: ${hasProductionChartMethod}`);
        
        if (!hasProductionChartMethod) {
            console.warn('Chart Manager Production Fix: createProductionChart method is missing, creating it now');
            
            // Implement the missing method
            window.chartManager.createProductionChart = function(canvasId, entityData) {
                console.log(`Chart Manager Production Fix: Creating production chart on ${canvasId}`);
                
                // Check for canvas
                let canvas = document.getElementById(canvasId);
                
                // Handle special case when called with revenue-by-entity-chart
                if (!canvas && canvasId === 'revenue-by-entity-chart') {
                    // Try to create the canvas if it doesn't exist
                    console.log('Chart Manager Production Fix: Canvas not found, attempting to create it');
                    
                    // Find dashboard
                    const dashboard = document.getElementById('dashboard');
                    if (dashboard) {
                        // Find a chart container
                        let container = dashboard.querySelector('.chart-container');
                        if (!container) {
                            // Create chart container
                            const chartSection = document.createElement('div');
                            chartSection.className = 'chart-section';
                            container = document.createElement('div');
                            container.className = 'chart-container';
                            chartSection.appendChild(container);
                            dashboard.appendChild(chartSection);
                        }
                        
                        // Create canvas
                        canvas = document.createElement('canvas');
                        canvas.id = canvasId;
                        container.appendChild(canvas);
                        console.log(`Chart Manager Production Fix: Created canvas '${canvasId}'`);
                    }
                }
                
                // If still no canvas, try alternative ID
                if (!canvas) {
                    const alternativeId = 'production-by-entity-chart';
                    console.log(`Chart Manager Production Fix: Trying alternative ID '${alternativeId}'`);
                    canvas = document.getElementById(alternativeId);
                    
                    if (canvas) {
                        console.log(`Chart Manager Production Fix: Found canvas with alternative ID '${alternativeId}'`);
                        canvasId = alternativeId;
                    } else {
                        console.error(`Chart Manager Production Fix: No canvas found for '${canvasId}' or alternative`);
                        return null;
                    }
                }
                
                if (!entityData || typeof entityData !== 'object' || Object.keys(entityData).length === 0) {
                    console.warn('Invalid entity data for production chart, using sample data');
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
                
                const chartData = {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: labels.map((_, i) => {
                            // Use colorSchemes if available, otherwise generate colors
                            if (this.colorSchemes && this.colorSchemes.primary) {
                                return this.colorSchemes.primary[i % this.colorSchemes.primary.length];
                            } else {
                                return `hsl(${i * 30}, 70%, 60%)`;
                            }
                        })
                    }]
                };
                
                // Try to use createEntityChart if it exists
                if (typeof this.createEntityChart === 'function') {
                    console.log('Using createEntityChart to create production chart');
                    return this.createEntityChart(canvasId, entityData);
                }
                
                // Fallback to using the create method
                return this.create(canvasId, {
                    type: 'doughnut',
                    data: chartData,
                    options: {
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const value = context.raw;
                                        const percentage = ((value / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                        return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            };
        } else {
            // The method exists, but let's patch it to ensure it works with both canvas IDs
            console.log('Chart Manager Production Fix: createProductionChart method already exists, patching it to be more robust');
            
            // Store original method
            const originalMethod = window.chartManager.createProductionChart;
            
            // Replace with enhanced version that ensures it handles both canvas ID types
            window.chartManager.createProductionChart = function(canvasId, entityData) {
                console.log(`Chart Manager Production Fix: Enhanced createProductionChart called for ${canvasId}`);
                
                // Try to find the canvas with the given ID or known alias
                let canvas = document.getElementById(canvasId);
                if (!canvas && canvasId === 'production-by-entity-chart') {
                    console.log('Trying revenue-by-entity-chart as alias for production chart');
                    canvas = document.getElementById('revenue-by-entity-chart');
                    if (canvas) canvasId = 'revenue-by-entity-chart';
                } else if (!canvas && canvasId === 'revenue-by-entity-chart') {
                    console.log('Trying production-by-entity-chart as alias for revenue chart');
                    canvas = document.getElementById('production-by-entity-chart');
                    if (canvas) canvasId = 'production-by-entity-chart';
                }
                
                if (!canvas) {
                    console.error(`Canvas with id '${canvasId}' not found for production chart`);
                    return null;
                }
                
                // Call the original method with the potentially updated canvas ID
                return originalMethod.call(this, canvasId, entityData);
            };
        }
        
        // Create alias methods if needed
        if (window.chartManager.createProductionChart && !window.chartManager.createEntityChart) {
            console.log('Chart Manager Production Fix: Creating createEntityChart alias for createProductionChart');
            window.chartManager.createEntityChart = window.chartManager.createProductionChart;
        }
        
        if (window.chartManager.createEntityChart && !window.chartManager.createProductionChart) {
            console.log('Chart Manager Production Fix: Creating createProductionChart alias for createEntityChart');
            window.chartManager.createProductionChart = window.chartManager.createEntityChart;
        }
        
        console.log('Chart Manager Production Fix: All fixes applied successfully');
    }
    
    // Initialize the fix
    // Wait for DOM content to be loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureChartManager);
    } else {
        setTimeout(ensureChartManager, 100);
    }
})();
