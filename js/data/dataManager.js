// Data Management Module

export class DataManager {
    constructor() {
        this.entities = [];
        this.minerals = [];
        this.royaltyRecords = [];
        this.userAccounts = [];
        this.auditLog = [];
        this.contracts = [];
        this.complianceData = {};
        this.reportingData = {};
        this.communicationData = {};
        this.notificationsData = {};
        this.regulatoryData = {};
        this.profileData = {};
    }

    initialize() {
        this.initializeEntities();
        this.initializeMinerals();
        this.initializeRoyaltyRecords();
        this.initializeUserAccounts();
        this.initializeAuditLog();
        this.initializeContracts();
        this.initializeComplianceData();
        this.initializeReportingData();
        this.initializeCommunicationData();
        this.initializeNotificationsData();
        this.initializeRegulatoryData();
        this.initializeProfileData();
    }

    initializeEntities() {
        this.entities = [
            { id: 1, name: 'Kwalini Quarry', type: 'Quarry', location: 'Kwaluseni', status: 'Active' },
            { id: 2, name: 'Maloma Colliery', type: 'Mine', location: 'Maloma', status: 'Active' },
            { id: 3, name: 'Ngwenya Mine', type: 'Mine', location: 'Ngwenya', status: 'Active' },
            { id: 4, name: 'Mbabane Quarry', type: 'Quarry', location: 'Mbabane', status: 'Active' },
            { id: 5, name: 'Sidvokodvo Quarry', type: 'Quarry', location: 'Sidvokodvo', status: 'Active' },
            { id: 6, name: 'Piggs Peak Mine', type: 'Mine', location: 'Piggs Peak', status: 'Inactive' }
        ];
    }

    initializeMinerals() {
        this.minerals = [
            { id: 1, name: 'Coal', tariff: 12, unit: 'per tonne' },
            { id: 2, name: 'Iron Ore', tariff: 25, unit: 'per tonne' },
            { id: 3, name: 'Quarried Stone', tariff: 15, unit: 'per m³' },
            { id: 4, name: 'River Sand', tariff: 8, unit: 'per m³' },
            { id: 5, name: 'Gravel', tariff: 10, unit: 'per m³' },
            { id: 6, name: 'Clay', tariff: 5, unit: 'per tonne' }
        ];
    }

    initializeRoyaltyRecords() {
        this.royaltyRecords = [
            {
                id: 1,
                entity: 'Kwalini Quarry',
                mineral: 'Quarried Stone',
                volume: 1250,
                tariff: 15,
                royalties: 18750,
                date: '2024-01-15',
                status: 'Paid',
                referenceNumber: 'ROY-2024-001'
            },
            {
                id: 2,
                entity: 'Maloma Colliery',
                mineral: 'Coal',
                volume: 850,
                tariff: 12,
                royalties: 10200,
                date: '2024-01-20',
                status: 'Pending',
                referenceNumber: 'ROY-2024-002'
            },
            {
                id: 3,
                entity: 'Ngwenya Mine',
                mineral: 'Iron Ore',
                volume: 2100,
                tariff: 25,
                royalties: 52500,
                date: '2024-01-25',
                status: 'Paid',
                referenceNumber: 'ROY-2024-003'
            },
            {
                id: 4,
                entity: 'Mbabane Quarry',
                mineral: 'Gravel',
                volume: 750,
                tariff: 10,
                royalties: 7500,
                date: '2024-02-01',
                status: 'Overdue',
                referenceNumber: 'ROY-2024-004'
            },
            {
                id: 5,
                entity: 'Sidvokodvo Quarry',
                mineral: 'River Sand',
                volume: 500,
                tariff: 8,
                royalties: 4000,
                date: '2024-02-05',
                status: 'Paid',
                referenceNumber: 'ROY-2024-005'
            },
            {
                id: 6,
                entity: 'Kwalini Quarry',
                mineral: 'Quarried Stone',
                volume: 980,
                tariff: 15,
                royalties: 14700,
                date: '2024-02-08',
                status: 'Pending',
                referenceNumber: 'ROY-2024-006'
            }
        ];
    }

    initializeUserAccounts() {
        this.userAccounts = [
            {
                id: 1,
                username: 'admin',
                fullname: 'Administrator User',
                email: 'admin@eswacaa.sz',
                phone: '+268 7612 1001',
                role: 'Administrator',
                department: 'Management',
                employeeId: 'EMP001',
                status: 'Active',
                lastLogin: '2024-02-10 09:15:00',
                failedAttempts: 0,
                expires: null,
                created: '2023-01-15',
                permissions: ['read', 'write', 'delete', 'admin', 'audit', 'finance', 'export'],
                preferences: {
                    language: 'en',
                    timezone: 'Africa/Mbabane',
                    dateFormat: 'DD/MM/YYYY',
                    emailNotifications: true,
                    systemNotifications: true,
                    loginAlerts: false
                },
                security: {
                    twoFactorEnabled: false,
                    forcePasswordChange: false,
                    lastPasswordChange: '2023-01-15'
                }
            },
            {
                id: 2,
                username: 'editor',
                fullname: 'Finance Editor',
                email: 'editor@eswacaa.sz',
                phone: '+268 7612 1002',
                role: 'Editor',
                department: 'Finance',
                employeeId: 'EMP002',
                status: 'Active',
                lastLogin: '2024-02-09 14:30:00',
                failedAttempts: 0,
                expires: '2024-12-31',
                created: '2023-03-20',
                permissions: ['read', 'write', 'finance', 'export'],
                preferences: {
                    language: 'en',
                    timezone: 'Africa/Mbabane',
                    dateFormat: 'DD/MM/YYYY',
                    emailNotifications: true,
                    systemNotifications: true,
                    loginAlerts: true
                },
                security: {
                    twoFactorEnabled: true,
                    forcePasswordChange: false,
                    lastPasswordChange: '2024-01-15'
                }
            },
            {
                id: 3,
                username: 'viewer',
                fullname: 'Audit Viewer',
                email: 'viewer@eswacaa.sz',
                phone: '+268 7612 1003',
                role: 'Viewer',
                department: 'Audit',
                employeeId: 'EMP003',
                status: 'Active',
                lastLogin: '2024-02-08 11:45:00',
                failedAttempts: 1,
                expires: '2024-12-31',
                created: '2023-06-10',
                permissions: ['read', 'audit'],
                preferences: {
                    language: 'en',
                    timezone: 'Africa/Mbabane',
                    dateFormat: 'YYYY-MM-DD',
                    emailNotifications: false,
                    systemNotifications: true,
                    loginAlerts: false
                },
                security: {
                    twoFactorEnabled: false,
                    forcePasswordChange: true,
                    lastPasswordChange: '2023-06-10'
                }
            },
            {
                id: 4,
                username: 'auditor',
                fullname: 'Senior Auditor',
                email: 'auditor@eswacaa.sz',
                phone: '+268 7612 1004',
                role: 'Auditor',
                department: 'Audit',
                employeeId: 'EMP004',
                status: 'Active',
                lastLogin: '2024-02-07 16:20:00',
                failedAttempts: 0,
                expires: '2025-06-30',
                created: '2023-08-15',
                permissions: ['read', 'audit', 'export'],
                preferences: {
                    language: 'en',
                    timezone: 'Africa/Mbabane',
                    dateFormat: 'DD/MM/YYYY',
                    emailNotifications: true,
                    systemNotifications: true,
                    loginAlerts: true
                },
                security: {
                    twoFactorEnabled: true,
                    forcePasswordChange: false,
                    lastPasswordChange: '2024-02-01'
                }
            },
            {
                id: 5,
                username: 'finance_mgr',
                fullname: 'Finance Manager',
                email: 'finance@eswacaa.sz',
                phone: '+268 7612 1005',
                role: 'Finance',
                department: 'Finance',
                employeeId: 'EMP005',
                status: 'Inactive',
                lastLogin: '2024-01-28 10:15:00',
                failedAttempts: 0,
                expires: '2024-12-31',
                created: '2023-04-10',
                permissions: ['read', 'write', 'finance', 'export'],
                preferences: {
                    language: 'en',
                    timezone: 'Africa/Mbabane',
                    dateFormat: 'MM/DD/YYYY',
                    emailNotifications: true,
                    systemNotifications: false,
                    loginAlerts: true
                },
                security: {
                    twoFactorEnabled: false,
                    forcePasswordChange: false,
                    lastPasswordChange: '2023-12-15'
                }
            }
        ];
    }

    initializeAuditLog() {
        this.auditLog = [
            {
                id: 1,
                timestamp: '2024-02-10 09:15:23',
                user: 'admin',
                action: 'Login',
                target: 'System',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Successful login from administrative workstation'
            },
            {
                id: 2,
                timestamp: '2024-02-10 09:20:15',
                user: 'admin',
                action: 'Create User',
                target: 'editor',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Created new user account for Finance department'
            },
            {
                id: 3,
                timestamp: '2024-02-09 14:30:45',
                user: 'editor',
                action: 'Data Access',
                target: 'Royalty Records',
                ipAddress: '192.168.1.105',
                status: 'Success',
                details: 'Accessed monthly royalty reports for January 2024'
            },
            {
                id: 4,
                timestamp: '2024-02-09 11:22:33',
                user: 'viewer',
                action: 'Failed Login',
                target: 'System',
                ipAddress: '192.168.1.108',
                status: 'Failed',
                details: 'Failed login attempt - incorrect password'
            },
            {
                id: 5,
                timestamp: '2024-02-08 16:45:12',
                user: 'admin',
                action: 'Modify User',
                target: 'viewer',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Updated user permissions for audit department'
            }
        ];
    }

    initializeContracts() {
        this.contracts = [
            {
                id: 'MC-2024-001',
                stakeholder: 'Government of Eswatini',
                stakeholderType: 'government',
                entity: 'Maloma Colliery',
                contractType: 'Mining License Agreement',
                calculationMethod: 'ad-valorem',
                royaltyRate: '2.5% of gross value',
                baseRate: 2.5,
                rateType: 'percentage',
                startDate: '2024-01-01',
                endDate: '2029-12-31',
                status: 'active',
                totalValue: 15500000,
                paymentSchedule: 'monthly',
                paymentDue: 15,
                lateFeeRate: 2.0,
                gracePeriod: 30,
                escalationClause: {
                    enabled: true,
                    frequency: 'annual',
                    rate: 2.5,
                    nextEscalation: '2025-03-15'
                },
                conditions: [
                    'Environmental compliance required',
                    'Quarterly production reports mandatory',
                    'Safety standards certification'
                ],
                signedDate: '2023-12-15',
                lastReview: '2024-01-01',
                nextReview: '2025-01-01'
            },
            {
                id: 'LC-2024-002',
                stakeholder: 'Mhlume Holdings Ltd',
                stakeholderType: 'private',
                entity: 'Ngwenya Mine',
                contractType: 'Private Land Lease',
                calculationMethod: 'profit-based',
                royaltyRate: '15% of net profit',
                baseRate: 15.0,
                rateType: 'percentage',
                startDate: '2024-03-15',
                endDate: '2027-03-14',
                status: 'active',
                totalValue: 8200000,
                paymentSchedule: 'quarterly',
                paymentDue: 'end-of-quarter',
                lateFeeRate: 1.5,
                gracePeriod: 14,
                escalationClause: {
                    enabled: false
                },
                conditions: [
                    'Land restoration fund contribution',
                    'Community development levy',
                    'Water usage monitoring'
                ],
                signedDate: '2024-02-28',
                lastReview: '2024-03-15',
                nextReview: '2025-03-15'
            },
            {
                id: 'LO-2024-003',
                stakeholder: 'Magwegwe Community Trust',
                stakeholderType: 'landowner',
                entity: 'Piggs Peak Quarry',
                contractType: 'Landowner Royalty Agreement',
                calculationMethod: 'quantity-based',
                royaltyRate: 'E 12 per tonne',
                baseRate: 12.0,
                rateType: 'fixed-amount',
                startDate: '2024-06-01',
                endDate: '2025-05-31',
                status: 'pending-renewal',
                totalValue: 2800000,
                paymentSchedule: 'monthly',
                paymentDue: 1,
                lateFeeRate: 3.0,
                gracePeriod: 7,
                escalationClause: {
                    enabled: true,
                    frequency: 'annual',
                    rate: 3.0,
                    nextEscalation: '2025-06-01'
                },
                conditions: [
                    'Traditional land usage rights respected',
                    'Local employment priority',
                    'Cultural heritage site protection'
                ],
                signedDate: '2024-05-15',
                lastReview: '2024-06-01',
                nextReview: '2025-01-01'
            },
            {
                id: 'JV-2024-004',
                stakeholder: 'Sikhupe Mining Consortium',
                stakeholderType: 'joint-venture',
                entity: 'Sidvokodvo Quarry',
                contractType: 'Joint Venture Agreement',
                calculationMethod: 'hybrid',
                royaltyRate: '2% + E 8 per tonne',
                baseRate: 2.0,
                fixedAmount: 8.0,
                rateType: 'hybrid',
                startDate: '2024-02-01',
                endDate: '2029-01-31',
                status: 'active',
                totalValue: 18700000,
                paymentSchedule: 'quarterly',
                paymentDue: 'end-of-quarter',
                lateFeeRate: 2.5,
                gracePeriod: 21,
                escalationClause: {
                    enabled: true,
                    frequency: 'biennial',
                    rate: 1.5,
                    nextEscalation: '2026-02-01'
                },
                conditions: [
                    'Joint environmental management',
                    'Shared infrastructure maintenance',
                    'Technology transfer requirements',
                    'Local content requirements'
                ],
                signedDate: '2024-01-15',
                lastReview: '2024-02-01',
                nextReview: '2025-02-01'
            }
        ];
    }

    initializeComplianceData() {
        this.complianceData = {
            reports: [
                {
                    id: 1,
                    title: 'Environmental Impact Assessment',
                    entity: 'Maloma Colliery',
                    type: 'Environmental',
                    status: 'Compliant',
                    lastReview: '2024-01-15',
                    nextReview: '2024-07-15',
                    score: 95,
                    priority: 'High'
                },
                {
                    id: 2,
                    title: 'Safety Standards Audit',
                    entity: 'Ngwenya Mine',
                    type: 'Safety',
                    status: 'Non-Compliant',
                    lastReview: '2024-02-01',
                    nextReview: '2024-03-01',
                    score: 68,
                    priority: 'Critical'
                },
                {
                    id: 3,
                    title: 'Financial Reporting Compliance',
                    entity: 'Kwalini Quarry',
                    type: 'Financial',
                    status: 'Compliant',
                    lastReview: '2024-02-10',
                    nextReview: '2024-05-10',
                    score: 88,
                    priority: 'Medium'
                }
            ],
            regulations: [
                {
                    id: 1,
                    name: 'Mining Act 2023',
                    category: 'Mining Operations',
                    effectiveDate: '2023-01-01',
                    status: 'Active',
                    compliance: 92
                },
                {
                    id: 2,
                    name: 'Environmental Protection Act',
                    category: 'Environmental',
                    effectiveDate: '2022-06-01',
                    status: 'Active',
                    compliance: 85
                }
            ]
        };
    }

    initializeReportingData() {
        this.reportingData = {
            monthlyReports: [
                {
                    id: 1,
                    month: 'January 2024',
                    totalRoyalties: 107650,
                    entities: 6,
                    compliance: 94,
                    status: 'Published'
                },
                {
                    id: 2,
                    month: 'February 2024',
                    totalRoyalties: 95420,
                    entities: 6,
                    compliance: 91,
                    status: 'Draft'
                }
            ],
            analytics: {
                revenueByEntity: {
                    'Maloma Colliery': 52500,
                    'Ngwenya Mine': 25200,
                    'Kwalini Quarry': 18750,
                    'Others': 11200
                },
                complianceByType: {
                    'Environmental': 85,
                    'Safety': 78,
                    'Financial': 95,
                    'Operational': 88
                }
            }
        };
    }

    initializeCommunicationData() {
        this.communicationData = {
            messages: [
                {
                    id: 1,
                    from: 'Ministry of Natural Resources',
                    to: 'ESWACAA',
                    subject: 'New Mining Regulation Update',
                    date: '2024-02-10',
                    status: 'Unread',
                    priority: 'High',
                    type: 'Official'
                },
                {
                    id: 2,
                    from: 'Maloma Colliery',
                    to: 'ESWACAA',
                    subject: 'Monthly Production Report Submission',
                    date: '2024-02-08',
                    status: 'Read',
                    priority: 'Medium',
                    type: 'Report'
                }
            ],
            templates: [
                {
                    id: 1,
                    name: 'Compliance Notice',
                    category: 'Regulatory',
                    usage: 45
                },
                {
                    id: 2,
                    name: 'Payment Reminder',
                    category: 'Financial',
                    usage: 32
                }
            ]
        };
    }

    initializeNotificationsData() {
        this.notificationsData = {
            active: [
                {
                    id: 1,
                    title: 'Payment Overdue',
                    message: 'Mbabane Quarry payment is 5 days overdue',
                    type: 'warning',
                    date: '2024-02-10',
                    entity: 'Mbabane Quarry',
                    priority: 'High'
                },
                {
                    id: 2,
                    title: 'Compliance Review Due',
                    message: 'Environmental assessment due for Ngwenya Mine',
                    type: 'info',
                    date: '2024-02-09',
                    entity: 'Ngwenya Mine',
                    priority: 'Medium'
                },
                {
                    id: 3,
                    title: 'Contract Expiring',
                    message: 'Landowner agreement expires in 30 days',
                    type: 'warning',
                    date: '2024-02-08',
                    entity: 'Piggs Peak Quarry',
                    priority: 'High'
                }
            ],
            settings: {
                emailNotifications: true,
                smsNotifications: false,
                systemAlerts: true,
                reminderFrequency: 'daily'
            }
        };
    }

    initializeRegulatoryData() {
        this.regulatoryData = {
            frameworks: [
                {
                    id: 1,
                    name: 'National Mining Policy Framework',
                    category: 'Policy',
                    status: 'Active',
                    lastUpdate: '2023-12-01',
                    compliance: 88
                },
                {
                    id: 2,
                    name: 'Royalty Collection Standards',
                    category: 'Financial',
                    status: 'Under Review',
                    lastUpdate: '2024-01-15',
                    compliance: 92
                }
            ],
            assessments: [
                {
                    id: 1,
                    entity: 'Maloma Colliery',
                    framework: 'Mining Operations Standard',
                    score: 85,
                    status: 'Compliant',
                    lastAssessment: '2024-01-20'
                }
            ]
        };
    }

    initializeProfileData() {
        this.profileData = {
            personalInfo: {
                fullName: 'System Administrator',
                email: 'admin@eswacaa.sz',
                phone: '+268 2404 2000',
                department: 'Management',
                position: 'System Administrator',
                employeeId: 'EMP001',
                joinDate: '2023-01-15'
            },
            security: {
                lastPasswordChange: '2024-01-01',
                twoFactorEnabled: false,
                loginSessions: 3,
                lastLogin: '2024-02-10 09:15:00'
            },
            preferences: {
                language: 'English',
                timezone: 'Africa/Mbabane',
                theme: 'Light',
                notifications: true
            }
        };
    }

    // Data access methods
    getEntities() { return this.entities; }
    getMinerals() { return this.minerals; }
    getRoyaltyRecords() { return this.royaltyRecords; }
    getUserAccounts() { return this.userAccounts; }
    getAuditLog() { return this.auditLog; }
    getContracts() { return this.contracts; }
    getComplianceData() { return this.complianceData; }
    getReportingData() { return this.reportingData; }
    getCommunicationData() { return this.communicationData; }
    getNotificationsData() { return this.notificationsData; }
    getRegulatoryData() { return this.regulatoryData; }
    getProfileData() { return this.profileData; }

    // Data manipulation methods
    addAuditEntry(entry) {
        this.auditLog.unshift({
            id: this.auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            ...entry
        });
    }

    deleteUser(userId) {
        const index = this.userAccounts.findIndex(u => u.id === userId);
        if (index !== -1) {
            return this.userAccounts.splice(index, 1)[0];
        }
        return null;
    }

    findUserById(userId) {
        return this.userAccounts.find(u => u.id === userId);
    }

    findRecordById(recordId) {
        return this.royaltyRecords.find(r => r.id === recordId);
    }

    findContractById(contractId) {
        return this.contracts.find(c => c.id === contractId);
    }

    // Enhanced methods for user management
    createUser(userData) {
        const newUser = {
            id: this.userAccounts.length + 1,
            ...userData,
            status: 'Active',
            created: new Date().toISOString().split('T')[0],
            lastLogin: null,
            failedAttempts: 0
        };
        
        this.userAccounts.push(newUser);
        return newUser;
    }

    updateUser(userId, updatedData) {
        const userIndex = this.userAccounts.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.userAccounts[userIndex] = { ...this.userAccounts[userIndex], ...updatedData };
            return this.userAccounts[userIndex];
        }
        return null;
    }

    getUsersByRole(role) {
        return this.userAccounts.filter(u => u.role === role);
    }

    getUsersByDepartment(department) {
        return this.userAccounts.filter(u => u.department === department);
    }

    getUsersByStatus(status) {
        return this.userAccounts.filter(u => u.status === status);
    }

    searchUsers(query) {
        const searchTerm = query.toLowerCase();
        return this.userAccounts.filter(user => 
            user.username.toLowerCase().includes(searchTerm) ||
            user.fullname.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }

    getUserMetrics() {
        const users = this.userAccounts;
        return {
            total: users.length,
            active: users.filter(u => u.status === 'Active').length,
            inactive: users.filter(u => u.status === 'Inactive').length,
            locked: users.filter(u => u.status === 'Locked').length,
            expired: users.filter(u => u.status === 'Expired').length,
            administrators: users.filter(u => u.role === 'Administrator').length,
            failedLogins: users.reduce((sum, u) => sum + (u.failedAttempts || 0), 0),
            expiringAccounts: users.filter(u => {
                if (!u.expires) return false;
                const expiry = new Date(u.expires);
                const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                return expiry <= in90Days;
            }).length,
            twoFactorEnabled: users.filter(u => u.security?.twoFactorEnabled).length
        };
    }
}

export const dataManager = new DataManager();