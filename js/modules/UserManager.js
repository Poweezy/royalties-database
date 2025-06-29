/**
 * User Manager Module
 * Handles user authentication, session management, and user-related functionality
 */

class UserManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        this.loginCallbacks = new Map();
        this.logoutCallbacks = new Map();
        this.userPreferences = {};
        
        this.init();
    }

    init() {
        console.log('👤 UserManager: Initializing...');
        this.restoreSession();
        this.setupSessionManagement();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for user activity to extend session
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            document.addEventListener(event, this.handleUserActivity.bind(this), { passive: true });
        });

        // Listen for storage changes (multi-tab session sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                this.handleSessionChange(e.newValue);
            }
        });

        // Listen for beforeunload to save session state
        window.addEventListener('beforeunload', () => {
            this.saveSessionState();
        });
    }

    async login(credentials) {
        console.log('👤 UserManager: Attempting login...');
        
        try {
            // Validate credentials
            const validation = this.validateCredentials(credentials);
            if (!validation.valid) {
                throw new Error(validation.message);
            }

            // For demo purposes, simulate authentication
            const user = await this.authenticateUser(credentials);
            
            if (user) {
                this.currentUser = user;
                this.startSession();
                this.saveUserData();
                
                // Execute login callbacks
                await this.executeCallbacks('login', user);
                
                // Trigger login event
                this.triggerUserEvent('login', user);
                
                console.log('✅ UserManager: Login successful');
                return { success: true, user };
            } else {
                throw new Error('Invalid credentials');
            }
            
        } catch (error) {
            console.error('❌ UserManager: Login failed:', error);
            
            // Show error notification
            if (window.notificationManager) {
                window.notificationManager.show(
                    error.message || 'Login failed. Please try again.',
                    'error',
                    5000
                );
            }
            
            return { success: false, error: error.message };
        }
    }

    async logout() {
        console.log('👤 UserManager: Logging out...');
        
        try {
            const user = this.currentUser;
            
            // Execute logout callbacks
            await this.executeCallbacks('logout', user);
            
            // Clear session
            this.clearSession();
            
            // Trigger logout event
            this.triggerUserEvent('logout', user);
            
            console.log('✅ UserManager: Logout successful');
            return { success: true };
            
        } catch (error) {
            console.error('❌ UserManager: Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    validateCredentials(credentials) {
        const { username, password } = credentials;
        
        if (!username || !password) {
            return { valid: false, message: 'Username and password are required' };
        }
        
        if (username.length < 3) {
            return { valid: false, message: 'Username must be at least 3 characters' };
        }
        
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        
        // Additional validation rules can be added here
        
        return { valid: true };
    }

    async authenticateUser(credentials) {
        // Simulate authentication delay
        await this.delay(1000);
        
        // Demo users for development/testing
        const demoUsers = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@royalties.com',
                role: 'administrator',
                fullName: 'System Administrator',
                permissions: ['all']
            },
            {
                id: 2,
                username: 'manager',
                email: 'manager@royalties.com',
                role: 'manager',
                fullName: 'Royalty Manager',
                permissions: ['read', 'write', 'manage_royalties']
            },
            {
                id: 3,
                username: 'analyst',
                email: 'analyst@royalties.com',
                role: 'analyst',
                fullName: 'Data Analyst',
                permissions: ['read', 'analyze']
            },
            {
                id: 4,
                username: 'demo',
                email: 'demo@royalties.com',
                role: 'viewer',
                fullName: 'Demo User',
                permissions: ['read']
            }
        ];
        
        // Check demo credentials
        const user = demoUsers.find(u => 
            u.username === credentials.username && 
            (credentials.password === 'password' || credentials.password === u.username + '123')
        );
        
        if (user) {
            return {
                ...user,
                loginTime: new Date().toISOString(),
                sessionId: this.generateSessionId()
            };
        }
        
        return null;
    }

    startSession() {
        if (!this.currentUser) return;
        
        // Set session timeout
        this.resetSessionTimer();
        
        // Update last activity
        this.updateLastActivity();
        
        // Save session to storage
        this.saveSessionState();
        
        console.log('👤 UserManager: Session started for', this.currentUser.username);
    }

    clearSession() {
        // Clear current user
        this.currentUser = null;
        
        // Clear session timer
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        // Clear stored data
        this.clearUserData();
        
        console.log('👤 UserManager: Session cleared');
    }

    resetSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);
    }

    handleUserActivity() {
        if (this.currentUser) {
            this.updateLastActivity();
            this.resetSessionTimer();
        }
    }

    updateLastActivity() {
        if (this.currentUser) {
            this.currentUser.lastActivity = Date.now();
            this.saveSessionState();
        }
    }

    handleSessionTimeout() {
        console.log('👤 UserManager: Session timeout');
        
        if (window.notificationManager) {
            window.notificationManager.show(
                'Your session has expired. Please log in again.',
                'warning',
                10000
            );
        }
        
        this.logout();
        
        // Redirect to login if needed
        if (window.navigationManager) {
            window.navigationManager.navigateTo('login');
        }
    }

    handleSessionChange(newUserData) {
        if (newUserData) {
            try {
                const userData = JSON.parse(newUserData);
                this.currentUser = userData;
                this.startSession();
            } catch (error) {
                console.error('UserManager: Failed to parse session data:', error);
            }
        } else {
            this.clearSession();
        }
    }

    saveSessionState() {
        if (this.currentUser) {
            try {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
            } catch (error) {
                console.warn('UserManager: Failed to save session state:', error);
            }
        }
    }

    restoreSession() {
        try {
            const userData = localStorage.getItem('currentUser');
            const preferences = localStorage.getItem('userPreferences');
            
            if (userData) {
                const user = JSON.parse(userData);
                
                // Check if session is still valid (not expired)
                const lastActivity = user.lastActivity || Date.now();
                const timeSinceActivity = Date.now() - lastActivity;
                
                if (timeSinceActivity < this.sessionTimeout) {
                    this.currentUser = user;
                    this.startSession();
                    console.log('👤 UserManager: Session restored for', user.username);
                } else {
                    this.clearUserData();
                }
            }
            
            if (preferences) {
                this.userPreferences = JSON.parse(preferences);
            }
            
        } catch (error) {
            console.warn('UserManager: Failed to restore session:', error);
            this.clearUserData();
        }
    }

    saveUserData() {
        this.saveSessionState();
    }

    clearUserData() {
        try {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userPreferences');
        } catch (error) {
            console.warn('UserManager: Failed to clear user data:', error);
        }
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // User preferences management
    setPreference(key, value) {
        this.userPreferences[key] = value;
        this.saveSessionState();
        
        // Trigger preference change event
        this.triggerUserEvent('preferenceChange', { key, value });
    }

    getPreference(key, defaultValue = null) {
        return this.userPreferences[key] ?? defaultValue;
    }

    removePreference(key) {
        delete this.userPreferences[key];
        this.saveSessionState();
    }

    // Permission checking
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.permissions) {
            return false;
        }
        
        return this.currentUser.permissions.includes('all') || 
               this.currentUser.permissions.includes(permission);
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    isAdministrator() {
        return this.hasRole('administrator') || this.hasPermission('all');
    }

    // Callback management
    registerCallback(event, callback) {
        const callbacks = event === 'login' ? this.loginCallbacks : this.logoutCallbacks;
        
        if (!callbacks.has(event)) {
            callbacks.set(event, []);
        }
        callbacks.get(event).push(callback);
    }

    unregisterCallback(event, callback) {
        const callbacks = event === 'login' ? this.loginCallbacks : this.logoutCallbacks;
        
        if (callbacks.has(event)) {
            const callbackList = callbacks.get(event);
            const index = callbackList.indexOf(callback);
            if (index > -1) {
                callbackList.splice(index, 1);
            }
        }
    }

    async executeCallbacks(event, data) {
        const callbacks = event === 'login' ? this.loginCallbacks : this.logoutCallbacks;
        
        if (callbacks.has(event)) {
            const callbackList = callbacks.get(event);
            for (const callback of callbackList) {
                try {
                    await callback(data);
                } catch (error) {
                    console.error(`UserManager: Callback error for event "${event}":`, error);
                }
            }
        }
    }

    triggerUserEvent(eventType, userData) {
        const event = new CustomEvent(`user${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`, {
            detail: userData
        });
        
        document.dispatchEvent(event);
    }

    // Public API methods
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    getUserPermissions() {
        return this.currentUser ? this.currentUser.permissions : [];
    }

    getUserPreferences() {
        return { ...this.userPreferences };
    }

    getSessionInfo() {
        if (!this.currentUser) return null;
        
        return {
            user: this.currentUser,
            loginTime: this.currentUser.loginTime,
            lastActivity: this.currentUser.lastActivity,
            sessionId: this.currentUser.sessionId,
            timeRemaining: this.sessionTimeout - (Date.now() - (this.currentUser.lastActivity || Date.now()))
        };
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.userManager = new UserManager();
    });
} else {
    window.userManager = new UserManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}
