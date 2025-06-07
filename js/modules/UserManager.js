import { BaseModule } from './base-module.js';

export class UserManager extends BaseModule {
  constructor(templateLoader) {
    super(templateLoader, 'user-management');
    this.notificationManager = null;
    this.users = [
      {
        id: 1,
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@royalties.gov.sz',
        role: 'administrator',
        status: 'active',
        lastLogin: new Date(),
        createdAt: new Date('2024-01-01'),
        permissions: ['read', 'write', 'admin', 'delete']
      },
      {
        id: 2,
        username: 'editor',
        name: 'Data Editor',
        email: 'editor@royalties.gov.sz',
        role: 'editor',
        status: 'active',
        lastLogin: new Date(Date.now() - 86400000),
        createdAt: new Date('2024-01-15'),
        permissions: ['read', 'write']
      },
      {
        id: 3,
        username: 'viewer',
        name: 'Report Viewer',
        email: 'viewer@royalties.gov.sz',
        role: 'viewer',
        status: 'active',
        lastLogin: new Date(Date.now() - 172800000),
        createdAt: new Date('2024-02-01'),
        permissions: ['read']
      }
    ];
    this.nextId = 4;
  }

  setNotificationManager(notificationManager) {
    this.notificationManager = notificationManager;
  }

  async onLoad() {
    try {
      await this.loadTemplate('templates/user-management.html');
      this.setupUserManagement();
    } catch (error) {
      console.error('Failed to load user management template:', error);
      this.showFallback();
    }
  }

  showFallback() {
    if (this.container) {
      this.container.innerHTML = `
        <section id="user-management">
          <div class="page-header">
            <div class="page-title">
              <h1>User Management</h1>
              <p>Manage system users and permissions</p>
            </div>
          </div>
          <div class="loading-container">
            <p>Loading user management features...</p>
          </div>
        </section>
      `;
    }
  }

  setupUserManagement() {
    // Setup user management functionality
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.setupButtons();
    this.setupTabSwitching();
  }

  setupButtons() {
    const buttons = {
      'View Audit Log': this.handleViewAuditLog.bind(this),
      'Export Report': this.handleExportReport.bind(this),
      'Add User': this.handleAddUser.bind(this)
    };

    Object.entries(buttons).forEach(([text, handler]) => {
      const button = Array.from(document.querySelectorAll('#user-management .page-actions .btn'))
        .find(btn => btn.textContent.includes(text));
      
      if (button) {
        button.addEventListener('click', handler);
      }
    });
  }

  async handleViewAuditLog(event) {
    event.preventDefault();
    
    const auditLogSection = document.querySelector('#user-management .user-form-container:last-child');
    if (!auditLogSection) {
      this.showNotification('Security Audit Log section not found', 'error');
      return;
    }

    await this.sleep(300);
    this.scrollToElement(auditLogSection);
    this.highlightElement(auditLogSection);
    this.showNotification('Scrolled to Security Audit Log section', 'info');
  }

  async handleExportReport(event) {
    event.preventDefault();
    
    this.showNotification('Generating user management report...', 'info');
    await this.sleep(1500);
    
    this.showNotification('User management report exported successfully!', 'success');
    this.downloadFile('user_management_report.csv', 'User Management Report\nGenerated on: ' + new Date().toLocaleString());
  }

  handleAddUser(event) {
    event.preventDefault();
    this.showNotification('Add user functionality would be implemented here', 'info');
  }

  setupTabSwitching() {
    document.addEventListener('click', (event) => {
      if (event.target.matches('.tab-btn, .regulatory-tabs .tab-btn')) {
        this.handleTabSwitch(event);
      }
    });
  }

  handleTabSwitch(event) {
    const button = event.target;
    const tabId = button.getAttribute('data-tab');
    const parentContainer = button.closest('.user-form-container, .regulatory-section');
    
    if (!parentContainer || !tabId) return;

    parentContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    parentContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    button.classList.add('active');
    parentContainer.querySelector(tabId)?.classList.add('active');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }

  highlightElement(element) {
    element.style.transition = 'background-color 0.3s ease';
    element.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
    setTimeout(() => {
      element.style.backgroundColor = '';
    }, 2000);
  }

  downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getAllUsers() {
    return this.users;
  }

  getUserById(id) {
    return this.users.find(user => user.id === parseInt(id));
  }

  getUserByUsername(username) {
    return this.users.find(user => user.username === username);
  }

  createUser(userData) {
    const newUser = {
      id: this.nextId++,
      username: userData.username,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active',
      lastLogin: null,
      createdAt: new Date(),
      permissions: this.getRolePermissions(userData.role)
    };
    
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updateData) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updateData };
      return this.users[userIndex];
    }
    return null;
  }

  deleteUser(id) {
    // Prevent deletion of admin user
    if (parseInt(id) === 1) {
      throw new Error('Cannot delete administrator account');
    }
    
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    if (userIndex !== -1) {
      return this.users.splice(userIndex, 1)[0];
    }
    return null;
  }

  getRolePermissions(role) {
    const rolePermissions = {
      'administrator': ['read', 'write', 'admin', 'delete'],
      'editor': ['read', 'write'],
      'viewer': ['read'],
      'auditor': ['read', 'audit'],
      'finance': ['read', 'write', 'finance']
    };
    
    return rolePermissions[role] || ['read'];
  }

  validateUser(userData) {
    const errors = [];
    
    if (!userData.username || userData.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (this.getUserByUsername(userData.username)) {
      errors.push('Username already exists');
    }
    
    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email address is required');
    }
    
    if (!userData.name || userData.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!userData.role) {
      errors.push('Role is required');
    }
    
    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getActiveUserCount() {
    return this.users.filter(user => user.status === 'active').length;
  }

  getUsersByRole(role) {
    return this.users.filter(user => user.role === role);
  }

  searchUsers(query) {
    const searchTerm = query.toLowerCase();
    return this.users.filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }
}
