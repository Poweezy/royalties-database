// Section Managers Module

export class UserManagementManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentFilters = {};
        this.selectedUsers = new Set();
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.currentPage = 1;
        this.usersPerPage = 10;
    }

    loadSection() {
        const section = document.getElementById('user-management');
        if (!section) return;
        
        // Load the template content from the HTML file
        this.loadUserManagementTemplate(section);
        this.setupEventListeners();
        this.populateUserTable();
        this.populateAuditLog();
        this.updateMetrics();
    }

    async loadUserManagementTemplate(section) {
        // If template is already loaded, don't reload
        if (section.innerHTML.trim()) {
            this.setupEventListeners();
            this.populateUserTable();
            this.populateAuditLog();
            this.updateMetrics();
            return;
        }

        try {
            const response = await fetch('templates/user-management.html');
            if (response.ok) {
                const html = await response.text();
                section.innerHTML = html;
            } else {
                throw new Error('Template not found');
            }
        } catch (error) {
            console.log('Loading fallback user management content');
            this.loadFallbackContent(section);
        }
    }

    loadFallbackContent(section) {
        const userAccounts = this.dataManager.getUserAccounts();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>👥 User Management</h1>
                    <p>Comprehensive user administration with role-based access control</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-info" id="view-audit-btn">
                        <i class="fas fa-shield-alt"></i> View Audit Log
                    </button>
                    <button class="btn btn-primary" id="export-report-btn">
                        <i class="fas fa-file-export"></i> Export Report
                    </button>
                    <button class="btn btn-success" id="add-user-btn">
                        <i class="fas fa-user-plus"></i> Add User
                    </button>
                </div>
            </div>
            
            <!-- Metrics Dashboard -->
            <div class="charts-grid">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Active Users</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-users-count">${userAccounts.filter(u => u.status === 'Active').length}</p>
                        <small><i class="fas fa-circle" style="color: #38a169;"></i> Currently active</small>
                    </div>
                </div>
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-user-shield"></i> Administrators</h3>
                    </div>
                    <div class="card-body">
                        <p id="admin-count">${userAccounts.filter(u => u.role === 'Administrator').length}</p>
                        <small><i class="fas fa-shield-alt"></i> System administrators</small>
                    </div>
                </div>
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Failed Logins</h3>
                    </div>
                    <div class="card-body">
                        <p id="failed-logins-count">${userAccounts.reduce((sum, u) => sum + (u.failedAttempts || 0), 0)}</p>
                        <small><i class="fas fa-clock"></i> Last 24 hours</small>
                    </div>
                </div>
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-calendar-times"></i> Account Expiry</h3>
                    </div>
                    <div class="card-body">
                        <p id="expiring-accounts">${userAccounts.filter(u => u.expires && new Date(u.expires) < new Date(Date.now() + 90*24*60*60*1000)).length}</p>
                        <small><i class="fas fa-warning"></i> Expiring within 90 days</small>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                </div>
                <div class="card-body">
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" onclick="this.showBulkUserUpload()">
                            <i class="fas fa-upload"></i>
                            <span>Bulk Import Users</span>
                        </button>
                        <button class="quick-action-btn" onclick="this.resetAllPasswords()">
                            <i class="fas fa-key"></i>
                            <span>Reset Passwords</span>
                        </button>
                        <button class="quick-action-btn" onclick="this.auditUserActivity()">
                            <i class="fas fa-search"></i>
                            <span>Audit Activity</span>
                        </button>
                        <button class="quick-action-btn" onclick="this.generateUserReport()">
                            <i class="fas fa-chart-bar"></i>
                            <span>Generate Report</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="table-container">
                <div class="section-header">
                    <h4><i class="fas fa-users"></i> User Accounts Registry</h4>
                    <div class="table-actions">
                        <button class="btn btn-info btn-sm" id="filter-users-btn">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                        <button class="btn btn-secondary btn-sm" id="sort-users-btn">
                            <i class="fas fa-sort"></i> Sort
                        </button>
                        <button class="btn btn-warning btn-sm" id="bulk-actions-btn">
                            <i class="fas fa-tasks"></i> Bulk Actions
                        </button>
                    </div>
                </div>

                <table class="data-table" id="users-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all-users"></th>
                            <th sortable data-sort="username">Username</th>
                            <th sortable data-sort="email">Email</th>
                            <th sortable data-sort="role">Role</th>
                            <th sortable data-sort="department">Department</th>
                            <th sortable data-sort="status">Status</th>
                            <th sortable data-sort="lastLogin">Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-tbody">
                        ${this.generateUserTableRows(userAccounts)}
                    </tbody>
                </table>
            </div>

            <!-- Audit Log -->
            <div class="card audit-log-section">
                <div class="card-header">
                    <h3><i class="fas fa-shield-alt"></i> Security Audit Log</h3>
                    <div class="table-actions">
                        <button class="btn btn-info btn-sm" id="export-audit-btn">
                            <i class="fas fa-download"></i> Export Log
                        </button>
                        <button class="btn btn-primary btn-sm" id="refresh-audit-btn">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table" id="audit-log-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Target</th>
                                <th>IP Address</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody id="audit-log-tbody">
                            ${this.generateAuditLogRows()}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Add User Form (hidden by default) -->
            <div id="add-user-form-container" style="display: none;">
                ${this.generateAddUserForm()}
            </div>
        `;
    }

    generateUserTableRows(users = null) {
        const userAccounts = users || this.dataManager.getUserAccounts();
        
        return userAccounts.map(user => `
            <tr data-user-id="${user.id}">
                <td><input type="checkbox" class="user-select" value="${user.id}"></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${user.department}</td>
                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                <td>${user.lastLogin || 'Never'}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" onclick="window.userActions.editUser(${user.id})" title="Edit user">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="this.viewUserDetails(${user.id})" title="View details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="this.resetUserPassword(${user.id})" title="Reset password">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.userActions.deleteUser(${user.id})" title="Delete user">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    generateAuditLogRows() {
        const auditLog = this.dataManager.getAuditLog();
        
        return auditLog.slice(0, 10).map(entry => `
            <tr>
                <td>${entry.timestamp}</td>
                <td>${entry.user}</td>
                <td><span class="action-badge ${entry.action.toLowerCase().replace(' ', '-')}">${entry.action}</span></td>
                <td>${entry.target}</td>
                <td>${entry.ipAddress}</td>
                <td><span class="status-badge ${entry.status.toLowerCase()}">${entry.status}</span></td>
                <td title="${entry.details}">${entry.details.substring(0, 50)}${entry.details.length > 50 ? '...' : ''}</td>
            </tr>
        `).join('');
    }

    generateAddUserForm() {
        return `
            <div class="user-form-container">
                <div class="section-header">
                    <h4><i class="fas fa-user-plus"></i> Add New User Account</h4>
                    <button class="btn btn-secondary btn-sm" id="close-add-user-form">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
                
                <form id="add-user-form" novalidate>
                    <div class="grid-4">
                        <div class="form-group">
                            <label for="new-username"><i class="fas fa-user"></i> Username *</label>
                            <input type="text" id="new-username" name="username" placeholder="Enter username" required>
                            <small class="form-help">3-50 characters, letters, numbers, dots, dashes only</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-fullname"><i class="fas fa-id-card"></i> Full Name *</label>
                            <input type="text" id="new-fullname" name="fullname" placeholder="Enter full name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-email"><i class="fas fa-envelope"></i> Email *</label>
                            <input type="email" id="new-email" name="email" placeholder="user@eswacaa.sz" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-role"><i class="fas fa-user-tag"></i> Role *</label>
                            <select id="new-role" name="role" required>
                                <option value="">Select role</option>
                                <option value="Administrator">Administrator</option>
                                <option value="Editor">Editor</option>
                                <option value="Viewer">Viewer</option>
                                <option value="Auditor">Auditor</option>
                                <option value="Finance">Finance Manager</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-department"><i class="fas fa-building"></i> Department *</label>
                            <select id="new-department" name="department" required>
                                <option value="">Select department</option>
                                <option value="Management">Management</option>
                                <option value="Finance">Finance</option>
                                <option value="Audit">Audit</option>
                                <option value="Legal">Legal</option>
                                <option value="Operations">Operations</option>
                                <option value="IT">Information Technology</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-password"><i class="fas fa-lock"></i> Password *</label>
                            <div class="password-input-container">
                                <input type="password" id="new-password" name="password" placeholder="Enter password" required>
                                <button type="button" class="password-toggle-btn" id="toggle-new-password">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-password-confirm"><i class="fas fa-lock"></i> Confirm Password *</label>
                            <input type="password" id="new-password-confirm" name="password_confirm" placeholder="Confirm password" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="new-expires"><i class="fas fa-calendar-alt"></i> Expires (Optional)</label>
                            <input type="date" id="new-expires" name="expires">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-add-user">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="button" class="btn btn-warning" id="reset-form">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                        <button type="submit" class="btn btn-success" id="create-user-btn">
                            <i class="fas fa-user-plus"></i> Create User
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    setupEventListeners() {
        // Main action buttons
        this.setupMainButtons();
        
        // Form handling
        this.setupFormHandling();
        
        // Table interactions
        this.setupTableInteractions();
        
        // Audit log interactions
        this.setupAuditLogHandlers();
    }

    setupMainButtons() {
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserForm());
        }

        const viewAuditBtn = document.getElementById('view-audit-btn');
        if (viewAuditBtn) {
            viewAuditBtn.addEventListener('click', () => this.scrollToAuditLog());
        }

        const exportReportBtn = document.getElementById('export-report-btn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportUserReport());
        }

        const filterUsersBtn = document.getElementById('filter-users-btn');
        if (filterUsersBtn) {
            filterUsersBtn.addEventListener('click', () => this.toggleUserFilters());
        }
    }

    setupFormHandling() {
        const closeFormBtn = document.getElementById('close-add-user-form');
        if (closeFormBtn) {
            closeFormBtn.addEventListener('click', () => this.hideAddUserForm());
        }

        const cancelBtn = document.getElementById('cancel-add-user');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideAddUserForm());
        }

        const resetBtn = document.getElementById('reset-form');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAddUserForm());
        }

        const addUserForm = document.getElementById('add-user-form');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => this.handleAddUserSubmit(e));
        }

        // Password toggle
        const passwordToggle = document.getElementById('toggle-new-password');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Real-time validation
        this.setupFormValidation();
    }

    setupTableInteractions() {
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-users');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => this.handleSelectAll(e));
        }

        // Individual user selection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('user-select')) {
                this.handleUserSelect(e);
            }
        });

        // Column sorting
        document.addEventListener('click', (e) => {
            if (e.target.closest('th[sortable]')) {
                this.handleColumnSort(e);
            }
        });
    }

    setupAuditLogHandlers() {
        const exportAuditBtn = document.getElementById('export-audit-btn');
        if (exportAuditBtn) {
            exportAuditBtn.addEventListener('click', () => this.exportAuditLog());
        }

        const refreshAuditBtn = document.getElementById('refresh-audit-btn');
        if (refreshAuditBtn) {
            refreshAuditBtn.addEventListener('click', () => this.refreshAuditLog());
        }
    }

    setupFormValidation() {
        const usernameField = document.getElementById('new-username');
        const emailField = document.getElementById('new-email');
        const passwordField = document.getElementById('new-password');
        const confirmPasswordField = document.getElementById('new-password-confirm');

        if (usernameField) {
            usernameField.addEventListener('input', () => this.validateUsername());
            usernameField.addEventListener('blur', () => this.checkUsernameAvailability());
        }

        if (emailField) {
            emailField.addEventListener('input', () => this.validateEmail());
        }

        if (passwordField) {
            passwordField.addEventListener('input', () => this.validatePassword());
        }

        if (confirmPasswordField) {
            confirmPasswordField.addEventListener('input', () => this.validatePasswordMatch());
        }

        // Form-wide validation
        const form = document.getElementById('add-user-form');
        if (form) {
            form.addEventListener('input', () => this.validateForm());
        }
    }

    // UI Action Methods
    showAddUserForm() {
        const formContainer = document.getElementById('add-user-form-container');
        if (formContainer) {
            formContainer.style.display = 'block';
            formContainer.scrollIntoView({ behavior: 'smooth' });
            
            // Set minimum date for expiry to today
            const expiryField = document.getElementById('new-expires');
            if (expiryField) {
                expiryField.min = new Date().toISOString().split('T')[0];
            }
        }
    }

    hideAddUserForm() {
        const formContainer = document.getElementById('add-user-form-container');
        if (formContainer) {
            formContainer.style.display = 'none';
            this.resetAddUserForm();
        }
    }

    resetAddUserForm() {
        const form = document.getElementById('add-user-form');
        if (form) {
            form.reset();
            this.clearValidationMessages();
            this.updateCreateButton();
        }
    }

    scrollToAuditLog() {
        const auditSection = document.querySelector('.audit-log-section');
        if (auditSection) {
            auditSection.scrollIntoView({ behavior: 'smooth' });
            // Highlight the section briefly
            auditSection.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
            setTimeout(() => {
                auditSection.style.backgroundColor = '';
            }, 2000);
        }
    }

    togglePasswordVisibility() {
        const passwordField = document.getElementById('new-password');
        const toggleButton = document.getElementById('toggle-new-password');
        const icon = toggleButton?.querySelector('i');
        
        if (passwordField && icon) {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    // ...existing code...
}

export class RoyaltyRecordsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    loadSection() {
        const section = document.getElementById('royalty-records');
        if (!section) return;
        
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        const entities = this.dataManager.getEntities();
        const minerals = this.dataManager.getMinerals();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>💰 Royalty Records Management</h1>
                    <p>Comprehensive tracking and management of mining royalty payments, calculations, and compliance monitoring</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-info" id="bulk-calculate-btn" title="Bulk calculate royalties">
                        <i class="fas fa-calculator"></i> Bulk Calculate
                    </button>
                    <button class="btn btn-warning" id="generate-invoices-btn" title="Generate invoices">
                        <i class="fas fa-file-invoice"></i> Generate Invoices
                    </button>
                    <button class="btn btn-secondary" id="export-records-btn" title="Export records">
                        <i class="fas fa-download"></i> Export Records
                    </button>
                    <button class="btn btn-success" id="add-record-btn" title="Add new royalty record">
                        <i class="fas fa-plus"></i> Add Record
                    </button>
                </div>
            </div>

            <!-- Royalty Metrics Dashboard -->
            <div class="charts-grid" id="royalty-metrics">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Total Royalties (YTD)</h3>
                        <select class="metric-period" id="royalties-period">
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <div class="card-body">
                        <p id="total-royalties-amount">E ${royaltyRecords.reduce((sum, r) => sum + r.royalties, 0).toLocaleString()}</p>
                        <small class="text-success">
                            <i class="fas fa-arrow-up"></i> +12.5% from last year
                        </small>
                        <div class="mini-progress mt-2">
                            <div class="progress-bar bg-success" style="width: 75%;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-check-circle"></i> Payment Compliance</h3>
                    </div>
                    <div class="card-body">
                        <p id="compliance-percentage">${Math.round((royaltyRecords.filter(r => r.status === 'Paid').length / royaltyRecords.length) * 100)}%</p>
                        <small class="text-success">
                            <i class="fas fa-arrow-up"></i> +2.1% this month
                        </small>
                        <div class="entities-breakdown mt-2">
                            <span class="entity-type text-success">Paid: ${royaltyRecords.filter(r => r.status === 'Paid').length}</span> • 
                            <span class="entity-type text-warning">Pending: ${royaltyRecords.filter(r => r.status === 'Pending').length}</span> • 
                            <span class="entity-type text-danger">Overdue: ${royaltyRecords.filter(r => r.status === 'Overdue').length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Outstanding Payments</h3>
                    </div>
                    <div class="card-body">
                        <p id="outstanding-amount">E ${royaltyRecords.filter(r => r.status !== 'Paid').reduce((sum, r) => sum + r.royalties, 0).toLocaleString()}</p>
                        <small class="text-danger">
                            <i class="fas fa-clock"></i> ${royaltyRecords.filter(r => r.status === 'Overdue').length} overdue payments
                        </small>
                        <div class="urgency-indicator mt-2">
                            <span class="urgent-badge">
                                <i class="fas fa-exclamation-circle"></i> Requires immediate attention
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-line"></i> Monthly Growth</h3>
                    </div>
                    <div class="card-body">
                        <p id="monthly-growth">+8.7%</p>
                        <small class="text-success">
                            <i class="fas fa-trending-up"></i> Compared to last month
                        </small>
                        <div class="chart-summary mt-2">
                            Average monthly royalties: <strong>E ${Math.round(royaltyRecords.reduce((sum, r) => sum + r.royalties, 0) / 12).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions & Filters -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-bolt"></i> Quick Actions & Smart Filters</h3>
                </div>
                <div class="card-body">
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" onclick="filterByStatus('Overdue')">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>View Overdue (${royaltyRecords.filter(r => r.status === 'Overdue').length})</span>
                        </button>
                        <button class="quick-action-btn" onclick="filterByStatus('Pending')">
                            <i class="fas fa-clock"></i>
                            <span>View Pending (${royaltyRecords.filter(r => r.status === 'Pending').length})</span>
                        </button>
                        <button class="quick-action-btn" onclick="filterByThisMonth()">
                            <i class="fas fa-calendar"></i>
                            <span>This Month's Records</span>
                        </button>
                        <button class="quick-action-btn" onclick="showPaymentReminders()">
                            <i class="fas fa-bell"></i>
                            <span>Send Payment Reminders</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Advanced Filters -->
            <div class="table-filters" id="royalty-filters" style="display: none;">
                <h6><i class="fas fa-filter"></i> Advanced Filters</h6>
                <div class="grid-4">
                    <div class="form-group">
                        <label for="filter-entity">Entity</label>
                        <select id="filter-entity">
                            <option value="">All Entities</option>
                            ${entities.map(entity => `<option value="${entity.name}">${entity.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filter-mineral">Mineral</label>
                        <select id="filter-mineral">
                            <option value="">All Minerals</option>
                            ${minerals.map(mineral => `<option value="${mineral.name}">${mineral.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filter-status">Payment Status</label>
                        <select id="filter-status">
                            <option value="">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filter-date-range">Date Range</label>
                        <select id="filter-date-range">
                            <option value="">All Dates</option>
                            <option value="today">Today</option>
                            <option value="this-week">This Week</option>
                            <option value="this-month">This Month</option>
                            <option value="last-month">Last Month</option>
                            <option value="this-quarter">This Quarter</option>
                            <option value="this-year">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                </div>
                <div class="filter-actions">
                    <button class="btn btn-primary" id="apply-filters-btn">
                        <i class="fas fa-search"></i> Apply Filters
                    </button>
                    <button class="btn btn-secondary" id="clear-filters-btn">
                        <i class="fas fa-eraser"></i> Clear All
                    </button>
                </div>
            </div>

            <!-- Royalty Records Table -->
            <div id="royalty-table-container">
                <div class="table-container">
                    <div class="section-header">
                        <h4><i class="fas fa-table"></i> Royalty Records Registry</h4>
                        <div class="table-actions">
                            <button class="btn btn-info btn-sm" id="toggle-filters-btn">
                                <i class="fas fa-filter"></i> Filters
                            </button>
                            <button class="btn btn-secondary btn-sm" id="sort-records-btn">
                                <i class="fas fa-sort"></i> Sort
                            </button>
                            <button class="btn btn-warning btn-sm" id="bulk-actions-btn">
                                <i class="fas fa-tasks"></i> Bulk Actions
                            </button>
                            <button class="btn btn-success btn-sm" id="refresh-records-btn">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>

                    <table class="data-table" id="royalty-records-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="select-all-records" title="Select all records"></th>
                                <th sortable data-sort="referenceNumber">Reference #</th>
                                <th sortable data-sort="entity">Entity</th>
                                <th sortable data-sort="mineral">Mineral</th>
                                <th sortable data-sort="volume">Volume</th>
                                <th sortable data-sort="tariff">Tariff Rate</th>
                                <th sortable data-sort="royalties">Royalties Due</th>
                                <th sortable data-sort="date">Date</th>
                                <th sortable data-sort="status">Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="royalty-records-tbody">
                            ${royaltyRecords.map(record => `
                                <tr data-record-id="${record.id}">
                                    <td><input type="checkbox" class="record-checkbox" value="${record.id}"></td>
                                    <td>
                                        <strong>${record.referenceNumber}</strong>
                                    </td>
                                    <td>
                                        <div class="entity-info">
                                            <strong>${record.entity}</strong>
                                            <small>Mining Operation</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="mineral-badge ${record.mineral.toLowerCase().replace(/\s+/g, '-')}">${record.mineral}</span>
                                    </td>
                                    <td>
                                        <strong>${record.volume.toLocaleString()}</strong>
                                        <small>${record.mineral.includes('Stone') || record.mineral.includes('Sand') || record.mineral.includes('Gravel') ? 'm³' : 'tonnes'}</small>
                                    </td>
                                    <td>
                                        <strong>E ${record.tariff}</strong>
                                        <small>per ${record.mineral.includes('Stone') || record.mineral.includes('Sand') || record.mineral.includes('Gravel') ? 'm³' : 'tonne'}</small>
                                    </td>
                                    <td>
                                        <strong class="royalty-amount">E ${record.royalties.toLocaleString()}</strong>
                                    </td>
                                    <td>
                                        <span class="date-badge">${new Date(record.date).toLocaleDateString('en-GB')}</span>
                                        <small>${this.getTimeAgo(record.date)}</small>
                                    </td>
                                    <td>
                                        <span class="status-badge ${record.status.toLowerCase()}">${record.status}</span>
                                        ${record.status === 'Overdue' ? '<small class="overdue-days">5 days overdue</small>' : ''}
                                    </td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-info" onclick="window.recordActions.viewRecord(${record.id})" title="View Details">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-secondary" onclick="window.recordActions.editRecord(${record.id})" title="Edit Record">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-success" onclick="window.recordActions.markAsPaid(${record.id})" title="Mark as Paid" ${record.status === 'Paid' ? 'disabled' : ''}>
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button class="btn btn-sm btn-warning" onclick="window.recordActions.generateInvoice(${record.id})" title="Generate Invoice">
                                                <i class="fas fa-file-invoice"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="table-pagination">
                        <div class="pagination-info">
                            Showing <span id="showing-start">1</span> to <span id="showing-end">${royaltyRecords.length}</span> of <span id="total-records">${royaltyRecords.length}</span> records
                        </div>
                        <div class="pagination-controls">
                            <button class="btn btn-sm btn-secondary" id="prev-page" disabled>
                                <i class="fas fa-chevron-left"></i> Previous
                            </button>
                            <div class="pagination-pages">
                                <a href="#" class="page-btn active">1</a>
                            </div>
                            <button class="btn btn-sm btn-secondary" id="next-page" disabled>
                                Next <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="charts-grid">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-pie"></i> Payment Status Distribution</h5>
                    </div>
                    <div class="chart-container">
                        <canvas id="payment-status-chart"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-bar"></i> Royalties by Entity</h5>
                    </div>
                    <div class="chart-container">
                        <canvas id="royalties-by-entity-chart"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Setup event handlers
        this.setupEventHandlers();
        this.initializeCharts();
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    setupEventHandlers() {
        // Toggle filters
        const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
        const filtersSection = document.getElementById('royalty-filters');
        
        if (toggleFiltersBtn) {
            toggleFiltersBtn.addEventListener('click', () => {
                const isVisible = filtersSection.style.display !== 'none';
                filtersSection.style.display = isVisible ? 'none' : 'block';
                toggleFiltersBtn.innerHTML = isVisible ? 
                    '<i class="fas fa-filter"></i> Show Filters' : 
                    '<i class="fas fa-filter"></i> Hide Filters';
            });
        }

        // Select all records
        const selectAllCheckbox = document.getElementById('select-all-records');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const recordCheckboxes = document.querySelectorAll('.record-checkbox');
                recordCheckboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        // Apply filters
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Clear filters
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Add record button
        const addRecordBtn = document.getElementById('add-record-btn');
        if (addRecordBtn) {
            addRecordBtn.addEventListener('click', () => {
                window.recordActions.showAddRecordForm();
            });
        }

        // Export records
        const exportBtn = document.getElementById('export-records-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                window.recordActions.exportRecords();
            });
        }

        // Bulk calculate
        const bulkCalculateBtn = document.getElementById('bulk-calculate-btn');
        if (bulkCalculateBtn) {
            bulkCalculateBtn.addEventListener('click', () => {
                this.bulkCalculateRoyalties();
            });
        }

        // Generate invoices
        const generateInvoicesBtn = document.getElementById('generate-invoices-btn');
        if (generateInvoicesBtn) {
            generateInvoicesBtn.addEventListener('click', () => {
                this.generateBulkInvoices();
            });
        }
    }

    applyFilters() {
        // Get filter values
        const entityFilter = document.getElementById('filter-entity').value;
        const mineralFilter = document.getElementById('filter-mineral').value;
        const statusFilter = document.getElementById('filter-status').value;
        const dateRangeFilter = document.getElementById('filter-date-range').value;

        // Apply filters to table rows
        const rows = document.querySelectorAll('#royalty-records-tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            let showRow = true;

            // Apply entity filter
            if (entityFilter) {
                const entityCell = row.children[2].textContent.trim();
                if (!entityCell.includes(entityFilter)) showRow = false;
            }

            // Apply mineral filter
            if (mineralFilter) {
                const mineralCell = row.children[3].textContent.trim();
                if (!mineralCell.includes(mineralFilter)) showRow = false;
            }

            // Apply status filter
            if (statusFilter) {
                const statusCell = row.children[8].textContent.trim();
                if (!statusCell.includes(statusFilter)) showRow = false;
            }

            // Apply date range filter
            if (dateRangeFilter && dateRangeFilter !== 'custom') {
                // Implement date filtering logic
                const dateCell = row.children[7].querySelector('.date-badge').textContent;
                const recordDate = new Date(dateCell.split('/').reverse().join('-'));
                const today = new Date();
                
                let dateMatch = true;
                switch (dateRangeFilter) {
                    case 'today':
                        dateMatch = recordDate.toDateString() === today.toDateString();
                        break;
                    case 'this-week':
                        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                        dateMatch = recordDate >= weekStart;
                        break;
                    case 'this-month':
                        dateMatch = recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear();
                        break;
                    // Add more date range cases as needed
                }
                if (!dateMatch) showRow = false;
            }

            row.style.display = showRow ? '' : 'none';
            if (showRow) visibleCount++;
        });

        // Update pagination info
        document.getElementById('showing-end').textContent = visibleCount;
        document.getElementById('total-records').textContent = visibleCount;

        // Show filter applied notification
        if (typeof notificationManager !== 'undefined') {
            notificationManager.show(`Filters applied. Showing ${visibleCount} records.`, 'info');
        }
    }

    clearFilters() {
        // Reset all filter dropdowns
        document.getElementById('filter-entity').value = '';
        document.getElementById('filter-mineral').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-date-range').value = '';

        // Show all rows
        const rows = document.querySelectorAll('#royalty-records-tbody tr');
        rows.forEach(row => {
            row.style.display = '';
        });

        // Reset pagination info
        const totalRecords = rows.length;
        document.getElementById('showing-end').textContent = totalRecords;
        document.getElementById('total-records').textContent = totalRecords;

        if (typeof notificationManager !== 'undefined') {
            notificationManager.show('All filters cleared', 'info');
        }
    }

    bulkCalculateRoyalties() {
        const selectedRecords = document.querySelectorAll('.record-checkbox:checked');
        
        if (selectedRecords.length === 0) {
            if (typeof notificationManager !== 'undefined') {
                notificationManager.show('Please select records to recalculate', 'warning');
            }
            return;
        }

        if (confirm(`Recalculate royalties for ${selectedRecords.length} selected records?`)) {
            // Simulate bulk calculation
            setTimeout(() => {
                if (typeof notificationManager !== 'undefined') {
                    notificationManager.show(`Successfully recalculated royalties for ${selectedRecords.length} records`, 'success');
                }
            }, 1000);
        }
    }

    generateBulkInvoices() {
        const pendingRecords = document.querySelectorAll('#royalty-records-tbody tr[data-record-id]');
        const unpaidCount = Array.from(pendingRecords).filter(row => 
            row.children[8].textContent.includes('Pending') || row.children[8].textContent.includes('Overdue')
        ).length;

        if (unpaidCount === 0) {
            if (typeof notificationManager !== 'undefined') {
                notificationManager.show('No unpaid records found to generate invoices', 'info');
            }
            return;
        }

        if (confirm(`Generate invoices for ${unpaidCount} unpaid records?`)) {
            // Simulate invoice generation
            setTimeout(() => {
                if (typeof notificationManager !== 'undefined') {
                    notificationManager.show(`Successfully generated ${unpaidCount} invoices`, 'success');
                }
            }, 2000);
        }
    }

    initializeCharts() {
        this.initializePaymentStatusChart();
        this.initializeRoyaltiesByEntityChart();
    }

    initializePaymentStatusChart() {
        const ctx = document.getElementById('payment-status-chart');
        if (!ctx || typeof Chart === 'undefined') return;

        const records = this.dataManager.getRoyaltyRecords();
        const statusCounts = records.reduce((acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, {});

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#38a169', // Paid - Green
                        '#d69e2e', // Pending - Yellow
                        '#e53e3e', // Overdue - Red
                        '#718096'  // Others - Gray
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initializeRoyaltiesByEntityChart() {
        const ctx = document.getElementById('royalties-by-entity-chart');
        if (!ctx || typeof Chart === 'undefined') return;

        const records = this.dataManager.getRoyaltyRecords();
        const entityTotals = records.reduce((acc, record) => {
            acc[record.entity] = (acc[record.entity] || 0) + record.royalties;
            return acc;
        }, {});

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(entityTotals),
                datasets: [{
                    label: 'Total Royalties (E)',
                    data: Object.values(entityTotals),
                    backgroundColor: '#1a365d',
                    borderColor: '#2d5282',
                    borderWidth: 1
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
                                return 'E ' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// ...existing code...