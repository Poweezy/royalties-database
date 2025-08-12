export class SearchManager {
    constructor() {
        if (SearchManager.instance) {
            return SearchManager.instance;
        }
        SearchManager.instance = this;
        
        this.searchableEntities = {
            contracts: {
                fields: ['entity', 'type', 'status', 'notes'],
                weight: 2
            },
            users: {
                fields: ['username', 'email', 'firstName', 'lastName', 'role', 'department'],
                weight: 1
            },
            activities: {
                fields: ['description', 'category', 'details'],
                weight: 1
            }
        };

        this.initializeSearchComponents();
    }

    initializeSearchComponents() {
        // Add global search bar to navigation
        const searchContainer = document.createElement('div');
        searchContainer.className = 'global-search';
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" id="global-search" 
                       placeholder="Search contracts, users, activities..."
                       class="form-control">
                <i class="fas fa-search"></i>
            </div>
            <div id="search-results" class="search-results-container" style="display: none;">
                <div class="search-results-content"></div>
            </div>
        `;

        const navbarEnd = document.querySelector('.navbar-end');
        if (navbarEnd) {
            navbarEnd.insertBefore(searchContainer, navbarEnd.firstChild);
        }

        // Initialize search input listener
        this.searchInput = document.getElementById('global-search');
        this.searchResults = document.getElementById('search-results');
        this.searchResultsContent = this.searchResults.querySelector('.search-results-content');

        // Attach event listeners
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Debounced search input handler
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideSearchResults();
                return;
            }

            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.global-search')) {
                this.hideSearchResults();
            }
        });

        // Handle keyboard navigation in search results
        this.searchResults.addEventListener('keydown', (e) => {
            this.handleSearchResultsKeyboard(e);
        });
    }

    async performSearch(query) {
        try {
            // Prepare search parameters
            const searchParams = new URLSearchParams({
                query,
                entities: Object.keys(this.searchableEntities).join(',')
            });

            // Fetch search results
            const response = await fetch(`/api/search?${searchParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Search failed');

            const results = await response.json();
            this.displaySearchResults(results, query);

        } catch (error) {
            console.error('Search error:', error);
            this.displaySearchError();
        }
    }

    displaySearchResults(results, query) {
        // Group results by entity type
        const groupedResults = this.groupSearchResults(results);
        
        // Generate HTML for results
        const resultsHTML = Object.entries(groupedResults)
            .map(([entity, items]) => this.generateEntityResultsHTML(entity, items))
            .filter(html => html) // Remove empty sections
            .join('');

        // Update results container
        this.searchResultsContent.innerHTML = resultsHTML || this.getNoResultsHTML(query);
        this.showSearchResults();

        // Add result selection handlers
        this.addResultSelectionHandlers();
    }

    groupSearchResults(results) {
        return results.reduce((grouped, result) => {
            if (!grouped[result.entity]) {
                grouped[result.entity] = [];
            }
            grouped[result.entity].push(result);
            return grouped;
        }, {});
    }

    generateEntityResultsHTML(entity, items) {
        if (items.length === 0) return '';

        const entityTitle = this.getEntityTitle(entity);
        const itemsHTML = items
            .map(item => this.generateResultItemHTML(entity, item))
            .join('');

        return `
            <div class="search-results-section">
                <h6 class="section-title">
                    <i class="fas ${this.getEntityIcon(entity)}"></i>
                    ${entityTitle} (${items.length})
                </h6>
                <div class="section-items">
                    ${itemsHTML}
                </div>
            </div>
        `;
    }

    generateResultItemHTML(entity, item) {
        const title = this.getItemTitle(entity, item);
        const subtitle = this.getItemSubtitle(entity, item);
        const status = this.getItemStatus(entity, item);

        return `
            <div class="search-result-item" 
                 data-entity="${entity}" 
                 data-id="${item.id}"
                 tabindex="0">
                <div class="item-content">
                    <div class="item-main">
                        <div class="item-title">${title}</div>
                        ${subtitle ? `<div class="item-subtitle">${subtitle}</div>` : ''}
                    </div>
                    ${status ? `<div class="item-status">${status}</div>` : ''}
                </div>
            </div>
        `;
    }

    getEntityTitle(entity) {
        const titles = {
            contracts: 'Contracts',
            users: 'Users',
            activities: 'Activities'
        };
        return titles[entity] || entity;
    }

    getEntityIcon(entity) {
        const icons = {
            contracts: 'fa-file-contract',
            users: 'fa-users',
            activities: 'fa-history'
        };
        return icons[entity] || 'fa-file';
    }

    getItemTitle(entity, item) {
        switch (entity) {
            case 'contracts':
                return `${item.entity} - ${item.type}`;
            case 'users':
                return `${item.firstName} ${item.lastName}`;
            case 'activities':
                return item.description;
            default:
                return item.title || 'Untitled';
        }
    }

    getItemSubtitle(entity, item) {
        switch (entity) {
            case 'contracts':
                return `Valid: ${this.formatDate(item.startDate)} - ${this.formatDate(item.endDate)}`;
            case 'users':
                return `${item.email} - ${item.role}`;
            case 'activities':
                return `${item.category} - ${this.formatDate(item.timestamp)}`;
            default:
                return '';
        }
    }

    getItemStatus(entity, item) {
        if (!item.status) return '';

        return `
            <span class="status-badge ${item.status.toLowerCase()}">
                ${item.status}
            </span>
        `;
    }

    addResultSelectionHandlers() {
        const items = this.searchResultsContent.querySelectorAll('.search-result-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                this.handleResultSelection(item);
            });
        });
    }

    handleResultSelection(resultItem) {
        const entity = resultItem.dataset.entity;
        const id = resultItem.dataset.id;

        // Navigate to appropriate section and highlight item
        switch (entity) {
            case 'contracts':
                this.navigateToContract(id);
                break;
            case 'users':
                this.navigateToUser(id);
                break;
            case 'activities':
                this.navigateToActivity(id);
                break;
        }

        // Hide search results
        this.hideSearchResults();
        this.searchInput.value = '';
    }

    navigateToContract(id) {
        // Navigate to contracts section and highlight contract
        const section = document.querySelector('a[href="#contracts"]');
        if (section) {
            section.click();
            setTimeout(() => {
                const row = document.querySelector(`tr[data-contract-id="${id}"]`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.classList.add('highlight');
                    setTimeout(() => row.classList.remove('highlight'), 2000);
                }
            }, 300);
        }
    }

    navigateToUser(id) {
        // Navigate to users section and highlight user
        const section = document.querySelector('a[href="#users"]');
        if (section) {
            section.click();
            setTimeout(() => {
                const row = document.querySelector(`tr[data-user-id="${id}"]`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.classList.add('highlight');
                    setTimeout(() => row.classList.remove('highlight'), 2000);
                }
            }, 300);
        }
    }

    navigateToActivity(id) {
        // Navigate to activities section and highlight activity
        const section = document.querySelector('a[href="#audit-logs"]');
        if (section) {
            section.click();
            setTimeout(() => {
                const row = document.querySelector(`tr[data-log-id="${id}"]`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.classList.add('highlight');
                    setTimeout(() => row.classList.remove('highlight'), 2000);
                }
            }, 300);
        }
    }

    handleSearchResultsKeyboard(event) {
        const items = Array.from(this.searchResultsContent.querySelectorAll('.search-result-item'));
        const currentIndex = items.findIndex(item => item === document.activeElement);

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (currentIndex < items.length - 1) {
                    items[currentIndex + 1].focus();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex - 1].focus();
                }
                break;
            case 'Enter':
                event.preventDefault();
                if (document.activeElement.classList.contains('search-result-item')) {
                    this.handleResultSelection(document.activeElement);
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.hideSearchResults();
                this.searchInput.blur();
                break;
        }
    }

    showSearchResults() {
        this.searchResults.style.display = 'block';
    }

    hideSearchResults() {
        this.searchResults.style.display = 'none';
    }

    getNoResultsHTML(query) {
        return `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No results found for "${query}"</p>
                <small>Try different keywords or check your spelling</small>
            </div>
        `;
    }

    displaySearchError() {
        this.searchResultsContent.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>An error occurred while searching</p>
                <small>Please try again later</small>
            </div>
        `;
        this.showSearchResults();
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }
}
