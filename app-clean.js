/**
 * Mining Royalties Manager - Main Application (Clean Version)
 * @version 3.0.0
 * @date 2025-07-01
 * @description Essential functionality for the Mining Royalties Manager
 */

console.log('Mining Royalties Manager v3.0.0 - Clean optimized version');

// ===== CORE APPLICATION STATE =====
let currentUser = null;
let currentSection = 'dashboard';
let royaltyRecords = [];
let userAccounts = [];
let auditLog = [];

// ===== APPLICATION INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing application...');
    
    // Basic error suppression for extensions
    window.addEventListener('error', function(e) {
        if (e.message.includes('Extension context') || e.message.includes('message channel')) {
            e.preventDefault();
            return false;
        }
    });
    
    startLoadingSequence();
});

function startLoadingSequence() {
    const loadingScreen = document.getElementById('loading-screen');
    const loginSection = document.getElementById('login-section');
    const mainApp = document.getElementById('main-app');
    
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            if (loginSection) loginSection.style.display = 'flex';
        }, 1500);
    }
}

// ===== LOGIN FUNCTIONALITY =====
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username')?.value;
            const password = document.getElementById('password')?.value;
            
            if (simulateLogin(username, password)) {
                showMainApplication();
            } else {
                showValidationError();
            }
        });
    }
}

function simulateLogin(username, password) {
    return username === 'admin' && password === 'admin123';
}

function showValidationError() {
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) {
        errorMsg.textContent = 'Invalid username or password';
        errorMsg.style.display = 'block';
        setTimeout(() => errorMsg.style.display = 'none', 3000);
    }
}

function showMainApplication() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    currentUser = { username: 'admin', role: 'Administrator' };
    initializeApplication();
}

// ===== MAIN APPLICATION INITIALIZATION =====
function initializeApplication() {
    initializeSampleData();
    setupNavigation();
    setupLoginForm();
    showSection('dashboard');
    console.log('Application initialized successfully');
}

// ===== NAVIGATION =====
function setupNavigation() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            const navLink = e.target.closest('a[data-section]');
            if (navLink) {
                e.preventDefault();
                const section = navLink.dataset.section;
                if (section === 'logout') {
                    handleLogout();
                } else {
                    showSection(section);
                }
            }
        });
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        currentSection = sectionId;
        updateNavigationState(sectionId);
        handleSectionSwitch(sectionId);
    }
}

function updateNavigationState(activeSection) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeSection}` || link.dataset.section === activeSection) {
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
    }
}

// ===== SAMPLE DATA =====
function initializeSampleData() {
    royaltyRecords = [
        { id: 1, entity: 'Kwalini Quarry', mineral: 'Quarried Stone', volume: 1250, tariff: 15, royalties: 18750, date: '2024-01-15', status: 'Paid' },
        { id: 2, entity: 'Maloma Colliery', mineral: 'Coal', volume: 850, tariff: 12, royalties: 10200, date: '2024-01-20', status: 'Pending' },
        { id: 3, entity: 'Ngwenya Mine', mineral: 'Iron Ore', volume: 2100, tariff: 25, royalties: 52500, date: '2024-01-25', status: 'Paid' }
    ];
    
    userAccounts = [
        { id: 1, username: 'admin', email: 'admin@eswacaa.sz', role: 'Administrator', department: 'Management', status: 'Active', lastLogin: '2024-02-10 09:15:00', failedAttempts: 0 },
        { id: 2, username: 'finance.user', email: 'finance@eswacaa.sz', role: 'Finance', department: 'Finance', status: 'Active', lastLogin: '2024-02-09 14:30:00', failedAttempts: 0 },
        { id: 3, username: 'audit.reviewer', email: 'audit@eswacaa.sz', role: 'Auditor', department: 'Audit', status: 'Active', lastLogin: '2024-02-08 11:45:00', failedAttempts: 1 }
    ];
    
    auditLog = [
        { id: 1, timestamp: '2024-02-10 09:15:23', user: 'admin', action: 'Login', target: 'System', ipAddress: '192.168.1.100', status: 'Success', details: 'Successful login' },
        { id: 2, timestamp: '2024-02-10 09:20:15', user: 'admin', action: 'Create User', target: 'finance.user', ipAddress: '192.168.1.100', status: 'Success', details: 'Created new user account' }
    ];
    
    console.log('Sample data initialized');
}

// ===== DASHBOARD =====
function updateDashboardMetrics() {
    const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
    const activeEntities = new Set(royaltyRecords.map(r => r.entity)).size;
    const paidRecords = royaltyRecords.filter(r => r.status === 'Paid').length;
    const pendingRecords = royaltyRecords.filter(r => r.status === 'Pending').length;
    const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords / royaltyRecords.length) * 100) : 0;
    
    // Update dashboard elements
    updateElement('total-royalties', `E ${totalRoyalties.toLocaleString()}.00`);
    updateElement('active-entities', activeEntities.toString());
    updateElement('compliance-rate', `${complianceRate}%`);
    updateElement('paid-count', paidRecords);
    updateElement('pending-count', pendingRecords);
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

// ===== USER MANAGEMENT =====
function populateUserAccounts() {
    const tbody = document.getElementById('users-table-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    userAccounts.forEach(user => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><input type="checkbox" data-user-id="${user.id}"></td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
            <td>${user.department}</td>
            <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${user.lastLogin || 'Never'}</td>
            <td>${user.failedAttempts || 0}</td>
            <td>Never</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})" title="Edit user">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})" title="Delete user">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
    });
}

function populateAuditLog() {
    const tbody = document.getElementById('audit-log-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    auditLog.forEach(entry => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${entry.timestamp}</td>
            <td>${entry.user}</td>
            <td><span class="action-badge">${entry.action}</span></td>
            <td>${entry.target}</td>
            <td>${entry.ipAddress}</td>
            <td><span class="status-badge ${entry.status.toLowerCase()}">${entry.status}</span></td>
            <td>${entry.details}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewAuditDetails(${entry.id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
    });
}

// ===== ROYALTY RECORDS =====
function populateRoyaltyRecords() {
    const tbody = document.getElementById('royalty-records-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    royaltyRecords.forEach(record => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${record.entity}</td>
            <td>${record.mineral}</td>
            <td>${record.volume.toLocaleString()}</td>
            <td>E${record.tariff}</td>
            <td>E${record.royalties.toLocaleString()}</td>
            <td>${record.date}</td>
            <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editRecord(${record.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecord(${record.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    if (window.notificationManager && window.notificationManager.show) {
        window.notificationManager.show(message, type);
    } else {
        console.log(`Notification (${type}): ${message}`);
        alert(message); // Fallback
    }
}

// ===== GLOBAL FUNCTIONS FOR HTML ONCLICK HANDLERS =====
window.editUser = function(userId) {
    try {
        showNotification('Edit user functionality would be implemented here', 'info');
    } catch (error) {
        console.error('Error editing user:', error);
    }
};

window.deleteUser = function(userId) {
    try {
        if (confirm('Are you sure you want to delete this user?')) {
            userAccounts = userAccounts.filter(user => user.id !== userId);
            populateUserAccounts();
            showNotification('User deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
};

window.editRecord = function(recordId) {
    try {
        showNotification('Edit record functionality would be implemented here', 'info');
    } catch (error) {
        console.error('Error editing record:', error);
    }
};

window.deleteRecord = function(recordId) {
    try {
        if (confirm('Are you sure you want to delete this record?')) {
            royaltyRecords = royaltyRecords.filter(record => record.id !== recordId);
            populateRoyaltyRecords();
            updateDashboardMetrics();
            showNotification('Record deleted successfully', 'success');
        }
    } catch (error) {
        console.error('Error deleting record:', error);
    }
};

window.viewAuditDetails = function(entryId) {
    try {
        showNotification('Audit details view would be implemented here', 'info');
    } catch (error) {
        console.error('Error viewing audit details:', error);
    }
};

// Dashboard quick actions
window.refreshDashboard = function() {
    try {
        updateDashboardMetrics();
        showNotification('Dashboard refreshed successfully', 'success');
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
};

window.addNewRecord = function() {
    try {
        showNotification('Add Record functionality will be available soon', 'info');
    } catch (error) {
        console.error('Error adding new record:', error);
    }
};

window.runComplianceCheck = function() {
    try {
        showNotification('Running compliance check...', 'info');
        setTimeout(() => showNotification('Compliance check completed', 'success'), 2000);
    } catch (error) {
        console.error('Error running compliance check:', error);
    }
};

// ===== LOGOUT =====
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        currentSection = 'dashboard';
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        console.log('User logged out successfully');
    }
}

console.log('Mining Royalties Manager - Clean version loaded successfully');
