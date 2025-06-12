export class MobileNavigationManager {
    constructor() {
        this.isOpen = false;
        this.overlay = null;
        this.toggleButton = null;
        this.init();
    }

    init() {
        this.createToggleButton();
        this.setupEventListeners();
        this.updateVisibility();
    }

    createToggleButton() {
        // Remove existing button
        const existing = document.querySelector('.mobile-menu-toggle');
        if (existing) existing.remove();

        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'mobile-menu-toggle';
        this.toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
        this.toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
        this.toggleButton.setAttribute('aria-expanded', 'false');
        
        document.body.appendChild(this.toggleButton);
    }

    setupEventListeners() {
        // Toggle button
        this.toggleButton.addEventListener('click', () => this.toggle());

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Update visibility on resize
        window.addEventListener('resize', () => {
            this.updateVisibility();
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });

        // Close when clicking navigation links
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('.nav-link');
            if (navLink && this.isOpen) {
                setTimeout(() => this.close(), 100);
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        this.isOpen = true;
        sidebar.classList.add('mobile-open');
        this.toggleButton.innerHTML = '<i class="fas fa-times"></i>';
        this.toggleButton.setAttribute('aria-expanded', 'true');
        
        this.createOverlay();
        
        // Focus trap
        const firstFocusable = sidebar.querySelector('a, button, [tabindex]');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    close() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        this.isOpen = false;
        sidebar.classList.remove('mobile-open');
        this.toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
        this.toggleButton.setAttribute('aria-expanded', 'false');
        
        this.removeOverlay();
        
        // Return focus to toggle button
        this.toggleButton.focus();
    }

    createOverlay() {
        if (this.overlay) return;

        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-overlay';
        this.overlay.addEventListener('click', () => this.close());
        
        document.body.appendChild(this.overlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
        });
    }

    removeOverlay() {
        if (!this.overlay) return;

        this.overlay.classList.remove('active');
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
        }, 300);
    }

    updateVisibility() {
        const isMobile = window.innerWidth <= 768;
        this.toggleButton.style.display = isMobile ? 'flex' : 'none';
    }

    destroy() {
        this.close();
        if (this.toggleButton) {
            this.toggleButton.remove();
        }
        if (this.overlay) {
            this.overlay.remove();
        }
    }
}
