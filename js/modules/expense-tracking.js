/**
 * @module ExpenseTracking
 * @description Handles all logic for the JIB / Expense Tracking section.
 */
import { dbService } from '../services/database.service.js';
import { showToast } from './NotificationManager.js';

const ExpenseTracking = {
  elements: {},

  async init() {
    console.log('Initializing Expense Tracking...');
    this.cacheDOMElements();
    this.bindEvents();
    await this.renderExpenses();
    console.log('Expense Tracking Initialized.');
  },

  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById('expense-tracking-table-body'),
      addExpenseBtn: document.getElementById('add-expense-btn'),
      addExpenseModal: document.getElementById('add-expense-modal'),
      modalTitle: document.querySelector('#add-expense-modal .modal-header h4'),
      saveExpenseBtn: document.getElementById('save-expense-btn'),
      closeModalBtn: document.getElementById('close-add-expense-modal-btn'),
      cancelBtn: document.getElementById('cancel-add-expense-btn'),
      addExpenseForm: document.getElementById('add-expense-form'),
      expenseDateInput: document.getElementById('expense-date'),
      expenseCategoryInput: document.getElementById('expense-category'),
      expenseDescriptionInput: document.getElementById('expense-description'),
      expenseAmountInput: document.getElementById('expense-amount'),
      expenseEntityInput: document.getElementById('expense-entity'),
    };
  },

  bindEvents() {
    this.elements.addExpenseBtn.addEventListener('click', () => this.openModal());
    this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.elements.cancelBtn.addEventListener('click', () => this.closeModal());
    this.elements.addExpenseForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    window.addEventListener('click', (event) => {
      if (event.target === this.elements.addExpenseModal) {
        this.closeModal();
      }
    });
  },

  openModal(expense = null) {
    this.elements.addExpenseForm.reset();
    if (expense) {
      // Edit mode
      this.elements.modalTitle.textContent = 'Edit Expense';
      this.elements.saveExpenseBtn.textContent = 'Update Expense';
      this.elements.addExpenseForm.dataset.editingId = expense.id;
      this.elements.expenseDateInput.value = expense.date;
      this.elements.expenseCategoryInput.value = expense.category;
      this.elements.expenseDescriptionInput.value = expense.description;
      this.elements.expenseAmountInput.value = expense.amount;
      this.elements.expenseEntityInput.value = expense.entity;
    } else {
      // Add mode
      this.elements.modalTitle.textContent = 'Add New Expense';
      this.elements.saveExpenseBtn.textContent = 'Save Expense';
      delete this.elements.addExpenseForm.dataset.editingId;
    }
    this.elements.addExpenseModal.style.display = 'block';
  },

  closeModal() {
    this.elements.addExpenseModal.style.display = 'none';
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
      status: 'Pending', // Default status, can be updated later
    };

    if (!expenseData.date || !expenseData.category || !expenseData.description || isNaN(expenseData.amount) || !expenseData.entity) {
      showToast('Please fill in all fields correctly.', 'error');
      return;
    }

    try {
      if (editingId) {
        expenseData.id = editingId;
        await dbService.put('expenses', expenseData);
        showToast('Expense updated successfully!', 'success');
      } else {
        expenseData.id = `exp_${Date.now()}`;
        await dbService.add('expenses', expenseData);
        showToast('Expense added successfully!', 'success');
      }
      await this.renderExpenses();
      this.closeModal();
    } catch (error) {
      console.error('Error saving expense:', error);
      showToast('Failed to save expense.', 'error');
    }
  },

  async renderExpenses() {
    try {
      const expenses = await dbService.getAll('expenses');
      this.elements.tableBody.innerHTML = '';

      if (expenses.length === 0) {
        this.elements.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No expenses recorded.</td></tr>`;
        return;
      }

      expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

      expenses.forEach(expense => {
        const row = this.createExpenseRow(expense);
        this.elements.tableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error rendering expenses:', error);
      showToast('Failed to load expenses.', 'error');
    }
  },

  createExpenseRow(expense) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', expense.id);
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

    row.querySelector('.edit-btn').addEventListener('click', () => this.handleEditExpense(expense.id));
    row.querySelector('.delete-btn').addEventListener('click', () => this.handleDeleteExpense(expense.id));
    return row;
  },

  async handleEditExpense(expenseId) {
    try {
      const expense = await dbService.getById('expenses', expenseId);
      if (expense) {
        this.openModal(expense);
      } else {
        showToast('Expense not found.', 'error');
      }
    } catch (error) {
      console.error('Error fetching expense for editing:', error);
      showToast('Failed to fetch expense details.', 'error');
    }
  },

  async handleDeleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await dbService.delete('expenses', expenseId);
        await this.renderExpenses();
        showToast('Expense deleted successfully.', 'success');
      } catch (error) {
        console.error('Error deleting expense:', error);
        showToast('Failed to delete expense.', 'error');
      }
    }
  }
};

export default ExpenseTracking;
