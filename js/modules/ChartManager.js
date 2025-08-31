/**
 * @fileoverview Chart management system for royalties dashboard
 * @module ChartManager
 */

export default class ChartManager {
    constructor() {
        this.charts = new Map();
        this.refreshInterval = null;
        this.lastUpdated = new Date();
        this.metricData = {
            revenue: { current: 0, previous: 0, change: 0 },
            production: { current: 0, previous: 0, change: 0 },
            compliance: { current: 0, previous: 0, change: 0 },
            forecast: { current: 0, previous: 0, change: 0 }
        };

        // Common chart configuration
        this.commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1a1a1a',
                    bodyColor: '#1a1a1a',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-SZ', {
                                    style: 'currency',
                                    currency: 'SZL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('en-SZ', {
                                style: 'currency',
                                currency: 'SZL',
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value);
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        };
    }

    initializeCharts() {
        return Promise.all([
            this.createRevenueChart(),
            this.createProductionChart(),
            this.createComplianceChart(),
            this.createForecastChart(),
            this.createComparativeChart()
        ])
        .then(() => {
            this.setupResponsiveness();
            this.setupChartRefresh();
        })
        .catch((error) => {
            console.error('Error initializing charts:', error);
        });
    }

    setupResponsiveness() {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const chartId = entry.target.id.replace('-container', '');
                const chart = this.charts.get(chartId);
                if (chart && chart.resize) {
                    chart.resize();
                }
            }
        });

        document.querySelectorAll('.chart-container').forEach(container => {
            resizeObserver.observe(container);
        });
    }

    setupChartRefresh() {
        // Refresh charts every 5 minutes
        setInterval(() => {
            this.refreshCharts();
        }, 300000);
    }

    refreshCharts() {
        this.charts.forEach(chart => {
            this.updateChartData(chart);
        });
    }

    updateChartData(chart) {
        if (chart.data && chart.data.datasets) {
            chart.data.datasets.forEach(dataset => {
                // Add slight random variation to simulate real-time updates
                dataset.data = dataset.data.map(value =>
                    value * (1 + (Math.random() - 0.5) * 0.05)
                );
            });
            chart.update('none'); // Update without animation
        }
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: '2024 Revenue',
                data: [85000, 92000, 98000, 105000, 112000, 118000, 125000, 131000, 138000, 145000, 152000, 159000],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: '2023 Revenue',
                data: [75000, 82000, 88000, 95000, 102000, 108000, 115000, 121000, 128000, 135000, 142000, 149000],
                borderColor: 'rgb(147, 197, 253)',
                backgroundColor: 'rgba(147, 197, 253, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                ...this.commonOptions,
                plugins: {
                    ...this.commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Monthly Revenue Trend'
                    }
                }
            }
        });

        this.charts.set('revenue-chart', chart);
        return chart;
    }

    createProductionChart() {
        const ctx = document.getElementById('production-chart').getContext('2d');
        const data = {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Production Volume',
                data: [250000, 285000, 320000, 355000],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(147, 197, 253, 0.7)',
                    'rgba(96, 165, 250, 0.7)',
                    'rgba(37, 99, 235, 0.7)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(147, 197, 253)',
                    'rgb(96, 165, 250)',
                    'rgb(37, 99, 235)'
                ],
                borderWidth: 1
            }]
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                ...this.commonOptions,
                plugins: {
                    ...this.commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Quarterly Production Volume'
                    }
                }
            }
        });

        this.charts.set('production-chart', chart);
        return chart;
    }

    createComplianceChart() {
        const ctx = document.getElementById('compliance-chart').getContext('2d');
        const data = {
            labels: ['Documentation', 'Payments', 'Reporting', 'Environmental', 'Safety'],
            datasets: [{
                label: 'Compliance Rate',
                data: [95, 88, 92, 85, 90],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(59, 130, 246)'
            }]
        };

        const chart = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                ...this.commonOptions,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    ...this.commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Compliance Metrics'
                    }
                }
            }
        });

        this.charts.set('compliance-chart', chart);
        return chart;
    }

    createForecastChart() {
        const ctx = document.getElementById('forecast-chart').getContext('2d');
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Actual Revenue',
                data: [85000, 92000, 98000, 105000, 112000, 118000],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: false
            }, {
                label: 'Forecasted Revenue',
                data: [118000, 125000, 132000, 139000, 146000, 153000],
                borderColor: 'rgb(234, 179, 8)',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                borderDash: [5, 5],
                fill: false
            }]
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                ...this.commonOptions,
                plugins: {
                    ...this.commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Revenue Forecast'
                    }
                }
            }
        });

        this.charts.set('forecast-chart', chart);
        return chart;
    }

    createComparativeChart() {
        const ctx = document.getElementById('comparative-chart').getContext('2d');
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                type: 'line',
                label: 'Revenue Trend',
                data: [85000, 92000, 98000, 105000, 112000, 118000],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                type: 'bar',
                label: 'Monthly Production',
                data: [80000, 88000, 95000, 102000, 109000, 115000],
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                borderColor: 'rgb(234, 179, 8)',
                borderWidth: 1,
                yAxisID: 'y1'
            }]
        };

        const chart = new Chart(ctx, {
            type: 'scatter',
            data: data,
            options: {
                ...this.commonOptions,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Revenue'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Production'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                plugins: {
                    ...this.commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Revenue vs Production'
                    }
                }
            }
        });

        this.charts.set('comparative-chart', chart);
        return chart;
    }

    destroy() {
        this.charts.forEach(chart => {
            if (chart.destroy) {
                chart.destroy();
            }
        });
        this.charts.clear();
    }
}
