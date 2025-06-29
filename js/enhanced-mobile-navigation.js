/**
 * Enhanced Mobile Navigation for Mining Royalties Manager
 * Provides improved mobile experience with gesture support and better touch interactions
 */

class EnhancedMobileNavigation {
    constructor() {
        this.isOpen = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.currentTransform = 0;
        this.threshold = 50; // Swipe threshold in pixels
        this.sidebar = null;
        this.overlay = null;
        this.toggleButton = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        console.log('📱 Initializing Enhanced Mobile Navigation...');

        this.sidebar = document.getElementById('sidebar');
        if (!this.sidebar) {
            console.error('Sidebar element not found');
            return;
        }

        this.createEnhancedToggleButton();
        this.setupGestureSupport();
        this.setupTouchInteractions();
        this.setupKeyboardSupport();
        this.setupResizeHandler();
        this.addEnhancedStyles();
        
        this.initialized = true;
        console.log('✅ Enhanced Mobile Navigation initialized');
    }

    createEnhancedToggleButton() {
        // Remove existing toggle button
        const existing = document.querySelector('.mobile-menu-toggle');
        if (existing) existing.remove();

        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'mobile-menu-toggle enhanced';
        this.toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
        this.toggleButton.setAttribute('aria-expanded', 'false');
        
        // Animated hamburger icon
        this.toggleButton.innerHTML = `
            <div class="hamburger-lines">
                <span class="line line1"></span>
                <span class="line line2"></span>
                <span class="line line3"></span>
            </div>
        `;

        this.toggleButton.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.toggleButton);
    }

    setupGestureSupport() {
        // Swipe to open/close navigation
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

        // Edge swipe detection
        this.setupEdgeSwipe();
    }

    setupEdgeSwipe() {
        let edgeSwipeStarted = false;

        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            // Detect swipe from left edge (first 20px)
            if (touch.clientX < 20 && !this.isOpen) {
                edgeSwipeStarted = true;
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (edgeSwipeStarted) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.touchStartX;
                
                if (deltaX > 30 && Math.abs(touch.clientY - this.touchStartY) < 100) {
                    this.open();
                    edgeSwipeStarted = false;
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            edgeSwipeStarted = false;
        }, { passive: true });
    }

    handleTouchStart(e) {
        if (!this.isMobileDevice()) return;

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    handleTouchMove(e) {
        if (!this.isOpen || !this.isMobileDevice()) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = Math.abs(touch.clientY - this.touchStartY);

        // Only handle horizontal swipes
        if (deltaY > 100) return;

        // Prevent scrolling when swiping
        if (Math.abs(deltaX) > 10) {
            e.preventDefault();
        }

        // Show sidebar sliding effect
        if (deltaX < 0) {
            const progress = Math.max(0, 1 + deltaX / 280);
            this.setSidebarTransform(progress);
        }
    }

    handleTouchEnd(e) {
        if (!this.isOpen || !this.isMobileDevice()) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;

        // Reset transform
        this.setSidebarTransform(1);

        // Close if swipe is significant enough
        if (deltaX < -this.threshold) {
            this.close();
        }
    }

    setSidebarTransform(progress) {
        if (this.sidebar) {
            const translateX = (1 - progress) * -100;
            this.sidebar.style.transform = `translateX(${translateX}%)`;
            
            // Adjust overlay opacity
            if (this.overlay) {
                this.overlay.style.opacity = progress * 0.5;
            }
        }
    }

    setupTouchInteractions() {
        // Improve touch targets
        document.querySelectorAll('.nav-link').forEach(link => {
            link.style.minHeight = '44px';
            link.style.display = 'flex';
            link.style.alignItems = 'center';
        });

        // Add touch feedback
        this.addTouchFeedback();
    }

    addTouchFeedback() {
        const style = document.createElement('style');
        style.textContent = `
            .touch-feedback {
                position: relative;
                overflow: hidden;
            }
            
            .touch-feedback::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.3s ease, height 0.3s ease;
                pointer-events: none;
            }
            
            .touch-feedback.active::before {
                width: 200px;
                height: 200px;
            }
        `;
        document.head.appendChild(style);

        // Add feedback to interactive elements
        document.querySelectorAll('.btn, .nav-link').forEach(el => {
            el.classList.add('touch-feedback');
            
            el.addEventListener('touchstart', () => {
                el.classList.add('active');
            });
            
            el.addEventListener('touchend', () => {
                setTimeout(() => el.classList.remove('active'), 150);
            });
        });
    }

    setupKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
            
            // Arrow key navigation in sidebar
            if (this.isOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                this.handleArrowNavigation(e);
            }
        });
    }

    handleArrowNavigation(e) {
        const navLinks = Array.from(this.sidebar.querySelectorAll('.nav-link'));
        const currentIndex = navLinks.findIndex(link => link === document.activeElement);
        
        let nextIndex;
        if (e.key === 'ArrowUp') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : navLinks.length - 1;
        } else {
            nextIndex = currentIndex < navLinks.length - 1 ? currentIndex + 1 : 0;
        }
        
        navLinks[nextIndex].focus();
        e.preventDefault();
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateVisibility();
                if (window.innerWidth > 768 && this.isOpen) {
                    this.close();
                }
            }, 100);
        });
    }

    addEnhancedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-toggle.enhanced {
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 1001;
                background: var(--primary-color);
                border: none;
                border-radius: 12px;
                width: 52px;
                height: 52px;
                display: none;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .mobile-menu-toggle.enhanced:hover {
                background: var(--primary-dark);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            
            .mobile-menu-toggle.enhanced:active {
                transform: translateY(0);
            }
            
            .hamburger-lines {
                width: 24px;
                height: 18px;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .hamburger-lines .line {
                width: 100%;
                height: 2px;
                background: white;
                border-radius: 1px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .mobile-menu-toggle.enhanced.active .line1 {
                transform: rotate(45deg) translate(6px, 6px);
            }
            
            .mobile-menu-toggle.enhanced.active .line2 {
                opacity: 0;
                transform: scaleX(0);
            }
            
            .mobile-menu-toggle.enhanced.active .line3 {
                transform: rotate(-45deg) translate(7px, -6px);
            }
            
            @media (max-width: 768px) {
                .mobile-menu-toggle.enhanced {
                    display: flex !important;
                }
                
                .sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 280px;
                    height: 100vh;
                    transform: translateX(-100%);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1000;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                }
                
                .sidebar.mobile-open {
                    transform: translateX(0);
                }
                
                .main-content {
                    margin-left: 0;
                    padding-top: 5rem;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .main-content.sidebar-open {
                    transform: translateX(20px) scale(0.95);
                }
            }
            
            .mobile-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(2px);
            }
            
            .mobile-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            /* Enhanced sidebar styling for mobile */
            @media (max-width: 768px) {
                .sidebar nav ul {
                    padding: 1rem 0;
                }
                
                .sidebar nav ul li {
                    margin-bottom: 0.25rem;
                }
                
                .sidebar nav ul li a {
                    padding: 1rem 1.5rem;
                    border-radius: 0;
                    transition: all 0.2s ease;
                    border-left: 4px solid transparent;
                }
                
                .sidebar nav ul li a:hover,
                .sidebar nav ul li a.active {
                    background: rgba(26, 54, 93, 0.1);
                    border-left-color: var(--primary-color);
                }
                
                .sidebar nav ul li a i {
                    width: 24px;
                    text-align: center;
                    margin-right: 1rem;
                }
            }
            
            /* Smooth scrolling for mobile */
            @media (max-width: 768px) {
                .sidebar {
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }
            }
            
            /* Focus styles for accessibility */
            .mobile-menu-toggle.enhanced:focus {
                outline: 2px solid var(--accent-color);
                outline-offset: 2px;
            }
            
            .sidebar nav a:focus {
                outline: 2px solid var(--primary-color);
                outline-offset: -2px;
            }
        `;
        document.head.appendChild(style);
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.sidebar.classList.add('mobile-open');
        this.toggleButton.classList.add('active');
        this.toggleButton.setAttribute('aria-expanded', 'true');
        
        this.createOverlay();
        this.lockBodyScroll();
        
        // Add transform to main content for iOS-style effect
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('sidebar-open');
        }

        // Focus first navigation item for accessibility
        setTimeout(() => {
            const firstNavLink = this.sidebar.querySelector('.nav-link');
            if (firstNavLink) {
                firstNavLink.focus();
            }
        }, 100);
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.sidebar.classList.remove('mobile-open');
        this.toggleButton.classList.remove('active');
        this.toggleButton.setAttribute('aria-expanded', 'false');
        
        this.removeOverlay();
        this.unlockBodyScroll();
        
        // Remove transform from main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('sidebar-open');
        }

        // Reset any transform changes
        this.sidebar.style.transform = '';
    }

    createOverlay() {
        this.removeOverlay(); // Remove existing overlay

        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-overlay';
        this.overlay.addEventListener('click', () => this.close());
        document.body.appendChild(this.overlay);

        // Force reflow for transition
        this.overlay.offsetHeight;
        this.overlay.classList.add('active');
    }

    removeOverlay() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
                this.overlay = null;
            }, 300);
        }
    }

    lockBodyScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }

    unlockBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }

    updateVisibility() {
        const isMobile = window.innerWidth <= 768;
        this.toggleButton.style.display = isMobile ? 'flex' : 'none';
    }

    isMobileDevice() {
        return window.innerWidth <= 768;
    }

    // Public API for integration
    isNavigationOpen() {
        return this.isOpen;
    }

    setNavigationState(isOpen) {
        if (isOpen && !this.isOpen) {
            this.open();
        } else if (!isOpen && this.isOpen) {
            this.close();
        }
    }

    cleanup() {
        if (this.toggleButton && this.toggleButton.parentNode) {
            this.toggleButton.parentNode.removeChild(this.toggleButton);
        }
        
        this.removeOverlay();
        this.unlockBodyScroll();
        
        // Reset any transforms
        if (this.sidebar) {
            this.sidebar.style.transform = '';
            this.sidebar.classList.remove('mobile-open');
        }
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('sidebar-open');
        }
    }
}

// Initialize enhanced mobile navigation
window.enhancedMobileNav = new EnhancedMobileNavigation();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedMobileNav.initialize();
    });
} else {
    window.enhancedMobileNav.initialize();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedMobileNavigation };
}
