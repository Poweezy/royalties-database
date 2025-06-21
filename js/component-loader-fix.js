/**
 * Component Loader Fix
 * 
 * This script improves the component loading process by:
 * 1. Properly verifying file existence before attempting to load
 * 2. Ensuring paths are correctly resolved
 * 3. Adding proper error handling and retry mechanisms
 * 4. Adding diagnostics to identify issues with component loading
 * 
 * Version: 1.0.0 (2025-07-01)
 */

(function() {
    // Script loading guard to prevent duplicate initialization
    if (window.COMPONENT_LOADER_FIX_LOADED) {
        console.log('Component Loader Fix: Already loaded, skipping initialization');
        return;
    }
    
    window.COMPONENT_LOADER_FIX_LOADED = true;
    console.log('Component Loader Fix: Initializing...');
    
    // Configuration
    const config = {
        // Paths to search for components, in order of preference
        componentPaths: ['components', 'html/components'],
        // How long to wait before showing fallback content
        fallbackDelay: 2000,
        // How many times to retry loading a component
        maxRetries: 2,
        // Debug mode
        debug: true
    };
    
    /**
     * Create a wrapper for the ModuleLoader to enhance it
     */
    function enhanceModuleLoader() {
        const originalModuleLoader = window.moduleLoader;
        
        if (!originalModuleLoader) {
            console.error('ModuleLoader not found, creating new instance');
            window.moduleLoader = createNewModuleLoader();
            return;
        }
        
        // Save original loadComponent method
        const originalLoadComponent = originalModuleLoader.loadComponent;
        
        // Override loadComponent with enhanced version
        originalModuleLoader.loadComponent = async function(componentId, container) {
            log(`Enhanced ModuleLoader: Loading component '${componentId}'`);
            
            // Track loading attempt
            window.diagnosticsData = window.diagnosticsData || {};
            window.diagnosticsData.componentLoadAttempts = window.diagnosticsData.componentLoadAttempts || {};
            window.diagnosticsData.componentLoadAttempts[componentId] = (window.diagnosticsData.componentLoadAttempts[componentId] || 0) + 1;
            
            try {
                // First check if the component file exists before attempting to load it
                const componentExists = await checkComponentExists(componentId);
                
                if (componentExists) {
                    log(`Component '${componentId}' exists, proceeding with load`);
                    return await originalLoadComponent.call(this, componentId, container);
                } else {
                    log(`Component '${componentId}' does not exist in any path, using fallback`);
                    return await useFallbackWithRetry(componentId, container);
                }
            } catch (error) {
                console.error(`Error loading component '${componentId}':`, error);
                return await useFallbackWithRetry(componentId, container);
            }
        };
        
        log('ModuleLoader enhanced successfully');
    }
    
    /**
     * Create a new module loader if one doesn't exist
     */
    function createNewModuleLoader() {
        log('Creating new ModuleLoader instance');
        
        const newLoader = {
            cache: new Map(),
            componentPaths: config.componentPaths,
            
            async loadComponent(componentId, container) {
                log(`New ModuleLoader: Loading component '${componentId}'`);
                
                // First check if the component file exists
                const componentExists = await checkComponentExists(componentId);
                
                if (componentExists) {
                    return await this.fetchComponent(componentId, container);
                } else {
                    return await useFallbackWithRetry(componentId, container);
                }
            },
            
            async fetchComponent(componentId, container) {
                for (const path of this.componentPaths) {
                    try {
                        const response = await fetch(`${path}/${componentId}.html?v=${Date.now()}`);
                        if (response.ok) {
                            const content = await response.text();
                            
                            // If container is provided, set the content
                            if (container) {
                                container.innerHTML = content;
                            } else {
                                const sectionElement = document.getElementById(componentId);
                                if (sectionElement) {
                                    sectionElement.innerHTML = content;
                                }
                            }
                            
                            // Trigger component loaded event
                            document.dispatchEvent(new CustomEvent('componentLoaded', { 
                                detail: { componentId, success: true }
                            }));
                            
                            return content;
                        }
                    } catch (error) {
                        console.warn(`Error fetching from ${path}/${componentId}.html:`, error);
                    }
                }
                
                throw new Error(`Component '${componentId}' could not be loaded from any path`);
            }
        };
        
        return newLoader;
    }
    
    /**
     * Check if a component file exists in any of the configured paths
     */
    async function checkComponentExists(componentId) {
        for (const path of config.componentPaths) {
            try {
                const response = await fetch(`${path}/${componentId}.html?v=${Date.now()}`, { method: 'HEAD' });
                if (response.ok) {
                    log(`Component '${componentId}' found in path: ${path}`);
                    return true;
                }
            } catch (error) {
                // Continue checking other paths
            }
        }
        
        log(`Component '${componentId}' not found in any path`);
        return false;
    }
    
    /**
     * Use fallback content with retry mechanism
     */
    async function useFallbackWithRetry(componentId, container) {
        const retries = window.diagnosticsData?.componentLoadAttempts?.[componentId] || 0;
        
        if (retries < config.maxRetries) {
            log(`Retry attempt ${retries + 1} for component '${componentId}'`);
            
            // Show temporary loading indicator
            if (container) {
                container.innerHTML = getLoadingHTML(componentId);
            } else {
                const section = document.getElementById(componentId);
                if (section) {
                    section.innerHTML = getLoadingHTML(componentId);
                }
            }
            
            // Delay and retry different paths
            await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
            
            // Try an alternative path order on retry
            const reversedPaths = [...config.componentPaths].reverse();
            
            for (const path of reversedPaths) {
                try {
                    const response = await fetch(`${path}/${componentId}.html?v=${Date.now()}&retry=${retries}`);
                    if (response.ok) {
                        const content = await response.text();
                        
                        // Set content to container or section
                        if (container) {
                            container.innerHTML = content;
                        } else {
                            const section = document.getElementById(componentId);
                            if (section) {
                                section.innerHTML = content;
                            }
                        }
                        
                        // Trigger component loaded event
                        document.dispatchEvent(new CustomEvent('componentLoaded', { 
                            detail: { componentId, success: true, retried: true }
                        }));
                        
                        return content;
                    }
                } catch (error) {
                    // Continue with next path
                }
            }
        }
        
        log(`All retries failed for '${componentId}', using fallback content`);
        
        // Use fallback content after all retries fail
        let fallbackContent;
        
        // Try using SectionComponentManager's fallback content if available
        if (window.sectionComponentManager && typeof window.sectionComponentManager.loadFallbackContent === 'function') {
            try {
                window.sectionComponentManager.loadFallbackContent(componentId);
                return;
            } catch (error) {
                console.warn('Error using SectionComponentManager fallback:', error);
            }
        }
        
        // Use app's fallback method if available
        if (window.app && typeof window.app.loadFallbackSection === 'function') {
            try {
                window.app.loadFallbackSection(componentId);
                return;
            } catch (error) {
                console.warn('Error using app fallback method:', error);
            }
        }
        
        // Use built-in generic fallback if nothing else worked
        fallbackContent = getGenericFallbackHTML(componentId);
        
        if (container) {
            container.innerHTML = fallbackContent;
        } else {
            const section = document.getElementById(componentId);
            if (section) {
                section.innerHTML = fallbackContent;
            }
        }
        
        // Trigger component loaded event with failure info
        document.dispatchEvent(new CustomEvent('componentLoaded', { 
            detail: { componentId, success: false, fallback: true }
        }));
    }
    
    /**
     * Get loading HTML for a component
     */
    function getLoadingHTML(componentId) {
        return `
            <div class="loading-component" data-component="${componentId}">
                <div class="loading-spinner"></div>
                <p>Loading ${componentId.replace(/-/g, ' ')}...</p>
            </div>
        `;
    }
    
    /**
     * Get generic fallback HTML for a component
     */
    function getGenericFallbackHTML(componentId) {
        const title = componentId.replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        return `
            <div class="section-container">
                <div class="page-header">
                    <div class="page-title">
                        <h1>${title}</h1>
                        <p>Manage your ${componentId.replace(/-/g, ' ')} efficiently</p>
                    </div>
                </div>
                <div class="content-container">
                    <div class="card">
                        <div class="card-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <span>This section is currently being updated. Please check back soon.</span>
                            </div>
                            <p>The ${componentId.replace(/-/g, ' ')} section will be available shortly. Our team is working to bring you improved features and analytics.</p>
                            <button class="btn btn-primary retry-load-btn" data-component="${componentId}">
                                <i class="fas fa-sync-alt"></i> Retry Loading
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Add event handlers for retry buttons and other interactive elements
     */
    function setupEventHandlers() {
        // Add global event handler for retry buttons
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('retry-load-btn') || 
                event.target.parentElement.classList.contains('retry-load-btn')) {
                
                const button = event.target.classList.contains('retry-load-btn') ? 
                    event.target : event.target.parentElement;
                    
                const componentId = button.dataset.component;
                
                if (componentId) {
                    // Reset retry counter to force new attempt
                    if (window.diagnosticsData && window.diagnosticsData.componentLoadAttempts) {
                        window.diagnosticsData.componentLoadAttempts[componentId] = 0;
                    }
                    
                    log(`Manual retry requested for component '${componentId}'`);
                    
                    // Show loading state
                    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                    button.disabled = true;
                    
                    // Try both available methods to reinitialize
                    if (window.sectionComponentManager && typeof window.sectionComponentManager.initializeSection === 'function') {
                        window.sectionComponentManager.initializeSection(componentId);
                    } else if (window.app && typeof window.app.initializeSectionComponent === 'function') {
                        window.app.initializeSectionComponent(componentId);
                    }
                    
                    // Reset button after delay
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-sync-alt"></i> Retry Loading';
                        button.disabled = false;
                    }, 3000);
                }
            }
        });
        
        // Listen for navigation events to ensure components are properly loaded
        document.addEventListener('sectionChanged', function(event) {
            if (event.detail && event.detail.sectionId) {
                const sectionId = event.detail.sectionId;
                log(`Section changed to: ${sectionId}`);
                
                // Short delay to ensure DOM is updated
                setTimeout(() => {
                    const section = document.getElementById(sectionId);
                    if (section && (section.children.length === 0 || section.innerHTML.trim() === '')) {
                        log(`Section ${sectionId} appears empty after navigation, reinitializing`);
                        
                        // Try to initialize with either available method
                        if (window.sectionComponentManager && typeof window.sectionComponentManager.initializeSection === 'function') {
                            window.sectionComponentManager.initializeSection(sectionId);
                        } else if (window.app && typeof window.app.initializeSectionComponent === 'function') {
                            window.app.initializeSectionComponent(sectionId);
                        }
                    }
                }, 300);
            }
        });
        
        log('Event handlers set up successfully');
    }
    
    /**
     * Log messages with prefix for easier debugging
     */
    function log(message) {
        if (config.debug) {
            console.log(`[ComponentLoaderFix] ${message}`);
        }
    }
    
    // Wait for page load
    function init() {
        log('Initializing Component Loader Fix');
        enhanceModuleLoader();
        setupEventHandlers();
        
        // After initialization, force check all sections
        setTimeout(() => {
            document.querySelectorAll('main section').forEach(section => {
                const sectionId = section.id;
                if (sectionId && (section.children.length === 0 || section.innerHTML.trim() === '')) {
                    log(`Found empty section: ${sectionId}, triggering initialization`);
                    
                    // Try to initialize with either available method
                    if (window.sectionComponentManager && typeof window.sectionComponentManager.initializeSection === 'function') {
                        window.sectionComponentManager.initializeSection(sectionId);
                    } else if (window.app && typeof window.app.initializeSectionComponent === 'function') {
                        window.app.initializeSectionComponent(sectionId);
                    }
                }
            });
        }, 1000);
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
