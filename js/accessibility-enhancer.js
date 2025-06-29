/**
 * Advanced Accessibility Enhancement Module for Mining Royalties Manager
 * Implements WCAG 2.1 AA compliance and advanced accessibility features
 */

class AccessibilityEnhancer {
    constructor() {
        this.screenReaderAnnouncements = [];
        this.focusHistory = [];
        this.keyboardTrapStack = [];
        this.colorContrastCache = new Map();
        this.initialized = false;
        this.settings = {
            highContrast: false,
            reducedMotion: false,
            largeText: false,
            screenReaderMode: false
        };
    }

    async initialize() {
        if (this.initialized) return;

        console.log('♿ Initializing Advanced Accessibility Features...');

        try {
            // Load user accessibility preferences
            this.loadAccessibilityPreferences();
            
            // Set up core accessibility features
            this.setupKeyboardNavigation();
            this.setupScreenReaderSupport();
            this.setupFocusManagement();
            this.setupColorContrastEnhancements();
            this.setupMotionControls();
            this.setupTextScaling();
            this.setupAriaLiveRegions();
            this.setupAccessibilityShortcuts();
            
            // Enhance existing elements
            this.enhanceExistingElements();
            
            // Set up accessibility monitoring
            this.setupAccessibilityMonitoring();
            
            // Add accessibility toolbar
            this.createAccessibilityToolbar();
            
            this.initialized = true;
            console.log('✅ Advanced accessibility features initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize accessibility features:', error);
        }
    }

    loadAccessibilityPreferences() {
        try {
            const saved = localStorage.getItem('accessibility-preferences');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
            
            // Check for system preferences
            this.detectSystemPreferences();
            
        } catch (error) {
            console.warn('Failed to load accessibility preferences:', error);
        }
    }

    detectSystemPreferences() {
        // Detect prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reducedMotion = true;
        }
        
        // Detect prefers-contrast
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.settings.highContrast = true;
        }
        
        // Detect screen reader usage
        if (navigator.userAgent.includes('JAWS') || 
            navigator.userAgent.includes('NVDA') || 
            navigator.userAgent.includes('VoiceOver')) {
            this.settings.screenReaderMode = true;
        }
    }

    saveAccessibilityPreferences() {
        try {
            localStorage.setItem('accessibility-preferences', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save accessibility preferences:', error);
        }
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        
        // Set up roving tabindex for complex widgets
        this.setupRovingTabindex();
        
        // Add visible focus indicators
        this.enhanceFocusIndicators();
        
        // Skip links for screen readers
        this.addSkipLinks();
    }

    handleKeyboardNavigation(e) {
        const { key, altKey, ctrlKey, shiftKey } = e;
        
        // Custom keyboard shortcuts
        if (altKey) {
            switch (key) {
                case '1':
                    e.preventDefault();
                    this.navigateToMain();
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToNavigation();
                    break;
                case 'm':
                    e.preventDefault();
                    this.openAccessibilityMenu();
                    break;
                case 'h':
                    e.preventDefault();
                    this.announceHeadings();
                    break;
                case 'l':
                    e.preventDefault();
                    this.announceLinks();
                    break;
            }
        }
        
        // Arrow key navigation for grids
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            this.handleArrowKeyNavigation(e);
        }
        
        // Tab trapping in modals
        if (key === 'Tab') {
            this.handleTabNavigation(e);
        }
        
        // Escape key handling
        if (key === 'Escape') {
            this.handleEscapeKey();
        }
    }

    setupRovingTabindex() {
        // Set up roving tabindex for navigation menus
        const navMenus = document.querySelectorAll('nav ul');
        navMenus.forEach(menu => {
            this.initializeRovingTabindex(menu);
        });
        
        // Set up for data tables
        const tables = document.querySelectorAll('.data-table');
        tables.forEach(table => {
            this.initializeTableNavigation(table);
        });
    }

    initializeRovingTabindex(container) {
        const focusableItems = container.querySelectorAll('a, button, [tabindex="0"]');
        let currentIndex = 0;
        
        focusableItems.forEach((item, index) => {
            item.tabIndex = index === 0 ? 0 : -1;
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % focusableItems.length;
                    this.moveFocus(focusableItems, currentIndex);
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    currentIndex = currentIndex === 0 ? focusableItems.length - 1 : currentIndex - 1;
                    this.moveFocus(focusableItems, currentIndex);
                }
            });
            
            item.addEventListener('focus', () => {
                currentIndex = index;
            });
        });
    }

    moveFocus(items, newIndex) {
        items.forEach((item, index) => {
            item.tabIndex = index === newIndex ? 0 : -1;
        });
        items[newIndex].focus();
    }

    enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced focus indicators */
            *:focus {
                outline: 3px solid #0066cc !important;
                outline-offset: 2px !important;
                border-radius: 2px;
            }
            
            .focus-indicator-enhanced {
                position: relative;
            }
            
            .focus-indicator-enhanced:focus::before {
                content: '';
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border: 3px solid #0066cc;
                border-radius: 6px;
                pointer-events: none;
            }
            
            /* High contrast mode focus indicators */
            .high-contrast *:focus {
                outline: 4px solid #ffffff !important;
                background: #000000 !important;
                color: #ffffff !important;
            }
            
            /* Skip links */
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 12px 16px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
                font-weight: bold;
                transition: top 0.2s ease;
            }
            
            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);
    }

    addSkipLinks() {
        const skipLinks = [
            { href: '#main-content', text: 'Skip to main content' },
            { href: '#sidebar', text: 'Skip to navigation' },
            { href: '#search', text: 'Skip to search' }
        ];
        
        const skipContainer = document.createElement('div');
        skipContainer.className = 'skip-links';
        
        skipLinks.forEach(link => {
            const skipLink = document.createElement('a');
            skipLink.href = link.href;
            skipLink.textContent = link.text;
            skipLink.className = 'skip-link';
            skipContainer.appendChild(skipLink);
        });
        
        document.body.insertBefore(skipContainer, document.body.firstChild);
        
        // Ensure main content is identifiable
        if (!document.getElementById('main-content')) {
            const mainContent = document.querySelector('.main-content, main');
            if (mainContent) {
                mainContent.id = 'main-content';
            }
        }
    }

    setupScreenReaderSupport() {
        // Create live regions for announcements
        this.createLiveRegions();
        
        // Enhance table accessibility
        this.enhanceTableAccessibility();
        
        // Add descriptive labels
        this.addDescriptiveLabels();
        
        // Set up progress announcements
        this.setupProgressAnnouncements();
    }

    createLiveRegions() {
        // Polite announcements
        const politeRegion = document.createElement('div');
        politeRegion.id = 'live-region-polite';
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'true');
        politeRegion.className = 'sr-only';
        document.body.appendChild(politeRegion);
        
        // Assertive announcements
        const assertiveRegion = document.createElement('div');
        assertiveRegion.id = 'live-region-assertive';
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.className = 'sr-only';
        document.body.appendChild(assertiveRegion);
        
        // Status announcements
        const statusRegion = document.createElement('div');
        statusRegion.id = 'live-region-status';
        statusRegion.setAttribute('role', 'status');
        statusRegion.setAttribute('aria-live', 'polite');
        statusRegion.className = 'sr-only';
        document.body.appendChild(statusRegion);
    }

    announceToScreenReader(message, priority = 'polite') {
        const regionId = `live-region-${priority}`;
        const region = document.getElementById(regionId);
        
        if (region) {
            // Clear previous message
            region.textContent = '';
            
            // Add new message after a brief delay to ensure it's announced
            setTimeout(() => {
                region.textContent = message;
                this.screenReaderAnnouncements.push({
                    message,
                    priority,
                    timestamp: Date.now()
                });
            }, 100);
        }
    }

    enhanceTableAccessibility() {
        document.querySelectorAll('table').forEach(table => {
            // Add table caption if missing
            if (!table.caption) {
                const caption = document.createElement('caption');
                caption.textContent = this.generateTableCaption(table);
                table.insertBefore(caption, table.firstChild);
            }
            
            // Ensure proper header associations
            this.associateTableHeaders(table);
            
            // Add table navigation instructions
            this.addTableInstructions(table);
        });
    }

    generateTableCaption(table) {
        const rows = table.querySelectorAll('tbody tr').length;
        const cols = table.querySelectorAll('thead th').length;
        return `Data table with ${rows} rows and ${cols} columns`;
    }

    associateTableHeaders(table) {
        const headers = table.querySelectorAll('th');
        const cells = table.querySelectorAll('td');
        
        headers.forEach((header, index) => {
            if (!header.id) {
                header.id = `header-${Math.random().toString(36).substr(2, 9)}`;
            }
        });
        
        // Associate cells with headers
        table.querySelectorAll('tbody tr').forEach((row, rowIndex) => {
            row.querySelectorAll('td').forEach((cell, cellIndex) => {
                const header = headers[cellIndex];
                if (header && !cell.getAttribute('headers')) {
                    cell.setAttribute('headers', header.id);
                }
            });
        });
    }

    setupFocusManagement() {
        // Track focus history for better navigation
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push({
                element: e.target,
                timestamp: Date.now()
            });
            
            // Keep only last 10 focus events
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });
        
        // Set up focus trapping
        this.setupFocusTrapping();
    }

    setupFocusTrapping() {
        // Monitor for modal dialogs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches('.modal-overlay, .dialog, [role="dialog"]')) {
                            this.trapFocus(node);
                        }
                    }
                });
                
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches('.modal-overlay, .dialog, [role="dialog"]')) {
                            this.releaseFocusTrap();
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        this.keyboardTrapStack.push({
            container,
            firstElement,
            lastElement,
            previousFocus: document.activeElement
        });
        
        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
        
        const trapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        container.addEventListener('keydown', trapHandler);
        container._focusTrapHandler = trapHandler;
    }

    releaseFocusTrap() {
        const trap = this.keyboardTrapStack.pop();
        if (trap) {
            // Remove event listener
            if (trap.container._focusTrapHandler) {
                trap.container.removeEventListener('keydown', trap.container._focusTrapHandler);
                delete trap.container._focusTrapHandler;
            }
            
            // Restore previous focus
            if (trap.previousFocus) {
                trap.previousFocus.focus();
            }
        }
    }

    setupColorContrastEnhancements() {
        this.analyzeColorContrast();
        this.setupHighContrastMode();
    }

    analyzeColorContrast() {
        // Check color contrast ratios
        const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6, label');
        
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const bgColor = style.backgroundColor;
            const textColor = style.color;
            
            const ratio = this.calculateContrastRatio(textColor, bgColor);
            
            if (ratio < 4.5) { // WCAG AA standard
                element.dataset.contrastIssue = 'true';
                console.warn(`Low contrast detected on element:`, element, `Ratio: ${ratio.toFixed(2)}`);
            }
        });
    }

    calculateContrastRatio(color1, color2) {
        const luminance1 = this.getLuminance(color1);
        const luminance2 = this.getLuminance(color2);
        
        const brightest = Math.max(luminance1, luminance2);
        const darkest = Math.min(luminance1, luminance2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    }

    getLuminance(color) {
        // Convert color to RGB values
        const rgb = this.colorToRgb(color);
        if (!rgb) return 0;
        
        // Calculate relative luminance
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        
        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    colorToRgb(color) {
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        
        const style = window.getComputedStyle(div);
        const rgb = style.color;
        document.body.removeChild(div);
        
        const match = rgb.match(/\d+/g);
        return match ? {
            r: parseInt(match[0]),
            g: parseInt(match[1]),
            b: parseInt(match[2])
        } : null;
    }

    setupHighContrastMode() {
        if (this.settings.highContrast) {
            this.enableHighContrast();
        }
    }

    enableHighContrast() {
        document.documentElement.classList.add('high-contrast');
        this.settings.highContrast = true;
        this.saveAccessibilityPreferences();
        this.announceToScreenReader('High contrast mode enabled');
    }

    disableHighContrast() {
        document.documentElement.classList.remove('high-contrast');
        this.settings.highContrast = false;
        this.saveAccessibilityPreferences();
        this.announceToScreenReader('High contrast mode disabled');
    }

    setupMotionControls() {
        if (this.settings.reducedMotion) {
            this.enableReducedMotion();
        }
    }

    enableReducedMotion() {
        document.documentElement.classList.add('reduce-motion');
        this.settings.reducedMotion = true;
        this.saveAccessibilityPreferences();
        
        const style = document.createElement('style');
        style.textContent = `
            .reduce-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
        
        this.announceToScreenReader('Reduced motion enabled');
    }

    setupTextScaling() {
        if (this.settings.largeText) {
            this.enableLargeText();
        }
    }

    enableLargeText() {
        document.documentElement.classList.add('large-text');
        this.settings.largeText = true;
        this.saveAccessibilityPreferences();
        
        const style = document.createElement('style');
        style.textContent = `
            .large-text {
                font-size: 120% !important;
            }
            
            .large-text * {
                line-height: 1.6 !important;
            }
            
            .large-text .btn {
                padding: 0.875rem 1.5rem !important;
                font-size: 1.1rem !important;
            }
        `;
        document.head.appendChild(style);
        
        this.announceToScreenReader('Large text mode enabled');
    }

    createAccessibilityToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'accessibility-toolbar';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', 'Accessibility options');
        
        toolbar.innerHTML = `
            <button type="button" class="a11y-btn" data-action="high-contrast" aria-pressed="${this.settings.highContrast}">
                <i class="fas fa-adjust" aria-hidden="true"></i>
                High Contrast
            </button>
            <button type="button" class="a11y-btn" data-action="large-text" aria-pressed="${this.settings.largeText}">
                <i class="fas fa-font" aria-hidden="true"></i>
                Large Text
            </button>
            <button type="button" class="a11y-btn" data-action="reduced-motion" aria-pressed="${this.settings.reducedMotion}">
                <i class="fas fa-pause" aria-hidden="true"></i>
                Reduce Motion
            </button>
            <button type="button" class="a11y-btn" data-action="keyboard-help">
                <i class="fas fa-keyboard" aria-hidden="true"></i>
                Keyboard Help
            </button>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-toolbar {
                position: fixed;
                top: 50%;
                right: -200px;
                transform: translateY(-50%);
                background: #ffffff;
                border: 2px solid #0066cc;
                border-right: none;
                border-radius: 8px 0 0 8px;
                padding: 1rem;
                z-index: 9999;
                transition: right 0.3s ease;
                box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                width: 200px;
            }
            
            .accessibility-toolbar:hover,
            .accessibility-toolbar:focus-within {
                right: 0;
            }
            
            .accessibility-toolbar::before {
                content: '♿';
                position: absolute;
                left: -40px;
                top: 50%;
                transform: translateY(-50%);
                background: #0066cc;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                cursor: pointer;
            }
            
            .a11y-btn {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 0.5rem 0.75rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                text-align: left;
            }
            
            .a11y-btn:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            
            .a11y-btn[aria-pressed="true"] {
                background: #0066cc;
                color: white;
                border-color: #0066cc;
            }
            
            .a11y-btn:focus {
                outline: 2px solid #0066cc;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
        
        toolbar.addEventListener('click', this.handleToolbarAction.bind(this));
        document.body.appendChild(toolbar);
    }

    handleToolbarAction(e) {
        const button = e.target.closest('.a11y-btn');
        if (!button) return;
        
        const action = button.dataset.action;
        
        switch (action) {
            case 'high-contrast':
                this.toggleHighContrast();
                break;
            case 'large-text':
                this.toggleLargeText();
                break;
            case 'reduced-motion':
                this.toggleReducedMotion();
                break;
            case 'keyboard-help':
                this.showKeyboardHelp();
                break;
        }
    }

    toggleHighContrast() {
        if (this.settings.highContrast) {
            this.disableHighContrast();
        } else {
            this.enableHighContrast();
        }
        
        const button = document.querySelector('[data-action="high-contrast"]');
        button.setAttribute('aria-pressed', this.settings.highContrast.toString());
    }

    showKeyboardHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'modal-overlay';
        helpModal.setAttribute('role', 'dialog');
        helpModal.setAttribute('aria-labelledby', 'keyboard-help-title');
        helpModal.setAttribute('aria-modal', 'true');
        
        helpModal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3 id="keyboard-help-title">Keyboard Shortcuts</h3>
                    <button class="modal-close" aria-label="Close dialog">&times;</button>
                </div>
                <div class="modal-body">
                    <dl class="keyboard-shortcuts">
                        <dt>Alt + 1</dt>
                        <dd>Jump to main content</dd>
                        <dt>Alt + 2</dt>
                        <dd>Jump to navigation</dd>
                        <dt>Alt + M</dt>
                        <dd>Open accessibility menu</dd>
                        <dt>Alt + H</dt>
                        <dd>List all headings</dd>
                        <dt>Alt + L</dt>
                        <dd>List all links</dd>
                        <dt>Tab</dt>
                        <dd>Move to next interactive element</dd>
                        <dt>Shift + Tab</dt>
                        <dd>Move to previous interactive element</dd>
                        <dt>Arrow Keys</dt>
                        <dd>Navigate within menus and tables</dd>
                        <dt>Escape</dt>
                        <dd>Close modal dialogs</dd>
                        <dt>Enter / Space</dt>
                        <dd>Activate buttons and links</dd>
                    </dl>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        this.trapFocus(helpModal);
        
        helpModal.querySelector('.modal-close').addEventListener('click', () => {
            helpModal.remove();
            this.releaseFocusTrap();
        });
        
        helpModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                helpModal.remove();
                this.releaseFocusTrap();
            }
        });
    }

    // Public API methods
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveAccessibilityPreferences();
    }

    getSettings() {
        return { ...this.settings };
    }

    announcePageChange(pageTitle) {
        this.announceToScreenReader(`Navigated to ${pageTitle}`, 'assertive');
    }

    announceFormError(fieldName, error) {
        this.announceToScreenReader(`Error in ${fieldName}: ${error}`, 'assertive');
    }

    announceSuccess(message) {
        this.announceToScreenReader(message, 'polite');
    }

    cleanup() {
        // Remove added elements
        const toolbar = document.querySelector('.accessibility-toolbar');
        if (toolbar) {
            toolbar.remove();
        }
        
        const skipLinks = document.querySelector('.skip-links');
        if (skipLinks) {
            skipLinks.remove();
        }
        
        // Clear event listeners
        document.removeEventListener('keydown', this.handleKeyboardNavigation);
        
        // Clear focus traps
        this.keyboardTrapStack.forEach(() => this.releaseFocusTrap());
        
        console.log('♿ Accessibility enhancer cleaned up');
    }

    // Helper methods
    enhanceExistingElements() {
        // Add missing ARIA labels
        this.addMissingAriaLabels();
        
        // Enhance form accessibility
        this.enhanceFormAccessibility();
        
        // Add landmarks
        this.addLandmarks();
    }

    addMissingAriaLabels() {
        // Add labels to buttons without text
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(button => {
            const icon = button.querySelector('i');
            if (icon && !button.textContent.trim()) {
                const label = this.getAriaLabelFromIcon(icon.className);
                if (label) {
                    button.setAttribute('aria-label', label);
                }
            }
        });
    }

    getAriaLabelFromIcon(iconClass) {
        const iconMap = {
            'fa-edit': 'Edit',
            'fa-trash': 'Delete',
            'fa-eye': 'View',
            'fa-download': 'Download',
            'fa-search': 'Search',
            'fa-filter': 'Filter',
            'fa-close': 'Close',
            'fa-bars': 'Menu'
        };
        
        for (const [icon, label] of Object.entries(iconMap)) {
            if (iconClass.includes(icon)) {
                return label;
            }
        }
        return null;
    }
}

// Initialize accessibility enhancer
window.accessibilityEnhancer = new AccessibilityEnhancer();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.accessibilityEnhancer.initialize();
    });
} else {
    window.accessibilityEnhancer.initialize();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessibilityEnhancer };
}
