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
            auditLog: [
                {
                    timestamp: '2024-02-15 09:15:23',
                    user: 'admin',
                    action: 'Login',
                    ip: '192.168.1.100',
                    details: 'Standard login',
                },
                {
                    timestamp: '2024-02-15 08:45:12',
                    user: 'j.doe',
                    action: 'Data Access',
                    ip: '192.168.1.105',
                    details: 'Accessed royalty records',
                },
                {
                    timestamp: '2024-02-14 23:30:45',
                    user: 'unknown',
                    action: 'Failed Login',
                    ip: '203.0.113.15',
                    details: 'Invalid credentials - blocked',
                }
            ],
            filteredAuditLog: [],
            notifications: [
                { id: 1, message: 'Critical: Payment Overdue - Maloma Colliery', type: 'critical', unread: true },
                { id: 2, message: 'Security Alert: Multiple Failed Login Attempts', type: 'critical', unread: true },
                { id: 3, message: 'Reminder: Monthly Report Due Tomorrow', type: 'info', unread: true },
                { id: 4, message: 'Payment Received - Kwalini Quarry', type: 'success', unread: false },
            ],
            charts: {},
            leases: [
                {
                    id: 1,
                    lessor: 'Green Valley Trust',
                    lessee: 'Kwalini Quarry',
                    leaseDate: '2023-01-15',
                    term: 60,
                    royaltyRate: 15.0,
                },
                {
                    id: 2,
                    lessor: 'Royal Eswatini Sugar Corporation',
                    lessee: 'Maloma Colliery',
                    leaseDate: '2022-06-01',
                    term: 120,
                    royaltyRate: 18.5,
                },
            ],
            isLoading: false,
            expenses: [
                {
                    id: 1,
                    entity: 'Kwalini Quarry',
                    date: '2024-02-01',
                    expenseType: 'Operating Costs',
                    amount: 5000.00,
                    description: 'Monthly operating costs for Kwalini Quarry.',
                },
                {
                    id: 2,
                    entity: 'Maloma Colliery',
                    date: '2024-02-05',
                    expenseType: 'Maintenance',
                    amount: 15000.00,
                    description: 'Scheduled maintenance for heavy machinery.',
                },
            ],
            settings: {
                recordsPerPage: 10,
                autoSave: true,
                theme: 'light'
            },
            scheduledReports: [
                {
                    id: 1,
                    reportType: 'Financial Analysis',
                    frequency: 'Monthly',
                    recipients: 'finance-team@example.com',
                    nextRunDate: '2025-09-01',
                },
                {
                    id: 2,
                    reportType: 'Compliance Tracking',
                    frequency: 'Weekly',
                    recipients: 'compliance-officer@example.com',
                    nextRunDate: '2025-08-28',
                },
            ],
            financialComplianceData: [
                {
                    item: 'Royalty Payment Compliance',
                    status: 'Compliant',
                    lastAudit: '2025-07-01',
                    nextDeadline: '2026-07-01',
                    assignedTo: 'Finance Dept.',
                },
                {
                    item: 'Tax Reporting Compliance',
                    status: 'Needs Attention',
                    lastAudit: '2025-06-15',
                    nextDeadline: '2025-08-30',
                    assignedTo: 'J. Doe',
                },
                {
                    item: 'Audit Trail Maintenance',
                    status: 'Compliant',
                    lastAudit: '2025-08-01',
                    nextDeadline: 'N/A',
                    assignedTo: 'System',
                },
            ]
        };

        // Initialize modules
        this.notificationManager = new NotificationManager();
        this.errorHandler = new ErrorHandler(this.notificationManager);
        this.chartManager = new ChartManager();
        this.fileManager = new FileManager();
        this.navigationManager = new NavigationManager(this.notificationManager);
        this.userManager = new UserManager(this.notificationManager);

        // Initialize app
        this.initializeServices();
        this.updateNotificationCount();
        this.idleWarningTimeout = null;
        this.idleLogoutTimeout = null;
        this.setupIdleTimeout();
        this.setupEventListeners();
        this.setupErrorHandling();
    }

    renderExpenses() {
        const tableBody = document.getElementById('jib-table-tbody');
        if (tableBody) {
            tableBody.innerHTML = this.state.expenses.map(expense => `
                <tr>
                    <td>${expense.entity}</td>
                    <td>${expense.date}</td>
                    <td>${expense.expenseType}</td>
                    <td>E ${expense.amount.toFixed(2)}</td>
                    <td>${expense.description}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-primary" title="Edit expense">
                                <i class="fas fa-edit" aria-label="Edit icon"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" title="Delete expense">
                                <i class="fas fa-trash" aria-label="Delete icon"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    renderScheduledReports() {
        const tableBody = document.getElementById('scheduled-reports-tbody');
        if (tableBody) {
            tableBody.innerHTML = this.state.scheduledReports.map(report => `
                <tr>
                    <td>${report.reportType}</td>
                    <td>${report.frequency}</td>
                    <td>${report.recipients}</td>
                    <td>${report.nextRunDate}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-primary" title="Edit schedule">
                                <i class="fas fa-edit" aria-label="Edit icon"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" title="Delete schedule">
                                <i class="fas fa-trash" aria-label="Delete icon"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    filterAuditLog() {
        const user = document.getElementById('audit-filter-user').value;
        const action = document.getElementById('audit-filter-action').value;
        const date = document.getElementById('audit-filter-date').value;

        this.state.filteredAuditLog = this.state.auditLog.filter(log => {
            const userMatch = user ? log.user === user : true;
            const actionMatch = action ? log.action.toLowerCase().replace(' ', '-') === action : true;

            // Date filtering logic would be more complex in a real app
            const dateMatch = date ? log.timestamp.startsWith('2024-02-15') : true;

            return userMatch && actionMatch && dateMatch;
        });

        this.renderAuditLog();
    }

    renderAuditLog() {
        const tableBody = document.getElementById('audit-log-tbody');
        const logs = this.state.filteredAuditLog.length > 0 ? this.state.filteredAuditLog : this.state.auditLog;
        if (tableBody) {
            tableBody.innerHTML = logs.map(log => `
                <tr>
                    <td>${log.timestamp}</td>
                    <td>${log.user}</td>
                    <td><span class="action-badge ${log.action.toLowerCase().replace(' ', '-')}">${log.action}</span></td>
                    <td>${log.ip}</td>
                    <td>Chrome 121.0.0.0</td>
                    <td><span class="status-badge ${log.action.includes('Failed') ? 'warning' : 'active'}">${log.action.includes('Failed') ? 'Failed' : 'Success'}</span></td>
                    <td>${log.details}</td>
                </tr>
            `).join('');
        }
    }

    renderFinancialCompliance() {
        const tableBody = document.querySelector('#financial-compliance tbody');
        if (tableBody) {
            tableBody.innerHTML = this.state.financialComplianceData.map(item => `
                <tr>
                    <td>${item.item}</td>
                    <td><span class="status-badge ${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span></td>
                    <td>${item.lastAudit}</td>
                    <td>${item.nextDeadline}</td>
                    <td>${item.assignedTo}</td>
                    <td><button class="btn btn-sm btn-info">View</button></td>
                </tr>
            `).join('');
        }
    }

    checkForOverduePayments() {
        // This is a simulation. In a real app, this would involve checking dates and payment statuses.
        const overduePayment = {
            entity: 'Maloma Colliery',
            amount: 145750.00,
            daysOverdue: 15,
        };

        if (overduePayment) {
            const newNotification = {
                id: this.state.notifications.length + 1,
                message: `Critical: Payment for ${overduePayment.entity} is ${overduePayment.daysOverdue} days overdue.`,
                type: 'critical',
                unread: true,
            };
            this.state.notifications.unshift(newNotification);
            this.updateNotificationCount();
        }
    }

    updateNotificationCount() {
        const unreadCount = this.state.notifications.filter(n => n.unread).length;
        const badge = document.querySelector('nav a[href="#notifications"] .notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
        }
    }

    renderNotifications() {
        const container = document.getElementById('notifications-list');
        if (container) {
            container.innerHTML = this.state.notifications.map(n => `
                <div class="notification-item ${n.unread ? 'unread' : ''} ${n.type}">
                    <div class="notification-icon ${n.type}">
                        <i class="fas fa-exclamation-circle" aria-label="Notification icon"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-header">
                            <h5>${n.message}</h5>
                        </div>
                        <div class="notification-actions">
                            <button class="btn btn-sm btn-secondary" data-notification-id="${n.id}">Mark Read</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
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
                dbService.init()
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

    renderLeases() {
        const tableBody = document.getElementById('leases-table-tbody');
        if (tableBody) {
            tableBody.innerHTML = this.state.leases.map(lease => {
                const expiryDate = new Date(lease.leaseDate);
                expiryDate.setMonth(expiryDate.getMonth() + lease.term);

                return `
                    <tr>
                        <td>${lease.lessor}</td>
                        <td>${lease.lessee}</td>
                        <td>${lease.leaseDate}</td>
                        <td>${lease.term}</td>
                        <td>${lease.royaltyRate}%</td>
                        <td>${expiryDate.toISOString().split('T')[0]}</td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-primary" title="Edit lease">
                                    <i class="fas fa-edit" aria-label="Edit icon"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" title="Delete lease">
                                    <i class="fas fa-trash" aria-label="Delete icon"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
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
        const userDisplayEl = document.querySelector('#user-name');
        if (userDisplayEl) {
            userDisplayEl.textContent = this.state.currentUser.username;
        }
    }

    /**
     * Initialize dashboard and render its components.
     */
    async initializeDashboard() {
        try {
            // Load demo dashboard data
            const royaltyData = {
                totalRoyalties: 992500.00,
                paidRoyalties: 850000.00,
                pendingRoyalties: 142500.00,
                yearlyTarget: 1200000.00,
                trend: '+15.8% from last year'
            };

            const entityData = {
                totalEntities: 8,
                activeEntities: 6,
                inactiveEntities: 2,
                entityTypes: {
                    mines: 2,
                    quarries: 4
                },
                trend: '+2 new this month'
            };

            const complianceData = {
                overallRate: 80,
                compliantEntities: 5,
                nonCompliantEntities: 1,
                pending: 1,
                overdue: 1,
                upcomingDeadlines: 5
            };

            const recentActivity = [
                { type: 'payment', entity: 'Kwalini Quarry', amount: 45200.00, date: '2024-02-14', icon: 'fa-plus-circle text-success' },
                { type: 'user', entity: 'finance.manager', status: 'created', date: '2024-02-14', icon: 'fa-user-plus text-info' },
                { type: 'report', name: 'Compliance report', status: 'submitted to ERA', date: '2024-02-13', icon: 'fa-file-alt text-warning' }
            ];

            // Update UI with demo data
            this.updateNewDashboardUI(royaltyData, entityData, complianceData);
            this.updateRecentActivity(recentActivity);
            this.updateLeaderboards();
            
            // Initialize charts with demo data
            await this.chartManager.initializeCharts();
            
            // Show success notification
            this.notificationManager.show('Dashboard initialized successfully', 'success');

            // Check for overdue payments
            this.checkForOverduePayments();
        } catch (error) {
            this.errorHandler.handleError(new Error('Failed to initialize dashboard'));
        }
    }

    /**
     * Updates the new dashboard UI with the provided data.
     * @param {object} royaltyData - Data for royalty metrics.
     * @param {object} entityData - Data for entity metrics.
     * @param {object} complianceData - Data for compliance metrics.
     */
    updateNewDashboardUI(royaltyData, entityData, complianceData) {
        // Helper to update elements safely
        const updateElement = (id, value, isHtml = false) => {
            const el = document.getElementById(id);
            if (el) {
                if (isHtml) el.innerHTML = value;
                else el.textContent = value;
            }
        };

        // Update royalty metrics
        updateElement('total-royalties', `E ${royaltyData.totalRoyalties.toLocaleString('en-SZ')}`);
        updateElement('royalties-trend', royaltyData.trend, true);
        const royaltiesProgress = document.getElementById('royalties-progress');
        if (royaltiesProgress) {
            const progressPercent = (royaltyData.totalRoyalties / royaltyData.yearlyTarget * 100).toFixed(1);
            royaltiesProgress.style.width = `${progressPercent}%`;
        }

        // Update entity metrics
        updateElement('active-entities', entityData.activeEntities.toString());
        updateElement('entities-trend', entityData.trend, true);
        updateElement('mines-count', entityData.entityTypes.mines);
        updateElement('quarries-count', entityData.entityTypes.quarries);

        // Update compliance metrics
        updateElement('compliance-rate', `${complianceData.overallRate}%`);
        updateElement('paid-count', complianceData.compliantEntities);
        updateElement('pending-count', complianceData.pending);
        updateElement('overdue-count', complianceData.overdue);
        const complianceProgress = document.getElementById('compliance-progress');
        if (complianceProgress) {
            complianceProgress.style.width = `${complianceData.overallRate}%`;
        }

        // Update pending approvals
        updateElement('pending-approvals', entityData.inactiveEntities.toString());
        if (entityData.inactiveEntities > 0) {
            updateElement('pending-urgency', `${entityData.inactiveEntities} item(s) require attention`);
        } else {
            updateElement('pending-urgency', 'No pending items');
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

        // Reporting & Analytics listeners
        const reportPeriodSelect = document.getElementById('report-period');
        if (reportPeriodSelect) {
            reportPeriodSelect.addEventListener('change', (e) => {
                const startDateInput = document.getElementById('report-start-date');
                const endDateInput = document.getElementById('report-end-date');
                if (e.target.value === 'Custom Range') {
                    startDateInput.disabled = false;
                    endDateInput.disabled = false;
                } else {
                    startDateInput.disabled = true;
                    endDateInput.disabled = true;
                }
            });
        }

        const runComplianceCheckBtn = document.getElementById('run-compliance-check-btn');
        if (runComplianceCheckBtn) {
            runComplianceCheckBtn.addEventListener('click', () => {
                runComplianceCheckBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running Check...';
                runComplianceCheckBtn.disabled = true;
                setTimeout(() => {
                    document.getElementById('overall-compliance-rate').textContent = '98%';
                    this.notificationManager.show('Compliance check completed. All systems are compliant.', 'success');
                    runComplianceCheckBtn.innerHTML = '<i class="fas fa-check-double"></i> Run Compliance Check';
                    runComplianceCheckBtn.disabled = false;
                }, 2000);
            });
        }

        const notificationsList = document.getElementById('notifications-list');
        if (notificationsList) {
            notificationsList.addEventListener('click', (e) => {
                const target = e.target;
                if (target.tagName === 'BUTTON' && target.dataset.notificationId) {
                    const notificationId = parseInt(target.dataset.notificationId, 10);
                    const notification = this.state.notifications.find(n => n.id === notificationId);
                    if (notification) {
                        notification.unread = false;
                        this.renderNotifications();
                        this.updateNotificationCount();
                    }
                }
            });
        }

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
        // Period filters for metric cards
        const metricSelects = ['royalties-period', 'entities-period'];
        metricSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', (e) => {
                    const metricId = id.split('-')[0];
                    this.chartManager.updateMetric(metricId, e.target.value);
                });
            }
        });

        // Chart controls (line, bar, pie, etc.)
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const { chartType, chartId } = e.currentTarget.dataset;
                const chart = this.chartManager.getChart(chartId);
                if (chart) {
                    chart.config.type = chartType;
                    chart.update();
                    // Update active button state
                    e.currentTarget.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });

        // Export chart buttons
        document.querySelectorAll('.export-chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartId = e.currentTarget.dataset.chartId;
                const chart = this.chartManager.getChart(chartId);
                if (chart) {
                    this.fileManager.exportChartData(chart, `${chartId}.xlsx`);
                }
            });
        });

        // Quick action buttons
        const quickActionMapping = {
            'add-royalty-record': 'royalty-records',
            'generate-report': 'reporting-analytics',
            'view-overdue': 'audit-dashboard',
            'manage-users': 'user-management'
        };
        Object.entries(quickActionMapping).forEach(([btnId, section]) => {
            const button = document.getElementById(btnId);
            if (button) {
                button.addEventListener('click', () => this.navigate(section));
            }
        });

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
            this.renderAuditLog();
        }

        if (route === 'communication') {
            this.renderMessageHistory();
        }

        if (route === 'lease-management') {
            this.renderLeases();
        }

        if (route === 'jib-management') {
            this.renderExpenses();
        }

        if (route === 'reporting-analytics') {
            this.renderScheduledReports();
        }

        if (route === 'compliance') {
            this.renderFinancialCompliance();
        }

        if (route === 'notifications') {
            this.renderNotifications();
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
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        this.navigate('dashboard');
    }

    showError(message) {
        this.notificationManager.show(message, 'error');
    }

    /**
     * Update leaderboards for top and overdue entities.
     */
    updateLeaderboards() {
        const topEntitiesList = document.getElementById('top-entities-list');
        const overdueEntitiesList = document.getElementById('overdue-entities-list');

        if (topEntitiesList) {
            const topEntities = [
                { name: 'Kwalini Quarry', amount: 'E 500,000' },
                { name: 'Maloma Colliery', amount: 'E 450,000' },
                { name: 'Mbabane Quarry', amount: 'E 300,000' },
                { name: 'Ngwenya Mine', amount: 'E 250,000' },
                { name: 'Sidvokodvo Quarry', amount: 'E 200,000' },
            ];
            topEntitiesList.innerHTML = topEntities.map(e => `<li>${e.name}<span>${e.amount}</span></li>`).join('');
        }

        if (overdueEntitiesList) {
            const overdueEntities = [
                { name: 'Malolotja Mine', days: 15 },
                { name: 'Ngwenya Mine', days: 5 },
            ];
            overdueEntitiesList.innerHTML = overdueEntities.map(e => `<li>${e.name}<span>${e.days} days overdue</span></li>`).join('');
        }
    }

    /**
     * Updates the recent activity list on the dashboard.
     * @param {Array<object>} activities - A list of recent activity objects.
     */
    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}" aria-label="${activity.type} icon"></i>
                </div>
                <div class="activity-content">
                    <p><strong>New ${activity.type} record</strong> ${activity.status ? activity.status : ''} for ${activity.entity}</p>
                    <small>${new Date(activity.date).toLocaleDateString()}</small>
                </div>
            </div>
        `).join('');
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
