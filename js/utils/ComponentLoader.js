export class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    async loadComponent(componentName, target, useCache = true) {
        if (useCache && this.cache.has(componentName)) {
            target.innerHTML = this.cache.get(componentName);
            return true;
        }

        // Prevent duplicate loading
        if (this.loadingPromises.has(componentName)) {
            const html = await this.loadingPromises.get(componentName);
            target.innerHTML = html;
            return true;
        }

        const loadPromise = this.fetchComponent(componentName);
        this.loadingPromises.set(componentName, loadPromise);

        try {
            const html = await loadPromise;
            if (useCache) {
                this.cache.set(componentName, html);
            }
            target.innerHTML = html;
            return true;
        } catch (error) {
            console.error(`Failed to load component ${componentName}:`, error);
            return false;
        } finally {
            this.loadingPromises.delete(componentName);
        }
    }

    async fetchComponent(componentName) {
        const response = await fetch(`components/${componentName}.html`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
    }

    clearCache() {
        this.cache.clear();
    }

    preloadComponents(componentNames) {
        return Promise.allSettled(
            componentNames.map(name => this.fetchComponent(name))
        );
    }
}
