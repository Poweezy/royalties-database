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
import { UserManager } from './modules/UserManager.js';
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
        this.navigationManager = new NavigationManager(this.notificationManager);
        this.userManager = new UserManager();

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
        let hasError = false;
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
            hasError = true;
            this.errorHandler.handleError(error);
            const loadingContent = document.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.innerHTML = `
                    <p style="color: white; font-weight: bold;">Application failed to start.</p>
                    <p style="color: white;">Please try refreshing the page.</p>
                `;
            }
        } finally {
            if (!hasError) {
                this.hideLoadingScreen();
            }
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

        // Dashboard-specific listeners
        this.#setupDashboardListeners();
        this.#setupUserManagementListeners();
    }

    /**
     * Sets up event listeners for the User Management section.
     */
    #setupUserManagementListeners() {
        const addUserBtn = document.getElementById('add-user-btn');
        const addUserFormContainer = document.getElementById('add-user-form-container');
        const addUserForm = document.getElementById('add-user-form');
        const closeFormBtn = document.getElementById('close-add-user-form');
        const cancelFormBtn = document.getElementById('cancel-add-user');
        const formTitle = addUserFormContainer?.querySelector('h4');
        const createUserBtn = document.getElementById('create-user-btn');

        const showForm = (isEditMode = false, user = null) => {
            if (isEditMode && user) {
                formTitle.innerHTML = '<i class="fas fa-user-edit" aria-label="Edit User icon"></i> Edit User Account';
                createUserBtn.innerHTML = '<i class="fas fa-save" aria-label="Save icon"></i> Update User';
                this.#populateUserForm(user);
                addUserForm.dataset.editingId = user.id;
            } else {
                formTitle.innerHTML = '<i class="fas fa-user-plus" aria-label="Add New User icon"></i> Add New User Account';
                createUserBtn.innerHTML = '<i class="fas fa-user-plus" aria-label="Create User icon"></i> Create User';
                delete addUserForm.dataset.editingId;
            }
            addUserFormContainer.style.display = 'block';
        };

        const hideForm = () => {
            addUserFormContainer.style.display = 'none';
            addUserForm.reset();
            // Reset form to "Add" mode
            formTitle.innerHTML = '<i class="fas fa-user-plus" aria-label="Add New User icon"></i> Add New User Account';
            createUserBtn.innerHTML = '<i class="fas fa-user-plus" aria-label="Create User icon"></i> Create User';
            delete addUserForm.dataset.editingId;
        };

        addUserBtn?.addEventListener('click', () => showForm(false));
        closeFormBtn?.addEventListener('click', hideForm);
        cancelFormBtn?.addEventListener('click', hideForm);

        addUserForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = {
                username: formData.get('new-username'),
                email: formData.get('new-email'),
                role: formData.get('new-role'),
                department: formData.get('new-department'),
            };

            // Basic validation
            if (!userData.username || !userData.email || !userData.role || !userData.department) {
                this.notificationManager.show('Please fill all required fields.', 'error');
                return;
            }

            const editingId = e.target.dataset.editingId;
            if (editingId) {
                // Update existing user
                this.userManager.updateUser(parseInt(editingId, 10), userData);
                this.notificationManager.show(`User '${userData.username}' updated successfully.`, 'success');
            } else {
                // Add new user
                this.userManager.addUser(userData);
                this.notificationManager.show(`User '${userData.username}' created successfully.`, 'success');
            }

            hideForm();
        });

        const userTableBody = document.getElementById('users-table-tbody');
        userTableBody?.addEventListener('click', (e) => {
            const targetButton = e.target.closest('button[data-user-id]');
            if (!targetButton) return;

            const userId = parseInt(targetButton.dataset.userId, 10);

            // Handle Edit
            if (targetButton.title.includes('Edit')) {
                const user = this.userManager.getUser(userId);
                if (user) {
                    showForm(true, user);
                } else {
                    this.notificationManager.show(`User with ID ${userId} not found.`, 'error');
                }
            }

            // Handle Delete
            if (targetButton.title.includes('Delete')) {
                const user = this.userManager.getUser(userId);
                if (user && confirm(`Are you sure you want to delete the user '${user.username}'?`)) {
                    this.userManager.deleteUser(userId);
                    this.notificationManager.show(`User '${user.username}' has been deleted.`, 'success');
                }
            }
        });
    }

    /**
     * Populates the user form with data for editing.
     * @param {object} user - The user object to populate the form with.
     */
    #populateUserForm(user) {
        document.getElementById('new-username').value = user.username;
        document.getElementById('new-email').value = user.email;
        document.getElementById('new-role').value = user.role;
        document.getElementById('new-department').value = user.department;
        // Password fields are intentionally left blank for security
        document.getElementById('new-password').placeholder = "Enter new password (optional)";
        document.getElementById('confirm-password').placeholder = "Confirm new password";
    }

    /**
     * Sets up event listeners for the dashboard widgets.
     */
    #setupDashboardListeners() {
        const metricSelects = [
            document.getElementById('royalties-period'),
            document.getElementById('entities-period')
        ];

        metricSelects.forEach(select => {
            if (select) {
                select.addEventListener('change', (e) => {
                    const metricId = e.target.id.split('-')[0]; // e.g., 'royalties' from 'royalties-period'
                    const filterValue = e.target.value;
                    this.chartManager.updateMetric(metricId, filterValue);
                });
            }
        });
    }

    /**
     * Handle login form submission
     */
    async handleLogin(form) {
        const username = form.username.value.trim();
        const password = form.password.value.trim();
        const usernameError = document.getElementById('username-error');
        const passwordError = document.getElementById('password-error');
        let isValid = true;

        // Reset errors
        usernameError.style.display = 'none';
        passwordError.style.display = 'none';

        if (!username) {
            usernameError.textContent = 'Username is required';
            usernameError.style.display = 'block';
            isValid = false;
        }

        if (!password) {
            passwordError.textContent = 'Password is required';
            passwordError.style.display = 'block';
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        try {
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

        // Render components specific to the route
        if (route === 'user-management') {
            this.userManager.renderUsers();
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

    /**
     * Placeholder for auto-refresh functionality
     */
    startAutoRefresh() {
        // This is a placeholder to prevent errors.
        // Auto-refresh logic can be implemented here in the future.
        console.log('Auto-refresh started (placeholder).');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
