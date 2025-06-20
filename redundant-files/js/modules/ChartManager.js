export class ChartManager {
    constructor() {
        this.charts = new Map();
        this.isChartJsLoaded = typeof Chart !== 'undefined';
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        };
    }

    createChart(canvasId, config) {
        if (!this.isChartJsLoaded) {
            console.warn('Chart.js not available, showing fallback');
            this.showFallbackChart(canvasId);
            return null;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas ${canvasId} not found`);
            return null;
        }

        // Destroy existing chart
        if (this.charts.has(canvasId)) {
            this.destroyChart(canvasId);
        }

        try {
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
        } catch (error) {
            console.error(`Error creating chart ${canvasId}:`, error);
            this.showFallbackChart(canvasId);
            return null;
        }
    }

    createRevenueChart(canvasId, data = null) {
        const chartData = data || {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Revenue (E)',
                data: [45000, 52000, 48000, 61000, 55000, 67000],
                borderColor: '#1a365d',
                backgroundColor: 'rgba(26, 54, 93, 0.1)',
                tension: 0.4,
                fill: false
            }]
        };

        return this.createChart(canvasId, {
            type: 'line',
            data: chartData,
            options: {
                plugins: {
                    legend: { display: false }
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

    createProductionChart(canvasId, entityData) {
        const defaultData = {
            'Kwalini Quarry': 1250,
            'Maloma Colliery': 850,
            'Ngwenya Mine': 2100
        };

        const data = entityData || defaultData;
        
        return this.createChart(canvasId, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#1a365d', '#2d5a88', '#4a90c2', 
                        '#7ba7cc', '#a8c5e2', '#d4af37'
                    ]
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    updateChartType(canvasId, newType) {
        const chart = this.charts.get(canvasId);
        if (!chart) return;

        chart.config.type = newType;
        
        if (newType === 'area') {
            chart.data.datasets[0].fill = true;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.2)';
        } else if (newType === 'bar') {
            chart.data.datasets[0].fill = false;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.8)';
        } else {
            chart.data.datasets[0].fill = false;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.1)';
        }
        
        chart.update();
    }

    showFallbackChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const container = canvas.parentNode;
            if (container) {
                container.innerHTML = `
                    <div class="chart-fallback" style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 200px;
                        color: #64748b;
                        background: #f8fafc;
                        border-radius: 8px;
                        border: 2px dashed #cbd5e0;
                    ">
                        <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                        <p>Chart will load when Chart.js is available</p>
                    </div>
                `;
            }
        }
    }

    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            try {
                chart.destroy();
            } catch (error) {
                console.warn(`Error destroying chart ${canvasId}:`, error);
            }
            this.charts.delete(canvasId);
        }
    }

    destroyAll() {
        this.charts.forEach((chart, canvasId) => {
            try {
                chart.destroy();
            } catch (error) {
                console.warn(`Error destroying chart ${canvasId}:`, error);
            }
        });
        this.charts.clear();
    }
}
