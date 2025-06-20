// Mining Royalties Manager - Main Application Entry Point

import { DataManager } from './core/DataManager.js';
import { EventManager } from './core/EventManager.js';
import { ComponentLoader } from './utils/ComponentLoader.js';
import { AuditDashboardController } from './controllers/auditDashboardController.js';

// Global application state
let currentUser = null;

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
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => section.style.display = 'none');

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            this.updateNavigationState(sectionId);
            
            // Load component asynchronously
            const loaded = await this.componentLoader.loadComponent(sectionId, targetSection);
            if (loaded) {
                this.initializeComponent(sectionId);
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

    // ...existing code...
}

// Enhanced Chart Manager Class
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
    getMinerals() {
        // Return default minerals if not initialized
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
    window.royaltiesApp = app; // Make globally available
    app.initialize();
    
    console.log('Application initialized');
    
    // Make sure to initialize other controllers or components here
    // ...existing code...
});

// This adds support for the Audit Dashboard section

document.addEventListener('DOMContentLoaded', function() {
    // Register event handlers for audit dashboard functionality
    document.addEventListener('loadAuditDashboard', handleLoadAuditDashboard);

    // Setup global audit dashboard functions
    window.viewAuditDetails = viewAuditDetails;
    window.runSecurityScan = runSecurityScan;
    window.refreshAuditEvents = refreshAuditEvents;
    window.investigateFailedLogin = investigateFailedLogin;
    window.blockIpAddress = blockIpAddress;
    window.investigateIp = investigateIp;
    window.contactUser = contactUser;
    window.reviewUserActivity = reviewUserActivity;
    window.reviewExport = reviewExport;
    window.acknowledgeAllAlerts = acknowledgeAllAlerts;
    window.exportAuditData = exportAuditData;
});

async function handleLoadAuditDashboard(event) {
    try {
        console.log('Loading audit dashboard...');
        const section = document.getElementById('audit-dashboard');
        
        if (!section) {
            console.error('Audit dashboard section element not found');
            return;
        }

        // Check if we already have a section manager for audit-dashboard
        if (window.royaltiesApp && 
            window.royaltiesApp.sectionManagers && 
            window.royaltiesApp.sectionManagers.has('audit-dashboard')) {
            
            const manager = window.royaltiesApp.sectionManagers.get('audit-dashboard');
            if (manager && typeof manager.loadSection === 'function') {
                await manager.loadSection();
                return;
            }
        }
        
        // Try to load the component
        try {
            // First try to load from component
            const response = await fetch('components/audit-dashboard.html');
            if (response.ok) {
                const html = await response.text();
                section.innerHTML = html;
                setupAuditDashboardEventListeners();
                loadAuditData();
                return;
            }
        } catch (err) {
            console.warn('Could not load audit dashboard component:', err);
        }
        
        // Fallback content
        loadFallbackAuditDashboard(section);
    } catch (error) {
        console.error('Error handling audit dashboard loading:', error);
        if (window.notificationManager) {
            window.notificationManager.show('Error loading audit dashboard', 'error');
        }
    }
}

function loadFallbackAuditDashboard(section) {
    // Implementation of fallback audit dashboard
    section.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Audit Dashboard</h1>
                <p>System audit trail and security monitoring</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-info" id="refresh-audit-btn">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
                <button class="btn btn-success" id="export-audit-btn">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <p>The audit dashboard is loading or unavailable. Please try refreshing the page.</p>
                <button class="btn btn-primary" id="retry-audit-btn">
                    <i class="fas fa-redo"></i> Retry Loading Audit Dashboard
                </button>
            </div>
        </div>
    `;

    const retryBtn = document.getElementById('retry-audit-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('loadAuditDashboard'));
        });
    }
}

function setupAuditDashboardEventListeners() {
    // Setup event handlers for audit dashboard UI elements
    const dateRangeSelect = document.getElementById('audit-date-range');
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                document.getElementById('custom-date-range-container').style.display = 'block';
            } else {
                document.getElementById('custom-date-range-container').style.display = 'none';
                updateAuditDisplay(this.value);
            }
        });
    }
    
    const refreshBtn = document.getElementById('refresh-audit-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshAuditEvents);
    }
    
    const exportBtn = document.getElementById('export-audit-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportAuditData('CSV'));
    }
    
    const applyFiltersBtn = document.getElementById('apply-audit-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyAuditFilters);
    }
    
    const resetFiltersBtn = document.getElementById('reset-audit-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetAuditFilters);
    }
    
    const securityScanBtn = document.getElementById('security-scan-btn');
    if (securityScanBtn) {
        securityScanBtn.addEventListener('click', runSecurityScan);
    }
    
    const acknowledgeAllBtn = document.getElementById('acknowledge-all-btn');
    if (acknowledgeAllBtn) {
        acknowledgeAllBtn.addEventListener('click', acknowledgeAllAlerts);
    }
    
    // Add event listeners to pagination controls
    setupPaginationHandlers();
}

function loadAuditData() {
    // Function to load audit data from the data manager
    if (!window.dataManager) {
        console.warn('Data manager not available for audit dashboard');
        return;
    }
    
    try {
        updateAuditMetrics();
        updateAuditEventsTable();
    } catch (error) {
        console.error('Error loading audit data:', error);
    }
}

function updateAuditMetrics() {
    // Update audit metrics based on available data
    const auditLog = window.dataManager?.getAuditLog() || [];
    
    // Update UI elements with audit metrics
    document.getElementById('active-users-24h').textContent = Math.min(auditLog.length, 12);
    document.getElementById('login-attempts').textContent = auditLog.filter(entry => 
        entry.action === 'Login' || entry.action === 'Failed Login'
    ).length;
    document.getElementById('data-access-events').textContent = auditLog.filter(entry => 
        entry.action.includes('Data') || entry.action.includes('Record')
    ).length;
}

function updateAuditEventsTable(page = 1, pageSize = 10) {
    // Update audit events table with data
    const auditLog = window.dataManager?.getAuditLog() || [];
    const tableBody = document.getElementById('audit-events-table');
    
    if (!tableBody) return;
    
    if (auditLog.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No audit events available</td></tr>';
        return;
    }
    
    // Sort by most recent first
    const sortedEvents = [...auditLog].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Paginate
    const start = (page - 1) * pageSize;
    const paginatedEvents = sortedEvents.slice(start, start + pageSize);
    
    // Render table rows
    tableBody.innerHTML = paginatedEvents.map(event => `
        <tr>
            <td>${new Date(event.timestamp).toLocaleString()}</td>
            <td>${event.user || 'System'}</td>
            <td>${event.action}</td>
            <td>${event.target}</td>
            <td>${event.ipAddress || '192.168.1.100'}</td>
            <td><span class="status-badge ${event.status === 'Success' ? 'paid' : 'overdue'}">${event.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewAuditDetails(${event.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Update pagination controls
    updatePaginationControls(page, Math.ceil(sortedEvents.length / pageSize));
}

// Global functions for audit dashboard
function viewAuditDetails(eventId) {
    if (window.notificationManager) {
        window.notificationManager.show(`Viewing details for audit event ${eventId}`, 'info');
    }
}

function runSecurityScan() {
    if (window.notificationManager) {
        window.notificationManager.show('Running comprehensive security scan...', 'info');
        setTimeout(() => {
            window.notificationManager.show('Security scan completed - 2 issues found', 'warning');
        }, 3000);
    }
}

function refreshAuditEvents() {
    if (window.notificationManager) {
        window.notificationManager.show('Refreshing audit events...', 'info');
    }
    loadAuditData();
}

function investigateFailedLogin(eventId) {
    if (window.notificationManager) {
        window.notificationManager.show(`Investigating failed login attempt ${eventId}`, 'warning');
    }
}

function blockIpAddress(ip) {
    if (confirm(`Are you sure you want to block IP address ${ip}?`)) {
        if (window.notificationManager) {
            window.notificationManager.show(`IP address ${ip} has been blocked`, 'success');
        }
    }
}

function investigateIp(ip) {
    if (window.notificationManager) {
        window.notificationManager.show(`Opening investigation for IP ${ip}`, 'info');
    }
}

function contactUser(username) {
    if (window.notificationManager) {
        window.notificationManager.show(`Contacting user ${username}...`, 'info');
    }
}

function reviewUserActivity(username) {
    if (window.notificationManager) {
        window.notificationManager.show(`Reviewing activity for user ${username}`, 'info');
    }
}

function reviewExport(username, exportId) {
    if (window.notificationManager) {
        window.notificationManager.show(`Reviewing export ${exportId} by ${username}`, 'info');
    }
}

function acknowledgeAllAlerts() {
    if (confirm('Are you sure you want to acknowledge all security alerts?')) {
        if (window.notificationManager) {
            window.notificationManager.show('All security alerts acknowledged', 'success');
        }
    }
}

function exportAuditData(format) {
    if (window.notificationManager) {
        window.notificationManager.show(`Exporting audit data in ${format} format...`, 'info');
    }
    
    setTimeout(() => {
        if (window.notificationManager) {
            window.notificationManager.show(`Audit data exported successfully as ${format}`, 'success');
        }
    }, 1500);
}

function setupPaginationHandlers() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageSizeSelect = document.getElementById('page-size');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const currentPage = parseInt(document.getElementById('page-indicator').textContent.split(' ')[1]);
            if (currentPage > 1) {
                updateAuditEventsTable(currentPage - 1, parseInt(pageSizeSelect.value));
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const currentPage = parseInt(document.getElementById('page-indicator').textContent.split(' ')[1]);
            const totalPages = parseInt(document.getElementById('page-indicator').textContent.split(' ')[3]);
            if (currentPage < totalPages) {
                updateAuditEventsTable(currentPage + 1, parseInt(pageSizeSelect.value));
            }
        });
    }
    
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', () => {
            updateAuditEventsTable(1, parseInt(pageSizeSelect.value));
        });
    }
}

function updatePaginationControls(currentPage, totalPages) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    
    if (pageIndicator) {
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}

function applyAuditFilters() {
    const dateRange = document.getElementById('audit-date-range').value;
    const userFilter = document.getElementById('audit-user-filter').value;
    const actionFilter = document.getElementById('audit-action-filter').value;
    
    if (window.notificationManager) {
        window.notificationManager.show('Applying audit filters...', 'info');
    }
    
    // In a real application, implement filtering logic here
    updateAuditDisplay(dateRange);
}

function resetAuditFilters() {
    document.getElementById('audit-date-range').value = 'week';
    document.getElementById('audit-user-filter').value = 'all';
    document.getElementById('audit-action-filter').value = 'all';
    document.getElementById('custom-date-range-container').style.display = 'none';
    
    if (window.notificationManager) {
        window.notificationManager.show('Audit filters reset', 'info');
    }
    
    updateAuditDisplay('week');
}

function updateAuditDisplay(dateRange) {
    // Implement display update based on date range
    if (window.notificationManager) {
        window.notificationManager.show(`Updated to show ${dateRange} data`, 'info');
    }
    
    // Update the displayed data
    loadAuditData();
}