export class DataManager {
    constructor() {
        this.entities = [];
        this.minerals = [];
        this.royaltyRecords = [];
        this.userAccounts = [];
        this.auditLog = [];
        this.contracts = [];
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        this.initializeEntities();
        this.initializeMinerals();
        this.initializeRoyaltyRecords();
        this.initializeUserAccounts();
        this.initializeAuditLog();
        this.initializeContracts();
        this.initialized = true;
    }

    initializeEntities() {
        this.entities = [
            { id: 1, name: 'Kwalini Quarry', type: 'Quarry', location: 'Kwaluseni', status: 'Active' },
            { id: 2, name: 'Maloma Colliery', type: 'Mine', location: 'Maloma', status: 'Active' },
            { id: 3, name: 'Ngwenya Mine', type: 'Mine', location: 'Ngwenya', status: 'Active' },
            { id: 4, name: 'Mbabane Quarry', type: 'Quarry', location: 'Mbabane', status: 'Active' },
            { id: 5, name: 'Sidvokodvo Quarry', type: 'Quarry', location: 'Sidvokodvo', status: 'Active' }
        ];
    }

    initializeMinerals() {
        this.minerals = [
            { id: 1, name: 'Coal', tariff: 12, unit: 'tonne' },
            { id: 2, name: 'Iron Ore', tariff: 25, unit: 'tonne' },
            { id: 3, name: 'Quarried Stone', tariff: 15, unit: 'cubic meter' },
            { id: 4, name: 'River Sand', tariff: 10, unit: 'cubic meter' },
            { id: 5, name: 'Gravel', tariff: 8, unit: 'cubic meter' }
        ];
    }

    initializeRoyaltyRecords() {
        this.royaltyRecords = [
            {
                id: 1, entity: 'Kwalini Quarry', mineral: 'Quarried Stone', volume: 1250,
                tariff: 15, royalties: 18750, date: '2024-01-15', status: 'Paid', referenceNumber: 'ROY-2024-001'
            },
            {
                id: 2, entity: 'Maloma Colliery', mineral: 'Coal', volume: 850,
                tariff: 12, royalties: 10200, date: '2024-01-20', status: 'Pending', referenceNumber: 'ROY-2024-002'
            },
            {
                id: 3, entity: 'Ngwenya Mine', mineral: 'Iron Ore', volume: 2100,
                tariff: 25, royalties: 52500, date: '2024-01-25', status: 'Paid', referenceNumber: 'ROY-2024-003'
            }
        ];
    }

    addAuditEntry(entry) {
        this.auditLog.unshift({
            id: this.auditLog.length + 1,
            timestamp: new Date().toLocaleString(),
            ...entry
        });
    }

    // Data access methods with defensive copies
    getEntities() { return [...this.entities]; }
    getMinerals() { return [...this.minerals]; }
    getRoyaltyRecords() { return [...this.royaltyRecords]; }
    getUserAccounts() { return [...this.userAccounts]; }
    getAuditLog() { return [...this.auditLog]; }
    getContracts() { return [...this.contracts]; }

    // Find methods
    findUserById(userId) { return this.userAccounts.find(u => u.id === parseInt(userId)); }
    findRecordById(recordId) { return this.royaltyRecords.find(r => r.id === parseInt(recordId)); }
    findContractById(contractId) { return this.contracts.find(c => c.id === contractId); }

    // Delete methods
    deleteUser(userId) {
        const index = this.userAccounts.findIndex(u => u.id === parseInt(userId));
        if (index !== -1) {
            return this.userAccounts.splice(index, 1)[0];
        }
        return null;
    }
}
