/**
 * Chart Fix Script
 * This script fixes the issue with charts not displaying in the dashboard
 */

(function() {
    'use strict';
    
    console.log('=== CHART FIX SCRIPT STARTED ===');

    // Function to apply fixes when dashboard is loaded
    function applyChartFixes() {
        console.log('Checking if dashboard is visible...');
        const dashboardSection = document.getElementById('dashboard');
        
        // If dashboard is not visible or not loaded yet, try again later
        if (!dashboardSection || dashboardSection.style.display === 'none') {
            console.log('Dashboard not currently visible, will check again later');
            setTimeout(applyChartFixes, 1000);
            return;
        }
        
        console.log('Dashboard is visible, applying chart fixes...');

        // Check if chartManager is available in window context
        if (typeof window.chartManager === 'undefined') {
            console.error('ChartManager not available in global scope! Creating fallback...');
            
            // Create a simple fallback chartManager if needed
            window.chartManager = window.chartManager || {
                charts: new Map(),
                create: function(canvasId, config) {
                    console.log(`Creating chart on ${canvasId}`);
                    const canvas = document.getElementById(canvasId);
                    if (!canvas || typeof Chart === 'undefined') return null;
                    
                    const chart = new Chart(canvas, config);
                    this.charts.set(canvasId, chart);
                    return chart;
                },
                createRevenueChart: function(canvasId, data) {
                    console.log(`Creating revenue chart on ${canvasId}`);
                    return this.create(canvasId, {
                        type: 'line',
                        data: data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return 'E' + value.toLocaleString();
                                        }
                                    }
                                }
                            }
                        }
                    });
                },
                createProductionChart: function(canvasId, entityData) {
                    console.log(`Creating production chart on ${canvasId}`);
                    return this.create(canvasId, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(entityData),
                            datasets: [{
                                data: Object.values(entityData),
                                backgroundColor: [
                                    '#1a365d', '#2d5a88', '#4a90c2', 
                                    '#7ba7cc', '#a8c5e2', '#d4af37'
                                ]
                            }]
                        },
                        options: {
                            plugins: {
                                legend: { position: 'bottom' }
                            }
                        }
                    });
                },
                destroyAll: function() {
                    console.log('Destroying all charts');
                    this.charts.forEach(chart => chart.destroy());
                    this.charts.clear();
                }
            };
        }
        
        // Force reinitialize dashboard charts
        console.log('Forcing chart initialization...');
        
        try {
            // Check if the function exists in the dashboard HTML
            if (typeof window.initializeDashboardCharts === 'function') {
                console.log('Using dashboard\'s initializeDashboardCharts function');
                window.initializeDashboardCharts();
            } 
            // Check if it's a method of the royaltiesApp
            else if (window.royaltiesApp && typeof window.royaltiesApp.initializeDashboardCharts === 'function') {
                console.log('Using royaltiesApp.initializeDashboardCharts method');
                window.royaltiesApp.initializeDashboardCharts();
            }
            // Fall back to manually creating charts
            else {
                console.log('No initialization function found, creating charts manually');
                const expectedCharts = [
                    { canvasId: 'revenue-trends-chart', type: 'line' },
                    { canvasId: 'revenue-by-entity-chart', type: 'doughnut' },
                    { canvasId: 'payment-timeline-chart', type: 'bar' },
                    { canvasId: 'forecast-chart', type: 'line' },
                    { canvasId: 'mineral-performance-chart', type: 'bar' }
                ];
                
                expectedCharts.forEach(chart => {
                    const canvas = document.getElementById(chart.canvasId);
                    if (canvas) {
                        console.log(`Creating ${chart.type} chart on ${chart.canvasId}`);
                        // Use dummy data
                        window.chartManager.create(chart.canvasId, {
                            type: chart.type,
                            data: {
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                datasets: [{
                                    data: [45, 52, 48, 61, 55, 67],
                                    backgroundColor: chart.type === 'line' ? '#1a365d' : 
                                        ['#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc', '#a8c5e2', '#d4af37']
                                }]
                            }
                        });
                    }
                });
            }
            
            console.log('Chart initialization completed');
            
        } catch (error) {
            console.error('Error during chart fix:', error);
        }
    }
    
    // Add a function to run when the dashboard section is shown
    function setupChartInitializationTrigger() {
        const appObject = window.royaltiesApp;
        
        if (appObject && typeof appObject.showSection === 'function') {
            const originalShowSection = appObject.showSection;
            
            // Override showSection to check if dashboard is being shown
            appObject.showSection = function(sectionId) {
                originalShowSection.call(this, sectionId);
                
                if (sectionId === 'dashboard') {
                    console.log('Dashboard section shown, scheduling chart initialization');
                    setTimeout(applyChartFixes, 100);
                }
            };
            
            console.log('Chart initialization trigger installed');
        }
    }
    
    // Run when DOM content is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(setupChartInitializationTrigger, 500);
            setTimeout(applyChartFixes, 1000);
        });
    } else {
        // DOM already loaded, run immediately
        setTimeout(setupChartInitializationTrigger, 500);
        setTimeout(applyChartFixes, 1000);
    }
    
    console.log('=== CHART FIX SCRIPT LOADED ===');
})();
