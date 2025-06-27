// DataManager - Core data management for Mining Royalties Manager
export class DataManager {
    constructor() {
        this.initialized = false;
        this.data = {
            users: [],
            records: [],
            contracts: []
        };
    }
    
    initialize() {
        console.log('DataManager: Initializing...');
        this.initialized = true;
        this.loadSampleData();
    }
    
    loadSampleData() {
        // Load sample data for demonstration
        this.data.users = [
            { id: 1, username: 'admin', role: 'Administrator', active: true },
            { id: 2, username: 'editor', role: 'Editor', active: true },
            { id: 3, username: 'viewer', role: 'Viewer', active: true }
        ];
        
        this.data.records = [
            { id: 1, entity: 'Mining Corp A', amount: 150000, status: 'Paid', date: '2025-01-15' },
            { id: 2, entity: 'Mining Corp B', amount: 89000, status: 'Pending', date: '2025-01-20' },
            { id: 3, entity: 'Mining Corp C', amount: 205000, status: 'Overdue', date: '2025-01-10' }
        ];
        
        console.log('DataManager: Sample data loaded');
    }
    
    getUsers() {
        return this.data.users;
    }
    
    getRecords() {
        return this.data.records;
    }
    
    addUser(user) {
        user.id = this.data.users.length + 1;
        this.data.users.push(user);
        return user;
    }
    
    updateUser(id, updates) {
        const index = this.data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.data.users[index] = { ...this.data.users[index], ...updates };
            return this.data.users[index];
        }
        return null;
    }
    
    deleteUser(id) {
        const index = this.data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            return this.data.users.splice(index, 1)[0];
        }
        return null;
    }
    
    findUserById(id) {
        return this.data.users.find(u => u.id === id);
    }
}
