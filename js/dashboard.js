// Dashboard Module - Handles dashboard metrics, charts, and activities

export class DashboardModule {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.charts = {};
    }

    initialize() {
        this.updateDashboardMetrics();
        this.setupCharts();
        this.updateRecentActivity();
    }

    updateDashboardMetrics() {
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entities = this.dataManager.getEntities();
        
        const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const complianceRate = Math.round((paidRecords / royaltyRecords.length) * 100);
        const pendingApprovals = royaltyRecords.filter(r => r.status === 'Pending').length;
        
        // Update displays
        const totalRoyaltiesEl = document.getElementById('total-royalties');
        const activeEntitiesEl = document.getElementById('active-entities');
        const complianceRateEl = document.getElementById('compliance-rate');
        const pendingApprovalsEl = document.getElementById('pending-approvals');
        
        if (totalRoyaltiesEl) totalRoyaltiesEl.textContent = `E ${totalRoyalties.toLocaleString()}.00`;
        if (activeEntitiesEl) activeEntitiesEl.textContent = activeEntities;
        if (complianceRateEl) complianceRateEl.textContent = `${complianceRate}%`;
        if (pendingApprovalsEl) pendingApprovalsEl.textContent = pendingApprovals;
        
        // Update progress bar
        const progressBar = document.getElementById('compliance-progress');
        if (progressBar) {
            progressBar.style.width = `${complianceRate}%`;
        }
        
        // Update trend indicators
        const royaltiesTrendEl = document.getElementById('royalties-trend');
        const entitiesTrendEl = document.getElementById('entities-trend');
        const complianceTrendEl = document.getElementById('compliance-trend');
        const pendingTextEl = document.getElementById('pending-text');
        
        if (royaltiesTrendEl) royaltiesTrendEl.textContent = '+12.5%';
        if (entitiesTrendEl) entitiesTrendEl.textContent = '+2';
        if (complianceTrendEl) complianceTrendEl.textContent = '+2.1%';
        if (pendingTextEl) pendingTextEl.textContent = pendingApprovals > 0 ? 'Requires attention' : 'No pending items';
    }

    setupCharts() {
        // Destroy existing charts before creating new ones
        if (this.charts.revenueTrends) {
            this.charts.revenueTrends.destroy();
            this.charts.revenueTrends = null;
        }
        
        if (this.charts.productionByEntity) {
            this.charts.productionByEntity.destroy();
            this.charts.productionByEntity = null;
        }
        
        // Revenue trends chart
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
        }
        
        // Production by entity chart
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
                            '#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc', '#a8c5e2', '#d4af37'
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
        }
        
        this.setupChartControls();
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

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        const auditLog = this.dataManager.getAuditLog();
        const recentEntries = auditLog.slice(0, 5);
        
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

    refresh() {
        this.updateDashboardMetrics();
        this.updateRecentActivity();
    }

    destroy() {
        // Clean up charts
        if (this.charts.revenueTrends) {
            this.charts.revenueTrends.destroy();
            this.charts.revenueTrends = null;
        }
        
        if (this.charts.productionByEntity) {
            this.charts.productionByEntity.destroy();
            this.charts.productionByEntity = null;
        }
    }
}
