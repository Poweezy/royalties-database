/**
 * Diagnostics Helper for Mining Royalties Manager
 * v1.0.0 - 2025-06-25
 * 
 * This script can be loaded in the console to diagnose issues with the application.
 * 
 * Usage:
 * 1. Open your browser's Developer Tools (F12 or Ctrl+Shift+I)
 * 2. Paste this entire script into the console and press Enter
 * 3. Call the diagnostic functions as needed
 */

const RoyaltiesDiagnostics = {
  /**
   * Check if the essential components of the application are available
   */
  checkComponents: function() {
    console.group('Component Availability Check');
    
    // Check app object
    const app = window.app || window.royaltiesApp;
    console.log('App object:', app ? '✅ Available' : '❌ Missing');
    
    // Check module loader
    console.log('ModuleLoader:', window.moduleLoader ? '✅ Available' : '❌ Missing');
    
    // Check chart manager
    console.log('ChartManager:', window.chartManager ? '✅ Available' : '❌ Missing');
    
    // Check sidebar
    const sidebar = document.getElementById('sidebar');
    console.log('Sidebar element:', sidebar ? '✅ Found' : '❌ Missing');
    console.log('Sidebar content:', sidebar && sidebar.innerHTML.trim() !== '' ? '✅ Has content' : '❌ Empty');
    
    // Check dashboard
    const dashboard = document.getElementById('dashboard');
    console.log('Dashboard element:', dashboard ? '✅ Found' : '❌ Missing');
    console.log('Dashboard content:', dashboard && dashboard.innerHTML.trim() !== '' ? '✅ Has content' : '❌ Empty');
    
    // Check service worker
    console.log('Service Worker API:', 'serviceWorker' in navigator ? '✅ Available' : '❌ Not available');
    console.log('Service Worker registration:', navigator.serviceWorker.controller ? '✅ Active' : '❌ Not active');
    
    console.groupEnd();
    
    return {
      app: !!app,
      moduleLoader: !!window.moduleLoader,
      chartManager: !!window.chartManager,
      sidebar: !!(sidebar && sidebar.innerHTML.trim() !== ''),
      dashboard: !!(dashboard && dashboard.innerHTML.trim() !== ''),
      serviceWorker: !!(navigator.serviceWorker && navigator.serviceWorker.controller)
    };
  },
  
  /**
   * Check if all script files are loaded
   */
  checkScriptFiles: function() {
    console.group('Script Files Check');
    
    const scriptFiles = Array.from(document.querySelectorAll('script[src]'))
      .map(script => script.getAttribute('src'));
    
    console.log('Total scripts loaded:', scriptFiles.length);
    console.table(scriptFiles);
    
    const requiredScripts = [
      'app.js',
      'js/module-loader.js',
      'js/chart-manager.js',
      'js/component-initializer.js',
      'js/sidebar-manager.js'
    ];
    
    console.group('Required Scripts');
    requiredScripts.forEach(script => {
      const found = scriptFiles.some(src => src.includes(script));
      console.log(script + ':', found ? '✅ Loaded' : '❌ Missing');
    });
    console.groupEnd();
    
    console.groupEnd();
  },
  
  /**
   * Fix common issues automatically
   */
  applyFixes: function() {
    console.group('Applying Common Fixes');
    
    // Fix 1: Ensure sidebar and dashboard have content
    const components = ['sidebar', 'dashboard'];
    components.forEach(id => {
      const element = document.getElementById(id);
      if (element && element.innerHTML.trim() === '') {
        console.log(`Fixing empty ${id}...`);
        if (window.moduleLoader && window.moduleLoader.loadComponent) {
          window.moduleLoader.loadComponent(id, element)
            .then(result => {
              console.log(`${id} load result:`, result.success ? '✅ Success' : '❌ Failed');
            });
        } else if (window.app && window.app.loadSectionContent) {
          window.app.loadSectionContent(id);
          console.log(`Triggered ${id} load via app.loadSectionContent`);
        } else if (window.royaltiesApp && window.royaltiesApp.loadSectionContent) {
          window.royaltiesApp.loadSectionContent(id);
          console.log(`Triggered ${id} load via royaltiesApp.loadSectionContent`);
        }
      }
    });
    
    // Fix 2: Ensure login and app containers are properly set up
    const loginSection = document.getElementById('login-section');
    const appContainer = document.getElementById('app-container');
    
    if (loginSection && appContainer) {
      if (loginSection.style.display !== 'none' && appContainer.style.display !== 'flex') {
        console.log('App not showing, probably needs login...');
        console.log('To login use: admin/admin123, editor/editor123, or viewer/viewer123');
      }
    }
    
    console.groupEnd();
  },
  
  /**
   * Check for component availability and repair paths if needed
   */
  checkAndRepairComponentPaths: async function() {
    console.group('Component Path Check and Repair');
    
    const componentIds = [
      'sidebar',
      'dashboard',
      'user-management',
      'royalty-records',
      'contract-management',
      'reporting-analytics',
      'communication',
      'notifications',
      'compliance',
      'regulatory-management',
      'profile'
    ];
    
    const results = {
      components: {},
      htmlComponents: {},
      fixed: 0,
      errors: []
    };
    
    // Check components in both paths
    for (const id of componentIds) {
      try {
        // Check components/ directory
        const compResponse = await fetch(`components/${id}.html`);
        results.components[id] = compResponse.ok;
        console.log(`components/${id}.html: ${compResponse.ok ? '✅ Available' : '❌ Not found or empty'}`);
        
        // Check html/components/ directory
        const htmlCompResponse = await fetch(`html/components/${id}.html`);
        results.htmlComponents[id] = htmlCompResponse.ok;
        console.log(`html/components/${id}.html: ${htmlCompResponse.ok ? '✅ Available' : '❌ Not found or empty'}`);
        
        // If available in components/ but not in html/components/, try to fix
        if (compResponse.ok && !htmlCompResponse.ok) {
          if (window.moduleLoader && window.moduleLoader.cache) {
            const content = await compResponse.text();
            // Create a blob to create a temporary element for copying
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            try {
              // Attempt to manually copy via fetch API - this won't actually work client-side
              // but we can at least cache the content from the primary location
              if (window.moduleLoader && window.moduleLoader.cache) {
                window.moduleLoader.cache.set(id, content);
                console.log(`✅ Fixed: Cached content for ${id} from components/ directory`);
                results.fixed++;
              }
            } catch (fixError) {
              console.error(`Failed to repair ${id}:`, fixError);
              results.errors.push(id);
            }
          }
        }
      } catch (error) {
        console.error(`Error checking ${id}:`, error);
        results.errors.push(id);
      }
    }
    
    console.groupEnd();
    return results;
  },

  /**
   * Force loading of essential components from fall-back sources
   */
  forceLoadEssentialComponents: async function() {
    console.group('Force Loading Essential Components');
    const results = { success: {}, error: {} };
    
    const essentialComponents = ['sidebar', 'dashboard'];
    
    for (const id of essentialComponents) {
      try {
        console.log(`Attempting to force-load ${id}...`);
        
        // Try to get the component element
        const element = document.getElementById(id);
        if (!element) {
          console.error(`Element #${id} not found in the DOM`);
          results.error[id] = 'Element not found';
          continue;
        }
        
        // Try both paths
        let content = null;
        let source = null;
        
        try {
          const resp1 = await fetch(`components/${id}.html?nocache=${Date.now()}`);
          if (resp1.ok) {
            content = await resp1.text();
            if (content && content.trim() !== '') {
              source = `components/${id}.html`;
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch from components/ directory`, e);
        }
        
        if (!content) {
          try {
            const resp2 = await fetch(`html/components/${id}.html?nocache=${Date.now()}`);
            if (resp2.ok) {
              content = await resp2.text();
              if (content && content.trim() !== '') {
                source = `html/components/${id}.html`;
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch from html/components/ directory`, e);
          }
        }
        
        // If we found content, use it
        if (content && content.trim() !== '') {
          element.innerHTML = content;
          console.log(`✅ Successfully loaded ${id} from ${source}`);
          
          // Cache the content if moduleLoader exists
          if (window.moduleLoader && window.moduleLoader.cache) {
            window.moduleLoader.cache.set(id, content);
            console.log(`✅ Cached content for ${id}`);
          }
          
          results.success[id] = source;
        } else {
          // Try fallback content
          if (window.moduleLoader && window.moduleLoader.fallbackComponents && 
              window.moduleLoader.fallbackComponents[id]) {
            element.innerHTML = window.moduleLoader.fallbackComponents[id];
            console.log(`⚠️ Used fallback content for ${id}`);
            results.success[id] = 'fallback';
          } else {
            console.error(`Failed to load ${id} - no content found`);
            results.error[id] = 'No content found';
          }
        }
      } catch (error) {
        console.error(`Error force-loading ${id}:`, error);
        results.error[id] = error.message;
      }
    }
    
    console.groupEnd();
    return results;
  },

  /**
   * Run all diagnostics
   */
  runAll: function() {
    console.group('Mining Royalties Manager Diagnostics');
    console.log('Version: 1.0.0');
    console.log('Date: ' + new Date().toLocaleString());
    console.log('URL: ' + window.location.href);
    console.log('Protocol: ' + window.location.protocol);
    
    this.checkComponents();
    this.checkScriptFiles();
    this.applyFixes();
    
    console.groupEnd();
    
    console.log('Diagnostics complete! For issues, check the "Running the Application" section in README.md');
  },
  
  /**
   * Run all diagnostics and fix issues where possible
   */
  runAllDiagnostics: async function() {
    console.group('🔍 MINING ROYALTIES MANAGER - COMPLETE SYSTEM DIAGNOSTICS');
    console.log('Starting comprehensive diagnostics...');
    
    // 1. Check components
    const componentCheck = this.checkComponents();
    
    // 2. Check scripts
    const scriptCheck = this.checkScripts();
    
    // 3. Check and repair component paths
    const pathCheck = await this.checkAndRepairComponentPaths();
    
    // 4. Force load essential components if needed
    let forceLoadResults = {};
    if (!componentCheck.sidebar || !componentCheck.dashboard) {
      console.log('Essential components missing, attempting force load...');
      forceLoadResults = await this.forceLoadEssentialComponents();
    } else {
      console.log('Essential components found, skipping force load');
    }
    
    // 5. Check service worker
    const swCheck = this.checkServiceWorker();
    
    // 6. Run app initialization check
    const appCheck = this.checkAppInitialization();
    
    // 7. Generate report
    const report = {
      timestamp: new Date().toISOString(),
      components: componentCheck,
      scripts: scriptCheck,
      componentPaths: pathCheck,
      forceLoad: forceLoadResults,
      serviceWorker: swCheck,
      appInitialization: appCheck,
      summary: {
        status: componentCheck.app && componentCheck.moduleLoader && 
                (componentCheck.sidebar || (forceLoadResults.success && forceLoadResults.success.sidebar)) && 
                (componentCheck.dashboard || (forceLoadResults.success && forceLoadResults.success.dashboard)) ? 
                'OPERATIONAL' : 'ISSUES DETECTED'
      }
    };
    
    console.log('📊 Diagnostics Summary:', report.summary.status);
    console.log('See full report object for details');
    console.groupEnd();
    
    return report;
  },
};

// Run diagnostics automatically
RoyaltiesDiagnostics.runAll();

// Export for future use
window.RoyaltiesDiagnostics = RoyaltiesDiagnostics;

console.log('%c Mining Royalties Manager Diagnostics Tool Loaded ', 'background: #1a365d; color: white; padding: 5px; border-radius: 3px;');
console.log('Use RoyaltiesDiagnostics.runAll() to run diagnostics again.');
