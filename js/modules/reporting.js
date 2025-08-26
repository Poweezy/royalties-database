/**
 * @module Reporting
 * @description Handles all logic for generating and exporting reports.
 */
import { dbService } from '../services/database.service.js';
import { showToast } from './NotificationManager.js';

const Reporting = {

  async init() {
    console.log('Reporting module initialized.');
    this.bindEvents();
  },

  bindEvents() {
    const royaltySummaryBtn = document.querySelector('#quick-reports .report-card:first-child button');
    if (royaltySummaryBtn) {
      royaltySummaryBtn.addEventListener('click', () => this.generateRoyaltySummary());
    }
  },

  /**
   * Generates a summary report of royalty records.
   * Fetches all royalty records and exports them to a CSV file.
   */
  async generateRoyaltySummary() {
    showToast('Generating Royalty Summary Report...', 'info');
    try {
      const records = await dbService.getAll('royalties');
      if (records.length === 0) {
        showToast('No royalty records to export.', 'warning');
        return;
      }

      // Define headers
      const headers = ['Entity', 'Mineral', 'Volume (m³)', 'Tariff (E/m³)', 'Royalties (E)', 'Date', 'Status'];
      const data = [headers];

      // Add data rows
      records.forEach(rec => {
        data.push([
          rec.entity,
          rec.mineral,
          rec.volume,
          rec.tariff,
          rec.royalties,
          new Date(rec.date).toLocaleDateString(),
          rec.status
        ]);
      });

      // Create a new workbook and a worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Royalty Summary');

      // Trigger the download
      XLSX.writeFile(wb, 'Royalty_Summary_Report.xlsx');
      showToast('Royalty Summary Report generated successfully.', 'success');

    } catch (error) {
      console.error('Error generating royalty summary report:', error);
      showToast('Failed to generate report. See console for details.', 'error');
    }
  }

  // Other report generation methods will be added here
};

export default Reporting;
