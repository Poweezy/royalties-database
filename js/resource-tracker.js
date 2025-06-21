/**
 * Resource Tracker
 * 
 * A utility for tracking and cleaning up resources like event listeners
 * and timers to prevent memory leaks and ensure proper section cleanup.
 */

class ResourceTracker {
    constructor(namespace = 'default') {
        this.namespace = namespace;
        this.eventListeners = new Map();
        this.timers = [];
        this.intervals = [];
        this.resources = new Map();
        
        console.log(`Resource tracker initialized for namespace: ${namespace}`);
    }
    
    /**
     * Track an event listener
     * @param {Element} element - DOM element to attach listener to
     * @param {string} eventType - Type of event (e.g., 'click', 'change')
     * @param {Function} handler - Event handler function
     * @return {Function} - The handler function for chaining
     */
    trackListener(element, eventType, handler) {
        if (!element || !eventType || !handler) {
            console.warn('Invalid parameters for trackListener');
            return handler;
        }
        
        element.addEventListener(eventType, handler);
        
        // Generate a unique ID for this listener
        const id = `${this.namespace}-${element.id || 'anonymous'}-${eventType}-${this.eventListeners.size}`;
        this.eventListeners.set(id, { element, eventType, handler });
        
        return handler;
    }
    
    /**
     * Track a timeout
     * @param {Function} callback - The function to execute
     * @param {number} delay - Delay in milliseconds
     * @return {number} - Timer ID
     */
    trackTimeout(callback, delay) {
        const timerId = setTimeout(() => {
            // Remove from tracked timers when it executes
            const index = this.timers.indexOf(timerId);
            if (index !== -1) {
                this.timers.splice(index, 1);
            }
            
            // Execute the callback
            callback();
        }, delay);
        
        this.timers.push(timerId);
        return timerId;
    }
    
    /**
     * Track an interval
     * @param {Function} callback - The function to execute
     * @param {number} delay - Delay between executions in milliseconds
     * @return {number} - Interval ID
     */
    trackInterval(callback, delay) {
        const intervalId = setInterval(callback, delay);
        this.intervals.push(intervalId);
        return intervalId;
    }
    
    /**
     * Track a custom resource with cleanup function
     * @param {string} id - Unique identifier for the resource
     * @param {any} resource - The resource to track
     * @param {Function} cleanupFn - Function to call when cleaning up
     */
    trackResource(id, resource, cleanupFn) {
        this.resources.set(id, { resource, cleanupFn });
    }
    
    /**
     * Clean up all tracked resources
     */
    cleanup() {
        console.log(`Cleaning up resources for namespace: ${this.namespace}`);
        
        // Clean up event listeners
        this.eventListeners.forEach(({ element, eventType, handler }) => {
            try {
                if (element) {
                    element.removeEventListener(eventType, handler);
                }
            } catch (err) {
                console.warn(`Error removing event listener: ${err}`);
            }
        });
        this.eventListeners.clear();
        
        // Clean up timers
        this.timers.forEach(timerId => {
            clearTimeout(timerId);
        });
        this.timers = [];
        
        // Clean up intervals
        this.intervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        this.intervals = [];
        
        // Clean up custom resources
        this.resources.forEach(({ resource, cleanupFn }) => {
            try {
                if (typeof cleanupFn === 'function') {
                    cleanupFn(resource);
                }
            } catch (err) {
                console.warn(`Error cleaning up resource: ${err}`);
            }
        });
        this.resources.clear();
        
        console.log(`Cleanup complete for namespace: ${this.namespace}`);
    }
    
    /**
     * Creates a wrapped function that is automatically untracked when executed
     * @param {Function} fn - Function to wrap
     * @param {string} id - ID of the event listener to remove after execution
     * @return {Function} - Wrapped function
     */
    once(fn, id) {
        return (...args) => {
            // Execute original function
            fn(...args);
            
            // Remove the event listener
            if (this.eventListeners.has(id)) {
                const { element, eventType, handler } = this.eventListeners.get(id);
                if (element) {
                    element.removeEventListener(eventType, handler);
                }
                this.eventListeners.delete(id);
            }
        };
    }
}

// Create a utility function for getting a tracker instance
function getResourceTracker(namespace = 'default') {
    if (!window._resourceTrackers) {
        window._resourceTrackers = new Map();
    }
    
    if (!window._resourceTrackers.has(namespace)) {
        window._resourceTrackers.set(namespace, new ResourceTracker(namespace));
    }
    
    return window._resourceTrackers.get(namespace);
}

// Create a global cleanup function
function cleanupResources(namespace) {
    if (!window._resourceTrackers) {
        return;
    }
    
    if (namespace) {
        // Clean up a specific namespace
        const tracker = window._resourceTrackers.get(namespace);
        if (tracker) {
            tracker.cleanup();
            window._resourceTrackers.delete(namespace);
        }
    } else {
        // Clean up all namespaces
        window._resourceTrackers.forEach(tracker => {
            tracker.cleanup();
        });
        window._resourceTrackers.clear();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { ResourceTracker, getResourceTracker, cleanupResources };
} else {
    // Make available globally
    window.ResourceTracker = ResourceTracker;
    window.getResourceTracker = getResourceTracker;
    window.cleanupResources = cleanupResources;
}