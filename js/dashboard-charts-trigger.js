/**
 * Dashboard Charts Trigger
 * @version 1.0.1
 * @date 2025-06-30
 * @description Ensures dashboard charts are triggered after dashboard content is loaded
 */

(function() {
    'use strict';
    
    console.log('Dashboard Charts Trigger: Initializing...');
    
    // Function to initialize dashboard charts
    function initializeDashboardCharts() {
        console.log('Dashboard Charts Trigger: Attempting to initialize charts...');
        
        // Try different chart initialization methods
        if (window.initializeAllDashboardCharts) {
            console.log('Using initializeAllDashboardCharts method');
            window.initializeAllDashboardCharts();
            return true;
        }
        
        if (window.royaltiesApp && typeof window.royaltiesApp.initializeDashboardCharts === 'function') {
            console.log('Using royaltiesApp.initializeDashboardCharts method');
            window.royaltiesApp.initializeDashboardCharts();
            return true;
        }
        
        if (window.chartManager) {
            console.log('Using chartManager directly');
            
            setTimeout(() => {
                // Try to find chart canvas elements
                const chartCanvases = document.querySelectorAll('#dashboard canvas');
                console.log(`Found ${chartCanvases.length} chart canvases in dashboard`);
                
                // Initialize each canvas using appropriate chart method
                chartCanvases.forEach(canvas => {
                    const canvasId = canvas.id;
                    
                    try {
                        if (canvasId.includes('revenue-trends')) {
                            if (typeof window.chartManager.createRevenueChart === 'function') {
                                console.log(`Initializing revenue trends chart: ${canvasId}`);
                                window.chartManager.createRevenueChart(canvasId);
                            }
                        } else if (canvasId.includes('production-by-entity')) {
                            // Try production chart method first, fall back to entity chart
                            if (typeof window.chartManager.createProductionChart === 'function') {
                                console.log(`Initializing production chart: ${canvasId}`);
                                window.chartManager.createProductionChart(canvasId);
                            } else if (typeof window.chartManager.createEntityChart === 'function') {
                                console.log(`Initializing production chart using entity chart method: ${canvasId}`);
                                window.chartManager.createEntityChart(canvasId);
                            }
                        } else if (canvasId.includes('revenue-by-entity')) {
                            // Try entity chart method first, fall back to production chart
                            if (typeof window.chartManager.createEntityChart === 'function') {
                                console.log(`Initializing entity chart: ${canvasId}`);
                                window.chartManager.createEntityChart(canvasId);
                            } else if (typeof window.chartManager.createProductionChart === 'function') {
                                console.log(`Initializing entity chart using production chart method: ${canvasId}`);
                                window.chartManager.createProductionChart(canvasId);
                            }
                        } else if (canvasId.includes('payment-timeline')) {
                            if (typeof window.chartManager.create === 'function') {
                                console.log(`Initializing timeline chart: ${canvasId}`);
                                window.chartManager.create(canvasId, {
                                    type: 'line',
                                    data: {
                                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                        datasets: [{
                                            label: 'Payment Timeline',
                                            data: [12, 19, 13, 15, 20, 18]
                                        }]
                                    }
                                });
                            }
                        } else if (canvasId.includes('mineral-performance')) {
                            if (typeof window.chartManager.create === 'function') {
                                console.log(`Initializing mineral performance chart: ${canvasId}`);
                                window.chartManager.create(canvasId, {
                                    type: 'bar',
                                    data: {
                                        labels: ['Coal', 'Iron', 'Stone', 'Sand', 'Gravel'],
                                        datasets: [{
                                            label: 'Production Volume',
                                            data: [12000, 19000, 13000, 15000, 20000]
                                        }]
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.error(`Error initializing chart ${canvasId}:`, error);
                    }
                });
            }, 500);
            return true;
        }
        
        console.warn('Dashboard Charts Trigger: No chart initialization method found');
        return false;
    }
    
    // Setup observation of dashboard section
    function setupDashboardObserver() {
        // Find dashboard section
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) {
            console.warn('Dashboard Charts Trigger: Dashboard section not found, will retry later');
            setTimeout(setupDashboardObserver, 500);
            return;
        }
        
        console.log('Dashboard Charts Trigger: Setting up content observer');
        
        // Listen for content changes in the dashboard section
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && 
                    mutation.addedNodes.length > 0 &&
                    dashboard.style.display !== 'none') {
                    
                    // Dashboard content was added and is visible
                    console.log('Dashboard Charts Trigger: Dashboard content changed, initializing charts');
                    
                    // Wait a moment for charts to be ready
                    setTimeout(initializeDashboardCharts, 800);
                    
                    // Disconnect after first success to avoid repeated calls
                    observer.disconnect();
                    break;
                }
            }
        });
        
        // Start observing the dashboard for content changes
        observer.observe(dashboard, {
            childList: true,
            subtree: true
        });
        
        // If the dashboard already has content, initialize charts now
        if (dashboard.children.length > 0 && dashboard.style.display !== 'none') {
            console.log('Dashboard Charts Trigger: Dashboard already has content, initializing now');
            setTimeout(initializeDashboardCharts, 1000);
        }
    }
    
    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupDashboardObserver);
    } else {
        setupDashboardObserver();
    }
    
    console.log('Dashboard Charts Trigger: Setup complete');
})();
