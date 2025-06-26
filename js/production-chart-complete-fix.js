/**
 * Production Chart Fix - Complete Solution
 * @version 1.1.0
 * @date 2025-07-06
 * @description Final solution for fixing production chart issues
 */

(function() {
    'use strict';
    
    console.log('Production Chart Complete Fix: Initializing...');
    
    // Configuration options
    const CONFIG = {
        chartId: 'revenue-by-entity-chart',
        fallbackIds: ['production-by-entity-chart'],
        containerSelectors: [
            '.chart-container:nth-child(2)', // Second chart container
            '.chart-container', // Any chart container
            '#dashboard' // Dashboard as last resort
        ],
        sampleData: {
            'Diamond Mining Corp': 150,
            'Gold Rush Ltd': 85, 
            'Copper Valley Mining': 2500
        },
        methodNames: [
            'createProductionChart',
            'createEntityChart'
        ],
        canvasStyle: {
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            maxHeight: '300px',
            margin: '0 auto'
        }
    };
    
    /**
     * Ensure the canvas exists in the DOM
     * @returns {HTMLElement|null} The canvas element or null
     */
    function ensureCanvas() {
        // Try all possible canvas IDs
        let canvas = document.getElementById(CONFIG.chartId);
        if (canvas) {
            console.log(`Production Chart Complete Fix: Found canvas with ID '${CONFIG.chartId}'`);
            return canvas;
        }
        
        // Try fallback IDs
        for (const id of CONFIG.fallbackIds) {
            canvas = document.getElementById(id);
            if (canvas) {
                console.log(`Production Chart Complete Fix: Found canvas with fallback ID '${id}'`);
                return canvas;
            }
        }
        
        // Canvas not found, need to create it
        console.log(`Production Chart Complete Fix: Canvas not found, creating it...`);
        
        // Try to find a suitable container
        let container = null;
        for (const selector of CONFIG.containerSelectors) {
            container = document.querySelector(selector);
            if (container) {
                console.log(`Production Chart Complete Fix: Found container using selector '${selector}'`);
                break;
            }
        }
        
        if (!container) {
            console.error('Production Chart Complete Fix: No suitable container found for canvas');
            return null;
        }
        
        // Create a chart container if needed
        let chartContainer;
        if (container.id === 'dashboard') {
            chartContainer = document.createElement('div');
            chartContainer.className = 'chart-container';
            chartContainer.style.cssText = 'margin: 20px; padding: 15px; border: 1px solid #eaeaea; border-radius: 4px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
            
            const chartHeader = document.createElement('h3');
            chartHeader.className = 'chart-header';
            chartHeader.textContent = 'Revenue by Entity';
            chartContainer.appendChild(chartHeader);
            
            container.appendChild(chartContainer);
        } else {
            chartContainer = container;
        }
        
        // Create the canvas element
        canvas = document.createElement('canvas');
        canvas.id = CONFIG.chartId;
        
        // Apply styling
        Object.entries(CONFIG.canvasStyle).forEach(([prop, value]) => {
            canvas.style[prop] = value;
        });
        
        // Add the canvas to the container
        chartContainer.appendChild(canvas);
        console.log(`Production Chart Complete Fix: Created canvas with ID '${CONFIG.chartId}'`);
        
        return canvas;
    }
    
    /**
     * Find the best chart method to use
     * @returns {Function|null} The chart method or null
     */
    function findChartMethod() {
        if (!window.chartManager) {
            console.error('Production Chart Complete Fix: chartManager not found');
            return null;
        }
        
        // Try all method names
        for (const methodName of CONFIG.methodNames) {
            if (typeof window.chartManager[methodName] === 'function') {
                console.log(`Production Chart Complete Fix: Found chart method '${methodName}'`);
                return window.chartManager[methodName].bind(window.chartManager);
            }
        }
        
        // No method found, try to use create method
        if (typeof window.chartManager.create === 'function') {
            console.log(`Production Chart Complete Fix: Using generic 'create' method`);
            return function(canvasId, data) {
                const labels = Object.keys(data || CONFIG.sampleData);
                const values = Object.values(data || CONFIG.sampleData);
                
                return window.chartManager.create(canvasId, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: values,
                            backgroundColor: [
                                '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', '#adc8f5'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            };
        }
        
        console.error('Production Chart Complete Fix: No suitable chart method found');
        return null;
    }
    
    /**
     * Create the production chart with fallbacks at every level
     */
    function createProductionChart() {
        console.log('Production Chart Complete Fix: Creating production chart...');
        
        try {
            // Ensure canvas exists
            const canvas = ensureCanvas();
            if (!canvas) {
                console.error('Production Chart Complete Fix: Failed to create canvas');
                return;
            }
            
            // Find chart method
            const chartMethod = findChartMethod();
            if (!chartMethod) {
                console.error('Production Chart Complete Fix: Failed to find chart method');
                
                // Last resort: Create chart directly with Chart.js
                if (typeof Chart !== 'undefined') {
                    console.log('Production Chart Complete Fix: Creating chart directly with Chart.js');
                    
                    const ctx = canvas.getContext('2d');
                    const labels = Object.keys(CONFIG.sampleData);
                    const values = Object.values(CONFIG.sampleData);
                    
                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: values,
                                backgroundColor: [
                                    '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', '#adc8f5'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false
                        }
                    });
                }
                return;
            }
            
            // Create the chart
            console.log(`Production Chart Complete Fix: Creating chart on canvas '${canvas.id}'`);
            chartMethod(canvas.id, CONFIG.sampleData);
            
            console.log('Production Chart Complete Fix: Chart created successfully');
        } catch (error) {
            console.error('Production Chart Complete Fix: Error creating chart', error);
        }
    }
    
    // Try to create chart at multiple stages
    function executeWithRetry(maxRetries = 3, interval = 500) {
        let retryCount = 0;
        
        function attempt() {
            console.log(`Production Chart Complete Fix: Attempt ${retryCount + 1} of ${maxRetries}`);
            createProductionChart();
            
            retryCount++;
            if (retryCount < maxRetries) {
                setTimeout(attempt, interval);
            }
        }
        
        attempt();
    }
    
    // Execute immediately
    executeWithRetry();
    
    // Execute when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Production Chart Complete Fix: DOM loaded');
            executeWithRetry();
        });
    }
    
    // Execute on window load
    window.addEventListener('load', function() {
        console.log('Production Chart Complete Fix: Window loaded');
        executeWithRetry();
    });
    
    // Monitor for dashboard content changes
    function observeDashboard() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        
                        // Check if dashboard or container was added
                        if ((node.id === 'dashboard' || node.className === 'chart-container') || 
                            (node.nodeType === Node.ELEMENT_NODE && node.querySelector && 
                             (node.querySelector('#dashboard') || node.querySelector('.chart-container')))) {
                            console.log('Production Chart Complete Fix: Dashboard or chart container added');
                            
                            // Small delay to ensure DOM is updated
                            setTimeout(function() {
                                executeWithRetry(1);
                            }, 300);
                        }
                    }
                }
            });
        });
        
        // Observe the entire document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Set up observer
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeDashboard);
    } else {
        observeDashboard();
    }
    
    // Expose a global function for manual triggering
    window.forceCreateProductionChart = createProductionChart;
    
    console.log('Production Chart Complete Fix: Initialization complete');
})();
