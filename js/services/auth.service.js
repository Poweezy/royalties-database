import { security } from "../utils/security.js";

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.pending2FAUser = null; // For 2FA flow
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

  getCurrentUser() {
    if (!this.isAuthenticated || !this.currentUser) {
      return null;
    }
    return { ...this.currentUser };
  }

  async init() {
    try {
      if (this.token) {
        const isValid = await this.validateToken();
        if (!isValid) {
          this.logout();
          return false;
        }
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

  async login(username, password) {
    try {
      username = security.sanitizeInput(username, "username");
      const user = this.demoUsers[username];
      if (!user || !window.bcrypt.compareSync(password, user.password)) {
        throw new Error("Invalid credentials");
      }
      // Store user for 2FA verification instead of finalizing login
      this.pending2FAUser = {
        username,
        role: user.role,
        department: user.department,
        email: user.email,
        lastLogin: new Date().toISOString(),
      };
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async verify2FA(code) {
    if (!this.pending2FAUser) {
      throw new Error("No user pending 2FA verification.");
    }
    // For demo, any 6-digit code is valid
    if (!/^\d{6}$/.test(code)) {
      throw new Error("Invalid 2FA code format.");
    }

    const authData = {
      token: "demo_token_" + Math.random().toString(36).substr(2),
      user: this.pending2FAUser,
    };

    this.setAuthenticationState(authData);
    this.pending2FAUser = null; // Clear pending user
    return true;
  }

  setAuthenticationState(authData) {
    this.token = authData.token;
    this.currentUser = authData.user;
    this.isAuthenticated = true;
    localStorage.setItem("auth_token", this.token);
    localStorage.setItem("user_data", JSON.stringify(this.currentUser));
  }

  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.pending2FAUser = null;
    this.token = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data"); // Also remove user data
    window.location.reload();
  }

  async validateToken() {
    if (!this.token) return false;
    try {
      if (!this.token.startsWith("demo_token_")) {
        throw new Error("Invalid token format");
      }
      const userData = localStorage.getItem("user_data");
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;
      } else {
        // If there's a token but no user data, something is wrong.
        throw new Error("Inconsistent auth state.");
      }
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  hasPermission(permission) {
    if (!this.currentUser) return false;
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
