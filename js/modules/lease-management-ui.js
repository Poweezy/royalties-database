/**
 * @module LeaseManagementUI
 * @description Handles all UI logic for the Enhanced Lease Management section.
 */
import { leaseManagementEnhanced } from "./lease-management-enhanced.js";
import { notificationManager } from "./NotificationManager.js";
import { Pagination } from "./Pagination.js";

class LeaseManagementUI {
  constructor() {
    this.elements = {};
    this.pagination = null;
    this.sortState = { key: 'startDate', direction: 'desc' };
    this.filterState = { searchTerm: '' };
  }

  init() {
    this.cacheDOMElements();
    this.pagination = new Pagination({
      containerSelector: "#lease-management-pagination",
      itemsPerPage: 5,
      onPageChange: (page) => {
        this.renderLeases(page);
      },
    });
    this.bindEvents();
    this.populateLeaseTemplates();
    this.renderLeases();
  }

  cacheDOMElements() {
    this.elements = {
      // Main section
      tableBody: document.getElementById("lease-management-table-body"),
      tableHeaders: document.querySelectorAll(
        "#lease-management .data-table th[sortable]",
      ),

      // Buttons
      addLeaseBtn: document.getElementById("add-lease-btn"),
      viewTemplatesBtn: document.getElementById("view-lease-templates-btn"),
      auditTrailBtn: document.getElementById("lease-audit-trail-btn"),
      createLeaseDropdown: document.getElementById("createLeaseDropdown"),
      templatesDropdown: document.getElementById("lease-templates-dropdown"),

      // Filter
      filterSearchInput: document.getElementById("lease-filter-search"),
      filterStatusSelect: document.getElementById("lease-filter-status"),

      // Details View
      detailsView: document.getElementById("lease-details-view"),
      detailsContent: document.getElementById("lease-details-content"),
      closeDetailsViewBtn: document.getElementById(
        "close-lease-details-view-btn",
      ),

      // Add/Edit Modal
      addLeaseModal: document.getElementById("add-lease-modal"),
      modalTitle: document.getElementById("lease-modal-title"),
      saveLeaseBtn: document.getElementById("save-lease-btn"),
      closeModalBtn: document.getElementById("close-add-lease-modal-btn"),
      cancelBtn: document.getElementById("cancel-add-lease-btn"),
      addLeaseForm: document.getElementById("add-lease-form"),
      leaseIdInput: document.getElementById("lease-id"),
      entityInput: document.getElementById("lease-entity"),
      typeSelect: document.getElementById("lease-type"),
      startDateInput: document.getElementById("lease-start-date"),
      endDateInput: document.getElementById("lease-end-date"),
      docUploadInput: document.getElementById("lease-document-upload"),
    };
  }

  bindEvents() {
    if (this.elements.addLeaseBtn) {
      this.elements.addLeaseBtn.addEventListener("click", () =>
        this.openAddLeaseModal(),
      );
    }
    this.elements.closeModalBtn.addEventListener("click", () =>
      this.closeAddLeaseModal(),
    );
    this.elements.cancelBtn.addEventListener("click", () =>
      this.closeAddLeaseModal(),
    );
    this.elements.addLeaseForm.addEventListener("submit", (e) =>
      this.handleSaveLease(e),
    );
    this.elements.closeDetailsViewBtn.addEventListener("click", () =>
      this.closeDetailsView(),
    );
    this.elements.filterSearchInput.addEventListener("keyup", (e) =>
      this.handleFilterChange(e),
    );
    this.elements.filterStatusSelect.addEventListener("change", (e) =>
      this.handleFilterChange(e),
    );

    this.elements.tableHeaders.forEach((header) => {
      header.addEventListener("click", (e) => this.handleSort(e));
    });

    this.elements.createLeaseDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
        this.elements.templatesDropdown.classList.toggle("show");
    });

    document.body.addEventListener('click', (e) => {
        if (!e.target.matches('#createLeaseDropdown, #createLeaseDropdown *')) {
            this.elements.templatesDropdown.classList.remove('show');
        }
    });
  }

  populateLeaseTemplates() {
    const templates = leaseManagementEnhanced.leaseTemplates;
    this.elements.templatesDropdown.innerHTML = `
          <a class="dropdown-item" href="#" data-template="blank">From Scratch</a>
          <div class="dropdown-divider"></div>
        `;
    templates.forEach((template) => {
      const a = document.createElement("a");
      a.className = "dropdown-item";
      a.href = "#";
      a.textContent = template.name;
      a.dataset.template = template.id;
      this.elements.templatesDropdown.appendChild(a);
    });

    this.elements.templatesDropdown.addEventListener("click", (e) => {
      if (e.target.classList.contains("dropdown-item")) {
        e.preventDefault();
        const templateId = e.target.dataset.template;
        this.openAddLeaseModal(null, templateId);
        this.elements.templatesDropdown.classList.remove("show");
      }
    });
  }

  async renderLeases(page = 1) {
    await leaseManagementEnhanced.loadLeases();
    let leases = [...leaseManagementEnhanced.leases];

    // Apply filtering
    const searchTerm = this.elements.filterSearchInput.value.toLowerCase();
    const statusFilter = this.elements.filterStatusSelect.value;

    if (searchTerm) {
      leases = leases.filter(
        (l) =>
          l.id.toLowerCase().includes(searchTerm) ||
          l.entity.toLowerCase().includes(searchTerm) ||
          l.type.toLowerCase().includes(searchTerm) ||
          l.status.toLowerCase().includes(searchTerm),
      );
    }

    if (statusFilter) {
      leases = leases.filter((l) => l.status === statusFilter);
    }

    // Apply sorting
    leases.sort((a, b) => {
        const valA = a[this.sortState.key];
        const valB = b[this.sortState.key];
        if (valA < valB) return this.sortState.direction === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortState.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Apply pagination
    const startIndex = (page - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    const paginatedLeases = leases.slice(startIndex, endIndex);

    this.elements.tableBody.innerHTML = "";
    if (paginatedLeases.length === 0) {
      this.elements.tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No leases match the criteria.</td></tr>`;
    } else {
        paginatedLeases.forEach(lease => {
            const row = this.createLeaseRow(lease);
            this.elements.tableBody.appendChild(row);
        });
    }

    this.pagination.render(leases.length, page);
    this.updateSortIndicators();
  }

  createLeaseRow(lease) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${lease.id}</td>
      <td>${lease.entity}</td>
      <td>${lease.type}</td>
      <td><span class="status-badge ${lease.status ? lease.status.toLowerCase().replace(' ', '-') : 'unknown'}">${lease.status || 'Unknown'}</span></td>
      <td>${new Date(lease.startDate).toLocaleDateString()}</td>
      <td>${lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'N/A'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-info view-btn" data-id="${lease.id}" title="View Details"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm btn-primary edit-btn" data-id="${lease.id}" title="Edit Lease"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${lease.id}" title="Delete Lease"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    row.querySelector('.view-btn').addEventListener('click', (e) => this.showLeaseDetails(e.currentTarget.dataset.id));
    row.querySelector('.edit-btn').addEventListener('click', (e) => this.openAddLeaseModal(e.currentTarget.dataset.id));
    return row;
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

  updateSortIndicators() {
    this.elements.tableHeaders.forEach(header => {
        if (header.dataset.sort === this.sortState.key) {
            header.classList.add('sorted', `sorted-${this.sortState.direction}`);
        } else {
            header.classList.remove('sorted', 'sorted-asc', 'sorted-desc');
        }
    });
  }

  handleFilterChange(e) {
    this.filterState.searchTerm = e.target.value;
    this.renderLeases();
  }

  openAddLeaseModal(leaseId = null, templateId = null) {
    this.elements.addLeaseForm.reset();
    this.elements.leaseIdInput.value = "";

    if (leaseId) {
      const lease = leaseManagementEnhanced.leases.find(
        (l) => l.id === leaseId,
      );
      if (lease) {
        this.elements.modalTitle.textContent = "Edit Lease";
        this.elements.leaseIdInput.value = lease.id;
        this.elements.entityInput.value = lease.entity;
        this.elements.typeSelect.value = lease.type;
        this.elements.startDateInput.value = lease.startDate;
        this.elements.endDateInput.value = lease.endDate;
      }
    } else if (templateId && templateId !== "blank") {
      const template = leaseManagementEnhanced.leaseTemplates.find(
        (t) => t.id === templateId,
      );
      if (template) {
        this.elements.modalTitle.textContent = `New Lease from ${template.name}`;
        this.elements.typeSelect.value = template.type;
      }
    } else {
      this.elements.modalTitle.textContent = "Create New Lease";
    }
    this.elements.addLeaseModal.style.display = "block";
  }

  closeAddLeaseModal() {
    this.elements.addLeaseModal.style.display = "none";
  }

  async handleSaveLease(event) {
    event.preventDefault();
    const leaseData = {
        id: this.elements.leaseIdInput.value,
        entity: this.elements.entityInput.value,
        type: this.elements.typeSelect.value,
        startDate: this.elements.startDateInput.value,
        endDate: this.elements.endDateInput.value,
    };

    try {
        if (leaseData.id) {
            await leaseManagementEnhanced.updateLease(leaseData);
            notificationManager.show("Lease updated successfully!", "success");
        } else {
            await leaseManagementEnhanced.addLease(leaseData);
            notificationManager.show(`Lease created successfully!`, "success");
        }
        this.renderLeases();
        this.closeAddLeaseModal();
    } catch(error) {
        notificationManager.show(`Error: ${error.message}`, "error");
    }
  }

  showLeaseDetails(leaseId) {
    const lease = leaseManagementEnhanced.leases.find(l => l.id === leaseId);
    if (!lease) return;

    let documentsHtml = '<h5>No documents attached.</h5>';
    if(lease.documents && lease.documents.length > 0) {
        documentsHtml = `
            <h5>Attached Documents</h5>
            <ul class="document-list">
                ${lease.documents.map(doc => `<li><i class="fas fa-file-alt"></i> ${doc.name}</li>`).join('')}
            </ul>
        `;
    }

    this.elements.detailsContent.innerHTML = `
        <div class="grid-2">
            <div>
                <h4>${lease.entity} - ${lease.type}</h4>
                <p><strong>ID:</strong> ${lease.id}</p>
                <p><strong>Status:</strong> <span class="status-badge ${lease.status.toLowerCase().replace(' ', '-')}">${lease.status}</span></p>
                <p><strong>Period:</strong> ${new Date(lease.startDate).toLocaleDateString()} - ${lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'Ongoing'}</p>
            </div>
            <div>
                ${documentsHtml}
            </div>
        </div>
    `;

    this.elements.detailsView.style.display = 'block';
  }

  closeDetailsView() {
      this.elements.detailsView.style.display = 'none';
  }
}

export const leaseManagementUI = new LeaseManagementUI();
