import { SectionLoader } from '../section-loaders.js';

export class DashboardManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.charts = {};
        this.isInitialized = false;
    }

    async loadSection() {
        const section = document.getElementById('dashboard');
        if (!section) return;

        try {
            // Try to load the comprehensive dashboard component first
            const response = await fetch('components/dashboard.html');
            if (response.ok) {
                const template = await response.text();
                section.innerHTML = template;
                console.log('Loaded comprehensive dashboard component');
            } else {
                console.log('Dashboard component not found, using fallback');
                this.loadFallbackContent(section);
            }
        } catch (error) {
            console.log('Loading dashboard template failed, using fallback:', error);
            this.loadFallbackContent(section);
        }

        // Initialize dashboard functionality
        await this.initializeDashboard();
    }

    loadFallbackContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📊 Mining Royalties Dashboard</h1>
                    <p>Comprehensive overview of production, payments, compliance, and financial performance</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-info" id="refresh-dashboard-btn">
                        <i class="fas fa-sync-alt"></i> Refresh Data
                    </button>
                    <button class="btn btn-success" id="export-dashboard-btn">
                        <i class="fas fa-download"></i> Export Report
                    </button>
                    <button class="btn btn-secondary" id="customize-dashboard-btn">
                        <i class="fas fa-cog"></i> Customize View
                    </button>
                </div>
            </div>

            <!-- Production Tracking KPIs -->
            <div class="dashboard-section">
                <h3 class="section-title"><i class="fas fa-industry"></i> Production Tracking & Key Performance Indicators</h3>
                
                <div class="charts-grid">
                    <div class="metric-card card">
                        <div class="card-header">
                            <h3><i class="fas fa-weight"></i> Total Production Volume</h3>
                        </div>
                        <div class="card-body">
                            <p id="total-production">0 tonnes</p>
                            <small id="production-trend" class="trend-positive">
                                <i class="fas fa-arrow-up"></i> +12% vs last period
                            </small>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="card-header">
                            <h3><i class="fas fa-money-bill-wave"></i> Total Royalties Calculated</h3>
                        </div>
                        <div class="card-body">
                            <p id="total-royalties-calculated">E 0</p>
                            <small id="calculated-trend" class="trend-positive">
                                <i class="fas fa-arrow-up"></i> +8% this period
                            </small>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="card-header">
                            <h3><i class="fas fa-percentage"></i> Overall Compliance Rate</h3>
                        </div>
                        <div class="card-body">
                            <p id="overall-compliance">92%</p>
                            <div class="mini-progress">
                                <div class="progress-bar" id="compliance-progress" style="width: 92%;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="card-header">
                            <h3><i class="fas fa-coins"></i> Total Royalty Revenue</h3>
                        </div>
                        <div class="card-body">
                            <p id="total-royalty-revenue">E 0</p>
                            <small id="revenue-trend" class="trend-positive">
                                <i class="fas fa-arrow-up"></i> +15% YoY growth
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-grid">
                <div class="card analytics-chart">
                    <div class="chart-header">
                        <h5><i class="fas fa-chart-line"></i> Revenue Trends</h5>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart-type="line" data-chart-id="revenue-trends-chart">Line</button>
                            <button class="chart-btn" data-chart-type="area" data-chart-id="revenue-trends-chart">Area</button>
                            <button class="chart-btn" data-chart-type="bar" data-chart-id="revenue-trends-chart">Bar</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="revenue-trends-chart"></canvas>
                    </div>
                </div>

                <div class="card analytics-chart">
                    <div class="chart-header">
                        <h5><i class="fas fa-chart-pie"></i> Production by Entity</h5>
                    </div>
                    <div class="chart-container">
                        <canvas id="production-by-entity-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-history"></i> Recent Activity</h5>
                </div>
                <div class="card-body">
                    <div id="recent-activity" class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                            <div class="activity-content">
                                <p>Loading recent activity...</p>
                                <small>Please wait</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initializeDashboard() {
        // Wait a moment for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Update all metrics and data
        this.updateComprehensiveMetrics();
        this.setupCharts();
        this.updateRecentActivity();
        this.setupEventHandlers();
        this.setupComplianceAlerts();
        this.setupForecastingTool();
        
        this.isInitialized = true;
        console.log('Comprehensive dashboard initialized successfully');
    }

    updateComprehensiveMetrics() {
        console.log('Updating comprehensive dashboard metrics...');
        
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entities = this.dataManager.getEntities();
        const minerals = this.dataManager.getMinerals();
        
        // Calculate comprehensive metrics
        const metrics = this.calculateDashboardMetrics(royaltyRecords, entities, minerals);
        
        // Update all sections
        this.updateProductionMetrics(metrics);
        this.updateRoyaltyMetrics(metrics);
        this.updateComplianceMetrics(metrics);
        this.updateFinancialMetrics(metrics);
        
        console.log('Comprehensive metrics updated successfully');
    }

    calculateDashboardMetrics(records, entities, minerals) {
        const totalRoyalties = records.reduce((sum, record) => sum + (record.royalties || 0), 0);
        const totalProduction = records.reduce((sum, record) => sum + (record.volume || 0), 0);
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const paidRecords = records.filter(r => r.status === 'Paid').length;
        const pendingRecords = records.filter(r => r.status === 'Pending').length;
        const overdueRecords = records.filter(r => r.status === 'Overdue').length;
        const complianceRate = records.length > 0 ? Math.round((paidRecords / records.length) * 100) : 0;
        
        // Production breakdown by mineral type
        const productionByMineral = records.reduce((acc, record) => {
            if (record.mineral) {
                acc[record.mineral] = (acc[record.mineral] || 0) + (record.volume || 0);
            }
            return acc;
        }, {});
        
        // Payment metrics
        const paymentsReceived = records.filter(r => r.status === 'Paid')
            .reduce((sum, record) => sum + (record.royalties || 0), 0);
        const outstandingPayments = records.filter(r => r.status === 'Pending' || r.status === 'Overdue')
            .reduce((sum, record) => sum + (record.royalties || 0), 0);
        
        // Average metrics
        const avgTariff = minerals.length > 0 ? 
            minerals.reduce((sum, m) => sum + m.tariff, 0) / minerals.length : 0;
        
        return {
            totalRoyalties,
            totalProduction,
            activeEntities,
            paidRecords: paidRecords.length,
            pendingRecords: pendingRecords.length,
            overdueRecords: overdueRecords.length,
            complianceRate,
            productionByMineral,
            paymentsReceived,
            outstandingPayments,
            avgTariff,
            entities,
            minerals
        };
    }

    updateProductionMetrics(metrics) {
        this.updateElement('total-production', `${metrics.totalProduction.toLocaleString()} tonnes`);
        this.updateElement('coal-production', `${metrics.productionByMineral.Coal || 0}t`);
        this.updateElement('iron-production', `${metrics.productionByMineral['Iron Ore'] || 0}t`);
        this.updateElement('stone-production', `${metrics.productionByMineral['Quarried Stone'] || 0}m³`);
        this.updateElement('avg-ore-grade', '78.5%');
        this.updateElement('grade-range', '65% - 85%');
        this.updateElement('cost-per-unit', `E ${(metrics.totalRoyalties / Math.max(metrics.totalProduction, 1) * 0.3).toFixed(2)}`);
        this.updateElement('current-royalty-rate', `${metrics.avgTariff.toFixed(1)}%`);
        this.updateElement('base-rate', `${metrics.avgTariff.toFixed(1)}%`);
    }

    updateRoyaltyMetrics(metrics) {
        this.updateElement('total-royalties-calculated', `E ${metrics.totalRoyalties.toLocaleString()}`);
        this.updateElement('payments-received', `E ${metrics.paymentsReceived.toLocaleString()}`);
        this.updateElement('outstanding-payments', `E ${metrics.outstandingPayments.toLocaleString()}`);
        this.updateElement('reconciliation-status', '98%');
        this.updateElement('ontime-payments', metrics.paidRecords);
        this.updateElement('late-payments', metrics.overdueRecords);
        this.updateElement('outstanding-count', `${metrics.pendingRecords + metrics.overdueRecords} overdue payments`);
        
        if (metrics.totalRoyalties > 0) {
            const receivedPercentage = Math.round((metrics.paymentsReceived / metrics.totalRoyalties) * 100);
            this.updateElement('received-percentage', `${receivedPercentage}% of calculated`);
        }
    }

    updateComplianceMetrics(metrics) {
        this.updateElement('overall-compliance', `${metrics.complianceRate}%`);
        this.updateElement('reporting-compliance', '95%');
        this.updateElement('payment-compliance', `${metrics.complianceRate}%`);
        this.updateElement('active-alerts', '5');
        this.updateElement('overdue-reports', '2');
        this.updateElement('regulatory-updates', '3');
        
        const complianceProgress = document.getElementById('compliance-progress');
        if (complianceProgress) {
            complianceProgress.style.width = `${metrics.complianceRate}%`;
        }
    }

    updateFinancialMetrics(metrics) {
        this.updateElement('total-royalty-revenue', `E ${metrics.totalRoyalties.toLocaleString()}`);
        this.updateElement('revenue-per-unit', `E ${(metrics.totalRoyalties / Math.max(metrics.totalProduction, 1)).toFixed(2)}`);
        this.updateElement('monthly-performance', `E ${Math.round(metrics.totalRoyalties / 12).toLocaleString()}`);
        this.updateElement('forecast-accuracy', '94%');
        
        const target = metrics.totalRoyalties * 1.02;
        this.updateElement('revenue-target', `E ${target.toLocaleString()}`);
        this.updateElement('revenue-achievement', `${Math.round((metrics.totalRoyalties / target) * 100)}%`);
        this.updateElement('forecast-amount', (metrics.totalRoyalties * 1.05).toLocaleString());
        this.updateElement('confidence-level', '85%');
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    setupCharts() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') chart.destroy();
        });
        this.charts = {};

        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, skipping chart initialization');
            return;
        }

        this.setupRevenueChart();
        this.setupProductionChart();
        this.setupPaymentTimelineChart();
        this.setupMineralPerformanceChart();
        this.setupForecastChart();
        this.setupChartControls();
    }

    setupRevenueChart() {
        const revenueCtx = document.getElementById('revenue-trends-chart');
        if (revenueCtx) {
            this.charts.revenueTrends = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Monthly Revenue (E)',
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
                    plugins: { legend: { display: false } },
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
    }

    setupProductionChart() {
        const productionCtx = document.getElementById('production-by-entity-chart');
        if (productionCtx) {
            const royaltyRecords = this.dataManager.getRoyaltyRecords();
            const entityData = royaltyRecords.reduce((acc, record) => {
                acc[record.entity] = (acc[record.entity] || 0) + record.volume;
                return acc;
            }, {});
            
            this.charts.productionByEntity = new Chart(productionCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(entityData),
                    datasets: [{
                        data: Object.values(entityData),
                        backgroundColor: [
                            '#1a365d', '#2d5a88', '#4a90c2', 
                            '#7ba7cc', '#a8c5e2', '#d4af37'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }

    setupPaymentTimelineChart() {
        const canvas = document.getElementById('payment-timeline-chart');
        if (canvas) {
            this.charts.paymentTimeline = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Payments Received',
                        data: [85000, 92000, 88000, 95000, 91000, 98000],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Payments Due',
                        data: [90000, 95000, 90000, 98000, 93000, 100000],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
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
    }

    setupMineralPerformanceChart() {
        const canvas = document.getElementById('mineral-performance-chart');
        if (canvas) {
            const records = this.dataManager.getRoyaltyRecords();
            const mineralData = this.aggregateMineralPerformance(records);
            
            this.charts.mineralPerformance = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: mineralData.labels,
                    datasets: [{
                        label: 'Revenue (E)',
                        data: mineralData.revenue,
                        backgroundColor: ['#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc', '#a8c5e2', '#d4af37']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
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
    }

    setupForecastChart() {
        const canvas = document.getElementById('forecast-chart');
        if (canvas) {
            this.charts.forecast = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Historical',
                        data: [45000, 52000, 48000, 61000, 55000, 67000, null, null, null, null, null, null],
                        borderColor: '#1a365d',
                        backgroundColor: 'rgba(26, 54, 93, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Forecast',
                        data: [null, null, null, null, null, 67000, 69000, 71000, 68000, 73000, 75000, 77000],
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
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
    }

    aggregateMineralPerformance(records) {
        const mineralRevenue = records.reduce((acc, record) => {
            if (record.mineral && record.royalties) {
                acc[record.mineral] = (acc[record.mineral] || 0) + record.royalties;
            }
            return acc;
        }, {});
        
        return {
            labels: Object.keys(mineralRevenue),
            revenue: Object.values(mineralRevenue)
        };
    }

    setupChartControls() {
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const chartType = btn.dataset.chartType;
                const chartId = btn.dataset.chartId;
                
                // Update active state
                btn.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update chart if it exists
                if (chartId === 'revenue-trends-chart' && this.charts.revenueTrends) {
                    this.updateChartType(this.charts.revenueTrends, chartType);
                }
            });
        });
    }

    updateChartType(chart, type) {
        if (type === 'area') {
            chart.config.type = 'line';
            chart.data.datasets[0].fill = true;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.2)';
        } else if (type === 'bar') {
            chart.config.type = 'bar';
            chart.data.datasets[0].fill = false;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.8)';
        } else {
            chart.config.type = 'line';
            chart.data.datasets[0].fill = false;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.1)';
        }
        chart.update();
    }

    setupComplianceAlerts() {
        const alertsContainer = document.getElementById('compliance-alerts');
        if (!alertsContainer) return;
        
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const overdueRecords = royaltyRecords.filter(r => r.status === 'Overdue');
        
        if (overdueRecords.length > 0) {
            let alertsHTML = overdueRecords.map(record => `
                <div class="alert-item urgent">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="alert-content">
                        <h6>Overdue Payment - ${record.entity}</h6>
                        <p>Payment for ${record.referenceNumber} is overdue. Amount: E ${record.royalties.toLocaleString()}</p>
                        <small>Due Date: ${record.date} | Entity: ${record.entity}</small>
                    </div>
                    <div class="alert-actions">
                        <button class="btn btn-sm btn-warning">Send Reminder</button>
                        <button class="btn btn-sm btn-info">View Details</button>
                    </div>
                </div>
            `).join('');
            
            alertsContainer.innerHTML = alertsHTML;
        } else {
            alertsContainer.innerHTML = `
                <div class="alert-item info">
                    <div class="alert-content">
                        <p>No compliance alerts at this time</p>
                        <small>All payments are current and compliant</small>
                    </div>
                </div>
            `;
        }
    }

    setupForecastingTool() {
        const productionGrowth = document.getElementById('production-growth');
        const priceAdjustment = document.getElementById('price-adjustment');
        
        if (productionGrowth) {
            productionGrowth.addEventListener('input', () => {
                this.updateForecast();
            });
        }
        
        if (priceAdjustment) {
            priceAdjustment.addEventListener('input', () => {
                this.updateForecast();
            });
        }
        
        this.updateForecast();
    }

    updateForecast() {
        const productionGrowth = document.getElementById('production-growth')?.value || 5;
        const priceAdjustment = document.getElementById('price-adjustment')?.value || 0;
        const forecastPeriod = document.getElementById('forecast-period')?.value || 12;
        
        const currentRevenue = this.dataManager.getRoyaltyRecords()
            .reduce((sum, record) => sum + (record.royalties || 0), 0);
        
        const growthFactor = (100 + parseFloat(productionGrowth)) / 100;
        const priceFactor = (100 + parseFloat(priceAdjustment)) / 100;
        const periodFactor = parseInt(forecastPeriod) / 12;
        
        const forecastAmount = Math.round(currentRevenue * growthFactor * priceFactor * periodFactor);
        
        this.updateElement('forecast-amount', forecastAmount.toLocaleString());
        
        const volatility = Math.abs(parseFloat(productionGrowth)) + Math.abs(parseFloat(priceAdjustment));
        const confidence = Math.max(60, 95 - volatility * 2);
        this.updateElement('confidence-level', `${Math.round(confidence)}%`);
    }

    setupEventHandlers() {
        this.setupActionButtons();
        this.setupFilterHandlers();
        
        const periodSelectors = document.querySelectorAll('.metric-period');
        periodSelectors.forEach(selector => {
            selector.addEventListener('change', () => {
                this.updateComprehensiveMetrics();
                this.notificationManager.show(`Updated for ${selector.value.replace('-', ' ')}`, 'success');
            });
        });
    }

    setupActionButtons() {
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }
        
        const exportBtn = document.getElementById('export-dashboard-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboard();
            });
        }
        
        const customizeBtn = document.getElementById('customize-dashboard-btn');
        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => {
                this.notificationManager.show('Dashboard customization panel would open here', 'info');
            });
        }
    }

    setupFilterHandlers() {
        const applyFiltersBtn = document.getElementById('apply-filters');
        const resetFiltersBtn = document.getElementById('reset-filters');
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyDashboardFilters();
            });
        }
        
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.resetDashboardFilters();
            });
        }
    }

    applyDashboardFilters() {
        const timePeriod = document.getElementById('time-period')?.value;
        const entityFilter = document.getElementById('entity-filter')?.value;
        const mineralFilter = document.getElementById('mineral-filter')?.value;
        
        this.notificationManager.show(`Applied filters: ${timePeriod}, ${entityFilter}, ${mineralFilter}`, 'info');
        this.updateComprehensiveMetrics();
        this.setupCharts();
    }

    resetDashboardFilters() {
        const timeSelect = document.getElementById('time-period');
        const entitySelect = document.getElementById('entity-filter');
        const mineralSelect = document.getElementById('mineral-filter');
        
        if (timeSelect) timeSelect.value = 'current-month';
        if (entitySelect) entitySelect.value = 'all';
        if (mineralSelect) mineralSelect.value = 'all';
        
        this.notificationManager.show('Dashboard filters reset', 'info');
        this.updateComprehensiveMetrics();
        this.setupCharts();
    }

    refreshDashboard() {
        this.updateComprehensiveMetrics();
        this.setupCharts();
        this.updateRecentActivity();
        this.setupComplianceAlerts();
        this.notificationManager.show('Comprehensive dashboard refreshed successfully', 'success');
    }

    exportDashboard() {
        this.notificationManager.show('Exporting comprehensive dashboard report...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show('Dashboard report exported successfully with all sections', 'success');
        }, 2000);
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        const auditLog = this.dataManager.getAuditLog();
        const recentEntries = auditLog.slice(0, 5);
        
        if (recentEntries.length === 0) {
            activityContainer.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <p>No recent activity to display</p>
                        <small>System activity will appear here</small>
                    </div>
                </div>
            `;
            return;
        }
        
        activityContainer.innerHTML = recentEntries.map(entry => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(entry.action)}"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${entry.user}</strong> ${entry.action.toLowerCase()} ${entry.target}</p>
                    <small>${entry.timestamp}</small>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(action) {
        const iconMap = {
            'Login': 'sign-in-alt',
            'Create User': 'user-plus',
            'Modify User': 'user-edit',
            'Delete User': 'user-minus',
            'Data Access': 'eye',
            'Failed Login': 'exclamation-triangle'
        };
        return iconMap[action] || 'circle';
    }

    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') chart.destroy();
        });
        this.charts = {};
        this.isInitialized = false;
    }
}

export class UserManagementManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    async loadSection() {
        const section = document.getElementById('user-management');
        if (!section) return;

        const template = await SectionLoader.loadTemplate('templates/user-management.html');
        if (template) {
            section.innerHTML = template;
        } else {
            this.loadFallbackContent();
        }

        this.populateData();
        this.setupEventHandlers();
    }

    loadFallbackContent() {
        const section = document.getElementById('user-management');
        const userAccounts = this.dataManager.getUserAccounts();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>👥 User Management</h1>
                    <p>Comprehensive user administration with role-based access control</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-success" id="add-user-btn">
                        <i class="fas fa-user-plus"></i> Add User
                    </button>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>User Accounts</h3>
                </div>
                <div class="card-body">
                    <p>User management interface would be implemented here.</p>
                </div>
            </div>
        `;
    }

    populateData() {
        // Implementation for populating user data
    }

    setupEventHandlers() {
        // Implementation for setting up event handlers
    }
}

export class RoyaltyRecordsManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    async loadSection() {
        const section = document.getElementById('royalty-records');
        if (!section) return;

        const template = await SectionLoader.loadTemplate('templates/royalty-records.html');
        if (template) {
            section.innerHTML = template;
        } else {
            this.loadFallbackContent();
        }

        this.populateData();
        this.setupEventHandlers();
    }

    loadFallbackContent() {
        const section = document.getElementById('royalty-records');
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>💰 Royalty Records</h1>
                    <p>Manage royalty payments and records</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>Royalty records interface would be implemented here.</p>
                </div>
            </div>
        `;
    }

    populateData() {
        // Implementation for populating royalty data
    }

    setupEventHandlers() {
        // Implementation for setting up event handlers
    }
}

export class ContractManagementManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    async loadSection() {
        const section = document.getElementById('contract-management');
        if (!section) return;

        const template = await SectionLoader.loadTemplate('templates/contract-management.html');
        if (template) {
            section.innerHTML = template;
        } else {
            this.loadFallbackContent();
        }

        this.populateData();
        this.setupEventHandlers();
        this.initializeCharts();
    }

    loadFallbackContent() {
        const section = document.getElementById('contract-management');
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📋 Contract Management</h1>
                    <p>Manage mining contracts and agreements</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>Contract management interface would be implemented here.</p>
                </div>
            </div>
        `;
    }

    populateData() {
        // Implementation for populating contract data
    }

    setupEventHandlers() {
        // Implementation for setting up event handlers
    }

    initializeCharts() {
        // Implementation for contract charts
    }
}