/**
 * Unified Chart Solution for Mining Royalties Manager
 * @version 1.0.4
 * @date 2025-01-09
 * @description Complete chart management system to replace all legacy chart implementations
 * @fix Fixed premature dashboard chart initialization by replacing global calls with no-op stub
 */

(function() {
    'use strict';
    
    console.log('🎯 UNIFIED CHART SOLUTION: Initializing...');
    
    // Unified Chart Manager Implementation
    const UnifiedChartManager = {
        charts: new Map(),
        isChartJsLoaded: typeof Chart !== 'undefined',
        initialized: false,
        
        /**
         * Initialize the chart manager
         */
        initialize: function() {
            if (this.initialized) {
                console.log('🎯 UNIFIED CHART: Already initialized');
                return;
            }
            
            console.log('🎯 UNIFIED CHART: Initializing chart manager...');
            this.isChartJsLoaded = typeof Chart !== 'undefined';
            
            if (!this.isChartJsLoaded) {
                console.warn('🎯 UNIFIED CHART: Chart.js not loaded, charts will not work');
            }
            
            this.initialized = true;
            console.log('🎯 UNIFIED CHART: Chart manager initialized successfully');
        },
        
        /**
         * Create a generic chart
         */
        createChart: function(canvasId, config) {
            console.log(`🎯 UNIFIED CHART: Creating chart '${canvasId}'`);
            
            if (!this.isChartJsLoaded) {
                console.warn('🎯 UNIFIED CHART: Chart.js not available, cannot create chart');
                return null;
            }
            
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`🎯 UNIFIED CHART: Canvas element '${canvasId}' not found`);
                return null;
            }
            
            try {
                // Destroy existing chart if it exists
                if (this.charts.has(canvasId)) {
                    this.destroyChart(canvasId);
                }
                
                const chart = new Chart(canvas, config);
                this.charts.set(canvasId, chart);
                console.log(`🎯 UNIFIED CHART: Chart '${canvasId}' created successfully`);
                return chart;
            } catch (error) {
                console.error(`🎯 UNIFIED CHART: Error creating chart '${canvasId}':`, error);
                return null;
            }
        },
        
        /**
         * Create a revenue chart
         */
        createRevenueChart: function(canvasId, data) {
            console.log(`🎯 UNIFIED CHART: Creating revenue chart '${canvasId}'`);
            
            const config = {
                type: 'line',
                data: {
                    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Monthly Revenue (E)',
                        data: data?.values || [45000, 52000, 48000, 61000, 55000, 67000],
                        borderColor: '#1a365d',
                        backgroundColor: 'rgba(26, 54, 93, 0.1)',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        title: { display: true, text: 'Revenue Trends' }
                    },
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
            };
            
            return this.createChart(canvasId, config);
        },
        
        /**
         * Create an entity chart
         */
        createEntityChart: function(canvasId, data) {
            console.log(`🎯 UNIFIED CHART: Creating entity chart '${canvasId}'`);
            
            const labels = data ? Object.keys(data) : ['Diamond Mining Corp', 'Gold Rush Ltd', 'Copper Valley Mining'];
            const values = data ? Object.values(data) : [150, 85, 2500];
            
            const config = {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            '#1a365d', '#2d5a88', '#4a90c2', 
                            '#7ba7cc', '#a8c5e2', '#d4af37'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'bottom' },
                        title: { display: true, text: 'Production by Entity' }
                    }
                }
            };
            
            return this.createChart(canvasId, config);
        },
        
        /**
         * Create a production chart
         */
        createProductionChart: function(canvasId, data) {
            console.log(`🎯 UNIFIED CHART: Creating production chart '${canvasId}'`);
            
            const labels = data ? Object.keys(data) : ['Q1', 'Q2', 'Q3', 'Q4'];
            const values = data ? Object.values(data) : [120, 190, 300, 500];
            
            const config = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Production Volume',
                        data: values,
                        backgroundColor: ['#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        title: { display: true, text: 'Production Analytics' }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };
            
            return this.createChart(canvasId, config);
        },
        
        /**
         * Create a status chart
         */
        createStatusChart: function(canvasId, data) {
            console.log(`🎯 UNIFIED CHART: Creating status chart '${canvasId}'`);
            
            const config = {
                type: 'pie',
                data: {
                    labels: data?.labels || ['Paid', 'Pending', 'Overdue'],
                    datasets: [{
                        data: data?.values || [65, 25, 10],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'bottom' },
                        title: { display: true, text: 'Payment Status' }
                    }
                }
            };
            
            return this.createChart(canvasId, config);
        },
        
        /**
         * Destroy a chart
         */
        destroyChart: function(canvasId) {
            const chart = this.charts.get(canvasId);
            if (chart) {
                try {
                    chart.destroy();
                    this.charts.delete(canvasId);
                    console.log(`🎯 UNIFIED CHART: Chart '${canvasId}' destroyed`);
                } catch (error) {
                    console.error(`🎯 UNIFIED CHART: Error destroying chart '${canvasId}':`, error);
                }
            }
        },
        
        /**
         * Update a chart
         */
        updateChart: function(canvasId, newData) {
            const chart = this.charts.get(canvasId);
            if (chart && newData) {
                try {
                    if (newData.labels) chart.data.labels = newData.labels;
                    if (newData.datasets) chart.data.datasets = newData.datasets;
                    chart.update();
                    console.log(`🎯 UNIFIED CHART: Chart '${canvasId}' updated`);
                } catch (error) {
                    console.error(`🎯 UNIFIED CHART: Error updating chart '${canvasId}':`, error);
                }
            }
        },
        
        /**
         * Refresh all charts
         */
        refreshAllCharts: function() {
            console.log('🎯 UNIFIED CHART: Refreshing all charts...');
            this.charts.forEach((chart, canvasId) => {
                try {
                    chart.update();
                } catch (error) {
                    console.error(`🎯 UNIFIED CHART: Error refreshing chart '${canvasId}':`, error);
                }
            });
        },
        
        /**
         * Destroy all charts
         */
        destroyAll: function() {
            console.log('🎯 UNIFIED CHART: Destroying all charts...');
            this.charts.forEach((chart, canvasId) => {
                this.destroyChart(canvasId);
            });
        }
    };
    
    // Legacy compatibility stub for initializeAllDashboardCharts
    // This function is now a no-op to prevent premature chart initialization
    // Dashboard charts are handled by the dashboard component itself
    window.initializeAllDashboardCharts = function() {
        console.log('🎯 UNIFIED CHART: Legacy initializeAllDashboardCharts called - ignoring for compatibility');
        console.warn('🎯 UNIFIED CHART: Dashboard charts are now initialized by the dashboard component. This global call is deprecated.');
        
        // Check if we're actually in the dashboard context
        const isDashboardLoaded = document.querySelector('[data-section="dashboard"]') && 
                                 document.querySelector('[data-section="dashboard"]').style.display !== 'none';
        
        if (isDashboardLoaded) {
            console.log('🎯 UNIFIED CHART: Dashboard is loaded, delegating to component-specific initialization');
            // Dashboard component will handle its own chart initialization
        } else {
            console.log('🎯 UNIFIED CHART: Dashboard not loaded, ignoring chart initialization request');
        }
    };
    
    // Make chart manager available globally
    window.chartManager = UnifiedChartManager;
    
    // Initialize immediately
    UnifiedChartManager.initialize();
    
    // Also make available as unifiedChartManager for debugging
    window.unifiedChartManager = UnifiedChartManager;
    
    console.log('🎯 UNIFIED CHART SOLUTION: Ready');
    
})();