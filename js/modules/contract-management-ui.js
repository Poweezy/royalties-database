/**
 * @module ContractManagementUI
 * @description Handles all UI logic for the Enhanced Contract Management section.
 */
import { contractManagementEnhanced } from "./contract-management-enhanced.js";
import { notificationManager } from "./NotificationManager.js";
import { Pagination } from "./Pagination.js";

class ContractManagementUI {
  constructor() {
    this.elements = {};
    this.pagination = null;
    this.sortState = { key: 'startDate', direction: 'desc' };
    this.filterState = { searchTerm: '' };
  }

  init() {
    this.cacheDOMElements();
    this.pagination = new Pagination({
      containerSelector: "#contract-management-pagination",
      itemsPerPage: 5,
      onPageChange: (page) => {
        this.renderContracts(page);
      },
    });
    this.bindEvents();
    this.renderContracts();
  }

  cacheDOMElements() {
    this.elements = {
      // Main section
      section: document.getElementById("contract-management"),
      tableBody: document.getElementById("contract-management-table-body"),
      tableHeaders: document.querySelectorAll("#contract-management .data-table th[sortable]"),
      paginationContainer: document.getElementById("contract-management-pagination"),

      // Buttons
      addContractBtn: document.getElementById("add-contract-btn"),
      analyticsBtn: document.getElementById("contract-analytics-btn"),
      compareBtn: document.getElementById("compare-contracts-btn"),

      // Filter
      filterSearchInput: document.getElementById("contract-filter-search"),

      // Details View
      detailsView: document.getElementById("contract-details-view"),
      detailsContent: document.getElementById("contract-details-content"),
      closeDetailsViewBtn: document.getElementById("close-details-view-btn"),

      // Add/Edit Modal
      addContractModal: document.getElementById("add-contract-modal"),
      modalTitle: document.getElementById("contract-modal-title"),
      saveContractBtn: document.getElementById("save-contract-btn"),
      closeModalBtn: document.getElementById("close-add-contract-modal-btn"),
      cancelBtn: document.getElementById("cancel-add-contract-btn"),
      addContractForm: document.getElementById("add-contract-form"),
      contractIdInput: document.getElementById("contract-id"),
      templateSelect: document.getElementById("contract-template"),
      entityInput: document.getElementById("contract-entity"),
      mineralInput: document.getElementById("contract-mineral"),
      startDateInput: document.getElementById("start-date"),
      endDateInput: document.getElementById("end-date"),
      calcTypeSelect: document.getElementById("calculation-type"),
      calcParamsContainer: document.getElementById("calculation-params-container"),
      docUploadInput: document.getElementById("contract-document-upload"),

      // Analytics Modal
      analyticsModal: document.getElementById("contract-analytics-modal"),
      analyticsContent: document.getElementById("contract-analytics-content"),
      closeAnalyticsModalBtn: document.getElementById("close-analytics-modal-btn"),
    };
  }

  bindEvents() {
    this.elements.addContractBtn.addEventListener("click", () => this.openAddContractModal());
    this.elements.analyticsBtn.addEventListener("click", () => this.showAnalytics());
    this.elements.closeModalBtn.addEventListener("click", () => this.closeAddContractModal());
    this.elements.cancelBtn.addEventListener("click", () => this.closeAddContractModal());
    this.elements.addContractForm.addEventListener("submit", (e) => this.handleSaveContract(e));
    this.elements.closeDetailsViewBtn.addEventListener("click", () => this.closeDetailsView());
    this.elements.closeAnalyticsModalBtn.addEventListener("click", () => this.closeAnalyticsModal());
    this.elements.filterSearchInput.addEventListener("keyup", (e) => this.handleFilterChange(e));

    this.elements.tableHeaders.forEach(header => {
        header.addEventListener("click", (e) => this.handleSort(e));
    });
  }

  renderContracts(page = 1) {
    let contracts = [...contractManagementEnhanced.contracts];

    // Apply filtering
    if (this.filterState.searchTerm) {
        const term = this.filterState.searchTerm.toLowerCase();
        contracts = contracts.filter(c =>
            c.id.toLowerCase().includes(term) ||
            c.entity.toLowerCase().includes(term) ||
            c.mineral.toLowerCase().includes(term) ||
            c.status.toLowerCase().includes(term)
        );
    }

    // Apply sorting
    contracts.sort((a, b) => {
        const valA = a[this.sortState.key];
        const valB = b[this.sortState.key];
        if (valA < valB) return this.sortState.direction === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortState.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Apply pagination
    const startIndex = (page - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    const paginatedContracts = contracts.slice(startIndex, endIndex);

    this.elements.tableBody.innerHTML = "";
    if (paginatedContracts.length === 0) {
      this.elements.tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No contracts match the criteria.</td></tr>`;
    } else {
        paginatedContracts.forEach(contract => {
            const row = this.createContractRow(contract);
            this.elements.tableBody.appendChild(row);
        });
    }
    this.pagination.render(contracts.length, page);
    this.updateSortIndicators();
  }

  createContractRow(contract) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${contract.id}</td>
      <td>${contract.entity}</td>
      <td>${contract.mineral}</td>
      <td><span class="status-badge ${contract.status.toLowerCase().replace(/ /g, '-')}">${contract.status}</span></td>
      <td>${new Date(contract.startDate).toLocaleDateString()}</td>
      <td>${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-info view-btn" data-id="${contract.id}" title="View Details"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm btn-primary edit-btn" data-id="${contract.id}" title="Edit Contract"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${contract.id}" title="Delete Contract"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    row.querySelector('.view-btn').addEventListener('click', (e) => this.showContractDetails(e.currentTarget.dataset.id));
    row.querySelector('.edit-btn').addEventListener('click', (e) => this.openAddContractModal(e.currentTarget.dataset.id));
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
    this.renderContracts();
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
    this.renderContracts();
  }

  openAddContractModal(contractId = null) {
    this.elements.addContractForm.reset();
    this.populateTemplates();

    if(contractId){
        const contract = contractManagementEnhanced.contracts.find(c => c.id === contractId);
        if(contract){
            this.elements.modalTitle.textContent = "Edit Contract";
            this.elements.contractIdInput.value = contract.id;
            this.elements.entityInput.value = contract.entity;
            this.elements.mineralInput.value = contract.mineral;
            this.elements.startDateInput.value = contract.startDate;
            this.elements.endDateInput.value = contract.endDate;
            this.elements.calcTypeSelect.value = contract.calculationType;
        }
    } else {
        this.elements.modalTitle.textContent = "Create New Contract";
    }
    this.elements.addContractModal.style.display = "block";
  }

  closeAddContractModal() {
    this.elements.addContractModal.style.display = "none";
  }

  populateTemplates() {
    const templates = contractManagementEnhanced.contractTemplates;
    this.elements.templateSelect.innerHTML = `<option value="">Start from scratch</option>`;
    templates.forEach(template => {
        if(template.isActive){
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            this.elements.templateSelect.appendChild(option);
        }
    });
  }

  async handleSaveContract(event) {
    event.preventDefault();
    const contractData = {
        id: this.elements.contractIdInput.value,
        entity: this.elements.entityInput.value,
        mineral: this.elements.mineralInput.value,
        startDate: this.elements.startDateInput.value,
        endDate: this.elements.endDateInput.value,
        calculationType: this.elements.calcTypeSelect.value,
    };

    try {
        if (contractData.id) {
            await contractManagementEnhanced.updateContract(contractData);
            notificationManager.show("Contract updated successfully!", "success");
        } else {
            const templateId = this.elements.templateSelect.value;
            const newContract = contractManagementEnhanced.createContractFromTemplate(templateId, {
                entity: contractData.entity,
                mineral: contractData.mineral,
                startDate: contractData.startDate,
                endDate: contractData.endDate,
            });
            notificationManager.show(`Contract ${newContract.id} created successfully!`, "success");
        }
        this.renderContracts();
        this.closeAddContractModal();
    } catch(error) {
        notificationManager.show(`Error: ${error.message}`, "error");
    }
  }

  showContractDetails(contractId) {
    const contract = contractManagementEnhanced.contracts.find(c => c.id === contractId);
    if (!contract) return;

    let documentsHtml = '<h5>No documents attached.</h5>';
    if(contract.documents && contract.documents.length > 0) {
        documentsHtml = `
            <h5>Attached Documents</h5>
            <ul class="document-list">
                ${contract.documents.map(doc => `<li><i class="fas fa-file-alt"></i> ${doc.name} <span>(${doc.type})</span></li>`).join('')}
            </ul>
        `;
    }

    let workflowHtml = '<h5>No workflow history.</h5>';
    if(contract.workflow && contract.workflow.history.length > 0) {
        workflowHtml = `
            <h5>Workflow History</h5>
            <ul class="workflow-history">
                ${contract.workflow.history.map(item => `
                    <li>
                        <div class="workflow-step">${item.step}</div>
                        <div class="workflow-details">
                            <span>by ${item.user} on ${new Date(item.date).toLocaleDateString()}</span>
                            <p>${item.notes}</p>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    this.elements.detailsContent.innerHTML = `
        <div class="grid-2">
            <div>
                <h4>${contract.entity} - ${contract.mineral}</h4>
                <p><strong>ID:</strong> ${contract.id}</p>
                <p><strong>Status:</strong> <span class="status-badge ${contract.status.toLowerCase().replace(' ', '-')}">${contract.status}</span></p>
                <p><strong>Period:</strong> ${new Date(contract.startDate).toLocaleDateString()} - ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Ongoing'}</p>
                <p><strong>Calculation Type:</strong> ${contract.calculationType}</p>
            </div>
            <div>
                ${documentsHtml}
            </div>
        </div>
        <hr>
        ${workflowHtml}
    `;

    this.elements.detailsView.style.display = 'block';
  }

  closeDetailsView() {
      this.elements.detailsView.style.display = 'none';
  }

  showAnalytics() {
      const analytics = contractManagementEnhanced.generateContractAnalytics();
      this.elements.analyticsContent.innerHTML = `
        <div class="charts-grid">
            <div class="metric-card">
                <div class="card-header"><h3>Total Contracts</h3></div>
                <div class="card-body"><p>${analytics.totalContracts}</p></div>
            </div>
             <div class="metric-card">
                <div class="card-header"><h3>Avg. Duration (Yrs)</h3></div>
                <div class="card-body"><p>${analytics.averageDuration.toFixed(1)}</p></div>
            </div>
             <div class="metric-card">
                <div class="card-header"><h3>Expiring Soon</h3></div>
                <div class="card-body"><p>${analytics.expiringContracts.length}</p></div>
            </div>
        </div>
        <div class="charts-grid">
            <div class="analytics-chart card">
                <div class="chart-header"><h3>Status Distribution</h3></div>
                <div class="chart-container">
                    <ul>
                        ${Object.entries(analytics.statusDistribution).map(([status, count]) => `<li>${status}: ${count}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="analytics-chart card">
                <div class="chart-header"><h3>Mineral Type Distribution</h3></div>
                <div class="chart-container">
                     <ul>
                        ${Object.entries(analytics.mineralTypeDistribution).map(([mineral, count]) => `<li>${mineral}: ${count}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
      `;
      this.elements.analyticsModal.style.display = "block";
  }

  closeAnalyticsModal() {
      this.elements.analyticsModal.style.display = "none";
  }
}

export const contractManagementUI = new ContractManagementUI();
