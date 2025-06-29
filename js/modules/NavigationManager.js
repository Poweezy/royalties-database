/**
 * Navigation Manager Module
 * Handles navigation state, routing, and user interface transitions
 */

class NavigationManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.previousSection = null;
        this.navigationHistory = [];
        this.maxHistoryLength = 10;
        this.isNavigating = false;
        this.navigationCallbacks = new Map();
        
        this.init();
    }

    init() {
        console.log('🧭 NavigationManager: Initializing...');
        this.setupEventListeners();
        this.restoreNavigationState();
        this.updateActiveNavigation();
    }

    setupEventListeners() {
        // Listen for navigation clicks
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-section]');
            if (navLink) {
                e.preventDefault();
                const section = navLink.getAttribute('data-section');
                this.navigateTo(section);
            }
        });

        // Listen for back/forward browser buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.navigateTo(e.state.section, false); // Don't push to history
            }
        });

        // Listen for keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Home':
                        e.preventDefault();
                        this.navigateTo('dashboard');
                        break;
                    case 'ArrowLeft':
                        if (e.altKey) {
                            e.preventDefault();
                            this.goBack();
                        }
                        break;
                    case 'ArrowRight':
                        if (e.altKey) {
                            e.preventDefault();
                            this.goForward();
                        }
                        break;
                }
            }
        });
    }

    async navigateTo(section, pushToHistory = true) {
        if (this.isNavigating || section === this.currentSection) {
            return false;
        }

        console.log(`🧭 NavigationManager: Navigating from "${this.currentSection}" to "${section}"`);
        
        this.isNavigating = true;
        
        try {
            // Validate section exists
            if (!this.validateSection(section)) {
                throw new Error(`Invalid section: ${section}`);
            }

            // Store previous section
            this.previousSection = this.currentSection;
            
            // Add to history
            if (pushToHistory) {
                this.addToHistory(this.currentSection);
                this.updateBrowserHistory(section);
            }

            // Execute pre-navigation callbacks
            await this.executeCallbacks('beforeNavigate', { from: this.currentSection, to: section });

            // Perform the navigation
            const success = await this.performNavigation(section);
            
            if (success) {
                this.currentSection = section;
                this.updateActiveNavigation();
                this.storeNavigationState();
                
                // Execute post-navigation callbacks
                await this.executeCallbacks('afterNavigate', { from: this.previousSection, to: section });
                
                // Trigger global navigation event
                this.triggerNavigationEvent(section);
                
                console.log(`✅ NavigationManager: Successfully navigated to "${section}"`);
                return true;
            } else {
                throw new Error('Navigation failed');
            }
            
        } catch (error) {
            console.error(`❌ NavigationManager: Navigation to "${section}" failed:`, error);
            
            // Show user-friendly error
            if (window.notificationManager) {
                window.notificationManager.show(
                    `Failed to navigate to ${section}. Please try again.`,
                    'error',
                    5000
                );
            }
            
            return false;
        } finally {
            this.isNavigating = false;
        }
    }

    validateSection(section) {
        const validSections = [
            'dashboard',
            'user-management',
            'royalty-records',
            'contract-management',
            'compliance',
            'regulatory-management',
            'reporting-analytics',
            'notifications',
            'profile',
            'communication'
        ];
        
        return validSections.includes(section);
    }

    async performNavigation(section) {
        try {
            // Hide current section
            this.hideCurrentSection();
            
            // Show loading state
            this.showLoadingState(section);
            
            // Load new section content
            const contentLoaded = await this.loadSectionContent(section);
            
            if (contentLoaded) {
                // Show new section
                this.showSection(section);
                
                // Hide loading state
                this.hideLoadingState();
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            this.hideLoadingState();
            throw error;
        }
    }

    hideCurrentSection() {
        const sections = document.querySelectorAll('.section, .content-section, [id$="-section"]');
        sections.forEach(section => {
            if (section.style.display !== 'none') {
                section.style.display = 'none';
                section.setAttribute('aria-hidden', 'true');
            }
        });
    }

    showSection(section) {
        const sectionElement = document.getElementById(`${section}-section`) || 
                              document.getElementById(section) ||
                              document.querySelector(`[data-section="${section}"]`);
        
        if (sectionElement) {
            sectionElement.style.display = 'block';
            sectionElement.removeAttribute('aria-hidden');
            
            // Focus management for accessibility
            const focusElement = sectionElement.querySelector('h1, h2, [tabindex="0"], button, input') || sectionElement;
            if (focusElement && focusElement.focus) {
                setTimeout(() => focusElement.focus(), 100);
            }
        }
    }

    showLoadingState(section) {
        // Create or show loading indicator
        let loader = document.getElementById('navigation-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'navigation-loader';
            loader.className = 'navigation-loading';
            loader.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading ${this.formatSectionName(section)}...</div>
            `;
            document.body.appendChild(loader);
        }
        
        loader.style.display = 'flex';
        loader.setAttribute('aria-live', 'polite');
    }

    hideLoadingState() {
        const loader = document.getElementById('navigation-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    async loadSectionContent(section) {
        try {
            // Try unified component loader first
            if (window.unifiedComponentLoader) {
                const targetElement = document.getElementById(`${section}-section`) || 
                                    document.getElementById(section) ||
                                    document.querySelector(`[data-section="${section}"]`);
                
                if (targetElement) {
                    const result = await window.unifiedComponentLoader.loadComponent(section, targetElement);
                    return result.success;
                }
            }
            
            // Fallback to main app loader
            if (window.app && window.app.loadSectionContent) {
                await window.app.loadSectionContent(section);
                return true;
            }
            
            if (window.royaltiesApp && window.royaltiesApp.loadSectionContent) {
                await window.royaltiesApp.loadSectionContent(section);
                return true;
            }
            
            console.warn(`NavigationManager: No content loader available for section "${section}"`);
            return false;
            
        } catch (error) {
            console.error(`NavigationManager: Failed to load content for section "${section}":`, error);
            return false;
        }
    }

    updateActiveNavigation() {
        // Update navigation UI
        const navLinks = document.querySelectorAll('[data-section]');
        navLinks.forEach(link => {
            const linkSection = link.getAttribute('data-section');
            const isActive = linkSection === this.currentSection;
            
            link.classList.toggle('active', isActive);
            link.classList.toggle('current-page', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // Update page title
        this.updatePageTitle();
        
        // Update breadcrumbs if they exist
        this.updateBreadcrumbs();
    }

    updatePageTitle() {
        const sectionName = this.formatSectionName(this.currentSection);
        document.title = `${sectionName} - Mining Royalties Manager`;
    }

    updateBreadcrumbs() {
        const breadcrumbs = document.querySelector('.breadcrumbs, .breadcrumb');
        if (breadcrumbs) {
            const sectionName = this.formatSectionName(this.currentSection);
            breadcrumbs.innerHTML = `
                <span class="breadcrumb-item">
                    <a href="#" data-section="dashboard">Dashboard</a>
                </span>
                ${this.currentSection !== 'dashboard' ? `
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item active">${sectionName}</span>
                ` : ''}
            `;
        }
    }

    formatSectionName(section) {
        return section
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    addToHistory(section) {
        this.navigationHistory.push({
            section,
            timestamp: Date.now(),
            url: window.location.href
        });
        
        // Maintain max history length
        if (this.navigationHistory.length > this.maxHistoryLength) {
            this.navigationHistory.shift();
        }
    }

    updateBrowserHistory(section) {
        const url = new URL(window.location);
        url.hash = section;
        
        window.history.pushState(
            { section, timestamp: Date.now() },
            `${this.formatSectionName(section)} - Mining Royalties Manager`,
            url.toString()
        );
    }

    goBack() {
        if (this.navigationHistory.length > 0) {
            const previous = this.navigationHistory.pop();
            this.navigateTo(previous.section, false);
        } else if (this.previousSection) {
            this.navigateTo(this.previousSection);
        }
    }

    goForward() {
        window.history.forward();
    }

    storeNavigationState() {
        try {
            const state = {
                currentSection: this.currentSection,
                previousSection: this.previousSection,
                timestamp: Date.now()
            };
            localStorage.setItem('navigationState', JSON.stringify(state));
        } catch (error) {
            console.warn('NavigationManager: Failed to store navigation state:', error);
        }
    }

    restoreNavigationState() {
        try {
            const stored = localStorage.getItem('navigationState');
            if (stored) {
                const state = JSON.parse(stored);
                
                // Only restore if recent (within 1 hour)
                if (Date.now() - state.timestamp < 3600000) {
                    this.currentSection = state.currentSection || 'dashboard';
                    this.previousSection = state.previousSection;
                    return;
                }
            }
        } catch (error) {
            console.warn('NavigationManager: Failed to restore navigation state:', error);
        }
        
        // Default to dashboard
        this.currentSection = 'dashboard';
    }

    registerCallback(event, callback) {
        if (!this.navigationCallbacks.has(event)) {
            this.navigationCallbacks.set(event, []);
        }
        this.navigationCallbacks.get(event).push(callback);
    }

    unregisterCallback(event, callback) {
        if (this.navigationCallbacks.has(event)) {
            const callbacks = this.navigationCallbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    async executeCallbacks(event, data) {
        if (this.navigationCallbacks.has(event)) {
            const callbacks = this.navigationCallbacks.get(event);
            for (const callback of callbacks) {
                try {
                    await callback(data);
                } catch (error) {
                    console.error(`NavigationManager: Callback error for event "${event}":`, error);
                }
            }
        }
    }

    triggerNavigationEvent(section) {
        const event = new CustomEvent('navigationChange', {
            detail: {
                currentSection: this.currentSection,
                previousSection: this.previousSection,
                section: section
            }
        });
        
        document.dispatchEvent(event);
    }

    // Public API methods
    getCurrentSection() {
        return this.currentSection;
    }

    getPreviousSection() {
        return this.previousSection;
    }

    getNavigationHistory() {
        return [...this.navigationHistory];
    }

    isCurrentSection(section) {
        return this.currentSection === section;
    }

    canGoBack() {
        return this.navigationHistory.length > 0 || this.previousSection !== null;
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navigationManager = new NavigationManager();
    });
} else {
    window.navigationManager = new NavigationManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}
