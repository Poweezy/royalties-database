/**
 * Section Navigation Fix
 * 
 * This script fixes issues with navigation between sections,
 * particularly focusing on the audit dashboard section cleanup.
 */

(function() {
    // Wait for app to be initialized
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.app) {
            console.error('App not initialized, cannot apply section navigation fix');
            return;
        }
        
        console.log('Applying section navigation fix...');
        
        // Store original showSection function for reference
        const originalShowSection = window.app.showSection;
        
        // Override showSection with improved version that handles cleanup
        window.app.showSection = function(sectionId) {
            try {
                console.log(`Enhanced navigation to section: ${sectionId}`);
                
                // Store the previous section before changing
                const previousSection = this.currentSection;
                
                // Trigger cleanup of previous section before showing the new one
                if (previousSection) {
                    console.log(`Leaving section: ${previousSection}`);
                    document.dispatchEvent(new CustomEvent('sectionChange', { 
                        detail: { 
                            sectionId: sectionId,
                            previousSection: previousSection
                        }
                    }));
                    
                    // Special handling for audit dashboard
                    if (previousSection === 'audit-dashboard') {
                        console.log('Cleaning up audit dashboard resources...');
                        // Remove any outstanding timers
                        if (window._auditDashboardTimers) {
                            window._auditDashboardTimers.forEach(timerId => clearTimeout(timerId));
                            window._auditDashboardTimers = [];
                        }
                    }
                }
                
                // Call original function
                originalShowSection.call(this, sectionId);
                
                // Special case for audit dashboard section
                if (sectionId === 'audit-dashboard') {
                    // Initialize tracked timers array
                    window._auditDashboardTimers = window._auditDashboardTimers || [];
                }
                
            } catch (error) {
                console.error(`Error in enhanced showSection for ${sectionId}:`, error);
                // Fall back to original function
                originalShowSection.call(this, sectionId);
            }
        };
        
        // Add a special handler for cleanup when page unloads
        window.addEventListener('beforeunload', function() {
            // Clean up any tracked resources
            if (window._auditDashboardTimers) {
                window._auditDashboardTimers.forEach(timerId => clearTimeout(timerId));
                window._auditDashboardTimers = [];
            }
        });
        
        console.log('Section navigation fix applied successfully');
    });
})();