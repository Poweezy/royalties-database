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
              <h1>My Profile</h1>
              <p>Manage your account settings and preferences</p>
            </div>
          </div>
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading profile settings...</p>
          </div>
        </section>
      `,
      'templates/logout.html': `
        <section id="logout">
          <div class="page-header">
            <div class="page-title">
              <h1>Logout</h1>
              <p>Sign out of the system</p>
            </div>
          </div>
          <div class="user-form-container">
            <h4>Confirm Logout</h4>
            <p>Are you sure you want to sign out?</p>
            <div class="form-actions">
              <button class="btn btn-secondary" onclick="history.back()">Cancel</button>
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
