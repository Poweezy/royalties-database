/**
 * Dashboard Manager Module
 * Handles all dashboard-related functionality
 */
import { ChartManager } from './ChartManager.js';

export class DashboardManager {
  constructor() {
    this.chartManager = new ChartManager();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeCharts();
    this.loadDashboardData();
  }

  setupEventListeners() {
    // Refresh dashboard
    document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
      this.refreshDashboard();
    });

    // Chart type controls
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.target.closest('.chart-btn');
        if (!button) return;
        
        const chartType = button.dataset.chartType;
        const chartId = button.dataset.chartId;
        
        // Update active state
        button.closest('.chart-controls').querySelectorAll('.chart-btn').forEach(b => {
          b.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update chart type
        this.chartManager.updateChartType(chartId, chartType);
      });
    });

    // Quick action buttons
    document.getElementById('add-royalty-record')?.addEventListener('click', () => {
      window.location.hash = '#royalty-records';
    });

    document.getElementById('manage-users')?.addEventListener('click', () => {
      window.location.hash = '#user-management';
    });

    document.getElementById('view-overdue')?.addEventListener('click', () => {
      window.location.hash = '#royalty-records';
      // Additional logic to filter overdue records
    });
  }

  initializeCharts() {
    // Revenue trends chart
    this.chartManager.createChart('revenue-trends-chart', {
      type: 'line',
      data: this.getRevenueData(),
      options: this.getRevenueChartOptions()
    });

    // Production by entity chart
    this.chartManager.createChart('production-by-entity-chart', {
      type: 'pie',
      data: this.getProductionData(),
      options: this.getProductionChartOptions()
    });
  }

  async loadDashboardData() {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update metrics
      this.updateMetrics({
        totalRoyalties: 'E 992,500.00',
        activeEntities: 6,
        complianceRate: '80%',
        pendingApprovals: 2
      });

      // Update activity list
      this.updateRecentActivity();

      // Update system status
      this.updateSystemStatus();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  refreshDashboard() {
    // Show loading state
    this.setLoadingState(true);
    
    // Reload data
    this.loadDashboardData().finally(() => {
      this.setLoadingState(false);
    });
  }

  updateMetrics(data) {
    // Update KPI cards with new data
    const elements = {
      totalRoyalties: document.getElementById('total-royalties'),
      activeEntities: document.getElementById('active-entities'),
      complianceRate: document.getElementById('compliance-rate'),
      pendingApprovals: document.getElementById('pending-approvals')
    };

    for (const [key, element] of Object.entries(elements)) {
      if (element && data[key]) {
        element.textContent = data[key];
      }
    }
  }

  updateRecentActivity() {
    // Update activity list with new data
    const activityList = document.getElementById('recent-activity');
    if (!activityList) return;
    
    // Actual implementation would fetch and render new activity data
  }

  updateSystemStatus() {
    // Update system status metrics
    const elements = {
      dbStatus: document.getElementById('db-status'),
      lastBackup: document.getElementById('last-backup'),
      activeSessions: document.getElementById('active-sessions'),
      systemUptime: document.getElementById('system-uptime')
    };

    // Actual implementation would fetch and update status data
  }

  setLoadingState(isLoading) {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      dashboard.classList.toggle('loading', isLoading);
    }
  }

  // Chart data methods
  getRevenueData() {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [65000, 82708, 93000, 78000, 88000, 92500],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }

  getProductionData() {
    return {
      labels: ['Kwalini Quarry', 'Mbabane Mine', 'Eastern Quarries'],
      datasets: [{
        data: [25000, 15000, 12000],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ]
      }]
    };
  }

  getRevenueChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    };
  }

  getProductionChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  static getInstance() {
    if (!DashboardManager.instance) {
      DashboardManager.instance = new DashboardManager();
    }
    return DashboardManager.instance;
  }
}
