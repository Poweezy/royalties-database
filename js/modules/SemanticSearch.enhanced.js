/**
 * Enhanced AI-Powered Semantic Search
 * Advanced search with NLP, entity recognition, and intelligent suggestions
 */

export class EnhancedSemanticSearch {
  constructor() {
    this.initialized = false;
    this.searchIndex = new Map();
    this.documents = [];
    this.searchHistory = [];
    this.synonyms = new Map();
    this.entityIndex = new Map();
    this.contextualSuggestions = [];
    this.searchAnalytics = {
      totalSearches: 0,
      popularQueries: new Map(),
      failedSearches: [],
      averageResultsPerQuery: 0
    };
    this.nlpProcessor = new NLPProcessor();

    this.boundDocumentUploaded = this.addToSearchIndex.bind(this);
    this.boundRoyaltyCalculated = this.updateEntityIndex.bind(this);
  }

  /**
   * Initialize enhanced search system
   */
  async init() {
    if (this.initialized) return;

    await this.loadSynonyms();
    await this.indexDocuments();
    await this.loadSearchHistory();
    this.setupNLPProcessor();
    this.setupEventListeners();
    this.initialized = true;

    console.log('Enhanced Semantic Search initialized');
  }

  /**
   * Load domain-specific synonyms and terminology
   */
  async loadSynonyms() {
    const miningTerms = {
      // Mining operations
      'mining': ['extraction', 'excavation', 'digging', 'quarrying'],
      'production': ['output', 'yield', 'extraction rate', 'harvest'],
      'reserves': ['deposits', 'resources', 'ore body', 'mineral wealth'],
      
      // Minerals
      'coal': ['anthracite', 'bituminous', 'lignite', 'carbon'],
      'iron ore': ['hematite', 'magnetite', 'iron', 'ferrous ore'],
      'stone': ['aggregate', 'crushed stone', 'rock', 'gravel'],
      'quarry': ['stone pit', 'rock quarry', 'aggregate pit'],
      
      // Financial terms
      'royalty': ['payment', 'fee', 'levy', 'tribute', 'revenue share'],
      'revenue': ['income', 'earnings', 'proceeds', 'returns'],
      'profit': ['earnings', 'net income', 'surplus', 'gain'],
      'expense': ['cost', 'expenditure', 'outlay', 'spending'],
      
      // Compliance
      'compliance': ['conformity', 'adherence', 'observance', 'following rules'],
      'violation': ['breach', 'infringement', 'non-compliance', 'offense'],
      'regulation': ['rule', 'law', 'statute', 'ordinance', 'requirement'],
      'audit': ['inspection', 'review', 'examination', 'assessment'],
      
      // Environmental
      'environmental': ['ecological', 'green', 'sustainability', 'eco-friendly'],
      'pollution': ['contamination', 'emission', 'discharge', 'waste'],
      'restoration': ['rehabilitation', 'reclamation', 'recovery', 'renewal'],
      
      // Legal
      'contract': ['agreement', 'deal', 'arrangement', 'pact'],
      'license': ['permit', 'authorization', 'approval', 'certificate'],
      'legal': ['lawful', 'legitimate', 'statutory', 'juridical']
    };

    // Build synonym mapping
    Object.entries(miningTerms).forEach(([key, synonyms]) => {
      const allTerms = [key, ...synonyms];
      allTerms.forEach(term => {
        if (!this.synonyms.has(term.toLowerCase())) {
          this.synonyms.set(term.toLowerCase(), new Set());
        }
        allTerms.forEach(synonym => {
          this.synonyms.get(term.toLowerCase()).add(synonym.toLowerCase());
        });
      });
    });
  }

  /**
   * Index all searchable documents and data
   */
  async indexDocuments() {
    // Index different types of content
    await this.indexRoyaltyRecords();
    await this.indexContracts();
    await this.indexComplianceData();
    await this.indexDocumentFiles();
    await this.indexUsers();
    await this.indexReports();
  }

  /**
   * Index royalty records
   */
  async indexRoyaltyRecords() {
    const sampleRecords = [
      {
        id: 'ROY001',
        type: 'royalty_record',
        entity: 'Maloma Colliery',
        mineral: 'Coal',
        period: '2024-01',
        amount: 850000,
        quantity: 45000,
        status: 'paid',
        content: 'Maloma Colliery coal mining royalty payment for January 2024 - 45,000 tons produced, royalty amount E850,000'
      },
      {
        id: 'ROY002',
        type: 'royalty_record',
        entity: 'Kwalini Quarry',
        mineral: 'Stone',
        period: '2024-01',
        amount: 420000,
        quantity: 28000,
        status: 'overdue',
        content: 'Kwalini Quarry stone extraction royalty for January 2024 - 28,000 cubic meters, overdue payment of E420,000'
      },
      {
        id: 'ROY003',
        type: 'royalty_record',
        entity: 'Mbabane Quarry',
        mineral: 'Gravel',
        period: '2024-01',
        amount: 320000,
        quantity: 35000,
        status: 'paid',
        content: 'Mbabane Quarry gravel production royalty January 2024 - 35,000 tons extracted, payment E320,000 received'
      }
    ];

    sampleRecords.forEach(record => {
      this.addToSearchIndex(record);
      this.addEntityToIndex(record.entity, record);
    });
  }

  /**
   * Index contracts
   */
  async indexContracts() {
    const sampleContracts = [
      {
        id: 'CONT001',
        type: 'contract',
        entity: 'Maloma Colliery',
        mineral: 'Coal',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        value: 5000000,
        royaltyRate: 15,
        content: 'Mining contract for Maloma Colliery coal extraction operations from 2024-2026, total value E5,000,000, royalty rate 15%'
      },
      {
        id: 'CONT002',
        type: 'contract',
        entity: 'Ngwenya Mine',
        mineral: 'Iron Ore',
        startDate: '2023-06-01',
        endDate: '2025-05-31',
        value: 8000000,
        royaltyRate: 18,
        content: 'Iron ore mining agreement Ngwenya Mine 2023-2025, contract value E8,000,000, royalty rate 18% on production'
      }
    ];

    sampleContracts.forEach(contract => {
      this.addToSearchIndex(contract);
      this.addEntityToIndex(contract.entity, contract);
    });
  }

  /**
   * Index compliance data
   */
  async indexComplianceData() {
    const complianceRecords = [
      {
        id: 'COMP001',
        type: 'compliance_record',
        entity: 'Maloma Colliery',
        category: 'environmental',
        status: 'compliant',
        lastAudit: '2024-01-15',
        score: 92,
        content: 'Maloma Colliery environmental compliance audit January 2024 - score 92%, fully compliant with environmental regulations'
      },
      {
        id: 'COMP002',
        type: 'compliance_record',
        entity: 'Kwalini Quarry',
        category: 'safety',
        status: 'non_compliant',
        lastAudit: '2024-01-10',
        score: 65,
        issues: ['Safety training documentation incomplete', 'Emergency procedures not updated'],
        content: 'Kwalini Quarry safety compliance review January 2024 - score 65%, non-compliant due to training documentation and emergency procedures'
      }
    ];

    complianceRecords.forEach(record => {
      this.addToSearchIndex(record);
      this.addEntityToIndex(record.entity, record);
    });
  }

  /**
   * Index document files
   */
  async indexDocumentFiles() {
    const sampleDocuments = [
      {
        id: 'DOC001',
        type: 'document_file',
        title: 'Environmental Impact Assessment',
        content: 'Environmental impact assessment for mining operations',
        entity: 'Maloma Colliery'
      }
    ];

    sampleDocuments.forEach(doc => {
      this.addToSearchIndex(doc);
      this.addEntityToIndex(doc.entity, doc);
    });
  }

  /**
   * Index user data
   */
  async indexUsers() {
    const sampleUsers = [
      {
        id: 'USER001',
        type: 'user',
        username: 'admin',
        content: 'System administrator',
        entity: 'System Admin'
      }
    ];

    sampleUsers.forEach(user => {
      this.addToSearchIndex(user);
      this.addEntityToIndex(user.entity, user);
    });
  }

  /**
   * Index reports
   */
  async indexReports() {
    const sampleReports = [
      {
        id: 'RPT001',
        type: 'report',
        title: 'Monthly Production Report',
        content: 'Monthly production report',
        entity: 'Maloma Colliery'
      }
    ];

    sampleReports.forEach(report => {
      this.addToSearchIndex(report);
      this.addEntityToIndex(report.entity, report);
    });
  }

  /**
   * Add document to search index
   */
  addToSearchIndex(document) {
    const words = this.extractSearchableWords(document.content || '');
    
    words.forEach(word => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, []);
      }
      
      this.searchIndex.get(word).push({
        documentId: document.id,
        type: document.type,
        relevanceScore: this.calculateRelevanceScore(word, document),
        document: document
      });
    });

    this.documents.push(document);
  }

  /**
   * Add entity to entity index
   */
  addEntityToIndex(entityName, document) {
    const normalizedName = entityName.toLowerCase();
    
    if (!this.entityIndex.has(normalizedName)) {
      this.entityIndex.set(normalizedName, {
        name: entityName,
        documents: [],
        metadata: {
          type: 'mining_entity',
          totalRecords: 0,
          categories: new Set()
        }
      });
    }

    const entity = this.entityIndex.get(normalizedName);
    entity.documents.push(document);
    entity.metadata.totalRecords++;
    
    if (document.type) {
      entity.metadata.categories.add(document.type);
    }
  }

  /**
   * Extract searchable words from text
   */
  extractSearchableWords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
  }

  /**
   * Check if word is a stop word
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);
    return stopWords.has(word.toLowerCase());
  }

  /**
   * Calculate relevance score for word-document pair
   */
  calculateRelevanceScore(word, document) {
    let score = 1;

    // Higher score for title/name matches
    if (document.entity && document.entity.toLowerCase().includes(word)) {
      score += 3;
    }

    // Higher score for type matches
    if (document.type && document.type.toLowerCase().includes(word)) {
      score += 2;
    }

    // Higher score for status/category matches
    if (document.status && document.status.toLowerCase().includes(word)) {
      score += 1.5;
    }

    // Frequency in content
    const content = (document.content || '').toLowerCase();
    const wordCount = (content.match(new RegExp(word, 'g')) || []).length;
    score += Math.min(wordCount * 0.5, 3);

    return score;
  }

  /**
   * Perform enhanced semantic search
   */
  async performSemanticSearch(query, options = {}) {
    const startTime = Date.now();
    
    try {
      // Update analytics
      this.searchAnalytics.totalSearches++;
      this.updatePopularQueries(query);

      // Preprocess query
      const processedQuery = await this.preprocessQuery(query);
      
      // Perform different search strategies
      const results = await this.multiStrategySearch(processedQuery, options);
      
      // Post-process and rank results
      const rankedResults = this.rankResults(results, processedQuery);
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(query, rankedResults);
      
      // Record search
      const searchRecord = {
        id: this.generateSearchId(),
        query: query,
        processedQuery: processedQuery,
        timestamp: new Date().toISOString(),
        resultsCount: rankedResults.length,
        executionTime: Date.now() - startTime,
        filters: options.filters || {},
        results: rankedResults.slice(0, 10) // Store top 10
      };

      this.searchHistory.unshift(searchRecord);
      this.searchHistory = this.searchHistory.slice(0, 100); // Keep recent 100

      // Update analytics
      this.searchAnalytics.averageResultsPerQuery = 
        ((this.searchAnalytics.averageResultsPerQuery * (this.searchAnalytics.totalSearches - 1)) + 
         rankedResults.length) / this.searchAnalytics.totalSearches;

      if (rankedResults.length === 0) {
        this.searchAnalytics.failedSearches.push({
          query,
          timestamp: new Date().toISOString()
        });
      }

      // Dispatch search event
      window.dispatchEvent(new CustomEvent('semanticSearchCompleted', {
        detail: { searchRecord, suggestions }
      }));

      return {
        results: rankedResults,
        suggestions: suggestions,
        searchRecord: searchRecord,
        analytics: {
          executionTime: searchRecord.executionTime,
          totalResults: rankedResults.length,
          searchId: searchRecord.id
        }
      };

    } catch (error) {
      console.error('Semantic search error:', error);
      
      this.searchAnalytics.failedSearches.push({
        query,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Preprocess search query
   */
  async preprocessQuery(query) {
    const processed = {
      original: query,
      normalized: query.toLowerCase().trim(),
      tokens: [],
      entities: [],
      intent: null,
      expandedTerms: new Set()
    };

    // Tokenize
    processed.tokens = this.extractSearchableWords(query);

    // Expand with synonyms
    processed.tokens.forEach(token => {
      processed.expandedTerms.add(token);
      
      if (this.synonyms.has(token)) {
        this.synonyms.get(token).forEach(synonym => {
          processed.expandedTerms.add(synonym);
        });
      }
    });

    // Detect entities
    processed.entities = this.detectEntities(query);

    // Detect search intent
    processed.intent = this.detectSearchIntent(query);

    return processed;
  }

  /**
   * Detect entities in query
   */
  detectEntities(query) {
    const entities = [];
    const queryLower = query.toLowerCase();

    // Check for known mining entities
    this.entityIndex.forEach((entityData, entityName) => {
      if (queryLower.includes(entityName) || 
          queryLower.includes(entityData.name.toLowerCase())) {
        entities.push({
          name: entityData.name,
          type: 'mining_entity',
          confidence: 0.9
        });
      }
    });

    // Check for mineral types
    const minerals = ['coal', 'iron ore', 'stone', 'gravel', 'aggregate'];
    minerals.forEach(mineral => {
      if (queryLower.includes(mineral)) {
        entities.push({
          name: mineral,
          type: 'mineral',
          confidence: 0.8
        });
      }
    });

    // Check for document types
    const docTypes = ['contract', 'report', 'compliance', 'royalty', 'payment'];
    docTypes.forEach(type => {
      if (queryLower.includes(type)) {
        entities.push({
          name: type,
          type: 'document_type',
          confidence: 0.7
        });
      }
    });

    return entities;
  }

  /**
   * Detect search intent
   */
  detectSearchIntent(query) {
    const queryLower = query.toLowerCase();

    // Payment-related intent
    if (queryLower.includes('pay') || queryLower.includes('due') || 
        queryLower.includes('overdue') || queryLower.includes('owing')) {
      return 'payment_inquiry';
    }

    // Compliance intent
    if (queryLower.includes('compliance') || queryLower.includes('violation') || 
        queryLower.includes('audit') || queryLower.includes('regulation')) {
      return 'compliance_inquiry';
    }

    // Production intent
    if (queryLower.includes('production') || queryLower.includes('output') || 
        queryLower.includes('extract') || queryLower.includes('tons')) {
      return 'production_inquiry';
    }

    // Contract intent
    if (queryLower.includes('contract') || queryLower.includes('agreement') || 
        queryLower.includes('license') || queryLower.includes('permit')) {
      return 'contract_inquiry';
    }

    // Financial intent
    if (queryLower.includes('revenue') || queryLower.includes('profit') || 
        queryLower.includes('cost') || queryLower.includes('financial')) {
      return 'financial_inquiry';
    }

    return 'general_search';
  }

  /**
   * Multi-strategy search
   */
  async multiStrategySearch(processedQuery, options) {
    const strategies = [
      this.exactMatchSearch(processedQuery),
      this.fuzzySearch(processedQuery),
      this.entitySearch(processedQuery),
      this.semanticSearch(processedQuery),
      this.contextualSearch(processedQuery)
    ];

    const allResults = await Promise.all(strategies);
    
    // Combine and deduplicate results
    const combined = new Map();
    
    allResults.forEach((strategyResults, strategyIndex) => {
      strategyResults.forEach(result => {
        const key = result.document.id;
        
        if (!combined.has(key)) {
          combined.set(key, {
            ...result,
            matchStrategies: []
          });
        }
        
        combined.get(key).matchStrategies.push({
          strategy: this.getStrategyName(strategyIndex),
          score: result.score
        });
        
        // Update combined score
        combined.get(key).score = Math.max(combined.get(key).score, result.score);
      });
    });

    // Apply filters
    let results = Array.from(combined.values());
    
    if (options.filters) {
      results = this.applyFilters(results, options.filters);
    }

    return results;
  }

  /**
   * Exact match search
   */
  exactMatchSearch(processedQuery) {
    const results = [];
    
    processedQuery.tokens.forEach(token => {
      if (this.searchIndex.has(token)) {
        this.searchIndex.get(token).forEach(indexEntry => {
          results.push({
            ...indexEntry,
            score: indexEntry.relevanceScore * 2, // Boost exact matches
            matchType: 'exact'
          });
        });
      }
    });

    return results;
  }

  /**
   * Fuzzy search for typos and variations
   */
  fuzzySearch(processedQuery) {
    const results = [];
    const threshold = 0.7; // Minimum similarity

    processedQuery.tokens.forEach(token => {
      this.searchIndex.forEach((indexEntries, indexedWord) => {
        const similarity = this.calculateStringSimilarity(token, indexedWord);
        
        if (similarity >= threshold) {
          indexEntries.forEach(indexEntry => {
            results.push({
              ...indexEntry,
              score: indexEntry.relevanceScore * similarity,
              matchType: 'fuzzy',
              similarity
            });
          });
        }
      });
    });

    return results;
  }

  /**
   * Entity-based search
   */
  entitySearch(processedQuery) {
    const results = [];

    processedQuery.entities.forEach(entity => {
      const entityData = this.entityIndex.get(entity.name.toLowerCase());
      
      if (entityData) {
        entityData.documents.forEach(document => {
          results.push({
            document: document,
            documentId: document.id,
            type: document.type,
            score: entity.confidence * 3, // High score for entity matches
            matchType: 'entity',
            entityName: entity.name
          });
        });
      }
    });

    return results;
  }

  /**
   * Semantic search using expanded terms
   */
  semanticSearch(processedQuery) {
    const results = [];

    processedQuery.expandedTerms.forEach(term => {
      if (this.searchIndex.has(term)) {
        this.searchIndex.get(term).forEach(indexEntry => {
          const isOriginalTerm = processedQuery.tokens.includes(term);
          const scoreMultiplier = isOriginalTerm ? 1.5 : 1;
          
          results.push({
            ...indexEntry,
            score: indexEntry.relevanceScore * scoreMultiplier,
            matchType: 'semantic',
            matchedTerm: term
          });
        });
      }
    });

    return results;
  }

  /**
   * Contextual search based on intent
   */
  contextualSearch(processedQuery) {
    const results = [];

    if (processedQuery.intent) {
      // Search documents that match the detected intent
      const intentRelevantTypes = this.getRelevantTypesForIntent(processedQuery.intent);
      
      this.documents.forEach(document => {
        if (intentRelevantTypes.includes(document.type)) {
          results.push({
            document: document,
            documentId: document.id,
            type: document.type,
            score: 1.2, // Moderate boost for contextual relevance
            matchType: 'contextual',
            intent: processedQuery.intent
          });
        }
      });
    }

    return results;
  }

  /**
   * Get relevant document types for intent
   */
  getRelevantTypesForIntent(intent) {
    const intentTypeMap = {
      'payment_inquiry': ['royalty_record', 'contract'],
      'compliance_inquiry': ['compliance_record', 'audit_record'],
      'production_inquiry': ['royalty_record', 'production_report'],
      'contract_inquiry': ['contract', 'license'],
      'financial_inquiry': ['royalty_record', 'financial_statement'],
      'general_search': [] // All types
    };

    return intentTypeMap[intent] || [];
  }

  /**
   * Rank and sort search results
   */
  rankResults(results, processedQuery) {
    return results
      .sort((a, b) => {
        // Primary sort by score
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        
        // Secondary sort by match type priority
        const matchTypePriority = {
          'exact': 4,
          'entity': 3,
          'semantic': 2,
          'fuzzy': 1,
          'contextual': 1
        };
        
        const aPriority = matchTypePriority[a.matchType] || 0;
        const bPriority = matchTypePriority[b.matchType] || 0;
        
        return bPriority - aPriority;
      })
      .map((result, index) => ({
        ...result,
        rank: index + 1,
        relevancePercentage: Math.min(100, Math.round((result.score / 5) * 100))
      }));
  }

  /**
   * Generate search suggestions
   */
  generateSuggestions(query, results) {
    const suggestions = {
      didYouMean: [],
      relatedSearches: [],
      entitySuggestions: [],
      filters: []
    };

    // Did you mean suggestions for typos
    const queryWords = this.extractSearchableWords(query);
    queryWords.forEach(word => {
      this.searchIndex.forEach((entries, indexedWord) => {
        const similarity = this.calculateStringSimilarity(word, indexedWord);
        if (similarity > 0.6 && similarity < 0.95) {
          suggestions.didYouMean.push({
            original: word,
            suggestion: indexedWord,
            similarity: similarity
          });
        }
      });
    });

    // Related searches from history
    const relatedSearches = this.searchHistory
      .filter(search => search.query !== query)
      .filter(search => this.hasCommonWords(search.query, query))
      .slice(0, 5);
    
    suggestions.relatedSearches = relatedSearches.map(search => search.query);

    // Entity suggestions
    this.entityIndex.forEach((entityData, entityName) => {
      if (!query.toLowerCase().includes(entityName) && entityData.documents.length > 0) {
        suggestions.entitySuggestions.push({
          name: entityData.name,
          type: entityData.metadata.type,
          recordCount: entityData.metadata.totalRecords
        });
      }
    });

    // Filter suggestions based on results
    if (results.length > 0) {
      const resultTypes = [...new Set(results.map(r => r.type))];
      const resultEntities = [...new Set(results.map(r => r.document.entity).filter(Boolean))];
      
      if (resultTypes.length > 1) {
        suggestions.filters.push({
          type: 'document_type',
          options: resultTypes
        });
      }
      
      if (resultEntities.length > 1) {
        suggestions.filters.push({
          type: 'entity',
          options: resultEntities
        });
      }
    }

    return suggestions;
  }

  /**
   * Apply search filters
   */
  applyFilters(results, filters) {
    let filtered = results;

    if (filters.type) {
      filtered = filtered.filter(result => result.type === filters.type);
    }

    if (filters.entity) {
      filtered = filtered.filter(result => result.document.entity === filters.entity);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(result => {
        const docDate = result.document.period || result.document.createdAt;
        return docDate && new Date(docDate) >= new Date(filters.dateFrom);
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(result => {
        const docDate = result.document.period || result.document.createdAt;
        return docDate && new Date(docDate) <= new Date(filters.dateTo);
      });
    }

    if (filters.status) {
      filtered = filtered.filter(result => result.document.status === filters.status);
    }

    return filtered;
  }

  /**
   * Calculate string similarity (Jaccard similarity)
   */
  calculateStringSimilarity(str1, str2) {
    const set1 = new Set(str1.toLowerCase());
    const set2 = new Set(str2.toLowerCase());
    
    const intersection = new Set([...set1].filter(char => set2.has(char)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Check if two queries have common words
   */
  hasCommonWords(query1, query2) {
    const words1 = new Set(this.extractSearchableWords(query1));
    const words2 = new Set(this.extractSearchableWords(query2));
    
    return [...words1].some(word => words2.has(word));
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics() {
    return {
      ...this.searchAnalytics,
      popularQueries: Array.from(this.searchAnalytics.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      recentFailures: this.searchAnalytics.failedSearches.slice(0, 10),
      indexedDocuments: this.documents.length,
      indexedTerms: this.searchIndex.size,
      knownEntities: this.entityIndex.size
    };
  }

  /**
   * Update popular queries tracking
   */
  updatePopularQueries(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const count = this.searchAnalytics.popularQueries.get(normalizedQuery) || 0;
    this.searchAnalytics.popularQueries.set(normalizedQuery, count + 1);
  }

  /**
   * Helper methods
   */
  getStrategyName(index) {
    const names = ['exact', 'fuzzy', 'entity', 'semantic', 'contextual'];
    return names[index] || 'unknown';
  }

  generateSearchId() {
    return `SEARCH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  async loadSearchHistory() {
    // In real implementation, load from storage
    this.searchHistory = [];
  }

  setupNLPProcessor() {
    // Initialize NLP processor for advanced text processing
    this.nlpProcessor = {
      extractKeywords: (text) => this.extractSearchableWords(text),
      detectLanguage: (text) => 'en', // English for now
      stemWords: (words) => words // Simplified stemming
    };
  }

  setupEventListeners() {
    // Listen for data changes that might affect search index
    window.addEventListener('documentUploaded', this.boundDocumentUploaded);
    window.addEventListener('royaltyCalculated', this.boundRoyaltyCalculated);
  }

  updateEntityIndex(data) {
    if (data.entity) {
      this.addEntityToIndex(data.entity, {
        id: `CALC_${Date.now()}`,
        type: 'calculation',
        entity: data.entity,
        content: `Royalty calculation for ${data.entity}: ${data.amount}`
      });
    }
  }

  destroy() {
    console.log("Destroying EnhancedSemanticSearch...");

    // Clear all in-memory data structures
    this.searchIndex.clear();
    this.documents = [];
    this.searchHistory = [];
    this.synonyms.clear();
    this.entityIndex.clear();
    this.contextualSuggestions = [];

    // Reset analytics
    this.searchAnalytics = {
      totalSearches: 0,
      popularQueries: new Map(),
      failedSearches: [],
      averageResultsPerQuery: 0
    };

    // Remove event listeners
    window.removeEventListener('documentUploaded', this.boundDocumentUploaded);
    window.removeEventListener('royaltyCalculated', this.boundRoyaltyCalculated);

    this.initialized = false;
  }

  // Getters
  getSearchIndex() { return this.searchIndex; }
  getEntityIndex() { return this.entityIndex; }
  getSearchHistory() { return this.searchHistory; }
  getDocuments() { return this.documents; }
}

/**
 * Simple NLP Processor for text analysis
 */
class NLPProcessor {
  constructor() {
    this.initialized = false;
  }

  extractKeywords(text) {
    // Simple keyword extraction
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
  }

  detectSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ['good', 'excellent', 'great', 'satisfactory', 'compliant'];
    const negativeWords = ['bad', 'poor', 'violation', 'non-compliant', 'overdue'];
    
    const words = text.toLowerCase().split(/\s+/);
    let sentiment = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) sentiment++;
      if (negativeWords.includes(word)) sentiment--;
    });
    
    return sentiment > 0 ? 'positive' : sentiment < 0 ? 'negative' : 'neutral';
  }
}
