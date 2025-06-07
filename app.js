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
let contracts = [];

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

    // Initialize comprehensive contract data
    contracts = [
        {
            id: 'MC-2024-001',
            stakeholder: 'Government of Eswatini',
            stakeholderType: 'government',
            entity: 'Maloma Colliery',
            contractType: 'Mining License Agreement',
            calculationMethod: 'ad-valorem',
            royaltyRate: '2.5% of gross value',
            baseRate: 2.5,
            rateType: 'percentage',
            startDate: '2024-01-01',
            endDate: '2029-12-31',
            status: 'active',
            totalValue: 15500000,
            paymentSchedule: 'monthly',
            paymentDue: 15, // 15th of each month
            lateFeeRate: 2.0,
            gracePeriod: 30,
            escalationClause: {
                enabled: true,
                frequency: 'annual',
                rate: 2.5,
                nextEscalation: '2025-03-15'
            },
            conditions: [
                'Environmental compliance required',
                'Quarterly production reports mandatory',
                'Safety standards certification'
            ],
            signedDate: '2023-12-15',
            lastReview: '2024-01-01',
            nextReview: '2025-01-01'
        },
        {
            id: 'LC-2024-002',
            stakeholder: 'Mhlume Holdings Ltd',
            stakeholderType: 'private',
            entity: 'Ngwenya Mine',
            contractType: 'Private Land Lease',
            calculationMethod: 'profit-based',
            royaltyRate: '15% of net profit',
            baseRate: 15.0,
            rateType: 'percentage',
            startDate: '2024-03-15',
            endDate: '2027-03-14',
            status: 'active',
            totalValue: 8200000,
            paymentSchedule: 'quarterly',
            paymentDue: 'end-of-quarter',
            lateFeeRate: 1.5,
            gracePeriod: 14,
            escalationClause: {
                enabled: false
            },
            conditions: [
                'Land restoration fund contribution',
                'Community development levy',
                'Water usage monitoring'
            ],
            signedDate: '2024-02-28',
            lastReview: '2024-03-15',
            nextReview: '2025-03-15'
        },
        {
            id: 'LO-2024-003',
            stakeholder: 'Magwegwe Community Trust',
            stakeholderType: 'landowner',
            entity: 'Piggs Peak Quarry',
            contractType: 'Landowner Royalty Agreement',
            calculationMethod: 'quantity-based',
            royaltyRate: 'E 12 per tonne',
            baseRate: 12.0,
            rateType: 'fixed-amount',
            startDate: '2024-06-01',
            endDate: '2025-05-31',
            status: 'pending-renewal',
            totalValue: 2800000,
            paymentSchedule: 'monthly',
            paymentDue: 1, // 1st of each month
            lateFeeRate: 3.0,
            gracePeriod: 7,
            escalationClause: {
                enabled: true,
                frequency: 'annual',
                rate: 3.0,
                nextEscalation: '2025-06-01'
            },
            conditions: [
                'Traditional land usage rights respected',
                'Local employment priority',
                'Cultural heritage site protection'
            ],
            signedDate: '2024-05-15',
            lastReview: '2024-06-01',
            nextReview: '2025-01-01'
        },
        {
            id: 'JV-2024-004',
            stakeholder: 'Sikhupe Mining Consortium',
            stakeholderType: 'joint-venture',
            entity: 'Sidvokodvo Quarry',
            contractType: 'Joint Venture Agreement',
            calculationMethod: 'hybrid',
            royaltyRate: '2% + E 8 per tonne',
            baseRate: 2.0,
            fixedAmount: 8.0,
            rateType: 'hybrid',
            startDate: '2024-02-01',
            endDate: '2029-01-31',
            status: 'active',
            totalValue: 18700000,
            paymentSchedule: 'quarterly',
            paymentDue: 'end-of-quarter',
            lateFeeRate: 2.5,
            gracePeriod: 21,
            escalationClause: {
                enabled: true,
                frequency: 'biennial',
                rate: 1.5,
                nextEscalation: '2026-02-01'
            },
            conditions: [
                'Joint environmental management',
                'Shared infrastructure maintenance',
                'Technology transfer requirements',
                'Local content requirements'
            ],
            signedDate: '2024-01-15',
            lastReview: '2024-02-01',
            nextReview: '2025-02-01'
        }
    ];

    console.log('Application data initialized:', {
        entities: entities.length,
        minerals: minerals.length,
        royaltyRecords: royaltyRecords.length,
        userAccounts: userAccounts.length,
        auditEntries: auditLog.length,
        contracts: contracts.length
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
        case 'contract-management':
            loadContractManagementSection();
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

function loadContractManagementSection() {
    const section = document.getElementById('contract-management');
    if (!section) return;
    
    section.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1>📋 Contract Management</h1>
                <p>Securely store and manage diverse royalty agreements with various stakeholders</p>
            </div>
            <div class="page-actions">
                <button class="btn btn-success" onclick="showAddContractForm()">
                    <i class="fas fa-plus"></i> New Contract
                </button>
                <button class="btn btn-info" onclick="showContractTemplates()">
                    <i class="fas fa-file-contract"></i> Templates
                </button>
                <button class="btn btn-primary" onclick="exportContracts()">
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
                                    <button class="btn btn-info btn-sm" onclick="viewContractDetails('${contract.id}')"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-warning btn-sm" onclick="editContract('${contract.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn btn-secondary btn-sm" onclick="downloadContract('${contract.id}')"><i class="fas fa-download"></i></button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Contract Terms Analysis -->
        <div class="charts-grid">
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-chart-pie"></i> Calculation Methods Distribution</h3>
                </div>
                <div class="card-body">
                    <div class="method-distribution">
                        ${getCalculationMethodsDistribution().map(method => `
                            <div class="method-item">
                                <span class="method-label">${method.name}</span>
                                <div class="method-bar">
                                    <div class="method-progress" style="width: ${method.percentage}%; background-color: ${method.color};"></div>
                                </div>
                                <span class="method-percentage">${method.percentage}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-clock"></i> Contract Escalation Alerts</h3>
                </div>
                <div class="card-body">
                    <div class="escalation-alerts">
                        ${getEscalationAlerts().map(alert => `
                            <div class="alert-item ${alert.type}">
                                <div class="alert-icon">
                                    <i class="fas fa-${alert.icon}"></i>
                                </div>
                                <div class="alert-content">
                                    <h6>${alert.title}</h6>
                                    <p>${alert.message}</p>
                                    <small>${alert.details}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Schedules Overview -->
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-calendar-check"></i> Payment Schedules & Conditions</h3>
            </div>
            <div class="card-body">
                <div class="payment-schedules-grid">
                    ${getPaymentSchedulesOverview().map(schedule => `
                        <div class="schedule-card">
                            <div class="schedule-header">
                                <h6>${schedule.name}</h6>
                                <span class="schedule-count">${schedule.count} contracts</span>
                            </div>
                            <div class="schedule-details">
                                <p>Due: ${schedule.dueDate}</p>
                                <p>Late fee: ${schedule.lateFee}</p>
                                <p>Grace period: ${schedule.gracePeriod}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Helper functions for contract management
function getCalculationMethodsDistribution() {
    const methods = {};
    contracts.forEach(contract => {
        methods[contract.calculationMethod] = (methods[contract.calculationMethod] || 0) + 1;
    });
    
    const total = contracts.length;
    const colors = {
        'ad-valorem': '#1a365d',
        'profit-based': '#2563eb',
        'quantity-based': '#059669',
        'hybrid': '#d97706'
    };
    
    return Object.entries(methods).map(([method, count]) => ({
        name: method.charAt(0).toUpperCase() + method.slice(1).replace('-', ' '),
        percentage: Math.round((count / total) * 100),
        color: colors[method] || '#6b7280'
    }));
}

function getEscalationAlerts() {
    const alerts = [];
    const now = new Date();
    
    contracts.forEach(contract => {
        if (contract.escalationClause?.enabled && contract.escalationClause.nextEscalation) {
            const escalationDate = new Date(contract.escalationClause.nextEscalation);
            const daysUntil = Math.ceil((escalationDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 90 && daysUntil > 0) {
                alerts.push({
                    type: daysUntil <= 30 ? 'urgent' : 'warning',
                    icon: 'exclamation-triangle',
                    title: `Rate Escalation Due - ${contract.id}`,
                    message: `${contract.escalationClause.rate}% escalation clause triggers in ${daysUntil} days`,
                    details: `${contract.contractType} | Due: ${contract.escalationClause.nextEscalation}`
                });
            }
        }
        
        const endDate = new Date(contract.endDate);
        const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
            alerts.push({
                type: daysUntilExpiry <= 30 ? 'urgent' : 'warning',
                icon: 'calendar-times',
                title: `Contract Renewal Required - ${contract.id}`,
                message: `${contract.contractType} expires in ${daysUntilExpiry} days`,
                details: `${contract.stakeholder} | Expires: ${contract.endDate}`
            });
        }
    });
    
    return alerts.slice(0, 3); // Show top 3 alerts
}

function getPaymentSchedulesOverview() {
    const schedules = {};
    
    contracts.forEach(contract => {
        const key = contract.paymentSchedule;
        if (!schedules[key]) {
            schedules[key] = {
                count: 0,
                lateFees: [],
                gracePeriods: []
            };
        }
        schedules[key].count++;
        schedules[key].lateFees.push(contract.lateFeeRate);
        schedules[key].gracePeriods.push(contract.gracePeriod);
    });
    
    return Object.entries(schedules).map(([schedule, data]) => {
        const avgLateFee = data.lateFees.reduce((a, b) => a + b, 0) / data.lateFees.length;
        const avgGracePeriod = data.gracePeriods.reduce((a, b) => a + b, 0) / data.gracePeriods.length;
        
        return {
            name: schedule.charAt(0).toUpperCase() + schedule.slice(1) + ' Payments',
            count: data.count,
            dueDate: schedule === 'monthly' ? '15th of each month' : 
                    schedule === 'quarterly' ? 'End of quarter' : 
                    'December 31st',
            lateFee: `${avgLateFee.toFixed(1)}% after grace period`,
            gracePeriod: `${Math.round(avgGracePeriod)} days`
        };
    });
}

// Contract action handlers
function viewContractDetails(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;
    
    const details = `
Contract Details for ${contractId}:

Stakeholder: ${contract.stakeholder}
Type: ${contract.contractType}
Calculation Method: ${contract.calculationMethod}
Royalty Rate: ${contract.royaltyRate}
Payment Schedule: ${contract.paymentSchedule}
Contract Period: ${contract.startDate} to ${contract.endDate}
Status: ${contract.status}
Total Value: E ${(contract.totalValue / 1000000).toFixed(1)}M

Escalation Clause: ${contract.escalationClause?.enabled ? 'Yes' : 'No'}
${contract.escalationClause?.enabled ? `Next Escalation: ${contract.escalationClause.nextEscalation}` : ''}

Conditions:
${contract.conditions.map(condition => `• ${condition}`).join('\n')}

Late Fee: ${contract.lateFeeRate}% after ${contract.gracePeriod} days
Last Review: ${contract.lastReview}
Next Review: ${contract.nextReview}
    `;
    
    alert(details);
}

function editContract(contractId) {
    showNotification(`Edit functionality for contract ${contractId} would open a comprehensive contract editing form`, 'info');
}

function downloadContract(contractId) {
    showNotification(`Downloading contract ${contractId} as PDF`, 'success');
}

function renewContract(contractId) {
    if (confirm(`Start renewal process for contract ${contractId}?`)) {
        showNotification(`Renewal process initiated for contract ${contractId}`, 'success');
    }
}

function showAddContractForm() {
    showNotification('Add contract form would open with fields for all contract terms, stakeholder details, and calculation methods', 'info');
}

function showContractTemplates() {
    showNotification('Contract templates library would show pre-configured templates for different stakeholder types', 'info');
}

function exportContracts() {
    showNotification('Exporting all contracts with detailed terms and conditions', 'success');
}

// Make contract functions globally available
window.viewContractDetails = viewContractDetails;
window.editContract = editContract;
window.downloadContract = downloadContract;
window.renewContract = renewContract;
window.showAddContractForm = showAddContractForm;
window.showContractTemplates = showContractTemplates;
window.exportContracts = exportContracts;

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
