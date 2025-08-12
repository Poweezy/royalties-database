export class ContractManager {
    constructor() {
        if (ContractManager.instance) {
            return ContractManager.instance;
        }
        ContractManager.instance = this;
        
        // Initialize state
        this.contracts = [];
        this.filters = {
            entity: '',
            status: '',
            type: '',
            dateRange: 'all',
            dateFrom: '',
            dateTo: ''
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0
        };
        
        // Initialize components
        this.initializeComponents();
        this.attachEventListeners();
        this.loadContracts();
    }

    async initializeComponents() {
        // Initialize DataTable
        this.contractsTable = document.getElementById('contracts-table');
        this.contractsTbody = document.getElementById('contracts-table-tbody');
        
        // Initialize Form
        this.contractForm = document.getElementById('contract-form');
        this.contractFormContainer = document.getElementById('contract-form-container');
        
        // Initialize Calendar
        this.calendarContainer = document.getElementById('contract-calendar');
        this.calendarGrid = document.getElementById('contract-calendar-grid');
        
        // Initialize Filters
        this.entityFilter = document.getElementById('filter-entity');
        this.statusFilter = document.getElementById('filter-status');
        this.typeFilter = document.getElementById('filter-type');
        this.dateRangeSelect = document.getElementById('date-range');
    }

    attachEventListeners() {
        // Form actions
        this.contractForm?.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('close-contract-form')?.addEventListener('click', () => this.closeForm());
        document.getElementById('cancel-contract')?.addEventListener('click', () => this.closeForm());
        document.getElementById('save-draft')?.addEventListener('click', () => this.saveDraft());
        
        // Calendar actions
        document.getElementById('contract-calendar-btn')?.addEventListener('click', () => this.toggleCalendar());
        document.getElementById('prev-month')?.addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('next-month')?.addEventListener('click', () => this.navigateMonth(1));
        
        // Filter actions
        document.getElementById('apply-filters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clear-filters')?.addEventListener('click', () => this.clearFilters());
        this.dateRangeSelect?.addEventListener('change', () => this.handleDateRangeChange());
        
        // Table actions
        document.getElementById('refresh-contracts')?.addEventListener('click', () => this.loadContracts());
        document.getElementById('export-contracts')?.addEventListener('click', () => this.exportContracts());
        document.getElementById('select-all-contracts')?.addEventListener('change', (e) => this.handleSelectAll(e));
        
        // Quick actions
        document.getElementById('review-expiring')?.addEventListener('click', () => this.reviewExpiringContracts());
        document.getElementById('bulk-renewal')?.addEventListener('click', () => this.handleBulkRenewal());
        document.getElementById('compliance-check')?.addEventListener('click', () => this.runComplianceCheck());
        document.getElementById('generate-report')?.addEventListener('click', () => this.generateReport());
    }

    async loadContracts() {
        try {
            const queryParams = new URLSearchParams({
                page: this.pagination.currentPage,
                limit: this.pagination.itemsPerPage,
                ...this.filters
            });
            
            const response = await fetch(`/api/contracts?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to load contracts');
            
            const data = await response.json();
            this.contracts = data.contracts;
            this.pagination.totalItems = data.total;
            
            this.renderContracts();
            this.updatePagination();
            this.updateMetrics();
        } catch (error) {
            console.error('Error loading contracts:', error);
            NotificationManager.instance.showError('Failed to load contracts');
        }
    }

    renderContracts() {
        if (!this.contractsTbody) return;
        
        this.contractsTbody.innerHTML = this.contracts.map(contract => this.createContractRow(contract)).join('');
    }

    createContractRow(contract) {
        return `
            <tr data-contract-id="${contract.id}">
                <td>
                    <input type="checkbox" class="contract-select" value="${contract.id}">
                </td>
                <td>${contract.entity}</td>
                <td>${contract.type}</td>
                <td>${this.formatDate(contract.startDate)}</td>
                <td>${this.formatDate(contract.endDate)}</td>
                <td>E${contract.royaltyRate}/m³</td>
                <td>
                    <span class="status-badge ${contract.status.toLowerCase()}">
                        ${contract.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="ContractManager.instance.viewDocument('${contract.id}')">
                        <i class="fas fa-file-pdf"></i> View
                    </button>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="ContractManager.instance.editContract('${contract.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="ContractManager.instance.deleteContract('${contract.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.contractForm.checkValidity()) {
            this.contractForm.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData(this.contractForm);
        try {
            const contractId = formData.get('contractId');
            const method = contractId ? 'PUT' : 'POST';
            const url = contractId ? `/api/contracts/${contractId}` : '/api/contracts';
            
            const response = await fetch(url, {
                method,
                body: formData
            });
            
            if (!response.ok) throw new Error('Failed to save contract');
            
            NotificationManager.instance.showSuccess(
                `Contract successfully ${contractId ? 'updated' : 'created'}`
            );
            
            this.closeForm();
            this.loadContracts();
        } catch (error) {
            console.error('Error saving contract:', error);
            NotificationManager.instance.showError('Failed to save contract');
        }
    }

    async deleteContract(contractId) {
        if (!confirm('Are you sure you want to delete this contract?')) return;
        
        try {
            const response = await fetch(`/api/contracts/${contractId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete contract');
            
            NotificationManager.instance.showSuccess('Contract successfully deleted');
            this.loadContracts();
        } catch (error) {
            console.error('Error deleting contract:', error);
            NotificationManager.instance.showError('Failed to delete contract');
        }
    }

    editContract(contractId) {
        const contract = this.contracts.find(c => c.id === contractId);
        if (!contract) return;
        
        // Populate form
        Object.entries(contract).forEach(([key, value]) => {
            const input = this.contractForm?.elements[key];
            if (input) input.value = value;
        });
        
        // Update form title and show
        const formTitle = document.getElementById('form-title');
        if (formTitle) formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Contract';
        if (this.contractFormContainer) this.contractFormContainer.style.display = 'block';
    }

    closeForm() {
        if (!this.contractForm || !this.contractFormContainer) return;
        
        this.contractForm.reset();
        this.contractForm.classList.remove('was-validated');
        this.contractFormContainer.style.display = 'none';
    }

    handleDateRangeChange() {
        if (!this.dateRangeSelect) return;
        
        const customDateRange = document.querySelector('.custom-date-range');
        if (!customDateRange) return;
        
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
            case 'active':
                this.filters.dateFrom = today.toISOString().split('T')[0];
                this.filters.dateTo = '';
                break;
            case 'expiring':
                fromDate = new Date(today.setDate(today.getDate() + 30));
                this.filters.dateFrom = today.toISOString().split('T')[0];
                this.filters.dateTo = fromDate.toISOString().split('T')[0];
                break;
            default:
                this.filters.dateFrom = '';
                this.filters.dateTo = '';
        }
    }

    applyFilters() {
        this.filters = {
            entity: this.entityFilter?.value || '',
            status: this.statusFilter?.value || '',
            type: this.typeFilter?.value || '',
            dateRange: this.dateRangeSelect?.value || 'all',
            dateFrom: document.getElementById('date-from')?.value || '',
            dateTo: document.getElementById('date-to')?.value || ''
        };
        
        this.pagination.currentPage = 1;
        this.loadContracts();
    }

    clearFilters() {
        if (this.entityFilter) this.entityFilter.value = '';
        if (this.statusFilter) this.statusFilter.value = '';
        if (this.typeFilter) this.typeFilter.value = '';
        if (this.dateRangeSelect) this.dateRangeSelect.value = 'all';
        
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        
        this.filters = {
            entity: '',
            status: '',
            type: '',
            dateRange: 'all',
            dateFrom: '',
            dateTo: ''
        };
        
        document.querySelector('.custom-date-range').style.display = 'none';
        
        this.loadContracts();
    }

    async exportContracts() {
        try {
            const queryParams = new URLSearchParams(this.filters);
            const response = await fetch(`/api/contracts/export?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to export contracts');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contracts-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            NotificationManager.instance.showSuccess('Contracts exported successfully');
        } catch (error) {
            console.error('Error exporting contracts:', error);
            NotificationManager.instance.showError('Failed to export contracts');
        }
    }

    handleSelectAll(event) {
        const checkboxes = this.contractsTbody?.querySelectorAll('.contract-select');
        if (!checkboxes) return;
        
        checkboxes.forEach(checkbox => checkbox.checked = event.target.checked);
        
        const deleteSelected = document.getElementById('bulk-delete-contracts');
        if (deleteSelected) {
            deleteSelected.style.display = event.target.checked ? 'inline-block' : 'none';
            deleteSelected.disabled = !event.target.checked;
        }
    }

    updateMetrics() {
        const metrics = {
            activeContracts: this.contracts.filter(c => c.status === 'Active').length,
            expiringContracts: this.contracts.filter(c => {
                const endDate = new Date(c.endDate);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                return endDate <= thirtyDaysFromNow;
            }).length,
            complianceRate: this.calculateComplianceRate(),
            attentionRequired: this.contracts.filter(c => 
                c.status === 'Expired' || c.status === 'Pending'
            ).length
        };
        
        Object.entries(metrics).forEach(([key, value]) => {
            const element = document.getElementById(`${key}-count`);
            if (element) element.textContent = value;
        });
    }

    calculateComplianceRate() {
        const totalContracts = this.contracts.length;
        if (totalContracts === 0) return '100%';
        
        const compliantContracts = this.contracts.filter(c => 
            c.status === 'Active' && new Date(c.endDate) > new Date()
        ).length;
        
        return Math.round((compliantContracts / totalContracts) * 100) + '%';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    // Calendar functionality
    toggleCalendar() {
        if (!this.calendarContainer) return;
        
        const isVisible = this.calendarContainer.style.display === 'block';
        this.calendarContainer.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.renderCalendar();
        }
    }

    renderCalendar() {
        if (!this.calendarGrid) return;
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Update month display
        const monthDisplay = document.getElementById('current-month');
        if (monthDisplay) {
            monthDisplay.textContent = firstDay.toLocaleString('default', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        // Generate calendar grid
        let calendarHTML = `
            <div class="calendar-grid">
                <div class="calendar-header">Sun</div>
                <div class="calendar-header">Mon</div>
                <div class="calendar-header">Tue</div>
                <div class="calendar-header">Wed</div>
                <div class="calendar-header">Thu</div>
                <div class="calendar-header">Fri</div>
                <div class="calendar-header">Sat</div>
        `;
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const events = this.getContractEvents(date);
            
            calendarHTML += `
                <div class="calendar-day${events.length ? ' has-events' : ''}">
                    <span class="day-number">${day}</span>
                    ${events.map(event => `
                        <div class="calendar-event ${event.type}">
                            ${event.title}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        this.calendarGrid.innerHTML = calendarHTML;
    }

    getContractEvents(date) {
        return this.contracts.reduce((events, contract) => {
            const startDate = new Date(contract.startDate);
            const endDate = new Date(contract.endDate);
            
            if (date.toDateString() === startDate.toDateString()) {
                events.push({
                    type: 'start',
                    title: `${contract.entity} Start`
                });
            }
            
            if (date.toDateString() === endDate.toDateString()) {
                events.push({
                    type: 'end',
                    title: `${contract.entity} End`
                });
            }
            
            return events;
        }, []);
    }

    navigateMonth(direction) {
        // Implement month navigation
    }

    // Quick actions
    reviewExpiringContracts() {
        // Implement expiring contracts review
    }

    handleBulkRenewal() {
        // Implement bulk renewal functionality
    }

    runComplianceCheck() {
        // Implement compliance check
    }

    generateReport() {
        // Implement report generation
    }

    async viewDocument(contractId) {
        // Implement document viewer
    }

    saveDraft() {
        // Implement draft saving
    }
}
