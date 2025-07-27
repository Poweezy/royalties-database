/**
 * Clean Semantic Search Functionality
 * Simple, maintainable search interface
 */

class SemanticSearch {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupFilters();
  }

  bindEvents() {
    // Search button
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.performSearch());
    }

    // Enter key in search input
    const searchInput = document.getElementById('semantic-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
    }

    // Toggle filters
    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    if (toggleFiltersBtn) {
      toggleFiltersBtn.addEventListener('click', () => this.toggleFilters());
    }

    // Clear search
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => this.clearSearch());
    }

    // Export results
    const exportBtn = document.getElementById('export-results-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportResults());
    }
  }

  setupFilters() {
    // Initialize filter states
    this.filters = {
      dataSources: ['royalty-records', 'entities', 'compliance'],
      timePeriod: 'ytd',
      entityType: ''
    };
  }

  toggleFilters() {
    const filtersContainer = document.getElementById('search-filters');
    const toggleBtn = document.getElementById('toggle-filters-btn');
    
    if (filtersContainer && toggleBtn) {
      const isVisible = filtersContainer.style.display !== 'none';
      filtersContainer.style.display = isVisible ? 'none' : 'block';
      
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = isVisible ? 'fas fa-filter' : 'fas fa-filter-circle-xmark';
      }
    }
  }

  clearSearch() {
    const searchInput = document.getElementById('semantic-search-input');
    const resultsContainer = document.getElementById('search-results');
    
    if (searchInput) {
      searchInput.value = '';
    }
    
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }

  performSearch() {
    const searchInput = document.getElementById('semantic-search-input');
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (!query) {
      this.showError('Please enter a search query');
      return;
    }

    this.showLoading();
    
    // Simulate search API call
    setTimeout(() => {
      this.displayResults(this.mockSearchResults(query));
    }, 500);
  }

  showLoading() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.style.display = 'block';
      resultsContainer.innerHTML = `
        <div class="results-header">
          <h3>Searching...</h3>
          <p>Please wait while we search the database</p>
        </div>
        <div style="text-align: center; padding: 2rem;">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
        </div>
      `;
    }
  }

  displayResults(results) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    resultsContainer.style.display = 'block';

    if (results.length === 0) {
      this.showNoResults();
      return;
    }

    let html = `
      <div class="results-header">
        <h3>Search Results</h3>
        <p id="results-summary">Found <span id="results-count">${results.length}</span> results</p>
      </div>
      <div class="results-list" id="results-list">
    `;

    results.forEach(result => {
      html += this.renderResultItem(result);
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
  }

  renderResultItem(result) {
    return `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="card-body">
          <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 0.5rem;">
            <h5 style="margin: 0; color: var(--primary-color);">
              <i class="${result.icon}"></i> ${result.title}
            </h5>
            <span class="badge badge-${result.priority}" style="margin-left: auto;">
              ${result.category}
            </span>
          </div>
          <p style="margin: 0.5rem 0; color: var(--text-secondary);">
            ${result.description}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
            <small style="color: var(--text-muted);">
              <i class="fas fa-calendar"></i> ${result.date}
              ${result.amount ? `<span style="margin-left: 1rem;"><i class="fas fa-money-bill"></i> E ${result.amount}</span>` : ''}
            </small>
            <button class="btn btn-sm btn-primary" onclick="window.viewDetails('${result.id}')">
              <i class="fas fa-eye"></i> View Details
            </button>
          </div>
        </div>
      </div>
    `;
  }

  showNoResults() {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="results-header">
          <h3>Search Results</h3>
          <p>No results found</p>
        </div>
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h4>No results found</h4>
          <p>Try adjusting your search terms or filters</p>
        </div>
      `;
    }
  }

  showError(message) {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
      resultsContainer.style.display = 'block';
      resultsContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i> ${message}
        </div>
      `;
    }
  }

  mockSearchResults(query) {
    // Mock search results for demonstration
    const allResults = [
      {
        id: 'maloma-overdue',
        title: 'Maloma Colliery - Outstanding Payment',
        description: 'Coal royalty payment overdue by 15 days. Outstanding amount: E 145,750.00',
        category: 'Critical',
        priority: 'danger',
        icon: 'fas fa-exclamation-triangle',
        date: 'Feb 15, 2024',
        amount: '145,750.00'
      },
      {
        id: 'ngwenya-permit',
        title: 'Environmental Permit Renewal Required',
        description: 'Ngwenya Mine environmental permit expires in 30 days. Renewal process should begin immediately.',
        category: 'Compliance',
        priority: 'warning',
        icon: 'fas fa-leaf',
        date: 'Mar 15, 2024',
        amount: null
      },
      {
        id: 'kwalini-production',
        title: 'Q1 2024 Production Summary',
        description: 'Kwalini Quarry leads production with 52,000 m³ of quarried stone, showing +15% growth from last quarter.',
        category: 'Analytics',
        priority: 'success',
        icon: 'fas fa-chart-line',
        date: 'Q1 2024',
        amount: null
      }
    ];

    // Simple keyword matching
    const keywords = query.toLowerCase().split(' ');
    return allResults.filter(result => {
      const text = (result.title + ' ' + result.description).toLowerCase();
      return keywords.some(keyword => text.includes(keyword));
    });
  }

  exportResults() {
    // Placeholder for export functionality
    alert('Export functionality would be implemented here based on your requirements.');
  }
}

// Global function for viewing details (placeholder)
window.viewDetails = function(id) {
  alert(`View details for item: ${id}\n\nThis would navigate to the detailed view of the selected item.`);
};

// Initialize semantic search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SemanticSearch();
});
