/**
 * @module AuditLogManager
 * @description Handles all logic for the Security Audit Log section.
 */
import { Pagination } from "./Pagination.js";

export class AuditLogManager {
  constructor() {
    this.logs = [];
    this.filteredLogs = [];
    this.pagination = null;
    this.elements = {};
    this.config = {};
  }

  async initialize(config = {}) {
    this.config = config;
    this.cacheDOMElements();
    this.pagination = new Pagination({
      containerSelector: "#audit-pagination",
      itemsPerPage: 10,
      onPageChange: (page) => {
        this.render(this.filteredLogs, page);
      },
    });
    await this.generateMockData();
    this.filteredLogs = [...this.logs];
    this.bindEvents();
    this.render();
  }

  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById("audit-log-tbody"),
      userFilter: document.getElementById("audit-filter-user"),
      actionFilter: document.getElementById("audit-filter-action"),
      dateFilter: document.getElementById("audit-filter-date"),
      applyBtn: document.getElementById("apply-audit-filters"),
      clearBtn: document.getElementById("clear-audit-filters"),
    };
  }

  bindEvents() {
    this.elements.applyBtn?.addEventListener("click", () =>
      this.applyFilters(),
    );
    this.elements.clearBtn?.addEventListener("click", () =>
      this.clearFilters(),
    );
  }

  applyFilters() {
    const user = this.elements.userFilter.value;
    const action = this.elements.actionFilter.value;
    const date = this.elements.dateFilter.value;

    this.filteredLogs = this.logs.filter((log) => {
      const userMatch = !user || log.user === user;
      const actionMatch =
        !action || log.action.toLowerCase().replace(" ", "-") === action;

      // Basic date filtering for demo purposes
      const dateMatch =
        !date ||
        (date === "today" &&
          new Date(log.timestamp).toDateString() === new Date().toDateString());
      // In a real app, 'week', 'month', etc. would be handled properly.

      return userMatch && actionMatch && dateMatch;
    });

    this.render(this.filteredLogs, 1);
  }

  clearFilters() {
    this.elements.userFilter.value = "";
    this.elements.actionFilter.value = "";
    this.elements.dateFilter.value = "today";
    this.filteredLogs = [...this.logs];
    this.render();
  }

  render(logsToRender, page = 1) {
    const logs = logsToRender || this.logs;
    if (!this.elements.tableBody) return;

    const startIndex = (page - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    this.elements.tableBody.innerHTML = "";
    if (paginatedLogs.length === 0) {
      this.elements.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No audit logs found for the selected criteria.</td></tr>`;
    } else {
      paginatedLogs.forEach((log) => {
        const row = this.createRow(log);
        this.elements.tableBody.appendChild(row);
      });
    }

    this.pagination.render(logs.length, page);
  }

  createRow(log) {
    const row = document.createElement("tr");
    const actionBadgeClass = log.action.toLowerCase().replace(" ", "-");
    const statusBadgeClass = log.status.toLowerCase();

    row.innerHTML = `
        <td>${new Date(log.timestamp).toLocaleString()}</td>
        <td>${log.user}</td>
        <td><span class="action-badge ${actionBadgeClass}">${log.action}</span></td>
        <td>${log.ipAddress}</td>
        <td>${log.userAgent}</td>
        <td><span class="status-badge ${statusBadgeClass}">${log.status}</span></td>
        <td>${log.details}</td>
    `;
    return row;
  }

  async generateMockData() {
    // In a real app, this data would come from a server or dbService
    if (this.logs.length > 0) return;

    const users = ["admin", "j.doe", "m.smith", "s.jones", "unknown"];
    const actions = [
      "Login",
      "Logout",
      "Failed Login",
      "Create User",
      "Modify User",
      "Delete User",
      "Data Access",
    ];
    const statuses = [
      "Success",
      "Failed",
      "Success",
      "Success",
      "Success",
      "Success",
      "Success",
    ];
    const agents = [
      "Chrome 121.0",
      "Firefox 123.0",
      "Safari 17.2",
      "Edge 121.0",
      "Unknown",
    ];

    for (let i = 0; i < 50; i++) {
      const userIndex = Math.floor(Math.random() * users.length);
      const actionIndex = Math.floor(Math.random() * actions.length);
      const agentIndex = Math.floor(Math.random() * agents.length);
      const status =
        actions[actionIndex] === "Failed Login"
          ? "Failed"
          : statuses[actionIndex];
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 72)); // Within last 3 days

      this.logs.push({
        timestamp: date.toISOString(),
        user: users[userIndex],
        action: actions[actionIndex],
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: agents[agentIndex],
        status: status,
        details: `User performed ${actions[actionIndex].toLowerCase()} action.`,
      });
    }

    this.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}
