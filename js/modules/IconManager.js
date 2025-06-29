/**
 * Icon Manager Module
 * Handles icon loading, caching, and management for the application
 */

class IconManager {
    constructor() {
        this.iconCache = new Map();
        this.iconSets = new Map();
        this.loadingPromises = new Map();
        this.observers = new Map();
        this.defaultIconSet = 'fontawesome';
        
        this.init();
    }

    init() {
        console.log('🎨 IconManager: Initializing...');
        this.setupDefaultIconSets();
        this.setupLazyLoading();
        this.preloadCriticalIcons();
    }

    setupDefaultIconSets() {
        // Font Awesome icons (primary set)
        this.iconSets.set('fontawesome', {
            prefix: 'fas',
            baseClass: 'fa',
            cdn: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            icons: {
                // Navigation
                'dashboard': 'fa-tachometer-alt',
                'home': 'fa-home',
                'menu': 'fa-bars',
                'close': 'fa-times',
                'back': 'fa-arrow-left',
                'forward': 'fa-arrow-right',
                'up': 'fa-arrow-up',
                'down': 'fa-arrow-down',
                'expand': 'fa-expand',
                'collapse': 'fa-compress',
                
                // User & Account
                'user': 'fa-user',
                'users': 'fa-users',
                'profile': 'fa-user-circle',
                'settings': 'fa-cog',
                'login': 'fa-sign-in-alt',
                'logout': 'fa-sign-out-alt',
                'password': 'fa-key',
                
                // Data & Records
                'records': 'fa-database',
                'royalty': 'fa-coins',
                'contract': 'fa-file-contract',
                'document': 'fa-file-alt',
                'folder': 'fa-folder',
                'archive': 'fa-archive',
                'download': 'fa-download',
                'upload': 'fa-upload',
                'export': 'fa-file-export',
                'import': 'fa-file-import',
                
                // Financial
                'money': 'fa-dollar-sign',
                'payment': 'fa-credit-card',
                'bank': 'fa-university',
                'chart': 'fa-chart-bar',
                'analytics': 'fa-chart-line',
                'calculator': 'fa-calculator',
                'percentage': 'fa-percentage',
                
                // Communication
                'email': 'fa-envelope',
                'message': 'fa-comment',
                'notification': 'fa-bell',
                'chat': 'fa-comments',
                'phone': 'fa-phone',
                'fax': 'fa-fax',
                
                // Actions
                'add': 'fa-plus',
                'edit': 'fa-edit',
                'delete': 'fa-trash',
                'save': 'fa-save',
                'cancel': 'fa-times',
                'confirm': 'fa-check',
                'search': 'fa-search',
                'filter': 'fa-filter',
                'sort': 'fa-sort',
                'refresh': 'fa-sync',
                'print': 'fa-print',
                'copy': 'fa-copy',
                
                // Status & States
                'success': 'fa-check-circle',
                'error': 'fa-exclamation-circle',
                'warning': 'fa-exclamation-triangle',
                'info': 'fa-info-circle',
                'loading': 'fa-spinner',
                'pending': 'fa-clock',
                'approved': 'fa-thumbs-up',
                'rejected': 'fa-thumbs-down',
                'active': 'fa-circle',
                'inactive': 'fa-circle',
                
                // Compliance & Regulatory
                'compliance': 'fa-shield-alt',
                'regulation': 'fa-balance-scale',
                'audit': 'fa-search-plus',
                'report': 'fa-file-pdf',
                'calendar': 'fa-calendar',
                'deadline': 'fa-clock',
                'alert': 'fa-exclamation',
                
                // Misc
                'help': 'fa-question-circle',
                'external': 'fa-external-link-alt',
                'lock': 'fa-lock',
                'unlock': 'fa-unlock',
                'visible': 'fa-eye',
                'hidden': 'fa-eye-slash',
                'star': 'fa-star',
                'bookmark': 'fa-bookmark',
                'tag': 'fa-tag',
                'location': 'fa-map-marker-alt'
            }
        });

        // Material Design Icons (alternative set)
        this.iconSets.set('material', {
            prefix: 'material-icons',
            baseClass: 'material-icons',
            cdn: 'https://fonts.googleapis.com/icon?family=Material+Icons',
            icons: {
                'dashboard': 'dashboard',
                'home': 'home',
                'menu': 'menu',
                'close': 'close',
                'user': 'person',
                'users': 'group',
                'settings': 'settings',
                'search': 'search',
                'add': 'add',
                'edit': 'edit',
                'delete': 'delete',
                'save': 'save',
                'refresh': 'refresh'
            }
        });
    }

    setupLazyLoading() {
        // Intersection Observer for lazy loading icons
        if ('IntersectionObserver' in window) {
            this.lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadIconForElement(entry.target);
                        this.lazyObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    }

    async preloadCriticalIcons() {
        const criticalIcons = [
            'dashboard', 'menu', 'user', 'settings', 'notification',
            'search', 'add', 'edit', 'delete', 'save', 'loading'
        ];
        
        await this.loadIcons(criticalIcons);
        console.log('🎨 IconManager: Critical icons preloaded');
    }

    async loadIcons(iconNames, iconSet = this.defaultIconSet) {
        const loadPromises = iconNames.map(iconName => this.loadIcon(iconName, iconSet));
        return Promise.all(loadPromises);
    }

    async loadIcon(iconName, iconSet = this.defaultIconSet) {
        const cacheKey = `${iconSet}:${iconName}`;
        
        // Return cached icon if available
        if (this.iconCache.has(cacheKey)) {
            return this.iconCache.get(cacheKey);
        }
        
        // Return existing loading promise if in progress
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }
        
        // Start loading icon
        const loadPromise = this.performIconLoad(iconName, iconSet);
        this.loadingPromises.set(cacheKey, loadPromise);
        
        try {
            const iconData = await loadPromise;
            this.iconCache.set(cacheKey, iconData);
            return iconData;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    async performIconLoad(iconName, iconSet) {
        const set = this.iconSets.get(iconSet);
        if (!set) {
            throw new Error(`Icon set "${iconSet}" not found`);
        }
        
        const iconClass = set.icons[iconName];
        if (!iconClass) {
            console.warn(`Icon "${iconName}" not found in set "${iconSet}"`);
            return this.getDefaultIcon();
        }
        
        // Ensure icon set CSS is loaded
        await this.ensureIconSetLoaded(iconSet);
        
        return {
            name: iconName,
            set: iconSet,
            class: iconClass,
            fullClass: `${set.baseClass} ${iconClass}`,
            prefix: set.prefix
        };
    }

    async ensureIconSetLoaded(iconSet) {
        const set = this.iconSets.get(iconSet);
        if (!set || !set.cdn) return;
        
        const linkId = `iconset-${iconSet}`;
        
        // Check if already loaded
        if (document.getElementById(linkId)) return;
        
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = set.cdn;
            
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load icon set: ${iconSet}`));
            
            document.head.appendChild(link);
        });
    }

    getDefaultIcon() {
        return {
            name: 'default',
            set: 'fallback',
            class: 'fa-circle',
            fullClass: 'fa fa-circle',
            prefix: 'fas'
        };
    }

    // Create icon element
    createIcon(iconName, options = {}) {
        const {
            size = 'medium',
            color = null,
            rotation = null,
            animation = null,
            className = '',
            title = null,
            iconSet = this.defaultIconSet
        } = options;
        
        const icon = document.createElement('i');
        
        // Load icon data
        this.loadIcon(iconName, iconSet).then(iconData => {
            icon.className = `icon ${iconData.fullClass} ${className}`.trim();
            
            // Add size class
            if (size !== 'medium') {
                icon.classList.add(`icon-${size}`);
            }
            
            // Add color
            if (color) {
                icon.style.color = color;
            }
            
            // Add rotation
            if (rotation) {
                icon.style.transform = `rotate(${rotation}deg)`;
            }
            
            // Add animation
            if (animation) {
                icon.classList.add(`fa-${animation}`);
            }
            
            // Add title for accessibility
            if (title) {
                icon.title = title;
                icon.setAttribute('aria-label', title);
            } else {
                icon.setAttribute('aria-hidden', 'true');
            }
            
        }).catch(error => {
            console.warn('Failed to load icon:', error);
            // Fallback to default icon
            const defaultIcon = this.getDefaultIcon();
            icon.className = `icon ${defaultIcon.fullClass} ${className}`.trim();
        });
        
        return icon;
    }

    // Update existing icon element
    updateIcon(element, iconName, options = {}) {
        const { iconSet = this.defaultIconSet } = options;
        
        this.loadIcon(iconName, iconSet).then(iconData => {
            // Clear existing icon classes
            element.className = element.className.replace(/fa-[\w-]+/g, '');
            
            // Add new icon classes
            element.classList.add(iconData.fullClass.split(' '));
            
            // Apply other options
            if (options.size && options.size !== 'medium') {
                element.classList.add(`icon-${options.size}`);
            }
            
            if (options.color) {
                element.style.color = options.color;
            }
            
            if (options.title) {
                element.title = options.title;
                element.setAttribute('aria-label', options.title);
            }
            
        }).catch(error => {
            console.warn('Failed to update icon:', error);
        });
    }

    // Auto-load icons with data attributes
    loadIconForElement(element) {
        const iconName = element.getAttribute('data-icon');
        const iconSet = element.getAttribute('data-icon-set') || this.defaultIconSet;
        const size = element.getAttribute('data-icon-size') || 'medium';
        const color = element.getAttribute('data-icon-color');
        const title = element.getAttribute('data-icon-title');
        
        if (!iconName) return;
        
        this.updateIcon(element, iconName, { iconSet, size, color, title });
    }

    // Scan and load all icons in the document
    scanAndLoadIcons(container = document) {
        const iconElements = container.querySelectorAll('[data-icon]');
        
        iconElements.forEach(element => {
            if (this.lazyObserver) {
                this.lazyObserver.observe(element);
            } else {
                this.loadIconForElement(element);
            }
        });
        
        console.log(`🎨 IconManager: Found ${iconElements.length} icons to load`);
    }

    // Utility methods
    getIconClass(iconName, iconSet = this.defaultIconSet) {
        const set = this.iconSets.get(iconSet);
        if (!set) return null;
        
        const iconClass = set.icons[iconName];
        return iconClass ? `${set.baseClass} ${iconClass}` : null;
    }

    hasIcon(iconName, iconSet = this.defaultIconSet) {
        const set = this.iconSets.get(iconSet);
        return set && set.icons[iconName] !== undefined;
    }

    getAvailableIcons(iconSet = this.defaultIconSet) {
        const set = this.iconSets.get(iconSet);
        return set ? Object.keys(set.icons) : [];
    }

    addCustomIcon(iconName, iconClass, iconSet = this.defaultIconSet) {
        const set = this.iconSets.get(iconSet);
        if (set) {
            set.icons[iconName] = iconClass;
            console.log(`🎨 IconManager: Added custom icon "${iconName}" to set "${iconSet}"`);
        }
    }

    removeIcon(iconName, iconSet = this.defaultIconSet) {
        const set = this.iconSets.get(iconSet);
        if (set && set.icons[iconName]) {
            delete set.icons[iconName];
            
            // Remove from cache
            const cacheKey = `${iconSet}:${iconName}`;
            this.iconCache.delete(cacheKey);
        }
    }

    clearCache() {
        this.iconCache.clear();
        this.loadingPromises.clear();
        console.log('🎨 IconManager: Cache cleared');
    }

    getCacheStats() {
        return {
            cached: this.iconCache.size,
            loading: this.loadingPromises.size,
            sets: this.iconSets.size
        };
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.iconManager = new IconManager();
        // Auto-scan for icons on initial load
        window.iconManager.scanAndLoadIcons();
    });
} else {
    window.iconManager = new IconManager();
    window.iconManager.scanAndLoadIcons();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IconManager;
}
