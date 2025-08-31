/**
 * Access Control Configuration
 * Maps application routes to required permissions.
 */
export const sectionAccessControl = {
    'dashboard': null, // Accessible to all authenticated users
    'gis-dashboard': 'royalties.view',
    'user-management': 'users.view',
    'royalty-records': 'royalties.view',
    'contract-management': 'royalties.view',
    'lease-management': 'royalties.view',
    'expense-tracking': 'finance.view',
    'document-management': 'documents.view',
    'audit-dashboard': 'audit.view',
    'reporting-analytics': 'reports.view',
    'communication': null, // Accessible to all
    'notifications': null, // Accessible to all
    'compliance': 'compliance.manage',
    'regulatory-management': 'compliance.manage',
    'semantic-search': null, // Accessible to all
    'profile': null, // Accessible to all
    'logout': null, // Accessible to all
    'admin-panel': 'system.settings'
};
