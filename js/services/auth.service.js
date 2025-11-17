/**
 * Core authentication service for the Mining Royalties Manager
 * Supports both API-based authentication and demo mode fallback
 */

import { security } from "../utils/security.js";
import { logger } from "../utils/logger.js";
import { config } from "../utils/config.js";
import { apiService } from "./api.service.js";

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.token = localStorage.getItem("auth_token");

    // Demo credentials
    this.demoUsers = {
      admin: {
        password:
          "$2a$10$cyE37fP/7BPpcc5wwiq8wOcAnFeCyMzuBRs/eiFkPRkP275q9y2Ci",
        role: "Administrator",
        department: "Administration",
        email: "admin@government.sz",
      },
      finance: {
        password:
          "$2a$10$cyE37fP/7BPpcc5wwiq8wOcAnFeCyMzuBRs/eiFkPRkP275q9y2Ci",
        role: "Finance Officer",
        department: "Finance",
        email: "finance@government.sz",
      },
      auditor: {
        password:
          "$2a$10$cyE37fP/7BPpcc5wwiq8wOcAnFeCyMzuBRs/eiFkPRkP275q9y2Ci",
        role: "Auditor",
        department: "Audit & Compliance",
        email: "auditor@government.sz",
      },
    };
  }

  /**
   * Get the current authenticated user
   * @returns {Object|null} The current user object or null if not authenticated
   */
  getCurrentUser() {
    if (!this.isAuthenticated || !this.currentUser) {
      return null;
    }
    return { ...this.currentUser }; // Return a copy to prevent direct modification
  }

  /**
   * Initialize authentication state
   */
  async init() {
    try {
      if (this.token) {
        const isValid = await this.validateToken();
        if (!isValid) {
          this.logout();
          return false;
        }

        // Restore user data from localStorage
        const userData = localStorage.getItem("user_data");
        if (userData) {
          this.currentUser = JSON.parse(userData);
          this.isAuthenticated = true;
        }
      }
      return true;
    } catch (error) {
      logger.error("Auth service initialization error", error);
      this.logout();
      return false;
    }
  }

  /**
   * Check if API authentication is available
   * @returns {boolean} True if API is available
   */
  async checkApiAvailability() {
    // Skip API check if demo mode is explicitly enabled
    if (config.get('auth.enableDemoMode') === true) {
      return false;
    }

    // In production, always try API first
    if (config.isProduction()) {
      return true;
    }

    // In development, check if API is available
    try {
      const apiUrl = config.get('api.baseUrl');
      if (!apiUrl || apiUrl.includes('localhost')) {
        return false; // Assume localhost API is not ready
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Attempt user login
   * Tries API authentication first, falls back to demo mode in development
   */
  async login(username, password) {
    try {
      // Sanitize inputs
      username = security.sanitizeInput(username, "username");

      // Check if API authentication is available
      const useApi = await this.checkApiAvailability();

      if (useApi) {
        try {
          // Try API authentication
          logger.debug('Attempting API authentication');
          const authData = await apiService.post('/auth/login', {
            username,
            password,
          });

          // Store refresh token if provided
          if (authData.refreshToken) {
            localStorage.setItem('refresh_token', authData.refreshToken);
          }

          // Set authentication state
          this.setAuthenticationState({
            token: authData.token,
            user: authData.user,
          });

          logger.info('API authentication successful', { username });
          return true;
        } catch (apiError) {
          // If API fails in development, fallback to demo mode
          if (config.isDevelopment()) {
            logger.warn('API authentication failed, falling back to demo mode', apiError);
            return await this.loginDemo(username, password);
          }
          // In production, rethrow API error
          throw apiError;
        }
      } else {
        // Use demo mode authentication
        return await this.loginDemo(username, password);
      }
    } catch (error) {
      logger.error("Login error", error);
      throw error;
    }
  }

  /**
   * Demo mode authentication (development only)
   * @private
   */
  async loginDemo(username, password) {
    // Warn if using demo mode
    if (config.isProduction()) {
      logger.fatal('CRITICAL: Demo mode authentication in production!', new Error('Security vulnerability'));
      throw new Error('Demo mode not available in production');
    }

    // Demo authentication
    const user = this.demoUsers[username];
    if (!user || !window.bcrypt.compareSync(password, user.password)) {
      throw new Error("Invalid credentials");
    }

    // Create mock auth data
    const authData = {
      token: "demo_token_" + Math.random().toString(36).substr(2),
      user: {
        username,
        role: user.role,
        department: user.department,
        email: user.email,
        lastLogin: new Date().toISOString(),
      },
    };

    this.setAuthenticationState(authData);
    logger.debug('Demo authentication successful', { username });
    return true;
  }

  /**
   * Set the authentication state after successful login
   * @param {Object} authData - The authentication data containing token and user info
   */
  setAuthenticationState(authData) {
    this.token = authData.token;
    this.currentUser = authData.user;
    this.isAuthenticated = true;
    
    // Store tokens (in production, consider using httpOnly cookies instead)
    localStorage.setItem("auth_token", this.token);
    if (authData.refreshToken) {
      localStorage.setItem("refresh_token", authData.refreshToken);
    }
    localStorage.setItem("user_data", JSON.stringify(this.currentUser));
  }

  /**
   * Log out current user
   */
  async logout() {
    // Try to call API logout endpoint if authenticated via API
    if (this.token && !this.token.startsWith('demo_token_')) {
      try {
        await apiService.post('/auth/logout', {});
      } catch (error) {
        // Continue with logout even if API call fails
        logger.warn('API logout failed, continuing with local logout', error);
      }
    }

    // Clear authentication state
    this.isAuthenticated = false;
    this.currentUser = null;
    this.token = null;
    
    // Clear all auth-related storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    
    // Cancel all pending API requests
    if (apiService && typeof apiService.cancelAllRequests === 'function') {
      apiService.cancelAllRequests();
    }
    
    // Reload page
    window.location.reload();
  }

  /**
   * Validate current auth token
   * Tries API validation first, falls back to demo mode validation
   */
  async validateToken() {
    if (!this.token) return false;

    try {
      // Check if using API token
      const useApi = !this.token.startsWith("demo_token_") && await this.checkApiAvailability();

      if (useApi) {
        try {
          // Try API token validation
          const response = await apiService.get('/auth/validate');
          if (response.valid && response.user) {
            this.setAuthenticationState({
              token: this.token,
              user: response.user,
            });
            return true;
          }
          return false;
        } catch (apiError) {
          // If API validation fails, try token refresh
          if (apiError.status === 401) {
            const refreshed = await apiService.refreshToken();
            if (refreshed) {
              return true;
            }
          }
          // API validation failed
          logger.warn('API token validation failed', apiError);
          return false;
        }
      } else {
        // Demo token validation
        if (!this.token.startsWith("demo_token_")) {
          return false;
        }

        // Restore user data if available
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const mockData = {
            token: this.token,
            user: JSON.parse(userData),
          };
          this.setAuthenticationState(mockData);
          return true;
        }

        // Fallback to admin user for demo tokens
        const mockData = {
          token: this.token,
          user: {
            username: "admin",
            role: "Administrator",
            department: "Administration",
            email: "admin@government.sz",
            lastLogin: new Date().toISOString(),
          },
        };

        this.setAuthenticationState(mockData);
        return true;
      }
    } catch (error) {
      logger.error("Token validation error", error);
      return false;
    }
  }

  /**
   * Check if user has required role
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  /**
   * Check if user has required permission based on role
   */
  hasPermission(permission) {
    if (!this.currentUser) return false;

    // Demo permission mapping
    const rolePermissions = {
      Administrator: [
        "manage_users",
        "manage_roles",
        "view_audit_logs",
        "manage_settings",
      ],
      "Finance Officer": ["manage_royalties", "view_reports", "export_data"],
      Auditor: ["view_audit_logs", "export_data", "view_reports"],
    };

    const userPermissions = rolePermissions[this.currentUser.role] || [];
    return userPermissions.includes(permission);
  }
}

export const authService = new AuthService();
