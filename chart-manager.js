// Chart Manager for Mining Royalties Dashboard

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
    }

    create(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return null;
        }

        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return null;
        }

        // Destroy existing chart if it exists
        if (this.charts.has(canvasId)) {
            this.destroy(canvasId);
        }

        const mergedConfig = {
            ...config,
            options: {
                ...this.defaultOptions,
                ...config.options
            }
        };

        try {
            const chart = new Chart(canvas, mergedConfig);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error(`Error creating chart ${canvasId}:`, error);
            return null;
        }
    }

    destroy(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    getColorScheme() {
        return ['#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc', '#a8c5e2', '#d4af37'];
    }

    // Initialize dashboard charts
    initializeDashboardCharts(dataManager) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available');
            return;
        }

        setTimeout(() => {
            this.createRevenueChart(dataManager);
            this.createEntityChart(dataManager);
        }, 500);
    }

    createRevenueChart(dataManager) {
        const canvas = document.getElementById('revenue-trends-chart');
        if (!canvas) return;

        const records = dataManager.getRoyaltyRecords();
        const monthlyData = this.aggregateMonthlyData(records);

        const config = {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Revenue (E)',
                    data: monthlyData.values,
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'E' + (value/1000) + 'k';
                            }
                        }
                    }
                }
            }
        };

        this.create('revenue-trends-chart', config);
    }

    createEntityChart(dataManager) {
        const canvas = document.getElementById('production-by-entity-chart');
        if (!canvas) return;

        const entityData = this.aggregateEntityData(dataManager.getRoyaltyRecords());

        const config = {
            type: 'doughnut',
            data: {
                labels: entityData.labels,
                datasets: [{
                    data: entityData.values,
                    backgroundColor: this.getColorScheme()
                }]
            },
            options: {
                cutout: '60%',
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { font: { size: 11 } }
                    }
                }
            }
        };

        this.create('production-by-entity-chart', config);
    }

    aggregateMonthlyData(records) {
        if (records.length === 0) {
            return {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [0, 0, 0, 0, 0, 0]
            };
        }

        const monthlyTotals = {};
        
        records.forEach(record => {
            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0;
            }
            monthlyTotals[monthKey] += record.royalties || 0;
        });

        // Get last 6 months
        const currentDate = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push({
                key: monthKey,
                label: date.toLocaleDateString('en-US', { month: 'short' }),
                value: monthlyTotals[monthKey] || 0
            });
        }

        return {
            labels: months.map(m => m.label),
            values: months.map(m => m.value)
        };
    }

    aggregateEntityData(records) {
        if (records.length === 0) {
            return {
                labels: ['No Data'],
                values: [1]
            };
        }

        const entityTotals = {};
        
        records.forEach(record => {
            const entity = record.entity || 'Unknown';
            if (!entityTotals[entity]) {
                entityTotals[entity] = 0;
            }
            entityTotals[entity] += record.royalties || 0;
        });

        const sortedEntities = Object.entries(entityTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        return {
            labels: sortedEntities.map(([entity]) => entity),
            values: sortedEntities.map(([,total]) => total)
        };
    }
}

// Make ChartManager globally available
window.ChartManager = ChartManager;
