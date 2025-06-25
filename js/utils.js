/**
 * Mining Royalties Manager - Utility Functions
 * @version 1.0.0
 * @date 2025-06-26
 * @description Utility functions for the Mining Royalties Manager
 */

class Utils {
    /**
     * Suppresses non-critical console errors
     */
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

    /**
     * Formats a number as currency
     * @param {number} amount - The amount to format
     * @param {string} currency - The currency symbol to use
     * @returns {string} Formatted currency string
     */
    static formatCurrency(amount, currency = 'E') {
        return `${currency} ${amount.toLocaleString()}.00`;
    }

    /**
     * Formats a date
     * @param {Date|string} date - The date to format
     * @returns {string} Formatted date string
     */
    static formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString();
    }

    /**
     * Formats a date and time
     * @param {Date|string} date - The date to format
     * @returns {string} Formatted date and time string
     */
    static formatDateTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleString();
    }

    /**
     * Validates an email address
     * @param {string} email - The email to validate
     * @returns {boolean} True if valid, false otherwise
     */
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Generates a unique ID
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} A unique ID
     */
    static generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Creates a debounced function
     * @param {Function} func - The function to debounce
     * @param {number} wait - The wait time in milliseconds
     * @returns {Function} A debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Creates a throttled function
     * @param {Function} func - The function to throttle
     * @param {number} limit - The time limit in milliseconds
     * @returns {Function} A throttled function
     */
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

    /**
     * Creates a deep clone of an object
     * @param {Object} obj - The object to clone
     * @returns {Object} A deep clone of the object
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Checks if a value is empty
     * @param {*} value - The value to check
     * @returns {boolean} True if empty, false otherwise
     */
    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    /**
     * Capitalizes the first letter of a string
     * @param {string} str - The string to capitalize
     * @returns {string} The capitalized string
     */
    static capitalizeFirst(str) {
        if (typeof str !== 'string' || !str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Formats a number as a percentage
     * @param {number} value - The value to format
     * @param {number} decimals - The number of decimal places
     * @returns {string} The formatted percentage
     */
    static formatPercentage(value, decimals = 1) {
        return value.toFixed(decimals) + '%';
    }

    /**
     * Calculates a percentage
     * @param {number} part - The part value
     * @param {number} total - The total value
     * @returns {number} The percentage value
     */
    static calculatePercentage(part, total) {
        if (total === 0) return 0;
        return (part / total) * 100;
    }

    /**
     * Escapes HTML special characters in a string
     * @param {string} text - The text to escape
     * @returns {string} The escaped text
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Checks if a date is valid
     * @param {Date|string} date - The date to check
     * @returns {boolean} True if valid, false otherwise
     */
    static isValidDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Gets the number of days between two dates
     * @param {Date|string} date1 - The first date
     * @param {Date|string} date2 - The second date
     * @returns {number} The number of days between the dates
     */
    static getDaysBetween(date1, date2) {
        if (typeof date1 === 'string') date1 = new Date(date1);
        if (typeof date2 === 'string') date2 = new Date(date2);
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
    }
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make available globally
window.Utils = Utils;
