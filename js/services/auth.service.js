/**
 * Core authentication service for the Mining Royalties Manager
 * Supports both API-based authentication and demo mode fallback
 */

import { security } from "../utils/security.js";
import { logger } from "../utils/logger.js";
import { config } from "../utils/config.js";
import { apiService } from "./api.service.js";
import { auditService } from "./audit.service.js";

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.token = localStorage.getItem("auth_token");

    // Enhanced session and security tracking
    this.sessions = new Map();
    this.failedAttempts = new Map();
    this.securityEvents = [];
    this.twoFactorCodes = new Map();
    this.deviceFingerprints = new Map();

    this.authConfig = {
      maxFailedAttempts: 5,
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
      maxConcurrentSessions: 3,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      },
      twoFactorEnabled: false,
    };

    // Demo credentials
    this.demoUsers = {
      admin: {
        password:
          "$2a$10$ZdYA0hNx6Hd18t1fr7t0fu6SOVfjmVKedrQluxCYXr42hSVNKFi92", // admin123
        role: "Administrator",
        department: "Administration",
        email: "admin@government.sz",
      },
      manager: {
        password:
          "$2a$10$4yfsoB4fV5IxI9R44p/arejw8EyOpHStbSaxIbqDzJh./hgbj5JMS", // manager123
        role: "Manager",
        department: "Operations",
        email: "manager@government.sz",
      },
      auditor: {
        password:
          "$2a$10$xYv8kqffM0/ScVvQEXWNX.73GUWRK0YCg5YDnxB2HejFWfBcB3/X6", // auditor123
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
      this.loadStoredSecurityData();
      this.startSessionMonitoring();

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
   * Load stored security data (sessions, attempts, events)
   */
  loadStoredSecurityData() {
    try {
      const storedSessions = localStorage.getItem("auth_sessions");
      const storedFailedAttempts = localStorage.getItem("failed_attempts");
      const storedSecurityEvents = localStorage.getItem("security_events");

      if (storedSessions) {
        const sessions = JSON.parse(storedSessions);
        sessions.forEach((session) => {
          this.sessions.set(session.id, session);
        });
      }

      if (storedFailedAttempts) {
        const attempts = JSON.parse(storedFailedAttempts);
        Object.entries(attempts).forEach(([username, data]) => {
          this.failedAttempts.set(username, data);
        });
      }

      if (storedSecurityEvents) {
        this.securityEvents = JSON.parse(storedSecurityEvents);
      }
    } catch (error) {
      logger.error("Error loading stored security data", error);
    }
  }

  /**
   * Save security data to local storage
   */
  saveSecurityData() {
    try {
      localStorage.setItem(
        "auth_sessions",
        JSON.stringify(Array.from(this.sessions.values())),
      );
      localStorage.setItem(
        "failed_attempts",
        JSON.stringify(Object.fromEntries(this.failedAttempts)),
      );
      localStorage.setItem(
        "security_events",
        JSON.stringify(this.securityEvents.slice(-100)),
      );
    } catch (error) {
      logger.error("Error saving security data", error);
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
  async login(username, password, twoFactorCode = null, rememberMe = false) {
    try {
      // Check if account is locked
      const lockoutStatus = this.checkAccountLockout(username);
      if (lockoutStatus.isLocked) {
        const msg = `Account locked. Try again in ${Math.ceil(lockoutStatus.remainingTime / 60000)} minutes.`;
        logger.warn(msg, { username });
        throw new Error(msg);
      }

      // Sanitize inputs
      username = security.sanitizeInput(username, "username");

      // Check if API authentication is available
      const useApi = await this.checkApiAvailability();
      logger.debug('Auth decision', {
        useApi,
        env: config.get('env'),
        demoModeEnabled: config.get('auth.enableDemoMode'),
        baseUrl: config.get('api.baseUrl')
      });

      let loginResult = false;
      let userData = null;

      if (useApi) {
        try {
          // Try API authentication
          logger.debug('Attempting API authentication', { username });
          const authData = await apiService.post('/auth/login', {
            username,
            password,
            twoFactorCode
          });

          userData = {
            token: authData.token,
            user: authData.user,
            refreshToken: authData.refreshToken
          };
          loginResult = true;
          logger.info('API authentication successful', { username });
        } catch (apiError) {
          // If API fails in development, fallback to demo mode
          if (config.isDevelopment()) {
            logger.warn('API authentication failed, falling back to demo mode', apiError);
            loginResult = await this.loginDemo(username, password);
          } else {
            this.recordFailedAttempt(username);
            throw apiError;
          }
        }
      } else {
        // Use demo mode authentication
        logger.debug('Proceeding with demo authentication', { username });
        loginResult = await this.loginDemo(username, password);
      }

      if (loginResult) {
        // Handle successful login
        if (userData) {
          this.setAuthenticationState(userData);
        }

        // Handle 2FA check for demo/local success if not already handled by API
        if (!userData && this.authConfig.twoFactorEnabled && this.isUserTwoFactorEnabled(username)) {
          if (!twoFactorCode) {
            const tempToken = this.generateTempToken();
            this.storePendingAuth(tempToken, username);
            return { requiresTwoFactor: true, tempToken };
          }
          if (!this.verifyTwoFactorCode(username, twoFactorCode)) {
            this.recordFailedAttempt(username);
            throw new Error("Invalid two-factor authentication code");
          }
        }

        const sessionId = this.createSession(username, rememberMe);
        await auditService.log('Login', 'Security', { username, success: true });

        this.recordSecurityEvent("login_success", username, {
          sessionId,
          deviceFingerprint: this.generateDeviceFingerprint(),
          rememberMe,
        });

        this.saveSecurityData();
        return { success: true, sessionId };
      } else {
        this.recordFailedAttempt(username);
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      await auditService.log('Login Failed', 'Security', { username, error: error.message }, 'Failed');
      this.saveSecurityData();
      logger.error("Login process failed", error);
      throw error;
    }
  }

  /**
   * Demo mode authentication (development only)
   * @private
   */
  async loginDemo(username, password) {
    if (config.isProduction()) {
      logger.fatal('CRITICAL: Demo mode authentication in production!', new Error('Security vulnerability'));
      throw new Error('Demo mode not available in production');
    }

    const user = this.demoUsers[username];

    if (!window.bcrypt) {
      const bcryptError = new Error("Auth error: bcrypt library not loaded.");
      logger.error("Bcrypt dependency missing", bcryptError);
      throw bcryptError;
    }

    if (!user || !window.bcrypt.compareSync(password, user.password)) {
      return false;
    }

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
    const username = this.currentUser?.username;

    if (this.token && !this.token.startsWith('demo_token_')) {
      try {
        await apiService.post('/auth/logout', {});
      } catch (error) {
        logger.warn('API logout failed', error);
      }
    }

    this.isAuthenticated = false;
    this.currentUser = null;
    this.token = null;

    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("current_session_id");

    if (apiService?.cancelAllRequests) {
      apiService.cancelAllRequests();
    }

    this.recordSecurityEvent("logout", username);
    this.saveSecurityData();

    window.location.reload();
  }

  /**
   * Check account lockout status
   */
  checkAccountLockout(username) {
    const attempts = this.failedAttempts.get(username);
    if (!attempts) return { isLocked: false };

    const { count, lastAttempt } = attempts;
    const timeSinceLastAttempt = Date.now() - lastAttempt;

    if (count >= this.authConfig.maxFailedAttempts && timeSinceLastAttempt < this.authConfig.lockoutDuration) {
      return {
        isLocked: true,
        remainingTime: this.authConfig.lockoutDuration - timeSinceLastAttempt,
      };
    }

    if (count >= this.authConfig.maxFailedAttempts && timeSinceLastAttempt >= this.authConfig.lockoutDuration) {
      this.failedAttempts.delete(username);
    }

    return { isLocked: false };
  }

  /**
   * Record failed login attempt
   */
  recordFailedAttempt(username) {
    const current = this.failedAttempts.get(username) || { count: 0, lastAttempt: 0 };
    current.count += 1;
    current.lastAttempt = Date.now();
    this.failedAttempts.set(username, current);
    this.saveSecurityData();
  }

  /**
   * Session Management
   */
  createSession(username, rememberMe = false) {
    const sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    const session = {
      id: sessionId,
      username,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : this.authConfig.sessionTimeout),
      deviceFingerprint: this.generateDeviceFingerprint(),
      userAgent: navigator.userAgent,
      isActive: true,
    };

    // Enforce concurrent limits
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.username === username && s.isActive)
      .sort((a, b) => b.lastActivity - a.lastActivity);

    if (userSessions.length >= this.authConfig.maxConcurrentSessions) {
      const sessionsToRemove = userSessions.slice(this.authConfig.maxConcurrentSessions - 1);
      sessionsToRemove.forEach(s => this.sessions.delete(s.id));
    }

    this.sessions.set(sessionId, session);
    localStorage.setItem("current_session_id", sessionId);
    return sessionId;
  }

  startSessionMonitoring() {
    setInterval(() => {
      const now = Date.now();
      const expired = [];
      this.sessions.forEach((s, id) => {
        if (s.expiresAt < now) expired.push(id);
      });
      expired.forEach(id => this.sessions.delete(id));

      const currentId = localStorage.getItem("current_session_id");
      if (currentId && this.sessions.has(currentId)) {
        const s = this.sessions.get(currentId);
        s.lastActivity = now;
        this.sessions.set(currentId, s);
      }
      if (expired.length > 0) this.saveSecurityData();
    }, 60000);
  }

  /**
   * Security & Utilities
   */
  generateDeviceFingerprint() {
    return Math.abs(navigator.userAgent.length + navigator.language.length).toString(36);
  }

  recordSecurityEvent(type, username, details = {}) {
    const event = {
      id: Date.now() + Math.random(),
      type,
      username,
      timestamp: Date.now(),
      details: { ...details, timestamp: new Date().toISOString() }
    };
    this.securityEvents.unshift(event);
    if (this.securityEvents.length > 1000) this.securityEvents.pop();
  }

  isUserTwoFactorEnabled(username) {
    const userData = this.twoFactorCodes.get(username);
    return userData && userData.isEnabled;
  }

  async verifyTwoFactorCode(username, code) {
    const userData = this.twoFactorCodes.get(username);
    if (!userData) return false;
    if (userData.backupCodes?.includes(code)) {
      userData.backupCodes = userData.backupCodes.filter(c => c !== code);
      return true;
    }
    return this.generateSimpleTOTP(userData.secret) === code;
  }

  /**
   * Enable 2FA for a user (called during setup)
   */
  async enable2FA(username, code) {
    const userData = this.twoFactorCodes.get(username);
    if (!userData) {
      throw new Error("2FA setup not initialized");
    }

    if (this.verifyTwoFactorCode(username, code)) {
      userData.isEnabled = true;
      this.twoFactorCodes.set(username, userData);
      this.saveSecurityData();
      return true;
    } else {
      throw new Error("Invalid verification code");
    }
  }

  /**
   * Generate password reset token (Mock)
   */
  async generatePasswordResetToken(username, email) {
    // In a real app, this would call the API
    logger.info('Password reset requested', { username, email });
    const token = Math.random().toString(36).substr(2, 12).toUpperCase();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.debug('Generated reset token', { token });
    return token;
  }

  generateSimpleTOTP(secret) {
    const timeWindow = Math.floor(Date.now() / 30000);
    const hash = (secret + timeWindow).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    return (Math.abs(hash) % 1000000).toString().padStart(6, "0");
  }

  generateTempToken() {
    return "temp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  storePendingAuth(tempToken, username) {
    localStorage.setItem("pending_auth", JSON.stringify({ tempToken, username, timestamp: Date.now() }));
  }

  /**
   * Validate current auth token
   */
  async validateToken() {
    if (!this.token) return false;

    try {
      const useApi = !this.token.startsWith("demo_token_") && await this.checkApiAvailability();

      if (useApi) {
        try {
          const response = await apiService.get('/auth/validate');
          if (response.valid && response.user) {
            this.setAuthenticationState({ token: this.token, user: response.user });
            return true;
          }
          return false;
        } catch (apiError) {
          if (apiError.status === 401) {
            return await apiService.refreshToken();
          }
          logger.warn('API token validation failed', apiError);
          return false;
        }
      } else {
        if (!this.token.startsWith("demo_token_")) return false;
        const userData = localStorage.getItem("user_data");
        if (userData) {
          this.setAuthenticationState({ token: this.token, user: JSON.parse(userData) });
          return true;
        }
        return false;
      }
    } catch (error) {
      logger.error("Token validation error", error);
      return false;
    }
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  hasPermission(permission) {
    if (!this.currentUser) return false;
    const rolePermissions = {
      Administrator: ["manage_users", "manage_roles", "view_audit_logs", "manage_settings"],
      "Finance Officer": ["manage_royalties", "view_reports", "export_data"],
      Auditor: ["view_audit_logs", "export_data", "view_reports"],
    };
    return (rolePermissions[this.currentUser.role] || []).includes(permission);
  }
}

export const authService = new AuthService();
