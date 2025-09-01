/**
 * User Security Service
 * Handles advanced security features for user management
 */

import { dbService } from './database.service.js';
import { ErrorHandler } from '../utils/error-handler.js';

class UserSecurityService {
    constructor() {
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
        this.passwordPolicyRules = {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: true,
            maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
            preventReuse: 5 // number of previous passwords to check
        };
    }

    /**
     * Initialize security policies from a configuration object.
     * @param {object} policies - The security policies to apply.
     */
    initializeSecurityPolicies(policies) {
        if (policies.passwordPolicy) {
            this.passwordPolicyRules = { ...this.passwordPolicyRules, ...policies.passwordPolicy };
        }
        if (policies.loginAttempts) {
            this.maxLoginAttempts = policies.loginAttempts.maxAttempts || this.maxLoginAttempts;
            this.lockoutDuration = (policies.loginAttempts.lockoutDuration || 30) * 60 * 1000;
        }
        // sessionPolicy is not used in this file, but we can add it for future use
        if (policies.sessionPolicy) {
            // No properties to set for sessionPolicy in this file yet
        }
    }

    /**
     * Initialize security service
     */
    async init() {
        try {
            await this.initializeSecurityStores();
            await this.startSessionCleanup();
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to initialize security service');
        }
    }

    /**
     * Initialize security-related database stores
     */
    async initializeSecurityStores() {
        const stores = {
            loginAttempts: 'loginAttempts',
            userSessions: 'userSessions',
            passwordHistory: 'passwordHistory',
            securityNotifications: 'securityNotifications',
            auditLog: 'auditLog'
        };

        // Add stores to database service
        Object.assign(dbService.stores, stores);
    }

    /**
     * Track failed login attempt
     */
    async trackFailedLogin(username, ipAddress, userAgent) {
        try {
            const attempt = {
                username: username.toLowerCase(),
                ipAddress,
                userAgent,
                timestamp: new Date().toISOString(),
                successful: false
            };

            await dbService.add('loginAttempts', attempt);
            
            // Check if account should be locked
            const recentAttempts = await this.getRecentLoginAttempts(username);
            if (recentAttempts.length >= this.maxLoginAttempts) {
                await this.lockAccount(username);
                await this.logSecurityEvent('account_locked', username, { reason: 'Max login attempts exceeded' });
            }

            return attempt;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to track failed login');
            throw error;
        }
    }

    /**
     * Track successful login
     */
    async trackSuccessfulLogin(username, ipAddress, userAgent) {
        try {
            const attempt = {
                username: username.toLowerCase(),
                ipAddress,
                userAgent,
                timestamp: new Date().toISOString(),
                successful: true
            };

            await dbService.add('loginAttempts', attempt);
            
            // Clear failed attempts for this user
            await this.clearFailedAttempts(username);
            
            // Create user session
            await this.createUserSession(username, ipAddress, userAgent);

            return attempt;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to track successful login');
            throw error;
        }
    }

    /**
     * Get recent login attempts for a user
     */
    async getRecentLoginAttempts(username, hours = 1) {
        try {
            const allAttempts = await dbService.getAll('loginAttempts');
            const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
            
            return allAttempts.filter(attempt => 
                attempt.username.toLowerCase() === username.toLowerCase() &&
                !attempt.successful &&
                new Date(attempt.timestamp) > cutoffTime
            );
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to get recent login attempts');
            return [];
        }
    }

    /**
     * Check if account is locked
     */
    async isAccountLocked(username) {
        try {
            const recentAttempts = await this.getRecentLoginAttempts(username);
            if (recentAttempts.length >= this.maxLoginAttempts) {
                const lastAttempt = recentAttempts[recentAttempts.length - 1];
                const lockoutEnd = new Date(new Date(lastAttempt.timestamp).getTime() + this.lockoutDuration);
                return Date.now() < lockoutEnd.getTime();
            }
            return false;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to check account lock status');
            return false;
        }
    }

    /**
     * Lock user account
     */
    async lockAccount(username) {
        try {
            await this.logSecurityEvent('account_locked', username, { 
                reason: 'Exceeded maximum login attempts',
                lockoutDuration: this.lockoutDuration 
            });
            
            // Send security notification
            await this.sendSecurityNotification(username, 'account_locked');
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to lock account');
        }
    }

    /**
     * Clear failed login attempts
     */
    async clearFailedAttempts(username) {
        try {
            const allAttempts = await dbService.getAll('loginAttempts');
            const failedAttempts = allAttempts.filter(attempt => 
                attempt.username.toLowerCase() === username.toLowerCase() && 
                !attempt.successful
            );
            
            for (const attempt of failedAttempts) {
                await dbService.delete('loginAttempts', attempt.id);
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to clear failed attempts');
        }
    }

    /**
     * Create user session
     */
    async createUserSession(username, ipAddress, userAgent) {
        try {
            const session = {
                username: username.toLowerCase(),
                sessionId: this.generateSessionId(),
                ipAddress,
                userAgent,
                startTime: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                active: true
            };

            await dbService.add('userSessions', session);
            return session;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to create user session');
            throw error;
        }
    }

    /**
     * Update user session activity
     */
    async updateSessionActivity(sessionId) {
        try {
            const sessions = await dbService.getAll('userSessions');
            const session = sessions.find(s => s.sessionId === sessionId);
            
            if (session) {
                session.lastActivity = new Date().toISOString();
                await dbService.put('userSessions', session);
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to update session activity');
        }
    }

    /**
     * End user session
     */
    async endUserSession(sessionId) {
        try {
            const sessions = await dbService.getAll('userSessions');
            const session = sessions.find(s => s.sessionId === sessionId);
            
            if (session) {
                session.active = false;
                session.endTime = new Date().toISOString();
                await dbService.put('userSessions', session);
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to end user session');
        }
    }

    /**
     * Validate password against policy
     */
    validatePassword(password, username) {
        const errors = [];
        const rules = this.passwordPolicyRules;

        if (password.length < rules.minLength) {
            errors.push(`Password must be at least ${rules.minLength} characters long`);
        }

        if (rules.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (rules.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (rules.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (rules.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        // Check if password contains username
        if (username && password.toLowerCase().includes(username.toLowerCase())) {
            errors.push('Password cannot contain username');
        }

        return {
            valid: errors.length === 0,
            errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    /**
     * Calculate password strength score
     */
    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // Length bonus
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 15;
        if (password.length >= 16) score += 10;

        // Character variety bonus
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/\d/.test(password)) score += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

        // Complexity bonus
        if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) score += 10;

        let level = 'Weak';
        if (score >= 80) level = 'Very Strong';
        else if (score >= 60) level = 'Strong';
        else if (score >= 40) level = 'Medium';
        else if (score >= 20) level = 'Fair';

        return { score, level };
    }

    /**
     * Store password in history
     */
    async storePasswordHistory(username, passwordHash) {
        try {
            const historyEntry = {
                username: username.toLowerCase(),
                passwordHash,
                timestamp: new Date().toISOString()
            };

            await dbService.add('passwordHistory', historyEntry);

            // Clean up old passwords
            await this.cleanupPasswordHistory(username);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to store password history');
        }
    }

    /**
     * Check if password was recently used
     */
    async isPasswordReused(username, passwordHash) {
        try {
            const history = await dbService.getAll('passwordHistory');
            const userHistory = history
                .filter(entry => entry.username.toLowerCase() === username.toLowerCase())
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, this.passwordPolicyRules.preventReuse);

            return userHistory.some(entry => entry.passwordHash === passwordHash);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to check password reuse');
            return false;
        }
    }

    /**
     * Clean up old password history
     */
    async cleanupPasswordHistory(username) {
        try {
            const history = await dbService.getAll('passwordHistory');
            const userHistory = history
                .filter(entry => entry.username.toLowerCase() === username.toLowerCase())
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Keep only the most recent passwords up to the limit
            const toDelete = userHistory.slice(this.passwordPolicyRules.preventReuse);
            for (const entry of toDelete) {
                await dbService.delete('passwordHistory', entry.id);
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to cleanup password history');
        }
    }

    /**
     * Send security notification
     */
    async sendSecurityNotification(username, type, data = {}) {
        try {
            const notification = {
                username: username.toLowerCase(),
                type,
                message: this.getSecurityMessage(type, data),
                timestamp: new Date().toISOString(),
                read: false,
                ...data
            };

            await dbService.add('securityNotifications', notification);
            return notification;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to send security notification');
        }
    }

    /**
     * Get security message for notification type
     */
    getSecurityMessage(type, data = {}) {
        const messages = {
            account_locked: 'Your account has been locked due to multiple failed login attempts.',
            password_changed: 'Your password has been successfully changed.',
            password_expired: 'Your password has expired and must be changed.',
            suspicious_login: `Suspicious login detected from ${data.location || 'unknown location'}.`,
            account_created: 'Your account has been created successfully.',
            two_factor_enabled: 'Two-factor authentication has been enabled for your account.',
            two_factor_disabled: 'Two-factor authentication has been disabled for your account.'
        };

        return messages[type] || 'Security notification';
    }

    /**
     * Log security event for audit trail
     */
    async logSecurityEvent(eventType, username, details = {}) {
        try {
            const event = {
                eventType,
                username: username.toLowerCase(),
                timestamp: new Date().toISOString(),
                ipAddress: details.ipAddress || 'unknown',
                userAgent: details.userAgent || 'unknown',
                details: JSON.stringify(details)
            };

            await dbService.add('auditLog', event);
            return event;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to log security event');
        }
    }

    /**
     * Get user activity for monitoring
     */
    async getUserActivity(username, days = 30) {
        try {
            const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            
            const [attempts, sessions, events] = await Promise.all([
                dbService.getAll('loginAttempts'),
                dbService.getAll('userSessions'),
                dbService.getAll('auditLog')
            ]);

            const userAttempts = attempts
                .filter(a => a.username.toLowerCase() === username.toLowerCase() && new Date(a.timestamp) > cutoffDate)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const userSessions = sessions
                .filter(s => s.username.toLowerCase() === username.toLowerCase() && new Date(s.startTime) > cutoffDate)
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

            const userEvents = events
                .filter(e => e.username.toLowerCase() === username.toLowerCase() && new Date(e.timestamp) > cutoffDate)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return {
                loginAttempts: userAttempts,
                sessions: userSessions,
                securityEvents: userEvents
            };
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to get user activity');
            return { loginAttempts: [], sessions: [], securityEvents: [] };
        }
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Start cleanup routine for expired sessions
     */
    async startSessionCleanup() {
        setInterval(async () => {
            try {
                await this.cleanupExpiredSessions();
            } catch (error) {
                ErrorHandler.handle(error, 'Session cleanup failed');
            }
        }, 60 * 60 * 1000); // Run every hour
    }

    /**
     * Clean up expired sessions
     */
    async cleanupExpiredSessions() {
        try {
            const sessions = await dbService.getAll('userSessions');
            const expiredTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
            
            for (const session of sessions) {
                if (session.active && new Date(session.lastActivity) < expiredTime) {
                    session.active = false;
                    session.endTime = new Date().toISOString();
                    session.endReason = 'expired';
                    await dbService.put('userSessions', session);
                }
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to cleanup expired sessions');
        }
    }
}

export const userSecurityService = new UserSecurityService();
