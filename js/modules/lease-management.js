/**
 * @module LeaseManagement
 * @description Handles all logic for the Lease Management section, including
 *              displaying leases, and adding new lease agreements via a modal.
 */
import { dbService } from '../services/database.service.js';
import { showToast } from './NotificationManager.js';

const LeaseManagement = {
  // DOM element references
  elements: {
    tableBody: null,
    addLeaseBtn: null,
    addLeaseModal: null,
    closeModalBtn: null,
    cancelBtn: null,
    addLeaseForm: null,
    leaseEntityInput: null,
    leaseStartDateInput: null,
    leaseEndDateInput: null
  },

  /**
   * Initializes the Lease Management module.
   * @returns {Promise<void>}
   */
  async init() {
    console.log('Initializing Lease Management...');
    this.cacheDOMElements();
    this.bindEvents();
    await this.renderLeases();
    console.log('Lease Management Initialized.');
  },

  /**
   * Caches all necessary DOM elements for the module.
   */
  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById('lease-management-table-body'),
      addLeaseBtn: document.getElementById('add-lease-btn'),
      addLeaseModal: document.getElementById('add-lease-modal'),
      closeModalBtn: document.getElementById('close-add-lease-modal-btn'),
      cancelBtn: document.getElementById('cancel-add-lease-btn'),
      addLeaseForm: document.getElementById('add-lease-form'),
      leaseEntityInput: document.getElementById('lease-entity'),
      leaseStartDateInput: document.getElementById('lease-start-date'),
      leaseEndDateInput: document.getElementById('lease-end-date'),
    };
  },

  /**
   * Binds all event listeners for the module.
   */
  bindEvents() {
    this.elements.addLeaseBtn.addEventListener('click', () => this.openModal());
    this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.elements.cancelBtn.addEventListener('click', () => this.closeModal());
    this.elements.addLeaseForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Close modal if user clicks outside of it
    window.addEventListener('click', (event) => {
      if (event.target === this.elements.addLeaseModal) {
        this.closeModal();
      }
    });
  },

  /**
   * Opens the "Add Lease" modal.
   */
  openModal() {
    this.elements.addLeaseModal.style.display = 'block';
  },

  /**
   * Closes the "Add Lease" modal and resets the form.
   */
  closeModal() {
    this.elements.addLeaseModal.style.display = 'none';
    this.elements.addLeaseForm.reset();
  },

  /**
   * Handles the submission of the "Add Lease" form.
   * @param {Event} event - The form submission event.
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const entity = this.elements.leaseEntityInput.value.trim();
    const startDate = this.elements.leaseStartDateInput.value;
    const endDate = this.elements.leaseEndDateInput.value;

    if (!entity || !startDate || !endDate) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      showToast('End date must be after the start date.', 'error');
      return;
    }

    const newLease = {
      id: `lease_${Date.now()}`,
      entity,
      startDate,
      endDate,
      status: this.getLeaseStatus(endDate)
    };

    try {
      await dbService.add('leases', newLease);
      await this.renderLeases();
      this.closeModal();
      showToast('Lease added successfully!', 'success');
    } catch (error) {
      console.error('Error adding lease:', error);
      showToast('Failed to add lease. See console for details.', 'error');
    }
  },

  /**
   * Renders all leases from the database into the table.
   */
  async renderLeases() {
    try {
      const leases = await dbService.getAll('leases');
      this.elements.tableBody.innerHTML = ''; // Clear existing rows

      if (leases.length === 0) {
        this.elements.tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding: 2rem;">
              No lease agreements found. Click "Add Lease" to get started.
            </td>
          </tr>
        `;
        return;
      }

      leases.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

      leases.forEach(lease => {
        const row = this.createLeaseRow(lease);
        this.elements.tableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error rendering leases:', error);
      showToast('Failed to load leases. See console for details.', 'error');
    }
  },

  /**
   * Creates a table row element for a given lease object.
   * @param {object} lease - The lease object.
   * @returns {HTMLTableRowElement} The created table row element.
   */
  createLeaseRow(lease) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', lease.id);
    const status = this.getLeaseStatus(lease.endDate);
    const statusClass = status.toLowerCase().replace(' ', '-');

    row.innerHTML = `
      <td>${lease.entity}</td>
      <td>${new Date(lease.startDate).toLocaleDateString()}</td>
      <td>${new Date(lease.endDate).toLocaleDateString()}</td>
      <td><span class="status-badge ${statusClass}">${status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-primary" title="Edit Lease">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" title="Delete Lease">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    // Add event listener for the delete button
    row.querySelector('.btn-danger').addEventListener('click', () => this.handleDeleteLease(lease.id));

    return row;
  },

  /**
   * Handles the deletion of a lease.
   * @param {string} leaseId - The ID of the lease to delete.
   */
  async handleDeleteLease(leaseId) {
      if (confirm('Are you sure you want to delete this lease? This action cannot be undone.')) {
          try {
              await dbService.delete('leases', leaseId);
              await this.renderLeases();
              showToast('Lease deleted successfully.', 'success');
          } catch (error) {
              console.error('Error deleting lease:', error);
              showToast('Failed to delete lease. See console for details.', 'error');
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
      return 'Expired';
    } else if (end <= thirtyDaysFromNow) {
      return 'Expires Soon';
    } else {
      return 'Active';
    }
  }
};

export default LeaseManagement;
