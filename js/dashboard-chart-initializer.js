/**
 * Dashboard Chart Initializer
 * @version 1.0.0
 * @date 2025-07-06
 * @description Initializes all charts when the dashboard content is loaded
 */

(function(window) {
    'use strict';
    
    console.log('Dashboard Chart Initializer: Starting...');
    
    // Register the global initialization function
    window.initializeAllCharts = function() {
        console.log('initializeAllCharts: Starting chart initialization...');
        
        // Check if chartManager exists
        if (!window.chartManager) {
            console.error('initializeAllCharts: chartManager not found, cannot initialize charts');
            return;
        }
        
        // Initialize entity/production chart
        initChart('revenue-by-entity-chart', 'production-by-entity-chart', 'entity', {
            'Diamond Mining Corp': 150,
            'Gold Rush Ltd': 85, 
            'Copper Valley Mining': 2500
        });
        
        // Initialize revenue trends chart
        initChart('revenue-trends-chart', null, 'revenue');
        
        // Initialize status distribution chart
        initChart('status-distribution-chart', null, 'status');
        
        // Initialize other charts
        ['payment-timeline-chart', 'mineral-performance-chart', 'production-royalty-correlation'].forEach(function(chartId) {
            initChart(chartId, null, 'general');
        });
        
        console.log('initializeAllCharts: All charts initialized');
    };
    
    // Helper function to handle chart initialization with fallbacks
    function initChart(primaryId, fallbackId, chartType, data) {
        console.log(`Dashboard Chart Initializer: Initializing ${chartType} chart with ID ${primaryId}`);
        
        // Find the canvas
        let canvas = document.getElementById(primaryId);
        if (!canvas && fallbackId) {
            canvas = document.getElementById(fallbackId);
        }
        
        if (!canvas) {
            console.error(`Dashboard Chart Initializer: Canvas not found for ${primaryId}`);
            return;
        }
        
        // Choose the appropriate method based on chart type
        const canvasId = canvas.id;
        switch(chartType) {
            case 'entity':
            case 'production':
                // Try both methods
                if (typeof window.chartManager.createProductionChart === 'function') {
                    console.log(`Dashboard Chart Initializer: Using createProductionChart for ${canvasId}`);
                    window.chartManager.createProductionChart(canvasId, data);
                } else if (typeof window.chartManager.createEntityChart === 'function') {
                    console.log(`Dashboard Chart Initializer: Using createEntityChart for ${canvasId}`);
                    window.chartManager.createEntityChart(canvasId, data);
                } else {
                    console.error(`Dashboard Chart Initializer: No suitable method found for ${chartType} chart`);
                }
                break;
                
            case 'revenue':
                if (typeof window.chartManager.createRevenueChart === 'function') {
                    console.log(`Dashboard Chart Initializer: Using createRevenueChart for ${canvasId}`);
                    window.chartManager.createRevenueChart(canvasId);
                }
                break;
                
            case 'status':
                if (typeof window.chartManager.createStatusChart === 'function') {
                    console.log(`Dashboard Chart Initializer: Using createStatusChart for ${canvasId}`);
                    window.chartManager.createStatusChart(canvasId);
                }
                break;
                
            default:
                // Generic chart initialization
                if (typeof window.chartManager.create === 'function') {
                    console.log(`Dashboard Chart Initializer: Using generic chart creation for ${canvasId}`);
                    window.chartManager.create(canvasId, {
                        type: 'bar',
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [{
                                label: 'Performance',
                                data: [65, 59, 80, 81, 56, 55],
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgb(54, 162, 235)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false
                        }
                    });
                }
        }
    }
    
    // Initialize when document is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Dashboard Chart Initializer: DOM loaded, waiting for dashboard content...');
        
        // Check if dashboard is already loaded
        if (document.getElementById('dashboard')) {
            console.log('Dashboard Chart Initializer: Dashboard already loaded, initializing charts...');
            window.initializeAllCharts();
        }
        
        // Otherwise watch for dashboard content to load
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.id === 'dashboard' || (node.querySelector && node.querySelector('#dashboard'))) {
                            console.log('Dashboard Chart Initializer: Dashboard loaded, initializing charts...');
                            setTimeout(window.initializeAllCharts, 100); // Small delay to ensure DOM is fully processed
                            observer.disconnect();
                            break;
                        }
                    }
                }
            });
        });
        
        // Start observing document for dashboard insertion
        observer.observe(document.body, { childList: true, subtree: true });
    });
    
    // Also try on window load as a fallback
    window.addEventListener('load', function() {
        if (document.getElementById('dashboard')) {
            console.log('Dashboard Chart Initializer: Window loaded with dashboard present, initializing charts...');
            window.initializeAllCharts();
        }
    });
    
    console.log('Dashboard Chart Initializer: Setup complete');
})(window);
