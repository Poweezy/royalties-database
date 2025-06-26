/**
 * Chart Initialization Helper
 * @version 1.0.1
 * @date 2025-06-26
 * @description Ensures charts are initialized properly when dashboard content loads
 */

(function(window) {
    'use strict';
    
    console.log('Chart Initialization Helper: Starting...');
    
    // Define required chart canvases with fallback IDs
    const CHART_DEFINITIONS = [
        {
            primaryId: 'revenue-trends-chart',
            aliases: [],
            type: 'revenue',
            containerSelector: '.chart-container:has(.chart-header:contains("Revenue"))',
            initMethod: 'createRevenueChart'
        },
        {
            primaryId: 'revenue-by-entity-chart',
            aliases: ['production-by-entity-chart'],
            type: 'entity',
            containerSelector: '.chart-container:has(.chart-header:contains("Entity"))',
            initMethod: 'createEntityChart'
        },
        {
            primaryId: 'production-by-entity-chart',
            aliases: ['revenue-by-entity-chart'],
            type: 'production',
            containerSelector: '.chart-container:has(.chart-header:contains("Production"))',
            initMethod: 'createProductionChart'
        },
        {
            primaryId: 'payment-timeline-chart',
            aliases: [],
            type: 'timeline',
            containerSelector: '.chart-container:has(.chart-header:contains("Timeline"))',
            initMethod: 'create'
        },
        {
            primaryId: 'mineral-performance-chart',
            aliases: [],
            type: 'performance',
            containerSelector: '.chart-container:has(.chart-header:contains("Performance"))',
            initMethod: 'create'
        }
    ];
    
    // Ensure charts are initialized when dashboard is shown
    function setupDashboardObserver() {
        if (!window.MutationObserver) return;
        
        const dashboardObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    const dashboard = document.getElementById('dashboard');
                    if (dashboard && 
                        dashboard.style.display !== 'none' && 
                        dashboard.children.length > 0) {
                        
                        // Give time for chart canvases to be created
                        setTimeout(initializeAllCharts, 800);
                    }
                }
            }
        });
        
        // Observe the dashboard for changes
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboardObserver.observe(dashboard, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            
            // Also observe the app container for section changes
            const appContainer = document.getElementById('app-container');
            if (appContainer) {
                dashboardObserver.observe(appContainer, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            }
        }
    }
    
    // Initialize all charts
    function initializeAllCharts() {
        console.log('Chart Initialization Helper: Attempting to initialize charts...');
        
        if (!window.chartManager) {
            console.warn('Chart Initialization Helper: Chart manager not available');
            return;
        }
        
        // First verify if we have canvases
        let canvasCount = 0;
        CHART_DEFINITIONS.forEach(chartDef => {
            // Try primary ID first, then aliases
            let canvas = document.getElementById(chartDef.primaryId);
            let canvasId = chartDef.primaryId;
            
            if (!canvas && chartDef.aliases.length > 0) {
                for (const alias of chartDef.aliases) {
                    canvas = document.getElementById(alias);
                    if (canvas) {
                        canvasId = alias;
                        break;
                    }
                }
            }
            
            if (canvas) {
                canvasCount++;
                
                // Initialize chart based on its definition
                console.log(`Chart Initialization Helper: Initializing ${chartDef.type} chart on canvas '${canvasId}'`);
                
                try {
                    let method = chartDef.initMethod;
                    // Fallback methods if primary method doesn't exist
                    if (typeof window.chartManager[method] !== 'function') {
                        if (method === 'createProductionChart' && typeof window.chartManager.createEntityChart === 'function') {
                            method = 'createEntityChart';
                            console.log(`Chart Initialization Helper: Using fallback method '${method}' for ${chartDef.type} chart`);
                        } else if (method === 'createEntityChart' && typeof window.chartManager.createProductionChart === 'function') {
                            method = 'createProductionChart';
                            console.log(`Chart Initialization Helper: Using fallback method '${method}' for ${chartDef.type} chart`);
                        }
                    }
                    
                    if (typeof window.chartManager[method] === 'function') {
                        window.chartManager[method](canvasId, {});
                    } else {
                        console.warn(`Chart Initialization Helper: Method '${method}' not found on chart manager`);
                    }
                } catch (err) {
                    console.error(`Chart Initialization Helper: Error initializing ${chartDef.type} chart:`, err);
                }
            }
        });
        
        console.log(`Chart Initialization Helper: Initialized ${canvasCount} charts`);
        
        // Dispatch event for other scripts to know charts have been initialized
        window.dispatchEvent(new CustomEvent('charts-initialized', { 
            detail: { count: canvasCount } 
        }));
    }
    
    // Inject fallback chart data when needed
    function injectFallbackChartData() {
        if (!window.chartManager) return;
        
        // Sample data for various charts
        const fallbackData = {
            revenue: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [35000, 42000, 28000, 41000, 38000, 53000]
            },
            entity: {
                'Diamond Mining Corp': 150000,
                'Gold Rush Ltd': 85000, 
                'Copper Valley Mining': 250000,
                'Rock Aggregates': 35000,
                'Mountain Iron': 122000
            },
            months: ['January', 'February', 'March', 'April', 'May', 'June']
        };
        
        // Inject sample data into chart manager
        if (!window.chartManager.sampleData) {
            window.chartManager.sampleData = fallbackData;
        }
    }
    
    // Run setup when DOM is ready
    function initialize() {
        injectFallbackChartData();
        setupDashboardObserver();
        
        // If dashboard is already visible, initialize charts now
        const dashboard = document.getElementById('dashboard');
        if (dashboard && 
            dashboard.style.display !== 'none' && 
            dashboard.children.length > 0) {
            // Wait a moment for canvas elements
            setTimeout(initializeAllCharts, 1000);
        }
        
        // Add it as a global function for other scripts to call
        window.initializeAllDashboardCharts = initializeAllCharts;
    }
    
    // Run when DOM is loaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    console.log('Chart Initialization Helper: Setup complete');
    
})(window);
