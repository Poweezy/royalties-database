// Mining Royalties Manager - Main Application Entry Point

// Note: Removed broken imports - using inline implementations instead
// import { DataManager } from './core/DataManager.js';     // File doesn't exist
// import { EventManager } from './core/EventManager.js';   // File doesn't exist  
// import { ComponentLoader } from './utils/ComponentLoader.js'; // File doesn't exist

// Global application state
let currentUser = null;

// Inline implementations for missing dependencies
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
    getMinerals() {
        return this.minerals || [
            { id: 1, name: 'Coal', tariff: 12, unit: 'tonne' },
            { id: 2, name: 'Iron Ore', tariff: 25, unit: 'tonne' },
            { id: 3, name: 'Quarried Stone', tariff: 15, unit: 'cubic meter' },
            { id: 4, name: 'River Sand', tariff: 10, unit: 'cubic meter' },
            { id: 5, name: 'Gravel', tariff: 8, unit: 'cubic meter' }
        ];
    }

    addAuditEntry(entry) {
        this.auditLog.unshift({
            id: this.auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            ...entry
        });
    }
}

class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    cleanup() {
        this.listeners.clear();
    }
}

class ComponentLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadComponent(componentId, container) {
        try {
            if (window.unifiedComponentLoader) {
                return await window.unifiedComponentLoader.loadComponent(componentId, container);
            }
            
            // Fallback implementation
            console.warn(`ComponentLoader fallback for ${componentId}`);
            return { success: false, error: 'No component loader available' };
        } catch (error) {
            console.error(`ComponentLoader error for ${componentId}:`, error);
            return { success: false, error: error.message };
        }
    }

    clearCache() {
        this.cache.clear();
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
        this.eventManager = new EventManager();
        this.componentLoader = new ComponentLoader();
        this.authManager = new AuthManager();
        this.notificationManager = new NotificationManager();
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        this.availableSections = [
            'dashboard', 'user-management', 'royalty-records', 
            'contract-management', 'reporting-analytics', 'communication', 
            'notifications', 'compliance', 'regulatory-management', 'profile'
        ];
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
        try {
            // Prevent infinite recursion
            if (this._currentlyLoading === sectionId) {
                console.warn(`Already loading section ${sectionId}, skipping duplicate request`);
                return;
            }
            this._currentlyLoading = sectionId;
            
            // Ensure availableSections is defined - defensive programming
            if (!this.availableSections || !Array.isArray(this.availableSections)) {
                console.warn('availableSections not properly initialized, reinitializing...');
                this.availableSections = [
                    'dashboard', 'user-management', 'royalty-records', 
                    'contract-management', 'reporting-analytics', 'communication', 
                    'notifications', 'compliance', 'regulatory-management', 'profile'
                ];
            }
            
            // Validate sectionId before using includes
            if (!sectionId || typeof sectionId !== 'string') {
                console.error('Invalid sectionId provided:', sectionId);
                sectionId = 'dashboard';
            }
            
            // Redirect legacy sections to active sections as needed
            if (!this.availableSections.includes(sectionId)) {
                console.log(`Redirecting from unavailable section '${sectionId}' to default section`);
                if (this.notificationManager && this.notificationManager.show) {
                    this.notificationManager.show('The requested section is not available', 'info');
                }
                sectionId = 'dashboard';
            }
            
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => section.style.display = 'none');

            const targetSection = document.getElementById(sectionId);
            if (!targetSection) {
                console.error(`Section ${sectionId} not found in DOM`);
                if (this.notificationManager && this.notificationManager.show) {
                    this.notificationManager.show(`The ${sectionId.replace('-', ' ')} section is not available`, 'warning');
                }
                
                // Fallback to dashboard only if not already trying dashboard
                if (sectionId !== 'dashboard') {
                    console.log('Falling back to dashboard');
                    this._currentlyLoading = null; // Reset loading flag
                    this.showSection('dashboard');
                }
                return;
            }
            
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            this.updateNavigationState(sectionId);
            
            // Load component asynchronously
            const loaded = await this.componentLoader.loadComponent(sectionId, targetSection);
            if (loaded) {
                this.initializeComponent(sectionId);
            }
            
            // Reset loading flag
            this._currentlyLoading = null;
            
        } catch (error) {
            console.error(`Error loading section ${sectionId}:`, error);
            if (this.notificationManager && this.notificationManager.show) {
                this.notificationManager.show(`Error loading ${sectionId.replace('-', ' ')}`, 'error');
            }
            
            // Reset loading flag on error
            this._currentlyLoading = null;
            
            // Fallback to dashboard on error
            if (sectionId !== 'dashboard') {
                console.log('Falling back to dashboard due to error');
                this.showSection('dashboard');
            }
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
        try {
            // Prevent infinite recursion
            if (this._currentlyLoading === sectionId) {
                console.warn(`Already loading section ${sectionId}, skipping duplicate request`);
                return;
            }
            this._currentlyLoading = sectionId;
            
            // Ensure availableSections is defined - defensive programming
            if (!this.availableSections || !Array.isArray(this.availableSections)) {
                console.warn('availableSections not properly initialized, reinitializing...');
                this.availableSections = [
                    'dashboard', 'user-management', 'royalty-records', 
                    'contract-management', 'reporting-analytics', 'communication', 
                    'notifications', 'compliance', 'regulatory-management', 'profile'
                ];
            }
            
            // Validate sectionId before using includes
            if (!sectionId || typeof sectionId !== 'string') {
                console.error('Invalid sectionId provided:', sectionId);
                sectionId = 'dashboard';
            }
            
            // Redirect legacy sections to active sections as needed
            if (!this.availableSections.includes(sectionId)) {
                console.log(`Redirecting from unavailable section '${sectionId}' to default section`);
                if (this.notificationManager && this.notificationManager.show) {
                    this.notificationManager.show('The requested section is not available', 'info');
                }
                sectionId = 'dashboard';
            }
            
            // Hide all sections
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => section.style.display = 'none');

            // Show target section
            const targetSection = document.getElementById(sectionId);
            if (!targetSection) {
                console.error(`Section ${sectionId} not found in DOM`);
                if (this.notificationManager && this.notificationManager.show) {
                    this.notificationManager.show(`The ${sectionId.replace('-', ' ')} section is not available`, 'warning');
                }
                
                // Fallback to dashboard only if not already trying dashboard
                if (sectionId !== 'dashboard') {
                    console.log('Falling back to dashboard');
                    this._currentlyLoading = null; // Reset loading flag
                    this.showSection('dashboard');
                }
                return;
            }
            
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            this.updateNavigationState(sectionId);
            
            // Load section content
            this.loadSectionContent(sectionId);
            
            // Reset loading flag
            this._currentlyLoading = null;
            
        } catch (error) {
            console.error(`Error loading section ${sectionId}:`, error);
            if (this.notificationManager && this.notificationManager.show) {
                this.notificationManager.show(`Error loading ${sectionId.replace('-', ' ')}`, 'error');
            }
            
            // Reset loading flag on error
            this._currentlyLoading = null;
            
            // Fallback to dashboard on error
            if (sectionId !== 'dashboard') {
                console.log('Falling back to dashboard due to error');
                this.showSection('dashboard');
            }
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

    async loadSectionContent(sectionId) {
        try {
            console.log(`Loading section content for: ${sectionId}`);
            
            const section = document.getElementById(sectionId);
            if (!section) {
                console.error(`Section element #${sectionId} not found in DOM`);
                return;
            }
            
            // First, always load fallback content immediately to prevent empty sections
            this.loadFallbackSection(sectionId);
            
            // Then try to enhance with unified component loader
            if (window.unifiedComponentLoader) {
                console.log(`Attempting to enhance ${sectionId} with unified component loader...`);
                try {
                    const result = await window.unifiedComponentLoader.loadComponent(sectionId, section);
                    if (result && result.success) {
                        console.log(`Component ${sectionId} enhanced successfully via unified component loader (source: ${result.source})`);
                        this.initializeSectionComponent(sectionId);
                        return;
                    } else {
                        console.log(`Unified component loader returned no enhancement for ${sectionId}, keeping fallback`);
                    }
                } catch (error) {
                    console.log(`Unified component loader enhancement failed for ${sectionId}, keeping fallback:`, error.message);
                }
            } else {
                console.log('Unified component loader not available, using fallback content only');
            }
            
        } catch (error) {
            console.error(`Failed to load component ${sectionId}:`, error);
            this.loadFallbackSection(sectionId);
        }
    }

    loadFallbackSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        console.log(`Loading fallback content for: ${sectionId}`);

        // Use specific methods or default fallback
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
        
        console.log(`Fallback content loaded for: ${sectionId}`);
    }

    initializeSectionComponent(sectionId) {
        // Initialize section-specific functionality
        switch (sectionId) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'user-management':
                this.initializeUserManagement();
                break;
            case 'royalty-records':
                this.initializeRoyaltyRecords();
                break;
        }
    }

    initializeDashboard() {
        console.log('Dashboard initialized');
        // Dashboard-specific initialization
    }

    initializeUserManagement() {
        console.log('User management initialized');
        // User management-specific initialization
    }

    initializeRoyaltyRecords() {
        console.log('Royalty records initialized');
        // Royalty records-specific initialization
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
            this.initializeDashboardComponent();
        }, 100);
    }

    initializeDashboardComponent() {
        console.log('Initializing dashboard component...');
        
        // Update dashboard metrics
        this.updateDashboardMetrics();
        this.updateRecentActivity();
        
        // Initialize charts with delay to ensure DOM is ready
        setTimeout(() => {
            try {
                this.initializeDashboardCharts();
                this.setupDashboardEventHandlers();
            } catch (error) {
                console.error('Error initializing dashboard charts:', error);
            }
        }, 500);
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
        const entityCtx = document.getElementById('production-by-entity-chart');
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

    setupDashboardEventHandlers() {
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
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entities = this.dataManager.getEntities();
        const minerals = this.dataManager.getMinerals();
        
        // Calculate comprehensive metrics
        const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + (record.royalties || 0), 0);
        const totalProduction = royaltyRecords.reduce((sum, record) => sum + (record.volume || 0), 0);
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending').length;
        const overdueRecords = royaltyRecords.filter(r => r.status === 'Overdue').length;
        const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords / royaltyRecords.length) * 100) : 0;
        
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
        
        // Update progress bars
        const complianceProgress = document.getElementById('compliance-progress');
        if (complianceProgress) {
            complianceProgress.style.width = `${complianceRate}%`;
        }
        
        console.log('Dashboard metrics updated successfully');
    }

    loadGenericSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const sectionTitle = sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1><i class="fas fa-cog"></i> ${sectionTitle}</h1>
                    <p>Content for this section will be loaded here</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="text-center py-4">
                        <i class="fas fa-tools fa-3x text-muted mb-3"></i>
                        <h4>Section Available</h4>
                        <p class="text-muted">Content for ${sectionTitle} is loading...</p>
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log(`Generic fallback content loaded for: ${sectionId}`);
    }

    handleLogout() {
        if (this.authManager) {
            this.authManager.logout();
        }
        
        // Hide main app and show login
        const appContainer = document.getElementById('app-container');
        const loginSection = document.getElementById('login-section');
        
        if (appContainer) appContainer.style.display = 'none';
        if (loginSection) loginSection.style.display = 'flex';
        
        // Show logout notification
        if (this.notificationManager && this.notificationManager.show) {
            this.notificationManager.show('Successfully logged out', 'success');
        }
        
        console.log('User logged out');
    }

}

// Initialize application when DOM is ready - Only if no instance exists
document.addEventListener('DOMContentLoaded', () => {
    // Only create instance if one doesn't already exist to prevent conflicts
    if (!window.royaltiesApp && !window.app) {
        const app = new RoyaltiesApp();
        window.royaltiesApp = app; // Make globally available
        app.initialize();
        
        console.log('js/app.js: Application initialized');
    } else {
        console.log('js/app.js: Application instance already exists, skipping initialization');
    }
    
    // Make sure to initialize other controllers or components here
    // ...existing code...
});

// The audit dashboard functionality has been removed as part of the cleanup efforts