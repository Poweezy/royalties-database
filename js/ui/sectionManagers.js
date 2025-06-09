import { SectionLoader } from '../section-loaders.js';

export class DashboardManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.charts = {};
    }

    async loadSection() {
        const section = document.getElementById('dashboard');
        if (!section) return;

        try {
            const template = await SectionLoader.loadTemplate('templates/dashboard.html');
            if (template) {
                section.innerHTML = template;
            } else {
                this.loadFallbackContent(section);
            }
        } catch (error) {
            console.log('Loading dashboard template failed, using fallback');
            this.loadFallbackContent(section);
        }

        this.updateMetrics();
        this.setupCharts();
        this.updateRecentActivity();
        this.setupEventHandlers();
        this.updateSystemAlerts();
    }

    loadFallbackContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📊 Executive Dashboard</h1>
                    <p>Real-time mining royalties overview and analytics for comprehensive business intelligence</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-info" id="refresh-dashboard-btn" title="Refresh all dashboard data">
                        <i class="fas fa-sync-alt"></i> Refresh Data
                    </button>
                    <button class="btn btn-secondary" id="export-dashboard-btn" title="Export dashboard report">
                        <i class="fas fa-file-export"></i> Export Report
                    </button>
                    <button class="btn btn-primary" id="customize-dashboard-btn" title="Customize dashboard layout">
                        <i class="fas fa-cog"></i> Customize
                    </button>
                </div>
            </div>

            <!-- Key Performance Indicators -->
            <div class="charts-grid" id="kpi-metrics">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Total Royalties</h3>
                        <select class="metric-period" id="royalties-period">
                            <option value="current-month">This Month</option>
                            <option value="current-year" selected>This Year</option>
                            <option value="all-time">All Time</option>
                        </select>
                    </div>
                    <div class="card-body">
                        <p id="total-royalties">E 0</p>
                        <small id="royalties-trend" class="trend-positive">
                            <i class="fas fa-arrow-up"></i> +0%
                        </small>
                        <div class="mini-progress">
                            <div class="progress-bar" id="royalties-progress" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-industry"></i> Active Entities</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-entities">0</p>
                        <small id="entities-trend" class="trend-positive">
                            <i class="fas fa-plus"></i> +0 new entities
                        </small>
                        <div class="entities-breakdown">
                            <span class="entity-type">Mines: <strong id="mines-count">0</strong></span> • 
                            <span class="entity-type">Quarries: <strong id="quarries-count">0</strong></span>
                        </div>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-percentage"></i> Compliance Rate</h3>
                    </div>
                    <div class="card-body">
                        <p id="compliance-rate">0%</p>
                        <small id="compliance-trend" class="trend-positive">
                            <i class="fas fa-arrow-up"></i> +0%
                        </small>
                        <div class="compliance-breakdown">
                            <span class="entity-type text-success">Paid: <strong id="paid-count">0</strong></span> • 
                            <span class="entity-type text-warning">Pending: <strong id="pending-count">0</strong></span> • 
                            <span class="entity-type text-danger">Overdue: <strong id="overdue-count">0</strong></span>
                        </div>
                        <div class="mini-progress">
                            <div class="progress-bar" id="compliance-progress" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Pending Approvals</h3>
                    </div>
                    <div class="card-body">
                        <p id="pending-approvals">0</p>
                        <small id="pending-text" class="trend-stable">
                            <i class="fas fa-clock"></i> No pending items
                        </small>
                        <div class="urgency-indicator">
                            <span class="urgent-badge" id="urgent-items" style="display: none;">
                                <i class="fas fa-exclamation-circle"></i> Requires immediate attention
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions Dashboard -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                </div>
                <div class="card-body">
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" data-action="show-section" data-target="royalty-records">
                            <i class="fas fa-file-invoice-dollar"></i>
                            <span>View All Records</span>
                        </button>
                        <button class="quick-action-btn" data-action="add-record">
                            <i class="fas fa-plus"></i>
                            <span>Add New Record</span>
                        </button>
                        <button class="quick-action-btn" data-action="show-section" data-target="user-management">
                            <i class="fas fa-users"></i>
                            <span>Manage Users</span>
                        </button>
                        <button class="quick-action-btn" data-action="generate-report">
                            <i class="fas fa-chart-bar"></i>
                            <span>Monthly Report</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Analytics Charts -->
            <div class="charts-grid">
                <div class="analytics-chart card">
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

                <div class="analytics-chart card">
                    <div class="chart-header">
                        <h5><i class="fas fa-chart-pie"></i> Production by Entity</h5>
                        <div class="chart-controls">
                            <button class="chart-btn active" id="entity-chart-refresh">Refresh</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="production-by-entity-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Recent Activity and Alerts -->
            <div class="charts-grid">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-history"></i> Recent Activity</h5>
                        <button class="btn btn-sm btn-secondary" id="view-all-activity">
                            View All <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="recent-activity" class="activity-list">
                            <!-- Activity items will be populated dynamically -->
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-bell"></i> System Alerts</h5>
                        <span class="alert-count" id="alert-count">0</span>
                    </div>
                    <div class="card-body">
                        <div id="system-alerts" class="alerts-container">
                            <!-- Alerts will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateMetrics() {
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entities = this.dataManager.getEntities();
        
        const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending').length;
        const overdueRecords = royaltyRecords.filter(r => r.status === 'Overdue').length;
        const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords / royaltyRecords.length) * 100) : 0;
        
        // Update main metrics
        this.updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}.00`);
        this.updateElement('active-entities', activeEntities);
        this.updateElement('compliance-rate', `${complianceRate}%`);
        this.updateElement('pending-approvals', pendingRecords);
        
        // Update breakdowns
        this.updateElement('mines-count', entities.filter(e => e.type === 'Mine').length);
        this.updateElement('quarries-count', entities.filter(e => e.type === 'Quarry').length);
        this.updateElement('paid-count', paidRecords);
        this.updateElement('pending-count', pendingRecords);
        this.updateElement('overdue-count', overdueRecords);
        
        // Update progress bars
        const complianceProgress = document.getElementById('compliance-progress');
        if (complianceProgress) {
            complianceProgress.style.width = `${complianceRate}%`;
        }
        
        const royaltiesProgress = document.getElementById('royalties-progress');
        if (royaltiesProgress) {
            const progressPercentage = Math.min((totalRoyalties / 200000) * 100, 100);
            royaltiesProgress.style.width = `${progressPercentage}%`;
        }
        
        // Update status text
        this.updateElement('pending-text', pendingRecords > 0 ? 'Requires attention' : 'No pending items');
        
        // Show/hide urgent items
        const urgentItems = document.getElementById('urgent-items');
        if (urgentItems) {
            urgentItems.style.display = overdueRecords > 0 ? 'block' : 'none';
        }
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) element.textContent = content;
    }

    setupCharts() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') chart.destroy();
        });
        this.charts = {};

        this.setupRevenueChart();
        this.setupProductionChart();
        this.setupChartControls();
    }

    setupRevenueChart() {
        const revenueCtx = document.getElementById('revenue-trends-chart');
        if (revenueCtx && typeof Chart !== 'undefined') {
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
        if (productionCtx && typeof Chart !== 'undefined') {
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
        
        // Entity chart refresh
        const refreshBtn = document.getElementById('entity-chart-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.setupProductionChart();
                this.notificationManager.show('Production chart refreshed', 'success');
            });
        }
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

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        const auditLog = this.dataManager.getAuditLog();
        const recentEntries = auditLog.slice(0, 5);
        
        if (recentEntries.length === 0) {
            activityContainer.innerHTML = '<p class="no-activity">No recent activity to display</p>';
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

    setupEventHandlers() {
        // Dashboard action buttons
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
                this.notificationManager.show('Dashboard customization options would be available here', 'info');
            });
        }
        
        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const target = btn.dataset.target;
                
                switch(action) {
                    case 'show-section':
                        document.dispatchEvent(new CustomEvent('sectionChange', {
                            detail: { sectionId: target }
                        }));
                        break;
                    case 'add-record':
                        this.notificationManager.show('Add record form would open here', 'info');
                        break;
                    case 'generate-report':
                        this.generateMonthlyReport();
                        break;
                }
            });
        });
        
        // View all activity button
        const viewAllBtn = document.getElementById('view-all-activity');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('sectionChange', {
                    detail: { sectionId: 'audit-dashboard' }
                }));
            });
        }
        
        // Period selector
        const periodSelector = document.getElementById('royalties-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', () => {
                this.updateMetrics();
                this.notificationManager.show('Dashboard updated for selected period', 'success');
            });
        }
    }

    refreshDashboard() {
        this.updateMetrics();
        this.setupCharts();
        this.updateRecentActivity();
        this.notificationManager.show('Dashboard refreshed successfully', 'success');
    }

    exportDashboard() {
        this.notificationManager.show('Exporting dashboard report...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show('Dashboard report exported successfully', 'success');
        }, 2000);
    }

    generateMonthlyReport() {
        this.notificationManager.show('Generating monthly report...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show('Monthly report generated successfully', 'success');
        }, 2000);
    }

    updateSystemAlerts() {
        const alertsContainer = document.getElementById('system-alerts');
        const alertCount = document.getElementById('alert-count');
        
        if (!alertsContainer || !alertCount) return;
        
        const alerts = [
            {
                type: 'warning',
                title: 'Payment Overdue',
                message: 'Ngwenya Mine payment is 5 days overdue',
                time: '2 hours ago'
            },
            {
                type: 'info',
                title: 'Monthly Report Ready',
                message: 'January royalties report is available for review',
                time: '4 hours ago'
            }
        ];
        
        alertCount.textContent = alerts.length;
        
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                </div>
                <div class="alert-content">
                    <h6>${alert.title}</h6>
                    <p>${alert.message}</p>
                    <small>${alert.time}</small>
                </div>
            </div>
        `).join('');
    }

    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') chart.destroy();
        });
        this.charts = {};
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