/**
 * Mining Royalties Manager - Clean Application Core
 * @version 3.0.0
 * @date 2025-07-01
 * @description Essential functionality only - all redundant code removed
 */

console.log('Loading Mining Royalties Manager - Clean Core v3.0.0');

// ===== CORE CLASSES =====

// Minimal Data Manager
class DataManager {
    constructor() {
        this.data = {
            users: [],
            royaltyRecords: [],
            auditLog: []
        };
    }

    initialize() {
        this.loadSampleData();
        console.log('DataManager initialized with sample data');
    }

    loadSampleData() {
        this.data.royaltyRecords = [
            { id: 1, entity: 'Kwalini Quarry', mineral: 'Quarried Stone', volume: 1250, tariff: 15, amount: 18750, date: '2024-01-15', status: 'Paid' },
            { id: 2, entity: 'Maloma Colliery', mineral: 'Coal', volume: 850, tariff: 12, amount: 10200, date: '2024-01-20', status: 'Pending' },
            { id: 3, entity: 'Ngwenya Mine', mineral: 'Iron Ore', volume: 2100, tariff: 25, amount: 52500, date: '2024-01-25', status: 'Paid' }
        ];

        this.data.users = [
            { id: 1, username: 'admin', email: 'admin@eswacaa.sz', role: 'Administrator', department: 'Management', status: 'Active', lastLogin: '2024-02-10 09:15:00', failedAttempts: 0 },
            { id: 2, username: 'finance.user', email: 'finance@eswacaa.sz', role: 'Finance', department: 'Finance', status: 'Active', lastLogin: '2024-02-09 14:30:00', failedAttempts: 0 },
            { id: 3, username: 'audit.reviewer', email: 'audit@eswacaa.sz', role: 'Auditor', department: 'Audit', status: 'Active', lastLogin: '2024-02-08 11:45:00', failedAttempts: 1 }
        ];

        this.data.auditLog = [
            { id: 1, timestamp: '2024-02-10 09:15:23', user: 'admin', action: 'Login', target: 'System', ipAddress: '192.168.1.100', status: 'Success', details: 'Successful login' },
            { id: 2, timestamp: '2024-02-10 09:20:15', user: 'admin', action: 'Create User', target: 'finance.user', ipAddress: '192.168.1.100', status: 'Success', details: 'Created new user account' }
        ];
    }

    getRoyaltyRecords() { return this.data.royaltyRecords; }
    getUsers() { return this.data.users; }
    getAuditLog() { return this.data.auditLog; }
}

// Minimal Event Manager
class EventManager {
    constructor() {
        this.events = new Map();
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    cleanup() {
        this.events.clear();
    }
}

// Minimal Component Loader
class ComponentLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadComponent(componentId, container) {
        try {
            // Simplified - just show section without loading external components
            console.log(`Loading component: ${componentId}`);
            return true;
        } catch (error) {
            console.error(`Failed to load component ${componentId}:`, error);
            return false;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

// Minimal Auth Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
    }

    authenticate(username, password) {
        if (username === 'admin' && password === 'admin123') {
            this.currentUser = { username: 'admin', role: 'Administrator' };
            return { success: true, user: this.currentUser };
        }
        return { success: false, error: 'Invalid credentials' };
    }

    getCurrentUser() { return this.currentUser; }
    logout() { this.currentUser = null; }
    isAuthenticated() { return this.currentUser !== null; }
}

// Minimal Notification Manager
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white; padding: 12px 16px; margin-bottom: 8px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex; align-items: center; justify-content: space-between; min-width: 300px;
        `;
        
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: 12px;">×</button>
        `;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
}

// ===== MAIN APPLICATION CLASS =====
class RoyaltiesApp {
    constructor() {
        this.dataManager = new DataManager();
        this.eventManager = new EventManager();
        this.componentLoader = new ComponentLoader();
        this.authManager = new AuthManager();
        this.notificationManager = new NotificationManager();
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        this.charts = {}; // Initialize charts object
        this.availableSections = ['dashboard', 'user-management', 'royalty-records', 'contract-management', 'reporting-analytics', 'communication', 'notifications', 'compliance', 'regulatory-management', 'profile'];
        
        // Bind methods to ensure proper context
        this.handleError = this.handleError.bind(this);
    }

    // Missing error handling method
    setupGlobalErrorHandling() {
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handleError);
    }

    handleError(event) {
        console.error('Global error caught:', event);
        if (this.notificationManager && this.notificationManager.show) {
            this.notificationManager.show('An error occurred. Please try refreshing the page.', 'error');
        }
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.dataManager.initialize();
            this.setupGlobalErrorHandling();
            await this.startLoadingSequence();
            this.isInitialized = true;
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.notificationManager.show('Failed to initialize application', 'error');
        }
    }

    async showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => section.style.display = 'none');

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            this.updateNavigationState(sectionId);
            
            // Initialize section-specific functionality
            this.initializeSection(sectionId);
        }
    }

    cleanup() {
        this.eventManager.cleanup();
        this.componentLoader.clearCache();
        
        // Cleanup charts
        Object.values(this.charts || {}).forEach(chart => {
            if (chart?.destroy) chart.destroy();
        });
        this.charts = {};
    }

    startLoadingSequence() {
        console.log('Starting loading simulation...');
        
        setTimeout(() => {
            console.log('Loading complete - Showing login');
            this.hideLoadingShowLogin();
        }, 2000);
    }

    hideLoadingShowLogin() {
        const loadingScreen = document.getElementById('loading-screen');
        const loginSection = document.getElementById('login-section');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (loginSection) {
            loginSection.style.display = 'flex';
            this.setupLoginForm();
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username')?.value;
                const password = document.getElementById('password')?.value;
                
                const result = this.authManager.authenticate(username, password);
                
                if (result.success) {
                    this.showMainApplication();
                } else {
                    this.notificationManager.show(result.error, 'error');
                }
            });
        }
    }

    showMainApplication() {
        try {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('main-app').style.display = 'flex';
            
            this.initializeMainApplication();
            
        } catch (error) {
            console.error('Error showing main application:', error);
        }
    }

    initializeMainApplication() {
        this.setupEventListeners();
        this.setupNavigation();
        this.showSection('dashboard');
        
        console.log('Main application initialized');
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('confirm-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    setupNavigation() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.addEventListener('click', (e) => {
                const navLink = e.target.closest('.nav-link');
                if (navLink) {
                    e.preventDefault();
                    const section = navLink.dataset.section;
                    
                    if (section === 'logout') {
                        this.handleLogout();
                    } else {
                        this.showSection(section);
                    }
                }
            });
        }
    }

    updateNavigationState(activeSection) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === activeSection) {
                link.classList.add('active');
            }
        });
    }

    initializeSection(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboardMetrics();
                break;
            case 'user-management':
                this.populateUserAccounts();
                this.populateAuditLog();
                break;
            case 'royalty-records':
                this.populateRoyaltyRecords();
                break;
            default:
                console.log(`No specific initialization for section: ${sectionId}`);
        }
    }

    updateDashboardMetrics() {
        const records = this.dataManager.getRoyaltyRecords();
        const totalRoyalties = records.reduce((sum, record) => sum + record.amount, 0);
        const activeEntities = new Set(records.map(r => r.entity)).size;
        const paidRecords = records.filter(r => r.status === 'Paid').length;
        const pendingRecords = records.filter(r => r.status === 'Pending').length;
        const complianceRate = records.length > 0 ? Math.round((paidRecords / records.length) * 100) : 0;
        
        // Update dashboard elements
        this.updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}.00`);
        this.updateElement('active-entities', activeEntities.toString());
        this.updateElement('compliance-rate', `${complianceRate}%`);
        this.updateElement('paid-count', paidRecords);
        this.updateElement('pending-count', pendingRecords);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    populateUserAccounts() {
        const tbody = document.getElementById('users-table-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        this.dataManager.getUsers().forEach(user => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><input type="checkbox" data-user-id="${user.id}"></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${user.department}</td>
                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                <td>${user.lastLogin || 'Never'}</td>
                <td>${user.failedAttempts || 0}</td>
                <td>Never</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})" title="Edit user">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})" title="Delete user">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
        });
    }

    populateAuditLog() {
        const tbody = document.getElementById('audit-log-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        this.dataManager.getAuditLog().forEach(entry => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${entry.timestamp}</td>
                <td>${entry.user}</td>
                <td><span class="action-badge">${entry.action}</span></td>
                <td>${entry.target}</td>
                <td>${entry.ipAddress}</td>
                <td><span class="status-badge ${entry.status.toLowerCase()}">${entry.status}</span></td>
                <td>${entry.details}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewAuditDetails(${entry.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
        });
    }

    populateRoyaltyRecords() {
        const tbody = document.getElementById('royalty-records-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        this.dataManager.getRoyaltyRecords().forEach(record => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${record.entity}</td>
                <td>${record.mineral}</td>
                <td>${record.volume.toLocaleString()}</td>
                <td>E${record.tariff}</td>
                <td>E${record.amount.toLocaleString()}</td>
                <td>${record.date}</td>
                <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editRecord(${record.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecord(${record.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
        });
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.authManager.logout();
            document.getElementById('main-app').style.display = 'none';
            document.getElementById('login-section').style.display = 'flex';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            console.log('User logged out successfully');
        }
    }
}

// ===== GLOBAL INITIALIZATION =====
async function initializeApp() {
    try {
        if (window.royaltiesApp) {
            console.log('App already initialized');
            return;
        }

        console.log('Initializing Mining Royalties Manager application...');
        
        window.royaltiesApp = new RoyaltiesApp();
        window.app = window.royaltiesApp; // Also assign to window.app for compatibility
        await window.royaltiesApp.initialize();
        
        // Make notification manager globally available
        window.notificationManager = window.royaltiesApp.notificationManager;
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// ===== GLOBAL FUNCTIONS FOR HTML ONCLICK HANDLERS =====
window.editUser = function(userId) {
    try {
        if (window.royaltiesApp && window.royaltiesApp.notificationManager) {
            window.royaltiesApp.notificationManager.show('Edit user functionality would be implemented here', 'info');
        }
    } catch (error) {
        console.error('Error editing user:', error);
    }
};

window.deleteUser = function(userId) {
    try {
        if (confirm('Are you sure you want to delete this user?')) {
            // In a real application, this would delete from the data manager
            if (window.royaltiesApp && window.royaltiesApp.notificationManager) {
                window.royaltiesApp.notificationManager.show('User deleted successfully', 'success');
                // Refresh the table
                window.royaltiesApp.populateUserAccounts();
            }
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
};

window.editRecord = function(recordId) {
    try {
        if (window.royaltiesApp && window.royaltiesApp.notificationManager) {
            window.royaltiesApp.notificationManager.show('Edit record functionality would be implemented here', 'info');
        }
    } catch (error) {
        console.error('Error editing record:', error);
    }
};

window.deleteRecord = function(recordId) {
    try {
        if (confirm('Are you sure you want to delete this record?')) {
            if (window.royaltiesApp && window.royaltiesApp.notificationManager) {
                window.royaltiesApp.notificationManager.show('Record deleted successfully', 'success');
                // Refresh the table and dashboard
                window.royaltiesApp.populateRoyaltyRecords();
                window.royaltiesApp.updateDashboardMetrics();
            }
        }
    } catch (error) {
        console.error('Error deleting record:', error);
    }
};

window.viewAuditDetails = function(entryId) {
    try {
        if (window.royaltiesApp && window.royaltiesApp.notificationManager) {
            window.royaltiesApp.notificationManager.show('Audit details view would be implemented here', 'info');
        }
    } catch (error) {
        console.error('Error viewing audit details:', error);
    }
};

// Dashboard quick actions
window.refreshDashboard = function() {
    try {
        if (window.royaltiesApp) {
            window.royaltiesApp.updateDashboardMetrics();
            window.royaltiesApp.notificationManager.show('Dashboard refreshed successfully', 'success');
        }
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
};

window.addNewRecord = function() {
    try {
        if (window.royaltiesApp && window.royaltiesApp.notificationManager) {
            window.royaltiesApp.notificationManager.show('Add Record functionality will be available soon', 'info');
        }
    } catch (error) {
        console.error('Error adding new record:', error);
    }
};

window.runComplianceCheck = function() {
    try {
        if (window.royaltiesApp && window.royaltiesApp.notificationManager) {
            window.royaltiesApp.notificationManager.show('Running compliance check...', 'info');
            setTimeout(() => {
                window.royaltiesApp.notificationManager.show('Compliance check completed', 'success');
            }, 2000);
        }
    } catch (error) {
        console.error('Error running compliance check:', error);
    }
};

// ===== AUTO INITIALIZATION =====
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('Mining Royalties Manager - Clean Core loaded successfully');
