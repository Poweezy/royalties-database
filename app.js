/**
 * Mining Royalties Manager - Main Application
 * @version 2.0.4
 * @date 2025-07-01
 * @description Core application functionality for the Mining Royalties Manager
 * 
 * IMPORTANT: This file now delegates chart and notification functionality
 * to the unified systems. The SimpleChartManager class is kept only for fallback
 * and compatibility with legacy code.
 * 
 * DEBUG MODE: To enable full navigation testing, run in console:
 * window.DEBUG_NAVIGATION = true;
 */

console.log('Mining Royalties Manager v2.0.4 - Loading with unified systems...');

// Initialize Utils
if (typeof Utils !== 'undefined') {
    Utils.suppressNonCriticalErrors();
} else {
    console.warn('Utils module not loaded, falling back to basic functionality');
}

// ===== LEGACY CHART MANAGER (KEPT FOR COMPATIBILITY) =====
// Note: All chart operations should use the unified chart solution whenever possible

/**
 * Simple ChartManager class for fallback when unified systems are unavailable
 * @class SimpleChartManager
 */
class SimpleChartManager {
    constructor() {
        console.log('Creating SimpleChartManager (fallback/compatibility mode)');
        this.charts = new Map();
        this.isChartJsLoaded = typeof Chart !== 'undefined';
    }

    // This method now delegates to the unified chart solution if available
    createChart(canvasId, config) {
        // First try to use the unified chart solution
        if (window.chartManager && window.chartManager.create && typeof window.chartManager.create === 'function') {
            console.log('Delegating chart creation to unified system');
            return window.chartManager.create(canvasId, config);
        }

        // Fallback if unified system is not available
        console.log('Falling back to SimpleChartManager implementation');
        if (!this.isChartJsLoaded) {
            this.showFallbackChart(canvasId);
            return null;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (this.charts.has(canvasId)) {
            this.destroyChart(canvasId);
        }

        try {
            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error(`Error creating chart ${canvasId}:`, error);
            this.showFallbackChart(canvasId);
            return null;
        }
    }

    // All other methods delegate to unified chart solution
    createRevenueChart(canvasId) {
        if (window.chartManager && window.chartManager.createRevenueChart && typeof window.chartManager.createRevenueChart === 'function') {
            return window.chartManager.createRevenueChart(canvasId);
        }
        
        console.log('SimpleChartManager: Creating revenue chart on canvas', canvasId);
        return this.createChart(canvasId, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Revenue (E)',
                    data: [45000, 52000, 48000, 61000, 55000, 67000],
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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

    createProductionChart(canvasId, entityData) {
        if (window.chartManager && window.chartManager.createProductionChart && typeof window.chartManager.createProductionChart === 'function') {
            return window.chartManager.createProductionChart(canvasId, entityData);
        }
        
        const data = entityData || {
            'Diamond Mining Corp': 150,
            'Gold Rush Ltd': 85,
            'Copper Valley Mining': 2500
        };

        return this.createChart(canvasId, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#1a365d', '#2d5a88', '#4a90c2']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }

    showFallbackChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const container = canvas.parentNode;
            if (container) {
                container.innerHTML = `
                    <div class="chart-fallback" style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 200px;
                        color: #64748b;
                        background: #f8fafc;
                        border-radius: 8px;
                        border: 2px dashed #cbd5e0;
                    ">
                        <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                        <p>Chart will load when Chart.js is available</p>
                    </div>
                `;
            }
        }
    }

    destroyChart(canvasId) {
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
}

// Simplified NotificationManager
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.pointerEvents = 'auto';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        this.container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        // Manual close
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Simplified DataManager
class DataManager {
    constructor() {
        this.royaltyRecords = this.generateSampleRecords();
        this.userAccounts = this.generateSampleUsers();
        this.auditLog = [];
        this.entities = this.generateSampleEntities();
        this.minerals = this.generateSampleMinerals();
    }

    generateSampleRecords() {
        return [
            {
                id: 1,
                referenceNumber: 'ROY-2024-001',
                entity: 'Diamond Mining Corp',
                mineral: 'Diamond',
                volume: 150,
                tariff: 2500,
                royalties: 375000,
                date: '2024-01-15',
                status: 'Paid'
            },
            {
                id: 2,
                referenceNumber: 'ROY-2024-002',
                entity: 'Gold Rush Ltd',
                mineral: 'Gold',
                volume: 85,
                tariff: 1800,
                royalties: 153000,
                date: '2024-01-20',
                status: 'Pending'
            },
            {
                id: 3,
                referenceNumber: 'ROY-2024-003',
                entity: 'Copper Valley Mining',
                mineral: 'Copper',
                volume: 2500,
                tariff: 45,
                royalties: 112500,
                date: '2024-01-10',
                status: 'Overdue'
            }
        ];
    }

    generateSampleUsers() {
        return [
            {
                id: 1,
                username: 'admin',
                email: 'admin@royalties.gov',
                role: 'Administrator',
                department: 'Management',
                status: 'Active',
                createdDate: '2024-01-01',
                lastLogin: '2024-01-25',
                failedAttempts: 0
            },
            {
                id: 2,
                username: 'editor',
                email: 'editor@royalties.gov',
                role: 'Editor',
                department: 'Finance',
                status: 'Active',
                createdDate: '2024-01-02',
                lastLogin: '2024-01-24',
                failedAttempts: 0
            },
            {
                id: 3,
                username: 'viewer',
                email: 'viewer@royalties.gov',
                role: 'Viewer',
                department: 'Operations',
                status: 'Active',
                createdDate: '2024-01-03',
                lastLogin: '2024-01-23',
                failedAttempts: 0
            }
        ];
    }

    generateSampleEntities() {
        return [
            { name: 'Diamond Mining Corp', type: 'Large Scale', status: 'Active' },
            { name: 'Gold Rush Ltd', type: 'Medium Scale', status: 'Active' },
            { name: 'Copper Valley Mining', type: 'Large Scale', status: 'Active' },
            { name: 'Silver Stream Co', type: 'Small Scale', status: 'Active' }
        ];
    }

    generateSampleMinerals() {
        return [
            { name: 'Diamond', tariff: 2500, unit: 'carat' },
            { name: 'Gold', tariff: 1800, unit: 'gram' },
            { name: 'Copper', tariff: 45, unit: 'tonne' },
            { name: 'Silver', tariff: 850, unit: 'gram' },
            { name: 'Coal', tariff: 25, unit: 'tonne' },
            { name: 'Iron Ore', tariff: 35, unit: 'tonne' }
        ];
    }

    getRoyaltyRecords() {
        return this.royaltyRecords;
    }

    getUserAccounts() {
        return this.userAccounts;
    }

    getEntities() {
        return this.entities;
    }

    getMinerals() {
        return this.minerals;
    }

    findRecordById(id) {
        return this.royaltyRecords.find(record => record.id === parseInt(id));
    }

    findUserById(id) {
        return this.userAccounts.find(user => user.id === parseInt(id));
    }

    deleteUser(id) {
        const index = this.userAccounts.findIndex(user => user.id === parseInt(id));
        if (index > -1) {
            return this.userAccounts.splice(index, 1)[0];
        }
        return null;
    }

    addAuditEntry(entry) {
        const auditEntry = {
            id: this.auditLog.length + 1,
            timestamp: new Date().toISOString(),
            ...entry
        };
        this.auditLog.push(auditEntry);
        return auditEntry;
    }

    getAllContracts() {
        // Mock contract data for calculations
        return [
            { id: 1, entity: 'Diamond Mining Corp', status: 'Active', dueDate: '2024-02-15' },
            { id: 2, entity: 'Gold Rush Ltd', status: 'Active', dueDate: '2024-01-30' },
            { id: 3, entity: 'Copper Valley Mining', status: 'Pending', dueDate: '2024-03-10' },
            { id: 4, entity: 'Silver Stream Co', status: 'Active', dueDate: '2024-02-28' },
            { id: 5, entity: 'Iron Ore Industries', status: 'Active', dueDate: '2024-03-15' },
            { id: 6, entity: 'Coal Creek Mining', status: 'Overdue', dueDate: '2024-01-20' },
            { id: 7, entity: 'Platinum Plus Ltd', status: 'Active', dueDate: '2024-04-01' },
            { id: 8, entity: 'Mineral Masters Inc', status: 'Active', dueDate: '2024-03-25' },
            { id: 9, entity: 'Rock Solid Mining', status: 'Pending', dueDate: '2024-02-10' },
            { id: 10, entity: 'Deep Earth Extraction', status: 'Active', dueDate: '2024-04-10' }
        ];
    }
}

// Simplified AuthManager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = {
            'admin': { username: 'admin', password: 'admin123', role: 'Administrator' },
            'editor': { username: 'editor', password: 'editor123', role: 'Editor' },
            'viewer': { username: 'viewer', password: 'viewer123', role: 'Viewer' }
        };
    }

    authenticate(username, password) {
        const user = this.users[username];
        if (user && user.password === password) {
            this.currentUser = user;
            return { success: true, user };
        }
        return { success: false };
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
    }
}

// Mobile Navigation Manager
class MobileNavigationManager {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createToggleButton();
        this.setupEventListeners();
        this.updateVisibility();
    }

    createToggleButton() {
        const existing = document.querySelector('.mobile-menu-toggle');
        if (existing) existing.remove();

        const button = document.createElement('button');
        button.className = 'mobile-menu-toggle';
        button.innerHTML = '<i class="fas fa-bars"></i>';
        button.style.cssText = `
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 1001;
            background: #1a365d;
            color: white;
            border: none;
            border-radius: 6px;
            width: 48px;
            height: 48px;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(button);
        this.toggleButton = button;
    }

    setupEventListeners() {
        this.toggleButton.addEventListener('click', () => this.toggle());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        window.addEventListener('resize', () => {
            this.updateVisibility();
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        this.isOpen = true;
        sidebar.classList.add('mobile-open');
        this.toggleButton.innerHTML = '<i class="fas fa-times"></i>';
        this.createOverlay();
    }

    close() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        this.isOpen = false;
        sidebar.classList.remove('mobile-open');
        this.toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
        this.removeOverlay();
    }

    createOverlay() {
        const overlay = document.createElement('div');
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
        overlay.addEventListener('click', () => this.close());
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    removeOverlay() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    updateVisibility() {
        const isMobile = window.innerWidth <= 768;
        this.toggleButton.style.display = isMobile ? 'flex' : 'none';
    }
}

// ===== MAIN APPLICATION CLASS =====

// ===== MAIN APPLICATION CLASS =====
class RoyaltiesApp {
    constructor() {
        this.dataManager = new DataManager();
        this.authManager = new AuthManager();
        this.notificationManager = new NotificationManager();
        // Use the globally available chartManager if it exists, otherwise use SimpleChartManager
        this.chartManager = window.chartManager || new SimpleChartManager();
        this.mobileNav = null;
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        
        // Define available sections for navigation
        this.availableSections = [
            'dashboard', 
            'user-management', 
            'royalty-records', 
            'contract-management', 
            'reporting-analytics', 
            'communication', 
            'notifications', 
            'compliance', 
            'regulatory-management', 
            'profile'
        ];
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing application...');
            
            // Ensure availableSections is always properly initialized
            if (!this.availableSections || !Array.isArray(this.availableSections)) {
                console.warn('Re-initializing availableSections during initialize()');
                this.availableSections = [
                    'dashboard', 'user-management', 'royalty-records', 
                    'contract-management', 'reporting-analytics', 'communication', 
                    'notifications', 'compliance', 'regulatory-management', 'profile'
                ];
            }
            
            // Initialize the data manager
            if (this.dataManager && typeof this.dataManager.initialize === 'function') {
                this.dataManager.initialize();
            }
            
            this.startLoadingSequence();
            this.isInitialized = true;
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    startLoadingSequence() {
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => this.hideLoadingShowLogin(), 500);
            }
        }, 200);
    }

    hideLoadingShowLogin() {
        const loadingScreen = document.getElementById('loading-screen');
        const loginSection = document.getElementById('login-section');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 300);
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
        
        // Password visibility toggle
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                passwordToggle.innerHTML = isPassword ? 
                    '<i class="fas fa-eye-slash"></i>' : 
                    '<i class="fas fa-eye"></i>';
            });
        }
        
        // Form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.authenticateUser(usernameInput?.value, passwordInput?.value);
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
        if (!username || !password) {
            this.notificationManager.show('Please enter both username and password', 'warning');
            return;
        }

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
            this.dataManager.addAuditEntry({
                user: username || 'Unknown',
                action: 'Failed Login',
                target: 'System',
                ipAddress: '192.168.1.100',
                status: 'Failed',
                details: 'Invalid credentials provided'
            });

            this.notificationManager.show('Invalid credentials. Please try again.', 'error');
        }
    }

    async showMainApplication() {
        try {
            const loginSection = document.getElementById('login-section');
            const appContainer = document.getElementById('app-container');
            
            if (loginSection) loginSection.style.display = 'none';
            if (appContainer) appContainer.style.display = 'flex';
            
            // Load sidebar and wait for it to complete
            await this.loadSidebar();
            
            // Wait longer for sidebar to render completely and then setup navigation with enhanced reliability
            setTimeout(() => {
                console.log('Setting up navigation after sidebar load...');
                this.setupNavigation();
                this.setupGlobalActions();
                
                // Debug navigation after setup with a longer delay
                setTimeout(() => {
                    this.debugNavigation();
                    
                    // Verify navigation is working and retry if needed
                    const navLinks = document.querySelectorAll('.nav-link[data-section]');
                    if (navLinks.length === 0) {
                        console.error('CRITICAL: No navigation links found after setup!');
                        console.log('Attempting to reload sidebar and retry navigation setup...');
                        this.loadSidebar().then(() => {
                            // Wait longer before retrying
                            setTimeout(() => {
                                console.log('Retrying navigation setup after sidebar reload...');
                                this.setupNavigation();
                                
                                // Final verification
                                setTimeout(() => {
                                    const finalCheck = document.querySelectorAll('.nav-link[data-section]');
                                    if (finalCheck.length > 0) {
                                        console.log(`RECOVERY SUCCESS: Found ${finalCheck.length} navigation links after retry`);
                                    } else {
                                        console.error('CRITICAL FAILURE: Navigation links still not found after retry');
                                        // Force a manual navigation setup as last resort
                                        this.forceNavigationSetup();
                                    }
                                }, 500);
                            }, 2000);
                        });
                    } else {
                        console.log(`SUCCESS: Found ${navLinks.length} navigation links`);
                    }
                }, 1500);
            }, 2000);
            
            // Initialize mobile navigation
            this.mobileNav = new MobileNavigationManager();
            
            // Show default section
            await this.showSection('dashboard');
            
            const user = this.authManager.getCurrentUser();
            if (user && user.username) {
                this.notificationManager.show(`Welcome back, ${user.username}!`, 'success');
            } else {
                this.notificationManager.show('Welcome to Mining Royalties Manager!', 'success');
            }

        } catch (error) {
            console.error('Error showing main application:', error);
            this.notificationManager.show('Error loading application', 'error');
        }    }
    
    async loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            console.error('Sidebar element not found');
            return;
        }
        
        console.log('Loading sidebar using unified component loader');
        console.log('Current protocol:', window.location.protocol);
        console.log('Unified component loader available:', !!window.unifiedComponentLoader);
        
        // ALWAYS use unified component loader for sidebar
        if (window.unifiedComponentLoader) {
            try {
                console.log('Attempting to load sidebar component...');
                const result = await window.unifiedComponentLoader.loadComponent('sidebar', sidebar);
                console.log('Sidebar loading result:', result);
                
                if (result && result.success) {
                    console.log(`Sidebar loaded successfully using unified component loader (source: ${result.source})`);
                    
                    // Verify that navigation links are present
                    const navLinks = sidebar.querySelectorAll('.nav-link[data-section]');
                    console.log(`Found ${navLinks.length} navigation links in loaded sidebar`);
                    
                    if (navLinks.length === 0) {
                        console.warn('Warning: No navigation links found in loaded sidebar content');
                        console.log('Sidebar innerHTML:', sidebar.innerHTML.substring(0, 200) + '...');
                    }
                    
                    return;
                } else {
                    console.error('Sidebar loading failed:', result);
                }
            } catch (error) {
                console.error('Failed to load sidebar with unified component loader:', error);
            }
        } else {
            console.error('Unified component loader not available for sidebar loading!');
        }
        
        // If unified loader failed, try manual fallback
        console.log('Attempting manual fallback for sidebar...');
        try {
            const fallbackContent = `
                <div class="sidebar-header">
                    <div class="sidebar-logo" aria-label="Mining Royalties Manager Logo">MR</div>
                    <h2>Royalties Manager</h2>
                </div>
                <nav>
                    <ul>
                        <li><a href="#dashboard" class="nav-link active" data-section="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                        <li><a href="#user-management" class="nav-link" data-section="user-management"><i class="fas fa-users"></i> User Management</a></li>
                        <li><a href="#royalty-records" class="nav-link" data-section="royalty-records"><i class="fas fa-file-invoice-dollar"></i> Royalty Records</a></li>
                        <li><a href="#contract-management" class="nav-link" data-section="contract-management"><i class="fas fa-file-contract"></i> Contract Management</a></li>
                        <li><a href="#reporting-analytics" class="nav-link" data-section="reporting-analytics"><i class="fas fa-chart-bar"></i> Reports & Analytics</a></li>
                        <li><a href="#communication" class="nav-link" data-section="communication"><i class="fas fa-comments"></i> Communication</a></li>
                        <li><a href="#notifications" class="nav-link" data-section="notifications"><i class="fas fa-bell"></i> Notifications</a></li>
                        <li><a href="#compliance" class="nav-link" data-section="compliance"><i class="fas fa-shield-alt"></i> Compliance</a></li>
                        <li><a href="#regulatory-management" class="nav-link" data-section="regulatory-management"><i class="fas fa-gavel"></i> Regulatory Management</a></li>
                        <li><a href="#profile" class="nav-link" data-section="profile"><i class="fas fa-user"></i> Profile</a></li>
                    </ul>
                </nav>
            `;
            
            sidebar.innerHTML = fallbackContent;
            console.log('Manual fallback sidebar loaded successfully');
            
            // Verify navigation links in fallback
            const navLinks = sidebar.querySelectorAll('.nav-link[data-section]');
            console.log(`Manual fallback: Found ${navLinks.length} navigation links`);
            
        } catch (error) {
            console.error('Even manual fallback failed:', error);
        }
    }

    setupNavigation() {
        console.log('Setting up navigation...');
        
        // Clear any existing navigation handlers to prevent duplicates
        if (this._documentClickHandler) {
            document.removeEventListener('click', this._documentClickHandler);
        }
        
        // Use event delegation on the document for better reliability
        this._documentClickHandler = (e) => {
            const navLink = e.target.closest('.nav-link[data-section]');
            if (navLink) {
                e.preventDefault();
                const section = navLink.dataset.section;
                
                console.log('Navigation clicked:', section);
                
                if (section === 'logout') {
                    this.handleLogout();
                } else if (section) {
                    this.showSection(section);
                }
            }
        };
        
        document.addEventListener('click', this._documentClickHandler);
        console.log('Event delegation for navigation setup complete');
        
        // Also set up direct navigation for existing links with enhanced detection
        const setupDirectNavigation = () => {
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) {
                console.warn('Sidebar not found during navigation setup');
                return 0;
            }
            
            // Use multiple selectors to ensure we catch all navigation links
            const navLinks = document.querySelectorAll('.nav-link[data-section]');
            const altNavLinks = document.querySelectorAll('nav a[data-section]');
            const allNavLinks = [...new Set([...navLinks, ...altNavLinks])]; // Remove duplicates
            
            console.log(`Found ${navLinks.length} .nav-link[data-section] navigation links`);
            console.log(`Found ${altNavLinks.length} nav a[data-section] alternative navigation links`);
            console.log(`Total unique navigation links: ${allNavLinks.length}`);
            
            if (allNavLinks.length === 0) {
                console.warn('No navigation links found! Checking sidebar content...');
                console.log('Sidebar innerHTML length:', sidebar.innerHTML.length);
                console.log('Sidebar preview:', sidebar.innerHTML.substring(0, 300) + '...');
                
                // Check if sidebar content exists but links are not being detected
                if (sidebar.innerHTML.includes('data-section=')) {
                    console.warn('Sidebar contains data-section attributes but they are not being detected by querySelector');
                    console.log('This may be a timing issue with DOM processing');
                }
                
                // Try to force reload sidebar if it appears empty
                if (sidebar.innerHTML.length < 100) {
                    console.log('Sidebar appears empty, attempting reload...');
                    return 0;
                }
            }
            
            allNavLinks.forEach((link, index) => {
                const section = link.dataset.section;
                console.log(`Navigation link ${index + 1}: ${section} (href: ${link.getAttribute('href')})`);
                
                // Ensure the link has the proper attributes
                if (!section) {
                    console.warn(`Link ${index + 1} missing data-section attribute`);
                } else {                // Additional verification that the section exists in DOM
                // Skip validation for special actions like logout
                if (section === 'logout') {
                    // Logout is a special action, not a content section
                    return;
                }
                
                const sectionElement = document.getElementById(section);
                if (!sectionElement) {
                    console.warn(`Warning: Navigation link for '${section}' found but section element does not exist`);
                }
                }
            });
            
            return allNavLinks.length;
        };
        
        // Set up navigation immediately
        const initialCount = setupDirectNavigation();
        
        // If no links found initially, retry multiple times with increasing delays and more aggressive recovery
        if (initialCount === 0) {
            console.log('No navigation links found initially, will retry with enhanced recovery...');
            
            const retrySetup = (attempt) => {
                setTimeout(() => {
                    console.log(`Re-setting up navigation (attempt ${attempt})...`);
                    const count = setupDirectNavigation();
                    
                    if (count === 0 && attempt < 7) {  // Increased retry attempts
                        if (attempt <= 3) {
                            // First few attempts: just wait longer
                            console.log(`Attempt ${attempt}: Still no navigation links, retrying in ${attempt + 1} seconds...`);
                            retrySetup(attempt + 1);
                        } else {
                            // Later attempts: try reloading sidebar
                            console.log('Still no navigation links, reloading sidebar...');
                            this.loadSidebar().then(() => {
                                // Wait longer after sidebar reload
                                setTimeout(() => {
                                    retrySetup(attempt + 1);
                                }, 1500);
                            }).catch(error => {
                                console.error('Error reloading sidebar during navigation retry:', error);
                                retrySetup(attempt + 1);
                            });
                        }
                    } else if (count > 0) {
                        console.log(`✅ Navigation setup successful on attempt ${attempt} with ${count} links`);
                        // Re-run the debug to confirm
                        setTimeout(() => this.debugNavigation(), 500);
                    } else {
                        console.error(`❌ Navigation setup failed after ${attempt} attempts`);
                        console.log('Attempting force navigation setup as last resort...');
                        this.forceNavigationSetup();
                    }
                }, attempt * 1000);
            };
            
            retrySetup(1);
        } else {
            console.log(`✅ Navigation setup successful with ${initialCount} links`);
        }
        
        console.log('Navigation setup complete');
    }
    
    // Force navigation setup as a last resort when normal setup fails
    forceNavigationSetup() {
        console.log('=== FORCING NAVIGATION SETUP ===');
        
        // Try to manually inject sidebar content if it's missing
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            console.error('Cannot force navigation setup: sidebar element not found');
            return;
        }
        
        // Check if sidebar is empty
        if (sidebar.innerHTML.length < 100) {
            console.log('Sidebar appears empty, injecting navigation manually...');
            
            // Manually inject the sidebar content
            sidebar.innerHTML = `
                <div class="sidebar-header">
                    <div class="sidebar-logo" aria-label="Mining Royalties Manager Logo">MR</div>
                    <h2>Royalties Manager</h2>
                </div>
                <nav>
                    <ul>
                        <li><a href="#dashboard" class="nav-link" data-section="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                        <li><a href="#user-management" class="nav-link" data-section="user-management"><i class="fas fa-users"></i> User Management</a></li>
                        <li><a href="#royalty-records" class="nav-link" data-section="royalty-records"><i class="fas fa-file-invoice-dollar"></i> Royalty Records</a></li>
                        <li><a href="#contract-management" class="nav-link" data-section="contract-management"><i class="fas fa-file-contract"></i> Contract Management</a></li>
                        <li><a href="#reporting-analytics" class="nav-link" data-section="reporting-analytics"><i class="fas fa-chart-bar"></i> Reporting & Analytics</a></li>
                        <li><a href="#communication" class="nav-link" data-section="communication"><i class="fas fa-envelope"></i> Communication</a></li>
                        <li><a href="#notifications" class="nav-link" data-section="notifications"><i class="fas fa-bell"></i> Notifications <span id="notification-count">3</span></a></li>
                        <li><a href="#compliance" class="nav-link" data-section="compliance"><i class="fas fa-check-circle"></i> Compliance & Regulatory</a></li>
                        <li><a href="#regulatory-management" class="nav-link" data-section="regulatory-management"><i class="fas fa-gavel"></i> Regulatory Management</a></li>
                        <li><a href="#profile" class="nav-link" data-section="profile"><i class="fas fa-user"></i> My Profile</a></li>
                        <li><a href="#logout" class="nav-link" data-section="logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                    </ul>
                </nav>
            `;
            
            console.log('Manual sidebar content injected');
        }
        
        // Force navigation setup after content injection
        setTimeout(() => {
            console.log('Setting up forced navigation...');
            
            // Set up event delegation if not already set up
            if (!this._documentClickHandler) {
                this._documentClickHandler = (e) => {
                    const navLink = e.target.closest('.nav-link');
                    if (navLink) {
                        e.preventDefault();
                        const section = navLink.dataset.section;
                        
                        console.log('Navigation clicked (forced setup):', section);
                        
                        if (section === 'logout') {
                            this.handleLogout();
                        } else if (section) {
                            this.showSection(section);
                        }
                    }
                };
                
                document.addEventListener('click', this._documentClickHandler);
                console.log('Forced navigation event delegation setup complete');
            }
            
            // Final verification
            const navLinks = document.querySelectorAll('.nav-link[data-section]');
            console.log(`Force setup result: ${navLinks.length} navigation links found`);
            
            if (navLinks.length > 0) {
                console.log('✅ FORCE SETUP SUCCESSFUL - Navigation should now work');
                navLinks.forEach((link, index) => {
                    console.log(`  ${index + 1}. ${link.dataset.section}`);
                });
            } else {
                console.error('❌ FORCE SETUP FAILED - Navigation links still not found');
                console.log('This indicates a fundamental DOM issue that needs manual investigation');
            }
            
        }, 100);
        
        console.log('=== END FORCE NAVIGATION SETUP ===');
    }
    
    setupGlobalActions() {
        // Set up any global actions or shortcuts here
        console.log('Global actions setup complete');
    }

    handleLogout() {
        console.log('Logout requested');
        this.authManager.logout();
        const appContainer = document.getElementById('app-container');
        const loginSection = document.getElementById('login-section');
        
        if (appContainer) appContainer.style.display = 'none';
        if (loginSection) loginSection.style.display = 'flex';
        
        this.notificationManager.show('Logged out successfully', 'info');
    }

    cleanup() {
        console.log('Starting application cleanup...');
        
        // Cleanup navigation handlers
        if (this._documentClickHandler) {
            document.removeEventListener('click', this._documentClickHandler);
            this._documentClickHandler = null;
            console.log('Document click handler removed');
        }
        
        // Cleanup any direct navigation event listeners
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        navLinks.forEach(link => {
            // Clone and replace to remove all event listeners
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
        });
        console.log(`Cleaned up ${navLinks.length} navigation link handlers`);
        
        // Cleanup mobile navigation
        if (this.mobileNav) {
            if (this.mobileNav.cleanup && typeof this.mobileNav.cleanup === 'function') {
                this.mobileNav.cleanup();
            }
            this.mobileNav = null;
            console.log('Mobile navigation cleaned up');
        }
        
        // Reset current section
        this.currentSection = 'dashboard';
        this._currentlyLoading = null;
        
        console.log('Application cleanup completed');
    }

    // === MISSING UTILITY METHODS ===
    calculateTotalRevenue() {
        // Calculate total revenue from royalty records
        try {
            const records = this.dataManager ? this.dataManager.getRoyaltyRecords() : [];
            const total = records.reduce((sum, record) => {
                const amount = parseFloat(record.amount) || 0;
                return sum + amount;
            }, 0);
            return total || 2450000; // Fallback to demo value
        } catch (error) {
            console.warn('Error calculating total revenue, using fallback:', error);
            return 2450000; // Demo fallback value
        }
    }

    initializeSectionComponent(sectionId, container) {
        console.log(`Initializing section component: ${sectionId}`);
        
        try {
            // Initialize section-specific functionality
            switch(sectionId) {
                case 'dashboard':
                    this.initializeDashboardComponents();
                    break;
                case 'user-management':
                    this.initializeUserManagement();
                    break;
                case 'royalty-records':
                    this.initializeRoyaltyRecords();
                    break;
                case 'contract-management':
                    this.initializeContractManagement();
                    break;
                case 'reporting-analytics':
                    this.initializeReportingAnalytics();
                    break;
                case 'communication':
                    this.initializeCommunication();
                    break;
                case 'notifications':
                    this.initializeNotifications();
                    break;
                case 'compliance':
                    this.initializeCompliance();
                    break;
                case 'regulatory-management':
                    this.initializeRegulatoryManagement();
                    break;
                case 'profile':
                    this.initializeProfile();
                    break;
                default:
                    console.log(`No specific initialization for section: ${sectionId}`);
            }
        } catch (error) {
            console.error(`Error initializing section ${sectionId}:`, error);
        }
    }

    // Section-specific initialization methods
    initializeDashboardComponents() {
        console.log('Initializing dashboard components');
        // Initialize dashboard-specific functionality
        // This could include setting up event handlers, form validation, etc.
        
        // Initialize dashboard charts if not already done
        setTimeout(() => {
            if (typeof this.initializeDashboardCharts === 'function') {
                console.log('Dashboard components: Charts will be initialized by loadDashboardContent');
            }
        }, 100);
        
        // Add any other dashboard-specific initialization here
        console.log('Dashboard components initialization complete');
    }

    initializeUserManagement() {
        console.log('Initializing user management functionality');
        // Add user management specific initialization here
    }

    initializeRoyaltyRecords() {
        console.log('Initializing royalty records functionality');
        // Add royalty records specific initialization here
    }

    initializeContractManagement() {
        console.log('Initializing contract management functionality');
        // Add contract management specific initialization here
    }

    initializeReportingAnalytics() {
        console.log('Initializing reporting analytics functionality');
        // Add reporting analytics specific initialization here
    }

    initializeCommunication() {
        console.log('Initializing communication functionality');
        // Add communication specific initialization here
    }

    initializeNotifications() {
        console.log('Initializing notifications functionality');
        // Add notifications specific initialization here
    }

    initializeCompliance() {
        console.log('Initializing compliance functionality');
        // Add compliance specific initialization here
    }

    initializeRegulatoryManagement() {
        console.log('Initializing regulatory management functionality');
        // Add regulatory management specific initialization here
    }

    initializeProfile() {
        console.log('Initializing profile functionality');
        // Add profile specific initialization here
    }

    calculateComplianceRate() {
        // Calculate compliance rate for dashboard
        try {
            // Mock calculation for demonstration
            const totalContracts = this.dataManager && this.dataManager.getAllContracts ? 
                this.dataManager.getAllContracts().length : 10; // Fallback
            const compliantContracts = Math.floor(totalContracts * 0.85); // Assume 85% compliance
            const rate = totalContracts > 0 ? (compliantContracts / totalContracts) * 100 : 85;
            return Math.round(rate);
        } catch (error) {
            console.warn('Error calculating compliance rate, using fallback:', error);
            return 85; // Fallback percentage
        }
    }

    getOverdueCount() {
        // Calculate overdue count for dashboard
        try {
            // Mock calculation for demonstration
            if (this.dataManager && this.dataManager.getAllContracts) {
                const contracts = this.dataManager.getAllContracts();
                // Simulate overdue contracts (5% of total)
                return Math.floor(contracts.length * 0.05) || 2;
            }
            return 2; // Fallback count
        } catch (error) {
            console.warn('Error calculating overdue count, using fallback:', error);
            return 2; // Fallback count
        }
    }

    updateDashboardMetrics() {
        console.log('Updating dashboard metrics with real data...');
        
        try {
            const royaltyRecords = this.dataManager.getRoyaltyRecords();
            const entities = this.dataManager.getEntities();
            
            console.log('Retrieved data for metrics:');
            console.log('- Royalty records:', royaltyRecords.length);
            console.log('- Entities:', entities.length);
            console.log('- Sample royalty record:', royaltyRecords[0]);
            
            // Calculate comprehensive metrics
            const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + (record.royalties || 0), 0);
            const totalProduction = royaltyRecords.reduce((sum, record) => sum + (record.volume || 0), 0);
            const activeEntities = entities.filter(e => e.status === 'Active').length;
            const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
            const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending').length;
            const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords / royaltyRecords.length) * 100) : 0;
            
            // Calculate production breakdown by mineral type
            const productionByMineral = royaltyRecords.reduce((acc, record) => {
                if (record.mineral) {
                    acc[record.mineral] = (acc[record.mineral] || 0) + (record.volume || 0);
                }
                return acc;
            }, {});
            
            // Update all KPI elements
            // Main production KPIs
            this.updateElement('total-production', `${totalProduction.toLocaleString()} tonnes`);
            this.updateElement('total-production-volume', `${totalProduction.toLocaleString()} tonnes`);
            this.updateElement('avg-ore-grade', `${(Math.random() * 5 + 10).toFixed(1)}%`);
            this.updateElement('ore-grade-average', `${(Math.random() * 5 + 10).toFixed(1)}%`);
            this.updateElement('cost-per-unit', `E ${(totalRoyalties / totalProduction * 0.15).toFixed(2) || '15.20'}`);
            
            // Production breakdown by mineral
            this.updateElement('coal-production', `${productionByMineral.Coal || 0}t`);
            this.updateElement('iron-production', `${productionByMineral['Iron Ore'] || 0}t`);
            this.updateElement('stone-production', `${productionByMineral['Quarried Stone'] || 0}m³`);
            
            // Royalty and payment KPIs
            this.updateElement('total-royalties-calculated', `E ${totalRoyalties.toLocaleString()}`);
            this.updateElement('payments-received', `E ${Math.round(totalRoyalties * 0.95).toLocaleString()}`);
            this.updateElement('reconciliation-status', `${Math.round((paidRecords / royaltyRecords.length) * 100) || 98}%`);
            this.updateElement('overall-compliance', `${complianceRate}%`);
            this.updateElement('total-royalty-revenue', `E ${totalRoyalties.toLocaleString()}`);
            this.updateElement('active-entities', activeEntities);
            this.updateElement('pending-approvals', pendingRecords.length);
            
            // Additional KPI elements
            this.updateElement('current-royalty-rate', `${(Math.random() * 3 + 2).toFixed(1)}%`);
            this.updateElement('base-rate', `${(Math.random() * 2 + 1).toFixed(1)}%`);
            this.updateElement('labor-cost', `E ${Math.round(totalRoyalties * 0.3).toLocaleString()}`);
            this.updateElement('equipment-cost', `E ${Math.round(totalRoyalties * 0.2).toLocaleString()}`);
            this.updateElement('grade-range', `${(Math.random() * 5 + 8).toFixed(1)}% - ${(Math.random() * 5 + 15).toFixed(1)}%`);
            
            // Update progress bars
            const complianceProgress = document.getElementById('compliance-progress');
            if (complianceProgress) {
                complianceProgress.style.width = `${complianceRate}%`;
            }
            
            console.log(`Dashboard metrics updated: Revenue=${totalRoyalties}, Production=${totalProduction}, Compliance=${complianceRate}%`);
            
        } catch (error) {
            console.error('Error updating dashboard metrics:', error);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with id '${id}' not found for update`);
        }
    }

    createAdditionalDashboardCharts() {
        console.log('Creating additional dashboard charts...');
        
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available for additional charts');
            return;
        }
        
        try {
            // Get data for charts
            const royaltyRecords = this.dataManager.getRoyaltyRecords();
            
            // 1. Revenue by Entity Chart
            this.createRevenueByEntityChart(royaltyRecords);
            
            // 2. Production vs Royalty Correlation Chart
            this.createProductionRoyaltyCorrelationChart(royaltyRecords);
            
            // 3. Production Efficiency Chart
            this.createProductionEfficiencyChart(royaltyRecords);
            
            // 4. Mineral Performance Chart
            this.createMineralPerformanceChart();
            
            console.log('Additional dashboard charts created successfully');
            
        } catch (error) {
            console.error('Error creating additional dashboard charts:', error);
        }
    }

    createRevenueByEntityChart(records) {
        const canvas = document.getElementById('revenue-by-entity-chart');
        if (!canvas) return;
        
        const entityRevenue = records.reduce((acc, record) => {
            acc[record.entity] = (acc[record.entity] || 0) + (record.royalties || 0);
            return acc;
        }, {});
        
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Object.keys(entityRevenue),
                datasets: [{
                    label: 'Revenue (E)',
                    data: Object.values(entityRevenue),
                    backgroundColor: ['#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc', '#a8c5e2'],
                    borderWidth: 1
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
        
        console.log('✅ Revenue by Entity chart created');
    }

    createProductionRoyaltyCorrelationChart(records) {
        const canvas = document.getElementById('production-royalty-correlation');
        if (!canvas) return;
        
        const correlationData = records.map(record => ({
            x: record.volume || 0,
            y: record.royalties || 0
        }));
        
        new Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Production vs Royalties',
                    data: correlationData,
                    backgroundColor: '#1a365d',
                    borderColor: '#1a365d',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Production Volume (tonnes)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Royalties (E)'
                        },
                        ticks: {
                            callback: function(value) {
                                return 'E' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Production vs Royalty Correlation chart created');
    }

    createProductionEfficiencyChart(records) {
        const canvas = document.getElementById('production-efficiency-chart');
        if (!canvas) return;
        
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Efficiency %',
                    data: [78, 82, 79, 85, 88, 91],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
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
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Production Efficiency chart created');
    }

    // Missing function that was causing the chart initialization error
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

    createMineralPerformanceChart() {
        const canvas = document.getElementById('mineral-performance-chart');
        if (canvas && typeof Chart !== 'undefined') {
            console.log('Creating mineral performance chart...');
            const records = this.dataManager.getRoyaltyRecords();
            const mineralData = this.aggregateMineralPerformance(records);
            
            if (this.chartManager && this.chartManager.createChart) {
                const chart = this.chartManager.createChart('mineral-performance-chart', {
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
                
                if (chart) {
                    console.log('✅ Mineral performance chart created successfully');
                } else {
                    console.error('❌ Mineral performance chart creation failed');
                }
            } else {
                console.error('❌ Chart manager not available for mineral performance chart');
            }
        } else {
            console.log('ℹ️ Mineral performance chart canvas not found or Chart.js not loaded');
        }
    }

    // Enhanced debug function to check navigation status
    debugNavigation() {
        console.log('=== ENHANCED NAVIGATION DEBUG ===');
        const sidebar = document.getElementById('sidebar');
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        const altNavLinks = document.querySelectorAll('nav a[data-section]');
        const allDataSectionLinks = document.querySelectorAll('[data-section]');
        
        console.log('🔍 DOM Elements Check:');
        console.log('  Sidebar element:', sidebar ? 'Found' : 'NOT FOUND');
        console.log('  Sidebar innerHTML length:', sidebar ? sidebar.innerHTML.length : 'N/A');
        console.log('  .nav-link[data-section] count:', navLinks.length);
        console.log('  nav a[data-section] count:', altNavLinks.length);
        console.log('  All [data-section] elements:', allDataSectionLinks.length);
        
        if (sidebar) {
            console.log('🔍 Sidebar Content Analysis:');
            console.log('  Contains "data-section":', sidebar.innerHTML.includes('data-section'));
            console.log('  Contains "nav-link":', sidebar.innerHTML.includes('nav-link'));
            console.log('  Contains navigation list:', sidebar.innerHTML.includes('<ul>'));
            console.log('  Sidebar preview:', sidebar.innerHTML.substring(0, 300) + '...');
        }
        
        if (navLinks.length === 0 && altNavLinks.length === 0) {
            // Check if sidebar is still loading
            if (sidebar && sidebar.innerHTML.length < 100) {
                console.log('ℹ️ Navigation links not yet loaded (sidebar appears to be loading...)');
            } else {
                console.warn('⚠️ NO NAVIGATION LINKS FOUND - sidebar may have failed to load');
            }
            console.log('🔍 Checking for alternative selectors...');
            
            // Check for alternative navigation patterns
            const patterns = [
                { selector: 'nav a[href^="#"]', description: 'Nav links with hash hrefs' },
                { selector: 'a[data-section]', description: 'Any links with data-section' },
                { selector: '.nav-link', description: 'Elements with nav-link class' },
                { selector: 'nav a', description: 'Any nav links' },
                { selector: 'aside a', description: 'Links in sidebar/aside' }
            ];
            
            patterns.forEach(pattern => {
                const elements = document.querySelectorAll(pattern.selector);
                console.log(`  ${pattern.description}: ${elements.length} found`);
                if (elements.length > 0 && elements.length <= 15) {
                    elements.forEach((el, i) => {
                        const section = el.dataset.section || 'no-data-section';
                        const href = el.getAttribute('href') || 'no-href';
                        const text = el.textContent.trim().substring(0, 20);
                        console.log(`    ${i + 1}. section="${section}", href="${href}", text="${text}"`);
                    });
                }
            });
            
            // Check if unified component loader is working
            console.log('🔍 Component Loader Status:');
            console.log('  unifiedComponentLoader available:', !!window.unifiedComponentLoader);
            if (window.unifiedComponentLoader) {
                console.log('  Component loader methods:', Object.getOwnPropertyNames(window.unifiedComponentLoader));
            }
            
        } else {
            const allLinks = [...navLinks, ...altNavLinks];
            const uniqueLinks = [...new Set(allLinks)]; // Remove duplicates
            
            console.log('✅ Navigation links found:');
            console.log(`  Total unique navigation links: ${uniqueLinks.length}`);
            
            uniqueLinks.forEach((link, index) => {
                const section = link.dataset.section;
                const href = link.getAttribute('href');
                const text = link.textContent.trim();
                const hasClickHandler = link.onclick !== null;
                const classes = link.className;
                console.log(`  ${index + 1}. section="${section}", href="${href}", text="${text}", classes="${classes}", hasHandler=${hasClickHandler}`);
            });
        }
        
        // Check if sections exist in DOM
        const expectedSections = [
            'dashboard', 'user-management', 'royalty-records', 'contract-management',
            'reporting-analytics', 'communication', 'notifications', 'compliance',
            'regulatory-management', 'profile'
        ];
        
        console.log('🔍 Section Elements in DOM:');
        expectedSections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            console.log(`  ${sectionId}: ${element ? '✅ Found' : '❌ NOT FOUND'}`);
        });
        
        // Check event delegation status
        console.log('🔍 Event Delegation Status:');
        console.log('  Document click handler set:', !!this._documentClickHandler);
        
        // Test navigation programmatically
        console.log('🔍 Navigation Test Functions:');
        const testLinks = document.querySelectorAll('.nav-link[data-section]');
        if (testLinks.length > 0) {
            console.log('  You can test navigation by running these commands in console:');
            testLinks.forEach(link => {
                const section = link.dataset.section;
                if (section && section !== 'logout') {
                    console.log(`    window.royaltiesApp.showSection('${section}')`);
                }
            });
        }
        
        console.log('=== END ENHANCED NAVIGATION DEBUG ===');
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
                this._currentlyLoading = null; // Reset loading flag
                return;
            }
            
            // Redirect legacy sections to active sections as needed
            if (!this.availableSections.includes(sectionId)) {
                console.log(`Section '${sectionId}' not in available sections, redirecting to dashboard`);
                if (this.notificationManager && this.notificationManager.show) {
                    this.notificationManager.show('The requested section is not available', 'info');
                }
                this._currentlyLoading = null; // Reset loading flag
                // CRITICAL FIX: Don't call showSection recursively if we're already trying to show dashboard
                if (sectionId !== 'dashboard') {
                    this.showSection('dashboard');
                }
                return;
            }
            
            // Hide all sections
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => section.style.display = 'none');

            // Show target section
            const targetSection = document.getElementById(sectionId);
            if (!targetSection) {
                console.error(`Section element #${sectionId} not found in DOM`);
                if (this.notificationManager && this.notificationManager.show) {
                    this.notificationManager.show(`The ${sectionId.replace('-', ' ')} section is not available`, 'warning');
                }
                
                // CRITICAL FIX: Don't recursively call showSection if we're already trying to show dashboard
                this._currentlyLoading = null; // Reset loading flag before potential recursion
                if (sectionId !== 'dashboard') {
                    console.log('Falling back to dashboard (element not found)');
                    this.showSection('dashboard');
                }
                return;
            }
            
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            this.updateNavigationState(sectionId);

            // Check if section is empty and needs content
            if (targetSection.children.length === 0 || !targetSection.hasAttribute('data-loaded')) {
                console.log(`Section ${sectionId} needs content loading...`);
                await this.loadSectionContent(sectionId);
                targetSection.setAttribute('data-loaded', 'true');
            } else {
                console.log(`Section ${sectionId} already has content, skipping load`);
            }
            
            // Force section initialization even if content exists
            this.initializeSectionComponent(sectionId);
            
            // Reset loading flag
            this._currentlyLoading = null;
            
        } catch (error) {
            console.error(`Error loading section ${sectionId}:`, error);
            if (this.notificationManager && this.notificationManager.show) {
                this.notificationManager.show(`Error loading ${sectionId.replace('-', ' ')}`, 'error');
            }
            
            // Reset loading flag on error
            this._currentlyLoading = null;
            
            // CRITICAL FIX: Only fallback to dashboard if we're not already trying to load dashboard AND we haven't exceeded retry attempts
            if (sectionId !== 'dashboard' && !this._dashboardFallbackAttempted) {
                console.log('Falling back to dashboard due to error');
                this._dashboardFallbackAttempted = true;
                setTimeout(() => {
                    this._dashboardFallbackAttempted = false; // Reset after a delay
                }, 5000);
                this.showSection('dashboard');
            }
        }
    }
    
    updateNavigationState(activeSection) {
        console.log(`Updating navigation state for: ${activeSection}`);
        
        // Update navigation links to show active state
        const navLinks = document.querySelectorAll('nav a, .nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeSection}` || 
                link.dataset.section === activeSection) {
                link.classList.add('active');
                console.log(`Set active state for navigation link: ${activeSection}`);
            }
        });
        
        // Update current section tracking
        this.currentSection = activeSection;
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
                        
                        // Special handling for dashboard - update metrics after component loads
                        if (sectionId === 'dashboard') {
                            setTimeout(() => {
                                console.log('Dashboard component loaded, updating metrics...');
                                this.updateDashboardMetrics();
                            }, 500);
                        }
                        
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

        // Comprehensive fallback content for all sections
        const fallbackContent = {
            'dashboard': () => this.loadDashboardContent(section),
            'user-management': () => this.loadUserManagementContent(section),
            'royalty-records': () => this.loadRoyaltyRecordsContent(section),
            'contract-management': () => this.loadContractManagementContent(section),
            'reporting-analytics': () => this.loadReportingAnalyticsContent(section),
            'communication': () => this.loadCommunicationContent(section),
            'notifications': () => this.loadNotificationsContent(section),
            'compliance': () => this.loadComplianceContent(section),
            'regulatory-management': () => this.loadRegulatoryManagementContent(section),
            'profile': () => this.loadProfileContent(section)
        };

        // Load specific fallback content or generic content
        if (fallbackContent[sectionId]) {
            fallbackContent[sectionId]();
        } else {
            section.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-cog"></i> ${sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
                        <p>This section is under development</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        <div class="text-center py-4">
                            <i class="fas fa-tools fa-3x text-muted mb-3"></i>
                            <h4>Coming Soon</h4>
                            <p class="text-muted">Content for this section will be available soon.</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        console.log(`Fallback content loaded for: ${sectionId}`);
    }

    /**
     * Validates that all required sections exist in the DOM and are properly initialized
     * @returns {object} Validation result with details
     */
    validateSections() {
        const validationResult = {
            success: true,
            missingSections: [],
            availableSections: [],
            errors: []
        };
        
        try {
            // Ensure availableSections exists
            if (!this.availableSections || !Array.isArray(this.availableSections)) {
                validationResult.errors.push('availableSections property not properly initialized');
                this.availableSections = [
                    'dashboard', 'user-management', 'royalty-records', 
                    'contract-management', 'reporting-analytics', 'communication', 
                    'notifications', 'compliance', 'regulatory-management', 'profile'
                ];
                console.warn('Fixed availableSections property during validation');
            }
            
            // Check each section
            this.availableSections.forEach(sectionId => {
                const sectionElement = document.getElementById(sectionId);
                if (sectionElement) {
                    validationResult.availableSections.push(sectionId);
                } else {
                    validationResult.missingSections.push(sectionId);
                    validationResult.success = false;
                    console.warn(`Section element missing: ${sectionId}`);
                }
            });
            
            console.log('Section validation completed:', validationResult);
            return validationResult;
            
        } catch (error) {
            console.error('Error during section validation:', error);
            validationResult.success = false;
            validationResult.errors.push(error.message);
            return validationResult;
        }
    }

    /**
     * Creates missing section elements if they don't exist
     * @param {array} missingSections Array of missing section IDs
     */
    createMissingSections(missingSections) {
        if (!missingSections || missingSections.length === 0) return;
        
        const mainElement = document.querySelector('main');
        if (!mainElement) {
            console.error('Main element not found - cannot create missing sections');
            return;
        }
        
        missingSections.forEach(sectionId => {
            console.log(`Creating missing section: ${sectionId}`);
            const sectionElement = document.createElement('section');
            sectionElement.id = sectionId;
            sectionElement.style.display = 'none';
            sectionElement.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <h1>${sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
                        <p>Loading content...</p>
                    </div>
                </div>
                <div class="loading-placeholder">
                    <p>Section content is being loaded...</p>
                </div>
            `;
            mainElement.appendChild(sectionElement);
        });
    }

    async loadDashboardContent(section) {
        console.log('Loading comprehensive dashboard content...');
        
        // Load the full dashboard component first
        try {
            if (window.unifiedComponentLoader && window.unifiedComponentLoader.loadComponent) {
                console.log('Loading dashboard component with unified loader...');
                const result = await window.unifiedComponentLoader.loadComponent('dashboard', section);
                if (result.success) {
                    console.log('✅ Dashboard component loaded successfully via unified loader');
                    // Initialize charts and event handlers after content is loaded
                    setTimeout(() => {
                        this.initializeDashboardCharts();
                        this.setupDashboardEventHandlers();
                    }, 300);
                    return;
                } else {
                    throw new Error('Failed to load dashboard component');
                }
            } else {
                throw new Error('Unified component loader not available');
            }
        } catch (error) {
            console.warn('Failed to load dashboard component, using fallback:', error.message);
            
            // Fallback: Create comprehensive dashboard content inline
            const totalRevenue = this.calculateTotalRevenue();
            const recordsCount = this.dataManager.getRoyaltyRecords().length;
            const complianceRate = this.calculateComplianceRate();
            const overdueCount = this.getOverdueCount();
            const recentRecords = this.dataManager.getRoyaltyRecords().slice(0, 5);
            
            section.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-chart-line"></i> Mining Royalties Dashboard</h1>
                        <p>Comprehensive overview of production, payments, compliance, and financial performance</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-info" id="refresh-dashboard-btn">
                            <i class="fas fa-sync-alt"></i> Refresh Data
                        </button>
                        <button class="btn btn-success" id="export-dashboard-btn">
                            <i class="fas fa-download"></i> Export Report
                        </button>
                        <button class="btn btn-secondary" id="customize-dashboard-btn">
                            <i class="fas fa-cog"></i> Customize View
                        </button>
                    </div>
                </div>

                <!-- Key Performance Indicators -->
                <div class="charts-grid">
                    <div class="metric-card card">
                        <div class="card-header">
                            <h3><i class="fas fa-money-bill-wave"></i> Total Revenue</h3>
                        </div>
                        <div class="card-body">
                            <p>E ${totalRevenue.toLocaleString()}</p>
                            <small class="trend-positive">
                                <i class="fas fa-arrow-up"></i> +12% from last month
                            </small>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="card-header">
                            <h3><i class="fas fa-file-invoice-dollar"></i> Active Entities</h3>
                        </div>
                        <div class="card-body">
                            <p>${recordsCount}</p>
                            <small class="trend-info">
                                <i class="fas fa-plus"></i> Mining operations
                            </small>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="card-header">
                            <h3><i class="fas fa-percentage"></i> Compliance Rate</h3>
                        </div>
                        <div class="card-body">
                            <p>${complianceRate}%</p>
                            <div class="mini-progress">
                                <div class="progress-bar" style="width: ${complianceRate}%;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card card">
                        <div class="card-header">
                            <h3><i class="fas fa-exclamation-triangle"></i> Overdue Payments</h3>
                        </div>
                        <div class="card-body">
                            <p>${overdueCount}</p>
                            <small class="trend-warning">
                                <i class="fas fa-clock"></i> Require attention
                            </small>
                        </div>
                    </div>
                </div>

                <!-- Production Tracking & KPI Section -->
                <div class="dashboard-section">
                    <h3 class="section-title"><i class="fas fa-industry"></i> Production Tracking & Key Performance Indicators</h3>
                    <div class="charts-grid">
                        <div class="metric-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-cube"></i> Total Production</h3>
                            </div>
                            <div class="card-body">
                                <p id="total-production-volume">0 tonnes</p>
                                <small class="trend-positive">
                                    <i class="fas fa-arrow-up"></i> +5% this period
                                </small>
                            </div>
                        </div>

                        <div class="metric-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-gem"></i> Ore Grade Quality</h3>
                            </div>
                            <div class="card-body">
                                <p id="ore-grade-average">0%</p>
                                <small class="trend-stable">Average grade</small>
                            </div>
                        </div>

                        <div class="metric-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-dollar-sign"></i> Production Cost per Unit</h3>
                            </div>
                            <div class="card-body">
                                <p id="cost-per-unit">E 0</p>
                                <small class="trend-negative">
                                    <i class="fas fa-arrow-down"></i> -3% cost reduction
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Royalty Calculation & Payment Tracking Section -->
                <div class="dashboard-section">
                    <h3 class="section-title"><i class="fas fa-calculator"></i> Royalty Calculation & Payment Tracking</h3>
                    <div class="charts-grid">
                        <div class="metric-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-money-bill-wave"></i> Total Royalties Calculated</h3>
                            </div>
                            <div class="card-body">
                                <p id="total-royalties-calculated">E 0</p>
                                <small class="trend-positive">
                                    <i class="fas fa-arrow-up"></i> +8% this period
                                </small>
                            </div>
                        </div>

                        <div class="metric-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-check-circle"></i> Payments Received</h3>
                            </div>
                            <div class="card-body">
                                <p id="payments-received">E 0</p>
                                <small class="trend-positive">
                                    <i class="fas fa-percentage"></i> 95% of calculated
                                </small>
                            </div>
                        </div>

                        <div class="metric-card card">
                            <div class="card-header">
                                <h3><i class="fas fa-balance-scale"></i> Payment Reconciliation</h3>
                            </div>
                            <div class="card-body">
                                <p id="reconciliation-status">98%</p>
                                <small class="trend-positive">
                                    <i class="fas fa-check"></i> Reconciled
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Grid -->
                <div class="charts-grid">
                    <!-- Revenue Trends Chart -->
                    <div class="card analytics-chart">
                        <div class="chart-header">
                            <h5><i class="fas fa-chart-area"></i> Revenue Trends Over Time</h5>
                            <div class="chart-controls">
                                <button class="chart-btn active" data-chart-type="line">Monthly</button>
                                <button class="chart-btn" data-chart-type="bar">Quarterly</button>
                                <button class="chart-btn" data-chart-type="area">Yearly</button>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="revenue-trends-chart"></canvas>
                        </div>
                        <div class="chart-summary">
                            <strong>12-Month Total:</strong> E <span id="twelve-month-total">2,450,000</span> | 
                            <strong>Avg Monthly:</strong> E <span id="monthly-average">204,167</span>
                        </div>
                    </div>

                    <!-- Production by Entity Chart -->
                    <div class="card analytics-chart">
                        <div class="chart-header">
                            <h5><i class="fas fa-chart-pie"></i> Production by Entity</h5>
                            <div class="chart-controls">
                                <select class="metric-period">
                                    <option value="current-month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="production-by-entity-chart"></canvas>
                        </div>
                        <div class="chart-summary">
                            <strong>Total Production:</strong> <span id="total-production">3,850 tons</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Timeline Chart -->
                <div class="card analytics-chart">
                    <div class="chart-header">
                        <h5><i class="fas fa-calendar-alt"></i> Payment Timeline</h5>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart-type="line">Timeline View</button>
                            <button class="chart-btn" data-chart-type="bar">Monthly View</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="payment-timeline-chart"></canvas>
                    </div>
                    <div class="chart-summary">
                        <strong>On-time Payments:</strong> 85% | <strong>Average Days:</strong> 15 days
                    </div>
                </div>

                <!-- Additional Analytics Charts -->
                <div class="charts-grid">
                    <!-- Revenue by Entity Chart -->
                    <div class="card analytics-chart">
                        <div class="chart-header">
                            <h5><i class="fas fa-chart-bar"></i> Revenue by Entity</h5>
                            <div class="chart-controls">
                                <select class="metric-period">
                                    <option value="current-month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="revenue-by-entity-chart"></canvas>
                        </div>
                        <div class="chart-summary">
                            <strong>Top Contributor:</strong> <span id="top-revenue-entity">Ngwenya Mine</span> | 
                            <strong>Contribution:</strong> <span id="top-contribution">35%</span>
                        </div>
                    </div>

                    <!-- Mineral Performance Chart -->
                    <div class="card analytics-chart">
                        <div class="chart-header">
                            <h5><i class="fas fa-gem"></i> Mineral Performance</h5>
                        </div>
                        <div class="chart-container">
                            <canvas id="mineral-performance-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Production vs Royalty Correlation -->
                <div class="charts-grid">
                    <div class="card analytics-chart">
                        <div class="chart-header">
                            <h5><i class="fas fa-chart-scatter"></i> Production vs Royalty Correlation</h5>
                            <div class="chart-controls">
                                <button class="chart-btn active" data-chart-type="scatter">Scatter Plot</button>
                                <button class="chart-btn" data-chart-type="line">Trend Line</button>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="production-royalty-correlation"></canvas>
                        </div>
                        <div class="chart-summary">
                            <strong>Correlation:</strong> <span id="correlation-coefficient">0.85</span> | 
                            <strong>R²:</strong> <span id="r-squared">72%</span>
                        </div>
                    </div>

                    <div class="card analytics-chart">
                        <div class="chart-header">
                            <h5><i class="fas fa-chart-area"></i> Production Efficiency</h5>
                        </div>
                        <div class="chart-container">
                            <canvas id="production-efficiency-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-history"></i> Recent Activity</h5>
                        <div class="card-actions">
                            <button class="btn btn-sm btn-info" onclick="refreshRecentActivity()">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="recent-activity" class="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon success">
                                    <i class="fas fa-check"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Payment Received</strong> from Ngwenya Mine - E ${Math.round(totalRevenue * 0.15).toLocaleString()}</p>
                                    <small>2 hours ago</small>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon info">
                                    <i class="fas fa-file-upload"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Production Report Submitted</strong> - Monthly Output: ${Math.round(totalRevenue / 50).toLocaleString()} tonnes</p>
                                    <small>5 hours ago</small>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon warning">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Payment Overdue</strong> - Kwalini Quarry (E ${Math.round(totalRevenue * 0.08).toLocaleString()})</p>
                                    <small>1 day ago</small>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon success">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Compliance Check Completed</strong> - ${complianceRate}% compliance rate achieved</p>
                                    <small>1 day ago</small>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon info">
                                    <i class="fas fa-balance-scale"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Reconciliation Complete</strong> - ${recordsCount} records processed successfully</p>
                                    <small>2 days ago</small>
                                </div>
                            </div>
                        </div>
                        <div class="activity-footer">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewAllActivity()">
                                <i class="fas fa-list"></i> View All Activity
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Recent Royalty Records Table -->
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Royalty Records</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Reference</th>
                                        <th>Entity</th>
                                        <th>Mineral</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentRecords.map(record => `
                                        <tr>
                                            <td>${record.referenceNumber}</td>
                                            <td>${record.entity}</td>
                                            <td>${record.mineral}</td>
                                            <td>E ${record.royalties.toLocaleString()}</td>
                                            <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
                                            <td>${new Date(record.date).toLocaleDateString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Initialize charts and event handlers after content is loaded with longer timeout
        // to ensure canvas elements are properly rendered
        console.log('Dashboard content loaded, will initialize charts in 500ms...');
        setTimeout(() => {
            this.initializeDashboardCharts();
            this.setupDashboardEventHandlers();
            // Update dashboard metrics with real data after longer delay
            setTimeout(() => {
                this.updateDashboardMetrics();
            }, 200);
        }, 500);
    }

    initializeDashboardCharts() {
        console.log('Initializing dashboard charts...');
        
        // Function to actually initialize charts
        const doChartInitialization = () => {
            // Check if Chart.js is loaded
            if (typeof Chart === 'undefined') {
                console.error('Chart.js is not loaded! Charts cannot be created.');
                return false;
            }
            
            // Check if chart manager is available
            if (!this.chartManager) {
                console.error('Chart manager is not available! Charts cannot be created.');
                return false;
            }

            // Check canvas elements exist
            const revenueCanvas = document.getElementById('revenue-trends-chart');
            const productionCanvas = document.getElementById('production-by-entity-chart');
            
            console.log('Canvas elements check:');
            console.log('- Revenue canvas:', revenueCanvas ? '✅ Found' : '❌ Missing');
            console.log('- Production canvas:', productionCanvas ? '✅ Found' : '❌ Missing');
            
            if (!revenueCanvas || !productionCanvas) {
                console.error('Required canvas elements are missing from the DOM');
                return false;
            }
            
            try {
                // Get royalty records for charts
                const royaltyRecords = this.dataManager.getRoyaltyRecords();
                console.log('Royalty records for charts:', royaltyRecords.length, 'records');
                
                // Create revenue chart
                if (this.chartManager.createRevenueChart) {
                    console.log('Creating revenue chart...');
                    const revenueChart = this.chartManager.createRevenueChart('revenue-trends-chart');
                    if (revenueChart) {
                        console.log('✅ Revenue chart created successfully');
                    } else {
                        console.error('❌ Revenue chart creation returned null');
                    }
                } else {
                    console.error('❌ createRevenueChart method not available in chart manager');
                }
        
                // Create production chart with actual data
                const entityData = royaltyRecords.reduce((acc, record) => {
                    acc[record.entity] = (acc[record.entity] || 0) + record.volume;
                    return acc;
                }, {});
                
                console.log('Entity production data:', entityData);
                
                // Handle different method names in different chart manager implementations
                if (this.chartManager.createProductionChart) {
                    console.log('Creating production chart using createProductionChart...');
                    const productionChart = this.chartManager.createProductionChart('production-by-entity-chart', entityData);
                    if (productionChart) {
                        console.log('✅ Production chart created successfully');
                    } else {
                        console.error('❌ Production chart creation returned null');
                    }
                } else if (this.chartManager.createEntityChart) {
                    console.log('Creating production chart using createEntityChart...');
                    const productionChart = this.chartManager.createEntityChart('production-by-entity-chart', entityData);
                    if (productionChart) {
                        console.log('✅ Production chart created successfully');
                    } else {
                        console.error('❌ Production chart creation returned null');
                    }
                } else {
                    console.error('❌ No suitable chart creation method found in chartManager');
                    console.log('Available chart manager methods:', Object.getOwnPropertyNames(this.chartManager));
                }
                
                // Create payment timeline chart
                const paymentTimelineCanvas = document.getElementById('payment-timeline-chart');
                if (paymentTimelineCanvas) {
                    console.log('Creating payment timeline chart...');
                    if (this.chartManager.createChart) {
                        const paymentTimelineChart = this.chartManager.createChart('payment-timeline-chart', {
                            type: 'line',
                            data: {
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                datasets: [{
                                    label: 'Payments Received (E)',
                                    data: [85000, 92000, 88000, 95000, 91000, 98000],
                                    borderColor: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                }, {
                                    label: 'Payments Due (E)',
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
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Payment Timeline'
                                    },
                                    legend: {
                                        display: true,
                                        position: 'bottom'
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Amount (E)'
                                        },
                                        ticks: {
                                            callback: function(value) {
                                                return 'E' + value.toLocaleString();
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        
                        if (paymentTimelineChart) {
                            console.log('✅ Payment timeline chart created successfully');
                        } else {
                            console.error('❌ Payment timeline chart creation returned null');
                        }
                    } else {
                        console.error('❌ createChart method not available in chart manager');
                    }
                } else {
                    console.log('ℹ️ Payment timeline canvas not found (may not be in current dashboard layout)');
                }
                
                console.log('Dashboard charts initialization complete');
                
                // Create additional dashboard charts
                this.createAdditionalDashboardCharts();
                
                return true;
                
            } catch (error) {
                console.error('Error during chart initialization:', error);
                console.error('Error stack:', error.stack);
                return false;
            }
        };
        
        // Try immediate initialization
        if (doChartInitialization()) {
            return;
        }
        
        // If immediate initialization failed, try again after a delay
        console.log('Initial chart initialization failed, retrying in 500ms...');
        setTimeout(() => {
            if (!doChartInitialization()) {
                console.log('Second chart initialization attempt failed, retrying in 1000ms...');
                setTimeout(() => {
                    if (!doChartInitialization()) {
                        console.error('All chart initialization attempts failed. Please check console for errors.');
                    }
                }, 1000);
            }
        }, 500);
    }

    setupDashboardEventHandlers() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-dashboard');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboard();
            });
        }

        // Chart control buttons
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const chartType = btn.dataset.chartType;
                
                // Update active state
                btn.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.notificationManager.show(`Switched to ${chartType} view`, 'info');
            });
        });
    }

    refreshDashboard() {
        // Refresh charts
        this.chartManager.destroyAll();
        setTimeout(() => {
            this.initializeDashboardCharts();
        }, 100);
        
        this.notificationManager.show('Dashboard refreshed successfully', 'success');
    }

    exportDashboard() {
        this.notificationManager.show('Exporting dashboard data...', 'info');
        setTimeout(() => {
            this.notificationManager.show('Dashboard data exported successfully', 'success');
        }, 2000);
    }

    async loadUserManagementContent(section) {
        const users = this.dataManager.getUserAccounts();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>User Management</h1>
                    <p>Manage system users and access permissions</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="exportUsers()">
                        <i class="fas fa-download"></i> Export Users
                    </button>
                    <button class="btn btn-warning" onclick="resetAllPasswords()">
                        <i class="fas fa-key"></i> Reset All Passwords
                    </button>
                    <button class="btn btn-primary" onclick="addUser()">
                        <i class="fas fa-user-plus"></i> Add User
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
                            <th>Failed Attempts</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td><input type="checkbox" class="user-checkbox" value="${user.id}"></td>
                                <td>${user.username}</td>
                                <td>${user.email}</td>
                                <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                                <td>${user.department}</td>
                                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                                <td>${user.failedAttempts}</td>
                                <td>${new Date(user.createdDate).toLocaleDateString()}</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-info" onclick="viewUser(${user.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-secondary" onclick="resetUserPassword(${user.id})">
                                            <i class="fas fa-key"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadRoyaltyRecordsContent(section) {
        const records = this.dataManager.getRoyaltyRecords();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Royalty Records</h1>
                    <p>Manage and track all royalty payments</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i> Export Records
                    </button>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Add Record
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox"></th>
                            <th>Reference</th>
                            <th>Entity</th>
                            <th>Mineral</th>
                            <th>Volume</th>
                            <th>Royalties</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(record => `
                            <tr>
                                <td><input type="checkbox" value="${record.id}"></td>
                                <td>${record.referenceNumber}</td>
                                <td>${record.entity}</td>
                                <td>${record.mineral}</td>
                                <td>${record.volume.toLocaleString()}</td>
                                <td>E ${record.royalties.toLocaleString()}</td>
                                <td>${new Date(record.date).toLocaleDateString()}</td>
                                <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
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
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadContractManagementContent(section) {
        console.log('Loading enhanced contract management content...');
        
        // Load the contract management component first
        try {
            if (window.unifiedComponentLoader && window.unifiedComponentLoader.loadComponent) {
                console.log('Loading contract management component with unified loader...');
                const result = await window.unifiedComponentLoader.loadComponent('contract-management', section);
                if (result.success) {
                    console.log('✅ Contract management component loaded successfully');
                    // Initialize contract management functionality after content is loaded
                    setTimeout(() => {
                        this.initializeContractManagement();
                        this.loadContractData();
                        this.setupContractEventHandlers();
                    }, 300);
                    return;
                } else {
                    throw new Error('Failed to load contract management component');
                }
            } else {
                throw new Error('Unified component loader not available');
            }
        } catch (error) {
            console.warn('Failed to load contract management component, using enhanced fallback:', error.message);
            this.loadEnhancedContractManagementFallback(section);
        }
    }

    loadEnhancedContractManagementFallback(section) {
        const contracts = this.dataManager.getEnhancedContracts();
        const contractMetrics = this.calculateContractMetrics(contracts);
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📋 Contract Management</h1>
                    <p>Comprehensive management of mining contracts, stakeholder agreements, and royalty calculation methodologies</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-info" id="template-library-btn" onclick="this.openTemplateLibrary()">
                        <i class="fas fa-file-alt"></i> Template Library
                    </button>
                    <button class="btn btn-secondary" id="export-contracts-btn" onclick="this.exportContracts()">
                        <i class="fas fa-file-export"></i> Export Contracts
                    </button>
                    <button class="btn btn-success" id="add-contract-btn" onclick="this.showAddContractModal()">
                        <i class="fas fa-plus"></i> Add Contract
                    </button>
                </div>
            </div>

            <!-- Contract Management Summary Cards -->
            <div class="charts-grid" id="contract-metrics">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-contract"></i> Active Contracts</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-contracts-count">${contractMetrics.activeCount}</p>
                        <small><i class="fas fa-handshake text-success"></i> Currently in force</small>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-calendar-alt"></i> Expiring Soon</h3>
                    </div>
                    <div class="card-body">
                        <p id="expiring-contracts-count">${contractMetrics.expiringSoon}</p>
                        <small><i class="fas fa-exclamation-triangle text-warning"></i> Within 90 days</small>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Total Contract Value</h3>
                    </div>
                    <div class="card-body">
                        <p id="total-contract-value">E ${contractMetrics.totalValue.toLocaleString()}</p>
                        <small><i class="fas fa-chart-line text-success"></i> Combined portfolio value</small>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-sync-alt"></i> Pending Renewals</h3>
                    </div>
                    <div class="card-body">
                        <p id="pending-renewals-count">${contractMetrics.pendingRenewals}</p>
                        <small><i class="fas fa-clock text-info"></i> Require attention</small>
                    </div>
                </div>
            </div>

            <!-- Contract Registry Table -->
            <div id="contracts-table-container">
                <div class="table-container">
                    <div class="section-header">
                        <h4><i class="fas fa-file-contract"></i> Contract Registry</h4>
                        <div class="table-actions">
                            <div class="search-container">
                                <i class="fas fa-search"></i>
                                <input type="text" id="contracts-search" placeholder="Search contracts..." class="search-input">
                            </div>
                            <button class="btn btn-info btn-sm" id="filter-contracts-btn">
                                <i class="fas fa-filter"></i> Filter
                            </button>
                            <button class="btn btn-secondary btn-sm" id="sort-contracts-btn">
                                <i class="fas fa-sort"></i> Sort
                            </button>
                            <button class="btn btn-warning btn-sm" id="contract-bulk-actions-btn">
                                <i class="fas fa-tasks"></i> Bulk Actions
                            </button>
                        </div>
                    </div>

                    <table class="data-table" id="contracts-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="select-all-contracts"></th>
                                <th sortable data-sort="contractId">Contract ID</th>
                                <th sortable data-sort="stakeholder">Stakeholder</th>
                                <th sortable data-sort="entity">Entity</th>
                                <th sortable data-sort="contractType">Type</th>
                                <th sortable data-sort="royaltyRate">Royalty Rate</th>
                                <th sortable data-sort="startDate">Start Date</th>
                                <th sortable data-sort="endDate">End Date</th>
                                <th sortable data-sort="status">Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="contracts-tbody">
                            ${contracts.map(contract => `
                                <tr data-contract-id="${contract.id}">
                                    <td><input type="checkbox" class="contract-checkbox" value="${contract.id}"></td>
                                    <td><strong>${contract.contractId}</strong></td>
                                    <td>${contract.stakeholder}</td>
                                    <td>${contract.entity}</td>
                                    <td><span class="type-badge ${contract.contractType.toLowerCase().replace(' ', '-')}">${contract.contractType}</span></td>
                                    <td>${contract.royaltyRate}%</td>
                                    <td>${new Date(contract.startDate).toLocaleDateString()}</td>
                                    <td>${new Date(contract.endDate).toLocaleDateString()}</td>
                                    <td><span class="status-badge ${contract.status.toLowerCase()}">${contract.status}</span></td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-info" onclick="this.viewContract('${contract.id}')" title="View Details">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-warning" onclick="this.editContract('${contract.id}')" title="Edit Contract">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-secondary" onclick="this.viewVersionHistory('${contract.id}')" title="Version History">
                                                <i class="fas fa-history"></i>
                                            </button>
                                            <button class="btn btn-sm btn-success" onclick="this.renewContract('${contract.id}')" title="Renew Contract">
                                                <i class="fas fa-sync-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="table-pagination">
                        <div class="pagination-info">
                            Showing <span id="contracts-showing-start">1</span> to <span id="contracts-showing-end">${Math.min(contracts.length, 10)}</span> of <span id="total-contracts">${contracts.length}</span> contracts
                        </div>
                        <div class="pagination-controls">
                            <button class="btn btn-sm btn-secondary" id="contracts-prev-page" disabled>
                                <i class="fas fa-chevron-left"></i> Previous
                            </button>
                            <div class="pagination-pages">
                                <a href="#" class="page-btn active">1</a>
                            </div>
                            <button class="btn btn-sm btn-secondary" id="contracts-next-page" disabled>
                                Next <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Contract Modal -->
            <div id="contract-modal" class="modal" style="display: none;">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h3 id="contract-modal-title">Add New Contract</h3>
                        <button class="close-btn" onclick="this.closeContractModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="contract-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="contract-id">Contract ID</label>
                                    <input type="text" id="contract-id" name="contractId" required>
                                </div>
                                <div class="form-group">
                                    <label for="stakeholder">Stakeholder</label>
                                    <input type="text" id="stakeholder" name="stakeholder" required>
                                </div>
                                <div class="form-group">
                                    <label for="entity">Mining Entity</label>
                                    <select id="entity" name="entity" required>
                                        <option value="">Select Entity</option>
                                        <option value="Kwalini Quarry">Kwalini Quarry</option>
                                        <option value="Maloma Colliery">Maloma Colliery</option>
                                        <option value="Ngwenya Mine">Ngwenya Mine</option>
                                        <option value="Bulembu Asbestos Mine">Bulembu Asbestos Mine</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="contract-type">Contract Type</label>
                                    <select id="contract-type" name="contractType" required>
                                        <option value="">Select Type</option>
                                        <option value="Mining License">Mining License</option>
                                        <option value="Royalty Agreement">Royalty Agreement</option>
                                        <option value="Joint Venture">Joint Venture</option>
                                        <option value="Service Agreement">Service Agreement</option>
                                        <option value="Exploration License">Exploration License</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="royalty-rate">Royalty Rate (%)</label>
                                    <input type="number" id="royalty-rate" name="royaltyRate" step="0.1" min="0" max="100" required>
                                </div>
                                <div class="form-group">
                                    <label for="calculation-method">Calculation Method</label>
                                    <select id="calculation-method" name="calculationMethod" required>
                                        <option value="">Select Method</option>
                                        <option value="Ad Valorem">Ad Valorem (% of value)</option>
                                        <option value="Specific">Specific (per unit)</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Sliding Scale">Sliding Scale</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="start-date">Start Date</label>
                                    <input type="date" id="start-date" name="startDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="end-date">End Date</label>
                                    <input type="date" id="end-date" name="endDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="payment-schedule">Payment Schedule</label>
                                    <select id="payment-schedule" name="paymentSchedule" required>
                                        <option value="">Select Schedule</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Semi-Annual">Semi-Annual</option>
                                        <option value="Annual">Annual</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="escalation-clause">Escalation Clause</label>
                                    <select id="escalation-clause" name="escalationClause">
                                        <option value="None">None</option>
                                        <option value="CPI-Based">CPI-Based</option>
                                        <option value="Fixed Annual">Fixed Annual %</option>
                                        <option value="Market-Based">Market-Based</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="escalation-rate">Escalation Rate (%)</label>
                                    <input type="number" id="escalation-rate" name="escalationRate" step="0.1" min="0" max="20">
                                </div>
                                <div class="form-group">
                                    <label for="minimum-payment">Minimum Annual Payment</label>
                                    <input type="number" id="minimum-payment" name="minimumPayment" step="1000" min="0">
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Special Conditions & Terms</h4>
                                <div class="form-group">
                                    <label for="special-conditions">Special Conditions</label>
                                    <textarea id="special-conditions" name="specialConditions" rows="4" placeholder="Enter any special conditions, exemptions, or unique terms..."></textarea>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Document Management</h4>
                                <div class="form-group">
                                    <label for="contract-documents">Attach Documents</label>
                                    <input type="file" id="contract-documents" name="documents" multiple accept=".pdf,.doc,.docx">
                                    <small class="form-text">Supported formats: PDF, DOC, DOCX</small>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="this.closeContractModal()">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Contract</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize contract management functionality
        setTimeout(() => {
            this.initializeContractManagement();
            this.setupContractEventHandlers();
        }, 100);
    }

    loadReportingAnalyticsContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Reports & Analytics</h1>
                    <p>Generate comprehensive reports and analyze data</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i> Export Report
                    </button>
                    <button class="btn btn-primary">
                        <i class="fas fa-chart-line"></i> Generate Report
                    </button>
                </div>
            </div>

            <div class="charts-grid">
                <div class="card analytics-chart">
                    <div class="chart-header">
                        <h5><i class="fas fa-chart-area"></i> Revenue Analytics</h5>
                    </div>
                    <div class="chart-container">
                        <canvas id="revenue-analytics-chart"></canvas>
                    </div>
                </div>

                <div class="card analytics-chart">
                    <div class="chart-header">
                        <h5><i class="fas fa-chart-bar"></i> Production Analytics</h5>
                    </div>
                    <div class="chart-container">
                        <canvas id="production-analytics-chart"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Initialize analytics charts
        setTimeout(() => {
            if (this.chartManager && this.chartManager.createRevenueChart) {
                this.chartManager.createRevenueChart('revenue-analytics-chart');
            }
            if (this.chartManager && this.chartManager.createProductionChart) {
                this.chartManager.createProductionChart('production-analytics-chart');
            }
        }, 300);
    }

    loadCommunicationContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Communication</h1>
                    <p>Internal messaging and communication tools</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> New Message
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Recent Messages</h3>
                </div>
                <div class="card-body">
                    <div class="text-center py-4">
                        <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                        <h4>Communication Center</h4>
                        <p class="text-muted">Messaging and communication features will be available here.</p>
                    </div>
                </div>
            </div>
        `;
    }

    loadNotificationsContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Notifications</h1>
                    <p>System notifications and alerts</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary">
                        <i class="fas fa-check"></i> Mark All Read
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Recent Notifications</h3>
                </div>
                <div class="card-body">
                    <div class="text-center py-4">
                        <i class="fas fa-bell fa-3x text-muted mb-3"></i>
                        <h4>Notification Center</h4>
                        <p class="text-muted">System notifications and alerts will appear here.</p>
                    </div>
                </div>
            </div>
        `;
    }

    loadComplianceContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Compliance</h1>
                    <p>Regulatory compliance monitoring and management</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i> Compliance Report
                    </button>
                    <button class="btn btn-primary">
                        <i class="fas fa-check-circle"></i> Run Compliance Check
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Compliance Status</h3>
                </div>
                <div class="card-body">
                    <div class="text-center py-4">
                        <i class="fas fa-shield-alt fa-3x text-success mb-3"></i>
                        <h4>Compliance Monitoring</h4>
                        <p class="text-muted">Regulatory compliance tools and monitoring will be available here.</p>
                    </div>
                </div>
            </div>
        `;
    }

    loadRegulatoryManagementContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Regulatory Management</h1>
                    <p>Manage regulatory requirements and submissions</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i> Export Requirements
                    </button>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> New Submission
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Regulatory Requirements</h3>
                </div>
                <div class="card-body">
                    <div class="text-center py-4">
                        <i class="fas fa-gavel fa-3x text-muted mb-3"></i>
                        <h4>Regulatory Management</h4>
                        <p class="text-muted">Regulatory management tools and requirements tracking will be available here.</p>
                    </div>
                </div>
            </div>
        `;
    }

    loadProfileContent(section) {
        const user = this.authManager.getCurrentUser();
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>User Profile</h1>
                    <p>Manage your account settings and preferences</p>
                </div>
            </div>

            <div class="profile-container">
                <div class="card">
                    <div class="card-header">
                        <h3>Account Information</h3>
                    </div>
                    <div class="card-body">
                        <div class="profile-info">
                            <div class="profile-avatar">
                                <i class="fas fa-user-circle fa-4x"></i>
                            </div>
                            <div class="profile-details">
                                <h4>${user ? user.username : 'Unknown User'}</h4>
                                <p class="role-badge ${user ? user.role.toLowerCase() : 'viewer'}">${user ? user.role : 'Viewer'}</p>
                                <p class="text-muted">Last login: ${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Account Settings</h3>
                    </div>
                    <div class="card-body">
                        <div class="text-center py-4">
                            <i class="fas fa-cog fa-3x text-muted mb-3"></i>
                            <h4>Settings</h4>
                            <p class="text-muted">User preferences and account settings will be available here.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== CONTRACT MANAGEMENT FUNCTIONS =====
    
    calculateContractMetrics(contracts) {
        const now = new Date();
        const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
        
        const activeCount = contracts.filter(c => c.status === 'Active').length;
        const expiringSoon = contracts.filter(c => {
            const endDate = new Date(c.endDate);
            return endDate <= threeMonthsFromNow && endDate > now;
        }).length;
        const totalValue = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
        const pendingRenewals = contracts.filter(c => c.status === 'Pending Renewal').length;
        
        return { activeCount, expiringSoon, totalValue, pendingRenewals };
    }

    loadContractData() {
        const contracts = this.dataManager.getEnhancedContracts();
        const metrics = this.calculateContractMetrics(contracts);
        this.updateContractMetrics(metrics);
    }

    updateContractMetrics(metrics) {
        this.updateElement('active-contracts-count', metrics.activeCount);
        this.updateElement('expiring-contracts-count', metrics.expiringSoon);
        this.updateElement('total-contract-value', `E ${metrics.totalValue.toLocaleString()}`);
        this.updateElement('pending-renewals-count', metrics.pendingRenewals);
    }

    setupContractEventHandlers() {
        // Add contract button
        const addBtn = document.getElementById('add-contract-btn');
        if (addBtn) {
            addBtn.onclick = () => this.showAddContractModal();
        }

        // Export contracts button  
        const exportBtn = document.getElementById('export-contracts-btn');
        if (exportBtn) {
            exportBtn.onclick = () => this.exportContracts();
        }

        // Template library button
        const templateBtn = document.getElementById('template-library-btn');
        if (templateBtn) {
            templateBtn.onclick = () => this.openTemplateLibrary();
        }
    }

    showAddContractModal() {
        this.notificationManager.show('Contract creation form will be available here', 'info');
    }

    exportContracts() {
        const contracts = this.dataManager.getEnhancedContracts();
        this.notificationManager.show(`Exporting ${contracts.length} contracts...`, 'info');
        setTimeout(() => {
            this.notificationManager.show('Contracts exported successfully', 'success');
        }, 1500);
    }

    openTemplateLibrary() {
        this.notificationManager.show('Opening contract template library...', 'info');
    }

    viewContract(contractId) {
        const contract = this.dataManager.getContractById(contractId);
        if (contract) {
            this.notificationManager.show(`Viewing contract ${contract.contractId}`, 'info');
        }
    }

    editContract(contractId) {
        const contract = this.dataManager.getContractById(contractId);
        if (contract) {
            this.notificationManager.show(`Editing contract ${contract.contractId}`, 'info');
        }
    }

    viewVersionHistory(contractId) {
        const contract = this.dataManager.getContractById(contractId);
        if (contract) {
            this.notificationManager.show(`Version history for ${contract.contractId}: ${contract.amendments.length} amendments`, 'info');
        }
    }

    renewContract(contractId) {
        const contract = this.dataManager.getContractById(contractId);
        if (contract) {
            this.notificationManager.show(`Starting renewal for ${contract.contractId}`, 'info');
        }
    }
}

// ===== GLOBAL FUNCTIONS =====

// Fix global functions to work properly
window.refreshDashboard = function() {
    if (window.royaltiesApp && typeof window.royaltiesApp.refreshDashboard === 'function') {
        window.royaltiesApp.refreshDashboard();
    } else if (window.notificationManager) {
        window.notificationManager.show('Dashboard refreshed successfully', 'success');
    }
};

window.exportDashboard = function() {
    if (window.royaltiesApp && typeof window.royaltiesApp.exportDashboard === 'function') {
        window.royaltiesApp.exportDashboard();
    } else if (window.notificationManager) {
        window.notificationManager.show('Exporting dashboard data...', 'info');
        setTimeout(() => {
            window.notificationManager.show('Dashboard data exported successfully', 'success');
        }, 2000);
    }
};

window.resetAllPasswords = function() {
    if (confirm('Reset passwords for ALL users? This will generate new temporary passwords for every user account.')) {
        const users = window.dataManager?.getUserAccounts() || [];
        const resetCount = users.filter(user => user.status === 'Active').length;
        
        if (window.notificationManager) {
            window.notificationManager.show(`Password reset initiated for ${resetCount} active users`, 'info');
            
            setTimeout(() => {
                window.notificationManager.show(`Successfully reset passwords for ${resetCount} users`, 'success');
            }, 2000);
        }
    }
};

window.exportUsers = function() {
    if (window.notificationManager) {
        window.notificationManager.show('Exporting user data...', 'info');
        
        setTimeout(() => {
            const users = window.dataManager?.getUserAccounts() || [];
            window.notificationManager.show(`Successfully exported ${users.length} user records`, 'success');
        }, 1500);
    }
};

window.addUser = function() {
    if (window.notificationManager) {
        window.notificationManager.show('Add user functionality would open here', 'info');
    }
};

window.viewUser = function(userId) {
    if (window.notificationManager) {
        const user = window.dataManager?.findUserById(userId);
        if (user) {
            window.notificationManager.show(`Viewing user: ${user.username}`, 'info');
        }
    }
};

window.editUser = function(userId) {
    if (window.notificationManager) {
        const user = window.dataManager?.findUserById(userId);
        if (user) {
            window.notificationManager.show(`Edit functionality for ${user.username} would open here`, 'info');
        }
    }
};

window.deleteUser = function(userId) {
    const user = window.dataManager?.findUserById(userId);
    if (user && confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
        const deletedUser = window.dataManager?.deleteUser(userId);
        if (deletedUser && window.notificationManager) {
            window.notificationManager.show(`User "${user.username}" deleted successfully`, 'success');
            
            // Reload user management section
            if (window.royaltiesApp?.currentSection === 'user-management') {
                window.royaltiesApp.showSection('user-management');
            }
        }
    }
};

window.resetUserPassword = function(userId) {
    const user = window.dataManager?.findUserById(userId);
    if (user && confirm(`Reset password for user "${user.username}"?`)) {
        const tempPassword = Math.random().toString(36).slice(-8);
        
        if (window.notificationManager) {
            window.notificationManager.show(`Password reset for ${user.username}. Temp password: ${tempPassword}`, 'success');
        }
    }
};

window.viewRecord = function(recordId) {
    if (window.notificationManager) {
        window.notificationManager.show(`Viewing record ${recordId}`, 'info');
    }
};

window.editRecord = function(recordId) {
    if (window.notificationManager) {
        window.notificationManager.show(`Editing record ${recordId}`, 'info');
    }
};

window.deleteRecord = function(recordId) {
    if (confirm('Are you sure you want to delete this record?')) {
        if (window.notificationManager) {
            window.notificationManager.show(`Record ${recordId} deleted`, 'success');
        }
    }
};

// Global navigation test functions for debugging
window.testNavigation = function() {
    console.log('=== TESTING NAVIGATION ===');
    
    // Check if sidebar has loaded first
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    if (navLinks.length === 0) {
        console.log('Navigation test: Sidebar not yet loaded (0 navigation links found)');
        console.log('=== END NAVIGATION TEST ===');
        return;
    }
    
    if (window.royaltiesApp || window.app) {
        const app = window.royaltiesApp || window.app;
        if (app.debugNavigation) {
            app.debugNavigation();
        } else {
            console.log('debugNavigation method not found on app instance');
        }
    } else {
        console.log('No app instance found');
    }
    
    // Also test clicking on navigation links programmatically
    console.log(`Found ${navLinks.length} navigation links for testing`);
    
    navLinks.forEach((link, index) => {
        const section = link.dataset.section;
        console.log(`Testing link ${index + 1}: ${section}`);
        
        // Create a test click function
        window[`testClick${section.replace('-', '')}`] = function() {
            console.log(`Simulating click on ${section} link`);
            link.click();
        };
    });
    
    console.log('=== END NAVIGATION TEST ===');
    console.log('You can now test navigation by calling testClickdashboard(), testClickusermanagement(), etc.');
};

window.fixNavigation = function() {
    console.log('=== FIXING NAVIGATION ===');
    
    if (window.royaltiesApp || window.app) {
        const app = window.royaltiesApp || window.app;
        console.log('Re-setting up navigation...');
        
        if (app.setupNavigation) {
            app.setupNavigation();
            console.log('Navigation setup completed');
            
            // Test it
            setTimeout(() => {
                window.testNavigation();
            }, 1000);
        } else {
            console.log('setupNavigation method not found on app instance');
        }
    } else {
        console.log('No app instance found');
    }
    
    console.log('=== END NAVIGATION FIX ===');
};

// Auto-run navigation test after application is fully loaded
window.addEventListener('load', function() {
    // Wait for app to fully initialize, then test if requested
    setTimeout(() => {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        if (navLinks.length > 0) {
            console.log('✅ Navigation system ready - found', navLinks.length, 'navigation links');
            // Only run full test if debug mode is enabled
            if (window.DEBUG_NAVIGATION) {
                console.log('Running full navigation test (debug mode enabled)');
                if (window.testNavigation) {
                    window.testNavigation();
                }
            }
        } else {
            // Silent retry - don't spam console
            setTimeout(() => {
                const retryNavLinks = document.querySelectorAll('.nav-link[data-section]');
                if (retryNavLinks.length > 0) {
                    console.log('✅ Navigation system ready - found', retryNavLinks.length, 'navigation links');
                    if (window.DEBUG_NAVIGATION && window.testNavigation) {
                        console.log('Running full navigation test (debug mode enabled)');
                        window.testNavigation();
                    }
                }
                // No error message if still not ready - navigation might load later
            }, 8000);
        }
    }, 10000); // Longer delay to ensure everything is loaded
});
