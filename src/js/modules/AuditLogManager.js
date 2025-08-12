export class AuditLogManager {
    constructor() {
        if (AuditLogManager.instance) {
            return AuditLogManager.instance;
        }
        AuditLogManager.instance = this;
        
        // Initialize state
        this.logs = [];
        this.filters = {
            dateRange: 'today',
            dateFrom: '',
            dateTo: '',
            actionType: '',
            user: ''
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0
        };
        
        // Initialize components
        this.initializeComponents();
        this.attachEventListeners();
        this.loadLogs();
    }

    initializeComponents() {
        // Initialize Table
        this.logsTable = document.getElementById('audit-logs-table');
        this.logsTbody = document.getElementById('audit-logs-tbody');
        
        // Initialize Filters
        this.dateRangeSelect = document.getElementById('date-range');
        this.dateFromInput = document.getElementById('date-from');
        this.dateToInput = document.getElementById('date-to');
        this.actionTypeSelect = document.getElementById('action-type');
        this.userFilter = document.getElementById('filter-user');
        
        // Initialize Pagination
        this.paginationContainer = document.getElementById('logs-pagination');
        this.pagesContainer = document.getElementById('logs-pages');
    }

    attachEventListeners() {
        // Refresh and Export actions
        document.getElementById('refresh-logs').addEventListener('click', () => this.loadLogs());
        document.getElementById('export-logs').addEventListener('click', () => this.exportLogs());
        
        // Date range filter
        this.dateRangeSelect.addEventListener('change', () => this.handleDateRangeChange());
        
        // Filter actions
        document.getElementById('apply-log-filters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clear-log-filters').addEventListener('click', () => this.clearFilters());
        
        // Pagination actions
        document.getElementById('logs-prev').addEventListener('click', () => this.previousPage());
        document.getElementById('logs-next').addEventListener('click', () => this.nextPage());
    }

    async loadLogs() {
        try {
            const queryParams = new URLSearchParams({
                page: this.pagination.currentPage,
                limit: this.pagination.itemsPerPage,
                ...this.filters
            });
            
            const response = await fetch(`/api/audit-logs?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to load audit logs');
            
            const data = await response.json();
            this.logs = data.logs;
            this.pagination.totalItems = data.total;
            
            this.renderLogs();
            this.updatePagination();
        } catch (error) {
            console.error('Error loading audit logs:', error);
            NotificationManager.instance.showError('Failed to load audit logs');
        }
    }

    renderLogs() {
        this.logsTbody.innerHTML = this.logs.map(log => this.createLogRow(log)).join('');
    }

    createLogRow(log) {
        return `
            <tr data-log-id="${log.id}">
                <td>${this.formatDate(log.timestamp)}</td>
                <td>${log.username}</td>
                <td>
                    <span class="action-badge ${log.action.toLowerCase()}">
                        ${log.action}
                    </span>
                </td>
                <td>${log.category}</td>
                <td>
                    <button class="btn btn-link" onclick="AuditLogManager.instance.showDetails('${log.id}')">
                        ${this.truncateDetails(log.details)}
                    </button>
                </td>
                <td>${log.ipAddress}</td>
                <td>
                    <span class="status-badge ${log.status.toLowerCase()}">
                        ${log.status}
                    </span>
                </td>
            </tr>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        const currentPage = this.pagination.currentPage;
        
        // Update info text
        document.getElementById('logs-start').textContent = 
            ((currentPage - 1) * this.pagination.itemsPerPage) + 1;
        document.getElementById('logs-end').textContent = 
            Math.min(currentPage * this.pagination.itemsPerPage, this.pagination.totalItems);
        document.getElementById('logs-total').textContent = this.pagination.totalItems;
        
        // Update buttons state
        document.getElementById('logs-prev').disabled = currentPage === 1;
        document.getElementById('logs-next').disabled = currentPage === totalPages;
        
        // Render page buttons
        this.renderPageButtons(currentPage, totalPages);
    }

    renderPageButtons(currentPage, totalPages) {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button class="page-btn ${i === currentPage ? 'active' : ''}"
                        onclick="AuditLogManager.instance.goToPage(${i})">
                    ${i}
                </button>
            `);
        }
        
        this.pagesContainer.innerHTML = pages.join('');
    }

    handleDateRangeChange() {
        const customDateRange = document.querySelector('.custom-date-range');
        if (this.dateRangeSelect.value === 'custom') {
            customDateRange.style.display = 'block';
        } else {
            customDateRange.style.display = 'none';
            this.setPresetDateRange(this.dateRangeSelect.value);
        }
    }

    setPresetDateRange(preset) {
        const today = new Date();
        let fromDate = new Date();
        
        switch (preset) {
            case 'today':
                fromDate = new Date(today.setHours(0, 0, 0, 0));
                break;
            case 'yesterday':
                fromDate = new Date(today.setDate(today.getDate() - 1));
                fromDate.setHours(0, 0, 0, 0);
                break;
            case 'last7days':
                fromDate = new Date(today.setDate(today.getDate() - 7));
                break;
            case 'last30days':
                fromDate = new Date(today.setDate(today.getDate() - 30));
                break;
        }
        
        this.filters.dateFrom = fromDate.toISOString().split('T')[0];
        this.filters.dateTo = new Date().toISOString().split('T')[0];
    }

    applyFilters() {
        this.filters = {
            dateRange: this.dateRangeSelect.value,
            dateFrom: this.dateFromInput.value,
            dateTo: this.dateToInput.value,
            actionType: this.actionTypeSelect.value,
            user: this.userFilter.value
        };
        
        this.pagination.currentPage = 1;
        this.loadLogs();
    }

    clearFilters() {
        this.dateRangeSelect.value = 'today';
        this.dateFromInput.value = '';
        this.dateToInput.value = '';
        this.actionTypeSelect.value = '';
        this.userFilter.value = '';
        
        document.querySelector('.custom-date-range').style.display = 'none';
        
        this.filters = {
            dateRange: 'today',
            dateFrom: '',
            dateTo: '',
            actionType: '',
            user: ''
        };
        
        this.loadLogs();
    }

    async exportLogs() {
        try {
            const queryParams = new URLSearchParams(this.filters);
            const response = await fetch(`/api/audit-logs/export?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to export audit logs');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            NotificationManager.instance.showSuccess('Audit logs exported successfully');
        } catch (error) {
            console.error('Error exporting audit logs:', error);
            NotificationManager.instance.showError('Failed to export audit logs');
        }
    }

    showDetails(logId) {
        const log = this.logs.find(l => l.id === logId);
        if (!log) return;
        
        // Show details in a modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Log Details</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <pre>${JSON.stringify(log.details, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        $(modal).modal('show').on('hidden.bs.modal', function() {
            this.remove();
        });
    }

    goToPage(page) {
        this.pagination.currentPage = page;
        this.loadLogs();
    }

    previousPage() {
        if (this.pagination.currentPage > 1) {
            this.pagination.currentPage--;
            this.loadLogs();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        if (this.pagination.currentPage < totalPages) {
            this.pagination.currentPage++;
            this.loadLogs();
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    truncateDetails(details) {
        const maxLength = 50;
        const text = typeof details === 'string' ? details : JSON.stringify(details);
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}
