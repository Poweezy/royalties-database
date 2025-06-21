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

          // Clean up any resources
          if (window.cleanupAuditDashboardResources) {
            window.cleanupAuditDashboardResources();
          }
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
      }
    });
  }

  function fixAuditDashboard() {
    // Apply specific fixes to the audit dashboard component after it's loaded
    
    // Find the problematic script that contains location.reload()
    const scripts = document.querySelectorAll('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const scriptText = script.textContent;
      
      if (scriptText && scriptText.includes('location.reload()')) {
        console.log('Found script with location.reload(), fixing...');
        
        // Create a new script with fixed code
        const fixedScript = scriptText.replace(
          'location.reload()',
          'window.loadAuditEventsData ? window.loadAuditEventsData() : console.log("loadAuditEventsData not available")'
        );
        
        const newScript = document.createElement('script');
        newScript.textContent = fixedScript;
        
        // Replace the old script with the fixed one
        script.parentNode.replaceChild(newScript, script);
      }
    }
  }
})();