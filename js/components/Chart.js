// Chart Component Wrapper
export class ChartManager {
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

        const chart = new Chart(canvas, mergedConfig);
        this.charts.set(canvasId, chart);
        return chart;
    }

    createLineChart(canvasId, data, options = {}) {
        return this.create(canvasId, {
            type: 'line',
            data,
            options: {
                ...options,
                scales: {
                    y: {
                        beginAtZero: true,
                        ...options.scales?.y
                    },
                    ...options.scales
                }
            }
        });
    }

    createBarChart(canvasId, data, options = {}) {
        return this.create(canvasId, {
            type: 'bar',
            data,
            options: {
                ...options,
                scales: {
                    y: {
                        beginAtZero: true,
                        ...options.scales?.y
                    },
                    ...options.scales
                }
            }
        });
    }

    createDoughnutChart(canvasId, data, options = {}) {
        return this.create(canvasId, {
            type: 'doughnut',
            data,
            options: {
                ...options,
                cutout: '60%'
            }
        });
    }

    createPieChart(canvasId, data, options = {}) {
        return this.create(canvasId, {
            type: 'pie',
            data,
            options
        });
    }

    createAreaChart(canvasId, data, options = {}) {
        const chartData = {
            ...data,
            datasets: data.datasets.map(dataset => ({
                ...dataset,
                fill: true,
                backgroundColor: dataset.backgroundColor || 'rgba(26, 54, 93, 0.2)'
            }))
        };

        return this.create(canvasId, {
            type: 'line',
            data: chartData,
            options
        });
    }

    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.data = newData;
            chart.update();
        }
    }

    updateChartType(canvasId, newType) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.config.type = newType;
            
            // Handle type-specific adjustments
            if (newType === 'line' || newType === 'area') {
                chart.data.datasets.forEach(dataset => {
                    if (newType === 'area') {
                        dataset.fill = true;
                        dataset.backgroundColor = dataset.backgroundColor || 'rgba(26, 54, 93, 0.2)';
                    } else {
                        dataset.fill = false;
                    }
                });
            } else if (newType === 'bar') {
                chart.data.datasets.forEach(dataset => {
                    dataset.fill = false;
                    dataset.backgroundColor = dataset.backgroundColor || 'rgba(26, 54, 93, 0.8)';
                });
            }
            
            chart.update();
        }
    }

    get(canvasId) {
        return this.charts.get(canvasId);
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

    // Preset chart configurations for mining royalties
    createRevenueChart(canvasId, data) {
        return this.createLineChart(canvasId, data, {
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue Trends'
                },
                legend: {
                    display: false
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
        });
    }

    createProductionChart(canvasId, entityData) {
        const data = {
            labels: Object.keys(entityData),
            datasets: [{
                data: Object.values(entityData),
                backgroundColor: [
                    '#1a365d', '#2d5a88', '#4a90c2', 
                    '#7ba7cc', '#a8c5e2', '#d4af37'
                ]
            }]
        };

        return this.createDoughnutChart(canvasId, data, {
            plugins: {
                title: {
                    display: true,
                    text: 'Production by Entity'
                }
            }
        });
    }

    createComplianceChart(canvasId, complianceData) {
        return this.createBarChart(canvasId, complianceData, {
            plugins: {
                title: {
                    display: true,
                    text: 'Compliance Rates by Entity'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        });
    }

    // Chart export functionality
    exportChart(canvasId, filename = 'chart') {
        const chart = this.charts.get(canvasId);
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = url;
            link.click();
        }
    }

    // Animation helpers
    animateChart(canvasId, duration = 1000) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.options.animation = {
                duration: duration,
                easing: 'easeInOutQuart'
            };
            chart.update();
        }
    }

    // Color scheme helpers
    getColorScheme(theme = 'primary') {
        const schemes = {
            primary: ['#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc', '#a8c5e2'],
            accent: ['#d4af37', '#e6c659', '#f2d678', '#fae596', '#fff4b4'],
            mixed: ['#1a365d', '#d4af37', '#2d5a88', '#e6c659', '#4a90c2'],
            status: {
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
                info: '#3b82f6',
                secondary: '#6b7280'
            }
        };
        return schemes[theme] || schemes.primary;
    }

    // Responsive helpers
    makeResponsive(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.options.responsive = true;
            chart.options.maintainAspectRatio = false;
            chart.update();
        }
    }

    // Data transformation helpers
    transformDataForChart(data, xField, yField, groupField = null) {
        if (groupField) {
            const grouped = data.reduce((acc, item) => {
                const group = item[groupField];
                if (!acc[group]) acc[group] = [];
                acc[group].push(item);
                return acc;
            }, {});

            return {
                labels: [...new Set(data.map(item => item[xField]))],
                datasets: Object.keys(grouped).map((group, index) => {
                    const colors = this.getColorScheme('mixed');
                    return {
                        label: group,
                        data: grouped[group].map(item => item[yField]),
                        backgroundColor: colors[index % colors.length],
                        borderColor: colors[index % colors.length],
                        borderWidth: 2
                    };
                })
            };
        } else {
            return {
                labels: data.map(item => item[xField]),
                datasets: [{
                    data: data.map(item => item[yField]),
                    backgroundColor: this.getColorScheme('primary'),
                    borderColor: '#1a365d',
                    borderWidth: 2
                }]
            };
        }
    }
}
