/**
 * Dashboard Charts Initialization
 * Ensures proper initialization of dashboard charts
 * @version 1.0.0
 * @date 2025-07-03
 */

(function() {
    'use strict';
    
    console.log('=== DASHBOARD CHARTS INITIALIZATION ===');
    
    // Sample data for charts if real data is not available
    const sampleData = {
        revenueData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            values: [12500, 13200, 12800, 14500, 15200, 16800, 17500, 18200, 19500, 20100, 21500, 22800]
        },
        entityData: {
            'Diamond Mining Corp': 150000,
            'Gold Rush Ltd': 85000,
            'Copper Valley Mining': 250000,
            'Rock Aggregates': 35000,
            'Mountain Iron': 122000
        },
        paymentData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            onTime: [12, 14, 15, 13, 16, 17],
            late: [2, 1, 3, 1, 0, 2]
        },
        mineralData: {
            labels: ['Coal', 'Iron Ore', 'Diamond', 'Gold', 'Copper'],
            production: [1200, 950, 50, 75, 400],
            revenue: [24000, 38000, 50000, 45000, 16000]
        },
        forecastData: {
            labels: ['Current', '+1 Month', '+2 Months', '+3 Months', '+4 Months', '+5 Months', '+6 Months'],
            actual: [204000, 215000, 225000, 235000, null, null, null],
            forecast: [204000, 215000, 225000, 235000, 245000, 255000, 265000]
        }
    };
    
    // Chart ID aliases for handling inconsistencies
    const chartAliases = {
        'production-by-entity-chart': 'revenue-by-entity-chart',
        'revenue-by-entity-chart': 'production-by-entity-chart'
    };
    
    // Find canvas element by ID or alias
    function findCanvas(id) {
        const canvas = document.getElementById(id);
        if (canvas) return { id, canvas };
        
        const aliasId = chartAliases[id];
        if (aliasId) {
            const aliasCanvas = document.getElementById(aliasId);
            if (aliasCanvas) return { id: aliasId, canvas: aliasCanvas };
        }
        
        return { id, canvas: null };
    }
    
    // Initialize dashboard charts
    function initializeDashboardCharts() {
        console.log('Initializing dashboard charts...');
        
        if (!window.chartManager) {
            console.error('ChartManager not available, cannot initialize charts');
            return;
        }
        
        // 1. Revenue Trends Chart
        console.log('Creating revenue trends chart...');
        const { id: revenueId, canvas: revenueCanvas } = findCanvas('revenue-trends-chart');
        if (revenueCanvas) {
            try {
                window.chartManager.createRevenueChart(revenueId, sampleData.revenueData);
            } catch (error) {
                console.error('Error creating revenue chart:', error);
            }
        }
        
        // 2. Entity/Production Chart (has multiple ID conventions)
        console.log('Creating production/entity chart...');
        // First try production-by-entity-chart
        let { id: entityId, canvas: entityCanvas } = findCanvas('production-by-entity-chart');
        if (!entityCanvas) {
            // If not found, try revenue-by-entity-chart
            const result = findCanvas('revenue-by-entity-chart');
            entityId = result.id;
            entityCanvas = result.canvas;
        }
        
        if (entityCanvas) {
            try {
                // Try the most specific method first
                if (window.chartManager.createProductionChart) {
                    window.chartManager.createProductionChart(entityId, sampleData.entityData);
                } else if (window.chartManager.createEntityChart) {
                    window.chartManager.createEntityChart(entityId, sampleData.entityData);
                } else {
                    console.warn('No production chart method available, using generic create');
                    window.chartManager.create(entityId, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(sampleData.entityData),
                            datasets: [{
                                data: Object.values(sampleData.entityData),
                                backgroundColor: [
                                    '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb',
                                    '#6b32a8', '#8a41d8', '#a463f3', '#bc86f8', '#d1a9fc'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false
                        }
                    });
                }
            } catch (error) {
                console.error('Error creating production/entity chart:', error);
            }
        }
        
        // 3. Payment Timeline Chart
        console.log('Creating payment timeline chart...');
        const { id: paymentId, canvas: paymentCanvas } = findCanvas('payment-timeline-chart');
        if (paymentCanvas) {
            try {
                window.chartManager.create(paymentId, {
                    type: 'bar',
                    data: {
                        labels: sampleData.paymentData.labels,
                        datasets: [{
                            label: 'On Time',
                            data: sampleData.paymentData.onTime,
                            backgroundColor: '#2E7D32'
                        }, {
                            label: 'Late',
                            data: sampleData.paymentData.late,
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
                                stacked: true
                            },
                            x: {
                                stacked: true
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating payment timeline chart:', error);
            }
        }
        
        // 4. Mineral Performance Chart
        console.log('Creating mineral performance chart...');
        const { id: mineralId, canvas: mineralCanvas } = findCanvas('mineral-performance-chart');
        if (mineralCanvas) {
            try {
                window.chartManager.create(mineralId, {
                    type: 'bar',
                    data: {
                        labels: sampleData.mineralData.labels,
                        datasets: [{
                            label: 'Production Volume',
                            data: sampleData.mineralData.production,
                            backgroundColor: '#2d5282'
                        }, {
                            label: 'Royalty Revenue',
                            data: sampleData.mineralData.revenue,
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
                                position: 'left'
                            },
                            y1: {
                                beginAtZero: true,
                                position: 'right',
                                grid: {
                                    drawOnChartArea: false
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating mineral performance chart:', error);
            }
        }
        
        // 5. Forecast Chart
        console.log('Creating forecast chart...');
        const { id: forecastId, canvas: forecastCanvas } = findCanvas('forecast-chart');
        if (forecastCanvas) {
            try {
                window.chartManager.create(forecastId, {
                    type: 'line',
                    data: {
                        labels: sampleData.forecastData.labels,
                        datasets: [{
                            label: 'Actual',
                            data: sampleData.forecastData.actual,
                            borderColor: '#1a365d',
                            backgroundColor: 'rgba(26, 54, 93, 0.1)',
                            fill: true,
                            tension: 0.4
                        }, {
                            label: 'Forecast',
                            data: sampleData.forecastData.forecast,
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
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating forecast chart:', error);
            }
        }
        
        console.log('Dashboard charts initialization complete');
    }
    
    // Initialize when DOM content is loaded
    function initCharts() {
        // Check if dashboard is visible
        const dashboard = document.getElementById('dashboard');
        if (dashboard && window.getComputedStyle(dashboard).display !== 'none') {
            console.log('Dashboard is visible, initializing charts');
            initializeDashboardCharts();
        } else {
            console.log('Dashboard not visible or not loaded yet, waiting...');
            setTimeout(initCharts, 1000);
        }
    }
    
    // Set up dashboard section observer
    function setupDashboardObserver() {
        console.log('Setting up dashboard observer');
        
        // Set up a mutation observer to detect when the dashboard section becomes visible
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const dashboard = document.getElementById('dashboard');
                    if (dashboard && window.getComputedStyle(dashboard).display !== 'none') {
                        console.log('Dashboard section displayed, initializing charts');
                        initializeDashboardCharts();
                    }
                }
            });
        });
        
        // Start observing dashboard section
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection) {
            observer.observe(dashboardSection, { attributes: true });
        }
        
        // Also observe the main app container for section visibility changes
        const appContainer = document.getElementById('app-container') || document.querySelector('main');
        if (appContainer) {
            observer.observe(appContainer, { childList: true, subtree: true });
        }
    }
    
    // Export initialization function to global scope
    window.initializeDashboardCharts = initializeDashboardCharts;
    
    // Initialize after DOM content is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initCharts, 1500);
            setupDashboardObserver();
        });
    } else {
        setTimeout(initCharts, 1500);
        setupDashboardObserver();
    }
    
    // Add a final initialization call after everything should be loaded
    setTimeout(initCharts, 5000);
})();
