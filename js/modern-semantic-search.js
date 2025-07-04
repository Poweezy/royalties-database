/**
 * Modern Semantic Search System
 * 
 * A comprehensive, AI-powered search system with modern UI/UX for the Royalties Database.
 * Features semantic search capabilities, real-time suggestions, advanced filtering,
 * and beautiful modern design with glass morphism effects.
 * 
 * @version 1.0.0
 * @author GitHub Copilot & Modern UI Team
 */

class ModernSemanticSearch {
    constructor(options = {}) {
        this.config = {
            containerSelector: options.containerSelector || '.semantic-search-container',
            placeholder: options.placeholder || 'Search across all data...',
            categories: options.categories || ['all', 'notifications', 'records', 'contracts', 'compliance', 'users'],
            suggestionLimit: options.suggestionLimit || 8,
            debounceDelay: options.debounceDelay || 300,
            enableVoiceSearch: options.enableVoiceSearch || true,
            enableSemanticMatching: options.enableSemanticMatching || true,
            themeAware: options.themeAware !== false,
            ...options
        };

        this.state = {
            isOpen: false,
            currentQuery: '',
            activeCategory: 'all',
            searchHistory: JSON.parse(localStorage.getItem('search-history') || '[]'),
            recentSearches: JSON.parse(localStorage.getItem('recent-searches') || '[]'),
            suggestions: [],
            results: [],
            isSearching: false,
            selectedIndex: -1
        };

        this.searchIndex = new Map();
        this.debounceTimer = null;
        this.voiceRecognition = null;

        this.init();
    }

    init() {
        this.createSearchInterface();
        this.bindEvents();
        this.buildSearchIndex();
        this.setupVoiceSearch();
        this.setupKeyboardShortcuts();
        
        if (this.config.themeAware) {
            this.initThemeWatcher();
        }

        console.log('✅ Modern Semantic Search initialized');
    }

    createSearchInterface() {
        const container = document.querySelector(this.config.containerSelector) || this.createContainer();
        
        container.innerHTML = `
            <div class="semantic-search-wrapper glass-card">
                <!-- Search Header -->
                <div class="search-header">
                    <div class="search-input-container">
                        <div class="search-icon-wrapper">
                            <i class="fas fa-search search-icon" id="search-icon"></i>
                            <i class="fas fa-spinner fa-spin search-loading" id="search-loading" style="display: none;"></i>
                        </div>
                        
                        <input 
                            type="text" 
                            id="semantic-search-input" 
                            class="semantic-search-input input-modern"
                            placeholder="${this.config.placeholder}"
                            autocomplete="off"
                            spellcheck="false"
                            role="combobox"
                            aria-expanded="false"
                            aria-autocomplete="list"
                            aria-owns="search-suggestions"
                        >
                        
                        <div class="search-actions">
                            ${this.config.enableVoiceSearch ? `
                                <button 
                                    type="button" 
                                    id="voice-search-btn" 
                                    class="btn-icon voice-search-btn"
                                    title="Voice search (Press and hold)"
                                    aria-label="Voice search"
                                >
                                    <i class="fas fa-microphone"></i>
                                </button>
                            ` : ''}
                            
                            <button 
                                type="button" 
                                id="advanced-search-btn" 
                                class="btn-icon advanced-search-btn"
                                title="Advanced search options"
                                aria-label="Advanced search"
                            >
                                <i class="fas fa-sliders-h"></i>
                            </button>
                            
                            <button 
                                type="button" 
                                id="clear-search-btn" 
                                class="btn-icon clear-search-btn"
                                title="Clear search"
                                aria-label="Clear search"
                                style="display: none;"
                            >
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Category Filters -->
                    <div class="search-categories" id="search-categories">
                        ${this.config.categories.map(category => `
                            <button 
                                type="button" 
                                class="category-filter ${category === 'all' ? 'active' : ''}"
                                data-category="${category}"
                                title="Search in ${category}"
                            >
                                <i class="fas ${this.getCategoryIcon(category)}"></i>
                                <span>${this.formatCategoryName(category)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Search Dropdown -->
                <div class="search-dropdown glass-card" id="search-dropdown" style="display: none;">
                    <!-- Quick Actions -->
                    <div class="search-quick-actions" id="search-quick-actions" style="display: none;">
                        <div class="quick-actions-header">
                            <span>Quick Actions</span>
                        </div>
                        <div class="quick-actions-list">
                            <button class="quick-action-btn" data-action="new-record">
                                <i class="fas fa-plus"></i> Add New Record
                            </button>
                            <button class="quick-action-btn" data-action="export-data">
                                <i class="fas fa-download"></i> Export Data
                            </button>
                            <button class="quick-action-btn" data-action="generate-report">
                                <i class="fas fa-chart-bar"></i> Generate Report
                            </button>
                        </div>
                    </div>

                    <!-- Search Suggestions -->
                    <div class="search-suggestions" id="search-suggestions" role="listbox">
                        <!-- Dynamic content -->
                    </div>

                    <!-- Recent Searches -->
                    <div class="recent-searches" id="recent-searches" style="display: none;">
                        <div class="recent-searches-header">
                            <span>Recent Searches</span>
                            <button class="btn-text clear-history-btn" id="clear-history-btn">
                                Clear
                            </button>
                        </div>
                        <div class="recent-searches-list">
                            <!-- Dynamic content -->
                        </div>
                    </div>

                    <!-- Search Results Preview -->
                    <div class="search-results-preview" id="search-results-preview" style="display: none;">
                        <div class="results-header">
                            <span class="results-count">0 results found</span>
                            <button class="btn-text view-all-btn" id="view-all-results-btn">
                                View All
                            </button>
                        </div>
                        <div class="results-list">
                            <!-- Dynamic content -->
                        </div>
                    </div>

                    <!-- No Results -->
                    <div class="no-results" id="no-results" style="display: none;">
                        <div class="no-results-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="no-results-text">
                            <h4>No results found</h4>
                            <p>Try adjusting your search terms or category filters</p>
                        </div>
                        <div class="search-suggestions-alt">
                            <span>Try searching for:</span>
                            <div class="suggestion-tags">
                                <button class="suggestion-tag" data-suggestion="payment records">payment records</button>
                                <button class="suggestion-tag" data-suggestion="compliance reports">compliance reports</button>
                                <button class="suggestion-tag" data-suggestion="contract management">contract management</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Advanced Search Panel -->
                <div class="advanced-search-panel glass-card" id="advanced-search-panel" style="display: none;">
                    <div class="advanced-search-header">
                        <h4><i class="fas fa-search-plus"></i> Advanced Search</h4>
                        <button class="btn-icon close-advanced-btn" id="close-advanced-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="advanced-search-content">
                        <div class="search-field-group">
                            <label>Search Fields</label>
                            <div class="field-checkboxes">
                                <label class="checkbox-label">
                                    <input type="checkbox" value="title" checked> Title/Name
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" value="description" checked> Description
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" value="content" checked> Content
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" value="metadata"> Metadata
                                </label>
                            </div>
                        </div>

                        <div class="search-filters-group">
                            <div class="filter-row">
                                <div class="filter-field">
                                    <label>Date Range</label>
                                    <select class="form-select" id="date-range-filter">
                                        <option value="">Any time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Past week</option>
                                        <option value="month">Past month</option>
                                        <option value="quarter">Past quarter</option>
                                        <option value="year">Past year</option>
                                        <option value="custom">Custom range</option>
                                    </select>
                                </div>
                                
                                <div class="filter-field">
                                    <label>Status</label>
                                    <select class="form-select" id="status-filter">
                                        <option value="">Any status</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div class="filter-row">
                                <div class="filter-field">
                                    <label>Priority</label>
                                    <select class="form-select" id="priority-filter">
                                        <option value="">Any priority</option>
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                
                                <div class="filter-field">
                                    <label>Entity/Source</label>
                                    <input type="text" class="form-control" id="entity-filter" placeholder="Filter by entity or source">
                                </div>
                            </div>
                        </div>

                        <div class="advanced-search-actions">
                            <button class="btn btn-secondary" id="reset-advanced-btn">
                                <i class="fas fa-undo"></i> Reset
                            </button>
                            <button class="btn btn-primary" id="apply-advanced-btn">
                                <i class="fas fa-search"></i> Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.elements = {
            wrapper: container.querySelector('.semantic-search-wrapper'),
            input: container.querySelector('#semantic-search-input'),
            dropdown: container.querySelector('#search-dropdown'),
            suggestions: container.querySelector('#search-suggestions'),
            recentSearches: container.querySelector('#recent-searches'),
            resultsPreview: container.querySelector('#search-results-preview'),
            noResults: container.querySelector('#no-results'),
            quickActions: container.querySelector('#search-quick-actions'),
            advancedPanel: container.querySelector('#advanced-search-panel'),
            voiceBtn: container.querySelector('#voice-search-btn'),
            clearBtn: container.querySelector('#clear-search-btn'),
            categories: container.querySelectorAll('.category-filter'),
            searchIcon: container.querySelector('#search-icon'),
            searchLoading: container.querySelector('#search-loading')
        };
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'semantic-search-container';
        
        // Find the best place to insert the search
        const header = document.querySelector('.page-header, .dashboard-header, .main-header');
        const sidebar = document.querySelector('.sidebar');
        const main = document.querySelector('main, .main-content');
        
        if (header) {
            header.appendChild(container);
        } else if (main) {
            main.insertBefore(container, main.firstChild);
        } else {
            document.body.appendChild(container);
        }
        
        return container;
    }

    bindEvents() {
        // Search input events
        this.elements.input.addEventListener('input', (e) => this.handleInput(e));
        this.elements.input.addEventListener('focus', () => this.handleFocus());
        this.elements.input.addEventListener('blur', (e) => this.handleBlur(e));
        this.elements.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Category filter events
        this.elements.categories.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCategoryChange(e));
        });

        // Voice search events
        if (this.elements.voiceBtn) {
            this.elements.voiceBtn.addEventListener('mousedown', () => this.startVoiceSearch());
            this.elements.voiceBtn.addEventListener('mouseup', () => this.stopVoiceSearch());
            this.elements.voiceBtn.addEventListener('mouseleave', () => this.stopVoiceSearch());
        }

        // Clear search
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.clearSearch());
        }

        // Advanced search toggle
        const advancedBtn = document.querySelector('#advanced-search-btn');
        if (advancedBtn) {
            advancedBtn.addEventListener('click', () => this.toggleAdvancedSearch());
        }

        // Click outside to close
        document.addEventListener('click', (e) => this.handleClickOutside(e));

        // Window resize
        window.addEventListener('resize', () => this.updateDropdownPosition());
    }

    handleInput(e) {
        const query = e.target.value.trim();
        this.state.currentQuery = query;

        // Show/hide clear button
        if (this.elements.clearBtn) {
            this.elements.clearBtn.style.display = query ? 'flex' : 'none';
        }

        // Debounced search
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, this.config.debounceDelay);

        // Show dropdown immediately for UX
        if (!this.state.isOpen) {
            this.openDropdown();
        }

        // Update suggestions immediately for fast feedback
        this.updateSuggestions(query);
    }

    handleFocus() {
        this.openDropdown();
        
        if (!this.state.currentQuery) {
            this.showRecentSearches();
            this.showQuickActions();
        }
    }

    handleBlur(e) {
        // Delay closing to allow for clicks
        setTimeout(() => {
            if (!this.elements.wrapper.contains(document.activeElement)) {
                this.closeDropdown();
            }
        }, 150);
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateResults(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateResults(-1);
                break;
            case 'Enter':
                e.preventDefault();
                this.selectResult();
                break;
            case 'Escape':
                this.closeDropdown();
                this.elements.input.blur();
                break;
            case 'Tab':
                if (this.state.isOpen && this.state.suggestions.length > 0) {
                    e.preventDefault();
                    this.navigateResults(1);
                }
                break;
        }
    }

    handleCategoryChange(e) {
        const category = e.target.closest('.category-filter').dataset.category;
        
        // Update active category
        this.elements.categories.forEach(btn => btn.classList.remove('active'));
        e.target.closest('.category-filter').classList.add('active');
        
        this.state.activeCategory = category;
        
        // Re-search if there's a query
        if (this.state.currentQuery) {
            this.performSearch(this.state.currentQuery);
        }
    }

    handleClickOutside(e) {
        if (!this.elements.wrapper.contains(e.target)) {
            this.closeDropdown();
        }
    }

    performSearch(query) {
        if (!query) {
            this.showRecentSearches();
            this.showQuickActions();
            return;
        }

        this.showLoading(true);
        this.hideAllSections();

        // Simulate search delay for UX
        setTimeout(() => {
            const results = this.searchData(query);
            this.displayResults(results);
            this.showLoading(false);
            
            // Add to search history
            this.addToSearchHistory(query);
        }, 200);
    }

    searchData(query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        const categoryFilter = this.state.activeCategory;
        const results = [];

        // Search through indexed data
        for (const [category, items] of this.searchIndex) {
            if (categoryFilter !== 'all' && categoryFilter !== category) continue;

            for (const item of items) {
                const score = this.calculateRelevanceScore(item, searchTerms);
                if (score > 0) {
                    results.push({
                        ...item,
                        category,
                        relevanceScore: score,
                        matchedTerms: this.getMatchedTerms(item, searchTerms)
                    });
                }
            }
        }

        // Sort by relevance score
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    calculateRelevanceScore(item, searchTerms) {
        let score = 0;
        const content = `${item.title} ${item.description} ${item.content || ''}`.toLowerCase();

        searchTerms.forEach(term => {
            // Exact matches get higher scores
            if (item.title.toLowerCase().includes(term)) score += 10;
            if (item.description.toLowerCase().includes(term)) score += 5;
            if (content.includes(term)) score += 2;
            
            // Semantic matching (simplified)
            if (this.config.enableSemanticMatching) {
                score += this.getSemanticScore(term, content);
            }
        });

        return score;
    }

    getSemanticScore(term, content) {
        // Simplified semantic matching - in a real app, you'd use NLP APIs
        const semanticMappings = {
            'payment': ['royalty', 'invoice', 'billing', 'money', 'financial'],
            'contract': ['agreement', 'deal', 'terms', 'negotiation'],
            'compliance': ['regulation', 'law', 'audit', 'requirement'],
            'mining': ['extraction', 'drilling', 'operation', 'production']
        };

        let score = 0;
        Object.entries(semanticMappings).forEach(([key, synonyms]) => {
            if (term === key || synonyms.includes(term)) {
                synonyms.forEach(synonym => {
                    if (content.includes(synonym)) score += 1;
                });
            }
        });

        return score;
    }

    getMatchedTerms(item, searchTerms) {
        const content = `${item.title} ${item.description}`.toLowerCase();
        return searchTerms.filter(term => content.includes(term));
    }

    displayResults(results) {
        if (results.length === 0) {
            this.showNoResults();
            return;
        }

        this.state.results = results;
        const preview = results.slice(0, 5); // Show top 5 results

        this.elements.resultsPreview.style.display = 'block';
        
        const resultsHeader = this.elements.resultsPreview.querySelector('.results-count');
        resultsHeader.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;

        const resultsList = this.elements.resultsPreview.querySelector('.results-list');
        resultsList.innerHTML = preview.map((result, index) => `
            <div class="search-result-item" data-index="${index}" role="option">
                <div class="result-icon">
                    <i class="fas ${this.getCategoryIcon(result.category)}"></i>
                </div>
                <div class="result-content">
                    <div class="result-title">${this.highlightMatches(result.title, result.matchedTerms)}</div>
                    <div class="result-description">${this.highlightMatches(result.description, result.matchedTerms)}</div>
                    <div class="result-meta">
                        <span class="result-category">${this.formatCategoryName(result.category)}</span>
                        ${result.date ? `<span class="result-date">${this.formatDate(result.date)}</span>` : ''}
                    </div>
                </div>
                <div class="result-actions">
                    <button class="btn-icon result-action-btn" title="Quick view">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Bind result click events
        resultsList.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('click', () => this.selectResult(index));
        });
    }

    highlightMatches(text, matchedTerms) {
        let highlightedText = text;
        matchedTerms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        return highlightedText;
    }

    showRecentSearches() {
        if (this.state.recentSearches.length === 0) return;

        this.elements.recentSearches.style.display = 'block';
        const list = this.elements.recentSearches.querySelector('.recent-searches-list');
        
        list.innerHTML = this.state.recentSearches.slice(0, 5).map(search => `
            <button class="recent-search-item" data-query="${search.query}">
                <i class="fas fa-history"></i>
                <span>${search.query}</span>
                <small>${this.formatDate(search.date)}</small>
            </button>
        `).join('');

        // Bind click events
        list.querySelectorAll('.recent-search-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const query = e.target.closest('.recent-search-item').dataset.query;
                this.elements.input.value = query;
                this.state.currentQuery = query;
                this.performSearch(query);
            });
        });
    }

    showQuickActions() {
        this.elements.quickActions.style.display = 'block';
        
        // Bind quick action events
        this.elements.quickActions.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.quick-action-btn').dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        // Delegate to the main app or notification system
        if (window.notificationManager) {
            switch (action) {
                case 'new-record':
                    window.notificationManager.show('Opening new record form...', 'info');
                    break;
                case 'export-data':
                    window.notificationManager.show('Preparing data export...', 'info');
                    break;
                case 'generate-report':
                    window.notificationManager.show('Opening report generator...', 'info');
                    break;
            }
        }
        
        this.closeDropdown();
    }

    showNoResults() {
        this.elements.noResults.style.display = 'block';
        
        // Bind suggestion tag events
        this.elements.noResults.querySelectorAll('.suggestion-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const suggestion = e.target.dataset.suggestion;
                this.elements.input.value = suggestion;
                this.state.currentQuery = suggestion;
                this.performSearch(suggestion);
            });
        });
    }

    hideAllSections() {
        this.elements.quickActions.style.display = 'none';
        this.elements.recentSearches.style.display = 'none';
        this.elements.resultsPreview.style.display = 'none';
        this.elements.noResults.style.display = 'none';
    }

    openDropdown() {
        this.state.isOpen = true;
        this.elements.dropdown.style.display = 'block';
        this.elements.input.setAttribute('aria-expanded', 'true');
        this.updateDropdownPosition();
        
        // Add animation
        requestAnimationFrame(() => {
            this.elements.dropdown.classList.add('show');
        });
    }

    closeDropdown() {
        this.state.isOpen = false;
        this.elements.dropdown.classList.remove('show');
        this.elements.input.setAttribute('aria-expanded', 'false');
        
        setTimeout(() => {
            this.elements.dropdown.style.display = 'none';
        }, 200);
    }

    updateDropdownPosition() {
        const inputRect = this.elements.input.getBoundingClientRect();
        const dropdown = this.elements.dropdown;
        
        dropdown.style.top = `${inputRect.bottom + 8}px`;
        dropdown.style.left = `${inputRect.left}px`;
        dropdown.style.width = `${Math.max(inputRect.width, 400)}px`;
    }

    navigateResults(direction) {
        const results = this.elements.resultsPreview.querySelectorAll('.search-result-item');
        if (results.length === 0) return;

        // Remove current selection
        results[this.state.selectedIndex]?.classList.remove('selected');

        // Update index
        this.state.selectedIndex += direction;
        if (this.state.selectedIndex >= results.length) this.state.selectedIndex = 0;
        if (this.state.selectedIndex < 0) this.state.selectedIndex = results.length - 1;

        // Add new selection
        results[this.state.selectedIndex]?.classList.add('selected');
        results[this.state.selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }

    selectResult(index = this.state.selectedIndex) {
        if (index < 0 || !this.state.results[index]) return;

        const result = this.state.results[index];
        
        // Handle result selection based on category
        this.handleResultSelection(result);
        this.closeDropdown();
        this.addToSearchHistory(this.state.currentQuery);
    }

    handleResultSelection(result) {
        // Delegate to appropriate handlers based on category
        if (window.notificationManager) {
            window.notificationManager.show(`Opening ${result.title}...`, 'info');
        }

        // Navigate to appropriate section
        if (window.royaltiesApp && typeof window.royaltiesApp.navigateTo === 'function') {
            window.royaltiesApp.navigateTo(result.category);
        }
    }

    clearSearch() {
        this.elements.input.value = '';
        this.elements.clearBtn.style.display = 'none';
        this.state.currentQuery = '';
        this.state.selectedIndex = -1;
        this.hideAllSections();
        this.showRecentSearches();
        this.showQuickActions();
    }

    addToSearchHistory(query) {
        if (!query || query.length < 2) return;

        const searchEntry = {
            query,
            date: new Date(),
            category: this.state.activeCategory
        };

        // Remove duplicates
        this.state.recentSearches = this.state.recentSearches.filter(s => s.query !== query);
        
        // Add to beginning
        this.state.recentSearches.unshift(searchEntry);
        
        // Limit to 20 recent searches
        this.state.recentSearches = this.state.recentSearches.slice(0, 20);
        
        // Save to localStorage
        localStorage.setItem('recent-searches', JSON.stringify(this.state.recentSearches));
    }

    buildSearchIndex() {
        // Build searchable index from application data
        this.searchIndex.clear();

        // Sample data - in a real app, this would come from your data sources
        this.addToSearchIndex('notifications', [
            {
                id: 'notif-1',
                title: 'Payment Received',
                description: 'Royalty payment received from Maloma Colliery',
                content: 'A payment of E2,450,000 has been received for Q1 2025 royalty obligations.',
                date: new Date('2025-01-15'),
                priority: 'high'
            },
            {
                id: 'notif-2',
                title: 'Compliance Check Due',
                description: 'Annual compliance audit scheduled for Bomvu Ridge Mine',
                content: 'Environmental compliance audit must be completed by March 31, 2025.',
                date: new Date('2025-01-10'),
                priority: 'critical'
            }
        ]);

        this.addToSearchIndex('records', [
            {
                id: 'record-1',
                title: 'RR-2025-001',
                description: 'Iron ore royalty calculation for Ngwenya Mine',
                content: 'Monthly royalty calculation based on 45,000 tons extracted at E150/ton',
                date: new Date('2025-01-20'),
                entity: 'Ngwenya Mine'
            }
        ]);

        this.addToSearchIndex('contracts', [
            {
                id: 'contract-1',
                title: 'CONT-2024-A15',
                description: 'Mining lease agreement with Bulembu Asbestos Mine',
                content: '25-year mining lease with 3.5% royalty rate on gross revenue',
                date: new Date('2024-06-15'),
                entity: 'Bulembu Asbestos Mine'
            }
        ]);

        this.addToSearchIndex('compliance', [
            {
                id: 'compliance-1',
                title: 'Environmental Impact Assessment',
                description: 'EIA report for Mahamba Gorge expansion project',
                content: 'Comprehensive environmental assessment covering water, air, and land impact',
                date: new Date('2025-01-05'),
                status: 'pending'
            }
        ]);

        console.log('✅ Search index built with', this.searchIndex.size, 'categories');
    }

    addToSearchIndex(category, items) {
        if (!this.searchIndex.has(category)) {
            this.searchIndex.set(category, []);
        }
        this.searchIndex.get(category).push(...items);
    }

    setupVoiceSearch() {
        if (!this.config.enableVoiceSearch || !('webkitSpeechRecognition' in window)) {
            if (this.elements.voiceBtn) {
                this.elements.voiceBtn.style.display = 'none';
            }
            return;
        }

        this.voiceRecognition = new webkitSpeechRecognition();
        this.voiceRecognition.continuous = false;
        this.voiceRecognition.interimResults = false;
        this.voiceRecognition.lang = 'en-US';

        this.voiceRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.elements.input.value = transcript;
            this.state.currentQuery = transcript;
            this.performSearch(transcript);
        };

        this.voiceRecognition.onerror = (event) => {
            console.warn('Voice recognition error:', event.error);
            if (window.notificationManager) {
                window.notificationManager.show('Voice search failed. Please try again.', 'warning');
            }
        };
    }

    startVoiceSearch() {
        if (!this.voiceRecognition) return;

        try {
            this.voiceRecognition.start();
            this.elements.voiceBtn.classList.add('recording');
            
            if (window.notificationManager) {
                window.notificationManager.show('Listening... Speak your search query', 'info');
            }
        } catch (error) {
            console.warn('Voice search error:', error);
        }
    }

    stopVoiceSearch() {
        if (!this.voiceRecognition) return;

        try {
            this.voiceRecognition.stop();
            this.elements.voiceBtn.classList.remove('recording');
        } catch (error) {
            console.warn('Voice search stop error:', error);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.elements.input.focus();
                this.openDropdown();
            }

            // Ctrl/Cmd + Shift + F for advanced search
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.toggleAdvancedSearch();
            }
        });
    }

    toggleAdvancedSearch() {
        const panel = this.elements.advancedPanel;
        const isVisible = panel.style.display !== 'none';
        
        if (isVisible) {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            this.bindAdvancedSearchEvents();
        }
    }

    bindAdvancedSearchEvents() {
        // Close advanced search
        const closeBtn = this.elements.advancedPanel.querySelector('#close-advanced-btn');
        closeBtn?.addEventListener('click', () => {
            this.elements.advancedPanel.style.display = 'none';
        });

        // Reset filters
        const resetBtn = this.elements.advancedPanel.querySelector('#reset-advanced-btn');
        resetBtn?.addEventListener('click', () => {
            this.resetAdvancedFilters();
        });

        // Apply filters
        const applyBtn = this.elements.advancedPanel.querySelector('#apply-advanced-btn');
        applyBtn?.addEventListener('click', () => {
            this.applyAdvancedFilters();
        });
    }

    resetAdvancedFilters() {
        const panel = this.elements.advancedPanel;
        panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = ['title', 'description', 'content'].includes(cb.value);
        });
        panel.querySelectorAll('select').forEach(select => select.value = '');
        panel.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    }

    applyAdvancedFilters() {
        // Apply advanced filters to search
        if (this.state.currentQuery) {
            this.performSearch(this.state.currentQuery);
        }
        
        this.elements.advancedPanel.style.display = 'none';
        
        if (window.notificationManager) {
            window.notificationManager.show('Advanced filters applied', 'success');
        }
    }

    showLoading(show) {
        this.elements.searchIcon.style.display = show ? 'none' : 'block';
        this.elements.searchLoading.style.display = show ? 'block' : 'none';
    }

    initThemeWatcher() {
        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.updateThemeClasses();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Listen for theme change events
        window.addEventListener('themeChanged', () => {
            this.updateThemeClasses();
        });
    }

    updateThemeClasses() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.elements.wrapper.classList.toggle('dark-theme', isDark);
    }

    // Utility methods
    getCategoryIcon(category) {
        const icons = {
            all: 'fa-search',
            notifications: 'fa-bell',
            records: 'fa-file-invoice-dollar',
            contracts: 'fa-file-contract',
            compliance: 'fa-shield-alt',
            users: 'fa-users',
            analytics: 'fa-chart-bar'
        };
        return icons[category] || 'fa-folder';
    }

    formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    updateSuggestions(query) {
        // Generate suggestions based on current query
        if (!query) return;

        const suggestions = this.generateSuggestions(query);
        this.state.suggestions = suggestions;

        // Update suggestions UI if needed
        if (suggestions.length > 0) {
            this.elements.suggestions.innerHTML = suggestions.map((suggestion, index) => `
                <div class="search-suggestion-item" data-index="${index}">
                    <i class="fas fa-search"></i>
                    <span>${suggestion}</span>
                </div>
            `).join('');

            this.elements.suggestions.style.display = 'block';
        }
    }

    generateSuggestions(query) {
        // Generate smart suggestions based on query
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Category-based suggestions
        if (queryLower.includes('pay')) {
            suggestions.push('payment records', 'payment status', 'payment history');
        }
        if (queryLower.includes('contract')) {
            suggestions.push('contract management', 'contract terms', 'contract renewals');
        }
        if (queryLower.includes('complian')) {
            suggestions.push('compliance reports', 'compliance audits', 'compliance status');
        }

        return suggestions.slice(0, this.config.suggestionLimit);
    }

    // Public API methods
    search(query, category = 'all') {
        this.state.activeCategory = category;
        this.elements.input.value = query;
        this.state.currentQuery = query;
        this.performSearch(query);
    }

    setCategory(category) {
        this.state.activeCategory = category;
        this.elements.categories.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
    }

    addSearchData(category, data) {
        this.addToSearchIndex(category, Array.isArray(data) ? data : [data]);
    }

    destroy() {
        // Clean up event listeners and resources
        clearTimeout(this.debounceTimer);
        if (this.voiceRecognition) {
            this.voiceRecognition.abort();
        }
        this.elements.wrapper.remove();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.modernSemanticSearch = new ModernSemanticSearch({
        containerSelector: '.semantic-search-container',
        placeholder: 'Search royalties, contracts, compliance...',
        categories: ['all', 'notifications', 'records', 'contracts', 'compliance', 'users', 'analytics'],
        enableVoiceSearch: true,
        enableSemanticMatching: true
    });

    console.log('✅ Modern Semantic Search auto-initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernSemanticSearch;
}
