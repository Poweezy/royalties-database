// app.js - Mining Royalties Manager

// Chart.js charts reference
const charts = {
    revenueTrends: null,
    productionByEntity: null
};

// Initialize dashboard (only after login)
function initializeDashboard() {
    if (!isLoggedIn) return;
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Update dashboard metrics
    updateDashboardMetrics();
    
    // Initialize charts
    initializeCharts();
    
    console.log('Dashboard initialized');
}

// Initialize charts
function initializeCharts() {
    // Revenue Trends Chart
    const revenueCtx = document.getElementById('revenue-trends-chart');
    if (revenueCtx) {
        charts.revenueTrends = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (E)',
                    data: [45000, 52000, 48000, 61000, 55000, 67000],
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
                    legend: {
                        display: true,
                        position: 'top'
                    }
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
        });
    }
    
    // Production by Entity Chart
    const productionCtx = document.getElementById('production-by-entity-chart');
    if (productionCtx) {
        charts.productionByEntity = new Chart(productionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Kwalini Quarry', 'Mbabane Quarry', 'Sidvokodvo Quarry', 'Maloma Colliery'],
                datasets: [{
                    data: [1500, 2000, 1200, 800],
                    backgroundColor: [
                        '#1a365d',
                        '#2c5282',
                        '#3182ce',
                        '#4299e1'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
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
    }
}

// Handle chart type changes
function handleChartTypeChange(chartType, chartId) {
    console.log(`Changing chart ${chartId} to ${chartType} type`);
    
    if (chartId === 'revenue-trends-chart' && charts.revenueTrends) {
        // Update chart type
        charts.revenueTrends.config.type = chartType;
        
        // Update dataset properties based on chart type
        const dataset = charts.revenueTrends.config.data.datasets[0];
        
        if (chartType === 'area') {
            charts.revenueTrends.config.type = 'line';
            dataset.fill = true;
            dataset.backgroundColor = 'rgba(26, 54, 93, 0.3)';
        } else if (chartType === 'bar') {
            dataset.fill = false;
            dataset.backgroundColor = '#1a365d';
        } else if (chartType === 'line') {
            dataset.fill = false;
            dataset.backgroundColor = 'rgba(26, 54, 93, 0.1)';
        }
        
        // Update the chart
        charts.revenueTrends.update();
        
        showNotification(`Chart updated to ${chartType} view`, 'success');
    } else {
        showNotification(`Chart type changed to ${chartType}`, 'info');
    }
}

// ...existing code...