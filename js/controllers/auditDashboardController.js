/**
 * Audit Dashboard Controller
 * 
 * This controller handles the audit dashboard functionality and fixes
 * navigation issues by preventing problematic page reloads.
 */

class AuditDashboardController {
  constructor() {
    this.tableBody = null;
    this.filters = {
      dateRange: 'week',
      userFilter: 'all',
      actionFilter: 'all',
      startDate: null,
      endDate: null
    };
    this.intervals = [];
    this.timers = [];
    this.initialized = false;
    
    // Bind methods to ensure proper this context
    this.init = this.init.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
    this.removeEventListeners = this.removeEventListeners.bind(this);
    this.updateAuditEvents = this.updateAuditEvents.bind(this);
    this.loadAuditEventsData = this.loadAuditEventsData.bind(this);
    this.destroy = this.destroy.bind(this);
  }
  
  /**
   * Initialize the controller
   */
  init() {
    if (this.initialized) return;
    
    console.log("Initializing audit dashboard controller");
    
    // Store original functions if they exist
    if (typeof window.updateAuditEvents === 'function') {
      window._originalUpdateAuditEvents = window.updateAuditEvents;
    }
    
    // Override global functions with our safe implementations
    window.updateAuditEvents = this.updateAuditEvents;
    window.loadAuditEventsData = this.loadAuditEventsData;
    
    this.tableBody = document.getElementById('audit-events-table');
    this.setupEventListeners();
    
    // Listen for navigation away from this section
    document.addEventListener('sectionChange', this.onSectionChange);
    
    this.initialized = true;
    console.log("Audit dashboard controller initialized");
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    const dateRangeSelect = document.getElementById('audit-date-range');
    if (dateRangeSelect) {
      dateRangeSelect.addEventListener('change', this.handleDateRangeChange);
    }
    
    const applyFiltersBtn = document.getElementById('apply-audit-filters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => {
        const dateRange = document.getElementById('audit-date-range')?.value || 'week';
        const userFilter = document.getElementById('audit-user-filter')?.value || 'all';
        const actionFilter = document.getElementById('audit-action-filter')?.value || 'all';
        
        this.filters = {
          ...this.filters,
          dateRange,
          userFilter,
          actionFilter
        };
        
        this.updateAuditEvents(dateRange, userFilter, actionFilter);
      });
    }
    
    const resetFiltersBtn = document.getElementById('reset-audit-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }
    
    const prevPageBtn = document.getElementById('prev-page');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        this.loadAuditEventsData('prev');
      });
    }
    
    const nextPageBtn = document.getElementById('next-page');
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        this.loadAuditEventsData('next');
      });
    }
  }
  
  /**
   * Handle date range change
   */
  handleDateRangeChange = (e) => {
    const value = e.target.value;
    const customDateContainer = document.getElementById('custom-date-range-container');
    
    if (customDateContainer) {
      customDateContainer.style.display = value === 'custom' ? 'block' : 'none';
    }
    
    this.filters.dateRange = value;
  }
  
  /**
   * Reset filters to default values
   */
  resetFilters() {
    const dateRangeSelect = document.getElementById('audit-date-range');
    const userFilterSelect = document.getElementById('audit-user-filter');
    const actionFilterSelect = document.getElementById('audit-action-filter');
    
    if (dateRangeSelect) dateRangeSelect.value = 'week';
    if (userFilterSelect) userFilterSelect.value = 'all';
    if (actionFilterSelect) actionFilterSelect.value = 'all';
    
    this.filters = {
      dateRange: 'week',
      userFilter: 'all',
      actionFilter: 'all',
      startDate: null,
      endDate: null
    };
    
    this.updateAuditEvents('week', 'all', 'all');
  }
  
  /**
   * Remove event listeners
   */
  removeEventListeners() {
    document.removeEventListener('sectionChange', this.onSectionChange);
    
    // Remove other specific event listeners if needed
  }
  
  /**
   * Handle section change event
   */
  onSectionChange = (e) => {
    const { previousSection, newSection } = e.detail;
    
    if (previousSection === 'audit-dashboard') {
      console.log("Leaving audit dashboard, cleaning up...");
      this.destroy();
    }
  }
  
  /**
   * Update audit events based on filters - Fixed version that doesn't reload the page
   */
  updateAuditEvents(dateRange, userFilter, actionFilter, startDate = null, endDate = null) {
    if (!this.tableBody) {
      this.tableBody = document.getElementById('audit-events-table');
    }
    
    if this.tableBody) {
      // Show loading state
      this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading audit events...</td></tr>';
      
      // Create a tracked timer that will be cleaned up properly
      const timerId = setTimeout(() => {
        // Reset pagination when filters change
        const prevPage = document.getElementById('prev-page');
        const pageIndicator = document.getElementById('page-indicator');
        const nextPage = document.getElementById('next-page');
        
        if (prevPage) prevPage.disabled = true;
        if (pageIndicator) pageIndicator.textContent = 'Page 1 of 10';
        if (nextPage) nextPage.disabled = false;
        
        if (window.notificationManager) {
          window.notificationManager.show('Audit events updated', 'success');
        }
        
        // Instead of location.reload(), load fresh data
        this.loadAuditEventsData('current');
      }, 1000);
      
      // Track the timer for cleanup
      this.timers.push(timerId);
    }
  }
  
  /**
   * Load audit events data
   */
  loadAuditEventsData(navDirection = 'current') {
    if (!this.tableBody) {
      this.tableBody = document.getElementById('audit-events-table');
    }
    
    if (this.tableBody) {
      // Generate sample data
      const sampleData = this.getSampleAuditEvents();
      
      // Clear table
      this.tableBody.innerHTML = '';
      
      // Add sample data to table
      sampleData.forEach((event, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${event.timestamp}</td>
          <td>${event.user}</td>
          <td>${event.action}</td>
          <td>${event.target}</td>
          <td>${event.ip}</td>
          <td><span class="status-badge ${event.status.toLowerCase()}">${event.status}</span></td>
          <td>
            <button class="btn btn-sm btn-info" onclick="viewAuditDetails(${index + 1})">
              <i class="fas fa-eye"></i>
            </button>
            ${event.status === 'Failed' ? 
              `<button class="btn btn-sm btn-warning" onclick="investigateFailedLogin(${index + 1})">
                <i class="fas fa-search"></i>
              </button>` : ''}
          </td>
        `;
        
        this.tableBody.appendChild(row);
      });
      
      // Update page indicator based on navigation direction
      const pageIndicator = document.getElementById('page-indicator');
      if (pageIndicator) {
        const currentText = pageIndicator.textContent;
        const parts = currentText.split(' ');
        if (parts.length >= 4) {
          let pageNum = parseInt(parts[1], 10);
          const totalPages = parseInt(parts[3], 10);
          
          if (navDirection === 'next' && pageNum < totalPages) {
            pageNum++;
          } else if (navDirection === 'prev' && pageNum > 1) {
            pageNum--;
          } else if (navDirection === 'current') {
            // Keep current page
          }
          
          pageIndicator.textContent = `Page ${pageNum} of ${totalPages}`;
          
          // Update button states
          if (document.getElementById('prev-page')) {
            document.getElementById('prev-page').disabled = pageNum <= 1;
          }
          if (document.getElementById('next-page')) {
            document.getElementById('next-page').disabled = pageNum >= totalPages;
          }
        }
      }
    }
  }
  
  /**
   * Generate sample audit events data
   */
  getSampleAuditEvents() {
    return [
      { timestamp: '2024-02-15 14:22:05', user: 'admin', action: 'Login', target: 'System', ip: '192.168.1.100', status: 'Success' },
      { timestamp: '2024-02-15 14:35:21', user: 'editor', action: 'Created', target: 'Royalty Payment #1045', ip: '192.168.1.120', status: 'Success' },
      { timestamp: '2024-02-15 15:12:43', user: 'viewer', action: 'Viewed', target: 'Monthly Report', ip: '192.168.1.130', status: 'Success' },
      { timestamp: '2024-02-15 15:45:18', user: 'unknown', action: 'Login', target: 'System', ip: '203.45.67.89', status: 'Failed' },
      { timestamp: '2024-02-15 16:30:51', user: 'admin', action: 'Updated', target: 'System Settings', ip: '192.168.1.100', status: 'Success' },
      { timestamp: '2024-02-15 17:05:22', user: 'editor', action: 'Exported', target: 'Quarterly Report', ip: '192.168.1.120', status: 'Success' },
      { timestamp: '2024-02-15 17:16:33', user: 'admin', action: 'Created', target: 'User Account', ip: '192.168.1.100', status: 'Success' },
      { timestamp: '2024-02-15 17:45:14', user: 'hacker', action: 'Login', target: 'System', ip: '186.24.45.12', status: 'Failed' }
    ];
  }
  
  /**
   * Clean up resources when navigating away
   */
  destroy() {
    console.log("Destroying audit dashboard controller");
    this.removeEventListeners();
    
    // Clear any timers
    this.timers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.timers = [];
    
    // Clear any intervals
    this.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.intervals = [];
    
    // Restore original functions
    if (window._originalUpdateAuditEvents) {
      window.updateAuditEvents = window._originalUpdateAuditEvents;
    }
    
    this.initialized = false;
  }
}

// Create singleton instance
const auditDashboardController = new AuditDashboardController();

// Initialize when section is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we are in the audit dashboard section
  const auditDashboard = document.getElementById('audit-dashboard');
  if (auditDashboard && window.getComputedStyle(auditDashboard).display !== 'none') {
    auditDashboardController.init();
  }
});

// Listen for section navigation
document.addEventListener('sectionShown', function(e) {
  if (e.detail && e.detail.currentSection === 'audit-dashboard') {
    auditDashboardController.init();
  }
});

// Export the controller
window.auditDashboardController = auditDashboardController;
