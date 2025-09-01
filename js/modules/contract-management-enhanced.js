/**
 * Enhanced Contract Management Module
 * Advanced workflow, templates, and notification features
 */

import { dbService } from "../services/database.service.js";
import { notificationManager } from "./NotificationManager.js";
import { ErrorHandler } from "../utils/error-handler.js";

class ContractManagementEnhanced {
  constructor() {
    this.contracts = [];
    this.contractTemplates = [];
    this.workflows = new Map();
    this.notifications = [];
    this.auditTrail = [];

    this.contractStatuses = [
      "Draft",
      "Under Review",
      "Pending Approval",
      "Active",
      "Suspended",
      "Under Amendment",
      "Expired",
      "Terminated",
      "Cancelled",
    ];

    this.workflowSteps = {
      Draft: ["Under Review", "Cancelled"],
      "Under Review": ["Pending Approval", "Draft", "Cancelled"],
      "Pending Approval": ["Active", "Under Review", "Cancelled"],
      Active: ["Suspended", "Under Amendment", "Terminated", "Expired"],
      Suspended: ["Active", "Terminated"],
      "Under Amendment": ["Active", "Cancelled"],
      Expired: ["Terminated", "Under Review"],
      Terminated: [],
      Cancelled: [],
    };

    this.init();
  }

  async init() {
    await this.loadTemplates();
    await this.loadContracts();
    this.startNotificationMonitoring();
    this.initializeUI();
  }

  async loadTemplates() {
    // Load predefined contract templates
    this.contractTemplates = [
      {
        id: "coal_mining_template",
        name: "Coal Mining Contract Template",
        category: "Mining",
        mineralType: "Coal",
        description: "Standard template for coal mining operations",
        calculationType: "sliding_scale",
        defaultTerms: {
          duration: 25, // years
          royaltyRate: { min: 20, max: 30 },
          minimumProduction: 1000,
          environmentalBond: 500000,
          clauses: [
            "Environmental compliance requirements",
            "Safety standards and protocols",
            "Community development obligations",
            "Restoration and rehabilitation requirements",
          ],
        },
        version: "1.2",
        createdBy: "System Administrator",
        createdDate: "2024-01-01",
        isActive: true,
      },
      {
        id: "quarry_template",
        name: "Quarry Operations Template",
        category: "Quarrying",
        mineralType: "Quarried Stone",
        description: "Template for quarry and stone extraction",
        calculationType: "fixed",
        defaultTerms: {
          duration: 15,
          royaltyRate: { fixed: 15.5 },
          minimumProduction: 500,
          environmentalBond: 100000,
          clauses: [
            "Noise level compliance",
            "Dust control measures",
            "Traffic management plans",
            "Site restoration requirements",
          ],
        },
        version: "1.1",
        createdBy: "System Administrator",
        createdDate: "2024-01-01",
        isActive: true,
      },
      {
        id: "precious_metals_template",
        name: "Precious Metals Mining Template",
        category: "Mining",
        mineralType: "Gold",
        description: "High-value precious metals extraction",
        calculationType: "ad_valorem",
        defaultTerms: {
          duration: 30,
          royaltyRate: { percentage: 5 },
          minimumProduction: 10,
          environmentalBond: 2000000,
          clauses: [
            "Mercury and cyanide usage restrictions",
            "Waste management protocols",
            "Water quality monitoring",
            "Community benefit sharing agreements",
          ],
        },
        version: "1.0",
        createdBy: "System Administrator",
        createdDate: "2024-01-01",
        isActive: true,
      },
    ];
  }

  async loadContracts() {
    try {
      // Enhance existing contracts with workflow data
      this.contracts = [
        {
          id: "CONT-001",
          entity: "Kwalini Quarry",
          mineral: "Quarried Stone",
          status: "Active",
          startDate: "2024-01-01",
          endDate: "2039-01-01",
          calculationType: "fixed",
          calculationParams: { rate: 15.5 },
          templateUsed: "quarry_template",
          workflow: {
            currentStep: "Active",
            history: [
              {
                step: "Draft",
                date: "2023-11-01",
                user: "admin",
                notes: "Initial draft created",
              },
              {
                step: "Under Review",
                date: "2023-11-15",
                user: "finance",
                notes: "Legal review completed",
              },
              {
                step: "Pending Approval",
                date: "2023-12-01",
                user: "auditor",
                notes: "Financial terms approved",
              },
              {
                step: "Active",
                date: "2024-01-01",
                user: "admin",
                notes: "Contract activated",
              },
            ],
          },
          terms: {
            duration: 15,
            minimumProduction: 800,
            environmentalBond: 150000,
            renewalOptions: 2,
            penaltyRate: 0.02,
          },
          notifications: {
            expirationWarning: true,
            renewalReminder: true,
            complianceAlerts: true,
          },
          documents: [
            {
              name: "Contract Agreement.pdf",
              type: "contract",
              uploadDate: "2024-01-01",
            },
            {
              name: "Environmental Impact Assessment.pdf",
              type: "environmental",
              uploadDate: "2023-12-15",
            },
          ],
        },
        {
          id: "CONT-002",
          entity: "Maloma Colliery",
          mineral: "Coal",
          status: "Active",
          startDate: "2023-12-01",
          endDate: "2048-12-01",
          calculationType: "sliding_scale",
          calculationParams: {
            scales: [
              { from: 0, to: 50, rate: 20 },
              { from: 51, to: 100, rate: 25 },
              { from: 101, to: null, rate: 30 },
            ],
            basePrice: 50,
          },
          templateUsed: "coal_mining_template",
          workflow: {
            currentStep: "Active",
            history: [
              {
                step: "Draft",
                date: "2023-09-01",
                user: "admin",
                notes: "Created from coal mining template",
              },
              {
                step: "Under Review",
                date: "2023-10-01",
                user: "finance",
                notes: "Terms negotiated",
              },
              {
                step: "Pending Approval",
                date: "2023-11-01",
                user: "auditor",
                notes: "Environmental clearance obtained",
              },
              {
                step: "Active",
                date: "2023-12-01",
                user: "admin",
                notes: "Contract commenced",
              },
            ],
          },
          terms: {
            duration: 25,
            minimumProduction: 5000,
            environmentalBond: 1000000,
            renewalOptions: 1,
            penaltyRate: 0.025,
          },
          notifications: {
            expirationWarning: true,
            renewalReminder: true,
            complianceAlerts: true,
            productionThreshold: true,
          },
        },
      ];
    } catch (error) {
      console.error("Error loading contracts:", error);
    }
  }

  /**
   * Create contract from template
   */
  createContractFromTemplate(templateId, contractData) {
    const template = this.contractTemplates.find((t) => t.id === templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    const newContract = {
      id: this.generateContractId(),
      ...contractData,
      templateUsed: templateId,
      calculationType: template.calculationType,
      calculationParams: this.adaptCalculationParams(
        template.defaultTerms,
        contractData,
      ),
      status: "Draft",
      createdDate: new Date().toISOString(),
      createdBy: "current_user", // Would be actual user in real app
      workflow: {
        currentStep: "Draft",
        history: [
          {
            step: "Draft",
            date: new Date().toISOString(),
            user: "current_user",
            notes: `Created from template: ${template.name}`,
          },
        ],
      },
      terms: { ...template.defaultTerms },
      notifications: {
        expirationWarning: true,
        renewalReminder: true,
        complianceAlerts: true,
      },
      documents: [],
    };

    this.contracts.push(newContract);
    this.recordAuditEvent("contract_created", newContract.id, {
      templateUsed: templateId,
    });

    return newContract;
  }

  /**
   * Contract workflow management
   */
  advanceWorkflow(contractId, newStatus, notes = "", approver = null) {
    const contract = this.contracts.find((c) => c.id === contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    const currentStatus = contract.workflow.currentStep;
    const allowedTransitions = this.workflowSteps[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // Update workflow
    contract.workflow.currentStep = newStatus;
    contract.status = newStatus;
    contract.workflow.history.push({
      step: newStatus,
      date: new Date().toISOString(),
      user: approver || "current_user",
      notes: notes || `Status changed to ${newStatus}`,
    });

    // Handle status-specific actions
    this.handleStatusTransition(contract, currentStatus, newStatus);

    // Record audit event
    this.recordAuditEvent("workflow_transition", contractId, {
      from: currentStatus,
      to: newStatus,
      approver,
      notes,
    });

    // Send notifications
    this.sendWorkflowNotification(contract, newStatus);

    return contract;
  }

  handleStatusTransition(contract, fromStatus, toStatus) {
    switch (toStatus) {
      case "Active":
        // Set activation date if not already set
        if (!contract.activationDate) {
          contract.activationDate = new Date().toISOString();
        }
        // Schedule expiration notifications
        this.scheduleExpirationNotifications(contract);
        break;

      case "Expired":
        // Automatically expire contract if end date is reached
        this.handleContractExpiration(contract);
        break;

      case "Suspended":
        // Log suspension reason and create compliance alert
        this.createComplianceAlert(contract, "Contract suspended");
        break;

      case "Terminated":
        // Clear all scheduled notifications
        this.clearScheduledNotifications(contract.id);
        break;
    }
  }

  /**
   * Contract comparison tools
   */
  compareContracts(contractIds) {
    const contracts = contractIds
      .map((id) => this.contracts.find((c) => c.id === id))
      .filter(Boolean);

    if (contracts.length < 2) {
      throw new Error("At least two contracts required for comparison");
    }

    const comparison = {
      contracts: contracts.map((c) => ({
        id: c.id,
        entity: c.entity,
        mineral: c.mineral,
        status: c.status,
      })),
      fields: {},
    };

    // Compare key fields
    const fieldsToCompare = [
      "calculationType",
      "startDate",
      "endDate",
      "terms.duration",
      "terms.minimumProduction",
      "terms.environmentalBond",
    ];

    fieldsToCompare.forEach((field) => {
      comparison.fields[field] = contracts.map((contract) =>
        this.getNestedValue(contract, field),
      );
    });

    // Calculate differences
    comparison.analysis = this.analyzeContractDifferences(contracts);

    return comparison;
  }

  analyzeContractDifferences(contracts) {
    const analysis = {
      similarities: [],
      differences: [],
      recommendations: [],
    };

    // Find similar calculation types
    const calculationTypes = contracts.map((c) => c.calculationType);
    if (new Set(calculationTypes).size === 1) {
      analysis.similarities.push(
        `All contracts use ${calculationTypes[0]} calculation method`,
      );
    } else {
      analysis.differences.push("Contracts use different calculation methods");
      analysis.recommendations.push(
        "Consider standardizing calculation methods for similar minerals",
      );
    }

    // Compare durations
    const durations = contracts.map((c) => c.terms?.duration).filter(Boolean);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    if (maxDuration - minDuration > 5) {
      analysis.differences.push(
        `Contract durations vary significantly (${minDuration}-${maxDuration} years)`,
      );
      analysis.recommendations.push(
        "Review duration standardization across similar contract types",
      );
    }

    return analysis;
  }

  /**
   * Contract analytics and reporting
   */
  generateContractAnalytics() {
    const analytics = {
      totalContracts: this.contracts.length,
      statusDistribution: {},
      mineralTypeDistribution: {},
      calculationMethodDistribution: {},
      averageDuration: 0,
      expiringContracts: [],
      revenueProjections: {},
    };

    // Status distribution
    this.contractStatuses.forEach((status) => {
      analytics.statusDistribution[status] = this.contracts.filter(
        (c) => c.status === status,
      ).length;
    });

    // Mineral type distribution
    const mineralTypes = [...new Set(this.contracts.map((c) => c.mineral))];
    mineralTypes.forEach((mineral) => {
      analytics.mineralTypeDistribution[mineral] = this.contracts.filter(
        (c) => c.mineral === mineral,
      ).length;
    });

    // Calculation method distribution
    const calculationMethods = [
      ...new Set(this.contracts.map((c) => c.calculationType)),
    ];
    calculationMethods.forEach((method) => {
      analytics.calculationMethodDistribution[method] = this.contracts.filter(
        (c) => c.calculationType === method,
      ).length;
    });

    // Average duration
    const durations = this.contracts
      .map((c) => c.terms?.duration)
      .filter(Boolean);
    analytics.averageDuration = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    // Expiring contracts (within next 2 years)
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

    analytics.expiringContracts = this.contracts.filter((contract) => {
      if (!contract.endDate || contract.status !== "Active") return false;
      const endDate = new Date(contract.endDate);
      return endDate <= twoYearsFromNow;
    });

    return analytics;
  }

  /**
   * Notification system
   */
  startNotificationMonitoring() {
    // Check for notifications every day (simulated)
    setInterval(
      () => {
        this.checkExpirationNotifications();
        this.checkComplianceAlerts();
        this.checkRenewalReminders();
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours

    // Initial check
    this.checkExpirationNotifications();
    this.checkComplianceAlerts();
    this.checkRenewalReminders();
  }

  checkExpirationNotifications() {
    const now = new Date();
    const warningPeriods = [365, 180, 90, 30, 7]; // Days before expiration

    this.contracts.forEach((contract) => {
      if (contract.status !== "Active" || !contract.endDate) return;

      const endDate = new Date(contract.endDate);
      const daysUntilExpiration = Math.ceil(
        (endDate - now) / (1000 * 60 * 60 * 24),
      );

      warningPeriods.forEach((warningDays) => {
        if (
          daysUntilExpiration === warningDays &&
          contract.notifications?.expirationWarning
        ) {
          this.sendExpirationNotification(contract, daysUntilExpiration);
        }
      });
    });
  }

  sendExpirationNotification(contract, daysRemaining) {
    const notification = {
      id: Date.now(),
      type: "expiration_warning",
      title: "Contract Expiration Warning",
      message: `Contract ${contract.id} (${contract.entity}) will expire in ${daysRemaining} days`,
      contractId: contract.id,
      priority: daysRemaining <= 30 ? "high" : "medium",
      createdDate: new Date().toISOString(),
      isRead: false,
    };

    this.notifications.push(notification);
    notificationManager.warning(notification.message);
  }

  sendWorkflowNotification(contract, newStatus) {
    const notification = {
      id: Date.now(),
      type: "workflow_update",
      title: "Contract Status Updated",
      message: `Contract ${contract.id} (${contract.entity}) status changed to ${newStatus}`,
      contractId: contract.id,
      priority: "medium",
      createdDate: new Date().toISOString(),
      isRead: false,
    };

    this.notifications.push(notification);
    notificationManager.info(notification.message);
  }

  /**
   * Document management integration
   */
  attachDocument(contractId, documentData) {
    const contract = this.contracts.find((c) => c.id === contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    const document = {
      id: Date.now(),
      name: documentData.name,
      type: documentData.type || "general",
      size: documentData.size || 0,
      uploadDate: new Date().toISOString(),
      uploadedBy: "current_user",
      version: "1.0",
    };

    contract.documents = contract.documents || [];
    contract.documents.push(document);

    this.recordAuditEvent("document_attached", contractId, {
      documentName: document.name,
    });

    return document;
  }

  /**
   * Utility methods
   */
  generateContractId() {
    const year = new Date().getFullYear();
    const sequence = String(this.contracts.length + 1).padStart(3, "0");
    return `CONT-${year}-${sequence}`;
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  adaptCalculationParams(templateTerms, contractData) {
    // Adapt template calculation parameters to contract-specific data
    if (contractData.calculationType === "fixed") {
      return {
        rate:
          contractData.royaltyRate || templateTerms.royaltyRate?.fixed || 15,
      };
    }
    // Add more calculation type adaptations as needed
    return templateTerms.royaltyRate || {};
  }

  recordAuditEvent(action, contractId, details = {}) {
    const event = {
      id: Date.now(),
      action,
      contractId,
      timestamp: new Date().toISOString(),
      user: "current_user",
      details,
    };

    this.auditTrail.push(event);

    // Keep only last 1000 events
    if (this.auditTrail.length > 1000) {
      this.auditTrail = this.auditTrail.slice(-1000);
    }
  }

  scheduleExpirationNotifications(contract) {
    // In a real application, this would integrate with a job scheduler
    console.log(
      `Scheduled expiration notifications for contract ${contract.id}`,
    );
  }

  handleContractExpiration(contract) {
    // Handle automatic contract expiration
    console.log(`Contract ${contract.id} has expired automatically`);
  }

  createComplianceAlert(contract, reason) {
    const alert = {
      contractId: contract.id,
      reason,
      createdDate: new Date().toISOString(),
      severity: "warning",
    };
    console.log("Compliance alert created:", alert);
  }

  clearScheduledNotifications(contractId) {
    console.log(`Cleared scheduled notifications for contract ${contractId}`);
  }

  checkComplianceAlerts() {
    // Check for compliance issues
    console.log("Checking compliance alerts...");
  }

  checkRenewalReminders() {
    // Check for contracts that need renewal reminders
    console.log("Checking renewal reminders...");
  }

  initializeUI() {
    // Initialize contract management UI components
    console.log("Contract management UI initialized");
  }
}

export const contractManagementEnhanced = new ContractManagementEnhanced();
