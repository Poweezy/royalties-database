export class AppCore {
    constructor() {
        this.dataManager = null;
        this.authManager = null;
        this.notificationManager = null;
        this.eventManager = null;
        this.componentLoader = null;
        this.isInitialized = false;
        this.currentSection = 'dashboard';
        this.charts = new Map();
        this.activeListeners = new Map();
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize core managers
            await this.initializeManagers();
            
            // Setup global error handling
            this.setupGlobalErrorHandling();
            
            // Register service worker
            await this.registerServiceWorker();
            
            this.isInitialized = true;
            console.log('AppCore initialized successfully');
        } catch (error) {
            console.error('AppCore initialization failed:', error);
            throw error;
        }
    }

    async initializeManagers() {
        // Import managers dynamically to reduce initial bundle size
        const { DataManager } = await import('./DataManager.js');
        const { AuthManager } = await import('./AuthManager.js');
        const { NotificationManager } = await import('./NotificationManager.js');
        const { EventManager } = await import('./EventManager.js');
        const { ComponentLoader } = await import('../utils/ComponentLoader.js');

        this.dataManager = new DataManager();
        this.authManager = new AuthManager();
        this.notificationManager = new NotificationManager();
        this.eventManager = new EventManager();
        this.componentLoader = new ComponentLoader();

        // Initialize data
        this.dataManager.initialize();

        // Make globally available
        window.appCore = this;
        window.dataManager = this.dataManager;
        window.notificationManager = this.notificationManager;
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }

    handleGlobalError(event) {
        console.error('Global error:', event.error);
        this.notificationManager?.show('An unexpected error occurred', 'error');
        
        // Log error for analytics
        this.logError('javascript-error', event.error, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }

    handleUnhandledRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        this.notificationManager?.show('System error - please refresh the page', 'error');
        
        // Log error for analytics
        this.logError('promise-rejection', event.reason);
        event.preventDefault();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    logError(type, error, metadata = {}) {
        const errorData = {
            type,
            message: error?.message || String(error),
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata
        };

        // Send to logging service (implement as needed)
        console.log('Error logged:', errorData);
    }

    // Chart management
    createChart(canvasId, config) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available');
            return null;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas ${canvasId} not found`);
            return null;
        }

        // Destroy existing chart
        this.destroyChart(canvasId);

        try {
            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);
            return chart;
        } catch (error) {
            console.error(`Error creating chart ${canvasId}:`, error);
            return null;
        }
    }

    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            try {
                chart.destroy();
            } catch (error) {
                console.warn(`Error destroying chart ${canvasId}:`, error);
            }
            this.charts.delete(canvasId);
        }
    }

    destroyAllCharts() {
        this.charts.forEach((chart, id) => this.destroyChart(id));
    }

    // Event management
    addEventListener(element, event, handler, options = {}) {
        const key = `${element?.id || 'unknown'}_${event}`;
        
        if (!this.activeListeners.has(key)) {
            this.activeListeners.set(key, []);
        }
        
        this.activeListeners.get(key).push({ element, handler, options });
        element?.addEventListener(event, handler, options);
    }

    removeEventListener(element, event, handler) {
        const key = `${element?.id || 'unknown'}_${event}`;
        const listeners = this.activeListeners.get(key);
        
        if (listeners) {
            const index = listeners.findIndex(l => l.handler === handler);
            if (index > -1) {
                listeners.splice(index, 1);
                element?.removeEventListener(event, handler);
            }
        }
    }

    cleanup() {
        // Cleanup event listeners
        this.activeListeners.forEach((listeners) => {
            listeners.forEach(({ element, event, handler }) => {
                element?.removeEventListener(event, handler);
            });
        });
        this.activeListeners.clear();

        // Cleanup charts
        this.destroyAllCharts();

        // Cleanup managers
        this.eventManager?.cleanup();
        this.componentLoader?.clearCache();
        
        this.isInitialized = false;
    }
}
