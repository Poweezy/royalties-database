/**
 * @module RoyaltyRecordsUI
 * @description Handles all UI logic for the Enhanced Royalty Records section.
 */
import enhancedRoyaltyRecords from "./enhanced-royalty-records.js";
import {
  showToast
} from "./NotificationManager.js";

class RoyaltyRecordsUI {
  constructor() {
    this.elements = {};
  }

  init() {
    enhancedRoyaltyRecords.init();
    this.cacheDOMElements();
    this.bindEvents();
    this.populateSelects();
    this.renderRecords();
  }

  cacheDOMElements() {
    this.elements = enhancedRoyaltyRecords.elements;
  }

  bindEvents() {
    enhancedRoyaltyRecords.bindEvents();
  }

  populateSelects() {
    const {
      entitySelect,
      mineralSelect,
      currencySelect,
      calculationMethodSelect,
      statusSelect,
      filterEntitySelect,
      filterStatusSelect,
    } = this.elements;

    this.populateSelect(
      entitySelect,
      enhancedRoyaltyRecords.validationRules.entity.validEntities,
    );
    this.populateSelect(
      mineralSelect,
      enhancedRoyaltyRecords.validationRules.mineral.validMinerals,
    );
    this.populateSelect(
      currencySelect,
      enhancedRoyaltyRecords.validationRules.currency.validCurrencies,
    );
    this.populateSelect(
      calculationMethodSelect,
      enhancedRoyaltyRecords.calculationMethods,
    );
    this.populateSelect(statusSelect, enhancedRoyaltyRecords.paymentStatuses);
    this.populateSelect(
      filterEntitySelect,
      enhancedRoyaltyRecords.validationRules.entity.validEntities,
    );
    this.populateSelect(
      filterStatusSelect,
      enhancedRoyaltyRecords.paymentStatuses,
    );
  }

  populateSelect(selectElement, options) {
    if (!selectElement) return;
    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      selectElement.appendChild(opt);
    });
  }

  async renderRecords(filter = null) {
    console.log("renderRecords called");
    const tableBody = this.elements.tableBody;
    if (!tableBody) return;

    await dbService.init();
    // This is a mock implementation. In a real app, you would fetch from a service.
    const records = await dbService.getAll("royalties");

    tableBody.innerHTML = "";
    if (records.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No royalty records found.</td></tr>`;
      return;
    }

    records.forEach((record) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${record.entity}</td>
        <td>${record.mineral}</td>
        <td>${record.volume}</td>
        <td>${record.tariff}</td>
        <td>${record.royaltyPayment || record.tariff * record.volume}</td>
        <td>${new Date(record.paymentDate).toLocaleDateString()}</td>
        <td><span class="status-badge ${record.status?.toLowerCase() || 'unknown'}">${record.status || 'Unknown'}</span></td>
        <td>
          <div class="btn-group">
            <button class="btn btn-sm btn-info view-btn" data-id="${record.id}" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn btn-sm btn-primary edit-btn" data-id="${record.id}" title="Edit Record"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${record.id}" title="Delete Record"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
}

export const royaltyRecordsUI = new RoyaltyRecordsUI();
