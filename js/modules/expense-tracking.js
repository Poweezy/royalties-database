/**
 * @module ExpenseTracking
 * @description Handles all logic for the JIB / Expense Tracking section.
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { Pagination } from "./Pagination.js";

const ExpenseTracking = {
  elements: {},
  pagination: null,

  async init() {
    console.log("Initializing Expense Tracking...");
    this.cacheDOMElements();
    this.pagination = new Pagination({
      containerSelector: "#expense-tracking-pagination",
      itemsPerPage: 5,
      onPageChange: (page) => {
        this.renderExpenses(page);
      },
    });
    this.bindEvents();
    await this.seedInitialData();
    await this.renderExpenses();
    console.log("Expense Tracking Initialized.");
  },

  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById("expense-tracking-table-body"),
      paginationContainer: document.getElementById(
        "expense-tracking-pagination",
      ),
      addExpenseBtn: document.getElementById("add-expense-btn"),
      addExpenseModal: document.getElementById("add-expense-modal"),
      modalTitle: document.querySelector("#add-expense-modal .modal-header h4"),
      saveExpenseBtn: document.getElementById("save-expense-btn"),
      closeModalBtn: document.getElementById("close-add-expense-modal-btn"),
      cancelBtn: document.getElementById("cancel-add-expense-btn"),
      addExpenseForm: document.getElementById("add-expense-form"),
      expenseDateInput: document.getElementById("expense-date"),
      expenseCategoryInput: document.getElementById("expense-category"),
      expenseDescriptionInput: document.getElementById("expense-description"),
      expenseAmountInput: document.getElementById("expense-amount"),
      expenseEntityInput: document.getElementById("expense-entity"),
      filterCategory: document.getElementById("expense-filter-category"),
      filterEntity: document.getElementById("expense-filter-entity"),
      applyFiltersBtn: document.getElementById("apply-expense-filters"),
      clearFiltersBtn: document.getElementById("clear-expense-filters"),
    };

    if (!this.elements.paginationContainer) {
      this.elements.paginationContainer = document.createElement("div");
      this.elements.paginationContainer.id = "expense-tracking-pagination";
      this.elements.tableBody.parentElement.after(
        this.elements.paginationContainer,
      );
    }
  },

  bindEvents() {
    this.elements.addExpenseBtn.addEventListener("click", () =>
      this.openModal(),
    );
    this.elements.closeModalBtn.addEventListener("click", () =>
      this.closeModal(),
    );
    this.elements.cancelBtn.addEventListener("click", () => this.closeModal());
    this.elements.addExpenseForm.addEventListener("submit", (e) =>
      this.handleFormSubmit(e),
    );

    window.addEventListener("click", (event) => {
      if (event.target === this.elements.addExpenseModal) {
        this.closeModal();
      }
    });

    this.elements.applyFiltersBtn.addEventListener("click", () => this.renderExpenses());
    this.elements.clearFiltersBtn.addEventListener("click", () => {
        this.elements.filterCategory.value = "";
        this.elements.filterEntity.value = "";
        this.renderExpenses();
    });

    document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartId = e.target.dataset.chart;
            document.querySelectorAll('.chart-container').forEach(container => {
                container.style.display = 'none';
            });
            document.getElementById(chartId).style.display = 'block';

            document.querySelectorAll('.chart-toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
  },

  openModal(expense = null) {
    this.elements.addExpenseForm.reset();
    if (expense) {
      // Edit mode
      this.elements.modalTitle.textContent = "Edit Expense";
      this.elements.saveExpenseBtn.textContent = "Update Expense";
      this.elements.addExpenseForm.dataset.editingId = expense.id;
      this.elements.expenseDateInput.value = expense.date;
      this.elements.expenseCategoryInput.value = expense.category;
      this.elements.expenseDescriptionInput.value = expense.description;
      this.elements.expenseAmountInput.value = expense.amount;
      this.elements.expenseEntityInput.value = expense.entity;
    } else {
      // Add mode
      this.elements.modalTitle.textContent = "Add New Expense";
      this.elements.saveExpenseBtn.textContent = "Save Expense";
      delete this.elements.addExpenseForm.dataset.editingId;
    }
    this.elements.addExpenseModal.style.display = "block";
  },

  closeModal() {
    this.elements.addExpenseModal.style.display = "none";
    this.elements.addExpenseForm.reset();
    delete this.elements.addExpenseForm.dataset.editingId;
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    const editingId = this.elements.addExpenseForm.dataset.editingId;
    const expenseData = {
      date: this.elements.expenseDateInput.value,
      category: this.elements.expenseCategoryInput.value,
      description: this.elements.expenseDescriptionInput.value.trim(),
      amount: parseFloat(this.elements.expenseAmountInput.value),
      entity: this.elements.expenseEntityInput.value,
      status: "Pending", // Default status, can be updated later
    };

    if (
      !expenseData.date ||
      !expenseData.category ||
      !expenseData.description ||
      isNaN(expenseData.amount) ||
      !expenseData.entity
    ) {
      showToast("Please fill in all fields correctly.", "error");
      return;
    }

    try {
      if (editingId) {
        expenseData.id = editingId;
        await dbService.put("expenses", expenseData);
        showToast("Expense updated successfully!", "success");
      } else {
        expenseData.id = `exp_${Date.now()}`;
        await dbService.add("expenses", expenseData);
        showToast("Expense added successfully!", "success");
      }
      await this.renderExpenses(1);
      this.closeModal();
    } catch (error) {
      console.error("Error saving expense:", error);
      showToast("Failed to save expense.", "error");
    }
  },

  async renderExpenses(page = 1) {
    try {
      let expenses = await dbService.getAll("expenses");

      // Populate filter dropdowns dynamically
      this.populateFilterDropdowns(expenses);

      // Apply filters
      const categoryFilter = this.elements.filterCategory.value;
      const entityFilter = this.elements.filterEntity.value;

      if (categoryFilter) {
        expenses = expenses.filter(e => e.category === categoryFilter);
      }
      if (entityFilter) {
        expenses = expenses.filter(e => e.entity === entityFilter);
      }

      expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

      const startIndex = (page - 1) * this.pagination.itemsPerPage;
      const endIndex = startIndex + this.pagination.itemsPerPage;
      const paginatedExpenses = expenses.slice(startIndex, endIndex);

      this.elements.tableBody.innerHTML = "";

      if (expenses.length === 0) {
        this.elements.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No expenses match the current filters.</td></tr>`;
      } else {
        paginatedExpenses.forEach((expense) => {
          const row = this.createExpenseRow(expense);
          this.elements.tableBody.appendChild(row);
        });
      }
      this.pagination.render(expenses.length, page);

      // Update visualization
      this.renderVisualizations(expenses);
      this.updateTotalExpenses(expenses);

    } catch (error) {
      console.error("Error rendering expenses:", error);
      showToast("Failed to load expenses.", "error");
    }
  },

  renderVisualizations(expenses) {
    this.renderCategoryChart(expenses);
    this.renderEntityChart(expenses);
    this.renderTimeSeriesChart(expenses);
  },

  renderCategoryChart(expenses) {
    const categoryData = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const totalExpenses = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);

    const chartData = {
        labels: Object.keys(categoryData),
        datasets: [{
            data: Object.values(categoryData),
            backgroundColor: ['#2563eb', '#dc2626', '#d97706', '#059669'],
        }]
    };

    const chartCanvas = document.getElementById('expense-category-chart');
    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        const value = context.parsed;
                        if (value !== null) {
                            const percentage = ((value / totalExpenses) * 100).toFixed(2);
                            label += new Intl.NumberFormat('en-SZ', { style: 'currency', currency: 'SZL' }).format(value) + ` (${percentage}%)`;
                        }
                        return label;
                    }
                }
            }
        }
    };

    const chartId = 'expenseCategoryChart';
    if (window.app.chartManager.getChart(chartId)) {
        window.app.chartManager.updateChart(chartId, chartData.labels, chartData.datasets);
    } else {
        window.app.chartManager.createChart(chartId, chartCanvas, 'doughnut', chartData, options);
    }
  },

  renderEntityChart(expenses) {
    const entityData = expenses.reduce((acc, expense) => {
        acc[expense.entity] = (acc[expense.entity] || 0) + expense.amount;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(entityData),
        datasets: [{
            label: 'Total Expenses',
            data: Object.values(entityData),
            backgroundColor: '#3b82f6',
        }]
    };

    const chartCanvas = document.getElementById('expense-entity-chart');
    const chartId = 'expenseEntityChart';
    if (window.app.chartManager.getChart(chartId)) {
        window.app.chartManager.updateChart(chartId, chartData.labels, chartData.datasets);
    } else {
        window.app.chartManager.createChart(chartId, chartCanvas, 'bar', chartData);
    }
  },

  renderTimeSeriesChart(expenses) {
    const timeSeriesData = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + expense.amount;
        return acc;
    }, {});

    const sortedDates = Object.keys(timeSeriesData).sort((a,b) => new Date(a) - new Date(b));

    const chartData = {
        labels: sortedDates,
        datasets: [{
            label: 'Daily Expenses',
            data: sortedDates.map(date => timeSeriesData[date]),
            borderColor: '#10b981',
            tension: 0.1,
            fill: false,
        }]
    };

    const chartCanvas = document.getElementById('expense-time-series-chart');
    const chartId = 'expenseTimeSeriesChart';
    const options = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                }
            }
        }
    };
    if (window.app.chartManager.getChart(chartId)) {
        window.app.chartManager.updateChart(chartId, chartData.labels, chartData.datasets);
    } else {
        window.app.chartManager.createChart(chartId, chartCanvas, 'line', chartData, options);
    }
  },

  updateTotalExpenses(expenses) {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalEl = document.getElementById('total-expenses');
    if (totalEl) {
        totalEl.textContent = `E ${total.toLocaleString('en-SZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  },

  populateFilterDropdowns(expenses) {
    const entityFilter = this.elements.filterEntity;
    const existingOptions = new Set(Array.from(entityFilter.options).map(o => o.value));
    const entities = [...new Set(expenses.map(e => e.entity))];

    entities.forEach(entity => {
      if (!existingOptions.has(entity)) {
        const option = document.createElement('option');
        option.value = entity;
        option.textContent = entity;
        entityFilter.appendChild(option);
      }
    });
  },

  createExpenseRow(expense) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", expense.id);
    const statusClass = expense.status.toLowerCase();

    row.innerHTML = `
      <td>${new Date(expense.date).toLocaleDateString()}</td>
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td>E ${expense.amount.toFixed(2)}</td>
      <td>${expense.entity}</td>
      <td><span class="status-badge ${statusClass}">${expense.status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-primary edit-btn" title="Edit Expense"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" title="Delete Expense"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;

    row
      .querySelector(".edit-btn")
      .addEventListener("click", () => this.handleEditExpense(expense.id));
    row
      .querySelector(".delete-btn")
      .addEventListener("click", () => this.handleDeleteExpense(expense.id));
    return row;
  },

  async handleEditExpense(expenseId) {
    try {
      const expense = await dbService.getById("expenses", expenseId);
      if (expense) {
        this.openModal(expense);
      } else {
        showToast("Expense not found.", "error");
      }
    } catch (error) {
      console.error("Error fetching expense for editing:", error);
      showToast("Failed to fetch expense details.", "error");
    }
  },

  async handleDeleteExpense(expenseId) {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await dbService.delete("expenses", expenseId);
        await this.renderExpenses(1);
        showToast("Expense deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting expense:", error);
        showToast("Failed to delete expense.", "error");
      }
    }
  },

  async seedInitialData() {
    const expenses = await dbService.getAll("expenses");
    if (expenses.length === 0) {
      const seedData = [
        {
          id: "exp_1",
          date: "2024-07-20",
          category: "Operational",
          description: "Fuel for machinery",
          amount: 5000.0,
          entity: "Kwalini Quarry",
          status: "Approved",
        },
        {
          id: "exp_2",
          date: "2024-07-18",
          category: "JIB",
          description: "Joint Interest Billing Q2",
          amount: 12500.0,
          entity: "Maloma Colliery",
          status: "Pending",
        },
        {
          id: "exp_3",
          date: "2024-07-15",
          category: "Administrative",
          description: "Office supplies",
          amount: 1500.0,
          entity: "Mbabane Quarry",
          status: "Approved",
        },
        {
          id: "exp_4",
          date: "2024-07-12",
          category: "Capital",
          description: "New drill bit",
          amount: 25000.0,
          entity: "Ngwenya Mine",
          status: "Pending",
        },
        {
          id: "exp_5",
          date: "2024-07-10",
          category: "Operational",
          description: "Vehicle maintenance",
          amount: 3500.0,
          entity: "Sidvokodvo Quarry",
          status: "Approved",
        },
        {
          id: "exp_6",
          date: "2024-07-05",
          category: "JIB",
          description: "Shared road maintenance",
          amount: 7500.0,
          entity: "Malolotja Mine",
          status: "Rejected",
        },
        {
          id: "exp_7",
          date: "2024-07-01",
          category: "Administrative",
          description: "Legal consultation",
          amount: 10000.0,
          entity: "Eswatini Minerals",
          status: "Approved",
        },
      ];
      for (const expense of seedData) {
        await dbService.add("expenses", expense);
      }
    }
  },
};

export default ExpenseTracking;
