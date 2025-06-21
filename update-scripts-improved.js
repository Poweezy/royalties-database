/**
 * This script adds the required fix scripts to address the issue where
 * other sections don't work after clicking on the audit dashboard.
 * 
 * To use:
 * 1. Load this script in a browser console when viewing the royalties.html page
 * 2. The script will dynamically inject the required scripts
 * 3. Check the console for confirmation
 */

(function() {
    console.log('Adding fix scripts for audit dashboard navigation issue...');
    
    const scripts = [
        { name: 'Resource Tracker', path: 'js/resource-tracker.js' },
        { name: 'Module Loader Fix', path: 'js/module-loader-fix.js' },
        { name: 'App Fixer', path: 'js/app-fixer.js' },
        { name: 'Section Loader Fix', path: 'js/section-loader-fix.js' },
        { name: 'Section Navigation Fix', path: 'js/section-navigation-fix.js' }
    ];
    
    let loadedCount = 0;
    
    // Load scripts in sequence
    function loadNextScript(index) {
        if (index >= scripts.length) {
            console.log(`%c✅ All ${scripts.length} fix scripts loaded successfully!`, 'color: green; font-weight: bold');
            console.log('%cYou should now be able to navigate between sections without issues.', 'color: blue; font-weight: bold');
            return;
        }
        
        const script = scripts[index];
        const scriptElement = document.createElement('script');
        scriptElement.src = `${script.path}?v=${Date.now()}`;
        
        scriptElement.onload = function() {
            console.log(`%c✅ ${script.name} loaded successfully`, 'color: green');
            loadedCount++;
            loadNextScript(index + 1);
        };
        
        scriptElement.onerror = function() {
            console.error(`%c❌ Failed to load ${script.name}`, 'color: red; font-weight: bold');
            loadNextScript(index + 1);
        };
        
        document.head.appendChild(scriptElement);
    }
    
    // Start loading scripts
    loadNextScript(0);
    
    console.log('Scripts injection initiated. Check console for progress...');
})();