import { BaseModule } from './base-module.js';

export class UserManager extends BaseModule {
  constructor(templateLoader) {
    super(templateLoader, 'user-management');
    this.notificationManager = null;
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
}
