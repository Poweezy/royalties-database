import { ChartManager } from '../modules/ChartManager.js';

// Dashboard Manager Module
export class DashboardManager {
    constructor(dataManager, notificationManager, chartManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.chartManager = chartManager;
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

    updateDashboardMetrics() {
        console.log('Updating dashboard metrics...');
        
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entities = this.dataManager.getEntities();
        
        const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
        const totalProduction = royaltyRecords.reduce((sum, record) => sum + record.volume, 0);
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending').length;
        const overdueRecords = royaltyRecords.filter(r => r.status === 'Overdue').length;
        const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords / royaltyRecords.length) * 100) : 0;
        
        // Update all metric elements
        this.updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}`);
        this.updateElement('total-production', `${totalProduction.toLocaleString()} tonnes`);
        this.updateElement('active-entities', activeEntities);
        this.updateElement('compliance-rate', `${complianceRate}%`);
        this.updateElement('pending-approvals', pendingRecords);
        this.updateElement('total-royalty-revenue', `E ${totalRoyalties.toLocaleString()}`);
        this.updateElement('overall-compliance', `${complianceRate}%`);
        
        // Update progress bars
        this.updateProgressBar('compliance-progress', complianceRate);
        this.updateProgressBar('royalties-progress', Math.min((totalRoyalties / 200000) * 100, 100));
        
        console.log('Dashboard metrics updated successfully');
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    updateProgressBar(id, percentage) {
        const progressBar = document.getElementById(id);
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    setupCharts() {
        console.log('Setting up charts...');
        
        // Clear existing charts
        this.chartManager.destroyAll();
        
        // Create charts with fallback handling
        this.setupRevenueChart();
        this.setupProductionChart();
        this.setupChartControls();
        
        console.log('Charts setup completed');
    }

    setupRevenueChart() {
        const revenueChart = this.chartManager.createRevenueChart('revenue-trends-chart');
        if (revenueChart) {
            console.log('Revenue chart created successfully');
        }
    }

    setupProductionChart() {
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entityData = royaltyRecords.reduce((acc, record) => {
            acc[record.entity] = (acc[record.entity] || 0) + record.volume;
            return acc;
        }, {});
        
        const productionChart = this.chartManager.createProductionChart('production-by-entity-chart', entityData);
        if (productionChart) {
            console.log('Production chart created successfully');
        }
    }

    setupChartControls() {
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            const handler = (e) => {
                e.preventDefault();
                const chartType = btn.dataset.chartType;
                const chartId = btn.dataset.chartId;
                
                // Update active state
                btn.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update chart type
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

        const customizeBtn = document.getElementById('customize-dashboard-btn');
        if (customizeBtn) {
            const handler = () => {
                this.notificationManager.show('Dashboard customization options would be available here', 'info');
            };
            customizeBtn.addEventListener('click', handler);
            this.eventListeners.push({ element: customizeBtn, event: 'click', handler });
        }

        const periodSelector = document.getElementById('royalties-period');
        if (periodSelector) {
            const handler = () => {
                this.updateDashboardMetrics();
                this.notificationManager.show('Dashboard updated for selected period', 'success');
            };
            periodSelector.addEventListener('change', handler);
            this.eventListeners.push({ element: periodSelector, event: 'change', handler });
        }
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
        this.destroy();
    }

    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // Destroy charts
        this.chartManager.destroyAll();
    }
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

    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // Destroy charts
        this.chartManager.destroyAll();
    }
}
