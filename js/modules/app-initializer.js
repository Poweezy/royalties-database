/**
 * App Initializer Module
 * Handles component loading and initialization
 */
import { ComponentLoader } from './ComponentLoader.js';
import { NavigationManager } from './NavigationManager.js';
import { UserManager } from './UserManager.js';
import { NotificationManager } from './NotificationManager.js';
import { ChartManager } from './ChartManager.js';
import { IconManager } from './IconManager.js';
import { AuthManager } from './AuthManager.js';
import { DashboardManager } from './DashboardManager.js';

export class AppInitializer {
  constructor() {
    this.componentLoader = ComponentLoader.getInstance();
    this.authManager = AuthManager.getInstance();
    this.navigationManager = new NavigationManager();
    this.userManager = new UserManager();
    this.notificationManager = new NotificationManager();
    this.chartManager = new ChartManager();
    this.iconManager = new IconManager();
    this.dashboardManager = DashboardManager.getInstance();
  }

  async init() {
    try {
      // Initialize core modules
      await this.componentLoader.init();
      this.navigationManager.init();
      this.userManager.init();
      this.notificationManager.init();
      this.chartManager.init();
      this.iconManager.init();

      // Show main container after components are loaded
      const appContainer = document.getElementById('app-container');
      if (appContainer) {
        appContainer.style.display = 'block';
      }

      // Hide loading screen
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }

    } catch (error) {
      console.error('Error initializing application:', error);
      // Show error message to user
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.innerHTML = `
          <div class="loading-content error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading application. Please refresh the page.</p>
          </div>
        `;
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppInitializer();
  app.init();
});
