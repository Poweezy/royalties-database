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
            contracts: [
                {
                    id: 1,
                    entity: 'Kwalini Quarry',
                    mineral: 'Quarried Stone',
                    startDate: '2024-01-01',
                    calculationType: 'tiered',
                    calculationParams: {
                        tiers: [
                            { from: 0, to: 1000, rate: 15 },
                            { from: 1001, to: 5000, rate: 12 },
                            { from: 5001, to: null, rate: 10 }
                        ]
                    }
                },
                {
                    id: 2,
                    entity: 'Maloma Colliery',
                    mineral: 'Coal',
                    startDate: '2023-12-01',
                    calculationType: 'sliding_scale',
                    calculationParams: {
                        scales: [
                            { from: 0, to: 50, rate: 20 },
                            { from: 51, to: 100, rate: 25 },
                            { from: 101, to: null, rate: 30 }
                        ],
                        priceSource: 'some_api_endpoint'
                    }
                },
                {
                    id: 3,
                    entity: 'Mbabane Quarry',
                    mineral: 'Gravel',
                    startDate: '2023-06-15',
                    calculationType: 'fixed',
                    calculationParams: {
                        rate: 18.50
                    }
                }
            ],
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
        this.idleWarningTimeout = null;
        this.idleLogoutTimeout = null;
        this.setupIdleTimeout();
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
            // Initialize charts with demo data
            await this.chartManager.initializeCharts();
            
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
            this.navigate('logout');
        });

        // Dashboard-specific listeners
        this.#setupDashboardListeners();
        this.#setupUserManagementListeners();

        // Confirm Logout
        document.getElementById('confirm-logout-btn')?.addEventListener('click', () => {
            authService.logout();
        });

        // Forgot Password link
        document.getElementById('forgot-password-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotPassword();
        });

        // Back to Login link
        document.getElementById('back-to-login-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Forgot Password form submission
        document.getElementById('forgot-password-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.elements['reset-email'].value;
            if (email) {
                this.notificationManager.show('If an account with that email exists, a password reset link has been sent.', 'success');
                this.showLogin();
            } else {
                this.notificationManager.show('Please enter your email address.', 'error');
            }
        });

        // Communication Hub listeners
        document.getElementById('compose-message-btn')?.addEventListener('click', () => {
            document.getElementById('compose-message-container').style.display = 'block';
        });

        document.getElementById('close-compose-form')?.addEventListener('click', () => {
            document.getElementById('compose-message-container').style.display = 'none';
        });

        document.getElementById('compose-message-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const recipients = e.target.elements['message-recipients'].value;
            const subject = e.target.elements['message-subject'].value;
            const content = e.target.elements['message-content'].value;

            if (recipients && subject && content) {
                this.notificationManager.show('Message sent successfully!', 'success');
                e.target.reset();
                document.getElementById('compose-message-container').style.display = 'none';
                // For this mock-up, we'll just show a notification.
            } else {
                this.notificationManager.show('Please fill out all fields.', 'error');
            }
        });
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
        // Refresh dashboard button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
                refreshBtn.disabled = true;
                await this.initializeDashboard();
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                refreshBtn.disabled = false;
            });
        }
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

        if (route === 'communication') {
            this.renderMessageHistory();
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
        document.getElementById('forgot-password-section').style.display = 'none';
        document.getElementById('app-container').style.display = 'none';
    }

    showForgotPassword() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('forgot-password-section').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    showDashboard() {
        console.log("Showing dashboard");
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        console.log("app-container display style:", document.getElementById('app-container').style.display);
        this.navigate('dashboard');
    }

    showError(message) {
        this.notificationManager.show(message, 'error');
    }


    renderMessageHistory() {
        const messageHistory = [
            {
                date: '2025-08-26 10:30',
                recipients: 'All Mining Entities',
                subject: 'Monthly Royalty Payment Reminder',
                status: 'Sent',
            },
            {
                date: '2025-08-25 15:45',
                recipients: 'Overdue Entities (3)',
                subject: 'Urgent: Payment Overdue Notice',
                status: 'Delivered',
            },
            {
                date: '2025-08-24 11:00',
                recipients: 'Regulatory Bodies',
                subject: 'Q2 2025 Compliance Report',
                status: 'Read',
            },
        ];

        const tableBody = document.getElementById('messages-table-tbody');
        if (tableBody) {
            tableBody.innerHTML = messageHistory.map(msg => `
                <tr>
                    <td>${msg.date}</td>
                    <td>${msg.recipients}</td>
                    <td>${msg.subject}</td>
                    <td><span class="status-badge active">${msg.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" title="View Details">
                            <i class="fas fa-eye" aria-label="View Details icon"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    /**
     * Placeholder for auto-refresh functionality
     */
    startAutoRefresh() {
        // This is a placeholder to prevent errors.
        // Auto-refresh logic can be implemented here in the future.
        console.log('Auto-refresh started (placeholder).');
    }

    setupIdleTimeout() {
        const events = ['mousemove', 'keydown', 'scroll', 'click'];
        events.forEach(event => {
            window.addEventListener(event, () => this.resetIdleTimeout());
        });
        this.resetIdleTimeout();
    }

    resetIdleTimeout() {
        clearTimeout(this.idleWarningTimeout);
        clearTimeout(this.idleLogoutTimeout);

        this.idleWarningTimeout = setTimeout(() => {
            this.notificationManager.warning('You have been idle for a while. You will be logged out in 10 seconds.', 10000);
            this.idleLogoutTimeout = setTimeout(() => {
                authService.logout();
            }, 10000);
        }, 40000);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
