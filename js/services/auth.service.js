/**
 * Core authentication service for the Mining Royalties Manager
 */

import { security } from "../utils/security.js";

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
      console.error("Auth service initialization error:", error);
      this.logout();
      return false;
    }
  }

  /**
   * Attempt user login for demo version
   */
  async login(username, password) {
    try {
      // Sanitize inputs
      username = security.sanitizeInput(username, "username");

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
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
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
    localStorage.setItem("user_data", JSON.stringify(this.currentUser));
  }

  /**
   * Log out current user
   */
  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem("auth_token");
    window.location.reload();
  }

  /**
   * Validate current auth token
   */
  async validateToken() {
    if (!this.token) return false;

    try {
      // For demo, validate token format and expiration
      if (!this.token.startsWith("demo_token_")) {
        throw new Error("Invalid token format");
      }

      // Simulate token validation
      const mockData = {
        token: this.token,
        user: this.currentUser || {
          username: "admin",
          role: "Administrator",
          department: "Administration",
          email: "admin@government.sz",
          lastLogin: new Date().toISOString(),
        },
      };

      this.setAuthenticationState(mockData);
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
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
