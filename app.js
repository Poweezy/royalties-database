// Mining Royalties Manager - Main Application
console.log('Mining Royalties Manager v1.0 - Loading...');

// Global application state
let currentUser = null;
let currentSection = 'dashboard';
let royaltyRecords = [];
let userAccounts = [];
let auditLog = [];
let charts = {};
let entities = [];
let minerals = [];
let contracts = [];

// Notification Manager
class NotificationManager {
    constructor() {
        this.activeNotifications = new Set();
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
        
        document.body.appendChild(notification);
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

// Data Manager
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
        this.initializeMinerals();
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
            { id: 5, name: 'Sidvokodvo Quarry', type: 'Quarry', location: 'Sidvokodvo', status: 'Active' },
            { id: 6, name: 'Piggs Peak Mine', type: 'Mine', location: 'Piggs Peak', status: 'Inactive' }
        ];
    }

    initializeMinerals() {
        this.minerals = [
            { id: 1, name: 'Coal', tariff: 12, unit: 'per tonne' },
            { id: 2, name: 'Iron Ore', tariff: 25, unit: 'per tonne' },
            { id: 3, name: 'Quarried Stone', tariff: 15, unit: 'per m³' },
            { id: 4, name: 'River Sand', tariff: 8, unit: 'per m³' },
            { id: 5, name: 'Gravel', tariff: 10, unit: 'per m³' },
            { id: 6, name: 'Clay', tariff: 5, unit: 'per tonne' }
        ];
    }

    initializeRoyaltyRecords() {
        this.royaltyRecords = [
            {
                id: 1,
                entity: 'Kwalini Quarry',
                mineral: 'Quarried Stone',
                volume: 1250,
                tariff: 15,
                royalties: 18750,
                date: '2024-01-15',
                status: 'Paid',
                referenceNumber: 'ROY-2024-001'
            },
            {
                id: 2,
                entity: 'Maloma Colliery',
                mineral: 'Coal',
                volume: 850,
                tariff: 12,
                royalties: 10200,
                date: '2024-01-20',
                status: 'Pending',
                referenceNumber: 'ROY-2024-002'
            },
            {
                id: 3,
                entity: 'Ngwenya Mine',
                mineral: 'Iron Ore',
                volume: 2100,
                tariff: 25,
                royalties: 52500,
                date: '2024-01-25',
                status: 'Paid',
                referenceNumber: 'ROY-2024-003'
            },
            {
                id: 4,
                entity: 'Mbabane Quarry',
                mineral: 'Gravel',
                volume: 750,
                tariff: 10,
                royalties: 7500,
                date: '2024-02-01',
                status: 'Overdue',
                referenceNumber: 'ROY-2024-004'
            },
            {
                id: 5,
                entity: 'Sidvokodvo Quarry',
                mineral: 'River Sand',
                volume: 500,
                tariff: 8,
                royalties: 4000,
                date: '2024-02-05',
                status: 'Paid',
                referenceNumber: 'ROY-2024-005'
            },
            {
                id: 6,
                entity: 'Kwalini Quarry',
                mineral: 'Quarried Stone',
                volume: 980,
                tariff: 15,
                royalties: 14700,
                date: '2024-02-08',
                status: 'Pending',
                referenceNumber: 'ROY-2024-006'
            }
        ];
    }

    initializeUserAccounts() {
        this.userAccounts = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@eswacaa.sz',
                role: 'Administrator',
                department: 'Management',
                status: 'Active',
                lastLogin: '2024-02-10 09:15:00',
                failedAttempts: 0,
                expires: null,
                created: '2023-01-15'
            },
            {
                id: 2,
                username: 'editor',
                email: 'editor@eswacaa.sz',
                role: 'Editor',
                department: 'Finance',
                status: 'Active',
                lastLogin: '2024-02-09 14:30:00',
                failedAttempts: 0,
                expires: '2024-12-31',
                created: '2023-03-20'
            },
            {
                id: 3,
                username: 'viewer',
                email: 'viewer@eswacaa.sz',
                role: 'Viewer',
                department: 'Audit',
                status: 'Active',
                lastLogin: '2024-02-08 11:45:00',
                failedAttempts: 1,
                expires: '2024-12-31',
                created: '2023-06-10'
            }
        ];
    }

    initializeAuditLog() {
        this.auditLog = [
            {
                id: 1,
                timestamp: '2024-02-10 09:15:23',
                user: 'admin',
                action: 'Login',
                target: 'System',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Successful login from administrative workstation'
            },
            {
                id: 2,
                timestamp: '2024-02-10 09:20:15',
                user: 'admin',
                action: 'Create User',
                target: 'editor',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Created new user account for Finance department'
            },
            {
                id: 3,
                timestamp: '2024-02-09 14:30:45',
                user: 'editor',
                action: 'Data Access',
                target: 'Royalty Records',
                ipAddress: '192.168.1.105',
                status: 'Success',
                details: 'Accessed monthly royalty reports for January 2024'
            },
            {
                id: 4,
                timestamp: '2024-02-09 11:22:33',
                user: 'viewer',
                action: 'Failed Login',
                target: 'System',
                ipAddress: '192.168.1.108',
                status: 'Failed',
                details: 'Failed login attempt - incorrect password'
            },
            {
                id: 5,
                timestamp: '2024-02-08 16:45:12',
                user: 'admin',
                action: 'Modify User',
                target: 'viewer',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Updated user permissions for audit department'
            }
        ];
    }

    initializeContracts() {
        this.contracts = [
            {
                id: 'MC-2024-001',
                stakeholder: 'Government of Eswatini',
                stakeholderType: 'government',
                entity: 'Maloma Colliery',
                contractType: 'Mining License Agreement',
                calculationMethod: 'ad-valorem',
                royaltyRate: '2.5% of gross value',
                baseRate: 2.5,
                rateType: 'percentage',
                startDate: '2024-01-01',
                endDate: '2029-12-31',
                status: 'active',
                totalValue: 15500000,
                paymentSchedule: 'monthly',
                paymentDue: 15,
                lateFeeRate: 2.0,
                gracePeriod: 30,
                escalationClause: {
                    enabled: true,
                    frequency: 'annual',
                    rate: 2.5,
                    nextEscalation: '2025-03-15'
                },
                conditions: [
                    'Environmental compliance required',
                    'Quarterly production reports mandatory',
                    'Safety standards certification'
                ],
                signedDate: '2023-12-15',
                lastReview: '2024-01-01',
                nextReview: '2025-01-01'
            },
            {
                id: 'LC-2024-002',
                stakeholder: 'Mhlume Holdings Ltd',
                stakeholderType: 'private',
                entity: 'Ngwenya Mine',
                contractType: 'Private Land Lease',
                calculationMethod: 'profit-based',
                royaltyRate: '15% of net profit',
                baseRate: 15.0,
                rateType: 'percentage',
                startDate: '2024-03-15',
                endDate: '2027-03-14',
                status: 'active',
                totalValue: 8200000,
                paymentSchedule: 'quarterly',
                paymentDue: 'end-of-quarter',
                lateFeeRate: 1.5,
                gracePeriod: 14,
                escalationClause: {
                    enabled: false
                },
                conditions: [
                    'Land restoration fund contribution',
                    'Community development levy',
                    'Water usage monitoring'
                ],
                signedDate: '2024-02-28',
                lastReview: '2024-03-15',
                nextReview: '2025-03-15'
            },
            {
                id: 'LO-2024-003',
                stakeholder: 'Magwegwe Community Trust',
                stakeholderType: 'landowner',
                entity: 'Piggs Peak Quarry',
                contractType: 'Landowner Royalty Agreement',
                calculationMethod: 'quantity-based',
                royaltyRate: 'E 12 per tonne',
                baseRate: 12.0,
                rateType: 'fixed-amount',
                startDate: '2024-06-01',
                endDate: '2025-05-31',
                status: 'pending-renewal',
                totalValue: 2800000,
                paymentSchedule: 'monthly',
                paymentDue: 1,
                lateFeeRate: 3.0,
                gracePeriod: 7,
                escalationClause: {
                    enabled: true,
                    frequency: 'annual',
                    rate: 3.0,
                    nextEscalation: '2025-06-01'
                },
                conditions: [
                    'Traditional land usage rights respected',
                    'Local employment priority',
                    'Cultural heritage site protection'
                ],
                signedDate: '2024-05-15',
                lastReview: '2024-06-01',
                nextReview: '2025-01-01'
            },
            {
                id: 'JV-2024-004',
                stakeholder: 'Sikhupe Mining Consortium',
                stakeholderType: 'joint-venture',
                entity: 'Sidvokodvo Quarry',
                contractType: 'Joint Venture Agreement',
                calculationMethod: 'hybrid',
                royaltyRate: '2% + E 8 per tonne',
                baseRate: 2.0,
                fixedAmount: 8.0,
                rateType: 'hybrid',
                startDate: '2024-02-01',
                endDate: '2029-01-31',
                status: 'active',
                totalValue: 18700000,
                paymentSchedule: 'quarterly',
                paymentDue: 'end-of-quarter',
                lateFeeRate: 2.5,
                gracePeriod: 21,
                escalationClause: {
                    enabled: true,
                    frequency: 'biennial',
                    rate: 1.5,
                    nextEscalation: '2026-02-01'
                },
                conditions: [
                    'Joint environmental management',
                    'Shared infrastructure maintenance',
                    'Technology transfer requirements',
                    'Local content requirements'
                ],
                signedDate: '2024-01-15',
                lastReview: '2024-02-01',
                nextReview: '2025-02-01'
            }
        ];
    }

    // Data access methods
    getEntities() { return this.entities; }
    getMinerals() { return this.minerals; }
    getRoyaltyRecords() { return this.royaltyRecords; }
    getUserAccounts() { return this.userAccounts; }
    getAuditLog() { return this.auditLog; }
    getContracts() { return this.contracts; }

    // Data manipulation methods
    addAuditEntry(entry) {
        this.auditLog.unshift({
            id: this.auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            ...entry
        });
    }

    deleteUser(userId) {
        const index = this.userAccounts.findIndex(u => u.id === userId);
        if (index !== -1) {
            return this.userAccounts.splice(index, 1)[0];
        }
        return null;
    }

    findUserById(userId) {
        return this.userAccounts.find(u => u.id === userId);
    }

    findRecordById(recordId) {
        return this.royaltyRecords.find(r => r.id === recordId);
    }

    findContractById(contractId) {
        return this.contracts.find(c => c.id === contractId);
    }
}

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

// Initialize global instances
const notificationManager = new NotificationManager();
const dataManager = new DataManager();
const authManager = new AuthManager();

// Main Application Class
class RoyaltiesApp {
    constructor() {
        this.dashboardManager = null;
        this.sectionManagers = {};
        this.actionHandlers = {};
        this.charts = {};
    }

    async initialize() {
        console.log('DOM loaded - Starting application initialization...');
        
        // Initialize error suppression
        this.suppressNonCriticalErrors();
        
        // Initialize data
        dataManager.initialize();
        
        // Start loading sequence
        this.startLoadingSequence();
    }

    suppressNonCriticalErrors() {
        const originalError = console.error;
        console.error = function(...args) {
            const message = args.join(' ').toLowerCase();
            const suppressPatterns = [
                'favicon', 'fontawesome', 'cors', 'extension context',
                'manifest', 'service worker', 'kit.fontawesome'
            ];
            
            if (!suppressPatterns.some(pattern => message.includes(pattern))) {
                originalError.apply(console, args);
            }
        };
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
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        }
        
        // Form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = usernameInput?.value?.trim() || '';
                const password = passwordInput?.value?.trim() || '';
                
                if (!username || !password) {
                    this.showValidationErrors();
                    return;
                }
                
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

    showValidationErrors() {
        const usernameError = document.getElementById('username-error');
        const passwordError = document.getElementById('password-error');
        
        if (usernameError) usernameError.style.display = 'block';
        if (passwordError) passwordError.style.display = 'block';
        
        setTimeout(() => {
            if (usernameError) usernameError.style.display = 'none';
            if (passwordError) passwordError.style.display = 'none';
        }, 3000);
    }

    authenticateUser(username, password) {
        const result = authManager.authenticate(username, password);
        
        if (result.success) {
            // Add login to audit log
            dataManager.addAuditEntry({
                user: username,
                action: 'Login',
                target: 'System',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Successful login as ${result.user.role}`
            });
            
            this.showMainApplication();
        } else {
            notificationManager.show('Invalid credentials. Try: admin/admin123, editor/editor123, or viewer/viewer123', 'error');
            
            // Add failed login to audit log
            dataManager.addAuditEntry({
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
        console.log('Initializing main application for user:', authManager.getCurrentUser());
        
        // Update user display
        const userNameElement = document.getElementById('user-name');
        const currentUser = authManager.getCurrentUser();
        if (userNameElement && currentUser) {
            userNameElement.textContent = `${currentUser.username} (${currentUser.role})`;
        }
        
        // Initialize managers and handlers
        this.initializeManagers();
        this.setupEventListeners();
        
        // Initialize navigation
        this.setupNavigation();
        
        // Show dashboard by default
        this.showSection('dashboard');
        
        // Show welcome notification
        notificationManager.show(`Welcome back, ${currentUser.username}!`, 'success');
        
        console.log('Main application initialized successfully');
    }

    initializeManagers() {
        // Initialize action handlers with dynamic imports
        Promise.all([
            import('./js/actions/recordActions.js').catch(() => null)
        ]).then(([recordActionsModule]) => {
            // Initialize action handlers
            this.actionHandlers = {
                userActions: new UserActions(dataManager, notificationManager),
                recordActions: recordActionsModule ? 
                    new recordActionsModule.RecordActions(dataManager, notificationManager) : 
                    new RecordActions(dataManager, notificationManager),
                contractActions: new ContractActions(dataManager, notificationManager)
            };

            // Make action handlers globally available
            window.userActions = this.actionHandlers.userActions;
            window.recordActions = this.actionHandlers.recordActions;
            window.contractActions = this.actionHandlers.contractActions;
        });
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
                const href = link.getAttribute('href');
                
                if (href === '#logout') {
                    this.handleLogout();
                    return;
                }
                
                const sectionId = href.substring(1);
                this.showSection(sectionId);
            });
        });
        
        // Mobile sidebar toggle
        const sidebarClose = document.getElementById('sidebar-close');
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('active');
            });
        }
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
            currentSection = sectionId;
            
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
                this.initializeDashboard();
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
            // Cleanup charts before logout
            Object.values(this.charts).forEach(chart => {
                if (chart) chart.destroy();
            });
            this.charts = {};
            
            // Add logout audit entry
            const currentUser = authManager.getCurrentUser();
            if (currentUser) {
                dataManager.addAuditEntry({
                    user: currentUser.username,
                    action: 'Logout',
                    target: 'System',
                    ipAddress: '192.168.1.100',
                    status: 'Success',
                    details: 'User logged out successfully'
                });
            }
            
            authManager.logout();
            
            const loginSection = document.getElementById('login-section');
            const appContainer = document.getElementById('app-container');
            
            if (appContainer) appContainer.style.display = 'none';
            if (loginSection) loginSection.style.display = 'flex';
            
            // Clear login form
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
            
            notificationManager.show('Logged out successfully', 'info');
        }
    }

    initializeDashboard() {
        const section = document.getElementById('dashboard');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📊 Dashboard</h1>
                    <p>Mining royalties overview and key performance metrics</p>
                </div>
                <div class="user-info">
                    <span id="user-name"></span>
                </div>
            </div>

            <!-- Key Metrics Cards -->
            <div class="charts-grid">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-dollar-sign"></i> Total Royalties</h3>
                    </div>
                    <div class="card-body">
                        <p id="total-royalties">E 0.00</p>
                        <small class="trend-positive" id="royalties-trend">
                            <i class="fas fa-arrow-up"></i> +12.5%
                        </small>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-industry"></i> Active Entities</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-entities">0</p>
                        <small class="trend-positive" id="entities-trend">
                            <i class="fas fa-plus"></i> +2
                        </small>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-line"></i> Compliance Rate</h3>
                    </div>
                    <div class="card-body">
                        <p id="compliance-rate">0%</p>
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="compliance-progress"></div>
                        </div>
                        <small class="trend-positive" id="compliance-trend">
                            <i class="fas fa-arrow-up"></i> +2.1%
                        </small>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-clock"></i> Pending Approvals</h3>
                    </div>
                    <div class="card-body">
                        <p id="pending-approvals">0</p>
                        <small id="pending-text">No pending items</small>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Revenue Trends</h3>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart-type="line" data-chart-id="revenue-trends-chart">
                                <i class="fas fa-chart-line"></i> Line
                            </button>
                            <button class="chart-btn" data-chart-type="area" data-chart-id="revenue-trends-chart">
                                <i class="fas fa-chart-area"></i> Area
                            </button>
                            <button class="chart-btn" data-chart-type="bar" data-chart-id="revenue-trends-chart">
                                <i class="fas fa-chart-bar"></i> Bar
                            </button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="revenue-trends-chart"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Production by Entity</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="production-by-entity-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-history"></i> Recent Activity</h3>
                </div>
                <div class="card-body">
                    <div id="recent-activity">
                        <!-- Activity items will be populated here -->
                    </div>
                </div>
            </div>
        `;
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.updateDashboardMetrics();
            this.setupCharts();
            this.updateRecentActivity();
        }, 100);
    }

    updateDashboardMetrics() {
        console.log('Updating dashboard metrics...');
        
        const royaltyRecords = dataManager.getRoyaltyRecords();
        const entities = dataManager.getEntities();
        
        const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending').length;
        const overdueRecords = royaltyRecords.filter(r => r.status === 'Overdue').length;
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
        
        // Update trend indicators
        this.updateElement('royalties-trend', '+12.5%');
        this.updateElement('entities-trend', '+2 new entities');
        this.updateElement('compliance-trend', '+2.1%');
        this.updateElement('pending-text', pendingRecords > 0 ? 'Requires attention' : 'No pending items');
        
        console.log('Dashboard metrics updated successfully');
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    setupCharts() {
        console.log('Setting up charts...');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        // Destroy existing charts before creating new ones
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};

        this.setupRevenueChart();
        this.setupProductionChart();
        this.setupChartControls();
        
        console.log('Charts setup completed');
    }

    setupRevenueChart() {
        const revenueCtx = document.getElementById('revenue-trends-chart');
        if (revenueCtx && typeof Chart !== 'undefined') {
            this.charts.revenueTrends = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Monthly Revenue (E)',
                        data: [45000, 52000, 48000, 61000, 55000, 67000],
                        borderColor: '#1a365d',
                        backgroundColor: 'rgba(26, 54, 93, 0.1)',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'E' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
            console.log('Revenue chart created');
        } else {
            console.warn('Revenue chart canvas not found or Chart.js not available');
        }
    }

    setupProductionChart() {
        const productionCtx = document.getElementById('production-by-entity-chart');
        if (productionCtx && typeof Chart !== 'undefined') {
            const royaltyRecords = dataManager.getRoyaltyRecords();
            const entityData = royaltyRecords.reduce((acc, record) => {
                acc[record.entity] = (acc[record.entity] || 0) + record.volume;
                return acc;
            }, {});
            
            this.charts.productionByEntity = new Chart(productionCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(entityData),
                    datasets: [{
                        data: Object.values(entityData),
                        backgroundColor: [
                            '#1a365d', '#2d5a88', '#4a90c2', 
                            '#7ba7cc', '#a8c5e2', '#d4af37'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            console.log('Production chart created');
        } else {
            console.warn('Production chart canvas not found or Chart.js not available');
        }
    }

    setupChartControls() {
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const chartType = btn.dataset.chartType;
                const chartId = btn.dataset.chartId;
                
                // Update active state
                btn.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update chart if it exists
                if (chartId === 'revenue-trends-chart' && this.charts.revenueTrends) {
                    this.updateChartType(this.charts.revenueTrends, chartType);
                }
            });
        });
    }

    updateChartType(chart, type) {
        if (type === 'area') {
            chart.config.type = 'line';
            chart.data.datasets[0].fill = true;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.2)';
        } else if (type === 'bar') {
            chart.config.type = 'bar';
            chart.data.datasets[0].fill = false;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.8)';
        } else {
            chart.config.type = 'line';
            chart.data.datasets[0].fill = false;
            chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.1)';
        }
        chart.update();
    }

    updateRecentActivity() {
        console.log('Updating recent activity...');
        
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) {
            console.warn('Recent activity container not found');
            return;
        }
        
        const auditLog = dataManager.getAuditLog();
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
        
        console.log('Recent activity updated');
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

    // User Management Section
    loadUserManagementSection() {
        const section = document.getElementById('user-management');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>👥 User Management</h1>
                    <p>Manage system users, roles, and permissions</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-success" id="add-user-btn">
                        <i class="fas fa-user-plus"></i> Add User
                    </button>
                    <button class="btn btn-secondary" id="export-report-btn">
                        <i class="fas fa-file-export"></i> Export Report
                    </button>
                    <button class="btn btn-info" id="view-audit-btn">
                        <i class="fas fa-shield-alt"></i> View Audit Log
                    </button>
                </div>
            </div>

            <!-- User Management Table -->
            <div class="table-container">
                <table class="data-table" id="users-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all-users"></th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-tbody">
                        <!-- Content will be populated dynamically -->
                    </tbody>
                </table>
            </div>
        `;

        this.populateUsersTable();
        this.setupUserManagementEvents();
    }

    populateUsersTable() {
        const tbody = document.getElementById('users-table-tbody');
        if (!tbody) return;

        const users = dataManager.getUserAccounts();
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td><input type="checkbox" value="${user.id}"></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${user.department}</td>
                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                <td>${user.lastLogin}</td>
                <td>${user.created}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" onclick="userActions.viewUser(${user.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="userActions.editUser(${user.id})" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="userActions.deleteUser(${user.id})" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupUserManagementEvents() {
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                notificationManager.show('Add user functionality would open here', 'info');
            });
        }

        const exportBtn = document.getElementById('export-report-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                notificationManager.show('Exporting user report...', 'info');
            });
        }

        const auditBtn = document.getElementById('view-audit-btn');
        if (auditBtn) {
            auditBtn.addEventListener('click', () => {
                notificationManager.show('Audit log would open here', 'info');
            });
        }
    }

    // Royalty Records Section
    loadRoyaltyRecordsSection() {
        const section = document.getElementById('royalty-records');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>💰 Royalty Records</h1>
                    <p>Manage royalty payments and compliance tracking</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-success" id="add-record-btn">
                        <i class="fas fa-plus"></i> Add Record
                    </button>
                    <button class="btn btn-secondary" id="export-records-btn">
                        <i class="fas fa-file-export"></i> Export Records
                    </button>
                </div>
            </div>

            <!-- Royalty Records Table -->
            <div class="table-container">
                <table class="data-table" id="royalty-records-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all-records"></th>
                            <th>Reference #</th>
                            <th>Entity</th>
                            <th>Mineral</th>
                            <th>Volume</th>
                            <th>Tariff Rate</th>
                            <th>Royalties Due</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="royalty-records-tbody">
                        <!-- Content will be populated dynamically -->
                    </tbody>
                </table>
            </div>
        `;

        this.populateRoyaltyRecordsTable();
        this.setupRoyaltyRecordsEvents();
    }

    populateRoyaltyRecordsTable() {
        const tbody = document.getElementById('royalty-records-tbody');
        if (!tbody) return;

        const records = dataManager.getRoyaltyRecords();
        
        tbody.innerHTML = records.map(record => `
            <tr>
                <td><input type="checkbox" value="${record.id}"></td>
                <td>${record.referenceNumber}</td>
                <td>${record.entity}</td>
                <td>${record.mineral}</td>
                <td>${record.volume.toLocaleString()}</td>
                <td>E ${record.tariff}</td>
                <td>E ${record.royalties.toLocaleString()}</td>
                <td>${record.date}</td>
                <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" onclick="recordActions.viewRecord(${record.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="recordActions.editRecord(${record.id})" title="Edit Record">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="recordActions.deleteRecord(${record.id})" title="Delete Record">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupRoyaltyRecordsEvents() {
        const addRecordBtn = document.getElementById('add-record-btn');
        if (addRecordBtn) {
            addRecordBtn.addEventListener('click', () => {
                notificationManager.show('Add record functionality would open here', 'info');
            });
        }
    }

    // Contract Management Section
    loadContractManagementSection() {
        const section = document.getElementById('contract-management');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📋 Contract Management</h1>
                    <p>Manage mining contracts and agreements</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-success" id="add-contract-btn">
                        <i class="fas fa-plus"></i> Add Contract
                    </button>
                    <button class="btn btn-secondary" id="export-contracts-btn">
                        <i class="fas fa-file-export"></i> Export Contracts
                    </button>
                </div>
            </div>

            <!-- Contracts Table -->
            <div class="table-container">
                <table class="data-table" id="contracts-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all-contracts"></th>
                            <th>Contract ID</th>
                            <th>Stakeholder</th>
                            <th>Entity</th>
                            <th>Type</th>
                            <th>Royalty Rate</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="contracts-tbody">
                        <!-- Content will be populated dynamically -->
                    </tbody>
                </table>
            </div>
        `;

        this.populateContractsTable();
        this.setupContractManagementEvents();
    }

    populateContractsTable() {
        const tbody = document.getElementById('contracts-tbody');
        if (!tbody) return;

        const contracts = dataManager.getContracts();
        
        tbody.innerHTML = contracts.map(contract => `
            <tr>
                <td><input type="checkbox" value="${contract.id}"></td>
                <td>${contract.id}</td>
                <td>${contract.stakeholder}</td>
                <td>${contract.entity}</td>
                <td>${contract.contractType}</td>
                <td>${contract.royaltyRate}</td>
                <td>${contract.startDate}</td>
                <td>${contract.endDate}</td>
                <td><span class="status-badge ${contract.status}">${contract.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" onclick="contractActions.viewContract('${contract.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="contractActions.editContract('${contract.id}')" title="Edit Contract">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="contractActions.deleteContract('${contract.id}')" title="Delete Contract">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupContractManagementEvents() {
        const addContractBtn = document.getElementById('add-contract-btn');
        if (addContractBtn) {
            addContractBtn.addEventListener('click', () => {
                notificationManager.show('Add contract functionality would open here', 'info');
            });
        }
    }
}

// Action Handler Classes
class UserActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewUser(userId) {
        const user = this.dataManager.findUserById(userId);
        if (!user) {
            this.notificationManager.show('User not found', 'error');
            return;
        }
        this.notificationManager.show(`Viewing user: ${user.username}`, 'info');
    }

    editUser(userId) {
        const user = this.dataManager.findUserById(userId);
        if (!user) {
            this.notificationManager.show('User not found', 'error');
            return;
        }
        this.notificationManager.show(`Editing user: ${user.username}`, 'info');
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            const deletedUser = this.dataManager.deleteUser(userId);
            if (deletedUser) {
                this.notificationManager.show('User deleted successfully', 'success');
                // Refresh the table
                document.dispatchEvent(new CustomEvent('reloadSection', { detail: { sectionId: 'user-management' } }));
            }
        }
    }

    addUser() {
        this.notificationManager.show('Add new user functionality would open here', 'info');
    }
}

class RecordActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewRecord(recordId) {
        const record = this.dataManager.findRecordById(recordId);
        if (!record) {
            this.notificationManager.show('Record not found', 'error');
            return;
        }
        this.notificationManager.show(`Viewing record: ${record.referenceNumber}`, 'info');
    }

    editRecord(recordId) {
        const record = this.dataManager.findRecordById(recordId);
        if (!record) {
            this.notificationManager.show('Record not found', 'error');
            return;
        }
        this.notificationManager.show(`Editing record: ${record.referenceNumber}`, 'info');
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

class ContractActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewContract(contractId) {
        const contract = this.dataManager.findContractById(contractId);
        if (!contract) {
            this.notificationManager.show('Contract not found', 'error');
            return;
        }
        this.notificationManager.show(`Viewing contract: ${contract.id}`, 'info');
    }

    editContract(contractId) {
        const contract = this.dataManager.findContractById(contractId);
        if (!contract) {
            this.notificationManager.show('Contract not found', 'error');
            return;
        }
        this.notificationManager.show(`Editing contract: ${contract.id}`, 'info');
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
    console.log('DOM Content Loaded - Initializing app...');
    const app = new RoyaltiesApp();
    app.initialize();
});
