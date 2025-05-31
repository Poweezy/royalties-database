// @ts-nocheck
import { FileManager } from './modules/FileManager.js';
import { NotificationManager } from './modules/NotificationManager.js';
import { IconManager } from './modules/IconManager.js';

class RoyaltiesManager {
  constructor() {
    this.modules = {};
    this.charts = new Map();
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      await this.waitForDOM();
      this.initializeElements();
      this.initializeModules();
      this.setupEventListeners();
      this.setupErrorHandling();
      this.setupAutoSave();
      this.setupGlobalSearch();
      await this.simulateLoading();
      this.showLoginSection();
      this.startRealTimeUpdates();
    } catch (error) {
      console.error('Application initialization failed:', error);
      this.showLoginSection();
    }
  }

  waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  initializeElements() {
    this.sidebar = document.getElementById('sidebar');
    this.loginSection = document.getElementById('login-section');
    this.appContainer = document.getElementById('app-container');
    this.loadingScreen = document.getElementById('loading-screen');
    
    // Ensure critical elements exist
    if (!this.loginSection) {
      console.error('Login section not found! Check HTML element with id="login-section"');
    }
    if (!this.loadingScreen) {
      console.error('Loading screen not found! Check HTML element with id="loading-screen"');
    }
    if (!this.appContainer) {
      console.error('App container not found! Check HTML element with id="app-container"');
    }
  }

  initializeModules() {
    try {
      this.modules.fileManager = new FileManager();
      this.modules.notificationManager = new NotificationManager();
      this.modules.iconManager = new IconManager();
      this.setupModuleCommunication();
    } catch (error) {
      console.error('Module initialization failed:', error);
    }
  }

  setupModuleCommunication() {
    window.addEventListener('sectionChanged', (event) => {
      const { sectionId } = event.detail;
      
      if (sectionId === 'dashboard') {
        this.initializeCharts();
        this.populateRoyaltyRecords();
      }
      
      if (sectionId === 'user-management') {
        this.populateUserAccounts();
        this.populateAuditLog();
      }
      
      // Add audit dashboard support
      if (sectionId === 'audit' || sectionId === 'audit-dashboard') {
        this.populateAuditDashboard();
      }
    });
  }

  setupEventListeners() {
    document.addEventListener('submit', (event) => this.handleGlobalSubmit(event));
    document.addEventListener('click', (event) => this.handleGlobalClick(event));
  }

  handleGlobalClick(event) {
    const { target } = event;
    
    // Handle chart type buttons FIRST - this is critical
    if (target.matches('.chart-btn')) {
      console.log('Chart button detected, calling handler');
      this.handleChartTypeChange(event);
      return;
    }
    
    if (target.closest('.sidebar nav a')) {
      this.handleNavigationClick(event);
    }
    
    // Handle admin button click
    if (target.matches('.btn') && target.textContent.trim() === 'Admin') {
      this.handleAdminClick(event);
    }
    
    // Handle notifications count button
    if (target.matches('#notifications-count') || target.closest('#notifications-count')) {
      this.handleNotificationsClick(event);
    }
    
    // Handle tab buttons
    if (target.matches('.tab-btn')) {
      this.handleTabClick(event);
    }
    
    // Handle form buttons
    if (target.matches('#save-royalty-btn')) {
      this.handleSaveRoyalty(event);
    }
    
    // Handle Apply Filters button
    if (target.matches('.btn') && (
        target.textContent.trim() === 'Apply Filters' ||
        target.id === 'apply-filters-btn' ||
        target.classList.contains('filter-btn')
    )) {
      this.handleApplyFilters(event);
    }
    
    // Handle Clear Filters button
    if (target.matches('.btn') && (
        target.textContent.trim() === 'Clear Filters' ||
        target.id === 'clear-filters-btn'
    )) {
      this.handleClearFilters(event);
    }
    
    // Handle logout confirmation
    if (target.matches('#confirm-logout-btn')) {
      this.handleLogout(event);
    }
    
    // Enhanced View Audit Log button handling
    if (target.matches('.btn') && (
        target.textContent.trim() === 'View Audit Log' ||
        target.textContent.trim().includes('Audit') ||
        target.id === 'view-audit-btn' ||
        target.classList.contains('audit-btn')
    )) {
      this.handleViewAuditLog(event);
    }
    
    // Handle Export Report buttons
    if (target.matches('.btn') && target.textContent.trim() === 'Export Report') {
      this.handleExportReport(event);
    }
    
    // Handle Add User button
    if (target.matches('.btn') && target.textContent.trim() === 'Add User') {
      this.handleAddUser(event);
    }
    
    // Handle Create User and Save User buttons
    if (target.matches('.btn') && (
        target.textContent.trim() === 'Create User' ||
        target.textContent.trim() === 'Save User'
    )) {
      this.handleSaveUser(event);
    }
    
    // Handle table action buttons
    if (target.matches('.btn-sm')) {
      this.handleTableAction(event);
    }
    
    // Debug logging for unhandled clicks
    if (target.matches('.btn')) {
      console.log('Button clicked:', target.textContent.trim(), target);
    }
  }

  handleAdminClick(event) {
    event.preventDefault();
    
    // Show admin panel or redirect to user management
    this.showSection('user-management');
    this.closeMobileSidebar();
    
    // Show notification
    this.modules.notificationManager.info('Accessing Admin Panel - User Management');
  }

  handleNotificationsClick(event) {
    event.preventDefault();
    
    // Navigate to notifications section
    this.showSection('notifications');
    this.closeMobileSidebar();
    
    // Show notification
    this.modules.notificationManager.info('Viewing system notifications');
  }

  handleTabClick(event) {
    event.preventDefault();
    const tabButton = event.target;
    const targetTab = tabButton.getAttribute('data-tab');
    
    if (targetTab) {
      // Remove active class from all tab buttons in the same container
      const tabContainer = tabButton.closest('.report-tabs, .regulatory-tabs');
      if (tabContainer) {
        tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        tabButton.classList.add('active');
        
        // Hide all tab content in the same section
        const section = tabButton.closest('section, .user-form-container');
        if (section) {
          section.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
          });
          
          // Show target tab content
          const targetContent = section.querySelector(targetTab);
          if (targetContent) {
            targetContent.classList.add('active');
          }
        }
      }
    }
  }

  handleNavigationClick(event) {
    event.preventDefault();
    const link = event.target.closest('a');
    const href = link.getAttribute('href');
    
    if (href && href.startsWith('#')) {
      const sectionId = href.substring(1);
      this.showSection(sectionId);
      this.closeMobileSidebar();
    }
  }

  handleGlobalSubmit(event) {
    if (event.target.matches('.login-form')) {
      this.handleLogin(event);
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    
    try {
      await this.authenticate();
      
      this.loginSection.style.display = 'none';
      this.appContainer.style.display = 'flex';
      this.sidebar.classList.add('active');
      
      this.initializeCharts();
      this.modules.notificationManager.success('Welcome to Royalties Manager');
      this.isInitialized = true;
      
    } catch (error) {
      this.modules.notificationManager.error('Login failed. Please try again.');
    }
  }

  async authenticate() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
      section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
      this.scrollToTop();
      this.updateActiveNavigation(sectionId);
      
      window.dispatchEvent(new CustomEvent('sectionChanged', { 
        detail: { sectionId } 
      }));
    }
  }

  updateActiveNavigation(sectionId) {
    document.querySelectorAll('.sidebar nav a').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.sidebar nav a[href="#${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  scrollToTop() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  closeMobileSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebar.classList.remove('active');
    }
  }

  async initializeCharts() {
    try {
      await this.createRevenueChart();
      await this.createProductionChart();
    } catch (error) {
      console.warn('Chart initialization failed:', error);
    }
  }

  handleChartTypeChange(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.target;
    const chartType = button.getAttribute('data-chart-type');
    const chartId = button.getAttribute('data-chart-id');
    
    console.log('Chart button clicked:', { chartType, chartId, button });
    
    if (!chartType || !chartId) {
      console.warn('Chart type or chart ID not specified');
      return;
    }
    
    // Update active button state
    const chartControls = button.closest('.chart-controls');
    if (chartControls) {
      chartControls.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      console.log('Updated active button state');
    }
    
    // Update chart
    this.updateChartType(chartId, chartType);
    
    if (this.modules.notificationManager) {
      this.modules.notificationManager.success(`Chart updated to ${chartType} view`);
    }
  }

  updateChartType(chartId, newType) {
    console.log(`Updating chart ${chartId} to ${newType} type`);
    
    const existingChart = this.charts.get(chartId);
    if (!existingChart) {
      console.warn(`Chart with ID ${chartId} not found in charts map`);
      console.log('Available charts:', Array.from(this.charts.keys()));
      return;
    }
    
    // Get current chart data and canvas
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      console.warn(`Canvas element with ID ${chartId} not found`);
      return;
    }
    
    // Store current data before destroying
    const currentData = {
      labels: [...existingChart.data.labels],
      datasets: existingChart.data.datasets.map(dataset => ({
        label: dataset.label,
        data: [...dataset.data]
      }))
    };
    
    console.log('Stored chart data:', currentData);
    
    // Destroy existing chart
    existingChart.destroy();
    this.charts.delete(chartId);
    console.log('Destroyed existing chart');
    
    // Create new chart with different type
    setTimeout(() => {
      console.log('Creating new chart...');
      this.createChartWithType(chartId, newType, currentData);
    }, 100);
  }

  createChartWithType(chartId, chartType, data) {
    console.log(`Creating ${chartType} chart for ${chartId}`);
    
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      console.error(`Canvas element with ID ${chartId} not found`);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    
    let chartConfig = {
      type: chartType === 'area' ? 'line' : chartType,
      data: { ...data },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: true, position: 'top' } 
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: function(value) { return `E ${value.toLocaleString()}`; } }
          },
          x: { grid: { display: false } }
        }
      }
    };
    
    // Configure dataset based on chart type
    chartConfig.data.datasets = chartConfig.data.datasets.map(dataset => {
      let config = { ...dataset };
      
      switch(chartType) {
        case 'area':
          config.fill = true;
          config.backgroundColor = 'rgba(26, 54, 93, 0.3)';
          config.borderColor = '#1a365d';
          config.tension = 0.4;
          console.log('Configured for area chart');
          break;
        case 'bar':
          config.fill = false;
          config.backgroundColor = '#1a365d';
          config.borderColor = '#1a365d';
          config.borderWidth = 1;
          console.log('Configured for bar chart');
          break;
        case 'line':
        default:
          config.fill = false;
          config.backgroundColor = 'transparent';
          config.borderColor = '#1a365d';
          config.tension = 0.4;
          console.log('Configured for line chart');
          break;
      }
      
      return config;
    });
    
    try {
      // Create new chart
      const newChart = new Chart(ctx, chartConfig);
      
      // Store the new chart reference
      this.charts.set(chartId, newChart);
      
      console.log(`Successfully created ${chartType} chart for ${chartId}`);
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  async createRevenueChart() {
    const canvas = document.getElementById('revenue-trends-chart');
    if (!canvas || typeof Chart === 'undefined') {
      console.warn('Canvas or Chart.js not available');
      return;
    }

    // Destroy existing chart if it exists
    const existingChart = this.charts.get('revenue-trends-chart');
    if (existingChart) {
      existingChart.destroy();
      this.charts.delete('revenue-trends-chart');
    }

    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue (E)',
        data: [500000, 600000, 750000, 700000, 800000, 900000]
      }]
    };

    // Use the new chart creation method
    this.createChartWithType('revenue-trends-chart', 'line', chartData);
    console.log('Initial revenue chart created');
  }

  async createProductionChart() {
    const canvas = document.getElementById('production-by-entity-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    // Destroy existing chart if it exists
    const existingChart = this.charts.get('production-by-entity-chart');
    if (existingChart) {
      existingChart.destroy();
      this.charts.delete('production-by-entity-chart');
    }

    const ctx = canvas.getContext('2d');
    
    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Kwalini Quarry', 'Mbabane Quarry', 'Sidvokodvo Quarry', 'Maloma Colliery', 'Ngwenya Mine', 'Malolotja Mine'],
        datasets: [{
          label: 'Production Volume (m³)',
          data: [45000, 38000, 42000, 55000, 28000, 32000],
          backgroundColor: ['#1a365d', '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom' }
        }
      }
    });

    // Store the chart reference
    this.charts.set('production-by-entity-chart', chart);
  }

  showLoginSection() {
    console.log('Showing login section...');
    
    // Hide loading screen
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'none';
    }
    
    // Show login section
    if (this.loginSection) {
      this.loginSection.style.display = 'flex';
      console.log('Login section displayed');
    } else {
      console.error('Cannot show login section - element not found');
    }
    
    // Hide app container
    if (this.appContainer) {
      this.appContainer.style.display = 'none';
    }
    
    // Initialize dashboard section for when user logs in
    this.showSection('dashboard');
  }

  getModule(name) {
    return this.modules[name];
  }

  isReady() {
    return this.isInitialized;
  }

  destroy() {
    // Destroy all charts before cleaning up modules
    this.charts.forEach(chart => {
      chart.destroy();
    });
    this.charts.clear();

    Object.values(this.modules).forEach(module => {
      if (typeof module.destroy === 'function') {
        module.destroy();
      }
    });
    this.modules = {};
    this.isInitialized = false;
  }

  handleSaveRoyalty(event) {
    event.preventDefault();
    
    const entity = document.getElementById('entity');
    const mineral = document.getElementById('mineral');
    const volume = document.getElementById('volume');
    const tariff = document.getElementById('tariff');
    const paymentDate = document.getElementById('payment-date');
    
    if (!entity || !mineral || !volume || !tariff || !paymentDate) {
      this.modules.notificationManager.error('Form elements not found');
      return;
    }
    
    if (!entity.value || !mineral.value || !volume.value || !tariff.value || !paymentDate.value) {
      this.modules.notificationManager.error('Please fill in all required fields');
      return;
    }
    
    const royalties = parseFloat(volume.value) * parseFloat(tariff.value);
    
    // Add to table
    this.addRoyaltyRecord({
      entity: entity.value,
      mineral: mineral.value,
      volume: volume.value,
      tariff: tariff.value,
      royalties: royalties.toFixed(2),
      date: paymentDate.value,
      status: 'Recorded'
    });
    
    // Clear form
    entity.value = '';
    mineral.value = '';
    volume.value = '';
    tariff.value = '';
    paymentDate.value = '';
    
    this.modules.notificationManager.success('Royalty record saved successfully');
  }

  addRoyaltyRecord(record) {
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) {
      console.warn('Royalty records table body not found');
      return;
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.entity}</td>
      <td>${record.mineral}</td>
      <td>${record.volume}</td>
      <td>E${record.tariff}</td>
      <td>E${record.royalties}</td>
      <td>${record.date}</td>
      <td><span class="status-badge compliant">${record.status}</span></td>
      <td>
        <button class="btn btn-primary btn-sm">Edit</button>
        <button class="btn btn-danger btn-sm">Delete</button>
      </td>
    `;
    
    tbody.appendChild(row);
  }

  // Initialize sample data when dashboard loads
  setupModuleCommunication() {
    window.addEventListener('sectionChanged', (event) => {
      const { sectionId } = event.detail;
      
      if (sectionId === 'dashboard') {
        this.initializeCharts();
        this.populateRoyaltyRecords();
      }
      
      if (sectionId === 'user-management') {
        this.populateUserAccounts();
        this.populateAuditLog();
      }
    });
  }

  populateRoyaltyRecords() {
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Sample royalty records
    const sampleRecords = [
      {
        entity: 'Kwalini Quarry',
        mineral: 'Granite',
        volume: '1500',
        tariff: '25.50',
        royalties: (1500 * 25.50).toFixed(2),
        date: '2024-02-01',
        status: 'Paid'
      },
      {
        entity: 'Mbabane Quarry',
        mineral: 'Sand',
        volume: '2000',
        tariff: '15.75',
        royalties: (2000 * 15.75).toFixed(2),
        date: '2024-01-28',
        status: 'Pending'
      },
      {
        entity: 'Ngwenya Mine',
        mineral: 'Iron Ore',
        volume: '800',
        tariff: '45.00',
        royalties: (800 * 45.00).toFixed(2),
        date: '2024-01-25',
        status: 'Paid'
      }
    ];
    
    sampleRecords.forEach(record => {
      this.addRoyaltyRecord(record);
    });
  }

  populateUserAccounts() {
    const tbody = document.querySelector('#user-management .data-table:first-of-type tbody');
    if (!tbody) {
      console.warn('User accounts table body not found');
      return;
    }
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Sample user accounts
    const sampleUsers = [
      {
        username: 'admin',
        email: 'admin@eswacaa.sz',
        role: 'Administrator',
        status: 'Active',
        lastLogin: '2024-02-10 14:30'
      },
      {
        username: 'john.doe',
        email: 'john.doe@eswacaa.sz',
        role: 'Analyst',
        status: 'Active',
        lastLogin: '2024-02-09 09:15'
      },
      {
        username: 'mary.smith',
        email: 'mary.smith@eswacaa.sz',
        role: 'Viewer',
        status: 'Active',
        lastLogin: '2024-02-08 16:45'
      },
      {
        username: 'temp.user',
        email: 'temp@eswacaa.sz',
        role: 'Viewer',
        status: 'Inactive',
        lastLogin: 'Never'
      }
    ];
    
    sampleUsers.forEach(user => {
      this.addUserToTable(user);
    });
    
    // Also populate audit log
    this.populateAuditLog();
  }

  addUserToTable(userData) {
    const tbody = document.querySelector('#user-management .data-table:first-of-type tbody');
    if (!tbody) {
      console.warn('User table body not found');
      return;
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${userData.username}</td>
      <td>${userData.email}</td>
      <td>${userData.role}</td>
      <td><span class="status-badge ${userData.status === 'Active' ? 'compliant' : 'warning'}">${userData.status}</span></td>
      <td>${userData.lastLogin}</td>
      <td>
        <button class="btn btn-primary btn-sm">Edit</button>
        <button class="btn btn-danger btn-sm">Delete</button>
      </td>
    `;
    
    tbody.appendChild(row);
  }

  populateAuditLog() {
    console.log('Starting populateAuditLog function...');
    
    // Debug: List all tables in user-management section
    const allTables = document.querySelectorAll('#user-management table');
    console.log(`Found ${allTables.length} tables in user-management:`, allTables);
    
    // Try multiple selectors to find the audit log table
    let auditTableBody = null;
    
    const selectors = [
      '#user-management .data-table:last-of-type tbody',
      '#user-management table:last-of-type tbody',
      '#security-audit tbody',
      '.audit-log tbody',
      '[id*="audit"] tbody',
      '#user-management tbody:last-of-type'
    ];
    
    for (const selector of selectors) {
      auditTableBody = document.querySelector(selector);
      if (auditTableBody) {
        console.log(`Found audit table body with selector: ${selector}`, auditTableBody);
        break;
      } else {
        console.log(`Selector failed: ${selector}`);
      }
    }
    
    // If still not found, create audit log table
    if (!auditTableBody) {
      console.warn('Creating new audit log table...');
      this.createAuditLogTable();
      auditTableBody = document.querySelector('#audit-log-table tbody');
    }
    
    if (!auditTableBody) {
      console.error('Could not find or create audit log table body');
      return;
    }
    
    console.log('Populating audit log table...');
    
    // Clear existing rows
    auditTableBody.innerHTML = '';
    
    // Sample audit log data
    const auditData = [
      {
        timestamp: '2024-02-10 14:30:25',
        user: 'admin',
        action: 'Login',
        target: 'System',
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      {
        timestamp: '2024-02-10 14:25:10',
        user: 'admin',
        action: 'View',
        target: 'Royalty Records',
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      {
        timestamp: '2024-02-10 14:20:05',
        user: 'john.doe',
        action: 'Edit',
        target: 'User Account (mary.smith)',
        ipAddress: '192.168.1.101',
        status: 'Success'
      },
      {
        timestamp: '2024-02-10 14:15:30',
        user: 'mary.smith',
        action: 'Login',
        target: 'System',
        ipAddress: '192.168.1.102',
        status: 'Failed'
      },
      {
        timestamp: '2024-02-10 14:10:45',
        user: 'admin',
        action: 'Logout',
        target: 'System',
        ipAddress: '192.168.1.100',
        status: 'Success'
      }
    ];
    
    auditData.forEach(entry => {
      this.addAuditLogEntry(entry);
    });
  }

  addAuditLogEntry(entry) {
    // Try multiple selectors to find the audit table body
    let tbody = document.querySelector('#audit-log-table tbody');
    
    // If not found, try the selector that populateAuditLog found
    if (!tbody) {
      tbody = document.querySelector('#user-management .data-table:last-of-type tbody');
    }
    
    // Still not found? Try other selectors
    if (!tbody) {
      const selectors = [
        '#user-management table:last-of-type tbody',
        '#security-audit tbody',
        '.audit-log tbody',
        '[id*="audit"] tbody',
        '#user-management tbody:last-of-type'
      ];
      
      for (const selector of selectors) {
        tbody = document.querySelector(selector);
        if (tbody) {
          console.log(`Found audit table body with selector: ${selector}`);
          break;
        }
      }
    }
    
    if (!tbody) {
      console.warn('Audit log table body not found in addAuditLogEntry');
      return;
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.timestamp}</td>
      <td>${entry.user}</td>
      <td>${entry.action}</td>
      <td>${entry.target}</td>
      <td>${entry.ipAddress}</td>
      <td><span class="status-badge ${entry.status === 'Success' ? 'compliant' : 'warning'}">${entry.status}</span></td>
    `;
    
    tbody.appendChild(row);
    console.log('Successfully added audit log entry');
  }

  handleApplyFilters(event) {
    event.preventDefault();
    
    console.log('Apply Filters button clicked');
    
    // Get filter values
    const entityFilter = this.getFilterValue('filter-entity');
    const mineralFilter = this.getFilterValue('filter-mineral');
    const statusFilter = this.getFilterValue('filter-status');
    const dateFromFilter = this.getFilterValue('filter-date-from');
    const dateToFilter = this.getFilterValue('filter-date-to');
    
    // Debug: Log filter values
    console.log('Filter values:', { entityFilter, mineralFilter, statusFilter, dateFromFilter, dateToFilter });
    
    // Filter logic
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) {
      this.modules.notificationManager.error('Royalty records table not found');
      return;
    }
    
    const rows = tbody.querySelectorAll('tr');
    let visibleCount = 0;
    const totalCount = rows.length;
    
    rows.forEach(row => {
      let showRow = true;
      
      // Get row data
      const rowData = {
        entity: row.children[0]?.textContent,
        mineral: row.children[1]?.textContent,
        volume: row.children[2]?.textContent,
        tariff: row.children[3]?.textContent,
        royalties: row.children[4]?.textContent,
        date: row.children[5]?.textContent,
        status: row.children[6]?.textContent
      };
      
      // Debug: Log row data
      console.log('Row data:', rowData);
      
      // Apply filters
      if (this.matchesFilter(rowData.entity, entityFilter) && 
          this.matchesFilter(rowData.mineral, mineralFilter) && 
          this.matchesFilter(rowData.status, statusFilter)) {
        
        // Date filtering
        if (dateFromFilter || dateToFilter) {
          const rowDate = rowData.date;
          const rowDateObj = this.parseDate(rowDate);
          
          if (dateFromFilter) {
            const fromDate = new Date(dateFromFilter);
            if (rowDateObj < fromDate) {
              showRow = false;
              console.log(`Date from filter failed: ${rowDate} is before ${dateFromFilter}`);
            }
          }
          if (dateToFilter) {
            const toDate = new Date(dateToFilter);
            toDate.setHours(23, 59, 59, 999); // Include the entire end date
            if (rowDateObj > toDate) {
              showRow = false;
              console.log(`Date to filter failed: ${rowDate} is after ${dateToFilter}`);
            }
          }
        }
      } else {
        showRow = false;
      }
      
      // Show/hide row
      row.style.display = showRow ? '' : 'none';
      if (showRow) visibleCount++;
    });
    
    console.log(`Filter results: ${visibleCount} visible out of ${totalCount} total records`);
    this.modules.notificationManager.success(`Applied filters. Showing ${visibleCount} of ${totalCount} records.`);
  }

  getFilterValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
  }

  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, ' ') : '';
  }

  matchesFilter(text, filter) {
    if (!text || !filter) return !filter; // If no filter, show all
    return text.toLowerCase().includes(filter.toLowerCase());
  }

  parseDate(dateString) {
    if (!dateString) return null;
    
    // Try different date formats
    const formats = [
      dateString, // Original format
      dateString.replace(/\//g, '-'), // Replace / with -
      dateString.replace(/\./g, '-'), // Replace . with -
    ];
    
    for (const format of formats) {
      const date = new Date(format);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  }

  handleClearFilters(event) {
    event.preventDefault();
    
    console.log('Clear Filters button clicked');
    
    // Clear all possible filter input variations
    const filterInputIds = [
      'filter-entity', 'entity-filter',
      'filter-mineral', 'mineral-filter',
      'filter-status', 'status-filter',
      'filter-date-from', 'date-from-filter',
      'filter-date-to', 'date-to-filter'
    ];
    
    filterInputIds.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.value = '';
        console.log(`Cleared filter: ${id}`);
      }
    });
    
    // Show all rows
    const tbody = document.getElementById('royalty-records-tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(row => {
        row.style.display = '';
      });
      
      console.log(`Showing all ${rows.length} records`);
      this.modules.notificationManager.info(`Filters cleared. Showing all ${rows.length} records.`);
    } else {
      this.modules.notificationManager.error('Royalty records table not found');
    }
  }

  handleExportReport(event) {
    event.preventDefault();
    
    const section = event.target.closest('section');
    const sectionId = section ? section.id : 'report';
    
    // Enhanced export functionality
    this.showExportModal(sectionId);
  }

  showExportModal(sectionId) {
    // Create export modal if it doesn't exist
    if (!document.getElementById('export-modal')) {
      this.createExportModal();
    }
    
    const modal = document.getElementById('export-modal');
    modal.style.display = 'block';
    
    // Populate export options based on section
    this.populateExportOptions(sectionId);
  }

  createExportModal() {
    const modal = document.createElement('div');
    modal.id = 'export-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Export Report</h3>
          <span class="modal-close">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="export-format">Format</label>
            <select id="export-format">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div class="form-group">
            <label for="export-date-range">Date Range</label>
            <select id="export-date-range">
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="quarter">Current Quarter</option>
              <option value="year">Current Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div class="form-group" id="custom-date-range" style="display:none;">
            <label for="export-start-date">Start Date</label>
            <input type="date" id="export-start-date">
            <label for="export-end-date">End Date</label>
            <input type="date" id="export-end-date">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel">Cancel</button>
          <button class="btn btn-primary modal-export">Export</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupModalEventListeners();
  }

  setupModalEventListeners() {
    const modal = document.getElementById('export-modal');
    
    // Close modal handlers
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    modal.querySelector('.modal-cancel').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Date range change handler
    modal.querySelector('#export-date-range').addEventListener('change', (e) => {
      const customRange = modal.querySelector('#custom-date-range');
      customRange.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
    
    // Export handler
    modal.querySelector('.modal-export').addEventListener('click', () => {
      this.performExport();
    });
  }

  performExport() {
    const format = document.getElementById('export-format').value;
    const dateRange = document.getElementById('export-date-range').value;
    
    // Simulate export process
    this.modules.notificationManager.info('Preparing export...');
    
    setTimeout(() => {
      this.modules.notificationManager.success(`Report exported successfully as ${format.toUpperCase()}`);
      document.getElementById('export-modal').style.display = 'none';
    }, 2000);
  }

  populateExportOptions(sectionId) {
    // Update modal title based on section
    const modalTitle = document.querySelector('#export-modal .modal-header h3');
    if (modalTitle) {
      modalTitle.textContent = `Export ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Report`;
    }
  }

  // Add missing methods for complete functionality
  async simulateLoading() {
    console.log('Starting loading simulation...');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Loading simulation complete');
        resolve();
      }, 2000);
    });
  }

  startRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
      this.updateDashboardMetrics();
    }, 30000);
  }

  updateDashboardMetrics() {
    // Update metrics with simulated real-time data
    const totalRoyalties = document.getElementById('total-royalties');
    if (totalRoyalties) {
      const currentValue = parseFloat(totalRoyalties.textContent.replace(/[E,]/g, '')) || 0;
      const newValue = currentValue + Math.random() * 1000;
      totalRoyalties.textContent = `E${newValue.toLocaleString()}`;
    }
    
    // Update other dashboard metrics
    const totalEntities = document.querySelector('.metric-card:nth-child(2) .metric-value');
    if (totalEntities) {
      const currentCount = parseInt(totalEntities.textContent) || 0;
      totalEntities.textContent = Math.max(currentCount, Math.floor(Math.random() * 50) + 30);
    }
    
    // Update compliance rate
    const complianceRate = document.querySelector('.metric-card:nth-child(3) .metric-value');
    if (complianceRate) {
      const rate = (85 + Math.random() * 10).toFixed(1);
      complianceRate.textContent = `${rate}%`;
    }
  }

  handleAddUser(event) {
    event.preventDefault();
    
    const addUserForm = document.querySelector('#user-management .user-form-container:first-child');
    if (addUserForm) {
      addUserForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Focus on first input
      const firstInput = addUserForm.querySelector('input');
      if (firstInput) firstInput.focus();
    }
    
    this.modules.notificationManager.info('Ready to add new user');
  }

  handleSaveUser(event) {
    event.preventDefault();
    console.log('Save User button clicked');
    this.modules.notificationManager.success('User saved successfully');
  }

  handleTableAction(event) {
    event.preventDefault();
    const action = event.target.textContent.trim();
    console.log(`Table action: ${action}`);
    this.modules.notificationManager.info(`${action} action performed`);
  }

  handleViewAuditLog(event) {
    event.preventDefault();
    console.log('View Audit Log clicked');
    this.populateAuditLog();
    this.modules.notificationManager.info('Audit log refreshed');
  }

  handleLogout(event) {
    event.preventDefault();
    console.log('Logout confirmed');
    
    // Clear app state
    this.destroy();
    
    // Reset to login screen
    this.appContainer.style.display = 'none';
    this.loginSection.style.display = 'flex';
    
    this.modules.notificationManager.success('Logged out successfully');
  }

  createAuditLogTable() {
    const userManagementSection = document.getElementById('user-management');
    if (!userManagementSection) return;
    
    const auditContainer = document.createElement('div');
    auditContainer.className = 'user-form-container';
    auditContainer.innerHTML = `
      <h4>Security Audit Log</h4>
      <div class="table-container">
        <table class="data-table" id="audit-log-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Target</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;
    
    userManagementSection.appendChild(auditContainer);
  }

  populateAuditDashboard() {
    console.log('Populating audit dashboard...');
  }

  // Add search functionality
  setupGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.performGlobalSearch(e.target.value);
      });
    }
  }

  performGlobalSearch(query) {
    if (!query || query.length < 2) return;
    
    const searchResults = [];
    const sections = ['dashboard', 'user-management', 'reports'];
    
    sections.forEach(section => {
      const sectionElement = document.getElementById(section);
      if (sectionElement) {
        const textContent = sectionElement.textContent.toLowerCase();
        if (textContent.includes(query.toLowerCase())) {
          searchResults.push({
            section,
            title: sectionElement.querySelector('h1, h2')?.textContent || section,
            preview: this.extractSearchPreview(textContent, query)
          });
        }
      }
    });
    
    this.displaySearchResults(searchResults);
  }

  extractSearchPreview(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 50);
    return text.substring(start, end);
  }

  displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No results found</p>';
      return;
    }
    
    results.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.className = 'search-result';
      resultElement.innerHTML = `
        <h4>${result.title}</h4>
        <p>${result.preview}...</p>
        <button onclick="app.showSection('${result.section}')">Go to ${result.title}</button>
      `;
      resultsContainer.appendChild(resultElement);
    });
  }

  // Add auto-save functionality
  setupAutoSave() {
    const autoSaveInterval = 30000; // 30 seconds
    
    setInterval(() => {
      this.autoSaveApplicationState();
    }, autoSaveInterval);
  }

  autoSaveApplicationState() {
    const state = {
      currentSection: document.querySelector('main > section[style*="block"]')?.id,
      formData: this.collectFormData(),
      timestamp: new Date().toISOString()
    };
    
    this.saveToLocalStorage('app-state', state);
  }

  collectFormData() {
    const forms = document.querySelectorAll('form');
    const formData = {};
    
    forms.forEach((form, index) => {
      const data = new FormData(form);
      formData[`form-${index}`] = Object.fromEntries(data.entries());
    });
    
    return formData;
  }

  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }

  // Add error boundary - THIS WAS MISSING
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error, event.filename, event.lineno);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError(event.reason, 'Promise', 0);
    });
  }

  handleGlobalError(error, source, line) {
    console.error('Global error caught:', error, source, line);
    
    // Show user-friendly error message
    if (this.modules.notificationManager) {
      this.modules.notificationManager.error('An error occurred. Please refresh the page if issues persist.');
    }
    
    // Log error details for debugging
    this.logError({
      message: error.message || error,
      source,
      line,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  logError(errorDetails) {
    // Save error to localStorage for later analysis
    const errors = this.loadFromLocalStorage('error-log') || [];
    errors.push(errorDetails);
    
    // Keep only last 10 errors
    if (errors.length > 10) {
      errors.splice(0, errors.length - 10);
    }
    
    this.saveToLocalStorage('error-log', errors);
  }

  validateFormData(formData) {
    const validationRules = {
      username: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9._-]+$/
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      volume: {
        required: true,
        type: 'number',
        min: 0
      },
      tariff: {
        required: true,
        type: 'number',
        min: 0
      }
    };

    const errors = [];
    
    for (const [field, rules] of Object.entries(validationRules)) {
      const value = formData.get(field);
      
      if (rules.required && !value) {
        errors.push(`${field} is required`);
        continue;
      }
      
      if (value) {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
        
        if (rules.type === 'number' && isNaN(Number(value))) {
          errors.push(`${field} must be a valid number`);
        }
        
        if (rules.min !== undefined && Number(value) < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
      }
    }
    
    return errors;
  }

}

// Global instance for debugging and chart functionality
window.app = new RoyaltiesManager();

// Export for module usage
export default RoyaltiesManager;
