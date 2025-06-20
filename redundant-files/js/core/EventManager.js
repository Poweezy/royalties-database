export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
    }

    on(element, eventType, handler, options = {}) {
        const key = `${element}_${eventType}`;
        
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        this.listeners.get(key).push({ handler, options });
        element.addEventListener(eventType, handler, options);
    }

    off(element, eventType, handler) {
        const key = `${element}_${eventType}`;
        const listeners = this.listeners.get(key);
        
        if (listeners) {
            const index = listeners.findIndex(l => l.handler === handler);
            if (index > -1) {
                listeners.splice(index, 1);
                element.removeEventListener(eventType, handler);
            }
        }
    }

    cleanup() {
        this.listeners.forEach((listeners, key) => {
            const [elementId, eventType] = key.split('_');
            const element = document.getElementById(elementId) || document;
            
            listeners.forEach(({ handler }) => {
                element.removeEventListener(eventType, handler);
            });
        });
        
        this.listeners.clear();
        this.onceListeners.clear();
    }

    delegate(parentElement, selector, eventType, handler) {
        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        };
        
        this.on(parentElement, eventType, delegatedHandler);
        return delegatedHandler;
    }
}
