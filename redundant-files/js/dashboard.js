// Dashboard Module - Handles dashboard metrics, charts, and activities

export class DashboardModule {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.charts = {};
    }

    initialize() {
        console.log('Initializing dashboard...');
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            this.updateDashboardMetrics();
            this.setupCharts();
            this.updateRecentActivity();
            this.setupEventHandlers();
        }, 100);
    }

    updateDashboardMetrics() {
        console.log('Updating dashboard metrics...');
        
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
        
        // Update trend indicators
        this.updateElement('royalties-trend', '+12.5%');
        this.updateElement('entities-trend', '+2 new entities');
        this.updateElement('compliance-trend', '+2.1%');
        this.updateElement('pending-text', pendingRecords > 0 ? 'Requires attention' : 'No pending items');
        
        // Show/hide urgent items
        const urgentItems = document.getElementById('urgent-items');
        if (urgentItems) {
            urgentItems.style.display = overdueRecords > 0 ? 'block' : 'none';
        }
        
        console.log('Dashboard metrics updated successfully');
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    setupCharts() {
        console.log('Setting up charts...');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        // Destroy existing charts before creating new ones
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};

        this.setupRevenueChart();
        this.setupProductionChart();
        this.setupChartControls();
        
        console.log('Charts setup completed');
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
            console.log('Revenue chart created');
        } else {
            console.warn('Revenue chart canvas not found or Chart.js not available');
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
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            console.log('Production chart created');
        } else {
            console.warn('Production chart canvas not found or Chart.js not available');
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
                if (window.notificationManager) {
                    window.notificationManager.show('Production chart refreshed', 'success');
                }
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
        console.log('Updating recent activity...');
        
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) {
            console.warn('Recent activity container not found');
            return;
        }
        
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
        
        console.log('Recent activity updated');
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
                if (window.notificationManager) {
                    window.notificationManager.show('Dashboard customization options would be available here', 'info');
                }
            });
        }
        
        // Period selector
        const periodSelector = document.getElementById('royalties-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', () => {
                this.updateDashboardMetrics();
                if (window.notificationManager) {
                    window.notificationManager.show('Dashboard updated for selected period', 'success');
                }
            });
        }
    }

    refreshDashboard() {
        this.updateDashboardMetrics();
        this.setupCharts();
        this.updateRecentActivity();
        if (window.notificationManager) {
            window.notificationManager.show('Dashboard refreshed successfully', 'success');
        }
    }

    exportDashboard() {
        if (window.notificationManager) {
            window.notificationManager.show('Exporting dashboard report...', 'info');
            
            setTimeout(() => {
                window.notificationManager.show('Dashboard report exported successfully', 'success');
            }, 2000);
        }
    }

    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}
