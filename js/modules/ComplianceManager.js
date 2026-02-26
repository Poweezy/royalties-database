/**
 * Compliance Manager
 * Consolidates regulatory status tracking, risk assessment, and compliance reporting
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { security } from "../utils/security.js";
import { auditService } from "../services/audit.service.js";
import { Pagination } from "./Pagination.js";
import { logger } from "../utils/logger.js";

export class ComplianceManager {
    constructor() {
        this.elements = {};
        this.complianceRecords = [];
        this.riskRules = [];
        this.metrics = {
            overallScore: 0,
            openIssues: 0,
            riskLevel: 'Low'
        };
        this.initialized = false;
    }

    /**
     * Initialize Compliance Manager
     */
    async init() {
        if (this.initialized) return;

        logger.debug("Initializing Compliance Manager...");
        this.loadRiskRules();
        this.cacheDOMElements();

        await this.refreshComplianceData();

        if (this.elements.complianceTableBody) {
            this.renderComplianceStatus();
        }

        this.initialized = true;
        logger.debug("Compliance Manager Initialized.");
    }

    loadRiskRules() {
        this.riskRules = [
            { id: 'R1', name: 'Environmental Impact', threshold: 80, weight: 0.4 },
            { id: 'R2', name: 'Safety Compliance', threshold: 90, weight: 0.3 },
            { id: 'R3', name: 'Financial Accuracy', threshold: 95, weight: 0.3 }
        ];
    }

    cacheDOMElements() {
        const ids = [
            "compliance-table-body",
            "compliance-summary-score",
            "compliance-summary-issues",
            "compliance-run-audit-btn"
        ];

        ids.forEach(id => {
            this.elements[id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = document.getElementById(id);
        });
    }

    async refreshComplianceData() {
        // In a real app, this would fetch from multiple stores
        const [leases, contracts] = await Promise.all([
            dbService.getAll("leases"),
            dbService.getAll("contracts")
        ]);

        this.calculateMetrics(leases, contracts);
    }

    calculateMetrics(leases, contracts) {
        // Simplified metrics calculation
        let totalScore = 0;
        let items = 0;

        leases.forEach(l => {
            totalScore += this.getLeaseComplianceValue(l);
            items++;
        });

        contracts.forEach(c => {
            totalScore += this.getContractComplianceValue(c);
            items++;
        });

        this.metrics.overallScore = items > 0 ? Math.round(totalScore / items) : 100;
        this.metrics.openIssues = this.countIssues(leases, contracts);
        this.metrics.riskLevel = this.metrics.overallScore > 90 ? 'Low' : (this.metrics.overallScore > 75 ? 'Medium' : 'High');
    }

    getLeaseComplianceValue(lease) {
        const end = new Date(lease.endDate);
        const now = new Date();
        if (end < now) return 0;
        if (end < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) return 50;
        return 100;
    }

    getContractComplianceValue(contract) {
        return contract.status === 'Active' ? 100 : 0;
    }

    countIssues(leases, contracts) {
        let issues = 0;
        const now = new Date();
        leases.forEach(l => { if (new Date(l.endDate) < now) issues++; });
        contracts.forEach(c => { if (c.status !== 'Active') issues++; });
        return issues;
    }

    renderComplianceStatus() {
        if (this.elements.complianceSummaryScore) {
            this.elements.complianceSummaryScore.textContent = `${this.metrics.overallScore}%`;
        }
        if (this.elements.complianceSummaryIssues) {
            this.elements.complianceSummaryIssues.textContent = this.metrics.openIssues;
        }
        // Update table if needed
    }

    async runFullAudit() {
        showToast("Starting comprehensive compliance audit...", "info");
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.refreshComplianceData();
        this.renderComplianceStatus();
        showToast("Audit completed successfully", "success");

        window.dispatchEvent(new CustomEvent('complianceAuditCompleted', {
            detail: { metrics: this.metrics, timestamp: new Date().toISOString() }
        }));
    }

    async addComplianceAssessment(formData) {
        const assessmentData = {
            id: `ASMT-${Date.now()}`,
            entity: security.sanitizeInput(formData.get("assessment-entity")),
            category: security.sanitizeInput(formData.get("assessment-category")),
            score: parseInt(formData.get("assessment-score")) || 0,
            status: security.sanitizeInput(formData.get("assessment-status")),
            date: new Date().toISOString(),
            notes: security.sanitizeInput(formData.get("assessment-notes"))
        };

        try {
            await dbService.add("compliance", assessmentData);
            await auditService.log('Compliance Assessment Added', 'Compliance', { entity: assessmentData.entity, score: assessmentData.score });
            showToast("Assessment added successfully!", "success");

            window.dispatchEvent(new CustomEvent('complianceAssessmentAdded', {
                detail: { assessment: assessmentData, timestamp: new Date().toISOString() }
            }));
        } catch (error) {
            logger.error("Error adding compliance assessment:", error);
            showToast("Failed to add assessment.", "error");
        }
    }
}
