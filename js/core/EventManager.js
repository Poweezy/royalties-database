// EventManager - Core event management for Mining Royalties Manager
export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.initialized = false;
    }
    
    initialize() {
        console.log('EventManager: Initializing...');
        this.initialized = true;
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // Set up any global event listeners here
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    handleGlobalClick(event) {
        // Handle global click events
        this.emit('global:click', event);
    }
    
    handleResize(event) {
        // Handle window resize events
        this.emit('global:resize', event);
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, ...args) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`EventManager: Error in event handler for ${event}:`, error);
                }
            });
        }
    }
    
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}
