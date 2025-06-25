import { AuditDashboardManager } from './ui/sectionManagers.js';

// Initialize section managers when app is ready
document.addEventListener('appReady', (e) => {
    const { dataManager, notificationManager } = e.detail;
    initializeSectionLoaders(dataManager, notificationManager);
});

function initializeSectionLoaders(dataManager, notificationManager) {
    // Setup audit dashboard loader
    document.addEventListener('loadAuditDashboard', () => {
        loadAuditDashboardSection(dataManager, notificationManager);
    });
}

async function loadAuditDashboardSection(dataManager, notificationManager) {
    try {
        const auditManager = new AuditDashboardManager(dataManager, notificationManager);
        const section = document.getElementById('audit-dashboard');
        
        if (section) {
            // Register this manager with navigation if available
            if (window.navigationManager && typeof window.navigationManager.registerSectionManager === 'function') {
                window.navigationManager.registerSectionManager('audit-dashboard', auditManager);
            }
            
            await auditManager.loadSection();
            console.log('Audit dashboard loaded successfully');
        }
    } catch (error) {
        console.error('Error loading audit dashboard:', error);
        notificationManager.show('Error loading audit dashboard', 'error');
    }
}

// Global function to allow accessing audit events from HTML
window.viewAuditDetails = function(eventId) {
    if (window.notificationManager) {
        window.notificationManager.show(`Viewing details for audit event ${eventId}`, 'info');
    }
};

export function createAuditRecord(dataManager, userData) {
    if (!dataManager || !userData) return null;
    
    const auditEntry = {
        user: userData.username,
        action: userData.action || 'System Access',
        target: userData.target || 'System',
        ipAddress: userData.ipAddress || '127.0.0.1',
        status: userData.status || 'Success',
        details: userData.details || ''
    };
    
    return dataManager.addAuditEntry(auditEntry);
}
