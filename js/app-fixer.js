/**
 * App Fixer
 * 
 * This script enhances the app.js functionality to fix navigation issues,
 * especially with the audit dashboard section.
 */

(function() {
    console.log('Applying app.js fixes...');
    
    // Wait for app to be initialized
    window.addEventListener('load', function() {
        // Give the app a moment to initialize
        setTimeout(applyFixes, 500);
    });
    
    function applyFixes() {
        if (!window.app) {
            console.error('App not initialized, cannot apply fixes');
            return;
        }
        
        console.log('Enhancing showSection method...');
        
        // Store original showSection function
        const originalShowSection = window.app.showSection;
        
        // Override showSection with enhanced version
        window.app.showSection = function(sectionId) {
            try {
                console.log(`Enhanced navigation to section: ${sectionId}`);
                
                // Store previous section for cleanup
                const previousSection = this.currentSection;
                
                // Trigger pre-navigation cleanup for the previous section
                if (previousSection) {
                    console.log(`Leaving section: ${previousSection}, navigating to: ${sectionId}`);
                    document.dispatchEvent(new CustomEvent('sectionLeaving', {
                        detail: { previousSection, newSection: sectionId }
                    }));
                    
                    // Special handling for audit dashboard section
                    if (previousSection === 'audit-dashboard') {
                        cleanupAuditDashboard();
                    }
                }
                
                // Call original showSection function
                originalShowSection.call(this, sectionId);
                
                // Trigger post-navigation event
                document.dispatchEvent(new CustomEvent('sectionChanged', {
                    detail: { currentSection: sectionId, previousSection }
                }));
            } catch (error) {
                console.error('Error in enhanced showSection:', error);
                // Fall back to original function
                originalShowSection.call(this, sectionId);
            }
        };
        
        console.log('Enhancing loadSectionContent method...');
        
        // Store original loadSectionContent function
        const originalLoadSectionContent = window.app.loadSectionContent;
        
        // Override loadSectionContent with enhanced version
        window.app.loadSectionContent = function(sectionId) {
            try {
                console.log(`Enhanced loading of section content: ${sectionId}`);
                
                // Special handling for audit dashboard
                if (sectionId === 'audit-dashboard') {
                    console.log('Special handling for audit dashboard section');
                    // Set up post-load handling
                    document.addEventListener('DOMContentLoaded', function onLoad() {
                        initializeAuditDashboard();
                        // Remove this listener once it's fired
                        document.removeEventListener('DOMContentLoaded', onLoad);
                    });
                }
                
                // Call original function
                originalLoadSectionContent.call(this, sectionId);
                
            } catch (error) {
                console.error('Error in enhanced loadSectionContent:', error);
                // Fall back to original function
                originalLoadSectionContent.call(this, sectionId);
            }
        };
        
        // Add cleanup for audit dashboard resources
        function cleanupAuditDashboard() {
            console.log('Cleaning up audit dashboard resources...');
            
            // Clean up timers
            if (window._auditDashboardTimers) {
                window._auditDashboardTimers.forEach(timerId => {
                    clearTimeout(timerId);
                });
                window._auditDashboardTimers = [];
            }
            
            // Clean up any global event listeners added by audit dashboard
            try {
                // Reset any problematic audit dashboard functions to no-ops
                // This prevents errors when they're called after navigation
                ['viewAuditDetails', 'investigateFailedLogin', 'blockIpAddress', 
                 'investigateIp', 'contactUser', 'reviewUserActivity', 
                 'reviewExport', 'acknowledgeAllAlerts', 'runSecurityScan', 
                 'refreshAuditEvents', 'exportAuditData'].forEach(fnName => {
                    if (window[fnName]) {
                        window[fnName] = function() {
                            console.warn(`${fnName} called after leaving audit dashboard`);
                        };
                    }
                });
            } catch (e) {
                console.error('Error cleaning up audit dashboard functions:', e);
            }
        }
        
        // Initialize audit dashboard properly
        function initializeAuditDashboard() {
            console.log('Initializing audit dashboard...');
            
            // Initialize tracked timers array if not already present
            window._auditDashboardTimers = window._auditDashboardTimers || [];
            
            // Override setTimeout for the audit dashboard to track timers
            const originalSetTimeout = window.setTimeout;
            window.setTimeout = function(callback, delay) {
                const timerId = originalSetTimeout(callback, delay);
                window._auditDashboardTimers.push(timerId);
                return timerId;
            };
        }
        
        console.log('App.js fixes applied successfully');
    }
})();