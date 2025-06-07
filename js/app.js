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
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new MiningRoyaltiesApp();
  app.init();
});

export { MiningRoyaltiesApp };