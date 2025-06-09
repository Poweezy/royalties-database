// Utility Helper Functions
export class Helpers {
    static formatCurrency(amount, currency = 'E') {
        return `${currency} ${amount.toLocaleString()}.00`;
    }

    static formatDate(dateString, format = 'en-GB') {
        return new Date(dateString).toLocaleDateString(format);
    }

    static formatDateTime(dateString, format = 'en-GB') {
        return new Date(dateString).toLocaleString(format);
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

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

    static capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static generateReferenceNumber(prefix = 'ROY') {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${prefix}-${year}-${month}-${random}`;
    }

    static calculatePercentage(value, total) {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    }

    static getStatusIcon(status) {
        const iconMap = {
            'Active': 'check-circle',
            'Inactive': 'times-circle',
            'Pending': 'clock',
            'Paid': 'check',
            'Overdue': 'exclamation-triangle',
            'Cancelled': 'ban'
        };
        return iconMap[status] || 'question-circle';
    }

    static getStatusColor(status) {
        const colorMap = {
            'Active': 'success',
            'Inactive': 'secondary',
            'Pending': 'warning',
            'Paid': 'success',
            'Overdue': 'danger',
            'Cancelled': 'secondary'
        };
        return colorMap[status] || 'secondary';
    }
}
