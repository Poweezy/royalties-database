/**
 * @module RoyaltyRecords
 * @description Handles all logic for the Royalty Records section.
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";

const RoyaltyRecords = {
  elements: {},
  _eventsBound: false,

  async init() {
    console.log("Initializing Royalty Records...");
    // Initial render is deferred until the section is shown
  },

  cacheDOMElements() {
    this.elements = {
      form: document
        .getElementById("save-royalty-btn")
        ?.closest(".user-form-container")
        .querySelector("form"),
      saveBtn: document.getElementById("save-royalty-btn"),
      tableBody: document.getElementById("royalty-records-tbody"),
      entitySelect: document.getElementById("entity"),
      mineralSelect: document.getElementById("mineral"),
      volumeInput: document.getElementById("volume"),
      tariffInput: document.getElementById("tariff"),
      paymentDateInput: document.getElementById("payment-date"),
      filterEntitySelect: document.getElementById("filter-entity"),
      applyFiltersBtn: document.getElementById("apply-royalty-filters-btn"),
      exportBtn: document.getElementById("export-royalty-report-btn"),
      importBtn: document.getElementById("import-royalty-csv-btn"),
      importInput: document.getElementById("royalty-csv-input"),
    };

    // If elements are found and events haven't been bound, bind them.
    if (this.elements.saveBtn && !this._eventsBound) {
      this.bindEvents();
    }
  },

  bindEvents() {
    this.elements.saveBtn.addEventListener("click", (e) =>
      this.handleFormSubmit(e),
    );
    this.elements.entitySelect.addEventListener("change", () =>
      this.updateTariffForSelection(),
    );
    this.elements.mineralSelect.addEventListener("change", () =>
      this.updateTariffForSelection(),
    );
    this.elements.applyFiltersBtn.addEventListener("click", () => {
      const selectedEntity = this.elements.filterEntitySelect.value;
      this.renderRecords({ entity: selectedEntity });
    });
    this.elements.exportBtn.addEventListener("click", () =>
      this.exportToCSV(),
    );
    this.elements.importBtn.addEventListener("click", () =>
      this.elements.importInput.click(),
    );
    this.elements.importInput.addEventListener("change", (e) =>
      this.importFromCSV(e.target.files[0]),
    );
    this._eventsBound = true;
    console.log("Royalty Records events bound.");
  },

  updateTariffForSelection() {
    const selectedEntity = this.elements.entitySelect.value;
    const selectedMineral = this.elements.mineralSelect.value;
    const { contracts } = window.app.state;

    if (!selectedEntity || !selectedMineral) {
      this.elements.tariffInput.value = "";
      this.elements.tariffInput.readOnly = false;
      return;
    }

    const matchingContract = contracts.find(
      (c) =>
        c.entity === selectedEntity &&
        c.mineral === selectedMineral &&
        c.calculationType === "fixed",
    );

    if (matchingContract) {
      this.elements.tariffInput.value =
        matchingContract.calculationParams.rate.toFixed(2);
      this.elements.tariffInput.readOnly = true;
    } else {
      this.elements.tariffInput.value = "";
      this.elements.tariffInput.readOnly = false;
    }
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    console.log("Handling royalty form submission...");

    const formData = {
      entity: this.elements.entitySelect.value,
      mineral: this.elements.mineralSelect.value,
      volume: parseFloat(this.elements.volumeInput.value),
      tariff: parseFloat(this.elements.tariffInput.value),
      paymentDate: this.elements.paymentDateInput.value,
      // The rest of the fields are calculated
    };

    // Basic Validation
    if (
      !formData.entity ||
      !formData.mineral ||
      isNaN(formData.volume) ||
      isNaN(formData.tariff) ||
      !formData.paymentDate
    ) {
      showToast("Please fill all fields correctly.", "error");
      return;
    }

    // Calculation
    formData.royaltyPayment = formData.volume * formData.tariff;
    formData.recordedDate = new Date().toISOString().split("T")[0]; // Today's date
    formData.status = "Paid"; // Default status

    try {
      await dbService.add("royalties", formData);
      showToast("Royalty Record saved successfully!", "success");
      this.elements.form.reset();
      await this.renderRecords(); // Refresh the table
    } catch (error) {
      console.error("Error saving royalty record:", error);
      showToast("Failed to save record. See console for details.", "error");
    }
  },

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
  },

  createRecordRow(record) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", record.id);
    const statusClass = record.status ? record.status.toLowerCase() : "unknown";
    row.innerHTML = `
      <td>${record.entity}</td>
      <td>${record.mineral}</td>
      <td>${record.volume.toFixed(2)}</td>
      <td>E ${record.tariff.toFixed(2)}</td>
      <td>E ${record.royaltyPayment.toFixed(2)}</td>
      <td>${record.paymentDate}</td>
      <td><span class="status-badge ${statusClass}">${record.status}</span></td>
      <td>
        <button class="btn btn-sm btn-info" title="View Details"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-warning" title="Edit Record"><i class="fas fa-edit"></i></button>
      </td>
    `;
    return row;
  },

  async exportToCSV() {
    const records = await dbService.getAll("royalties");
    if (records.length === 0) {
      showToast("There is no data to export.", "warning");
      return;
    }
    const data = records.map(r => ({
        Entity: r.entity,
        Mineral: r.mineral,
        Volume: r.volume,
        Tariff: r.tariff,
        RoyaltyPayment: r.royaltyPayment,
        PaymentDate: r.paymentDate,
        Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Royalty Records");
    XLSX.writeFile(wb, "Royalty_Records_Export.xlsx");
    showToast("Records exported successfully!", "success");
  },

  importFromCSV(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          showToast("The selected file is empty.", "warning");
          return;
        }

        let recordsAdded = 0;
        for (const record of json) {
          // Basic validation to ensure required fields exist
          if (record.Entity && record.Mineral && record.Volume && record.Tariff && record.PaymentDate) {
            const newRecord = {
              entity: record.Entity,
              mineral: record.Mineral,
              volume: parseFloat(record.Volume),
              tariff: parseFloat(record.Tariff),
              paymentDate: record.PaymentDate,
              royaltyPayment: parseFloat(record.Volume) * parseFloat(record.Tariff),
              status: record.Status || "Paid",
            };
            await dbService.add("royalties", newRecord);
            recordsAdded++;
          }
        }
        showToast(`${recordsAdded} records imported successfully!`, "success");
        this.renderRecords();
      } catch (error) {
        console.error("Error importing records:", error);
        showToast("Failed to import file. Make sure it's a valid CSV or XLSX file.", "error");
      } finally {
        // Reset file input to allow re-uploading the same file
        this.elements.importInput.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  }
};

export default RoyaltyRecords;
