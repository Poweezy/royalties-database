/**
 * Module Loader Fix
 * 
 * Enhances the module loader to properly handle cleaning up sections
 * when navigating away, especially the audit dashboard section.
 */

(function() {
    // Wait for module loader to initialize
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.moduleLoader) {
            console.error('Module loader not initialized, cannot apply fix');
            return;
        }
        
        console.log('Applying module loader fix...');
        
        // Store original loadComponent function
        const originalLoadComponent = window.moduleLoader.loadComponent;
        
        // Enhance loadComponent with cleanup functionality
        window.moduleLoader.loadComponent = function(componentId, targetElement) {
            console.log(`Enhanced module loader: loading component ${componentId}`);
            
            // Register cleanup function when section changes
            document.addEventListener('sectionChange', function onSectionChange(e) {
                if (e.detail && e.detail.previousSection === componentId) {
                    console.log(`Module loader: cleaning up component ${componentId}`);
                    
                    // Clean up event listeners registered by this component
                    if (window.getResourceTracker) {
                        const tracker = window.getResourceTracker(componentId);
                        if (tracker) {
                            tracker.cleanup();
                        }
                    }
                    
                    // Remove this specific listener since it's only needed once
                    document.removeEventListener('sectionChange', onSectionChange);
                }
            });
            
            // Call original function
            return originalLoadComponent.call(this, componentId, targetElement);
        };
        
        // Enhance the postLoadAction to handle special components
        const originalPostLoadAction = window.moduleLoader.postLoadAction;
        if (originalPostLoadAction) {
            window.moduleLoader.postLoadAction = function(componentId, element) {
                // Special case for audit-dashboard
                if (componentId === 'audit-dashboard') {
                    console.log('Special post-load handling for audit dashboard');
                    
                    // Ensure we have a resource tracker for this component
                    if (window.getResourceTracker) {
                        const tracker = window.getResourceTracker('audit-dashboard');
                        
                        // Make a backup of any global functions the dashboard might need
                        // to prevent them from being lost when navigating away
                        if (!window._auditDashboardFunctions) {
                            window._auditDashboardFunctions = {
                                viewAuditDetails: window.viewAuditDetails,
                                investigateFailedLogin: window.investigateFailedLogin,
                                blockIpAddress: window.blockIpAddress,
                                investigateIp: window.investigateIp,
                                contactUser: window.contactUser,
                                reviewUserActivity: window.reviewUserActivity,
                                reviewExport: window.reviewExport,
                                acknowledgeAllAlerts: window.acknowledgeAllAlerts,
                                runSecurityScan: window.runSecurityScan,
                                refreshAuditEvents: window.refreshAuditEvents,
                                exportAuditData: window.exportAuditData
                            };
                        } else {
                            // Restore functions if they were previously saved
                            Object.entries(window._auditDashboardFunctions).forEach(([name, fn]) => {
                                if (typeof fn === 'function') window[name] = fn;
                            });
                        }
                    }
                }
                
                // Call original function if it exists
                if (originalPostLoadAction) {
                    return originalPostLoadAction.call(this, componentId, element);
                }
            };
        }
        
        console.log('Module loader fix applied successfully');
    });
})();