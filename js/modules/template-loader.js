export class TemplateLoader {
  constructor() {
    this.cache = new Map();
    this.loadingStates = new Map();
  }

  async loadTemplate(containerId, templatePath) {
    try {
      // Check if already loading
      if (this.loadingStates.has(templatePath)) {
        return await this.loadingStates.get(templatePath);
      }

      // Create loading promise
      const loadingPromise = this._loadTemplateInternal(containerId, templatePath);
      this.loadingStates.set(templatePath, loadingPromise);

      const result = await loadingPromise;
      this.loadingStates.delete(templatePath);
      
      return result;
    } catch (error) {
      this.loadingStates.delete(templatePath);
      console.error('Template loading failed:', error);
      // Fallback to inline content - don't throw error, provide fallback
      this._createFallbackContent(containerId, templatePath);
      return this._getFallbackTemplate(templatePath);
    }
  }

  async _loadTemplateInternal(containerId, templatePath) {
    let template;
    
    // Check cache first
    if (this.cache.has(templatePath)) {
      template = this.cache.get(templatePath);
    } else {
      try {
        // Fetch template
        const response = await fetch(templatePath);
        if (!response.ok) {
          throw new Error(`Failed to load template: ${templatePath} (${response.status})`);
        }
        template = await response.text();
        
        // Cache template
        this.cache.set(templatePath, template);
      } catch (fetchError) {
        console.warn(`Could not fetch template ${templatePath}, using fallback`);
        template = this._getFallbackTemplate(templatePath);
        this.cache.set(templatePath, template);
      }
    }

    // Insert into container
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container not found: ${containerId}`);
    }

    container.innerHTML = template;
    
    // Dispatch custom event for template loaded
    container.dispatchEvent(new CustomEvent('templateLoaded', {
      detail: { templatePath, containerId }
    }));

    return template;
  }

  _getFallbackTemplate(templatePath) {
    // Provide inline fallback templates
    const fallbacks = {
      'templates/login.html': `
        <section class="login-section" id="login-section">
          <div class="login-container">
            <div class="login-header">
              <div class="login-logo">MR</div>
              <h2>Mining Royalties Manager</h2>
              <p>Secure access to your royalty management system</p>
            </div>
            <form class="login-form" id="login-form">
              <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="username" name="username" placeholder="Username" required>
              </div>
              <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password" id="password" name="password" placeholder="Password" required>
                <button type="button" class="password-toggle">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <button type="submit" class="btn btn-primary btn-large">Sign In</button>
            </form>
          </div>
        </section>
      `,
      'templates/sidebar.html': `
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-logo">MR</div>
            <h2>Royalties Manager</h2>
          </div>
          <nav>
            <ul>
              <li><a href="#dashboard" class="nav-link active"><i class="fas fa-home"></i> Dashboard</a></li>
              <li><a href="#user-management" class="nav-link"><i class="fas fa-users"></i> User Management</a></li>
              <li><a href="#royalty-records" class="nav-link"><i class="fas fa-file-invoice"></i> Royalty Records</a></li>
              <li><a href="#contract-management" class="nav-link"><i class="fas fa-file-contract"></i> Contract Management</a></li>
              <li><a href="#audit-dashboard" class="nav-link"><i class="fas fa-shield-alt"></i> Audit Dashboard</a></li>
              <li><a href="#reporting-analytics" class="nav-link"><i class="fas fa-chart-bar"></i> Reporting & Analytics</a></li>
              <li><a href="#communication" class="nav-link"><i class="fas fa-envelope"></i> Communication</a></li>
              <li><a href="#notifications" class="nav-link"><i class="fas fa-bell"></i> Notifications <span id="notification-count">3</span></a></li>
              <li><a href="#compliance" class="nav-link"><i class="fas fa-check-circle"></i> Compliance & Regulatory</a></li>
              <li><a href="#regulatory-management" class="nav-link"><i class="fas fa-gavel"></i> Regulatory Management</a></li>
              <li><a href="#profile" class="nav-link"><i class="fas fa-user"></i> My Profile</a></li>
              <li><a href="#logout" class="nav-link"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
          </nav>
        </aside>
      `,
      'templates/dashboard.html': `
        <section id="dashboard">
          <div class="page-header">
            <div class="page-title">
              <h1>Dashboard</h1>
              <p>Welcome back, System Administrator</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading dashboard content...</p>
          </div>
        </section>
      `,
      'templates/user-management.html': `
        <section id="user-management">
          <div class="page-header">
            <div class="page-title">
              <h1>User Management</h1>
              <p>Manage system users and permissions</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading user management content...</p>
          </div>
        </section>
      `,
      'templates/royalty-records.html': `
        <section id="royalty-records">
          <div class="page-header">
            <div class="page-title">
              <h1>Royalty Records</h1>
              <p>Manage royalty payments and records</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading royalty records...</p>
          </div>
        </section>
      `,
      'templates/contract-management.html': `
        <section id="contract-management">
          <div class="page-header">
            <div class="page-title">
              <h1>Contract Management</h1>
              <p>Manage mining contracts and agreements</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading contract management...</p>
          </div>
        </section>
      `,
      'templates/audit-dashboard.html': `
        <section id="audit-dashboard">
          <div class="page-header">
            <div class="page-title">
              <h1>Audit Dashboard</h1>
              <p>Monitor system activities and compliance</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading audit dashboard...</p>
          </div>
        </section>
      `,
      'templates/reporting-analytics.html': `
        <section id="reporting-analytics">
          <div class="page-header">
            <div class="page-title">
              <h1>Reporting & Analytics</h1>
              <p>Generate reports and view analytics</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading reporting tools...</p>
          </div>
        </section>
      `,
      'templates/communication.html': `
        <section id="communication">
          <div class="page-header">
            <div class="page-title">
              <h1>Communication</h1>
              <p>Manage communications and notifications</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading communication tools...</p>
          </div>
        </section>
      `,
      'templates/notifications.html': `
        <section id="notifications">
          <div class="page-header">
            <div class="page-title">
              <h1>Notifications</h1>
              <p>View and manage system notifications</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </section>
      `,
      'templates/compliance.html': `
        <section id="compliance">
          <div class="page-header">
            <div class="page-title">
              <h1>Compliance & Regulatory</h1>
              <p>Monitor compliance and regulatory requirements</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading compliance dashboard...</p>
          </div>
        </section>
      `,
      'templates/regulatory-management.html': `
        <section id="regulatory-management">
          <div class="page-header">
            <div class="page-title">
              <h1>Regulatory Management</h1>
              <p>Manage regulatory requirements and submissions</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading regulatory management...</p>
          </div>
        </section>
      `,
      'templates/profile.html': `
        <section id="profile">
          <div class="page-header">
            <div class="page-title">
              <h1>👤 My Profile</h1>
              <p>Manage your account settings and preferences</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-primary" id="save-profile-btn">
                <i class="fas fa-save"></i> Save Changes
              </button>
            </div>
          </div>
          
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <h3><i class="fas fa-user-circle"></i> Personal Information</h3>
              </div>
              <div class="card-body">
                <div class="grid-4">
                  <div class="form-group">
                    <label for="profile-name">Full Name</label>
                    <input type="text" id="profile-name" value="System Administrator">
                  </div>
                  <div class="form-group">
                    <label for="profile-email">Email</label>
                    <input type="email" id="profile-email" value="admin@royalties.gov.sz">
                  </div>
                  <div class="form-group">
                    <label for="profile-phone">Phone</label>
                    <input type="tel" id="profile-phone" value="+268 2404 2000">
                  </div>
                  <div class="form-group">
                    <label for="profile-department">Department</label>
                    <select id="profile-department">
                      <option>Ministry of Natural Resources</option>
                      <option>Finance Department</option>
                      <option>Legal Department</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <h3><i class="fas fa-shield-alt"></i> Security Settings</h3>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label for="current-password">Current Password</label>
                  <input type="password" id="current-password" placeholder="Enter current password">
                </div>
                <div class="form-group">
                  <label for="new-password">New Password</label>
                  <input type="password" id="new-password" placeholder="Enter new password">
                </div>
                <div class="form-group">
                  <label for="confirm-password">Confirm Password</label>
                  <input type="password" id="confirm-password" placeholder="Confirm new password">
                </div>
                <button class="btn btn-warning">
                  <i class="fas fa-key"></i> Update Password
                </button>
              </div>
            </div>
          </div>
        </section>
      `,
      'templates/contract-management.html': `
        <section id="contract-management">
          <div class="page-header">
            <div class="page-title">
              <h1>📋 Contract Management</h1>
              <p>Manage mining contracts, agreements, and licensing documentation</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-success" id="add-contract-btn">
                <i class="fas fa-plus"></i> New Contract
              </button>
              <button class="btn btn-info" id="contract-templates-btn">
                <i class="fas fa-file-contract"></i> Templates
              </button>
              <button class="btn btn-primary" id="export-contracts-btn">
                <i class="fas fa-download"></i> Export
              </button>
            </div>
          </div>
          
          <div class="charts-grid">
            <div class="metric-card card">
              <div class="card-header">
                <h3><i class="fas fa-file-contract"></i> Active Contracts</h3>
              </div>
              <div class="card-body">
                <p>24</p>
                <small><i class="fas fa-arrow-up trend-positive"></i> 3 new this quarter</small>
              </div>
            </div>
            
            <div class="metric-card card">
              <div class="card-header">
                <h3><i class="fas fa-calendar-alt"></i> Expiring Soon</h3>
              </div>
              <div class="card-body">
                <p>3</p>
                <small><i class="fas fa-exclamation-triangle trend-negative"></i> Within 90 days</small>
              </div>
            </div>
            
            <div class="metric-card card">
              <div class="card-header">
                <h3><i class="fas fa-handshake"></i> Total Value</h3>
              </div>
              <div class="card-body">
                <p>E 45.2M</p>
                <small><i class="fas fa-arrow-up trend-positive"></i> +12% YTD</small>
              </div>
            </div>
          </div>
          
          <div class="table-container">
            <div class="section-header">
              <h4>Contract Registry</h4>
              <div class="table-actions">
                <button class="btn btn-info btn-sm">
                  <i class="fas fa-filter"></i> Filter
                </button>
                <button class="btn btn-secondary btn-sm">
                  <i class="fas fa-search"></i> Search
                </button>
              </div>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Contract ID</th>
                  <th>Entity</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MC-2024-001</td>
                  <td>Maloma Colliery</td>
                  <td>Mining License</td>
                  <td>2024-01-01</td>
                  <td>2029-12-31</td>
                  <td><span class="status-badge active">Active</span></td>
                  <td>E 15.5M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      `,
      'templates/reporting-analytics.html': `
        <section id="reporting-analytics">
          <div class="page-header">
            <div class="page-title">
              <h1>📊 Reporting & Analytics</h1>
              <p>Generate comprehensive reports and analyze royalty data trends</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-primary" id="generate-report-btn">
                <i class="fas fa-chart-bar"></i> Generate Report
              </button>
              <button class="btn btn-success" id="schedule-report-btn">
                <i class="fas fa-clock"></i> Schedule
              </button>
            </div>
          </div>
          
          <div class="report-tabs">
            <button class="tab-btn active" data-tab="quick-reports">Quick Reports</button>
            <button class="tab-btn" data-tab="custom-reports">Custom Reports</button>
            <button class="tab-btn" data-tab="scheduled-reports">Scheduled Reports</button>
            <button class="tab-btn" data-tab="analytics-dashboard">Analytics</button>
          </div>
          
          <div class="tab-content active" id="quick-reports">
            <div class="quick-reports-grid">
              <div class="report-card">
                <div class="report-icon">📈</div>
                <div class="report-info">
                  <h5>Monthly Revenue Report</h5>
                  <p>Comprehensive monthly royalty collection summary</p>
                  <div class="report-meta">Last generated: Today, 10:30 AM</div>
                </div>
                <button class="btn btn-primary btn-sm">Generate</button>
              </div>
              
              <div class="report-card">
                <div class="report-icon">🏭</div>
                <div class="report-info">
                  <h5>Entity Performance</h5>
                  <p>Mining entity compliance and payment history</p>
                  <div class="report-meta">Last generated: Yesterday</div>
                </div>
                <button class="btn btn-primary btn-sm">Generate</button>
              </div>
              
              <div class="report-card">
                <div class="report-icon">⚠️</div>
                <div class="report-info">
                  <h5>Compliance Violations</h5>
                  <p>Outstanding violations and penalty assessments</p>
                  <div class="report-meta">Last generated: 2 days ago</div>
                </div>
                <button class="btn btn-primary btn-sm">Generate</button>
              </div>
            </div>
          </div>
          
          <div class="charts-grid">
            <div class="analytics-chart card">
              <div class="chart-header">
                <h5>Revenue Analytics</h5>
              </div>
              <div class="chart-container">
                <canvas id="analytics-revenue-chart"></canvas>
              </div>
            </div>
            
            <div class="analytics-chart card">
              <div class="chart-header">
                <h5>Collection Efficiency</h5>
              </div>
              <div class="chart-container">
                <canvas id="collection-efficiency-chart"></canvas>
              </div>
            </div>
          </div>
        </section>
      `,
      'templates/communication.html': `
        <section id="communication">
          <div class="page-header">
            <div class="page-title">
              <h1>✉️ Communication</h1>
              <p>Manage communications with mining entities and stakeholders</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-primary" id="compose-message-btn">
                <i class="fas fa-plus"></i> Compose
              </button>
              <button class="btn btn-info" id="message-templates-btn">
                <i class="fas fa-file-alt"></i> Templates
              </button>
            </div>
          </div>
          
          <div class="communication-tabs">
            <button class="tab-btn active" data-tab="inbox"><i class="fas fa-inbox"></i> Inbox (5)</button>
            <button class="tab-btn" data-tab="sent"><i class="fas fa-paper-plane"></i> Sent</button>
            <button class="tab-btn" data-tab="drafts"><i class="fas fa-edit"></i> Drafts (2)</button>
            <button class="tab-btn" data-tab="templates"><i class="fas fa-file-alt"></i> Templates</button>
          </div>
          
          <div class="tab-content active" id="inbox">
            <div class="message-list">
              <div class="message-item unread urgent">
                <div class="message-header">
                  <div class="sender-info">
                    <strong>Maloma Colliery</strong>
                    <span class="priority-badge urgent">Urgent</span>
                  </div>
                  <div class="message-time">2 hours ago</div>
                </div>
                <div class="message-subject">
                  <h6>Payment Deadline Extension Request</h6>
                </div>
                <div class="message-preview">
                  <p>We request a 30-day extension for our Q4 royalty payment due to operational challenges...</p>
                </div>
                <div class="message-actions">
                  <button class="btn btn-primary btn-sm">Reply</button>
                  <button class="btn btn-info btn-sm">Forward</button>
                  <button class="btn btn-secondary btn-sm">Archive</button>
                </div>
              </div>
              
              <div class="message-item">
                <div class="message-header">
                  <div class="sender-info">
                    <strong>Ngwenya Iron Ore</strong>
                  </div>
                  <div class="message-time">1 day ago</div>
                </div>
                <div class="message-subject">
                  <h6>Monthly Production Report Submission</h6>
                </div>
                <div class="message-preview">
                  <p>Please find attached our monthly production report for November 2024...</p>
                </div>
                <div class="delivery-status">
                  <span class="status-badge delivered">Delivered</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="tab-content" id="templates">
            <div class="template-grid">
              <div class="template-card">
                <h6>Payment Reminder</h6>
                <p>Standard template for overdue payment notifications</p>
                <button class="btn btn-primary btn-sm">Use Template</button>
              </div>
              
              <div class="template-card">
                <h6>Compliance Notice</h6>
                <p>Template for regulatory compliance violations</p>
                <button class="btn btn-primary btn-sm">Use Template</button>
              </div>
            </div>
          </div>
        </section>
      `,
      'templates/notifications.html': `
        <section id="notifications">
          <div class="page-header">
            <div class="page-title">
              <h1>🔔 Notifications</h1>
              <p>System alerts, reminders, and important updates</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary" id="mark-all-read-btn">
                <i class="fas fa-check"></i> Mark All Read
              </button>
              <button class="btn btn-info" id="notification-settings-btn">
                <i class="fas fa-cog"></i> Settings
              </button>
            </div>
          </div>
          
          <div class="notification-filters">
            <h6>Filter Notifications</h6>
            <div class="grid-4">
              <select id="notification-type-filter">
                <option value="">All Types</option>
                <option value="payment">Payment Alerts</option>
                <option value="compliance">Compliance</option>
                <option value="system">System</option>
              </select>
              <select id="notification-priority-filter">
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
              <select id="notification-status-filter">
                <option value="">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <button class="btn btn-primary">Apply Filters</button>
            </div>
          </div>
          
          <div class="notifications-container">
            <div class="notification-item unread critical">
              <div class="notification-icon">
                <i class="fas fa-exclamation-triangle" style="color: #e53e3e;"></i>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h6>Critical: Payment Overdue</h6>
                  <div class="notification-time">30 minutes ago</div>
                </div>
                <p>Maloma Colliery payment is 15 days overdue. Immediate action required.</p>
                <div class="notification-actions">
                  <button class="btn btn-danger btn-sm">Take Action</button>
                  <button class="btn btn-secondary btn-sm">Dismiss</button>
                </div>
              </div>
            </div>
            
            <div class="notification-item unread high">
              <div class="notification-icon">
                <i class="fas fa-calendar-alt" style="color: #d69e2e;"></i>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h6>Contract Renewal Due</h6>
                  <div class="notification-time">2 hours ago</div>
                </div>
                <p>Mining license for Pigg's Peak Quarry expires in 60 days. Start renewal process.</p>
                <div class="notification-actions">
                  <button class="btn btn-warning btn-sm">Start Renewal</button>
                  <button class="btn btn-secondary btn-sm">Remind Later</button>
                </div>
              </div>
            </div>
            
            <div class="notification-item">
              <div class="notification-icon">
                <i class="fas fa-check-circle" style="color: #38a169;"></i>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h6>Compliance Review Completed</h6>
                  <div class="notification-time">1 day ago</div>
                </div>
                <p>Environmental compliance review for Ngwenya Mine completed successfully.</p>
              </div>
            </div>
          </div>
        </section>
      `,
      'templates/compliance.html': `
        <section id="compliance">
          <div class="page-header">
            <div class="page-title">
              <h1>✅ Compliance & Regulatory</h1>
              <p>Monitor regulatory compliance, track violations, and manage enforcement actions</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-warning" id="new-violation-btn">
                <i class="fas fa-exclamation-triangle"></i> Report Violation
              </button>
              <button class="btn btn-info" id="compliance-calendar-btn">
                <i class="fas fa-calendar"></i> Calendar
              </button>
            </div>
          </div>
          
          <div class="charts-grid">
            <div class="metric-card card">
              <div class="card-header">
                <h3><i class="fas fa-shield-check"></i> Compliance Rate</h3>
              </div>
              <div class="card-body">
                <p>94.8%</p>
                <small><i class="fas fa-arrow-up trend-positive"></i> +2.1% this month</small>
              </div>
            </div>
            
            <div class="metric-card card">
              <div class="card-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Active Violations</h3>
              </div>
              <div class="card-body">
                <p>3</p>
                <small><i class="fas fa-clock trend-negative"></i> 1 critical</small>
              </div>
            </div>
            
            <div class="metric-card card">
              <div class="card-header">
                <h3><i class="fas fa-file-invoice-dollar"></i> Penalties Issued</h3>
              </div>
              <div class="card-body">
                <p>E 125,000</p>
                <small><i class="fas fa-calendar"></i> This quarter</small>
              </div>
            </div>
          </div>
          
          <div class="alert-dashboard">
            <h4>🚨 Priority Alerts</h4>
            <div class="alert-item urgent">
              <div class="alert-icon">
                <i class="fas fa-exclamation-triangle" style="color: #e53e3e;"></i>
              </div>
              <div class="alert-content">
                <h6>Environmental Violation - Maloma Colliery</h6>
                <p>Discharge limits exceeded for 3 consecutive days. Immediate investigation required.</p>
                <small>Reported: 2 hours ago | Severity: Critical</small>
              </div>
            </div>
            
            <div class="alert-item warning">
              <div class="alert-icon">
                <i class="fas fa-calendar-times" style="color: #d69e2e;"></i>
              </div>
              <div class="alert-content">
                <h6>Safety Inspection Overdue - Pigg's Peak Quarry</h6>
                <p>Annual safety inspection is 15 days overdue. Schedule immediately.</p>
                <small>Due: 15 days ago | Type: Safety Compliance</small>
              </div>
            </div>
            
            <div class="alert-item info">
              <div class="alert-icon">
                <i class="fas fa-clipboard-check" style="color: #3182ce;"></i>
              </div>
              <div class="alert-content">
                <h6>License Renewal Reminder</h6>
                <p>Mining license for Sidvokodvo Quarry expires in 90 days.</p>
                <small>Expires: March 15, 2025 | Action: Renewal Required</small>
              </div>
            </div>
          </div>
          
          <div class="calendar-view">
            <div class="calendar-header">
              <h4>📅 Compliance Calendar</h4>
              <div class="calendar-controls">
                <button class="btn btn-secondary btn-sm">← Previous</button>
                <span class="current-month">December 2024</span>
                <button class="btn btn-secondary btn-sm">Next →</button>
              </div>
            </div>
            <div class="calendar-grid">
              <div class="calendar-week">
                <div class="calendar-day">
                  <span class="day-number">15</span>
                  <div class="day-events">
                    <span class="event royalty">Royalty Due: Maloma</span>
                  </div>
                </div>
                <div class="calendar-day">
                  <span class="day-number">18</span>
                  <div class="day-events">
                    <span class="event safety">Safety Inspection</span>
                  </div>
                </div>
                <div class="calendar-day">
                  <span class="day-number">20</span>
                  <div class="day-events">
                    <span class="event environmental">Environmental Report</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `,
      'templates/regulatory-management.html': `
        <section id="regulatory-management">
          <div class="page-header">
            <div class="page-title">
              <h1>⚖️ Regulatory Management</h1>
              <p>Manage regulatory frameworks, tax structures, and legislative compliance</p>
            </div>
            <div class="page-actions">
              <button class="btn btn-primary" id="new-regulation-btn">
                <i class="fas fa-plus"></i> New Regulation
              </button>
              <button class="btn btn-info" id="regulatory-updates-btn">
                <i class="fas fa-bell"></i> Updates
              </button>
            </div>
          </div>
          
          <div class="jurisdiction-matrix">
            <h4>🌍 Jurisdictional Compliance Matrix</h4>
            <div class="jurisdiction-card">
              <div class="jurisdiction-header">
                <h6>🇸🇿 Kingdom of Eswatini</h6>
                <span class="compliance-score">98%</span>
              </div>
              <div class="requirement-item">
                <span class="requirement-name">Mining Licenses</span>
                <span class="requirement-status compliant">✅ Compliant</span>
              </div>
              <div class="requirement-item">
                <span class="requirement-name">Environmental Impact</span>
                <span class="requirement-status warning">⚠️ Review Required</span>
              </div>
              <div class="requirement-item">
                <span class="requirement-name">Safety Standards</span>
                <span class="requirement-status compliant">✅ Compliant</span>
              </div>
            </div>
          </div>
          
          <div class="tax-structure-grid">
            <h4>💰 Current Tax Structure</h4>
            <div class="tax-category">
              <h6>Royalty Rates</h6>
              <div class="rate-item">
                <span>Coal</span>
                <span class="rate">2%</span>
                <span class="basis">of gross sales value</span>
              </div>
              <div class="rate-item">
                <span>Iron Ore</span>
                <span class="rate">3%</span>
                <span class="basis">of gross sales value</span>
              </div>
              <div class="rate-item">
                <span>Quarry Products</span>
                <span class="rate">E 0.50</span>
                <span class="basis">per cubic meter</span>
              </div>
            </div>
            
            <div class="tax-category">
              <h6>Additional Taxes</h6>
              <div class="rate-item">
                <span>Corporate Tax</span>
                <span class="rate">27.5%</span>
                <span class="basis">on taxable income</span>
              </div>
              <div class="rate-item">
                <span>Withholding Tax</span>
                <span class="rate">10%</span>
                <span class="basis">on dividends</span>
              </div>
            </div>
          </div>
          
          <div class="regulatory-updates">
            <h4>📋 Recent Regulatory Changes</h4>
            <div class="update-item">
              <div class="update-header">
                <h6>Amendment to Mining Act 2024</h6>
                <span class="update-date">Effective: January 1, 2025</span>
              </div>
              <p>New environmental protection requirements for all mining operations.</p>
              <button class="btn btn-info btn-sm" onclick="showRegulationDetails('amendment-2024')">View Details</button>
            </div>
          </div>
        </section>
      `,
      'templates/logout.html': `
        <section id="logout">
          <div class="page-header">
            <div class="page-title">
              <h1>👋 Logout</h1>
              <p>Sign out of the Mining Royalties Management System</p>
            </div>
          </div>
          
          <div class="user-form-container">
            <h4>🔐 Confirm Logout</h4>
            <p>Are you sure you want to sign out of your account?</p>
            
            <div class="logout-warning">
              <h5><i class="fas fa-exclamation-triangle"></i> Before you go...</h5>
              <ul>
                <li>All unsaved changes will be lost</li>
                <li>Active sessions will be terminated</li>
                <li>You'll need to log in again to access the system</li>
                <li>Consider saving any important work before logging out</li>
              </ul>
            </div>
            
            <div class="form-actions">
              <button class="btn btn-secondary" onclick="history.back()">
                <i class="fas fa-arrow-left"></i> Cancel
              </button>
              <button class="btn btn-danger" id="confirm-logout">
                <i class="fas fa-sign-out-alt"></i> Sign Out
              </button>
            </div>
          </div>
        </section>
      `
    };

    return fallbacks[templatePath] || `
      <div class="error-container">
        <h2>Template Not Found</h2>
        <p>The requested template "${templatePath}" could not be loaded.</p>
        <button class="btn btn-primary" onclick="location.reload()">
          <i class="fas fa-refresh"></i> Retry
        </button>
      </div>
    `;
  }

  _createFallbackContent(containerId, templatePath) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = this._getFallbackTemplate(templatePath);
    }
  }

  async loadComponent(containerId, componentPath, data = {}) {
    try {
      let template = await this.loadTemplate(containerId, componentPath);
      
      // Simple template variable replacement
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
      }

      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = template;
      }

      return template;
    } catch (error) {
      console.error('Component loading failed:', error);
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            Failed to load component: ${componentPath}
          </div>
        `;
      }
      // Return fallback template instead of throwing
      return this._getFallbackTemplate(componentPath);
    }
  }

  // Method to pre-load templates
  async preloadTemplates(templatePaths) {
    const loadPromises = templatePaths.map(path => 
      this.loadTemplate('temp-container', path).catch(error => {
        console.warn(`Failed to preload template: ${path}`, error);
        return null;
      })
    );
    
    try {
      await Promise.allSettled(loadPromises);
      console.log('Template preloading completed');
    } catch (error) {
      console.warn('Some templates failed to preload:', error);
    }
  }

  // Method to get cached template without loading
  getCachedTemplate(templatePath) {
    return this.cache.get(templatePath) || null;
  }

  // Method to check if template is cached
  isTemplateCached(templatePath) {
    return this.cache.has(templatePath);
  }

  // Method to invalidate cache for a specific template
  invalidateTemplate(templatePath) {
    this.cache.delete(templatePath);
    this.loadingStates.delete(templatePath);
  }

  clearCache() {
    this.cache.clear();
    this.loadingStates.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedTemplates: this.cache.size,
      loadingTemplates: this.loadingStates.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
}
