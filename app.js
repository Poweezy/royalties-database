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
        // Initialize action handlers
        this.actionHandlers = {
            userActions: new UserActions(dataManager, notificationManager),
            recordActions: new RecordActions(dataManager, notificationManager),
            contractActions: new ContractActions(dataManager, notificationManager)
        };

        // Make action handlers globally available
        window.userActions = this.actionHandlers.userActions;
        window.recordActions = this.actionHandlers.recordActions;
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
        this.updateDashboardMetrics();
        this.setupCharts();
        this.updateRecentActivity();
    }

    updateDashboardMetrics() {
        const royaltyRecords = dataManager.getRoyaltyRecords();
        const entities = dataManager.getEntities();
        
        const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
        const complianceRate = Math.round((paidRecords / royaltyRecords.length) * 100);
        const pendingApprovals = royaltyRecords.filter(r => r.status === 'Pending').length;
        
        // Update displays
        this.updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}.00`);
        this.updateElement('active-entities', activeEntities);
        this.updateElement('compliance-rate', `${complianceRate}%`);
        this.updateElement('pending-approvals', pendingApprovals);
        
        // Update progress bar
        const progressBar = document.getElementById('compliance-progress');
        if (progressBar) {
            progressBar.style.width = `${complianceRate}%`;
        }
        
        // Update trend indicators
        this.updateElement('royalties-trend', '+12.5%');
        this.updateElement('entities-trend', '+2');
        this.updateElement('compliance-trend', '+2.1%');
        this.updateElement('pending-text', pendingApprovals > 0 ? 'Requires attention' : 'No pending items');
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    setupCharts() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};

        this.setupRevenueChart();
        this.setupProductionChart();
        this.setupChartControls();
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
                    plugins: { legend: { position: 'bottom' } }
                }
            });
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
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        const auditLog = dataManager.getAuditLog();
        const recentEntries = auditLog.slice(0, 5);
        
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
        if (!section || section.innerHTML.trim()) return;
        
        const userAccounts = dataManager.getUserAccounts();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>User Management</h1>
                    <p>Manage system users and permissions</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-user-btn">
                        <i class="fas fa-plus"></i> Add User
                    </button>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Active Users</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-users-count">${userAccounts.filter(u => u.status === 'Active').length}</p>
                    </div>
                </div>
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Failed Logins</h3>
                    </div>
                    <div class="card-body">
                        <p id="failed-logins-count">${userAccounts.reduce((sum, u) => sum + (u.failedAttempts || 0), 0)}</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>User Accounts</h3>
                </div>
                <div class="table-container">
                    <table class="data-table" id="users-table">
                        <thead>
                            <tr>
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
                            ${userAccounts.map(user => `
                                <tr>
                                    <td>${user.username}</td>
                                    <td>${user.email}</td>
                                    <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                                    <td>${user.department}</td>
                                    <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                                    <td>${user.lastLogin || 'Never'}</td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-secondary" onclick="window.userActions.editUser(${user.id})">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="window.userActions.deleteUser(${user.id})">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    loadRoyaltyRecordsSection() {
        const section = document.getElementById('royalty-records');
        if (!section) return;
        
        const royaltyRecords = dataManager.getRoyaltyRecords();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Royalty Records</h1>
                    <p>Manage royalty payments and records</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.recordActions.showAddRecordForm()">
                        <i class="fas fa-plus"></i> Add Record
                    </button>
                    <button class="btn btn-info" onclick="window.recordActions.exportRecords()">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Royalty Records</h3>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Entity</th>
                                <th>Mineral</th>
                                <th>Volume</th>
                                <th>Tariff</th>
                                <th>Royalties</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${royaltyRecords.map(record => `
                                <tr>
                                    <td>${record.referenceNumber}</td>
                                    <td>${record.entity}</td>
                                    <td>${record.mineral}</td>
                                    <td>${record.volume.toLocaleString()}</td>
                                    <td>E${record.tariff}</td>
                                    <td>E${record.royalties.toLocaleString()}</td>
                                    <td>${record.date}</td>
                                    <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-secondary" onclick="window.recordActions.viewRecord(${record.id})">
                                                <i class="fas fa-eye"></i> View
                                            </button>
                                            <button class="btn btn-sm btn-info" onclick="window.recordActions.editRecord(${record.id})">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    loadContractManagementSection() {
        const section = document.getElementById('contract-management');
        if (!section) return;
        
        const contracts = dataManager.getContracts();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📋 Contract Management</h1>
                    <p>Securely store and manage diverse royalty agreements with various stakeholders</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-success" onclick="window.contractActions.showAddContractForm()">
                        <i class="fas fa-plus"></i> New Contract
                    </button>
                    <button class="btn btn-info" onclick="window.contractActions.showContractTemplates()">
                        <i class="fas fa-file-contract"></i> Templates
                    </button>
                    <button class="btn btn-primary" onclick="window.contractActions.exportContracts()">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            
            <!-- Contract Overview Metrics -->
            <div class="charts-grid">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-contract"></i> Active Contracts</h3>
                    </div>
                    <div class="card-body">
                        <p>${contracts.filter(c => c.status === 'active').length}</p>
                        <small><i class="fas fa-arrow-up trend-positive"></i> ${contracts.filter(c => new Date(c.signedDate) > new Date(Date.now() - 90*24*60*60*1000)).length} new this quarter</small>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-calendar-alt"></i> Expiring Soon</h3>
                    </div>
                    <div class="card-body">
                        <p>${contracts.filter(c => new Date(c.endDate) < new Date(Date.now() + 90*24*60*60*1000)).length}</p>
                        <small><i class="fas fa-exclamation-triangle trend-negative"></i> Within 90 days</small>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-handshake"></i> Total Value</h3>
                    </div>
                    <div class="card-body">
                        <p>E ${(contracts.reduce((sum, c) => sum + c.totalValue, 0) / 1000000).toFixed(1)}M</p>
                        <small><i class="fas fa-arrow-up trend-positive"></i> +12% YTD</small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Stakeholder Types</h3>
                    </div>
                    <div class="card-body">
                        <p>4</p>
                        <small>
                            Gov: ${contracts.filter(c => c.stakeholderType === 'government').length} | 
                            Private: ${contracts.filter(c => c.stakeholderType === 'private').length} | 
                            Landowners: ${contracts.filter(c => c.stakeholderType === 'landowner').length} |
                            JV: ${contracts.filter(c => c.stakeholderType === 'joint-venture').length}
                        </small>
                    </div>
                </div>
            </div>

            <!-- Contracts Registry Table -->
            <div class="table-container">
                <div class="section-header">
                    <h4>📋 Contract Registry</h4>
                    <div class="table-actions">
                        <button class="btn btn-info btn-sm">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                        <button class="btn btn-secondary btn-sm">
                            <i class="fas fa-sort"></i> Sort
                        </button>
                        <button class="btn btn-warning btn-sm">
                            <i class="fas fa-bell"></i> Alerts
                        </button>
                    </div>
                </div>
                <table class="data-table" id="contracts-table">
                    <thead>
                        <tr>
                            <th>Contract ID</th>
                            <th>Stakeholder</th>
                            <th>Type</th>
                            <th>Calculation Method</th>
                            <th>Royalty Rate</th>
                            <th>Payment Schedule</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contracts.map(contract => `
                            <tr>
                                <td>${contract.id}</td>
                                <td>${contract.stakeholder}</td>
                                <td><span class="contract-type-badge ${contract.stakeholderType}">${contract.stakeholderType.charAt(0).toUpperCase() + contract.stakeholderType.slice(1)}</span></td>
                                <td><span class="method-badge ${contract.calculationMethod}">${contract.calculationMethod.charAt(0).toUpperCase() + contract.calculationMethod.slice(1)}</span></td>
                                <td>${contract.royaltyRate}</td>
                                <td>${contract.paymentSchedule.charAt(0).toUpperCase() + contract.paymentSchedule.slice(1)}</td>
                                <td>${contract.endDate}</td>
                                <td><span class="status-badge ${contract.status.replace('-', '_')}">${contract.status.charAt(0).toUpperCase() + contract.status.slice(1).replace('-', ' ')}</span></td>
                                <td>E ${(contract.totalValue / 1000000).toFixed(1)}M</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-info btn-sm" onclick="window.contractActions.viewContractDetails('${contract.id}')"><i class="fas fa-eye"></i></button>
                                        <button class="btn btn-warning btn-sm" onclick="window.contractActions.editContract('${contract.id}')"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-secondary btn-sm" onclick="window.contractActions.downloadContract('${contract.id}')"><i class="fas fa-download"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadGenericSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('-', ' ')}</h1>
                    <p>This section is under development</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>Content for ${sectionId} section will be implemented here.</p>
                </div>
            </div>
        `;
    }
}

// Action Handlers
class UserActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    editUser(userId) {
        const user = this.dataManager.findUserById(userId);
        if (user) {
            this.notificationManager.show(`Edit functionality for ${user.username} would be implemented here`, 'info');
        }
    }

    deleteUser(userId) {
        const user = this.dataManager.findUserById(userId);
        if (!user) return;
        
        if (confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
            const deletedUser = this.dataManager.deleteUser(userId);
            
            if (deletedUser) {
                // Add audit entry
                this.dataManager.addAuditEntry({
                    user: 'currentUser',
                    action: 'Delete User',
                    target: user.username,
                    ipAddress: '192.168.1.100',
                    status: 'Success',
                    details: `User ${user.username} deleted`
                });
                
                this.notificationManager.show(`User "${user.username}" deleted successfully`, 'success');
                
                // Reload section
                document.dispatchEvent(new CustomEvent('reloadSection', {
                    detail: { sectionId: 'user-management' }
                }));
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
        if (record) {
            alert(`Record: ${record.referenceNumber}\nEntity: ${record.entity}\nMineral: ${record.mineral}\nVolume: ${record.volume}\nRoyalties: E${record.royalties}\nStatus: ${record.status}`);
        }
    }

    editRecord(recordId) {
        this.notificationManager.show(`Edit functionality for record ${recordId} would be implemented here`, 'info');
    }

    showAddRecordForm() {
        this.notificationManager.show('Add record form would be implemented here', 'info');
    }

    exportRecords() {
        this.notificationManager.show('Export functionality would be implemented here', 'info');
    }
}

class ContractActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewContractDetails(contractId) {
        const contract = this.dataManager.findContractById(contractId);
        if (!contract) return;
        
        const details = `
Contract Details for ${contractId}:

Stakeholder: ${contract.stakeholder}
Type: ${contract.contractType}
Calculation Method: ${contract.calculationMethod}
Royalty Rate: ${contract.royaltyRate}
Payment Schedule: ${contract.paymentSchedule}
Contract Period: ${contract.startDate} to ${contract.endDate}
Status: ${contract.status}
Total Value: E ${(contract.totalValue / 1000000).toFixed(1)}M

Escalation Clause: ${contract.escalationClause?.enabled ? 'Yes' : 'No'}
${contract.escalationClause?.enabled ? `Next Escalation: ${contract.escalationClause.nextEscalation}` : ''}

Conditions:
${contract.conditions.map(condition => `• ${condition}`).join('\n')}

Late Fee: ${contract.lateFeeRate}% after ${contract.gracePeriod} days
Last Review: ${contract.lastReview}
Next Review: ${contract.nextReview}
        `;
        
        alert(details);
    }

    editContract(contractId) {
        this.notificationManager.show(`Edit functionality for contract ${contractId} would open a comprehensive contract editing form`, 'info');
    }

    downloadContract(contractId) {
        this.notificationManager.show(`Downloading contract ${contractId} as PDF`, 'success');
    }

    showAddContractForm() {
        this.notificationManager.show('Add contract form would open with fields for all contract terms, stakeholder details, and calculation methods', 'info');
    }

    showContractTemplates() {
        this.notificationManager.show('Contract templates library would show pre-configured templates for different stakeholder types', 'info');
    }

    exportContracts() {
        this.notificationManager.show('Exporting all contracts with detailed terms and conditions', 'success');
    }
}

// Initialize application
const app = new RoyaltiesApp();

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});

console.log('Mining Royalties Manager application loaded successfully');
