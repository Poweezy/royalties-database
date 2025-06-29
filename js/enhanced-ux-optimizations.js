/**
 * Enhanced UX Optimizations for Mining Royalties Manager
 * Provides performance improvements, accessibility features, and enhanced user experience
 */

class EnhancedUXManager {
    constructor() {
        this.initialized = false;
        this.performanceObserver = null;
        this.keyboardNavigation = new KeyboardNavigationManager();
        this.loadingStates = new LoadingStateManager();
        this.accessibility = new AccessibilityManager();
        this.userPreferences = new UserPreferencesManager();
    }

    async initialize() {
        if (this.initialized) return;

        console.log('🚀 Initializing Enhanced UX Optimizations...');

        try {
            // Initialize all managers
            await this.keyboardNavigation.initialize();
            await this.loadingStates.initialize();
            await this.accessibility.initialize();
            await this.userPreferences.initialize();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            // Enhance existing UI elements
            this.enhanceInteractiveElements();
            
            // Add smooth transitions
            this.addSmoothTransitions();
            
            // Initialize progressive enhancement
            this.initializeProgressiveEnhancement();
            
            this.initialized = true;
            console.log('✅ Enhanced UX Optimizations initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize UX enhancements:', error);
        }
    }

    setupPerformanceMonitoring() {
        // Monitor navigation performance
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        console.log(`Navigation timing: ${entry.duration.toFixed(2)}ms`);
                    }
                }
            });
            this.performanceObserver.observe({ entryTypes: ['navigation', 'measure'] });
        }

        // Lazy load non-critical components
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        // Intersection Observer for charts and heavy components
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.dataset.lazyChart) {
                        this.loadChartLazily(element);
                        observer.unobserve(element);
                    }
                }
            });
        });

        // Observe chart containers
        document.querySelectorAll('.chart-container[data-lazy-chart]').forEach(el => {
            observer.observe(el);
        });
    }

    enhanceInteractiveElements() {
        // Add ripple effects to buttons
        this.addRippleEffects();
        
        // Enhanced hover states
        this.addEnhancedHoverStates();
        
        // Smooth scrolling for internal links
        this.addSmoothScrolling();
        
        // Progressive form validation
        this.enhanceFormValidation();
    }

    addRippleEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .btn {
                position: relative;
                overflow: hidden;
            }
            
            .btn::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: translate(-50%, -50%);
                transition: width 0.3s, height 0.3s;
            }
            
            .btn:active::after {
                width: 300px;
                height: 300px;
            }
            
            .card-hover-enhanced {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .card-hover-enhanced:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(style);

        // Apply enhanced hover to cards
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('card-hover-enhanced');
        });
    }

    addSmoothTransitions() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                scroll-behavior: smooth;
            }
            
            .section-transition {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .section-transition.active {
                opacity: 1;
                transform: translateY(0);
            }
            
            .fade-in-up {
                animation: fadeInUp 0.6s ease-out;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    addSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    enhanceFormValidation() {
        document.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
            
            field.addEventListener('input', (e) => {
                this.clearFieldError(e.target);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let message = '';

        // Basic validation rules
        if (field.required && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }

        this.showFieldValidation(field, isValid, message);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showFieldValidation(field, isValid, message) {
        field.classList.remove('is-valid', 'is-invalid');
        
        // Remove existing feedback
        const existingFeedback = field.parentNode.querySelector('.field-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        if (!isValid && message) {
            field.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.className = 'field-feedback text-danger';
            feedback.style.fontSize = '0.875rem';
            feedback.style.marginTop = '0.25rem';
            feedback.textContent = message;
            field.parentNode.appendChild(feedback);
        } else if (isValid && field.value.trim()) {
            field.classList.add('is-valid');
        }
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const feedback = field.parentNode.querySelector('.field-feedback');
        if (feedback) {
            feedback.remove();
        }
    }

    initializeProgressiveEnhancement() {
        // Add loading skeletons
        this.addLoadingSkeletons();
        
        // Enhance tables with sorting
        this.enhanceTables();
        
        // Add context menus
        this.addContextMenus();
    }

    addLoadingSkeletons() {
        const skeletonCSS = `
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-text {
                height: 1rem;
                border-radius: 4px;
                margin-bottom: 0.5rem;
            }
            
            .skeleton-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = skeletonCSS;
        document.head.appendChild(style);
    }

    enhanceTables() {
        document.querySelectorAll('table.data-table').forEach(table => {
            this.makeSortableTable(table);
            this.addTableSearch(table);
        });
    }

    makeSortableTable(table) {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            if (!header.classList.contains('no-sort')) {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.sortTable(table, index);
                });
                
                // Add sort indicator
                const indicator = document.createElement('i');
                indicator.className = 'fas fa-sort sort-indicator';
                indicator.style.marginLeft = '0.5rem';
                indicator.style.opacity = '0.5';
                header.appendChild(indicator);
            }
        });
    }

    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const isAscending = !table.dataset.sortAsc || table.dataset.sortAsc === 'false';
        
        rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent.trim();
            const bText = b.cells[columnIndex].textContent.trim();
            
            // Try to parse as numbers
            const aNum = parseFloat(aText);
            const bNum = parseFloat(bText);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? aNum - bNum : bNum - aNum;
            }
            
            // String comparison
            return isAscending ? aText.localeCompare(bText) : bText.localeCompare(aText);
        });
        
        // Update DOM
        rows.forEach(row => tbody.appendChild(row));
        
        // Update sort indicators
        table.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.className = 'fas fa-sort sort-indicator';
            indicator.style.opacity = '0.5';
        });
        
        const currentIndicator = table.querySelectorAll('th')[columnIndex].querySelector('.sort-indicator');
        currentIndicator.className = `fas fa-sort-${isAscending ? 'up' : 'down'} sort-indicator`;
        currentIndicator.style.opacity = '1';
        
        table.dataset.sortAsc = !isAscending;
    }

    cleanup() {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        this.keyboardNavigation?.cleanup();
        this.loadingStates?.cleanup();
        this.accessibility?.cleanup();
        this.userPreferences?.cleanup();
    }
}

// Keyboard Navigation Manager
class KeyboardNavigationManager {
    constructor() {
        this.currentFocusIndex = 0;
        this.focusableElements = [];
    }

    async initialize() {
        this.setupKeyboardShortcuts();
        this.enhanceTabNavigation();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + Number for quick navigation
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                this.navigateToSection(parseInt(e.key) - 1);
            }
            
            // Escape to close modals/overlays
            if (e.key === 'Escape') {
                this.closeTopMostModal();
            }
            
            // Enter to activate buttons/links when focused
            if (e.key === 'Enter' && e.target.matches('.btn, .nav-link')) {
                e.target.click();
            }
        });
    }

    navigateToSection(index) {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        if (navLinks[index]) {
            navLinks[index].click();
        }
    }

    enhanceTabNavigation() {
        // Ensure proper tab order
        document.querySelectorAll('button, input, select, textarea, a[href]').forEach((el, index) => {
            if (!el.tabIndex) {
                el.tabIndex = 0;
            }
        });
    }

    closeTopMostModal() {
        const modal = document.querySelector('.modal-overlay:last-of-type');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    cleanup() {
        // Remove event listeners if needed
    }
}

// Loading State Manager
class LoadingStateManager {
    constructor() {
        this.loadingElements = new Set();
    }

    async initialize() {
        this.setupLoadingStates();
    }

    setupLoadingStates() {
        // Intercept form submissions to show loading states
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                this.showButtonLoading(submitBtn);
            }
        });

        // Show loading for async operations
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn[data-async]');
            if (btn) {
                this.showButtonLoading(btn);
            }
        });
    }

    showButtonLoading(button) {
        button.classList.add('loading');
        button.disabled = true;
        this.loadingElements.add(button);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            this.hideButtonLoading(button);
        }, 3000);
    }

    hideButtonLoading(button) {
        button.classList.remove('loading');
        button.disabled = false;
        this.loadingElements.delete(button);
    }

    cleanup() {
        this.loadingElements.forEach(el => this.hideButtonLoading(el));
    }
}

// Accessibility Manager
class AccessibilityManager {
    async initialize() {
        this.enhanceAccessibility();
        this.addAriaLabels();
        this.setupFocusManagement();
    }

    enhanceAccessibility() {
        // Add skip links
        this.addSkipLinks();
        
        // Ensure proper heading hierarchy
        this.validateHeadingHierarchy();
        
        // Add roles where needed
        this.addMissingRoles();
    }

    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only sr-only-focusable';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 10000;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    addAriaLabels() {
        // Add ARIA labels to interactive elements without text
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon && !btn.textContent.trim()) {
                const action = this.getActionFromIcon(icon.className);
                if (action) {
                    btn.setAttribute('aria-label', action);
                }
            }
        });
    }

    getActionFromIcon(iconClass) {
        const iconMap = {
            'fa-edit': 'Edit',
            'fa-trash': 'Delete',
            'fa-eye': 'View',
            'fa-download': 'Download',
            'fa-upload': 'Upload',
            'fa-plus': 'Add',
            'fa-search': 'Search',
            'fa-filter': 'Filter',
            'fa-refresh': 'Refresh',
            'fa-sync': 'Sync'
        };
        
        for (const [icon, action] of Object.entries(iconMap)) {
            if (iconClass.includes(icon)) {
                return action;
            }
        }
        return null;
    }

    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal-overlay:last-of-type');
                if (modal && modal.style.display !== 'none') {
                    this.trapFocusInModal(e, modal);
                }
            }
        });
    }

    trapFocusInModal(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    cleanup() {
        // Remove added elements if needed
    }
}

// User Preferences Manager
class UserPreferencesManager {
    constructor() {
        this.preferences = this.loadPreferences();
    }

    async initialize() {
        this.applyPreferences();
        this.setupPreferenceControls();
    }

    loadPreferences() {
        try {
            const stored = localStorage.getItem('mining-royalties-preferences');
            return stored ? JSON.parse(stored) : this.getDefaultPreferences();
        } catch {
            return this.getDefaultPreferences();
        }
    }

    getDefaultPreferences() {
        return {
            theme: 'light',
            compactMode: false,
            animationsEnabled: true,
            fontSize: 'medium',
            highContrast: false
        };
    }

    savePreferences() {
        try {
            localStorage.setItem('mining-royalties-preferences', JSON.stringify(this.preferences));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    applyPreferences() {
        const { theme, compactMode, animationsEnabled, fontSize, highContrast } = this.preferences;
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', theme);
        
        // Apply compact mode
        document.documentElement.classList.toggle('compact-mode', compactMode);
        
        // Apply animations
        document.documentElement.classList.toggle('no-animations', !animationsEnabled);
        
        // Apply font size
        document.documentElement.setAttribute('data-font-size', fontSize);
        
        // Apply high contrast
        document.documentElement.classList.toggle('high-contrast', highContrast);
    }

    setupPreferenceControls() {
        // Add preferences panel to user profile
        this.addPreferencesPanel();
    }

    addPreferencesPanel() {
        // This would be integrated into the profile component
        const style = document.createElement('style');
        style.textContent = `
            .preferences-panel {
                background: var(--background-white);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                margin-top: 1rem;
            }
            
            .preference-group {
                margin-bottom: 1.5rem;
            }
            
            .preference-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            
            .compact-mode .card {
                padding: 1rem;
            }
            
            .compact-mode .metric-card .card-body p {
                font-size: 1.25rem;
            }
            
            [data-font-size="small"] {
                font-size: 14px;
            }
            
            [data-font-size="large"] {
                font-size: 18px;
            }
            
            .no-animations * {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
            
            .high-contrast {
                --primary-color: #000;
                --text-primary: #000;
                --border-color: #000;
                --background-white: #fff;
            }
        `;
        document.head.appendChild(style);
    }

    updatePreference(key, value) {
        this.preferences[key] = value;
        this.savePreferences();
        this.applyPreferences();
    }

    cleanup() {
        // Save current preferences
        this.savePreferences();
    }
}

// Initialize the enhanced UX manager
window.enhancedUXManager = new EnhancedUXManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedUXManager.initialize();
    });
} else {
    window.enhancedUXManager.initialize();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedUXManager };
}
