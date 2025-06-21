/**
 * Audit Dashboard Controller
 * 
 * Responsible for managing the audit dashboard functionality and ensuring
 * proper cleanup when navigating away from the audit dashboard section.
 */

class AuditDashboardController {
  constructor() {
    // Track event listeners for proper cleanup
    this.eventListeners = [];
    this.timers = [];
    
    // Bind methods
    this.init = this.init.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
    this.addTrackedListener = this.addTrackedListener.bind(this);
    this.updateAuditMetrics = this.updateAuditMetrics.bind(this);
    this.loadAuditEventsData = this.loadAuditEventsData.bind(this);
    this.updateAuditEvents = this.updateAuditEvents.bind(this);
  }
  
  /**
   * Initialize the controller
   */
  init() {
    console.log('Initializing AuditDashboardController...');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load initial data
    this.updateAuditMetrics();
    this.loadAuditEventsData('current');
    
    // Set up cleanup when leaving the section
    document.addEventListener('sectionChange', (e) => {
      if (e.detail && e.detail.previousSection === 'audit-dashboard') {
        this.cleanup();
      }
    });
    
    // Make methods accessible globally
    window.loadAuditEventsData = this.loadAuditEventsData;
    window.updateAuditEvents = this.updateAuditEvents;
    
    console.log('AuditDashboardController initialized successfully');
  }
  
  /**
   * Clean up resources when leaving the section
   */
  cleanup() {
    console.log('Cleaning up audit dashboard resources...');
    
    // Remove event listeners
    this.eventListeners.forEach(({ element, eventType, handler }) => {
      if (element) {
        element.removeEventListener(eventType, handler);
      }
    });
    this.eventListeners = [];
    
    // Clear any timers
    this.timers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.timers = [];
    
    console.log('Audit dashboard cleanup complete');
  }
  
  /**
   * Add a tracked event listener that will be cleaned up automatically
   */
  addTrackedListener(element, eventType, handler) {
    if (element) {
      element.addEventListener(eventType, handler);
      this.eventListeners.push({ element, eventType, handler });
    }
  }
  
  /**
   * Set up all event listeners for the audit dashboard
   */
  setupEventListeners() {
    // Date range filter
    const dateRangeSelect = document.getElementById('audit-date-range');
    this.addTrackedListener(dateRangeSelect, 'change', () => {
      const customDateContainer = document.getElementById('custom-date-range-container');
      if (customDateContainer) {
        customDateContainer.style.display = dateRangeSelect.value === 'custom' ? 'block' : 'none';
      }
    });
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-audit-filters');
    this.addTrackedListener(applyFiltersBtn, 'click', () => {
      const dateRange = document.getElementById('audit-date-range')?.value || 'week';
      const userFilter = document.getElementById('audit-user-filter')?.value || 'all';
      const actionFilter = document.getElementById('audit-action-filter')?.value || 'all';
      
      if (window.notificationManager) {
        window.notificationManager.show(`Applying filters: ${dateRange}, ${userFilter}, ${actionFilter}`, 'info');
      }
      
      this.updateAuditEvents(dateRange, userFilter, actionFilter);
    });
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('reset-audit-filters');
    this.addTrackedListener(resetFiltersBtn, 'click', () => {
      const dateRange = document.getElementById('audit-date-range');
      const userFilter = document.getElementById('audit-user-filter');
      const actionFilter = document.getElementById('audit-action-filter');
      
      if (dateRange) dateRange.value = 'week';
      if (userFilter) userFilter.value = 'all';
      if (actionFilter) actionFilter.value = 'all';
      
      if (window.notificationManager) {
        window.notificationManager.show('Audit filters reset', 'info');
      }
      
      this.updateAuditEvents('week', 'all', 'all');
    });
    
    // Custom date range buttons
    const applyCustomDateBtn = document.getElementById('apply-custom-date');
    this.addTrackedListener(applyCustomDateBtn, 'click', () => {
      const startDate = document.getElementById('custom-date-start')?.value;
      const endDate = document.getElementById('custom-date-end')?.value;
      
      if (!startDate || !endDate) {
        if (window.notificationManager) {
          window.notificationManager.show('Please select both start and end dates', 'error');
        }
        return;
      }
      
      if (window.notificationManager) {
        window.notificationManager.show(`Applying custom date range: ${startDate} - ${endDate}`, 'info');
      }
      
      this.updateAuditEvents('custom', 'all', 'all', startDate, endDate);
    });
    
    // Other button event listeners...
    this.setupAdditionalEventListeners();
  }
  
  /**
   * Set up additional event listeners
   */
  setupAdditionalEventListeners() {
    // Pagination controls
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageSizeSelect = document.getElementById('page-size');
    
    this.addTrackedListener(prevPageBtn, 'click', () => {
      if (!prevPageBtn.disabled) {
        this.loadAuditEventsData('prev');
      }
    });
    
    this.addTrackedListener(nextPageBtn, 'click', () => {
      if (!nextPageBtn.disabled) {
        this.loadAuditEventsData('next');
      }
    });
    
    this.addTrackedListener(pageSizeSelect, 'change', () => {
      this.loadAuditEventsData('current');
    });
    
    // Action buttons
    const refreshAuditBtn = document.getElementById('refresh-audit-btn');
    this.addTrackedListener(refreshAuditBtn, 'click', () => {
      if (window.notificationManager) {
        window.notificationManager.show('Refreshing audit data...', 'info');
      }
      
      this.updateAuditMetrics();
      this.loadAuditEventsData('current');
    });
    
    const exportAuditBtn = document.getElementById('export-audit-btn');
    this.addTrackedListener(exportAuditBtn, 'click', () => {
      const formats = ['CSV', 'PDF', 'Excel'];
      const selectedFormat = prompt(`Choose export format: ${formats.join(', ')}`, 'CSV');
      
      if (selectedFormat && formats.map(f => f.toLowerCase()).includes(selectedFormat.toLowerCase())) {
        if (window.exportAuditData) {
          window.exportAuditData(selectedFormat);
        }
      }
    });
  }
  
  /**
   * Update the metrics in the UI
   */
  updateAuditMetrics() {
    // In a real app, this would fetch from an API
    // For demo purposes, we'll use random values
    const metrics = {
      'active-users-24h': Math.floor(Math.random() * 20) + 10,
      'login-attempts': Math.floor(Math.random() * 50) + 30,
      'data-access-events': Math.floor(Math.random() * 200) + 100,
      'security-alerts': Math.floor(Math.random() * 5) + 1
    };
    
    Object.entries(metrics).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }
  
  /**
   * Load audit events data
   */
  loadAuditEventsData(navDirection = 'current') {
    const tableBody = document.getElementById('audit-events-table');
    if (!tableBody) return;
    
    // Show loading indicator
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 1rem;">Loading audit events...</td></tr>';
    
    // Update pagination controls
    const pageIndicator = document.getElementById('page-indicator');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    let currentPage = 1;
    let totalPages = 10;
    
    if (pageIndicator) {
      const match = pageIndicator.textContent.match(/Page (\d+) of (\d+)/);
      if (match) {
        currentPage = parseInt(match[1], 10);
        totalPages = parseInt(match[2], 10);
        
        if (navDirection === 'prev' && currentPage > 1) {
          currentPage--;
        } else if (navDirection === 'next' && currentPage < totalPages) {
          currentPage++;
        }
      }
    }
    
    // Update pagination display
    if (pageIndicator) {
      pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // In a real app, this would be an API call
    // For demo purposes, we'll use sample data and simulate a delay
    const timerId = setTimeout(() => {
      const sampleAuditEvents = [
        { id: 1, timestamp: '2024-02-10 15:45:32', user: 'admin', action: 'Login', target: 'System', ip: '192.168.1.100', status: 'Success' },
        { id: 2, timestamp: '2024-02-10 16:12:45', user: 'editor', action: 'Create Record', target: 'Royalty Payment #1045', ip: '192.168.1.120', status: 'Success' },
        { id: 3, timestamp: '2024-02-10 16:30:22', user: 'viewer', action: 'View Record', target: 'Monthly Report', ip: '192.168.1.130', status: 'Success' },
        { id: 4, timestamp: '2024-02-10 16:45:18', user: 'unknown', action: 'Login', target: 'System', ip: '203.45.67.89', status: 'Failed' },
        { id: 5, timestamp: '2024-02-10 17:02:51', user: 'admin', action: 'Update Settings', target: 'System Configuration', ip: '192.168.1.100', status: 'Success' }
      ];
      
      // Clear the table
      tableBody.innerHTML = '';
      
      // Add rows
      sampleAuditEvents.forEach(event => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${event.timestamp}</td>
          <td>${event.user}</td>
          <td>${event.action}</td>
          <td>${event.target}</td>
          <td>${event.ip}</td>
          <td><span class="status-badge ${event.status.toLowerCase()}">${event.status}</span></td>
          <td>
            <button class="btn btn-sm btn-info" onclick="viewAuditDetails(${event.id})">
              <i class="fas fa-eye"></i>
            </button>
            ${event.status === 'Failed' ? 
              `<button class="btn btn-sm btn-warning" onclick="investigateFailedLogin(${event.id})">
                <i class="fas fa-search"></i>
              </button>` : ''}
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      if (window.notificationManager) {
        window.notificationManager.show('Audit data loaded successfully', 'success');
      }
      
      // Remove this timer ID from our tracked timers
      const index = this.timers.indexOf(timerId);
      if (index !== -1) {
        this.timers.splice(index, 1);
      }
    }, 800);
    
    // Track the timer
    this.timers.push(timerId);
  }
  
  /**
   * Update audit events based on filters
   */
  updateAuditEvents(dateRange, userFilter, actionFilter, startDate = null, endDate = null) {
    const tableBody = document.getElementById('audit-events-table');
    if (tableBody) {
      // Add loading state
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading audit events...</td></tr>';
      
      // In a real implementation, you would fetch filtered data from the server
      // For now, we'll simulate loading delay and use placeholder data
      const timerId = setTimeout(() => {
        // Reset pagination when filters change
        const prevPageBtn = document.getElementById('prev-page');
        const pageIndicator = document.getElementById('page-indicator');
        const nextPageBtn = document.getElementById('next-page');
        
        if (prevPageBtn) prevPageBtn.disabled = true;
        if (pageIndicator) pageIndicator.textContent = 'Page 1 of 10';
        if (nextPageBtn) nextPageBtn.disabled = false;
        
        if (window.notificationManager) {
          window.notificationManager.show('Audit events updated', 'success');
        }
        
        // Instead of location.reload(), just load the filtered data
        this.loadAuditEventsData('current');
        
        // Remove this timer ID from our tracked timers
        const index = this.timers.indexOf(timerId);
        if (index !== -1) {
          this.timers.splice(index, 1);
        }
      }, 1000);
      
      // Track the timer
      this.timers.push(timerId);
    }
  }
}

// Create singleton instance
const auditDashboardController = new AuditDashboardController();

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if we're in the audit dashboard section
  if (document.getElementById('audit-dashboard')) {
    auditDashboardController.init();
  }
});

// Also initialize when the section content is loaded
document.addEventListener('sectionContentLoaded', function(e) {
  if (e.detail && e.detail.sectionId === 'audit-dashboard') {
    auditDashboardController.init();
  }
});

// Export the controller
if (typeof module !== 'undefined') {
  module.exports = { AuditDashboardController, auditDashboardController };
}
