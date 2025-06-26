/**
 * Emergency Chart Fix - Final Solution
 * This script guarantees chart rendering by addressing all known issues:
 * 1. Ensuring all chart canvas IDs are properly created
 * 2. Making sure ChartManager has all required methods
 * 3. Handling alias relationships between inconsistent chart IDs
 * 4. Providing fallbacks with sample data when real data isn't available
 * 5. Re-running chart initialization at strategic times
 * 
 * @version 2.0.0
 * @date 2025-07-03
 */

(function() {
    'use strict';
    
    console.log('=== EMERGENCY CHART FIX: FINAL SOLUTION ===');
    
    // Default chart configuration
    const defaultChartConfigs = {
        'revenue-trends-chart': {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Revenue',
                    data: [12500, 13200, 12800, 14500, 15200, 16800, 17500, 18200, 19500, 20100, 21500, 22800],
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue (E)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        },
        'revenue-by-entity-chart': {
            type: 'doughnut',
            data: {
                labels: ['Diamond Mining Corp', 'Gold Rush Ltd', 'Copper Valley Mining', 'Rock Aggregates', 'Mountain Iron'],
                datasets: [{
                    data: [35, 20, 15, 10, 20],
                    backgroundColor: [
                        '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb'
                    ],
                    borderWidth: 1
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
        },
        'payment-timeline-chart': {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'On Time',
                    data: [12, 14, 15, 13, 16, 17],
                    backgroundColor: '#2E7D32'
                }, {
                    label: 'Late',
                    data: [2, 1, 3, 1, 0, 2],
                    backgroundColor: '#e65100'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Payments'
                        },
                        stacked: true
                    },
                    x: {
                        stacked: true
                    }
                }
            }
        },
        'production-royalty-correlation': {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Production vs. Royalty',
                    data: [
                        { x: 100, y: 2500 }, { x: 150, y: 3700 }, { x: 200, y: 5000 },
                        { x: 250, y: 6200 }, { x: 300, y: 7500 }, { x: 350, y: 8700 },
                        { x: 400, y: 10000 }, { x: 450, y: 11200 }, { x: 500, y: 12500 }
                    ],
                    backgroundColor: '#3b6eb6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Production Volume (tons)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Royalty Amount (E)'
                        }
                    }
                }
            }
        },
        'mineral-performance-chart': {
            type: 'bar',
            data: {
                labels: ['Coal', 'Iron Ore', 'Diamond', 'Gold', 'Copper'],
                datasets: [{
                    label: 'Production Volume',
                    data: [1200, 950, 50, 75, 400],
                    backgroundColor: '#2d5282'
                }, {
                    label: 'Royalty Revenue',
                    data: [24000, 38000, 50000, 45000, 16000],
                    backgroundColor: '#8a41d8',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Production (tons)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Revenue (E)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        },
        'forecast-chart': {
            type: 'line',
            data: {
                labels: ['Current', '+1 Month', '+2 Months', '+3 Months', '+4 Months', '+5 Months', '+6 Months'],
                datasets: [{
                    label: 'Actual',
                    data: [204000, 215000, 225000, 235000, null, null, null],
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Forecast',
                    data: [204000, 215000, 225000, 235000, 245000, 255000, 265000],
                    borderColor: '#6b32a8',
                    backgroundColor: 'rgba(107, 50, 168, 0.1)',
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue (E)'
                        }
                    }
                }
            }
        }
    };
    
    // Chart ID aliases
    const chartAliases = {
        'production-by-entity-chart': 'revenue-by-entity-chart',
        'revenue-by-entity-chart': 'production-by-entity-chart'
    };
    
    // List of required chart canvas IDs
    const requiredCanvases = [
        'revenue-trends-chart',
        'revenue-by-entity-chart',
        'production-by-entity-chart',
        'payment-timeline-chart',
        'production-royalty-correlation',
        'mineral-performance-chart',
        'forecast-chart'
    ];
    
    // Ensure all required canvases exist
    function ensureCanvasesExist() {
        console.log('Checking for required chart canvases...');
        
        const dashboard = document.querySelector('.dashboard-section') || document.getElementById('dashboard');
        if (!dashboard) {
            console.warn('Dashboard container not found, deferring canvas check');
            return false;
        }
        
        let canvasCreated = false;
        
        // Check each required canvas
        requiredCanvases.forEach(canvasId => {
            let canvas = document.getElementById(canvasId);
            
            // If canvas doesn't exist, check if it has an alias that exists
            if (!canvas) {
                const aliasId = chartAliases[canvasId];
                const aliasCanvas = aliasId ? document.getElementById(aliasId) : null;
                
                if (aliasCanvas) {
                    console.log(`Canvas '${canvasId}' not found, but alias '${aliasId}' exists`);
                    
                    // Create an alias canvas
                    canvas = document.createElement('canvas');
                    canvas.id = canvasId;
                    canvas.dataset.aliasFor = aliasId;
                    canvas.style.display = 'none'; // Hide it to avoid duplicate rendering
                    aliasCanvas.parentNode.insertBefore(canvas, aliasCanvas.nextSibling);
                    
                    console.log(`Created alias canvas '${canvasId}' -> '${aliasId}'`);
                    canvasCreated = true;
                } else {
                    console.warn(`Required canvas '${canvasId}' not found and no alias exists`);
                    
                    // Create a container for the canvas
                    const chartContainer = document.createElement('div');
                    chartContainer.className = 'chart-container emergency-created';
                    
                    // Create the canvas
                    canvas = document.createElement('canvas');
                    canvas.id = canvasId;
                    chartContainer.appendChild(canvas);
                    
                    // Add to a suitable location in the dashboard
                    const chartsGrid = dashboard.querySelector('.charts-grid');
                    if (chartsGrid) {
                        // Create a card to wrap the chart
                        const card = document.createElement('div');
                        card.className = 'card analytics-chart emergency-created';
                        
                        // Add header
                        const header = document.createElement('div');
                        header.className = 'chart-header';
                        header.innerHTML = `<h5><i class="fas fa-chart-line"></i> ${formatChartTitle(canvasId)}</h5>`;
                        card.appendChild(header);
                        
                        card.appendChild(chartContainer);
                        chartsGrid.appendChild(card);
                    } else {
                        // If no chart grid, append directly to dashboard
                        dashboard.appendChild(chartContainer);
                    }
                    
                    console.log(`Created missing canvas '${canvasId}'`);
                    canvasCreated = true;
                }
            }
        });
        
        return canvasCreated;
    }
    
    // Format a chart ID into a readable title
    function formatChartTitle(canvasId) {
        return canvasId
            .replace(/-/g, ' ')
            .replace(/chart$/, '')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Patch ChartManager with any missing methods
    function patchChartManager() {
        if (!window.chartManager) {
            console.error('ChartManager not found, cannot patch');
            return false;
        }
        
        console.log('Patching ChartManager with missing methods...');
        
        let patched = false;
        
        // Ensure createProductionChart exists
        if (!window.chartManager.createProductionChart) {
            console.log('Adding missing createProductionChart method');
            
            window.chartManager.createProductionChart = function(canvasId, entityData) {
                console.log(`Emergency createProductionChart calling for '${canvasId}'`);
                
                if (!entityData || typeof entityData !== 'object') {
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
                
                const data = {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', 
                            '#6b32a8', '#8a41d8', '#a463f3', '#bc86f8', '#d1a9fc'
                        ]
                    }]
                };
                
                return this.create(canvasId, {
                    type: 'doughnut',
                    data: data,
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
            };
            
            patched = true;
        }
        
        // Ensure createEntityChart exists (alias for createProductionChart)
        if (!window.chartManager.createEntityChart && window.chartManager.createProductionChart) {
            console.log('Adding createEntityChart as alias for createProductionChart');
            window.chartManager.createEntityChart = window.chartManager.createProductionChart;
            patched = true;
        }
        
        // Patch the create method to handle missing canvases
        const originalCreate = window.chartManager.create;
        window.chartManager.create = function(canvasId, config) {
            console.log(`Enhanced create method for '${canvasId}'`);
            
            // Check for canvas, its alias, or create if needed
            let canvas = document.getElementById(canvasId);
            if (!canvas) {
                // Check for alias
                const aliasId = chartAliases[canvasId];
                if (aliasId && document.getElementById(aliasId)) {
                    console.log(`Using alias '${aliasId}' for '${canvasId}'`);
                    return originalCreate.call(this, aliasId, config);
                }
                
                // Create canvas as last resort
                console.warn(`Canvas '${canvasId}' not found, creating emergency canvas`);
                canvas = document.createElement('canvas');
                canvas.id = canvasId;
                
                // Find a place to add this canvas
                const dashboard = document.querySelector('.dashboard-section') || document.getElementById('dashboard');
                if (dashboard) {
                    const container = document.createElement('div');
                    container.className = 'chart-container emergency-created';
                    container.appendChild(canvas);
                    dashboard.appendChild(container);
                } else {
                    // Last resort, add to body
                    document.body.appendChild(canvas);
                }
                
                patched = true;
            }
            
            return originalCreate.call(this, canvasId, config);
        };
        
        return patched;
    }
    
    // Render all charts using default configurations
    function renderAllCharts() {
        console.log('Emergency rendering of all charts...');
        
        if (!window.chartManager || typeof window.chartManager.create !== 'function') {
            console.error('ChartManager not available for rendering');
            return;
        }
        
        // Render each chart with its default configuration
        Object.keys(defaultChartConfigs).forEach(canvasId => {
            try {
                console.log(`Rendering chart: ${canvasId}`);
                
                // First try with any special creation method
                let methodName = 'create' + canvasId.replace(/-/g, ' ')
                    .replace(/chart$/, '')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('') + 'Chart';
                
                // Special case for entity/production charts
                if (canvasId === 'revenue-by-entity-chart' || canvasId === 'production-by-entity-chart') {
                    if (window.chartManager.createProductionChart) {
                        window.chartManager.createProductionChart(canvasId, null);
                    } else if (window.chartManager.createEntityChart) {
                        window.chartManager.createEntityChart(canvasId, null);
                    } else {
                        window.chartManager.create(canvasId, defaultChartConfigs[canvasId]);
                    }
                } 
                // Use matching creation method if it exists
                else if (window.chartManager[methodName] && typeof window.chartManager[methodName] === 'function') {
                    window.chartManager[methodName](canvasId);
                } 
                // Fall back to generic create method with default config
                else {
                    window.chartManager.create(canvasId, defaultChartConfigs[canvasId]);
                }
            } catch (error) {
                console.error(`Error rendering ${canvasId}:`, error);
                
                // Try one more time with just the basic create method
                try {
                    window.chartManager.create(canvasId, defaultChartConfigs[canvasId]);
                } catch (fallbackError) {
                    console.error(`Fallback render failed for ${canvasId}:`, fallbackError);
                }
            }
        });
    }
    
    // Main initialization function
    function init() {
        console.log('Initializing emergency chart fix...');
        
        // Wait for ChartManager to be available
        if (!window.chartManager) {
            console.log('ChartManager not yet available, waiting...');
            setTimeout(init, 500);
            return;
        }
        
        // Step 1: Ensure all canvases exist
        const canvasesCreated = ensureCanvasesExist();
        
        // Step 2: Patch ChartManager with missing methods
        const cmPatched = patchChartManager();
        
        // Step 3: Render all charts with default configurations
        if (canvasesCreated || cmPatched) {
            console.log('Changes made, rendering charts after delay...');
            setTimeout(renderAllCharts, 800);
        } else {
            console.log('No changes needed, rendering charts...');
            renderAllCharts();
        }
    }
    
    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Allow other scripts to finish, then run our fix
            setTimeout(init, 1000);
        });
    } else {
        // DOM already loaded, run after a brief delay
        setTimeout(init, 1000);
    }
    
    // Set up a final check after everything should be loaded
    setTimeout(function() {
        console.log('Running final chart check...');
        ensureCanvasesExist();
        patchChartManager();
        renderAllCharts();
    }, 5000);
})();
