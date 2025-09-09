/**
 * Enhanced Search Manager
 * Advanced search functionality with AI-powered semantic search, filters, and analytics
 */

export class EnhancedSearchManager {
  constructor() {
    this.searchIndex = new Map();
    this.searchHistory = [];
    this.searchFilters = {};
    this.searchResults = [];
    this.recentSearches = [];
    this.popularSearches = [];
    this.initialized = false;
  }

  /**
   * Initialize enhanced search system
   */
  async init() {
    if (this.initialized) return;

    await this.buildSearchIndex();
    this.loadSearchHistory();
    this.setupEventListeners();
    this.initialized = true;

    console.log('Enhanced Search Manager initialized');
  }

  /**
   * Build comprehensive search index
   */
  async buildSearchIndex() {
    // Index different data types
    const indexables = [
      { type: 'users', data: await this.getUsersData() },
      { type: 'royalty_records', data: await this.getRoyaltyRecords() },
      { type: 'contracts', data: await this.getContractsData() },
      { type: 'documents', data: await this.getDocumentsData() },
      { type: 'entities', data: await this.getEntitiesData() },
      { type: 'communications', data: await this.getCommunicationsData() },
      { type: 'compliance', data: await this.getComplianceData() }
    ];

    for (const { type, data } of indexables) {
      await this.indexDataType(type, data);
    }

    console.log(`Search index built with ${this.searchIndex.size} entries`);
  }

  /**
   * Index specific data type
   */
  async indexDataType(type, data) {
    if (!Array.isArray(data)) return;

    data.forEach(item => {
      const searchEntry = {
        type,
        id: item.id,
        title: this.getItemTitle(type, item),
        description: this.getItemDescription(type, item),
        content: this.getItemContent(type, item),
        metadata: this.getItemMetadata(type, item),
        keywords: this.generateKeywords(type, item),
        lastModified: item.updatedAt || item.createdAt || new Date().toISOString()
      };

      this.searchIndex.set(`${type}_${item.id}`, searchEntry);
    });
  }

  /**
   * Perform comprehensive search
   */
  async search(query, options = {}) {
    try {
      const startTime = performance.now();
      
      // Record search in history
      this.recordSearch(query, options);

      // Parse query and extract components
      const searchComponents = this.parseSearchQuery(query);

      // Perform different search methods
      const results = {
        exact: await this.exactSearch(searchComponents, options),
        semantic: await this.semanticSearch(searchComponents, options),
        fuzzy: await this.fuzzySearch(searchComponents, options),
        contextual: await this.contextualSearch(searchComponents, options)
      };

      // Combine and rank results
      const combinedResults = this.combineAndRankResults(results, searchComponents);

      // Apply filters
      const filteredResults = this.applySearchFilters(combinedResults, options.filters || {});

      // Apply pagination
      const paginatedResults = this.paginateResults(filteredResults, options.page || 1, options.limit || 10);

      const endTime = performance.now();
      const searchTime = Math.round(endTime - startTime);

      return {
        query,
        results: paginatedResults,
        totalResults: filteredResults.length,
        searchTime,
        suggestions: this.generateSuggestions(query, filteredResults),
        filters: this.generateAvailableFilters(filteredResults),
        relatedSearches: this.getRelatedSearches(query)
      };

    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Parse search query into components
   */
  parseSearchQuery(query) {
    const trimmedQuery = query.trim().toLowerCase();
    
    // Extract quoted phrases
    const quotedPhrases = [...trimmedQuery.matchAll(/"([^"]+)"/g)].map(match => match[1]);
    
    // Extract operators
    const operators = {
      must: [...trimmedQuery.matchAll(/\+(\w+)/g)].map(match => match[1]),
      mustNot: [...trimmedQuery.matchAll(/-(\w+)/g)].map(match => match[1]),
      wildcard: [...trimmedQuery.matchAll(/(\w+)\*/g)].map(match => match[1])
    };

    // Extract field-specific searches
    const fieldSearches = [...trimmedQuery.matchAll(/(\w+):([^\s]+)/g)].reduce((acc, match) => {
      acc[match[1]] = match[2];
      return acc;
    }, {});

    // Clean query (remove operators and special syntax)
    const cleanQuery = trimmedQuery
      .replace(/"[^"]+"/g, '')
      .replace(/[+\-]\w+/g, '')
      .replace(/\w+:[^\s]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Generate terms
    const terms = cleanQuery.split(' ').filter(term => term.length > 0);

    return {
      original: query,
      clean: cleanQuery,
      terms,
      quotedPhrases,
      operators,
      fieldSearches,
      hasAdvancedSyntax: quotedPhrases.length > 0 || Object.values(operators).some(arr => arr.length > 0)
    };
  }

  /**
   * Exact match search
   */
  async exactSearch(searchComponents, options) {
    const results = [];
    
    for (const [key, entry] of this.searchIndex) {
      let score = 0;

      // Exact phrase matches
      for (const phrase of searchComponents.quotedPhrases) {
        if (entry.content.toLowerCase().includes(phrase)) {
          score += 100;
        }
        if (entry.title.toLowerCase().includes(phrase)) {
          score += 150;
        }
      }

      // Exact term matches
      for (const term of searchComponents.terms) {
        if (entry.title.toLowerCase().includes(term)) {
          score += 50;
        }
        if (entry.content.toLowerCase().includes(term)) {
          score += 25;
        }
        if (entry.keywords.includes(term)) {
          score += 75;
        }
      }

      // Field-specific searches
      for (const [field, value] of Object.entries(searchComponents.fieldSearches)) {
        if (entry.metadata[field] && entry.metadata[field].toString().toLowerCase().includes(value)) {
          score += 200;
        }
      }

      if (score > 0) {
        results.push({
          ...entry,
          score,
          searchType: 'exact',
          matchedTerms: this.getMatchedTerms(entry, searchComponents)
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Semantic search using vector similarity
   */
  async semanticSearch(searchComponents, options) {
    // Simulate semantic search with keyword expansion
    const expandedTerms = this.expandSemanticTerms(searchComponents.terms);
    const results = [];

    for (const [key, entry] of this.searchIndex) {
      let score = 0;

      // Check semantic similarity
      for (const term of expandedTerms) {
        if (entry.content.toLowerCase().includes(term.toLowerCase())) {
          score += term.weight || 10;
        }
        if (entry.title.toLowerCase().includes(term.toLowerCase())) {
          score += (term.weight || 10) * 1.5;
        }
      }

      // Context similarity
      const contextScore = this.calculateContextSimilarity(entry, searchComponents);
      score += contextScore;

      if (score > 0) {
        results.push({
          ...entry,
          score,
          searchType: 'semantic',
          semanticTerms: expandedTerms
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Fuzzy search for typos and variations
   */
  async fuzzySearch(searchComponents, options) {
    const results = [];

    for (const [key, entry] of this.searchIndex) {
      let score = 0;

      for (const term of searchComponents.terms) {
        // Check fuzzy matches in title and content
        const titleSimilarity = this.calculateLevenshteinSimilarity(term, entry.title.toLowerCase());
        const contentWords = entry.content.toLowerCase().split(' ');
        
        let bestContentSimilarity = 0;
        for (const word of contentWords) {
          const similarity = this.calculateLevenshteinSimilarity(term, word);
          bestContentSimilarity = Math.max(bestContentSimilarity, similarity);
        }

        if (titleSimilarity > 0.7) {
          score += titleSimilarity * 30;
        }
        if (bestContentSimilarity > 0.7) {
          score += bestContentSimilarity * 15;
        }
      }

      if (score > 5) {
        results.push({
          ...entry,
          score,
          searchType: 'fuzzy'
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Contextual search based on user behavior and preferences
   */
  async contextualSearch(searchComponents, options) {
    const results = [];
    const userContext = this.getUserContext();

    for (const [key, entry] of this.searchIndex) {
      let score = 0;

      // Boost results based on user's recent activity
      if (userContext.recentTypes.includes(entry.type)) {
        score += 20;
      }

      // Boost results related to user's role
      if (this.isRelevantToUserRole(entry, userContext.role)) {
        score += 15;
      }

      // Boost recently modified content
      const daysSinceModified = this.getDaysSince(entry.lastModified);
      if (daysSinceModified < 7) {
        score += Math.max(0, 10 - daysSinceModified);
      }

      // Boost popular content
      if (this.isPopularContent(entry)) {
        score += 10;
      }

      // Only include if there's some contextual relevance
      if (score > 0) {
        // Still need some text match
        let hasTextMatch = false;
        for (const term of searchComponents.terms) {
          if (entry.content.toLowerCase().includes(term) || 
              entry.title.toLowerCase().includes(term)) {
            hasTextMatch = true;
            score += 5;
            break;
          }
        }

        if (hasTextMatch) {
          results.push({
            ...entry,
            score,
            searchType: 'contextual'
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Combine and rank search results
   */
  combineAndRankResults(results, searchComponents) {
    const combinedMap = new Map();

    // Combine results from different search methods
    Object.entries(results).forEach(([method, methodResults]) => {
      methodResults.forEach(result => {
        const key = `${result.type}_${result.id}`;
        
        if (combinedMap.has(key)) {
          const existing = combinedMap.get(key);
          existing.score += result.score * this.getMethodWeight(method);
          existing.searchMethods.push(method);
        } else {
          combinedMap.set(key, {
            ...result,
            searchMethods: [method],
            finalScore: result.score * this.getMethodWeight(method)
          });
        }
      });
    });

    // Convert to array and apply final ranking
    return Array.from(combinedMap.values())
      .map(result => ({
        ...result,
        finalScore: this.calculateFinalScore(result, searchComponents)
      }))
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  /**
   * Apply search filters
   */
  applySearchFilters(results, filters) {
    let filteredResults = [...results];

    if (filters.type) {
      filteredResults = filteredResults.filter(r => r.type === filters.type);
    }

    if (filters.dateFrom) {
      filteredResults = filteredResults.filter(r => 
        new Date(r.lastModified) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filteredResults = filteredResults.filter(r => 
        new Date(r.lastModified) <= new Date(filters.dateTo)
      );
    }

    if (filters.metadata) {
      Object.entries(filters.metadata).forEach(([key, value]) => {
        filteredResults = filteredResults.filter(r => 
          r.metadata[key] === value
        );
      });
    }

    return filteredResults;
  }

  /**
   * Generate search suggestions
   */
  generateSuggestions(query, results) {
    const suggestions = [];

    // Spelling corrections
    const corrections = this.generateSpellingCorrections(query);
    suggestions.push(...corrections);

    // Query completions
    const completions = this.generateQueryCompletions(query, results);
    suggestions.push(...completions);

    // Related terms
    const relatedTerms = this.generateRelatedTerms(query, results);
    suggestions.push(...relatedTerms);

    return suggestions.slice(0, 5);
  }

  /**
   * Generate advanced search filters based on results
   */
  generateAdvancedSearchFilters() {
    return {
      contentTypes: [
        { id: 'users', name: 'Users', icon: 'fas fa-users' },
        { id: 'royalty_records', name: 'Royalty Records', icon: 'fas fa-file-invoice' },
        { id: 'contracts', name: 'Contracts', icon: 'fas fa-file-contract' },
        { id: 'documents', name: 'Documents', icon: 'fas fa-file-alt' },
        { id: 'entities', name: 'Mining Entities', icon: 'fas fa-industry' },
        { id: 'communications', name: 'Communications', icon: 'fas fa-envelope' },
        { id: 'compliance', name: 'Compliance', icon: 'fas fa-check-circle' }
      ],
      dateRanges: [
        { id: 'today', name: 'Today' },
        { id: 'week', name: 'Past Week' },
        { id: 'month', name: 'Past Month' },
        { id: 'quarter', name: 'Past Quarter' },
        { id: 'year', name: 'Past Year' }
      ],
      statusFilters: [
        { id: 'active', name: 'Active' },
        { id: 'pending', name: 'Pending' },
        { id: 'completed', name: 'Completed' },
        { id: 'expired', name: 'Expired' }
      ]
    };
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics() {
    const analytics = {
      totalSearches: this.searchHistory.length,
      uniqueQueries: new Set(this.searchHistory.map(s => s.query)).size,
      averageResultsPerSearch: this.searchHistory.reduce((sum, s) => sum + s.resultCount, 0) / this.searchHistory.length || 0,
      mostSearchedTerms: this.getMostSearchedTerms(),
      searchTrends: this.getSearchTrends(),
      zeroResultQueries: this.searchHistory.filter(s => s.resultCount === 0),
      popularFilters: this.getPopularFilters()
    };

    return analytics;
  }

  /**
   * Export search results
   */
  exportSearchResults(results, format = 'csv') {
    const exportData = results.map(result => ({
      title: result.title,
      type: result.type,
      description: result.description,
      score: result.finalScore?.toFixed(2) || result.score?.toFixed(2),
      lastModified: result.lastModified,
      searchMethods: result.searchMethods?.join(', ') || 'N/A'
    }));

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    } else if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }

    return exportData;
  }

  // Helper methods
  expandSemanticTerms(terms) {
    const semanticMap = {
      'payment': [{ term: 'royalty', weight: 15 }, { term: 'fee', weight: 10 }, { term: 'revenue', weight: 12 }],
      'mine': [{ term: 'colliery', weight: 15 }, { term: 'quarry', weight: 15 }, { term: 'pit', weight: 10 }],
      'contract': [{ term: 'agreement', weight: 12 }, { term: 'lease', weight: 15 }, { term: 'license', weight: 10 }],
      'report': [{ term: 'document', weight: 10 }, { term: 'statement', weight: 8 }, { term: 'summary', weight: 8 }]
    };

    const expanded = [...terms];
    terms.forEach(term => {
      if (semanticMap[term]) {
        expanded.push(...semanticMap[term]);
      }
    });

    return expanded;
  }

  calculateLevenshteinSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  getMethodWeight(method) {
    const weights = { exact: 1.0, semantic: 0.8, fuzzy: 0.6, contextual: 0.7 };
    return weights[method] || 0.5;
  }

  calculateFinalScore(result, searchComponents) {
    let score = result.score;
    
    // Boost if multiple search methods found this result
    if (result.searchMethods.length > 1) {
      score *= 1.2;
    }
    
    // Boost if advanced syntax was used and matched
    if (searchComponents.hasAdvancedSyntax && result.searchType === 'exact') {
      score *= 1.3;
    }
    
    return score;
  }

  // Data retrieval methods (would integrate with actual data sources)
  async getUsersData() { return []; }
  async getRoyaltyRecords() { return []; }
  async getContractsData() { return []; }
  async getDocumentsData() { return []; }
  async getEntitiesData() { return []; }
  async getCommunicationsData() { return []; }
  async getComplianceData() { return []; }

  getItemTitle(type, item) {
    const titleMaps = {
      users: item.name || item.username,
      royalty_records: `Royalty Record - ${item.entity}`,
      contracts: `Contract - ${item.entity}`,
      documents: item.name || item.fileName,
      entities: item.name,
      communications: item.subject,
      compliance: `Compliance - ${item.entity}`
    };
    return titleMaps[type] || item.name || item.title || 'Untitled';
  }

  getItemDescription(type, item) {
    // Generate appropriate descriptions based on type
    return item.description || item.summary || '';
  }

  getItemContent(type, item) {
    // Combine searchable content
    return Object.values(item).filter(v => typeof v === 'string').join(' ').toLowerCase();
  }

  getItemMetadata(type, item) {
    return { type, ...item };
  }

  generateKeywords(type, item) {
    // Generate searchable keywords
    const content = this.getItemContent(type, item);
    return content.split(' ')
      .filter(word => word.length > 2)
      .filter((word, index, array) => array.indexOf(word) === index)
      .slice(0, 20); // Limit keywords
  }

  recordSearch(query, options) {
    this.searchHistory.unshift({
      query,
      options,
      timestamp: new Date().toISOString(),
      resultCount: 0 // Will be updated after search
    });

    // Keep only recent 1000 searches
    this.searchHistory = this.searchHistory.slice(0, 1000);
  }

  paginateResults(results, page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return results.slice(startIndex, endIndex);
  }

  // More helper methods would be implemented here...
  
  loadSearchHistory() {
    // Load from localStorage or database
  }

  setupEventListeners() {
    // Setup search-related event listeners
  }

  getUserContext() {
    return { recentTypes: [], role: 'user' };
  }

  getMostSearchedTerms() {
    return [];
  }

  getSearchTrends() {
    return [];
  }

  getPopularFilters() {
    return [];
  }

  convertToCSV(data) {
    // Convert data to CSV format
    return '';
  }
}
