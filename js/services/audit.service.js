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
        if (!this.initialized) await this.init();

        const user = authService.currentUser?.username || 'system';
        const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
        
        const event = {
            timestamp: new Date().toISOString(),
            user,
            action,
            category,
            details: detailsStr,
            status,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent
        };

        try {
            // Get last hash for the chain
            const logs = await dbService.getAll("auditLogs");
            const lastLog = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            const previousHash = lastLog ? lastLog.hash : 'initial-seed';

            // Calculate current hash
            event.hash = await this.calculateHash(event, previousHash);

            await dbService.add("auditLogs", event);
            logger.debug(`Audit: ${action} by ${user}`, event);

            window.dispatchEvent(new CustomEvent('audit_log_added', { detail: event }));
        } catch (error) {
            logger.error("Failed to save audit log", error);
        }
    }

    async calculateHash(event, previousHash) {
        const data = `${event.timestamp}|${event.user}|${event.action}|${event.details}|${previousHash}`;
        const msgUint8 = new TextEncoder().encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verifyIntegrity() {
        const logs = await dbService.getAll("auditLogs");
        logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        let previousHash = 'initial-seed';
        const failures = [];

        for (const log of logs) {
            const expectedHash = await this.calculateHash(log, previousHash);
            if (log.hash !== expectedHash) {
                failures.push({ id: log.id, action: log.action, timestamp: log.timestamp });
            }
            previousHash = log.hash;
        }

        return {
            isValid: failures.length === 0,
            failures,
            totalChecked: logs.length
        };
    }

    async getLogs(filters = {}) {
        let logs = await dbService.getAll("auditLogs");
// ... rest of search logic ...

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
