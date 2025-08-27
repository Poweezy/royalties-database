/**
 * @module RoyaltyRecords
 * @description Handles all logic for the Royalty Records section.
 */
import { dbService } from '../services/database.service.js';
import { showToast } from './NotificationManager.js';

const RoyaltyRecords = {
  elements: {},

  async init() {
    console.log('Initializing Royalty Records...');
    this.cacheDOMElements();
    this.bindEvents();
    await this.renderRecords();
    console.log('Royalty Records Initialized.');
  },

  cacheDOMElements() {
    this.elements = {
      form: document.getElementById('save-royalty-btn').closest('.user-form-container').querySelector('form'), // A bit fragile, but works for now
      saveBtn: document.getElementById('save-royalty-btn'),
      tableBody: document.getElementById('royalty-records-tbody'),
      entitySelect: document.getElementById('entity'),
      mineralSelect: document.getElementById('mineral'),
      volumeInput: document.getElementById('volume'),
      tariffInput: document.getElementById('tariff'),
      paymentDateInput: document.getElementById('payment-date'),
    };
  },

  bindEvents() {
    this.elements.saveBtn.addEventListener('click', (e) => this.handleFormSubmit(e));
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    console.log('Handling royalty form submission...');

    const formData = {
      entity: this.elements.entitySelect.value,
      mineral: this.elements.mineralSelect.value,
      volume: parseFloat(this.elements.volumeInput.value),
      tariff: parseFloat(this.elements.tariffInput.value),
      paymentDate: this.elements.paymentDateInput.value,
      // The rest of the fields are calculated
    };

    // Basic Validation
    if (!formData.entity || !formData.mineral || isNaN(formData.volume) || isNaN(formData.tariff) || !formData.paymentDate) {
      showToast('Please fill all fields correctly.', 'error');
      return;
    }

    // Calculation
    formData.royaltyPayment = formData.volume * formData.tariff;
    formData.recordedDate = new Date().toISOString().split('T')[0]; // Today's date
    formData.status = 'Paid'; // Default status

    try {
      await dbService.add('royalties', formData);
      showToast('Royalty Record saved successfully!', 'success');
      this.elements.form.reset();
      await this.renderRecords(); // Refresh the table
    } catch (error) {
      console.error('Error saving royalty record:', error);
      showToast('Failed to save record. See console for details.', 'error');
    }
  },

  async renderRecords() {
    console.log('Rendering royalty records...');
    this.elements.tableBody.innerHTML = ''; // Clear existing records

    const records = await dbService.getAll('royalties');

    if (!records || records.length === 0) {
      this.elements.tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">No royalty records found.</td></tr>`;
      return;
    }

    records.forEach(record => {
      const row = this.createRecordRow(record);
      this.elements.tableBody.appendChild(row);
    });
    console.log('Finished rendering royalty records.');
  },

  createRecordRow(record) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', record.id);
    row.innerHTML = `
      <td>${record.id}</td>
      <td>${record.entity}</td>
      <td>${record.mineral}</td>
      <td>${record.volume.toFixed(2)}</td>
      <td>$${record.tariff.toFixed(2)}</td>
      <td>$${record.royaltyPayment.toFixed(2)}</td>
      <td>${record.paymentDate}</td>
      <td><span class="status ${record.status.toLowerCase()}">${record.status}</span></td>
    `;
    return row;
  }
};

export default RoyaltyRecords;
