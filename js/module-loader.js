/**
 * ModuleLoader - Efficient component loading system
 * v1.0.0 - 2025-06-20
 */

class ModuleLoader {
    constructor() {
        this.cache = new Map();
        this.componentRoot = 'components';
        this.componentPaths = ['components', 'html/components']; // Try multiple paths
        this.initialized = false;
        this.pendingModules = new Set();
        this.isFileProtocol = window.location.protocol === 'file:';
        
        // Predefined fallback content for file:// protocol
        this.fallbackComponents = {
            'sidebar': '<div class="sidebar-container"><h3>Navigation</h3><nav class="sidebar-nav"><ul class="nav flex-column"><li class="nav-item"><a href="#dashboard" class="nav-link active" data-section="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li><li class="nav-item"><a href="#royalty-records" class="nav-link" data-section="royalty-records"><i class="fas fa-file-invoice-dollar"></i> Royalty Records</a></li><li class="nav-item"><a href="#contract-management" class="nav-link" data-section="contract-management"><i class="fas fa-file-contract"></i> Contract Management</a></li></ul></nav></div>',
            'dashboard': '<div class="dashboard-container"><h1>Mining Royalties Dashboard</h1><div class="alert alert-info">Running in file:// protocol mode - Limited functionality available</div><div class="row"><div class="col-md-6"><div class="card"><div class="card-body"><h5 class="card-title">Welcome to Mining Royalties Manager</h5><p class="card-text">This is a simplified dashboard view when running from file:// protocol.</p></div></div></div></div></div>',
            'royalty-records': '<div class="royalty-records-container"><h1>Royalty Records</h1><div class="alert alert-warning">Running in file:// protocol mode - Limited functionality available</div><p>To access full functionality, please run using a web server.</p></div>',
            'contract-management': '<div class="contract-management-container"><h1>Contract Management</h1><div class="alert alert-warning">Running in file:// protocol mode - Limited functionality available</div><p>To access full functionality, please run using a web server.</p></div>'
        };
    }    /**
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
        
        // If we're in file:// protocol mode, set up the fallback sections
        if (this.isFileProtocol) {
            console.log('ModuleLoader: File:// protocol detected - setting up fallback system');
            // Wait a moment for DOM to be ready
            setTimeout(() => {
                this.createFileProtocolSections();
            }, 500);
        }
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
                // If using file protocol, use fallback content if available
                if (this.isFileProtocol && this.fallbackComponents[componentId]) {
                    console.log(`ModuleLoader: Using fallback content for '${componentId}' (file:// protocol)`);
                    content = this.fallbackComponents[componentId];
                    this.cache.set(componentId, content);
                } else {
                    let loaded = false;
                    
                    // Try each possible component path
                    for (const componentPath of this.componentPaths) {
                        try {
                            // First try with cache-busting parameter
                            const response = await fetch(`${componentPath}/${componentId}.html?v=${Date.now()}`);
                            if (response.ok) {
                                content = await response.text();
                                // Check if the content is empty
                                if (content.trim() === '') {
                                    console.warn(`ModuleLoader: Component '${componentId}' in ${componentPath} is empty`);
                                    continue;
                                }
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
                                    // Check if the content is empty
                                    if (content.trim() === '') {
                                        console.warn(`ModuleLoader: Component '${componentId}' in ${componentPath} is empty (without cache-busting)`);
                                        continue;
                                    }
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
                    
                    // If still not found, try fallbacks or throw error
                    if (!loaded) {
                        if (this.fallbackComponents[componentId]) {
                            console.log(`ModuleLoader: Using fallback content for '${componentId}' as component was not found`);
                            content = this.fallbackComponents[componentId];
                        } else {
                            throw new Error(`Failed to load component: ${componentId}. Not found in any path.`);
                        }
                    }
                    
                    // Store in cache
                    this.cache.set(componentId, content);
                }
                
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
    }    /**
     * Preload a component for future use
     * @param {string} componentId - Component identifier
     * @returns {Promise} - Promise that resolves when the component is preloaded
     */    async preloadComponent(componentId) {
        try {
            if (!this.cache.has(componentId)) {
                let loaded = false;
                
                // Check if we're using file:// protocol and have a fallback
                if (this.isFileProtocol && this.fallbackComponents[componentId]) {
                    console.log(`ModuleLoader: Using fallback content for preload '${componentId}' (file:// protocol)`);
                    this.cache.set(componentId, this.fallbackComponents[componentId]);
                    this.pendingModules.delete(componentId);
                    return { success: true, fromFallback: true };
                }
                
                // Try each possible component path
                for (const componentPath of this.componentPaths) {
                    try {
                        const response = await fetch(`${componentPath}/${componentId}.html?v=${Date.now()}`);
                        if (response.ok) {
                            const content = await response.text();
                            // Check if the content is empty
                            if (content.trim() === '') {
                                console.warn(`ModuleLoader: Preloaded component '${componentId}' in ${componentPath} is empty`);
                                continue;
                            }
                            this.cache.set(componentId, content);
                            this.pendingModules.delete(componentId);
                            console.log(`ModuleLoader: Preloaded component '${componentId}' from ${componentPath}`);
                            loaded = true;
                            break;
                        }
                    } catch (pathError) {
                        // Continue to next path
                        if (this.isFileProtocol) {
                            console.warn(`ModuleLoader: Fetch failed for ${componentPath}/${componentId}.html - this is normal for file:// protocol`);
                        }
                    }
                }
                
                // If not loaded but running from file:// protocol, check if we have a fallback
                if (!loaded && this.isFileProtocol && this.fallbackComponents[componentId]) {
                    console.log(`ModuleLoader: Using fallback content for '${componentId}' after fetch failed (file:// protocol)`);
                    this.cache.set(componentId, this.fallbackComponents[componentId]);
                    this.pendingModules.delete(componentId);
                    return { success: true, fromFallback: true };
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
     */    clearCache(componentId = null) {
        if (componentId) {
            this.cache.delete(componentId);
            this.pendingModules.add(componentId);
        } else {
            this.cache.clear();
        }
    }
    
    /**
     * Create necessary sections for file:// protocol mode
     * This ensures sections work even when fetch is blocked by CORS
     */
    createFileProtocolSections() {
        if (!this.isFileProtocol) return;
        
        console.log('ModuleLoader: Creating file:// protocol fallback sections...');
        
        // Create core sections in the DOM
        const mainContent = document.querySelector('main.main-content');
        if (!mainContent) return;
        
        // Core sections that should work in file:// protocol mode
        const coreSections = ['dashboard', 'royalty-records', 'contract-management'];
        
        // Create or update sections
        coreSections.forEach(sectionId => {
            // Check if section exists
            let section = document.getElementById(sectionId);
            
            // Create if it doesn't exist
            if (!section) {
                section = document.createElement('section');
                section.id = sectionId;
                section.style.display = 'none';
                mainContent.appendChild(section);
                console.log(`ModuleLoader: Created fallback section #${sectionId} for file:// protocol`);
            }
            
            // Preload content from fallbacks
            if (this.fallbackComponents[sectionId]) {
                this.cache.set(sectionId, this.fallbackComponents[sectionId]);
                console.log(`ModuleLoader: Preloaded fallback content for #${sectionId}`);
            }
        });
        
        console.log('ModuleLoader: File:// protocol fallback sections created');
        
        // Initialize first section with content
        setTimeout(() => {
            const dashboard = document.getElementById('dashboard');
            if (dashboard && this.fallbackComponents['dashboard']) {
                dashboard.innerHTML = this.fallbackComponents['dashboard'];
                dashboard.style.display = 'block';
                console.log('ModuleLoader: Initialized dashboard section with fallback content');
            }
        }, 1000);
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
