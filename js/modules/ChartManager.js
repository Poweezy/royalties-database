export class ChartManager {
    // Mock data for metric cards to simulate filtering
    #metricData = {
        'royalties': {
            '2024': { value: 'E 992,500.00', trend: '<i class="fas fa-arrow-up trend-positive"></i> +15.8% from last year', forecast: 'E 1,200,000.00', yoyGrowth: 15.8 },
            '2023': { value: 'E 857,100.00', trend: '<i class="fas fa-arrow-down trend-negative"></i> -5.2% from 2022', forecast: 'E 820,000.00', yoyGrowth: -5.2 },
            'all': { value: 'E 1,849,600.00', trend: 'Covering all available time', forecast: 'E 2,100,000.00', yoyGrowth: 0 }
        },
        'entities': {
            'current': { value: '6', trend: '<i class="fas fa-arrow-up trend-positive"></i> +2 new this month', yoyGrowth: 50 },
            'last': { value: '4', trend: '<i class="fas fa-minus"></i> No change from previous quarter', yoyGrowth: 0 },
            'ytd': { value: '8', trend: '<i class="fas fa-arrow-up trend-positive"></i> +4 new this year', yoyGrowth: 100 }
        }
    };

    constructor() {
        this.charts = new Map();
        this.refreshInterval = null;
        this.lastUpdated = new Date();
        this.dashboardConfig = {
            autoRefresh: false,
            refreshInterval: 30000, // 30 seconds
            theme: 'light',
            widgets: {
                kpis: true,
                revenueChart: true,
                productionChart: true,
                complianceChart: true,
                recentActivity: true,
                quickActions: true,
                forecast: true,
                comparative: true
            }
        };
        this.setupAutoRefresh();
    }

    async initializeCharts() {
        try {
            await Promise.all([
                this.createRevenueChart(),
                this.createProductionChart(),
                this.createComplianceChart(),
                this.createForecastChart(),
                this.createComparativeChart()
            ]);

            // Add a small delay to allow the DOM to update, then resize the charts
            setTimeout(() => {
                this.charts.forEach(chart => {
                    chart.resize();
                });
            }, 150);

            this.updateLastRefreshTime();
            this.updateKPICards();
        } catch (error) {
            console.warn('Chart initialization failed:', error);
            this.showFallbackCharts();
        }
    }

    async createRevenueChart() {
        const canvas = document.getElementById('revenue-trends-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        this.charts.get('revenue')?.destroy();

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (E)',
                    data: [500000, 600000, 750000, 700000, 800000, 900000],
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'top' } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => `E ${value.toLocaleString()}` }
                    },
                    x: { grid: { display: false } }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });

        this.charts.set('revenue', chart);
    }

    async createProductionChart() {
        const canvas = document.getElementById('production-by-entity-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        this.charts.get('production')?.destroy();

        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Kwalini Quarry', 'Mbabane Quarry', 'Sidvokodvo Quarry', 'Maloma Colliery', 'Ngwenya Mine', 'Malolotja Mine'],
                datasets: [{
                    label: 'Production Volume (m³)',
                    data: [45000, 38000, 42000, 55000, 28000, 32000],
                    backgroundColor: ['#1a365d', '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed'],
                    borderColor: ['#1a365d', '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const elementIndex = elements[0].index;
                        this.drillDownEntity(elementIndex);
                    }
                },
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12 } } },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const { label, parsed } = context;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((parsed / total) * 100).toFixed(1);
                                return `${label}: ${parsed.toLocaleString()} m³ (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.charts.set('production', chart);
    }

    async createComplianceChart() {
        const canvas = document.getElementById('compliance-trends-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        this.charts.get('compliance')?.destroy();

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Compliance Rate (%)',
                    data: [85, 92, 78, 95, 88, 91],
                    backgroundColor: '#059669',
                    borderColor: '#047857',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: value => `${value}%` }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' }
                }
            }
        });

        this.charts.set('compliance', chart);
    }

    async createForecastChart() {
        const canvas = document.getElementById('revenue-forecast-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        this.charts.get('forecast')?.destroy();

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Actual Revenue',
                    data: [800000, 850000, 900000, 920000, 950000, 980000],
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Forecasted Revenue',
                    data: [null, null, null, null, 970000, 1020000],
                    borderColor: '#d69e2e',
                    backgroundColor: 'rgba(214, 158, 46, 0.1)',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => `E ${value.toLocaleString()}` }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' }
                }
            }
        });

        this.charts.set('forecast', chart);
    }

    async createComparativeChart() {
        const canvas = document.getElementById('comparative-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        this.charts.get('comparative')?.destroy();

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: '2024',
                    data: [500000, 600000, 750000, 700000, 800000, 900000],
                    backgroundColor: '#1a365d',
                    borderColor: '#153450',
                    borderWidth: 2
                }, {
                    label: '2023',
                    data: [450000, 520000, 680000, 620000, 720000, 780000],
                    backgroundColor: '#2563eb',
                    borderColor: '#1d4ed8',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => `E ${value.toLocaleString()}` }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' }
                }
            }
        });

        this.charts.set('comparative', chart);
    }

    showFallbackCharts() {
        const containers = ['#revenue-trends-chart', '#production-by-entity-chart'];
        containers.forEach(selector => {
            const container = document.querySelector(selector)?.parentNode;
            if (container) {
                container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #64748b;">Chart data will be loaded shortly...</p>';
            }
        });
    }

    /**
     * Updates a dashboard metric card with new data based on a filter.
     * @param {string} metricId - The root ID of the metric to update (e.g., 'royalties').
     * @param {string} filter - The selected filter value (e.g., '2024').
     */
    updateMetric(metricId, filter) {
        const data = this.#metricData[metricId]?.[filter];
        if (!data) {
            console.warn(`No data found for metric '${metricId}' with filter '${filter}'`);
            return;
        }

        // Find the metric card using the dropdown's ID
        const metricSelect = document.getElementById(`${metricId}-period`);
        const metricCard = metricSelect?.closest('.metric-card');

        if (!metricCard) {
            console.error(`Could not find metric card for ID: ${metricId}`);
            return;
        }

        const valueElement = metricCard.querySelector('.card-body p');
        const trendElement = metricCard.querySelector('.card-body .trend-indicator');

        if (valueElement) {
            valueElement.textContent = data.value;
        } else {
            console.error(`Value element not found in metric card for '${metricId}'`);
        }

        if (trendElement) {
            trendElement.innerHTML = data.trend;
        }
    }

    /**
     * Updates a specific chart with new data.
     * @param {string} chartName - The name of the chart to update ('revenue' or 'production').
     * @param {Array<string>} labels - The new labels for the chart.
     * @param {Array<number>} data - The new data points for the chart.
     */
    updateChart(chartName, labels, data) {
        const chart = this.charts.get(chartName);
        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();
        } else {
            console.warn(`Chart '${chartName}' not found for update.`);
        }
    }

    getChart(chartId) {
        if (chartId === 'revenue-trends-chart') {
            return this.charts.get('revenue');
        } else if (chartId === 'production-by-entity-chart') {
            return this.charts.get('production');
        }
        return null;
    }

    changeChartType(chartName, newType) {
        const chart = this.charts.get(chartName);
        if (!chart) {
            console.warn(`Chart '${chartName}' not found for type change.`);
            return;
        }

        // Handle 'area' chart type as a filled line chart
        if (newType === 'area') {
            chart.config.type = 'line';
            chart.data.datasets.forEach(d => { d.fill = true; });
        } else if (newType === 'line') {
            chart.config.type = 'line';
            chart.data.datasets.forEach(d => { d.fill = false; });
        } else {
            // For other types like 'bar', 'pie', etc.
            chart.config.type = newType;
            // Ensure fill is false for non-area line charts
            if (newType !== 'line') {
                chart.data.datasets.forEach(d => {
                    if (d.type === 'line') d.fill = false;
                });
            }
        }

        chart.update();
    }

    // Auto-refresh functionality
    setupAutoRefresh() {
        const refreshButton = document.getElementById('refresh-dashboard');
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');

        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.refreshDashboard());
        }

        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.dashboardConfig.autoRefresh = e.target.checked;
                this.toggleAutoRefresh();
            });
        }
    }

    toggleAutoRefresh() {
        if (this.dashboardConfig.autoRefresh) {
            this.refreshInterval = setInterval(() => {
                this.refreshDashboard(false);
            }, this.dashboardConfig.refreshInterval);
        } else {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async refreshDashboard(showNotification = true) {
        try {
            this.lastUpdated = new Date();

            // Simulate data refresh
            await this.initializeCharts();
            this.updateLastRefreshTime();
            this.updateKPICards();

            if (showNotification && window.notificationManager) {
                window.notificationManager.show('Dashboard refreshed successfully', 'success');
            }

            // Update live indicators
            this.updateLiveIndicators();

        } catch (error) {
            console.error('Dashboard refresh failed:', error);
            if (window.notificationManager) {
                window.notificationManager.show('Dashboard refresh failed', 'error');
            }
        }
    }

    updateLastRefreshTime() {
        const timeElement = document.getElementById('last-refresh-time');
        if (timeElement) {
            timeElement.textContent = `Last updated: ${this.lastUpdated.toLocaleTimeString()}`;
        }
    }

    updateLiveIndicators() {
        const indicators = document.querySelectorAll('.live-indicator');
        indicators.forEach(indicator => {
            indicator.classList.add('pulse');
            setTimeout(() => indicator.classList.remove('pulse'), 1000);
        });
    }

    // Enhanced KPI Cards
    updateKPICards() {
        this.updateAdvancedMetrics();
        this.updateTrendAnalysis();
        this.updateForecastMetrics();
    }

    updateAdvancedMetrics() {
        const metrics = {
            'revenue-per-entity': { value: 'E 165,417', trend: '+8.5%' },
            'avg-production-efficiency': { value: '87.5%', trend: '+3.2%' },
            'compliance-score': { value: '94.2%', trend: '+1.8%' },
            'month-over-month': { value: '+12.8%', trend: 'trending-up' }
        };

        Object.entries(metrics).forEach(([id, data]) => {
            const valueElement = document.getElementById(id);
            const trendElement = document.getElementById(`${id}-trend`);

            if (valueElement) valueElement.textContent = data.value;
            if (trendElement) trendElement.textContent = data.trend;
        });
    }

    updateTrendAnalysis() {
        // Update trend sparklines if they exist
        const sparklineElements = document.querySelectorAll('.trend-sparkline');
        sparklineElements.forEach(element => {
            this.createSparkline(element);
        });
    }

    createSparkline(element) {
        if (typeof Chart === 'undefined') return;

        const canvas = element.querySelector('canvas') || document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 30;
        element.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', ''],
                datasets: [{
                    data: [65, 59, 80, 81, 56, 87],
                    borderColor: '#1a365d',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: { x: { display: false }, y: { display: false } },
                plugins: { legend: { display: false } },
                elements: { point: { radius: 0 } }
            }
        });
    }

    updateForecastMetrics() {
        const forecastElements = {
            'next-month-forecast': 'E 1,050,000',
            'quarterly-projection': 'E 3,200,000',
            'annual-target-progress': '78%'
        };

        Object.entries(forecastElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    // Chart Export Functionality
    async exportChart(chartId, format = 'png') {
        const chart = this.getChart(chartId);
        if (!chart) {
            console.warn(`Chart '${chartId}' not found for export.`);
            return;
        }

        try {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.href = url;
            link.download = `${chartId}_${new Date().toISOString().slice(0, 10)}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (window.notificationManager) {
                window.notificationManager.show('Chart exported successfully', 'success');
            }
        } catch (error) {
            console.error('Chart export failed:', error);
            if (window.notificationManager) {
                window.notificationManager.show('Chart export failed', 'error');
            }
        }
    }

    // Drill-down functionality
    drillDownEntity(entityIndex) {
        const entities = ['Kwalini Quarry', 'Mbabane Quarry', 'Sidvokodvo Quarry', 'Maloma Colliery', 'Ngwenya Mine', 'Malolotja Mine'];
        const entityName = entities[entityIndex];

        // Show detailed view for selected entity
        this.showEntityDetails(entityName);
    }

    showEntityDetails(entityName) {
        const modal = document.getElementById('entity-details-modal');
        if (modal) {
            const nameElement = modal.querySelector('#entity-name');
            const detailsContainer = modal.querySelector('#entity-details-content');

            if (nameElement) nameElement.textContent = entityName;
            if (detailsContainer) {
                detailsContainer.innerHTML = this.generateEntityDetailsHTML(entityName);
            }

            modal.style.display = 'block';
        }
    }

    generateEntityDetailsHTML(entityName) {
        return `
      <div class="entity-detail-card">
        <h4>Production Details</h4>
        <p>Monthly Volume: 45,000 m³</p>
        <p>Revenue Contribution: E 180,000</p>
        <p>Compliance Rate: 95%</p>
      </div>
      <div class="entity-detail-card">
        <h4>Recent Activity</h4>
        <ul>
          <li>Payment received - E 15,000</li>
          <li>Production report submitted</li>
          <li>Compliance check completed</li>
        </ul>
      </div>
    `;
    }

    // Dashboard customization
    toggleWidget(widgetName) {
        this.dashboardConfig.widgets[widgetName] = !this.dashboardConfig.widgets[widgetName];
        this.updateWidgetVisibility();
        this.saveDashboardConfig();
    }

    updateWidgetVisibility() {
        Object.entries(this.dashboardConfig.widgets).forEach(([widget, visible]) => {
            const element = document.getElementById(`${widget}-widget`);
            if (element) {
                element.style.display = visible ? 'block' : 'none';
            }
        });
    }

    saveDashboardConfig() {
        localStorage.setItem('dashboardConfig', JSON.stringify(this.dashboardConfig));
    }

    loadDashboardConfig() {
        const saved = localStorage.getItem('dashboardConfig');
        if (saved) {
            this.dashboardConfig = { ...this.dashboardConfig, ...JSON.parse(saved) };
        }
    }

    // Theme switching
    switchTheme(theme) {
        this.dashboardConfig.theme = theme;
        document.body.setAttribute('data-theme', theme);
        this.updateChartsTheme(theme);
        this.saveDashboardConfig();
    }

    updateChartsTheme(theme) {
        const colors = theme === 'dark'
            ? { background: '#1a202c', text: '#ffffff', grid: '#2d3748' }
            : { background: '#ffffff', text: '#1a202c', grid: '#e2e8f0' };

        this.charts.forEach(chart => {
            chart.options.plugins.legend.labels.color = colors.text;
            chart.options.scales.x.ticks.color = colors.text;
            chart.options.scales.y.ticks.color = colors.text;
            chart.options.scales.x.grid.color = colors.grid;
            chart.options.scales.y.grid.color = colors.grid;
            chart.update();
        });
    }

    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        clearInterval(this.refreshInterval);
    }
}
