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
              <h1>📋 Contract Management</h1>
              <p>Securely store and manage diverse royalty agreements with various stakeholders</p>
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
          
          <!-- Contract Overview Metrics -->
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

            <div class="metric-card card">
              <div class="card-header">
                <h3><i class="fas fa-users"></i> Stakeholder Types</h3>
              </div>
              <div class="card-body">
                <p>4</p>
                <small>Gov: 8 | Private: 12 | Landowners: 4</small>
              </div>
            </div>
          </div>

          <!-- Contract Filters and Search -->
          <div class="table-filters">
            <h6>Contract Filters</h6>
            <div class="grid-4">
              <div class="form-group">
                <label for="contract-type-filter">Contract Type</label>
                <select id="contract-type-filter">
                  <option value="">All Types</option>
                  <option value="government">Government Agreement</option>
                  <option value="private">Private Entity</option>
                  <option value="landowner">Landowner Agreement</option>
                  <option value="joint-venture">Joint Venture</option>
                </select>
              </div>
              <div class="form-group">
                <label for="royalty-method-filter">Calculation Method</label>
                <select id="royalty-method-filter">
                  <option value="">All Methods</option>
                  <option value="ad-valorem">Ad Valorem</option>
                  <option value="profit-based">Profit-Based</option>
                  <option value="quantity-based">Quantity-Based</option>
                  <option value="hybrid">Hybrid Method</option>
                </select>
              </div>
              <div class="form-group">
                <label for="status-filter">Status</label>
                <select id="status-filter">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div class="form-group">
                <label for="contract-search">Search</label>
                <input type="text" id="contract-search" placeholder="Contract ID, Entity, or Terms">
              </div>
            </div>
            <div class="filter-actions">
              <button class="btn btn-primary">Apply Filters</button>
              <button class="btn btn-secondary">Reset</button>
              <button class="btn btn-info">Advanced Search</button>
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
                  <td>Government of Eswatini</td>
                  <td><span class="contract-type-badge government">Government</span></td>
                  <td><span class="method-badge ad-valorem">Ad Valorem</span></td>
                  <td>2.5% of gross value</td>
                  <td>2024-01-01</td>
                  <td>2029-12-31</td>
                  <td><span class="status-badge active">Active</span></td>
                  <td>E 15.5M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm" onclick="viewContractDetails('MC-2024-001')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm" onclick="editContract('MC-2024-001')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-secondary btn-sm" onclick="downloadContract('MC-2024-001')"><i class="fas fa-download"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>LC-2024-002</td>
                  <td>Mhlume Holdings Ltd</td>
                  <td><span class="contract-type-badge private">Private Entity</span></td>
                  <td><span class="method-badge profit-based">Profit-Based</span></td>
                  <td>15% of net profit</td>
                  <td>2024-03-15</td>
                  <td>2027-03-14</td>
                  <td><span class="status-badge active">Active</span></td>
                  <td>E 8.2M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm" onclick="viewContractDetails('LC-2024-002')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm" onclick="editContract('LC-2024-002')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-secondary btn-sm" onclick="downloadContract('LC-2024-002')"><i class="fas fa-download"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>LO-2024-003</td>
                  <td>Magwegwe Community Trust</td>
                  <td><span class="contract-type-badge landowner">Landowner</span></td>
                  <td><span class="method-badge quantity-based">Quantity-Based</span></td>
                  <td>E 12 per tonne</td>
                  <td>2024-06-01</td>
                  <td>2025-05-31</td>
                  <td><span class="status-badge pending">Pending Renewal</span></td>
                  <td>E 2.8M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm" onclick="viewContractDetails('LO-2024-003')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm" onclick="editContract('LO-2024-003')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-danger btn-sm" onclick="renewContract('LO-2024-003')"><i class="fas fa-refresh"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>JV-2024-004</td>
                  <td>Sikhupe Mining Consortium</td>
                  <td><span class="contract-type-badge joint-venture">Joint Venture</span></td>
                  <td><span class="method-badge hybrid">Hybrid Method</span></td>
                  <td>2% + E 8/tonne</td>
                  <td>2024-02-01</td>
                  <td>2029-01-31</td>
                  <td><span class="status-badge active">Active</span></td>
                  <td>E 18.7M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm" onclick="viewContractDetails('JV-2024-004')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm" onclick="editContract('JV-2024-004')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-secondary btn-sm" onclick="downloadContract('JV-2024-004')"><i class="fas fa-download"></i></button>
                    </div>
                  </td>
                </tr>
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
                  <div class="method-item">
                    <span class="method-label">Ad Valorem</span>
                    <div class="method-bar">
                      <div class="method-progress" style="width: 45%;"></div>
                    </div>
                    <span class="method-percentage">45%</span>
                  </div>
                  <div class="method-item">
                    <span class="method-label">Profit-Based</span>
                    <div class="method-bar">
                      <div class="method-progress" style="width: 30%;"></div>
                    </div>
                    <span class="method-percentage">30%</span>
                  </div>
                  <div class="method-item">
                    <span class="method-label">Quantity-Based</span>
                    <div class="method-bar">
                      <div class="method-progress" style="width: 20%;"></div>
                    </div>
                    <span class="method-percentage">20%</span>
                  </div>
                  <div class="method-item">
                    <span class="method-label">Hybrid</span>
                    <div class="method-bar">
                      <div class="method-progress" style="width: 5%;"></div>
                    </div>
                    <span class="method-percentage">5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3><i class="fas fa-clock"></i> Contract Escalation Alerts</h3>
              </div>
              <div class="card-body">
                <div class="escalation-alerts">
                  <div class="alert-item urgent">
                    <div class="alert-icon">
                      <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content">
                      <h6>Rate Escalation Due - MC-2024-001</h6>
                      <p>2.5% escalation clause triggers in 30 days</p>
                      <small>Government Agreement | Due: March 15, 2025</small>
                    </div>
                  </div>
                  <div class="alert-item warning">
                    <div class="alert-icon">
                      <i class="fas fa-calendar-times"></i>
                    </div>
                    <div class="alert-content">
                      <h6>Contract Renewal Required - LO-2024-003</h6>
                      <p>Landowner agreement expires in 45 days</p>
                      <small>Magwegwe Community Trust | Expires: May 31, 2025</small>
                    </div>
                  </div>
                  <div class="alert-item info">
                    <div class="alert-icon">
                      <i class="fas fa-file-signature"></i>
                    </div>
                    <div class="alert-content">
                      <h6>Payment Schedule Review - JV-2024-004</h6>
                      <p>Quarterly payment terms review scheduled</p>
                      <small>Sikhupe Consortium | Review: March 1, 2025</small>
                    </div>
                  </div>
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
                <div class="schedule-card">
                  <div class="schedule-header">
                    <h6>Monthly Payments</h6>
                    <span class="schedule-count">12 contracts</span>
                  </div>
                  <div class="schedule-details">
                    <p>Due: 15th of each month</p>
                    <p>Late fee: 2% after 30 days</p>
                  </div>
                </div>
                <div class="schedule-card">
                  <div class="schedule-header">
                    <h6>Quarterly Payments</h6>
                    <span class="schedule-count">8 contracts</span>
                  </div>
                  <div class="schedule-details">
                    <p>Due: End of quarter</p>
                    <p>Grace period: 14 days</p>
                  </div>
                </div>
                <div class="schedule-card">
                  <div class="schedule-header">
                    <h6>Annual Payments</h6>
                    <span class="schedule-count">4 contracts</span>
                  </div>
                  <div class="schedule-details">
                    <p>Due: December 31st</p>
                    <p>Advance payment: 10% discount</p>
                  </div>
                </div>
              </div>
            </div>
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
              <p>Securely store and manage diverse royalty agreements with various stakeholders</p>
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
          
          <!-- Contract Overview Metrics -->
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

            <div class="metric-card card">
              <div class="card-header">
                <h3><i class="fas fa-users"></i> Stakeholder Types</h3>
              </div>
              <div class="card-body">
                <p>4</p>
                <small>Gov: 8 | Private: 12 | Landowners: 4</small>
              </div>
            </div>
          </div>

          <!-- Contract Filters and Search -->
          <div class="table-filters">
            <h6>Contract Filters</h6>
            <div class="grid-4">
              <div class="form-group">
                <label for="contract-type-filter">Contract Type</label>
                <select id="contract-type-filter">
                  <option value="">All Types</option>
                  <option value="government">Government Agreement</option>
                  <option value="private">Private Entity</option>
                  <option value="landowner">Landowner Agreement</option>
                  <option value="joint-venture">Joint Venture</option>
                </select>
              </div>
              <div class="form-group">
                <label for="royalty-method-filter">Calculation Method</label>
                <select id="royalty-method-filter">
                  <option value="">All Methods</option>
                  <option value="ad-valorem">Ad Valorem</option>
                  <option value="profit-based">Profit-Based</option>
                  <option value="quantity-based">Quantity-Based</option>
                  <option value="hybrid">Hybrid Method</option>
                </select>
              </div>
              <div class="form-group">
                <label for="status-filter">Status</label>
                <select id="status-filter">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div class="form-group">
                <label for="contract-search">Search</label>
                <input type="text" id="contract-search" placeholder="Contract ID, Entity, or Terms">
              </div>
            </div>
            <div class="filter-actions">
              <button class="btn btn-primary">Apply Filters</button>
              <button class="btn btn-secondary">Reset</button>
              <button class="btn btn-info">Advanced Search</button>
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
                  <td>Government of Eswatini</td>
                  <td><span class="contract-type-badge government">Government</span></td>
                  <td><span class="method-badge ad-valorem">Ad Valorem</span></td>
                  <td>2.5% of gross value</td>
                  <td>2024-01-01</td>
                  <td>2029-12-31</td>
                  <td><span class="status-badge active">Active</span></td>
                  <td>E 15.5M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm" onclick="viewContractDetails('MC-2024-001')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm" onclick="editContract('MC-2024-001')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-secondary btn-sm" onclick="downloadContract('MC-2024-001')"><i class="fas fa-download"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>LC-2024-002</td>
                  <td>Mhlume Holdings Ltd</td>
                  <td><span class="contract-type-badge private">Private Entity</span></td>
                  <td><span class="method-badge profit-based">Profit-Based</span></td>
                  <td>15% of net profit</td>
                  <td>2024-03-15</td>
                  <td>2027-03-14</td>
                  <td><span class="status-badge active">Active</span></td>
                  <td>E 8.2M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm" onclick="viewContractDetails('LC-2024-002')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm" onclick="editContract('LC-2024-002')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-secondary btn-sm" onclick="downloadContract('LC-2024-002')"><i class="fas fa-download"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>LO-2024-003</td>
                  <td>Magwegwe Community Trust</td>
                  <td><span class="contract-type-badge landowner">Landowner</span></td>
                  <td><span class="method-badge quantity-based">Quantity-Based</span></td>
                  <td>E 12 per tonne</td>
                  <td>2024-06-01</td>
                  <td>2025-05-31</td>
                  <td><span class="status-badge pending">Pending Renewal</span></td>
                  <td>E 2.8M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm" onclick="viewContractDetails('LO-2024-003')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm" onclick="editContract('LO-2024-003')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-danger btn-sm" onclick="renewContract('LO-2024-003')"><i class="fas fa-refresh"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>JV-2024-004</td>
                  <td>Sikhupe Mining Consortium</td>
                  <td><span class="contract-type-badge joint-venture">Joint Venture</span></td>
                  <td><span class="method-badge hybrid">Hybrid Method</span></td>
                  <td>2% + E 8/tonne</td>
                  <td>2024-02-01</td>
                  <td>2029-01-31</td>
                  <td><span class="status-badge active">Active</span></td>
                  <td>E 18.7M</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-info btn-sm" onclick="viewContractDetails('JV-2024-004')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-warning btn-sm" onclick="editContract('JV-2024-004')"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-secondary btn-sm" onclick="downloadContract('JV-2024-004')"><i class="fas fa-download"></i></button>
                    </div>
                  </td>
                </tr>
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
                  <div class="method-item">
                    <span class="method-label">Ad Valorem</span>
                    <div class="method-bar">
                      <div class="method-progress" style="width: 45%;"></div>
                    </div>
                    <span class="method-percentage">45%</span>
                  </div>
                  <div class="method-item">
                    <span class="method-label">Profit-Based</span>
                    <div class="method-bar">
                      <div class="method-progress" style="width: 30%;"></div>
                    </div>
                    <span class="method-percentage">30%</span>
                  </div>
                  <div class="method-item">
                    <span class="method-label">Quantity-Based</span>
                    <div class="method-bar">
                      <div class="method-progress" style="width: 20%;"></div>
                    </div>
                    <span class="method-percentage">20%</span>
                  </div>
                  <div class="method-item">
                    <span class="method-label">Hybrid</span>
                    <div class="method-bar">
                      <div class="method-progress" style="width: 5%;"></div>
                    </div>
                    <span class="method-percentage">5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3><i class="fas fa-clock"></i> Contract Escalation Alerts</h3>
              </div>
              <div class="card-body">
                <div class="escalation-alerts">
                  <div class="alert-item urgent">
                    <div class="alert-icon">
                      <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-content">
                      <h6>Rate Escalation Due - MC-2024-001</h6>
                      <p>2.5% escalation clause triggers in 30 days</p>
                      <small>Government Agreement | Due: March 15, 2025</small>
                    </div>
                  </div>
                  <div class="alert-item warning">
                    <div class="alert-icon">
                      <i class="fas fa-calendar-times"></i>
                    </div>
                    <div class="alert-content">
                      <h6>Contract Renewal Required - LO-2024-003</h6>
                      <p>Landowner agreement expires in 45 days</p>
                      <small>Magwegwe Community Trust | Expires: May 31, 2025</small>
                    </div>
                  </div>
                  <div class="alert-item info">
                    <div class="alert-icon">
                      <i class="fas fa-file-signature"></i>
                    </div>
                    <div class="alert-content">
                      <h6>Payment Schedule Review - JV-2024-004</h6>
                      <p>Quarterly payment terms review scheduled</p>
                      <small>Sikhupe Consortium | Review: March 1, 2025</small>
                    </div>
                  </div>
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
                <div class="schedule-card">
                  <div class="schedule-header">
                    <h6>Monthly Payments</h6>
                    <span class="schedule-count">12 contracts</span>
                  </div>
                  <div class="schedule-details">
                    <p>Due: 15th of each month</p>
                    <p>Late fee: 2% after 30 days</p>
                  </div>
                </div>
                <div class="schedule-card">
                  <div class="schedule-header">
                    <h6>Quarterly Payments</h6>
                    <span class="schedule-count">8 contracts</span>
                  </div>
                  <div class="schedule-details">
                    <p>Due: End of quarter</p>
                    <p>Grace period: 14 days</p>
                  </div>
                </div>
                <div class="schedule-card">
                  <div class="schedule-header">
                    <h6>Annual Payments</h6>
                    <span class="schedule-count">4 contracts</span>
                  </div>
                  <div class="schedule-details">
                    <p>Due: December 31st</p>
                    <p>Advance payment: 10% discount</p>
                  </div>
                </div>
              </div>
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
