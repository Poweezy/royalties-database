/**
 * Mining Royalties Manager - Main Application Module
 * Comprehensive royalty management system for Eswatini mining sector
 * 
 * Features:
 * - User authentication and management
 * - Role-based access control
 * - Royalty records management
 * - Real-time analytics and reporting
 * - Compliance monitoring
 * - Audit trail logging
 */

// Global application state
const AppState = {
  currentUser: null,
  currentSection: 'dashboard',
  users: [],
  royaltyRecords: [],
  auditLog: [],
  notifications: [],
  charts: {},
  isLoading: false,
  settings: {
    recordsPerPage: 10,
    autoSave: true,
    theme: 'light'
  }
};

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing application...');
  initializeApplication();
});

/**
 * Main application initialization
 */
async function initializeApplication() {
  try {
    console.log('Starting loading simulation...');
    
    // Show loading screen
    showLoadingScreen();
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Loading simulation complete');
    
    // Hide loading screen and show login
    hideLoadingScreen();
    showLoginSection();
    
    console.log('Login section displayed');
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load sample data
    loadSampleData();
    
    console.log('Application initialized successfully');
    
  } catch (error) {
    console.error('Application initialization failed:', error);
    showNotification('Application failed to initialize. Please refresh the page.', 'error');
  }
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'flex';
  }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
}

/**
 * Show login section
 */
function showLoginSection() {
  console.log('Showing login section...');
  const loginSection = document.getElementById('login-section');
  if (loginSection) {
    loginSection.style.display = 'flex';
  }
}

/**
 * Hide login section
 */
function hideLoginSection() {
  const loginSection = document.getElementById('login-section');
  if (loginSection) {
    loginSection.style.display = 'none';
  }
}

/**
 * Show main application
 */
function showMainApplication() {
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.style.display = 'flex';
  }
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Login form
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Password toggle
  const passwordToggle = document.querySelector('.password-toggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('click', togglePasswordVisibility);
  }

  // Navigation
  initializeNavigation();
  
  // Chart controls
  initializeChartControls();
  
  // User management
  initializeUserManagement();
  
  // Royalty records
  initializeRoyaltyManagement();
  
  // Profile management
  initializeProfileManagement();
  
  // Logout
  const logoutBtn = document.getElementById('confirm-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  console.log('Login attempt:', { username, password: password ? '***' : '' });
  
  // Basic validation
  if (!username || !password) {
    showNotification('Please enter both username and password', 'error');
    return;
  }
  
  try {
    // Simulate authentication
    await authenticateUser(username, password);
    
    // Hide login and show main app
    hideLoginSection();
    showMainApplication();
    
    // Initialize main application components
    initializeMainApplication();
    
    showNotification('Welcome to Mining Royalties Manager!', 'success');
    
  } catch (error) {
    console.error('Login failed:', error);
    showNotification('Invalid credentials. Please try again.', 'error');
  }
}

/**
 * Authenticate user (simplified for demo)
 */
async function authenticateUser(username, password) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Demo credentials
  const validCredentials = [
    { username: 'admin', password: 'admin123', role: 'Administrator', name: 'System Administrator' },
    { username: 'finance', password: 'finance123', role: 'Finance', name: 'Finance Manager' },
    { username: 'auditor', password: 'audit123', role: 'Auditor', name: 'Chief Auditor' }
  ];
  
  const user = validCredentials.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  AppState.currentUser = user;
  
  // Update UI with user info
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
  
  // Log successful login
  logAuditEvent('Login', user.username, 'System', 'Success', `User ${user.username} logged in successfully`);
}

/**
 * Initialize main application after login
 */
function initializeMainApplication() {
  console.log('Initializing main application...');
  
  // Load initial data
  loadSampleData();
  
  // Show dashboard by default
  showSection('dashboard');
  
  // Update dashboard metrics
  updateDashboardMetrics();
  
  console.log('Application initialized successfully');
}

/**
 * Navigation handling
 */
function initializeNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const section = href.substring(1);
        if (section === 'logout') {
          // Handle logout separately
          showSection('logout');
        } else {
          showSection(section);
        }
      }
    });
  });
}

/**
 * Show specific section
 */
function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.main-content section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
    AppState.currentSection = sectionId;
    
    // Update navigation active state
    updateNavigationState(sectionId);
    
    // Section-specific initialization
    initializeSection(sectionId);
  }
}

/**
 * Update navigation active state
 */
function updateNavigationState(activeSection) {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${activeSection}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Enhanced dashboard metrics calculation and display
 */
function updateDashboardMetrics() {
  try {
    // Calculate comprehensive metrics
    const metrics = calculateDashboardMetrics();
    
    // Update metric displays
    updateMetricDisplays(metrics);
    
    // Update charts data
    updateChartsData(metrics);
    
    // Update recent activity
    updateRecentActivity();
    
    // Update system status
    updateSystemStatus();
    
    console.log('Dashboard metrics updated successfully');
  } catch (error) {
    console.error('Failed to update dashboard metrics:', error);
    showNotification('Failed to update dashboard data', 'error');
  }
}

/**
 * Calculate comprehensive dashboard metrics
 */
function calculateDashboardMetrics() {
  const currentYear = new Date().getFullYear();
  const currentRecords = AppState.royaltyRecords.filter(r => 
    new Date(r.date).getFullYear() === currentYear
  );
  
  // Total royalties calculation
  const totalRoyalties = currentRecords.reduce((sum, record) => sum + record.amount, 0);
  const lastYearRecords = AppState.royaltyRecords.filter(r => 
    new Date(r.date).getFullYear() === currentYear - 1
  );
  const lastYearTotal = lastYearRecords.reduce((sum, record) => sum + record.amount, 0);
  const royaltiesGrowth = lastYearTotal > 0 ? 
    ((totalRoyalties - lastYearTotal) / lastYearTotal * 100).toFixed(1) : 0;
  
  // Active entities
  const activeEntities = new Set(currentRecords.map(r => r.entity));
  const mines = new Set(currentRecords.filter(r => r.entity.includes('Mine')).map(r => r.entity));
  const quarries = new Set(currentRecords.filter(r => r.entity.includes('Quarry')).map(r => r.entity));
  
  // Compliance calculations
  const paidRecords = currentRecords.filter(r => r.status === 'Paid');
  const pendingRecords = currentRecords.filter(r => r.status === 'Pending');
  const overdueRecords = currentRecords.filter(r => r.status === 'Overdue');
  const complianceRate = currentRecords.length > 0 ? 
    Math.round((paidRecords.length / currentRecords.length) * 100) : 0;
  
  // Pending approvals
  const pendingApprovals = pendingRecords.length + overdueRecords.length;
  const urgentItems = overdueRecords.length;
  
  // Monthly data for charts
  const monthlyData = getMonthlyRoyaltyData(currentRecords);
  const entityProductionData = getEntityProductionData(currentRecords);
  
  return {
    totalRoyalties,
    royaltiesGrowth,
    activeEntities: activeEntities.size,
    minesCount: mines.size,
    quarriesCount: quarries.size,
    complianceRate,
    paidCount: paidRecords.length,
    pendingCount: pendingRecords.length,
    overdueCount: overdueRecords.length,
    pendingApprovals,
    urgentItems,
    monthlyData,
    entityProductionData
  };
}

/**
 * Update metric displays with calculated data
 */
function updateMetricDisplays(metrics) {
  // Total royalties
  updateElement('total-royalties', `E${metrics.totalRoyalties.toLocaleString()}.00`);
  updateTrendIndicator('royalties-trend', metrics.royaltiesGrowth, '%');
  updateProgressBar('royalties-progress', Math.min(metrics.totalRoyalties / 3000000 * 100, 100));
  
  // Active entities
  updateElement('active-entities', metrics.activeEntities.toString());
  updateElement('mines-count', metrics.minesCount.toString());
  updateElement('quarries-count', metrics.quarriesCount.toString());
  
  // Compliance rate
  updateElement('compliance-rate', `${metrics.complianceRate}%`);
  updateProgressBar('compliance-progress', metrics.complianceRate);
  updateElement('paid-count', metrics.paidCount.toString());
  updateElement('pending-count', metrics.pendingCount.toString());
  updateElement('overdue-count', metrics.overdueCount.toString());
  
  // Pending approvals
  updateElement('pending-approvals', metrics.pendingApprovals.toString());
  updateUrgencyIndicator(metrics.urgentItems);
  
  // Chart summaries
  const avgMonthly = metrics.monthlyData.reduce((sum, val) => sum + val, 0) / 12;
  updateElement('avg-monthly', Math.round(avgMonthly).toLocaleString());
  
  const maxMonthIndex = metrics.monthlyData.indexOf(Math.max(...metrics.monthlyData));
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  updateElement('peak-month', monthNames[maxMonthIndex]);
  
  const totalProduction = metrics.entityProductionData.reduce((sum, val) => sum + val, 0);
  updateElement('total-production', totalProduction.toLocaleString());
  
  const topProducerIndex = metrics.entityProductionData.indexOf(Math.max(...metrics.entityProductionData));
  const entityNames = ['Kwalini Quarry', 'Maloma Colliery', 'Ngwenya Mine', 'Mbabane Quarry', 'Sidvokodvo Quarry'];
  updateElement('top-producer', entityNames[topProducerIndex] || 'N/A');
}

/**
 * Update trend indicator with proper styling
 */
function updateTrendIndicator(elementId, value, suffix = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const numValue = parseFloat(value);
  let icon, className, text;
  
  if (numValue > 0) {
    icon = 'fas fa-arrow-up';
    className = 'trend-positive';
    text = `+${value}${suffix} from last year`;
  } else if (numValue < 0) {
    icon = 'fas fa-arrow-down';
    className = 'trend-negative';
    text = `${value}${suffix} from last year`;
  } else {
    icon = 'fas fa-minus';
    className = 'trend-stable';
    text = 'No change from last year';
  }
  
  element.innerHTML = `<i class="${icon} ${className}"></i> ${text}`;
  element.className = `trend-indicator ${className}`;
}

/**
 * Update progress bar
 */
function updateProgressBar(elementId, percentage) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
  }
}

/**
 * Update urgency indicator
 */
function updateUrgencyIndicator(urgentCount) {
  const urgentElement = document.getElementById('urgent-items');
  const countElement = document.getElementById('urgent-count');
  const pendingUrgency = document.getElementById('pending-urgency');
  
  if (urgentCount > 0) {
    if (urgentElement) urgentElement.style.display = 'inline-flex';
    if (countElement) countElement.textContent = urgentCount.toString();
    if (pendingUrgency) pendingUrgency.textContent = `${urgentCount} urgent items require attention`;
  } else {
    if (urgentElement) urgentElement.style.display = 'none';
    if (pendingUrgency) pendingUrgency.textContent = 'No urgent items';
  }
}

/**
 * Get monthly royalty data for charts
 */
function getMonthlyRoyaltyData(records) {
  const monthlyTotals = new Array(12).fill(0);
  
  records.forEach(record => {
    const month = new Date(record.date).getMonth();
    monthlyTotals[month] += record.amount;
  });
  
  return monthlyTotals;
}

/**
 * Get entity production data for charts
 */
function getEntityProductionData(records) {
  const entityTotals = {};
  
  records.forEach(record => {
    if (!entityTotals[record.entity]) {
      entityTotals[record.entity] = 0;
    }
    entityTotals[record.entity] += record.volume;
  });
  
  return Object.values(entityTotals);
}

/**
 * Update recent activity feed
 */
function updateRecentActivity() {
  const activityContainer = document.getElementById('recent-activity');
  if (!activityContainer) return;
  
  const recentAuditEntries = AppState.auditLog.slice(0, 5);
  
  activityContainer.innerHTML = recentAuditEntries.map(entry => {
    const iconClass = getActivityIcon(entry.action);
    const timeAgo = formatTimeAgo(entry.timestamp);
    
    return `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="activity-content">
          <p><strong>${entry.action}</strong> ${entry.details}</p>
          <small>${timeAgo}</small>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Get appropriate icon for activity type
 */
function getActivityIcon(action) {
  const iconMap = {
    'Login': 'fas fa-sign-in-alt text-info',
    'Logout': 'fas fa-sign-out-alt text-secondary',
    'Create User': 'fas fa-user-plus text-success',
    'Delete User': 'fas fa-user-minus text-danger',
    'Create Record': 'fas fa-plus-circle text-success',
    'Delete Record': 'fas fa-trash text-danger',
    'Data Access': 'fas fa-eye text-info',
    'Password Reset': 'fas fa-key text-warning',
    'Failed Login': 'fas fa-exclamation-triangle text-danger'
  };
  
  return iconMap[action] || 'fas fa-circle text-muted';
}

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(timestamp);
}

/**
 * Update system status indicators
 */
function updateSystemStatus() {
  // Simulate system status checks
  updateElement('system-status', '<i class="fas fa-circle"></i> Online');
  updateElement('db-status', '<i class="fas fa-circle"></i> Connected');
  updateElement('last-backup', 'Today, 03:00 AM');
  updateElement('active-sessions', `${AppState.users.filter(u => u.status === 'Active').length} users`);
  updateElement('system-uptime', '7 days, 14 hours');
  
  // Update alert count
  const alertCount = AppState.auditLog.filter(entry => 
    entry.status === 'Failed' || entry.action === 'Failed Login'
  ).length;
  
  updateElement('alert-count-badge', alertCount.toString());
  
  if (alertCount === 0) {
    const alertsContainer = document.getElementById('system-alerts');
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="alert-item info">
          <i class="fas fa-check-circle"></i>
          <div class="alert-content">
            <p>System running normally</p>
            <small>All services operational</small>
          </div>
        </div>
      `;
    }
  }
}

/**
 * Initialize dashboard event handlers
 */
function initializeDashboardHandlers() {
  // Refresh dashboard
  const refreshBtn = document.getElementById('refresh-dashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      this.disabled = true;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      
      setTimeout(() => {
        updateDashboardMetrics();
        this.disabled = false;
        this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        showNotification('Dashboard refreshed successfully', 'success');
      }, 1500);
    });
  }
  
  // Quick actions
  const quickActions = {
    'add-royalty-record': () => showSection('royalty-records'),
    'generate-report': () => showSection('reporting-analytics'),
    'view-overdue': () => {
      showSection('royalty-records');
      // Apply overdue filter (would be implemented in royalty section)
    },
    'manage-users': () => showSection('user-management')
  };
  
  Object.entries(quickActions).forEach(([id, action]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', action);
    }
  });
  
  // Metric period changes
  const periodSelectors = document.querySelectorAll('.metric-period');
  periodSelectors.forEach(selector => {
    selector.addEventListener('change', function() {
      // This would trigger a data refresh for the specific metric
      console.log(`Period changed for ${this.id}: ${this.value}`);
      updateDashboardMetrics();
    });
  });
}

/**
 * Helper function to safely update element content
 */
function updateElement(id, content) {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = content;
  }
}

/**
 * Initialize section-specific functionality
 */
function initializeSection(sectionId) {
  switch (sectionId) {
    case 'dashboard':
      updateDashboardMetrics();
      initializeDashboardHandlers();
      break;
    case 'user-management':
      populateUserAccounts();
      populateAuditLog();
      break;
    case 'royalty-records':
      populateRoyaltyRecords();
      break;
    case 'reporting-analytics':
      initializeReportingCharts();
      break;
    default:
      console.log(`No specific initialization for section: ${sectionId}`);
  }
}

/**
 * Load sample data for demonstration
 */
function loadSampleData() {
  // Sample royalty records
  AppState.royaltyRecords = [
    {
      id: 1,
      entity: 'Kwalini Quarry',
      mineral: 'Quarried Stone',
      volume: 1250,
      tariff: 15,
      amount: 18750,
      date: '2024-01-15',
      status: 'Paid'
    },
    {
      id: 2,
      entity: 'Maloma Colliery',
      mineral: 'Coal',
      volume: 2500,
      tariff: 25,
      amount: 62500,
      date: '2024-01-20',
      status: 'Pending'
    },
    {
      id: 3,
      entity: 'Ngwenya Mine',
      mineral: 'Iron Ore',
      volume: 1800,
      tariff: 40,
      amount: 72000,
      date: '2024-01-25',
      status: 'Paid'
    },
    {
      id: 4,
      entity: 'Mbabane Quarry',
      mineral: 'Gravel',
      volume: 950,
      tariff: 12,
      amount: 11400,
      date: '2024-02-01',
      status: 'Overdue'
    },
    {
      id: 5,
      entity: 'Sidvokodvo Quarry',
      mineral: 'River Sand',
      volume: 800,
      tariff: 18,
      amount: 14400,
      date: '2024-02-05',
      status: 'Paid'
    }
  ];
  
  console.log('Added 5 sample royalty records');
  
  // Sample user accounts
  AppState.users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@eswacaa.sz',
      role: 'Administrator',
      department: 'Management',
      status: 'Active',
      lastLogin: '2024-02-10 09:15:00',
      failedAttempts: 0,
      expires: null,
      created: '2023-01-15'
    },
    {
      id: 2,
      username: 'finance.manager',
      email: 'finance@eswacaa.sz',
      role: 'Finance',
      department: 'Finance',
      status: 'Active',
      lastLogin: '2024-02-09 14:30:00',
      failedAttempts: 0,
      expires: null,
      created: '2023-03-10'
    },
    {
      id: 3,
      username: 'auditor.chief',
      email: 'audit@eswacaa.sz',
      role: 'Auditor',
      department: 'Audit',
      status: 'Active',
      lastLogin: '2024-02-08 11:45:00',
      failedAttempts: 1,
      expires: '2024-12-31',
      created: '2023-06-20'
    }
  ];
  
  console.log('Added 3 user accounts');
  
  // Sample audit log
  console.log('Populating audit log...');
  AppState.auditLog = [
    {
      id: 1,
      timestamp: '2024-02-10 09:15:23',
      user: 'admin',
      action: 'Login',
      target: 'System',
      ipAddress: '192.168.1.100',
      status: 'Success',
      details: 'Successful login from dashboard'
    },
    {
      id: 2,
      timestamp: '2024-02-10 09:18:45',
      user: 'admin',
      action: 'Create User',
      target: 'finance.manager',
      ipAddress: '192.168.1.100',
      status: 'Success',
      details: 'Created new finance manager account'
    },
    {
      id: 3,
      timestamp: '2024-02-09 16:30:12',
      user: 'finance.manager',
      action: 'Data Access',
      target: 'Royalty Records',
      ipAddress: '192.168.1.105',
      status: 'Success',
      details: 'Accessed royalty records for January 2024'
    }
  ];
  
  console.log('Added 3 audit log entries');
}

/**
 * Update dashboard metrics
 */
function updateDashboardMetrics() {
  try {
    // Calculate comprehensive metrics
    const metrics = calculateDashboardMetrics();
    
    // Update metric displays
    updateMetricDisplays(metrics);
    
    // Update charts data
    updateChartsData(metrics);
    
    // Update recent activity
    updateRecentActivity();
    
    // Update system status
    updateSystemStatus();
    
    console.log('Dashboard metrics updated successfully');
  } catch (error) {
    console.error('Failed to update dashboard metrics:', error);
    showNotification('Failed to update dashboard data', 'error');
  }
}

/**
 * Calculate comprehensive dashboard metrics
 */
function calculateDashboardMetrics() {
  const currentYear = new Date().getFullYear();
  const currentRecords = AppState.royaltyRecords.filter(r => 
    new Date(r.date).getFullYear() === currentYear
  );
  
  // Total royalties calculation
  const totalRoyalties = currentRecords.reduce((sum, record) => sum + record.amount, 0);
  const lastYearRecords = AppState.royaltyRecords.filter(r => 
    new Date(r.date).getFullYear() === currentYear - 1
  );
  const lastYearTotal = lastYearRecords.reduce((sum, record) => sum + record.amount, 0);
  const royaltiesGrowth = lastYearTotal > 0 ? 
    ((totalRoyalties - lastYearTotal) / lastYearTotal * 100).toFixed(1) : 0;
  
  // Active entities
  const activeEntities = new Set(currentRecords.map(r => r.entity));
  const mines = new Set(currentRecords.filter(r => r.entity.includes('Mine')).map(r => r.entity));
  const quarries = new Set(currentRecords.filter(r => r.entity.includes('Quarry')).map(r => r.entity));
  
  // Compliance calculations
  const paidRecords = currentRecords.filter(r => r.status === 'Paid');
  const pendingRecords = currentRecords.filter(r => r.status === 'Pending');
  const overdueRecords = currentRecords.filter(r => r.status === 'Overdue');
  const complianceRate = currentRecords.length > 0 ? 
    Math.round((paidRecords.length / currentRecords.length) * 100) : 0;
  
  // Pending approvals
  const pendingApprovals = pendingRecords.length + overdueRecords.length;
  const urgentItems = overdueRecords.length;
  
  // Monthly data for charts
  const monthlyData = getMonthlyRoyaltyData(currentRecords);
  const entityProductionData = getEntityProductionData(currentRecords);
  
  return {
    totalRoyalties,
    royaltiesGrowth,
    activeEntities: activeEntities.size,
    minesCount: mines.size,
    quarriesCount: quarries.size,
    complianceRate,
    paidCount: paidRecords.length,
    pendingCount: pendingRecords.length,
    overdueCount: overdueRecords.length,
    pendingApprovals,
    urgentItems,
    monthlyData,
    entityProductionData
  };
}

/**
 * Update metric displays with calculated data
 */
function updateMetricDisplays(metrics) {
  // Total royalties
  updateElement('total-royalties', `E${metrics.totalRoyalties.toLocaleString()}.00`);
  updateTrendIndicator('royalties-trend', metrics.royaltiesGrowth, '%');
  updateProgressBar('royalties-progress', Math.min(metrics.totalRoyalties / 3000000 * 100, 100));
  
  // Active entities
  updateElement('active-entities', metrics.activeEntities.toString());
  updateElement('mines-count', metrics.minesCount.toString());
  updateElement('quarries-count', metrics.quarriesCount.toString());
  
  // Compliance rate
  updateElement('compliance-rate', `${metrics.complianceRate}%`);
  updateProgressBar('compliance-progress', metrics.complianceRate);
  updateElement('paid-count', metrics.paidCount.toString());
  updateElement('pending-count', metrics.pendingCount.toString());
  updateElement('overdue-count', metrics.overdueCount.toString());
  
  // Pending approvals
  updateElement('pending-approvals', metrics.pendingApprovals.toString());
  updateUrgencyIndicator(metrics.urgentItems);
  
  // Chart summaries
  const avgMonthly = metrics.monthlyData.reduce((sum, val) => sum + val, 0) / 12;
  updateElement('avg-monthly', Math.round(avgMonthly).toLocaleString());
  
  const maxMonthIndex = metrics.monthlyData.indexOf(Math.max(...metrics.monthlyData));
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  updateElement('peak-month', monthNames[maxMonthIndex]);
  
  const totalProduction = metrics.entityProductionData.reduce((sum, val) => sum + val, 0);
  updateElement('total-production', totalProduction.toLocaleString());
  
  const topProducerIndex = metrics.entityProductionData.indexOf(Math.max(...metrics.entityProductionData));
  const entityNames = ['Kwalini Quarry', 'Maloma Colliery', 'Ngwenya Mine', 'Mbabane Quarry', 'Sidvokodvo Quarry'];
  updateElement('top-producer', entityNames[topProducerIndex] || 'N/A');
}

/**
 * Update trend indicator with proper styling
 */
function updateTrendIndicator(elementId, value, suffix = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const numValue = parseFloat(value);
  let icon, className, text;
  
  if (numValue > 0) {
    icon = 'fas fa-arrow-up';
    className = 'trend-positive';
    text = `+${value}${suffix} from last year`;
  } else if (numValue < 0) {
    icon = 'fas fa-arrow-down';
    className = 'trend-negative';
    text = `${value}${suffix} from last year`;
  } else {
    icon = 'fas fa-minus';
    className = 'trend-stable';
    text = 'No change from last year';
  }
  
  element.innerHTML = `<i class="${icon} ${className}"></i> ${text}`;
  element.className = `trend-indicator ${className}`;
}

/**
 * Update progress bar
 */
function updateProgressBar(elementId, percentage) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
  }
}

/**
 * Update urgency indicator
 */
function updateUrgencyIndicator(urgentCount) {
  const urgentElement = document.getElementById('urgent-items');
  const countElement = document.getElementById('urgent-count');
  const pendingUrgency = document.getElementById('pending-urgency');
  
  if (urgentCount > 0) {
    if (urgentElement) urgentElement.style.display = 'inline-flex';
    if (countElement) countElement.textContent = urgentCount.toString();
    if (pendingUrgency) pendingUrgency.textContent = `${urgentCount} urgent items require attention`;
  } else {
    if (urgentElement) urgentElement.style.display = 'none';
    if (pendingUrgency) pendingUrgency.textContent = 'No urgent items';
  }
}

/**
 * Get monthly royalty data for charts
 */
function getMonthlyRoyaltyData(records) {
  const monthlyTotals = new Array(12).fill(0);
  
  records.forEach(record => {
    const month = new Date(record.date).getMonth();
    monthlyTotals[month] += record.amount;
  });
  
  return monthlyTotals;
}

/**
 * Get entity production data for charts
 */
function getEntityProductionData(records) {
  const entityTotals = {};
  
  records.forEach(record => {
    if (!entityTotals[record.entity]) {
      entityTotals[record.entity] = 0;
    }
    entityTotals[record.entity] += record.volume;
  });
  
  return Object.values(entityTotals);
}

/**
 * Update recent activity feed
 */
function updateRecentActivity() {
  const activityContainer = document.getElementById('recent-activity');
  if (!activityContainer) return;
  
  const recentAuditEntries = AppState.auditLog.slice(0, 5);
  
  activityContainer.innerHTML = recentAuditEntries.map(entry => {
    const iconClass = getActivityIcon(entry.action);
    const timeAgo = formatTimeAgo(entry.timestamp);
    
    return `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="activity-content">
          <p><strong>${entry.action}</strong> ${entry.details}</p>
          <small>${timeAgo}</small>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Get appropriate icon for activity type
 */
function getActivityIcon(action) {
  const iconMap = {
    'Login': 'fas fa-sign-in-alt text-info',
    'Logout': 'fas fa-sign-out-alt text-secondary',
    'Create User': 'fas fa-user-plus text-success',
    'Delete User': 'fas fa-user-minus text-danger',
    'Create Record': 'fas fa-plus-circle text-success',
    'Delete Record': 'fas fa-trash text-danger',
    'Data Access': 'fas fa-eye text-info',
    'Password Reset': 'fas fa-key text-warning',
    'Failed Login': 'fas fa-exclamation-triangle text-danger'
  };
  
  return iconMap[action] || 'fas fa-circle text-muted';
}

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(timestamp);
}

/**
 * Update system status indicators
 */
function updateSystemStatus() {
  // Simulate system status checks
  updateElement('system-status', '<i class="fas fa-circle"></i> Online');
  updateElement('db-status', '<i class="fas fa-circle"></i> Connected');
  updateElement('last-backup', 'Today, 03:00 AM');
  updateElement('active-sessions', `${AppState.users.filter(u => u.status === 'Active').length} users`);
  updateElement('system-uptime', '7 days, 14 hours');
  
  // Update alert count
  const alertCount = AppState.auditLog.filter(entry => 
    entry.status === 'Failed' || entry.action === 'Failed Login'
  ).length;
  
  updateElement('alert-count-badge', alertCount.toString());
  
  if (alertCount === 0) {
    const alertsContainer = document.getElementById('system-alerts');
    if (alertsContainer) {
      alertsContainer.innerHTML = `
        <div class="alert-item info">
          <i class="fas fa-check-circle"></i>
          <div class="alert-content">
            <p>System running normally</p>
            <small>All services operational</small>
          </div>
        </div>
      `;
    }
  }
}

/**
 * Initialize dashboard event handlers
 */
function initializeDashboardHandlers() {
  // Refresh dashboard
  const refreshBtn = document.getElementById('refresh-dashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      this.disabled = true;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      
      setTimeout(() => {
        updateDashboardMetrics();
        this.disabled = false;
        this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        showNotification('Dashboard refreshed successfully', 'success');
      }, 1500);
    });
  }
  
  // Quick actions
  const quickActions = {
    'add-royalty-record': () => showSection('royalty-records'),
    'generate-report': () => showSection('reporting-analytics'),
    'view-overdue': () => {
      showSection('royalty-records');
      // Apply overdue filter (would be implemented in royalty section)
    },
    'manage-users': () => showSection('user-management')
  };
  
  Object.entries(quickActions).forEach(([id, action]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', action);
    }
  });
  
  // Metric period changes
  const periodSelectors = document.querySelectorAll('.metric-period');
  periodSelectors.forEach(selector => {
    selector.addEventListener('change', function() {
      // This would trigger a data refresh for the specific metric
      console.log(`Period changed for ${this.id}: ${this.value}`);
      updateDashboardMetrics();
    });
  });
}

/**
 * Helper function to safely update element content
 */
function updateElement(id, content) {
  const element = document.getElementById(id);
  if (element) {
    element.innerHTML = content;
  }
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Login form
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Password toggle
  const passwordToggle = document.querySelector('.password-toggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('click', togglePasswordVisibility);
  }

  // Navigation
  initializeNavigation();
  
  // Chart controls
  initializeChartControls();
  
  // User management
  initializeUserManagement();
  
  // Royalty records
  initializeRoyaltyManagement();
  
  // Profile management
  initializeProfileManagement();
  
  // Logout
  const logoutBtn = document.getElementById('confirm-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  console.log('Login attempt:', { username, password: password ? '***' : '' });
  
  // Basic validation
  if (!username || !password) {
    showNotification('Please enter both username and password', 'error');
    return;
  }
  
  try {
    // Simulate authentication
    await authenticateUser(username, password);
    
    // Hide login and show main app
    hideLoginSection();
    showMainApplication();
    
    // Initialize main application components
    initializeMainApplication();
    
    showNotification('Welcome to Mining Royalties Manager!', 'success');
    
  } catch (error) {
    console.error('Login failed:', error);
    showNotification('Invalid credentials. Please try again.', 'error');
  }
}

/**
 * Authenticate user (simplified for demo)
 */
async function authenticateUser(username, password) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Demo credentials
  const validCredentials = [
    { username: 'admin', password: 'admin123', role: 'Administrator', name: 'System Administrator' },
    { username: 'finance', password: 'finance123', role: 'Finance', name: 'Finance Manager' },
    { username: 'auditor', password: 'audit123', role: 'Auditor', name: 'Chief Auditor' }
  ];
  
  const user = validCredentials.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  AppState.currentUser = user;
  
  // Update UI with user info
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
  
  // Log successful login
  logAuditEvent('Login', user.username, 'System', 'Success', `User ${user.username} logged in successfully`);
}

/**
 * Initialize main application after login
 */
function initializeMainApplication() {
  console.log('Initializing main application...');
  
  // Load initial data
  loadSampleData();
  
  // Show dashboard by default
  showSection('dashboard');
  
  // Update dashboard metrics
  updateDashboardMetrics();
  
  console.log('Application initialized successfully');
}

/**
 * Navigation handling
 */
function initializeNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const section = href.substring(1);
        if (section === 'logout') {
          // Handle logout separately
          showSection('logout');
        } else {
          showSection(section);
        }
      }
    });
  });
}

/**
 * Show specific section
 */
function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.main-content section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
    AppState.currentSection = sectionId;
    
    // Update navigation active state
    updateNavigationState(sectionId);
    
    // Section-specific initialization
    initializeSection(sectionId);
  }
}

/**
 * Update navigation active state
 */
function updateNavigationState(activeSection) {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${activeSection}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Enhanced dashboard metrics calculation and display
 */
function updateDashboardMetrics() {
  try {
    // Calculate comprehensive metrics
    const metrics = calculateDashboardMetrics();
    
    // Update metric displays
    updateMetricDisplays(metrics);
    
    // Update charts data
    updateChartsData(metrics);
    
    // Update recent activity
    updateRecentActivity();
    
    // Update system status
    updateSystemStatus();
    
    console.log('Dashboard metrics updated successfully');
  } catch (error) {
    console.error('Failed to update dashboard metrics:', error);
    showNotification('Failed to update dashboard data', 'error');
  }
}

/**
 * Calculate comprehensive dashboard metrics
 */
function calculateDashboardMetrics() {
  const currentYear = new Date().getFullYear();
  const currentRecords = AppState.royaltyRecords.filter(r => 
    new Date(r.date).getFullYear() === currentYear
  );
  
  // Total royalties calculation
  const totalRoyalties = currentRecords.reduce((sum, record) => sum + record.amount, 0);
  const lastYearRecords = AppState.royaltyRecords.filter(r => 
    new Date(r.date).getFullYear() === currentYear - 1
  );
  const lastYearTotal = lastYearRecords.reduce((sum, record) => sum + record.amount, 0);
  const royaltiesGrowth = lastYearTotal > 0 ? 
    ((totalRoyalties - lastYearTotal) / lastYearTotal * 100).toFixed(1) : 0;
  
  // Active entities
  const activeEntities = new Set(currentRecords.map(r => r.entity));
  const mines = new Set(currentRecords.filter(r => r.entity.includes('Mine')).map(r => r.entity));
  const quarries = new Set(currentRecords.filter(r => r.entity.includes('Quarry')).map(r => r.entity));
  
  // Compliance calculations
  const paidRecords = currentRecords.filter(r => r.status === 'Paid');
  const pendingRecords = currentRecords.filter(r => r.status === 'Pending');
  const overdueRecords = currentRecords.filter(r => r.status === 'Overdue');
  const complianceRate = currentRecords.length > 0 ? 
    Math.round((paidRecords.length / currentRecords.length) * 100) : 0;
  
  // Pending approvals
  const pendingApprovals = pendingRecords.length + overdueRecords.length;
  const urgentItems = overdueRecords.length;
  
  // Monthly data for charts
  const monthlyData = getMonthlyRoyaltyData(currentRecords);
  const entityProductionData = getEntityProductionData(currentRecords);
  
  return {
    totalRoyalties,
    royaltiesGrowth,
    activeEntities: activeEntities.size,
    minesCount: mines.size,
    quarriesCount: quarries.size,
    complianceRate,
    paidCount: paidRecords.length,
    pendingCount: pendingRecords.length,
    overdueCount: overdueRecords.length,
    pendingApprovals,
    urgentItems,
    monthlyData,
    entityProductionData
  };
}

/**
 * Update metric displays with calculated data
 */
function updateMetricDisplays(metrics) {
  // Total royalties
  updateElement('total-royalties', `E${metrics.totalRoyalties.toLocaleString()}.00`);
  updateTrendIndicator('royalties-trend', metrics.royaltiesGrowth, '%');
  updateProgressBar('royalties-progress', Math.min(metrics.totalRoyalties / 3000000 * 100, 100));
  
  // Active entities
  updateElement('active-entities', metrics.activeEntities.toString());
  updateElement('mines-count', metrics.minesCount.toString());
  updateElement('quarries-count', metrics.quarriesCount.toString());
  
  // Compliance rate
  updateElement('compliance-rate', `${metrics.complianceRate}%`);
  updateProgressBar('compliance-progress', metrics.complianceRate);
  updateElement('paid-count', metrics.paidCount.toString());
  updateElement('pending-count', metrics.pendingCount.toString());
  updateElement('overdue-count', metrics.overdueCount.toString());
  
  // Pending approvals
  updateElement('pending-approvals', metrics.pendingApprovals.toString());
  updateUrgencyIndicator(metrics.urgentItems);
  
  // Chart summaries
  const avgMonthly = metrics.monthlyData.reduce((sum, val) => sum + val, 0) / 12;
  updateElement('avg-monthly', Math.round(avgMonthly).toLocaleString());
  
  const maxMonthIndex = metrics.monthlyData.indexOf(Math.max(...metrics.monthlyData));
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  updateElement('peak-month', monthNames[maxMonthIndex]);
  
  const totalProduction = metrics.entityProductionData.reduce((sum, val) => sum + val, 0);
  updateElement('total-production', totalProduction.toLocaleString());
  
  const topProducerIndex = metrics.entityProductionData.indexOf(Math.max(...metrics.entityProductionData));
  const entityNames = ['Kwalini Quarry', 'Maloma Colliery', 'Ngwenya Mine', 'Mbabane Quarry', 'Sidvokodvo Quarry'];
  updateElement('top-producer', entityNames[topProducerIndex] || 'N/A');
}

/**
 * Update trend indicator with proper styling
 */
function updateTrendIndicator(elementId, value, suffix = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const numValue = parseFloat(value);
  let icon, className, text;
  
  if (numValue > 0) {
    icon = 'fas fa-arrow-up';
    className = 'trend-positive';
    text = `+${value}${suffix} from last year`;
  } else if (numValue < 0) {
    icon = 'fas fa-arrow-down';
    className = 'trend-negative';
    text = `${value}${suffix} from last year`;
  } else {
    icon = 'fas fa-minus';
    className = 'trend-stable';
    text = 'No change from last year';
  }
  
  element.innerHTML = `<i class="${icon} ${className}"></i> ${text}`;
  element.className = `trend-indicator ${className}`;
}

/**
 * Update progress bar
 */
function updateProgressBar(elementId, percentage) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
  }
}

/**
 * Update urgency indicator
 */
function updateUrgencyIndicator(urgentCount) {
  const urgentElement = document.getElementById('urgent-items');
  const countElement = document.getElementById('urgent-count');
  const pendingUrgency = document.getElementById('pending-urgency');
  
  if (urgentCount > 0) {
    if (urgentElement) urgentElement.style.display = 'inline-flex';
    if (countElement) countElement.textContent = urgentCount.toString();
    if (pendingUrgency) pendingUrgency.textContent = `${urgentCount} urgent items require attention`;
  } else {
    if (urgentElement) urgentElement.style.display = 'none';
    if (pendingUrgency) pendingUrgency.textContent = 'No urgent items';
  }
}

/**
 * Get monthly royalty data for charts
 */
function getMonthlyRoyaltyData(records) {
  const monthlyTotals = new Array(12).fill(0);
  
  records.forEach(record => {
    const month = new Date(record.date).getMonth();
    monthlyTotals[month] += record.amount;
  });
  
  return monthlyTotals;
}

/**
 * Get entity production data for charts
 */
function getEntityProductionData(records) {
  const entityTotals = {};
  
  records.forEach(record => {
    if (!entityTotals[record.entity]) {
      entityTotals[record.entity] = 0;
    }
    entityTotals[record.entity] += record.volume;
  });
  
  return Object.values(entityTotals);
}

/**
 * Update recent activity feed
 */
function updateRecentActivity() {
  const activityContainer = document.getElementById('recent-activity');
  if (!activityContainer) return;
  
  const recentAuditEntries = AppState.auditLog.slice(0, 5);
  
  activityContainer.innerHTML = recentAuditEntries.map(entry => {
    const iconClass = getActivityIcon(entry.action);
    const timeAgo = formatTimeAgo(entry.timestamp);
    
    return `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="activity-content">
          <p><strong>${entry.action}</strong> ${entry.details}</p>
          <small>${timeAgo}</small>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Get appropriate icon for activity type
 */
function getActivityIcon(action) {
  const iconMap = {
    'Login': 'fas fa-sign-in-alt text-info',
    'Logout': 'fas fa-sign-out-alt text-secondary',
    'Create User': 'fas fa-user-plus text-success',
    'Delete User': 'fas fa-user-minus text-danger',
    'Create Record': 'fas fa-plus-circle text-success',
    'Delete Record': 'fas fa-trash text-danger',
    'Data Access': 'fas fa-eye text-info',
    'Password Reset': 'fas fa-key text-warning',
    'Failed Login': 'fas fa-exclamation-triangle text-danger'
  };
  
  return iconMap[action] || 'fas fa-circle text-muted';
}

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(timestamp);
}

/**
 * Log audit events
 */
function logAuditEvent(action, user, target, status, details) {
  const auditEntry = {
    id: AppState.auditLog.length + 1,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    user: user,
    action: action,
    target: target,
    ipAddress: '192.168.1.100', // Simulated
    status: status,
    details: details
  };
  
  AppState.auditLog.unshift(auditEntry); // Add to beginning
  
  // Keep only last 100 entries
  if (AppState.auditLog.length > 100) {
    AppState.auditLog = AppState.auditLog.slice(0, 100);
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(n => n.remove());
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icon = type === 'success' ? 'check-circle' : 
               type === 'error' ? 'exclamation-circle' :
               type === 'warning' ? 'exclamation-triangle' : 'info-circle';
  
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close" aria-label="Close notification">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Add close functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => notification.remove());
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const icon = this.querySelector('i');
  
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passwordField.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    // Log the logout
    logAuditEvent('Logout', AppState.currentUser.username, 'System', 'Success', 'User logged out');
    
    // Reset application state
    AppState.currentUser = null;
    AppState.currentSection = 'dashboard';
    
    // Show login section
    const appContainer = document.getElementById('app-container');
    const loginSection = document.getElementById('login-section');
    
    if (appContainer) appContainer.style.display = 'none';
    if (loginSection) loginSection.style.display = 'flex';
    
    // Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    showNotification('You have been logged out successfully', 'info');
  }
}

/**
 * Filter and search functions
 */
function applyUserFilters() {
  const roleFilter = document.getElementById('filter-user-role').value;
  const statusFilter = document.getElementById('filter-user-status').value;
  const departmentFilter = document.getElementById('filter-user-department').value;
  
  console.log('Applying filters:', { roleFilter, statusFilter, departmentFilter });
  
  // Filter logic would go here
  // For now, just show notification
  showNotification('Filters applied successfully', 'success');
}

function clearUserFilters() {
  document.getElementById('filter-user-role').value = '';
  document.getElementById('filter-user-status').value = '';
  document.getElementById('filter-user-department').value = '';
  
  populateUserAccounts();
  showNotification('Filters cleared', 'info');
}

/**
 * Bulk actions
 */
function updateBulkActions() {
  const checkboxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]:checked');
  const bulkDeleteBtn = document.getElementById('bulk-delete-users');
  const selectedCount = document.getElementById('selected-count');
  
  if (checkboxes.length > 0) {
    if (bulkDeleteBtn) {
      bulkDeleteBtn.style.display = 'inline-block';
      bulkDeleteBtn.disabled = false;
    }
    if (selectedCount) {
      selectedCount.textContent = checkboxes.length;
    }
  } else {
    if (bulkDeleteBtn) {
      bulkDeleteBtn.style.display = 'none';
      bulkDeleteBtn.disabled = true;
    }
  }
}

function handleBulkDelete() {
  const checkboxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]:checked');
  
  if (checkboxes.length === 0) {
    showNotification('No users selected', 'warning');
    return;
  }
  
  if (confirm(`Are you sure you want to delete ${checkboxes.length} selected user(s)?`)) {
    checkboxes.forEach(checkbox => {
      const userId = parseInt(checkbox.getAttribute('data-user-id'));
      AppState.users = AppState.users.filter(user => user.id !== userId);
    });
    
    populateUserAccounts();
    showNotification(`${checkboxes.length} user(s) deleted successfully`, 'success');
    
    // Log the action
    logAuditEvent('Bulk Delete', AppState.currentUser.username, `${checkboxes.length} users`, 'Success', `Bulk deleted ${checkboxes.length} user accounts`);
  }
}

/**
 * Export functionality
 */
function exportUserData() {
  const data = AppState.users.map(user => ({
    Username: user.username,
    Email: user.email,
    Role: user.role,
    Department: user.department,
    Status: user.status,
    'Last Login': user.lastLogin,
    'Failed Attempts': user.failedAttempts,
    Expires: user.expires || 'Never'
  }));
  
  exportToCSV(data, 'user_accounts.csv');
  showNotification('User data exported successfully', 'success');
}

function exportToCSV(data, filename) {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Update user statistics
 */
function updateUserStats() {
  const activeUsersCount = AppState.users.filter(u => u.status === 'Active').length;
  const failedLoginsCount = AppState.users.reduce((sum, u) => sum + u.failedAttempts, 0);
  
  const activeUsersElement = document.getElementById('active-users-count');
  if (activeUsersElement) {
    activeUsersElement.textContent = activeUsersCount;
  }
  
  const failedLoginsElement = document.getElementById('failed-logins-count');
  if (failedLoginsElement) {
    failedLoginsElement.textContent = failedLoginsCount;
  }
}

/**
 * Initialize reporting charts
 */
function initializeReportingCharts() {
  // This would initialize the reporting and analytics charts
  console.log('Initializing reporting charts...');
}

// User action functions (called from HTML)
window.editUser = function(userId) {
  console.log('Edit user:', userId);
  showNotification('Edit user functionality would be implemented here', 'info');
};

window.resetPassword = function(userId) {
  console.log('Reset password for user:', userId);
  showNotification('Password reset functionality would be implemented here', 'info');
};

window.deleteUser = function(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    AppState.users = AppState.users.filter(user => user.id !== userId);
    populateUserAccounts();
    showNotification('User deleted successfully', 'success');
    
    // Log the action
    logAuditEvent('Delete User', AppState.currentUser.username, `User ID ${userId}`, 'Success', `Deleted user account`);
  }
};

window.editRoyaltyRecord = function(recordId) {
  console.log('Edit royalty record:', recordId);
  showNotification('Edit record functionality would be implemented here', 'info');
};

window.deleteRoyaltyRecord = function(recordId) {
  if (confirm('Are you sure you want to delete this royalty record?')) {
    AppState.royaltyRecords = AppState.royaltyRecords.filter(record => record.id !== recordId);
    populateRoyaltyRecords();
    updateDashboardMetrics();
    showNotification('Royalty record deleted successfully', 'success');
    
    // Log the action
    logAuditEvent('Delete Record', AppState.currentUser.username, `Record ID ${recordId}`, 'Success', `Deleted royalty record`);
  }
};

window.viewAuditDetails = function(entryId) {
  console.log('View audit details:', entryId);
  showNotification('Audit details view would be implemented here', 'info');
};

// Export functions for use in HTML
window.populateUserAccounts = populateUserAccounts;
window.togglePassword = function(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector('.password-toggle-btn');
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
};

console.log('Application module loaded successfully');