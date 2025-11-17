/**
 * Application Configuration Manager
 * Centralized configuration with environment variable support
 * 
 * Production-ready configuration management with:
 * - Environment-based settings
 * - Default values
 * - Type validation
 * - Security best practices
 */

class Config {
  constructor() {
    this.env = this.detectEnvironment();
    this.config = this.loadConfig();
  }

  /**
   * Detect current environment
   * @returns {string} Environment name (development, staging, production)
   */
  detectEnvironment() {
    // Check for explicit environment variable
    if (typeof window !== 'undefined' && window.__ENV__) {
      return window.__ENV__.NODE_ENV || 'development';
    }
    
    // Check hostname for environment detection
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      }
      if (hostname.includes('staging') || hostname.includes('stage')) {
        return 'staging';
      }
      if (hostname.includes('prod') || hostname.includes('production')) {
        return 'production';
      }
    }
    
    return 'development';
  }

  /**
   * Load configuration from environment variables and defaults
   * @returns {Object} Configuration object
   */
  loadConfig() {
    // Get environment variables from window or process
    const env = typeof window !== 'undefined' && window.__ENV__ ? window.__ENV__ : {};
    
    const config = {
      // Environment
      env: this.env,
      isDevelopment: this.env === 'development',
      isStaging: this.env === 'staging',
      isProduction: this.env === 'production',

      // API Configuration
      api: {
        baseUrl: env.REACT_APP_API_URL || env.VITE_API_URL || 
                (this.env === 'production' ? '/api' : 'http://localhost:3000/api'),
        timeout: parseInt(env.REACT_APP_API_TIMEOUT || env.VITE_API_TIMEOUT || '30000', 10),
        retryAttempts: parseInt(env.REACT_APP_API_RETRY || env.VITE_API_RETRY || '3', 10),
        retryDelay: parseInt(env.REACT_APP_API_RETRY_DELAY || env.VITE_API_RETRY_DELAY || '1000', 10),
      },

      // Authentication Configuration
      auth: {
        tokenStorageKey: 'auth_token',
        userStorageKey: 'user_data',
        sessionTimeout: parseInt(env.REACT_APP_SESSION_TIMEOUT || env.VITE_SESSION_TIMEOUT || '3600000', 10), // 1 hour
        refreshTokenInterval: parseInt(env.REACT_APP_REFRESH_INTERVAL || env.VITE_REFRESH_INTERVAL || '1800000', 10), // 30 min
        enableRememberMe: env.REACT_APP_REMEMBER_ME !== 'false',
        // WARNING: Demo credentials should NEVER be in production
        enableDemoMode: this.env === 'development' && env.REACT_APP_DEMO_MODE === 'true',
      },

      // Security Configuration
      security: {
        enableCSP: env.REACT_APP_ENABLE_CSP !== 'false',
        enableHTTPSOnly: this.env === 'production',
        enableSecureCookies: this.env === 'production',
        maxLoginAttempts: parseInt(env.REACT_APP_MAX_LOGIN_ATTEMPTS || env.VITE_MAX_LOGIN_ATTEMPTS || '5', 10),
        lockoutDuration: parseInt(env.REACT_APP_LOCKOUT_DURATION || env.VITE_LOCKOUT_DURATION || '900000', 10), // 15 min
      },

      // Feature Flags
      features: {
        enableOfflineMode: env.REACT_APP_OFFLINE_MODE !== 'false',
        enablePushNotifications: env.REACT_APP_PUSH_NOTIFICATIONS === 'true',
        enableAnalytics: this.env === 'production' && env.REACT_APP_ANALYTICS !== 'false',
        enableErrorReporting: env.REACT_APP_ERROR_REPORTING !== 'false',
      },

      // Logging Configuration
      logging: {
        level: env.REACT_APP_LOG_LEVEL || env.VITE_LOG_LEVEL || 
               (this.env === 'production' ? 'error' : 'debug'),
        enableConsole: this.env !== 'production',
        enableRemoteLogging: this.env === 'production',
        remoteLoggingEndpoint: env.REACT_APP_LOG_ENDPOINT || env.VITE_LOG_ENDPOINT || '/api/logs',
        maxLogEntries: parseInt(env.REACT_APP_MAX_LOG_ENTRIES || env.VITE_MAX_LOG_ENTRIES || '100', 10),
      },

      // Performance Configuration
      performance: {
        enableServiceWorker: env.REACT_APP_SERVICE_WORKER !== 'false',
        enableCache: env.REACT_APP_CACHE !== 'false',
        cacheVersion: env.REACT_APP_CACHE_VERSION || env.VITE_CACHE_VERSION || '1.0.0',
        paginationDefaultSize: parseInt(env.REACT_APP_PAGE_SIZE || env.VITE_PAGE_SIZE || '10', 10),
        debounceDelay: parseInt(env.REACT_APP_DEBOUNCE_DELAY || env.VITE_DEBOUNCE_DELAY || '300', 10),
      },

      // Analytics Configuration (if enabled)
      analytics: {
        googleAnalyticsId: env.REACT_APP_GA_ID || env.VITE_GA_ID || '',
        enableTracking: this.env === 'production' && env.REACT_APP_GA_ID,
      },

      // Error Reporting Configuration (if enabled)
      errorReporting: {
        sentryDsn: env.REACT_APP_SENTRY_DSN || env.VITE_SENTRY_DSN || '',
        enableReporting: this.env === 'production' && env.REACT_APP_SENTRY_DSN,
        environment: this.env,
        release: env.REACT_APP_VERSION || env.VITE_VERSION || '1.0.0',
      },

      // Database Configuration
      database: {
        name: env.REACT_APP_DB_NAME || env.VITE_DB_NAME || 'RoyaltiesDB',
        version: parseInt(env.REACT_APP_DB_VERSION || env.VITE_DB_VERSION || '11', 10),
      },

      // Application Meta
      app: {
        name: 'Mining Royalties Manager',
        version: env.REACT_APP_VERSION || env.VITE_VERSION || '1.0.0',
        supportEmail: env.REACT_APP_SUPPORT_EMAIL || env.VITE_SUPPORT_EMAIL || 'support@government.sz',
      },
    };

    // Validate critical configuration
    this.validateConfig(config);

    return config;
  }

  /**
   * Validate critical configuration values
   * @param {Object} config - Configuration object to validate
   */
  validateConfig(config) {
    const errors = [];

    // Production environment checks
    if (config.isProduction) {
      if (config.auth.enableDemoMode) {
        errors.push('CRITICAL: Demo mode must be disabled in production');
      }
      if (!config.security.enableHTTPSOnly) {
        errors.push('WARNING: HTTPS should be enforced in production');
      }
      if (!config.security.enableSecureCookies) {
        errors.push('WARNING: Secure cookies should be enabled in production');
      }
    }

    // Log validation errors
    if (errors.length > 0) {
      console.error('Configuration Validation Errors:', errors);
      if (config.isProduction) {
        throw new Error(`Invalid production configuration: ${errors.join(', ')}`);
      }
    }
  }

  /**
   * Get configuration value by path
   * @param {string} path - Dot-separated path to config value (e.g., 'api.baseUrl')
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Configuration value
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Get all configuration
   * @returns {Object} Complete configuration object
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Check if feature is enabled
   * @param {string} feature - Feature name
   * @returns {boolean} True if feature is enabled
   */
  isFeatureEnabled(feature) {
    return this.get(`features.${feature}`, false);
  }

  /**
   * Check if in production mode
   * @returns {boolean} True if production environment
   */
  isProduction() {
    return this.config.isProduction;
  }

  /**
   * Check if in development mode
   * @returns {boolean} True if development environment
   */
  isDevelopment() {
    return this.config.isDevelopment;
  }
}

// Create and export singleton instance
export const config = new Config();

// Export default config for backward compatibility
export default config;


