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
  contracts: [],
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
  initializePeriodSelectors();
  
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
  
  // Initialize all UI components
  initializeUserManagement();
  initializeNavigation();
  initializeChartControls();
  initializePeriodSelectors();
  initializeContractManagement();
  initializeReporting();
  
  // Populate all tables with data
  populateUserAccounts();
  populateRoyaltyRecords();
  populateContractTable();
  populateAuditLog();
  
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
  console.log('Loading sample data...');
  
  // Initialize all sample data
  initializeSampleRoyaltyRecords();
  initializeSampleUsers();
  initializeSampleContracts();
  initializeSampleAuditLog();
  
  console.log('Sample data loaded successfully');
  console.log(`Loaded ${AppState.royaltyRecords.length} royalty records`);
  console.log(`Loaded ${AppState.users.length} users`);
  console.log(`Loaded ${AppState.contracts.length} contracts`);
  console.log(`Loaded ${AppState.auditLog.length} audit log entries`);
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
  // Initialize user form validation
  const userForm = document.getElementById('user-form');
  if (userForm) {
    userForm.addEventListener('submit', handleUserFormSubmit);
  }

  // Add user button
  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', showAddUserModal);
  }

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

  // Initialize table actions
  initializeUserTableActions();
  
  // Populate initial data
  populateUserAccounts();
}

/**
 * Show add user modal
 */
function showAddUserModal() {
  const modal = document.getElementById('user-modal');
  const modalTitle = document.getElementById('user-modal-title');
  const userForm = document.getElementById('user-form');
  
  if (modal && modalTitle && userForm) {
    modalTitle.textContent = 'Add New User';
    userForm.reset();
    userForm.removeAttribute('data-user-id');
    modal.style.display = 'block';
  }
}

/**
 * Handle user form submission
 */
function handleUserFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const userData = {
    username: formData.get('username'),
    email: formData.get('email'),
    role: formData.get('role'),
    department: formData.get('department'),
    status: formData.get('status') || 'Active'
  };

  // Validation
  if (!userData.username || !userData.email || !userData.role) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  const userId = e.target.getAttribute('data-user-id');
  
  if (userId) {
    // Update existing user
    const userIndex = AppState.users.findIndex(u => u.id === parseInt(userId));
    if (userIndex !== -1) {
      AppState.users[userIndex] = { ...AppState.users[userIndex], ...userData };
      showNotification('User updated successfully', 'success');
    }
  } else {
    // Add new user
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };
    AppState.users.push(newUser);
    showNotification('User added successfully', 'success');
  }

  // Close modal and refresh table
  closeUserModal();
  populateUserAccounts();
}

/**
 * Initialize user table actions
 */
function initializeUserTableActions() {
  const userTable = document.getElementById('users-table');
  if (!userTable) return;

  userTable.addEventListener('click', (e) => {
    const target = e.target;
    const row = target.closest('tr');
    
    if (target.classList.contains('edit-user')) {
      const userId = target.getAttribute('data-user-id');
      editUser(userId);
    } else if (target.classList.contains('delete-user')) {
      const userId = target.getAttribute('data-user-id');
      deleteUser(userId);
    } else if (target.classList.contains('toggle-user-status')) {
      const userId = target.getAttribute('data-user-id');
      toggleUserStatus(userId);
    }
  });

  // Select all checkbox
  const selectAllCheckbox = document.getElementById('select-all-users');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('#users-table tbody input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }
}

/**
 * Edit user
 */
function editUser(userId) {
  const user = AppState.users.find(u => u.id === parseInt(userId));
  if (!user) return;

  const modal = document.getElementById('user-modal');
  const modalTitle = document.getElementById('user-modal-title');
  const userForm = document.getElementById('user-form');
  
  if (modal && modalTitle && userForm) {
    modalTitle.textContent = 'Edit User';
    userForm.setAttribute('data-user-id', userId);
    
    // Populate form fields
    userForm.querySelector('[name="username"]').value = user.username;
    userForm.querySelector('[name="email"]').value = user.email;
    userForm.querySelector('[name="role"]').value = user.role;
    userForm.querySelector('[name="department"]').value = user.department;
    userForm.querySelector('[name="status"]').value = user.status;
    
    modal.style.display = 'block';
  }
}

/**
 * Delete user
 */
function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    const userIndex = AppState.users.findIndex(u => u.id === parseInt(userId));
    if (userIndex !== -1) {
      AppState.users.splice(userIndex, 1);
      populateUserAccounts();
      showNotification('User deleted successfully', 'success');
    }
  }
}

/**
 * Toggle user status
 */
function toggleUserStatus(userId) {
  const user = AppState.users.find(u => u.id === parseInt(userId));
  if (user) {
    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    populateUserAccounts();
    showNotification(`User ${user.status.toLowerCase()}`, 'success');
  }
}

/**
 * Close user modal
 */
function closeUserModal() {
  const modal = document.getElementById('user-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Apply user filters
 */
function applyUserFilters() {
  const roleFilter = document.getElementById('role-filter')?.value;
  const departmentFilter = document.getElementById('department-filter')?.value;
  const statusFilter = document.getElementById('status-filter')?.value;
  const searchTerm = document.getElementById('user-search')?.value.toLowerCase();

  let filteredUsers = AppState.users;

  if (roleFilter) {
    filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
  }

  if (departmentFilter) {
    filteredUsers = filteredUsers.filter(user => user.department === departmentFilter);
  }

  if (statusFilter) {
    filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
  }

  if (searchTerm) {
    filteredUsers = filteredUsers.filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  populateUserTable(filteredUsers);
}

/**
 * Clear user filters
 */
function clearUserFilters() {
  document.getElementById('role-filter').value = '';
  document.getElementById('department-filter').value = '';
  document.getElementById('status-filter').value = '';
  document.getElementById('user-search').value = '';
  populateUserAccounts();
}

/**
 * Handle bulk delete
 */
function handleBulkDelete() {
  const selectedCheckboxes = document.querySelectorAll('#users-table tbody input[type="checkbox"]:checked');
  const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.getAttribute('data-user-id')));

  if (selectedIds.length === 0) {
    showNotification('Please select users to delete', 'warning');
    return;
  }

  if (confirm(`Are you sure you want to delete ${selectedIds.length} user(s)?`)) {
    AppState.users = AppState.users.filter(user => !selectedIds.includes(user.id));
    populateUserAccounts();
    showNotification(`${selectedIds.length} user(s) deleted successfully`, 'success');
  }
}

/**
 * Populate user accounts table
 */
function populateUserAccounts() {
  // Ensure we have sample data if users array is empty
  if (AppState.users.length === 0) {
    initializeSampleUsers();
  }
  
  populateUserTable(AppState.users);
}

/**
 * Populate user table with given data
 */
function populateUserTable(users) {
  const tbody = document.getElementById('users-table-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No users found</td></tr>';
    return;
  }
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" data-user-id="${user.id}"></td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
      <td>${user.department}</td>
      <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
      <td>${user.createdAt}</td>
      <td>${user.lastLogin}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-secondary edit-user" data-user-id="${user.id}" title="Edit user">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-info toggle-user-status" data-user-id="${user.id}" title="Toggle status">
            <i class="fas fa-toggle-${user.status === 'Active' ? 'on' : 'off'}"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-user" data-user-id="${user.id}" title="Delete user">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Initialize sample users data
 */
function initializeSampleUsers() {
  AppState.users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@eswatini.gov.sz',
      role: 'Administrator',
      department: 'IT Administration',
      status: 'Active',
      createdAt: '2024-01-15',
      lastLogin: '2024-01-20'
    },
    {
      id: 2,
      username: 'john.mamba',
      email: 'john.mamba@mining.gov.sz',
      role: 'Manager',
      department: 'Mining Operations',
      status: 'Active',
      createdAt: '2024-01-10',
      lastLogin: '2024-01-19'
    },
    {
      id: 3,
      username: 'sarah.dlamini',
      email: 'sarah.dlamini@finance.gov.sz',
      role: 'Analyst',
      department: 'Finance',
      status: 'Active',
      createdAt: '2024-01-08',
      lastLogin: '2024-01-18'
    },
    {
      id: 4,
      username: 'peter.nkomo',
      email: 'peter.nkomo@audit.gov.sz',
      role: 'Auditor',
      department: 'Audit',
      status: 'Inactive',
      createdAt: '2024-01-05',
      lastLogin: '2024-01-12'
    },
    {
      id: 5,
      username: 'mary.simelane',
      email: 'mary.simelane@legal.gov.sz',
      role: 'Legal Officer',
      department: 'Legal Affairs',
      status: 'Active',
      createdAt: '2024-01-03',
      lastLogin: '2024-01-17'
    }
  ];
}

/**
 * Initialize sample royalty records
 */
function initializeSampleRoyaltyRecords() {
  if (AppState.royaltyRecords.length === 0) {
    AppState.royaltyRecords = [
      {
        id: 1,
        entity: 'Kwalini Quarry',
        mineral: 'Stone Aggregate',
        volume: 15000,
        tariff: 12.50,
        amount: 187500,
        date: '2024-01-15',
        status: 'Paid'
      },
      {
        id: 2,
        entity: 'Maloma Colliery',
        mineral: 'Coal',
        volume: 8500,
        tariff: 25.00,
        amount: 212500,
        date: '2024-01-20',
        status: 'Pending'
      },
      {
        id: 3,
        entity: 'Ngwenya Mine',
        mineral: 'Iron Ore',
        volume: 12000,
        tariff: 35.00,
        amount: 420000,
        date: '2024-01-18',
        status: 'Paid'
      },
      {
        id: 4,
        entity: 'Mbabane Quarry',
        mineral: 'Stone Aggregate',
        volume: 9000,
        tariff: 12.50,
        amount: 112500,
        date: '2024-01-22',
        status: 'Overdue'
      },
      {
        id: 5,
        entity: 'Sidvokodvo Quarry',
        mineral: 'Sand',
        volume: 7500,
        tariff: 8.00,
        amount: 60000,
        date: '2024-01-25',
        status: 'Paid'
      }
    ];
  }
}

/**
 * Initialize sample contracts
 */
function initializeSampleContracts() {
  if (AppState.contracts.length === 0) {
    AppState.contracts = [
      {
        id: 1,
        entity: 'Kwalini Quarry',
        rate: 12.50,
        startDate: '2024-01-01',
        status: 'Active'
      },
      {
        id: 2,
        entity: 'Maloma Colliery',
        rate: 25.00,
        startDate: '2024-01-01',
        status: 'Active'
      },
      {
        id: 3,
        entity: 'Ngwenya Mine',
        rate: 35.00,
        startDate: '2024-01-01',
        status: 'Active'
      },
      {
        id: 4,
        entity: 'Mbabane Quarry',
        rate: 12.50,
        startDate: '2024-01-01',
        status: 'Under Review'
      }
    ];
  }
}

/**
 * Initialize sample audit log
 */
function initializeSampleAuditLog() {
  if (AppState.auditLog.length === 0) {
    AppState.auditLog = [
      {
        id: 1,
        timestamp: '2024-01-20 09:15:23',
        user: 'admin',
        action: 'Login',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome 121.0.0.0',
        status: 'Success',
        details: 'Standard login'
      },
      {
        id: 2,
        timestamp: '2024-01-20 09:20:45',
        user: 'admin',
        action: 'Data Access',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome 121.0.0.0',
        status: 'Success',
        details: 'Accessed royalty records'
      },
      {
        id: 3,
        timestamp: '2024-01-19 14:30:12',
        user: 'john.mamba',
        action: 'Create Record',
        ipAddress: '192.168.1.105',
        userAgent: 'Firefox 123.0',
        status: 'Success',
        details: 'Created new royalty record for Kwalini Quarry'
      },
      {
        id: 4,
        timestamp: '2024-01-19 11:45:33',
        user: 'unknown',
        action: 'Failed Login',
        ipAddress: '192.168.1.200',
        userAgent: 'Safari 17.0',
        status: 'Failed',
        details: 'Invalid credentials - 3 attempts'
      },
      {
        id: 5,
        timestamp: '2024-01-18 16:15:55',
        user: 'sarah.dlamini',
        action: 'Export Data',
        ipAddress: '192.168.1.110',
        userAgent: 'Chrome 121.0.0.0',
        status: 'Success',
        details: 'Exported user management report'
      }
    ];
  }
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

// Window-scoped functions for user management
window.editUser = function(userId) {
  const user = AppState.users.find(u => u.id === parseInt(userId));
  if (!user) return;

  const modal = document.getElementById('user-modal');
  const modalTitle = document.getElementById('user-modal-title');
  const userForm = document.getElementById('user-form');
  
  if (modal && modalTitle && userForm) {
    modalTitle.textContent = 'Edit User';
    userForm.setAttribute('data-user-id', userId);
    
    // Populate form fields
    userForm.querySelector('[name="username"]').value = user.username;
    userForm.querySelector('[name="email"]').value = user.email;
    userForm.querySelector('[name="role"]').value = user.role;
    userForm.querySelector('[name="department"]').value = user.department;
    userForm.querySelector('[name="status"]').value = user.status;
    
    modal.style.display = 'block';
  }
};

window.deleteUser = function(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    const userIndex = AppState.users.findIndex(u => u.id === parseInt(userId));
    if (userIndex !== -1) {
      AppState.users.splice(userIndex, 1);
      populateUserAccounts();
      showNotification('User deleted successfully', 'success');
    }
  }
};

window.resetPassword = function(userId) {
  console.log('Reset password for user:', userId);
  showNotification('Password reset functionality would be implemented here', 'info');
};

window.closeUserModal = function() {
  const modal = document.getElementById('user-modal');
  if (modal) {
    modal.style.display = 'none';
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

/**
 * Initialize Period Selectors
 */
function initializePeriodSelectors() {
  // Period selector changes
  const periodSelectors = document.querySelectorAll('.metric-period, .chart-period');
  periodSelectors.forEach(selector => {
    selector.addEventListener('change', function() {
      const chartContainer = this.closest('.metric-card, .analytics-chart');
      if (chartContainer) {
        updateChartData(chartContainer, this.value);
      }
    });
  });
}

/**
 * Initialize Contract Management
 */
function initializeContractManagement() {
  const saveContractBtns = document.querySelectorAll('button');
  saveContractBtns.forEach(btn => {
    if (btn.textContent.includes('Save Contract')) {
      btn.addEventListener('click', handleSaveContract);
    }
  });
  
  const addContractBtns = document.querySelectorAll('button');
  addContractBtns.forEach(btn => {
    if (btn.textContent.includes('Add Contract')) {
      btn.addEventListener('click', showAddContractForm);
    }
  });
}

/**
 * Handle Save Contract
 */
function handleSaveContract(event) {
  event.preventDefault();
  
  const entity = document.getElementById('contract-entity')?.value;
  const rate = document.getElementById('royalty-rate')?.value;
  const startDate = document.getElementById('start-date')?.value;
  
  if (!entity || !rate || !startDate) {
    showNotification('Please fill in all contract fields', 'error');
    return;
  }
  
  const newContract = {
    id: Date.now(),
    entity,
    rate: parseFloat(rate),
    startDate,
    status: 'Active'
  };
  
  // Add to contracts array (you'd need to add this to AppState)
  if (!AppState.contracts) AppState.contracts = [];
  AppState.contracts.push(newContract);
  
  showNotification('Contract saved successfully', 'success');
  
  // Reset form
  document.getElementById('contract-entity').value = '';
  document.getElementById('royalty-rate').value = '';
  document.getElementById('start-date').value = '';
  
  // Refresh contract table if it exists
  populateContractTable();
}

/**
 * Show Add Contract Form
 */
function showAddContractForm() {
  showSection('contract-management');
  // Scroll to form
  setTimeout(() => {
    const form = document.querySelector('#contract-management .user-form-container');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}

/**
 * Initialize Reporting
 */
function initializeReporting() {
  // Report generation buttons
  const generateBtns = document.querySelectorAll('.report-card button, button');
  generateBtns.forEach(btn => {
    if (btn.textContent.includes('Generate')) {
      btn.addEventListener('click', handleGenerateReport);
    }
  });
  
  // Export buttons
  const exportBtns = document.querySelectorAll('button');
  exportBtns.forEach(btn => {
    if (btn.textContent.includes('Export')) {
      btn.addEventListener('click', handleExportData);
    }
  });
  
  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', handleTabSwitch);
  });
}

/**
 * Handle Generate Report
 */
function handleGenerateReport(event) {
  const reportCard = event.target.closest('.report-card');
  let reportType = 'General Report';
  
  if (reportCard) {
    const titleElement = reportCard.querySelector('h5');
    if (titleElement) {
      reportType = titleElement.textContent;
    }
  }
  
  showNotification(`Generating ${reportType}...`, 'info');
  
  // Simulate report generation
  setTimeout(() => {
    showNotification(`${reportType} generated successfully`, 'success');
  }, 2000);
}

/**
 * Handle Export Data
 */
function handleExportData(event) {
  const section = event.target.closest('section');
  let dataType = 'data';
  
  if (section) {
    const title = section.querySelector('h1');
    if (title) {
      dataType = title.textContent;
    }
  }
  
  showNotification(`Exporting ${dataType}...`, 'info');
  
  // Simulate export
  setTimeout(() => {
    showNotification(`${dataType} exported successfully`, 'success');
  }, 1500);
}

/**
 * Handle Tab Switch
 */
function handleTabSwitch(event) {
  const targetTab = event.target.getAttribute('data-tab');
  if (!targetTab) return;
  
  // Remove active class from all tabs and content
  const tabContainer = event.target.closest('.user-form-container');
  if (tabContainer) {
    tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    tabContainer.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    const targetContent = document.querySelector(targetTab);
    if (targetContent) {
      targetContent.classList.add('active');
    }
  }
}

/**
 * Populate Contract Table
 */
function populateContractTable() {
  const tbody = document.querySelector('#contract-management table tbody');
  if (!tbody || !AppState.contracts) return;
  
  tbody.innerHTML = '';
  
  AppState.contracts.forEach(contract => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contract.entity}</td>
      <td>E${contract.rate.toFixed(2)}</td>
      <td>${formatDate(contract.startDate)}</td>
      <td>
        <button class="btn btn-sm btn-info" title="View contract document">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
      </td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-primary" onclick="editContract(${contract.id})" title="Edit contract">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="downloadContract(${contract.id})" title="Download contract">
            <i class="fas fa-download"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="terminateContract(${contract.id})" title="Terminate contract">
            <i class="fas fa-ban"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Update Chart Data
 */
function updateChartData(chartContainer, period) {
  const chartTitle = chartContainer.querySelector('h3');
  const chartBody = chartContainer.querySelector('.card-body p, .metric-value');
  
  if (chartTitle && chartBody) {
    showNotification(`Updating ${chartTitle.textContent} for ${period}...`, 'info');
    
    // Simulate data update
    setTimeout(() => {
      // You would update with real data here
      showNotification('Chart data updated', 'success');
    }, 1000);
  }
}

/**
 * Initialize Profile Management
 */
function initializeProfileManagement() {
  const profileBtns = document.querySelectorAll('#profile button');
  
  profileBtns.forEach(btn => {
    if (btn.textContent.includes('Save Changes') || btn.textContent.includes('Update Profile')) {
      btn.addEventListener('click', handleSaveProfile);
    }
  });
}

/**
 * Handle Save Profile
 */
function handleSaveProfile(event) {
  event.preventDefault();
  
  const username = document.getElementById('profile-username')?.value;
  const email = document.getElementById('profile-email')?.value;
  const department = document.getElementById('profile-department')?.value;
  
  if (!username || !email || !department) {
    showNotification('Please fill in all profile fields', 'error');
    return;
  }
  
  // Update current user profile
  if (AppState.currentUser) {
    AppState.currentUser.username = username;
    AppState.currentUser.email = email;
    AppState.currentUser.department = department;
  }
  
  showNotification('Profile updated successfully', 'success');
  
  // Log the action
  logAuditEvent('Update Profile', username, 'Profile Settings', 'Success', 'Updated user profile information');
}

/**
 * Handle Logout
 */
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    // Log the action
    if (AppState.currentUser) {
      logAuditEvent('Logout', AppState.currentUser.username, 'System', 'Success', 'User logged out');
    }
    
    // Clear current user
    AppState.currentUser = null;
    
    // Hide app and show login
    hideAppContainer();
    showLoginSection();
    
    showNotification('Logged out successfully', 'success');
  }
}

/**
 * Hide App Container
 */
function hideAppContainer() {
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.style.display = 'none';
  }
}

// Contract management functions for window scope
window.editContract = function(contractId) {
  console.log('Edit contract:', contractId);
  showNotification('Edit contract functionality would be implemented here', 'info');
};

window.downloadContract = function(contractId) {
  console.log('Download contract:', contractId);
  showNotification('Contract downloaded successfully', 'success');
};

window.terminateContract = function(contractId) {
  if (confirm('Are you sure you want to terminate this contract?')) {
    AppState.contracts = AppState.contracts.filter(contract => contract.id !== contractId);
    populateContractTable();
    showNotification('Contract terminated successfully', 'success');
  }
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