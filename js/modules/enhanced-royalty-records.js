/**
 * @module EnhancedRoyaltyRecords
 * @description Enhanced royalty records system with advanced validation, payment calculations, and tracking
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { RoyaltyCalculator } from "./RoyaltyCalculator.js";

class EnhancedRoyaltyRecords {
  constructor() {
    this.elements = {};
    this._eventsBound = false;
    this.calculator = new RoyaltyCalculator();
    this.validationRules = this.initializeValidationRules();
    this.paymentStatuses = [
      "Draft",
      "Pending",
      "Paid",
      "Overdue",
      "Disputed",
      "Partially Paid",
    ];
    this.calculationMethods = [
      "fixed",
      "tiered",
      "sliding_scale",
      "ad_valorem",
      "percentage",
    ];
    this.currencies = ["SZL", "USD", "EUR", "ZAR"];
    this.exchangeRates = { SZL: 1.0, USD: 18.5, EUR: 20.2, ZAR: 1.1 };
    this.templates = [];
    this.notifications = [];
  }

  initializeValidationRules() {
    return {
      volume: {
        min: 0,
        max: 1000000,
        required: true,
        type: "number",
      },
      tariff: {
        min: 0,
        max: 10000,
        required: true,
        type: "number",
      },
      entity: {
        required: true,
        type: "string",
        validEntities: [
          "Kwalini Quarry",
          "Maloma Colliery",
          "Mbabane Quarry",
          "Ngwenya Mine",
          "Sidvokodvo Quarry",
        ],
      },
      mineral: {
        required: true,
        type: "string",
        validMinerals: [
          "Coal",
          "Iron Ore",
          "Quarried Stone",
          "Gravel",
          "Diamond",
          "Gold",
        ],
      },
      paymentDate: {
        required: true,
        type: "date",
        maxFutureDays: 365,
      },
      currency: {
        required: false,
        type: "string",
        validCurrencies: ["SZL", "USD", "EUR", "ZAR"],
      },
    };
  }

  async init() {
    console.log("Initializing Enhanced Royalty Records...");
    this.cacheDOMElements();
    await this.loadTemplates();
    await this.setupNotificationScheduler();
  }

  cacheDOMElements() {
    this.elements = {
      form: document.getElementById("enhanced-royalty-form"),
      saveBtn: document.getElementById("save-enhanced-royalty-btn"),
      templateBtn: document.getElementById("save-as-template-btn"),
      bulkBtn: document.getElementById("bulk-create-btn"),
      tableBody: document.getElementById("royalty-records-tbody"),
      entitySelect: document.getElementById("entity"),
      mineralSelect: document.getElementById("mineral"),
      volumeInput: document.getElementById("volume"),
      tariffInput: document.getElementById("tariff"),
      paymentDateInput: document.getElementById("payment-date"),
      currencySelect: document.getElementById("currency"),
      calculationMethodSelect: document.getElementById("calculation-method"),
      statusSelect: document.getElementById("payment-status"),
      interestRateInput: document.getElementById("interest-rate"),
      penaltyRateInput: document.getElementById("penalty-rate"),
      contractSelect: document.getElementById("contract"),
      templateSelect: document.getElementById("template-select"),
      validationSummary: document.getElementById("validation-summary"),
      calculationPreview: document.getElementById("calculation-preview"),
      // Filter elements
      filterEntitySelect: document.getElementById("filter-entity"),
      filterStatusSelect: document.getElementById("filter-status"),
      filterDateFromInput: document.getElementById("filter-date-from"),
      filterDateToInput: document.getElementById("filter-date-to"),
      applyFiltersBtn: document.getElementById("apply-enhanced-filters-btn"),
      exportBtn: document.getElementById("export-records-btn"),
      importBtn: document.getElementById("import-records-btn"),
      importInput: document.getElementById("import-input"),
    };

    if (this.elements.saveBtn && !this._eventsBound) {
      this.bindEvents();
    }
  }

  bindEvents() {
    // Form events
    this.elements.saveBtn?.addEventListener("click", (e) =>
      this.handleFormSubmit(e),
    );
    this.elements.templateBtn?.addEventListener("click", (e) =>
      this.saveAsTemplate(e),
    );
    this.elements.bulkBtn?.addEventListener("click", (e) =>
      this.showBulkCreateDialog(e),
    );

    // Real-time validation and calculation
    this.elements.volumeInput?.addEventListener("input", () =>
      this.validateAndCalculate(),
    );
    this.elements.tariffInput?.addEventListener("input", () =>
      this.validateAndCalculate(),
    );
    this.elements.entitySelect?.addEventListener("change", () =>
      this.onEntityChange(),
    );
    this.elements.mineralSelect?.addEventListener("change", () =>
      this.onMineralChange(),
    );
    this.elements.currencySelect?.addEventListener("change", () =>
      this.validateAndCalculate(),
    );
    this.elements.calculationMethodSelect?.addEventListener("change", () =>
      this.onCalculationMethodChange(),
    );
    this.elements.contractSelect?.addEventListener("change", () =>
      this.onContractChange(),
    );
    this.elements.templateSelect?.addEventListener("change", () =>
      this.loadTemplate(),
    );

    // Filter events
    this.elements.applyFiltersBtn?.addEventListener("click", () =>
      this.applyFilters(),
    );
    this.elements.exportBtn?.addEventListener("click", () =>
      this.exportRecords(),
    );
    this.elements.importBtn?.addEventListener("click", () =>
        this.elements.importInput.click(),
    );
    this.elements.importInput?.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            this.importFromExcel(e.target.files[0]);
        }
    });

    this._eventsBound = true;
    console.log("Enhanced Royalty Records events bound.");
  }

  // Advanced Validation Methods
  validateField(fieldName, value) {
    const rule = this.validationRules[fieldName];
    const errors = [];

    if (rule.required && (!value || value === "")) {
      errors.push(`${fieldName} is required`);
      return errors;
    }

    if (!value) return errors; // Skip other validations if not required and empty

    if (rule.type === "number") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push(`${fieldName} must be a valid number`);
      } else {
        if (rule.min !== undefined && numValue < rule.min) {
          errors.push(`${fieldName} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && numValue > rule.max) {
          errors.push(`${fieldName} cannot exceed ${rule.max}`);
        }
      }
    }

    if (rule.type === "date") {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push(`${fieldName} must be a valid date`);
      } else {
        if (rule.maxFutureDays) {
          const maxDate = new Date();
          maxDate.setDate(maxDate.getDate() + rule.maxFutureDays);
          if (date > maxDate) {
            errors.push(
              `${fieldName} cannot be more than ${rule.maxFutureDays} days in the future`,
            );
          }
        }
      }
    }

    if (rule.validEntities && !rule.validEntities.includes(value)) {
      errors.push(
        `${fieldName} must be one of: ${rule.validEntities.join(", ")}`,
      );
    }

    if (rule.validMinerals && !rule.validMinerals.includes(value)) {
      errors.push(
        `${fieldName} must be one of: ${rule.validMinerals.join(", ")}`,
      );
    }

    if (
      rule.validCurrencies &&
      value &&
      !rule.validCurrencies.includes(value)
    ) {
      errors.push(
        `${fieldName} must be one of: ${rule.validCurrencies.join(", ")}`,
      );
    }

    return errors;
  }

  validateBusinessRules(formData) {
    const errors = [];

    // Check volume limits based on entity type
    if (formData.entity === "Small Scale Mining" && formData.volume > 10000) {
      errors.push(
        "Small scale mining operations cannot exceed 10,000 tons per period",
      );
    }

    // Check tariff ranges based on mineral type
    const tariffRanges = {
      Coal: { min: 20, max: 50 },
      "Iron Ore": { min: 25, max: 60 },
      Diamond: { min: 100, max: 500 },
      Gold: { min: 200, max: 800 },
    };

    const range = tariffRanges[formData.mineral];
    if (range && (formData.tariff < range.min || formData.tariff > range.max)) {
      errors.push(
        `Tariff for ${formData.mineral} should be between ${range.min} and ${range.max}`,
      );
    }

    // Check contract compliance
    if (formData.contractId) {
      const contract = this.getContractById(formData.contractId);
      if (contract) {
        const compliance = this.checkContractCompliance(formData, contract);
        errors.push(...compliance.errors);
      }
    }

    // Check payment date logic
    if (formData.paymentDate) {
      const paymentDate = new Date(formData.paymentDate);
      const today = new Date();
      if (paymentDate < today && formData.status === "Pending") {
        errors.push("Payment date cannot be in the past for pending payments");
      }
    }

    return errors;
  }

  validateDataIntegrity(formData) {
    const errors = [];

    // Check for duplicate records
    if (this.isDuplicateRecord(formData)) {
      errors.push(
        "A similar record already exists for this entity, mineral, and period",
      );
    }

    // Validate calculation consistency
    const expectedPayment = this.calculateExpectedPayment(formData);
    if (Math.abs(formData.royaltyPayment - expectedPayment) > 0.01) {
      errors.push(
        `Calculated payment (${expectedPayment.toFixed(2)}) doesn't match entered payment`,
      );
    }

    return errors;
  }

  // Payment Calculation Methods
  calculateRoyaltyPayment(formData) {
    const calculations = {
      base: 0,
      penalties: 0,
      interest: 0,
      adjustments: 0,
      total: 0,
    };

    // Base calculation
    calculations.base = this.calculateBaseRoyalty(formData);

    // Penalty calculations for overdue payments
    if (formData.status === "Overdue") {
      calculations.penalties = this.calculatePenalties(
        formData,
        calculations.base,
      );
    }

    // Interest calculations for late payments
    if (this.isPaymentLate(formData)) {
      calculations.interest = this.calculateInterest(
        formData,
        calculations.base,
      );
    }

    // Currency adjustments
    if (formData.currency && formData.currency !== "SZL") {
      calculations.adjustments = this.applyCurrencyAdjustment(
        calculations.base,
        formData.currency,
      );
    }

    calculations.total =
      calculations.base +
      calculations.penalties +
      calculations.interest +
      calculations.adjustments;

    return calculations;
  }

  calculateBaseRoyalty(formData) {
    switch (formData.calculationMethod || "fixed") {
      case "fixed":
        return formData.volume * formData.tariff;
      case "tiered":
        return this.calculateTieredRoyalty(formData);
      case "sliding_scale":
        return this.calculateSlidingScaleRoyalty(formData);
      case "ad_valorem":
        return this.calculateAdValoremRoyalty(formData);
      case "percentage":
        return this.calculatePercentageRoyalty(formData);
      default:
        return formData.volume * formData.tariff;
    }
  }

  calculateTieredRoyalty(formData) {
    const contract = this.getContractById(formData.contractId);
    if (contract && contract.calculationParams?.tiers) {
      return this.calculator.calculateTiered(contract, {
        volume: formData.volume,
      });
    }
    return formData.volume * formData.tariff;
  }

  calculateSlidingScaleRoyalty(formData) {
    const contract = this.getContractById(formData.contractId);
    if (contract && contract.calculationParams?.scales) {
      return this.calculator.calculateSlidingScale(contract, {
        volume: formData.volume,
        commodityPrice: formData.commodityPrice || 50,
      });
    }
    return formData.volume * formData.tariff;
  }

  calculateAdValoremRoyalty(formData) {
    // Ad valorem (percentage of value) calculation
    const marketValue =
      formData.marketValue || formData.volume * formData.commodityPrice;
    const rate = formData.adValoremRate || 0.05; // 5% default
    return marketValue * rate;
  }

  calculatePercentageRoyalty(formData) {
    // Percentage of production value
    const grossValue =
      formData.grossValue || formData.volume * formData.unitPrice;
    const rate = formData.percentageRate || 0.1; // 10% default
    return grossValue * rate;
  }

  calculatePenalties(formData, baseAmount) {
    const penaltyRate = formData.penaltyRate || 0.02; // 2% default
    const daysPastDue = this.getDaysPastDue(formData.paymentDate);

    if (daysPastDue <= 0) return 0;

    // Progressive penalty calculation
    let penalty = 0;
    if (daysPastDue <= 30) {
      penalty = baseAmount * penaltyRate;
    } else if (daysPastDue <= 90) {
      penalty = baseAmount * (penaltyRate * 2);
    } else {
      penalty = baseAmount * (penaltyRate * 3);
    }

    return penalty;
  }

  calculateInterest(formData, baseAmount) {
    const interestRate = (formData.interestRate || 0.12) / 365; // Daily rate
    const daysPastDue = this.getDaysPastDue(formData.paymentDate);

    if (daysPastDue <= 0) return 0;

    // Compound interest calculation
    return baseAmount * Math.pow(1 + interestRate, daysPastDue) - baseAmount;
  }

  applyCurrencyAdjustment(amount, currency) {
    if (currency === "SZL") return 0;

    const rate = this.exchangeRates[currency] || 1;
    return amount * rate - amount;
  }

  // Payment Tracking Methods
  async updatePaymentStatus(recordId, newStatus, partialAmount = 0) {
    const record = await dbService.getById("royalties", recordId);
    if (!record) {
      throw new Error("Record not found");
    }

    const oldStatus = record.status;
    record.status = newStatus;
    record.lastUpdated = new Date().toISOString();

    if (newStatus === "Partially Paid") {
      record.partialPayments = record.partialPayments || [];
      record.partialPayments.push({
        amount: partialAmount,
        date: new Date().toISOString(),
        recordedBy: this.getCurrentUser(),
      });
      record.remainingAmount =
        record.royaltyPayment - this.getTotalPartialPayments(record);
    }

    // Add status change to history
    record.statusHistory = record.statusHistory || [];
    record.statusHistory.push({
      from: oldStatus,
      to: newStatus,
      date: new Date().toISOString(),
      changedBy: this.getCurrentUser(),
      notes: `Status changed from ${oldStatus} to ${newStatus}`,
    });

    await dbService.update("royalties", record);
    await this.logStatusChange(record, oldStatus, newStatus);

    return record;
  }

  async processPaymentReconciliation(records) {
    const results = [];

    for (const record of records) {
      try {
        const bankRecord = await this.matchBankRecord(record);
        if (bankRecord) {
          const reconciled = await this.reconcilePayment(record, bankRecord);
          results.push({ record, reconciled, status: "success" });
        } else {
          results.push({ record, reconciled: false, status: "no_match" });
        }
      } catch (error) {
        results.push({ record, error: error.message, status: "error" });
      }
    }

    return results;
  }

  // Enhanced Features
  async saveAsTemplate(event) {
    event.preventDefault();

    const formData = this.getFormData();
    const templateName = prompt("Enter template name:");

    if (!templateName) return;

    const template = {
      id: Date.now(),
      name: templateName,
      data: {
        entity: formData.entity,
        mineral: formData.mineral,
        tariff: formData.tariff,
        calculationMethod: formData.calculationMethod,
        currency: formData.currency,
        interestRate: formData.interestRate,
        penaltyRate: formData.penaltyRate,
      },
      createdDate: new Date().toISOString(),
      createdBy: this.getCurrentUser(),
    };

    this.templates.push(template);
    await this.saveTemplates();
    await this.populateTemplateSelect();

    showToast("Template saved successfully!", "success");
  }

  async loadTemplate() {
    const templateId = parseInt(this.elements.templateSelect.value);
    const template = this.templates.find((t) => t.id === templateId);

    if (!template) return;

    // Populate form with template data
    Object.keys(template.data).forEach((key) => {
      const element =
        this.elements[key + "Input"] || this.elements[key + "Select"];
      if (element) {
        element.value = template.data[key];
      }
    });

    this.validateAndCalculate();
    showToast("Template loaded successfully!", "success");
  }

  async createBulkRecords(bulkData) {
    const results = [];
    const errors = [];

    for (let i = 0; i < bulkData.length; i++) {
      const recordData = bulkData[i];
      try {
        // Validate each record
        const fieldErrors = this.validateAllFields(recordData);
        const businessErrors = this.validateBusinessRules(recordData);
        const integrityErrors = this.validateDataIntegrity(recordData);

        const allErrors = [
          ...fieldErrors,
          ...businessErrors,
          ...integrityErrors,
        ];

        if (allErrors.length > 0) {
          errors.push({ row: i + 1, errors: allErrors });
          continue;
        }

        // Calculate payment details
        const calculations = this.calculateRoyaltyPayment(recordData);
        recordData.royaltyPayment = calculations.total;
        recordData.calculationBreakdown = calculations;
        recordData.recordedDate = new Date().toISOString().split("T")[0];
        recordData.status = recordData.status || "Draft";

        const savedRecord = await dbService.add("royalties", recordData);
        results.push(savedRecord);
      } catch (error) {
        errors.push({ row: i + 1, errors: [error.message] });
      }
    }

    return { results, errors };
  }

  async schedulePaymentNotifications() {
    const records = await dbService.getAll("royalties");
    const upcomingDue = records.filter((record) => {
      if (record.status === "Paid") return false;

      const dueDate = new Date(record.paymentDate);
      const today = new Date();
      const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      return daysDiff <= 7 && daysDiff >= 0; // Due within 7 days
    });

    for (const record of upcomingDue) {
      await this.createNotification({
        type: "payment_due",
        recordId: record.id,
        message: `Payment due for ${record.entity} - ${record.mineral}`,
        dueDate: record.paymentDate,
        severity: "warning",
      });
    }
  }

  // UI Methods
  validateAndCalculate() {
    const formData = this.getFormData();

    // Validate all fields
    const fieldErrors = this.validateAllFields(formData);
    const businessErrors = this.validateBusinessRules(formData);

    this.displayValidationResults([...fieldErrors, ...businessErrors]);

    // Calculate and display preview
    if (fieldErrors.length === 0) {
      const calculations = this.calculateRoyaltyPayment(formData);
      this.displayCalculationPreview(calculations);
    }
  }

  displayValidationResults(errors) {
    if (!this.elements.validationSummary) return;

    if (errors.length === 0) {
      this.elements.validationSummary.innerHTML =
        '<span class="text-success">✓ All validations passed</span>';
      this.elements.validationSummary.className = "validation-summary success";
    } else {
      const errorHtml = errors.map((error) => `<li>${error}</li>`).join("");
      this.elements.validationSummary.innerHTML = `
                <strong>Validation Errors:</strong>
                <ul>${errorHtml}</ul>
            `;
      this.elements.validationSummary.className = "validation-summary error";
    }
  }

  displayCalculationPreview(calculations) {
    if (!this.elements.calculationPreview) return;

    const currency = this.elements.currencySelect?.value || "SZL";

    this.elements.calculationPreview.innerHTML = `
            <div class="calculation-breakdown">
                <h5>Payment Calculation Preview</h5>
                <table class="table table-sm">
                    <tr><td>Base Payment:</td><td>${currency} ${calculations.base.toFixed(2)}</td></tr>
                    ${calculations.penalties > 0 ? `<tr><td>Penalties:</td><td>${currency} ${calculations.penalties.toFixed(2)}</td></tr>` : ""}
                    ${calculations.interest > 0 ? `<tr><td>Interest:</td><td>${currency} ${calculations.interest.toFixed(2)}</td></tr>` : ""}
                    ${calculations.adjustments !== 0 ? `<tr><td>Currency Adjustment:</td><td>${currency} ${calculations.adjustments.toFixed(2)}</td></tr>` : ""}
                    <tr class="font-weight-bold"><td>Total Payment:</td><td>${currency} ${calculations.total.toFixed(2)}</td></tr>
                </table>
            </div>
        `;
  }

  // Event Handlers
  async handleFormSubmit(event) {
    event.preventDefault();
    console.log("Handling enhanced royalty form submission...");

    const formData = this.getFormData();

    // Comprehensive validation
    const fieldErrors = this.validateAllFields(formData);
    const businessErrors = this.validateBusinessRules(formData);
    const integrityErrors = this.validateDataIntegrity(formData);

    const allErrors = [...fieldErrors, ...businessErrors, ...integrityErrors];

    if (allErrors.length > 0) {
      this.displayValidationResults(allErrors);
      showToast("Please fix validation errors before saving.", "error");
      return;
    }

    try {
      // Calculate payment details
      const calculations = this.calculateRoyaltyPayment(formData);
      formData.royaltyPayment = calculations.total;
      formData.calculationBreakdown = calculations;
      formData.recordedDate = new Date().toISOString().split("T")[0];
      formData.lastUpdated = new Date().toISOString();

      await dbService.add("royalties", formData);
      showToast("Enhanced Royalty Record saved successfully!", "success");

      this.elements.form.reset();
      await this.renderRecords();

      // Schedule notifications if needed
      if (formData.status === "Pending") {
        await this.schedulePaymentNotifications();
      }
    } catch (error) {
      console.error("Error saving enhanced royalty record:", error);
      showToast("Failed to save record. See console for details.", "error");
    }
  }

  // Utility Methods
  getFormData() {
    return {
      entity: this.elements.entitySelect?.value || "",
      mineral: this.elements.mineralSelect?.value || "",
      volume: parseFloat(this.elements.volumeInput?.value || 0),
      tariff: parseFloat(this.elements.tariffInput?.value || 0),
      paymentDate: this.elements.paymentDateInput?.value || "",
      currency: this.elements.currencySelect?.value || "SZL",
      calculationMethod:
        this.elements.calculationMethodSelect?.value || "fixed",
      status: this.elements.statusSelect?.value || "Draft",
      interestRate: parseFloat(this.elements.interestRateInput?.value || 0.12),
      penaltyRate: parseFloat(this.elements.penaltyRateInput?.value || 0.02),
      contractId: parseInt(this.elements.contractSelect?.value || 0),
    };
  }

  validateAllFields(formData) {
    const errors = [];

    Object.keys(this.validationRules).forEach((fieldName) => {
      const fieldErrors = this.validateField(fieldName, formData[fieldName]);
      errors.push(...fieldErrors);
    });

    return errors;
  }

  getDaysPastDue(paymentDate) {
    const due = new Date(paymentDate);
    const today = new Date();
    return Math.ceil((today - due) / (1000 * 60 * 60 * 24));
  }

  isPaymentLate(formData) {
    return this.getDaysPastDue(formData.paymentDate) > 0;
  }

  getContractById(contractId) {
    return window.app?.state?.contracts?.find((c) => c.id === contractId);
  }

  getCurrentUser() {
    return window.app?.state?.currentUser?.username || "system";
  }

  // Placeholder methods for additional functionality
  async loadTemplates() {
    /* Implementation for loading saved templates */
  }
  async saveTemplates() {
    /* Implementation for saving templates */
  }
  async populateTemplateSelect() {
    /* Implementation for populating template dropdown */
  }
  isDuplicateRecord(formData) {
    /* Implementation for duplicate checking */ return false;
  }
  calculateExpectedPayment(formData) {
    /* Implementation for expected payment calculation */ return 0;
  }
  checkContractCompliance(formData, contract) {
    /* Implementation for contract compliance */ return { errors: [] };
  }
  getTotalPartialPayments(record) {
    /* Implementation for calculating total partial payments */ return 0;
  }
  async logStatusChange(record, oldStatus, newStatus) {
    /* Implementation for audit logging */
  }
  async matchBankRecord(record) {
    /* Implementation for bank record matching */ return null;
  }
  async reconcilePayment(record, bankRecord) {
    /* Implementation for payment reconciliation */ return false;
  }
  async createNotification(notification) {
    /* Implementation for creating notifications */
  }
  async setupNotificationScheduler() {
    /* Implementation for setting up notification scheduler */
  }
  onEntityChange() {
    /* Implementation for entity change handler */
  }
  onMineralChange() {
    /* Implementation for mineral change handler */
  }
  onCalculationMethodChange() {
    /* Implementation for calculation method change handler */
  }
  onContractChange() {
    /* Implementation for contract change handler */
  }
  showBulkCreateDialog(event) {
    /* Implementation for bulk create dialog */
  }
  applyFilters() {
    /* Implementation for applying filters */
  }
  async renderRecords(filter = null) {
    this.cacheDOMElements();

    console.log("Rendering royalty records...");
    if (!this.elements.tableBody) {
      console.error("Royalty records table body not found. Cannot render.");
      return;
    }
    this.elements.tableBody.innerHTML = ""; // Clear existing records

    let records = await dbService.getAll("royalties");

    if (filter) {
      if (filter.status) {
        records = records.filter((record) => record.status === filter.status);
      }
      if (filter.entity && filter.entity !== "All Entities") {
        records = records.filter((record) => record.entity === filter.entity);
      }
    }

    if (!records || records.length === 0) {
      const message = filter
        ? `No records found matching your criteria.`
        : "No royalty records found.";
      this.elements.tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">${message}</td></tr>`;
      return;
    }

    records.forEach((record) => {
      const row = this.createRecordRow(record);
      this.elements.tableBody.appendChild(row);
    });
    console.log("Finished rendering royalty records.");
  }

  createRecordRow(record) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", record.id);
    const statusClass = record.status ? record.status.toLowerCase() : "unknown";
    row.innerHTML = `
      <td>${record.entity}</td>
      <td>${record.mineral}</td>
      <td>${(record.volume || 0).toFixed(2)}</td>
      <td>E ${(record.tariff || 0).toFixed(2)}</td>
      <td>E ${(record.royaltyPayment || 0).toFixed(2)}</td>
      <td>${record.paymentDate}</td>
      <td><span class="status-badge ${statusClass}">${record.status}</span></td>
      <td>
        <button class="btn btn-sm btn-info" title="View Details"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-warning" title="Edit Record"><i class="fas fa-edit"></i></button>
      </td>
    `;
    return row;
  }
  exportRecords() {
    if (
      this.elements.tableBody.rows.length === 1 &&
      this.elements.tableBody.rows[0].cells.length === 1
    ) {
      showToast("There is no data to export.", "warning");
      return;
    }

    const table = this.elements.tableBody.parentElement; // Get the <table> element
    if (!table) {
      showToast("Could not find table to export.", "error");
      return;
    }

    // Use XLSX to create a workbook from the table
    const wb = XLSX.utils.table_to_book(table, { sheet: "Royalty Records" });

    // Trigger the download
    XLSX.writeFile(wb, "Royalty_Records_Export.xlsx");
    showToast("Report exported successfully!", "success");
  }

  async importFromExcel(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const records = XLSX.utils.sheet_to_json(firstSheet);

        if (records.length === 0) {
          showToast("No records found in the file.", "warning");
          return;
        }

        let importedCount = 0;
        for (const record of records) {
          // Basic validation to ensure required fields exist
          if (record.Entity && record.Mineral && record.Volume && record.Tariff && record.Date) {
            const newRecord = {
              entity: record.Entity,
              mineral: record.Mineral,
              volume: parseFloat(record.Volume),
              tariff: parseFloat(record.Tariff),
              paymentDate: record.Date,
              royaltyPayment: parseFloat(record.Volume) * parseFloat(record.Tariff),
              status: record.Status || "Paid",
            };
            await dbService.add("royalties", newRecord);
            importedCount++;
          }
        }

        if (importedCount > 0) {
          showToast(`${importedCount} records imported successfully!`, "success");
          await this.renderRecords();
        } else {
          showToast("Could not import any records. Please check the file format.", "error");
        }
      } catch (error) {
        console.error("Error importing records:", error);
        showToast("Failed to import records. See console for details.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

export default new EnhancedRoyaltyRecords();
