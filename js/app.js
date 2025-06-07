// Import required modules - only import modules that exist
import { TemplateLoader } from './modules/template-loader.js';
import { AuthenticationModule } from './modules/authentication.js';

class MiningRoyaltiesApp {
  constructor() {
    this.templateLoader = new TemplateLoader();
    this.auth = new AuthenticationModule();
    this.navigationManager = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log('Initializing Mining Royalties Application...');
      
      // Show loading screen
      await this.showLoadingScreen();
      
      // Initialize navigation
      const { NavigationManager } = await import('./ui/navigationManager.js');
      this.navigationManager = new NavigationManager();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Show login screen
      this.showLoginScreen();
      
      this.isInitialized = true;
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  async showLoadingScreen() {
    return new Promise(resolve => {
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.style.display = 'none';
        }
        resolve();
      }, 2000);
    });
  }

  setupEventListeners() {
    // Login form submission
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'login-form') {
        e.preventDefault();
        this.handleLogin(e.target);
      }
    });

    // Navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
        e.preventDefault();
        const link = e.target.closest('.nav-link');
        const section = link.getAttribute('href').substring(1);
        this.navigateToSection(section);
      }
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      if (this.currentModule && this.currentModule.handleResize) {
        this.currentModule.handleResize();
      }
    });
  }

  async handleLogin(form) {
    try {
      const formData = new FormData(form);
      const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
      };

      const isAuthenticated = await this.auth.authenticate(credentials);
      
      if (isAuthenticated) {
        await this.showMainApplication();
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.showLoginError(error.message);
    }
  }

  async showMainApplication() {
    // Hide login screen
    const loginContainer = document.getElementById('login-section');
    if (loginContainer) {
      loginContainer.style.display = 'none';
    }

    // Show main app
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      appContainer.style.display = 'flex';
    }

    // Initialize navigation with data manager
    await this.navigationManager.initialize(this.dataManager);
  }

  async navigateToSection(sectionId) {
    try {
      console.log(`Navigating to section: ${sectionId}`);

      // Update navigation state
      this.navigation.setActiveSection(sectionId);

      // Unload current module
      if (this.currentModule && this.currentModule.unload) {
        await this.currentModule.unload();
      }

      // Load new module
      const module = await this.getModule(sectionId);
      if (module) {
        await module.load();
        this.currentModule = module;
      }
    } catch (error) {
      console.error(`Failed to navigate to ${sectionId}:`, error);
      this.showError(`Failed to load ${sectionId} section.`);
    }
  }

  async getModule(sectionId) {
    if (this.modules.has(sectionId)) {
      return this.modules.get(sectionId);
    }

    let module;
    switch (sectionId) {
      case 'dashboard':
        module = new DashboardModule(this.templateLoader);
        break;
      case 'user-management':
        module = new UserManagementModule(this.templateLoader);
        break;
      case 'royalty-records':
        module = new RoyaltyRecordsModule(this.templateLoader);
        break;
      case 'contract-management':
        module = new ContractManagementModule(this.templateLoader);
        break;
      default:
        console.warn(`Module not implemented: ${sectionId}`);
        return null;
    }

    if (module) {
      await module.init();
      this.modules.set(sectionId, module);
    }

    return module;
  }

  showLoginScreen() {
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) {
      loginContainer.style.display = 'flex';
    }
  }

  showLoginError(message) {
    // Implementation for showing login errors
    console.error('Login error:', message);
  }

  showError(message) {
    // Implementation for showing general errors
    console.error('Application error:', message);
  }

  // Chart setup methods
  setupAuditCharts() {
    // Security Events Timeline Chart
    const securityEventsCtx = document.getElementById('security-events-chart');
    if (securityEventsCtx) {
      new Chart(securityEventsCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Security Events',
            data: [12, 8, 15, 6, 10, 4],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // Event Types Distribution Chart
    const eventTypesCtx = document.getElementById('event-types-chart');
    if (eventTypesCtx) {
      new Chart(eventTypesCtx, {
        type: 'doughnut',
        data: {
          labels: ['Login Success', 'Failed Login', 'Data Access', 'System Changes'],
          datasets: [{
            data: [45, 12, 28, 15],
            backgroundColor: ['#28a745', '#dc3545', '#ffc107', '#007bff']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  setupReportingCharts() {
    // Revenue by Entity Chart
    const revenueEntityCtx = document.getElementById('revenue-entity-chart');
    if (revenueEntityCtx) {
      new Chart(revenueEntityCtx, {
        type: 'bar',
        data: {
          labels: ['Maloma Colliery', 'Ngwenya Mine', 'Kwalini Quarry', 'Others'],
          datasets: [{
            label: 'Revenue (E)',
            data: [52500, 25200, 18750, 11200],
            backgroundColor: ['#007bff', '#28a745', '#ffc107', '#6c757d']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // Monthly Trends Chart
    const monthlyTrendsCtx = document.getElementById('monthly-trends-chart');
    if (monthlyTrendsCtx) {
      new Chart(monthlyTrendsCtx, {
        type: 'line',
        data: {
          labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
          datasets: [{
            label: 'Revenue',
            data: [95000, 102000, 98500, 107650, 95420],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  setupComplianceCharts() {
    const complianceScoresCtx = document.getElementById('compliance-scores-chart');
    if (complianceScoresCtx) {
      new Chart(complianceScoresCtx, {
        type: 'bar',
        data: {
          labels: ['Maloma Colliery', 'Ngwenya Mine', 'Kwalini Quarry'],
          datasets: [{
            label: 'Compliance Score (%)',
            data: [95, 68, 88],
            backgroundColor: ['#28a745', '#dc3545', '#ffc107']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }

  // Action methods for new sections
  exportAuditLog() {
    console.log('Exporting audit log...');
    // Implementation for audit log export
  }

  generateSecurityReport() {
    console.log('Generating security report...');
    // Implementation for security report generation
  }

  refreshAuditData() {
    console.log('Refreshing audit data...');
    // Implementation for audit data refresh
  }

  generateCustomReport() {
    console.log('Generating custom report...');
    // Implementation for custom report generation
  }

  scheduleReport() {
    console.log('Scheduling report...');
    // Implementation for report scheduling
  }

  exportAnalytics() {
    console.log('Exporting analytics data...');
    // Implementation for analytics export
  }

  composeMessage() {
    console.log('Composing new message...');
    // Implementation for message composition
  }

  manageTemplates() {
    console.log('Managing message templates...');
    // Implementation for template management
  }

  sendBulkNotice() {
    console.log('Sending bulk notice...');
    // Implementation for bulk notice sending
  }

  markAllNotificationsRead() {
    console.log('Marking all notifications as read...');
    // Implementation for marking notifications as read
  }

  configureAlerts() {
    console.log('Configuring alerts...');
    // Implementation for alert configuration
  }

  testNotifications() {
    console.log('Testing notifications...');
    // Implementation for notification testing
  }

  scheduleAssessment() {
    console.log('Scheduling compliance assessment...');
    // Implementation for assessment scheduling
  }

  generateComplianceReport() {
    console.log('Generating compliance report...');
    // Implementation for compliance report generation
  }

  viewViolations() {
    console.log('Viewing compliance violations...');
    // Implementation for viewing violations
  }

  addRegulation() {
    console.log('Adding new regulation...');
    // Implementation for adding regulation
  }

  updateFramework() {
    console.log('Updating regulatory framework...');
    // Implementation for framework update
  }

  exportRegulatory() {
    console.log('Exporting regulatory data...');
    // Implementation for regulatory data export
  }

  changePassword() {
    console.log('Changing password...');
    // Implementation for password change
  }

  enableTwoFactor() {
    console.log('Enabling two-factor authentication...');
    // Implementation for 2FA enablement
  }

  updateProfile() {
    console.log('Updating profile...');
    // Implementation for profile update
  }

  toggle2FA() {
    console.log('Toggling 2FA...');
    // Implementation for 2FA toggle
  }

  manageSessions() {
    console.log('Managing active sessions...');
    // Implementation for session management
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new MiningRoyaltiesApp();
  app.init();
});

export { MiningRoyaltiesApp };