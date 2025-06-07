// Global utility functions for the Mining Royalties Manager

// Currency formatting
window.formatCurrency = function(amount, currency = 'E') {
    return `${currency} ${parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
};

// Date formatting
window.formatDate = function(dateString, format = 'short') {
    const date = new Date(dateString);
    const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        iso: { year: 'numeric', month: '2-digit', day: '2-digit' }
    };
    
    if (format === 'iso') {
        return date.toISOString().split('T')[0];
    }
    
    return date.toLocaleDateString('en-GB', options[format] || options.short);
};

// Relative time formatting
window.formatRelativeTime = function(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
};

// Generate unique ID
window.generateId = function(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate royalty amount
window.calculateRoyalty = function(volume, tariff) {
    return Math.round(parseFloat(volume || 0) * parseFloat(tariff || 0) * 100) / 100;
};

// Validate email
window.validateEmail = function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validate username
window.validateUsername = function(username) {
    const re = /^[a-zA-Z0-9._-]{3,50}$/;
    return re.test(username);
};

// Export data as CSV
window.exportToCSV = function(data, filename = 'export.csv') {
    if (!data || !data.length) {
        if (window.notificationManager) {
            window.notificationManager.show('No data to export', 'warning');
        }
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Local storage helpers
window.storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
            return false;
        }
    },
    
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Failed to read from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Failed to remove from localStorage:', e);
            return false;
        }
    }
};

console.log('Global utilities loaded successfully');
