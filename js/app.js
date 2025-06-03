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
 * Show/Hide UI sections
 */
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'flex';
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
}

function showLoginSection() {
  console.log('Showing login section...');
  const loginSection = document.getElementById('login-section');
  if (loginSection) {
    loginSection.style.display = 'flex';
  }
}

function hideLoginSection() {
  const loginSection = document.getElementById('login-section');
  if (loginSection) {
    loginSection.style.display = 'none';
  }
}

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
  
  // Dashboard quick actions
  initializeDashboardActions();
  
  // Logout
  const logoutBtn = document.getElementById('confirm-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Initialize dashboard quick actions
 */
function initializeDashboardActions() {
  // Quick action buttons
  const quickActionButtons = {
    'add-royalty-record': () => showSection('royalty-records'),
    'generate-report': () => showSection('reporting-analytics'),
    'view-overdue': () => {
      showSection('royalty-records');
      // Apply overdue filter
      setTimeout(() => {
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
          statusFilter.value = 'Overdue';
          // Trigger filter application
        }
      }, 500);
    },
    'manage-users': () => showSection('user-management'),
    'refresh-dashboard': updateDashboardMetrics,
    'admin-panel-btn': () => showSection('user-management'),
    'notifications-btn': () => showSection('notifications')
  };

  // Add event listeners for quick actions
  Object.keys(quickActionButtons).forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', quickActionButtons[buttonId]);
    }
  });
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
  
  // Update last login time
  const lastLoginElement = document.getElementById('last-login-time');
  if (lastLoginElement) {
    const now = new Date();
    lastLoginElement.textContent = now.toLocaleString('en-SZ', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
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
 * Initialize section-specific functionality
 */
function initializeSection(sectionId) {
  switch (sectionId) {
    case 'dashboard':
      updateDashboardMetrics();
      initializeDashboardCharts();
      break;
    case 'user-management':
      populateUserAccounts();
      populateAuditLog();
      break;
    case 'royalty-records':
      populateRoyaltyRecords();
      break;
    case 'audit-dashboard':
      AuditDashboard.init();
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
      email: 'admin@email.sz',
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
      email: 'finance@email.sz',
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
      email: 'audit@email.sz',
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
 * Update dashboard metrics - SINGLE DECLARATION
 */
function updateDashboardMetrics() {
  // Calculate total royalties
  const totalRoyalties = AppState.royaltyRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalRoyaltiesElement = document.getElementById('total-royalties');
  if (totalRoyaltiesElement) {
    totalRoyaltiesElement.textContent = `E ${totalRoyalties.toLocaleString()}.00`;
  }
  
  // Count active entities
  const activeEntities = new Set(AppState.royaltyRecords.map(r => r.entity)).size;
  const activeEntitiesElement = document.getElementById('active-entities');
  if (activeEntitiesElement) {
    activeEntitiesElement.textContent = activeEntities.toString();
  }
  
  // Count mines vs quarries
  const mines = AppState.royaltyRecords.filter(r => r.entity.toLowerCase().includes('mine')).length;
  const quarries = AppState.royaltyRecords.filter(r => r.entity.toLowerCase().includes('quarry')).length;
  
  const minesCountElement = document.getElementById('mines-count');
  const quarriesCountElement = document.getElementById('quarries-count');
  if (minesCountElement) minesCountElement.textContent = mines;
  if (quarriesCountElement) quarriesCountElement.textContent = quarries;
  
  // Calculate compliance rate
  const paidRecords = AppState.royaltyRecords.filter(r => r.status === 'Paid').length;
  const pendingRecords = AppState.royaltyRecords.filter(r => r.status === 'Pending').length;
  const overdueRecords = AppState.royaltyRecords.filter(r => r.status === 'Overdue').length;
  
  const complianceRate = AppState.royaltyRecords.length > 0 ? 
    Math.round((paidRecords / AppState.royaltyRecords.length) * 100) : 0;
  
  const complianceRateElement = document.getElementById('compliance-rate');
  if (complianceRateElement) {
    complianceRateElement.textContent = `${complianceRate}%`;
  }
  
  // Update compliance breakdown
  const paidCountElement = document.getElementById('paid-count');
  const pendingCountElement = document.getElementById('pending-count');
  const overdueCountElement = document.getElementById('overdue-count');
  
  if (paidCountElement) paidCountElement.textContent = paidRecords;
  if (pendingCountElement) pendingCountElement.textContent = pendingRecords;
  if (overdueCountElement) overdueCountElement.textContent = overdueRecords;
  
  // Update progress bars
  const complianceProgress = document.getElementById('compliance-progress');
  const royaltiesProgress = document.getElementById('royalties-progress');
  
  if (complianceProgress) {
    complianceProgress.style.width = `${complianceRate}%`;
  }
  if (royaltiesProgress) {
    royaltiesProgress.style.width = `${Math.min(complianceRate, 100)}%`;
  }
  
  // Count pending approvals
  const pendingApprovals = pendingRecords + overdueRecords;
  const pendingApprovalsElement = document.getElementById('pending-approvals');
  if (pendingApprovalsElement) {
    pendingApprovalsElement.textContent = pendingApprovals.toString();
  }
  
  // Update urgency indicators
  const urgentItemsElement = document.getElementById('urgent-items');
  const urgentCountElement = document.getElementById('urgent-count');
  
  if (overdueRecords > 0) {
    if (urgentItemsElement) urgentItemsElement.style.display = 'inline-flex';
    if (urgentCountElement) urgentCountElement.textContent = overdueRecords;
  } else {
    if (urgentItemsElement) urgentItemsElement.style.display = 'none';
  }
  
  console.log('Dashboard metrics updated successfully');
}

/**
 * Initialize dashboard charts
 */
function initializeDashboardCharts() {
  // Initialize revenue trends chart
  updateChart('revenue-trends-chart', 'line');
  
  // Initialize production by entity chart
  updateChart('production-by-entity-chart', 'pie');
  
  // Update chart summaries
  updateChartSummaries();
}

/**
 * Update chart summaries
 */
function updateChartSummaries() {
  // Calculate average monthly revenue
  const totalRevenue = AppState.royaltyRecords.reduce((sum, record) => sum + record.amount, 0);
  const avgMonthly = Math.round(totalRevenue / 6); // Assuming 6 months of data
  
  const avgMonthlyElement = document.getElementById('avg-monthly');
  if (avgMonthlyElement) {
    avgMonthlyElement.textContent = avgMonthly.toLocaleString();
  }
  
  // Find peak month (simplified)
  const peakMonthElement = document.getElementById('peak-month');
  if (peakMonthElement) {
    peakMonthElement.textContent = 'January 2024';
  }
  
  // Calculate total production
  const totalProduction = AppState.royaltyRecords.reduce((sum, record) => sum + record.volume, 0);
  const totalProductionElement = document.getElementById('total-production');
  if (totalProductionElement) {
    totalProductionElement.textContent = totalProduction.toLocaleString();
  }
  
  // Find top producer
  const topProducerElement = document.getElementById('top-producer');
  if (topProducerElement) {
    const topProducer = AppState.royaltyRecords.reduce((max, record) => 
      record.volume > max.volume ? record : max, AppState.royaltyRecords[0]);
    topProducerElement.textContent = topProducer ? topProducer.entity : '-';
  }
}

/**
 * Initialize chart controls
 */
function initializeChartControls() {
  const chartButtons = document.querySelectorAll('.chart-btn');
  chartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const chartType = this.getAttribute('data-chart-type');
      const chartId = this.getAttribute('data-chart-id');
      
      // Update active button
      const parentControls = this.parentElement;
      parentControls.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update chart
      console.log(`Updating chart ${chartId} to type ${chartType}`);
      updateChart(chartId, chartType);
    });
  });
  
  console.log(`Set up ${chartButtons.length} chart control buttons`);
}

/**
 * Update chart display
 */
function updateChart(chartId, chartType) {
  const canvas = document.getElementById(chartId);
  if (!canvas) return;
  
  // Destroy existing chart if it exists
  if (AppState.charts[chartId]) {
    AppState.charts[chartId].destroy();
  }
  
  const ctx = canvas.getContext('2d');
  
  let data, config;
  
  if (chartId === 'revenue-trends-chart') {
    // Revenue trends data
    data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue (E)',
        data: [65000, 59000, 80000, 81000, 56000, 55000],
        backgroundColor: chartType === 'bar' ? 'rgba(26, 54, 93, 0.8)' : 'rgba(26, 54, 93, 0.2)',
        borderColor: 'rgba(26, 54, 93, 1)',
        borderWidth: 2,
        fill: chartType === 'area'
      }]
    };
  } else if (chartId === 'production-by-entity-chart') {
    // Production by entity data
    const entityProduction = {};
    AppState.royaltyRecords.forEach(record => {
      entityProduction[record.entity] = (entityProduction[record.entity] || 0) + record.volume;
    });
    
    data = {
      labels: Object.keys(entityProduction),
      datasets: [{
        data: Object.values(entityProduction),
        backgroundColor: [
          'rgba(26, 54, 93, 0.8)',
          'rgba(212, 175, 55, 0.8)',
          'rgba(75, 85, 99, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgba(26, 54, 93, 1)',
          'rgba(212, 175, 55, 1)',
          'rgba(75, 85, 99, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2
      }]
    };
  }
  
  config = {
    type: chartType === 'area' ? 'line' : chartType,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType === 'pie' || chartType === 'doughnut'
        }
      },
      scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return chartId === 'revenue-trends-chart' ? 
                'E' + value.toLocaleString() : 
                value.toLocaleString() + ' m³';
            }
          }
        }
      } : {}
    }
  };
  
  AppState.charts[chartId] = new Chart(ctx, config);
}

/**
 * Initialize user management functionality
 */
function initializeUserManagement() {
  // Filter functionality
  const applyFiltersBtn = document.getElementById('apply-user-filters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyUserFilters);
  }
  
  const clearFiltersBtn = document.getElementById('clear-user-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearUserFilters);
  }
  
  // Bulk actions
  const bulkDeleteBtn = document.getElementById('bulk-delete-users');
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', handleBulkDelete);
  }
  
  // Export functionality
  const exportUsersBtn = document.getElementById('export-users');
  if (exportUsersBtn) {
    exportUsersBtn.addEventListener('click', exportUserData);
  }
  
  // Refresh functionality
  const refreshUsersBtn = document.getElementById('refresh-users');
  if (refreshUsersBtn) {
    refreshUsersBtn.addEventListener('click', populateUserAccounts);
  }
}

/**
 * Populate user accounts table
 */
function populateUserAccounts() {
  const tbody = document.getElementById('users-table-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  AppState.users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" data-user-id="${user.id}"></td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
      <td>${user.department}</td>
      <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
      <td>${formatDateTime(user.lastLogin)}</td>
      <td>${user.failedAttempts}</td>
      <td>${user.expires || 'Never'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})" title="Edit user">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-warning" onclick="resetPassword(${user.id})" title="Reset password">
            <i class="fas fa-key"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})" title="Delete user">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Add event listeners for checkboxes
  const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateBulkActions);
  });
  
  updateUserStats();
}

/**
 * Populate audit log table
 */
function populateAuditLog() {
  const tbody = document.getElementById('audit-log-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  AppState.auditLog.forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDateTime(entry.timestamp)}</td>
      <td>${entry.user}</td>
      <td><span class="action-badge ${entry.action.toLowerCase().replace(' ', '-')}">${entry.action}</span></td>
      <td>${entry.target}</td>
      <td>${entry.ipAddress}</td>
      <td><span class="status-badge ${entry.status.toLowerCase()}">${entry.status}</span></td>
      <td>${entry.details}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="viewAuditDetails(${entry.id})" title="View details">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Initialize royalty management
 */
function initializeRoyaltyManagement() {
  const saveRoyaltyBtn = document.getElementById('save-royalty-btn');
  if (saveRoyaltyBtn) {
    saveRoyaltyBtn.addEventListener('click', saveRoyaltyRecord);
  }
}

/**
 * Populate royalty records table
 */
function populateRoyaltyRecords() {
  const tbody = document.getElementById('royalty-records-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  AppState.royaltyRecords.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.entity}</td>
      <td>${record.mineral}</td>
      <td>${record.volume.toLocaleString()}</td>
      <td>E${record.tariff}</td>
      <td>E${record.amount.toLocaleString()}</td>
      <td>${formatDate(record.date)}</td>
      <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-secondary" onclick="editRoyaltyRecord(${record.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteRoyaltyRecord(${record.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Save new royalty record
 */
function saveRoyaltyRecord() {
  const entity = document.getElementById('entity').value;
  const mineral = document.getElementById('mineral').value;
  const volume = parseFloat(document.getElementById('volume').value);
  const tariff = parseFloat(document.getElementById('tariff').value);
  const date = document.getElementById('payment-date').value;
  
  // Validation
  if (!entity || !mineral || !volume || !tariff || !date) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  if (volume <= 0 || tariff <= 0) {
    showNotification('Volume and tariff must be positive numbers', 'error');
    return;
  }
  
  // Create new record
  const newRecord = {
    id: AppState.royaltyRecords.length + 1,
    entity: entity,
    mineral: mineral,
    volume: volume,
    tariff: tariff,
    amount: volume * tariff,
    date: date,
    status: 'Pending'
  };
  
  AppState.royaltyRecords.push(newRecord);
  
  // Clear form
  document.getElementById('entity').value = '';
  document.getElementById('mineral').value = '';
  document.getElementById('volume').value = '';
  document.getElementById('tariff').value = '';
  document.getElementById('payment-date').value = '';
  
  // Refresh displays
  populateRoyaltyRecords();
  updateDashboardMetrics();
  
  // Log the action
  logAuditEvent('Create Record', AppState.currentUser.username, `Royalty Record #${newRecord.id}`, 'Success', `Created new royalty record for ${entity}`);
  
  showNotification('Royalty record saved successfully', 'success');
}

/**
 * Initialize profile management
 */
function initializeProfileManagement() {
  console.log('Profile management initialized');
}

/**
 * Initialize reporting charts
 */
function initializeReportingCharts() {
  console.log('Initializing reporting charts...');
}

/**
 * Utility functions
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-SZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-SZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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
  
  AppState.auditLog.unshift(auditEntry);
  
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
// Audit Dashboard functionality
const AuditDashboard = {
  discrepancies: [
    {
      id: 1,
      entity: 'Kwalini Quarry',
      mineral: 'Gravel',
      declared: 1200,
      verified: 1150,
      variance: -50,
      outstanding: 125.00,
      severity: 'medium',
      date: '2024-02-15',
      status: 'Open'
    },
    {
      id: 2,
      entity: 'Maloma Colliery',
      mineral: 'Coal',
      declared: 850,
      verified: 920,
      variance: 70,
      outstanding: 350.00,
      severity: 'high',
      date: '2024-02-10',
      status: 'Under Review'
    },
    {
      id: 3,
      entity: 'Mbabane Quarry',
      mineral: 'Quarried Stone',
      declared: 2100,
      verified: 2080,
      variance: -20,
      outstanding: 40.00,
      severity: 'low',
      date: '2024-02-12',
      status: 'Open'
    },
    {
      id: 4,
      entity: 'Ngwenya Mine',
      mineral: 'Iron Ore',
      declared: 1800,
      verified: 1750,
      variance: -50,
      outstanding: 250.00,
      severity: 'critical',
      date: '2024-02-08',
      status: 'Escalated'
    }
  ],

  currentPage: 1,
  itemsPerPage: 10,
  filteredDiscrepancies: [],
  selectedDiscrepancies: new Set(),

  init() {
    this.filteredDiscrepancies = [...this.discrepancies];
    this.setupEventListeners();
    this.updateMetrics();
    this.renderDiscrepanciesTable();
    this.renderRecentActivities();
  },

  setupEventListeners() {
    // Filter controls
    const applyFiltersBtn = document.getElementById('apply-audit-filters');
    const clearFiltersBtn = document.getElementById('clear-audit-filters');
    
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => this.applyFilters());
    }
    
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearFilters());
    }

    // Export and view buttons
    const exportBtn = document.getElementById('export-audit-report');
    const viewFullLogBtn = document.getElementById('view-full-audit-log');
    const viewAllActivitiesBtn = document.getElementById('view-all-audit-activities');
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportAuditReport());
    }
    
    if (viewFullLogBtn) {
      viewFullLogBtn.addEventListener('click', () => this.viewFullAuditLog());
    }
    
    if (viewAllActivitiesBtn) {
      viewAllActivitiesBtn.addEventListener('click', () => this.viewAllActivities());
    }

    // Bulk actions
    const selectAllCheckbox = document.getElementById('select-all-discrepancies');
    const resolveSelectedBtn = document.getElementById('resolve-selected-discrepancies');
    
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        this.toggleSelectAll(e.target.checked);
      });
    }
    
    if (resolveSelectedBtn) {
      resolveSelectedBtn.addEventListener('click', () => this.resolveSelectedDiscrepancies());
    }

    // Pagination
    const prevBtn = document.getElementById('discrepancies-prev');
    const nextBtn = document.getElementById('discrepancies-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousPage());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextPage());
    }
  },

  updateMetrics() {
    // Update active discrepancies count
    const activeCount = this.discrepancies.filter(d => d.status !== 'Resolved').length;
    this.updateElement('active-discrepancies-count', activeCount);

    // Calculate outstanding amount
    const outstandingTotal = this.discrepancies
      .filter(d => d.status !== 'Resolved')
      .reduce((sum, d) => sum + d.outstanding, 0);
    this.updateElement('outstanding-amount', `E ${outstandingTotal.toFixed(2)}`);

    // Recent audit activities (last 24 hours)
    const recentActivities = AppState.auditLog.filter(log => {
      const logDate = new Date(log.timestamp);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return logDate > yesterday;
    }).length;
    this.updateElement('recent-audit-activities', recentActivities);

    // Calculate compliance rate
    const totalDiscrepancies = this.discrepancies.length;
    const resolvedDiscrepancies = this.discrepancies.filter(d => d.status === 'Resolved').length;
    const complianceRate = totalDiscrepancies > 0 ? ((resolvedDiscrepancies / totalDiscrepancies) * 100).toFixed(1) : 100;
    this.updateElement('audit-compliance-rate', `${complianceRate}%`);
    
    // Update progress bar
    const progressBar = document.getElementById('audit-compliance-progress');
    if (progressBar) {
      progressBar.style.width = `${complianceRate}%`;
    }
  },

  updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  },

  applyFilters() {
    const entityFilter = document.getElementById('audit-filter-entity')?.value || '';
    const periodFilter = document.getElementById('audit-filter-period')?.value || '';
    const severityFilter = document.getElementById('audit-filter-severity')?.value || '';

    this.filteredDiscrepancies = this.discrepancies.filter(discrepancy => {
      // Entity filter
      if (entityFilter && !discrepancy.entity.toLowerCase().includes(entityFilter.toLowerCase())) {
        return false;
      }

      // Severity filter
      if (severityFilter && discrepancy.severity !== severityFilter) {
        return false;
      }

      // Period filter (simplified - you can enhance this)
      if (periodFilter && periodFilter !== 'custom') {
        const discrepancyDate = new Date(discrepancy.date);
        const today = new Date();
        
        switch (periodFilter) {
          case 'today':
            if (discrepancyDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (discrepancyDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (discrepancyDate < monthAgo) return false;
            break;
          case 'quarter':
            const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            if (discrepancyDate < quarterAgo) return false;
            break;
        }
      }

      return true;
    });

    this.currentPage = 1;
    this.renderDiscrepanciesTable();
    this.logAuditEvent('Applied audit dashboard filters', 'Filter Applied');
  },

  clearFilters() {
    // Reset filter dropdowns
    const entityFilter = document.getElementById('audit-filter-entity');
    const periodFilter = document.getElementById('audit-filter-period');
    const severityFilter = document.getElementById('audit-filter-severity');

    if (entityFilter) entityFilter.value = '';
    if (periodFilter) periodFilter.value = 'month';
    if (severityFilter) severityFilter.value = '';

    // Reset filtered data
    this.filteredDiscrepancies = [...this.discrepancies];
    this.currentPage = 1;
    this.renderDiscrepanciesTable();
    this.logAuditEvent('Cleared audit dashboard filters', 'Filter Cleared');
  },

  renderDiscrepanciesTable() {
    const tbody = document.getElementById('discrepancies-tbody');
    if (!tbody) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageDiscrepancies = this.filteredDiscrepancies.slice(startIndex, endIndex);

    if (pageDiscrepancies.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
            No discrepancies found matching your criteria.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pageDiscrepancies.map(discrepancy => this.createDiscrepancyRow(discrepancy)).join('');
    }

    this.updatePagination();
    this.updateBulkActionButtons();
  },

  createDiscrepancyRow(discrepancy) {
    const variancePercent = discrepancy.declared > 0 ? 
      ((discrepancy.variance / discrepancy.declared) * 100).toFixed(1) : 0;
    
    const severityClass = this.getSeverityClass(discrepancy.severity);
    const statusClass = this.getStatusClass(discrepancy.status);

    return `
      <tr>
        <td>
          <input type="checkbox" class="discrepancy-checkbox" value="${discrepancy.id}" 
                 ${this.selectedDiscrepancies.has(discrepancy.id) ? 'checked' : ''}>
        </td>
        <td><strong>${discrepancy.entity}</strong></td>
        <td>${discrepancy.mineral}</td>
        <td>${discrepancy.declared.toLocaleString()}</td>
        <td>${discrepancy.verified.toLocaleString()}</td>
        <td>
          <span class="${discrepancy.variance >= 0 ? 'text-success' : 'text-danger'}">
            ${discrepancy.variance >= 0 ? '+' : ''}${discrepancy.variance} (${variancePercent}%)
          </span>
        </td>
        <td><strong>E ${discrepancy.outstanding.toFixed(2)}</strong></td>
        <td><span class="severity-badge ${severityClass}">${discrepancy.severity.toUpperCase()}</span></td>
        <td>${this.formatDate(discrepancy.date)}</td>
        <td><span class="status-badge ${statusClass}">${discrepancy.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary" onclick="AuditDashboard.viewDiscrepancyDetails(${discrepancy.id})" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-warning" onclick="AuditDashboard.editDiscrepancy(${discrepancy.id})" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            ${discrepancy.status !== 'Resolved' ? 
              `<button class="btn btn-sm btn-success" onclick="AuditDashboard.resolveDiscrepancy(${discrepancy.id})" title="Resolve">
                <i class="fas fa-check"></i>
              </button>` : ''}
          </div>
        </td>
      </tr>
    `;
  },

  getSeverityClass(severity) {
    const classes = {
      'low': 'severity-low',
      'medium': 'severity-medium', 
      'high': 'severity-high',
      'critical': 'severity-critical'
    };
    return classes[severity] || 'severity-medium';
  },

  getStatusClass(status) {
    const classes = {
      'Open': 'status-warning',
      'Under Review': 'status-info',
      'Resolved': 'status-success',
      'Escalated': 'status-danger'
    };
    return classes[status] || 'status-warning';
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  updatePagination() {
    const totalItems = this.filteredDiscrepancies.length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(startItem + this.itemsPerPage - 1, totalItems);

    // Update pagination info
    this.updateElement('discrepancies-start', startItem);
    this.updateElement('discrepancies-end', endItem);
    this.updateElement('discrepancies-total', totalItems);

    // Update pagination buttons
    const prevBtn = document.getElementById('discrepancies-prev');
    const nextBtn = document.getElementById('discrepancies-next');

    if (prevBtn) {
      prevBtn.disabled = this.currentPage <= 1;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= totalPages;
    }

    // Update page numbers (simplified)
    const pagesContainer = document.getElementById('discrepancies-pages');
    if (pagesContainer && totalPages > 1) {
      pagesContainer.innerHTML = `Page ${this.currentPage} of ${totalPages}`;
    }
  },

  toggleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.discrepancy-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = checked;
      const discrepancyId = parseInt(checkbox.value);
      if (checked) {
        this.selectedDiscrepancies.add(discrepancyId);
      } else {
        this.selectedDiscrepancies.delete(discrepancyId);
      }
    });
    this.updateBulkActionButtons();
  },

  updateBulkActionButtons() {
    const resolveBtn = document.getElementById('resolve-selected-discrepancies');
    const selectedCount = this.selectedDiscrepancies.size;

    if (resolveBtn) {
      resolveBtn.disabled = selectedCount === 0;
      resolveBtn.innerHTML = `<i class="fas fa-check"></i> Resolve Selected (${selectedCount})`;
    }
  },

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderDiscrepanciesTable();
    }
  },

  nextPage() {
    const totalPages = Math.ceil(this.filteredDiscrepancies.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderDiscrepanciesTable();
    }
  },

  renderRecentActivities() {
    const container = document.getElementById('recent-audit-activities-list');
    if (!container) return;

    // Get recent audit activities from the main audit log
    const recentActivities = AppState.auditLog
      .filter(log => {
        const logDate = new Date(log.timestamp);
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        return logDate > threeDaysAgo;
      })
      .slice(0, 10)
      .map(activity => this.createActivityItem(activity))
      .join('');

    if (recentActivities) {
      container.innerHTML = `<div class="activity-list">${recentActivities}</div>`;
    } else {
      container.innerHTML = `
        <div class="activity-item" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No recent audit activities to display.
        </div>
      `;
    }
  },

  createActivityItem(activity) {
    const timeAgo = this.getTimeAgo(activity.timestamp);
    const actionIcon = this.getActionIcon(activity.action);

    return `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="${actionIcon}"></i>
        </div>
        <div class="activity-content">
          <p><strong>${activity.action}</strong> by ${activity.user}</p>
          <small>${activity.details} • ${timeAgo}</small>
        </div>
      </div>
    `;
  },

  getActionIcon(action) {
    const icons = {
      'Login': 'fas fa-sign-in-alt text-success',
      'Logout': 'fas fa-sign-out-alt text-info',
      'Create User': 'fas fa-user-plus text-success',
      'Delete User': 'fas fa-user-minus text-danger',
      'Data Access': 'fas fa-database text-info',
      'Failed Login': 'fas fa-exclamation-triangle text-danger',
      'Filter Applied': 'fas fa-filter text-info',
      'Filter Cleared': 'fas fa-eraser text-secondary'
    };
    return icons[action] || 'fas fa-info-circle text-info';
  },

  getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  },

  // Action methods
  viewDiscrepancyDetails(discrepancyId) {
    const discrepancy = this.discrepancies.find(d => d.id === discrepancyId);
    if (discrepancy) {
      this.showDiscrepancyModal(discrepancy);
      this.logAuditEvent('Viewed discrepancy details', `Discrepancy ID: ${discrepancyId}`);
    }
  },

  editDiscrepancy(discrepancyId) {
    const discrepancy = this.discrepancies.find(d => d.id === discrepancyId);
    if (discrepancy) {
      this.showEditDiscrepancyModal(discrepancy);
      this.logAuditEvent('Opened discrepancy for editing', `Discrepancy ID: ${discrepancyId}`);
    }
  },

  resolveDiscrepancy(discrepancyId) {
    const discrepancy = this.discrepancies.find(d => d.id === discrepancyId);
    if (discrepancy && confirm(`Are you sure you want to resolve the discrepancy for ${discrepancy.entity}?`)) {
      discrepancy.status = 'Resolved';
      this.renderDiscrepanciesTable();
      this.updateMetrics();
      this.logAuditEvent('Resolved discrepancy', `${discrepancy.entity} - ${discrepancy.mineral}`);
      this.showNotification('Discrepancy resolved successfully', 'success');
    }
  },

  resolveSelectedDiscrepancies() {
    if (this.selectedDiscrepancies.size === 0) return;

    if (confirm(`Are you sure you want to resolve ${this.selectedDiscrepancies.size} selected discrepancies?`)) {
      let resolvedCount = 0;
      this.selectedDiscrepancies.forEach(discrepancyId => {
        const discrepancy = this.discrepancies.find(d => d.id === discrepancyId);
        if (discrepancy && discrepancy.status !== 'Resolved') {
          discrepancy.status = 'Resolved';
          resolvedCount++;
        }
      });

      this.selectedDiscrepancies.clear();
      this.renderDiscrepanciesTable();
      this.updateMetrics();
      this.logAuditEvent('Bulk resolved discrepancies', `Resolved ${resolvedCount} discrepancies`);
      this.showNotification(`${resolvedCount} discrepancies resolved successfully`, 'success');
    }
  },

  exportAuditReport() {
    try {
      const reportData = this.filteredDiscrepancies.map(d => ({
        'Entity': d.entity,
        'Mineral': d.mineral,
        'Declared (m³)': d.declared,
        'Verified (m³)': d.verified,
        'Variance': d.variance,
        'Outstanding (E)': d.outstanding,
        'Severity': d.severity,
        'Date': d.date,
        'Status': d.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Report');
      
      const fileName = `audit_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      this.logAuditEvent('Exported audit report', `File: ${fileName}`);
      this.showNotification('Audit report exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      this.showNotification('Failed to export audit report', 'error');
    }
  },

  viewFullAuditLog() {
    // Navigate to user management section where the full audit log is located
    App.showSection('user-management');
    // Scroll to audit log section
    setTimeout(() => {
      const auditLogSection = document.querySelector('#user-management .security-audit-log');
      if (auditLogSection) {
        auditLogSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
    this.logAuditEvent('Viewed full audit log', 'Navigated from audit dashboard');
  },

  viewAllActivities() {
    // This could open a modal or navigate to a dedicated activities page
    this.showAllActivitiesModal();
    this.logAuditEvent('Viewed all audit activities', 'From audit dashboard');
  },

  // Utility methods
  showDiscrepancyModal(discrepancy) {
    // Implementation for showing discrepancy details modal
    console.log('Show discrepancy modal for:', discrepancy);
  },

  showEditDiscrepancyModal(discrepancy) {
    // Implementation for showing edit discrepancy modal
    console.log('Show edit discrepancy modal for:', discrepancy);
  },

  showAllActivitiesModal() {
    // Implementation for showing all activities modal
    console.log('Show all activities modal');
  },

  showNotification(message, type = 'info') {
    // Use existing notification system
    if (typeof App !== 'undefined' && App.showNotification) {
      App.showNotification(message, type);
    } else {
      alert(message);
    }
  },

  logAuditEvent(action, details) {
    // Use existing audit logging system
    if (typeof logAuditEvent === 'function') {
      logAuditEvent(action, details);
    }
  }
};
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
 * Add event delegation for dynamically created checkboxes
 */
document.addEventListener('change', function(e) {
  if (e.target.classList.contains('discrepancy-checkbox')) {
    const discrepancyId = parseInt(e.target.value);
    if (e.target.checked) {
      AuditDashboard.selectedDiscrepancies.add(discrepancyId);
    } else {
      AuditDashboard.selectedDiscrepancies.delete(discrepancyId);
    }
    AuditDashboard.updateBulkActionButtons();
  }
});

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