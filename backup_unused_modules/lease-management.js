/**
 * @module LeaseManagement
 * @description Handles all logic for the Lease Management section, including
 *              displaying leases, and adding new lease agreements via a modal.
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { Pagination } from "./Pagination.js";

const LeaseManagement = {
  // DOM element references
  elements: {},
  pagination: null,

  /**
   * Initializes the Lease Management module.
   * @returns {Promise<void>}
   */
  async init() {
    console.log("Initializing Lease Management...");
    this.cacheDOMElements();
    this.pagination = new Pagination({
      containerSelector: "#lease-management-pagination",
      itemsPerPage: 5,
      onPageChange: (page) => {
        this.renderLeases(page);
      },
    });
    this.bindEvents();
    await this.seedInitialData();
    await this.renderLeases();
    console.log("Lease Management Initialized.");
  },

  /**
   * Caches all necessary DOM elements for the module.
   */
  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById("lease-management-table-body"),
      paginationContainer: document.getElementById(
        "lease-management-pagination",
      ),
      addLeaseBtn: document.getElementById("add-lease-btn"),
      addLeaseModal: document.getElementById("add-lease-modal"),
      modalTitle: document.querySelector("#add-lease-modal .modal-header h4"),
      saveLeaseBtn: document.getElementById("save-lease-btn"),
      closeModalBtn: document.getElementById("close-add-lease-modal-btn"),
      cancelBtn: document.getElementById("cancel-add-lease-btn"),
      addLeaseForm: document.getElementById("add-lease-form"),
      leaseEntityInput: document.getElementById("lease-entity"),
      leaseStartDateInput: document.getElementById("lease-start-date"),
      leaseEndDateInput: document.getElementById("lease-end-date"),
    };

    // Create pagination container if it doesn't exist
    if (!this.elements.paginationContainer) {
      this.elements.paginationContainer = document.createElement("div");
      this.elements.paginationContainer.id = "lease-management-pagination";
      this.elements.tableBody.parentElement.after(
        this.elements.paginationContainer,
      );
    }
  },

  /**
   * Binds all event listeners for the module.
   */
  bindEvents() {
    this.elements.addLeaseBtn.addEventListener("click", () => this.openModal());
    this.elements.closeModalBtn.addEventListener("click", () =>
      this.closeModal(),
    );
    this.elements.cancelBtn.addEventListener("click", () => this.closeModal());
    this.elements.addLeaseForm.addEventListener("submit", (e) =>
      this.handleFormSubmit(e),
    );

    // Close modal if user clicks outside of it
    window.addEventListener("click", (event) => {
      if (event.target === this.elements.addLeaseModal) {
        this.closeModal();
      }
    });
  },

  /**
   * Opens the "Add Lease" modal.
   */
  openModal(lease = null) {
    this.elements.addLeaseForm.reset();
    if (lease) {
      // Edit mode
      this.elements.modalTitle.textContent = "Edit Lease";
      this.elements.saveLeaseBtn.textContent = "Update Lease";
      this.elements.addLeaseForm.dataset.editingId = lease.id;
      this.elements.leaseEntityInput.value = lease.entity;
      this.elements.leaseStartDateInput.value = lease.startDate;
      this.elements.leaseEndDateInput.value = lease.endDate;
    } else {
      // Add mode
      this.elements.modalTitle.textContent = "Add New Lease";
      this.elements.saveLeaseBtn.textContent = "Save Lease";
      delete this.elements.addLeaseForm.dataset.editingId;
    }
    this.elements.addLeaseModal.style.display = "block";
  },

  /**
   * Closes the "Add Lease" modal and resets the form.
   */
  closeModal() {
    this.elements.addLeaseModal.style.display = "none";
    this.elements.addLeaseForm.reset();
    delete this.elements.addLeaseForm.dataset.editingId;
  },

  /**
   * Handles the submission of the "Add Lease" form.
   * @param {Event} event - The form submission event.
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const editingId = this.elements.addLeaseForm.dataset.editingId;
    const entity = this.elements.leaseEntityInput.value.trim();
    const startDate = this.elements.leaseStartDateInput.value;
    const endDate = this.elements.leaseEndDateInput.value;

    if (!entity || !startDate || !endDate) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      showToast("End date must be after the start date.", "error");
      return;
    }

    const leaseData = {
      entity,
      startDate,
      endDate,
      status: this.getLeaseStatus(endDate),
    };

    try {
      if (editingId) {
        leaseData.id = editingId;
        await dbService.put("leases", leaseData);
        showToast("Lease updated successfully!", "success");
      } else {
        leaseData.id = `lease_${Date.now()}`;
        await dbService.add("leases", leaseData);
        showToast("Lease added successfully!", "success");
      }
      await this.renderLeases(1);
      this.closeModal();
    } catch (error) {
      console.error("Error saving lease:", error);
      showToast("Failed to save lease. See console for details.", "error");
    }
  },

  /**
   * Renders all leases from the database into the table.
   */
  async renderLeases(page = 1) {
    try {
      const leases = await dbService.getAll("leases");
      leases.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

      const startIndex = (page - 1) * this.pagination.itemsPerPage;
      const endIndex = startIndex + this.pagination.itemsPerPage;
      const paginatedLeases = leases.slice(startIndex, endIndex);

      this.elements.tableBody.innerHTML = ""; // Clear existing rows

      if (leases.length === 0) {
        this.elements.tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding: 2rem;">
              No lease agreements found. Click "Add Lease" to get started.
            </td>
          </tr>
        `;
      } else {
        paginatedLeases.forEach((lease) => {
          const row = this.createLeaseRow(lease);
          this.elements.tableBody.appendChild(row);
        });
      }
      this.pagination.render(leases.length, page);
    } catch (error) {
      console.error("Error rendering leases:", error);
      showToast("Failed to load leases. See console for details.", "error");
    }
  },

  /**
   * Creates a table row element for a given lease object.
   * @param {object} lease - The lease object.
   * @returns {HTMLTableRowElement} The created table row element.
   */
  createLeaseRow(lease) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", lease.id);
    const status = this.getLeaseStatus(lease.endDate);
    const statusClass = status.toLowerCase().replace(" ", "-");

    row.innerHTML = `
      <td>${lease.entity}</td>
      <td>${new Date(lease.startDate).toLocaleDateString()}</td>
      <td>${new Date(lease.endDate).toLocaleDateString()}</td>
      <td><span class="status-badge ${statusClass}">${status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-primary edit-btn" title="Edit Lease">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" title="Delete Lease">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    // Add event listeners
    row
      .querySelector(".edit-btn")
      .addEventListener("click", () => this.handleEditLease(lease.id));
    row
      .querySelector(".delete-btn")
      .addEventListener("click", () => this.handleDeleteLease(lease.id));

    return row;
  },

  /**
   * Handles the editing of a lease.
   * @param {string} leaseId - The ID of the lease to edit.
   */
  async handleEditLease(leaseId) {
    try {
      const lease = await dbService.getById("leases", leaseId);
      if (lease) {
        this.openModal(lease);
      } else {
        showToast("Lease not found.", "error");
      }
    } catch (error) {
      console.error("Error fetching lease for editing:", error);
      showToast("Failed to fetch lease details.", "error");
    }
  },

  /**
   * Handles the deletion of a lease.
   * @param {string} leaseId - The ID of the lease to delete.
   */
  async handleDeleteLease(leaseId) {
    if (
      confirm(
        "Are you sure you want to delete this lease? This action cannot be undone.",
      )
    ) {
      try {
        await dbService.delete("leases", leaseId);
        await this.renderLeases(1);
        showToast("Lease deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting lease:", error);
        showToast("Failed to delete lease. See console for details.", "error");
      }
    }
  },

  async seedInitialData() {
    const leases = await dbService.getAll("leases");
    if (leases.length === 0) {
      const seedData = [
        {
          id: "lease_1",
          entity: "Kwalini Quarry",
          startDate: "2023-01-01",
          endDate: "2033-01-01",
        },
        {
          id: "lease_2",
          entity: "Mbabane Quarry",
          startDate: "2022-06-15",
          endDate: "2032-06-15",
        },
        {
          id: "lease_3",
          entity: "Sidvokodvo Quarry",
          startDate: "2023-03-01",
          endDate: "2028-03-01",
        },
        {
          id: "lease_4",
          entity: "Maloma Colliery",
          startDate: "2021-11-20",
          endDate: "2041-11-20",
        },
        {
          id: "lease_5",
          entity: "Ngwenya Mine",
          startDate: "2023-08-01",
          endDate: "2028-08-01",
        },
        {
          id: "lease_6",
          entity: "Malolotja Mine",
          startDate: "2024-01-01",
          endDate: "2034-01-01",
        },
        {
          id: "lease_7",
          entity: "Eswatini Minerals",
          startDate: "2022-09-10",
          endDate: "2027-09-10",
        },
      ];
      for (const lease of seedData) {
        await dbService.add("leases", lease);
      }
    }
  },

  /**
   * Determines the lease status based on its end date.
   * @param {string} endDate - The end date of the lease.
   * @returns {string} The calculated status ('Active', 'Expired', 'Expires Soon').
   */
  getLeaseStatus(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (end < now) {
      return "Expired";
    } else if (end <= thirtyDaysFromNow) {
      return "Expires Soon";
    } else {
      return "Active";
    }
  },
};

export default LeaseManagement;
