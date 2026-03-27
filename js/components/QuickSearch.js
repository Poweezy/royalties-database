/**
 * QuickSearch Component
 * Provides a global command palette (Ctrl+K) for the application.
 */
import { SearchManager } from "../modules/SearchManager.js";
import { logger } from "../utils/logger.js";

export class QuickSearch {
    constructor() {
        this.searchManager = new SearchManager();
        this.isOpen = false;
        this.modal = null;
        this.input = null;
        this.resultsContainer = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        await this.searchManager.init();
        this.createUI();
        this.bindEvents();

        this.initialized = true;
        logger.debug("QuickSearch component initialized.");
    }

    createUI() {
        // Create modal overlay
        this.modal = document.createElement("div");
        this.modal.id = "quick-search-modal";
        this.modal.className = "quick-search-overlay";
        this.modal.style.display = "none";

        this.modal.innerHTML = `
            <div class="quick-search-container glass">
                <div class="quick-search-header">
                    <i class="fas fa-search"></i>
                    <input type="text" id="quick-search-input" placeholder="Search leases, contracts, users..." autocomplete="off">
                    <kbd>ESC</kbd>
                </div>
                <div id="quick-search-results" class="quick-search-results">
                    <div class="quick-search-placeholder">Type to start searching...</div>
                </div>
                <div class="quick-search-footer">
                    <span><kbd>↑↓</kbd> to navigate</span>
                    <span><kbd>↵</kbd> to select</span>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.input = this.modal.querySelector("#quick-search-input");
        this.resultsContainer = this.modal.querySelector("#quick-search-results");
    }

    bindEvents() {
        // Keyboard shortcut: Ctrl+K or Cmd+K
        document.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === "Escape" && this.isOpen) {
                this.close();
            }
        });

        // Close on clicking outside
        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Search on input
        this.input.addEventListener("input", async (e) => {
            const query = e.target.value;
            if (query.length < 2) {
                this.resultsContainer.innerHTML = '<div class="quick-search-placeholder">Type to start searching...</div>';
                return;
            }
            const results = await this.searchManager.search(query);
            this.renderResults(results);
        });

        // Handle navigation in results
        this.input.addEventListener("keydown", (e) => {
            const items = this.resultsContainer.querySelectorAll(".quick-search-item");
            let activeIndex = Array.from(items).findIndex(item => item.classList.contains("active"));

            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (activeIndex < items.length - 1) {
                    if (activeIndex >= 0) items[activeIndex].classList.remove("active");
                    items[activeIndex + 1].classList.add("active");
                    items[activeIndex + 1].scrollIntoView({ block: "nearest" });
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (activeIndex > 0) {
                    items[activeIndex].classList.remove("active");
                    items[activeIndex - 1].classList.add("active");
                    items[activeIndex - 1].scrollIntoView({ block: "nearest" });
                }
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0) {
                    items[activeIndex].click();
                }
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.modal.style.display = "flex";
        this.input.value = "";
        this.input.focus();
        this.resultsContainer.innerHTML = '<div class="quick-search-placeholder">Type to start searching...</div>';
    }

    close() {
        this.isOpen = false;
        this.modal.style.display = "none";
    }

    renderResults(results) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="quick-search-no-results">No matches found.</div>';
            return;
        }

        this.resultsContainer.innerHTML = "";
        results.slice(0, 10).forEach((result, index) => {
            const item = document.createElement("div");
            item.className = "quick-search-item";
            if (index === 0) item.classList.add("active");

            const icon = this.getTypeIcon(result.type);
            const title = this.getResultTitle(result);
            const subtitle = this.getResultSubtitle(result);

            item.innerHTML = `
                <div class="result-icon">${icon}</div>
                <div class="result-info">
                    <div class="result-title">${title}</div>
                    <div class="result-subtitle">${subtitle}</div>
                </div>
                <div class="result-type badge">${result.type}</div>
            `;

            item.addEventListener("click", () => {
                this.handleResultClick(result);
            });

            this.resultsContainer.appendChild(item);
        });
    }

    getTypeIcon(type) {
        switch (type) {
            case "leases": return '<i class="fas fa-file-contract"></i>';
            case "contracts": return '<i class="fas fa-handshake"></i>';
            case "users": return '<i class="fas fa-user"></i>';
            case "documents": return '<i class="fas fa-file-alt"></i>';
            default: return '<i class="fas fa-search"></i>';
        }
    }

    getResultTitle(result) {
        const item = result.item;
        return item.name || item.username || item.filename || item.title || "Untitled";
    }

    getResultSubtitle(result) {
        const item = result.item;
        if (result.type === "users") return item.email || item.role;
        if (result.type === "contracts") return item.entity || item.mineral;
        if (item.category) return item.category;
        return "";
    }

    handleResultClick(result) {
        this.close();
        // Dispatches global event for navigation
        const event = new CustomEvent("navigate_to_item", {
            detail: { type: result.type, id: result.id, item: result.item }
        });
        window.dispatchEvent(event);
        
        // Also try to use internal app navigation if available
        if (window.app && window.app.navigation) {
            window.app.navigation.navigateTo(result.type, result.id);
        }
    }
}
