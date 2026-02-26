/**
 * Contract Manager
 * Consolidates UI logic and enhanced contract management features (workflows, templates, analytics)
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { authService } from "../services/auth.service.js";
import { Pagination } from "./Pagination.js";
import { logger } from "../utils/logger.js";
import { security } from "../utils/security.js";
import { auditService } from "../services/audit.service.js";

export class ContractManager {
    constructor() {
        this.elements = {};
        this.pagination = null;
        this.contracts = [];
        this.templates = [];
        this.sortState = { key: 'startDate', direction: 'desc' };
        this.filterState = { searchTerm: '' };
        this.initialized = false;
    }

    /**
     * Initialize Contract Manager
     */
    async init() {
        if (this.initialized) return;

        logger.debug("Initializing Contract Manager...");

        await this.loadTemplates();
        this.cacheDOMElements();

        this.pagination = new Pagination({
            containerSelector: "#contract-management-pagination",
            itemsPerPage: 10,
            onPageChange: (page) => {
                this.renderContracts(page);
            },
        });

        if (this.elements.addContractForm) {
            this.bindEvents();
        }

        await this.refreshContracts();
        this.initialized = true;
        logger.debug("Contract Manager Initialized.");
    }

    async loadTemplates() {
        this.templates = [
            { id: "coal_mining_template", name: "Coal Mining", calcType: "sliding_scale" },
            { id: "quarry_template", name: "Quarry Operations", calcType: "fixed" },
            { id: "precious_metals_template", name: "Precious Metals", calcType: "ad_valorem" }
        ];
    }

    cacheDOMElements() {
        const ids = [
            "contract-management-table-body",
            "contract-management-pagination",
            "add-contract-btn",
            "add-contract-modal",
            "close-add-contract-modal-btn",
            "cancel-add-contract-btn",
            "add-contract-form",
            "contract-filter-search",
            "contract-modal-title",
            "contract-id",
            "contract-template",
            "contract-entity",
            "contract-mineral",
            "start-date",
            "end-date",
            "calculation-type"
        ];

        ids.forEach(id => {
            this.elements[id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = document.getElementById(id);
        });

        // Handle headers separately for sorting
        this.elements.tableHeaders = document.querySelectorAll("#contract-management .data-table th[sortable]");
    }

    bindEvents() {
        if (this.elements.addContractBtn) {
            this.elements.addContractBtn.addEventListener("click", () => this.openModal());
        }
        if (this.elements.closeAddContractModalBtn) {
            this.elements.closeAddContractModalBtn.addEventListener("click", () => this.closeModal());
        }
        if (this.elements.cancelAddContractBtn) {
            this.elements.cancelAddContractBtn.addEventListener("click", () => this.closeModal());
        }
        if (this.elements.addContractForm) {
            this.elements.addContractForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
        }
        if (this.elements.contractFilterSearch) {
            this.elements.contractFilterSearch.addEventListener("keyup", (e) => {
                this.filterState.searchTerm = e.target.value;
                this.renderContracts();
            });
        }
        if (this.elements.tableHeaders) {
            this.elements.tableHeaders.forEach(header => {
                header.addEventListener("click", (e) => this.handleSort(e));
            });
        }
    }

    openModal(contractId = null) {
        this.elements.addContractForm.reset();
        this.populateTemplates();

        if (contractId) {
            const contract = this.contracts.find(c => c.id === contractId);
            if (contract) {
                this.elements.contractModalTitle.textContent = "Edit Contract";
                this.elements.contractId.value = contract.id;
                this.elements.contractEntity.value = contract.entity;
                this.elements.contractMineral.value = contract.mineral;
                this.elements.startDate.value = contract.startDate;
                this.elements.endDate.value = contract.endDate;
                this.elements.calculationType.value = contract.calculationType;
            }
        } else {
            this.elements.contractModalTitle.textContent = "Create New Contract";
        }
        this.elements.addContractModal.style.display = "block";
    }

    closeModal() {
        this.elements.addContractModal.style.display = "none";
        this.elements.addContractForm.reset();
    }

    populateTemplates() {
        if (!this.elements.contractTemplate) return;
        this.elements.contractTemplate.innerHTML = `<option value="">Start from scratch</option>`;
        this.templates.forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = t.name;
            this.elements.contractTemplate.appendChild(option);
        });
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(this.elements.addContractForm);
        const contractId = formData.get("contract-id");

        const contractData = {
            id: contractId || `CONT-${Date.now()}`,
            entity: security.sanitizeInput(formData.get("contract-entity")),
            mineral: security.sanitizeInput(formData.get("contract-mineral")),
            startDate: security.sanitizeInput(formData.get("start-date"), "date"),
            endDate: security.sanitizeInput(formData.get("end-date"), "date"),
            calculationType: security.sanitizeInput(formData.get("calculation-type")),
            status: contractId ? undefined : 'Active',
            updatedAt: new Date().toISOString()
        };

        try {
            if (contractId) {
                await dbService.update("contracts", contractData);
                await auditService.log('Contract Updated', 'Data', { id: contractData.id, entity: contractData.entity });
                showToast("Contract updated successfully!", "success");
            } else {
                contractData.createdAt = new Date().toISOString();
                await dbService.add("contracts", contractData);
                await auditService.log('Contract Created', 'Data', { id: contractData.id, entity: contractData.entity });
                showToast("Contract created successfully!", "success");
            }
            await this.refreshContracts();
            this.closeModal();
        } catch (error) {
            logger.error("Error saving contract", error);
            showToast("Failed to save contract.", "error");
        }
    }

    async refreshContracts() {
        this.contracts = await dbService.getAll("contracts");
        await this.renderContracts(1);
    }

    handleSort(e) {
        const key = e.currentTarget.dataset.sort;
        if (this.sortState.key === key) {
            this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortState.key = key;
            this.sortState.direction = 'asc';
        }
        this.renderContracts();
    }

    async renderContracts(page = 1) {
        if (!this.elements.contractManagementTableBody) return;

        let filtered = [...this.contracts];
        if (this.filterState.searchTerm) {
            const term = this.filterState.searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.entity.toLowerCase().includes(term) ||
                c.mineral.toLowerCase().includes(term) ||
                c.id.toLowerCase().includes(term)
            );
        }

        filtered.sort((a, b) => {
            const valA = a[this.sortState.key];
            const valB = b[this.sortState.key];
            if (valA < valB) return this.sortState.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortState.direction === 'asc' ? 1 : -1;
            return 0;
        });

        const startIndex = (page - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);

        this.elements.contractManagementTableBody.innerHTML = "";
        if (filtered.length === 0) {
            this.elements.contractManagementTableBody.innerHTML = `<tr><td colspan="7" class="text-center">No contracts found.</td></tr>`;
        } else {
            paginated.forEach((contract) => {
                const row = this.createContractRow(contract);
                this.elements.contractManagementTableBody.appendChild(row);
            });
        }
        this.pagination.render(filtered.length, page);
        this.updateSortIndicators();
    }

    createContractRow(contract) {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${contract.id}</td>
      <td>${contract.entity}</td>
      <td>${contract.mineral}</td>
      <td><span class="badge ${this.getStatusBadgeClass(contract.status)}">${contract.status}</span></td>
      <td>${new Date(contract.startDate).toLocaleDateString()}</td>
      <td>${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Ongoing'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-info edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;

        row.querySelector(".edit-btn").addEventListener("click", () => this.openModal(contract.id));
        row.querySelector(".delete-btn").addEventListener("click", () => this.handleDeleteContract(contract.id));
        return row;
    }

    getStatusBadgeClass(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-success';
            case 'draft': return 'bg-secondary';
            case 'expired': return 'bg-danger';
            default: return 'bg-info';
        }
    }

    updateSortIndicators() {
        if (!this.elements.tableHeaders) return;
        this.elements.tableHeaders.forEach(header => {
            if (header.dataset.sort === this.sortState.key) {
                header.className = `sorted sorted-${this.sortState.direction}`;
            } else {
                header.className = "";
            }
        });
    }

    async handleDeleteContract(contractId) {
        if (confirm("Delete this contract?")) {
            try {
                await dbService.delete("contracts", contractId);
                await auditService.log('Contract Deleted', 'Data', { id: contractId });
                await this.refreshContracts();
                showToast("Contract deleted", "success");
            } catch (error) {
                showToast("Delete failed", "error");
            }
        }
    }

    generateContractAnalytics() {
        // Basic analytics
        return {
            total: this.contracts.length,
            active: this.contracts.filter(c => c.status === 'Active').length,
            minerals: [...new Set(this.contracts.map(c => c.mineral))].length
        };
    }
}
