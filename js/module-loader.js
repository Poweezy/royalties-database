/**
 * ModuleLoader - Efficient component loading system
 * v1.0.0 - 2025-06-20
 */

class ModuleLoader {    constructor() {
        this.cache = new Map();
        this.componentRoot = 'components';
        this.componentPaths = ['components', 'html/components']; // Try multiple paths
        this.initialized = false;
        this.pendingModules = new Set();
    }

    /**
     * Initialize the module loader system
     */
    initialize() {
        if (this.initialized) return;
        console.log('ModuleLoader: Initializing component system');
        this.initialized = true;
        
        // Pre-register known components
        this.registerComponents([
            'dashboard', 'user-management', 'royalty-records', 'contract-management',
            'audit-dashboard', 'reporting-analytics', 'communication',
            'notifications', 'compliance', 'regulatory-management', 'profile'
        ]);
    }

    /**
     * Register a set of components for lazy loading
     * @param {Array} components - List of component names
     */
    registerComponents(components) {
        components.forEach(component => {
            this.pendingModules.add(component);
        });
    }

    /**
     * Load a component into the specified container
     * @param {string} componentId - Component identifier
     * @param {HTMLElement} container - Container element to insert the component
     * @returns {Promise} - Promise that resolves when the component is loaded
     */    async loadComponent(componentId, container) {
        try {
            if (!this.initialized) this.initialize();
            
            console.log(`ModuleLoader: Loading component '${componentId}'`);
            
            // Try to get from cache first
            let content = this.cache.get(componentId);
            
            if (!content) {
                let loaded = false;
                
                // Try each possible component path
                for (const componentPath of this.componentPaths) {
                    try {
                        // First try with cache-busting parameter
                        const response = await fetch(`${componentPath}/${componentId}.html?v=${Date.now()}`);
                        if (response.ok) {
                            content = await response.text();
                            loaded = true;
                            console.log(`ModuleLoader: Found component '${componentId}' in ${componentPath}`);
                            // Remember the successful path for this component
                            this.componentRoot = componentPath;
                            break;
                        }
                    } catch (pathError) {
                        // Continue to next path
                        console.warn(`ModuleLoader: Component '${componentId}' not found in ${componentPath}`);
                    }
                }
                
                // If not found in any path, try without cache busting
                if (!loaded) {
                    for (const componentPath of this.componentPaths) {
                        try {
                            const response = await fetch(`${componentPath}/${componentId}.html`);
                            if (response.ok) {
                                content = await response.text();
                                loaded = true;
                                console.log(`ModuleLoader: Found component '${componentId}' in ${componentPath} without cache-busting`);
                                this.componentRoot = componentPath;
                                break;
                            }
                        } catch (innerError) {
                            // Continue to next path
                        }
                    }
                }
                
                // If still not found, throw error
                if (!loaded) {
                    throw new Error(`Failed to load component: ${componentId}. Not found in any path.`);
                }
                
                // Store in cache
                this.cache.set(componentId, content);
                
                // Remove from pending
                this.pendingModules.delete(componentId);
            }
            
            // Insert content into container
            if (container) {
                container.innerHTML = content;
                
                // Execute any scripts in the loaded content
                const scripts = container.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    Array.from(script.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    newScript.textContent = script.textContent;
                    script.parentNode.replaceChild(newScript, script);
                });
            }
            
            console.log(`ModuleLoader: Successfully loaded component '${componentId}'`);
            return { success: true, content };
        } catch (error) {
            console.error(`ModuleLoader: Error loading component '${componentId}'`, error);
            return { success: false, error };
        }
    }

    /**
     * Preload a component for future use
     * @param {string} componentId - Component identifier
     * @returns {Promise} - Promise that resolves when the component is preloaded
     */    async preloadComponent(componentId) {
        try {
            if (!this.cache.has(componentId)) {
                let loaded = false;
                
                // Try each possible component path
                for (const componentPath of this.componentPaths) {
                    try {
                        const response = await fetch(`${componentPath}/${componentId}.html?v=${Date.now()}`);
                        if (response.ok) {
                            const content = await response.text();
                            this.cache.set(componentId, content);
                            this.pendingModules.delete(componentId);
                            console.log(`ModuleLoader: Preloaded component '${componentId}' from ${componentPath}`);
                            loaded = true;
                            break;
                        }
                    } catch (pathError) {
                        // Continue to next path
                    }
                }
                
                if (!loaded) {
                    throw new Error(`Failed to preload component: ${componentId}`);
                }
            }
            return { success: true };
        } catch (error) {
            console.warn(`ModuleLoader: Failed to preload component '${componentId}'`, error);
            return { success: false, error };
        }
    }

    /**
     * Clear component cache
     * @param {string} componentId - Optional component to clear, clears all if not specified
     */
    clearCache(componentId = null) {
        if (componentId) {
            this.cache.delete(componentId);
            this.pendingModules.add(componentId);
        } else {
            this.cache.clear();
        }
    }
}

// Create and export global instance
window.moduleLoader = new ModuleLoader();
console.log('ModuleLoader: Module loader registered globally');

// Initialize immediately to pre-register components
window.moduleLoader.initialize();

// Add diagnostic method
window.checkComponentsAvailability = async function() {
    const components = [
        'sidebar', 'dashboard', 'user-management', 'royalty-records',
        'contract-management', 'audit-dashboard', 'reporting-analytics',
        'communication', 'notifications', 'compliance', 'regulatory-management', 'profile'
    ];
    
    console.log("Component availability check:");
    const results = [];
    
    for (const component of components) {
        try {
            const response = await fetch(`components/${component}.html`);
            results.push({
                component,
                status: response.ok ? 'Available' : 'Missing',
                statusCode: response.status
            });
        } catch (error) {
            results.push({
                component,
                status: 'Error',
                error: error.message
            });
        }
    }
    
    console.table(results);
    return results;
};
