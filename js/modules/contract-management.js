/**
 * @module ContractManagement
 * @description Handles all logic for the Contract Management section.
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { Pagination } from "./Pagination.js";

const ContractManagement = {
  elements: {},
  pagination: null,

  async init() {
    console.log("Initializing Contract Management...");
    this.cacheDOMElements();
    this.pagination = new Pagination({
      containerSelector: "#contract-management-pagination", // Assuming a container with this ID exists
      itemsPerPage: 5,
      onPageChange: (page) => {
        this.renderContracts(page);
      },
    });
    this.bindEvents();
    await this.seedInitialData();
    await this.renderContracts();
    console.log("Contract Management Initialized.");
  },

  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById("contract-management-table-body"),
      paginationContainer: document.getElementById(
        "contract-management-pagination",
      ),
      addContractBtn: document.getElementById("add-contract-btn"),
      addContractModal: document.getElementById("add-contract-modal"),
      modalTitle: document.querySelector(
        "#add-contract-modal .modal-header h4",
      ),
      saveContractBtn: document.getElementById("save-contract-btn"),
      closeModalBtn: document.getElementById("close-add-contract-modal-btn"),
      cancelBtn: document.getElementById("cancel-add-contract-btn"),
      addContractForm: document.getElementById("add-contract-form"),
      entityInput: document.getElementById("contract-entity"),
      rateInput: document.getElementById("royalty-rate"),
      startDateInput: document.getElementById("start-date"),
      endDateInput: document.getElementById("end-date"),
    };

    // Create pagination container if it doesn't exist
    if (!this.elements.paginationContainer) {
      this.elements.paginationContainer = document.createElement("div");
      this.elements.paginationContainer.id = "contract-management-pagination";
      this.elements.tableBody.parentElement.after(
        this.elements.paginationContainer,
      );
    }
  },

  bindEvents() {
    this.elements.addContractBtn.addEventListener("click", () =>
      this.openModal(),
    );
    this.elements.closeModalBtn.addEventListener("click", () =>
      this.closeModal(),
    );
    this.elements.cancelBtn.addEventListener("click", () => this.closeModal());
    this.elements.addContractForm.addEventListener("submit", (e) =>
      this.handleFormSubmit(e),
    );
  },

  openModal(contract = null) {
    this.elements.addContractForm.reset();
    if (contract) {
      this.elements.modalTitle.textContent = "Edit Contract";
      this.elements.saveContractBtn.textContent = "Update Contract";
      this.elements.addContractForm.dataset.editingId = contract.id;
      this.elements.entityInput.value = contract.entity;
      this.elements.rateInput.value = contract.royaltyRate;
      this.elements.startDateInput.value = contract.startDate;
      this.elements.endDateInput.value = contract.endDate || "";
    } else {
      this.elements.modalTitle.textContent = "Add New Contract";
      this.elements.saveContractBtn.textContent = "Save Contract";
      delete this.elements.addContractForm.dataset.editingId;
    }
    this.elements.addContractModal.style.display = "block";
  },

  closeModal() {
    this.elements.addContractModal.style.display = "none";
    this.elements.addContractForm.reset();
    delete this.elements.addContractForm.dataset.editingId;
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    const editingId = this.elements.addContractForm.dataset.editingId;
    const contractData = {
      entity: this.elements.entityInput.value,
      royaltyRate: parseFloat(this.elements.rateInput.value),
      startDate: this.elements.startDateInput.value,
      endDate: this.elements.endDateInput.value || null,
    };

    if (
      !contractData.entity ||
      isNaN(contractData.royaltyRate) ||
      !contractData.startDate
    ) {
      showToast("Please fill in all required fields correctly.", "error");
      return;
    }

    try {
      if (editingId) {
        contractData.id = editingId;
        await dbService.put("contracts", contractData);
        showToast("Contract updated successfully!", "success");
      } else {
        contractData.id = `contract_${Date.now()}`;
        await dbService.add("contracts", contractData);
        showToast("Contract added successfully!", "success");
      }
      await this.renderContracts(1);
      this.closeModal();
    } catch (error) {
      console.error("Error saving contract:", error);
      showToast("Failed to save contract.", "error");
    }
  },

  async renderContracts(page = 1) {
    try {
      const contracts = await dbService.getAll("contracts");
      contracts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

      const startIndex = (page - 1) * this.pagination.itemsPerPage;
      const endIndex = startIndex + this.pagination.itemsPerPage;
      const paginatedContracts = contracts.slice(startIndex, endIndex);

      this.elements.tableBody.innerHTML = "";
      if (contracts.length === 0) {
        this.elements.tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">No contracts found.</td></tr>`;
      } else {
        paginatedContracts.forEach((contract) => {
          const row = this.createContractRow(contract);
          this.elements.tableBody.appendChild(row);
        });
      }
      this.pagination.render(contracts.length, page);
    } catch (error) {
      console.error("Error rendering contracts:", error);
      showToast("Failed to load contracts.", "error");
    }
  },

  createContractRow(contract) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", contract.id);
    const status = this.getContractStatus(contract);
    const statusClass = status.toLowerCase();

    row.innerHTML = `
      <td>${contract.entity}</td>
      <td>E ${contract.royaltyRate.toFixed(2)}</td>
      <td>${new Date(contract.startDate).toLocaleDateString()}</td>
      <td><span class="status-badge ${statusClass}">${status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-primary edit-btn" title="Edit Contract"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" title="Delete Contract"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;

    row
      .querySelector(".edit-btn")
      .addEventListener("click", () => this.handleEditContract(contract.id));
    row
      .querySelector(".delete-btn")
      .addEventListener("click", () => this.handleDeleteContract(contract.id));
    return row;
  },

  async handleEditContract(contractId) {
    try {
      const contract = await dbService.getById("contracts", contractId);
      if (contract) {
        this.openModal(contract);
      } else {
        showToast("Contract not found.", "error");
      }
    } catch (error) {
      console.error("Error fetching contract for editing:", error);
      showToast("Failed to fetch contract details.", "error");
    }
  },

  async handleDeleteContract(contractId) {
    if (confirm("Are you sure you want to delete this contract?")) {
      try {
        await dbService.delete("contracts", contractId);
        await this.renderContracts(1);
        showToast("Contract deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting contract:", error);
        showToast("Failed to delete contract.", "error");
      }
    }
  },

  async seedInitialData() {
    const contracts = await dbService.getAll("contracts");
    if (contracts.length === 0) {
      const seedData = [
        {
          id: "contract_1",
          entity: "Kwalini Quarry",
          royaltyRate: 15.5,
          startDate: "2023-01-01",
          endDate: "2028-01-01",
        },
        {
          id: "contract_2",
          entity: "Mbabane Quarry",
          royaltyRate: 18.0,
          startDate: "2022-06-15",
          endDate: "2027-06-15",
        },
        {
          id: "contract_3",
          entity: "Sidvokodvo Quarry",
          royaltyRate: 16.25,
          startDate: "2023-03-01",
          endDate: null,
        },
        {
          id: "contract_4",
          entity: "Maloma Colliery",
          royaltyRate: 25.0,
          startDate: "2021-11-20",
          endDate: "2026-11-20",
        },
        {
          id: "contract_5",
          entity: "Ngwenya Mine",
          royaltyRate: 22.5,
          startDate: "2023-08-01",
          endDate: "2025-08-01",
        },
        {
          id: "contract_6",
          entity: "Malolotja Mine",
          royaltyRate: 20.0,
          startDate: "2024-01-01",
          endDate: null,
        },
        {
          id: "contract_7",
          entity: "Eswatini Minerals",
          royaltyRate: 19.75,
          startDate: "2022-09-10",
          endDate: "2024-09-10",
        },
      ];
      for (const contract of seedData) {
        await dbService.add("contracts", contract);
      }
    }
  },

  getContractStatus(contract) {
    const now = new Date();
    const start = new Date(contract.startDate);
    if (contract.endDate) {
      const end = new Date(contract.endDate);
      return now >= start && now <= end ? "Active" : "Expired";
    }
    return now >= start ? "Active" : "Pending";
  },
};

export default ContractManagement;
