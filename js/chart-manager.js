/**
 * Enhanced Chart Manager - Unified charting system for Mining Royalties Manager
 * @version 3.0.1
 * @date 2025-06-26
 * @description Provides chart creation, management, and rendering capabilities with fallbacks
 */

(function(window) {
    'use strict';
    
    console.log('Enhanced ChartManager initializing...');
    
    /**
     * ChartManager constructor
     */
    function ChartManager() {
        this.charts = new Map();
        this.isChartJsLoaded = typeof Chart !== 'undefined';
        
        // Color schemes
        this.colorSchemes = {
            primary: [
                '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', '#adc8f5',
                '#6b32a8', '#8a41d8', '#a463f3', '#bc86f8', '#d1a9fc', '#e5ccfe'
            ],
            financial: [
                '#2E7D32', '#4CAF50', '#8BC34A', '#e65100', '#ef6c00', '#ff9800',
                '#ffb74d', '#1565C0', '#1976D2', '#1E88E5', '#42A5F5', '#90CAF9'
            ],
            status: {
                'paid': '#2E7D32',
                'pending': '#e65100',
                'overdue': '#c62828'
            }
        };
        
        console.log('ChartManager: Initialized with ' + (this.isChartJsLoaded ? 'Chart.js available' : 'Chart.js NOT available'));
    }
    
    /**
     * Create a new chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} config - Chart configuration
     * @returns {Object} - Chart instance or null
     */
    ChartManager.prototype.create = function(canvasId, config) {
        if (!this.isChartJsLoaded) {
            console.warn('ChartManager: Chart.js not loaded');
            this.showFallbackChart(canvasId, config);
            return null;
        }
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`ChartManager: Canvas with id '${canvasId}' not found`);
            return null;
        }
        
        // Destroy existing chart if it exists
        this.destroy(canvasId);
        
        try {
            console.log(`ChartManager: Creating ${config.type || 'bar'} chart on canvas '${canvasId}'`);
            
            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: config.type || 'bar',
                data: config.data,
                options: Object.assign({
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }, config.options || {})
            });
            
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error('ChartManager: Error creating chart:', error);
            return null;
        }
    };
    
    /**
     * Destroy a chart by canvas ID
     * @param {string} canvasId - Canvas element ID
     */
    ChartManager.prototype.destroy = function(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
            console.log(`ChartManager: Destroyed chart on canvas '${canvasId}'`);
        }
    };
    
    /**
     * Destroy all charts
     */
    ChartManager.prototype.destroyAll = function() {
        console.log(`ChartManager: Destroying all ${this.charts.size} charts`);
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    };
    
    /**
     * Show a fallback message when Chart.js is not available
     * @param {string} canvasId - Canvas element ID
     * @param {Object} config - Chart configuration
     */
    ChartManager.prototype.showFallbackChart = function(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const parent = canvas.parentNode;
            const fallbackMsg = document.createElement('div');
            fallbackMsg.className = 'chart-fallback';
            fallbackMsg.innerHTML = `
                <div class="chart-fallback-content">
                    <i class="fas fa-chart-bar"></i>
                    <p>Chart visualization is not available</p>
                    <small>Please check if Chart.js is loaded correctly</small>
                </div>
            `;
            parent.replaceChild(fallbackMsg, canvas);
        }
    };
    
    /**
     * Create a revenue trend line chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} data - Optional data array
     * @returns {Object} - Chart instance
     */
    ChartManager.prototype.createRevenueChart = function(canvasId, data) {
        let chartData, labels, values;
        
        if (data && typeof data === 'object') {
            // Process data if provided
            const result = this.aggregateMonthlyData(data);
            labels = result.labels;
            values = result.values;
        } else {
            // Use sample data
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            values = [45000, 52000, 48000, 61000, 55000, 67000];
        }
        
        chartData = {
            labels: labels,
            datasets: [{
                label: 'Monthly Revenue (E)',
                data: values,
                borderColor: this.colorSchemes.primary[0],
                backgroundColor: 'rgba(26, 54, 93, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
        
        return this.create(canvasId, {
            type: 'line',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'E ' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Revenue: E ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    };
    
    /**
     * Create an entity distribution chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} data - Entity data object
     * @returns {Object} - Chart instance
     */
    ChartManager.prototype.createEntityChart = function(canvasId, data) {
        let labels, values;
        
        if (data && data.labels && data.values) {
            labels = data.labels;
            values = data.values;
        } else {
            labels = ['Diamond Mining Corp', 'Gold Rush Ltd', 'Copper Valley Mining'];
            values = [150, 85, 2500];
        }
        
        const chartData = {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: labels.map((_, i) => this.colorSchemes.primary[i % this.colorSchemes.primary.length])
            }]
        };
        
        return this.create(canvasId, {
            type: 'doughnut',
            data: chartData,
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = ((value / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    };
    
    /**
     * Create a status distribution chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} records - Royalty records
     * @returns {Object} - Chart instance
     */
    ChartManager.prototype.createStatusChart = function(canvasId, records) {
        const statusCounts = {
            'Paid': 0,
            'Pending': 0,
            'Overdue': 0
        };
        
        if (records && records.length) {
            records.forEach(record => {
                const status = record.status || 'Pending';
                if (statusCounts[status] !== undefined) {
                    statusCounts[status]++;
                }
            });
        } else {
            // Sample data
            statusCounts.Paid = 12;
            statusCounts.Pending = 5;
            statusCounts.Overdue = 3;
        }
        
        const chartData = {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    this.colorSchemes.status.paid,
                    this.colorSchemes.status.pending,
                    this.colorSchemes.status.overdue
                ]
            }]
        };
        
        return this.create(canvasId, {
            type: 'pie',
            data: chartData,
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    };
    
    /**
     * Create all dashboard charts
     * @param {Object} dataManager - Data manager instance
     */
    ChartManager.prototype.createDashboardCharts = function(dataManager) {
        try {
            console.log('ChartManager: Creating dashboard charts');
            this.destroyAll();
            
            const records = dataManager?.getRoyaltyRecords() || [];
            
            // Revenue trends chart
            this.createRevenueChart('revenue-trends-chart', records);
            
            // Entity distribution chart
            const entityData = this.aggregateEntityData(records);
            this.createEntityChart('production-by-entity-chart', entityData);
            
            // Status distribution chart
            this.createStatusChart('status-distribution-chart', records);
            
        } catch (error) {
            console.error('ChartManager: Error creating dashboard charts:', error);
        }
    };
    
    /**
     * Aggregate monthly data from records
     * @param {Array} records - Royalty records
     * @returns {Object} - Labels and values for chart
     */
    ChartManager.prototype.aggregateMonthlyData = function(records) {
        if (!records || !records.length) {
            return {
                labels: [],
                values: []
            };
        }
        
        const monthlyTotals = {};
        
        // Group by month
        records.forEach(record => {
            if (!record.date || !record.royalties) return;
            
            const date = new Date(record.date);
            if (isNaN(date.getTime())) return;
            
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0;
            }
            
            monthlyTotals[monthKey] += parseFloat(record.royalties) || 0;
        });
        
        // Sort months and format for display
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthName = monthDate.toLocaleString('en', { month: 'short' });
            
            months.push({
                key: monthKey,
                label: `${monthName} ${monthDate.getFullYear()}`,
                value: monthlyTotals[monthKey] || 0
            });
        }

        return {
            labels: months.map(m => m.label),
            values: months.map(m => m.value)
        };
    };
    
    /**
     * Aggregate entity data from records
     * @param {Array} records - Royalty records
     * @returns {Object} - Labels and values for chart
     */
    ChartManager.prototype.aggregateEntityData = function(records) {
        if (!records || !records.length) {
            return {
                labels: [],
                values: []
            };
        }
        
        const entityTotals = {};
        
        // Group by entity
        records.forEach(record => {
            if (!record.entity || !record.royalties) return;
            
            if (!entityTotals[record.entity]) {
                entityTotals[record.entity] = 0;
            }
            
            entityTotals[record.entity] += parseFloat(record.royalties) || 0;
        });
        
        // Sort by value (descending) and take top 6
        const sortedEntities = Object.entries(entityTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        return {
            labels: sortedEntities.map(([entity]) => entity),
            values: sortedEntities.map(([,total]) => total)
        };
    };
    
    // Make ChartManager globally available
    window.chartManager = new ChartManager();
    console.log('ChartManager: Enhanced Chart Manager loaded and registered globally');
    
})(window);
