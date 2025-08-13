/**
 * Mining Royalties Manager - Main Application Module
 * Comprehensive royalty management system for Eswatini mining sector
 * 
 * Features:
 * - User authentication and management
 * - Role-based access control
 * - Royalty records management
 * - Real-time analytics and reporting
 * - Compliance monitoring
 * - Audit trail logging
 */

import { authService } from './services/auth.service.js';
import { dbService } from './services/database.service.js';
import { security } from './utils/security.js';
import { ChartManager } from './modules/ChartManager.js';
import { FileManager } from './modules/FileManager.js';
import { NavigationManager } from './modules/NavigationManager.js';
import { NotificationManager } from './modules/NotificationManager.js';
import { IconManager } from './modules/IconManager.js';
import { ErrorHandler } from './utils/error-handler.js';

class App {
    constructor() {
        // Global application state
        this.state = {
            currentUser: null,
            currentSection: 'dashboard',
            users: [],
            royaltyRecords: [],
            contracts: [],
            auditLog: [],
            notifications: [],
            charts: {},
            isLoading: false,
            settings: {
                recordsPerPage: 10,
                autoSave: true,
                theme: 'light'
            }
        };

        // Initialize modules
        this.notificationManager = new NotificationManager();
        this.errorHandler = new ErrorHandler(this.notificationManager);
        this.chartManager = new ChartManager();
        this.fileManager = new FileManager();
        this.iconManager = new IconManager();
        this.navigationManager = new NavigationManager(this.notificationManager);

        // Initialize app
        this.initializeServices();
        this.setupEventListeners();
        this.setupErrorHandling();
    }

    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        // Suppress browser extension errors
        window.addEventListener('error', (e) => {
            if (e.message.includes('Extension context invalidated') || 
                e.message.includes('message channel closed')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Suppress unhandled promise rejections from extensions
        window.addEventListener('unhandledrejection', (e) => {
            if (e.reason?.message && 
                (e.reason.message.includes('Extension context') || 
                 e.reason.message.includes('message channel'))) {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * Initialize application services
     */
    async initializeServices() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize all services in parallel
            await Promise.all([
                authService.init(),
                dbService.init(),
                this.chartManager.initializeCharts()
            ]);

            // Check authentication state
            if (authService.isAuthenticated) {
                await this.initializeAuthenticatedState();
            } else {
                this.showLogin();
            }
        } catch (error) {
            this.errorHandler.handleError(error);
        } finally {
            this.hideLoadingScreen();
        }
    }

    /**
     * Initialize authenticated state
     */
    async initializeAuthenticatedState() {
        try {
            // Load user data and preferences
            await this.loadUserData();
            
            // Initialize dashboard
            await this.initializeDashboard();
            
            // Show dashboard
            this.showDashboard();
            
            // Start auto-refresh
            this.startAutoRefresh();
        } catch (error) {
            this.errorHandler.handleError(error);
        }
    }

    /**
     * Load user data and preferences
     */
    async loadUserData() {
        try {
            // Get current user from auth service
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('No authenticated user found');
            }

            // Get demo preferences
            const preferences = {
                theme: localStorage.getItem('app_theme') || 'light',
                recordsPerPage: parseInt(localStorage.getItem('records_per_page')) || 10,
                autoSave: localStorage.getItem('auto_save') !== 'false',
                notifications: {
                    email: true,
                    browser: true,
                    desktop: false
                },
                dashboardLayout: localStorage.getItem('dashboard_layout') || 'default'
            };

            this.state.currentUser = currentUser;
            this.state.settings = { ...this.state.settings, ...preferences };

            // Update UI with user info
            this.updateUserInfo();
        } catch (error) {
            console.error('Load user data error:', error);
            throw new Error('Failed to load user data');
        }
    }

    /**
     * Update UI with user information
     */
    updateUserInfo() {
        // Update profile section
        const usernameEl = document.getElementById('profile-username');
        const emailEl = document.getElementById('profile-email');
        const departmentEl = document.getElementById('profile-department');
        
        if (usernameEl) usernameEl.value = this.state.currentUser.username;
        if (emailEl) emailEl.value = this.state.currentUser.email;
        if (departmentEl) departmentEl.value = this.state.currentUser.department;

        // Update user display in header if exists
        const userDisplayEl = document.querySelector('.user-display');
        if (userDisplayEl) {
            userDisplayEl.textContent = this.state.currentUser.username;
        }
    }

    /**
     * Initialize dashboard
     */
    async initializeDashboard() {
        try {
            // Load demo dashboard data
            const royaltyData = {
                totalRoyalties: 2847650.00,
                paidRoyalties: 2135737.50,
                pendingRoyalties: 711912.50,
                yearlyTarget: 3500000.00
            };

            const entityData = {
                totalEntities: 15,
                activeEntities: 12,
                inactiveEntities: 3,
                entityTypes: {
                    mines: 8,
                    quarries: 7
                }
            };

            const complianceData = {
                overallRate: 94,
                compliantEntities: 14,
                nonCompliantEntities: 1,
                upcomingDeadlines: 5
            };

            const recentActivity = [
                { type: 'payment', entity: 'Maloma Colliery', amount: 156000.00, date: '2025-07-30' },
                { type: 'audit', entity: 'Kwalini Quarry', status: 'completed', date: '2025-07-29' },
                { type: 'report', name: 'Q2 Summary', generated: '2025-07-28' }
            ];

            // Update UI with demo data
            this.updateDashboardMetrics(royaltyData, entityData, complianceData);
            this.updateRecentActivity(recentActivity);
            
            // Initialize charts with demo data
            await this.chartManager.initializeCharts({
                royalties: royaltyData,
                entities: entityData,
                compliance: complianceData
            });
            
            // Show success notification
            this.notificationManager.show('Dashboard initialized successfully', 'success');
        } catch (error) {
            throw new Error('Failed to initialize dashboard');
        }
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Login form submission
        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e.target);
        });

        // Navigation events
        document.querySelectorAll('nav a')?.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href').substring(1));
            });
        });

        // Logout
        document.querySelector('a[href="#logout"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            authService.logout();
        });
    }

    /**
     * Handle login form submission
     */
    async handleLogin(form) {
        try {
            const username = form.username.value;
            const password = form.password.value;

            await authService.login(username, password);
            this.showDashboard();
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Invalid username or password');
        }
    }

    /**
     * Navigation handler
     */
    navigate(route) {
        // Hide all sections
        document.querySelectorAll('main > section').forEach(section => {
            section.style.display = 'none';
        });

        // Show requested section
        const section = document.getElementById(route);
        if (section) {
            section.style.display = 'block';
        }

        // Update active navigation state
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${route}`);
        });
    }

    /**
     * UI State Management
     */
    showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'flex';
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'none';
    }

    showLogin() {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        this.navigate('dashboard');
    }

    showError(message) {
        this.notificationManager.show(message, 'error');
    }

    /**
     * Update dashboard metrics
     */
    updateDashboardMetrics(royaltyData, entityData, complianceData) {
        // Update royalty metrics
        const totalRoyaltiesEl = document.getElementById('total-royalties');
        if (totalRoyaltiesEl) {
            totalRoyaltiesEl.textContent = `E ${royaltyData.totalRoyalties.toLocaleString('en-SZ')}`;
        }

        const activeEntitiesEl = document.getElementById('active-entities');
        if (activeEntitiesEl) {
            activeEntitiesEl.textContent = entityData.activeEntities.toString();
        }

        const complianceRateEl = document.getElementById('compliance-rate');
        if (complianceRateEl) {
            complianceRateEl.textContent = `${complianceData.overallRate}%`;
        }

        const pendingApprovalsEl = document.getElementById('pending-approvals');
        if (pendingApprovalsEl) {
            pendingApprovalsEl.textContent = (entityData.totalEntities - entityData.activeEntities).toString();
        }

        // Update progress bars
        const royaltiesProgress = document.getElementById('royalties-progress');
        if (royaltiesProgress) {
            const progressPercent = (royaltyData.totalRoyalties / royaltyData.yearlyTarget * 100).toFixed(1);
            royaltiesProgress.style.width = `${progressPercent}%`;
        }

        const complianceProgress = document.getElementById('compliance-progress');
        if (complianceProgress) {
            complianceProgress.style.width = `${complianceData.overallRate}%`;
        }
    }

    /**
     * Update recent activity
     */
    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        container.innerHTML = activities.map(activity => {
            let icon, title;
            switch (activity.type) {
                case 'payment':
                    icon = 'fa-money-bill';
                    title = `Payment received from ${activity.entity}`;
                    break;
                case 'audit':
                    icon = 'fa-clipboard-check';
                    title = `Audit ${activity.status} for ${activity.entity}`;
                    break;
                case 'report':
                    icon = 'fa-file-alt';
                    title = `Report generated: ${activity.name}`;
                    break;
                default:
                    icon = 'fa-info-circle';
                    title = 'Activity recorded';
            }

            return `
                <div class="activity-item">
                    <i class="fas ${icon}"></i>
                    <div class="activity-details">
                        <p>${title}</p>
                        <small>${new Date(activity.date).toLocaleDateString()}</small>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
