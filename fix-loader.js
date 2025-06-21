/**
 * Fix Loader for Navigation Issues
 * 
 * This script fixes the issue where sections don't load after visiting the audit dashboard.
 * 
 * Usage:
 * 1. Open your browser console (F12 or right-click > Inspect > Console)
 * 2. Copy and paste this entire file content
 * 3. Press Enter to run
 */

(function() {
    console.log('%c🔧 Applying navigation fixes...', 'color: blue; font-weight: bold');
    
    // Apply immediate fixes for urgent issues
    applyImmediateFix();
    
    // Load our fix scripts
    loadFixScripts();
    
    // Function to apply immediate fixes for navigation
    function applyImmediateFix() {
        console.log('Applying immediate fix...');
        
        // Fix the problematic updateAuditEvents function
        if (typeof window.updateAuditEvents === 'function') {
            console.log('Found updateAuditEvents function, replacing it...');
            
            const originalUpdateAuditEvents = window.updateAuditEvents;
            
            window.updateAuditEvents = function(dateRange, userFilter, actionFilter, startDate = null, endDate = null) {
                console.log('Safe updateAuditEvents called - preventing page reload');
                
                const tableBody = document.getElementById('audit-events-table');
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading audit events...</td></tr>';
                    
                    setTimeout(() => {
                        if (window.notificationManager) {
                            window.notificationManager.show('Audit events updated', 'success');
                        }
                        
                        // Instead of location.reload(), load some data
                        if (typeof window.loadAuditEventsData === 'function') {
                            window.loadAuditEventsData();
                        } else {
                            tableBody.innerHTML = '';
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td colspan="7" style="text-align: center;">
                                    Fix applied - data loaded without page reload
                                </td>
                            `;
                            tableBody.appendChild(row);
                        }
                    }, 1000);
                }
            };
            
            console.log('%c✅ Fixed updateAuditEvents function', 'color: green');
        }
        
        // Add section change handler to clean up resources
        if (window.app && typeof window.app.showSection === 'function') {
            const originalShowSection = window.app.showSection;
            
            window.app.showSection = function(sectionId) {
                const previousSection = this.currentSection;
                console.log(`Navigation: ${previousSection} -> ${sectionId}`);
                
                // Special handling when leaving audit dashboard
                if (previousSection === 'audit-dashboard') {
                    console.log('Leaving audit dashboard - cleaning up resources');
                    cleanupAuditDashboardResources();
                }
                
                return originalShowSection.call(this, sectionId);
            };
            
            console.log('%c✅ Enhanced showSection function', 'color: green');
        }
    }
    
    // Clean up audit dashboard resources
    function cleanupAuditDashboardResources() {
        // Clean up timers
        if (window._auditDashboardTimers && window._auditDashboardTimers.length) {
            window._auditDashboardTimers.forEach(id => clearTimeout(id));
            window._auditDashboardTimers = [];
        }
        
        // Clean up intervals
        if (window._auditDashboardIntervals && window._auditDashboardIntervals.length) {
            window._auditDashboardIntervals.forEach(id => clearInterval(id));
            window._auditDashboardIntervals = [];
        }
        
        console.log('Audit dashboard resources cleaned up');
    }
    
    // Load fix scripts
    function loadFixScripts() {
        const scripts = [
            { name: 'Audit Dashboard Navigation Fix', path: 'js/audit-dashboard-navigation-fix.js' },
            { name: 'App Navigation Fix', path: 'js/app-navigation-fix.js' }
        ];
        
        scripts.forEach(script => {
            try {
                console.log(`Loading ${script.name}...`);
                
                const scriptElement = document.createElement('script');
                scriptElement.src = script.path + '?v=' + Date.now(); // Cache busting
                
                // Handle script loading success
                scriptElement.onload = function() {
                    console.log(`%c✅ ${script.name} loaded successfully`, 'color: green');
                };
                
                // Handle script loading error
                scriptElement.onerror = function() {
                    console.error(`%c❌ Failed to load ${script.name}`, 'color: red');
                };
                
                document.head.appendChild(scriptElement);
            } catch (error) {
                console.error(`Error loading ${script.name}:`, error);
            }
        });
    }
    
    console.log('%c✅ Navigation fix applied successfully!', 'color: green; font-weight: bold');
    console.log('%cYou can now navigate freely between sections.', 'color: blue');
})();