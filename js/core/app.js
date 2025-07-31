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
            const [userData, preferences] = await Promise.all([
                this.fetchUserData(),
                this.fetchUserPreferences()
            ]);

            this.state.currentUser = userData;
            this.state.settings = { ...this.state.settings, ...preferences };

            // Update UI with user info
            this.updateUserInfo();
        } catch (error) {
            throw new Error('Failed to load user data');
        }
    }

    /**
     * Initialize dashboard
     */
    async initializeDashboard() {
        try {
            // Load dashboard data
            const [
                royaltyData,
                entityData,
                complianceData,
                recentActivity
            ] = await Promise.all([
                this.fetchRoyaltyData(),
                this.fetchEntityData(),
                this.fetchComplianceData(),
                this.fetchRecentActivity()
            ]);

            // Update UI
            this.updateDashboardMetrics(royaltyData, entityData, complianceData);
            this.updateRecentActivity(recentActivity);
            
            // Initialize charts
            await this.chartManager.initializeCharts();
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
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        this.navigate('dashboard');
    }

    showError(message) {
        // TODO: Implement error notification system
        alert(message);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
