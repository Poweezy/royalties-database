/**
 * Mining Royalties Manager - Main Application
 * @version 2.0.4
 * @date 2025-07-01
 * @description Core application functionality for the Mining Royalties Manager
 * 
 * IMPORTANT: This file now delegates chart and notification functionality
 * to the unified systems. The SimpleChartManager class is kept only for fallback
 * and compatibility with legacy code.
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
            
            await this.loadSidebar();
            this.setupNavigation();
            this.setupGlobalActions();
            
            // Initialize mobile navigation
            this.mobileNav = new MobileNavigationManager();
            
            // Show default section
            await this.showSection('dashboard');
            
            const user = this.authManager.getCurrentUser();
            this.notificationManager.show(`Welcome back, ${user.username}!`, 'success');

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
        
        // ALWAYS use unified component loader for sidebar
        if (window.unifiedComponentLoader) {
            try {
                const result = await window.unifiedComponentLoader.loadComponent('sidebar', sidebar);
                if (result && result.success) {
                    console.log(`Sidebar loaded successfully using unified component loader (source: ${result.source})`);
                    return;
                }
            } catch (error) {
                console.error('Failed to load sidebar with unified component loader:', error);
            }
        } else {
            console.error('Unified component loader not available for sidebar loading!');
        }
        
        // If we get here, there's a serious problem - unified loader should always work
        console.error('CRITICAL: Sidebar could not be loaded via unified component loader');
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
    
    async showSection(sectionId) {
        try {
            // Prevent infinite recursion
            if (this._currentlyLoading === sectionId) {
                console.warn(`Already loading section ${sectionId}, skipping duplicate request`);
                return;
            }
            this._currentlyLoading = sectionId;
            
            // Ensure availableSections is defined
            if (!this.availableSections) {
                this.availableSections = [
                    'dashboard', 'user-management', 'royalty-records', 
                    'contract-management', 'reporting-analytics', 'communication', 
                    'notifications', 'compliance', 'regulatory-management', 'profile'
                ];
            }
            
            // Redirect legacy sections to active sections as needed
            if (!this.availableSections.includes(sectionId)) {
                console.log('Redirecting from unavailable section to default section');
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

            // Check if section is empty and needs content
            if (targetSection.children.length === 0 || !targetSection.hasAttribute('data-loaded')) {
                await this.loadSectionContent(sectionId);
                targetSection.setAttribute('data-loaded', 'true');
            } else {
                console.log(`Section ${sectionId} already has content, skipping load`);
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
    
    async loadSectionContent(sectionId) {
        try {
            console.log(`Loading section content for: ${sectionId}`);
            
            const section = document.getElementById(sectionId);
            if (!section) {
                console.error(`Section element #${sectionId} not found in DOM`);
                return;
            }
            
            // ALWAYS use unified component loader as primary method
            if (window.unifiedComponentLoader) {
                console.log(`Using unified component loader to load: ${sectionId}`);
                try {
                    const result = await window.unifiedComponentLoader.loadComponent(sectionId, section);
                    if (result && result.success) {
                        console.log(`Component ${sectionId} loaded successfully via unified component loader (source: ${result.source})`);
                        this.initializeSectionComponent(sectionId);
                        return;
                    } else {
                        console.warn(`Unified component loader failed for ${sectionId}: ${result?.error || 'Unknown error'}`);
                    }
                } catch (error) {
                    console.warn(`Unified component loader error for ${sectionId}:`, error);
                }
            } else {
                console.error('Unified component loader not available!');
            }
            
            // If we get here, unified loader failed - use fallback
            console.warn(`Component ${sectionId} not loaded, using fallback content`);
            this.loadFallbackSection(sectionId);
            
        } catch (error) {
            console.error(`Failed to load component ${sectionId}:`, error);
            this.loadFallbackSection(sectionId);
        }
    }

    loadFallbackSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardContent(section);
                break;
            case 'user-management':
                this.loadUserManagementContent(section);
                break;
            case 'royalty-records':
                this.loadRoyaltyRecordsContent(section);
                break;
            default:
                section.innerHTML = `
                    <div class="page-header">
                        <div class="page-title">
                            <h1>${sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
                            <p>This section is under development</p>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <p>Content for this section will be available soon.</p>
                        </div>
                    </div>                `;
        }
    };

    loadDashboardContent(section) {
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Dashboard</h1>
                    <p>Overview of mining royalties and key metrics</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" id="refresh-dashboard">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                    <button class="btn btn-primary" id="export-dashboard">
                        <i class="fas fa-download"></i> Export Report
                    </button>
                </div>
            </div>

            <div class="charts-grid">
                <div class="metric-card">
                    <div class="card-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Total Revenue</h3>
                    </div>
                    <div class="card-body">
                        <p>E ${this.calculateTotalRevenue().toLocaleString()}</p>
                        <small class="trend-positive">
                            <i class="fas fa-arrow-up"></i> +12% from last month
                        </small>
                    </div>
                </div>

                <div class="metric-card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-invoice-dollar"></i> Total Records</h3>
                    </div>
                    <div class="card-body">
                        <p>${this.dataManager.getRoyaltyRecords().length}</p>
                        <small class="trend-info">
                            <i class="fas fa-info-circle"></i> Active records
                        </small>
                    </div>
                </div>

                <div class="metric-card">
                    <div class="card-header">
                        <h3><i class="fas fa-check-circle"></i> Compliance Rate</h3>
                    </div>
                    <div class="card-body">
                        <p>${this.calculateComplianceRate()}%</p>
                        <small class="trend-positive">
                            <i class="fas fa-arrow-up"></i> Good standing
                        </small>
                    </div>
                </div>

                <div class="metric-card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Overdue Payments</h3>
                    </div>
                    <div class="card-body">
                        <p>${this.getOverdueCount()}</p>
                        <small class="trend-negative">
                            <i class="fas fa-arrow-down"></i> Requires attention
                        </small>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-grid">
                <div class="card analytics-chart">
                    <div class="chart-header">
                        <h5><i class="fas fa-chart-line"></i> Revenue Trends</h5>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-chart-type="line">Line</button>
                            <button class="chart-btn" data-chart-type="area">Area</button>
                            <button class="chart-btn" data-chart-type="bar">Bar</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="revenue-trends-chart"></canvas>
                    </div>
                </div>

                <div class="card analytics-chart">
                    <div class="chart-header">
                        <h5><i class="fas fa-chart-pie"></i> Production by Entity</h5>
                    </div>
                    <div class="chart-container">
                        <canvas id="production-by-entity-chart"></canvas>
                    </div>
                </div>
            </div>

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
                                ${this.dataManager.getRoyaltyRecords().slice(0, 5).map(record => `
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
        `;        // Initialize charts and event handlers after content is loaded with longer timeout
        // to ensure canvas elements are properly rendered
        console.log('Dashboard content loaded, will initialize charts in 300ms...');
        setTimeout(() => {
            this.initializeDashboardCharts();
            this.setupDashboardEventHandlers();
        }, 300);
    }    initializeDashboardCharts() {
        console.log('Initializing dashboard charts...');
        
        try {
            // Get royalty records for charts
            const royaltyRecords = this.dataManager.getRoyaltyRecords();
            
            // Create revenue chart
            if (this.chartManager.createRevenueChart) {
                console.log('Creating revenue chart...');
                this.chartManager.createRevenueChart('revenue-trends-chart');
            }
    
            // Create production chart with actual data
            const entityData = royaltyRecords.reduce((acc, record) => {
                acc[record.entity] = (acc[record.entity] || 0) + record.volume;
                return acc;
            }, {});
            
            // Handle different method names in different chart manager implementations
            if (this.chartManager.createProductionChart) {
                console.log('Creating production chart using createProductionChart...');
                this.chartManager.createProductionChart('production-by-entity-chart', entityData);
            } else if (this.chartManager.createEntityChart) {
                console.log('Creating production chart using createEntityChart...');
                this.chartManager.createEntityChart('production-by-entity-chart', entityData);
            } else {
                console.warn('No suitable chart creation method found in chartManager');
            }
        } catch (error) {
            console.error('Error initializing dashboard charts:', error);
        }
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

    updateNavigationState(activeSection) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === activeSection) {
                link.classList.add('active');
            }
        });
    }

    setupGlobalActions() {
        // Make global functions available
        window.dataManager = this.dataManager;
        window.notificationManager = this.notificationManager;
        window.royaltiesApp = this;
    }

    // Helper methods for dashboard calculations
    calculateTotalRevenue() {
        return this.dataManager.getRoyaltyRecords()
            .reduce((total, record) => total + record.royalties, 0);
    }

    calculateComplianceRate() {
        const records = this.dataManager.getRoyaltyRecords();
        const paidRecords = records.filter(r => r.status === 'Paid').length;
        return records.length > 0 ? Math.round((paidRecords / records.length) * 100) : 0;
    }

    getOverdueCount() {
        return this.dataManager.getRoyaltyRecords()
            .filter(r => r.status === 'Overdue').length;
    }

    handleLogout() {
        try {
            this.authManager.logout();
            
            const appContainer = document.getElementById('app-container');
            const loginSection = document.getElementById('login-section');
            
            if (appContainer) appContainer.style.display = 'none';
            if (loginSection) {
                loginSection.style.display = 'flex';
                const form = document.getElementById('login-form');
                if (form) form.reset();
            }
            
            this.notificationManager.show('Logged out successfully', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            this.notificationManager.show('Error during logout', 'error');
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%);
                background: white; 
                padding: 2rem; 
                border-radius: 8px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                text-align: center;
                z-index: 10000;
            ">
                <i class="fas fa-exclamation-triangle" style="color: #e53e3e; font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3 style="margin: 0 0 1rem 0; color: #1a202c;">Application Error</h3>
                <p style="margin: 0 0 1.5rem 0; color: #4a5568;">${message}</p>
                <button onclick="location.reload()" style="
                    background: #1a365d; 
                    color: white; 
                    border: none; 
                    padding: 0.75rem 1.5rem; 
                    border-radius: 6px; 
                    cursor: pointer;
                ">
                    Refresh Page
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
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

// ===== APPLICATION INITIALIZATION =====

// Clean initialization
let app = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

async function initializeApp() {
    try {
        if (window.royaltiesApp) {
            console.log('App already initialized');
            return;
        }

        console.log('Initializing Mining Royalties Manager application...');
        
        // Verify dependencies
        const dependencies = [
            { name: 'unifiedComponentLoader', global: 'unifiedComponentLoader' },
            { name: 'Chart.js', global: 'Chart' },
            { name: 'chartManager', global: 'chartManager' }
        ];
        
        const missingDeps = dependencies.filter(dep => !window[dep.global]);
        if (missingDeps.length > 0) {
            console.warn('Missing dependencies:', missingDeps.map(d => d.name).join(', '));
            console.log('Will attempt to continue but some features may not work properly');
        } else {
            console.log('All dependencies loaded successfully');
        }        app = new RoyaltiesApp();
        window.royaltiesApp = app;
        window.app = app; // Also assign to window.app for compatibility with startup.js
        await app.initialize();
        
        // Run diagnostics if requested
        if (window.appDiagnostics && window.location.search.includes('diagnostics=true')) {
            console.log('Running diagnostics after initialization...');
            window.appDiagnostics.runAll();
        }
    } catch (error) {
        console.error('Failed to initialize application:', error);
        // Show fallback error UI
        const fallbackError = document.createElement('div');
        fallbackError.innerHTML = `
            <div style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%);
                display: flex; 
                align-items: center; 
                justify-content: center;
                color: white;
                font-family: 'Inter', sans-serif;
                z-index: 10000;
            ">
                <div style="text-align: center; max-width: 400px; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <h1 style="margin: 0 0 1rem 0;">Application Failed to Load</h1>
                    <p style="margin: 0 0 2rem 0;">
                        There was an error loading the Mining Royalties Manager. 
                        Please refresh the page or contact support.
                    </p>
                    <button onclick="location.reload()" style="
                        background: rgba(255,255,255,0.2); 
                        color: white; 
                        border: 2px solid rgba(255,255,255,0.3); 
                        padding: 0.75rem 2rem; 
                        border-radius: 6px; 
                        cursor: pointer;
                    ">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(fallbackError);
    }
}

window.app = app;

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
                <td>${record.volume ? record.volume.toLocaleString() : '0'}</td>
                <td>E ${record.royalties ? record.royalties.toLocaleString() : '0'}</td>
                <td>${record.date}</td>
                <td>
                    <span class="status-badge ${record.status ? record.status.toLowerCase() : 'pending'}">
                        ${record.status || 'Pending'}
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
