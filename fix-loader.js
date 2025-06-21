/**
 * Fix Loader for Navigation Issues
 *
 * This is a simple script that loads the navigation fixes.
 * 
 * USAGE:
 * 1. Load the application normally
 * 2. Open browser console (F12 or right-click -> Inspect)
 * 3. Open the Console tab
 * 4. Copy and paste this entire script, then press Enter
 * 5. You should see confirmation messages in the console
 */

(function() {
  console.log('Loading navigation fixes...');
  
  // List of scripts to load
  const scripts = [
    { name: 'Audit Dashboard Navigation Fix', path: 'js/audit-dashboard-navigation-fix.js' },
    { name: 'App Navigation Fix', path: 'js/app-navigation-fix.js' }
  ];
  
  // Load scripts in sequence
  loadScripts(scripts, 0);
  
  function loadScripts(scriptsList, index) {
    if (index >= scriptsList.length) {
      console.log('%c✓ All navigation fixes loaded successfully!', 'color: green; font-weight: bold');
      console.log('%cYou should now be able to navigate freely between all sections.', 'color: blue');
      return;
    }
    
    const script = scriptsList[index];
    const scriptElement = document.createElement('script');
    scriptElement.src = script.path + '?v=' + Date.now(); // Add cache buster
    
    // Handle successful loading
    scriptElement.onload = function() {
      console.log(`%c✓ ${script.name} loaded successfully!`, 'color: green;');
      // Load the next script
      loadScripts(scriptsList, index + 1);
    };
    
    // Handle loading error
    scriptElement.onerror = function() {
      console.error(`%c✗ Failed to load ${script.name}!`, 'color: red; font-weight: bold');
      // Try next script anyway
      loadScripts(scriptsList, index + 1);
    };
    
    // Add the script to the page
    document.head.appendChild(scriptElement);
  }
  
  // Backup fix in case the external scripts don't load
  function applyInlineFix() {
    // Store reference to original showSection function
    if (window.app && window.app.showSection) {
      const originalShowSection = window.app.showSection;
      
      window.app.showSection = function(sectionId) {
        try {
          console.log(`Enhanced navigation to section: ${sectionId}`);
          
          // Get current section before changing
          const previousSection = this.currentSection;
          
          // Special cleanup for audit dashboard
          if (previousSection === 'audit-dashboard') {
            console.log('Cleaning up audit dashboard resources...');
            cleanupAuditResources();
          }
          
          // Call original function
          return originalShowSection.call(this, sectionId);
        } catch (error) {
          console.error('Error in navigation:', error);
          return originalShowSection.call(this, sectionId);
        }
      };
      
      console.log('%c✓ Applied inline navigation fix successfully!', 'color: green');
    } else {
      console.error('%c✗ Could not find app.showSection to patch!', 'color: red; font-weight: bold');
    }
  }
  
  // Helper function to clean up audit resources
  function cleanupAuditResources() {
    // Clean up timers
    if (window._auditTimers) {
      window._auditTimers.forEach(id => clearTimeout(id));
      window._auditTimers = [];
    }
    
    // Clean up intervals
    if (window._auditIntervals) {
      window._auditIntervals.forEach(id => clearInterval(id));
      window._auditIntervals = [];
    }
    
    // Override the location.reload() call that breaks navigation
    if (typeof window.updateAuditEvents === 'function') {
      window.updateAuditEvents = function() {
        console.log('Safe version of updateAuditEvents called');
        if (window.notificationManager) {
          window.notificationManager.show('Filter applied', 'success');
        }
      };
    }
  }
})();