/**
 * Lease Manager
 * Consolidates UI logic and enhanced lease management features (monitoring, templates, automated notifications)
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { authService } from "../services/auth.service.js";
import { Pagination } from "./Pagination.js";
import { logger } from "../utils/logger.js";
import { security } from "../utils/security.js";
import { auditService } from "../services/audit.service.js";

export class LeaseManager {
    constructor() {
        this.elements = {};
        this.pagination = null;
        this.leases = [];
        this.templates = [];
        this.sortState = { key: 'startDate', direction: 'desc' };
        this.filterState = { searchTerm: '' };
        this.initialized = false;
        this.monitoringIntervalId = null;
    }

    /**
     * Initialize Lease Manager
     */
    async init() {
        if (this.initialized) return;

        logger.debug("Initializing Lease Manager...");

        await this.loadTemplates();
        this.cacheDOMElements();

        this.pagination = new Pagination({
            containerSelector: "#lease-management-pagination",
            itemsPerPage: 10,
            onPageChange: (page) => {
                this.renderLeases(page);
            },
        });

        if (this.elements.addLeaseForm) {
            this.bindEvents();
        }

        await this.refreshLeases();
        this.startMonitoring();

        this.initialized = true;
        logger.debug("Lease Manager Initialized.");
    }

    async loadTemplates() {
        this.templates = [
            { id: "land_lease_template", name: "Land Lease", type: "Land" },
            { id: "equipment_lease_template", name: "Equipment Lease", type: "Equipment" }
        ];
    }

    cacheDOMElements() {
        const ids = [
            "lease-management-table-body",
            "lease-management-pagination",
            "add-lease-btn",
            "add-lease-modal",
            "close-add-lease-modal-btn",
            "cancel-add-lease-btn",
            "add-lease-form",
            "lease-filter-search",
            "lease-modal-title",
            "lease-id",
            "lease-entity",
            "lease-type",
            "lease-start-date",
            "lease-end-date"
        ];

        ids.forEach(id => {
            this.elements[id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = document.getElementById(id);
        });

        this.elements.tableHeaders = document.querySelectorAll("#lease-management .data-table th[sortable]");
    }

    bindEvents() {
        if (this.elements.addLeaseBtn) {
            this.elements.addLeaseBtn.addEventListener("click", () => this.openModal());
        }
        if (this.elements.closeAddLeaseModalBtn) {
            this.elements.closeAddLeaseModalBtn.addEventListener("click", () => this.closeModal());
        }
        if (this.elements.cancelAddLeaseBtn) {
            this.elements.cancelAddLeaseBtn.addEventListener("click", () => this.closeModal());
        }
        if (this.elements.addLeaseForm) {
            this.elements.addLeaseForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
        }
        if (this.elements.leaseFilterSearch) {
            this.elements.leaseFilterSearch.addEventListener("keyup", (e) => {
                this.filterState.searchTerm = e.target.value;
                this.renderLeases();
            });
        }
        if (this.elements.tableHeaders) {
            this.elements.tableHeaders.forEach(header => {
                header.addEventListener("click", (e) => this.handleSort(e));
            });
        }
    }

    openModal(leaseId = null) {
        this.elements.addLeaseForm.reset();

        if (leaseId) {
            const lease = this.leases.find(l => l.id === leaseId);
            if (lease) {
                this.elements.leaseModalTitle.textContent = "Edit Lease";
                this.elements.leaseId.value = lease.id;
                this.elements.leaseEntity.value = lease.entity;
                this.elements.leaseType.value = lease.type;
                this.elements.leaseStartDate.value = lease.startDate;
                this.elements.leaseEndDate.value = lease.endDate;
            }
        } else {
            this.elements.leaseModalTitle.textContent = "Create New Lease";
        }
        this.elements.addLeaseModal.style.display = "block";
    }

    closeModal() {
        this.elements.addLeaseModal.style.display = "none";
        this.elements.addLeaseForm.reset();
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(this.elements.addLeaseForm);
        const leaseId = formData.get("lease-id");

        const leaseData = {
            id: leaseId || `LEASE-${Date.now()}`,
            entity: security.sanitizeInput(formData.get("lease-entity")),
            type: security.sanitizeInput(formData.get("lease-type")),
            startDate: security.sanitizeInput(formData.get("lease-start-date"), "date"),
            endDate: security.sanitizeInput(formData.get("lease-end-date"), "date"),
            status: leaseId ? undefined : 'Active',
            updatedAt: new Date().toISOString()
        };

        try {
            if (leaseId) {
                await dbService.update("leases", leaseData);
                await auditService.log('Lease Updated', 'Data', { id: leaseData.id, entity: leaseData.entity });
                showToast("Lease updated successfully!", "success");
            } else {
                leaseData.createdAt = new Date().toISOString();
                await dbService.add("leases", leaseData);
                await auditService.log('Lease Created', 'Data', { id: leaseData.id, entity: leaseData.entity });
                showToast("Lease created successfully!", "success");
            }
            await this.refreshLeases();
            this.closeModal();
        } catch (error) {
            logger.error("Error saving lease", error);
            showToast("Failed to save lease.", "error");
        }
    }

    async refreshLeases() {
        this.leases = await dbService.getAll("leases");
        await this.renderLeases(1);
    }

    handleSort(e) {
        const key = e.currentTarget.dataset.sort;
        if (this.sortState.key === key) {
            this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortState.key = key;
            this.sortState.direction = 'asc';
        }
        this.renderLeases();
    }

    async renderLeases(page = 1) {
        if (!this.elements.leaseManagementTableBody) return;

        let filtered = [...this.leases];
        if (this.filterState.searchTerm) {
            const term = this.filterState.searchTerm.toLowerCase();
            filtered = filtered.filter(l =>
                l.entity.toLowerCase().includes(term) ||
                l.type.toLowerCase().includes(term) ||
                l.id.toLowerCase().includes(term)
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

        this.elements.leaseManagementTableBody.innerHTML = "";
        if (filtered.length === 0) {
            this.elements.leaseManagementTableBody.innerHTML = `<tr><td colspan="7" class="text-center">No leases found.</td></tr>`;
        } else {
            paginated.forEach((lease) => {
                const row = this.createLeaseRow(lease);
                this.elements.leaseManagementTableBody.appendChild(row);
            });
        }
        this.pagination.render(filtered.length, page);
        this.updateSortIndicators();
    }

    createLeaseRow(lease) {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${lease.id}</td>
      <td>${lease.entity}</td>
      <td>${lease.type}</td>
      <td><span class="badge ${this.getStatusBadgeClass(lease.status)}">${lease.status || 'Active'}</span></td>
      <td>${new Date(lease.startDate).toLocaleDateString()}</td>
      <td>${lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'N/A'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-info edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;

        row.querySelector(".edit-btn").addEventListener("click", () => this.openModal(lease.id));
        row.querySelector(".delete-btn").addEventListener("click", () => this.handleDeleteLease(lease.id));
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

    async handleDeleteLease(leaseId) {
        if (confirm("Delete this lease?")) {
            try {
                await dbService.delete("leases", leaseId);
                await auditService.log('Lease Deleted', 'Data', { id: leaseId });
                await this.refreshLeases();
                showToast("Lease deleted", "success");
            } catch (error) {
                showToast("Delete failed", "error");
            }
        }
    }

    startMonitoring() {
        this.monitoringIntervalId = setInterval(() => this.checkExpirations(), 24 * 60 * 60 * 1000);
        this.checkExpirations();
    }

    async checkExpirations() {
        const now = new Date();
        this.leases.forEach(async lease => {
            if (lease.status === 'Active' && lease.endDate) {
                const end = new Date(lease.endDate);
                if (end < now) {
                    lease.status = 'Expired';
                    await dbService.update('leases', lease);
                    await auditService.log('Lease Expired', 'System', { id: lease.id, entity: lease.entity }, 'Success');
                    showToast(`Lease ${lease.id} has expired!`, "warning");
                }
            }
        });
    }
}
