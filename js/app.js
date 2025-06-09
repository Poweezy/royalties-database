// Mining Royalties Manager - Main Application Entry Point

// Global application state
let currentUser = null;
let currentSection = 'dashboard';

// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.validCredentials = [
            { username: 'admin', password: 'admin123', role: 'Administrator' },
            { username: 'editor', password: 'editor123', role: 'Editor' },
            { username: 'viewer', password: 'viewer123', role: 'Viewer' }
        ];
    }

    authenticate(username, password) {
        const user = this.validCredentials.find(cred => 
            cred.username === username && cred.password === password
        );

        if (user) {
            this.currentUser = {
                username: user.username,
                role: user.role,
                department: user.role === 'Administrator' ? 'Management' : 
                          user.role === 'Editor' ? 'Finance' : 'Audit',
                lastLogin: new Date().toISOString()
            };
            return { success: true, user: this.currentUser };
        }

        return { success: false, error: 'Invalid credentials' };
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
}

// Notification Manager
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
        this.activeNotifications = new Set();
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '10000';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${iconMap[type]}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(notification);
        this.activeNotifications.add(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
                this.activeNotifications.delete(notification);
            }
        }, duration);

        return notification;
    }

    clear() {
        this.activeNotifications.forEach(notification => {
            if (notification.parentElement) {
                notification.remove();
            }
        });
        this.activeNotifications.clear();
    }
}

// Main Application Class
class RoyaltiesApp {
    constructor() {
        this.dataManager = new DataManager();
        this.authManager = new AuthManager();
        this.notificationManager = new NotificationManager();
        this.dashboardManager = null;
        this.actionHandlers = {};
        this.charts = {};
    }

    async initialize() {
        console.log('DOM loaded - Starting application initialization...');
        
        // Initialize data
        this.dataManager.initialize();
        
        // Start loading sequence
        this.startLoadingSequence();
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
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const passwordToggle = document.querySelector('.password-toggle');
        
        // Password toggle
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', function() {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
        
        // Form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = usernameInput?.value;
                const password = passwordInput?.value;
                this.authenticateUser(username, password);
            });
        }
        
        // Enter key support
        [usernameInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        loginForm.dispatchEvent(new Event('submit'));
                    }
                });
            }
        });
    }

    authenticateUser(username, password) {
        const result = this.authManager.authenticate(username, password);
        
        if (result.success) {
            // Add login to audit log
            this.dataManager.addAuditEntry({
                user: username,
                action: 'Login',
                target: 'System',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Successful login as ${result.user.role}`
            });
            
            this.showMainApplication();
        } else {
            this.notificationManager.show('Invalid credentials. Try: admin/admin123, editor/editor123, or viewer/viewer123', 'error');
            
            // Add failed login to audit log
            this.dataManager.addAuditEntry({
                user: username || 'Unknown',
                action: 'Failed Login',
                target: 'System',
                ipAddress: '192.168.1.100',
                status: 'Failed',
                details: 'Failed login attempt - invalid credentials'
            });
        }
    }

    showMainApplication() {
        const loginSection = document.getElementById('login-section');
        const appContainer = document.getElementById('app-container');
        
        if (loginSection) loginSection.style.display = 'none';
        if (appContainer) appContainer.style.display = 'flex';
        
        this.initializeMainApplication();
    }

    initializeMainApplication() {
        console.log('Initializing main application for user:', this.authManager.getCurrentUser());
        
        // Initialize managers and handlers
        this.initializeManagers();
        this.setupEventListeners();
        
        // Initialize navigation
        this.setupNavigation();
        
        // Show dashboard by default
        this.showSection('dashboard');
        
        // Show welcome notification
        const currentUser = this.authManager.getCurrentUser();
        this.notificationManager.show(`Welcome back, ${currentUser.username}!`, 'success');
        
        console.log('Main application initialized successfully');
    }

    initializeManagers() {
        // Initialize action handlers
        this.actionHandlers = {
            recordActions: new RecordActions(this.dataManager, this.notificationManager),
            userActions: new UserActions(this.dataManager, this.notificationManager),
            contractActions: new ContractActions(this.dataManager, this.notificationManager)
        };

        // Make managers globally available
        window.dataManager = this.dataManager;
        window.notificationManager = this.notificationManager;
        window.recordActions = this.actionHandlers.recordActions;
        window.userActions = this.actionHandlers.userActions;
        window.contractActions = this.actionHandlers.contractActions;
    }

    setupEventListeners() {
        // Logout listener
        document.addEventListener('logoutRequested', () => {
            this.handleLogout();
        });

        // Reload section listener
        document.addEventListener('reloadSection', (e) => {
            this.loadSectionContent(e.detail.sectionId);
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                
                if (sectionId === 'logout') {
                    this.handleLogout();
                } else {
                    this.showSection(sectionId);
                }
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            
            // Update navigation active state
            this.updateNavigationState(sectionId);
            
            // Load section content
            this.loadSectionContent(sectionId);
        }
    }

    updateNavigationState(activeSection) {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    }

    loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'user-management':
                this.loadUserManagementSection();
                break;
            case 'royalty-records':
                this.loadRoyaltyRecordsSection();
                break;
            case 'contract-management':
                this.loadContractManagementSection();
                break;
            default:
                this.loadGenericSection(sectionId);
        }
    }

    loadDashboard() {
        const section = document.getElementById('dashboard');
        if (!section) return;

        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📊 Executive Dashboard</h1>
                    <p>Real-time mining royalties overview and analytics</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-info" id="refresh-dashboard-btn">
                        <i class="fas fa-sync-alt"></i> Refresh Data
                    </button>
                </div>
            </div>

            <!-- Key Performance Indicators -->
            <div class="charts-grid" id="kpi-metrics">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Total Royalties</h3>
                    </div>
                    <div class="card-body">
                        <p id="total-royalties">E 0</p>
                        <small id="royalties-trend" class="trend-positive">
                            <i class="fas fa-arrow-up"></i> +0%
                        </small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-industry"></i> Active Entities</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-entities">0</p>
                        <small id="entities-trend" class="trend-positive">
                            <i class="fas fa-plus"></i> +0 new entities
                        </small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-percentage"></i> Compliance Rate</h3>
                    </div>
                    <div class="card-body">
                        <p id="compliance-rate">0%</p>
                        <div class="mini-progress">
                            <div class="progress-bar" id="compliance-progress" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Pending Approvals</h3>
                    </div>
                    <div class="card-body">
                        <p id="pending-approvals">0</p>
                        <small id="pending-text" class="trend-stable">
                            <i class="fas fa-clock"></i> No pending items
                        </small>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-history"></i> Recent Activity</h5>
                </div>
                <div class="card-body">
                    <div id="recent-activity" class="activity-list">
                        <!-- Activity items will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;

        // Initialize dashboard after content is loaded
        setTimeout(() => {
            this.updateDashboardMetrics();
            this.updateRecentActivity();
        }, 100);
    }

    updateDashboardMetrics() {
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entities = this.dataManager.getEntities();
        
        const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending').length;
        const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords / royaltyRecords.length) * 100) : 0;
        
        // Update main metrics
        this.updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}.00`);
        this.updateElement('active-entities', activeEntities);
        this.updateElement('compliance-rate', `${complianceRate}%`);
        this.updateElement('pending-approvals', pendingRecords);
        
        // Update progress bars
        const complianceProgress = document.getElementById('compliance-progress');
        if (complianceProgress) {
            complianceProgress.style.width = `${complianceRate}%`;
        }
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        const auditLog = this.dataManager.getAuditLog();
        const recentEntries = auditLog.slice(0, 5);
        
        if (recentEntries.length === 0) {
            activityContainer.innerHTML = '<p class="no-activity">No recent activity to display</p>';
            return;
        }
        
        activityContainer.innerHTML = recentEntries.map(entry => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(entry.action)}"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${entry.user}</strong> ${entry.action.toLowerCase()} ${entry.target}</p>
                    <small>${entry.timestamp}</small>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(action) {
        const iconMap = {
            'Login': 'sign-in-alt',
            'Create User': 'user-plus',
            'Modify User': 'user-edit',
            'Delete User': 'user-minus',
            'Data Access': 'eye',
            'Failed Login': 'exclamation-triangle'
        };
        return iconMap[action] || 'circle';
    }

    loadUserManagementSection() {
        const section = document.getElementById('user-management');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>👥 User Management</h1>
                    <p>Manage system users and permissions</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>User management functionality will be implemented here.</p>
                </div>
            </div>
        `;
    }

    loadRoyaltyRecordsSection() {
        const section = document.getElementById('royalty-records');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>💰 Royalty Records</h1>
                    <p>Manage royalty payments and records</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>Royalty records functionality will be implemented here.</p>
                </div>
            </div>
        `;
    }

    loadContractManagementSection() {
        const section = document.getElementById('contract-management');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📋 Contract Management</h1>
                    <p>Manage contracts and agreements</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>Contract management functionality will be implemented here.</p>
                </div>
            </div>
        `;
    }

    loadGenericSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <h1>📋 ${sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
                        <p>This section is under development</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        <p>Content for ${sectionId} will be implemented here.</p>
                    </div>
                </div>
            `;
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            const currentUser = this.authManager.getCurrentUser();
            if (currentUser) {
                this.dataManager.addAuditEntry({
                    user: currentUser.username,
                    action: 'Logout',
                    target: 'System',
                    ipAddress: '192.168.1.100',
                    status: 'Success',
                    details: 'User logged out successfully'
                });
            }
            
            this.authManager.logout();
            
            const loginSection = document.getElementById('login-section');
            const appContainer = document.getElementById('app-container');
            
            if (appContainer) appContainer.style.display = 'none';
            if (loginSection) loginSection.style.display = 'flex';
            
            // Clear login form
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
            
            this.notificationManager.show('Logged out successfully', 'info');
        }
    }
}

// Helper Classes
class DataManager {
    constructor() {
        this.entities = [];
        this.minerals = [];
        this.royaltyRecords = [];
        this.userAccounts = [];
        this.auditLog = [];
        this.contracts = [];
    }

    initialize() {
        this.initializeEntities();
        this.initializeRoyaltyRecords();
        this.initializeUserAccounts();
        this.initializeAuditLog();
        this.initializeContracts();
    }

    initializeEntities() {
        this.entities = [
            { id: 1, name: 'Kwalini Quarry', type: 'Quarry', location: 'Kwaluseni', status: 'Active' },
            { id: 2, name: 'Maloma Colliery', type: 'Mine', location: 'Maloma', status: 'Active' },
            { id: 3, name: 'Ngwenya Mine', type: 'Mine', location: 'Ngwenya', status: 'Active' },
            { id: 4, name: 'Mbabane Quarry', type: 'Quarry', location: 'Mbabane', status: 'Active' },
            { id: 5, name: 'Sidvokodvo Quarry', type: 'Quarry', location: 'Sidvokodvo', status: 'Active' }
        ];
    }

    initializeRoyaltyRecords() {
        this.royaltyRecords = [
            {
                id: 1, entity: 'Kwalini Quarry', mineral: 'Quarried Stone', volume: 1250,
                tariff: 15, royalties: 18750, date: '2024-01-15', status: 'Paid', referenceNumber: 'ROY-2024-001'
            },
            {
                id: 2, entity: 'Maloma Colliery', mineral: 'Coal', volume: 850,
                tariff: 12, royalties: 10200, date: '2024-01-20', status: 'Pending', referenceNumber: 'ROY-2024-002'
            },
            {
                id: 3, entity: 'Ngwenya Mine', mineral: 'Iron Ore', volume: 2100,
                tariff: 25, royalties: 52500, date: '2024-01-25', status: 'Paid', referenceNumber: 'ROY-2024-003'
            }
        ];
    }

    initializeUserAccounts() {
        this.userAccounts = [
            {
                id: 1, username: 'admin', email: 'admin@eswacaa.sz', role: 'Administrator',
                department: 'Management', status: 'Active', lastLogin: '2024-02-10 09:15:00', created: '2023-01-15'
            },
            {
                id: 2, username: 'editor', email: 'editor@eswacaa.sz', role: 'Editor',
                department: 'Finance', status: 'Active', lastLogin: '2024-02-09 14:30:00', created: '2023-03-20'
            }
        ];
    }

    initializeAuditLog() {
        this.auditLog = [
            {
                id: 1, timestamp: '2024-02-10 09:15:23', user: 'admin', action: 'Login',
                target: 'System', ipAddress: '192.168.1.100', status: 'Success',
                details: 'Successful login from administrative workstation'
            }
        ];
    }

    initializeContracts() {
        this.contracts = [];
    }

    // Data access methods
    getEntities() { return this.entities; }
    getRoyaltyRecords() { return this.royaltyRecords; }
    getUserAccounts() { return this.userAccounts; }
    getAuditLog() { return this.auditLog; }
    getContracts() { return this.contracts; }

    addAuditEntry(entry) {
        this.auditLog.unshift({
            id: this.auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            ...entry
        });
    }
}

// Action Handler Classes
class RecordActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewRecord(recordId) {
        this.notificationManager.show(`Viewing record: ${recordId}`, 'info');
    }

    editRecord(recordId) {
        this.notificationManager.show(`Editing record: ${recordId}`, 'info');
    }

    deleteRecord(recordId) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.notificationManager.show('Record deleted successfully', 'success');
        }
    }

    addRecord() {
        this.notificationManager.show('Add new record functionality would open here', 'info');
    }
}

class UserActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewUser(userId) {
        this.notificationManager.show(`Viewing user: ${userId}`, 'info');
    }

    editUser(userId) {
        this.notificationManager.show(`Editing user: ${userId}`, 'info');
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.notificationManager.show('User deleted successfully', 'success');
        }
    }

    addUser() {
        this.notificationManager.show('Add new user functionality would open here', 'info');
    }
}

class ContractActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewContract(contractId) {
        this.notificationManager.show(`Viewing contract: ${contractId}`, 'info');
    }

    editContract(contractId) {
        this.notificationManager.show(`Editing contract: ${contractId}`, 'info');
    }

    deleteContract(contractId) {
        if (confirm('Are you sure you want to delete this contract?')) {
            this.notificationManager.show('Contract deleted successfully', 'success');
        }
    }

    addContract() {
        this.notificationManager.show('Add new contract functionality would open here', 'info');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new RoyaltiesApp();
    app.initialize();
});