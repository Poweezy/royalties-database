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
        this.initializeCharts();
        this.populateRoyaltyRecords();
      }
      
      if (sectionId === 'user-management') {
        this.populateUserAccounts();
        this.populateAuditLog();
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

  async createRevenueChart() {
    const canvas = document.getElementById('revenue-trends-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    // Destroy existing chart if it exists
    const existingChart = this.charts.get('revenue-trends-chart');
    if (existingChart) {
      existingChart.destroy();
      this.charts.delete('revenue-trends-chart');
    }

    const ctx = canvas.getContext('2d');
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue (E)',
          data: [500000, 600000, 750000, 700000, 800000, 900000],
          borderColor: '#1a365d',
          backgroundColor: 'rgba(26, 54, 93, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: function(value) { return `E ${value.toLocaleString()}`; } }
          },
          x: { grid: { display: false } }
        }
      }
    });

    // Store the chart reference
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

  async createRevenueChart() {
    const canvas = document.getElementById('revenue-trends-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    // Destroy existing chart if it exists
    const existingChart = this.charts.get('revenue-trends-chart');
    if (existingChart) {
      existingChart.destroy();
      this.charts.delete('revenue-trends-chart');
    }

    const ctx = canvas.getContext('2d');
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue (E)',
          data: [500000, 600000, 750000, 700000, 800000, 900000],
          borderColor: '#1a365d',
          backgroundColor: 'rgba(26, 54, 93, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: function(value) { return `E ${value.toLocaleString()}`; } }
          },
          x: { grid: { display: false } }
        }
      }
    });

    // Store the chart reference
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

  // Remove duplicate setupModuleCommunication
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

  async simulateLoading() {
    console.log('Starting loading simulation...');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Loading simulation complete');
        resolve();
      }, 2000);
    });
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
    // Try multiple selectors to find the audit log table
    let auditTableBody = document.querySelector('#user-management .data-table:last-of-type tbody');
    
    if (!auditTableBody) {
      // Alternative selectors
      auditTableBody = document.querySelector('#security-audit tbody');
      if (!auditTableBody) {
        auditTableBody = document.querySelector('.audit-log tbody');
      }
      if (!auditTableBody) {
        auditTableBody = document.querySelector('[id*="audit"] tbody');
      }
    }
    
    if (!auditTableBody) {
      console.warn('Audit log table body not found. Available tables:', 
        document.querySelectorAll('#user-management table').length);
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
      },
      {
        timestamp: '2024-02-09 16:20:30',
        user: 'john.doe',
        action: 'View Report',
        target: 'Royalty Records',
        ipAddress: '192.168.1.105',
        status: 'Success'
      },
      {
        timestamp: '2024-02-09 11:45:15',
        user: 'mary.smith',
        action: 'Export Data',
        target: 'User Management',
        ipAddress: '192.168.1.110',
        status: 'Success'
      }
    ];
    
    auditData.forEach(entry => {
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

  handleViewAuditLog(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('View Audit Log button clicked - handler executed');
    
    // Force populate audit log first
    this.populateAuditLog();
    
    // Try to find and scroll to audit section with multiple approaches
    let auditSection = null;
    
    // Try various selectors
    const selectors = [
      '#user-management .user-form-container:last-child',
      '#security-audit',
      '.audit-log-section',
      '[id*="audit"]',
      '#user-management .tab-content:last-child',
      '#user-management .data-table:last-of-type'
    ];
    
    for (const selector of selectors) {
      auditSection = document.querySelector(selector);
      if (auditSection) {
        console.log(`Found audit section with selector: ${selector}`);
        break;
      }
    }
    
    if (auditSection) {
      auditSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      console.log('Scrolled to audit section');
      
      // Highlight the section briefly
      auditSection.style.backgroundColor = '#f0f8ff';
      setTimeout(() => {
        auditSection.style.backgroundColor = '';
      }, 2000);
    } else {
      console.warn('Audit section not found with any selector');
      
      // Fallback: scroll to bottom of user management section
      const userMgmtSection = document.getElementById('user-management');
      if (userMgmtSection) {
        userMgmtSection.scrollTo({ top: userMgmtSection.scrollHeight, behavior: 'smooth' });
      }
    }
    
    this.modules.notificationManager.info('Displaying security audit log');
  }

  handleSaveUser(event) {
    event.preventDefault();
    
    const form = event.target.closest('form');
    if (!form) {
      this.modules.notificationManager.error('Form not found');
      return;
    }
    
    const formData = new FormData(form);
    const username = formData.get('username');
    const email = formData.get('email');
    const role = formData.get('role');
    
    if (!username || !email || !role) {
      this.modules.notificationManager.error('Please fill in all required fields');
      return;
    }
    
    // Add user to the users table
    this.addUserToTable({
      username,
      email,
      role,
      status: 'Active',
      lastLogin: 'Never'
    });
    
    // Clear form
    form.reset();
    
    this.modules.notificationManager.success('User saved successfully');
  }

  handleLogout(event) {
    event.preventDefault();
    
    this.isInitialized = false;
    this.appContainer.style.display = 'none';
    this.loginSection.style.display = 'flex';
    
    document.querySelectorAll('form').forEach(form => form.reset());
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
      }
    }
  }
}

new RoyaltiesManager();
