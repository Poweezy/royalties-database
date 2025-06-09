// Enhanced Table Component
export class DataTable {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            columns: [],
            data: [],
            pagination: true,
            pageSize: 10,
            sortable: true,
            filterable: true,
            selectable: false,
            searchable: true,
            exportable: false,
            ...options
        };
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filteredData = [];
        this.selectedRows = new Set();
        this.init();
    }

    init() {
        this.createTable();
        this.bindEvents();
        this.render();
    }

    createTable() {
        this.container.innerHTML = `
            ${this.options.searchable ? `
                <div class="table-controls mb-3">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="search-container">
                                <i class="fas fa-search"></i>
                                <input type="text" class="search-input" placeholder="Search..." id="${this.container.id}-search">
                            </div>
                        </div>
                        <div class="col-md-6 text-right">
                            ${this.options.exportable ? `
                                <button class="btn btn-secondary btn-sm" id="${this.container.id}-export">
                                    <i class="fas fa-download"></i> Export
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="table-responsive">
                <table class="data-table">
                    <thead id="${this.container.id}-thead"></thead>
                    <tbody id="${this.container.id}-tbody"></tbody>
                </table>
            </div>
            
            ${this.options.pagination ? `
                <div class="table-pagination">
                    <div class="pagination-info">
                        <span id="${this.container.id}-info"></span>
                    </div>
                    <div class="pagination-controls">
                        <button class="btn btn-sm btn-secondary" id="${this.container.id}-prev" disabled>
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <div class="pagination-pages" id="${this.container.id}-pages"></div>
                        <button class="btn btn-sm btn-secondary" id="${this.container.id}-next">
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            ` : ''}
        `;
    }

    bindEvents() {
        // Search functionality
        if (this.options.searchable) {
            const searchInput = document.getElementById(`${this.container.id}-search`);
            searchInput.addEventListener('input', this.debounce((e) => {
                this.search(e.target.value);
            }, 300));
        }

        // Export functionality
        if (this.options.exportable) {
            const exportBtn = document.getElementById(`${this.container.id}-export`);
            exportBtn.addEventListener('click', () => this.export());
        }

        // Pagination
        if (this.options.pagination) {
            const prevBtn = document.getElementById(`${this.container.id}-prev`);
            const nextBtn = document.getElementById(`${this.container.id}-next`);
            
            prevBtn.addEventListener('click', () => this.previousPage());
            nextBtn.addEventListener('click', () => this.nextPage());
        }
    }

    renderHeaders() {
        const thead = document.getElementById(`${this.container.id}-thead`);
        const headerRow = document.createElement('tr');

        if (this.options.selectable) {
            const selectAllTh = document.createElement('th');
            selectAllTh.innerHTML = `<input type="checkbox" id="${this.container.id}-select-all">`;
            headerRow.appendChild(selectAllTh);

            // Select all functionality
            const selectAllCheckbox = selectAllTh.querySelector('input');
            selectAllCheckbox.addEventListener('change', (e) => {
                this.selectAll(e.target.checked);
            });
        }

        this.options.columns.forEach((column, index) => {
            const th = document.createElement('th');
            th.textContent = column.title || column.field;
            
            if (this.options.sortable && column.sortable !== false) {
                th.classList.add('sortable');
                th.setAttribute('data-sort', column.field);
                th.innerHTML += ' <i class="fas fa-sort"></i>';
                th.addEventListener('click', () => this.sort(column.field));
            }
            
            headerRow.appendChild(th);
        });

        if (this.options.actions) {
            const actionsTh = document.createElement('th');
            actionsTh.textContent = 'Actions';
            headerRow.appendChild(actionsTh);
        }

        thead.innerHTML = '';
        thead.appendChild(headerRow);
    }

    renderRows() {
        const tbody = document.getElementById(`${this.container.id}-tbody`);
        tbody.innerHTML = '';

        const startIndex = this.options.pagination ? (this.currentPage - 1) * this.options.pageSize : 0;
        const endIndex = this.options.pagination ? startIndex + this.options.pageSize : this.filteredData.length;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        pageData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-row-id', row.id || index);

            if (this.options.selectable) {
                const selectTd = document.createElement('td');
                selectTd.innerHTML = `<input type="checkbox" value="${row.id || index}">`;
                tr.appendChild(selectTd);

                const checkbox = selectTd.querySelector('input');
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.selectedRows.add(row.id || index);
                    } else {
                        this.selectedRows.delete(row.id || index);
                    }
                    this.updateSelectAllState();
                });
            }

            this.options.columns.forEach(column => {
                const td = document.createElement('td');
                let value = this.getNestedValue(row, column.field);
                
                if (column.render) {
                    value = column.render(value, row);
                } else if (column.type === 'currency') {
                    value = `E ${value.toLocaleString()}`;
                } else if (column.type === 'date') {
                    value = new Date(value).toLocaleDateString();
                } else if (column.type === 'badge') {
                    value = `<span class="status-badge ${value.toLowerCase()}">${value}</span>`;
                }
                
                td.innerHTML = value;
                tr.appendChild(td);
            });

            if (this.options.actions) {
                const actionsTd = document.createElement('td');
                actionsTd.innerHTML = this.renderActions(row);
                tr.appendChild(actionsTd);
            }

            tbody.appendChild(tr);
        });

        if (pageData.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = this.getColumnCount();
            td.className = 'text-center text-muted';
            td.innerHTML = '<i class="fas fa-inbox"></i> No data available';
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
    }

    renderActions(row) {
        if (!this.options.actions) return '';
        
        return `
            <div class="btn-group">
                ${this.options.actions.map(action => `
                    <button class="btn btn-sm ${action.class || 'btn-secondary'}" 
                            onclick="${action.handler}('${row.id}')" 
                            title="${action.title || ''}">
                        <i class="${action.icon}"></i>
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderPagination() {
        if (!this.options.pagination) return;

        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
        const info = document.getElementById(`${this.container.id}-info`);
        const pages = document.getElementById(`${this.container.id}-pages`);
        const prevBtn = document.getElementById(`${this.container.id}-prev`);
        const nextBtn = document.getElementById(`${this.container.id}-next`);

        // Update info
        const startIndex = (this.currentPage - 1) * this.options.pageSize + 1;
        const endIndex = Math.min(this.currentPage * this.options.pageSize, this.filteredData.length);
        info.textContent = `Showing ${startIndex} to ${endIndex} of ${this.filteredData.length} entries`;

        // Update buttons
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;

        // Render page numbers
        pages.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-outline-secondary'}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => this.goToPage(i));
                pages.appendChild(pageBtn);
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.className = 'pagination-dots';
                pages.appendChild(dots);
            }
        }
    }

    // Data manipulation methods
    setData(data) {
        this.options.data = data;
        this.filteredData = [...data];
        this.currentPage = 1;
        this.render();
    }

    addRow(row) {
        this.options.data.push(row);
        this.filteredData = [...this.options.data];
        this.render();
    }

    updateRow(id, newData) {
        const index = this.options.data.findIndex(row => row.id === id);
        if (index !== -1) {
            this.options.data[index] = { ...this.options.data[index], ...newData };
            this.filteredData = [...this.options.data];
            this.render();
        }
    }

    deleteRow(id) {
        this.options.data = this.options.data.filter(row => row.id !== id);
        this.filteredData = [...this.options.data];
        this.selectedRows.delete(id);
        this.render();
    }

    search(query) {
        if (!query.trim()) {
            this.filteredData = [...this.options.data];
        } else {
            this.filteredData = this.options.data.filter(row => {
                return this.options.columns.some(column => {
                    const value = this.getNestedValue(row, column.field);
                    return String(value).toLowerCase().includes(query.toLowerCase());
                });
            });
        }
        this.currentPage = 1;
        this.render();
    }

    sort(field) {
        if (this.sortColumn === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = field;
            this.sortDirection = 'asc';
        }

        this.filteredData.sort((a, b) => {
            const aVal = this.getNestedValue(a, field);
            const bVal = this.getNestedValue(b, field);
            
            let comparison = 0;
            if (aVal > bVal) comparison = 1;
            if (aVal < bVal) comparison = -1;
            
            return this.sortDirection === 'desc' ? comparison * -1 : comparison;
        });

        this.updateSortIcons();
        this.render();
    }

    // Helper methods
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    getColumnCount() {
        let count = this.options.columns.length;
        if (this.options.selectable) count++;
        if (this.options.actions) count++;
        return count;
    }

    updateSortIcons() {
        const headers = document.querySelectorAll(`#${this.container.id}-thead th.sortable`);
        headers.forEach(header => {
            const icon = header.querySelector('i');
            icon.className = 'fas fa-sort';
            
            if (header.getAttribute('data-sort') === this.sortColumn) {
                icon.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
            }
        });
    }

    updateSelectAllState() {
        const selectAllCheckbox = document.getElementById(`${this.container.id}-select-all`);
        if (selectAllCheckbox) {
            const totalRows = this.filteredData.length;
            const selectedCount = this.selectedRows.size;
            
            selectAllCheckbox.checked = selectedCount === totalRows && totalRows > 0;
            selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalRows;
        }
    }

    selectAll(checked) {
        const checkboxes = document.querySelectorAll(`#${this.container.id}-tbody input[type="checkbox"]`);
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const value = checkbox.value;
            if (checked) {
                this.selectedRows.add(value);
            } else {
                this.selectedRows.delete(value);
            }
        });
    }

    goToPage(page) {
        this.currentPage = page;
        this.render();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.render();
        }
    }

    export() {
        const csvData = this.filteredData.map(row => {
            return this.options.columns.map(column => {
                return this.getNestedValue(row, column.field);
            }).join(',');
        });
        
        const headers = this.options.columns.map(col => col.title || col.field).join(',');
        const csv = [headers, ...csvData].join('\n');
        
        this.downloadFile(csv, 'export.csv', 'text/csv');
    }

    downloadFile(data, filename, type) {
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

    debounce(func, wait) {
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

    render() {
        this.renderHeaders();
        this.renderRows();
        this.renderPagination();
        this.updateSelectAllState();
    }

    getSelectedRows() {
        return Array.from(this.selectedRows);
    }

    clearSelection() {
        this.selectedRows.clear();
        this.updateSelectAllState();
        const checkboxes = document.querySelectorAll(`#${this.container.id}-tbody input[type="checkbox"]`);
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }
}
