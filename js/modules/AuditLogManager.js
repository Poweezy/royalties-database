/**
 * @module AuditLogManager
 * @description Handles all logic for the Security Audit Log section.
 */
import { Pagination } from "./Pagination.js";
import { auditService } from "../services/audit.service.js";

export class AuditLogManager {
  constructor() {
    this.logs = [];
    this.filteredLogs = [];
    this.pagination = null;
    this.elements = {};
  }

  async initialize() {
    this.cacheDOMElements();
    this.pagination = new Pagination({
      containerSelector: "#audit-pagination",
      itemsPerPage: 15,
      onPageChange: (page) => this.render(page),
    });

    this.bindEvents();
    await this.refresh();

    // Listen for new logs
    window.addEventListener('audit_log_added', () => this.refresh());
  }

  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById("audit-log-tbody"),
      userFilter: document.getElementById("audit-filter-user"),
      actionFilter: document.getElementById("audit-filter-action"),
      applyBtn: document.getElementById("apply-audit-filters"),
      clearBtn: document.getElementById("clear-audit-filters"),
    };
  }

  bindEvents() {
    this.elements.applyBtn?.addEventListener("click", () => this.applyFilters());
    this.elements.clearBtn?.addEventListener("click", () => this.clearFilters());
  }

  async refresh() {
    this.logs = await auditService.getLogs();
    this.applyFilters();
  }

  applyFilters() {
    const user = this.elements.userFilter.value.toLowerCase();
    const action = this.elements.actionFilter.value.toLowerCase();

    this.filteredLogs = this.logs.filter((log) => {
      const userMatch = !user || log.user.toLowerCase().includes(user);
      const actionMatch = !action || log.action.toLowerCase().includes(action);
      return userMatch && actionMatch;
    });

    this.render(1);
  }

  clearFilters() {
    this.elements.userFilter.value = "";
    this.elements.actionFilter.value = "";
    this.applyFilters();
  }

  render(page = 1) {
    if (!this.elements.tableBody) return;

    const startIndex = (page - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    const paginatedLogs = this.filteredLogs.slice(startIndex, endIndex);

    this.elements.tableBody.innerHTML = paginatedLogs.length === 0
      ? `<tr><td colspan="7" class="text-center">No logs found.</td></tr>`
      : paginatedLogs.map(log => this.createRowHtml(log)).join('');

    this.pagination.render(this.filteredLogs.length, page);
  }

  createRowHtml(log) {
    return `
      <tr>
        <td>${new Date(log.timestamp).toLocaleString()}</td>
        <td>${log.user}</td>
        <td><span class="badge bg-info">${log.action}</span></td>
        <td>${log.ipAddress}</td>
        <td>${log.userAgent.split(' ')[0]}</td>
        <td><span class="badge ${log.status === 'Success' ? 'bg-success' : 'bg-danger'}">${log.status}</span></td>
        <td>${log.details}</td>
      </tr>
    `;
  }
}
