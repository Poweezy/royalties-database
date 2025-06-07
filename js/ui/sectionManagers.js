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
}

export class ContractManagementManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    loadSection() {
        const section = document.getElementById('contract-management');
        if (!section) return;
        
        const contracts = this.dataManager.getContracts();
        
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
}