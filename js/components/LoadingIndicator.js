// Loading Indicator Component
export class LoadingIndicator {
    constructor(options = {}) {
        this.options = {
            text: 'Loading...',
            type: 'spinner', // spinner, dots, pulse, bars
            size: 'medium', // small, medium, large
            overlay: true,
            color: '#1a365d',
            ...options
        };
        this.element = null;
        this.isVisible = false;
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = `loading-indicator ${this.options.type} ${this.options.size}`;
        
        if (this.options.overlay) {
            this.element.classList.add('loading-overlay');
        }

        this.element.innerHTML = this.getLoadingHTML();
        return this.element;
    }

    getLoadingHTML() {
        const { type, text } = this.options;
        
        switch (type) {
            case 'spinner':
                return `
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${text}</div>
                `;
            case 'dots':
                return `
                    <div class="loading-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                    <div class="loading-text">${text}</div>
                `;
            case 'pulse':
                return `
                    <div class="loading-pulse"></div>
                    <div class="loading-text">${text}</div>
                `;
            case 'bars':
                return `
                    <div class="loading-bars">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                    <div class="loading-text">${text}</div>
                `;
            default:
                return `<div class="loading-text">${text}</div>`;
        }
    }

    show(container = document.body) {
        if (this.isVisible) return;
        
        if (!this.element) {
            this.create();
        }
        
        container.appendChild(this.element);
        this.isVisible = true;
        
        // Add CSS if not already added
        this.addStyles();
    }

    hide() {
        if (!this.isVisible || !this.element) return;
        
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
        this.isVisible = false;
    }

    updateText(newText) {
        this.options.text = newText;
        if (this.element) {
            const textElement = this.element.querySelector('.loading-text');
            if (textElement) {
                textElement.textContent = newText;
            }
        }
    }

    addStyles() {
        if (document.getElementById('loading-indicator-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'loading-indicator-styles';
        styles.textContent = `
            .loading-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
                color: ${this.options.color};
            }
            
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                z-index: 9999;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(26, 54, 93, 0.1);
                border-left: 4px solid ${this.options.color};
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .loading-indicator.large .loading-spinner {
                width: 60px;
                height: 60px;
                border-width: 6px;
            }
            
            .loading-indicator.small .loading-spinner {
                width: 24px;
                height: 24px;
                border-width: 2px;
            }
            
            .loading-dots {
                display: flex;
                gap: 8px;
            }
            
            .loading-dots .dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: ${this.options.color};
                animation: bounce 1.4s ease-in-out infinite both;
            }
            
            .loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }
            .loading-dots .dot:nth-child(3) { animation-delay: 0s; }
            
            .loading-pulse {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: ${this.options.color};
                animation: pulse 2s ease-in-out infinite;
            }
            
            .loading-bars {
                display: flex;
                gap: 4px;
                align-items: end;
            }
            
            .loading-bars .bar {
                width: 8px;
                height: 40px;
                background: ${this.options.color};
                animation: bars 1.2s ease-in-out infinite;
            }
            
            .loading-bars .bar:nth-child(1) { animation-delay: -1.1s; }
            .loading-bars .bar:nth-child(2) { animation-delay: -1.0s; }
            .loading-bars .bar:nth-child(3) { animation-delay: -0.9s; }
            .loading-bars .bar:nth-child(4) { animation-delay: -0.8s; }
            
            .loading-text {
                font-size: 14px;
                color: ${this.options.color};
                text-align: center;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes bars {
                0%, 40%, 100% { transform: scaleY(0.4); }
                20% { transform: scaleY(1); }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Static factory methods
    static spinner(text = 'Loading...', container = document.body) {
        const loader = new LoadingIndicator({ text, type: 'spinner' });
        loader.show(container);
        return loader;
    }

    static dots(text = 'Processing...', container = document.body) {
        const loader = new LoadingIndicator({ text, type: 'dots' });
        loader.show(container);
        return loader;
    }

    static pulse(text = 'Please wait...', container = document.body) {
        const loader = new LoadingIndicator({ text, type: 'pulse' });
        loader.show(container);
        return loader;
    }

    static bars(text = 'Loading data...', container = document.body) {
        const loader = new LoadingIndicator({ text, type: 'bars' });
        loader.show(container);
        return loader;
    }
}
