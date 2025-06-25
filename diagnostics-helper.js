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
  }
};

// Run diagnostics automatically
RoyaltiesDiagnostics.runAll();

// Export for future use
window.RoyaltiesDiagnostics = RoyaltiesDiagnostics;

console.log('%c Mining Royalties Manager Diagnostics Tool Loaded ', 'background: #1a365d; color: white; padding: 5px; border-radius: 3px;');
console.log('Use RoyaltiesDiagnostics.runAll() to run diagnostics again.');
