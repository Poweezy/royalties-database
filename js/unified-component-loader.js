/**
 * Unified Component Loader - Single Solution for All Component Loading
 * @version 2.1.0
 * @date 2025-06-26
 * @description Replaces all existing component loading systems with a single, reliable solution
 */

(function() {
    'use strict';
    
    console.log('=== UNIFIED COMPONENT LOADER: INITIALIZING ===');
    
    // IMMEDIATELY DISABLE OTHER LOADERS TO PREVENT CONFLICTS
    if (window.moduleLoader) {
        console.log('UnifiedComponentLoader: Disabling existing ModuleLoader immediately');
        window.moduleLoader._disabled = true;
        window.moduleLoader.loadComponent = function() {
            console.warn('ModuleLoader disabled - use UnifiedComponentLoader instead');
            return Promise.resolve({ success: false, error: 'Disabled' });
        };
    }
    
    // Block module-loader.js from loading
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        if (tagName.toLowerCase() === 'script' && element.src && element.src.includes('module-loader.js')) {
            console.log('UnifiedComponentLoader: Blocked module-loader.js from loading');
            element.src = 'about:blank'; // Prevent loading
        }
        return element;
    };
    
    // Configuration
    const CONFIG = {
        componentPaths: [
            'components',
            'html/components',
            'templates'
        ],
        cacheEnabled: true,
        cacheBustingEnabled: true,
        fallbackEnabled: true,
        timeout: 10000,
        retryAttempts: 2,
        debugMode: true
    };
    
    // Component loading state
    const STATE = {
        cache: new Map(),
        loadingPromises: new Map(),
        failedPaths: new Map(),
        successfulPaths: new Map(),
        initialized: false,
        isFileProtocol: window.location.protocol === 'file:'
    };
    
    // Fallback content for critical components
    const FALLBACKS = {
        'sidebar': `
            <div class="sidebar-header">
                <div class="sidebar-logo" aria-label="Mining Royalties Manager Logo">MR</div>
                <h2>Royalties Manager</h2>
            </div>
            <nav>
                <ul>
                    <li><a href="#dashboard" class="nav-link active" data-section="dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                    <li><a href="#user-management" class="nav-link" data-section="user-management"><i class="fas fa-users"></i> User Management</a></li>
                    <li><a href="#royalty-records" class="nav-link" data-section="royalty-records"><i class="fas fa-file-invoice-dollar"></i> Royalty Records</a></li>
                    <li><a href="#contract-management" class="nav-link" data-section="contract-management"><i class="fas fa-file-contract"></i> Contract Management</a></li>
                    <li><a href="#reporting-analytics" class="nav-link" data-section="reporting-analytics"><i class="fas fa-chart-bar"></i> Reports & Analytics</a></li>
                    <li><a href="#communication" class="nav-link" data-section="communication"><i class="fas fa-comments"></i> Communication</a></li>
                    <li><a href="#notifications" class="nav-link" data-section="notifications"><i class="fas fa-bell"></i> Notifications</a></li>
                    <li><a href="#compliance" class="nav-link" data-section="compliance"><i class="fas fa-shield-alt"></i> Compliance</a></li>
                    <li><a href="#regulatory-management" class="nav-link" data-section="regulatory-management"><i class="fas fa-gavel"></i> Regulatory Management</a></li>
                    <li><a href="#profile" class="nav-link" data-section="profile"><i class="fas fa-user"></i> Profile</a></li>
                </ul>
            </nav>
        `,
        'dashboard': null, // Use dynamic content from app instead of static fallback
        'user-management': `
            <div class="user-management-container">
                <div class="page-header">
                    <h1><i class="fas fa-users"></i> User Management</h1>
                    <p>Manage system users and permissions</p>
                </div>
                <div class="content-placeholder">
                    <p>User management functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'royalty-records': `
            <div class="royalty-records-container">
                <div class="page-header">
                    <h1><i class="fas fa-file-invoice-dollar"></i> Royalty Records</h1>
                    <p>View and manage royalty payment records</p>
                </div>
                <div class="content-placeholder">
                    <p>Royalty records functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'contract-management': `
            <div class="contract-management-container">
                <div class="page-header">
                    <h1><i class="fas fa-file-contract"></i> Contract Management</h1>
                    <p>Manage mining contracts and agreements</p>
                </div>
                <div class="content-placeholder">
                    <p>Contract management functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'reporting-analytics': `
            <div class="reporting-analytics-container">
                <div class="page-header">
                    <h1><i class="fas fa-chart-bar"></i> Reports & Analytics</h1>
                    <p>Generate reports and analyze royalty data</p>
                </div>
                <div class="content-placeholder">
                    <p>Reporting and analytics functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'communication': `
            <div class="communication-container">
                <div class="page-header">
                    <h1><i class="fas fa-comments"></i> Communication</h1>
                    <p>Communication tools and messaging</p>
                </div>
                <div class="content-placeholder">
                    <p>Communication functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'notifications': `
            <div class="notifications-container">
                <div class="page-header">
                    <h1><i class="fas fa-bell"></i> Notifications</h1>
                    <p>System notifications and alerts</p>
                </div>
                <div class="content-placeholder">
                    <p>Notifications functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'compliance': `
            <div class="compliance-container">
                <div class="page-header">
                    <h1><i class="fas fa-shield-alt"></i> Compliance</h1>
                    <p>Regulatory compliance management</p>
                </div>
                <div class="content-placeholder">
                    <p>Compliance functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'regulatory-management': `
            <div class="regulatory-management-container">
                <div class="page-header">
                    <h1><i class="fas fa-gavel"></i> Regulatory Management</h1>
                    <p>Manage regulatory requirements and submissions</p>
                </div>
                <div class="content-placeholder">
                    <p>Regulatory management functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'profile': `
            <div class="profile-container">
                <div class="page-header">
                    <h1><i class="fas fa-user"></i> Profile</h1>
                    <p>User profile and settings</p>
                </div>
                <div class="content-placeholder">
                    <p>Profile functionality will be loaded here.</p>
                </div>
            </div>
        `,
        'sidebar': `
            <div class="sidebar-container">
                <nav class="sidebar-nav">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a href="#dashboard" class="nav-link active" data-section="dashboard">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#user-management" class="nav-link" data-section="user-management">
                                <i class="fas fa-users"></i> User Management
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#royalty-records" class="nav-link" data-section="royalty-records">
                                <i class="fas fa-file-invoice-dollar"></i> Royalty Records
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#contract-management" class="nav-link" data-section="contract-management">
                                <i class="fas fa-file-contract"></i> Contract Management
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `
    };
    
    /**
     * Unified Component Loader Class
     */
    class UnifiedComponentLoader {
        constructor() {
            this.config = CONFIG;
            this.state = STATE;
            this.fallbacks = FALLBACKS;
        }
        
        /**
         * Initialize the component loader
         */
        initialize() {
            if (this.state.initialized) return;
            
            console.log('UnifiedComponentLoader: Initializing...');
            
            // Disable all other component loaders
            this.disableOtherLoaders();
            
            // Set up global methods
            this.setupGlobalMethods();
            
            this.state.initialized = true;
            console.log('UnifiedComponentLoader: Initialization complete');
        }
        
        /**
         * Disable other component loading systems
         */
        disableOtherLoaders() {
            // Store references but disable functionality
            if (window.moduleLoader) {
                console.log('UnifiedComponentLoader: Disabling existing ModuleLoader');
                window.moduleLoader._disabled = true;
            }
            
            // Clear any existing caches
            if (window.moduleLoader && window.moduleLoader.cache) {
                console.log('UnifiedComponentLoader: Migrating existing cache');
                window.moduleLoader.cache.forEach((value, key) => {
                    this.state.cache.set(key, value);
                });
            }
        }
        
        /**
         * Set up global methods for backward compatibility
         */
        setupGlobalMethods() {
            // Replace ModuleLoader methods
            if (window.moduleLoader) {
                const originalLoadComponent = window.moduleLoader.loadComponent;
                window.moduleLoader.loadComponent = (componentId, container) => {
                    return this.loadComponent(componentId, container);
                };
            }
            
            // Add global component loading function
            window.loadComponent = (componentId, containerId) => {
                const container = typeof containerId === 'string' ? 
                    document.getElementById(containerId) : containerId;
                return this.loadComponent(componentId, container);
            };
        }
        
        /**
         * Load a component into a container
         * @param {string} componentId - Component identifier
         * @param {HTMLElement|string} container - Container element or ID
         * @returns {Promise<Object>} - Result object with success status
         */
        async loadComponent(componentId, container) {
            try {
                // Resolve container
                const targetContainer = typeof container === 'string' ? 
                    document.getElementById(container) : container;
                
                if (!targetContainer) {
                    throw new Error(`Container not found: ${container}`);
                }
                
                console.log(`UnifiedComponentLoader: Loading component '${componentId}'`);
                
                // Check if already loading
                if (this.state.loadingPromises.has(componentId)) {
                    const result = await this.state.loadingPromises.get(componentId);
                    targetContainer.innerHTML = result.content;
                    return { success: true, content: result.content, cached: true };
                }
                
                // Start loading process
                const loadPromise = this.performLoad(componentId);
                this.state.loadingPromises.set(componentId, loadPromise);
                
                try {
                    const result = await loadPromise;
                    
                    // Handle dynamic dashboard content specially
                    if (componentId === 'dashboard' && result.source === 'app-dynamic') {
                        console.log(`UnifiedComponentLoader: Loading dynamic dashboard content`);
                        // Use the app's dashboard loading method directly
                        if (window.royaltiesApp && typeof window.royaltiesApp.loadDashboardContent === 'function') {
                            await window.royaltiesApp.loadDashboardContent(targetContainer);
                        }
                    } else {
                        // Insert content into container normally
                        targetContainer.innerHTML = result.content;
                    }
                    
                    // Execute any scripts in the loaded content
                    this.executeScripts(targetContainer);
                    
                    // Trigger component loaded event
                    this.dispatchComponentEvent('componentLoaded', componentId, targetContainer);
                    
                    console.log(`UnifiedComponentLoader: Successfully loaded '${componentId}'`);
                    return { success: true, content: result.content, source: result.source };
                    
                } finally {
                    this.state.loadingPromises.delete(componentId);
                }
                
            } catch (error) {
                console.error(`UnifiedComponentLoader: Failed to load '${componentId}':`, error);
                
                // Try fallback
                const fallbackResult = this.loadFallback(componentId, container);
                if (fallbackResult.success) {
                    return fallbackResult;
                }
                
                return { success: false, error: error.message };
            }
        }
        
        /**
         * Perform the actual component loading
         * @param {string} componentId - Component identifier
         * @returns {Promise<Object>} - Content and source information
         */
        async performLoad(componentId) {
            // Check cache first
            if (this.config.cacheEnabled && this.state.cache.has(componentId)) {
                console.log(`UnifiedComponentLoader: Loading '${componentId}' from cache`);
                return {
                    content: this.state.cache.get(componentId),
                    source: 'cache'
                };
            }
            
            // For file:// protocol, try fallback first, but handle dashboard specially
            if (this.state.isFileProtocol) {
                // For dashboard, prefer app dynamic content over static fallback
                if (componentId === 'dashboard' && window.royaltiesApp && typeof window.royaltiesApp.loadDashboardContent === 'function') {
                    console.log(`UnifiedComponentLoader: Using app dynamic content for dashboard (file:// protocol)`);
                    return { content: 'DYNAMIC_DASHBOARD_CONTENT', source: 'app-dynamic' };
                } else if (this.fallbacks[componentId]) {
                    console.log(`UnifiedComponentLoader: Using fallback for '${componentId}' (file:// protocol)`);
                    const content = this.fallbacks[componentId];
                    this.state.cache.set(componentId, content);
                    return { content, source: 'fallback' };
                }
            }
            
            // Try to load from each path
            for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
                for (const path of this.config.componentPaths) {
                    try {
                        const url = this.buildComponentUrl(path, componentId);
                        console.log(`UnifiedComponentLoader: Trying ${url} (attempt ${attempt + 1})`);
                        
                        const response = await this.fetchWithTimeout(url);
                        
                        if (response.ok) {
                            const content = await response.text();
                            
                            // Validate content
                            if (content.trim() === '') {
                                console.warn(`UnifiedComponentLoader: Empty content from ${url}`);
                                continue;
                            }
                            
                            // Cache successful result
                            if (this.config.cacheEnabled) {
                                this.state.cache.set(componentId, content);
                            }
                            
                            // Remember successful path
                            this.state.successfulPaths.set(componentId, path);
                            
                            console.log(`UnifiedComponentLoader: Successfully loaded '${componentId}' from ${path}`);
                            return { content, source: path };
                        }
                        
                    } catch (error) {
                        console.warn(`UnifiedComponentLoader: Failed to load from ${path}:`, error.message);
                        this.state.failedPaths.set(`${path}/${componentId}`, error.message);
                    }
                }
                
                // Wait before retry
                if (attempt < this.config.retryAttempts - 1) {
                    await this.delay(1000 * (attempt + 1));
                }
            }
            
            throw new Error(`Component '${componentId}' not found in any path after ${this.config.retryAttempts} attempts`);
        }
        
        /**
         * Build component URL with cache busting if enabled
         * @param {string} path - Base path
         * @param {string} componentId - Component identifier
         * @returns {string} - Complete URL
         */
        buildComponentUrl(path, componentId) {
            let url = `${path}/${componentId}.html`;
            
            if (this.config.cacheBustingEnabled) {
                url += `?v=${Date.now()}`;
            }
            
            return url;
        }
        
        /**
         * Fetch with timeout
         * @param {string} url - URL to fetch
         * @returns {Promise<Response>} - Fetch response
         */
        async fetchWithTimeout(url) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            
            try {
                const response = await fetch(url, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
        
        /**
         * Load fallback content
         * @param {string} componentId - Component identifier
         * @param {HTMLElement} container - Target container
         * @returns {Object} - Result object
         */
        loadFallback(componentId, container) {
            // Special handling for dashboard - use app's dynamic content
            if (componentId === 'dashboard' && window.royaltiesApp && typeof window.royaltiesApp.loadDashboardContent === 'function') {
                console.log(`UnifiedComponentLoader: Using app's dynamic dashboard content for '${componentId}'`);
                
                const targetContainer = typeof container === 'string' ? 
                    document.getElementById(container) : container;
                
                if (targetContainer) {
                    // Use the app's dashboard loading method
                    try {
                        window.royaltiesApp.loadDashboardContent(targetContainer);
                        this.dispatchComponentEvent('componentDynamicLoaded', componentId, targetContainer);
                        
                        return { 
                            success: true, 
                            content: 'Dynamic dashboard content loaded', 
                            source: 'app-dynamic' 
                        };
                    } catch (error) {
                        console.error('Failed to load dynamic dashboard content:', error);
                        // Fall through to normal fallback logic
                    }
                }
            }
            
            if (this.fallbacks[componentId]) {
                console.log(`UnifiedComponentLoader: Loading fallback for '${componentId}'`);
                
                const targetContainer = typeof container === 'string' ? 
                    document.getElementById(container) : container;
                
                if (targetContainer) {
                    targetContainer.innerHTML = this.fallbacks[componentId];
                    this.executeScripts(targetContainer);
                    this.dispatchComponentEvent('componentFallbackLoaded', componentId, targetContainer);
                }
                
                return { 
                    success: true, 
                    content: this.fallbacks[componentId], 
                    source: 'fallback' 
                };
            }
            
            return { success: false, error: 'No fallback available' };
        }
        
        /**
         * Execute scripts in loaded content
         * @param {HTMLElement} container - Container with scripts
         */
        executeScripts(container) {
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                try {
                    const newScript = document.createElement('script');
                    
                    // Copy attributes
                    Array.from(script.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    
                    // Copy content
                    newScript.textContent = script.textContent;
                    
                    // Replace old script with new one
                    script.parentNode.replaceChild(newScript, script);
                } catch (error) {
                    console.warn('UnifiedComponentLoader: Failed to execute script:', error);
                }
            });
        }
        
        /**
         * Dispatch component event
         * @param {string} eventType - Event type
         * @param {string} componentId - Component identifier
         * @param {HTMLElement} container - Target container
         */
        dispatchComponentEvent(eventType, componentId, container) {
            const event = new CustomEvent(eventType, {
                detail: { componentId, container }
            });
            document.dispatchEvent(event);
        }
        
        /**
         * Preload a component
         * @param {string} componentId - Component identifier
         * @returns {Promise<Object>} - Result object
         */
        async preloadComponent(componentId) {
            try {
                const result = await this.performLoad(componentId);
                console.log(`UnifiedComponentLoader: Preloaded '${componentId}'`);
                return { success: true, source: result.source };
            } catch (error) {
                console.warn(`UnifiedComponentLoader: Failed to preload '${componentId}':`, error);
                return { success: false, error: error.message };
            }
        }
        
        /**
         * Clear cache
         * @param {string} componentId - Optional specific component to clear
         */
        clearCache(componentId = null) {
            if (componentId) {
                this.state.cache.delete(componentId);
                console.log(`UnifiedComponentLoader: Cleared cache for '${componentId}'`);
            } else {
                this.state.cache.clear();
                console.log('UnifiedComponentLoader: Cleared all cache');
            }
        }
        
        /**
         * Get cache statistics
         * @returns {Object} - Cache statistics
         */
        getCacheStats() {
            return {
                cached: this.state.cache.size,
                loading: this.state.loadingPromises.size,
                failed: this.state.failedPaths.size,
                successful: this.state.successfulPaths.size
            };
        }
        
        /**
         * Utility delay function
         * @param {number} ms - Milliseconds to delay
         * @returns {Promise} - Delay promise
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }
    
    // Create and initialize the unified component loader
    const unifiedLoader = new UnifiedComponentLoader();
    unifiedLoader.initialize();
    
    // Make it globally available
    window.unifiedComponentLoader = unifiedLoader;
    
    // Also replace the moduleLoader reference
    if (window.moduleLoader) {
        // Keep the old one for compatibility but redirect main methods
        window.moduleLoader._unified = unifiedLoader;
        window.moduleLoader.loadComponent = (componentId, container) => {
            return unifiedLoader.loadComponent(componentId, container);
        };
        window.moduleLoader.preloadComponent = (componentId) => {
            return unifiedLoader.preloadComponent(componentId);
        };
    }
    
    console.log('=== UNIFIED COMPONENT LOADER: READY ===');
    
})();
