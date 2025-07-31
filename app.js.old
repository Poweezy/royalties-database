// Security utility functions
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sanitizeInput(input, type = 'text') {
    if (!input) return '';
    
    input = input.toString().trim();
    
    switch (type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input) ? input : '';
        case 'username':
            return input.replace(/[^a-zA-Z0-9._-]/g, '');
        case 'number':
            return parseInt(input) || 0;
        default:
            return escapeHtml(input);
    }
}

// Global variables
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
    
    // Sanitize and validate input data
    const userData = {
        id: userAccounts.length + 1,
        username: sanitizeInput(formData.get('username'), 'username'),
        email: sanitizeInput(formData.get('email'), 'email'),
        role: escapeHtml(formData.get('role') || ''),
        department: escapeHtml(formData.get('department') || ''),
        status: 'Active',
        lastLogin: 'Never',
        failedAttempts: 0,
        expires: escapeHtml(formData.get('expires') || '') || null,
        created: new Date().toISOString().split('T')[0]
    };
    
    // Validate required fields
    if (!userData.username || userData.username.length < 3) {
        showNotification('Username must be at least 3 characters long', 'error');
        return;
    }
    
    if (!userData.email) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (!userData.role) {
        showNotification('Please select a role', 'error');
        return;
    }
    
    if (!userData.department) {
        showNotification('Please select a department', 'error');
        return;
    }
    
    // Check for duplicate username
    if (userAccounts.some(user => user.username === userData.username)) {
        showNotification('Username already exists', 'error');
        return;
    }
    
    // Check for duplicate email
    if (userAccounts.some(user => user.email === userData.email)) {
        showNotification('Email address already exists', 'error');
        return;
    }
    
    // Add to user accounts
    userAccounts.push(userData);
    
    // Add to audit log with sanitized data
    auditLog.unshift({
        id: auditLog.length + 1,
        timestamp: new Date().toLocaleString(),
        user: escapeHtml(currentUser.username),
        action: 'Create User',
        target: escapeHtml(userData.username),
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
    const userTableBody = document.getElementById('users-table-tbody');
    if (!userTableBody) return;

    userTableBody.innerHTML = '';
    
    userAccounts.forEach((user, index) => {
        const row = userTableBody.insertRow();
        row.innerHTML = `
            <td><input type="checkbox" class="user-checkbox" data-user-id="${sanitizeInput(user.id, 'number')}"></td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td><span class="role-badge ${escapeHtml(user.role.toLowerCase())}">${escapeHtml(user.role)}</span></td>
            <td>${escapeHtml(user.department)}</td>
            <td><span class="status-badge ${escapeHtml(user.status.toLowerCase())}">${escapeHtml(user.status)}</span></td>
            <td>${escapeHtml(user.lastLogin || 'Never')}</td>
            <td>${sanitizeInput(user.failedAttempts || 0, 'number')}</td>
            <td>${escapeHtml(user.expires || 'Never')}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-secondary" onclick="editUser(${sanitizeInput(user.id, 'number')})" title="Edit user">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="resetPassword(${sanitizeInput(user.id, 'number')})" title="Reset password">
                        <i class="fas fa-key"></i> Reset
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${sanitizeInput(user.id, 'number')})" title="Delete user">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
    });

    // Set up checkbox event listeners
    setupUserCheckboxes();
    updateUserMetrics();
}

function setupUserCheckboxes() {
    const selectAllCheckbox = document.getElementById('select-all-users');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    const bulkDeleteBtn = document.getElementById('bulk-delete-users');
    const selectedCountSpan = document.getElementById('selected-count');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            userCheckboxes.forEach(cb => cb.checked = this.checked);
            updateBulkActions();
        });
    }

    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActions);
    });

    function updateBulkActions() {
        const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
        const count = checkedBoxes.length;

        if (selectedCountSpan) selectedCountSpan.textContent = count;
        
        if (bulkDeleteBtn) {
            if (count > 0) {
                bulkDeleteBtn.style.display = 'inline-flex';
                bulkDeleteBtn.disabled = false;
            } else {
                bulkDeleteBtn.style.display = 'none';
                bulkDeleteBtn.disabled = true;
            }
        }

        // Update select all checkbox state
        if (selectAllCheckbox) {
            if (count === 0) {
                selectAllCheckbox.indeterminate = false;
                selectAllCheckbox.checked = false;
            } else if (count === userCheckboxes.length) {
                selectAllCheckbox.indeterminate = false;
                selectAllCheckbox.checked = true;
            } else {
                selectAllCheckbox.indeterminate = true;
            }
        }
    }
}

function updateUserMetrics() {
    const activeUsersCount = document.getElementById('active-users-count');
    const failedLoginsCount = document.getElementById('failed-logins-count');
    const securityAlertsCount = document.getElementById('security-alerts-count');
    const passwordComplianceRate = document.getElementById('password-compliance-rate');

    if (activeUsersCount) {
        const activeUsers = userAccounts.filter(user => user.status === 'Active').length;
        activeUsersCount.textContent = activeUsers;
    }

    if (failedLoginsCount) {
        const totalFailedLogins = userAccounts.reduce((sum, user) => sum + (user.failedAttempts || 0), 0);
        failedLoginsCount.textContent = totalFailedLogins;
    }

    if (securityAlertsCount) {
        securityAlertsCount.textContent = 'None';
    }

    if (passwordComplianceRate) {
        passwordComplianceRate.textContent = '100%';
    }
}

// User Management Actions
function editUser(userId) {
    const user = userAccounts.find(u => u.id === userId);
    if (!user) return;

    showNotification(`Editing user: ${user.username}`, 'info');
    // You would implement edit form logic here
}

function resetPassword(userId) {
    const user = userAccounts.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`Reset password for ${user.username}?`)) {
        showNotification(`Password reset email sent to ${user.email}`, 'success');
        
        // Add audit log entry
        const auditEntry = {
            id: auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            user: 'admin',
            action: 'Password Reset',
            target: user.username,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `Password reset initiated for user ${user.username}`
        };
        auditLog.push(auditEntry);
        populateAuditLog();
    }
}

function deleteUser(userId) {
    const user = userAccounts.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
        const index = userAccounts.findIndex(u => u.id === userId);
        if (index > -1) {
            userAccounts.splice(index, 1);
            populateUserAccounts();
            showNotification(`User "${user.username}" has been deleted`, 'success');
            
            // Add audit log entry
            const auditEntry = {
                id: auditLog.length + 1,
                timestamp: new Date().toLocaleString(),
                user: 'admin',
                action: 'Delete User',
                target: user.username,
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `User ${user.username} deleted from system`
            };
            auditLog.push(auditEntry);
            populateAuditLog();
        }
    }
}

// Audit Log Functions
function populateAuditLog() {
    const auditTableBody = document.getElementById('audit-log-tbody');
    if (!auditTableBody) return;

    auditTableBody.innerHTML = '';
    
    auditLog.forEach(entry => {
        const row = auditTableBody.insertRow();
        row.innerHTML = `
            <td>${escapeHtml(entry.timestamp)}</td>
            <td>${escapeHtml(entry.user)}</td>
            <td><span class="action-badge ${escapeHtml(entry.action.toLowerCase().replace(/\s+/g, '-'))}">${escapeHtml(entry.action)}</span></td>
            <td>${escapeHtml(entry.target)}</td>
            <td>${escapeHtml(entry.ipAddress)}</td>
            <td><span class="status-badge ${escapeHtml(entry.status.toLowerCase())}">${escapeHtml(entry.status)}</span></td>
            <td>${escapeHtml(entry.details)}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-secondary" onclick="viewAuditDetails(${sanitizeInput(entry.id, 'number')})" title="View details">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-info" onclick="exportAuditEntry(${sanitizeInput(entry.id, 'number')})" title="Export entry">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </td>
        `;
    });
}

function viewAuditDetails(entryId) {
    const entry = auditLog.find(e => e.id === entryId);
    if (!entry) return;

    alert(`Audit Entry Details:\n\nTimestamp: ${entry.timestamp}\nUser: ${entry.user}\nAction: ${entry.action}\nTarget: ${entry.target}\nIP Address: ${entry.ipAddress}\nStatus: ${entry.status}\nDetails: ${entry.details}`);
}

function exportAuditEntry(entryId) {
    const entry = auditLog.find(e => e.id === entryId);
    if (!entry) return;

    const csv = `Timestamp,User,Action,Target,IP Address,Status,Details\n"${entry.timestamp}","${entry.user}","${entry.action}","${entry.target}","${entry.ipAddress}","${entry.status}","${entry.details}"`;
    downloadCSV(csv, `audit_entry_${entry.id}.csv`);
    showNotification('Audit entry exported successfully', 'success');
}

// Royalty Records functionality
function populateRoyaltyRecords() {
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    royaltyRecords.forEach(record => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${escapeHtml(record.entity)}</td>
            <td>${escapeHtml(record.mineral)}</td>
            <td>${sanitizeInput(record.volume, 'number').toLocaleString()}</td>
            <td>E${escapeHtml(record.tariff)}</td>
            <td>E${sanitizeInput(record.royalties, 'number').toLocaleString()}</td>
            <td>${escapeHtml(record.date)}</td>
            <td><span class="status-badge ${escapeHtml(record.status.toLowerCase())}">${escapeHtml(record.status)}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-secondary" onclick="editRecord(${sanitizeInput(record.id, 'number')})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-info" onclick="viewRecord(${sanitizeInput(record.id, 'number')})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecord(${sanitizeInput(record.id, 'number')})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
    });
}

// Record action handlers
function editRecord(recordId) {
    showNotification(`Edit functionality for record ${recordId} would be implemented here`, 'info');
}

function viewRecord(recordId) {
    const record = royaltyRecords.find(r => r.id === recordId);
    if (record) {
        alert(`Record Details:\n\nEntity: ${record.entity}\nMineral: ${record.mineral}\nVolume: ${record.volume} m³\nTariff: E${record.tariff}/m³\nTotal Royalties: E${record.royalties}\nDate: ${record.date}\nStatus: ${record.status}`);
    }
}

function deleteRecord(recordId) {
    if (confirm('Are you sure you want to delete this record?')) {
        const index = royaltyRecords.findIndex(r => r.id === recordId);
        if (index > -1) {
            royaltyRecords.splice(index, 1);
            populateRoyaltyRecords();
            updateDashboardMetrics();
            showNotification('Record deleted successfully', 'success');
        }
    }
}

// Reporting & Analytics functionality
function setupReportingTabs() {
    const reportTabs = document.querySelectorAll('.report-tabs .tab-btn');
    const reportContents = document.querySelectorAll('.tab-content');
    
    reportTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            reportTabs.forEach(t => t.classList.remove('active'));
            reportContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.querySelector(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set notification content
    const iconMap = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    
    const icon = iconMap[type] || iconMap['info'];
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Form validation and user filtering setup
function setupUserFiltering() {
    // Set up filter buttons
    const applyFiltersBtn = document.getElementById('apply-user-filters');
    const clearFiltersBtn = document.getElementById('clear-user-filters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const roleFilter = document.getElementById('filter-user-role')?.value || '';
            const statusFilter = document.getElementById('filter-user-status')?.value || '';
            const departmentFilter = document.getElementById('filter-user-department')?.value || '';
            
            let filteredUsers = userAccounts.filter(user => {
                return (!roleFilter || user.role === roleFilter) &&
                       (!statusFilter || user.status === statusFilter) &&
                       (!departmentFilter || user.department === departmentFilter);
            });
            
            updateUserTable(filteredUsers);
            showNotification(`Found ${filteredUsers.length} user(s) matching the filters`, 'info');
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            document.getElementById('filter-user-role').value = '';
            document.getElementById('filter-user-status').value = '';
            document.getElementById('filter-user-department').value = '';
            populateUserAccounts();
            showNotification('Filters cleared, showing all users', 'info');
        });
    }
}

function updateUserTable(users) {
    const userTableBody = document.getElementById('users-table-tbody');
    if (!userTableBody) return;

    userTableBody.innerHTML = '';
    
    if (users.length === 0) {
        const row = userTableBody.insertRow();
        row.innerHTML = `<td colspan="10" style="text-align: center; padding: 2rem;">No users match the selected filters</td>`;
        return;
    }

    users.forEach(user => {
        const row = userTableBody.insertRow();
        row.innerHTML = `
            <td><input type="checkbox" class="user-checkbox" data-user-id="${user.id}"></td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
            <td>${user.department}</td>
            <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${user.lastLogin || 'Never'}</td>
            <td>${user.failedAttempts || 0}</td>
            <td>${user.expires || 'Never'}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})" title="Edit user">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="resetPassword(${user.id})" title="Reset password">
                        <i class="fas fa-key"></i> Reset
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})" title="Delete user">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
    });

    setupUserCheckboxes();
}

function setupAuditLog() {
    // Set up audit log filters
    const applyAuditFiltersBtn = document.getElementById('apply-audit-filters');
    const clearAuditFiltersBtn = document.getElementById('clear-audit-filters');
    
    if (applyAuditFiltersBtn) {
        applyAuditFiltersBtn.addEventListener('click', function() {
            const fromDate = document.getElementById('audit-from-date')?.value;
            const toDate = document.getElementById('audit-to-date')?.value;
            const actionType = document.getElementById('audit-action-type')?.value;
            
            let filteredEntries = auditLog.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                const matchesDate = (!fromDate || entryDate >= new Date(fromDate)) &&
                                  (!toDate || entryDate <= new Date(toDate));
                const matchesAction = !actionType || entry.action === actionType;
                
                return matchesDate && matchesAction;
            });
            
            updateAuditTable(filteredEntries);
            showNotification(`Found ${filteredEntries.length} audit entries matching the filters`, 'info');
        });
    }
    
    if (clearAuditFiltersBtn) {
        clearAuditFiltersBtn.addEventListener('click', function() {
            document.getElementById('audit-from-date').value = '';
            document.getElementById('audit-to-date').value = '';
            document.getElementById('audit-action-type').value = '';
            populateAuditLog();
            showNotification('Audit filters cleared', 'info');
        });
    }
}

function updateAuditTable(entries) {
    const auditTableBody = document.getElementById('audit-log-tbody');
    if (!auditTableBody) return;

    auditTableBody.innerHTML = '';
    
    if (entries.length === 0) {
        const row = auditTableBody.insertRow();
        row.innerHTML = `<td colspan="8" style="text-align: center; padding: 2rem;">No audit entries match the selected filters</td>`;
        return;
    }

    entries.forEach(entry => {
        const row = auditTableBody.insertRow();
        row.innerHTML = `
            <td>${entry.timestamp}</td>
            <td>${entry.user}</td>
            <td><span class="action-badge ${entry.action.toLowerCase().replace(/\s+/g, '-')}">${entry.action}</span></td>
            <td>${entry.target}</td>
            <td>${entry.ipAddress}</td>
            <td><span class="status-badge ${entry.status.toLowerCase()}">${entry.status}</span></td>
            <td>${entry.details}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-secondary" onclick="viewAuditDetails(${entry.id})" title="View details">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-info" onclick="exportAuditEntry(${entry.id})" title="Export entry">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </td>
        `;
    });
}

// Utility functions
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Additional section setup
function setupAllSections() {
    // Setup royalty records
    const saveRoyaltyBtn = document.getElementById('save-royalty-btn');
    if (saveRoyaltyBtn) {
        saveRoyaltyBtn.addEventListener('click', function() {
            const entity = document.getElementById('entity')?.value;
            const mineral = document.getElementById('mineral')?.value;
            const volume = parseFloat(document.getElementById('volume')?.value);
            const tariff = parseFloat(document.getElementById('tariff')?.value);
            const date = document.getElementById('payment-date')?.value;
            
            if (entity && mineral && volume && tariff && date) {
                const newRecord = {
                    id: royaltyRecords.length + 1,
                    entity,
                    mineral,
                    volume,
                    tariff,
                    royalties: volume * tariff,
                    date,
                    status: 'Pending'
                };
                
                royaltyRecords.push(newRecord);
                populateRoyaltyRecords();
                updateDashboardMetrics();
                showNotification('Royalty record saved successfully', 'success');
                
                // Clear form
                document.getElementById('entity').value = '';
                document.getElementById('mineral').value = '';
                document.getElementById('volume').value = '';
                document.getElementById('tariff').value = '';
                document.getElementById('payment-date').value = '';
            } else {
                showNotification('Please fill in all required fields', 'error');
            }
        });
    }
    
    // Setup logout
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear current user
        currentUser = null;
        
        // Hide app, show login
        const loginSection = document.getElementById('login-section');
        const appContainer = document.getElementById('app-container');
        
        if (appContainer) appContainer.style.display = 'none';
        if (loginSection) loginSection.style.display = 'flex';
        
        // Clear login form
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        showNotification('Logged out successfully', 'info');
    }
}

// Make functions globally available for HTML onclick handlers
window.editUser = editUser;
window.resetPassword = resetPassword;
window.deleteUser = deleteUser;
window.viewAuditDetails = viewAuditDetails;
window.exportAuditEntry = exportAuditEntry;
window.editRecord = editRecord;
window.viewRecord = viewRecord;
window.deleteRecord = deleteRecord;
window.populateUserAccounts = populateUserAccounts;
window.populateAuditLog = populateAuditLog;
window.populateRoyaltyRecords = populateRoyaltyRecords;

console.log('Application module loaded successfully');
