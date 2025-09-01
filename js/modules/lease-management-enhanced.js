/**
 * @module LeaseManagementEnhanced
 * @description Advanced lease management with workflows, templates, and notifications.
 */

import { dbService } from "../services/database.service.js";
import { notificationManager } from "./NotificationManager.js";
import { ErrorHandler } from "../utils/error-handler.js";

class LeaseManagementEnhanced {
  constructor() {
    this.leases = [];
    this.leaseTemplates = [];
    this.auditTrail = [];

    this.leaseStatuses = [
      "Draft",
      "Active",
      "Expired",
      "Terminated",
    ];
  }

  async init() {
    await this.loadTemplates();
    await this.loadLeases();
    this.startMonitoring();
  }

  async loadTemplates() {
    this.leaseTemplates = [
      {
        id: "land_lease_template",
        name: "Land Lease Template",
        type: "Land",
        defaultTerms: {
          duration: 10, // years
          paymentFrequency: "Annual",
          escalationClause: "5% annually",
        },
      },
      {
        id: "equipment_lease_template",
        name: "Heavy Equipment Lease Template",
        type: "Equipment",
        defaultTerms: {
          duration: 5, // years
          paymentFrequency: "Monthly",
          maintenance: "Lessee responsibility",
        },
      },
    ];
  }

  async loadLeases() {
    this.leases = await dbService.getAll("leases");
    if (this.leases.length === 0) {
      const seedData = [
        {
          id: "lease_1",
          entity: "Kwalini Quarry",
          type: "Land",
          startDate: "2023-01-01",
          endDate: "2033-01-01",
          status: "Active",
          documents: [],
          workflow: { history: [] },
        },
        {
          id: "lease_2",
          entity: "Maloma Colliery",
          type: "Equipment",
          startDate: "2022-06-15",
          endDate: "2027-06-15",
          status: "Active",
          documents: [],
          workflow: { history: [] },
        },
      ];
      for (const lease of seedData) {
        await dbService.add("leases", lease);
      }
      this.leases = await dbService.getAll("leases");
    }
  }

  createLeaseFromTemplate(templateId, leaseData) {
    const template = this.leaseTemplates.find(t => t.id === templateId);
    if (!template) throw new Error("Template not found");

    const newLease = {
      id: `lease_${Date.now()}`,
      ...leaseData,
      type: template.type,
      terms: { ...template.defaultTerms },
      status: "Draft",
      documents: [],
      workflow: {
        currentStep: "Draft",
        history: [{
          step: "Draft",
          date: new Date().toISOString(),
          user: "current_user",
          notes: `Created from template: ${template.name}`,
        }],
      },
    };

    this.leases.push(newLease);
    dbService.add("leases", newLease);
    this.recordAuditEvent("lease_created", newLease.id, { templateUsed: templateId });
    return newLease;
  }

  async updateLease(leaseData) {
    const index = this.leases.findIndex(l => l.id === leaseData.id);
    if (index === -1) throw new Error("Lease not found");

    const originalLease = this.leases[index];
    this.leases[index] = { ...originalLease, ...leaseData };
    await dbService.put("leases", this.leases[index]);
    this.recordAuditEvent("lease_updated", leaseData.id);
    return this.leases[index];
  }

  async addLease(leaseData) {
    const newLease = {
      id: `lease_${Date.now()}`,
      ...leaseData,
      status: "Active", // simple status for now
      documents: [],
      workflow: { history: [] },
    };
    await dbService.add("leases", newLease);
    this.leases.push(newLease);
    return newLease;
  }

  attachDocument(leaseId, documentData) {
    const lease = this.leases.find(l => l.id === leaseId);
    if (!lease) throw new Error("Lease not found");

    const document = {
      id: `doc_${Date.now()}`,
      ...documentData,
      uploadDate: new Date().toISOString(),
    };

    lease.documents = lease.documents || [];
    lease.documents.push(document);
    dbService.put("leases", lease);
    this.recordAuditEvent("document_attached", leaseId, { documentName: document.name });
    return document;
  }

  startMonitoring() {
    setInterval(() => this.checkLeaseExpirations(), 24 * 60 * 60 * 1000); // Daily check
    this.checkLeaseExpirations();
  }

  checkLeaseExpirations() {
    const now = new Date();
    const warningPeriods = [90, 60, 30]; // days

    this.leases.forEach(lease => {
      if (lease.status !== "Active") return;

      const endDate = new Date(lease.endDate);
      const daysUntilExpiration = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration <= 0 && lease.status !== 'Expired') {
          lease.status = 'Expired';
          this.updateLease(lease);
          notificationManager.warning(`Lease ${lease.id} for ${lease.entity} has expired.`);
      } else {
        warningPeriods.forEach(period => {
            if (daysUntilExpiration > 0 && daysUntilExpiration <= period) {
                const alreadyNotified = lease.notifications?.some(n => n.days === period);
                if (!alreadyNotified) {
                    notificationManager.info(`Lease ${lease.id} for ${lease.entity} expires in ${period} days.`);
                    lease.notifications = lease.notifications || [];
                    lease.notifications.push({ type: 'expiration_warning', days: period, date: new Date().toISOString() });
                    this.updateLease(lease);
                }
            }
        });
      }
    });
  }

  recordAuditEvent(action, leaseId, details = {}) {
    const event = {
      id: `audit_${Date.now()}`,
      action,
      leaseId,
      timestamp: new Date().toISOString(),
      user: "current_user", // Placeholder
      details,
    };
    this.auditTrail.push(event);
  }
}

export const leaseManagementEnhanced = new LeaseManagementEnhanced();
