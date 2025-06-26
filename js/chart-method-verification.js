/**
 * Chart Method Verification
 * Monitors and logs the state of chart methods to help debug chart issues
 * @version 1.0.0
 * @date 2025-07-04
 */

(function() {
    'use strict';
    
    console.log('=== CHART METHOD VERIFICATION STARTING ===');
    
    // Chart methods that should exist
    const requiredMethods = [
        'createRevenueChart',
        'createEntityChart',
        'createProductionChart',
        'createStatusChart'
    ];
    
    // Check all required chart methods
    function checkChartMethods() {
        console.log('Verifying chart methods...');
        
        if (!window.chartManager) {
            console.error('ChartManager not found');
            return false;
        }
        
        let allMethodsAvailable = true;
        
        // Check each required method
        requiredMethods.forEach(methodName => {
            if (typeof window.chartManager[methodName] === 'function') {
                console.log(`✓ ChartManager.${methodName} is available`);
            } else {
                console.error(`✗ ChartManager.${methodName} is MISSING`);
                allMethodsAvailable = false;
            }
        });
        
        // Verify chart canvases
        const canvasIds = [
            'revenue-trends-chart',
            'production-by-entity-chart',
            'revenue-by-entity-chart',
            'status-distribution-chart'
        ];
        
        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                console.log(`✓ Canvas ${id} exists`);
            } else {
                console.warn(`✗ Canvas ${id} is missing`);
            }
        });
        
        return allMethodsAvailable;
    }
    
    // Try to initialize charts if all methods are available
    function initializeChartsIfReady() {
        if (checkChartMethods()) {
            console.log('All chart methods are available, attempting to initialize charts');
            
            // Try to access data manager
            let dataManager = null;
            if (window.dataManager) {
                dataManager = window.dataManager;
            } else if (window.app && window.app.dataManager) {
                dataManager = window.app.dataManager;
            } else {
                console.warn('DataManager not found, charts will use sample data');
            }
            
            try {
                if (typeof window.chartManager.createDashboardCharts === 'function') {
                    window.chartManager.createDashboardCharts(dataManager);
                } else {
                    console.log('Creating individual charts');
                    
                    // Revenue chart
                    const revenueCanvas = document.getElementById('revenue-trends-chart');
                    if (revenueCanvas) {
                        window.chartManager.createRevenueChart('revenue-trends-chart');
                    }
                    
                    // Production/Entity chart (try both IDs)
                    const productionCanvas = document.getElementById('production-by-entity-chart') || 
                                           document.getElementById('revenue-by-entity-chart');
                    if (productionCanvas) {
                        window.chartManager.createProductionChart(productionCanvas.id);
                    }
                    
                    // Status chart
                    const statusCanvas = document.getElementById('status-distribution-chart');
                    if (statusCanvas) {
                        window.chartManager.createStatusChart('status-distribution-chart');
                    }
                }
                
                console.log('Chart initialization complete');
                return true;
            } catch (error) {
                console.error('Error initializing charts:', error);
                return false;
            }
        } else {
            console.warn('Not all chart methods are available, skipping chart initialization');
            return false;
        }
    }
    
    // Run verification at different times to catch various loading cases
    
    // First check immediately
    checkChartMethods();
    
    // Then check when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(checkChartMethods, 100);
        });
    }
    
    // Schedule checks at various times
    setTimeout(checkChartMethods, 1000);
    setTimeout(checkChartMethods, 2000);
    
    // Try to initialize charts after all checks
    setTimeout(initializeChartsIfReady, 2500);
    setTimeout(initializeChartsIfReady, 4000);
    
})();
