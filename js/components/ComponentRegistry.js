// Component Registry for managing all components
export class ComponentRegistry {
    constructor() {
        this.components = new Map();
        this.factories = new Map();
        this.instances = new Map();
        this.lifecycleHooks = new Map();
    }

    // Register component factory
    register(name, factory) {
        this.factories.set(name, factory);
    }

    // Create component instance
    create(name, container, options = {}) {
        const factory = this.factories.get(name);
        if (!factory) {
            throw new Error(`Component '${name}' not registered`);
        }

        // Execute beforeCreate hook
        this.executeHook('beforeCreate', name, { container, options });

        const instance = factory(container, options);
        const instanceId = this.generateInstanceId(name);
        this.instances.set(instanceId, instance);
        
        // Execute afterCreate hook
        this.executeHook('afterCreate', name, { instance, instanceId });
        
        return { instance, instanceId };
    }

    // Get component instance
    get(instanceId) {
        return this.instances.get(instanceId);
    }

    // Destroy component instance
    destroy(instanceId) {
        const instance = this.instances.get(instanceId);
        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }
        this.instances.delete(instanceId);
    }

    // Destroy all instances
    destroyAll() {
        this.instances.forEach((instance, id) => {
            this.destroy(id);
        });
    }

    generateInstanceId(name) {
        return `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Component lifecycle management
    beforeCreate(name, callback) {
        if (!this.lifecycleHooks.has('beforeCreate')) {
            this.lifecycleHooks.set('beforeCreate', new Map());
        }
        this.lifecycleHooks.get('beforeCreate').set(name, callback);
    }

    afterCreate(name, callback) {
        if (!this.lifecycleHooks.has('afterCreate')) {
            this.lifecycleHooks.set('afterCreate', new Map());
        }
        this.lifecycleHooks.get('afterCreate').set(name, callback);
    }

    executeHook(hookName, componentName, data) {
        const hooks = this.lifecycleHooks.get(hookName);
        if (hooks && hooks.has(componentName)) {
            const callback = hooks.get(componentName);
            callback(data);
        }
    }

    // Batch operations
    createBatch(components) {
        const results = [];
        components.forEach(({ name, container, options }) => {
            try {
                const result = this.create(name, container, options);
                results.push({ success: true, ...result });
            } catch (error) {
                results.push({ success: false, error: error.message, name });
            }
        });
        return results;
    }

    // Component dependency management
    registerDependency(componentName, dependencies) {
        if (!this.components.has(componentName)) {
            this.components.set(componentName, { dependencies: [] });
        }
        this.components.get(componentName).dependencies = dependencies;
    }

    // Auto-register common components
    autoRegister() {
        // Register Modal component
        this.register('modal', (container, options) => {
            return new Modal(options);
        });

        // Register DataTable component
        this.register('dataTable', (container, options) => {
            return new DataTable(container, options);
        });

        // Register FormBuilder component
        this.register('form', (container, options) => {
            return new FormBuilder(container, options);
        });

        // Register ChartManager component
        this.register('chart', (container, options) => {
            const chartManager = new ChartManager();
            return chartManager;
        });
    }
}
