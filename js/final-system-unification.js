/**
 * Final System Unification
 * @version 1.0.0
 * @date 2025-07-01
 * @description Complete unification of chart and notification systems for Mining Royalties Manager
 * 
 * This script finalizes the consolidation of all redundant systems:
 * 1. Completely removes ALL redundant chart initialization systems
 * 2. Ensures only unified-chart-solution.js is used for charts
 * 3. Ensures only enhanced-notification-system.js is used for notifications
 * 4. Redirects all legacy method calls to the unified systems
 * 5. Cleans up any lingering references to deprecated components
 */

(function() {
    'use strict';
    
    console.log('=== FINAL SYSTEM UNIFICATION: INITIALIZING ===');
    
    // Configuration
    const CONFIG = {
        // Consolidated list of ALL redundant chart scripts
        redundantChartScripts: [
            'dashboard-charts-init.js',
            'chart-initialization-helper.js',
            'dashboard-chart-initializer.js',
            'chart-method-guarantee.js',
            'dashboard-canvas-creator.js',
            'chart-cache-cleanup.js',
            'dashboard-canvas-fix.js',
            'dashboard-chart-canvas-creator.js',
            'chart-canvas-creator.js',
            'chart-alias-fixer.js',
            'chart-emergency-fix.js',
            'dashboard-charts-trigger.js',
            'chart-method-verification.js',
            'production-chart-fix.js',
            'production-chart-complete-fix.js',
            'chart-fix.js',
            'chart-unified-fix.js',
            'chart-diagnostic.js',
            'chart-tester.js',
            'dashboard-chart-navigation.js'
        ],
        
        // Consolidated list of ALL redundant notification scripts
        redundantNotificationScripts: [
            'notification-manager.js',
            'toast-manager.js',
            'notifications.js',
            'alert-manager.js',
            'system-notifications.js',
            'notification-helper.js',
            'toast-notifications.js'
        ],
        
        // Core systems that should NOT be disabled
        coreSystems: [
            'unified-chart-solution.js',
            'enhanced-notification-system.js',
            'magical-chart-solution.js',
            'ultimate-chart-solution.js'
        ],
        
        // Methods that need to be redirected from legacy to unified systems
        methodRedirects: {
            // Chart method redirects
            'chartManager': {
                target: 'window.chartManager',
                methods: [
                    'createChart', 'createRevenueChart', 'createEntityChart',
                    'createProductionChart', 'createStatusChart', 'destroyChart',
                    'updateChart', 'refreshAllCharts'
                ]
            },
            
            // Notification method redirects
            'NotificationManager': {
                target: 'window.notificationSystem',
                methods: [
                    'show', 'showSuccess', 'showError', 'showWarning', 'showInfo',
                    'hide', 'hideAll', 'clearAll'
                ]
            },
            
            'ToastManager': {
                target: 'window.notificationSystem',
                methods: [
                    'show', 'showToast', 'success', 'error', 'warning', 'info', 'dismiss'
                ]
            }
        }
    };
    
    /**
     * PHASE 1: DISABLE ALL REDUNDANT SCRIPTS
     * Prevent all redundant scripts from executing by modifying their src attributes
     */
    function disableRedundantScripts() {
        try {
            // Create a list of all scripts to disable
            const allRedundantScripts = [
                ...CONFIG.redundantChartScripts,
                ...CONFIG.redundantNotificationScripts
            ];
            
            console.log(`SYSTEM UNIFICATION: Examining ${allRedundantScripts.length} redundant scripts to disable...`);
            
            // Find all script elements on the page
            const scriptTags = document.querySelectorAll('script[src]');
            let disabledCount = 0;
            
            // Check each script to see if it matches any on our list
            scriptTags.forEach(script => {
                const src = script.getAttribute('src');
                if (!src) return;
                
                // Skip if this script has already been processed
                if (script.hasAttribute('data-disabled-by-system-unification')) {
                    return;
                }
                
                // Skip core systems that should NOT be disabled
                const isCoreSystem = CONFIG.coreSystems.some(coreScript => src.includes(coreScript));
                if (isCoreSystem) {
                    console.log(`SYSTEM UNIFICATION: Preserving core system: ${src}`);
                    return;
                }
                
                // Check if the script matches any redundant script
                const isRedundant = allRedundantScripts.some(redundantScript => {
                    return src.includes(redundantScript);
                });
                
                if (isRedundant) {
                    // Disable the script by removing its src and marking it as disabled
                    const originalSrc = script.getAttribute('src');
                    script.setAttribute('data-original-src', originalSrc);
                    script.setAttribute('data-disabled-by-system-unification', 'true');
                    script.removeAttribute('src');
                    
                    console.log(`SYSTEM UNIFICATION: Disabled redundant script: ${originalSrc}`);
                    disabledCount++;
                }
            });
            
            console.log(`SYSTEM UNIFICATION: Disabled ${disabledCount} redundant scripts`);
            return disabledCount;
        } catch (error) {
            console.error('SYSTEM UNIFICATION: Error disabling redundant scripts:', error);
            return 0;
        }
    }
    
    /**
     * PHASE 2: ENSURE CORE SYSTEMS LOADED
     * Make sure our unified chart and notification solutions are active
     */
    function ensureCoreSystems() {
        const coreScripts = [
            { name: 'unified-chart-solution.js', loaded: false },
            { name: 'enhanced-notification-system.js', loaded: false }
        ];
        
        console.log('SYSTEM UNIFICATION: Ensuring core systems are loaded...');
        
        // Check if core scripts are already loaded
        document.querySelectorAll('script[src]').forEach(script => {
            const src = script.getAttribute('src') || '';
            coreScripts.forEach(coreScript => {
                if (src.includes(coreScript.name)) {
                    coreScript.loaded = true;
                    console.log(`SYSTEM UNIFICATION: Core system already loaded: ${coreScript.name}`);
                }
            });
        });
        
        // Load any missing core scripts
        coreScripts.forEach(coreScript => {
            if (!coreScript.loaded) {
                console.warn(`SYSTEM UNIFICATION: Core system missing, loading: ${coreScript.name}`);
                
                const script = document.createElement('script');
                script.src = `js/${coreScript.name}?v=${Date.now()}`;
                script.setAttribute('data-loaded-by-system-unification', 'true');
                document.head.appendChild(script);
            }
        });
    }
    
    /**
     * PHASE 3: METHOD REDIRECTION
     * Redirect all legacy method calls to unified systems
     */
    function redirectLegacyMethods() {
        console.log('SYSTEM UNIFICATION: Setting up method redirection...');
        
        for (const [legacyObject, config] of Object.entries(CONFIG.methodRedirects)) {
            const { target, methods } = config;
            
            console.log(`SYSTEM UNIFICATION: Setting up redirects from ${legacyObject} to ${target}`);
            
            // Create or get the legacy object
            if (!window[legacyObject]) {
                console.log(`SYSTEM UNIFICATION: Creating legacy object: ${legacyObject}`);
                window[legacyObject] = {};
            }
            
            // For singleton implementations like NotificationManager.instance
            if (!window[legacyObject].instance) {
                window[legacyObject].instance = window[legacyObject];
            }
            
            // Create redirects for each method
            methods.forEach(method => {
                const redirectFunction = function(...args) {
                    // Only log if debug mode is enabled or this is the first call
                    if (window.DEBUG_UNIFICATION || !redirectFunction._logged) {
                        console.log(`SYSTEM UNIFICATION: Redirecting ${legacyObject}.${method} to ${target}.${method}`);
                        redirectFunction._logged = true;
                    }
                    
                    // Get the target object safely without using eval
                    let targetObject = null;
                    
                    // Safely resolve the target path
                    if (target === 'window.chartManager') {
                        targetObject = window.chartManager;
                        
                        // Prevent infinite recursion by checking if this is already a redirect
                        if (targetObject && targetObject[method] && targetObject[method]._isRedirect) {
                            console.warn(`SYSTEM UNIFICATION: Preventing infinite recursion for ${target}.${method}`);
                            return null;
                        }
                    } else if (target === 'window.notificationSystem') {
                        // For notification system, use either notificationSystem or notificationManager as fallback
                        targetObject = window.notificationSystem || window.notificationManager || window.enhancedNotificationSystem;
                    } else {
                        // Parse path segments for more complex cases
                        const pathSegments = target.split('.');
                        let currentObj = window;
                        
                        for (const segment of pathSegments) {
                            if (currentObj && currentObj[segment]) {
                                currentObj = currentObj[segment];
                            } else {
                                currentObj = null;
                                break;
                            }
                        }
                        
                        targetObject = currentObj;
                    }
                    
                    if (!targetObject) {
                        console.error(`SYSTEM UNIFICATION: Target ${target} not found for redirect`);
                        return null;
                    }
                    
                    // Call the target method if it exists
                    if (typeof targetObject[method] === 'function') {
                        return targetObject[method](...args);
                    } else {
                        console.error(`SYSTEM UNIFICATION: Target method ${target}.${method} not found`);
                        return null;
                    }
                };
                
                // Mark as redirect to prevent infinite recursion
                redirectFunction._isRedirect = true;
                
                // Add the redirect to both the main object and its instance
                window[legacyObject][method] = redirectFunction;
                if (window[legacyObject].instance) {
                    window[legacyObject].instance[method] = redirectFunction;
                }
                
                console.log(`SYSTEM UNIFICATION: Redirect created for ${legacyObject}.${method}`);
            });
        }
    }
    
    /**
     * PHASE 4: RUN CALLBACK INITIALIZATION
     * Ensure the unified systems are properly initialized once loaded
     */
    function runSystemInitialization() {
        console.log('SYSTEM UNIFICATION: Running system initialization...');
        
        // Trigger chart system init
        if (window.chartManager && typeof window.chartManager.initialize === 'function') {
            console.log('SYSTEM UNIFICATION: Initializing chart system...');
            window.chartManager.initialize();
        } else {
            console.warn('SYSTEM UNIFICATION: chartManager.initialize not available');
        }
        
        // Trigger notification system init
        if (window.notificationSystem && typeof window.notificationSystem.initialize === 'function') {
            console.log('SYSTEM UNIFICATION: Initializing notification system...');
            window.notificationSystem.initialize();
        } else {
            console.warn('SYSTEM UNIFICATION: notificationSystem.initialize not available');
        }
    }
    
    /**
     * PHASE 5: CLEANUP
     * Final cleanup of any remaining issues
     */
    function finalCleanup() {
        console.log('SYSTEM UNIFICATION: Running final cleanup...');
        
        // Clear any chart caches or remnants
        if (window.chartManager && window.chartManager.charts instanceof Map) {
            console.log(`SYSTEM UNIFICATION: Clearing ${window.chartManager.charts.size} cached charts`);
            window.chartManager.charts.clear();
        }
        
        // Remove any inline chart fixes
        document.querySelectorAll('script:not([src])').forEach(script => {
            const content = script.textContent || '';
            if (
                content.includes('chartManager') && 
                (content.includes('createProductionChart') || content.includes('createEntityChart'))
            ) {
                console.log('SYSTEM UNIFICATION: Disabling inline chart fix script');
                script.textContent = '// Disabled by SYSTEM UNIFICATION';
            }
        });
        
        // Clean up localStorage entries for old fixes
        try {
            const keysToCheck = ['chart-fixes', 'notification-fixes', 'dashboard-charts-initialized'];
            keysToCheck.forEach(key => {
                if (localStorage.getItem(key)) {
                    console.log(`SYSTEM UNIFICATION: Removing localStorage key: ${key}`);
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('SYSTEM UNIFICATION: Error accessing localStorage:', e);
        }
        
        console.log('SYSTEM UNIFICATION: Final cleanup complete');
    }
    
    // Execute all phases
    function initialize() {
        console.log('SYSTEM UNIFICATION: Starting system unification...');
        
        // Phase 1: Disable redundant scripts
        disableRedundantScripts();
        
        // Phase 2: Ensure core systems
        ensureCoreSystems();
        
        // Phase 3: Set up method redirection
        setTimeout(redirectLegacyMethods, 500);
        
        // Phase 4: Initialize systems
        setTimeout(runSystemInitialization, 1000);
        
        // Phase 5: Final cleanup
        setTimeout(finalCleanup, 1500);
        
        console.log('SYSTEM UNIFICATION: System unification initialized');
    }
    
    // Run immediately if document is already ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialize();
    } else {
        // Otherwise wait until document is ready
        document.addEventListener('DOMContentLoaded', initialize);
    }
    
    // Also run on window load to ensure everything is available
    window.addEventListener('load', function() {
        setTimeout(initialize, 500);
    });
    
    // Make available globally for debugging
    window.finalSystemUnification = {
        disableRedundantScripts,
        ensureCoreSystems,
        redirectLegacyMethods,
        runSystemInitialization,
        finalCleanup,
        initialize
    };
    
    console.log('=== FINAL SYSTEM UNIFICATION: READY ===');
})();
