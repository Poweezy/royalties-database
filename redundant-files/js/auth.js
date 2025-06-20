// Authentication Module - Handles login, logout, and user session management

export class AuthModule {
    constructor() {
        this.currentUser = null;
        this.validCredentials = [
            { username: 'admin', password: 'admin123', role: 'Administrator', userId: 1 },
            { username: 'editor', password: 'editor123', role: 'Editor', userId: 2 },
            { username: 'viewer', password: 'viewer123', role: 'Viewer', userId: 3 },
            { username: 'auditor', password: 'auditor123', role: 'Auditor', userId: 4 },
            { username: 'finance_mgr', password: 'finance123', role: 'Finance', userId: 5 }
        ];
    }

    authenticate(username, password) {
        const user = this.validCredentials.find(cred => 
            cred.username === username && cred.password === password
        );

        if (user) {
            this.currentUser = {
                id: user.userId,
                username: user.username,
                role: user.role,
                department: this.getDepartmentByRole(user.role),
                lastLogin: new Date().toISOString()
            };
            return { success: true, user: this.currentUser };
        }

        return { success: false, error: 'Invalid credentials' };
    }

    getDepartmentByRole(role) {
        const departmentMap = {
            'Administrator': 'Management',
            'Editor': 'Finance',
            'Viewer': 'Audit',
            'Auditor': 'Audit',
            'Finance': 'Finance'
        };
        return departmentMap[role] || 'General';
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
        
        const permissions = {
            'Administrator': ['read', 'write', 'delete', 'admin'],
            'Editor': ['read', 'write'],
            'Viewer': ['read'],
            'Auditor': ['read', 'audit'],
            'Finance': ['read', 'write', 'finance']
        };

        return permissions[this.currentUser.role]?.includes(permission) || false;
    }
}
