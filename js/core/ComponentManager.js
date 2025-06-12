export class ComponentManager {
    constructor(appCore) {
        this.appCore = appCore;
        this.componentCache = new Map();
        this.componentInstances = new Map();
        this.loadingPromises = new Map();
        this.dependencies = new Map();
    }

    // Register component dependencies
    registerDependencies(componentName, deps) {
        this.dependencies.set(componentName, deps);
    }

    async loadComponent(componentName, container, options = {}) {
        // Prevent duplicate loading
        if (this.loadingPromises.has(componentName)) {
            return await this.loadingPromises.get(componentName);
        }

        const loadPromise = this.performComponentLoad(componentName, container, options);
        this.loadingPromises.set(componentName, loadPromise);

        try {
            const result = await loadPromise;
            this.loadingPromises.delete(componentName);
            return result;
        } catch (error) {
            this.loadingPromises.delete(componentName);
            throw error;
        }
    }

    async performComponentLoad(componentName, container, options) {
        try {
            // Load dependencies first
            await this.loadDependencies(componentName);

            // Load component HTML template
            const template = await this.loadTemplate(componentName, options.useCache !== false);
            
            // Render template
            container.innerHTML = template;
            container.classList.add('fade-in');

            // Load and initialize component script
            const ComponentClass = await this.loadComponentScript(componentName);
            
            let instance = null;
            if (ComponentClass) {
                instance = new ComponentClass(container, this.appCore, options);
                this.componentInstances.set(componentName, instance);
                
                if (typeof instance.initialize === 'function') {
                    await instance.initialize();
                }
            }

            // Setup component-specific event listeners
            this.setupComponentEvents(componentName, container);

            return { container, instance };
        } catch (error) {
            console.error(`Failed to load component ${componentName}:`, error);
            this.appCore.notificationManager?.show(`Failed to load ${componentName}`, 'error');
            throw error;
        }
    }

    async loadDependencies(componentName) {
        const deps = this.dependencies.get(componentName) || [];
        if (deps.length === 0) return;

        const loadPromises = deps.map(dep => {
            if (typeof dep === 'string') {
                return this.loadExternalDependency(dep);
            } else if (dep.component) {
                return this.loadComponent(dep.component, dep.container, dep.options);
            }
        });

        await Promise.all(loadPromises);
    }

    async loadExternalDependency(url) {
        // Check if already loaded
        if (document.querySelector(`script[src="${url}"], link[href="${url}"]`)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const extension = url.split('.').pop().toLowerCase();
            let element;

            if (extension === 'js') {
                element = document.createElement('script');
                element.src = url;
                element.async = true;
            } else if (extension === 'css') {
                element = document.createElement('link');
                element.rel = 'stylesheet';
                element.href = url;
            } else {
                reject(new Error(`Unsupported dependency type: ${extension}`));
                return;
            }

            element.onload = resolve;
            element.onerror = () => reject(new Error(`Failed to load: ${url}`));
            
            document.head.appendChild(element);
        });
    }

    async loadTemplate(componentName, useCache = true) {
        if (useCache && this.componentCache.has(componentName)) {
            return this.componentCache.get(componentName);
        }

        try {
            const response = await fetch(`components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Template not found: ${componentName}.html`);
            }

            const template = await response.text();
            
            if (useCache) {
                this.componentCache.set(componentName, template);
            }

            return template;
        } catch (error) {
            console.warn(`Template load failed for ${componentName}, using fallback`);
            return this.getFallbackTemplate(componentName);
        }
    }

    async loadComponentScript(componentName) {
        try {
            const module = await import(`../components/${componentName}.js`);
            return module.default || module[this.toPascalCase(componentName)];
        } catch (error) {
            console.log(`No script found for component: ${componentName}`);
            return null;
        }
    }

    setupComponentEvents(componentName, container) {
        // Component-specific event setup
        const setupMethod = `setup${this.toPascalCase(componentName)}Events`;
        if (typeof this[setupMethod] === 'function') {
            this[setupMethod](container);
        }
    }

    getFallbackTemplate(componentName) {
        return `
            <div class="component-fallback">
                <div class="fallback-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Component Unavailable</h3>
                    <p>The ${componentName} component could not be loaded.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i> Refresh Page
                    </button>
                </div>
            </div>
        `;
    }

    // Component lifecycle management
    destroyComponent(componentName) {
        const instance = this.componentInstances.get(componentName);
        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }
        this.componentInstances.delete(componentName);
    }

    // Utility methods
    toPascalCase(str) {
        return str.replace(/(^\w|-\w)/g, (match) => 
            match.replace('-', '').toUpperCase()
        );
    }

    clearCache() {
        this.componentCache.clear();
    }

    // Hot reload for development
    enableHotReload() {
        if (process.env.NODE_ENV !== 'development') return;
        
        // WebSocket connection for file watching would go here
        console.log('Hot reload enabled for development');
    }
}
