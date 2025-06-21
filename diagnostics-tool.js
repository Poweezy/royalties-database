/**
 * Royalties Database Diagnostics Tool
 * 
 * This script runs comprehensive diagnostics on the application to check
 * for potential issues with script loading, section initialization,
 * and navigation.
 * 
 * Version: 1.0.0 (2025-06-22)
 */

(function() {
    console.log('Running comprehensive diagnostics...');
    
    // Wait for page to be fully loaded
    if (document.readyState !== 'complete') {
        window.addEventListener('load', runDiagnostics);
    } else {
        runDiagnostics();
    }
    
    function runDiagnostics() {
        console.log('==================================');
        console.log('ROYALTIES DATABASE DIAGNOSTICS');
        console.log('==================================');
        
        // Check for critical objects
        const criticalObjects = [
            'app', 'moduleLoader', 'SimpleChartManager', 'ChartManager', 'AuditDashboardController'
        ];
        
        console.log('\n1. CRITICAL OBJECTS CHECK:');
        criticalObjects.forEach(obj => {
            console.log(`${obj}: ${typeof window[obj] !== 'undefined' ? '✅ Available' : '❌ Missing'}`);
        });
        
        // Check for initialization functions
        console.log('\n2. INITIALIZATION FUNCTIONS CHECK:');
        const initFunctions = [
            'initializeSectionComponent', 
            'initializeSectionContent', 
            'loadSectionContent'
        ];
        
        if (window.app) {
            initFunctions.forEach(func => {
                console.log(`app.${func}: ${typeof window.app[func] === 'function' ? '✅ Available' : '❌ Missing'}`);
            });
        } else {
            console.log('Cannot check initialization functions - app object not available');
        }
        
        // Check all sections
        console.log('\n3. SECTIONS STATUS CHECK:');
        const sections = document.querySelectorAll('main section');
        
        sections.forEach(section => {
            const id = section.id;
            const isVisible = window.getComputedStyle(section).display !== 'none';
            const isEmpty = section.children.length === 0 || section.innerHTML.trim() === '';
            console.log(`Section "${id}": ${isVisible ? '👁️ Visible' : '🔒 Hidden'}, ${isEmpty ? '❌ Empty' : '✅ Has content'}`);
        });
        
        // Check for script loading issues
        console.log('\n4. SCRIPT LOADING CHECK:');
        const expectedScripts = [
            'module-loader.js', 'app.js', 'main.js', 'chart-manager.js',
            'section-navigation-fix.js', 'fix.js', 'fix-blank-sections.js'
        ];
        
        const loadedScripts = Array.from(document.querySelectorAll('script'))
            .map(script => script.src)
            .filter(src => src)
            .map(src => {
                const url = new URL(src);
                return url.pathname.split('/').pop().split('?')[0];
            });
            
        expectedScripts.forEach(script => {
            const isLoaded = loadedScripts.some(s => s.includes(script));
            console.log(`${script}: ${isLoaded ? '✅ Loaded' : '❌ Missing'}`);
        });
        
        // Check for duplicate script declarations
        console.log('\n5. DUPLICATE DECLARATIONS CHECK:');
        const multipleDeclarations = [];
        
        // Count script occurrences
        const scriptCounts = {};
        loadedScripts.forEach(script => {
            scriptCounts[script] = (scriptCounts[script] || 0) + 1;
            if (scriptCounts[script] > 1) {
                multipleDeclarations.push(script);
            }
        });
        
        if (multipleDeclarations.length > 0) {
            console.log('⚠️ Found scripts with multiple declarations:');
            multipleDeclarations.forEach(script => {
                console.log(`- ${script} (${scriptCounts[script]} occurrences)`);
            });
        } else {
            console.log('✅ No duplicate script declarations found');
        }
        
        // Check error handlers
        console.log('\n6. ERROR HANDLING CHECK:');
        
        if (typeof window.onerror === 'function') {
            console.log('✅ Global error handler is defined');
        } else {
            console.log('⚠️ No global error handler found');
        }
        
        if (typeof window.app && typeof window.app.handleError === 'function') {
            console.log('✅ App error handler is defined');
        } else {
            console.log('⚠️ No app error handler found');
        }
        
        // Final assessment
        console.log('\n7. RECOMMENDATION:');
        if (multipleDeclarations.length > 0 || criticalObjects.some(obj => typeof window[obj] === 'undefined')) {
            console.log('⚠️ Found potential issues that may be causing navigation problems');
            console.log('    Recommendation: Refresh the page and ensure script-loader-guard.js loads first');
        } else {
            console.log('✅ Core application structure appears healthy');
            console.log('    To fix any remaining issues with blank sections after navigation:');
            console.log('    1. Use updated fix-blank-sections.js');
            console.log('    2. Ensure section-navigation-fix.js loads correctly');
        }
        
        console.log('\n==================================');
        console.log('END OF DIAGNOSTICS');
        console.log('==================================');
    }
})();
