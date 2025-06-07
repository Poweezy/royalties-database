// Mining Royalties Manager - Main Application
console.log('Mining Royalties Manager v1.0 - Loading...');

// Global application state
let currentUser = null;
let currentSection = 'dashboard';
let royaltyRecords = [];
let userAccounts = [];
let auditLog = [];
let charts = {};
let entities = [];
let minerals = [];

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Starting application initialization...');
    
    // Initialize error suppression
    suppressNonCriticalErrors();
    
    // Start loading sequence
    startLoadingSequence();
});

// Error suppression for cleaner console
function suppressNonCriticalErrors() {
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ').toLowerCase();
        const suppressPatterns = [
            'favicon', 'fontawesome', 'cors', 'extension context',
            'manifest', 'service worker', 'kit.fontawesome'
        ];
        
        if (!suppressPatterns.some(pattern => message.includes(pattern))) {
            originalError.apply(console, args);
        }
    };
}

// Loading sequence
function startLoadingSequence() {
    console.log('Starting loading simulation...');
    
    // Initialize data structures
    initializeApplicationData();
    
    // Simulate loading time
    setTimeout(() => {
        console.log('Loading complete - Showing login');
        hideLoadingShowLogin();
    }, 2000);
}

function hideLoadingShowLogin() {
    const loadingScreen = document.getElementById('loading-screen');
    const loginSection = document.getElementById('login-section');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    if (loginSection) {
        loginSection.style.display = 'flex';
        setupLoginForm();
    }
}

// Initialize application data
function initializeApplicationData() {
    // Initialize entities and minerals
    entities = [
        { id: 1, name: 'Kwalini Quarry', type: 'Quarry', location: 'Kwaluseni', status: 'Active' },
        { id: 2, name: 'Maloma Colliery', type: 'Mine', location: 'Maloma', status: 'Active' },
        { id: 3, name: 'Ngwenya Mine', type: 'Mine', location: 'Ngwenya', status: 'Active' },
        { id: 4, name: 'Mbabane Quarry', type: 'Quarry', location: 'Mbabane', status: 'Active' },
        { id: 5, name: 'Sidvokodvo Quarry', type: 'Quarry', location: 'Sidvokodvo', status: 'Active' },
        { id: 6, name: 'Piggs Peak Mine', type: 'Mine', location: 'Piggs Peak', status: 'Inactive' }
    ];

    minerals = [
        { id: 1, name: 'Coal', tariff: 12, unit: 'per tonne' },
        { id: 2, name: 'Iron Ore', tariff: 25, unit: 'per tonne' },
        { id: 3, name: 'Quarried Stone', tariff: 15, unit: 'per m³' },
        { id: 4, name: 'River Sand', tariff: 8, unit: 'per m³' },
        { id: 5, name: 'Gravel', tariff: 10, unit: 'per m³' },
        { id: 6, name: 'Clay', tariff: 5, unit: 'per tonne' }
    ];

    // Initialize royalty records with more realistic data
    royaltyRecords = [
        {
            id: 1,
            entity: 'Kwalini Quarry',
            mineral: 'Quarried Stone',
            volume: 1250,
            tariff: 15,
            royalties: 18750,
            date: '2024-01-15',
            status: 'Paid',
            referenceNumber: 'ROY-2024-001'
        },
        {
            id: 2,
            entity: 'Maloma Colliery',
            mineral: 'Coal',
            volume: 850,
            tariff: 12,
            royalties: 10200,
            date: '2024-01-20',
            status: 'Pending',
            referenceNumber: 'ROY-2024-002'
        },
        {
            id: 3,
            entity: 'Ngwenya Mine',
            mineral: 'Iron Ore',
            volume: 2100,
            tariff: 25,
            royalties: 52500,
            date: '2024-01-25',
            status: 'Paid',
            referenceNumber: 'ROY-2024-003'
        },
        {
            id: 4,
            entity: 'Mbabane Quarry',
            mineral: 'Gravel',
            volume: 750,
            tariff: 10,
            royalties: 7500,
            date: '2024-02-01',
            status: 'Overdue',
            referenceNumber: 'ROY-2024-004'
        },
        {
            id: 5,
            entity: 'Sidvokodvo Quarry',
            mineral: 'River Sand',
            volume: 500,
            tariff: 8,
            royalties: 4000,
            date: '2024-02-05',
            status: 'Paid',
            referenceNumber: 'ROY-2024-005'
        },
        {
            id: 6,
            entity: 'Kwalini Quarry',
            mineral: 'Quarried Stone',
            volume: 980,
            tariff: 15,
            royalties: 14700,
            date: '2024-02-08',
            status: 'Pending',
            referenceNumber: 'ROY-2024-006'
        }
    ];

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
            username: 'editor',
            email: 'editor@eswacaa.sz',
            role: 'Editor',
            department: 'Finance',
            status: 'Active',
            lastLogin: '2024-02-09 14:30:00',
            failedAttempts: 0,
            expires: '2024-12-31',
            created: '2023-03-20'
        },
        {
            id: 3,
            username: 'viewer',
            email: 'viewer@eswacaa.sz',
            role: 'Viewer',
            department: 'Audit',
            status: 'Active',
            lastLogin: '2024-02-08 11:45:00',
            failedAttempts: 1,
            expires: '2024-12-31',
            created: '2023-06-10'
        }
    ];

    // Initialize audit log
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
            target: 'editor',
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: 'Created new user account for Finance department'
        },
        {
            id: 3,
            timestamp: '2024-02-09 14:30:45',
            user: 'editor',
            action: 'Data Access',
            target: 'Royalty Records',
            ipAddress: '192.168.1.105',
            status: 'Success',
            details: 'Accessed monthly royalty reports for January 2024'
        },
        {
            id: 4,
            timestamp: '2024-02-09 11:22:33',
            user: 'viewer',
            action: 'Failed Login',
            target: 'System',
            ipAddress: '192.168.1.108',
            status: 'Failed',
            details: 'Failed login attempt - incorrect password'
        },
        {
            id: 5,
            timestamp: '2024-02-08 16:45:12',
            user: 'admin',
            action: 'Modify User',
            target: 'viewer',
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: 'Updated user permissions for audit department'
        }
    ];

    console.log('Application data initialized:', {
        entities: entities.length,
        minerals: minerals.length,
        royaltyRecords: royaltyRecords.length,
        userAccounts: userAccounts.length,
        auditEntries: auditLog.length
    });
}

// Login functionality
function setupLoginForm() {
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
            if (icon) {
                icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
        });
    }
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput?.value?.trim() || '';
            const password = passwordInput?.value?.trim() || '';
            
            if (!username || !password) {
                showValidationErrors();
                return;
            }
            
            // Authenticate user
            authenticateUser(username, password);
        });
    }
    
    // Enter key support
    [usernameInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    });
}

function showValidationErrors() {
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    
    if (usernameError) usernameError.style.display = 'block';
    if (passwordError) passwordError.style.display = 'block';
    
    setTimeout(() => {
        if (usernameError) usernameError.style.display = 'none';
        if (passwordError) passwordError.style.display = 'none';
    }, 3000);
}

function authenticateUser(username, password) {
    // Valid credentials
    const validCredentials = [
        { username: 'admin', password: 'admin123', role: 'Administrator' },
        { username: 'editor', password: 'editor123', role: 'Editor' },
        { username: 'viewer', password: 'viewer123', role: 'Viewer' }
    ];
    
    const user = validCredentials.find(cred => 
        cred.username === username && cred.password === password
    );
    
    if (user) {
        currentUser = {
            username: user.username,
            role: user.role,
            department: user.role === 'Administrator' ? 'Management' : 
                      user.role === 'Editor' ? 'Finance' : 'Audit',
            lastLogin: new Date().toISOString()
        };
        
        // Add login to audit log
        auditLog.unshift({
            id: auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            user: username,
            action: 'Login',
            target: 'System',
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `Successful login as ${user.role}`
        });
        
        showMainApplication();
    } else {
        showNotification('Invalid credentials. Try: admin/admin123, editor/editor123, or viewer/viewer123', 'error');
        
        // Add failed login to audit log
        auditLog.unshift({
            id: auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            user: username || 'Unknown',
            action: 'Failed Login',
            target: 'System',
            ipAddress: '192.168.1.100',
            status: 'Failed',
            details: 'Failed login attempt - invalid credentials'
        });
    }
}

function showMainApplication() {
    const loginSection = document.getElementById('login-section');
    const appContainer = document.getElementById('app-container');
    
    if (loginSection) loginSection.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
    
    // Initialize main application
    initializeMainApplication();
}

function initializeMainApplication() {
    console.log('Initializing main application for user:', currentUser);
    
    // Update user display
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && currentUser) {
        userNameElement.textContent = `${currentUser.username} (${currentUser.role})`;
    }
    
    // Setup navigation
    setupNavigation();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Show welcome notification
    showNotification(`Welcome back, ${currentUser.username}!`, 'success');
    
    console.log('Main application initialized successfully');
}

// Navigation system
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
    
    // Mobile sidebar toggle
    const sidebarClose = document.getElementById('sidebar-close');
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
            document.getElementById('sidebar').classList.remove('active');
        });
    }
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
        
        // Load section content
        loadSectionContent(sectionId);
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

function loadSectionContent(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            updateDashboardMetrics();
            updateRecentActivity();
            // Only setup charts if they don't exist or need refresh
            if (!charts.revenueTrends || !charts.productionByEntity) {
                setupCharts();
            }
            break;
        case 'user-management':
            loadUserManagementSection();
            break;
        case 'royalty-records':
            loadRoyaltyRecordsSection();
            break;
        case 'audit-dashboard':
            loadAuditDashboardSection();
            break;
        case 'reporting-analytics':
            loadReportingAnalyticsSection();
            break;
        default:
            loadGenericSection(sectionId);
    }
}

// Dashboard functionality
function initializeDashboard() {
    updateDashboardMetrics();
    setupCharts();
    updateRecentActivity();
}

function updateDashboardMetrics() {
    const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
    const activeEntities = entities.filter(e => e.status === 'Active').length;
    const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
    const complianceRate = Math.round((paidRecords / royaltyRecords.length) * 100);
    const pendingApprovals = royaltyRecords.filter(r => r.status === 'Pending').length;
    
    // Update displays
    document.getElementById('total-royalties').textContent = `E ${totalRoyalties.toLocaleString()}.00`;
    document.getElementById('active-entities').textContent = activeEntities;
    document.getElementById('compliance-rate').textContent = `${complianceRate}%`;
    document.getElementById('pending-approvals').textContent = pendingApprovals;
    
    // Update progress bar
    const progressBar = document.getElementById('compliance-progress');
    if (progressBar) {
        progressBar.style.width = `${complianceRate}%`;
    }
    
    // Update trend indicators
    document.getElementById('royalties-trend').textContent = '+12.5%';
    document.getElementById('entities-trend').textContent = '+2';
    document.getElementById('compliance-trend').textContent = '+2.1%';
    document.getElementById('pending-text').textContent = pendingApprovals > 0 ? 'Requires attention' : 'No pending items';
}

function setupCharts() {
    // Destroy existing charts before creating new ones
    if (charts.revenueTrends) {
        charts.revenueTrends.destroy();
        charts.revenueTrends = null;
    }
    
    if (charts.productionByEntity) {
        charts.productionByEntity.destroy();
        charts.productionByEntity = null;
    }
    
    // Revenue trends chart
    const revenueCtx = document.getElementById('revenue-trends-chart');
    if (revenueCtx && typeof Chart !== 'undefined') {
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
                    legend: { display: false }
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
    if (productionCtx && typeof Chart !== 'undefined') {
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
                        '#1a365d', '#2d5a88', '#4a90c2', '#7ba7cc', '#a8c5e2', '#d4af37'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Setup chart controls
    setupChartControls();
}

function setupChartControls() {
    const chartButtons = document.querySelectorAll('.chart-btn');
    chartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.dataset.chartType;
            const chartId = this.dataset.chartId;
            
            // Update active state
            this.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update chart if it exists
            if (chartId === 'revenue-trends-chart' && charts.revenueTrends) {
                updateChartType(charts.revenueTrends, chartType);
            }
        });
    });
}

function updateChartType(chart, type) {
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
}

function updateRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    const recentEntries = auditLog.slice(0, 5);
    
    activityContainer.innerHTML = recentEntries.map(entry => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(entry.action)}"></i>
            </div>
            <div class="activity-content">
                <p><strong>${entry.user}</strong> ${entry.action.toLowerCase()} ${entry.target}</p>
                <small>${entry.timestamp}</small>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(action) {
    const iconMap = {
        'Login': 'sign-in-alt',
        'Create User': 'user-plus',
        'Modify User': 'user-edit',
        'Delete User': 'user-minus',
        'Data Access': 'eye',
        'Failed Login': 'exclamation-triangle'
    };
    return iconMap[action] || 'circle';
}

// Section loaders
function loadUserManagementSection() {
    const section = document.getElementById('user-management');
    if (!section || section.innerHTML.trim()) return;
    
    section.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>User Management</h1>
                <p>Manage system users and permissions</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" id="add-user-btn">
                    <i class="fas fa-plus"></i> Add User
                </button>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="metric-card card">
                <div class="card-header">
                    <h3><i class="fas fa-users"></i> Active Users</h3>
                </div>
                <div class="card-body">
                    <p id="active-users-count">${userAccounts.filter(u => u.status === 'Active').length}</p>
                </div>
            </div>
            <div class="metric-card card">
                <div class="card-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Failed Logins</h3>
                </div>
                <div class="card-body">
                    <p id="failed-logins-count">${userAccounts.reduce((sum, u) => sum + (u.failedAttempts || 0), 0)}</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>User Accounts</h3>
            </div>
            <div class="table-container">
                <table class="data-table" id="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-tbody">
                        ${userAccounts.map(user => `
                            <tr>
                                <td>${user.username}</td>
                                <td>${user.email}</td>
                                <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                                <td>${user.department}</td>
                                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                                <td>${user.lastLogin || 'Never'}</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                                            <i class="fas fa-trash"></i> Delete
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

function loadRoyaltyRecordsSection() {
    const section = document.getElementById('royalty-records');
    if (!section) return;
    
    section.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Royalty Records</h1>
                <p>Manage royalty payments and records</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="showAddRecordForm()">
                    <i class="fas fa-plus"></i> Add Record
                </button>
                <button class="btn btn-info" onclick="exportRecords()">
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
                                        <button class="btn btn-sm btn-secondary" onclick="viewRecord(${record.id})">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        <button class="btn btn-sm btn-info" onclick="editRecord(${record.id})">
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

function loadAuditDashboardSection() {
    const section = document.getElementById('audit-dashboard');
    if (!section) return;
    
    section.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Audit Dashboard</h1>
                <p>System audit logs and security monitoring</p>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Audit Log</h3>
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
                    <tbody>
                        ${auditLog.map(entry => `
                            <tr>
                                <td>${entry.timestamp}</td>
                                <td>${entry.user}</td>
                                <td><span class="action-badge ${entry.action.toLowerCase().replace(/\s+/g, '-')}">${entry.action}</span></td>
                                <td>${entry.target}</td>
                                <td>${entry.ipAddress}</td>
                                <td><span class="status-badge ${entry.status.toLowerCase()}">${entry.status}</span></td>
                                <td>${entry.details}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function loadReportingAnalyticsSection() {
    const section = document.getElementById('reporting-analytics');
    if (!section) return;
    
    section.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>Reporting & Analytics</h1>
                <p>Generate reports and view analytics</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary">
                    <i class="fas fa-chart-bar"></i> Generate Report
                </button>
                <button class="btn btn-info">
                    <i class="fas fa-download"></i> Export Data
                </button>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="metric-card card">
                <div class="card-header">
                    <h3><i class="fas fa-calendar-month"></i> Monthly Collections</h3>
                </div>
                <div class="card-body">
                    <p>E ${royaltyRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.royalties, 0).toLocaleString()}</p>
                    <small class="trend-positive">
                        <i class="fas fa-arrow-up"></i> +15.2% from last month
                    </small>
                </div>
            </div>
            <div class="metric-card card">
                <div class="card-header">
                    <h3><i class="fas fa-percentage"></i> Collection Rate</h3>
                </div>
                <div class="card-body">
                    <p>${Math.round((royaltyRecords.filter(r => r.status === 'Paid').length / royaltyRecords.length) * 100)}%</p>
                    <small class="trend-positive">
                        <i class="fas fa-arrow-up"></i> +3.1% this quarter
                    </small>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Quick Reports</h3>
            </div>
            <div class="card-body">
                <div class="quick-reports-grid">
                    <div class="report-card">
                        <div class="report-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="report-info">
                            <h5>Monthly Revenue Report</h5>
                            <p>Detailed breakdown of monthly collections by entity and mineral type</p>
                            <div class="report-meta">Last generated: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="report-card">
                        <div class="report-icon">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="report-info">
                            <h5>Entity Performance Report</h5>
                            <p>Performance analysis by mining entity including compliance metrics</p>
                            <div class="report-meta">Last generated: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadGenericSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const title = sectionId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    section.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>${title}</h1>
                <p>This section is under development</p>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body">
                <h3>${title}</h3>
                <p>The ${title.toLowerCase()} functionality will be available in a future update.</p>
            </div>
        </div>
    `;
}

// Action handlers
function editUser(userId) {
    const user = userAccounts.find(u => u.id === userId);
    if (user) {
        showNotification(`Edit functionality for ${user.username} would be implemented here`, 'info');
    }
}

function deleteUser(userId) {
    const user = userAccounts.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
        const index = userAccounts.findIndex(u => u.id === userId);
        userAccounts.splice(index, 1);
        
        // Add audit entry
        auditLog.unshift({
            id: auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            user: currentUser.username,
            action: 'Delete User',
            target: user.username,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `User ${user.username} deleted by ${currentUser.username}`
        });
        
        showNotification(`User "${user.username}" deleted successfully`, 'success');
        loadUserManagementSection();
    }
}

function viewRecord(recordId) {
    const record = royaltyRecords.find(r => r.id === recordId);
    if (record) {
        alert(`Record: ${record.referenceNumber}\nEntity: ${record.entity}\nMineral: ${record.mineral}\nVolume: ${record.volume}\nRoyalties: E${record.royalties}\nStatus: ${record.status}`);
    }
}

function editRecord(recordId) {
    showNotification(`Edit functionality for record ${recordId} would be implemented here`, 'info');
}

// Utility functions
function showNotification(message, type = 'info') {
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Cleanup charts before logout
        if (charts.revenueTrends) {
            charts.revenueTrends.destroy();
            charts.revenueTrends = null;
        }
        
        if (charts.productionByEntity) {
            charts.productionByEntity.destroy();
            charts.productionByEntity = null;
        }
        
        // Add logout audit entry
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
        
        currentUser = null;
        
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

// Make functions globally available
window.editUser = editUser;
window.deleteUser = deleteUser;
window.viewRecord = viewRecord;
window.editRecord = editRecord;
window.showAddRecordForm = () => showNotification('Add record form would be implemented here', 'info');
window.exportRecords = () => showNotification('Export functionality would be implemented here', 'info');

console.log('Mining Royalties Manager application loaded successfully');
