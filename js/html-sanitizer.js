/**
 * HTML Sanitization Utilities
 * Provides safe alternatives to innerHTML for XSS prevention
 * @version 1.0.0
 * @date 2025-07-03
 */

class HTMLSanitizer {
    /**
     * Safely set text content (no HTML parsing)
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text content to set
     */
    static setText(element, text) {
        if (!element) return;
        element.textContent = text || '';
    }

    /**
     * Safely set HTML content with basic sanitization
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML content to set
     * @param {Object} options - Sanitization options
     */
    static setHTML(element, html, options = {}) {
        if (!element) return;
        
        const {
            allowedTags = ['b', 'i', 'em', 'strong', 'span', 'div', 'p', 'br'],
            allowedAttributes = ['class', 'id', 'data-*'],
            stripScripts = true
        } = options;

        if (stripScripts) {
            // Remove script tags and event handlers
            html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
            html = html.replace(/javascript:/gi, '');
        }

        // Basic tag filtering (for production, use a proper HTML sanitizer library)
        if (allowedTags.length > 0) {
            const tagPattern = new RegExp(`<(?!/?(?:${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
            html = html.replace(tagPattern, '');
        }

        element.innerHTML = html;
    }

    /**
     * Create element safely with text content
     * @param {string} tagName - HTML tag name
     * @param {string} textContent - Text content
     * @param {Object} attributes - Element attributes
     * @returns {HTMLElement} Created element
     */
    static createElement(tagName, textContent = '', attributes = {}) {
        const element = document.createElement(tagName);
        
        if (textContent) {
            element.textContent = textContent;
        }

        // Set attributes safely
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('on')) {
                console.warn('Event handlers should not be set via attributes for security');
                return;
            }
            element.setAttribute(key, value);
        });

        return element;
    }

    /**
     * Create element with safe HTML content
     * @param {string} tagName - HTML tag name
     * @param {string} htmlContent - HTML content
     * @param {Object} attributes - Element attributes
     * @param {Object} sanitizeOptions - Sanitization options
     * @returns {HTMLElement} Created element
     */
    static createElementWithHTML(tagName, htmlContent = '', attributes = {}, sanitizeOptions = {}) {
        const element = document.createElement(tagName);
        
        // Set attributes first
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('on')) {
                console.warn('Event handlers should not be set via attributes for security');
                return;
            }
            element.setAttribute(key, value);
        });

        // Set HTML content safely
        this.setHTML(element, htmlContent, sanitizeOptions);

        return element;
    }

    /**
     * Replace element content with safe HTML
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML content
     * @param {Object} sanitizeOptions - Sanitization options
     */
    static replaceContent(element, html, sanitizeOptions = {}) {
        if (!element) return;
        
        // Clear existing content
        element.innerHTML = '';
        
        // Set new content safely
        this.setHTML(element, html, sanitizeOptions);
    }

    /**
     * Append safe HTML content to element
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML content to append
     * @param {Object} sanitizeOptions - Sanitization options
     */
    static appendHTML(element, html, sanitizeOptions = {}) {
        if (!element) return;
        
        const tempDiv = document.createElement('div');
        this.setHTML(tempDiv, html, sanitizeOptions);
        
        // Move children from temp div to target element
        while (tempDiv.firstChild) {
            element.appendChild(tempDiv.firstChild);
        }
    }

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    static escapeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        
        return str.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
    }

    /**
     * Template string sanitizer for safe HTML templates
     * @param {Array} strings - Template strings
     * @param {...any} values - Template values
     * @returns {string} Sanitized template result
     */
    static safeTemplate(strings, ...values) {
        let result = strings[0];
        
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const escapedValue = typeof value === 'string' ? this.escapeHTML(value) : value;
            result += escapedValue + strings[i + 1];
        }
        
        return result;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTMLSanitizer;
} else {
    window.HTMLSanitizer = HTMLSanitizer;
}

// Usage examples (commented out)
/*
// Safe text setting
HTMLSanitizer.setText(element, userInput);

// Safe HTML with sanitization
HTMLSanitizer.setHTML(element, htmlContent, {
    allowedTags: ['p', 'br', 'strong', 'em'],
    stripScripts: true
});

// Create element safely
const button = HTMLSanitizer.createElement('button', 'Click me', {
    'class': 'btn btn-primary',
    'data-action': 'submit'
});

// Safe template usage
const html = HTMLSanitizer.safeTemplate`
    <div class="user-info">
        <h3>${userName}</h3>
        <p>${userDescription}</p>
    </div>
`;
*/
