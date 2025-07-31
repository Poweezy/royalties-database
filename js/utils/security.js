/**
 * Security utility functions for the Mining Royalties Manager
 */

export const security = {
    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sanitize user input based on type
     */
    sanitizeInput(input, type = 'text') {
        if (!input) return '';
        
        input = input.toString().trim();
        
        switch (type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(input) ? input : '';
            case 'username':
                return input.replace(/[^a-zA-Z0-9._-]/g, '');
            case 'number':
                return input.replace(/[^0-9.-]/g, '');
            case 'date':
                return input.replace(/[^0-9-]/g, '');
            default:
                return this.escapeHtml(input);
        }
    },

    /**
     * Validate password strength
     */
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars,
            strength: this.calculatePasswordStrength(password)
        };
    },

    /**
     * Calculate password strength score (0-100)
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length
        score += Math.min(password.length * 4, 25);
        
        // Character types
        if (/[A-Z]/.test(password)) score += 15;
        if (/[a-z]/.test(password)) score += 15;
        if (/\d/.test(password)) score += 15;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
        
        // Complexity
        if (/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
            score += 15;
        }
        
        return Math.min(score, 100);
    }
};
