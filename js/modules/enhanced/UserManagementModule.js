export class UserManagementModule {
    constructor() {
        this.users = new Map();
        this.roles = new Map();
        this.permissions = new Map();
        this.currentFilters = new Map();
        this.analytics = null;
        this.automationEngine = null;
        this.searchEngine = null;
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.setupEventListeners();
        this.initializeDataTables();
        await this.initializeAdvancedFeatures();
    }

    async initializeAdvancedFeatures() {
        try {
            // Initialize analytics integration
            this.analytics = {
                trackUserActivity: async (activity) => {
                    await this.reporting?.trackActivity('user', activity);
                },
                generateUserMetrics: async () => {
                    return await this.reporting?.generateMetrics('user');
                }
            };

            // Initialize automation integration
            this.automationEngine = {
                processUserEvent: async (event, userData) => {
                    await this.automation?.processEvent('user', event, userData);
                },
                scheduleUserTask: async (task) => {
                    return await this.automation?.scheduleTask('user', task);
                }
            };

            // Initialize search integration
            this.searchEngine = {
                indexUserData: async (userData) => {
                    await this.search?.indexDocument('user', userData);
                },
                searchUsers: async (query) => {
                    return await this.search?.performSearch('user', query);
                }
            };
        } catch (error) {
            console.error('Failed to initialize advanced features:', error);
            throw error;
        }
    }

    async loadInitialData() {
        try {
            const [users, roles, permissions] = await Promise.all([
                this.fetchUsers(),
                this.fetchRoles(),
                this.fetchPermissions()
            ]);
            
            this.users = new Map(users.map(user => [user.id, user]));
            this.roles = new Map(roles.map(role => [role.id, role]));
            this.permissions = new Map(permissions.map(perm => [perm.id, perm]));
            
            // Index initial data for search
            if (this.searchEngine) {
                await Promise.all([
                    ...Array.from(this.users.values()).map(user => 
                        this.searchEngine.indexUserData(user)
                    )
                ]);
            }
            
            this.renderUserTable();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            throw error;
        }
    }

    async fetchUsers(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`/api/users?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    }

    setupEventListeners() {
        // User form submission
        document.getElementById('user-form')?.addEventListener('submit', this.handleUserFormSubmit.bind(this));
        
        // Bulk actions
        document.getElementById('bulk-actions')?.addEventListener('change', this.handleBulkAction.bind(this));
        
        // Search and filters
        document.getElementById('user-search')?.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));

        // Track user interactions
        document.addEventListener('userInteraction', async (event) => {
            await this.analytics?.trackUserActivity(event.detail);
        });
        
        // Role management
        document.getElementById('role-form')?.addEventListener('submit', this.handleRoleFormSubmit.bind(this));
    }

    initializeDataTables() {
        this.userTable = new DataTable('#users-table', {
            columns: [
                { data: 'id', visible: false },
                { 
                    data: null,
                    render: function(data, type, row) {
                        return `<input type="checkbox" class="user-select" data-user-id="${row.id}">`;
                    },
                    orderable: false
                },
                { data: 'username' },
                { data: 'email' },
                { data: 'role' },
                { data: 'status' },
                { data: 'lastLogin' },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <button class="btn btn-sm btn-edit" data-user-id="${row.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-delete" data-user-id="${row.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                    }
                }
            ],
            order: [[2, 'asc']],
            pageLength: 15,
            responsive: true
        });
    }

    async handleUserFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        try {
            const userData = this.validateUserData(Object.fromEntries(formData));
            const response = await this.saveUser(userData);
            
            if (response.ok) {
                this.showNotification('User saved successfully', 'success');
                this.refreshUserTable();
                this.closeUserModal();
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    validateUserData(data) {
        const errors = [];
        
        if (!data.username?.trim()) errors.push('Username is required');
        if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push('Invalid email format');
        if (data.password && data.password.length < 8) errors.push('Password must be at least 8 characters');
        
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
        
        return data;
    }

    async saveUser(userData) {
        const isNewUser = !userData.id;
        const method = isNewUser ? 'POST' : 'PUT';
        const url = isNewUser ? '/api/users' : `/api/users/${userData.id}`;
        
        return fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
    }

    async handleBulkAction(event) {
        const action = event.target.value;
        if (!action) return;
        
        const selectedUsers = Array.from(document.querySelectorAll('.user-select:checked'))
            .map(checkbox => checkbox.dataset.userId);
            
        if (selectedUsers.length === 0) {
            this.showNotification('Please select users first', 'warning');
            return;
        }
        
        try {
            await this.processBulkAction(action, selectedUsers);
            this.showNotification('Bulk action completed successfully', 'success');
            this.refreshUserTable();
        } catch (error) {
            this.showNotification('Failed to process bulk action', 'error');
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showNotification(message, type) {
        const notificationManager = window.app?.getModule('notifications');
        if (notificationManager) {
            notificationManager.show({ message, type });
        }
    }
}
