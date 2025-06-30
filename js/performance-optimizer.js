/**
 * Performance Optimization Module for Mining Royalties Manager
 * Implements advanced performance optimizations, caching, and monitoring
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.componentCache = new Map();
        this.debounceTimers = new Map();
        this.observedElements = new Set();
        this.performanceMetrics = new Map();
        this.lazyLoadQueue = [];
        this.criticalResourcesLoaded = false;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        console.log('⚡ Initializing Performance Optimizations...');

        try {
            // Initialize core optimizations
            this.setupLazyLoading();
            this.setupImageOptimization();
            this.setupComponentCaching();
            this.setupDebouncedOperations();
            this.setupIntersectionObserver();
            this.setupPerformanceMonitoring();
            this.setupPreloading();
            this.setupServiceWorkerIntegration();
            
            // Optimize existing elements
            this.optimizeExistingElements();
            
            // Set up virtual scrolling for large datasets
            this.setupVirtualScrolling();
            
            this.initialized = true;
            console.log('✅ Performance optimizations initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize performance optimizations:', error);
        }
    }

    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, loading all elements immediately');
            // Fallback for older browsers
            document.querySelectorAll('[data-lazy]').forEach(el => {
                this.loadLazyElement(el);
            });
            return;
        }

        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Observe all lazy elements
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(el => {
            lazyObserver.observe(el);
        });

        // Set up lazy loading for charts
        this.setupLazyChartLoading();
        
        console.log(`⚡ Performance: Set up lazy loading for ${lazyElements.length} elements`);
    }

    setupLazyChartLoading() {
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.chartLoaded) {
                    this.loadChartLazily(entry.target);
                    entry.target.dataset.chartLoaded = 'true';
                    chartObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('.chart-container:not([data-chart-loaded])').forEach(container => {
            chartObserver.observe(container);
        });
    }

    loadLazyElement(element) {
        const lazyType = element.dataset.lazy;
        
        switch (lazyType) {
            case 'image':
                this.loadLazyImage(element);
                break;
            case 'component':
                this.loadLazyComponent(element);
                break;
            case 'chart':
                this.loadChartLazily(element);
                break;
            case 'table':
                this.loadLazyTable(element);
                break;
        }
    }

    loadLazyImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.onload = () => {
                img.classList.add('loaded');
            };
            img.src = src;
            img.removeAttribute('data-src');
        }
    }

    loadLazyComponent(element) {
        const componentName = element.dataset.component;
        if (componentName && window.unifiedComponentLoader) {
            window.unifiedComponentLoader.loadComponent(componentName, element)
                .then(() => {
                    element.classList.add('loaded');
                });
        }
    }

    async loadChartLazily(container) {
        const chartType = container.dataset.chartType;
        const chartId = container.id;
        
        if (!chartType || !chartId) return;

        // Show loading skeleton
        container.innerHTML = this.createChartSkeleton();
        
        // Simulate loading delay for smooth UX
        await this.delay(300);
        
        // Initialize chart based on type
        if (window.chartManager && window.chartManager.createChart) {
            try {
                await window.chartManager.createChart(chartId, chartType);
                container.classList.add('chart-loaded');
            } catch (error) {
                console.warn(`Failed to load chart ${chartId}:`, error);
                container.innerHTML = this.createChartErrorState();
            }
        }
    }

    createChartSkeleton() {
        return `
            <div class="chart-skeleton">
                <div class="skeleton-line" style="width: 100%; height: 20px; margin-bottom: 15px;"></div>
                <div class="skeleton-line" style="width: 80%; height: 15px; margin-bottom: 10px;"></div>
                <div class="skeleton-chart" style="width: 100%; height: 200px; border-radius: 8px;"></div>
            </div>
        `;
    }

    createChartErrorState() {
        return `
            <div class="chart-error-state">
                <i class="fas fa-chart-bar" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p style="color: #666; margin: 0;">Chart temporarily unavailable</p>
            </div>
        `;
    }

    setupImageOptimization() {
        // Add progressive image enhancement
        const style = document.createElement('style');
        style.textContent = `
            img[data-src] {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                min-height: 100px;
            }
            
            img.loaded {
                animation: fadeIn 0.3s ease-in;
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            .chart-skeleton .skeleton-line,
            .chart-skeleton .skeleton-chart {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }
            
            .chart-error-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px dashed #dee2e6;
            }
        `;
        document.head.appendChild(style);

        // Implement responsive images
        this.setupResponsiveImages();
    }

    setupResponsiveImages() {
        document.querySelectorAll('img').forEach(img => {
            if (!img.dataset.optimized) {
                this.optimizeImage(img);
                img.dataset.optimized = 'true';
            }
        });
    }

    optimizeImage(img) {
        // Add loading attribute for modern browsers
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }

        // Add error handling
        img.addEventListener('error', () => {
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
        });
    }

    setupComponentCaching() {
        this.componentCache = new Map();
        
        // Cache frequently accessed components
        const componentsToCache = [
            'dashboard', 'user-management', 'sidebar', 'notifications'
        ];

        componentsToCache.forEach(componentName => {
            this.preloadComponent(componentName);
        });
    }

    async preloadComponent(componentName) {
        if (this.componentCache.has(componentName)) return;

        try {
            const response = await fetch(`components/${componentName}.html`);
            if (response.ok) {
                const content = await response.text();
                this.componentCache.set(componentName, content);
                console.log(`📦 Cached component: ${componentName}`);
            }
        } catch (error) {
            console.warn(`Failed to preload component ${componentName}:`, error);
        }
    }

    getCachedComponent(componentName) {
        return this.componentCache.get(componentName);
    }

    setupDebouncedOperations() {
        // Debounced search
        this.createDebouncedFunction('search', (query) => {
            this.performSearch(query);
        }, 300);

        // Debounced resize handler
        this.createDebouncedFunction('resize', () => {
            this.handleResize();
        }, 100);

        // Debounced scroll handler
        this.createDebouncedFunction('scroll', () => {
            this.handleScroll();
        }, 16); // ~60fps
    }

    createDebouncedFunction(name, fn, delay) {
        const debouncedFn = (...args) => {
            clearTimeout(this.debounceTimers.get(name));
            this.debounceTimers.set(name, setTimeout(() => fn(...args), delay));
        };

        window[`debounced${name.charAt(0).toUpperCase() + name.slice(1)}`] = debouncedFn;
        return debouncedFn;
    }

    setupIntersectionObserver() {
        // Performance-aware intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                
                if (entry.isIntersecting) {
                    element.classList.add('in-viewport');
                    
                    // Trigger animations for elements in viewport
                    if (element.dataset.animate) {
                        this.triggerAnimation(element);
                    }
                } else {
                    element.classList.remove('in-viewport');
                    
                    // Pause non-critical animations for elements out of viewport
                    if (element.dataset.pauseOutOfView) {
                        this.pauseAnimation(element);
                    }
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        });

        // Observe animated elements
        document.querySelectorAll('[data-animate], [data-pause-out-of-view]').forEach(el => {
            observer.observe(el);
        });
    }

    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        this.monitorWebVitals();
        
        // Monitor custom metrics
        this.monitorCustomMetrics();
        
        // Set up periodic performance reports
        setInterval(() => this.generatePerformanceReport(), 30000); // Every 30 seconds
    }

    monitorWebVitals() {
        // First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'first-input') {
                        this.performanceMetrics.set('FID', entry.processingStart - entry.startTime);
                    }
                }
            });
            
            try {
                observer.observe({ type: 'first-input', buffered: true });
            } catch (e) {
                console.warn('Performance observer not supported for first-input');
            }
        }

        // Largest Contentful Paint (LCP)
        if ('LargestContentfulPaint' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.performanceMetrics.set('LCP', lastEntry.startTime);
            });
            
            try {
                observer.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) {
                console.warn('Performance observer not supported for LCP');
            }
        }
    }

    monitorCustomMetrics() {
        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.performanceMetrics.set('DOM_READY', navigation.domContentLoadedEventEnd - navigation.navigationStart);
            this.performanceMetrics.set('LOAD_COMPLETE', navigation.loadEventEnd - navigation.navigationStart);
        }

        // Memory usage (if available)
        if ('memory' in performance) {
            this.performanceMetrics.set('MEMORY_USED', performance.memory.usedJSHeapSize);
            this.performanceMetrics.set('MEMORY_LIMIT', performance.memory.jsHeapSizeLimit);
        }
    }

    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            metrics: Object.fromEntries(this.performanceMetrics),
            cacheStats: {
                componentCacheSize: this.componentCache.size,
                generalCacheSize: this.cache.size
            }
        };

        // Only log in development or if performance issues detected
        if (this.shouldLogPerformance(report)) {
            console.log('📊 Performance Report:', report);
        }

        return report;
    }

    shouldLogPerformance(report) {
        const fid = report.metrics.FID;
        const lcp = report.metrics.LCP;
        
        // Log if performance is poor
        return (fid > 100) || (lcp > 2500) || (Math.random() < 0.1); // 10% sampling
    }

    setupPreloading() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Set up prefetching for likely next actions
        this.setupPrefetching();
    }

    preloadCriticalResources() {
        const criticalResources = [
            { href: 'css/main.css', as: 'style' },
            { href: 'js/enhanced-notification-system.js', as: 'script' },
            { href: 'js/unified-chart-solution.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'script') {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }

    setupPrefetching() {
        // Prefetch components on hover
        document.addEventListener('mouseenter', (e) => {
            const navLink = e.target.closest('.nav-link[data-section]');
            if (navLink) {
                const section = navLink.dataset.section;
                this.prefetchComponent(section);
            }
        }, { passive: true });
    }

    async prefetchComponent(componentName) {
        if (!this.componentCache.has(componentName)) {
            await this.preloadComponent(componentName);
        }
    }

    setupServiceWorkerIntegration() {
        if ('serviceWorker' in navigator && 'sw.js') {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('🔧 Service Worker registered successfully');
                    this.setupCacheStrategies(registration);
                })
                .catch(error => {
                    console.warn('Service Worker registration failed:', error);
                });
        }
    }

    setupCacheStrategies(registration) {
        // Implement cache-first strategy for static assets
        // Implement network-first strategy for dynamic content
        // This would be implemented in the service worker
    }

    setupVirtualScrolling() {
        // Set up virtual scrolling for large tables
        document.querySelectorAll('.data-table[data-virtual-scroll]').forEach(table => {
            this.initializeVirtualScrolling(table);
        });
    }

    initializeVirtualScrolling(table) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll('tr'));
        const rowHeight = 50; // Assume fixed row height
        const containerHeight = 400; // Visible area height
        const visibleRows = Math.ceil(containerHeight / rowHeight);
        const buffer = 5; // Extra rows for smooth scrolling

        let startIndex = 0;
        let endIndex = visibleRows + buffer;

        const updateVisibleRows = () => {
            // Hide all rows
            rows.forEach((row, index) => {
                row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
            });
        };

        // Create scrollable container
        const container = document.createElement('div');
        container.style.height = `${containerHeight}px`;
        container.style.overflow = 'auto';
        
        table.parentNode.insertBefore(container, table);
        container.appendChild(table);

        container.addEventListener('scroll', this.createDebouncedFunction('tableScroll', () => {
            const scrollTop = container.scrollTop;
            startIndex = Math.floor(scrollTop / rowHeight);
            endIndex = Math.min(rows.length, startIndex + visibleRows + buffer);
            updateVisibleRows();
        }, 16));

        updateVisibleRows();
    }

    optimizeExistingElements() {
        // Optimize all images
        this.setupResponsiveImages();
        
        // Add lazy loading attributes to charts
        document.querySelectorAll('.chart-container').forEach(container => {
            if (!container.dataset.lazy) {
                container.dataset.lazy = 'chart';
            }
        });

        // Optimize large lists
        document.querySelectorAll('ul, ol').forEach(list => {
            if (list.children.length > 100) {
                this.optimizeLargeList(list);
            }
        });
    }

    optimizeLargeList(list) {
        // Implement virtual scrolling for large lists
        const items = Array.from(list.children);
        const itemHeight = 40;
        const containerHeight = 300;
        const visibleItems = Math.ceil(containerHeight / itemHeight);

        if (items.length > visibleItems * 2) {
            this.initializeVirtualList(list, items, itemHeight, containerHeight);
        }
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    triggerAnimation(element) {
        const animationType = element.dataset.animate;
        element.classList.add(`animate-${animationType}`);
    }

    pauseAnimation(element) {
        element.style.animationPlayState = 'paused';
    }

    resumeAnimation(element) {
        element.style.animationPlayState = 'running';
    }

    // Resource management
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }

    // Memory management
    clearCache(type = 'all') {
        if (type === 'all' || type === 'components') {
            this.componentCache.clear();
        }
        if (type === 'all' || type === 'general') {
            this.cache.clear();
        }
        console.log(`🧹 Cleared ${type} cache`);
    }

    // Public API
    getPerformanceMetrics() {
        return Object.fromEntries(this.performanceMetrics);
    }

    getCacheStats() {
        return {
            componentCache: this.componentCache.size,
            generalCache: this.cache.size,
            observedElements: this.observedElements.size
        };
    }

    cleanup() {
        try {
            // Clear all caches
            this.clearCache();
            
            // Clear timers
            this.debounceTimers.forEach(timer => clearTimeout(timer));
            this.debounceTimers.clear();
            
            // Disconnect observers
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
                this.intersectionObserver = null;
            }
            
            if (this.performanceObserver) {
                this.performanceObserver.disconnect();
                this.performanceObserver = null;
            }
            
            // Clear observed elements
            this.observedElements.clear();
            
            // Reset metrics
            this.performanceMetrics.clear();
            
            // Clear lazy load queue
            this.lazyLoadQueue.length = 0;
            
            console.log('🧹 Performance optimizer cleaned up successfully');
        } catch (error) {
            console.error('Error during performance optimizer cleanup:', error);
        }
    }
}

// Initialize performance optimizer and make class available globally
window.PerformanceOptimizer = PerformanceOptimizer;
window.performanceOptimizer = new PerformanceOptimizer();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceOptimizer.initialize().catch(error => {
            console.error('Failed to initialize Performance Optimizer:', error);
        });
    });
} else {
    window.performanceOptimizer.initialize().catch(error => {
        console.error('Failed to initialize Performance Optimizer:', error);
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceOptimizer };
}
