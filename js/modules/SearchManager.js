/**
 * Search Manager
 * Consolidates basic search and AI-powered semantic search features
 */
import { dbService } from "../services/database.service.js";
import { logger } from "../utils/logger.js";
import { security } from "../utils/security.js";
import { auditService } from "../services/audit.service.js";

export class SearchManager {
    constructor() {
        this.searchIndex = new Map();
        this.initialized = false;
        this.synonyms = new Map();
    }

    /**
     * Initialize Search Manager
     */
    async init() {
        if (this.initialized) return;

        logger.debug("Initializing Search Manager...");
        await this.loadSynonyms();
        await this.rebuildIndex();

        this.initialized = true;
        logger.debug("Search Manager Initialized.");
    }

    async loadSynonyms() {
        // Basic synonym mapping for mining domain
        const terms = {
            'mining': ['extraction', 'excavation'],
            'production': ['output', 'yield'],
            'royalty': ['payment', 'fee'],
            'contract': ['agreement', 'lease']
        };
        Object.entries(terms).forEach(([key, syns]) => this.synonyms.set(key, syns));
    }

    async rebuildIndex() {
        logger.debug("Building search index...");
        const dataTypes = ["leases", "contracts", "documents", "users"];
        const allData = await Promise.all(dataTypes.map(type => dbService.getAll(type)));

        this.searchIndex.clear();
        allData.forEach((items, index) => {
            const type = dataTypes[index];
            items.forEach(item => {
                const content = this.extractContent(item);
                const keywords = this.tokenize(content);
                keywords.forEach(word => {
                    if (!this.searchIndex.has(word)) this.searchIndex.set(word, []);
                    this.searchIndex.get(word).push({ type, id: item.id, item });
                });
            });
        });
    }

    extractContent(item) {
        return Object.values(item)
            .filter(v => typeof v === 'string')
            .join(' ')
            .toLowerCase();
    }

    tokenize(text) {
        return text.split(/\W+/).filter(w => w.length > 2);
    }

    async search(query) {
        const sanitizedQuery = security.sanitizeInput(query);
        const tokens = this.tokenize(sanitizedQuery.toLowerCase());
        const resultsMap = new Map();

        await auditService.log('Search Performed', 'Search', { query: sanitizedQuery.substring(0, 50) });

        tokens.forEach(token => {
            // Direct matches
            this.matchToken(token, resultsMap, 1.0);

            // Synonym matches
            if (this.synonyms.has(token)) {
                this.synonyms.get(token).forEach(syn => this.matchToken(syn, resultsMap, 0.8));
            }
        });

        return Array.from(resultsMap.values()).sort((a, b) => b.score - a.score);
    }

    matchToken(token, resultsMap, weight) {
        if (this.searchIndex.has(token)) {
            this.searchIndex.get(token).forEach(match => {
                const key = `${match.type}_${match.id}`;
                if (!resultsMap.has(key)) {
                    resultsMap.set(key, { ...match, score: 0 });
                }
                resultsMap.get(key).score += weight;
            });
        }
    }
}
