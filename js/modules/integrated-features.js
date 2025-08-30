// Import modules
import { AdvancedReportingAnalytics, ExternalServiceIntegration, AdvancedAutomation, AdvancedSearch } from './advanced-features-extended.js';
import { UserManagementModule } from './enhanced/UserManagementModule.js';
import { AdvancedCollaboration } from './advanced-features.js';

export class IntegratedFeatures {
    constructor() {
        this.reporting = new AdvancedReportingAnalytics();
        this.externalService = new ExternalServiceIntegration();
        this.automation = new AdvancedAutomation();
        this.search = new AdvancedSearch();
        this.userManagement = new UserManagementModule();
        this.collaboration = new AdvancedCollaboration();
        
        this.init();
    }

    async init() {
        try {
            await Promise.all([
                this.initializeReportingIntegration(),
                this.initializeExternalServicesIntegration(),
                this.initializeAutomationIntegration(),
                this.initializeSearchIntegration()
            ]);
        } catch (error) {
            console.error('Features integration initialization failed:', error);
            throw error;
        }
    }

    async initializeReportingIntegration() {
        // Integrate reporting with user management
        await this.reporting.initializeDataSources([{
            type: 'userManagement',
            source: this.userManagement,
            dataPoints: ['userActivity', 'roleDistribution', 'permissionUsage']
        }]);

        // Set up real-time dashboard updates
        this.reporting.createDashboard({
            widgets: [
                { type: 'userActivityMetrics', refreshInterval: 300000 },
                { type: 'securityAnalytics', refreshInterval: 600000 },
                { type: 'complianceReports', refreshInterval: 3600000 }
            ]
        });
    }

    async initializeExternalServicesIntegration() {
        // Connect essential external services
        await Promise.all([
            this.externalService.connectExternalService('identityProvider', {
                type: 'oauth2',
                endpoints: {
                    authorize: '/auth/oauth2/authorize',
                    token: '/auth/oauth2/token'
                }
            }),
            this.externalService.connectExternalService('dataWarehouse', {
                type: 'api',
                endpoint: '/api/warehouse',
                syncInterval: 3600000
            })
        ]);

        // Set up automated data synchronization
        this.externalService.syncExternalData('dataWarehouse', {
            tables: ['users', 'roles', 'permissions'],
            syncStrategy: 'incremental'
        });
    }

    async initializeAutomationIntegration() {
        // Create automation rules for user management
        await this.automation.createAutomationRule({
            trigger: {
                event: 'userCreated',
                source: 'userManagement'
            },
            conditions: [
                { field: 'role', operator: 'equals', value: 'new_user' }
            ],
            actions: [
                { type: 'sendWelcomeEmail', template: 'welcome_template' },
                { type: 'assignDefaultPermissions' },
                { type: 'createAuditLog', category: 'user_automation' }
            ]
        });

        // Schedule routine maintenance tasks
        await this.automation.scheduleAutomatedTask({
            name: 'userDataCleanup',
            schedule: '0 0 * * *', // Daily at midnight
            task: async () => {
                await this.userManagement.cleanupInactiveUsers();
                await this.reporting.generateMaintenanceReport();
            }
        });
    }

    async initializeSearchIntegration() {
        // Build search indices for user-related data
        await this.search.buildSearchIndex({
            sources: [
                { type: 'users', data: Array.from(this.userManagement.users.values()) },
                { type: 'roles', data: Array.from(this.userManagement.roles.values()) },
                { type: 'permissions', data: Array.from(this.userManagement.permissions.values()) }
            ],
            options: {
                searchableFields: ['name', 'email', 'role', 'permissions'],
                facets: ['role', 'status', 'department'],
                synonyms: {
                    'admin': ['administrator', 'superuser'],
                    'inactive': ['disabled', 'suspended']
                }
            }
        });

        // Integrate search with collaboration features
        this.search.integrateWithCollaboration(this.collaboration, {
            realTimeIndexing: true,
            searchableActivities: ['comments', 'changes', 'annotations']
        });
    }

    // Public methods for accessing integrated features
    async generateIntegratedReport(config) {
        const reportData = await Promise.all([
            this.userManagement.getUserAnalytics(),
            this.collaboration.getActivityMetrics(),
            this.automation.getAutomationMetrics()
        ]);

        return this.reporting.generateCustomReport({
            ...config,
            data: reportData,
            visualizations: true
        });
    }

    async performIntegratedSearch(query) {
        const searchResults = await this.search.performAdvancedSearch({
            query,
            context: {
                userRole: this.userManagement.getCurrentUserRole(),
                permissions: this.userManagement.getCurrentUserPermissions()
            }
        });

        return this.search.optimizeSearchResults(searchResults, {
            collaborationContext: await this.collaboration.getCollaborationContext(),
            automationRules: await this.automation.getActiveRules()
        });
    }
}
