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
            },
            {
                id: 4, entity: 'Mbabane Quarry', mineral: 'Gravel', volume: 950,
                tariff: 8, royalties: 7600, date: '2024-02-05', status: 'Overdue', referenceNumber: 'ROY-2024-004'
            },
            {
                id: 5, entity: 'Sidvokodvo Quarry', mineral: 'River Sand', volume: 1150,
                tariff: 10, royalties: 11500, date: '2024-02-10', status: 'Paid', referenceNumber: 'ROY-2024-005'
            },
            {
                id: 6, entity: 'Kwalini Quarry', mineral: 'Quarried Stone', volume: 1350,
                tariff: 15, royalties: 20250, date: '2024-02-15', status: 'Pending', referenceNumber: 'ROY-2024-006'
            },
            {
                id: 7, entity: 'Maloma Colliery', mineral: 'Coal', volume: 750,
                tariff: 12, royalties: 9000, date: '2024-02-20', status: 'Overdue', referenceNumber: 'ROY-2024-007'
            },
            {
                id: 8, entity: 'Ngwenya Mine', mineral: 'Iron Ore', volume: 2250,
                tariff: 25, royalties: 56250, date: '2024-02-25', status: 'Paid', referenceNumber: 'ROY-2024-008'
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
        this.contracts = [
            {
                id: 'CNT-001',
                contractId: 'KQ-ROY-2024-001',
                stakeholder: 'Kwalini Holdings Ltd',
                entity: 'Kwalini Quarry',
                contractType: 'Royalty Agreement',
                royaltyRate: 2.5,
                calculationMethod: 'Ad Valorem',
                startDate: '2024-01-01',
                endDate: '2026-12-31',
                paymentSchedule: 'Quarterly',
                escalationClause: 'CPI-Based',
                escalationRate: 3.0,
                minimumPayment: 50000,
                specialConditions: 'Environmental compliance required. Annual reporting mandatory.',
                status: 'Active',
                contractValue: 2500000,
                version: 1.0,
                lastModified: '2024-01-15',
                amendments: []
            },
            {
                id: 'CNT-002',
                contractId: 'MC-LIC-2023-045',
                stakeholder: 'Maloma Mining Consortium',
                entity: 'Maloma Colliery',
                contractType: 'Mining License',
                royaltyRate: 1.8,
                calculationMethod: 'Specific',
                startDate: '2023-06-01',
                endDate: '2025-05-31',
                paymentSchedule: 'Monthly',
                escalationClause: 'Fixed Annual',
                escalationRate: 2.5,
                minimumPayment: 75000,
                specialConditions: 'Coal quality specifications must be maintained. Safety audits quarterly.',
                status: 'Active',
                contractValue: 1800000,
                version: 1.2,
                lastModified: '2024-01-10',
                amendments: [
                    { date: '2023-12-01', description: 'Royalty rate adjustment', version: 1.1 },
                    { date: '2024-01-10', description: 'Payment schedule modification', version: 1.2 }
                ]
            },
            {
                id: 'CNT-003',
                contractId: 'NM-JV-2024-012',
                stakeholder: 'Ngwenya Iron Ore Ltd',
                entity: 'Ngwenya Mine',
                contractType: 'Joint Venture',
                royaltyRate: 3.2,
                calculationMethod: 'Sliding Scale',
                startDate: '2024-03-01',
                endDate: '2029-02-28',
                paymentSchedule: 'Quarterly',
                escalationClause: 'Market-Based',
                escalationRate: 0,
                minimumPayment: 100000,
                specialConditions: 'Revenue sharing based on iron ore market prices. Technology transfer requirements.',
                status: 'Active',
                contractValue: 4200000,
                version: 1.0,
                lastModified: '2024-03-01',
                amendments: []
            },
            {
                id: 'CNT-004',
                contractId: 'BA-EXP-2024-008',
                stakeholder: 'Bulembu Exploration Corp',
                entity: 'Bulembu Asbestos Mine',
                contractType: 'Exploration License',
                royaltyRate: 4.0,
                calculationMethod: 'Hybrid',
                startDate: '2024-02-01',
                endDate: '2024-07-31',
                paymentSchedule: 'Semi-Annual',
                escalationClause: 'None',
                escalationRate: 0,
                minimumPayment: 25000,
                specialConditions: 'Environmental remediation bond required. Limited to exploration only.',
                status: 'Expiring Soon',
                contractValue: 150000,
                version: 1.0,
                lastModified: '2024-02-01',
                amendments: []
            },
            {
                id: 'CNT-005',
                contractId: 'MS-SVC-2023-033',
                stakeholder: 'Mountain Stone Services',
                entity: 'Various Quarries',
                contractType: 'Service Agreement',
                royaltyRate: 1.5,
                calculationMethod: 'Ad Valorem',
                startDate: '2023-01-01',
                endDate: '2025-12-31',
                paymentSchedule: 'Monthly',
                escalationClause: 'CPI-Based',
                escalationRate: 3.5,
                minimumPayment: 30000,
                specialConditions: 'Equipment maintenance and operation services. Performance bonuses applicable.',
                status: 'Pending Renewal',
                contractValue: 900000,
                version: 1.3,
                lastModified: '2023-11-15',
                amendments: [
                    { date: '2023-06-01', description: 'Service scope expansion', version: 1.1 },
                    { date: '2023-09-15', description: 'Rate adjustment', version: 1.2 },
                    { date: '2023-11-15', description: 'Performance metrics update', version: 1.3 }
                ]
            }
        ];
    }

    getEnhancedContracts() {
        return this.contracts || [];
    }

    getContractById(id) {
        return this.contracts.find(contract => contract.id === id);
    }

    addContract(contractData) {
        const newContract = {
            id: `CNT-${String(this.contracts.length + 1).padStart(3, '0')}`,
            ...contractData,
            version: 1.0,
            lastModified: new Date().toISOString().split('T')[0],
            amendments: [],
            status: 'Active'
        };
        this.contracts.push(newContract);
        return newContract;
    }

    updateContract(id, updates) {
        const contractIndex = this.contracts.findIndex(contract => contract.id === id);
        if (contractIndex !== -1) {
            const oldVersion = this.contracts[contractIndex].version;
            this.contracts[contractIndex] = {
                ...this.contracts[contractIndex],
                ...updates,
                version: oldVersion + 0.1,
                lastModified: new Date().toISOString().split('T')[0]
            };
            
            // Add amendment record
            this.contracts[contractIndex].amendments.push({
                date: new Date().toISOString().split('T')[0],
                description: 'Contract updated',
                version: this.contracts[contractIndex].version
            });
            
            return this.contracts[contractIndex];
        }
        return null;
    }

    deleteContract(id) {
        const contractIndex = this.contracts.findIndex(contract => contract.id === id);
        if (contractIndex !== -1) {
            return this.contracts.splice(contractIndex, 1)[0];
        }
        return null;
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
        
        // Only set notificationManager if not already set by enhanced notification system
        if (!window.notificationManager) {
            window.notificationManager = this.notificationManager;
            console.log('📢 App: Using built-in notification manager');
        } else {
            console.log('📢 App: Using existing enhanced notification manager');
        }
        
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
            case 'notifications':
                this.initializeNotifications();
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
        // Populate royalty records data
        this.populateRoyaltyRecordsData();
        this.setupRoyaltyRecordsEventHandlers();
    }

    initializeNotifications() {
        console.log('Notifications section initialized');
        // Ensure notification system is available and update counts
        if (window.NotificationSystem || window.notificationManager) {
            const notificationSystem = window.notificationManager || window.NotificationSystem;
            // Force update of notification counts when viewing notifications
            notificationSystem.updateNotificationCount();
            console.log('Notification counts updated');
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
        this.updateElement('total-production-volume', `${totalProduction.toLocaleString()} tonnes`);
        this.updateElement('total-royalties-calculated', `E ${totalRoyalties.toLocaleString()}`);
        this.updateElement('payments-received', `E ${Math.round(totalRoyalties * 0.95).toLocaleString()}`);
        this.updateElement('reconciliation-status', `${Math.round((paidRecords / royaltyRecords.length) * 100) || 98}%`);
        this.updateElement('ore-grade-average', `${(Math.random() * 5 + 10).toFixed(1)}%`);
        this.updateElement('cost-per-unit', `E ${(totalRoyalties / totalProduction * 0.15).toFixed(2) || '15.20'}`);
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

    loadUserManagementSection() {
        const section = document.getElementById('user-management');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1><i class="fas fa-users"></i> User Management</h1>
                    <p>Manage user accounts, roles, and access permissions</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="text-center py-4">
                        <i class="fas fa-users fa-3x text-primary mb-3"></i>
                        <h4>User Management System</h4>
                        <p class="text-muted">Loading user management interface...</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('User management fallback content loaded');
    }

    loadRoyaltyRecordsSection() {
        const section = document.getElementById('royalty-records');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1><i class="fas fa-money-bill-wave"></i> Royalty Records Management</h1>
                    <p>Comprehensive management of mining royalty records, payments, and compliance tracking</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="text-center py-4">
                        <i class="fas fa-money-bill-wave fa-3x text-success mb-3"></i>
                        <h4>Royalty Records System</h4>
                        <p class="text-muted">Loading royalty records interface...</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('Royalty records fallback content loaded');
    }

    loadContractManagementSection() {
        const section = document.getElementById('contract-management');
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1><i class="fas fa-file-contract"></i> Contract Management</h1>
                    <p>Manage mining contracts, agreements, and related documentation</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="text-center py-4">
                        <i class="fas fa-file-contract fa-3x text-info mb-3"></i>
                        <h4>Contract Management System</h4>
                        <p class="text-muted">Loading contract management interface...</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('Contract management fallback content loaded');
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

    populateRoyaltyRecordsData() {
        try {
            const records = this.dataManager.getRoyaltyRecords();
            
            // Initialize filtered records and pagination
            this.filteredRecords = [...records];
            this.initializePagination();
            
            // Update KPI cards
            this.updateRoyaltyRecordsKPIs(records);
            
            // Populate records table with pagination
            this.updateTableWithPagination();
            
            // Update compliance metrics
            this.updateRoyaltyComplianceMetrics(records);
            
            console.log('Royalty records data populated successfully with pagination');
        } catch (error) {
            console.error('Error populating royalty records data:', error);
            if (this.notificationManager) {
                this.notificationManager.show('Error loading royalty records data', 'error');
            }
        }
    }

    updateRoyaltyRecordsKPIs(records) {
        const totalRecords = records.length;
        const totalRoyalties = records.reduce((sum, record) => sum + (record.royalties || 0), 0);
        const paidRecords = records.filter(r => r.status === 'Paid').length;
        const pendingRecords = records.filter(r => r.status === 'Pending').length;
        const overdueRecords = records.filter(r => r.status === 'Overdue').length;
        
        // Update KPI elements
        const totalRecordsEl = document.getElementById('total-records-count');
        const totalRoyaltiesEl = document.getElementById('total-royalties-amount');
        const paidRecordsEl = document.getElementById('paid-records-count');
        const pendingRecordsEl = document.getElementById('pending-records-count');
        const overdueRecordsEl = document.getElementById('overdue-records-count');
        
        if (totalRecordsEl) totalRecordsEl.textContent = totalRecords.toLocaleString();
        if (totalRoyaltiesEl) totalRoyaltiesEl.textContent = `E ${totalRoyalties.toLocaleString()}`;
        if (paidRecordsEl) paidRecordsEl.textContent = paidRecords.toLocaleString();
        if (pendingRecordsEl) pendingRecordsEl.textContent = pendingRecords.toLocaleString();
        if (overdueRecordsEl) overdueRecordsEl.textContent = overdueRecords.toLocaleString();
    }

    updateRoyaltyRecordsTable(records) {
        const tableBody = document.getElementById('royalty-records-table-body');
        if (!tableBody) return;
        
        if (records.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-inbox"></i> No royalty records found
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
                <td>
                    <strong>${record.referenceNumber || `ROY-${record.id}`}</strong>
                </td>
                <td>${record.entity}</td>
                <td>${record.mineral}</td>
                <td>${record.volume ? record.volume.toLocaleString() : 'N/A'}</td>
                <td>E ${record.royalties ? record.royalties.toLocaleString() : '0'}</td>
                <td>${record.date}</td>
                <td>
                    <span class="badge badge-${this.getStatusClass(record.status)}">
                        ${record.status}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary view-record-btn" data-id="${record.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-record-btn" data-id="${record.id}" title="Edit Record">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-record-btn" data-id="${record.id}" title="Delete Record">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateRoyaltyComplianceMetrics(records) {
        const totalRecords = records.length;
        const paidRecords = records.filter(r => r.status === 'Paid').length;
        const complianceRate = totalRecords > 0 ? Math.round((paidRecords / totalRecords) * 100) : 0;
        
        const complianceRateEl = document.getElementById('records-compliance-rate');
        const complianceProgressEl = document.getElementById('records-compliance-progress');
        
        if (complianceRateEl) complianceRateEl.textContent = `${complianceRate}%`;
        if (complianceProgressEl) complianceProgressEl.style.width = `${complianceRate}%`;
    }

    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'danger';
            default: return 'secondary';
        }
    }

    setupRoyaltyRecordsEventHandlers() {
        try {
            // Add record button
            const addRecordBtn = document.getElementById('add-record-btn');
            if (addRecordBtn) {
                addRecordBtn.addEventListener('click', () => this.showAddRecordModal());
            }

            // Refresh button
            const refreshBtn = document.getElementById('refresh-records-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.refreshRoyaltyRecords());
            }

            // Export button
            const exportBtn = document.getElementById('export-records-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => this.exportRoyaltyRecords());
            }

            // Bulk actions button
            const bulkActionBtn = document.getElementById('bulk-action-btn');
            if (bulkActionBtn) {
                bulkActionBtn.addEventListener('click', () => this.showBulkActionsModal());
            }

            // Filter buttons
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => this.filterRecords(e.target.dataset.filter));
            });

            // Search input
            const searchInput = document.getElementById('records-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => this.searchRecords(e.target.value));
            }

            // Table action buttons (delegated event handling)
            const tableBody = document.getElementById('royalty-records-table-body');
            if (tableBody) {
                tableBody.addEventListener('click', (e) => this.handleTableAction(e));
            }

            // Select all checkbox
            const selectAllCheckbox = document.getElementById('select-all-records');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
            }

            console.log('Royalty records event handlers set up successfully');
        } catch (error) {
            console.error('Error setting up royalty records event handlers:', error);
        }
    }

    showAddRecordModal() {
        this.showAddRecordModal();
    }

    refreshRoyaltyRecords() {
        if (this.notificationManager) {
            this.notificationManager.show('Refreshing royalty records...', 'info');
        }
        this.populateRoyaltyRecordsData();
        if (this.notificationManager) {
            this.notificationManager.show('Royalty records refreshed successfully', 'success');
        }
    }

    exportRoyaltyRecords() {
        if (this.notificationManager) {
            this.notificationManager.show('Exporting royalty records...', 'info');
        }
        
        // Create CSV export
        const records = this.dataManager.getRoyaltyRecords();
        const csvContent = this.generateCSVExport(records);
        this.downloadCSV(csvContent, 'royalty-records.csv');
        
        setTimeout(() => {
            if (this.notificationManager) {
                this.notificationManager.show('Royalty records exported successfully', 'success');
            }
        }, 1000);
    }

    showBulkActionsModal() {
        this.showBulkActionsModal();
    }

    filterRecords(filter) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        const records = this.dataManager.getRoyaltyRecords();
        
        if (filter !== 'all') {
            this.filteredRecords = records.filter(record => record.status?.toLowerCase() === filter);
        } else {
            this.filteredRecords = [...records];
        }

        this.currentPage = 1;
        this.updatePaginationDisplay();
        this.updateTableWithPagination();
        
        if (this.notificationManager) {
            this.notificationManager.show(`Showing ${this.filteredRecords.length} ${filter} records`, 'info');
        }
    }

    searchRecords(searchTerm) {
        const records = this.dataManager.getRoyaltyRecords();
        
        if (!searchTerm.trim()) {
            this.filteredRecords = [...records];
        } else {
            const searchText = searchTerm.toLowerCase();
            this.filteredRecords = records.filter(record => {
                return (
                    record.referenceNumber?.toLowerCase().includes(searchText) ||
                    record.entity?.toLowerCase().includes(searchText) ||
                    record.mineral?.toLowerCase().includes(searchText)
                );
            });
        }

        this.currentPage = 1;
        this.updatePaginationDisplay();
        this.updateTableWithPagination();
    }

    handleTableAction(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const recordId = button.dataset.id;
        
        if (button.classList.contains('view-record-btn')) {
            this.viewRecord(recordId);
        } else if (button.classList.contains('edit-record-btn')) {
            this.editRecord(recordId);
        } else if (button.classList.contains('delete-record-btn')) {
            this.deleteRecord(recordId);
        }
    }

    viewRecord(recordId) {
        const records = this.dataManager.getRoyaltyRecords();
        const record = records.find(r => r.id == recordId);
        
        if (record) {
            this.showViewRecordModal(recordId);
        } else if (this.notificationManager) {
            this.notificationManager.show('Record not found', 'error');
        }
    }

    editRecord(recordId) {
        const records = this.dataManager.getRoyaltyRecords();
        const record = records.find(r => r.id == recordId);
        
        if (record) {
            this.showEditRecordModal(recordId);
        } else if (this.notificationManager) {
            this.notificationManager.show('Record not found', 'error');
        }
    }

    deleteRecord(recordId) {
        const records = this.dataManager.getRoyaltyRecords();
        const record = records.find(r => r.id == recordId);
        
        if (record) {
            const confirmed = confirm(`Are you sure you want to delete record ${record.referenceNumber || `ROY-${record.id}`}?`);
            if (confirmed) {
                // Remove from data (in a real app, this would be a server call)
                const index = this.dataManager.royaltyRecords.findIndex(r => r.id == recordId);
                if (index > -1) {
                    this.dataManager.royaltyRecords.splice(index, 1);
                    this.populateRoyaltyRecordsData(); // Refresh the display
                    
                    if (this.notificationManager) {
                        this.notificationManager.show('Record deleted successfully', 'success');
                    }
                }
            }
        }
    }

    toggleSelectAll(checked) {
        const recordCheckboxes = document.querySelectorAll('.record-checkbox');
        recordCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    // ===== MODAL MANAGEMENT FUNCTIONS =====
    
    showAddRecordModal() {
        const modal = document.getElementById('record-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('record-form');
        
        if (modal && modalTitle && form) {
            modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add New Record';
            form.reset();
            
            // Generate new reference number
            const nextId = Math.max(...this.dataManager.getRoyaltyRecords().map(r => r.id)) + 1;
            const referenceInput = document.getElementById('record-reference');
            if (referenceInput) {
                referenceInput.value = `ROY-2024-${String(nextId).padStart(3, '0')}`;
            }
            
            // Set current date as default
            const dateInput = document.getElementById('record-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
            
            modal.style.display = 'flex';
            modal.dataset.mode = 'add';
            
            this.setupModalEventHandlers();
            
            if (this.notificationManager) {
                this.notificationManager.show('Opening add record modal...', 'info');
            }
        }
    }

    showEditRecordModal(recordId) {
        const records = this.dataManager.getRoyaltyRecords();
        const record = records.find(r => r.id == recordId);
        
        if (!record) {
            if (this.notificationManager) {
                this.notificationManager.show('Record not found', 'error');
            }
            return;
        }
        
        const modal = document.getElementById('record-modal');
        const modalTitle = document.getElementById('modal-title');
        
        if (modal && modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Record';
            
            // Populate form with record data
            this.populateRecordForm(record);
            
            modal.style.display = 'flex';
            modal.dataset.mode = 'edit';
            modal.dataset.recordId = recordId;
            
            this.setupModalEventHandlers();
            
            if (this.notificationManager) {
                this.notificationManager.show(`Editing record: ${record.referenceNumber}`, 'info');
            }
        }
    }

    showViewRecordModal(recordId) {
        const records = this.dataManager.getRoyaltyRecords();
        const record = records.find(r => r.id == recordId);
        
        if (!record) {
            if (this.notificationManager) {
                this.notificationManager.show('Record not found', 'error');
            }
            return;
        }
        
        const modal = document.getElementById('view-modal');
        if (modal) {
            // Populate view modal with record data
            this.populateViewModal(record);
            
            modal.style.display = 'flex';
            modal.dataset.recordId = recordId;
            
            if (this.notificationManager) {
                this.notificationManager.show(`Viewing record: ${record.referenceNumber}`, 'info');
            }
        }
    }

    showBulkActionsModal() {
        const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
        const modal = document.getElementById('bulk-modal');
        const selectedCount = document.getElementById('selected-count');
        
        if (selectedCheckboxes.length === 0) {
            if (this.notificationManager) {
                this.notificationManager.show('Please select at least one record', 'warning');
            }
            return;
        }
        
        if (modal && selectedCount) {
            selectedCount.textContent = selectedCheckboxes.length;
            modal.style.display = 'flex';
            
            if (this.notificationManager) {
                this.notificationManager.show(`${selectedCheckboxes.length} records selected for bulk action`, 'info');
            }
        }
    }

    populateRecordForm(record) {
        const fields = {
            'record-reference': record.referenceNumber || `ROY-${record.id}`,
            'record-entity': record.entity,
            'record-mineral': record.mineral,
            'record-volume': record.volume,
            'record-tariff': record.tariff,
            'record-royalties': record.royalties,
            'record-date': record.date,
            'record-status': record.status
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
    }

    populateViewModal(record) {
        const fields = {
            'view-reference': record.referenceNumber || `ROY-${record.id}`,
            'view-entity': record.entity,
            'view-mineral': record.mineral,
            'view-volume': record.volume ? record.volume.toLocaleString() : 'N/A',
            'view-tariff': record.tariff ? `E ${record.tariff}` : 'N/A',
            'view-royalties': record.royalties ? `E ${record.royalties.toLocaleString()}` : 'E 0',
            'view-date': record.date,
            'view-status': record.status
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Style the status badge
        const statusElement = document.getElementById('view-status');
        if (statusElement && record.status) {
            statusElement.className = `detail-value badge badge-${this.getStatusClass(record.status)}`;
        }
    }

    setupModalEventHandlers() {
        // Auto-calculate royalties when volume or tariff changes
        const volumeInput = document.getElementById('record-volume');
        const tariffInput = document.getElementById('record-tariff');
        const royaltiesInput = document.getElementById('record-royalties');
        
        const calculateRoyalties = () => {
            if (volumeInput && tariffInput && royaltiesInput) {
                const volume = parseFloat(volumeInput.value) || 0;
                const tariff = parseFloat(tariffInput.value) || 0;
                royaltiesInput.value = volume * tariff;
            }
        };
        
        if (volumeInput) {
            volumeInput.removeEventListener('input', calculateRoyalties);
            volumeInput.addEventListener('input', calculateRoyalties);
        }
        if (tariffInput) {
            tariffInput.removeEventListener('input', calculateRoyalties);
            tariffInput.addEventListener('input', calculateRoyalties);
        }
        
        // Modal close functionality
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.removeEventListener('click', this.modalClickHandler);
            this.modalClickHandler = (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            };
            modal.addEventListener('click', this.modalClickHandler);
        });
    }

    // ===== EXPORT UTILITY FUNCTIONS =====
    
    generateCSVExport(records) {
        // Create CSV header
        const headers = [
            'Reference Number', 'Entity', 'Mineral', 'Volume', 
            'Tariff Rate', 'Royalties', 'Date', 'Status'
        ];
        
        // Create CSV rows
        const csvRows = [
            headers.join(','),
            ...records.map(record => [
                record.referenceNumber || `ROY-${record.id}`,
                `"${record.entity}"`,
                `"${record.mineral}"`,
                record.volume || 0,
                record.tariff || 0,
                record.royalties || 0,
                record.date,
                record.status
            ].join(','))
        ];
        
        return csvRows.join('\n');
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            // Feature detection for download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            // Fallback for browsers that don't support download attribute
            if (this.notificationManager) {
                this.notificationManager.show('Export functionality requires a modern browser', 'warning');
            }
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    saveRecord() {
        const modal = document.getElementById('record-modal');
        if (!modal) return;
        
        const mode = modal.dataset.mode;
        const recordId = modal.dataset.recordId;
        
        // Get form data
        const formData = {
            referenceNumber: document.getElementById('record-reference')?.value,
            entity: document.getElementById('record-entity')?.value,
            mineral: document.getElementById('record-mineral')?.value,
            volume: parseFloat(document.getElementById('record-volume')?.value) || 0,
            tariff: parseFloat(document.getElementById('record-tariff')?.value) || 0,
            royalties: parseFloat(document.getElementById('record-royalties')?.value) || 0,
            date: document.getElementById('record-date')?.value,
            status: document.getElementById('record-status')?.value
        };
        
        // Validate required fields
        if (!formData.entity || !formData.mineral || !formData.date) {
            if (this.notificationManager) {
                this.notificationManager.show('Please fill in all required fields', 'error');
            }
            return;
        }
        
        try {
            if (mode === 'add') {
                // Add new record
                const newId = Math.max(...this.dataManager.getRoyaltyRecords().map(r => r.id)) + 1;
                const newRecord = { id: newId, ...formData };
                this.dataManager.royaltyRecords.push(newRecord);
                
                if (this.notificationManager) {
                    this.notificationManager.show('Record added successfully', 'success');
                }
            } else if (mode === 'edit' && recordId) {
                // Update existing record
                const recordIndex = this.dataManager.royaltyRecords.findIndex(r => r.id == recordId);
                if (recordIndex > -1) {
                    this.dataManager.royaltyRecords[recordIndex] = { 
                        id: parseInt(recordId), 
                        ...formData 
                    };
                    
                    if (this.notificationManager) {
                        this.notificationManager.show('Record updated successfully', 'success');
                    }
                }
            }
            
            // Refresh the display and close modal
            this.populateRoyaltyRecordsData();
            this.closeAllModals();
            
        } catch (error) {
            console.error('Error saving record:', error);
            if (this.notificationManager) {
                this.notificationManager.show('Error saving record', 'error');
            }
        }
    }

    editFromView() {
        const viewModal = document.getElementById('view-modal');
        const recordId = viewModal?.dataset.recordId;
        
        if (recordId) {
            this.closeAllModals();
            setTimeout(() => {
                this.showEditRecordModal(recordId);
            }, 100);
        }
    }

    // ===== BULK ACTIONS =====
    
    bulkUpdateStatus(newStatus) {
        const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
        
        if (selectedIds.length === 0) {
            if (this.notificationManager) {
                this.notificationManager.show('No records selected', 'warning');
            }
            return;
        }
        
        try {
            selectedIds.forEach(id => {
                const recordIndex = this.dataManager.royaltyRecords.findIndex(r => r.id === id);
                if (recordIndex > -1) {
                    this.dataManager.royaltyRecords[recordIndex].status = newStatus;
                }
            });
            
            this.populateRoyaltyRecordsData();
            this.closeAllModals();
            
            if (this.notificationManager) {
                this.notificationManager.show(`${selectedIds.length} records updated to ${newStatus}`, 'success');
            }
        } catch (error) {
            console.error('Error updating records:', error);
            if (this.notificationManager) {
                this.notificationManager.show('Error updating records', 'error');
            }
        }
    }

    bulkExport() {
        const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
        
        if (selectedIds.length === 0) {
            if (this.notificationManager) {
                this.notificationManager.show('No records selected', 'warning');
            }
            return;
        }
        
        if (this.notificationManager) {
            this.notificationManager.show(`Exporting ${selectedIds.length} selected records...`, 'info');
            setTimeout(() => {
                this.notificationManager.show('Selected records exported successfully', 'success');
            }, 1500);
        }
        
        this.closeAllModals();
    }

    bulkDelete() {
        const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
        
        if (selectedIds.length === 0) {
            if (this.notificationManager) {
                this.notificationManager.show('No records selected', 'warning');
            }
            return;
        }
        
        const confirmed = confirm(`Are you sure you want to delete ${selectedIds.length} selected records? This action cannot be undone.`);
        
        if (confirmed) {
            try {
                // Remove selected records
                this.dataManager.royaltyRecords = this.dataManager.royaltyRecords.filter(
                    record => !selectedIds.includes(record.id)
                );
                
                this.populateRoyaltyRecordsData();
                this.closeAllModals();
                
                if (this.notificationManager) {
                    this.notificationManager.show(`${selectedIds.length} records deleted successfully`, 'success');
                }
            } catch (error) {
                console.error('Error deleting records:', error);
                if (this.notificationManager) {
                    this.notificationManager.show('Error deleting records', 'error');
                }
            }
        }
    }

    // ===== PAGINATION SYSTEM =====
    
    initializePagination() {
        this.currentPage = 1;
        this.recordsPerPage = 25;
        this.filteredRecords = this.dataManager.getRoyaltyRecords();
        
        this.setupPaginationEventHandlers();
        this.updatePaginationDisplay();
    }

    setupPaginationEventHandlers() {
        // Records per page selector
        const recordsPerPageSelect = document.getElementById('records-per-page');
        if (recordsPerPageSelect) {
            recordsPerPageSelect.addEventListener('change', (e) => {
                this.recordsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.updatePaginationDisplay();
                this.updateTableWithPagination();
            });
        }

        // Previous/Next buttons
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.updatePaginationDisplay();
                    this.updateTableWithPagination();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredRecords.length / this.recordsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.updatePaginationDisplay();
                    this.updateTableWithPagination();
                }
            });
        }
    }

    updatePaginationDisplay() {
        const totalRecords = this.filteredRecords.length;
        const totalPages = Math.ceil(totalRecords / this.recordsPerPage);
        const startRecord = ((this.currentPage - 1) * this.recordsPerPage) + 1;
        const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);

        // Update pagination info
        const paginationInfo = document.getElementById('pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startRecord}-${endRecord} of ${totalRecords} records`;
        }

        // Update prev/next buttons
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        }

        // Update page numbers
        this.updatePageNumbers(totalPages);
    }

    updatePageNumbers(totalPages) {
        const pageNumbersContainer = document.getElementById('page-numbers');
        if (!pageNumbersContainer) return;

        pageNumbersContainer.innerHTML = '';

        // Calculate which page numbers to show
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add page buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn btn-sm btn-secondary page-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.dataset.page = i;
            
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.updatePaginationDisplay();
                this.updateTableWithPagination();
            });
            
            pageNumbersContainer.appendChild(pageBtn);
        }
    }

    updateTableWithPagination() {
        const startIndex = (this.currentPage - 1) * this.recordsPerPage;
        const endIndex = startIndex + this.recordsPerPage;
        const paginatedRecords = this.filteredRecords.slice(startIndex, endIndex);
        
        this.updateRoyaltyRecordsTable(paginatedRecords);
    }

}

// Make RoyaltiesApp globally available immediately
window.RoyaltiesApp = RoyaltiesApp;

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

// ===== GLOBAL FUNCTIONS FOR HTML COMPONENTS =====
// These functions are called directly from HTML onclick attributes

// Modal management functions
window.saveRecord = function() {
    if (window.royaltiesApp && window.royaltiesApp.saveRecord) {
        window.royaltiesApp.saveRecord();
    }
};

window.closeRecordModal = function() {
    if (window.royaltiesApp && window.royaltiesApp.closeAllModals) {
        window.royaltiesApp.closeAllModals();
    }
};

window.closeViewModal = function() {
    if (window.royaltiesApp && window.royaltiesApp.closeAllModals) {
        window.royaltiesApp.closeAllModals();
    }
};

window.closeBulkModal = function() {
    if (window.royaltiesApp && window.royaltiesApp.closeAllModals) {
        window.royaltiesApp.closeAllModals();
    }
};

window.editFromView = function() {
    if (window.royaltiesApp && window.royaltiesApp.editFromView) {
        window.royaltiesApp.editFromView();
    }
};

// Bulk action functions
window.bulkUpdateStatus = function(newStatus) {
    if (window.royaltiesApp && window.royaltiesApp.bulkUpdateStatus) {
        window.royaltiesApp.bulkUpdateStatus(newStatus);
    }
};

window.bulkExport = function() {
    if (window.royaltiesApp && window.royaltiesApp.bulkExport) {
        window.royaltiesApp.bulkExport();
    }
};

window.bulkDelete = function() {
    if (window.royaltiesApp && window.royaltiesApp.bulkDelete) {
        window.royaltiesApp.bulkDelete();
    }
};

console.log('Global modal and bulk action functions registered');