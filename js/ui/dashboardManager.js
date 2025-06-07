// Dashboard Manager Module

export class DashboardManager {
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
        this.updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}.00`);
        this.updateElement('active-entities', activeEntities);
        this.updateElement('compliance-rate', `${complianceRate}%`);
        this.updateElement('pending-approvals', pendingApprovals);
        
        // Update progress bar
        const progressBar = document.getElementById('compliance-progress');
        if (progressBar) {
            progressBar.style.width = `${complianceRate}%`;
        }
        
        // Update trend indicators
        this.updateElement('royalties-trend', '+12.5%');
        this.updateElement('entities-trend', '+2');
        this.updateElement('compliance-trend', '+2.1%');
        this.updateElement('pending-text', pendingApprovals > 0 ? 'Requires attention' : 'No pending items');
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
            if (chart) chart.destroy();
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

    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}
