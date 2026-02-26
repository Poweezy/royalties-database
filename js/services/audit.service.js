/**
 * Audit Service
 * Centralized service for tracking all sensitive activity and state changes
 */
import { dbService } from "./database.service.js";
import { logger } from "../utils/logger.js";
import { authService } from "./auth.service.js";

class AuditService {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        logger.debug("Audit Service Initialized.");
    }

    /**
     * Log an activity
     * @param {string} action - Action performed (e.g., 'contract_created')
     * @param {string} category - Category (e.g., 'Security', 'Data', 'System')
     * @param {Object} details - Additional details
     * @param {string} status - 'Success' or 'Failed'
     */
    async log(action, category, details = {}, status = 'Success') {
        const user = authService.currentUser?.username || 'system';
        const event = {
            timestamp: new Date().toISOString(),
            user,
            action,
            category,
            details: typeof details === 'string' ? details : JSON.stringify(details),
            status,
            ipAddress: '127.0.0.1', // Mock IP
            userAgent: navigator.userAgent
        };

        try {
            await dbService.add("auditLogs", event);
            logger.debug(`Audit: ${action} by ${user}`, event);

            // Also trigger a window event for the UI to update if needed
            window.dispatchEvent(new CustomEvent('audit_log_added', { detail: event }));
        } catch (error) {
            logger.error("Failed to save audit log", error);
        }
    }

    async getLogs(filters = {}) {
        let logs = await dbService.getAll("auditLogs");

        if (filters.user) {
            logs = logs.filter(l => l.user === filters.user);
        }
        if (filters.action) {
            logs = logs.filter(l => l.action.includes(filters.action));
        }

        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

export const auditService = new AuditService();
