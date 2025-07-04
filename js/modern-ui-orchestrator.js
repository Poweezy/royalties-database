/**
 * Modern UI/UX Orchestrator
 * Coordinates and manages all modern UI/UX enhancements
 */

class ModernUIOrchestrator {
    constructor() {
        this.initialized = false;
        this.components = new Map();
        this.animations = new Map();
        this.observers = new Map();
        this.settings = {
            glassEffects: true,
            animations: true,
            parallax: true,
            particleEffects: false,
            autoTheme: true,
            performance: 'balanced' // 'high', 'balanced', 'low'
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.setupGlassMorphism = this.setupGlassMorphism.bind(this);
        this.setupMicroInteractions = this.setupMicroInteractions.bind(this);
        this.setupAdvancedAnimations = this.setupAdvancedAnimations.bind(this);
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Modern UI/UX Orchestrator...');
        
        try {
            // Load user preferences
            await this.loadUserPreferences();
            
            // Setup core UI enhancements
            await this.setupCoreEnhancements();
            
            // Setup glass morphism effects
            this.setupGlassMorphism();
            
            // Setup micro-interactions
            this.setupMicroInteractions();
            
            // Setup advanced animations
            this.setupAdvancedAnimations();
            
            // Setup responsive design enhancements
            this.setupResponsiveEnhancements();
            
            // Setup accessibility features
            this.setupAccessibilityEnhancements();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Apply initial theme
            this.applyTheme();
            
            this.initialized = true;
            console.log('✅ Modern UI/UX Orchestrator initialized successfully');
            
            // Emit initialization event
            this.emit('modern-ui-initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Modern UI/UX Orchestrator:', error);
        }
    }

    async loadUserPreferences() {
        try {
            const stored = localStorage.getItem('modern-ui-preferences');
            if (stored) {
                this.settings = { ...this.settings, ...JSON.parse(stored) };
            }
            
            // Check system preferences
            if (this.settings.autoTheme) {
                this.settings.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            
            // Check performance preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.settings.animations = false;
            }
            
        } catch (error) {
            console.warn('⚠️ Could not load UI preferences:', error);
        }
    }

    async setupCoreEnhancements() {
        // Add modern UI classes to key elements
        document.body.classList.add('modern-ui-enabled');
        
        // Enhance existing cards
        document.querySelectorAll('.card').forEach(card => {
            if (!card.classList.contains('glass-card')) {
                card.classList.add('glass-card', 'hover-lift');
            }
        });
        
        // Enhance existing buttons
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.classList.contains('btn-modern')) {
                btn.classList.add('btn-modern');
                if (btn.classList.contains('btn-primary')) {
                    btn.classList.add('btn-modern-primary');
                }
            }
        });
        
        // Enhance existing forms
        document.querySelectorAll('input, select, textarea').forEach(input => {
            if (!input.classList.contains('input-modern')) {
                input.classList.add('input-modern', 'focus-ring');
            }
        });
    }

    setupGlassMorphism() {
        if (!this.settings.glassEffects) return;
        
        // Create glass morphism observer
        const glassObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('glass-active');
                    this.animateGlassEntry(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observe glass elements
        document.querySelectorAll('.glass-card').forEach(element => {
            glassObserver.observe(element);
        });
        
        this.observers.set('glass', glassObserver);
    }

    setupMicroInteractions() {
        // Enhanced button interactions
        this.setupButtonInteractions();
        
        // Card hover effects
        this.setupCardInteractions();
        
        // Form field interactions
        this.setupFormInteractions();
        
        // Navigation interactions
        this.setupNavigationInteractions();
    }

    setupButtonInteractions() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-modern');
            if (!btn) return;
            
            // Create ripple effect
            this.createRippleEffect(btn, e);
            
            // Add click animation
            btn.style.transform = 'scale(0.98)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        });
        
        // Hover sound effect (if enabled)
        document.addEventListener('mouseenter', (e) => {
            const btn = e.target.closest('.btn-modern');
            if (btn && this.settings.soundEffects) {
                this.playHoverSound();
            }
        }, true);
    }

    setupCardInteractions() {
        document.querySelectorAll('.glass-card').forEach(card => {
            let timeout;
            
            card.addEventListener('mouseenter', () => {
                clearTimeout(timeout);
                card.style.transform = 'translateY(-8px) scale(1.02)';
                
                // Add glow effect
                if (this.settings.glowEffects) {
                    card.classList.add('pulse-glow');
                }
            });
            
            card.addEventListener('mouseleave', () => {
                timeout = setTimeout(() => {
                    card.style.transform = '';
                    card.classList.remove('pulse-glow');
                }, 100);
            });
        });
    }

    setupFormInteractions() {
        document.querySelectorAll('.input-modern').forEach(input => {
            const container = input.parentElement;
            
            input.addEventListener('focus', () => {
                container.classList.add('input-focused');
                this.animateInputFocus(input);
            });
            
            input.addEventListener('blur', () => {
                container.classList.remove('input-focused');
                this.animateInputBlur(input);
            });
            
            // Real-time validation feedback
            input.addEventListener('input', () => {
                this.validateInputRealTime(input);
            });
        });
    }

    setupNavigationInteractions() {
        document.querySelectorAll('.nav-link-modern').forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active from siblings
                link.parentElement.querySelectorAll('.nav-link-modern').forEach(l => {
                    l.classList.remove('active');
                });
                
                // Add active to clicked link
                link.classList.add('active');
                
                // Create transition effect
                this.createPageTransition();
            });
        });
    }

    setupAdvancedAnimations() {
        if (!this.settings.animations) return;
        
        // Scroll-triggered animations
        this.setupScrollAnimations();
        
        // Parallax effects
        if (this.settings.parallax) {
            this.setupParallaxEffects();
        }
        
        // Particle effects
        if (this.settings.particleEffects) {
            this.setupParticleEffects();
        }
        
        // Data visualization animations
        this.setupDataAnimations();
    }

    setupScrollAnimations() {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    
                    // Stagger animations for children
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('fade-in');
                        }, index * 100);
                    });
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe animatable elements
        document.querySelectorAll('.charts-grid, .data-card-modern, .glass-card').forEach(element => {
            scrollObserver.observe(element);
        });
        
        this.observers.set('scroll', scrollObserver);
    }

    setupParallaxEffects() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };
        
        const requestParallaxUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
    }

    setupParticleEffects() {
        // Create canvas for particle effects
        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.3;
        `;
        document.body.appendChild(canvas);
        
        // Initialize particle system
        this.initParticleSystem(canvas);
    }

    setupDataAnimations() {
        // Animate metric values on scroll
        const animateMetrics = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const value = element.textContent;
                    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
                    
                    if (!isNaN(numericValue)) {
                        this.animateCounter(element, 0, numericValue, 2000);
                    }
                }
            });
        };
        
        const metricsObserver = new IntersectionObserver(animateMetrics, { threshold: 0.5 });
        
        document.querySelectorAll('.metric-value-modern').forEach(metric => {
            metricsObserver.observe(metric);
        });
        
        this.observers.set('metrics', metricsObserver);
    }

    setupResponsiveEnhancements() {
        // Adaptive UI based on screen size
        const updateResponsiveUI = () => {
            const width = window.innerWidth;
            const isMobile = width < 768;
            const isTablet = width >= 768 && width < 1024;
            
            document.body.classList.toggle('mobile-ui', isMobile);
            document.body.classList.toggle('tablet-ui', isTablet);
            document.body.classList.toggle('desktop-ui', width >= 1024);
            
            // Adjust glass effects for mobile
            if (isMobile && this.settings.performance === 'low') {
                document.body.classList.add('reduced-effects');
            } else {
                document.body.classList.remove('reduced-effects');
            }
        };
        
        updateResponsiveUI();
        window.addEventListener('resize', updateResponsiveUI);
    }

    setupAccessibilityEnhancements() {
        // High contrast mode
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'H') {
                this.toggleHighContrast();
            }
        });
        
        // Focus management
        this.setupFocusManagement();
        
        // Screen reader enhancements
        this.setupScreenReaderEnhancements();
    }

    setupPerformanceMonitoring() {
        // Monitor frame rate
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkFrameRate = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust quality based on performance
                if (fps < 30 && this.settings.performance !== 'low') {
                    this.adjustPerformance('reduce');
                } else if (fps > 55 && this.settings.performance === 'low') {
                    this.adjustPerformance('increase');
                }
            }
            
            requestAnimationFrame(checkFrameRate);
        };
        
        requestAnimationFrame(checkFrameRate);
    }

    // Helper Methods
    createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            margin-top: -10px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    animateGlassEntry(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        }, 100);
    }

    animateInputFocus(input) {
        input.style.transform = 'scale(1.02)';
        
        // Create focus indicator
        const indicator = document.createElement('div');
        indicator.className = 'focus-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid var(--ui-primary);
            border-radius: inherit;
            pointer-events: none;
            animation: focusPulse 0.3s ease-out;
        `;
        
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 300);
    }

    animateInputBlur(input) {
        input.style.transform = '';
    }

    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const suffix = element.textContent.replace(/[0-9.]/g, '');
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOut;
            
            element.textContent = Math.floor(current) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    createPageTransition() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, var(--ui-primary), var(--ui-accent));
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '0.8';
        }, 10);
        
        // Animate out
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }, 150);
    }

    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        this.settings.highContrast = document.body.classList.contains('high-contrast');
        this.saveSettings();
    }

    adjustPerformance(direction) {
        const levels = ['low', 'balanced', 'high'];
        const currentIndex = levels.indexOf(this.settings.performance);
        
        if (direction === 'reduce' && currentIndex > 0) {
            this.settings.performance = levels[currentIndex - 1];
        } else if (direction === 'increase' && currentIndex < levels.length - 1) {
            this.settings.performance = levels[currentIndex + 1];
        }
        
        this.applyPerformanceSettings();
        this.saveSettings();
    }

    applyPerformanceSettings() {
        const body = document.body;
        
        body.classList.remove('performance-low', 'performance-balanced', 'performance-high');
        body.classList.add(`performance-${this.settings.performance}`);
        
        if (this.settings.performance === 'low') {
            this.settings.glassEffects = false;
            this.settings.parallax = false;
            this.settings.particleEffects = false;
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme || 'light');
    }

    setupFocusManagement() {
        // Enhance focus visibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupScreenReaderEnhancements() {
        // Add live region for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-label', 'Status updates');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
    }

    // Public API
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Apply changes immediately
        switch (key) {
            case 'theme':
                this.applyTheme();
                break;
            case 'performance':
                this.applyPerformanceSettings();
                break;
            case 'animations':
                document.body.classList.toggle('no-animations', !value);
                break;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('modern-ui-preferences', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Could not save UI preferences:', error);
        }
    }

    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Remove event listeners
        // (In a real implementation, you'd track and remove all listeners)
        
        // Remove added elements
        const particlesCanvas = document.getElementById('particles-canvas');
        if (particlesCanvas) {
            particlesCanvas.remove();
        }
        
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
        
        this.initialized = false;
    }
}

// Add required CSS for animations
const modernUIStyles = document.createElement('style');
modernUIStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes focusPulse {
        0% {
            transform: scale(1);
            opacity: 0;
        }
        50% {
            transform: scale(1.02);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
    
    .modern-ui-enabled {
        --spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        --smooth: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .reduced-effects * {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
    }
    
    .no-animations * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    
    .high-contrast {
        filter: contrast(150%) brightness(120%);
    }
    
    .keyboard-navigation *:focus {
        outline: 3px solid var(--ui-primary) !important;
        outline-offset: 2px !important;
    }
    
    .performance-low .glass-card {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        background: rgba(255, 255, 255, 0.9);
    }
    
    .performance-low .btn-modern::before {
        display: none;
    }
`;

document.head.appendChild(modernUIStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.modernUIOrchestrator = new ModernUIOrchestrator();
        window.modernUIOrchestrator.init();
    });
} else {
    window.modernUIOrchestrator = new ModernUIOrchestrator();
    window.modernUIOrchestrator.init();
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernUIOrchestrator;
}
