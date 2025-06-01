// @ts-nocheck
import { FileManager } from './modules/FileManager.js';
import { NotificationManager } from './modules/NotificationManager.js';
import { IconManager } from './modules/IconManager.js';

class RoyaltiesManager {
  constructor() {
    this.modules = {};
    this.charts = new Map(); // Add chart tracking
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      await this.waitForDOM();
      this.initializeElements();
      this.initializeModules();
      this.setupEventListeners();
      await this.simulateLoading();
      this.showLoginSection();
    } catch (error) {
      console.error('Application initialization failed:', error);
      // Fallback: show login section even if there's an error
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
        // Use setTimeout to ensure DOM is ready and prevent double initialization
        setTimeout(() => {
          // Only initialize if not already initialized for this session
          if (!this.charts.has('revenue-trends-chart')) {
            this.initializeCharts();
          }
          this.populateRoyaltyRecords();
          this.updateDashboardMetrics();
          this.setupChartControls(); // Add chart controls
        }, 100);
      }
      
      if (sectionId === 'user-management') {
        setTimeout(() => {
          this.populateUserAccounts();
          this.populateAuditLog();
        }, 100);
      }
      
      // Add audit dashboard support
      if (sectionId === 'audit-dashboard') {
        setTimeout(() => {
          this.populateAuditDashboard();
        }, 100);
      }
    });
  }

  setupEventListeners() {
    document.addEventListener('submit', (event) => this.handleGlobalSubmit(event));
    document.addEventListener('click', (event) => this.handleGlobalClick(event));
  }

  handleGlobalClick(event) {
    const { target } = event;
    
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
      
      // Handle logout specially
      if (sectionId === 'logout') {
        this.showSection('logout');
      } else {
        this.showSection(sectionId);
      }
      
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
      
      // Initialize dashboard properly
      this.showSection('dashboard');
      this.initializeCharts();
      this.populateRoyaltyRecords();
      this.updateDashboardMetrics();
      
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

  async createRevenueChart(chartType = 'line') {
    const canvas = document.getElementById('revenue-trends-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    // Destroy existing chart if it exists
    const existingChart = this.charts.get('revenue-trends-chart');
    if (existingChart) {
      existingChart.destroy();
      this.charts.delete('revenue-trends-chart');
    }

    const ctx = canvas.getContext('2d');
    
    const config = {
      type: chartType === 'area' ? 'line' : chartType,
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue (E)',
          data: [500000, 600000, 750000, 700000, 800000, 900000],
          borderColor: '#1a365d',
          backgroundColor: chartType === 'area' ? 'rgba(26, 54, 93, 0.3)' : 
                          chartType === 'bar' ? '#1a365d' : 'rgba(26, 54, 93, 0.1)',
          fill: chartType === 'area',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Revenue: E${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              callback: function(value) { 
                return `E ${value.toLocaleString()}`; 
              } 
            }
          },
          x: { grid: { display: false } }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.set('revenue-trends-chart', chart);
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

  async simulateLoading() {
    console.log('Starting loading simulation...');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Loading simulation complete');
        resolve();
      }, 2000);
    });
  }

  updateDashboardMetrics() {
    // Calculate total royalties from sample data
    const sampleRecords = [
      { entity: 'Kwalini Quarry', mineral: 'Granite', volume: 1500, tariff: 25.50, date: '2024-02-01', status: 'Paid' },
      { entity: 'Mbabane Quarry', mineral: 'Sand', volume: 2000, tariff: 15.75, date: '2024-01-28', status: 'Pending' },
      { entity: 'Ngwenya Mine', mineral: 'Iron Ore', volume: 800, tariff: 45.00, date: '2024-01-25', status: 'Paid' }
    ];
    
    const totalRoyalties = sampleRecords.reduce((sum, record) => sum + (record.volume * record.tariff), 0);
    const activeEntities = new Set(sampleRecords.map(r => r.entity)).size;
    const paidRecords = sampleRecords.filter(r => r.status === 'Paid').length;
    const complianceRate = Math.round((paidRecords / sampleRecords.length) * 100);
    const pendingRecords = sampleRecords.filter(r => r.status === 'Pending').length;
    
    // Update dashboard elements
    const totalRoyaltiesElement = document.getElementById('total-royalties');
    if (totalRoyaltiesElement) {
      totalRoyaltiesElement.textContent = `E${totalRoyalties.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    }
    
    const activeEntitiesElement = document.getElementById('active-entities');
    if (activeEntitiesElement) {
      activeEntitiesElement.textContent = activeEntities.toString();
    }
    
    const complianceRateElement = document.getElementById('compliance-rate');
    if (complianceRateElement) {
      complianceRateElement.textContent = `${complianceRate}%`;
    }
    
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = `${complianceRate}%`;
    }
    
    const pendingApprovalsElement = document.getElementById('pending-approvals');
    if (pendingApprovalsElement) {
      pendingApprovalsElement.textContent = pendingRecords.toString();
    }
    
    // Update user name
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = 'Admin User';
    }
    
    // Update notifications count
    const notificationsCount = document.getElementById('notifications-count');
    if (notificationsCount) {
      notificationsCount.textContent = '3';
    }
    
    console.log('Dashboard metrics updated successfully');
  }

  populateRoyaltyRecords() {
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Sample royalty records with proper calculations
    const sampleRecords = [
      {
        entity: 'Kwalini Quarry',
        mineral: 'Granite',
        volume: '1,500',
        tariff: '25.50',
        royalties: (1500 * 25.50).toFixed(2),
        date: '2024-02-01',
        status: 'Paid'
      },
      {
        entity: 'Mbabane Quarry',
        mineral: 'Sand',
        volume: '2,000',
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
      },
      {
        entity: 'Sidvokodvo Quarry',
        mineral: 'Quarried Stone',
        volume: '1,200',
        tariff: '18.25',
        royalties: (1200 * 18.25).toFixed(2),
        date: '2024-01-20',
        status: 'Paid'
      },
      {
        entity: 'Maloma Colliery',
        mineral: 'Coal',
        volume: '3,500',
        tariff: '35.00',
        royalties: (3500 * 35.00).toFixed(2),
        date: '2024-01-15',
        status: 'Pending'
      }
    ];
    
    sampleRecords.forEach(record => {
      this.addRoyaltyRecord(record);
    });
    
    console.log(`Added ${sampleRecords.length} sample royalty records`);
  }

  addRoyaltyRecord(record) {
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) {
      console.warn('Royalty records table body not found');
      return;
    }
    
    const row = document.createElement('tr');
    const statusClass = record.status.toLowerCase() === 'paid' ? 'compliant' : 
                       record.status.toLowerCase() === 'pending' ? 'warning' : 'error';
    
    row.innerHTML = `
      <td>${record.entity}</td>
      <td>${record.mineral}</td>
      <td>${record.volume}</td>
      <td>E${record.tariff}</td>
      <td>E${record.royalties}</td>
      <td>${record.date}</td>
      <td><span class="status-badge ${statusClass}">${record.status}</span></td>
      <td>
        <button class="btn btn-primary btn-sm">Edit</button>
        <button class="btn btn-danger btn-sm">Delete</button>
      </td>
    `;
    
    tbody.appendChild(row);
  }

  handleSaveRoyalty(event) {
    event.preventDefault();
    
    console.log('Save Royalty button clicked');
    
    const entity = document.getElementById('entity');
    const mineral = document.getElementById('mineral');
    const volume = document.getElementById('volume');
    const tariff = document.getElementById('tariff');
    const paymentDate = document.getElementById('payment-date');
    
    if (!entity || !mineral || !volume || !tariff || !paymentDate) {
      this.modules.notificationManager.error('Form elements not found');
      return;
    }
    
    // Basic validation
    if (!entity.value || entity.value === 'Select Entity') {
      this.modules.notificationManager.error('Please select an entity');
      return;
    }
    
    if (!mineral.value || mineral.value === 'Select Mineral') {
      this.modules.notificationManager.error('Please select a mineral');
      return;
    }
    
    if (!volume.value || parseFloat(volume.value) <= 0) {
      this.modules.notificationManager.error('Please enter a valid volume');
      return;
    }
    
    if (!tariff.value || parseFloat(tariff.value) <= 0) {
      this.modules.notificationManager.error('Please enter a valid tariff');
      return;
    }
    
    if (!paymentDate.value) {
      this.modules.notificationManager.error('Please select a date');
      return;
    }
    
    console.log('Validation passed, creating new record');
    
    // Calculate royalties
    const royalties = parseFloat(volume.value) * parseFloat(tariff.value);
    
    // Add to table
    this.addRoyaltyRecord({
      entity: entity.value,
      mineral: mineral.value,
      volume: parseFloat(volume.value).toLocaleString(),
      tariff: parseFloat(tariff.value).toFixed(2),
      royalties: royalties.toFixed(2),
      date: paymentDate.value,
      status: 'Recorded'
    });
    
    // Clear form
    entity.selectedIndex = 0;
    mineral.selectedIndex = 0;
    volume.value = '';
    tariff.value = '';
    paymentDate.value = '';
    
    // Update dashboard metrics
    this.updateDashboardMetrics();
    
    this.modules.notificationManager.success('Royalty record saved successfully');
    console.log('Royalty record saved successfully');
  }

  // Add missing handler methods
  handleSaveUser(event) {
    event.preventDefault();
    
    const form = event.target.closest('form') || event.target.closest('.user-form-container');
    if (!form) {
      this.modules.notificationManager.error('Form not found');
      return;
    }
    
    // Get form values
    const username = document.getElementById('new-username')?.value;
    const email = document.getElementById('new-email')?.value;
    const role = document.getElementById('new-role')?.value;
    const department = document.getElementById('new-department')?.value;
    
    if (!username || !email || !role || !department) {
      this.modules.notificationManager.error('Please fill in all required fields');
      return;
    }
    
    // Add user to the users table
    this.addUserToTable({
      username,
      email,
      role: role.replace(/[^\w\s]/gi, ''), // Remove emojis
      department: department.replace(/[^\w\s]/gi, ''),
      status: 'Active',
      lastLogin: 'Never',
      failedAttempts: '0',
      expires: document.getElementById('account-expires')?.value || 'Never'
    });
    
    // Clear form
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
        if (input.tagName === 'SELECT') {
          input.selectedIndex = 0;
        }
      }
    });
    
    this.modules.notificationManager.success('User saved successfully');
  }

  handleLogout(event) {
    event.preventDefault();
    
    this.isInitialized = false;
    this.appContainer.style.display = 'none';
    this.loginSection.style.display = 'flex';
    
    // Clear forms
    document.querySelectorAll('form').forEach(form => form.reset());
    
    // Clear charts
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
    
    this.modules.notificationManager.success('Logged out successfully');
    this.showSection('dashboard');
  }

  handleTableAction(event) {
    event.preventDefault();
    
    const button = event.target;
    const action = button.textContent.trim();
    const row = button.closest('tr');
    
    if (action === 'Edit') {
      this.modules.notificationManager.info('Editing record');
      row.style.backgroundColor = '#f0f8ff';
      setTimeout(() => {
        row.style.backgroundColor = '';
      }, 2000);
    } else if (action === 'Delete') {
      if (confirm('Are you sure you want to delete this record?')) {
        row.remove();
        this.modules.notificationManager.success('Record deleted');
        this.updateDashboardMetrics();
      }
    }
  }

  handleApplyFilters(event) {
    event.preventDefault();
    
    console.log('Apply Filters button clicked');
    
    // Get filter values
    const entityFilter = document.getElementById('filter-entity')?.value;
    const mineralFilter = document.getElementById('filter-mineral')?.value;
    const statusFilter = document.getElementById('filter-status')?.value;
    
    console.log('Filter values:', { entityFilter, mineralFilter, statusFilter });
    
    // Get all rows in the royalty records table
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) {
      this.modules.notificationManager.error('Royalty records table not found');
      return;
    }
    
    const rows = tbody.querySelectorAll('tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 6) return;
      
      const rowEntity = cells[0]?.textContent.trim();
      const rowMineral = cells[1]?.textContent.trim();
      const rowStatus = cells[6]?.textContent.trim();
      
      let showRow = true;
      
      // Apply filters
      if (entityFilter && entityFilter !== 'All Entities' && !rowEntity.includes(entityFilter)) {
        showRow = false;
      }
      if (mineralFilter && mineralFilter !== 'All Minerals' && !rowMineral.includes(mineralFilter)) {
        showRow = false;
      }
      if (statusFilter && statusFilter !== 'All Statuses' && !rowStatus.includes(statusFilter)) {
        showRow = false;
      }
      
      row.style.display = showRow ? '' : 'none';
      if (showRow) visibleCount++;
    });
    
    this.modules.notificationManager.success(`Applied filters. Showing ${visibleCount} of ${rows.length} records.`);
  }

  handleClearFilters(event) {
    event.preventDefault();
    
    console.log('Clear Filters button clicked');
    
    // Clear filter inputs
    const filterInputs = document.querySelectorAll('[id*="filter"]');
    filterInputs.forEach(input => {
      if (input.tagName === 'SELECT') {
        input.selectedIndex = 0;
      } else {
        input.value = '';
      }
    });
    
    // Show all rows
    const tbody = document.getElementById('royalty-records-tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(row => {
        row.style.display = '';
      });
      
      this.modules.notificationManager.info(`Filters cleared. Showing all ${rows.length} records.`);
    }
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
      <td>${userData.department || 'N/A'}</td>
      <td><span class="status-badge ${userData.status === 'Active' ? 'compliant' : 'warning'}">${userData.status}</span></td>
      <td>${userData.lastLogin}</td>
      <td>${userData.failedAttempts || '0'}</td>
      <td>${userData.expires || 'Never'}</td>
      <td>
        <button class="btn btn-primary btn-sm">Edit</button>
        <button class="btn btn-danger btn-sm">Delete</button>
      </td>
    `;
    
    tbody.appendChild(row);
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

  // Add chart controls functionality
  setupChartControls() {
    const chartButtons = document.querySelectorAll('.chart-btn');
    
    chartButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        
        // Remove active class from siblings
        const container = button.parentElement;
        container.querySelectorAll('.chart-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get chart type and update chart
        const chartType = button.dataset.chartType || button.textContent.toLowerCase();
        this.updateChartType(chartType);
      });
    });
  }

  updateChartType(chartType) {
    console.log(`Updating chart to ${chartType} type`);
    this.createRevenueChart(chartType);
    this.modules.notificationManager.success(`Chart updated to ${chartType} view`);
  }

  // Complete user management methods
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
        department: 'Management',
        status: 'Active',
        lastLogin: '2024-02-10 14:30',
        failedAttempts: '0',
        expires: 'Never'
      },
      {
        username: 'john.doe',
        email: 'john.doe@eswacaa.sz',
        role: 'Analyst',
        department: 'Finance',
        status: 'Active',
        lastLogin: '2024-02-09 09:15',
        failedAttempts: '0',
        expires: '2024-12-31'
      },
      {
        username: 'mary.smith',
        email: 'mary.smith@eswacaa.sz',
        role: 'Viewer',
        department: 'Operations',
        status: 'Active',
        lastLogin: '2024-02-08 16:45',
        failedAttempts: '1',
        expires: '2024-06-30'
      }
    ];
    
    sampleUsers.forEach(user => {
      this.addUserToTable(user);
    });
    
    console.log(`Added ${sampleUsers.length} user accounts`);
  }

  populateAuditLog() {
    console.log('Populating audit log...');
    
    // Find or create audit log table
    let auditTableBody = document.querySelector('#user-management .data-table:last-of-type tbody');
    
    if (!auditTableBody) {
      this.createAuditLogTable();
      auditTableBody = document.querySelector('#audit-log-table tbody');
    }
    
    if (!auditTableBody) {
      console.error('Could not find or create audit log table body');
      return;
    }
    
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
        action: 'Create User',
        target: 'john.doe',
        ipAddress: '192.168.1.100',
        status: 'Success'
      },
      {
        timestamp: '2024-02-10 09:15:45',
        user: 'unknown',
        action: 'Failed Login',
        target: 'System',
        ipAddress: '10.0.0.50',
        status: 'Failed'
      }
    ];
    
    auditData.forEach((entry) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.timestamp}</td>
        <td>${entry.user}</td>
        <td>${entry.action}</td>
        <td>${entry.target}</td>
        <td>${entry.ipAddress}</td>
        <td><span class="status-badge ${entry.status === 'Success' ? 'compliant' : 'warning'}">${entry.status}</span></td>
      `;
      auditTableBody.appendChild(row);
    });
    
    console.log(`Added ${auditData.length} audit log entries`);
  }

  createAuditLogTable() {
    const userMgmtSection = document.getElementById('user-management');
    if (!userMgmtSection) {
      console.error('User management section not found');
      return;
    }
    
    // Create audit log section
    const auditSection = document.createElement('div');
    auditSection.className = 'user-form-container';
    auditSection.innerHTML = `
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
          <tbody>
          </tbody>
        </table>
      </div>
    `;
    
    userMgmtSection.appendChild(auditSection);
    console.log('Created new audit log table');
  }

  populateAuditDashboard() {
    console.log('Populating audit dashboard...');
    
    // Update audit metrics
    this.updateAuditMetrics();
    
    // Populate audit summary table if it exists
    this.populateAuditSummaryTable();
  }

  updateAuditMetrics() {
    const auditSection = document.getElementById('audit-dashboard');
    if (!auditSection) return;
    
    // Sample audit metrics
    const metrics = [
      { selector: '.metric-card:nth-child(1) p', value: '247' },
      { selector: '.metric-card:nth-child(2) p', value: '3' },
      { selector: '.metric-card:nth-child(3) p', value: '8' },
      { selector: '.metric-card:nth-child(4) p', value: '1' }
    ];
    
    metrics.forEach((metric) => {
      const element = auditSection.querySelector(metric.selector);
      if (element) {
        element.textContent = metric.value;
      }
    });
    
    console.log('Updated audit metrics');
  }

  populateAuditSummaryTable() {
    const auditTableBody = document.querySelector('#audit-dashboard tbody');
    if (!auditTableBody) {
      console.warn('Audit summary table not found');
      return;
    }
    
    // Clear existing rows
    auditTableBody.innerHTML = '';
    
    const auditSummaryData = [
      {
        project: 'Kwalini Quarry',
        mineral: 'Granite',
        declared: '1,500',
        verified: '1,480',
        outstanding: '510.00',
        status: 'Under Review'
      },
      {
        project: 'Mbabane Quarry',
        mineral: 'Sand',
        declared: '2,000',
        verified: '2,000',
        outstanding: '0.00',
        status: 'Compliant'
      }
    ];
    
    auditSummaryData.forEach(data => {
      const row = document.createElement('tr');
      const statusClass = data.status === 'Compliant' ? 'compliant' : 
                         data.status === 'Under Review' ? 'warning' : 'error';
      
      row.innerHTML = `
        <td>${data.project}</td>
        <td>${data.mineral}</td>
        <td>${data.declared}</td>
        <td>${data.verified}</td>
        <td>E${data.outstanding}</td>
        <td><span class="status-badge ${statusClass}">${data.status}</span></td>
      `;
      auditTableBody.appendChild(row);
    });
    
    console.log('Populated audit summary table');
  }

  handleViewAuditLog(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('View Audit Log button clicked');
    
    // Navigate to user management section and scroll to audit log
    this.showSection('user-management');
    
    setTimeout(() => {
      const auditSection = document.querySelector('#audit-log-table') || 
                          document.querySelector('#user-management .user-form-container:last-child');
      
      if (auditSection) {
        auditSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Highlight the section briefly
        auditSection.style.backgroundColor = '#f0f8ff';
        setTimeout(() => {
          auditSection.style.backgroundColor = '';
        }, 2000);
      }
    }, 100);
    
    this.modules.notificationManager.info('Displaying security audit log');
  }

  handleExportReport(event) {
    event.preventDefault();
    
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = 'Exporting...';
    button.disabled = true;
    
    // Simulate export process
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      this.modules.notificationManager.success('Report exported successfully!');
    }, 2000);
  }

  handleAddUser(event) {
    event.preventDefault();
    
    // Scroll to the add user form
    const addUserForm = document.querySelector('#user-management .user-form-container:first-child');
    if (addUserForm) {
      addUserForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Focus on first input
      const firstInput = addUserForm.querySelector('input');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
      }
    }
    
    this.modules.notificationManager.info('Add user form ready');
  }
}

new RoyaltiesManager();