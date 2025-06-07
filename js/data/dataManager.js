// Data Management Module

export class DataManager {
    constructor() {
        this.entities = [];
        this.minerals = [];
        this.royaltyRecords = [];
        this.userAccounts = [];
        this.auditLog = [];
        this.contracts = [];
    }

    initialize() {
        this.initializeEntities();
        this.initializeMinerals();
        this.initializeRoyaltyRecords();
        this.initializeUserAccounts();
        this.initializeAuditLog();
        this.initializeContracts();
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
                email: 'admin@eswacaa.sz',
                role: 'Administrator',
                department: 'Management',
                status: 'Active',
                lastLogin: '2024-02-10 09:15:00',
                failedAttempts: 0,
                expires: null,
                created: '2023-01-15'
            },
            {
                id: 2,
                username: 'editor',
                email: 'editor@eswacaa.sz',
                role: 'Editor',
                department: 'Finance',
                status: 'Active',
                lastLogin: '2024-02-09 14:30:00',
                failedAttempts: 0,
                expires: '2024-12-31',
                created: '2023-03-20'
            },
            {
                id: 3,
                username: 'viewer',
                email: 'viewer@eswacaa.sz',
                role: 'Viewer',
                department: 'Audit',
                status: 'Active',
                lastLogin: '2024-02-08 11:45:00',
                failedAttempts: 1,
                expires: '2024-12-31',
                created: '2023-06-10'
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

    // Data access methods
    getEntities() { return this.entities; }
    getMinerals() { return this.minerals; }
    getRoyaltyRecords() { return this.royaltyRecords; }
    getUserAccounts() { return this.userAccounts; }
    getAuditLog() { return this.auditLog; }
    getContracts() { return this.contracts; }

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
}

export const dataManager = new DataManager();