import { BaseModule } from './base-module.js';

export class DashboardModule extends BaseModule {
  constructor(dataManager) {
    super();
    this.dataManager = dataManager;
    this.charts = {};
    this.refreshInterval = null;
  }

  async onLoad() {
    try {
      // Create dashboard HTML
      this.createDashboardHTML();
      
      // Load dashboard data
      await this.loadDashboardData();
      
      // Initialize charts if Chart.js is available
      if (window.Chart) {
        await this.initializeCharts();
      }
      
      // Setup auto-refresh
      this.startAutoRefresh();
      
      console.log('Dashboard loaded successfully');
    } catch (error) {
      console.error('Dashboard loading failed:', error);
      this.showError('Failed to load dashboard');
    }
  }

  createDashboardHTML() {
    const dashboardHTML = `
      <section id="dashboard">
        <div class="page-header">
          <div class="page-title">
            <h1>Dashboard</h1>
            <p>Welcome back, <span id="user-name">System Administrator</span> | Last login: <span id="last-login-time">Today, 09:15 AM</span></p>
          </div>
          <div class="page-actions">
            <button class="btn btn-info" id="refresh-dashboard" title="Refresh dashboard data">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <button class="btn btn-primary" id="admin-panel-btn" title="Access Admin Panel">
              <i class="fas fa-cog"></i> Admin Panel
            </button>
            <button class="btn btn-secondary" id="notifications-btn" title="View Notifications">
              <i class="fas fa-bell"></i> <span id="notifications-count">3</span>
            </button>
          </div>
        </div>

        <!-- Key Performance Indicators -->
        <div class="charts-grid">
          <div class="metric-card card">
            <div class="card-header">
              <h3><i class="fas fa-coins"></i> Total Royalties (YTD)</h3>
              <select class="metric-period" id="royalties-period">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div class="card-body">
              <p id="total-royalties">E 0.00</p>
              <small class="trend-indicator" id="royalties-trend">
                <i class="fas fa-arrow-up trend-positive"></i> +0% from last year
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
              <p id="active-entities">6</p>
              <small class="trend-indicator">
                <i class="fas fa-arrow-up trend-positive"></i> +2 new entities
              </small>
              <div class="entities-breakdown">
                <small>
                  <span class="entity-type">Mines: <span id="mines-count">4</span></span> | 
                  <span class="entity-type">Quarries: <span id="quarries-count">2</span></span>
                </small>
              </div>
            </div>
          </div>

          <div class="metric-card card">
            <div class="card-header">
              <h3><i class="fas fa-shield-alt"></i> Compliance Rate</h3>
            </div>
            <div class="card-body">
              <p id="compliance-rate">94.8%</p>
              <small class="trend-indicator">
                <i class="fas fa-arrow-up trend-positive"></i> +2.1% this month
              </small>
            </div>
          </div>

          <div class="metric-card card">
            <div class="card-header">
              <h3><i class="fas fa-clock"></i> Pending Approvals</h3>
            </div>
            <div class="card-body">
              <p id="pending-approvals">3</p>
              <small class="trend-indicator">
                <i class="fas fa-exclamation-triangle trend-negative"></i> Requires attention
              </small>
              <div class="urgency-indicator">
                <span class="urgent-badge">
                  <i class="fas fa-exclamation"></i> 1 Urgent
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-grid">
          <div class="analytics-chart card">
            <div class="chart-header">
              <h5><i class="fas fa-chart-line"></i> Revenue Trends</h5>
              <div class="chart-controls">
                <button class="chart-btn active" data-period="7d">7D</button>
                <button class="chart-btn" data-period="30d">30D</button>
                <button class="chart-btn" data-period="3m">3M</button>
                <button class="chart-btn" data-period="1y">1Y</button>
              </div>
            </div>
            <div class="chart-container">
              <canvas id="revenue-trends-chart"></canvas>
            </div>
            <div class="chart-summary">
              <strong>Summary:</strong> Revenue increased by <strong class="trend-positive">12.5%</strong> compared to the previous period.
            </div>
          </div>

          <div class="analytics-chart card">
            <div class="chart-header">
              <h5><i class="fas fa-chart-pie"></i> Entity Distribution</h5>
            </div>
            <div class="chart-container">
              <canvas id="entity-distribution-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Activity & Quick Actions -->
        <div class="charts-grid">
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-history"></i> Recent Activity</h3>
            </div>
            <div class="card-body">
              <div class="activity-list" id="recent-activity">
                <!-- Recent activity items will be populated here by JavaScript -->
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
            </div>
            <div class="card-body">
              <div class="quick-actions-grid">
                <button class="quick-action-btn btn btn-primary">
                  <i class="fas fa-plus"></i>
                  <span>Add Payment</span>
                </button>
                <button class="quick-action-btn btn btn-info">
                  <i class="fas fa-chart-bar"></i>
                  <span>Generate Report</span>
                </button>
                <button class="quick-action-btn btn btn-warning">
                  <i class="fas fa-bell"></i>
                  <span>Send Notice</span>
                </button>
                <button class="quick-action-btn btn btn-success">
                  <i class="fas fa-check"></i>
                  <span>Review Compliance</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="charts-grid">
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-server"></i> System Status</h3>
            </div>
            <div class="card-body">
              <div class="system-metrics">
                <div class="metric-row">
                  <span class="metric-label">Database</span>
                  <span class="metric-value status-good">
                    <i class="fas fa-circle"></i> Online
                  </span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Payment Gateway</span>
                  <span class="metric-value status-good">
                    <i class="fas fa-circle"></i> Connected
                  </span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Last Backup</span>
                  <span class="metric-value">2 hours ago</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Active Users</span>
                  <span class="metric-value">12</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-exclamation-triangle"></i> System Alerts <span class="alert-count">2</span></h3>
            </div>
            <div class="card-body">
              <div class="alerts-container">
                <div class="alert-item warning">
                  <div class="alert-content">
                    <p>Disk space running low on server</p>
                    <small>System Administration • 30 minutes ago</small>
                  </div>
                </div>
                <div class="alert-item info">
                  <div class="alert-content">
                    <p>Scheduled maintenance this weekend</p>
                    <small>IT Department • 2 hours ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.container.innerHTML = dashboardHTML;
  }

  async loadDashboardData() {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update dashboard elements with data manager
    this.updateDashboardMetrics();
    this.updateRecentActivity();
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

  async initializeCharts() {
    try {
      // Revenue trends chart
      const revenueCtx = document.getElementById('revenue-trends-chart');
      if (revenueCtx) {
        this.charts.set('revenue-trends', new Chart(revenueCtx, {
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
              legend: {
                display: false
              }
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
        }));
      }

      // Entity distribution chart
      const entityCtx = document.getElementById('entity-distribution-chart');
      if (entityCtx) {
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entityData = royaltyRecords.reduce((acc, record) => {
          acc[record.entity] = (acc[record.entity] || 0) + record.volume;
          return acc;
        }, {});
        
        this.charts.set('entity-distribution', new Chart(entityCtx, {
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
              legend: {
                position: 'bottom'
              }
            }
          }
        }));
      }
    } catch (error) {
      console.error('Chart initialization failed:', error);
    }
  }

  setupEventListeners() {
    // Refresh button
    this.addEventListener('refresh-dashboard', 'click', () => {
      this.refreshDashboard();
    });

    // Chart period buttons
    this.addEventListener('.chart-btn', 'click', (e) => {
      if (e.target.classList.contains('chart-btn')) {
        document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const period = e.target.getAttribute('data-period');
        this.updateChartPeriod(period);
      }
    });

    // Quick action buttons
    this.addEventListener('.quick-action-btn', 'click', (e) => {
      const action = e.target.querySelector('span')?.textContent || 'Unknown action';
      this.showNotification(`${action} clicked - Feature coming soon`, 'info');
    });

    // Metric period selectors
    this.addEventListener('#royalties-period', 'change', (e) => {
      const period = e.target.value;
      this.showNotification(`Showing data for ${period}`, 'info');
    });
  }

  updateChartPeriod(period) {
    console.log(`Updating charts for period: ${period}`);
    // Implementation for updating chart data based on selected period
  }

  startAutoRefresh() {
    // Refresh dashboard data every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 5 * 60 * 1000);
  }

  showError(message) {
    if (this.container) {
      this.container.innerHTML = `
        <div class="error-container">
          <i class="fas fa-exclamation-circle"></i>
          <h2>Error Loading Dashboard</h2>
          <p>${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">
            <i class="fas fa-refresh"></i> Retry
          </button>
        </div>
      `;
    }
  }

  async onUnload() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    // Destroy charts
    for (const [key, chart] of this.charts) {
      if (chart && chart.destroy) {
        chart.destroy();
      }
    }
    this.charts.clear();
  }
}
