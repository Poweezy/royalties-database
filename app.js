// Mining Royalties Manager - Main Application JavaScript
console.log('Mining Royalties Manager v1.0 - Loading...');

// Global application state
let currentUser = null;
let currentSection = 'dashboard';
let charts = {};

// ===== MOBILE NAVIGATION MANAGER =====
class MobileNavigationManager {
    constructor() {
        this.isOpen = false;
        this.setupMobileToggle();
    }

    setupMobileToggle() {
        // Create mobile toggle button if it doesn't exist
        let toggleButton = document.querySelector('.mobile-menu-toggle');
        if (!toggleButton) {
            toggleButton = document.createElement('button');
            toggleButton.className = 'mobile-menu-toggle';
            toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
            toggleButton.style.cssText = `
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 1001;
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 0.75rem;
                border-radius: 6px;
                font-size: 1rem;
                cursor: pointer;
                display: none;
            `;
            document.body.appendChild(toggleButton);
        }
        
        toggleButton.addEventListener('click', () => this.toggleSidebar());

        // Show toggle on mobile
        this.updateToggleVisibility();
        window.addEventListener('resize', () => {
            this.updateToggleVisibility();
            if (window.innerWidth > 768) {
                this.closeSidebar();
            }
        });
    }

    updateToggleVisibility() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (toggle) {
            toggle.style.display = window.innerWidth <= 768 ? 'block' : 'none';
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            this.isOpen = !this.isOpen;
            sidebar.classList.toggle('mobile-open', this.isOpen);
            
            // Update toggle icon
            const toggle = document.querySelector('.mobile-menu-toggle i');
            if (toggle) {
                toggle.className = this.isOpen ? 'fas fa-times' : 'fas fa-bars';
            }
            
            // Add/remove overlay
            this.toggleOverlay();
        }
    }

    toggleOverlay() {
        let overlay = document.querySelector('.mobile-overlay');
        if (this.isOpen) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'mobile-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                `;
                overlay.addEventListener('click', () => this.closeSidebar());
                document.body.appendChild(overlay);
            }
            overlay.classList.add('active');
        } else if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            this.isOpen = false;
            sidebar.classList.remove('mobile-open');
            
            const toggle = document.querySelector('.mobile-menu-toggle i');
            if (toggle) toggle.className = 'fas fa-bars';
            
            // Remove overlay
            const overlay = document.querySelector('.mobile-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            }
        }
    }
}

// ===== NOTIFICATION MANAGER =====
class NotificationManager {
    constructor() {
        this.activeNotifications = new Set();
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const iconMap = {
            'success': '✓',
            'error': '✗',
            'warning': '⚠',
            'info': 'ℹ'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <span style="margin-right: 0.5rem;">${iconMap[type]}</span>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                ×
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
            },
            {
                id: 4, entity: 'Mbabane Quarry', mineral: 'Gravel', volume: 750,
                tariff: 10, royalties: 7500, date: '2024-02-01', status: 'Overdue', referenceNumber: 'ROY-2024-004'
            }
        ];
    }

    initializeUserAccounts() {
        this.userAccounts = [
            {
                id: 1, username: 'admin', email: 'admin@eswacaa.sz', role: 'Administrator',
                department: 'Management', status: 'Active', lastLogin: '2024-02-10 09:15:00'
            },
            {
                id: 2, username: 'editor', email: 'editor@eswacaa.sz', role: 'Editor',
                department: 'Finance', status: 'Active', lastLogin: '2024-02-09 14:30:00'
            },
            {
                id: 3, username: 'viewer', email: 'viewer@eswacaa.sz', role: 'Viewer',
                department: 'Audit', status: 'Active', lastLogin: '2024-02-08 11:45:00'
            }
        ];
    }

    initializeAuditLog() {
        this.auditLog = [
            {
                id: 1, timestamp: '2024-02-10 09:15:23', user: 'admin', action: 'Login',
                target: 'System', ipAddress: '192.168.1.100', status: 'Success'
            },
            {
                id: 2, timestamp: '2024-02-10 09:20:15', user: 'admin', action: 'Create User',
                target: 'editor', ipAddress: '192.168.1.100', status: 'Success'
            }
        ];
    }

    initializeContracts() {
        this.contracts = [
            {
                id: 'MC-2024-001', stakeholder: 'Government of Eswatini', entity: 'Maloma Colliery',
                contractType: 'Mining License Agreement', royaltyRate: '2.5% of gross value',
                startDate: '2024-01-01', endDate: '2029-12-31', status: 'active'
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

    findUserById(userId) { return this.userAccounts.find(u => u.id === userId); }
    findRecordById(recordId) { return this.royaltyRecords.find(r => r.id === recordId); }
    findContractById(contractId) { return this.contracts.find(c => c.id === contractId); }
}

// ===== AUTHENTICATION MANAGER =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.validCredentials = [
            { username: 'admin', password: 'admin123', role: 'Administrator' },
            { username: 'editor', password: 'editor123', role: 'Editor' },
            { username: 'viewer', password: 'viewer123', role: 'Viewer' },
            { username: 'finance', password: 'finance123', role: 'Finance Manager' },
            { username: 'auditor', password: 'audit123', role: 'Auditor' }
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
                department: this.getDepartmentByRole(user.role),
                email: `${user.username}@eswacaa.sz`,
                lastLogin: new Date().toISOString()
            };
            return { success: true, user: this.currentUser };
        }
        return { success: false, error: 'Invalid credentials' };
    }

    getDepartmentByRole(role) {
        const roleToDepartment = {
            'Administrator': 'Management',
            'Finance Manager': 'Finance',
            'Editor': 'Finance',
            'Auditor': 'Audit',
            'Viewer': 'Audit'
        };
        return roleToDepartment[role] || 'General';
    }

    getCurrentUser() { return this.currentUser; }
    logout() { this.currentUser = null; }
    isAuthenticated() { return this.currentUser !== null; }
    hasRole(role) { return this.currentUser && this.currentUser.role === role; }
}

// ===== MAIN APPLICATION CLASS =====
class RoyaltiesApp {
    constructor() {
        this.dataManager = new DataManager();
        this.authManager = new AuthManager();
        this.notificationManager = new NotificationManager();
        this.chartManager = new ChartManager();
        this.actionHandlers = {};
        this.charts = {};
        this.mobileNav = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }
        
        console.log('DOM loaded - Starting application initialization...');
        this.dataManager.initialize();
        this.setupGlobalErrorHandling();
        this.startLoadingSequence();
        this.isInitialized = true;
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            if (this.notificationManager) {
                this.notificationManager.show('An unexpected error occurred', 'error');
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (this.notificationManager) {
                this.notificationManager.show('System error - please refresh the page', 'error');
            }
        });
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
        
        if (loadingScreen) loadingScreen.style.display = 'none';
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
                this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
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
    }

    authenticateUser(username, password) {
        const result = this.authManager.authenticate(username, password);
        
        if (result.success) {
            this.dataManager.addAuditEntry({
                user: username, action: 'Login', target: 'System',
                ipAddress: '192.168.1.100', status: 'Success',
                details: `Successful login as ${result.user.role}`
            });
            this.showMainApplication();
        } else {
            this.notificationManager.show('Invalid credentials. Try: admin/admin123, editor/editor123, or viewer/viewer123', 'error');
            this.dataManager.addAuditEntry({
                user: username || 'Unknown', action: 'Failed Login', target: 'System',
                ipAddress: '192.168.1.100', status: 'Failed',
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
            sidebar.innerHTML = `
                <div class="sidebar-header">
                    <div class="sidebar-logo">MR</div>
                    <h2>Royalties Manager</h2>
                </div>
                <nav>
                    <ul>
                        <li><a href="#dashboard" class="nav-link active" data-section="dashboard"><i class="fas fa-chart-line"></i> Dashboard</a></li>
                        <li><a href="#user-management" class="nav-link" data-section="user-management"><i class="fas fa-users"></i> User Management</a></li>
                        <li><a href="#royalty-records" class="nav-link" data-section="royalty-records"><i class="fas fa-money-bill-wave"></i> Royalty Records</a></li>
                        <li><a href="#contract-management" class="nav-link" data-section="contract-management"><i class="fas fa-file-contract"></i> Contract Management</a></li>
                        <li><a href="#audit-dashboard" class="nav-link" data-section="audit-dashboard"><i class="fas fa-shield-alt"></i> Audit Dashboard</a></li>
                        <li><a href="#reporting-analytics" class="nav-link" data-section="reporting-analytics"><i class="fas fa-chart-bar"></i> Reporting & Analytics</a></li>
                        <li><a href="#communication" class="nav-link" data-section="communication"><i class="fas fa-envelope"></i> Communication</a></li>
                        <li><a href="#notifications" class="nav-link" data-section="notifications"><i class="fas fa-bell"></i> Notifications</a></li>
                        <li><a href="#compliance" class="nav-link" data-section="compliance"><i class="fas fa-check-circle"></i> Compliance</a></li>
                        <li><a href="#regulatory-management" class="nav-link" data-section="regulatory-management"><i class="fas fa-gavel"></i> Regulatory</a></li>
                        <li><a href="#profile" class="nav-link" data-section="profile"><i class="fas fa-user"></i> Profile</a></li>
                        <li><a href="#logout" class="nav-link" data-section="logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                    </ul>
                </nav>
            `;
        }
    }

    initializeMainApplication() {
        console.log('Initializing main application for user:', this.authManager.getCurrentUser());
        
        this.initializeManagers();
        this.setupEventListeners();
        this.setupNavigation();
        this.setupGlobalAuditActions();
        
        // Initialize mobile navigation
        this.mobileNav = new MobileNavigationManager();
        
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

        // Make managers globally available
        window.dataManager = this.dataManager;
        window.notificationManager = this.notificationManager;
        window.recordActions = this.actionHandlers.recordActions;
        window.userActions = this.actionHandlers.userActions;
        window.contractActions = this.actionHandlers.contractActions;
    }

    setupEventListeners() {
        // Remove existing listeners to prevent duplicates
        document.removeEventListener('logoutRequested', this.handleLogout);
        document.removeEventListener('reloadSection', this.handleReloadSection);
        
        // Add fresh listeners
        this.handleLogout = () => this.performLogout();
        this.handleReloadSection = (e) => this.loadSectionContent(e.detail.sectionId);
        
        document.addEventListener('logoutRequested', this.handleLogout);
        document.addEventListener('reloadSection', this.handleReloadSection);
    }

    setupNavigation() {
        // Remove existing navigation listener to prevent duplicates
        if (this.navigationHandler) {
            document.removeEventListener('click', this.navigationHandler);
        }
        
        // Create new navigation handler
        this.navigationHandler = (e) => {
            const navLink = e.target.closest('.nav-link');
            if (navLink) {
                e.preventDefault();
                e.stopPropagation();
                
                const section = navLink.dataset.section;
                
                // Close mobile menu on navigation
                if (this.mobileNav) {
                    this.mobileNav.closeSidebar();
                }
                
                if (section === 'logout') {
                    this.performLogout();
                } else {
                    this.showSection(section);
                }
            }
        };
        
        document.addEventListener('click', this.navigationHandler);
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => section.style.display = 'none');

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

    loadSectionContent(sectionId) {
        console.log(`Loading section: ${sectionId}`);
        
        // Try to load component from components directory first
        fetch(`components/${sectionId}.html`)
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error(`Component not found: ${sectionId}.html`);
            })
            .then(componentHTML => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.innerHTML = componentHTML;
                    console.log(`Successfully loaded component: ${sectionId}.html`);
                    this.initializeComponent(sectionId);
                }
            })
            .catch(error => {
                console.warn(`Failed to load component ${sectionId}.html:`, error.message);
                // Fallback to built-in section loaders
                this.loadFallbackSection(sectionId);
            });
    }

    initializeComponent(sectionId) {
        console.log(`Initializing component: ${sectionId}`);
        
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
                case 'audit-dashboard':
                    this.initializeAuditDashboardComponent();
                    break;
                case 'communication':
                    this.initializeCommunicationComponent();
                    break;
                case 'notifications':
                    this.initializeNotificationsComponent();
                    break;
                case 'compliance':
                    this.initializeComplianceComponent();
                    break;
                case 'regulatory-management':
                    this.initializeRegulatoryManagementComponent();
                    break;
                case 'profile':
                    this.initializeProfileComponent();
                    break;
                default:
                    console.log(`No specific initialization for component: ${sectionId}`);
            }
        }, 100);
    }

    // Component initialization methods
    initializeDashboardComponent() {
        console.log('Initializing dashboard component...');
        
        // Make sure managers are globally available
        window.dataManager = this.dataManager;
        window.notificationManager = this.notificationManager;
        window.royaltiesApp = this;
        
        setTimeout(() => {
            this.updateDashboardMetrics();
            this.updateRecentActivity();
            this.setupDashboardEventListeners();
            
            // Initialize charts if Chart.js is available
            try {
                this.initializeDashboardCharts();
            } catch (error) {
                console.error('Error initializing dashboard charts:', error);
            }
        }, 300);
    }

    initializeDashboardCharts() {
        console.log('Setting up dashboard charts...');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, skipping chart initialization');
            return;
        }

        try {
            this.createRevenueChart();
            this.createEntityChart();
            this.createPaymentTimelineChart();
            this.createMineralPerformanceChart();
            this.createForecastChart();
        } catch (error) {
            console.error('Error creating charts:', error);
        }
    }

    createRevenueChart() {
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
                    plugins: { legend: { display: false } },
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
        }
    }

    createEntityChart() {
        const entityCtx = document.getElementById('production-by-entity-chart') || document.getElementById('revenue-by-entity-chart');
        if (entityCtx && typeof Chart !== 'undefined') {
            const royaltyRecords = this.dataManager.getRoyaltyRecords();
            const entityData = royaltyRecords.reduce((acc, record) => {
                acc[record.entity] = (acc[record.entity] || 0) + record.volume;
                return acc;
            }, {});
            
            this.charts.entityProduction = new Chart(entityCtx, {
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
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }

    createPaymentTimelineChart() {
        const canvas = document.getElementById('payment-timeline-chart');
        if (canvas && typeof Chart !== 'undefined') {
            this.charts.paymentTimeline = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Payments Received',
                        data: [85000, 92000, 88000, 95000, 91000, 98000],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Payments Due',
                        data: [90000, 95000, 90000, 98000, 93000, 100000],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
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
        }
    }

    createMineralPerformanceChart() {
        const canvas = document.getElementById('mineral-performance-chart');
        if (canvas && typeof Chart !== 'undefined') {
            const records = this.dataManager.getRoyaltyRecords();
            const mineralData = this.aggregateMineralPerformance(records);
            
            this.charts.mineralPerformance = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: mineralData.labels,
                    datasets: [{
                        label: 'Revenue (E)',
                        data: mineralData.revenue,
                        backgroundColor: ['#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc', '#a8c5e2', '#d4af37']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
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
        }
    }

    createForecastChart() {
        const canvas = document.getElementById('forecast-chart');
        if (canvas && typeof Chart !== 'undefined') {
            this.charts.forecast = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Historical',
                        data: [45000, 52000, 48000, 61000, 55000, 67000, null, null, null, null, null, null],
                        borderColor: '#1a365d',
                        backgroundColor: 'rgba(26, 54, 93, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Forecast',
                        data: [null, null, null, null, null, 67000, 69000, 71000, 68000, 73000, 75000, 77000],
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
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
        }
    }

    aggregateMineralPerformance(records) {
        const mineralRevenue = records.reduce((acc, record) => {
            if (record.mineral && record.royalties) {
                acc[record.mineral] = (acc[record.mineral] || 0) + record.royalties;
            }
            return acc;
        }, {});
        
        return {
            labels: Object.keys(mineralRevenue),
            revenue: Object.values(mineralRevenue)
        };
    }

    setupDashboardEventListeners() {
        // Remove existing listeners first
        this.removeDashboardListeners();
        
        // Main dashboard action buttons
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            this.refreshDashboardHandler = () => this.refreshDashboard();
            refreshBtn.addEventListener('click', this.refreshDashboardHandler);
        }
        
        const exportBtn = document.getElementById('export-dashboard-btn');
        if (exportBtn) {
            this.exportDashboardHandler = () => this.exportDashboard();
            exportBtn.addEventListener('click', this.exportDashboardHandler);
        }
        
        // Chart control handlers
        const chartBtns = document.querySelectorAll('.chart-btn');
        this.chartBtnHandlers = [];
        chartBtns.forEach((btn, index) => {
            const handler = () => {
                // Remove active class from siblings
                btn.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update chart if needed
                const chartType = btn.dataset.chartType;
                const chartId = btn.dataset.chartId;
                
                if (chartId && this.charts[chartId]) {
                    this.updateChartType(this.charts[chartId], chartType);
                }
                
                this.notificationManager.show(`Switched to ${chartType} view`, 'info');
            };
            
            this.chartBtnHandlers[index] = handler;
            btn.addEventListener('click', handler);
        });
        
        // Period selectors
        const periodSelectors = document.querySelectorAll('.metric-period');
        this.periodSelectorHandlers = [];
        periodSelectors.forEach((selector, index) => {
            const handler = () => {
                this.notificationManager.show(`Updated for ${selector.value.replace('-', ' ')}`, 'success');
                this.updateDashboardMetrics();
            };
            
            this.periodSelectorHandlers[index] = handler;
            selector.addEventListener('change', handler);
        });
        
        // Filter handlers
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            this.applyFiltersHandler = () => this.applyDashboardFilters();
            applyFiltersBtn.addEventListener('click', this.applyFiltersHandler);
        }
        
        const resetFiltersBtn = document.getElementById('reset-filters');
        if (resetFiltersBtn) {
            this.resetFiltersHandler = () => this.resetDashboardFilters();
            resetFiltersBtn.addEventListener('click', this.resetFiltersHandler);
        }
    }

    removeDashboardListeners() {
        // Remove refresh button listener
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn && this.refreshDashboardHandler) {
            refreshBtn.removeEventListener('click', this.refreshDashboardHandler);
        }
        
        // Remove export button listener
        const exportBtn = document.getElementById('export-dashboard-btn');
        if (exportBtn && this.exportDashboardHandler) {
            exportBtn.removeEventListener('click', this.exportDashboardHandler);
        }
        
        // Remove chart button listeners
        const chartBtns = document.querySelectorAll('.chart-btn');
        if (this.chartBtnHandlers) {
            chartBtns.forEach((btn, index) => {
                if (this.chartBtnHandlers[index]) {
                    btn.removeEventListener('click', this.chartBtnHandlers[index]);
                }
            });
        }
        
        // Remove period selector listeners
        const periodSelectors = document.querySelectorAll('.metric-period');
        if (this.periodSelectorHandlers) {
            periodSelectors.forEach((selector, index) => {
                if (this.periodSelectorHandlers[index]) {
                    selector.removeEventListener('change', this.periodSelectorHandlers[index]);
                }
            });
        }
        
        // Remove filter button listeners
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn && this.applyFiltersHandler) {
            applyFiltersBtn.removeEventListener('click', this.applyFiltersHandler);
        }
        
        const resetFiltersBtn = document.getElementById('reset-filters');
        if (resetFiltersBtn && this.resetFiltersHandler) {
            resetFiltersBtn.removeEventListener('click', this.resetFiltersHandler);
        }
    }

    performLogout() {
        try {
            this.authManager.logout();
            
            // Clean up event listeners
            this.cleanup();
            
            // Clear any existing charts
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    try {
                        chart.destroy();
                    } catch (error) {
                        console.warn('Error destroying chart:', error);
                    }
                }
            });
            this.charts = {};
            
            // Show login section
            const appContainer = document.getElementById('app-container');
            const loginSection = document.getElementById('login-section');
            
            if (appContainer) appContainer.style.display = 'none';
            if (loginSection) loginSection.style.display = 'flex';
            
            this.notificationManager.show('Logged out successfully', 'info');
        } catch (error) {
            console.error('Error during logout:', error);
            this.notificationManager.show('Error during logout', 'error');
        }
    }

    cleanup() {
        // Remove global event listeners
        if (this.navigationHandler) {
            document.removeEventListener('click', this.navigationHandler);
        }
        
        if (this.handleLogout) {
            document.removeEventListener('logoutRequested', this.handleLogout);
        }
        
        if (this.handleReloadSection) {
            document.removeEventListener('reloadSection', this.handleReloadSection);
        }
        
        // Remove dashboard listeners
        this.removeDashboardListeners();
        
        // Clean up mobile navigation
        if (this.mobileNav) {
            const toggleButton = document.querySelector('.mobile-menu-toggle');
            if (toggleButton) {
                toggleButton.remove();
            }
            
            const overlay = document.querySelector('.mobile-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }

    // Enhanced handleLogout method name change to avoid conflicts
    handleLogout() {
        this.performLogout();
    }

    // ...existing methods...
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

// ===== ENHANCED CHART MANAGER =====
class ChartManager {
    constructor() {
        this.charts = new Map();
        this.isChartJsLoaded = typeof Chart !== 'undefined';
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        };
    }

    create(canvasId, config) {
        if (!this.isChartJsLoaded) {
            console.warn('Chart.js not available, cannot create chart:', canvasId);
            return null;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas with id '${canvasId}' not found`);
            return null;
        }

        // Destroy existing chart if it exists
        if (this.charts.has(canvasId)) {
            this.destroy(canvasId);
        }

        const mergedConfig = {
            ...config,
            options: {
                ...this.defaultOptions,
                ...config.options
            }
        };

        try {
            const chart = new Chart(canvas, mergedConfig);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error(`Error creating chart ${canvasId}:`, error);
            return null;
        }
    }

    destroy(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            try {
                chart.destroy();
            } catch (error) {
                console.warn(`Error destroying chart ${canvasId}:`, error);
            }
            this.charts.delete(canvasId);
        }
    }

    destroyAll() {
        this.charts.forEach((chart, canvasId) => {
            try {
                chart.destroy();
            } catch (error) {
                console.warn(`Error destroying chart ${canvasId}:`, error);
            }
        });
        this.charts.clear();
    }

    aggregateMineralPerformance(records) {
        const mineralRevenue = records.reduce((acc, record) => {
            if (record.mineral && record.royalties) {
                acc[record.mineral] = (acc[record.mineral] || 0) + record.royalties;
            }
            return acc;
        }, {});
        
        return {
            labels: Object.keys(mineralRevenue),
            revenue: Object.values(mineralRevenue)
        };
    }
}

// Global instances - ensure clean initialization
let notificationManager, dataManager, royaltiesApp;

// Clean up any existing instances
if (window.royaltiesApp) {
    try {
        window.royaltiesApp.cleanup();
    } catch (error) {
        console.warn('Error cleaning up existing app instance:', error);
    }
}

try {
    notificationManager = new NotificationManager();
    dataManager = new DataManager();
} catch (error) {
    console.error('Error initializing global instances:', error);
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM Content Loaded - Initializing app...');
        royaltiesApp = new RoyaltiesApp();
        window.royaltiesApp = royaltiesApp;
        royaltiesApp.initialize();
    } catch (error) {
        console.error('Error during application initialization:', error);
        if (notificationManager) {
            notificationManager.show('Application failed to initialize', 'error');
        }
    }
});

// Prevent multiple initializations
if (document.readyState === 'loading') {
    // DOM is still loading
    console.log('Waiting for DOM to load...');
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing immediately...');
    if (!window.royaltiesApp) {
        try {
            royaltiesApp = new RoyaltiesApp();
            window.royaltiesApp = royaltiesApp;
            royaltiesApp.initialize();
        } catch (error) {
            console.error('Error during immediate initialization:', error);
        }
    }
}

// ===== COMPONENT INITIALIZATION METHODS =====
// Add missing component initialization methods
RoyaltiesApp.prototype.initializeUserManagementComponent = function() {
    console.log('Initializing user management component...');
    setTimeout(() => {
        this.notificationManager.show('User management component loaded', 'success');
    }, 200);
};

RoyaltiesApp.prototype.initializeRoyaltyRecordsComponent = function() {
    console.log('Initializing royalty records component...');
    
    // Make sure managers are globally available
    window.dataManager = this.dataManager;
    window.notificationManager = this.notificationManager;
    window.royaltiesApp = this;
    
    setTimeout(() => {
        this.setupRoyaltyRecordsEventListeners();
        this.updateRoyaltyRecordsTable();
        this.notificationManager.show('Royalty records component loaded', 'success');
    }, 300);
};

RoyaltiesApp.prototype.setupRoyaltyRecordsEventListeners = function() {
    try {
        // Remove existing listeners first
        this.removeRoyaltyRecordsListeners();
        
        // Add Record button
        const addRecordBtn = document.getElementById('add-record-btn');
        if (addRecordBtn) {
            this.addRecordHandler = () => this.showAddRecordModal();
            addRecordBtn.addEventListener('click', this.addRecordHandler);
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        this.filterHandlers = [];
        filterButtons.forEach((btn, index) => {
            const handler = () => {
                // Remove active class from all filter buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const filterType = btn.dataset.filter;
                this.filterRoyaltyRecords(filterType);
            };
            
            this.filterHandlers[index] = handler;
            btn.addEventListener('click', handler);
        });
        
        // Search functionality
        const searchInput = document.getElementById('records-search');
        if (searchInput) {
            this.searchHandler = (e) => this.searchRoyaltyRecords(e.target.value);
            searchInput.addEventListener('input', this.searchHandler);
        }
        
        // Export button
        const exportBtn = document.getElementById('export-records-btn');
        if (exportBtn) {
            this.exportRecordsHandler = () => this.exportRoyaltyRecords();
            exportBtn.addEventListener('click', this.exportRecordsHandler);
        }
        
        // Bulk actions
        const bulkActionBtn = document.getElementById('bulk-action-btn');
        if (bulkActionBtn) {
            this.bulkActionHandler = () => this.handleBulkActions();
            bulkActionBtn.addEventListener('click', this.bulkActionHandler);
        }
        
        console.log('Royalty records event listeners setup complete');
    } catch (error) {
        console.error('Error setting up royalty records event listeners:', error);
    }
};

RoyaltiesApp.prototype.removeRoyaltyRecordsListeners = function() {
    // Remove add record listener
    const addRecordBtn = document.getElementById('add-record-btn');
    if (addRecordBtn && this.addRecordHandler) {
        addRecordBtn.removeEventListener('click', this.addRecordHandler);
    }
    
    // Remove filter listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (this.filterHandlers) {
        filterButtons.forEach((btn, index) => {
            if (this.filterHandlers[index]) {
                btn.removeEventListener('click', this.filterHandlers[index]);
            }
        });
    }
    
    // Remove search listener
    const searchInput = document.getElementById('records-search');
    if (searchInput && this.searchHandler) {
        searchInput.removeEventListener('input', this.searchHandler);
    }
    
    // Remove export listener
    const exportBtn = document.getElementById('export-records-btn');
    if (exportBtn && this.exportRecordsHandler) {
        exportBtn.removeEventListener('click', this.exportRecordsHandler);
    }
    
    // Remove bulk action listener
    const bulkActionBtn = document.getElementById('bulk-action-btn');
    if (bulkActionBtn && this.bulkActionHandler) {
        bulkActionBtn.removeEventListener('click', this.bulkActionHandler);
    }
};

RoyaltiesApp.prototype.updateRoyaltyRecordsTable = function() {
    try {
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const tableBody = document.getElementById('royalty-records-table-body');
        
        if (!tableBody) {
            console.warn('Royalty records table body not found');
            return;
        }
        
        if (royaltyRecords.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem;">
                        No royalty records found
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = royaltyRecords.map(record => `
            <tr data-record-id="${record.id}">
                <td>
                    <input type="checkbox" class="record-checkbox" value="${record.id}">
                </td>
                <td>${record.referenceNumber}</td>
                <td>${record.entity}</td>
                <td>${record.mineral}</td>
                <td>${record.volume.toLocaleString()}</td>
                <td>E ${record.royalties.toLocaleString()}</td>
                <td>${record.date}</td>
                <td>
                    <span class="status-badge ${record.status.toLowerCase()}">
                        ${record.status}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info" onclick="viewRecord(${record.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editRecord(${record.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteRecord(${record.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Update summary statistics
        this.updateRoyaltyRecordsSummary(royaltyRecords);
        
        console.log('Royalty records table updated successfully');
    } catch (error) {
        console.error('Error updating royalty records table:', error);
        this.notificationManager.show('Error loading royalty records', 'error');
    }
};

RoyaltiesApp.prototype.updateRoyaltyRecordsSummary = function(records = null) {
    try {
        const royaltyRecords = records || this.dataManager.getRoyaltyRecords();
        
        const totalRecords = royaltyRecords.length;
        const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + (record.royalties || 0), 0);
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending').length;
        const overdueRecords = royaltyRecords.filter(r => r.status === 'Overdue').length;
        
        // Update summary elements
        this.updateElement('total-records-count', totalRecords);
        this.updateElement('total-royalties-amount', `E ${totalRoyalties.toLocaleString()}`);
        this.updateElement('paid-records-count', paidRecords);
        this.updateElement('pending-records-count', pendingRecords);
        this.updateElement('overdue-records-count', overdueRecords);
        
        // Calculate compliance rate
        const complianceRate = totalRecords > 0 ? Math.round((paidRecords / totalRecords) * 100) : 0;
        this.updateElement('records-compliance-rate', `${complianceRate}%`);
        
        // Update progress bar
        const progressBar = document.getElementById('records-compliance-progress');
        if (progressBar) {
            progressBar.style.width = `${complianceRate}%`;
        }
        
    } catch (error) {
        console.error('Error updating royalty records summary:', error);
    }
};

RoyaltiesApp.prototype.filterRoyaltyRecords = function(filterType) {
    try {
        const allRecords = this.dataManager.getRoyaltyRecords();
        let filteredRecords;
        
        switch (filterType) {
            case 'all':
                filteredRecords = allRecords;
                break;
            case 'paid':
                filteredRecords = allRecords.filter(r => r.status === 'Paid');
                break;
            case 'pending':
                filteredRecords = allRecords.filter(r => r.status === 'Pending');
                break;
            case 'overdue':
                filteredRecords = allRecords.filter(r => r.status === 'Overdue');
                break;
            default:
                filteredRecords = allRecords;
        }
        
        this.displayFilteredRecords(filteredRecords);
        this.notificationManager.show(`Showing ${filteredRecords.length} ${filterType} records`, 'info');
        
    } catch (error) {
        console.error('Error filtering royalty records:', error);
        this.notificationManager.show('Error filtering records', 'error');
    }
};

RoyaltiesApp.prototype.searchRoyaltyRecords = function(searchTerm) {
    try {
        const allRecords = this.dataManager.getRoyaltyRecords();
        const searchResults = allRecords.filter(record => 
            record.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.mineral.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.displayFilteredRecords(searchResults);
        
        if (searchTerm.length > 0) {
            this.notificationManager.show(`Found ${searchResults.length} records matching "${searchTerm}"`, 'info');
        }
        
    } catch (error) {
        console.error('Error searching royalty records:', error);
        this.notificationManager.show('Error searching records', 'error');
    }
};

RoyaltiesApp.prototype.displayFilteredRecords = function(records) {
    const tableBody = document.getElementById('royalty-records-table-body');
    if (!tableBody) return;
    
    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem;">
                    No records match the current filter
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = records.map(record => `
        <tr data-record-id="${record.id}">
            <td>
                <input type="checkbox" class="record-checkbox" value="${record.id}">
            </td>
            <td>${record.referenceNumber}</td>
            <td>${record.entity}</td>
            <td>${record.mineral}</td>
            <td>${record.volume.toLocaleString()}</td>
            <td>E ${record.royalties.toLocaleString()}</td>
            <td>${record.date}</td>
            <td>
                <span class="status-badge ${record.status.toLowerCase()}">
                    ${record.status}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="viewRecord(${record.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editRecord(${record.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecord(${record.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    this.updateRoyaltyRecordsSummary(records);
};

RoyaltiesApp.prototype.showAddRecordModal = function() {
    try {
        this.notificationManager.show('Opening add record form...', 'info');
        
        // Create modal content
        const modalContent = `
            <div class="modal-overlay" id="add-record-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Royalty Record</h3>
                        <button class="modal-close" onclick="closeAddRecordModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="add-record-form" class="grid-4">
                            <div class="form-group">
                                <label for="record-entity">Entity:</label>
                                <select id="record-entity" required>
                                    <option value="">Select Entity</option>
                                    ${this.dataManager.getEntities().map(entity => 
                                        `<option value="${entity.name}">${entity.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="record-mineral">Mineral:</label>
                                <select id="record-mineral" required>
                                    <option value="">Select Mineral</option>
                                    ${this.dataManager.getMinerals().map(mineral => 
                                        `<option value="${mineral.name}" data-tariff="${mineral.tariff}">${mineral.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="record-volume">Volume:</label>
                                <input type="number" id="record-volume" min="0" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="record-tariff">Tariff (E):</label>
                                <input type="number" id="record-tariff" min="0" step="0.01" readonly>
                            </div>
                            <div class="form-group">
                                <label for="record-royalties">Calculated Royalties (E):</label>
                                <input type="number" id="record-royalties" readonly>
                            </div>
                            <div class="form-group">
                                <label for="record-date">Date:</label>
                                <input type="date" id="record-date" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label for="record-status">Status:</label>
                                <select id="record-status" required>
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeAddRecordModal()">Cancel</button>
                        <button type="submit" form="add-record-form" class="btn btn-primary">Add Record</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalContent);
        
        // Setup form handlers
        this.setupAddRecordFormHandlers();
        
    } catch (error) {
        console.error('Error showing add record modal:', error);
        this.notificationManager.show('Error opening add record form', 'error');
    }
};

RoyaltiesApp.prototype.setupAddRecordFormHandlers = function() {
    const mineralSelect = document.getElementById('record-mineral');
    const volumeInput = document.getElementById('record-volume');
    const tariffInput = document.getElementById('record-tariff');
    const royaltiesInput = document.getElementById('record-royalties');
    const form = document.getElementById('add-record-form');
    
    // Auto-calculate royalties
    const calculateRoyalties = () => {
        const volume = parseFloat(volumeInput.value) || 0;
        const tariff = parseFloat(tariffInput.value) || 0;
        const royalties = volume * tariff;
        royaltiesInput.value = royalties.toFixed(2);
    };
    
    // Set tariff when mineral is selected
    mineralSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const tariff = selectedOption.dataset.tariff || 0;
        tariffInput.value = tariff;
        calculateRoyalties();
    });
    
    // Recalculate when volume changes
    volumeInput.addEventListener('input', calculateRoyalties);
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddRecordSubmit();
    });
};

RoyaltiesApp.prototype.handleAddRecordSubmit = function() {
    try {
        const formData = {
            entity: document.getElementById('record-entity').value,
            mineral: document.getElementById('record-mineral').value,
            volume: parseFloat(document.getElementById('record-volume').value),
            tariff: parseFloat(document.getElementById('record-tariff').value),
            royalties: parseFloat(document.getElementById('record-royalties').value),
            date: document.getElementById('record-date').value,
            status: document.getElementById('record-status').value
        };
        
        // Validate form data
        if (!formData.entity || !formData.mineral || !formData.volume || !formData.date) {
            this.notificationManager.show('Please fill in all required fields', 'error');
            return;
        }
        
        // Generate reference number
        const referenceNumber = `ROY-${new Date().getFullYear()}-${String(this.dataManager.getRoyaltyRecords().length + 1).padStart(3, '0')}`;
        
        // Create new record
        const newRecord = {
            id: this.dataManager.getRoyaltyRecords().length + 1,
            referenceNumber,
            ...formData
        };
        
        // Add to data manager
        this.dataManager.getRoyaltyRecords().push(newRecord);
        
        // Add audit entry
        this.dataManager.addAuditEntry({
            user: this.authManager.getCurrentUser().username,
            action: 'Create Record',
            target: referenceNumber,
            ipAddress: '192.168.1.100',
            status: 'Success'
        });
        
        // Close modal and refresh table
        this.closeAddRecordModal();
        this.updateRoyaltyRecordsTable();
        
        this.notificationManager.show('Royalty record added successfully', 'success');
        
    } catch (error) {
        console.error('Error adding royalty record:', error);
        this.notificationManager.show('Error adding record', 'error');
    }
};

RoyaltiesApp.prototype.closeAddRecordModal = function() {
    const modal = document.getElementById('add-record-modal');
    if (modal) {
        modal.remove();
    }
};

RoyaltiesApp.prototype.exportRoyaltyRecords = function() {
    try {
        this.notificationManager.show('Exporting royalty records...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show('Royalty records exported successfully', 'success');
        }, 2000);
        
    } catch (error) {
        console.error('Error exporting royalty records:', error);
        this.notificationManager.show('Error exporting records', 'error');
    }
};

RoyaltiesApp.prototype.handleBulkActions = function() {
    try {
        const checkedBoxes = document.querySelectorAll('.record-checkbox:checked');
        const selectedIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
        
        if (selectedIds.length === 0) {
            this.notificationManager.show('Please select records to perform bulk actions', 'warning');
            return;
        }
        
        this.notificationManager.show(`Selected ${selectedIds.length} records for bulk action`, 'info');
        
    } catch (error) {
        console.error('Error handling bulk actions:', error);
        this.notificationManager.show('Error performing bulk action', 'error');
    }
};

RoyaltiesApp.prototype.updateElement = function(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
};

// Global functions for royalty records
window.viewRecord = function(recordId) {
    try {
        if (window.recordActions && typeof window.recordActions.viewRecord === 'function') {
            window.recordActions.viewRecord(recordId);
        } else {
            window.notificationManager.show(`Viewing record ${recordId}`, 'info');
        }
    } catch (error) {
        console.error('Error viewing record:', error);
    }
};

window.editRecord = function(recordId) {
    try {
        if (window.recordActions && typeof window.recordActions.editRecord === 'function') {
            window.recordActions.editRecord(recordId);
        } else {
            window.notificationManager.show(`Editing record ${recordId}`, 'info');
        }
    } catch (error) {
        console.error('Error editing record:', error);
    }
};

window.deleteRecord = function(recordId) {
    try {
        if (window.recordActions && typeof window.recordActions.deleteRecord === 'function') {
            window.recordActions.deleteRecord(recordId);
        } else {
            if (confirm('Are you sure you want to delete this record?')) {
                window.notificationManager.show(`Record ${recordId} deleted`, 'success');
            }
        }
    } catch (error) {
        console.error('Error deleting record:', error);
    }
};

window.closeAddRecordModal = function() {
    try {
        if (window.royaltiesApp && typeof window.royaltiesApp.closeAddRecordModal === 'function') {
            window.royaltiesApp.closeAddRecordModal();
        } else {
            const modal = document.getElementById('add-record-modal');
            if (modal) modal.remove();
        }
    } catch (error) {
        console.error('Error closing modal:', error);
    }
};
