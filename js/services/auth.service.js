/**
 * Core authentication service for the Mining Royalties Manager
 */

import { security } from '../utils/security.js';

class AuthService {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.token = localStorage.getItem('auth_token');
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
                const userData = localStorage.getItem('user_data');
                if (userData) {
                    this.currentUser = JSON.parse(userData);
                    this.isAuthenticated = true;
                }
            }
            return true;
        } catch (error) {
            console.error('Auth service initialization error:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Attempt user login.
     *
     * !! SECURITY WARNING !!
     * This is a mock implementation for demo purposes only. In a real application,
     * the username and password should be sent to a secure backend for verification.
     * This implementation does not perform any actual authentication.
     *
     * @param {string} username - The user's username.
     * @param {string} password - The user's password.
     * @returns {Promise<boolean>} - A promise that resolves to true on successful login.
     */
    async login(username, password) {
        try {
            // Sanitize inputs
            username = security.sanitizeInput(username, 'username');

            if (!username || !password) {
                throw new Error('Username and password are required.');
            }

            // This is a mock authentication flow.
            // In a real application, you would make an API call to a secure backend here.
            // For this demo, we will simulate a successful login for any non-empty username.

            const mockUser = {
                username: username,
                role: 'Administrator', // Default role for demo
                department: 'Administration', // Default department for demo
                email: `${username}@government.sz`, // Mock email
                lastLogin: new Date().toISOString()
            };

            const authData = {
                token: 'demo_token_' + Math.random().toString(36).substr(2),
                user: mockUser
            };

            this.setAuthenticationState(authData);
            return true;
        } catch (error) {
            console.error('Login error:', error);
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
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_data', JSON.stringify(this.currentUser));
    }

    /**
     * Log out current user
     */
    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('auth_token');
        window.location.reload();
    }

    /**
     * Validate the current auth token.
     *
     * !! SECURITY WARNING !!
     * This is a mock implementation for demo purposes only. In a real application,
     * the token should be sent to a secure backend for validation.
     *
     * @returns {Promise<boolean>} - A promise that resolves to true if the token is valid.
     */
    async validateToken() {
        if (!this.token) {
            return false;
        }

        try {
            // This is a mock token validation.
            // In a real application, you would make an API call to a secure backend to validate the token.
            // For this demo, we will consider any token present as valid.
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    /**
     * Set authentication state after successful login/validation
     */
    setAuthenticationState(data) {
        this.isAuthenticated = true;
        this.currentUser = data.user;
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
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
            'Administrator': ['manage_users', 'manage_roles', 'view_audit_logs', 'manage_settings'],
            'Finance Officer': ['manage_royalties', 'view_reports', 'export_data'],
            'Auditor': ['view_audit_logs', 'export_data', 'view_reports']
        };

        const userPermissions = rolePermissions[this.currentUser.role] || [];
        return userPermissions.includes(permission);
    }
}

export const authService = new AuthService();
