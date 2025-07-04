/**
 * Modern Theme Manager
 * Handles theme switching, system preferences, and component theme updates
 */

class ThemeManager {
  constructor() {
    this.THEME_KEY = 'royalties-theme';
    this.observers = [];
    this.currentTheme = this.getCurrentTheme();
    
    this.init();
  }
  
  init() {
    // Listen for system preference changes
    this.setupSystemPreferenceListener();
    
    // Apply initial theme
    this.applyTheme(this.currentTheme);
    
    console.log('🎨 Theme Manager initialized with theme:', this.currentTheme);
  }
  
  getCurrentTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) return savedTheme;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Invalid theme:', theme);
      return;
    }
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Notify observers
    this.notifyObservers(theme);
    
    // Dispatch global event
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { 
        theme,
        previousTheme: this.currentTheme
      } 
    }));
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }
  
  applyTheme(theme) {
    const html = document.documentElement;
    const darkModeStyles = document.getElementById('dark-mode-styles');
    
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      if (darkModeStyles) darkModeStyles.disabled = false;
    } else {
      html.removeAttribute('data-theme');
      if (darkModeStyles) darkModeStyles.disabled = true;
    }
    
    // Update CSS custom properties for dynamic theming
    this.updateCSSVariables(theme);
  }
  
  updateCSSVariables(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      // Dark theme overrides
      root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    } else {
      // Light theme (default values from variables.css)
      root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    }
  }
  
  setupSystemPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  // Observer pattern for components that need theme updates
  addObserver(callback) {
    this.observers.push(callback);
  }
  
  removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }
  
  notifyObservers(theme) {
    this.observers.forEach(callback => {
      try {
        callback(theme);
      } catch (error) {
        console.error('Theme observer error:', error);
      }
    });
  }
  
  // Utility methods for components
  isDark() {
    return this.currentTheme === 'dark';
  }
  
  isLight() {
    return this.currentTheme === 'light';
  }
  
  getTheme() {
    return this.currentTheme;
  }
  
  // Get theme-appropriate colors
  getThemeColors() {
    const isDark = this.isDark();
    
    return {
      background: isDark ? '#0f172a' : '#ffffff',
      surface: isDark ? '#1e293b' : '#f8fafc',
      surfaceHover: isDark ? '#334155' : '#f1f5f9',
      text: isDark ? '#f1f5f9' : '#0f172a',
      textSecondary: isDark ? '#94a3b8' : '#64748b',
      border: isDark ? '#334155' : '#e2e8f0',
      primary: isDark ? '#3b82f6' : '#0066cc',
      primaryHover: isDark ? '#2563eb' : '#004499',
      success: isDark ? '#10b981' : '#059669',
      warning: isDark ? '#f59e0b' : '#d97706',
      error: isDark ? '#ef4444' : '#dc2626',
      info: isDark ? '#06b6d4' : '#0891b2'
    };
  }
  
  // Apply theme to specific element
  applyThemeToElement(element, options = {}) {
    if (!element) return;
    
    const colors = this.getThemeColors();
    const {
      includeBackground = true,
      includeText = true,
      includeBorder = true
    } = options;
    
    if (includeBackground) {
      element.style.backgroundColor = colors.surface;
    }
    
    if (includeText) {
      element.style.color = colors.text;
    }
    
    if (includeBorder) {
      element.style.borderColor = colors.border;
    }
  }
  
  // Create theme-aware CSS class
  createThemeClass(baseClass, darkVariant) {
    const className = this.isDark() ? darkVariant : baseClass;
    return className;
  }
}

// Initialize global theme manager
window.ThemeManager = ThemeManager;

// Auto-initialize if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!window.themeManager) {
        window.themeManager = new ThemeManager();
      }
    });
  } else {
    // DOM is already ready
    if (!window.themeManager) {
      window.themeManager = new ThemeManager();
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
