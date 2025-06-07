// Authentication Manager Module

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.validCredentials = [
            { username: 'admin', password: 'admin123', role: 'Administrator', userId: 1 },
            { username: 'editor', password: 'editor123', role: 'Editor', userId: 2 },
            { username: 'viewer', password: 'viewer123', role: 'Viewer', userId: 3 },
            { username: 'auditor', password: 'auditor123', role: 'Auditor', userId: 4 },
            { username: 'finance_mgr', password: 'finance123', role: 'Finance', userId: 5 }
        ];
        this.loginAttempts = new Map();
        this.maxAttempts = 3;
        this.lockoutDuration = 15; // minutes
    }

    authenticate(username, password) {
        // Check if account is locked
        if (this.isAccountLocked(username)) {
            return { 
                success: false, 
                error: 'Account is temporarily locked due to multiple failed attempts. Please try again later.' 
            };
        }

        const user = this.validCredentials.find(cred => 
            cred.username === username && cred.password === password
        );

        if (user) {
            // Clear failed attempts on successful login
            this.clearFailedAttempts(username);
            
            this.currentUser = {
                id: user.userId,
                username: user.username,
                role: user.role,
                department: user.role === 'Administrator' ? 'Management' : 
                          user.role === 'Editor' ? 'Finance' : 
                          user.role === 'Finance' ? 'Finance' :
                          user.role === 'Auditor' ? 'Audit' : 'Audit',
                lastLogin: new Date().toISOString(),
                permissions: this.getRolePermissions(user.role)
            };
            return { success: true, user: this.currentUser };
        } else {
            // Record failed attempt
            this.recordFailedAttempt(username);
            const attemptsLeft = this.maxAttempts - (this.loginAttempts.get(username)?.count || 0);
            
            return { 
                success: false, 
                error: `Invalid credentials. ${attemptsLeft > 0 ? `${attemptsLeft} attempts remaining.` : 'Account will be locked.'}` 
            };
        }
    }

    getRolePermissions(role) {
        const permissions = {
            'Administrator': ['read', 'write', 'delete', 'admin', 'audit', 'finance', 'export'],
            'Editor': ['read', 'write', 'finance', 'export'],
            'Viewer': ['read'],
            'Auditor': ['read', 'audit', 'export'],
            'Finance': ['read', 'write', 'finance', 'export']
        };
        return permissions[role] || ['read'];
    }

    recordFailedAttempt(username) {
        const current = this.loginAttempts.get(username) || { count: 0, lastAttempt: null };
        this.loginAttempts.set(username, {
            count: current.count + 1,
            lastAttempt: new Date()
        });
    }

    clearFailedAttempts(username) {
        this.loginAttempts.delete(username);
    }

    isAccountLocked(username) {
        const attempts = this.loginAttempts.get(username);
        if (!attempts || attempts.count < this.maxAttempts) {
            return false;
        }
        
        const lockoutEnd = new Date(attempts.lastAttempt.getTime() + this.lockoutDuration * 60000);
        return new Date() < lockoutEnd;
    }

    getAccountStatus(username) {
        const attempts = this.loginAttempts.get(username);
        if (!attempts) {
            return { locked: false, attemptsRemaining: this.maxAttempts };
        }
        
        const locked = this.isAccountLocked(username);
        const attemptsRemaining = Math.max(0, this.maxAttempts - attempts.count);
        
        return { locked, attemptsRemaining, lastAttempt: attempts.lastAttempt };
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        return this.currentUser.permissions?.includes(permission) || false;
    }

    canManageUsers() {
        return this.hasPermission('admin');
    }

    canDeleteData() {
        return this.hasPermission('delete');
    }

    canAccessFinancials() {
        return this.hasPermission('finance');
    }

    canPerformAudit() {
        return this.hasPermission('audit');
    }

    canExportData() {
        return this.hasPermission('export');
    }
}

export const authManager = new AuthManager();
