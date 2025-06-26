/**
 * Chart Method Guarantee
 * @version 1.0.0
 * @date 2025-07-06
 * @description Ensures critical chart methods exist at all stages of application initialization
 */

(function() {
    'use strict';
    
    console.log('Chart Method Guarantee: Initializing...');
    
    // Execute immediately and again after DOM is loaded
    guaranteeChartMethods();
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Chart Method Guarantee: DOM loaded, ensuring methods exist...');
        guaranteeChartMethods();
        
        // Register mutation observer to detect when dashboard content is loaded
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.id === 'dashboard' || (node.querySelector && node.querySelector('#dashboard'))) {
                            console.log('Chart Method Guarantee: Dashboard loaded, ensuring methods one final time...');
                            guaranteeChartMethods();
                            
                            // Call initializeAllCharts if it exists
                            if (window.initializeAllCharts) {
                                console.log('Chart Method Guarantee: Calling initializeAllCharts()...');
                                window.initializeAllCharts();
                            }
                            
                            // Break observer once dashboard is loaded
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
    
    // Ensure chart methods exist after a short delay (for async loads)
    setTimeout(guaranteeChartMethods, 1000);
    
    // Ensure methods on window load as well
    window.addEventListener('load', function() {
        console.log('Chart Method Guarantee: Window loaded, ensuring methods exist...');
        guaranteeChartMethods();
        
        // Extra delay check after window load
        setTimeout(guaranteeChartMethods, 2000);
    });
    
    // Main function to guarantee chart methods
    function guaranteeChartMethods() {
        // Ensure chartManager exists
        if (!window.chartManager) {
            console.warn('Chart Method Guarantee: window.chartManager not found, creating skeleton...');
            window.chartManager = {
                charts: new Map(),
                isChartJsLoaded: typeof Chart !== 'undefined',
                colorSchemes: {
                    primary: ['#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', '#adc8f5'],
                    financial: ['#2E7D32', '#4CAF50', '#8BC34A', '#e65100', '#ef6c00', '#ff9800'],
                    status: {
                        'paid': '#2E7D32',
                        'pending': '#e65100',
                        'overdue': '#c62828'
                    }
                },
                create: function(canvasId, config) {
                    console.log(`Chart Method Guarantee: Basic chart creation called for ${canvasId}`);
                    const canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        console.error(`Chart Method Guarantee: Canvas with id '${canvasId}' not found`);
                        return null;
                    }
                    if (!Chart) {
                        console.error('Chart Method Guarantee: Chart.js not available');
                        return null;
                    }
                    return new Chart(canvas.getContext('2d'), config);
                }
            };
        }
        
        // Ensure required methods exist
        ensureMethod('createProductionChart', function(canvasId, data) {
            console.log(`Chart Method Guarantee: Using createProductionChart for ${canvasId}`);
            
            // Try the entityChart method first if available
            if (typeof this.createEntityChart === 'function') {
                console.log(`Chart Method Guarantee: Delegating to createEntityChart for ${canvasId}`);
                return this.createEntityChart(canvasId, data);
            }
            
            // Otherwise implement directly
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Chart Method Guarantee: Canvas '${canvasId}' not found`);
                
                // Try to find a container for the dashboard charts
                const container = document.querySelector('.chart-container') || 
                                  document.querySelector('.dashboard-charts') || 
                                  document.getElementById('dashboard');
                                  
                if (container) {
                    console.log(`Chart Method Guarantee: Creating missing canvas '${canvasId}'`);
                    const newCanvas = document.createElement('canvas');
                    newCanvas.id = canvasId;
                    container.appendChild(newCanvas);
                    return createDoughnutChart(newCanvas, data);
                }
                
                return null;
            }
            
            return createDoughnutChart(canvas, data);
        });
        
        ensureMethod('createEntityChart', function(canvasId, data) {
            console.log(`Chart Method Guarantee: Using createEntityChart for ${canvasId}`);
            
            // If createProductionChart exists and is not this function, use it
            if (typeof this.createProductionChart === 'function' && this.createProductionChart !== arguments.callee) {
                return this.createProductionChart(canvasId, data);
            }
            
            // Otherwise create a doughnut chart
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Chart Method Guarantee: Canvas '${canvasId}' not found`);
                return null;
            }
            
            return createDoughnutChart(canvas, data);
        });
        
        // Helper function to create a doughnut chart
        function createDoughnutChart(canvas, data) {
            // Convert data object if needed
            let labels, values;
            
            if (data) {
                if (data.labels && data.values) {
                    labels = data.labels;
                    values = data.values;
                } else if (typeof data === 'object' && !Array.isArray(data)) {
                    labels = Object.keys(data);
                    values = Object.values(data);
                } else {
                    labels = ['Entity A', 'Entity B', 'Entity C'];
                    values = [300, 150, 100];
                }
            } else {
                labels = ['Entity A', 'Entity B', 'Entity C'];
                values = [300, 150, 100];
            }
            
            // Create chart if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.error('Chart Method Guarantee: Chart.js not available');
                return null;
            }
            
            const colors = window.chartManager.colorSchemes.primary;
            
            return new Chart(canvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: labels.map((_, i) => colors[i % colors.length])
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Helper function to ensure a method exists
        function ensureMethod(methodName, implementation) {
            if (typeof window.chartManager[methodName] !== 'function') {
                console.log(`Chart Method Guarantee: Adding missing ${methodName} method`);
                window.chartManager[methodName] = implementation;
                
                // Also add to prototype if it exists
                if (window.chartManager.__proto__) {
                    window.chartManager.__proto__[methodName] = implementation;
                }
            }
        }
    }
})();
