export class UserManager {
  constructor(notificationManager) {
    this.notificationManager = notificationManager;
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
      this.notificationManager.error('Security Audit Log section not found');
      return;
    }

    await this.sleep(300);
    this.scrollToElement(auditLogSection);
    this.highlightElement(auditLogSection);
    this.notificationManager.info('Scrolled to Security Audit Log section');
  }

  async handleExportReport(event) {
    event.preventDefault();
    
    this.notificationManager.info('Generating user management report...');
    await this.sleep(1500);
    
    this.notificationManager.success('User management report exported successfully!');
    this.downloadFile('user_management_report.csv', 'User Management Report\nGenerated on: ' + new Date().toLocaleString());
  }

  handleAddUser(event) {
    event.preventDefault();
    
    const addUserForm = document.querySelector('#user-management .user-form-container:first-child');
    if (!addUserForm) return;

    this.scrollToElement(addUserForm);
    this.highlightElement(addUserForm, 'success');
    
    setTimeout(() => {
      addUserForm.querySelector('input')?.focus();
    }, 500);
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

  scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  highlightElement(element, type = 'primary') {
    const colors = {
      primary: { bg: 'rgba(26, 54, 93, 0.05)', border: '#1a365d' },
      success: { bg: 'rgba(56, 161, 105, 0.05)', border: 'var(--success-color)' }
    };
    
    const color = colors[type];
    element.style.transition = 'background-color 0.3s ease, border-color 0.3s ease';
    element.style.backgroundColor = color.bg;
    element.style.borderColor = color.border;
    
    setTimeout(() => {
      element.style.backgroundColor = '';
      element.style.borderColor = '';
    }, 3000);
  }

  downloadFile(filename, content) {
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
    link.download = `${filename.split('.')[0]}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
