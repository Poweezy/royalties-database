// API Service for handling data operations
export class ApiService {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error(`API request failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // CRUD operations
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // File upload
    async upload(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }

    // Mining Royalties specific endpoints
    async getRoyaltyRecords(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.get(`/royalty-records?${params}`);
    }

    async createRoyaltyRecord(record) {
        return this.post('/royalty-records', record);
    }

    async updateRoyaltyRecord(id, record) {
        return this.put(`/royalty-records/${id}`, record);
    }

    async deleteRoyaltyRecord(id) {
        return this.delete(`/royalty-records/${id}`);
    }

    async getEntities() {
        return this.get('/entities');
    }

    async getMinerals() {
        return this.get('/minerals');
    }

    async getUsers() {
        return this.get('/users');
    }

    async createUser(user) {
        return this.post('/users', user);
    }

    async updateUser(id, user) {
        return this.put(`/users/${id}`, user);
    }

    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    async getContracts() {
        return this.get('/contracts');
    }

    async createContract(contract) {
        return this.post('/contracts', contract);
    }

    async updateContract(id, contract) {
        return this.put(`/contracts/${id}`, contract);
    }

    async deleteContract(id) {
        return this.delete(`/contracts/${id}`);
    }

    async getAuditLog(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.get(`/audit-log?${params}`);
    }

    async authenticate(credentials) {
        return this.post('/auth/login', credentials);
    }

    async logout() {
        return this.post('/auth/logout');
    }

    async getReports(type, filters = {}) {
        const params = new URLSearchParams({ type, ...filters });
        return this.get(`/reports?${params}`);
    }

    async exportData(type, format = 'csv', filters = {}) {
        const params = new URLSearchParams({ format, ...filters });
        const response = await fetch(`${this.baseUrl}/export/${type}?${params}`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}_export.${format}`;
            link.click();
            URL.revokeObjectURL(url);
            return { success: true };
        } else {
            return { success: false, error: 'Export failed' };
        }
    }

    // Dashboard data
    async getDashboardData() {
        return this.get('/dashboard');
    }

    async getDashboardMetrics(period = 'ytd') {
        return this.get(`/dashboard/metrics?period=${period}`);
    }

    // Validation endpoints
    async validateRoyaltyCalculation(data) {
        return this.post('/validate/royalty-calculation', data);
    }

    async validateContract(contract) {
        return this.post('/validate/contract', contract);
    }

    // Search functionality
    async search(query, type = 'all') {
        const params = new URLSearchParams({ q: query, type });
        return this.get(`/search?${params}`);
    }
}
