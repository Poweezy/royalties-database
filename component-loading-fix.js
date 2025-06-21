/**
 * Component Loading Fix
 * This script ensures that all components are loaded correctly
 * Run this after cleaning up redundant files
 */
(function() {
    console.log('%c=== Component Loading Fix Script ===', 'color: blue; font-weight: bold; font-size: 16px;');
    
    // Fix moduleLoader paths
    fixModuleLoaderPaths();
    
    // Ensure chart manager is properly initialized
    ensureChartManager();
    
    // Apply section navigation fix
    applySectionNavigationFix();
    
    console.log('%c✅ Component loading fixes applied successfully!', 'color: green; font-weight: bold');
    
    /**
     * Fix moduleLoader paths to ensure components load correctly
     */
    function fixModuleLoaderPaths() {
        if (!window.moduleLoader) {
            console.error('ModuleLoader not found, cannot fix component loading');
            return;
        }
        
        console.log('Fixing ModuleLoader component paths...');
        
        // Update component path to ensure it looks in the correct directory
        window.moduleLoader.componentPath = 'components/';
        
        // Create a reference map for common components
        const componentPathMap = {
            'dashboard': 'components/dashboard.html',
            'royalty-records': 'components/royalty-records.html',
            'audit-dashboard': 'components/audit-dashboard.html',
            'user-management': 'components/user-management.html',
            'contract-management': 'components/contract-management.html',
            'compliance': 'components/compliance.html',
            'reporting-analytics': 'components/reporting-analytics.html',
            'regulatory-management': 'components/regulatory-management.html',
            'notifications': 'components/notifications.html',
            'profile': 'components/profile.html',
            'sidebar': 'components/sidebar.html'
        };
        
        // Override the getComponentPath function to use our map
        const originalGetComponentPath = window.moduleLoader.getComponentPath;
        window.moduleLoader.getComponentPath = function(componentId) {
            if (componentPathMap[componentId]) {
                return componentPathMap[componentId];
            }
            
            // Fall back to original implementation
            return originalGetComponentPath.call(this, componentId);
        };
        
        // Enhance error handling in the loadComponent function
        const originalLoadComponent = window.moduleLoader.loadComponent;
        window.moduleLoader.loadComponent = async function(componentId, container) {
            try {
                console.log(`Loading component: ${componentId}`);
                const result = await originalLoadComponent.call(this, componentId, container);
                
                // Check if we got a valid result
                if (!result || typeof result === 'string' && result.includes('will be available soon')) {
                    console.warn(`Component ${componentId} loaded with fallback content. Trying alternative path...`);
                    
                    // Attempt to load from alternative path
                    const altPath = `components/${componentId}.html`;
                    const response = await fetch(altPath);
                    
                    if (response.ok) {
                        const html = await response.text();
                        if (container) {
                            container.innerHTML = html;
                        } else {
                            const mainContainer = document.getElementById('main-content');
                            if (mainContainer) mainContainer.innerHTML = html;
                        }
                        
                        // Initialize any dynamic content
                        if (window.componentInitializer && typeof window.componentInitializer.initializeComponent === 'function') {
                            window.componentInitializer.initializeComponent(componentId);
                        }
                        
                        return html;
                    }
                }
                
                return result;
            } catch (error) {
                console.error(`Error loading component ${componentId}:`, error);
                
                // Provide fallback content with clear error message
                const errorMessage = `
                    <div class="error-container">
                        <h2>Component Loading Error</h2>
                        <p>There was an error loading the ${componentId} component.</p>
                        <p>Error details: ${error.message}</p>
                        <button class="btn btn-primary" onclick="window.location.reload()">Reload Page</button>
                    </div>
                `;
                
                if (container) {
                    container.innerHTML = errorMessage;
                } else {
                    const mainContainer = document.getElementById('main-content');
                    if (mainContainer) mainContainer.innerHTML = errorMessage;
                }
                
                return errorMessage;
            }
        };
        
        console.log('ModuleLoader paths fixed successfully');
    }
    
    /**
     * Ensure chart manager is properly initialized
     */
    function ensureChartManager() {
        if (!window.chartManager && typeof ChartManager === 'function') {
            console.log('Initializing ChartManager...');
            window.chartManager = new ChartManager();
            console.log('ChartManager initialized successfully');
        }
    }
    
    /**
     * Apply navigation fix to ensure sections load correctly
     */
    function applySectionNavigationFix() {
        if (!window.app || typeof window.app.showSection !== 'function') {
            console.error('App not found or showSection method not available');
            return;
        }
        
        console.log('Applying section navigation fix...');
        
        // Save the original showSection function
        const originalShowSection = window.app.showSection;
        
        // Override with enhanced version
        window.app.showSection = async function(sectionId) {
            console.log(`Navigating to section: ${sectionId}`);
            
            try {
                // Call original function
                const result = await originalShowSection.call(this, sectionId);
                
                // Check if the section content was loaded properly
                setTimeout(() => {
                    const mainContent = document.getElementById('main-content');
                    if (mainContent && mainContent.innerHTML.includes('will be available soon')) {
                        console.warn(`Section ${sectionId} loaded with fallback content. Attempting to reload...`);
                        
                        // Force reload the section content
                        if (typeof this.loadSectionContent === 'function') {
                            this.loadSectionContent(sectionId);
                        }
                    }
                    
                    // Initialize any charts after navigation
                    if (window.chartManager && typeof window.chartManager.initializeCharts === 'function') {
                        window.chartManager.initializeCharts();
                    }
                }, 500);
                
                return result;
            } catch (error) {
                console.error(`Error navigating to section ${sectionId}:`, error);
                return null;
            }
        };
        
        console.log('Section navigation fix applied successfully');
    }
})();
