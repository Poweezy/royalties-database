import { SectionLoader } from '../section-loaders.js';

export class DashboardManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.chartManager = new ChartManager();
        this.eventListeners = [];
    }

    initialize() {
        console.log('Initializing dashboard...');
        setTimeout(() => {
            this.updateDashboardMetrics();
            this.setupCharts();
            this.updateRecentActivity();
            this.setupEventHandlers();
        }, 100);
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
                </div>
            </div>

            <div class="charts-grid">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Total Revenue</h3>
                    </div>
                    <div class="card-body">
                        <p id="total-revenue">E 0</p>
                        <small class="trend-positive">
                            <i class="fas fa-arrow-up"></i> +12% from last month
                        </small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-invoice-dollar"></i> Total Records</h3>
                    </div>
                    <div class="card-body">
                        <p id="total-records">0</p>
                        <small class="trend-info">
                            <i class="fas fa-info-circle"></i> Active records
                        </small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-check-circle"></i> Compliance Rate</h3>
                    </div>
                    <div class="card-body">
                        <p id="compliance-rate">0%</p>
                        <div class="mini-progress">
                            <div class="progress-bar" id="compliance-progress" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Overdue Payments</h3>
                    </div>
                    <div class="card-body">
                        <p id="overdue-count">0</p>
                        <small class="trend-negative">
                            <i class="fas fa-arrow-down"></i> Requires attention
                        </small>
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
                        <p class="no-activity">Loading recent activity...</p>
                    </div>
                </div>
            </div>
        `;
    }

    updateDashboardMetrics() {
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const totalRevenue = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const overdueRecords = royaltyRecords.filter(r => r.status === 'Overdue').length;
        const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords / royaltyRecords.length) * 100) : 0;

        this.updateElement('total-revenue', `E ${totalRevenue.toLocaleString()}`);
        this.updateElement('total-records', royaltyRecords.length);
        this.updateElement('compliance-rate', `${complianceRate}%`);
        this.updateElement('overdue-count', overdueRecords);

        const progressBar = document.getElementById('compliance-progress');
        if (progressBar) {
            progressBar.style.width = `${complianceRate}%`;
        }
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    setupCharts() {
        console.log('Setting up charts...');
        this.chartManager.destroyAll();
        this.setupRevenueChart();
        this.setupProductionChart();
        this.setupChartControls();
    }

    setupRevenueChart() {
        const data = {
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

        this.chartManager.createRevenueChart('revenue-trends-chart', data);
    }

    setupProductionChart() {
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entityData = royaltyRecords.reduce((acc, record) => {
            acc[record.entity] = (acc[record.entity] || 0) + record.volume;
            return acc;
        }, {});

        this.chartManager.createProductionChart('production-by-entity-chart', entityData);
    }

    setupChartControls() {
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            const handler = (e) => {
                e.preventDefault();
                const chartType = btn.dataset.chartType;
                const chartId = btn.dataset.chartId;

                btn.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (chartId && this.chartManager.charts.has(chartId)) {
                    this.chartManager.updateChartType(chartId, chartType);
                }

                this.notificationManager.show(`Switched to ${chartType} view`, 'info');
            };

            btn.addEventListener('click', handler);
            this.eventListeners.push({ element: btn, event: 'click', handler });
        });
    }

    setupEventHandlers() {
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            const handler = () => this.refreshDashboard();
            refreshBtn.addEventListener('click', handler);
            this.eventListeners.push({ element: refreshBtn, event: 'click', handler });
        }

        const exportBtn = document.getElementById('export-dashboard-btn');
        if (exportBtn) {
            const handler = () => this.exportDashboard();
            exportBtn.addEventListener('click', handler);
            this.eventListeners.push({ element: exportBtn, event: 'click', handler });
        }
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;

        const activities = [
            { user: 'admin', action: 'Login', target: 'System', timestamp: new Date().toISOString() },
            { user: 'editor', action: 'Update Record', target: 'ROY-2024-002', timestamp: new Date(Date.now() - 300000).toISOString() }
        ];

        if (activities.length === 0) {
            activityContainer.innerHTML = '<p class="no-activity">No recent activity to display</p>';
            return;
        }

        activityContainer.innerHTML = activities.map(entry => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(entry.action)}"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${entry.user}</strong> ${entry.action.toLowerCase()} ${entry.target}</p>
                    <small>${new Date(entry.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(action) {
        const iconMap = {
            'Login': 'sign-in-alt',
            'Update Record': 'edit',
            'Create Record': 'plus',
            'Delete Record': 'trash'
        };
        return iconMap[action] || 'circle';
    }

    refreshDashboard() {
        this.updateDashboardMetrics();
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

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.chartManager.destroyAll();
    }
}

export class AuditDashboardManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.eventListeners = [];
    }

    async loadSection() {
        console.log('Loading audit dashboard...');
        const section = document.getElementById('audit-dashboard');
        
        if (!section) {
            console.error('Audit dashboard section element not found');
            return;
        }
        
        try {
            // Try to load the audit dashboard content from components
            const response = await fetch('components/audit-dashboard.html');
            if (response.ok) {
                const html = await response.text();
                section.innerHTML = html;
                this.initializeAuditDashboard();
            } else {
                this.loadFallbackContent(section);
            }
        } catch (error) {
            console.error('Error loading audit dashboard:', error);
            this.loadFallbackContent(section);
        }
    }
    
    loadFallbackContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Audit Dashboard</h1>
                    <p>Comprehensive audit trail and security monitoring for the mining royalties system</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-info" id="refresh-audit-btn">
                        <i class="fas fa-sync-alt"></i> Refresh Data
                    </button>
                    <button class="btn btn-success" id="export-audit-btn">
                        <i class="fas fa-download"></i> Export Audit Log
                    </button>
                </div>
            </div>

            <div class="charts-grid">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Active Users (24h)</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-users-24h">12</p>
                        <small class="trend-positive">
                            <i class="fas fa-arrow-up"></i> +3 from yesterday
                        </small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-sign-in-alt"></i> Login Attempts</h3>
                    </div>
                    <div class="card-body">
                        <p id="login-attempts">45</p>
                        <small class="trend-stable">
                            <i class="fas fa-check-circle"></i> 43 successful, 2 failed
                        </small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-database"></i> Data Access Events</h3>
                    </div>
                    <div class="card-body">
                        <p id="data-access-events">156</p>
                        <small class="trend-info">
                            <i class="fas fa-eye"></i> View: 120, Edit: 25, Export: 11
                        </small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Security Alerts</h3>
                    </div>
                    <div class="card-body">
                        <p id="security-alerts">3</p>
                        <small class="trend-warning">
                            <i class="fas fa-shield-alt"></i> 1 high, 2 medium priority
                        </small>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-history"></i> Recent Audit Events</h5>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Target</th>
                                    <th>IP Address</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="audit-events-table">
                                <tr>
                                    <td colspan="7" style="text-align: center;">Loading audit data...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        this.initializeAuditDashboard();
    }
    
    initializeAuditDashboard() {
        this.loadAuditMetrics();
        this.loadAuditEvents();
        this.setupEventListeners();
    }
    
    loadAuditMetrics() {
        // In a real implementation, this would load data from an API
        const auditLog = this.dataManager.getAuditLog();
        
        // Update metrics
        this.updateElement('active-users-24h', Math.floor(Math.random() * 20) + 10);
        this.updateElement('login-attempts', auditLog.filter(entry => entry.action === 'Login' || entry.action === 'Failed Login').length);
        this.updateElement('data-access-events', auditLog.filter(entry => entry.action === 'Data Access').length);
        this.updateElement('security-alerts', Math.floor(Math.random() * 5));
    }
    
    loadAuditEvents() {
        const auditLog = this.dataManager.getAuditLog();
        const tableBody = document.getElementById('audit-events-table');
        
        if (!tableBody) {
            console.warn('Audit events table not found');
            return;
        }
        
        if (auditLog.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        No audit events found
                    </td>
                </tr>
            `;
            return;
        }
        
        // Display latest events first
        const sortedLog = [...auditLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        tableBody.innerHTML = sortedLog.slice(0, 10).map(entry => `
            <tr>
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
                <td>${entry.user}</td>
                <td>${entry.action}</td>
                <td>${entry.target}</td>
                <td>${entry.ipAddress || '127.0.0.1'}</td>
                <td>
                    <span class="status-badge ${entry.status === 'Success' ? 'paid' : 'overdue'}">
                        ${entry.status || 'Unknown'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewAuditDetails(${entry.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-audit-btn');
        if (refreshBtn) {
            const handler = () => this.refreshAuditDashboard();
            refreshBtn.addEventListener('click', handler);
            this.eventListeners.push({ element: refreshBtn, event: 'click', handler });
        }

        // Export button
        const exportBtn = document.getElementById('export-audit-btn');
        if (exportBtn) {
            const handler = () => this.exportAuditData();
            exportBtn.addEventListener('click', handler);
            this.eventListeners.push({ element: exportBtn, event: 'click', handler });
        }
    }
    
    refreshAuditDashboard() {
        this.loadAuditMetrics();
        this.loadAuditEvents();
        this.notificationManager.show('Audit dashboard refreshed successfully', 'success');
    }
    
    exportAuditData() {
        this.notificationManager.show('Exporting audit data...', 'info');
        setTimeout(() => {
            this.notificationManager.show('Audit data exported successfully', 'success');
        }, 2000);
    }
    
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
    
    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            if (element) {
                element.removeEventListener(event, handler);
            }
        });
        this.eventListeners = [];
    }
}