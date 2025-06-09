// Search and Filter Component
export class SearchFilter {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            placeholder: 'Search...',
            debounceTime: 300,
            filters: [],
            searchFields: [],
            showAdvanced: false,
            onSearch: null,
            onFilter: null,
            ...options
        };
        this.searchTerm = '';
        this.activeFilters = new Map();
        this.init();
    }

    init() {
        this.create();
        this.bindEvents();
    }

    create() {
        this.container.innerHTML = `
            <div class="search-filter-container">
                <div class="search-input-container">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" class="search-input" placeholder="${this.options.placeholder}">
                    <button class="clear-search" style="display: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                ${this.options.filters.length > 0 ? `
                    <div class="filter-container">
                        <button class="filter-toggle">
                            <i class="fas fa-filter"></i> Filters
                            <span class="filter-count" style="display: none;">0</span>
                        </button>
                        <div class="filter-panel" style="display: none;">
                            ${this.createFilters()}
                        </div>
                    </div>
                ` : ''}
                
                ${this.options.showAdvanced ? `
                    <button class="advanced-search-toggle">
                        <i class="fas fa-cog"></i> Advanced
                    </button>
                ` : ''}
            </div>
        `;

        this.addStyles();
    }

    createFilters() {
        return this.options.filters.map(filter => {
            switch (filter.type) {
                case 'select':
                    return this.createSelectFilter(filter);
                case 'date':
                    return this.createDateFilter(filter);
                case 'range':
                    return this.createRangeFilter(filter);
                case 'checkbox':
                    return this.createCheckboxFilter(filter);
                default:
                    return this.createTextFilter(filter);
            }
        }).join('');
    }

    createSelectFilter(filter) {
        return `
            <div class="filter-group">
                <label>${filter.label}</label>
                <select class="filter-select" data-filter="${filter.key}">
                    <option value="">All ${filter.label}</option>
                    ${filter.options.map(option => `
                        <option value="${option.value}">${option.text}</option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    createDateFilter(filter) {
        return `
            <div class="filter-group">
                <label>${filter.label}</label>
                <div class="date-range">
                    <input type="date" class="filter-date" data-filter="${filter.key}" data-type="from" placeholder="From">
                    <input type="date" class="filter-date" data-filter="${filter.key}" data-type="to" placeholder="To">
                </div>
            </div>
        `;
    }

    createRangeFilter(filter) {
        return `
            <div class="filter-group">
                <label>${filter.label}</label>
                <div class="range-inputs">
                    <input type="number" class="filter-range" data-filter="${filter.key}" data-type="min" placeholder="Min">
                    <input type="number" class="filter-range" data-filter="${filter.key}" data-type="max" placeholder="Max">
                </div>
            </div>
        `;
    }

    createCheckboxFilter(filter) {
        return `
            <div class="filter-group">
                <label>${filter.label}</label>
                <div class="checkbox-group">
                    ${filter.options.map(option => `
                        <label class="checkbox-label">
                            <input type="checkbox" class="filter-checkbox" data-filter="${filter.key}" value="${option.value}">
                            <span>${option.text}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createTextFilter(filter) {
        return `
            <div class="filter-group">
                <label>${filter.label}</label>
                <input type="text" class="filter-text" data-filter="${filter.key}" placeholder="Enter ${filter.label.toLowerCase()}">
            </div>
        `;
    }

    bindEvents() {
        const searchInput = this.container.querySelector('.search-input');
        const clearButton = this.container.querySelector('.clear-search');
        const filterToggle = this.container.querySelector('.filter-toggle');
        const filterPanel = this.container.querySelector('.filter-panel');

        // Search input with debounce
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchTerm = e.target.value;
                this.updateClearButton();
                this.executeSearch();
            }, this.options.debounceTime));
        }

        // Clear search
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                this.updateClearButton();
                this.executeSearch();
            });
        }

        // Filter toggle
        if (filterToggle) {
            filterToggle.addEventListener('click', () => {
                const isVisible = filterPanel.style.display !== 'none';
                filterPanel.style.display = isVisible ? 'none' : 'block';
            });
        }

        // Filter inputs
        if (filterPanel) {
            filterPanel.addEventListener('change', (e) => {
                this.handleFilterChange(e);
            });

            filterPanel.addEventListener('input', this.debounce((e) => {
                this.handleFilterChange(e);
            }, this.options.debounceTime));
        }

        // Clear all filters
        const clearFiltersBtn = document.createElement('button');
        clearFiltersBtn.className = 'clear-filters';
        clearFiltersBtn.innerHTML = '<i class="fas fa-times"></i> Clear Filters';
        clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        
        if (filterPanel) {
            filterPanel.appendChild(clearFiltersBtn);
        }
    }

    handleFilterChange(e) {
        const element = e.target;
        const filterKey = element.dataset.filter;
        
        if (!filterKey) return;

        if (element.classList.contains('filter-select')) {
            this.setFilter(filterKey, element.value);
        } else if (element.classList.contains('filter-date')) {
            this.handleDateFilter(filterKey, element);
        } else if (element.classList.contains('filter-range')) {
            this.handleRangeFilter(filterKey, element);
        } else if (element.classList.contains('filter-checkbox')) {
            this.handleCheckboxFilter(filterKey);
        } else if (element.classList.contains('filter-text')) {
            this.setFilter(filterKey, element.value);
        }

        this.updateFilterCount();
        this.executeFilter();
    }

    handleDateFilter(filterKey, element) {
        const type = element.dataset.type;
        const currentFilter = this.activeFilters.get(filterKey) || {};
        currentFilter[type] = element.value;
        this.setFilter(filterKey, currentFilter);
    }

    handleRangeFilter(filterKey, element) {
        const type = element.dataset.type;
        const currentFilter = this.activeFilters.get(filterKey) || {};
        currentFilter[type] = element.value;
        this.setFilter(filterKey, currentFilter);
    }

    handleCheckboxFilter(filterKey) {
        const checkboxes = this.container.querySelectorAll(`input[data-filter="${filterKey}"]:checked`);
        const values = Array.from(checkboxes).map(cb => cb.value);
        this.setFilter(filterKey, values);
    }

    setFilter(key, value) {
        if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
            this.activeFilters.delete(key);
        } else {
            this.activeFilters.set(key, value);
        }
    }

    updateClearButton() {
        const clearButton = this.container.querySelector('.clear-search');
        if (clearButton) {
            clearButton.style.display = this.searchTerm ? 'block' : 'none';
        }
    }

    updateFilterCount() {
        const filterCount = this.container.querySelector('.filter-count');
        const count = this.activeFilters.size;
        
        if (filterCount) {
            if (count > 0) {
                filterCount.textContent = count;
                filterCount.style.display = 'inline';
            } else {
                filterCount.style.display = 'none';
            }
        }
    }

    executeSearch() {
        if (this.options.onSearch) {
            this.options.onSearch(this.searchTerm, this.activeFilters);
        }
    }

    executeFilter() {
        if (this.options.onFilter) {
            this.options.onFilter(this.activeFilters, this.searchTerm);
        }
    }

    clearAllFilters() {
        this.activeFilters.clear();
        
        // Clear all filter inputs
        this.container.querySelectorAll('.filter-select').forEach(select => select.value = '');
        this.container.querySelectorAll('.filter-date, .filter-range, .filter-text').forEach(input => input.value = '');
        this.container.querySelectorAll('.filter-checkbox').forEach(checkbox => checkbox.checked = false);
        
        this.updateFilterCount();
        this.executeFilter();
    }

    getSearchTerm() {
        return this.searchTerm;
    }

    getFilters() {
        return Object.fromEntries(this.activeFilters);
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

    addStyles() {
        if (document.getElementById('search-filter-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'search-filter-styles';
        styles.textContent = `
            .search-filter-container {
                display: flex;
                gap: 1rem;
                align-items: center;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }
            
            .search-input-container {
                position: relative;
                flex: 1;
                min-width: 250px;
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #6b7280;
            }
            
            .search-input {
                width: 100%;
                padding: 0.75rem 3rem 0.75rem 2.5rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.2s;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #1a365d;
            }
            
            .clear-search {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
            }
            
            .filter-container {
                position: relative;
            }
            
            .filter-toggle {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .filter-toggle:hover {
                border-color: #1a365d;
            }
            
            .filter-count {
                background: #ef4444;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 0.75rem;
                font-weight: bold;
                min-width: 18px;
                text-align: center;
            }
            
            .filter-panel {
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 1rem;
                min-width: 300px;
                z-index: 1000;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .filter-group {
                margin-bottom: 1rem;
            }
            
            .filter-group:last-child {
                margin-bottom: 0;
            }
            
            .filter-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #374151;
            }
            
            .filter-select,
            .filter-date,
            .filter-range,
            .filter-text {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 0.875rem;
            }
            
            .date-range,
            .range-inputs {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem;
            }
            
            .checkbox-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: normal;
                margin-bottom: 0;
            }
            
            .clear-filters {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #ef4444;
                background: #fee2e2;
                color: #dc2626;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 1rem;
                transition: all 0.2s;
            }
            
            .clear-filters:hover {
                background: #fecaca;
            }
            
            .advanced-search-toggle {
                padding: 0.75rem 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: border-color 0.2s;
            }
            
            .advanced-search-toggle:hover {
                border-color: #1a365d;
            }
        `;
        
        document.head.appendChild(styles);
    }
}
