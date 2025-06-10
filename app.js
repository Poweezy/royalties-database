// Mining Royalties Manager - Main Application JavaScript
console.log('Mining Royalties Manager v1.0 - Loading...');

// Global application state
let currentUser = null;
let currentSection = 'dashboard';
let charts = {};

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
    }

    async initialize() {
        console.log('DOM loaded - Starting application initialization...');
        this.dataManager.initialize();
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
                        <li><a href="#dashboard" class="nav-link active" data-section="dashboard">📊 Dashboard</a></li>
                        <li><a href="#user-management" class="nav-link" data-section="user-management">👥 User Management</a></li>
                        <li><a href="#royalty-records" class="nav-link" data-section="royalty-records">💰 Royalty Records</a></li>
                        <li><a href="#contract-management" class="nav-link" data-section="contract-management">📋 Contract Management</a></li>
                        <li><a href="#audit-dashboard" class="nav-link" data-section="audit-dashboard">🛡️ Audit Dashboard</a></li>
                        <li><a href="#reporting-analytics" class="nav-link" data-section="reporting-analytics">📊 Reporting & Analytics</a></li>
                        <li><a href="#communication" class="nav-link" data-section="communication">📧 Communication</a></li>
                        <li><a href="#notifications" class="nav-link" data-section="notifications">🔔 Notifications</a></li>
                        <li><a href="#compliance" class="nav-link" data-section="compliance">✅ Compliance</a></li>
                        <li><a href="#regulatory-management" class="nav-link" data-section="regulatory-management">⚖️ Regulatory</a></li>
                        <li><a href="#profile" class="nav-link" data-section="profile">👤 Profile</a></li>
                        <li><a href="#logout" class="nav-link" data-section="logout">🚪 Logout</a></li>
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
        document.addEventListener('logoutRequested', () => this.handleLogout());
        document.addEventListener('reloadSection', (e) => this.loadSectionContent(e.detail.sectionId));
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
        // Main dashboard action buttons
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }
        
        const exportBtn = document.getElementById('export-dashboard-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboard();
            });
        }
        
        // Chart control handlers
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
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
            });
        });
        
        // Period selectors
        const periodSelectors = document.querySelectorAll('.metric-period');
        periodSelectors.forEach(selector => {
            selector.addEventListener('change', () => {
                this.notificationManager.show(`Updated for ${selector.value.replace('-', ' ')}`, 'success');
                this.updateDashboardMetrics();
            });
        });
        
        // Filter handlers
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyDashboardFilters();
            });
        }
        
        const resetFiltersBtn = document.getElementById('reset-filters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.resetDashboardFilters();
            });
        }
    }

    updateChartType(chart, type) {
        if (!chart) return;
        
        try {
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
        } catch (error) {
            console.error('Error updating chart type:', error);
        }
    }

    applyDashboardFilters() {
        const timePeriod = document.getElementById('time-period')?.value;
        const entityFilter = document.getElementById('entity-filter')?.value;
        const mineralFilter = document.getElementById('mineral-filter')?.value;
        
        this.notificationManager.show(`Applied filters: ${timePeriod}, ${entityFilter}, ${mineralFilter}`, 'info');
        this.updateDashboardMetrics();
    }

    resetDashboardFilters() {
        const timeSelect = document.getElementById('time-period');
        const entitySelect = document.getElementById('entity-filter');
        const mineralSelect = document.getElementById('mineral-filter');
        
        if (timeSelect) timeSelect.value = 'current-month';
        if (entitySelect) entitySelect.value = 'all';
        if (mineralSelect) mineralSelect.value = 'all';
        
        this.notificationManager.show('Dashboard filters reset', 'info');
        this.updateDashboardMetrics();
    }

    refreshDashboard() {
        this.updateDashboardMetrics();
        this.updateRecentActivity();
        
        // Refresh charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update();
            }
        });
        
        this.notificationManager.show('Dashboard refreshed successfully', 'success');
    }

    exportDashboard() {
        this.notificationManager.show('Exporting dashboard report...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show('Dashboard report exported successfully', 'success');
        }, 2000);
    }

    updateDashboardMetrics() {
        try {
            const royaltyRecords = this.dataManager.getRoyaltyRecords();
            const entities = this.dataManager.getEntities();
            const minerals = this.dataManager.getMinerals();
            
            // Calculate comprehensive metrics
            const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + (record.royalties || 0), 0);
            const totalProduction = royaltyRecords.reduce((sum, record) => sum + (record.volume || 0), 0);
            const activeEntities = entities.filter(e => e.status === 'Active').length;
            const paidRecords = royaltyRecords.filter(r => r.status === 'Paid');
            const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending');
            const overdueRecords = royaltyRecords.filter(r => r.status === 'Overdue');
            const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords.length / royaltyRecords.length) * 100) : 0;
            
            // Production breakdown by mineral type
            const productionByMineral = royaltyRecords.reduce((acc, record) => {
                if (record.mineral) {
                    acc[record.mineral] = (acc[record.mineral] || 0) + (record.volume || 0);
                }
                return acc;
            }, {});
            
            // Update all dashboard elements
            this.updateElement('total-production', `${totalProduction.toLocaleString()} tonnes`);
            this.updateElement('total-royalties-calculated', `E ${totalRoyalties.toLocaleString()}`);
            this.updateElement('overall-compliance', `${complianceRate}%`);
            this.updateElement('total-royalty-revenue', `E ${totalRoyalties.toLocaleString()}`);
            this.updateElement('active-entities', activeEntities);
            this.updateElement('pending-approvals', pendingRecords.length);
            this.updateElement('coal-production', `${productionByMineral.Coal || 0}t`);
            this.updateElement('iron-production', `${productionByMineral['Iron Ore'] || 0}t`);
            this.updateElement('stone-production', `${productionByMineral['Quarried Stone'] || 0}m³`);
            
            // Fix: Calculate payments received correctly
            const paymentsReceived = paidRecords.reduce((sum, record) => sum + (record.royalties || 0), 0);
            const outstandingPayments = overdueRecords.reduce((sum, record) => sum + (record.royalties || 0), 0);
            
            // Update additional dashboard metrics
            this.updateElement('compliance-rate', `${complianceRate}%`);
            this.updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}`);
            this.updateElement('payments-received', `E ${paymentsReceived.toLocaleString()}`);
            this.updateElement('outstanding-payments', `E ${outstandingPayments.toLocaleString()}`);
            this.updateElement('reconciliation-status', '98%');
            this.updateElement('ontime-payments', paidRecords.length);
            this.updateElement('late-payments', overdueRecords.length);
            this.updateElement('outstanding-count', `${pendingRecords.length + overdueRecords.length} overdue payments`);
            this.updateElement('avg-payment-time', '15 days');
            this.updateElement('payment-success-rate', '95%');
            
            // Update progress bars
            const complianceProgress = document.getElementById('compliance-progress');
            if (complianceProgress) {
                complianceProgress.style.width = `${complianceRate}%`;
            }
            
            console.log('Dashboard metrics updated successfully');
        } catch (error) {
            console.error('Error updating dashboard metrics:', error);
            this.notificationManager.show('Error updating dashboard metrics', 'error');
        }
    }

    loadComplianceSection() {
        const section = document.getElementById('compliance');
        if (section) {
            section.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <h1>✅ Compliance & Regulatory</h1>
                        <p>Monitor compliance and regulatory requirements</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-info" id="run-compliance-check">
                            🔍 Run Compliance Check
                        </button>
                        <button class="btn btn-success" id="generate-compliance-report">
                            📄 Generate Report
                        </button>
                    </div>
                </div>

                <!-- ...existing compliance section content... -->
            `;

            // Setup compliance section event listeners
            setTimeout(() => {
                const runCheckBtn = document.getElementById('run-compliance-check');
                if (runCheckBtn) {
                    runCheckBtn.addEventListener('click', () => {
                        this.notificationManager.show('Running comprehensive compliance check...', 'info');
                        setTimeout(() => {
                            this.notificationManager.show('Compliance check completed - 3 issues found', 'warning');
                        }, 2000);
                    });
                }

                const generateReportBtn = document.getElementById('generate-compliance-report');
                if (generateReportBtn) {
                    generateReportBtn.addEventListener('click', () => {
                        this.notificationManager.show('Generating compliance report...', 'info');
                        setTimeout(() => {
                            this.notificationManager.show('Compliance report generated successfully', 'success');
                        }, 2000);
                    });
                }
            }, 100);
        }
    }

    handleLogout() {
        this.authManager.logout();
        
        // Clear any existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        
        // Show login section
        const appContainer = document.getElementById('app-container');
        const loginSection = document.getElementById('login-section');
        
        if (appContainer) appContainer.style.display = 'none';
        if (loginSection) loginSection.style.display = 'flex';
        
        this.notificationManager.show('Logged out successfully', 'info');
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
                <div class="activity-content">
                    <p><strong>${entry.user}</strong> ${entry.action.toLowerCase()} ${entry.target}</p>
                    <small>${entry.timestamp}</small>
                </div>
            </div>
        `).join('');
    }

    setupGlobalAuditActions() {
        window.auditActions = {
            viewLoginAttempts: () => {
                this.notificationManager.show('Showing login attempts...', 'info');
            },
            viewUserActivity: () => {
                this.notificationManager.show('Showing user activity...', 'info');
            },
            viewDataAccess: () => {
                this.notificationManager.show('Showing data access logs...', 'info');
            }
        };
    }

    // ...existing component initialization methods...

    loadFallbackSection(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardSection();
                break;
            case 'user-management':
                this.loadUserManagementSection();
                break;
            default:
                this.loadGenericSection(sectionId);
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
                        🔄 Refresh Data
                    </button>
                </div>
            </div>

            <div class="charts-grid" id="kpi-metrics">
                <div class="card">
                    <div class="card-header">
                        <h3>💰 Total Royalties</h3>
                    </div>
                    <div class="card-body">
                        <p id="total-royalties">E 0</p>
                        <small class="trend-positive">+0%</small>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3>🏭 Active Entities</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-entities">0</p>
                        <small class="trend-positive">+0 new</small>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3>📋 Compliance Rate</h3>
                    </div>
                    <div class="card-body">
                        <p id="compliance-rate">0%</p>
                        <div class="mini-progress">
                            <div class="progress-bar" id="compliance-progress" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5>📈 Recent Activity</h5>
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

    loadGenericSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <h1>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('-', ' ')}</h1>
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

    // Add missing component initialization methods
    initializeUserManagementComponent() {
        console.log('Initializing user management component...');
        setTimeout(() => {
            this.notificationManager.show('User management component loaded', 'success');
        }, 200);
    }

    initializeRoyaltyRecordsComponent() {
        console.log('Initializing royalty records component...');
        setTimeout(() => {
            this.notificationManager.show('Royalty records component loaded', 'success');
        }, 200);
    }

    initializeContractManagementComponent() {
        console.log('Initializing contract management component...');
        setTimeout(() => {
            this.notificationManager.show('Contract management component loaded', 'success');
        }, 200);
    }

    initializeReportingAnalyticsComponent() {
        console.log('Initializing reporting analytics component...');
        setTimeout(() => {
            this.notificationManager.show('Reporting analytics component loaded', 'success');
        }, 200);
    }

    initializeAuditDashboardComponent() {
        console.log('Initializing audit dashboard component...');
        setTimeout(() => {
            this.notificationManager.show('Audit dashboard component loaded', 'success');
        }, 200);
    }

    initializeCommunicationComponent() {
        console.log('Initializing communication component...');
        setTimeout(() => {
            this.notificationManager.show('Communication component loaded', 'success');
        }, 200);
    }

    initializeNotificationsComponent() {
        console.log('Initializing notifications component...');
        setTimeout(() => {
            this.notificationManager.show('Notifications component loaded', 'success');
        }, 200);
    }

    initializeComplianceComponent() {
        console.log('Initializing compliance component...');
        setTimeout(() => {
            this.notificationManager.show('Compliance component loaded', 'success');
        }, 200);
    }

    initializeRegulatoryManagementComponent() {
        console.log('Initializing regulatory management component...');
        setTimeout(() => {
            this.notificationManager.show('Regulatory management component loaded', 'success');
        }, 200);
    }

    initializeProfileComponent() {
        console.log('Initializing profile component...');
        setTimeout(() => {
            this.notificationManager.show('Profile component loaded', 'success');
        }, 200);
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
                    <button class="btn btn-success" onclick="this.notificationManager.show('Add user functionality would open here', 'info')">
                        ➕ Add User
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <p>User management interface will be implemented here.</p>
                </div>
            </div>
        `;
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

// Global instances
const notificationManager = new NotificationManager();
const dataManager = new DataManager();

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing app...');
    const app = new RoyaltiesApp();
    window.royaltiesApp = app;
    app.initialize();
});
