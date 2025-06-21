/**
 * Audit Dashboard Navigation Fix
 * 
 * This script fixes the issue where other sections don't load after 
 * clicking on the audit dashboard section.
 */

(function() {
  console.log('Applying audit dashboard navigation fix...');
  
  // Track resources for cleanup
  window._auditDashboardTimers = window._auditDashboardTimers || [];
  window._auditDashboardIntervals = window._auditDashboardIntervals || [];
  window._auditDashboardEventListeners = window._auditDashboardEventListeners || [];
  
  // Listen for DOM loaded event
  document.addEventListener('DOMContentLoaded', function() {
    fixAuditDashboard();
  });
  
  // Also fix immediately if we're already in the audit dashboard
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fixAuditDashboard();
  }
  
  function fixAuditDashboard() {
    // First check if we're in the audit dashboard section
    const auditDashboard = document.getElementById('audit-dashboard');
    if (!auditDashboard) return;
    
    if (window.location.hash === '#audit-dashboard' || 
        (window.app && window.app.currentSection === 'audit-dashboard')) {
      console.log('Audit dashboard detected, applying fixes...');
      
      // Fix the updateAuditEvents function that uses location.reload()
      fixUpdateAuditEventsFunction();
      
      // Track timers and intervals for cleanup
      setupResourceTracking();
      
      // Enhance app.showSection if available
      enhanceShowSectionMethod();
    }
  }
  
  function fixUpdateAuditEventsFunction() {
    if (typeof window.updateAuditEvents === 'function') {
      window._originalUpdateAuditEvents = window.updateAuditEvents;
      
      window.updateAuditEvents = function(dateRange, userFilter, actionFilter, startDate, endDate) {
        console.log('Using fixed updateAuditEvents');
        
        const tableBody = document.getElementById('audit-events-table');
        if (tableBody) {
          // Add loading state
          tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading audit events...</td></tr>';
          
          const timerId = setTimeout(() => {
            // Reset pagination when filters change
            if (document.getElementById('prev-page')) {
              document.getElementById('prev-page').disabled = true;
            }
            if (document.getElementById('page-indicator')) {
              document.getElementById('page-indicator').textContent = 'Page 1 of 10';
            }
            if (document.getElementById('next-page')) {
              document.getElementById('next-page').disabled = false;
            }
            
            if (window.notificationManager) {
              window.notificationManager.show('Audit events updated', 'success');
            }
            
            // Instead of location.reload(), load sample data
            if (typeof window.loadAuditEventsData === 'function') {
              window.loadAuditEventsData();
            } else {
              loadSampleAuditData(tableBody);
            }
          }, 1000);
          
          // Track this timer for cleanup
          window._auditDashboardTimers.push(timerId);
        }
      };
      
      console.log('Fixed updateAuditEvents function');
    }
  }
  
  function setupResourceTracking() {
    // Track setTimeout calls in audit dashboard
    window._originalSetTimeout = window.setTimeout;
    
    window.setTimeout = function(callback, delay, ...args) {
      const id = window._originalSetTimeout(callback, delay, ...args);
      if (window.app && window.app.currentSection === 'audit-dashboard') {
        window._auditDashboardTimers.push(id);
      }
      return id;
    };
    
    // Track setInterval calls too
    window._originalSetInterval = window.setInterval;
    
    window.setInterval = function(callback, delay, ...args) {
      const id = window._originalSetInterval(callback, delay, ...args);
      if (window.app && window.app.currentSection === 'audit-dashboard') {
        window._auditDashboardIntervals.push(id);
      }
      return id;
    };
    
    // Track event listeners
    const originalAddEventListener = Element.prototype.addEventListener;
    Element.prototype._originalAddEventListener = originalAddEventListener;
    
    Element.prototype.addEventListener = function(type, listener, options) {
      const result = originalAddEventListener.call(this, type, listener, options);
      
      if (window.app && window.app.currentSection === 'audit-dashboard') {
        window._auditDashboardEventListeners.push({
          element: this,
          type: type,
          listener: listener,
          options: options
        });
      }
      
      return result;
    };
  }
  
  function enhanceShowSectionMethod() {
    if (window.app && window.app.showSection) {
      const originalShowSection = window.app.showSection;
      
      window.app.showSection = function(sectionId) {
        // If leaving audit dashboard, do cleanup
        if (this.currentSection === 'audit-dashboard' && sectionId !== 'audit-dashboard') {
          console.log('Leaving audit dashboard, cleaning up...');
          cleanupAuditDashboardResources();
        }
        
        // Call original function
        return originalShowSection.call(this, sectionId);
      };
    }
  }
  
  function cleanupAuditDashboardResources() {
    console.log('Cleaning up audit dashboard resources...');
    
    // Clear timers
    if (window._auditDashboardTimers && window._auditDashboardTimers.length) {
      console.log(`Clearing ${window._auditDashboardTimers.length} timers...`);
      window._auditDashboardTimers.forEach(id => clearTimeout(id));
      window._auditDashboardTimers = [];
    }
    
    // Clear intervals
    if (window._auditDashboardIntervals && window._auditDashboardIntervals.length) {
      console.log(`Clearing ${window._auditDashboardIntervals.length} intervals...`);
      window._auditDashboardIntervals.forEach(id => clearInterval(id));
      window._auditDashboardIntervals = [];
    }
    
    // Clean up event listeners
    if (window._auditDashboardEventListeners && window._auditDashboardEventListeners.length) {
      console.log(`Removing ${window._auditDashboardEventListeners.length} event listeners...`);
      window._auditDashboardEventListeners.forEach(({ element, type, listener, options }) => {
        try {
          element.removeEventListener(type, listener, options);
        } catch (e) {
          console.warn('Error removing event listener:', e);
        }
      });
      window._auditDashboardEventListeners = [];
    }
    
    // Restore original functions
    if (window._originalUpdateAuditEvents) {
      window.updateAuditEvents = window._originalUpdateAuditEvents;
    }
    
    if (window._originalSetTimeout) {
      window.setTimeout = window._originalSetTimeout;
    }
    
    if (window._originalSetInterval) {
      window.setInterval = window._originalSetInterval;
    }
    
    if (Element.prototype._originalAddEventListener) {
      Element.prototype.addEventListener = Element.prototype._originalAddEventListener;
    }
    
    console.log('Audit dashboard cleanup complete');
  }
  
  // Helper function to load sample audit data
  function loadSampleAuditData(tableBody) {
    if (!tableBody) return;
    
    const sampleAuditEvents = [
      { timestamp: '2024-02-15 15:45:32', user: 'admin', action: 'Login', target: 'System', ip: '192.168.1.100', status: 'Success' },
      { timestamp: '2024-02-15 16:12:45', user: 'editor', action: 'Create Record', target: 'Royalty Payment #1045', ip: '192.168.1.120', status: 'Success' },
      { timestamp: '2024-02-15 16:30:22', user: 'viewer', action: 'View Record', target: 'Monthly Report', ip: '192.168.1.130', status: 'Success' },
      { timestamp: '2024-02-15 16:45:18', user: 'unknown', action: 'Login', target: 'System', ip: '203.45.67.89', status: 'Failed' },
      { timestamp: '2024-02-15 17:02:51', user: 'admin', action: 'Update Settings', target: 'System Configuration', ip: '192.168.1.100', status: 'Success' }
    ];
    
    tableBody.innerHTML = '';
    
    sampleAuditEvents.forEach((event, index) => {
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
      
      tableBody.appendChild(row);
    });
  }
  
  console.log('Audit dashboard navigation fix loaded successfully!');
})();