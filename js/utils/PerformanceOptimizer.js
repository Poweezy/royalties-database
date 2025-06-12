export class PerformanceOptimizer {
    constructor() {
        this.observers = new Map();
        this.lazyImages = new Set();
        this.deferredTasks = [];
        this.isIdleCallbackSupported = 'requestIdleCallback' in window;
    }

    // Intersection Observer for lazy loading
    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported');
            return;
        }

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                        this.lazyImages.delete(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        this.observers.set('images', imageObserver);
    }

    // Lazy load components
    setupComponentLazyLoading() {
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const componentName = element.dataset.component;
                    
                    if (componentName) {
                        this.loadComponent(componentName, element);
                        componentObserver.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        this.observers.set('components', componentObserver);
    }

    // Virtual scrolling for large datasets
    setupVirtualScrolling(container, itemHeight, renderItem) {
        let scrollTop = 0;
        let viewHeight = container.clientHeight;
        let totalItems = 0;
        let visibleStart = 0;
        let visibleEnd = 0;

        const updateVisibleRange = () => {
            const itemsInView = Math.ceil(viewHeight / itemHeight);
            const buffer = Math.ceil(itemsInView * 0.5);
            
            visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
            visibleEnd = Math.min(totalItems, visibleStart + itemsInView + (buffer * 2));
        };

        const render = (items) => {
            totalItems = items.length;
            updateVisibleRange();
            
            const fragment = document.createDocumentFragment();
            
            for (let i = visibleStart; i < visibleEnd; i++) {
                if (items[i]) {
                    const element = renderItem(items[i], i);
                    element.style.position = 'absolute';
                    element.style.top = `${i * itemHeight}px`;
                    fragment.appendChild(element);
                }
            }
            
            container.innerHTML = '';
            container.appendChild(fragment);
            container.style.height = `${totalItems * itemHeight}px`;
        };

        const throttledScroll = this.throttle(() => {
            scrollTop = container.scrollTop;
            updateVisibleRange();
        }, 16);

        container.addEventListener('scroll', throttledScroll);
        
        return { render, updateVisibleRange };
    }

    // Memory management
    cleanupObservers() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.lazyImages.clear();
    }

    // Defer non-critical tasks
    deferTask(task, priority = 'low') {
        const deferredTask = {
            task,
            priority,
            timestamp: Date.now()
        };

        this.deferredTasks.push(deferredTask);
        this.processDeferredTasks();
    }

    processDeferredTasks() {
        if (this.isIdleCallbackSupported) {
            requestIdleCallback((deadline) => {
                while (deadline.timeRemaining() > 0 && this.deferredTasks.length > 0) {
                    const task = this.deferredTasks.shift();
                    try {
                        task.task();
                    } catch (error) {
                        console.error('Deferred task error:', error);
                    }
                }
                
                if (this.deferredTasks.length > 0) {
                    this.processDeferredTasks();
                }
            });
        } else {
            setTimeout(() => {
                const task = this.deferredTasks.shift();
                if (task) {
                    try {
                        task.task();
                    } catch (error) {
                        console.error('Deferred task error:', error);
                    }
                    if (this.deferredTasks.length > 0) {
                        this.processDeferredTasks();
                    }
                }
            }, 0);
        }
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const startTime = performance.now();
        
        const result = fn();
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 16) { // 60fps threshold
            console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
    }

    // Resource hints
    preloadResource(url, type = 'fetch') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        
        switch (type) {
            case 'script':
                link.as = 'script';
                break;
            case 'style':
                link.as = 'style';
                break;
            case 'image':
                link.as = 'image';
                break;
            default:
                link.as = 'fetch';
                link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
    }

    // Bundle splitting helper
    loadModuleAsync(modulePath) {
        return import(modulePath).catch(error => {
            console.error(`Failed to load module: ${modulePath}`, error);
            throw error;
        });
    }

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Debounce function
    debounce(func, wait, immediate = false) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Progressive enhancement
    enhanceComponent(element, enhancement) {
        if (element.dataset.enhanced === 'true') {
            return;
        }
        
        try {
            enhancement(element);
            element.dataset.enhanced = 'true';
        } catch (error) {
            console.error('Enhancement failed:', error);
        }
    }

    // Critical CSS injection
    injectCriticalCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.insertBefore(style, document.head.firstChild);
    }

    // Resource loading optimization
    optimizeResources() {
        // Preconnect to external domains
        const domains = [
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });

        // Prefetch likely navigation targets
        const prefetchLinks = [
            '/components/user-management.html',
            '/components/royalty-records.html',
            '/components/audit-dashboard.html'
        ];

        prefetchLinks.forEach(url => {
            this.preloadResource(url, 'fetch');
        });
    }

    // Initialize all optimizations
    initialize() {
        this.setupLazyLoading();
        this.setupComponentLazyLoading();
        this.optimizeResources();
        
        // Setup performance monitoring
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            console.log('Navigation timing:', {
                                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                                loadComplete: entry.loadEventEnd - entry.loadEventStart
                            });
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });
            } catch (error) {
                console.warn('Performance monitoring setup failed:', error);
            }
        }
    }
}
