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
          // Remove setupChartControls from here as it's called in initializeCharts
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
    
    // Handle Apply Filters button - Enhanced for User Management
    if (target.matches('.btn') && (
        target.textContent.trim() === 'Apply Filters' ||
        target.id === 'apply-filters-btn' ||
        target.id === 'apply-user-filters' ||
        target.id === 'apply-audit-filters' ||
        target.classList.contains('filter-btn')
    )) {
      this.handleApplyFilters(event);
    }
    
    // Handle Clear Filters button - Enhanced for User Management
    if (target.matches('.btn') && (
        target.textContent.trim() === 'Clear Filters' ||
        target.id === 'clear-filters-btn' ||
        target.id === 'clear-user-filters' ||
        target.id === 'clear-audit-filters'
    )) {
      this.handleClearFilters(event);
    }
    
    // Handle User Management specific buttons
    if (target.matches('#add-user-btn')) {
      this.handleShowAddUserForm(event);
    }
    
    if (target.matches('#close-add-user-form') || target.matches('#cancel-add-user')) {
      this.handleHideAddUserForm(event);
    }
    
    if (target.matches('#create-user-btn')) {
      this.handleCreateUser(event);
    }
    
    if (target.matches('#refresh-users')) {
      this.handleRefreshUsers(event);
    }
    
    if (target.matches('#export-users')) {
      this.handleExportUsers(event);
    }
    
    if (target.matches('#bulk-delete-users')) {
      this.handleBulkDeleteUsers(event);
    }
    
    if (target.matches('#select-all-users')) {
      this.handleSelectAllUsers(event);
    }
    
    // Handle individual user checkboxes
    if (target.matches('#users-table-tbody input[type="checkbox"]')) {
      this.handleUserCheckboxChange(event);
    }
    
    // Handle audit log buttons
    if (target.matches('#refresh-audit-log')) {
      this.handleRefreshAuditLog(event);
    }
    
    if (target.matches('#export-audit-log')) {
      this.handleExportAuditLog(event);
    }
    
    // Handle User Management table actions (Edit, Reset, Delete buttons)
    if (target.matches('.btn-sm') && target.closest('#users-table-tbody')) {
      this.handleUserTableAction(event);
    }
    
    // Handle table action buttons (for other sections)
    if (target.matches('.btn-sm') && !target.closest('#users-table-tbody')) {
      this.handleTableAction(event);
    }
    
    // Debug logging for unhandled clicks (remove in production)
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
      // Remove duplicate chart initialization calls
      if (!this.charts.has('revenue-trends-chart')) {
        this.initializeCharts();
      }
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
      this.setupChartControls(); // Move this here since it needs to run after charts are created
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
    
    const section = event.target.closest('section');
    const sectionId = section?.id;
    
    if (sectionId === 'user-management') {
      this.handleApplyUserFilters(event);
    } else {
      // Original royalty records filtering
      console.log('Apply Filters button clicked');
      
      const entityFilter = document.getElementById('filter-entity')?.value;
      const mineralFilter = document.getElementById('filter-mineral')?.value;
      const statusFilter = document.getElementById('filter-status')?.value;
      
      console.log('Filter values:', { entityFilter, mineralFilter, statusFilter });
      
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
  }

  handleClearFilters(event) {
    event.preventDefault();
    
    const section = event.target.closest('section');
    const sectionId = section?.id;
    
    if (sectionId === 'user-management') {
      this.handleClearUserFilters(event);
    } else {
      // Original clear filters logic
      console.log('Clear Filters button clicked');
      
      const filterInputs = document.querySelectorAll('[id*="filter"]');
      filterInputs.forEach(input => {
        if (input.tagName === 'SELECT') {
          input.selectedIndex = 0;
        } else {
          input.value = '';
        }
      });
      
      const tbody = document.getElementById('royalty-records-tbody');
      if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
          row.style.display = '';
        });
        
        this.modules.notificationManager.info(`Filters cleared. Showing all ${rows.length} records.`);
      }
    }
  }

  // New User Management specific methods
  handleShowAddUserForm(event) {
    event.preventDefault();
    
    const formContainer = document.getElementById('add-user-form-container');
    if (formContainer) {
      formContainer.style.display = 'block';
      formContainer.scrollIntoView({ behavior: 'smooth' });
      
      // Focus on first input
      const firstInput = formContainer.querySelector('input');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
      }
    }
    
    this.modules.notificationManager.info('Add user form opened');
  }

  handleHideAddUserForm(event) {
    event.preventDefault();
    
    const formContainer = document.getElementById('add-user-form-container');
    if (formContainer) {
      formContainer.style.display = 'none';
      
      // Reset form
      const form = document.getElementById('add-user-form');
      if (form) {
        form.reset();
        
        // Clear validation messages
        form.querySelectorAll('.validation-error, .validation-success').forEach(el => {
          el.style.display = 'none';
        });
        
        // Clear field validation classes
        form.querySelectorAll('.field-valid, .field-invalid').forEach(el => {
          el.classList.remove('field-valid', 'field-invalid');
        });
        
        // Reset password strength
        const strengthBar = form.querySelector('.strength-bar-fill');
        const strengthText = form.querySelector('.strength-text');
        if (strengthBar) strengthBar.style.width = '0%';
        if (strengthText) strengthText.textContent = 'Password Strength: Enter password';
        
        // Reset submit button
        const submitBtn = document.getElementById('create-user-btn');
        if (submitBtn) submitBtn.disabled = true;
      }
    }
    
    this.modules.notificationManager.info('Add user form closed');
  }

  handleCreateUser(event) {
    event.preventDefault();
    
    const form = document.getElementById('add-user-form');
    if (!form) {
      this.modules.notificationManager.error('Form not found');
      return;
    }
    
    // Get form values
    const formData = {
      username: document.getElementById('new-username')?.value.trim(),
      email: document.getElementById('new-email')?.value.trim(),
      role: document.getElementById('new-role')?.value,
      department: document.getElementById('new-department')?.value,
      password: document.getElementById('new-password')?.value,
      confirmPassword: document.getElementById('confirm-password')?.value,
      expires: document.getElementById('account-expires')?.value,
      forcePasswordChange: document.getElementById('force-password-change')?.checked,
      sendWelcomeEmail: document.getElementById('send-welcome-email')?.checked
    };
    
    // Validate required fields
    const requiredFields = ['username', 'email', 'role', 'department', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      this.modules.notificationManager.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      this.modules.notificationManager.error('Passwords do not match');
      return;
    }
    
    // Check if username already exists
    if (this.checkUsernameExists(formData.username)) {
      this.modules.notificationManager.error('Username already exists');
      return;
    }
    
    // Add user to table
    this.addUserToUsersTable({
      username: formData.username,
      email: formData.email,
      role: formData.role.replace(/[^\w\s]/gi, ''), // Remove emojis
      department: formData.department.replace(/[^\w\s]/gi, ''),
      status: 'Active',
      lastLogin: 'Never',
      failedAttempts: '0',
      expires: formData.expires || 'Never'
    });
    
    // Add audit log entry
    this.addAuditLogEntry({
      timestamp: new Date().toLocaleString(),
      user: 'admin',
      action: 'Create User',
      target: formData.username,
      ipAddress: '192.168.1.100',
      status: 'Success',
      details: `Created user ${formData.username} with role ${formData.role}`
    });
    
    // Hide form and show success
    this.handleHideAddUserForm(event);
    this.modules.notificationManager.success(`User ${formData.username} created successfully!`);
    
    // Update metrics
    this.updateUserManagementMetrics();
  }

  handleApplyUserFilters(event) {
    event.preventDefault();
    
    const roleFilter = document.getElementById('filter-user-role')?.value;
    const statusFilter = document.getElementById('filter-user-status')?.value;
    const departmentFilter = document.getElementById('filter-user-department')?.value;
    
    console.log('User filter values:', { roleFilter, statusFilter, departmentFilter });
    
    const tbody = document.getElementById('users-table-tbody');
    if (!tbody) {
      this.modules.notificationManager.error('Users table not found');
      return;
    }
    
    const rows = tbody.querySelectorAll('tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 6) return;
      
      // Correct column indexes (accounting for checkbox column)
      const rowRole = cells[3]?.textContent.trim(); // Role is 4th column (index 3)
      const rowDepartment = cells[4]?.textContent.trim(); // Department is 5th column (index 4)  
      const rowStatus = cells[5]?.querySelector('.status-badge')?.textContent.trim(); // Status is 6th column (index 5)
      
      let showRow = true;
      
      if (roleFilter && roleFilter !== '' && !rowRole.includes(roleFilter)) {
        showRow = false;
      }
      if (statusFilter && statusFilter !== '' && !rowStatus?.includes(statusFilter)) {
        showRow = false;
      }
      if (departmentFilter && departmentFilter !== '' && !rowDepartment.includes(departmentFilter)) {
        showRow = false;
      }
      
      row.style.display = showRow ? '' : 'none';
      if (showRow) visibleCount++;
    });
    
    this.modules.notificationManager.success(`User filters applied. Showing ${visibleCount} of ${rows.length} users.`);
  }

  handleClearUserFilters(event) {
    event.preventDefault();
    
    // Clear user filter inputs
    const userFilterInputs = [
      'filter-user-role',
      'filter-user-status', 
      'filter-user-department',
      'audit-from-date',
      'audit-to-date',
      'audit-action-type'
    ];
    
    userFilterInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        if (input.tagName === 'SELECT') {
          input.selectedIndex = 0;
        } else {
          input.value = '';
        }
      }
    });
    
    // Show all user rows
    const tbody = document.getElementById('users-table-tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(row => {
        row.style.display = '';
      });
      
      this.modules.notificationManager.info(`User filters cleared. Showing all ${rows.length} users.`);
    }
    
    // Show all audit log rows
    const auditTbody = document.getElementById('audit-log-tbody');
    if (auditTbody) {
      const auditRows = auditTbody.querySelectorAll('tr');
      auditRows.forEach(row => {
        row.style.display = '';
      });
    }
  }

  handleRefreshUsers(event) {
    event.preventDefault();
    
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    button.disabled = true;
    
    setTimeout(() => {
      this.populateUserAccounts();
      this.updateUserManagementMetrics();
      
      button.innerHTML = originalText;
      button.disabled = false;
      
      this.modules.notificationManager.success('User list refreshed');
    }, 1000);
  }

  handleExportUsers(event) {
    event.preventDefault();
    
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-download"></i> Exporting...';
    button.disabled = true;
    
    // Simulate export
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      
      this.modules.notificationManager.success('User list exported successfully');
    }, 2000);
  }

  handleSelectAllUsers(event) {
    const isChecked = event.target.checked;
    const userCheckboxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]');
    
    userCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    
    this.updateBulkActionsVisibility();
  }

  handleUserCheckboxChange(event) {
    this.updateBulkActionsVisibility();
    
    // Update select all checkbox state
    const selectAllCheckbox = document.getElementById('select-all-users');
    const userCheckboxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]');
    const checkedBoxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]:checked');
    
    if (selectAllCheckbox) {
      selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < userCheckboxes.length;
      selectAllCheckbox.checked = checkedBoxes.length === userCheckboxes.length && userCheckboxes.length > 0;
    }
  }

  handleBulkDeleteUsers(event) {
    event.preventDefault();
    
    const checkedBoxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]:checked');
    
    if (checkedBoxes.length === 0) {
      this.modules.notificationManager.warning('No users selected for deletion');
      return;
    }
    
    const usernames = Array.from(checkedBoxes).map(checkbox => {
      const row = checkbox.closest('tr');
      return row.querySelector('td:nth-child(2)')?.textContent.trim();
    }).filter(Boolean);
    
    if (confirm(`Are you sure you want to delete ${usernames.length} user(s)?\n\nUsers: ${usernames.join(', ')}`)) {
      checkedBoxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row) {
          // Add audit log entry
          const username = row.querySelector('td:nth-child(2)')?.textContent.trim();
          this.addAuditLogEntry({
            timestamp: new Date().toLocaleString(),
            user: 'admin',
            action: 'Delete User',
            target: username,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `Deleted user ${username}`
          });
          
          row.remove();
        }
      });
      
      this.updateBulkActionsVisibility();
      this.updateUserManagementMetrics();
      this.modules.notificationManager.success(`${usernames.length} user(s) deleted successfully`);
    }
  }

  updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]:checked');
    const bulkDeleteBtn = document.getElementById('bulk-delete-users');
    
    if (bulkDeleteBtn) {
      if (checkedBoxes.length > 0) {
        bulkDeleteBtn.style.display = 'inline-block';
        bulkDeleteBtn.disabled = false;
      } else {
        bulkDeleteBtn.style.display = 'none';
        bulkDeleteBtn.disabled = true;
      }
    }
  }

  checkUsernameExists(username) {
    const tbody = document.getElementById('users-table-tbody');
    if (!tbody) return false;
    
    const existingUsernames = Array.from(tbody.querySelectorAll('tr td:nth-child(2)'))
      .map(cell => cell.textContent.trim().toLowerCase());
    
    return existingUsernames.includes(username.toLowerCase());
  }

  addUserToUsersTable(userData) {
    const tbody = document.getElementById('users-table-tbody');
    if (!tbody) {
      console.warn('Users table body not found');
      return;
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <input type="checkbox" title="Select user">
      </td>
      <td>${userData.username}</td>
      <td>${userData.email}</td>
      <td>${userData.role}</td>
      <td>${userData.department}</td>
      <td><span class="status-badge ${userData.status === 'Active' ? 'active' : 'inactive'}">${userData.status}</span></td>
      <td>${userData.lastLogin}</td>
      <td>${userData.failedAttempts}</td>
      <td>${userData.expires}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm" title="Edit user">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-warning btn-sm" title="Reset password">
            <i class="fas fa-key"></i> Reset
          </button>
          <button class="btn btn-danger btn-sm" title="Delete user">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </td>
    `;
    
    // Add event listener for the new checkbox
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', (e) => this.handleUserCheckboxChange(e));
    }
    
    tbody.appendChild(row);
  }

  populateUserAccounts() {
    const tbody = document.getElementById('users-table-tbody');
    if (!tbody) {
      console.warn('User accounts table body not found');
      return;
    }
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Sample user accounts with more realistic data
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
        role: 'Editor',
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
      this.addUserToUsersTable(user);
    });
    
    console.log(`Added ${sampleUsers.length} user accounts`);
    this.updateUserManagementMetrics();
  }

  populateAuditLog() {
    console.log('Populating audit log...');
    
    const auditTableBody = document.getElementById('audit-log-tbody');
    if (!auditTableBody) {
      console.error('Audit log table body not found');
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
        status: 'Success',
        details: 'Successful login from admin panel'
      },
      {
        timestamp: '2024-02-10 14:25:10',
        user: 'admin',
        action: 'Create User',
        target: 'john.doe',
        ipAddress: '192.168.1.100',
        status: 'Success',
        details: 'Created new user account'
      },
      {
        timestamp: '2024-02-10 09:15:45',
        user: 'unknown',
        action: 'Failed Login',
        target: 'System',
        ipAddress: '10.0.0.50',
        status: 'Failed',
        details: 'Invalid credentials provided'
      }
    ];
    
    auditData.forEach(entry => {
      this.addAuditLogEntry(entry);
    });
    
    console.log(`Added ${auditData.length} audit log entries`);
  }

  addAuditLogEntry(entryData) {
    const auditTableBody = document.getElementById('audit-log-tbody');
    if (!auditTableBody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entryData.timestamp}</td>
      <td>${entryData.user}</td>
      <td>${entryData.action}</td>
      <td>${entryData.target}</td>
      <td>${entryData.ipAddress}</td>
      <td><span class="status-badge ${entryData.status === 'Success' ? 'compliant' : 'warning'}">${entryData.status}</span></td>
      <td>${entryData.details || '-'}</td>
      <td>
        <button class="btn btn-secondary btn-sm" title="View details">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;
    
    // Insert at the beginning (newest first)
    auditTableBody.insertBefore(row, auditTableBody.firstChild);
  }

  handleRefreshAuditLog(event) {
    event.preventDefault();
    
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    button.disabled = true;
    
    setTimeout(() => {
      this.populateAuditLog();
      
      button.innerHTML = originalText;
      button.disabled = false;
      
      this.modules.notificationManager.success('Audit log refreshed');
    }, 1000);
  }

  handleExportAuditLog(event) {
    event.preventDefault();
    
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-download"></i> Exporting...';
    button.disabled = true;
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      
      this.modules.notificationManager.success('Audit log exported successfully');
    }, 2000);
  }

  updateUserManagementMetrics() {
    const userRows = document.querySelectorAll('#users-table-tbody tr');
    const activeUsers = document.querySelectorAll('#users-table-tbody .status-badge.active').length;
    const auditRows = document.querySelectorAll('#audit-log-tbody tr');
    const failedLogins = document.querySelectorAll('#audit-log-tbody tr').length ? 
      Array.from(document.querySelectorAll('#audit-log-tbody tr')).filter(row => 
        row.textContent.includes('Failed Login')).length : 0;
    
    // Update metrics
    const activeUsersElement = document.getElementById('active-users-count');
    if (activeUsersElement) {
      activeUsersElement.textContent = activeUsers.toString();
    }
    
    const failedLoginsElement = document.getElementById('failed-logins-count');
    if (failedLoginsElement) {
      failedLoginsElement.textContent = failedLogins.toString();
    }
    
    const securityAlertsElement = document.getElementById('security-alerts-count');
    if (securityAlertsElement) {
      securityAlertsElement.textContent = failedLogins > 3 ? 'High' : 'None';
    }
    
    const passwordComplianceElement = document.getElementById('password-compliance-rate');
    if (passwordComplianceElement) {
      const complianceRate = activeUsers > 0 ? Math.round((activeUsers / userRows.length) * 100) : 100;
      passwordComplianceElement.textContent = `${complianceRate}%`;
    }
  }

  // ...existing code...

  // Add the missing setupChartControls method
  setupChartControls() {
    const chartButtons = document.querySelectorAll('.chart-btn');
    
    chartButtons.forEach(button => {
      // Remove existing event listeners to prevent duplicates
      button.replaceWith(button.cloneNode(true));
    });
    
    // Re-select buttons after cloning
    const newChartButtons = document.querySelectorAll('.chart-btn');
    
    newChartButtons.forEach(button => {
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
    
    console.log(`Set up ${newChartButtons.length} chart control buttons`);
  }

  updateChartType(chartType) {
    console.log(`Updating chart to ${chartType} type`);
    this.createRevenueChart(chartType);
    this.modules.notificationManager.success(`Chart updated to ${chartType} view`);
  }

  // Add specific handler for User Management table actions
  handleUserTableAction(event) {
    event.preventDefault();
    
    const button = event.target.closest('.btn');
    const buttonText = button.textContent.trim();
    const row = button.closest('tr');
    const username = row.querySelector('td:nth-child(2)')?.textContent.trim();
    
    if (buttonText.includes('Edit')) {
      this.handleEditUser(row, username);
    } else if (buttonText.includes('Reset')) {
      this.handleResetUserPassword(row, username);
    } else if (buttonText.includes('Delete')) {
      this.handleDeleteUser(row, username);
    }
  }

  handleEditUser(row, username) {
    this.modules.notificationManager.info(`Editing user: ${username}`);
    
    // Highlight the row temporarily
    row.style.backgroundColor = '#e3f2fd';
    setTimeout(() => {
      row.style.backgroundColor = '';
    }, 2000);
    
    // In a real application, this would open an edit modal or form
    console.log(`Edit user action for: ${username}`);
  }

  handleResetUserPassword(row, username) {
    if (confirm(`Are you sure you want to reset the password for user "${username}"?`)) {
      // Add audit log entry
      this.addAuditLogEntry({
        timestamp: new Date().toLocaleString(),
        user: 'admin',
        action: 'Password Reset',
        target: username,
        ipAddress: '192.168.1.100',
        status: 'Success',
        details: `Password reset for user ${username}`
      });
      
      this.modules.notificationManager.success(`Password reset for user: ${username}`);
      console.log(`Password reset for: ${username}`);
    }
  }

  handleDeleteUser(row, username) {
    if (confirm(`Are you sure you want to delete user "${username}"?\n\nThis action cannot be undone.`)) {
      // Add audit log entry before removing
      this.addAuditLogEntry({
        timestamp: new Date().toLocaleString(),
        user: 'admin',
        action: 'Delete User',
        target: username,
        ipAddress: '192.168.1.100',
        status: 'Success',
        details: `Deleted user ${username}`
      });
      
      // Remove the row
      row.remove();
      
      // Update metrics and UI
      this.updateUserManagementMetrics();
      this.updateBulkActionsVisibility();
      
      this.modules.notificationManager.success(`User "${username}" deleted successfully`);
      console.log(`Deleted user: ${username}`);
    }
  }
}

new RoyaltiesManager();