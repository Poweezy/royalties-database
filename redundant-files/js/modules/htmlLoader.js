export class HTMLLoader {
  constructor() {
    this.loadedComponents = new Map();
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log('Initializing HTMLLoader...');
      
      // Load essential components
      await this.loadLoginComponent();
      await this.loadSidebarComponent();
      
      this.isInitialized = true;
      console.log('HTMLLoader initialized successfully');
    } catch (error) {
      console.error('Failed to initialize HTMLLoader:', error);
      throw error;
    }
  }

  async loadComponent(componentName, targetElementId = null) {
    try {
      if (this.loadedComponents.has(componentName)) {
        return this.loadedComponents.get(componentName);
      }

      const response = await fetch(`components/${componentName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentName}`);
      }

      const html = await response.text();
      this.loadedComponents.set(componentName, html);

      if (targetElementId) {
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
          targetElement.innerHTML = html;
        }
      }

      console.log(`Component loaded: ${componentName}`);
      return html;
    } catch (error) {
      console.error(`Error loading component ${componentName}:`, error);
      throw error;
    }
  }

  async loadLoginComponent() {
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
      await this.loadComponent('login', 'login-section');
    }
  }

  async loadSidebarComponent() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      await this.loadComponent('sidebar', 'sidebar');
    }
  }

  async showSection(sectionId) {
    try {
      // Hide all existing sections
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.innerHTML = '';
      }

      // Load and display the requested section
      await this.loadComponent(sectionId, 'main-content');
      
      // Update navigation state
      this.updateNavigationState(sectionId);
      
      console.log(`Section displayed: ${sectionId}`);
    } catch (error) {
      console.error(`Failed to show section ${sectionId}:`, error);
    }
  }

  updateNavigationState(activeSection) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeSection}`) {
        link.classList.add('active');
      }
    });
  }

  // Method to preload components
  async preloadComponents(componentNames) {
    const loadPromises = componentNames.map(name => this.loadComponent(name));
    await Promise.all(loadPromises);
    console.log('Components preloaded:', componentNames);
  }

  // Method to get component HTML without loading to DOM
  async getComponentHTML(componentName) {
    return await this.loadComponent(componentName);
  }
}

// Make globally available
window.HTMLLoader = HTMLLoader;
