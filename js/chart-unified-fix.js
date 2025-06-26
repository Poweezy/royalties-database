/**
 * Unified Chart Fix 
 * This script resolves all chart initialization issues in the Mining Royalties Manager
 * @version 1.0.0
 * @date 2023-10-18
 */

(function() {
    'use strict';
    
    console.log('=== UNIFIED CHART FIX INITIALIZING ===');

    // Function to ensure chartManager exists with all required methods
    function ensureChartManager() {
        // Wait for window.chartManager to be available
        if (!window.chartManager) {
            console.warn('Unified Chart Fix: window.chartManager not available, creating it');
            window.chartManager = new SimpleChartManager();
        }

        console.log('Unified Chart Fix: Patching chart manager methods');
        
        // Ensure create method exists
        if (typeof window.chartManager.create !== 'function') {
            console.log('Adding missing create method');
            window.chartManager.create = function(canvasId, config) {
                console.log(`Creating chart on ${canvasId}`);
                const canvas = document.getElementById(canvasId);
                if (!canvas || typeof Chart === 'undefined') {
                    console.error(`Canvas ${canvasId} not found or Chart.js not loaded`);
                    return null;
                }
                
                // Store charts in a Map for later reference
                if (!this.charts) {
                    this.charts = new Map();
                }
                
                // Destroy existing chart if it exists
                if (this.charts.has(canvasId)) {
                    this.charts.get(canvasId).destroy();
                }
                
                try {
                    const ctx = canvas.getContext('2d');
                    const chart = new Chart(ctx, config);
                    this.charts.set(canvasId, chart);
                    return chart;
                } catch (error) {
                    console.error('Error creating chart:', error);
                    return null;
                }
            };
        }
        
        // Ensure createProductionChart method exists
        if (typeof window.chartManager.createProductionChart !== 'function') {
            console.log('Adding missing createProductionChart method');
            window.chartManager.createProductionChart = function(canvasId, entityData) {
                console.log(`Creating production chart on ${canvasId}`);
                
                // Try to find the canvas with the given ID or known alias
                let canvas = document.getElementById(canvasId);
                if (!canvas && canvasId === 'production-by-entity-chart') {
                    console.log('Using revenue-by-entity-chart as alias for production chart');
                    canvas = document.getElementById('revenue-by-entity-chart');
                    if (canvas) canvasId = 'revenue-by-entity-chart';
                } else if (!canvas && canvasId === 'revenue-by-entity-chart') {
                    console.log('Using production-by-entity-chart as alias for revenue chart');
                    canvas = document.getElementById('production-by-entity-chart');
                    if (canvas) canvasId = 'production-by-entity-chart';
                }
                
                if (!canvas) {
                    console.error(`Canvas with id '${canvasId}' not found for production chart`);
                    return null;
                }
                
                if (!entityData || typeof entityData !== 'object' || Object.keys(entityData).length === 0) {
                    console.log('Using sample entity data for production chart');
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
                
                // Use colorSchemes if available or generate default colors
                const colors = [];
                if (this.colorSchemes && this.colorSchemes.primary) {
                    for (let i = 0; i < labels.length; i++) {
                        colors.push(this.colorSchemes.primary[i % this.colorSchemes.primary.length]);
                    }
                } else {
                    const defaultColors = [
                        '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', 
                        '#6b32a8', '#8a41d8', '#a463f3', '#bc86f8', '#d1a9fc'
                    ];
                    for (let i = 0; i < labels.length; i++) {
                        colors.push(defaultColors[i % defaultColors.length]);
                    }
                }
                
                return this.create(canvasId, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: values,
                            backgroundColor: colors
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const value = context.raw;
                                        const total = values.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            };
        }
        
        // Ensure createEntityChart method exists and is an alias for createProductionChart
        if (typeof window.chartManager.createEntityChart !== 'function') {
            console.log('Adding missing createEntityChart method');
            window.chartManager.createEntityChart = function(canvasId, data) {
                console.log(`Creating entity chart on ${canvasId} (alias for production chart)`);
                
                // Transform data if needed
                let entityData = {};
                if (data && data.labels && data.values) {
                    data.labels.forEach((label, i) => {
                        entityData[label] = data.values[i];
                    });
                } else {
                    entityData = data;
                }
                
                return this.createProductionChart(canvasId, entityData);
            };
        }
        
        // Ensure createRevenueChart method exists
        if (typeof window.chartManager.createRevenueChart !== 'function') {
            console.log('Adding missing createRevenueChart method');
            window.chartManager.createRevenueChart = function(canvasId, data) {
                console.log(`Creating revenue chart on ${canvasId}`);
                
                let chartData, labels, values;
                
                if (data && ((data.labels && data.values) || Array.isArray(data))) {
                    if (data.labels && data.values) {
                        labels = data.labels;
                        values = data.values;
                    } else if (Array.isArray(data)) {
                        // Process array data
                        labels = data.map(item => item.period || item.month || item.label);
                        values = data.map(item => item.value || item.amount || item.revenue);
                    }
                } else {
                    // Use sample data
                    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                    values = [45000, 52000, 48000, 61000, 55000, 67000];
                }
                
                return this.create(canvasId, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Monthly Revenue (E)',
                            data: values,
                            borderColor: '#1a365d',
                            backgroundColor: 'rgba(26, 54, 93, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
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
        }
        
        // Ensure destroyAll method exists
        if (typeof window.chartManager.destroyAll !== 'function') {
            console.log('Adding missing destroyAll method');
            window.chartManager.destroyAll = function() {
                if (!this.charts) {
                    this.charts = new Map();
                    return;
                }
                
                console.log(`Destroying all ${this.charts.size} charts`);
                this.charts.forEach(chart => {
                    if (chart && typeof chart.destroy === 'function') {
                        chart.destroy();
                    }
                });
                this.charts.clear();
            };
        }
    }
    
    // Simple ChartManager class for fallback
    function SimpleChartManager() {
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
        
        console.log('SimpleChartManager: Initialized');
    }
    
    // Function to initialize dashboard charts
    function initializeDashboardCharts() {
        console.log('Unified Chart Fix: Initializing dashboard charts...');
        
        if (!window.chartManager) {
            console.error('ChartManager not available, cannot initialize charts');
            return;
        }
        
        try {
            // First destroy all existing charts
            window.chartManager.destroyAll();
            
            // Sample data for demonstration
            const sampleData = {
                revenueData: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    values: [45000, 52000, 48000, 61000, 55000, 67000]
                },
                entityData: {
                    'Diamond Mining Corp': 150000,
                    'Gold Rush Ltd': 85000,
                    'Copper Valley Mining': 250000,
                    'Rock Aggregates': 35000,
                    'Mountain Iron': 122000
                }
            };
            
            // Initialize revenue trends chart
            const revenueCanvas = document.getElementById('revenue-trends-chart');
            if (revenueCanvas) {
                console.log('Creating revenue trends chart');
                window.chartManager.createRevenueChart('revenue-trends-chart', sampleData.revenueData);
            }
            
            // Initialize production/entity chart
            const productionCanvas = document.getElementById('production-by-entity-chart');
            const revenueByEntityCanvas = document.getElementById('revenue-by-entity-chart');
            
            if (productionCanvas) {
                console.log('Creating production by entity chart');
                window.chartManager.createProductionChart('production-by-entity-chart', sampleData.entityData);
            } else if (revenueByEntityCanvas) {
                console.log('Creating revenue by entity chart');
                window.chartManager.createProductionChart('revenue-by-entity-chart', sampleData.entityData);
            }
            
            // Initialize other charts as needed
            const paymentCanvas = document.getElementById('payment-timeline-chart');
            if (paymentCanvas) {
                console.log('Creating payment timeline chart');
                window.chartManager.create('payment-timeline-chart', {
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
                        scales: {
                            y: {
                                beginAtZero: true,
                                stacked: true
                            },
                            x: {
                                stacked: true
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
            
            const mineralCanvas = document.getElementById('mineral-performance-chart');
            if (mineralCanvas) {
                console.log('Creating mineral performance chart');
                window.chartManager.create('mineral-performance-chart', {
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
                        scales: {
                            y: {
                                beginAtZero: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Volume (tonnes)'
                                }
                            },
                            y1: {
                                beginAtZero: true,
                                position: 'right',
                                grid: {
                                    drawOnChartArea: false
                                },
                                title: {
                                    display: true,
                                    text: 'Revenue (E)'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
            
            console.log('Dashboard charts initialization complete');
        } catch (error) {
            console.error('Error initializing dashboard charts:', error);
        }
    }
    
    // Make initializeDashboardCharts available globally
    window.initializeDashboardCharts = initializeDashboardCharts;
    
    // Execute the fix when the DOM is ready
    function runFix() {
        console.log('Running chart fix...');
        ensureChartManager();
        
        // Check if the dashboard section is visible
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection && dashboardSection.style.display !== 'none') {
            console.log('Dashboard visible, initializing charts');
            initializeDashboardCharts();
        } else {
            console.log('Dashboard not visible, waiting for it to be displayed');
            
            // Create a MutationObserver to detect when the dashboard becomes visible
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.target.id === 'dashboard' && 
                        mutation.target.style.display !== 'none' &&
                        !mutation.target.dataset.chartsInitialized) {
                        
                        console.log('Dashboard became visible, initializing charts');
                        initializeDashboardCharts();
                        mutation.target.dataset.chartsInitialized = 'true';
                    }
                });
            });
            
            if (dashboardSection) {
                observer.observe(dashboardSection, { 
                    attributes: true, 
                    attributeFilter: ['style'] 
                });
            }
        }
    }
    
    // Run the fix once the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runFix);
    } else {
        runFix();
    }
    
    // Also run the fix when the window is fully loaded (to catch any late-loading scripts)
    window.addEventListener('load', runFix);
    
    console.log('=== UNIFIED CHART FIX LOADED ===');
})();
