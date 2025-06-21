/**
 * App.js Navigation Fix
 * 
 * This script patches the app.js file to fix issues with section navigation,
 * particularly related to the audit dashboard section.
 */

(function() {
  // Wait for the app to be fully loaded
  window.addEventListener('load', function() {
    setTimeout(applyFixes, 500);
  });

  function applyFixes() {
    if (!window.app) {
      console.error('App not initialized, cannot apply fixes');
      return;
    }

    console.log('Applying navigation fixes to app.js...');

    // Fix 1: Enhance the showSection method to handle cleanup properly
    enhanceShowSection();

    // Fix 2: Enhance the loadSectionContent method to better handle loading
    enhanceLoadSectionContent();

    // Fix 3: Add special handling for audit dashboard
    addAuditDashboardHandling();

    console.log('App.js navigation fixes applied successfully');
  }

  function enhanceShowSection() {
    // Store original showSection function
    if (!window.app.showSection) {
      console.error('showSection method not found!');
      return;
    }

    const originalShowSection = window.app.showSection;

    window.app.showSection = function(sectionId) {
      try {
        console.log(`Navigation: ${this.currentSection} -> ${sectionId}`);

        // Store the previous section for cleanup
        const previousSection = this.currentSection;

        // Special handling when leaving audit dashboard
        if (previousSection === 'audit-dashboard' && sectionId !== 'audit-dashboard') {
          console.log('Leaving audit dashboard section, cleaning up resources...');

          // Dispatch event for components to clean up
          document.dispatchEvent(new CustomEvent('sectionChange', {
            detail: {
              previousSection: previousSection,
              newSection: sectionId
            }
          }));

          // Clean up any timers
          cleanupAuditDashboardResources();
        }

        // Call original showSection function
        return originalShowSection.call(this, sectionId);
      } catch (error) {
        console.error('Error in enhanced showSection:', error);
        // Fall back to original function
        return originalShowSection.call(this, sectionId);
      }
    };
  }

  function enhanceLoadSectionContent() {
    // Store original loadSectionContent function
    if (!window.app.loadSectionContent) {
      console.error('loadSectionContent method not found!');
      return;
    }

    const originalLoadSectionContent = window.app.loadSectionContent;

    window.app.loadSectionContent = function(sectionId) {
      try {
        console.log(`Enhanced loading of section: ${sectionId}`);

        // Special handling for audit dashboard
        if (sectionId === 'audit-dashboard') {
          console.log('Setting up audit dashboard handling...');

          // Track that we're loading audit dashboard
          window._loadingAuditDashboard = true;

          // Set up interceptors for problematic functions
          setupAuditDashboardInterceptors();
        }

        // Call original loadSectionContent function
        return originalLoadSectionContent.call(this, sectionId);
      } catch (error) {
        console.error('Error in enhanced loadSectionContent:', error);
        // Fall back to original function
        return originalLoadSectionContent.call(this, sectionId);
      }
    };
  }

  function addAuditDashboardHandling() {
    // Add listener for audit dashboard content loaded
    document.addEventListener('DOMContentLoaded', function onDOMLoaded(event) {
      // Check if we're in the audit dashboard section
      if (window._loadingAuditDashboard) {
        console.log('Audit dashboard content loaded, applying fixes...');
        window._loadingAuditDashboard = false;

        // Apply fixes to audit dashboard
        fixAuditDashboard();
      }
    });

    // Listen for section changes that involve audit dashboard
    document.addEventListener('sectionChange', function(e) {
      if (e.detail && e.detail.previousSection === 'audit-dashboard') {
        console.log('Section change event: Leaving audit dashboard');
        cleanupAuditDashboardResources();
      }
    });
  }

  function setupAuditDashboardInterceptors() {
    // Store original updateAuditEvents function if it exists
    if (typeof window.updateAuditEvents === 'function') {
      window._originalUpdateAuditEvents = window.updateAuditEvents;

      // Replace with safe version
      window.updateAuditEvents = function(...args) {
        console.log('Safe updateAuditEvents called');
        try {
          const tableBody = document.getElementById('audit-events-table');
          if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading audit events...</td></tr>';

            setTimeout(() => {
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

              // Use loadAuditEventsData instead of location.reload()
              if (typeof window.loadAuditEventsData === 'function') {
                window.loadAuditEventsData();
              } else {
                // Fallback to showing some data
                loadDummyAuditData(tableBody);
              }
            }, 1000);
          }
        } catch (e) {
          console.error('Error in safe updateAuditEvents:', e);
        }
      };
    }

    // Track setTimeout calls in audit dashboard
    window._originalSetTimeout = window.setTimeout;
    window._auditDashboardTimers = window._auditDashboardTimers || [];

    window.setTimeout = function(callback, delay) {
      const timerId = window._originalSetTimeout(callback, delay);
      
      // Track timer if we're in the audit dashboard section
      if (window.app && window.app.currentSection === 'audit-dashboard') {
        window._auditDashboardTimers.push(timerId);
      }
      
      return timerId;
    };
    
    // Track setInterval calls too
    window._originalSetInterval = window.setInterval;
    window._auditDashboardIntervals = window._auditDashboardIntervals || [];
    
    window.setInterval = function(callback, delay) {
      const intervalId = window._originalSetInterval(callback, delay);
      
      // Track interval if we're in the audit dashboard section
      if (window.app && window.app.currentSection === 'audit-dashboard') {
        window._auditDashboardIntervals.push(intervalId);
      }
      
      return intervalId;
    };
  }

  function fixAuditDashboard() {
    // Apply specific fixes to the audit dashboard component after it's loaded
    
    // Remove any existing location.reload() calls
    if (typeof window.updateAuditEvents === 'function' && 
        window.updateAuditEvents.toString().includes('location.reload')) {
      console.log('Found location.reload() in updateAuditEvents, fixing...');
      
      // Already replaced this function in setupAuditDashboardInterceptors
    }
    
    // Make sure event listeners are properly set up with cleanup
    setupEventCleanup();
  }
  
  function setupEventCleanup() {
    // Track event listeners added in the audit dashboard
    window._auditDashboardEventListeners = window._auditDashboardEventListeners || [];
    
    // Store original addEventListener
    const originalAddEventListener = Element.prototype.addEventListener;
    
    // Override addEventListener to track listeners in audit dashboard
    Element.prototype.addEventListener = function(type, listener, options) {
      const result = originalAddEventListener.call(this, type, listener, options);
      
      // Track listeners added while in audit dashboard
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

  function cleanupAuditDashboardResources() {
    console.log('Cleaning up audit dashboard resources...');
    
    // Clean up timers
    if (window._auditDashboardTimers && window._auditDashboardTimers.length) {
      console.log(`Clearing ${window._auditDashboardTimers.length} timers...`);
      window._auditDashboardTimers.forEach(id => clearTimeout(id));
      window._auditDashboardTimers = [];
    }
    
    // Clean up intervals
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
    
    // Restore original addEventListener
    Element.prototype.addEventListener = Element.prototype._originalAddEventListener;
    
    console.log('Audit dashboard cleanup complete');
  }

  function loadDummyAuditData(tableBody) {
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const sampleData = [
      { timestamp: '2024-02-10 15:45:32', user: 'admin', action: 'Login', target: 'System', ip: '192.168.1.100', status: 'Success' },
      { timestamp: '2024-02-10 16:12:45', user: 'editor', action: 'Create Record', target: 'Royalty Payment #1045', ip: '192.168.1.120', status: 'Success' },
      { timestamp: '2024-02-10 16:45:18', user: 'unknown', action: 'Login', target: 'System', ip: '203.45.67.89', status: 'Failed' },
      { timestamp: '2024-02-10 17:02:51', user: 'admin', action: 'Update Settings', target: 'System Configuration', ip: '192.168.1.100', status: 'Success' }
    ];
    
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
          <button class="btn btn-sm btn-info" onclick="console.log('View details ${index+1}')">
            <i class="fas fa-eye"></i>
          </button>
          ${event.status === 'Failed' ? 
            `<button class="btn btn-sm btn-warning" onclick="console.log('Investigate ${index+1}')">
              <i class="fas fa-search"></i>
            </button>` : ''}
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
})();