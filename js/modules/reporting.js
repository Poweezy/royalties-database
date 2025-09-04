/**
 * @module Reporting
 * @description Handles all logic for generating and exporting reports.
 */
import {
  dbService
} from "../services/database.service.js";
import {
  showToast
} from "./NotificationManager.js";
import {
  EnhancedReportingService
} from "../services/enhanced-reporting.service.js";

const Reporting = {
  async init() {
    console.log("Reporting module initialized.");
    this.reportingService = new EnhancedReportingService();
    await this.reportingService.initialize();
    this.bindEvents();
    this.renderScheduledReports();
  },

  bindEvents() {
    const royaltySummaryBtn = document.querySelector(
      "#quick-reports .report-card:nth-child(1) button",
    );
    if (royaltySummaryBtn) {
      royaltySummaryBtn.addEventListener("click", () =>
        this.generateRoyaltySummary(),
      );
    }

    const entityPerformanceBtn = document.querySelector(
      "#quick-reports .report-card:nth-child(2) button",
    );
    if (entityPerformanceBtn) {
      entityPerformanceBtn.addEventListener("click", () =>
        this.generateEntityPerformanceReport(),
      );
    }

    const complianceStatusBtn = document.querySelector(
      "#quick-reports .report-card:nth-child(3) button",
    );
    if (complianceStatusBtn) {
      complianceStatusBtn.addEventListener("click", () =>
        this.generateComplianceStatusReport(),
      );
    }

    const outstandingPaymentsBtn = document.querySelector(
      "#quick-reports .report-card:nth-child(4) button",
    );
    if (outstandingPaymentsBtn) {
      outstandingPaymentsBtn.addEventListener("click", () =>
        this.generateOutstandingPaymentsReport(),
      );
    }

    // --- Custom Report Builder Listeners ---
    const customReportForm = document.getElementById("custom-report-form");
    if (customReportForm) {
      customReportForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleCustomReport();
      });
    }

    const scheduleReportBtn = document.getElementById(
      "schedule-new-report-btn",
    );
    if (scheduleReportBtn) {
      scheduleReportBtn.addEventListener("click", () =>
        this.handleScheduleReport(),
      );
    }
  },

  async handleCustomReport() {
    const reportType = document.getElementById("report-type").value;
    const period = document.getElementById("report-period").value;
    const entity = document.getElementById("report-entity").value;
    const format = document.getElementById("output-format").value;

    showToast("Generating custom report...", "info");
    try {
      const report = await this.reportingService.generateComprehensiveReport({
        type: reportType,
        period,
        entity,
        format,
      });
      showToast("Custom report generated successfully!", "success");
      // For now, just log the report to the console
      console.log("Custom Report:", report);
    } catch (error) {
      showToast("Failed to generate custom report.", "error");
      console.error(error);
    }
  },

  async handleScheduleReport() {
    // This would typically open a modal to configure the schedule
    const config = {
      reportType: "Financial Analysis",
      schedule: "Monthly",
      recipients: ["admin@example.com"],
      format: "PDF",
    };
    showToast("Scheduling report...", "info");
    try {
      const job = await this.reportingService.scheduleReport(config);
      showToast(`Report scheduled with ID: ${job.id}`, "success");
      this.renderScheduledReports();
    } catch (error) {
      showToast("Failed to schedule report.", "error");
      console.error(error);
    }
  },

  renderScheduledReports() {
    const container = document.getElementById("scheduled-reports-list");
    if (!container) return;

    const reports = this.reportingService.scheduledReports;
    if (reports.size === 0) {
      container.innerHTML = "<p>No reports scheduled.</p>";
      return;
    }

    container.innerHTML = "";
    for (const [id, job] of reports.entries()) {
      const item = document.createElement("div");
      item.className = "schedule-item";
      item.innerHTML = `
        <div class="schedule-info">
          <h6>${job.reportType}</h6>
          <p>Schedule: ${job.schedule}</p>
          <span class="status-badge active">${job.status}</span>
        </div>
        <div class="schedule-actions">
          <button class="btn btn-sm btn-secondary">Edit</button>
          <button class="btn btn-sm btn-warning">Pause</button>
          <button class="btn btn-sm btn-danger">Delete</button>
        </div>
      `;
      container.appendChild(item);
    }
  },

  /**
   * Generates a summary report of royalty records.
   * Fetches all royalty records and exports them to a CSV file.
   */
  async generateRoyaltySummary() {
    showToast("Generating Royalty Summary Report...", "info");
    try {
      const records = await dbService.getAll("royalties");
      if (records.length === 0) {
        showToast("No royalty records to export.", "warning");
        return;
      }

      // Define headers
      const headers = [
        "Entity",
        "Mineral",
        "Volume (m³)",
        "Tariff (E/m³)",
        "Royalties (E)",
        "Date",
        "Status",
      ];
      const data = [headers];

      // Add data rows
      records.forEach((rec) => {
        data.push([
          rec.entity,
          rec.mineral,
          rec.volume,
          rec.tariff,
          rec.royaltyPayment,
          new Date(rec.paymentDate).toLocaleDateString(),
          rec.status,
        ]);
      });

      // Create a new workbook and a worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Royalty Summary");

      // Trigger the download
      XLSX.writeFile(wb, "Royalty_Summary_Report.xlsx");
      showToast("Royalty Summary Report generated successfully.", "success");
    } catch (error) {
      console.error("Error generating royalty summary report:", error);
      showToast("Failed to generate report. See console for details.", "error");
    }
  },

  async generateEntityPerformanceReport() {
    showToast("Generating Entity Performance Report...", "info");
    try {
      const [royalties, contracts] = await Promise.all([
        dbService.getAll("royalties"),
        dbService.getAll("contracts"),
      ]);

      if (royalties.length === 0) {
        showToast(
          "No royalty data available for performance analysis.",
          "warning",
        );
        return;
      }

      const performanceData = {};

      // Aggregate royalty data
      royalties.forEach((r) => {
        if (!performanceData[r.entity]) {
          performanceData[r.entity] = {
            totalVolume: 0,
            totalRoyalties: 0,
            contractRate: "N/A",
          };
        }
        performanceData[r.entity].totalVolume += r.volume;
        performanceData[r.entity].totalRoyalties += r.royaltyPayment;
      });

      // Add contract data
      contracts.forEach((c) => {
        if (performanceData[c.entity]) {
          performanceData[c.entity].contractRate =
            `E ${c.royaltyRate.toFixed(2)}`;
        }
      });

      const headers = [
        "Entity",
        "Total Volume (m³)",
        "Total Royalties Paid (E)",
        "Contracted Rate (E/m³)",
      ];
      const data = [headers];

      for (const entity in performanceData) {
        const d = performanceData[entity];
        data.push([
          entity,
          d.totalVolume,
          d.totalRoyalties.toFixed(2),
          d.contractRate,
        ]);
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Entity Performance");

      XLSX.writeFile(wb, "Entity_Performance_Report.xlsx");
      showToast("Entity Performance Report generated successfully.", "success");
    } catch (error) {
      console.error("Error generating entity performance report:", error);
      showToast("Failed to generate report. See console for details.", "error");
    }
  },

  async generateComplianceStatusReport() {
    showToast("Generating Compliance Status Report...", "info");
    try {
      const [leases, contracts] = await Promise.all([
        dbService.getAll("leases"),
        dbService.getAll("contracts"),
      ]);

      const headers = ["Entity", "Item", "Status", "Expiry/End Date"];
      const data = [headers];

      leases.forEach((l) => {
        data.push([
          l.entity,
          "Lease Agreement",
          this.getLeaseStatus(l.endDate),
          new Date(l.endDate).toLocaleDateString(),
        ]);
      });

      contracts.forEach((c) => {
        data.push([
          c.entity,
          "Royalty Contract",
          this.getContractStatus(c),
          c.endDate ? new Date(c.endDate).toLocaleDateString() : "N/A",
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Compliance Status");

      XLSX.writeFile(wb, "Compliance_Status_Report.xlsx");
      showToast("Compliance Status Report generated successfully.", "success");
    } catch (error) {
      console.error("Error generating compliance status report:", error);
      showToast("Failed to generate report. See console for details.", "error");
    }
  },

  getLeaseStatus(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (end < now) return "Expired";
    if (end <= thirtyDaysFromNow) return "Expires Soon";
    return "Active";
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

  async generateOutstandingPaymentsReport() {
    showToast("Generating Outstanding Payments Report...", "info");
    try {
      const royalties = await dbService.getAll("royalties");
      const outstanding = royalties.filter(
        (r) => r.status === "Pending" || r.status === "Overdue",
      );

      if (outstanding.length === 0) {
        showToast("No outstanding payments to report.", "success");
        return;
      }

      const headers = ["Entity", "Mineral", "Amount (E)", "Due Date", "Status"];
      const data = [headers];

      outstanding.forEach((o) => {
        data.push([
          o.entity,
          o.mineral,
          o.royaltyPayment.toFixed(2),
          new Date(o.paymentDate).toLocaleDateString(),
          o.status,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Outstanding Payments");

      XLSX.writeFile(wb, "Outstanding_Payments_Report.xlsx");
      showToast(
        "Outstanding Payments Report generated successfully.",
        "success",
      );
    } catch (error) {
      console.error("Error generating outstanding payments report:", error);
      showToast("Failed to generate report. See console for details.", "error");
    }
  },
};

export default Reporting;
