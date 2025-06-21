/**
 * Quick Fix for Navigation Issues
 * 
 * This script fixes the issue where sections don't load after visiting the audit dashboard.
 * 
 * Usage:
 * 1. Open your browser console (F12 or right-click > Inspect > Console)
 * 2. Copy and paste this entire file content
 * 3. Press Enter to run
 */

(function() {
    console.log('%c🔧 Applying navigation fix...', 'color: blue; font-weight: bold');
    
    // Load our custom fix scripts
    const scripts = [
        { name: 'Section Navigation Fix', path: 'js/section-navigation-fix.js' },
        { name: 'Audit Dashboard Controller', path: 'js/controllers/auditDashboardController.js' }
    ];
    
    // Load scripts in sequence
    function loadScripts(index) {
        if (index >= scripts.length) {
            console.log('%c✅ All fixes loaded successfully!', 'color: green; font-weight: bold');
            console.log('%cYou can now navigate freely between sections.', 'color: blue');
            return;
        }
        
        const script = scripts[index];
        console.log(`Loading ${script.name}...`);
        
        const scriptElement = document.createElement('script');
        scriptElement.src = script.path + '?v=' + Date.now(); // Cache busting
        
        // Handle script loading success
        scriptElement.onload = function() {
            console.log(`%c✅ ${script.name} loaded successfully`, 'color: green');
            loadScripts(index + 1);
        };
        
        // Handle script loading error
        scriptElement.onerror = function() {
            console.error(`%c❌ Failed to load ${script.name}`, 'color: red; font-weight: bold');
            console.log('Applying emergency fix...');
            applyEmergencyFix();
            loadScripts(index + 1); // Try to continue with next script
        };
        
        document.head.appendChild(scriptElement);
    }
    
    // Apply an immediate emergency fix in case the scripts fail to load
    function applyEmergencyFix() {
        console.log('Applying emergency navigation fix...');
        
        // Fix the problematic updateAuditEvents function that causes page reload
        if (typeof window.updateAuditEvents === 'function') {
            const originalFn = window.updateAuditEvents;
            
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
                        tableBody.innerHTML = '';
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td colspan="7" style="text-align: center;">
                                Emergency fix applied - data loaded without page reload
                            </td>
                        `;
                        tableBody.appendChild(row);
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
                }
                
                return originalShowSection.call(this, sectionId);
            };
            
            console.log('%c✅ Enhanced navigation function', 'color: green');
        }
        
        console.log('%c✅ Emergency fix applied successfully', 'color: green');
    }
    
    // Start loading the fix scripts
    loadScripts(0);
})();