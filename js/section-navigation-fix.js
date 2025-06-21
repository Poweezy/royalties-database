/**
 * Section Navigation Fix
 * 
 * This script fixes issues with section navigation, particularly after
 * visiting the audit dashboard section.
 */

(function() {
    console.log('Applying section navigation fixes...');
    
    // Store references to key functions
    const originalFunctions = {};
    
    // Wait for app to be initialized
    function applyFixes() {
        if (!window.app) {
            console.warn('App not initialized, waiting...');
            setTimeout(applyFixes, 100);
            return;
        }
        
        console.log('Enhancing section navigation...');
        
        // Fix 1: Enhance showSection method to properly dispatch events
        if (typeof window.app.showSection === 'function') {
            originalFunctions.showSection = window.app.showSection;
            
            window.app.showSection = function(sectionId) {
                // Store previous section for cleanup
                const previousSection = this.currentSection;
                
                // Trigger navigation event before changing sections
                if (previousSection) {
                    console.log(`Navigation: ${previousSection} → ${sectionId}`);
                    document.dispatchEvent(new CustomEvent('sectionChange', {
                        detail: { 
                            previousSection, 
                            newSection: sectionId,
                            app: this
                        }
                    }));
                }
                
                // Call original function
                originalFunctions.showSection.call(this, sectionId);
                
                // Trigger completed event
                document.dispatchEvent(new CustomEvent('sectionShown', {
                    detail: { 
                        currentSection: sectionId, 
                        previousSection 
                    }
                }));
            };
        }
        
        // Fix 2: Enhance loadSectionContent method
        if (typeof window.app.loadSectionContent === 'function') {
            originalFunctions.loadSectionContent = window.app.loadSectionContent;
            
            window.app.loadSectionContent = function(sectionId) {
                // Dispatch event before loading content
                document.dispatchEvent(new CustomEvent('sectionContentLoading', {
                    detail: { sectionId }
                }));
                
                // Special pre-loading handling for audit dashboard
                if (sectionId === 'audit-dashboard') {
                    prepareAuditDashboard();
                }
                
                // Call original function
                originalFunctions.loadSectionContent.call(this, sectionId);
            };
        }
        
        // Fix 3: Add section cleanup handlers
        document.addEventListener('sectionChange', function(e) {
            if (e.detail && e.detail.previousSection) {
                cleanupSection(e.detail.previousSection);
            }
        });
        
        console.log('Section navigation fixes applied successfully!');
    }
    
    // Prepare audit dashboard before loading
    function prepareAuditDashboard() {
        console.log('Preparing audit dashboard for loading...');
        
        // Set up tracking for setTimeout and setInterval
        window._auditDashboardTimers = window._auditDashboardTimers || [];
        window._auditDashboardIntervals = window._auditDashboardIntervals || [];
        
        // Track original functions
        if (!window._originalSetTimeout) {
            window._originalSetTimeout = window.setTimeout;
            window._originalSetInterval = window.setInterval;
            window._originalClearTimeout = window.clearTimeout;
            window._originalClearInterval = window.clearInterval;
            
            // Override setTimeout to track timers
            window.setTimeout = function(callback, delay) {
                const timerId = window._originalSetTimeout(callback, delay);
                window._auditDashboardTimers.push(timerId);
                return timerId;
            };
            
            // Override setInterval to track intervals
            window.setInterval = function(callback, delay) {
                const intervalId = window._originalSetInterval(callback, delay);
                window._auditDashboardIntervals.push(intervalId);
                return intervalId;
            };
        }
    }
    
    // Clean up resources when leaving a section
    function cleanupSection(sectionId) {
        console.log(`Cleaning up resources for section: ${sectionId}`);
        
        // Special handling for audit dashboard
        if (sectionId === 'audit-dashboard') {
            cleanupAuditDashboard();
        }
    }
    
    // Clean up audit dashboard resources
    function cleanupAuditDashboard() {
        console.log('Cleaning up audit dashboard resources...');
        
        // Clear timers
        if (window._auditDashboardTimers && window._auditDashboardTimers.length > 0) {
            window._auditDashboardTimers.forEach(timerId => {
                window._originalClearTimeout(timerId);
            });
            window._auditDashboardTimers = [];
            console.log('Cleared audit dashboard timers');
        }
        
        // Clear intervals
        if (window._auditDashboardIntervals && window._auditDashboardIntervals.length > 0) {
            window._auditDashboardIntervals.forEach(intervalId => {
                window._originalClearInterval(intervalId);
            });
            window._auditDashboardIntervals = [];
            console.log('Cleared audit dashboard intervals');
        }
        
        // Restore original timer functions
        if (window._originalSetTimeout) {
            window.setTimeout = window._originalSetTimeout;
            window.setInterval = window._originalSetInterval;
            window.clearTimeout = window._originalClearTimeout;
            window.clearInterval = window._originalClearInterval;
            console.log('Restored original timer functions');
        }
    }
    
    // Apply fixes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFixes);
    } else {
        applyFixes();
    }
})();