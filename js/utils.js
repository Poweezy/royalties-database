// Utilities Module - Common utility functions and helpers

export class Utils {
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${iconMap[type]}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    static suppressNonCriticalErrors() {
        const originalError = console.error;
        console.error = function(...args) {
            const message = args.join(' ').toLowerCase();
            const suppressPatterns = [
                'favicon', 'fontawesome', 'cors', 'extension context',
                'manifest', 'service worker', 'kit.fontawesome'
            ];
            
            if (!suppressPatterns.some(pattern => message.includes(pattern))) {
                originalError.apply(console, args);
            }
        };
    }

    static formatCurrency(amount, currency = 'E') {
        return `${currency} ${amount.toLocaleString()}.00`;
    }

    static formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString();
    }

    static formatDateTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleString();
    }

    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validateUsername(username) {
        const re = /^[a-zA-Z0-9_]{3,20}$/;
        return re.test(username);
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static isEmpty(value) {
        return value === null || value === undefined || value === '' || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    }

    static capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static formatPercentage(value, decimals = 1) {
        return `${value.toFixed(decimals)}%`;
    }

    static calculatePercentage(part, total) {
        if (total === 0) return 0;
        return (part / total) * 100;
    }

    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    static isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }

    static getDaysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
    }

    static getRandomColor() {
        const colors = [
            '#1a365d', '#2d5282', '#4a90c2', '#7ba7cc', 
            '#a8c5e2', '#d4af37', '#38a169', '#d69e2e', 
            '#e53e3e', '#3182ce'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    static loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
}
