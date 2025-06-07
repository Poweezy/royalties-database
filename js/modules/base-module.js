export class BaseModule {
  constructor(templateLoader, moduleId) {
    this.templateLoader = templateLoader;
    this.moduleId = moduleId;
    this.isLoaded = false;
    this.isInitialized = false;
    this.eventListeners = [];
    this.container = null;
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log(`Initializing module: ${this.moduleId}`);
    await this.onInit();
    this.isInitialized = true;
  }

  async load() {
    if (this.isLoaded) return;
    
    console.log(`Loading module: ${this.moduleId}`);
    
    // Get main content container
    this.container = document.getElementById('main-content');
    if (!this.container) {
      throw new Error('Main content container not found');
    }

    // Clear existing content
    this.container.innerHTML = '';

    // Load module content
    await this.onLoad();
    this.setupEventListeners();
    this.isLoaded = true;
  }

  async unload() {
    if (!this.isLoaded) return;
    
    console.log(`Unloading module: ${this.moduleId}`);
    this.removeEventListeners();
    await this.onUnload();
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.isLoaded = false;
  }

  // Override these methods in derived classes
  async onInit() {}
  async onLoad() {}
  async onUnload() {}
  setupEventListeners() {}

  addEventListener(elementOrSelector, event, handler, options = {}) {
    let element;
    
    if (typeof elementOrSelector === 'string') {
      element = document.getElementById(elementOrSelector) || 
                document.querySelector(elementOrSelector);
    } else {
      element = elementOrSelector;
    }
    
    if (element) {
      element.addEventListener(event, handler, options);
      this.eventListeners.push({ element, event, handler, options });
    } else {
      console.warn(`Element not found: ${elementOrSelector}`);
    }
  }

  removeEventListeners() {
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(event, handler, options);
      }
    });
    this.eventListeners = [];
  }

  async loadTemplate(templatePath) {
    try {
      if (!this.container) {
        throw new Error('Container not available for template loading');
      }
      
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${templatePath}`);
      }
      
      const template = await response.text();
      this.container.innerHTML = template;
      return template;
    } catch (error) {
      console.error('Template loading failed:', error);
      // Fallback to basic content
      this.container.innerHTML = this.getFallbackContent();
      throw error;
    }
  }

  getFallbackContent() {
    return `
      <div class="error-container">
        <h2>Module: ${this.moduleId}</h2>
        <p>Content is being loaded...</p>
      </div>
    `;
  }

  createSection(sectionId, content) {
    if (!this.container) return null;
    
    const section = document.createElement('section');
    section.id = sectionId;
    section.innerHTML = content;
    this.container.appendChild(section);
    return section;
  }

  showNotification(message, type = 'info') {
    // Basic notification implementation
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${this.getIconForType(type)}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  getIconForType(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }
}
