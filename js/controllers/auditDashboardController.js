/**
 * Audit Dashboard Controller
 * Handles all functionality related to the audit dashboard
 */
export class AuditDashboardController {
    constructor() {
        this.initialized = false;
        this.eventListeners = new Map(); // Track event listeners for cleanup
        this.timers = []; // Track timers for cleanup
        this.bindEvents();
    }
    
    initialize() {
        if (this.initialized) {
            console.log('Audit Dashboard already initialized, refreshing data');
            this.refreshAuditData();
            return;
        }
        
        console.log('Initializing Audit Dashboard Controller');
        this.setupEventListeners();
        this.loadAuditMetrics();
        this.loadRecentAudits();
        
        this.initialized = true;
    }
    
    destroy() {
        // Clean up event listeners when navigating away
        this.removeEventListeners();
        
        // Clean up timers
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
        
        console.log('Audit Dashboard Controller destroyed');
    }
    
    bindEvents() {
        // Listen for the loadAuditDashboard event from navigation
        const loadHandler = () => this.initialize();
        document.addEventListener('loadAuditDashboard', loadHandler);
        this.eventListeners.set('loadAuditDashboard', loadHandler);
        
        // Listen for section change event to handle cleanup
        const sectionChangeHandler = (e) => {
            if (this.initialized && e.detail.sectionId !== 'audit-dashboard') {
                this.destroy();
            }
        };
        document.addEventListener('sectionChange', sectionChangeHandler);
        this.eventListeners.set('sectionChange', sectionChangeHandler);
        
        // Override setTimeout to track timers
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = (callback, delay, ...args) => {
            const timerId = originalSetTimeout(callback, delay, ...args);
            if (this.initialized) {
                this.timers.push(timerId);
            }
            return timerId;
        };
    }
    
    removeEventListeners() {
        // Remove all registered event listeners
        this.eventListeners.forEach((handler, event) => {
            document.removeEventListener(event, handler);
        });
        
        // Remove any specific element listeners
        const applyFiltersBtn = document.getElementById('apply-audit-filters');
        if (applyFiltersBtn) {
            const newBtn = applyFiltersBtn.cloneNode(true);
            applyFiltersBtn.parentNode.replaceChild(newBtn, applyFiltersBtn);
        }
        
        const resetFiltersBtn = document.getElementById('reset-audit-filters');
        if (resetFiltersBtn) {
            const newBtn = resetFiltersBtn.cloneNode(true);
            resetFiltersBtn.parentNode.replaceChild(newBtn, resetFiltersBtn);
        }
    }
    
    setupEventListeners() {
        // Setup filter handlers
        const applyFiltersBtn = document.getElementById('apply-audit-filters');
        if (applyFiltersBtn) {
            const handler = () => this.applyFilters();
            applyFiltersBtn.addEventListener('click', handler);
        }
        
        const resetFiltersBtn = document.getElementById('reset-audit-filters');
        if (resetFiltersBtn) {
            const handler = () => this.resetFilters();
            resetFiltersBtn.addEventListener('click', handler);
        }
        
        // Date range filter change handler
        const dateRangeFilter = document.getElementById('audit-date-range');
        if (dateRangeFilter) {
            const handler = (e) => {
                if (e.target.value === 'custom') {
                    document.getElementById('custom-date-range-container').style.display = 'block';
                } else {
                    document.getElementById('custom-date-range-container').style.display = 'none';
                }
            };
            dateRangeFilter.addEventListener('change', handler);
        }
        
        // Setup custom date range handlers
        const applyCustomDateBtn = document.getElementById('apply-custom-date');
        if (applyCustomDateBtn) {
            applyCustomDateBtn.addEventListener('click', () => this.applyCustomDateRange());
        }
        
        const cancelCustomDateBtn = document.getElementById('cancel-custom-date');
        if (cancelCustomDateBtn) {
            cancelCustomDateBtn.addEventListener('click', () => {
                document.getElementById('custom-date-range-container').style.display = 'none';
                if (dateRangeFilter) dateRangeFilter.value = 'week';
            });
        }
        
        // Setup pagination
        this.setupPagination();
        
        // Setup action buttons
        this.setupActionButtons();
    }
    
    setupPagination() {
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const pageSizeSelect = document.getElementById('page-size');
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.navigatePage('prev'));
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.navigatePage('next'));
        }
        
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', () => this.changePageSize());
        }
    }
    
    setupActionButtons() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-audit-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAuditData());
        }
        
        // Export button
        const exportBtn = document.getElementById('export-audit-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAuditData());
        }
        
        // Security scan button
        const scanBtn = document.getElementById('security-scan-btn');
        if (scanBtn) {
            scanBtn.addEventListener('click', () => this.runSecurityScan());
        }
    }
    
    loadAuditMetrics() {
        // Update metrics with real or simulated data
        const metrics = {
            'active-users-24h': Math.floor(Math.random() * 20) + 10,
            'login-attempts': Math.floor(Math.random() * 50) + 30,
            'data-access-events': Math.floor(Math.random() * 200) + 100,
            'security-alerts': Math.floor(Math.random() * 5) + 1
        };
        
        Object.entries(metrics).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    loadRecentAudits() {
        // In a real implementation, this would fetch audit data from the server
        console.log('Loading recent audit data...');
    }
    
    applyFilters() {
        const dateRange = document.getElementById('audit-date-range')?.value || 'week';
        const userFilter = document.getElementById('audit-user-filter')?.value || 'all';
        const actionFilter = document.getElementById('audit-action-filter')?.value || 'all';
        
        console.log(`Applying filters: ${dateRange}, ${userFilter}, ${actionFilter}`);
        
        // Here you would fetch filtered data from the server
        if (window.notificationManager) {
            window.notificationManager.show('Audit filters applied successfully', 'success');
        }
    }
    
    resetFilters() {
        const dateRange = document.getElementById('audit-date-range');
        const userFilter = document.getElementById('audit-user-filter');
        const actionFilter = document.getElementById('audit-action-filter');
        
        if (dateRange) dateRange.value = 'week';
        if (userFilter) userFilter.value = 'all';
        if (actionFilter) actionFilter.value = 'all';
        
        document.getElementById('custom-date-range-container').style.display = 'none';
        
        if (window.notificationManager) {
            window.notificationManager.show('Audit filters reset', 'info');
        }
    }
    
    applyCustomDateRange() {
        const startDate = document.getElementById('custom-date-start')?.value;
        const endDate = document.getElementById('custom-date-end')?.value;
        
        if (!startDate || !endDate) {
            if (window.notificationManager) {
                window.notificationManager.show('Please select both start and end dates', 'error');
            }
            return;
        }
        
        if (window.notificationManager) {
            window.notificationManager.show(`Applying custom date range: ${startDate} to ${endDate}`, 'info');
        }
    }
    
    navigatePage(direction) {
        // This would be implemented to handle pagination
        if (window.notificationManager) {
            window.notificationManager.show(`Navigating ${direction}`, 'info');
        }
    }
    
    changePageSize() {
        const pageSize = document.getElementById('page-size')?.value;
        if (window.notificationManager) {
            window.notificationManager.show(`Changed page size to ${pageSize}`, 'info');
        }
    }
    
    refreshAuditData() {
        this.loadAuditMetrics();
        this.loadRecentAudits();
        
        if (window.notificationManager) {
            window.notificationManager.show('Audit data refreshed', 'success');
        }
    }
    
    exportAuditData() {
        const formats = ['CSV', 'PDF', 'Excel'];
        const selectedFormat = prompt(`Choose export format: ${formats.join(', ')}`, 'CSV');
        
        if (selectedFormat && formats.map(f => f.toLowerCase()).includes(selectedFormat.toLowerCase())) {
            if (window.notificationManager) {
                window.notificationManager.show(`Exporting audit data as ${selectedFormat}...`, 'info');
                
                // Simulate export process
                setTimeout(() => {
                    window.notificationManager.show(`Audit data exported as ${selectedFormat}`, 'success');
                }, 1500);
            }
        }
    }
    
    runSecurityScan() {
        if (window.notificationManager) {
            window.notificationManager.show('Running security scan...', 'info');
            
            // Simulate scan process
            setTimeout(() => {
                window.notificationManager.show('Security scan completed - 2 issues found', 'warning');
            }, 3000);
        }
    }
}

// Create a singleton instance
const auditDashboardController = new AuditDashboardController();

// Export the instance for global access
window.auditDashboardController = auditDashboardController;
export default auditDashboardController;
