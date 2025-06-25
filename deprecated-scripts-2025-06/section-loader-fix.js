/**
 * Section Loader Fix
 * 
 * Enhances the section loading functionality in app.js to properly handle
 * the loading and unloading of sections, especially the audit dashboard.
 */

(function() {
    console.log('Applying section loader fixes...');
    
    // Wait for app to be initialized
    window.addEventListener('load', function() {
        // Give the app a moment to initialize
        setTimeout(applyFixes, 500);
    });
    
    function applyFixes() {
        if (!window.app) {
            console.error('App not initialized, cannot apply section loader fixes');
            return;
        }
        
        console.log('Enhancing loadSectionContent method...');
        
        // Store original loadSectionContent function
        const originalLoadSectionContent = window.app.loadSectionContent;
        
        // Override with enhanced version
        window.app.loadSectionContent = function(sectionId) {
            try {
                console.log(`Enhanced section content loading for: ${sectionId}`);
                
                // Get the section element
                const section = document.getElementById(sectionId);
                if (!section) {
                    console.error(`Section element not found: ${sectionId}`);
                    return;
                }
                
                // Show loading indicator
                section.innerHTML = '<div class="loading-indicator"><span class="spinner"></span><p>Loading...</p></div>';
                
                // Try to load the section content from components directory
                fetch(`components/${sectionId}.html?v=${new Date().getTime()}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load ${sectionId} component`);
                        }
                        return response.text();
                    })
                    .then(html => {
                        // Replace the section content
                        section.innerHTML = html;
                        console.log(`Content loaded for section: ${sectionId}`);
                        
                        // Mark as loaded
                        section.setAttribute('data-loaded', 'true');
                        
                        // Special handling for audit dashboard
                        if (sectionId === 'audit-dashboard') {
                            handleAuditDashboardLoad();
                        }
                        
                        // Trigger section loaded event
                        document.dispatchEvent(new CustomEvent('sectionContentLoaded', {
                            detail: { sectionId }
                        }));
                    })
                    .catch(error => {
                        console.error(`Error loading section content: ${error}`);
                        section.innerHTML = `<div class="error-message">
                            <h3>Error Loading Content</h3>
                            <p>Could not load the ${sectionId.replace('-', ' ')} section.</p>
                            <button class="btn btn-primary retry-btn" onclick="window.app.loadSectionContent('${sectionId}')">Retry</button>
                        </div>`;
                    });
                
            } catch (error) {
                console.error('Error in enhanced loadSectionContent:', error);
                // Fall back to original function
                if (originalLoadSectionContent) {
                    originalLoadSectionContent.call(this, sectionId);
                }
            }
        };
        
        // Special handling for audit dashboard loading
        function handleAuditDashboardLoad() {
            console.log('Special handling for audit dashboard load...');
            
            // Initialize tracked timers array
            window._auditDashboardTimers = [];
            
            // Override setTimeout specifically for audit dashboard to track timers
            const originalSetTimeout = window.setTimeout;
            window.setTimeout = function(callback, delay) {
                const timerId = originalSetTimeout(callback, delay);
                // Track the timer ID
                if (window.app && window.app.currentSection === 'audit-dashboard') {
                    window._auditDashboardTimers.push(timerId);
                }
                return timerId;
            };
            
            // Override setInterval for audit dashboard
            const originalSetInterval = window.setInterval;
            window.setInterval = function(callback, delay) {
                const intervalId = originalSetInterval(callback, delay);
                // Track the interval ID
                if (window.app && window.app.currentSection === 'audit-dashboard') {
                    window._auditDashboardIntervals = window._auditDashboardIntervals || [];
                    window._auditDashboardIntervals.push(intervalId);
                }
                return intervalId;
            };
            
            // Restore original functions when leaving the audit dashboard
            document.addEventListener('sectionLeaving', function onLeave(e) {
                if (e.detail && e.detail.previousSection === 'audit-dashboard') {
                    // Clean up timers
                    if (window._auditDashboardTimers) {
                        window._auditDashboardTimers.forEach(timerId => clearTimeout(timerId));
                        window._auditDashboardTimers = [];
                    }
                    
                    // Clean up intervals
                    if (window._auditDashboardIntervals) {
                        window._auditDashboardIntervals.forEach(intervalId => clearInterval(intervalId));
                        window._auditDashboardIntervals = [];
                    }
                    
                    // Restore original timer functions
                    window.setTimeout = originalSetTimeout;
                    window.setInterval = originalSetInterval;
                    
                    // Remove this event listener since it's only needed once
                    document.removeEventListener('sectionLeaving', onLeave);
                }
            });
            
            // Create a new DOMContentLoaded event for scripts in the dashboard
            setTimeout(() => {
                console.log('Triggering DOMContentLoaded for audit dashboard scripts');
                document.dispatchEvent(new Event('DOMContentLoaded', {
                    bubbles: true,
                    cancelable: true
                }));
            }, 100);
        }
        
        console.log('Section loader fixes applied successfully');
    }
})();