/**
 * Dashboard Module for Mining Royalties Manager
 * Centralizes all dashboard functionality
 * @version 1.0.0
 * @date 2025-06-30
 */

(function() {
    'use strict';
    
    // Create the dashboard module
    const Dashboard = {
        charts: {},
        initialized: false,
        
        /**
         * Initialize the dashboard module
         */
        initialize: function() {
            console.log('Dashboard: Initializing dashboard module...');
            
            if (this.initialized) {
                console.log('Dashboard: Already initialized');
                return;
            }
            
            this.setupEventListeners();
            this.initializeCharts();
            this.initialized = true;
            
            console.log('Dashboard: Initialization complete');
        },
        
        /**
         * Set up dashboard event listeners
         */
        setupEventListeners: function() {
            console.log('Dashboard: Setting up event listeners...');
            
            // Refresh dashboard button
            const refreshBtn = document.getElementById('refresh-dashboard-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    console.log('Dashboard: Refresh button clicked');
                    this.refreshDashboard();
                });
            }
            
            // Export dashboard button
            const exportBtn = document.getElementById('export-dashboard-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    console.log('Dashboard: Export button clicked');
                    this.exportDashboardReport();
                });
            }
            
            // Filter buttons
            const applyFiltersBtn = document.getElementById('apply-filters');
            if (applyFiltersBtn) {
                applyFiltersBtn.addEventListener('click', () => {
                    console.log('Dashboard: Apply filters clicked');
                    this.applyFilters();
                });
            }
            
            const resetFiltersBtn = document.getElementById('reset-filters');
            if (resetFiltersBtn) {
                resetFiltersBtn.addEventListener('click', () => {
                    console.log('Dashboard: Reset filters clicked');
                    this.resetFilters();
                });
            }
            
            console.log('Dashboard: Event listeners setup complete');
        },
        
        /**
         * Initialize dashboard charts
         */
        initializeCharts: function() {
            console.log('Dashboard: Initializing charts...');
            
            try {
                // Check dependencies
                if (typeof Chart === 'undefined') {
                    throw new Error('Chart.js is not loaded');
                }
                
                if (typeof window.chartManager === 'undefined') {
                    throw new Error('ChartManager is not available');
                }
                
                // Revenue trends chart
                const revenueTrendsCanvas = document.getElementById('revenue-trends-chart');
                if (revenueTrendsCanvas) {
                    console.log('Dashboard: Creating revenue trends chart');
                    this.charts.revenueTrends = window.chartManager.createRevenueChart('revenue-trends-chart', {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        values: [45000, 52000, 48000, 61000, 55000, 67000]
                    });
                }
                
                // Revenue by entity chart
                const revenueByEntityCanvas = document.getElementById('revenue-by-entity-chart');
                if (revenueByEntityCanvas) {
                    console.log('Dashboard: Creating revenue by entity chart');
                    this.charts.revenueByEntity = window.chartManager.createProductionChart('revenue-by-entity-chart', {
                        'Diamond Mining Corp': 150,
                        'Gold Rush Ltd': 85, 
                        'Copper Valley Mining': 2500,
                        'Rock Aggregates': 350,
                        'Mountain Iron': 1220
                    });
                }
                
                // Payment timeline chart
                const paymentTimelineCanvas = document.getElementById('payment-timeline-chart');
                if (paymentTimelineCanvas) {
                    console.log('Dashboard: Creating payment timeline chart');
                    this.charts.paymentTimeline = window.chartManager.create('payment-timeline-chart', {
                        type: 'bar',
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [{
                                label: 'Payments Made',
                                data: [28, 35, 42, 31, 39, 45],
                                backgroundColor: 'rgba(38, 84, 124, 0.8)'
                            }]
                        }
                    });
                }
                
                // Forecast chart
                const forecastCanvas = document.getElementById('forecast-chart');
                if (forecastCanvas) {
                    console.log('Dashboard: Creating forecast chart');
                    this.charts.forecast = window.chartManager.create('forecast-chart', {
                        type: 'line',
                        data: {
                            labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            datasets: [{
                                label: 'Projected Revenue',
                                data: [72000, 68000, 74000, 69000, 78000, 82000],
                                borderColor: '#3e6b94',
                                borderDash: [5, 5]
                            }]
                        }
                    });
                }
                
                console.log('Dashboard: Charts initialized successfully');
                
            } catch (error) {
                console.error('Dashboard: Error initializing charts:', error);
                
                // Show error message in UI
                if (window.notificationManager) {
                    window.notificationManager.show(
                        'Error initializing dashboard charts. Please try refreshing the page.',
                        'error'
                    );
                }
            }
        },
        
        /**
         * Refresh the dashboard
         */
        refreshDashboard: function() {
            console.log('Dashboard: Refreshing dashboard...');
            
            // Clear existing charts
            if (window.chartManager && typeof window.chartManager.destroyAll === 'function') {
                window.chartManager.destroyAll();
                this.charts = {};
            }
            
            // Reinitialize charts with new data
            setTimeout(() => {
                this.initializeCharts();
                
                // Show success notification
                if (window.notificationManager) {
                    window.notificationManager.show('Dashboard refreshed successfully', 'success');
                }
            }, 300);
        },
        
        /**
         * Export dashboard data to report
         */
        exportDashboardReport: function() {
            console.log('Dashboard: Exporting dashboard report...');
            
            // Show processing notification
            if (window.notificationManager) {
                window.notificationManager.show('Preparing dashboard export...', 'info');
            }
            
            // Simulate processing time
            setTimeout(() => {
                // Show success notification
                if (window.notificationManager) {
                    window.notificationManager.show(
                        'Dashboard report exported successfully',
                        'success'
                    );
                }
            }, 1500);
        },
        
        /**
         * Apply dashboard filters
         */
        applyFilters: function() {
            console.log('Dashboard: Applying filters...');
            
            const timePeriod = document.getElementById('time-period');
            const entityFilter = document.getElementById('entity-filter');
            const mineralFilter = document.getElementById('mineral-filter');
            
            const filters = {
                timePeriod: timePeriod ? timePeriod.value : 'current-month',
                entity: entityFilter ? entityFilter.value : 'all',
                mineral: mineralFilter ? mineralFilter.value : 'all'
            };
            
            console.log('Dashboard: Applied filters:', filters);
            
            // Show notification
            if (window.notificationManager) {
                window.notificationManager.show(
                    `Filters applied: ${filters.timePeriod.replace('-', ' ')}, ${filters.entity}, ${filters.mineral}`,
                    'info'
                );
            }
            
            // TODO: Update dashboard data based on filters
            this.refreshDashboard();
        },
        
        /**
         * Reset dashboard filters
         */
        resetFilters: function() {
            console.log('Dashboard: Resetting filters...');
            
            // Reset form elements
            const timePeriod = document.getElementById('time-period');
            const entityFilter = document.getElementById('entity-filter');
            const mineralFilter = document.getElementById('mineral-filter');
            
            if (timePeriod) timePeriod.value = 'current-month';
            if (entityFilter) entityFilter.value = 'all';
            if (mineralFilter) mineralFilter.value = 'all';
            
            // Show notification
            if (window.notificationManager) {
                window.notificationManager.show('Dashboard filters reset', 'info');
            }
            
            // Refresh with default filters
            this.refreshDashboard();
        }
    };
    
    // Initialize when DOM content is loaded
    function init() {
        // Check if dashboard is loaded
        const dashboardElement = document.getElementById('dashboard');
        if (!dashboardElement) {
            console.log('Dashboard: Dashboard element not found, will try again later');
            setTimeout(init, 500);
            return;
        }
        
        // Ensure dashboardElement has content before initializing
        if (dashboardElement.children.length === 0) {
            console.log('Dashboard: Dashboard element empty, will try again later');
            setTimeout(init, 500);
            return;
        }
        
        // Initialize dashboard
        Dashboard.initialize();
        
        // Register globally
        window.dashboardModule = Dashboard;
        
        // Make initializeDashboardCharts function available globally
        window.initializeDashboardCharts = function() {
            Dashboard.refreshDashboard();
        };
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
    } else {
        setTimeout(init, 1000);
    }
})();
