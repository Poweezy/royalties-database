/**
 * Navigation Fix Loader
 * 
 * This script loads all necessary fixes to resolve navigation issues,
 * particularly after visiting the audit dashboard section.
 * 
 * To use:
 * 1. Add this script tag to your HTML: 
 *    <script src="js/navigation-fix-loader.js"></script>
 * 2. Or paste this code into the browser console
 */

(function() {
    console.log('Navigation Fix Loader - Starting...');
    
    // List of fix scripts to load
    const fixScripts = [
        { name: 'Section Navigation Fix', path: 'js/section-navigation-fix.js' },
        { name: 'Audit Dashboard Controller', path: 'js/controllers/auditDashboardController.js' },
        { name: 'Diagnostics', path: 'js/diagnostics.js' }
    ];
    
    // Load scripts in sequence
    function loadScripts(index) {
        if (index >= fixScripts.length) {
            console.log('%c✅ All navigation fixes loaded successfully!', 'color: green; font-weight: bold');
            return;
        }
        
        const script = fixScripts[index];
        console.log(`Loading: ${script.name}`);
        
        const scriptElement = document.createElement('script');
        scriptElement.src = script.path + '?v=' + Date.now(); // Add cache buster
        
        scriptElement.onload = function() {
            console.log(`%c✅ Loaded: ${script.name}`, 'color: green');
            loadScripts(index + 1);
        };
        
        scriptElement.onerror = function() {
            console.error(`%c❌ Failed to load: ${script.name}`, 'color: red');
            loadScripts(index + 1);
        };
        
        document.head.appendChild(scriptElement);
    }
    
    // Start loading scripts
    loadScripts(0);
    
    // Apply immediate fix for audit dashboard
    const fixAuditDashboard = function() {
        // Find the audit dashboard section
        const auditDashboard = document.getElementById('audit-dashboard');
        if (!auditDashboard) return;
        
        // Find scripts in the audit dashboard
        const scripts = auditDashboard.querySelectorAll('script');
        scripts.forEach(function(script) {
            const scriptText = script.textContent;
            if (scriptText && scriptText.includes('location.reload()')) {
                // Replace the script with a fixed version
                const fixedScript = scriptText.replace(
                    'location.reload()',
                    'loadAuditEventsData("current")'
                );
                
                const newScript = document.createElement('script');
                newScript.textContent = fixedScript;
                script.parentNode.replaceChild(newScript, script);
                
                console.log('%c✅ Fixed location.reload() call in audit dashboard', 'color: green');
            }
        });
        
        console.log('Audit dashboard fix applied');
    };
    
    // Apply immediate fixes
    fixAuditDashboard();
})();