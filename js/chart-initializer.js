/**
 * Chart Initializer
 * 
 * This script ensures proper chart initialization across the application.
 * It provides reliable chart initialization regardless of navigation path.
 * 
 * Version: 1.0.0 (2025-06-22)
 */

(function() {
    // Script loading guard
    if (window.CHART_INITIALIZER_LOADED) {
        console.log('Chart initializer already loaded, skipping initialization');
        return;
    }
    window.CHART_INITIALIZER_LOADED = true;
    
    console.log('Chart Initializer: Starting...');
    
    // Ensure Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart Initializer: Chart.js not loaded! Charts will not work.');
        return;
    }
    
    // Set global Chart.js defaults
    Chart.defaults.font.family = "'Inter', 'Helvetica', 'Arial', sans-serif";
    Chart.defaults.color = '#555555';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    Chart.defaults.plugins.legend.position = 'bottom';
    
    // Color schemes for consistent chart appearance
    const colorSchemes = {
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
    
    /**
     * Initialize dashboard charts whenever the dashboard is loaded
     */
    function initializeDashboardCharts() {
        console.log('Chart Initializer: Checking dashboard charts...');
        
        // Payment timeline chart
        initializeChart('payment-timeline-chart', (canvas) => {
            const ctx = canvas.getContext('2d');
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Expected Payments',
                        data: [125000, 132000, 128000, 135000, 142000, 138000, 145000, 150000, 152000, 148000, 155000, 160000],
                        borderColor: colorSchemes.primary[2],
                        backgroundColor: 'rgba(59, 110, 182, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Actual Payments',
                        data: [120000, 128000, 125000, 130000, 140000, 135000, 142000, 148000, 150000, 145000, 153000, 157000],
                        borderColor: colorSchemes.financial[0],
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Payment Timeline'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': E';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat().format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return 'E' + new Intl.NumberFormat().format(value);
                                }
                            }
                        }
                    }
                }
            });
        });

        // Revenue trends chart
        initializeChart('revenue-trends-chart', (canvas) => {
            const ctx = canvas.getContext('2d');
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [320000, 340000, 360000, 330000, 350000, 380000],
                        backgroundColor: colorSchemes.financial[0],
                        borderRadius: 4
                    }, {
                        label: 'Costs',
                        data: [220000, 240000, 230000, 220000, 240000, 250000],
                        backgroundColor: colorSchemes.financial[5],
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Revenue vs Costs'
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return 'E' + new Intl.NumberFormat().format(value);
                                }
                            }
                        }
                    }
                }
            });
        });
        
        // Revenue by entity chart
        initializeChart('revenue-by-entity-chart', (canvas) => {
            const ctx = canvas.getContext('2d');
            return new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Mine A', 'Mine B', 'Mine C', 'Mine D', 'Mine E', 'Other'],
                    datasets: [{
                        data: [35, 25, 20, 10, 5, 5],
                        backgroundColor: colorSchemes.primary,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Revenue Distribution by Mine'
                        }
                    }
                }
            });
        });
        
        // Forecast chart
        initializeChart('forecast-chart', (canvas) => {
            const ctx = canvas.getContext('2d');
            const currentYear = new Date().getFullYear();
            
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [`${currentYear}`, `${currentYear+1}`, `${currentYear+2}`, `${currentYear+3}`, `${currentYear+4}`],
                    datasets: [{
                        label: 'Actual',
                        data: [2.2, null, null, null, null],
                        borderColor: colorSchemes.primary[3],
                        backgroundColor: 'rgba(89, 138, 222, 0.1)',
                        borderWidth: 2,
                        pointRadius: 5,
                        fill: true,
                        tension: 0
                    }, {
                        label: 'Forecast',
                        data: [null, 2.4, 2.7, 3.1, 3.5],
                        borderColor: colorSchemes.financial[2],
                        backgroundColor: 'rgba(139, 195, 74, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 5,
                        fill: true,
                        tension: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Revenue Forecast (in millions)'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return 'E' + value + 'M';
                                }
                            }
                        }
                    }
                }
            });
        });
        
        // Production-royalty correlation
        initializeChart('production-royalty-correlation', (canvas) => {
            const ctx = canvas.getContext('2d');
            return new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Mine A',
                        data: [
                            {x: 100, y: 35000},
                            {x: 120, y: 42000},
                            {x: 140, y: 48000},
                            {x: 160, y: 55000},
                            {x: 180, y: 62000}
                        ],
                        backgroundColor: colorSchemes.primary[0],
                        borderColor: colorSchemes.primary[0],
                        pointRadius: 6
                    }, {
                        label: 'Mine B',
                        data: [
                            {x: 80, y: 30000},
                            {x: 100, y: 36000},
                            {x: 120, y: 44000},
                            {x: 140, y: 52000},
                            {x: 160, y: 58000}
                        ],
                        backgroundColor: colorSchemes.primary[3],
                        borderColor: colorSchemes.primary[3],
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Production vs Royalty Correlation'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Production (tons)'
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Royalties (E)'
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return 'E' + new Intl.NumberFormat().format(value);
                                }
                            }
                        }
                    }
                }
            });
        });
        
        // Mineral performance chart
        initializeChart('mineral-performance-chart', (canvas) => {
            const ctx = canvas.getContext('2d');
            return new Chart(ctx, {
                type: 'polarArea',
                data: {
                    labels: ['Gold', 'Coal', 'Iron Ore', 'Copper', 'Limestone', 'Manganese'],
                    datasets: [{
                        data: [32, 24, 18, 12, 8, 6],
                        backgroundColor: [
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(54, 54, 54, 0.7)',
                            'rgba(215, 95, 65, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 255, 255, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Mineral Distribution (%)'
                        },
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        });
    }
    
    /**
     * Initialize a single chart
     * @param {string} canvasId - The ID of the canvas element
     * @param {function} chartCreator - Function that creates and returns a Chart instance
     */
    function initializeChart(canvasId, chartCreator) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.log(`Chart canvas not found: ${canvasId}`);
            return null;
        }
        
        // If chart already exists in the chartManager, destroy it first
        if (window.chartManager && window.chartManager.charts && window.chartManager.charts.has(canvasId)) {
            const existingChart = window.chartManager.charts.get(canvasId);
            if (existingChart) {
                console.log(`Destroying existing chart: ${canvasId}`);
                existingChart.destroy();
                window.chartManager.charts.delete(canvasId);
            }
        }
        
        // Create new chart
        try {
            console.log(`Creating chart: ${canvasId}`);
            const chart = chartCreator(canvas);
            
            // Store in chartManager if it exists
            if (window.chartManager && window.chartManager.charts instanceof Map) {
                window.chartManager.charts.set(canvasId, chart);
                console.log(`Chart registered with chartManager: ${canvasId}`);
            }
            
            return chart;
        } catch (error) {
            console.error(`Error creating chart ${canvasId}:`, error);
            return null;
        }
    }
    
    /**
     * Check for dashboard section and initialize charts if needed
     */
    function checkAndInitializeCharts() {
        // Check if dashboard section is active
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection && window.getComputedStyle(dashboardSection).display !== 'none') {
            console.log('Dashboard section is active, initializing charts...');
            initializeDashboardCharts();
        } else {
            console.log('Dashboard section not active, skipping chart initialization');
        }
    }
    
    // Set up dashboard section observer
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' && 
                mutation.target.id === 'dashboard') {
                
                const isVisible = window.getComputedStyle(mutation.target).display !== 'none';
                if (isVisible) {
                    console.log('Dashboard section became visible, initializing charts...');
                    setTimeout(initializeDashboardCharts, 100); // Slight delay to ensure DOM is ready
                }
            }
        });
    });
    
    // Observe dashboard section for visibility changes
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        observer.observe(dashboardSection, { attributes: true });
        console.log('Dashboard section observer set up');
    }
    
    // Listen for section changes
    document.addEventListener('sectionLoaded', function(e) {
        if (e.detail && e.detail.sectionId === 'dashboard') {
            console.log('Dashboard section loaded event received');
            setTimeout(initializeDashboardCharts, 300); // Delay to ensure DOM is ready
        }
    });
    
    // Register with window.app if it exists
    if (window.app) {
        window.app.initializeDashboardCharts = initializeDashboardCharts;
        console.log('Registered initializeDashboardCharts with window.app');
    }
    
    // Run initialization immediately if the page is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(checkAndInitializeCharts, 500);
    } else {
        // Otherwise wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(checkAndInitializeCharts, 500);
        });
    }
    
    // Also run initialization when the window is fully loaded
    window.addEventListener('load', function() {
        setTimeout(checkAndInitializeCharts, 1000);
    });
    
    console.log('Chart Initializer: Setup complete');
})();
