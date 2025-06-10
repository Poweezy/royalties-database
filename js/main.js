/* Mining Royalties Manager - Main Application JavaScript */
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

// ===== NOTIFICATION MANAGER =====
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

// ===== DATA MANAGER =====
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
                gracePeriod: 30
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
                gracePeriod: 14
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

// ===== AUTHENTICATION MANAGER =====
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

// ===== TEMPLATE LOADER =====
class TemplateLoader {
    async loadTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn(`Failed to load template ${templatePath}:`, error.message);
        }
        
        return this._getFallbackTemplate(templatePath);
    }

    _getFallbackTemplate(templatePath) {
        const fallbacks = {
            'components/sidebar.html': `
                <div class="sidebar-header">
                    <div class="sidebar-logo">MR</div>
                    <h2>Royalties Manager</h2>
                </div>
                <nav>
                    <ul>
                        <li><a href="#dashboard" class="nav-link active" data-section="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                        <li><a href="#user-management" class="nav-link" data-section="user-management"><i class="fas fa-users"></i> User Management</a></li>
                        <li><a href="#royalty-records" class="nav-link" data-section="royalty-records"><i class="fas fa-file-invoice-dollar"></i> Royalty Records</a></li>
                        <li><a href="#contract-management" class="nav-link" data-section="contract-management"><i class="fas fa-file-contract"></i> Contract Management</a></li>
                        <li><a href="#audit-dashboard" class="nav-link" data-section="audit-dashboard"><i class="fas fa-shield-alt"></i> Audit Dashboard</a></li>
                        <li><a href="#reporting-analytics" class="nav-link" data-section="reporting-analytics"><i class="fas fa-chart-bar"></i> Reporting & Analytics</a></li>
                        <li><a href="#communication" class="nav-link" data-section="communication"><i class="fas fa-envelope"></i> Communication</a></li>
                        <li><a href="#notifications" class="nav-link" data-section="notifications"><i class="fas fa-bell"></i> Notifications <span id="notification-count">3</span></a></li>
                        <li><a href="#compliance" class="nav-link" data-section="compliance"><i class="fas fa-check-circle"></i> Compliance & Regulatory</a></li>
                        <li><a href="#regulatory-management" class="nav-link" data-section="regulatory-management"><i class="fas fa-gavel"></i> Regulatory Management</a></li>
                        <li><a href="#profile" class="nav-link" data-section="profile"><i class="fas fa-user"></i> My Profile</a></li>
                        <li><a href="#logout" class="nav-link" data-section="logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                    </ul>
                </nav>
            `
        };
        
        return fallbacks[templatePath] || '<div class="error">Template not found</div>';
    }
}

// ===== MAIN APPLICATION CLASS =====
class RoyaltiesApp {
    constructor() {
        this.dataManager = new DataManager();
        this.authManager = new AuthManager();
        this.notificationManager = new NotificationManager();
        this.templateLoader = new TemplateLoader();
        this.actionHandlers = {};
        this.charts = {};
    }

    async initialize() {
        console.log('DOM loaded - Starting application initialization...');
        
        // Initialize utilities
        if (typeof Utils !== 'undefined') {
            Utils.suppressNonCriticalErrors();
        }
        
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
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = usernameInput?.value;
                const password = passwordInput?.value;
                this.authenticateUser(username, password);
            });
        }
        
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

    async showMainApplication() {
        const loginSection = document.getElementById('login-section');
        const appContainer = document.getElementById('app-container');
        
        if (loginSection) loginSection.style.display = 'none';
        if (appContainer) appContainer.style.display = 'flex';
        
        await this.loadSidebar();
        this.initializeMainApplication();
    }

    async loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const sidebarContent = await this.templateLoader.loadTemplate('components/sidebar.html');
            sidebar.innerHTML = sidebarContent;
        }
    }

    initializeMainApplication() {
        console.log('Initializing main application for user:', this.authManager.getCurrentUser());
        
        this.initializeManagers();
        this.setupEventListeners();
        this.setupNavigation();
        this.showSection('dashboard');
        
        const currentUser = this.authManager.getCurrentUser();
        this.notificationManager.show(`Welcome back, ${currentUser.username}!`, 'success');
        
        console.log('Main application initialized successfully');
    }

    initializeManagers() {
        this.actionHandlers = {
            recordActions: new RecordActions(this.dataManager, this.notificationManager),
            userActions: new UserActions(this.dataManager, this.notificationManager),
            contractActions: new ContractActions(this.dataManager, this.notificationManager)
        };

        window.dataManager = this.dataManager;
        window.notificationManager = this.notificationManager;
        window.recordActions = this.actionHandlers.recordActions;
        window.userActions = this.actionHandlers.userActions;
        window.contractActions = this.actionHandlers.contractActions;
    }

    setupEventListeners() {
        document.addEventListener('logoutRequested', () => {
            this.handleLogout();
        });

        document.addEventListener('reloadSection', (e) => {
            this.loadSectionContent(e.detail.sectionId);
        });
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
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

    showSection(sectionId) {
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            currentSection = sectionId;
            
            this.updateNavigationState(sectionId);
            this.loadSectionContent(sectionId);
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

    async loadSectionContent(sectionId) {
        console.log(`Loading section: ${sectionId}`);
        
        // Try to load component from components folder first
        try {
            const componentHTML = await this.templateLoader.loadTemplate(`components/${sectionId}.html`);
            const section = document.getElementById(sectionId);
            if (section && componentHTML && !componentHTML.includes('Template not found')) {
                section.innerHTML = componentHTML;
                console.log(`Successfully loaded component: ${sectionId}.html`);
                
                // Initialize component-specific functionality
                this.initializeComponent(sectionId);
                return;
            }
        } catch (error) {
            console.warn(`Failed to load component ${sectionId}.html:`, error.message);
        }
        
        // Fallback to built-in section loaders
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardSection();
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
            case 'reporting-analytics':
                this.loadReportingAnalyticsSection();
                break;
            default:
                this.loadGenericSection(sectionId);
        }
    }

    initializeComponent(sectionId) {
        console.log(`Initializing component: ${sectionId}`);
        
        // Add a delay to ensure the component HTML is fully loaded
        setTimeout(() => {
            switch (sectionId) {
                case 'dashboard':
                    this.initializeDashboardComponent();
                    break;
                case 'user-management':
                    this.initializeUserManagementComponent();
                    break;
                case 'royalty-records':
                    this.initializeRoyaltyRecordsComponent();
                    break;
                case 'contract-management':
                    this.initializeContractManagementComponent();
                    break;
                case 'reporting-analytics':
                    this.initializeReportingAnalyticsComponent();
                    break;
            }
        }, 100);
    }

    initializeReportingAnalyticsComponent() {
        console.log('Initializing reporting analytics component...');
        
        // The component has its own initialization script embedded
        // Just trigger the chart initialization if needed
        if (typeof initializeAnalyticsCharts === 'function') {
            initializeAnalyticsCharts();
        }
        
        if (typeof setupAnalyticsEventListeners === 'function') {
            setupAnalyticsEventListeners();
        }
        
        // Ensure the component is properly connected to the notification system
        const section = document.getElementById('reporting-analytics');
        if (section && section.innerHTML.includes('page-header')) {
            console.log('Reporting analytics component loaded and initialized successfully');
        }
    }

    loadReportingAnalyticsSection() {
        const section = document.getElementById('reporting-analytics');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📊 Reporting & Analytics</h1>
                    <p>Generate comprehensive reports and view detailed analytics</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-info" id="refresh-analytics-btn">
                        <i class="fas fa-sync-alt"></i> Refresh Data
                    </button>
                    <button class="btn btn-success" id="generate-basic-report-btn">
                        <i class="fas fa-file-chart-column"></i> Generate Report
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <h5>📊 Analytics Dashboard</h5>
                    <p>Advanced reporting and analytics functionality is being loaded...</p>
                    <p>This includes:</p>
                    <ul>
                        <li>Revenue trend analysis</li>
                        <li>Entity performance metrics</li>
                        <li>Compliance reporting</li>
                        <li>Payment analytics</li>
                        <li>Custom report generation</li>
                    </ul>
                </div>
            </div>
        `;

        // Setup basic event listeners
        const refreshBtn = document.getElementById('refresh-analytics-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.notificationManager.show('Analytics data refreshed', 'success');
            });
        }

        const generateBtn = document.getElementById('generate-basic-report-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.notificationManager.show('Report generation feature available in full component', 'info');
            });
        }
    }

    loadDashboardSection() {
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

            <div class="charts-grid" id="kpi-metrics">
                <div class="card">
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

                <div class="card">
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

                <div class="card">
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

                <div class="card">
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
        
        this.updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}.00`);
        this.updateElement('active-entities', activeEntities);
        this.updateElement('compliance-rate', `${complianceRate}%`);
        this.updateElement('pending-approvals', pendingRecords);
        
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
                    <p>Manage system users, roles, and permissions</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-success" id="add-user-btn">
                        <i class="fas fa-user-plus"></i> Add User
                    </button>
                    <button class="btn btn-secondary" id="export-report-btn">
                        <i class="fas fa-file-export"></i> Export Report
                    </button>
                </div>
            </div>

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

        const users = this.dataManager.getUserAccounts();
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td><input type="checkbox" value="${user.id}"></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="status-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${user.department}</td>
                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                <td>${user.lastLogin}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" onclick="userActions.viewUser(${user.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="userActions.editUser(${user.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="userActions.deleteUser(${user.id})" title="Delete">
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
                this.notificationManager.show('Add user functionality would open here', 'info');
            });
        }
    }

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
    }

    populateRoyaltyRecordsTable() {
        const tbody = document.getElementById('royalty-records-tbody');
        if (!tbody) return;

        const records = this.dataManager.getRoyaltyRecords();
        
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
                        <button class="btn btn-sm btn-secondary" onclick="recordActions.viewRecord(${record.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="recordActions.editRecord(${record.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="recordActions.deleteRecord(${record.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

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
    }

    populateContractsTable() {
        const tbody = document.getElementById('contracts-tbody');
        if (!tbody) return;

        const contracts = this.dataManager.getContracts();
        
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
                        <button class="btn btn-sm btn-secondary" onclick="contractActions.viewContract('${contract.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="contractActions.editContract('${contract.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="contractActions.deleteContract('${contract.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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
            Object.values(this.charts).forEach(chart => {
                if (chart) chart.destroy();
            });
            this.charts = {};
            
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
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
            
            this.notificationManager.show('Logged out successfully', 'info');
        }
    }
}

// ===== ACTION HANDLER CLASSES =====
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
                document.dispatchEvent(new CustomEvent('reloadSection', { detail: { sectionId: 'user-management' } }));
            }
        }
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
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing app...');
    const app = new RoyaltiesApp();
    window.royaltiesApp = app;
    app.initialize();
});