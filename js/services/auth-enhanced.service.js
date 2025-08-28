/**
 * Enhanced Authentication Service
 * Advanced security features including 2FA, session management, and security monitoring
 */

import { authService } from './auth.service.js';
import { ErrorHandler } from '../utils/error-handler.js';

class EnhancedAuthService {
    constructor() {
        this.baseAuthService = authService;
        this.sessions = new Map();
        this.failedAttempts = new Map();
        this.securityEvents = [];
        this.twoFactorCodes = new Map();
        this.deviceFingerprints = new Map();
        
        this.config = {
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
                maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
            },
            twoFactorEnabled: false
        };
        
        this.init();
    }

    async init() {
        this.loadStoredData();
        this.startSessionMonitoring();
        this.bindSecurityEvents();
    }

    loadStoredData() {
        try {
            const storedSessions = localStorage.getItem('auth_sessions');
            const storedFailedAttempts = localStorage.getItem('failed_attempts');
            const storedSecurityEvents = localStorage.getItem('security_events');
            
            if (storedSessions) {
                const sessions = JSON.parse(storedSessions);
                sessions.forEach(session => {
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
            console.error('Error loading stored auth data:', error);
        }
    }

    saveStoredData() {
        try {
            localStorage.setItem('auth_sessions', JSON.stringify(Array.from(this.sessions.values())));
            localStorage.setItem('failed_attempts', JSON.stringify(Object.fromEntries(this.failedAttempts)));
            localStorage.setItem('security_events', JSON.stringify(this.securityEvents.slice(-100))); // Keep last 100 events
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    }

    /**
     * Enhanced login with security features
     */
    async enhancedLogin(username, password, twoFactorCode = null, rememberMe = false) {
        try {
            // Check if account is locked
            const lockoutStatus = this.checkAccountLockout(username);
            if (lockoutStatus.isLocked) {
                throw new Error(`Account locked. Try again in ${Math.ceil(lockoutStatus.remainingTime / 60000)} minutes.`);
            }

            // Attempt base login
            const loginResult = await this.baseAuthService.login(username, password);
            
            if (!loginResult) {
                this.recordFailedAttempt(username);
                throw new Error('Invalid credentials');
            }

            // Check 2FA if enabled
            if (this.config.twoFactorEnabled && this.isUserTwoFactorEnabled(username)) {
                if (!twoFactorCode) {
                    // Store partial login state
                    const tempToken = this.generateTempToken();
                    this.storePendingAuth(tempToken, username);
                    return { requiresTwoFactor: true, tempToken };
                }

                if (!this.verifyTwoFactorCode(username, twoFactorCode)) {
                    this.recordFailedAttempt(username);
                    throw new Error('Invalid two-factor authentication code');
                }
            }

            // Clear failed attempts on successful login
            this.failedAttempts.delete(username);

            // Create enhanced session
            const sessionId = this.createEnhancedSession(username, rememberMe);
            
            // Record security event
            this.recordSecurityEvent('login_success', username, {
                sessionId,
                deviceFingerprint: this.generateDeviceFingerprint(),
                rememberMe
            });

            this.saveStoredData();
            return { success: true, sessionId };

        } catch (error) {
            this.recordSecurityEvent('login_failed', username, { error: error.message });
            this.saveStoredData();
            throw error;
        }
    }

    /**
     * Create enhanced session with advanced tracking
     */
    createEnhancedSession(username, rememberMe = false) {
        const sessionId = this.generateSessionId();
        const deviceFingerprint = this.generateDeviceFingerprint();
        const now = Date.now();
        
        const session = {
            id: sessionId,
            username,
            createdAt: now,
            lastActivity: now,
            expiresAt: now + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : this.config.sessionTimeout), // 30 days if remember me, else session timeout
            deviceFingerprint,
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent,
            rememberMe,
            isActive: true
        };

        // Check concurrent session limits
        this.enforceConcurrentSessionLimits(username);
        
        this.sessions.set(sessionId, session);
        this.setCurrentSession(sessionId);
        
        return sessionId;
    }

    /**
     * Generate device fingerprint for tracking
     */
    generateDeviceFingerprint() {
        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timestamp: Date.now()
        };
        
        // Create hash-like string
        const fingerprintString = JSON.stringify(fingerprint);
        const hash = this.simpleHash(fingerprintString);
        
        this.deviceFingerprints.set(hash, fingerprint);
        return hash;
    }

    /**
     * Simple hash function for fingerprinting
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Check account lockout status
     */
    checkAccountLockout(username) {
        const attempts = this.failedAttempts.get(username);
        if (!attempts) return { isLocked: false };

        const { count, lastAttempt } = attempts;
        const timeSinceLastAttempt = Date.now() - lastAttempt;
        
        if (count >= this.config.maxFailedAttempts && timeSinceLastAttempt < this.config.lockoutDuration) {
            return {
                isLocked: true,
                remainingTime: this.config.lockoutDuration - timeSinceLastAttempt
            };
        }

        // Reset if lockout period has passed
        if (count >= this.config.maxFailedAttempts && timeSinceLastAttempt >= this.config.lockoutDuration) {
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
    }

    /**
     * Two-Factor Authentication setup
     */
    setupTwoFactor(username) {
        const secret = this.generateTwoFactorSecret();
        const backupCodes = this.generateBackupCodes();
        
        const twoFactorData = {
            secret,
            backupCodes,
            isEnabled: false,
            setupDate: Date.now()
        };
        
        this.twoFactorCodes.set(username, twoFactorData);
        
        return {
            secret,
            qrCodeData: this.generateTOTPQRCode(username, secret),
            backupCodes
        };
    }

    /**
     * Verify two-factor authentication code
     */
    verifyTwoFactorCode(username, code) {
        const userData = this.twoFactorCodes.get(username);
        if (!userData) return false;

        // Check if it's a backup code
        if (userData.backupCodes.includes(code)) {
            // Remove used backup code
            userData.backupCodes = userData.backupCodes.filter(c => c !== code);
            this.twoFactorCodes.set(username, userData);
            return true;
        }

        // Verify TOTP code (simulated)
        return this.verifyTOTP(userData.secret, code);
    }

    /**
     * Generate TOTP (Time-based One-Time Password) - Simulated
     */
    verifyTOTP(secret, code) {
        // In a real implementation, this would use a proper TOTP library
        // For demo purposes, we'll accept codes that follow a simple pattern
        const timeWindow = Math.floor(Date.now() / 30000); // 30-second windows
        const expectedCodes = [
            this.generateSimpleTOTP(secret, timeWindow),
            this.generateSimpleTOTP(secret, timeWindow - 1), // Previous window
            this.generateSimpleTOTP(secret, timeWindow + 1)  // Next window
        ];
        
        return expectedCodes.includes(code);
    }

    generateSimpleTOTP(secret, timeWindow) {
        // Simple demo TOTP generation
        const hash = this.simpleHash(secret + timeWindow.toString());
        return (parseInt(hash, 36) % 1000000).toString().padStart(6, '0');
    }

    /**
     * Generate two-factor secret
     */
    generateTwoFactorSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars[Math.floor(Math.random() * chars.length)];
        }
        return secret;
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes(count = 8) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
        }
        return codes;
    }

    /**
     * Generate QR code data for TOTP setup
     */
    generateTOTPQRCode(username, secret) {
        return `otpauth://totp/Royalties%20Manager:${encodeURIComponent(username)}?secret=${secret}&issuer=Royalties%20Manager`;
    }

    /**
     * Session monitoring and cleanup
     */
    startSessionMonitoring() {
        setInterval(() => {
            this.cleanupExpiredSessions();
            this.updateSessionActivity();
        }, 60000); // Check every minute
    }

    cleanupExpiredSessions() {
        const now = Date.now();
        const expiredSessions = [];
        
        this.sessions.forEach((session, sessionId) => {
            if (session.expiresAt < now) {
                expiredSessions.push(sessionId);
            }
        });
        
        expiredSessions.forEach(sessionId => {
            const session = this.sessions.get(sessionId);
            this.recordSecurityEvent('session_expired', session.username, { sessionId });
            this.sessions.delete(sessionId);
        });
        
        if (expiredSessions.length > 0) {
            this.saveStoredData();
        }
    }

    updateSessionActivity() {
        const currentSessionId = this.getCurrentSessionId();
        if (currentSessionId && this.sessions.has(currentSessionId)) {
            const session = this.sessions.get(currentSessionId);
            session.lastActivity = Date.now();
            this.sessions.set(currentSessionId, session);
        }
    }

    /**
     * Password policy validation
     */
    validatePassword(password) {
        const policy = this.config.passwordPolicy;
        const errors = [];
        
        if (password.length < policy.minLength) {
            errors.push(`Password must be at least ${policy.minLength} characters long`);
        }
        
        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (policy.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    /**
     * Calculate password strength
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length bonus
        score += Math.min(password.length * 4, 25);
        
        // Character variety
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/\d/.test(password)) score += 5;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
        
        // Complexity patterns
        if (password.length >= 12) score += 10;
        if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) score += 10;
        
        // Penalty for common patterns
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/123|abc|qwe/i.test(password)) score -= 10; // Common sequences
        
        score = Math.max(0, Math.min(100, score));
        
        if (score < 30) return { level: 'weak', score, color: '#ff4444' };
        if (score < 60) return { level: 'fair', score, color: '#ffaa00' };
        if (score < 80) return { level: 'good', score, color: '#88cc00' };
        return { level: 'strong', score, color: '#00cc44' };
    }

    /**
     * Security event logging
     */
    recordSecurityEvent(type, username, details = {}) {
        const event = {
            id: Date.now() + Math.random(),
            type,
            username,
            timestamp: Date.now(),
            details: {
                ...details,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        };
        
        this.securityEvents.unshift(event);
        
        // Keep only last 1000 events
        if (this.securityEvents.length > 1000) {
            this.securityEvents = this.securityEvents.slice(0, 1000);
        }
    }

    /**
     * Get security events for audit
     */
    getSecurityEvents(filters = {}) {
        let events = [...this.securityEvents];
        
        if (filters.username) {
            events = events.filter(e => e.username === filters.username);
        }
        
        if (filters.type) {
            events = events.filter(e => e.type === filters.type);
        }
        
        if (filters.startDate) {
            events = events.filter(e => e.timestamp >= new Date(filters.startDate).getTime());
        }
        
        if (filters.endDate) {
            events = events.filter(e => e.timestamp <= new Date(filters.endDate).getTime());
        }
        
        return events.slice(0, filters.limit || 100);
    }

    /**
     * Utility methods
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateTempToken() {
        return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getClientIP() {
        // In a real app, this would get the actual client IP
        return '127.0.0.1';
    }

    getCurrentSessionId() {
        return localStorage.getItem('current_session_id');
    }

    setCurrentSession(sessionId) {
        localStorage.setItem('current_session_id', sessionId);
    }

    isUserTwoFactorEnabled(username) {
        const userData = this.twoFactorCodes.get(username);
        return userData && userData.isEnabled;
    }

    enforceConcurrentSessionLimits(username) {
        const userSessions = Array.from(this.sessions.values())
            .filter(session => session.username === username && session.isActive)
            .sort((a, b) => b.lastActivity - a.lastActivity);
        
        if (userSessions.length >= this.config.maxConcurrentSessions) {
            // Remove oldest sessions
            const sessionsToRemove = userSessions.slice(this.config.maxConcurrentSessions - 1);
            sessionsToRemove.forEach(session => {
                this.recordSecurityEvent('session_terminated', username, { 
                    reason: 'concurrent_limit_exceeded',
                    sessionId: session.id 
                });
                this.sessions.delete(session.id);
            });
        }
    }

    storePendingAuth(tempToken, username) {
        localStorage.setItem('pending_auth', JSON.stringify({
            tempToken,
            username,
            timestamp: Date.now()
        }));
    }

    bindSecurityEvents() {
        // Monitor for suspicious activity
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.recordSecurityEvent('tab_hidden', this.baseAuthService.currentUser?.username);
            } else {
                this.recordSecurityEvent('tab_visible', this.baseAuthService.currentUser?.username);
            }
        });
    }
}

export const enhancedAuthService = new EnhancedAuthService();
