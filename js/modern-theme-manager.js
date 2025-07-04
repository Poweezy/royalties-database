/**
 * Advanced Modern Theme Manager
 * Handles dynamic theming, color schemes, and visual preferences
 */

class ModernThemeManager {
    constructor() {
        this.themes = new Map();
        this.currentTheme = 'system';
        this.colorScheme = 'auto';
        this.customColors = new Map();
        this.transitions = true;
        this.initialized = false;
        
        // Initialize default themes
        this.initializeDefaultThemes();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.applyTheme = this.applyTheme.bind(this);
        this.generateCustomTheme = this.generateCustomTheme.bind(this);
    }

    initializeDefaultThemes() {
        // Light theme
        this.themes.set('light', {
            name: 'Light',
            colors: {
                primary: '#2563eb',
                primaryDark: '#1d4ed8',
                primaryLight: '#3b82f6',
                secondary: '#64748b',
                accent: '#06b6d4',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
                info: '#3b82f6',
                
                // Surfaces
                background: '#ffffff',
                surface: '#f8fafc',
                surfaceVariant: '#f1f5f9',
                
                // Text
                onBackground: '#1e293b',
                onSurface: '#334155',
                onSurfaceVariant: '#64748b',
                
                // Glass morphism
                glass: 'rgba(255, 255, 255, 0.1)',
                glassStrong: 'rgba(255, 255, 255, 0.2)',
                glassBorder: 'rgba(255, 255, 255, 0.18)',
                
                // Shadows
                shadow: 'rgba(0, 0, 0, 0.1)',
                shadowStrong: 'rgba(0, 0, 0, 0.25)'
            },
            gradients: {
                primary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                surface: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
            }
        });

        // Dark theme
        this.themes.set('dark', {
            name: 'Dark',
            colors: {
                primary: '#3b82f6',
                primaryDark: '#2563eb',
                primaryLight: '#60a5fa',
                secondary: '#94a3b8',
                accent: '#22d3ee',
                success: '#34d399',
                warning: '#fbbf24',
                danger: '#f87171',
                info: '#60a5fa',
                
                // Surfaces
                background: '#0f172a',
                surface: '#1e293b',
                surfaceVariant: '#334155',
                
                // Text
                onBackground: '#f8fafc',
                onSurface: '#e2e8f0',
                onSurfaceVariant: '#cbd5e1',
                
                // Glass morphism
                glass: 'rgba(0, 0, 0, 0.2)',
                glassStrong: 'rgba(0, 0, 0, 0.4)',
                glassBorder: 'rgba(255, 255, 255, 0.1)',
                
                // Shadows
                shadow: 'rgba(0, 0, 0, 0.3)',
                shadowStrong: 'rgba(0, 0, 0, 0.5)'
            },
            gradients: {
                primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                surface: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                glass: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1))'
            }
        });

        // Ocean theme
        this.themes.set('ocean', {
            name: 'Ocean',
            colors: {
                primary: '#0891b2',
                primaryDark: '#0e7490',
                primaryLight: '#06b6d4',
                secondary: '#475569',
                accent: '#06b6d4',
                success: '#059669',
                warning: '#d97706',
                danger: '#dc2626',
                info: '#0284c7',
                
                // Surfaces
                background: '#f0f9ff',
                surface: '#e0f2fe',
                surfaceVariant: '#bae6fd',
                
                // Text
                onBackground: '#0c4a6e',
                onSurface: '#164e63',
                onSurfaceVariant: '#0369a1',
                
                // Glass morphism
                glass: 'rgba(14, 165, 233, 0.1)',
                glassStrong: 'rgba(14, 165, 233, 0.2)',
                glassBorder: 'rgba(14, 165, 233, 0.18)',
                
                // Shadows
                shadow: 'rgba(14, 165, 233, 0.15)',
                shadowStrong: 'rgba(14, 165, 233, 0.3)'
            },
            gradients: {
                primary: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                surface: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                glass: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.05))'
            }
        });

        // Forest theme
        this.themes.set('forest', {
            name: 'Forest',
            colors: {
                primary: '#059669',
                primaryDark: '#047857',
                primaryLight: '#10b981',
                secondary: '#6b7280',
                accent: '#34d399',
                success: '#22c55e',
                warning: '#f59e0b',
                danger: '#ef4444',
                info: '#3b82f6',
                
                // Surfaces
                background: '#f0fdf4',
                surface: '#dcfce7',
                surfaceVariant: '#bbf7d0',
                
                // Text
                onBackground: '#14532d',
                onSurface: '#166534',
                onSurfaceVariant: '#15803d',
                
                // Glass morphism
                glass: 'rgba(34, 197, 94, 0.1)',
                glassStrong: 'rgba(34, 197, 94, 0.2)',
                glassBorder: 'rgba(34, 197, 94, 0.18)',
                
                // Shadows
                shadow: 'rgba(34, 197, 94, 0.15)',
                shadowStrong: 'rgba(34, 197, 94, 0.3)'
            },
            gradients: {
                primary: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                surface: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                glass: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))'
            }
        });
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🎨 Initializing Modern Theme Manager...');
        
        try {
            // Load saved preferences
            await this.loadPreferences();
            
            // Set up system theme detection
            this.setupSystemThemeDetection();
            
            // Set up color scheme detection
            this.setupColorSchemeDetection();
            
            // Apply initial theme
            await this.applyTheme(this.currentTheme);
            
            // Set up theme controls
            this.setupThemeControls();
            
            this.initialized = true;
            console.log('✅ Modern Theme Manager initialized successfully');
            
            // Emit initialization event
            this.emit('theme-manager-initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Theme Manager:', error);
        }
    }

    async loadPreferences() {
        try {
            const stored = localStorage.getItem('modern-theme-preferences');
            if (stored) {
                const prefs = JSON.parse(stored);
                this.currentTheme = prefs.theme || 'system';
                this.colorScheme = prefs.colorScheme || 'auto';
                this.transitions = prefs.transitions !== false;
                this.customColors = new Map(prefs.customColors || []);
            }
        } catch (error) {
            console.warn('⚠️ Could not load theme preferences:', error);
        }
    }

    setupSystemThemeDetection() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = () => {
            if (this.currentTheme === 'system') {
                this.applySystemTheme();
            }
        };
        
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        
        // Initial check
        if (this.currentTheme === 'system') {
            this.applySystemTheme();
        }
    }

    setupColorSchemeDetection() {
        // Detect user's preferred contrast
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        contrastQuery.addEventListener('change', () => {
            this.applyAccessibilityPreferences();
        });
        
        // Detect motion preferences
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addEventListener('change', () => {
            this.transitions = !motionQuery.matches;
            this.applyMotionPreferences();
        });
        
        // Initial application
        this.applyAccessibilityPreferences();
        this.applyMotionPreferences();
    }

    async applyTheme(themeName) {
        let theme;
        
        if (themeName === 'system') {
            theme = this.getSystemTheme();
        } else if (themeName === 'custom') {
            theme = this.generateCustomTheme();
        } else {
            theme = this.themes.get(themeName);
        }
        
        if (!theme) {
            console.warn(`Theme "${themeName}" not found, falling back to light theme`);
            theme = this.themes.get('light');
        }
        
        // Apply CSS custom properties
        this.applyCSSVariables(theme);
        
        // Apply theme class
        this.applyThemeClass(themeName);
        
        // Update meta theme color
        this.updateMetaThemeColor(theme.colors.primary);
        
        // Trigger transition animation
        if (this.transitions) {
            this.animateThemeTransition();
        }
        
        // Save current theme
        this.currentTheme = themeName;
        this.savePreferences();
        
        // Emit theme change event
        this.emit('theme-changed', { theme: themeName, colors: theme.colors });
        
        console.log(`🎨 Applied theme: ${theme.name}`);
    }

    applyCSSVariables(theme) {
        const root = document.documentElement;
        
        // Apply color variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--theme-${key}`, value);
        });
        
        // Apply gradient variables
        Object.entries(theme.gradients).forEach(([key, value]) => {
            root.style.setProperty(`--gradient-${key}`, value);
        });
        
        // Apply derived variables
        this.applyDerivedVariables(theme);
    }

    applyDerivedVariables(theme) {
        const root = document.documentElement;
        
        // Generate alpha variants for each color
        Object.entries(theme.colors).forEach(([key, value]) => {
            if (value.startsWith('#')) {
                const rgb = this.hexToRgb(value);
                if (rgb) {
                    root.style.setProperty(`--theme-${key}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                    root.style.setProperty(`--theme-${key}-10`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
                    root.style.setProperty(`--theme-${key}-20`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
                    root.style.setProperty(`--theme-${key}-50`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
                }
            }
        });
        
        // Generate complementary colors
        const primaryRgb = this.hexToRgb(theme.colors.primary);
        if (primaryRgb) {
            const complementary = this.getComplementaryColor(primaryRgb);
            root.style.setProperty(`--theme-primary-complement`, 
                `rgb(${complementary.r}, ${complementary.g}, ${complementary.b})`);
        }
    }

    applyThemeClass(themeName) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark', 'theme-ocean', 'theme-forest', 'theme-custom', 'theme-system');
        
        // Add new theme class
        body.classList.add(`theme-${themeName}`);
        
        // Set data attribute for CSS targeting
        document.documentElement.setAttribute('data-theme', themeName === 'system' ? this.getSystemThemeName() : themeName);
    }

    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = color;
    }

    animateThemeTransition() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, var(--theme-primary) 0%, transparent 70%);
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Animate in and out
        requestAnimationFrame(() => {
            overlay.style.opacity = '0.3';
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }, 150);
        });
    }

    getSystemTheme() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return this.themes.get(isDark ? 'dark' : 'light');
    }

    getSystemThemeName() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark ? 'dark' : 'light';
    }

    applySystemTheme() {
        const systemTheme = this.getSystemTheme();
        this.applyCSSVariables(systemTheme);
        this.applyThemeClass('system');
        this.updateMetaThemeColor(systemTheme.colors.primary);
    }

    generateCustomTheme() {
        const baseTheme = this.themes.get('light');
        const customTheme = JSON.parse(JSON.stringify(baseTheme));
        
        // Apply custom colors
        this.customColors.forEach((value, key) => {
            if (customTheme.colors[key]) {
                customTheme.colors[key] = value;
            }
        });
        
        // Regenerate gradients based on custom colors
        if (this.customColors.has('primary')) {
            const primaryDark = this.darkenColor(this.customColors.get('primary'), 20);
            customTheme.gradients.primary = `linear-gradient(135deg, ${this.customColors.get('primary')} 0%, ${primaryDark} 100%)`;
        }
        
        return customTheme;
    }

    setupThemeControls() {
        // Create theme toggle button if it doesn't exist
        if (!document.getElementById('theme-toggle')) {
            this.createThemeToggle();
        }
        
        // Create advanced theme panel
        this.createAdvancedThemePanel();
    }

    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.id = 'theme-toggle';
        toggle.className = 'theme-toggle glass-card';
        toggle.innerHTML = '<i class="fas fa-palette"></i>';
        toggle.title = 'Change Theme';
        
        toggle.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 10001;
            width: 3rem;
            height: 3rem;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            transition: all 0.3s ease;
        `;
        
        toggle.addEventListener('click', () => {
            this.showThemeSelector();
        });
        
        document.body.appendChild(toggle);
    }

    createAdvancedThemePanel() {
        const panel = document.createElement('div');
        panel.id = 'advanced-theme-panel';
        panel.className = 'glass-card';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10002;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        panel.innerHTML = `
            <div class="panel-header">
                <h3><i class="fas fa-palette"></i> Theme Settings</h3>
                <button class="close-btn" onclick="this.closest('#advanced-theme-panel').style.opacity='0'; this.closest('#advanced-theme-panel').style.visibility='hidden';">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="panel-body">
                <div class="theme-grid">
                    ${this.generateThemeOptions()}
                </div>
                <div class="color-customization">
                    <h4>Custom Colors</h4>
                    ${this.generateColorInputs()}
                </div>
                <div class="accessibility-options">
                    <h4>Accessibility</h4>
                    <label class="toggle-option">
                        <input type="checkbox" id="high-contrast-toggle">
                        <span>High Contrast</span>
                    </label>
                    <label class="toggle-option">
                        <input type="checkbox" id="transitions-toggle" ${this.transitions ? 'checked' : ''}>
                        <span>Smooth Transitions</span>
                    </label>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPanelEventListeners(panel);
    }

    generateThemeOptions() {
        return Array.from(this.themes.entries()).map(([key, theme]) => `
            <div class="theme-option" data-theme="${key}">
                <div class="theme-preview" style="background: ${theme.gradients.primary}"></div>
                <span>${theme.name}</span>
            </div>
        `).join('') + `
            <div class="theme-option" data-theme="system">
                <div class="theme-preview system-preview"></div>
                <span>System</span>
            </div>
        `;
    }

    generateColorInputs() {
        const colorKeys = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger'];
        return colorKeys.map(key => `
            <div class="color-input-group">
                <label for="color-${key}">${this.capitalize(key)}</label>
                <input type="color" id="color-${key}" value="${this.customColors.get(key) || '#2563eb'}">
            </div>
        `).join('');
    }

    setupPanelEventListeners(panel) {
        // Theme selection
        panel.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.applyTheme(theme);
                
                // Update selection
                panel.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Color inputs
        panel.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const colorKey = e.target.id.replace('color-', '');
                this.customColors.set(colorKey, e.target.value);
                
                if (this.currentTheme === 'custom') {
                    this.applyTheme('custom');
                }
            });
        });
        
        // Accessibility toggles
        const contrastToggle = panel.querySelector('#high-contrast-toggle');
        const transitionsToggle = panel.querySelector('#transitions-toggle');
        
        contrastToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('high-contrast', e.target.checked);
        });
        
        transitionsToggle.addEventListener('change', (e) => {
            this.transitions = e.target.checked;
            this.applyMotionPreferences();
            this.savePreferences();
        });
    }

    showThemeSelector() {
        const panel = document.getElementById('advanced-theme-panel');
        if (panel) {
            panel.style.opacity = '1';
            panel.style.visibility = 'visible';
            panel.style.transform = 'translate(-50%, -50%) scale(1)';
            
            // Update current selection
            panel.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
            const current = panel.querySelector(`[data-theme="${this.currentTheme}"]`);
            if (current) current.classList.add('selected');
        }
    }

    applyAccessibilityPreferences() {
        const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
        document.body.classList.toggle('system-high-contrast', highContrast);
    }

    applyMotionPreferences() {
        document.body.classList.toggle('no-transitions', !this.transitions);
    }

    // Utility Methods
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    getComplementaryColor(rgb) {
        return {
            r: 255 - rgb.r,
            g: 255 - rgb.g,
            b: 255 - rgb.b
        };
    }

    darkenColor(hex, percent) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = (100 - percent) / 100;
        return `rgb(${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)})`;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Public API
    getAvailableThemes() {
        return Array.from(this.themes.keys()).concat(['system', 'custom']);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    setCustomColor(key, value) {
        this.customColors.set(key, value);
        if (this.currentTheme === 'custom') {
            this.applyTheme('custom');
        }
    }

    exportTheme() {
        const currentTheme = this.currentTheme === 'custom' ? 
            this.generateCustomTheme() : this.themes.get(this.currentTheme);
        
        return {
            name: this.currentTheme,
            theme: currentTheme,
            customColors: Array.from(this.customColors.entries())
        };
    }

    importTheme(themeData) {
        if (themeData.customColors) {
            this.customColors = new Map(themeData.customColors);
        }
        
        if (themeData.theme) {
            this.themes.set('imported', themeData.theme);
            this.applyTheme('imported');
        }
    }

    savePreferences() {
        try {
            const prefs = {
                theme: this.currentTheme,
                colorScheme: this.colorScheme,
                transitions: this.transitions,
                customColors: Array.from(this.customColors.entries())
            };
            localStorage.setItem('modern-theme-preferences', JSON.stringify(prefs));
        } catch (error) {
            console.warn('Could not save theme preferences:', error);
        }
    }

    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    destroy() {
        // Remove theme controls
        const toggle = document.getElementById('theme-toggle');
        const panel = document.getElementById('advanced-theme-panel');
        
        if (toggle) toggle.remove();
        if (panel) panel.remove();
        
        this.initialized = false;
    }
}

// Add required CSS for theme controls
const themeControlsCSS = document.createElement('style');
themeControlsCSS.textContent = `
    .theme-toggle {
        background: var(--theme-glass, rgba(255, 255, 255, 0.1)) !important;
        color: var(--theme-onSurface, currentColor) !important;
        border: 1px solid var(--theme-glassBorder, rgba(255, 255, 255, 0.2)) !important;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    }
    
    .theme-toggle:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 8px 32px var(--theme-shadow, rgba(0, 0, 0, 0.2)) !important;
    }
    
    #advanced-theme-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--theme-glassBorder, rgba(255, 255, 255, 0.2));
    }
    
    #advanced-theme-panel .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: var(--theme-onSurface);
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    #advanced-theme-panel .close-btn:hover {
        background: var(--theme-glass);
        transform: scale(1.1);
    }
    
    .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .theme-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 0.75rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }
    
    .theme-option:hover {
        transform: translateY(-4px);
        background: var(--theme-glass);
    }
    
    .theme-option.selected {
        border-color: var(--theme-primary);
        background: var(--theme-primary-10);
    }
    
    .theme-preview {
        width: 60px;
        height: 40px;
        border-radius: 0.5rem;
        border: 1px solid var(--theme-glassBorder);
    }
    
    .system-preview {
        background: linear-gradient(45deg, #ffffff 50%, #1e293b 50%);
    }
    
    .color-customization,
    .accessibility-options {
        margin-bottom: 2rem;
    }
    
    .color-customization h4,
    .accessibility-options h4 {
        margin-bottom: 1rem;
        color: var(--theme-onSurface);
    }
    
    .color-input-group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: var(--theme-glass);
    }
    
    .color-input-group input[type="color"] {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
    }
    
    .toggle-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background: var(--theme-glass);
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .toggle-option:hover {
        background: var(--theme-primary-10);
    }
    
    .toggle-option input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--theme-primary);
    }
    
    .no-transitions * {
        transition: none !important;
        animation: none !important;
    }
    
    .system-high-contrast {
        filter: contrast(150%);
    }
    
    .high-contrast {
        --theme-primary: #000000 !important;
        --theme-onBackground: #000000 !important;
        --theme-background: #ffffff !important;
        filter: contrast(200%);
    }
`;

document.head.appendChild(themeControlsCSS);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.modernThemeManager = new ModernThemeManager();
        window.modernThemeManager.init();
    });
} else {
    window.modernThemeManager = new ModernThemeManager();
    window.modernThemeManager.init();
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernThemeManager;
}
