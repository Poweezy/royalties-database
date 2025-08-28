/**
 * Enhanced User Management Application
 * Integrates all enhanced user management features
 */

import { UserManager } from './modules/UserManager.js';
import { BulkOperationsPanel } from './components/BulkOperationsPanel.js';
import { UserProfileModal } from './components/UserProfileModal.js';
import { userSecurityService } from './services/user-security.service.js';
import { permissionService } from './services/permission.service.js';
import { ErrorHandler } from './utils/error-handler.js';

class EnhancedUserManagement {
    constructor() {
        this.userManager = new UserManager();
        this.bulkOperationsPanel = null;
        this.userProfileModal = null;
        this.initialized = false;
    }

    /**
     * Initialize enhanced user management
     */
    async init() {
        try {
            if (this.initialized) return;

            console.log('Initializing Enhanced User Management...');

            // Initialize services
            await userSecurityService.init();
            
            // Initialize user manager
            await this.userManager.initializeEnhancedFeatures();

            // Initialize components
            this.bulkOperationsPanel = new BulkOperationsPanel(this.userManager);
            this.userProfileModal = new UserProfileModal(this.userManager);

            // Setup enhanced event listeners
            this.setupEnhancedEventListeners();

            // Initialize bulk operations panel UI
            this.initializeBulkOperationsUI();

            this.initialized = true;
            console.log('Enhanced User Management initialized successfully');

        } catch (error) {
            new ErrorHandler().handleError(error, 'Failed to initialize Enhanced User Management');
            throw error;
        }
    }

    /**
     * Setup enhanced event listeners
     */
    setupEnhancedEventListeners() {
        // User profile modal triggers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.user-profile-btn')) {
                const userId = parseInt(e.target.closest('.user-profile-btn').dataset.userId);
                this.userProfileModal.showProfile(userId);
            }
        });

        // Enhanced bulk operations
        document.addEventListener('click', (e) => {
            switch (e.target.id) {
                case 'bulk-assign-roles':
                    this.showBulkRoleAssignmentModal();
                    break;
                case 'bulk-email-users':
                    this.userManager.bulkEmailUsers();
                    break;
                case 'bulk-export-selected':
                    this.userManager.bulkExportUsers();
                    break;
                case 'bulk-import-users':
                    this.userManager.bulkImportUsers();
                    break;
            }
        });

        // User selection changes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'user-select' || e.target.id === 'select-all-users') {
                this.updateBulkOperationsPanel();
            }
        });

        // Permission and role management
        document.addEventListener('click', (e) => {
            if (e.target.id === 'manage-roles-permissions') {
                this.showRolePermissionManager();
            }
        });
    }

    /**
     * Initialize bulk operations UI
     */
    initializeBulkOperationsUI() {
        const container = document.getElementById('bulk-operations-panel-container');
        if (container && this.bulkOperationsPanel) {
            container.innerHTML = this.bulkOperationsPanel.getBulkOperationsHTML();
        }
    }

    /**
     * Update bulk operations panel based on selection
     */
    updateBulkOperationsPanel() {
        if (this.bulkOperationsPanel) {
            const selectedUsers = this.userManager.selectedUsers;
            this.bulkOperationsPanel.updateSelection(selectedUsers);
        }
    }

    /**
     * Show bulk role assignment modal
     */
    showBulkRoleAssignmentModal() {
        const selectedUsers = this.userManager.selectedUsers;
        if (selectedUsers.size === 0) {
            alert('Please select users first');
            return;
        }

        const modal = this.createBulkRoleAssignmentModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    /**
     * Create bulk role assignment modal
     */
    createBulkRoleAssignmentModal() {
        const roles = permissionService.getAllRoles();
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Bulk Role Assignment</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="bulk-role-select">Select Role</label>
                        <select id="bulk-role-select" class="form-control">
                            <option value="">Select a role...</option>
                            ${roles.map(role => `
                                <option value="${role.name}" style="color: ${role.color}">
                                    ${role.name} - ${role.description}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Selected Users (${this.userManager.selectedUsers.size})</label>
                        <div class="selected-users-preview">
                            ${this.getSelectedUsersPreview()}
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="send-role-notification" checked>
                            Send notification to users about role change
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="enhancedUserManagement.executeBulkRoleAssignment()">Assign Role</button>
                </div>
            </div>
        `;

        // Setup modal event listeners
        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        return modal;
    }

    /**
     * Get selected users preview
     */
    getSelectedUsersPreview() {
        const selectedUserIds = Array.from(this.userManager.selectedUsers);
        const selectedUsers = this.userManager.users.filter(user => selectedUserIds.includes(user.id));
        
        return selectedUsers.map(user => `
            <div class="selected-user-item">
                <span class="user-name">${user.username}</span>
                <span class="user-email">${user.email}</span>
                <span class="current-role">(${user.role})</span>
            </div>
        `).join('');
    }

    /**
     * Execute bulk role assignment
     */
    async executeBulkRoleAssignment() {
        try {
            const roleSelect = document.getElementById('bulk-role-select');
            const roleId = roleSelect.value;
            const sendNotification = document.getElementById('send-role-notification').checked;

            if (!roleId) {
                alert('Please select a role');
                return;
            }

            // Show loading state
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'Assigning...';
            button.disabled = true;

            // Execute bulk assignment
            await this.userManager.bulkAssignRole(roleId);

            // Send notifications if requested
            if (sendNotification) {
                await this.sendRoleChangeNotifications(roleId);
            }

            // Close modal
            document.querySelector('.modal').remove();

            // Show success message
            this.userManager.showNotification(
                `Successfully assigned ${roleId} role to ${this.userManager.selectedUsers.size} users`, 
                'success'
            );

        } catch (error) {
            ErrorHandler.handle(error, 'Failed to assign roles');
            this.userManager.showNotification('Failed to assign roles to selected users', 'error');
        }
    }

    /**
     * Send role change notifications
     */
    async sendRoleChangeNotifications(roleId) {
        try {
            const selectedUserIds = Array.from(this.userManager.selectedUsers);
            
            for (const userId of selectedUserIds) {
                const user = this.userManager.users.find(u => u.id === userId);
                if (user) {
                    await userSecurityService.sendSecurityNotification(
                        user.username,
                        'role_changed',
                        {
                            oldRole: user.role,
                            newRole: roleId,
                            changedBy: 'admin',
                            timestamp: new Date().toISOString()
                        }
                    );
                }
            }
        } catch (error) {
            console.error('Failed to send role change notifications:', error);
        }
    }

    /**
     * Show role and permission management interface
     */
    showRolePermissionManager() {
        const modal = this.createRolePermissionManagerModal();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    /**
     * Create role and permission management modal
     */
    createRolePermissionManagerModal() {
        const roles = permissionService.getAllRoles();
        const permissions = permissionService.getPermissionsByCategory();

        const modal = document.createElement('div');
        modal.className = 'modal role-permission-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Role & Permission Management</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="role-permission-tabs">
                        <button class="tab-btn active" data-tab="roles">
                            <i class="fas fa-users-cog"></i> Manage Roles
                        </button>
                        <button class="tab-btn" data-tab="permissions">
                            <i class="fas fa-key"></i> View Permissions
                        </button>
                        <button class="tab-btn" data-tab="templates">
                            <i class="fas fa-stamp"></i> Permission Templates
                        </button>
                    </div>
                    
                    <div class="tab-content-container">
                        <!-- Roles Tab -->
                        <div class="tab-content active" id="roles-tab">
                            <div class="roles-manager">
                                <div class="roles-header">
                                    <h5>System Roles</h5>
                                    <button class="btn btn-primary btn-sm" id="create-custom-role">
                                        <i class="fas fa-plus"></i> Create Custom Role
                                    </button>
                                </div>
                                <div class="roles-list">
                                    ${roles.map(role => `
                                        <div class="role-item" data-role="${role.name}">
                                            <div class="role-header">
                                                <div class="role-info">
                                                    <span class="role-name" style="color: ${role.color}">${role.name}</span>
                                                    <span class="role-description">${role.description}</span>
                                                </div>
                                                <div class="role-actions">
                                                    <button class="btn btn-sm btn-info" onclick="this.toggleRoleDetails('${role.name}')">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    ${role.custom ? `
                                                        <button class="btn btn-sm btn-warning" onclick="this.editRole('${role.name}')">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-danger" onclick="this.deleteRole('${role.name}')">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </div>
                                            <div class="role-details" style="display: none;">
                                                <div class="role-permissions">
                                                    <strong>Permissions (${role.permissions.length}):</strong>
                                                    <div class="permission-tags">
                                                        ${role.permissions.slice(0, 5).map(perm => `
                                                            <span class="permission-tag">${perm}</span>
                                                        `).join('')}
                                                        ${role.permissions.length > 5 ? `<span class="more-permissions">+${role.permissions.length - 5} more</span>` : ''}
                                                    </div>
                                                </div>
                                                ${role.inherits.length > 0 ? `
                                                    <div class="role-inheritance">
                                                        <strong>Inherits from:</strong> ${role.inherits.join(', ')}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Permissions Tab -->
                        <div class="tab-content" id="permissions-tab">
                            <div class="permissions-overview">
                                <h5>System Permissions</h5>
                                ${Object.entries(permissions).map(([category, categoryPermissions]) => `
                                    <div class="permission-category">
                                        <h6>${category} (${categoryPermissions.length})</h6>
                                        <div class="permissions-grid">
                                            ${categoryPermissions.map(permission => `
                                                <div class="permission-card">
                                                    <div class="permission-name">${permission.name}</div>
                                                    <div class="permission-id">${permission.id}</div>
                                                    <div class="permission-description">${permission.description}</div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Templates Tab -->
                        <div class="tab-content" id="templates-tab">
                            <div class="templates-manager">
                                <h5>Permission Templates</h5>
                                <div class="templates-list">
                                    ${permissionService.getPermissionTemplates().map(template => `
                                        <div class="template-item">
                                            <div class="template-info">
                                                <span class="template-name">${template.name}</span>
                                                <span class="template-description">${template.description}</span>
                                            </div>
                                            <div class="template-actions">
                                                <button class="btn btn-sm btn-primary" onclick="this.applyTemplateToSelected('${template.name}')">
                                                    <i class="fas fa-stamp"></i> Apply to Selected
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;

        // Setup modal event listeners
        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchRolePermissionTab(e.target.dataset.tab);
            });
        });

        return modal;
    }

    /**
     * Switch role/permission tab
     */
    switchRolePermissionTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.role-permission-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('#roles-tab, #permissions-tab, #templates-tab').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    /**
     * Get user manager instance
     */
    getUserManager() {
        return this.userManager;
    }

    /**
     * Get bulk operations panel instance
     */
    getBulkOperationsPanel() {
        return this.bulkOperationsPanel;
    }

    /**
     * Get user profile modal instance
     */
    getUserProfileModal() {
        return this.userProfileModal;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.initialized = false;
        // Cleanup event listeners and resources if needed
    }
}

// Global instance
const enhancedUserManagement = new EnhancedUserManagement();

// Export for use in other modules
export { enhancedUserManagement, EnhancedUserManagement };


// Make available globally for onclick handlers
window.enhancedUserManagement = enhancedUserManagement;
