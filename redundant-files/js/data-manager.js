// Enhanced Data Manager for Mining Royalties System
class DataManager {
    constructor() {
        this.entities = [];
        this.minerals = [];
        this.royaltyRecords = [];
        this.userAccounts = [];
        this.auditLog = [];
        this.contracts = [];
        this.tariffSchedules = [];
        this.paymentHistory = [];
        this.compliance = [];
    }

    initialize() {
        this.initializeEntities();
        this.initializeMinerals();
        this.initializeRoyaltyRecords();
        this.initializeUserAccounts();
        this.initializeAuditLog();
        this.initializeContracts();
        this.initializeTariffSchedules();
        this.initializePaymentHistory();
        this.initializeCompliance();
    }

    initializeEntities() {
        this.entities = [
            { 
                id: 1, 
                name: 'Kwalini Quarry', 
                type: 'Quarry', 
                location: 'Kwaluseni', 
                status: 'Active',
                owner: 'Kwalini Mining Ltd',
                contact: 'info@kwalini.sz',
                phone: '+268 2416 1234',
                licenseNumber: 'ML-001-2024',
                established: '2020-03-15',
                coordinates: '26.3658°S, 31.2177°E'
            },
            { 
                id: 2, 
                name: 'Maloma Colliery', 
                type: 'Mine', 
                location: 'Maloma', 
                status: 'Active',
                owner: 'Eswatini Coal Mining',
                contact: 'operations@maloma.sz',
                phone: '+268 2343 5678',
                licenseNumber: 'ML-002-2023',
                established: '2018-07-20',
                coordinates: '26.4392°S, 31.3556°E'
            },
            { 
                id: 3, 
                name: 'Ngwenya Mine', 
                type: 'Mine', 
                location: 'Ngwenya', 
                status: 'Active',
                owner: 'Ngwenya Iron Ore Corporation',
                contact: 'admin@ngwenya.sz',
                phone: '+268 2442 9012',
                licenseNumber: 'ML-003-2022',
                established: '2015-11-10',
                coordinates: '26.2358°S, 30.9847°E'
            },
            { 
                id: 4, 
                name: 'Mbabane Quarry', 
                type: 'Quarry', 
                location: 'Mbabane', 
                status: 'Active',
                owner: 'Capital Stone Works',
                contact: 'quarry@mbabane.sz',
                phone: '+268 2404 3456',
                licenseNumber: 'ML-004-2024',
                established: '2021-01-25',
                coordinates: '26.3186°S, 31.1367°E'
            },
            { 
                id: 5, 
                name: 'Sidvokodvo Quarry', 
                type: 'Quarry', 
                location: 'Sidvokodvo', 
                status: 'Active',
                owner: 'Lowveld Aggregates',
                contact: 'info@sidvokodvo.sz',
                phone: '+268 2383 7890',
                licenseNumber: 'ML-005-2023',
                established: '2019-09-12',
                coordinates: '26.7833°S, 31.7500°E'
            },
            { 
                id: 6, 
                name: 'Piggs Peak Mine', 
                type: 'Mine', 
                location: 'Piggs Peak', 
                status: 'Inactive',
                owner: 'Northern Mining Consortium',
                contact: 'closed@piggspeak.sz',
                phone: '+268 2437 1122',
                licenseNumber: 'ML-006-2020',
                established: '2016-04-08',
                coordinates: '25.9667°S, 31.2500°E'
            }
        ];
    }

    initializeMinerals() {
        this.minerals = [
            { 
                id: 1, 
                name: 'Coal', 
                tariff: 12, 
                unit: 'per tonne',
                category: 'Fossil Fuels',
                description: 'Bituminous coal for energy production',
                environmentalImpact: 'High',
                extractionMethod: 'Open pit/Underground'
            },
            { 
                id: 2, 
                name: 'Iron Ore', 
                tariff: 25, 
                unit: 'per tonne',
                category: 'Metallic Minerals',
                description: 'Iron ore for steel production',
                environmentalImpact: 'Medium',
                extractionMethod: 'Open pit'
            },
            { 
                id: 3, 
                name: 'Quarried Stone', 
                tariff: 15, 
                unit: 'per m³',
                category: 'Construction Materials',
                description: 'Crushed stone for construction',
                environmentalImpact: 'Low',
                extractionMethod: 'Quarrying'
            },
            { 
                id: 4, 
                name: 'River Sand', 
                tariff: 8, 
                unit: 'per m³',
                category: 'Construction Materials',
                description: 'Natural sand for concrete production',
                environmentalImpact: 'Medium',
                extractionMethod: 'Dredging'
            },
            { 
                id: 5, 
                name: 'Gravel', 
                tariff: 10, 
                unit: 'per m³',
                category: 'Construction Materials',
                description: 'Natural and crushed gravel',
                environmentalImpact: 'Low',
                extractionMethod: 'Excavation'
            },
            { 
                id: 6, 
                name: 'Clay', 
                tariff: 5, 
                unit: 'per tonne',
                category: 'Industrial Minerals',
                description: 'Clay for ceramics and bricks',
                environmentalImpact: 'Low',
                extractionMethod: 'Open pit'
            }
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
                referenceNumber: 'ROY-2024-001',
                paymentDate: '2024-01-30',
                notes: 'Regular monthly extraction',
                approvedBy: 'Finance Manager',
                invoiceGenerated: true,
                invoiceNumber: 'INV-2024-001'
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
                referenceNumber: 'ROY-2024-002',
                paymentDate: null,
                notes: 'Awaiting payment confirmation',
                approvedBy: 'Operations Manager',
                invoiceGenerated: true,
                invoiceNumber: 'INV-2024-002'
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
                referenceNumber: 'ROY-2024-003',
                paymentDate: '2024-02-05',
                notes: 'High-grade iron ore shipment',
                approvedBy: 'Senior Manager',
                invoiceGenerated: true,
                invoiceNumber: 'INV-2024-003'
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
                referenceNumber: 'ROY-2024-004',
                paymentDate: null,
                notes: 'Payment overdue by 5 days',
                approvedBy: 'Regional Manager',
                invoiceGenerated: true,
                invoiceNumber: 'INV-2024-004'
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
                referenceNumber: 'ROY-2024-005',
                paymentDate: '2024-02-15',
                notes: 'River sand for local construction',
                approvedBy: 'Site Manager',
                invoiceGenerated: true,
                invoiceNumber: 'INV-2024-005'
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
                referenceNumber: 'ROY-2024-006',
                paymentDate: null,
                notes: 'Additional extraction for infrastructure project',
                approvedBy: 'Project Manager',
                invoiceGenerated: false,
                invoiceNumber: null
            }
        ];
    }

    initializeUserAccounts() {
        this.userAccounts = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@eswacaa.sz',
                fullName: 'System Administrator',
                role: 'Administrator',
                department: 'Management',
                status: 'Active',
                lastLogin: '2024-02-10T09:15:00Z',
                failedAttempts: 0,
                expires: null,
                created: '2023-01-15',
                permissions: ['read', 'write', 'delete', 'admin', 'audit', 'finance'],
                phoneNumber: '+268 2404 0001',
                profileImage: null,
                twoFactorEnabled: true
            },
            {
                id: 2,
                username: 'editor',
                email: 'editor@eswacaa.sz',
                fullName: 'Finance Editor',
                role: 'Editor',
                department: 'Finance',
                status: 'Active',
                lastLogin: '2024-02-09T14:30:00Z',
                failedAttempts: 0,
                expires: '2024-12-31',
                created: '2023-03-20',
                permissions: ['read', 'write', 'finance'],
                phoneNumber: '+268 2404 0002',
                profileImage: null,
                twoFactorEnabled: false
            },
            {
                id: 3,
                username: 'viewer',
                email: 'viewer@eswacaa.sz',
                fullName: 'Audit Viewer',
                role: 'Viewer',
                department: 'Audit',
                status: 'Active',
                lastLogin: '2024-02-08T11:45:00Z',
                failedAttempts: 1,
                expires: '2024-12-31',
                created: '2023-06-10',
                permissions: ['read', 'audit'],
                phoneNumber: '+268 2404 0003',
                profileImage: null,
                twoFactorEnabled: false
            }
        ];
    }

    initializeAuditLog() {
        this.auditLog = [
            {
                id: 1,
                timestamp: '2024-02-10T09:15:23Z',
                user: 'admin',
                action: 'Login',
                target: 'System',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Successful login from administrative workstation',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_abc123',
                severity: 'Info'
            },
            {
                id: 2,
                timestamp: '2024-02-10T09:20:15Z',
                user: 'admin',
                action: 'Create User',
                target: 'editor',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Created new user account for Finance department',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_abc123',
                severity: 'Info'
            },
            {
                id: 3,
                timestamp: '2024-02-09T14:30:45Z',
                user: 'editor',
                action: 'Data Access',
                target: 'Royalty Records',
                ipAddress: '192.168.1.105',
                status: 'Success',
                details: 'Accessed monthly royalty reports for January 2024',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_def456',
                severity: 'Info'
            },
            {
                id: 4,
                timestamp: '2024-02-09T11:22:33Z',
                user: 'viewer',
                action: 'Failed Login',
                target: 'System',
                ipAddress: '192.168.1.108',
                status: 'Failed',
                details: 'Failed login attempt - incorrect password',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: null,
                severity: 'Warning'
            },
            {
                id: 5,
                timestamp: '2024-02-08T16:45:12Z',
                user: 'admin',
                action: 'Modify User',
                target: 'viewer',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Updated user permissions for audit department',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_abc123',
                severity: 'Info'
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

    initializeTariffSchedules() {
        this.tariffSchedules = [
            {
                id: 1,
                mineralId: 1,
                mineral: 'Coal',
                currentRate: 12,
                effectiveDate: '2024-01-01',
                previousRate: 10,
                nextReviewDate: '2025-01-01',
                adjustmentHistory: [
                    { date: '2023-01-01', rate: 8, reason: 'Initial rate setting' },
                    { date: '2023-07-01', rate: 10, reason: 'Market adjustment' },
                    { date: '2024-01-01', rate: 12, reason: 'Annual review increase' }
                ]
            },
            {
                id: 2,
                mineralId: 2,
                mineral: 'Iron Ore',
                currentRate: 25,
                effectiveDate: '2024-01-01',
                previousRate: 22,
                nextReviewDate: '2025-01-01',
                adjustmentHistory: [
                    { date: '2023-01-01', rate: 20, reason: 'Initial rate setting' },
                    { date: '2023-07-01', rate: 22, reason: 'Market adjustment' },
                    { date: '2024-01-01', rate: 25, reason: 'Annual review increase' }
                ]
            }
        ];
    }

    initializePaymentHistory() {
        this.paymentHistory = [
            {
                id: 1,
                recordId: 1,
                referenceNumber: 'ROY-2024-001',
                entity: 'Kwalini Quarry',
                amount: 18750,
                paymentDate: '2024-01-30',
                paymentMethod: 'Bank Transfer',
                bankReference: 'TXN789456123',
                status: 'Confirmed',
                processedBy: 'Finance Officer',
                notes: 'Payment received in full'
            },
            {
                id: 2,
                recordId: 3,
                referenceNumber: 'ROY-2024-003',
                entity: 'Ngwenya Mine',
                amount: 52500,
                paymentDate: '2024-02-05',
                paymentMethod: 'Electronic Transfer',
                bankReference: 'EFT456789012',
                status: 'Confirmed',
                processedBy: 'Senior Finance Officer',
                notes: 'Large payment processed with additional verification'
            },
            {
                id: 3,
                recordId: 5,
                referenceNumber: 'ROY-2024-005',
                entity: 'Sidvokodvo Quarry',
                amount: 4000,
                paymentDate: '2024-02-15',
                paymentMethod: 'Cheque',
                bankReference: 'CHQ123456',
                status: 'Confirmed',
                processedBy: 'Accounts Clerk',
                notes: 'Cheque cleared successfully'
            }
        ];
    }

    initializeCompliance() {
        this.compliance = [
            {
                id: 1,
                entityId: 1,
                entity: 'Kwalini Quarry',
                complianceScore: 95,
                lastAudit: '2024-01-15',
                nextAudit: '2024-07-15',
                issues: [],
                certifications: [
                    { type: 'Environmental', status: 'Valid', expires: '2024-12-31' },
                    { type: 'Safety', status: 'Valid', expires: '2024-10-15' }
                ]
            },
            {
                id: 2,
                entityId: 2,
                entity: 'Maloma Colliery',
                complianceScore: 87,
                lastAudit: '2024-01-20',
                nextAudit: '2024-07-20',
                issues: [
                    { type: 'Environmental', description: 'Minor dust control issue', severity: 'Low', resolved: false }
                ],
                certifications: [
                    { type: 'Environmental', status: 'Valid', expires: '2024-11-30' },
                    { type: 'Safety', status: 'Valid', expires: '2024-09-20' }
                ]
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
    getTariffSchedules() { return this.tariffSchedules; }
    getPaymentHistory() { return this.paymentHistory; }
    getCompliance() { return this.compliance; }

    // Enhanced data manipulation methods
    addAuditEntry(entry) {
        this.auditLog.unshift({
            id: this.auditLog.length + 1,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent || 'Unknown',
            sessionId: this.generateSessionId(),
            severity: entry.severity || 'Info',
            ...entry
        });
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
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

    findEntityById(entityId) {
        return this.entities.find(e => e.id === entityId);
    }

    findMineralById(mineralId) {
        return this.minerals.find(m => m.id === mineralId);
    }

    // Analytics methods
    calculateTotalRoyalties(period = 'all') {
        let records = this.royaltyRecords;
        
        if (period !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (period) {
                case 'today':
                    filterDate.setDate(now.getDate());
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            
            records = records.filter(r => new Date(r.date) >= filterDate);
        }
        
        return records.reduce((sum, record) => sum + record.royalties, 0);
    }

    getComplianceRate() {
        const totalRecords = this.royaltyRecords.length;
        const paidRecords = this.royaltyRecords.filter(r => r.status === 'Paid').length;
        return totalRecords > 0 ? Math.round((paidRecords / totalRecords) * 100) : 0;
    }

    getOverduePayments() {
        return this.royaltyRecords.filter(r => r.status === 'Overdue');
    }

    getPendingPayments() {
        return this.royaltyRecords.filter(r => r.status === 'Pending');
    }

    getRoyaltiesByEntity() {
        return this.royaltyRecords.reduce((acc, record) => {
            acc[record.entity] = (acc[record.entity] || 0) + record.royalties;
            return acc;
        }, {});
    }

    getRoyaltiesByMineral() {
        return this.royaltyRecords.reduce((acc, record) => {
            acc[record.mineral] = (acc[record.mineral] || 0) + record.royalties;
            return acc;
        }, {});
    }

    getProductionByEntity() {
        return this.royaltyRecords.reduce((acc, record) => {
            acc[record.entity] = (acc[record.entity] || 0) + record.volume;
            return acc;
        }, {});
    }

    // Search and filter methods
    searchRecords(query) {
        const searchTerm = query.toLowerCase();
        return this.royaltyRecords.filter(record => 
            record.entity.toLowerCase().includes(searchTerm) ||
            record.mineral.toLowerCase().includes(searchTerm) ||
            record.referenceNumber.toLowerCase().includes(searchTerm) ||
            record.status.toLowerCase().includes(searchTerm)
        );
    }

    filterRecordsByStatus(status) {
        return this.royaltyRecords.filter(record => record.status === status);
    }

    filterRecordsByEntity(entityName) {
        return this.royaltyRecords.filter(record => record.entity === entityName);
    }

    filterRecordsByMineral(mineralName) {
        return this.royaltyRecords.filter(record => record.mineral === mineralName);
    }

    filterRecordsByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.royaltyRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        });
    }

    // Export methods
    exportToCSV(data, filename) {
        // This would normally create and download a CSV file
        console.log(`Exporting ${data.length} records to ${filename}`);
        return true;
    }

    exportToExcel(data, filename) {
        // This would normally create and download an Excel file
        console.log(`Exporting ${data.length} records to ${filename}`);
        return true;
    }

    exportToPDF(data, filename) {
        // This would normally create and download a PDF file
        console.log(`Exporting ${data.length} records to ${filename}`);
        return true;
    }

    // Validation methods
    validateRoyaltyRecord(record) {
        const errors = [];
        
        if (!record.entity) errors.push('Entity is required');
        if (!record.mineral) errors.push('Mineral is required');
        if (!record.volume || record.volume <= 0) errors.push('Volume must be greater than 0');
        if (!record.tariff || record.tariff <= 0) errors.push('Tariff must be greater than 0');
        if (!record.date) errors.push('Date is required');
        if (!record.referenceNumber) errors.push('Reference number is required');
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    validateUser(user) {
        const errors = [];
        
        if (!user.username) errors.push('Username is required');
        if (!user.email) errors.push('Email is required');
        if (!user.role) errors.push('Role is required');
        if (!user.department) errors.push('Department is required');
        
        // Check for duplicate username/email
        const existingUser = this.userAccounts.find(u => 
            (u.username === user.username || u.email === user.email) && u.id !== user.id
        );
        if (existingUser) errors.push('Username or email already exists');
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
