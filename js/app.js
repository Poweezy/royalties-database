// Global application state
let currentUser = null;
let currentSection = 'dashboard';
let royaltyRecords = [];
let userAccounts = [];
let auditLog = [];
let charts = {};

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing application...');
    
    // Suppress browser extension errors
    window.addEventListener('error', function(e) {
        if (e.message.includes('Extension context invalidated') || 
            e.message.includes('message channel closed')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Suppress unhandled promise rejections from extensions
    window.addEventListener('unhandledrejection', function(e) {
        if (e.reason && e.reason.message && 
            (e.reason.message.includes('Extension context') || 
             e.reason.message.includes('message channel'))) {
            e.preventDefault();
            return false;
        }
    });
    
    startLoadingSequence();
});

// Loading sequence
function startLoadingSequence() {
    console.log('Starting loading simulation...');
    
    setTimeout(() => {
        console.log('Loading simulation complete');
        showLoginSection();
    }, 2000);
}

function showLoginSection() {
    console.log('Showing login section...');
    const loadingScreen = document.getElementById('loading-screen');
    const loginSection = document.getElementById('login-section');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    if (loginSection) {
        loginSection.style.display = 'flex';
        console.log('Login section displayed');
        setupLoginForm();
    }
}

// Login functionality
function setupLoginForm() {
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.querySelector('.password-toggle');
    
    // Password toggle functionality
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const input = passwordInput;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput?.value || '';
            const password = passwordInput?.value || '';
            
            console.log('Login attempt:', { username, passwordLength: password.length });
            
            // Simple validation
            if (!username || !password) {
                showValidationError();
                return;
            }
            
            // Simulate login (in real app, this would be an API call)
            simulateLogin(username, password);
        });
    }
}

function showValidationError() {
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    
    if (usernameError) {
        usernameError.style.display = 'block';
    }
    if (passwordError) {
        passwordError.style.display = 'block';
    }
}

function simulateLogin(username, password) {
    // Set current user
    currentUser = {
        username: username,
        role: 'Administrator',
        department: 'Finance',
        lastLogin: new Date().toISOString()
    };
    
    // Hide login, show app
    const loginSection = document.getElementById('login-section');
    const appContainer = document.getElementById('app-container');
    
    if (loginSection) loginSection.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
    
    // Initialize the main application
    initializeApplication();
}

// Main application initialization
function initializeApplication() {
    console.log('Initializing main application...');
    
    // Set user name in header
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.username;
    }
    
    // Setup navigation
    setupNavigation();
    
    // Initialize sample data
    initializeSampleData();
    
    // Setup dashboard
    setupDashboard();
    
    // Setup user management
    setupUserManagement();
    
    // Setup all sections
    setupAllSections();
    
    // Show dashboard by default
    showSection('dashboard');
    
    console.log('Application initialized successfully');
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            if (href === '#logout') {
                handleLogout();
                return;
            }
            
            const sectionId = href.substring(1);
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        currentSection = sectionId;
        
        // Update navigation active state
        updateNavigationState(sectionId);
        
        // Section-specific initialization
        handleSectionSwitch(sectionId);
    }
}

function updateNavigationState(activeSection) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeSection}`) {
            link.classList.add('active');
        }
    });
}

function handleSectionSwitch(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            updateDashboardMetrics();
            break;
        case 'user-management':
            populateUserAccounts();
            populateAuditLog();
            break;
        case 'royalty-records':
            populateRoyaltyRecords();
            break;
        case 'reporting-analytics':
            setupReportingTabs();
            break;
    }
}

// Sample data initialization
function initializeSampleData() {
    // Initialize royalty records
    royaltyRecords = [
        {
            id: 1,
            entity: 'Kwalini Quarry',
            mineral: 'Quarried Stone',
            volume: 1250,
            tariff: 15,
            royalties: 18750,
            date: '2024-01-15',
            status: 'Paid'
        },
        {
            id: 2,
            entity: 'Maloma Colliery',
            mineral: 'Coal',
            volume: 850,
            tariff: 12,
            royalties: 10200,
            date: '2024-01-20',
            status: 'Pending'
        },
        {
            id: 3,
            entity: 'Ngwenya Mine',
            mineral: 'Iron Ore',
            volume: 2100,
            tariff: 25,
            royalties: 52500,
            date: '2024-01-25',
            status: 'Paid'
        },
        {
            id: 4,
            entity: 'Mbabane Quarry',
            mineral: 'Gravel',
            volume: 750,
            tariff: 10,
            royalties: 7500,
            date: '2024-02-01',
            status: 'Overdue'
        },
        {
            id: 5,
            entity: 'Sidvokodvo Quarry',
            mineral: 'River Sand',
            volume: 500,
            tariff: 8,
            royalties: 4000,
            date: '2024-02-05',
            status: 'Paid'
        }
    ];
    
    console.log('Added', royaltyRecords.length, 'sample royalty records');
    
    // Initialize user accounts
    userAccounts = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@eswacaa.sz',
            role: 'Administrator',
            department: 'Management',
            status: 'Active',
            lastLogin: '2024-02-10 09:15:00',
            failedAttempts: 0,
            expires: null,
            created: '2023-01-15'
        },
        {
            id: 2,
            username: 'finance.user',
            email: 'finance@eswacaa.sz',
            role: 'Finance',
            department: 'Finance',
            status: 'Active',
            lastLogin: '2024-02-09 14:30:00',
            failedAttempts: 0,
            expires: null,
            created: '2023-03-20'
        },
        {
            id: 3,
            username: 'audit.reviewer',
            email: 'audit@eswacaa.sz',
            role: 'Auditor',
            department: 'Audit',
            status: 'Active',
            lastLogin: '2024-02-08 11:45:00',
            failedAttempts: 1,
            expires: '2024-12-31',
            created: '2023-06-10'
        }
    ];
    
    console.log('Added', userAccounts.length, 'user accounts');
    
    // Initialize audit log
    console.log('Populating audit log...');
    auditLog = [
        {
            id: 1,
            timestamp: '2024-02-10 09:15:23',
            user: 'admin',
            action: 'Login',
            target: 'System',
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: 'Successful login from administrative workstation'
        },
        {
            id: 2,
            timestamp: '2024-02-10 09:20:15',
            user: 'admin',
            action: 'Create User',
            target: 'finance.user',
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: 'Created new user account for Finance department'
        },
        {
            id: 3,
            timestamp: '2024-02-09 14:30:45',
            user: 'finance.user',
            action: 'Data Access',
            target: 'Royalty Records',
            ipAddress: '192.168.1.105',
            status: 'Success',
            details: 'Accessed monthly royalty reports for January 2024'
        }
    ];
    
    console.log('Added', auditLog.length, 'audit log entries');
}

// Dashboard functionality
function setupDashboard() {
    setupCharts();
    updateDashboardMetrics();
}

function updateDashboardMetrics() {
    const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
    const activeEntities = [...new Set(royaltyRecords.map(r => r.entity))].length;
    const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
    const complianceRate = Math.round((paidRecords / royaltyRecords.length) * 100);
    const pendingApprovals = royaltyRecords.filter(r => r.status === 'Pending').length;
    
    // Update metric displays
    const totalRoyaltiesElement = document.getElementById('total-royalties');
    const activeEntitiesElement = document.getElementById('active-entities');
    const complianceRateElement = document.getElementById('compliance-rate');
    const pendingApprovalsElement = document.getElementById('pending-approvals');
    
    if (totalRoyaltiesElement) {
        totalRoyaltiesElement.textContent = `E${totalRoyalties.toLocaleString()}.00`;
    }
    if (activeEntitiesElement) {
        activeEntitiesElement.textContent = activeEntities;
    }
    if (complianceRateElement) {
        complianceRateElement.textContent = `${complianceRate}%`;
        // Update progress bar
        const progressBar = complianceRateElement.parentElement.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${complianceRate}%`;
        }
    }
    if (pendingApprovalsElement) {
        pendingApprovalsElement.textContent = pendingApprovals;
    }
    
    console.log('Dashboard metrics updated successfully');
}

function setupCharts() {
    // Revenue trends chart
    const revenueCtx = document.getElementById('revenue-trends-chart');
    if (revenueCtx) {
        charts.revenueTrends = new Chart(revenueCtx, {
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
                plugins: {
                    legend: {
                        display: false
                    }
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
    }
    
    // Production by entity chart
    const productionCtx = document.getElementById('production-by-entity-chart');
    if (productionCtx) {
        const entityData = royaltyRecords.reduce((acc, record) => {
            acc[record.entity] = (acc[record.entity] || 0) + record.volume;
            return acc;
        }, {});
        
        charts.productionByEntity = new Chart(productionCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(entityData),
                datasets: [{
                    data: Object.values(entityData),
                    backgroundColor: [
                        '#1a365d',
                        '#2d5a88',
                        '#4a90c2',
                        '#7ba7cc',
                        '#a8c5e2'
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
    
    // Chart controls
    const chartControls = document.querySelectorAll('.chart-btn');
    chartControls.forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.dataset.chartType;
            const chartId = this.dataset.chartId;
            
            // Update active state
            this.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update chart type for revenue trends chart
            if (chartId === 'revenue-trends-chart' && charts.revenueTrends) {
                const chart = charts.revenueTrends;
                
                if (chartType === 'area') {
                    // Create area chart by filling under the line
                    chart.config.type = 'line';
                    chart.data.datasets[0].fill = true;
                    chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.2)';
                } else if (chartType === 'bar') {
                    chart.config.type = 'bar';
                    chart.data.datasets[0].fill = false;
                    chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.8)';
                } else if (chartType === 'line') {
                    chart.config.type = 'line';
                    chart.data.datasets[0].fill = false;
                    chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.1)';
                }
                
                chart.update();
            }
        });
    });
    
    console.log('Set up', chartControls.length, 'chart control buttons');
}

// User Management functionality
function setupUserManagement() {
    // Add user button
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserContainer = document.getElementById('add-user-form-container');
    const closeFormBtn = document.getElementById('close-add-user-form');
    const cancelBtn = document.getElementById('cancel-add-user');
    const resetBtn = document.getElementById('reset-form');
    
    if (addUserBtn && addUserContainer) {
        addUserBtn.addEventListener('click', function() {
            addUserContainer.style.display = 'block';
            addUserContainer.classList.add('show');
            addUserContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    function hideAddUserForm() {
        if (addUserContainer) {
            addUserContainer.classList.add('hide');
            setTimeout(() => {
                addUserContainer.style.display = 'none';
                addUserContainer.classList.remove('show', 'hide');
                resetUserForm();
            }, 300);
        }
    }
    
    function resetUserForm() {
        const form = document.getElementById('add-user-form');
        if (form) {
            form.reset();
            // Clear validations
            form.querySelectorAll('.validation-error, .validation-success').forEach(el => {
                el.style.display = 'none';
            });
            form.querySelectorAll('input, select').forEach(field => {
                field.classList.remove('field-valid', 'field-invalid');
            });
            // Reset password strength
            const strengthBar = document.querySelector('.strength-bar-fill');
            const strengthText = document.querySelector('.strength-text');
            if (strengthBar) strengthBar.style.width = '0%';
            if (strengthText) strengthText.textContent = 'Password Strength: Enter password';
            // Reset submit button
            const submitBtn = document.getElementById('create-user-btn');
            if (submitBtn) submitBtn.disabled = true;
        }
    }
    
    if (closeFormBtn) closeFormBtn.addEventListener('click', hideAddUserForm);
    if (cancelBtn) cancelBtn.addEventListener('click', hideAddUserForm);
    if (resetBtn) resetBtn.addEventListener('click', resetUserForm);
    
    // Form submission
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUserCreation();
        });
    }
    
    // Setup filtering
    setupUserFiltering();
    
    // Setup audit log
    setupAuditLog();
}

function handleUserCreation() {
    const formData = new FormData(document.getElementById('add-user-form'));
    const userData = {
        id: userAccounts.length + 1,
        username: formData.get('username'),
        email: formData.get('email'),
        role: formData.get('role'),
        department: formData.get('department'),
        status: 'Active',
        lastLogin: 'Never',
        failedAttempts: 0,
        expires: formData.get('expires') || null,
        created: new Date().toISOString().split('T')[0]
    };
    
    // Add to user accounts
    userAccounts.push(userData);
    
    // Add to audit log
    auditLog.unshift({
        id: auditLog.length + 1,
        timestamp: new Date().toLocaleString(),
        user: currentUser.username,
        action: 'Create User',
        target: userData.username,
        ipAddress: '192.168.1.100',
        status: 'Success',
        details: `Created new ${userData.role} user account for ${userData.department} department`
    });
    
    // Show success message
    showNotification('User account created successfully!', 'success');
    
    // Hide form and refresh table
    document.getElementById('add-user-form-container').style.display = 'none';
    populateUserAccounts();
    populateAuditLog();
}

function populateUserAccounts() {
    const tbody = document.getElementById('users-table-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    userAccounts.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" data-user-id="${user.id}"></td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
            <td>${user.department}</td>
            <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${user.lastLogin}</td>
            <td>${user.failedAttempts}</td>
            <td>${user.expires || 'Never'}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-primary btn-sm" onclick="editUser(${user.id})" title="Edit user">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="resetPassword(${user.id})" title="Reset password">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})" title="Delete user">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Setup checkbox listeners
    setupUserCheckboxes();
}

function populateAuditLog() {
    const tbody = document.getElementById('audit-log-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    auditLog.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.timestamp}</td>
            <td>${entry.user}</td>
            <td><span class="action-badge ${entry.action.toLowerCase().replace(/\s+/g, '-')}">${entry.action}</span></td>
            <td>${entry.target}</td>
            <td>${entry.ipAddress}</td>
            <td><span class="status-badge ${entry.status.toLowerCase()}">${entry.status}</span></td>
            <td>${entry.details}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewAuditDetails(${entry.id})" title="View details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupUserCheckboxes() {
    const selectAllCheckbox = document.getElementById('select-all-users');
    const userCheckboxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]');
    const bulkDeleteBtn = document.getElementById('bulk-delete-users');
    const selectedCountSpan = document.getElementById('selected-count');
    
    // Select all functionality
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            userCheckboxes.forEach(cb => cb.checked = this.checked);
            updateBulkActions();
        });
    }
    
    // Individual checkbox listeners
    userCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateBulkActions);
    });
    
    function updateBulkActions() {
        const checkedBoxes = document.querySelectorAll('#users-table-tbody input[type="checkbox"]:checked');
        const count = checkedBoxes.length;
        
        if (bulkDeleteBtn) {
            if (count > 0) {
                bulkDeleteBtn.style.display = 'inline-block';
                bulkDeleteBtn.disabled = false;
            } else {
                bulkDeleteBtn.style.display = 'none';
                bulkDeleteBtn.disabled = true;
            }
        }
        
        if (selectedCountSpan) {
            selectedCountSpan.textContent = count;
        }
    }
}

function setupUserFiltering() {
    const applyFiltersBtn = document.getElementById('apply-user-filters');
    const clearFiltersBtn = document.getElementById('clear-user-filters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const roleFilter = document.getElementById('filter-user-role').value;
            const statusFilter = document.getElementById('filter-user-status').value;
            const departmentFilter = document.getElementById('filter-user-department').value;
            
            filterUserAccounts(roleFilter, statusFilter, departmentFilter);
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            document.getElementById('filter-user-role').value = '';
            document.getElementById('filter-user-status').value = '';
            document.getElementById('filter-user-department').value = '';
            populateUserAccounts();
        });
    }
}

function filterUserAccounts(role, status, department) {
    let filteredUsers = userAccounts;
    
    if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    if (status) {
        filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    if (department) {
        filteredUsers = filteredUsers.filter(user => user.department === department);
    }
    
    // Temporarily replace userAccounts for display
    const originalUsers = userAccounts;
    userAccounts = filteredUsers;
    populateUserAccounts();
    userAccounts = originalUsers;
}

function setupAuditLog() {
    const applyAuditFiltersBtn = document.getElementById('apply-audit-filters');
    const clearAuditFiltersBtn = document.getElementById('clear-audit-filters');
    
    if (applyAuditFiltersBtn) {
        applyAuditFiltersBtn.addEventListener('click', function() {
            const fromDate = document.getElementById('audit-from-date').value;
            const toDate = document.getElementById('audit-to-date').value;
            const actionType = document.getElementById('audit-action-type').value;
            
            filterAuditLog(fromDate, toDate, actionType);
        });
    }
    
    if (clearAuditFiltersBtn) {
        clearAuditFiltersBtn.addEventListener('click', function() {
            document.getElementById('audit-from-date').value = '';
            document.getElementById('audit-to-date').value = '';
            document.getElementById('audit-action-type').value = '';
            populateAuditLog();
        });
    }
}

function filterAuditLog(fromDate, toDate, actionType) {
    let filteredLog = auditLog;
    
    if (fromDate) {
        filteredLog = filteredLog.filter(entry => entry.timestamp >= fromDate);
    }
    if (toDate) {
        filteredLog = filteredLog.filter(entry => entry.timestamp <= toDate);
    }
    if (actionType) {
        filteredLog = filteredLog.filter(entry => entry.action === actionType);
    }
    
    // Temporarily replace auditLog for display
    const originalLog = auditLog;
    auditLog = filteredLog;
    populateAuditLog();
    auditLog = originalLog;
}

// Royalty Records functionality
function populateRoyaltyRecords() {
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    royaltyRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.entity}</td>
            <td>${record.mineral}</td>
            <td>${record.volume.toLocaleString()}</td>
            <td>E${record.tariff}</td>
            <td>E${record.royalties.toLocaleString()}</td>
            <td>${record.date}</td>
            <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
            <td>
                <button class="btn btn-primary btn-sm">Edit</button>
                <button class="btn btn-secondary btn-sm">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Reporting & Analytics
function setupReportingTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.querySelector(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Additional sections setup
function setupAllSections() {
    // Royalty Records
    const saveRoyaltyBtn = document.getElementById('save-royalty-btn');
    if (saveRoyaltyBtn) {
        saveRoyaltyBtn.addEventListener('click', function() {
            // Handle royalty record saving
            showNotification('Royalty record saved successfully!', 'success');
        });
    }
    
    // Export functionality
    const exportButtons = document.querySelectorAll('[id*="export"]');
    exportButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Export functionality would be implemented here', 'info');
        });
    });
    
    // Refresh buttons
    const refreshButtons = document.querySelectorAll('[id*="refresh"]');
    refreshButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.id.includes('users')) {
                populateUserAccounts();
            } else if (this.id.includes('audit')) {
                populateAuditLog();
            }
            showNotification('Data refreshed successfully', 'success');
        });
    });
}

// User action handlers (called from HTML)
window.editUser = function(userId) {
    showNotification(`Edit functionality for user ${userId} would be implemented here`, 'info');
};

window.resetPassword = function(userId) {
    if (confirm('Are you sure you want to reset the password for this user?')) {
        showNotification(`Password reset for user ${userId}`, 'success');
        
        // Add to audit log
        auditLog.unshift({
            id: auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            user: currentUser.username,
            action: 'Password Reset',
            target: `User ${userId}`,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: 'Password reset initiated by administrator'
        });
        
        populateAuditLog();
    }
};

window.deleteUser = function(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const userIndex = userAccounts.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const deletedUser = userAccounts[userIndex];
            userAccounts.splice(userIndex, 1);
            
            // Add to audit log
            auditLog.unshift({
                id: auditLog.length + 1,
                timestamp: new Date().toLocaleString(),
                user: currentUser.username,
                action: 'Delete User',
                target: deletedUser.username,
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Deleted user account: ${deletedUser.username}`
            });
            
            populateUserAccounts();
            populateAuditLog();
            showNotification('User deleted successfully', 'success');
        }
    }
};

window.viewAuditDetails = function(entryId) {
    const entry = auditLog.find(e => e.id === entryId);
    if (entry) {
        alert(`Audit Details:\n\nTimestamp: ${entry.timestamp}\nUser: ${entry.user}\nAction: ${entry.action}\nTarget: ${entry.target}\nIP: ${entry.ipAddress}\nStatus: ${entry.status}\nDetails: ${entry.details}`);
    }
};

// Logout functionality
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Add logout to audit log
        auditLog.unshift({
            id: auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            user: currentUser.username,
            action: 'Logout',
            target: 'System',
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: 'User logged out successfully'
        });
        
        // Reset application state
        currentUser = null;
        currentSection = 'dashboard';
        
        // Show login section
        const appContainer = document.getElementById('app-container');
        const loginSection = document.getElementById('login-section');
        
        if (appContainer) appContainer.style.display = 'none';
        if (loginSection) loginSection.style.display = 'flex';
        
        // Clear login form
        const loginForm = document.querySelector('.login-form');
        if (loginForm) loginForm.reset();
        
        showNotification('Logged out successfully', 'success');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => notification.remove());
    }
}

// Export functions for global access
window.populateUserAccounts = populateUserAccounts;
window.populateAuditLog = populateAuditLog;
window.showNotification = showNotification;

console.log('Application module loaded successfully');