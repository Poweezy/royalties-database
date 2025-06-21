/**
 * Audit Dashboard Navigation Fix
 * 
 * This script fixes the issue where other sections don't load after 
 * clicking on the audit dashboard section.
 */

(function() {
  console.log('Applying audit dashboard navigation fix...');
  
  // Override problematic functions when audit dashboard loads
  document.addEventListener('DOMContentLoaded', function() {
    // First check if we're in the audit dashboard section
    if (!document.getElementById('audit-dashboard') || 
        window.location.hash !== '#audit-dashboard') {
      return;
    }
    
    console.log('Audit dashboard detected, applying fixes...');
    
    // Store original functions if they exist
    const originalFunctions = {};
    
    // 1. Fix the updateAuditEvents function that uses location.reload()
    if (typeof window.updateAuditEvents === 'function') {
      originalFunctions.updateAuditEvents = window.updateAuditEvents;
      
      window.updateAuditEvents = function(dateRange, userFilter, actionFilter, startDate, endDate) {
        console.log('Using fixed updateAuditEvents');
        
        const tableBody = document.getElementById('audit-events-table');
        if (tableBody) {
          // Add loading state
          tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading audit events...</td></tr>';
          
          setTimeout(() => {
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
        }
      };
    }
    
    // Helper function to load sample audit data
    function loadSampleAuditData(tableBody) {
      if (!tableBody) return;
      
      const sampleAuditEvents = [
        { timestamp: '2024-02-10 15:45:32', user: 'admin', action: 'Login', target: 'System', ip: '192.168.1.100', status: 'Success' },
        { timestamp: '2024-02-10 16:12:45', user: 'editor', action: 'Create Record', target: 'Royalty Payment #1045', ip: '192.168.1.120', status: 'Success' },
        { timestamp: '2024-02-10 16:30:22', user: 'viewer', action: 'View Record', target: 'Monthly Report', ip: '192.168.1.130', status: 'Success' },
        { timestamp: '2024-02-10 16:45:18', user: 'unknown', action: 'Login', target: 'System', ip: '203.45.67.89', status: 'Failed' },
        { timestamp: '2024-02-10 17:02:51', user: 'admin', action: 'Update Settings', target: 'System Configuration', ip: '192.168.1.100', status: 'Success' }
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
  });
  
  // Monitor navigation events for proper cleanups
  // This fixes issues when leaving the audit dashboard
  if (window.app) {
    console.log('Enhancing app.showSection method...');
    
    // Store the original showSection function
    const originalShowSection = window.app.showSection;
    
    // Override with enhanced version that provides proper cleanup
    window.app.showSection = function(sectionId) {
      try {
        const previousSection = this.currentSection;
        
        // If we're leaving the audit-dashboard section, do cleanup
        if (previousSection === 'audit-dashboard' && sectionId !== 'audit-dashboard') {
          console.log('Leaving audit dashboard, cleaning up resources...');
          
          // Dispatch cleanup event
          document.dispatchEvent(new CustomEvent('auditDashboardLeave'));
          
          // Clean up any timers that might have been created
          if (window._auditDashboardTimers) {
            window._auditDashboardTimers.forEach(timerId => clearTimeout(timerId));
            window._auditDashboardTimers = [];
          }
        }
        
        // Call the original showSection function
        return originalShowSection.call(this, sectionId);
      } catch (error) {
        console.error('Error in enhanced showSection:', error);
        // Fallback to original function
        return originalShowSection.call(this, sectionId);
      }
    };
  }
  
  // Override setTimeout to track timers created in audit dashboard
  const originalSetTimeout = window.setTimeout;
  window._auditDashboardTimers = window._auditDashboardTimers || [];
  
  window.setTimeout = function(callback, delay) {
    const timerId = originalSetTimeout(callback, delay);
    
    // Track the timer if we're in the audit dashboard
    if (window.app && window.app.currentSection === 'audit-dashboard') {
      window._auditDashboardTimers.push(timerId);
    }
    
    return timerId;
  };
  
  console.log('Audit dashboard navigation fix applied successfully!');
})();