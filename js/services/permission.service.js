/**
 * Permission Service
 * Handles granular permission system and role management
 */

import { dbService } from './database.service.js';
import { ErrorHandler } from '../utils/error-handler.js';

class PermissionService {
    constructor() {
        this.permissionRegistry = new Map();
        this.roleHierarchy = new Map();
        this.permissionTemplates = new Map();
        this.initializeDefaultPermissions();
        this.initializeDefaultRoles();
        this.initializePermissionTemplates();
    }

    /**
     * Initialize default permissions
     */
    initializeDefaultPermissions() {
        const permissions = [
            // User Management
            { id: 'users.view', name: 'View Users', category: 'User Management', description: 'View user accounts and profiles' },
            { id: 'users.create', name: 'Create Users', category: 'User Management', description: 'Create new user accounts' },
            { id: 'users.edit', name: 'Edit Users', category: 'User Management', description: 'Modify existing user accounts' },
            { id: 'users.delete', name: 'Delete Users', category: 'User Management', description: 'Delete user accounts' },
            { id: 'users.bulk', name: 'Bulk User Operations', category: 'User Management', description: 'Perform bulk operations on users' },
            { id: 'users.export', name: 'Export Users', category: 'User Management', description: 'Export user data' },
            { id: 'users.import', name: 'Import Users', category: 'User Management', description: 'Import user data' },

            // Role Management
            { id: 'roles.view', name: 'View Roles', category: 'Role Management', description: 'View system roles' },
            { id: 'roles.create', name: 'Create Roles', category: 'Role Management', description: 'Create new roles' },
            { id: 'roles.edit', name: 'Edit Roles', category: 'Role Management', description: 'Modify existing roles' },
            { id: 'roles.delete', name: 'Delete Roles', category: 'Role Management', description: 'Delete roles' },
            { id: 'roles.assign', name: 'Assign Roles', category: 'Role Management', description: 'Assign roles to users' },

            // Royalty Management
            { id: 'royalties.view', name: 'View Royalties', category: 'Royalty Management', description: 'View royalty records' },
            { id: 'royalties.create', name: 'Create Royalties', category: 'Royalty Management', description: 'Create new royalty records' },
            { id: 'royalties.edit', name: 'Edit Royalties', category: 'Royalty Management', description: 'Modify royalty records' },
            { id: 'royalties.delete', name: 'Delete Royalties', category: 'Royalty Management', description: 'Delete royalty records' },
            { id: 'royalties.approve', name: 'Approve Royalties', category: 'Royalty Management', description: 'Approve royalty payments' },

            // Financial Management
            { id: 'finance.view', name: 'View Financial Data', category: 'Financial Management', description: 'View financial information' },
            { id: 'finance.edit', name: 'Edit Financial Data', category: 'Financial Management', description: 'Modify financial records' },
            { id: 'finance.reports', name: 'Financial Reports', category: 'Financial Management', description: 'Generate and view financial reports' },

            // Audit and Compliance
            { id: 'audit.view', name: 'View Audit Logs', category: 'Audit & Compliance', description: 'View system audit logs' },
            { id: 'audit.export', name: 'Export Audit Logs', category: 'Audit & Compliance', description: 'Export audit data' },
            { id: 'compliance.manage', name: 'Manage Compliance', category: 'Audit & Compliance', description: 'Manage compliance requirements' },

            // System Administration
            { id: 'system.settings', name: 'System Settings', category: 'System Administration', description: 'Modify system settings' },
            { id: 'system.backup', name: 'System Backup', category: 'System Administration', description: 'Perform system backups' },
            { id: 'system.maintenance', name: 'System Maintenance', category: 'System Administration', description: 'Perform system maintenance' },

            // Reports and Analytics
            { id: 'reports.view', name: 'View Reports', category: 'Reports & Analytics', description: 'View system reports' },
            { id: 'reports.create', name: 'Create Reports', category: 'Reports & Analytics', description: 'Create custom reports' },
            { id: 'reports.export', name: 'Export Reports', category: 'Reports & Analytics', description: 'Export report data' },

            // Document Management
            { id: 'documents.view', name: 'View Documents', category: 'Document Management', description: 'View uploaded documents' },
            { id: 'documents.upload', name: 'Upload Documents', category: 'Document Management', description: 'Upload new documents' },
            { id: 'documents.edit', name: 'Edit Documents', category: 'Document Management', description: 'Modify document metadata' },
            { id: 'documents.delete', name: 'Delete Documents', category: 'Document Management', description: 'Delete documents' }
        ];

        permissions.forEach(permission => {
            this.permissionRegistry.set(permission.id, permission);
        });
    }

    /**
     * Initialize default roles with permissions
     */
    initializeDefaultRoles() {
        const roles = {
            'Super Administrator': {
                permissions: Array.from(this.permissionRegistry.keys()),
                description: 'Full system access with all permissions',
                inherits: [],
                color: '#dc3545'
            },
            'Administrator': {
                permissions: [
                    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.bulk',
                    'roles.view', 'roles.assign',
                    'royalties.view', 'royalties.create', 'royalties.edit', 'royalties.approve',
                    'finance.view', 'finance.reports',
                    'audit.view', 'audit.export',
                    'reports.view', 'reports.create', 'reports.export',
                    'documents.view', 'documents.upload', 'documents.edit'
                ],
                description: 'Administrative access with user and system management',
                inherits: ['Editor'],
                color: '#007bff'
            },
            'Finance Officer': {
                permissions: [
                    'users.view',
                    'royalties.view', 'royalties.create', 'royalties.edit', 'royalties.approve',
                    'finance.view', 'finance.edit', 'finance.reports',
                    'reports.view', 'reports.create', 'reports.export',
                    'documents.view', 'documents.upload'
                ],
                description: 'Financial management and royalty processing',
                inherits: ['Viewer'],
                color: '#28a745'
            },
            'Auditor': {
                permissions: [
                    'users.view',
                    'royalties.view',
                    'finance.view',
                    'audit.view', 'audit.export',
                    'compliance.manage',
                    'reports.view', 'reports.create', 'reports.export',
                    'documents.view'
                ],
                description: 'Audit and compliance oversight',
                inherits: ['Viewer'],
                color: '#ffc107'
            },
            'Editor': {
                permissions: [
                    'users.view',
                    'royalties.view', 'royalties.create', 'royalties.edit',
                    'reports.view', 'reports.export',
                    'documents.view', 'documents.upload', 'documents.edit'
                ],
                description: 'Content editing and data management',
                inherits: ['Viewer'],
                color: '#17a2b8'
            },
            'Viewer': {
                permissions: [
                    'users.view',
                    'royalties.view',
                    'finance.view',
                    'reports.view',
                    'documents.view'
                ],
                description: 'Read-only access to system data',
                inherits: [],
                color: '#6c757d'
            }
        };

        Object.entries(roles).forEach(([roleName, roleData]) => {
            this.roleHierarchy.set(roleName, roleData);
        });
    }

    /**
     * Initialize permission templates
     */
    initializePermissionTemplates() {
        const templates = {
            'Department Manager': {
                name: 'Department Manager',
                description: 'Standard permissions for department managers',
                permissions: [
                    'users.view', 'users.create', 'users.edit',
                    'royalties.view', 'royalties.create', 'royalties.edit',
                    'reports.view', 'reports.create',
                    'documents.view', 'documents.upload'
                ]
            },
            'Data Entry Clerk': {
                name: 'Data Entry Clerk',
                description: 'Basic permissions for data entry staff',
                permissions: [
                    'royalties.view', 'royalties.create',
                    'documents.view', 'documents.upload'
                ]
            },
            'Financial Analyst': {
                name: 'Financial Analyst',
                description: 'Financial analysis and reporting permissions',
                permissions: [
                    'royalties.view',
                    'finance.view', 'finance.reports',
                    'reports.view', 'reports.create', 'reports.export'
                ]
            },
            'Compliance Officer': {
                name: 'Compliance Officer',
                description: 'Compliance and audit permissions',
                permissions: [
                    'audit.view', 'audit.export',
                    'compliance.manage',
                    'reports.view', 'reports.export'
                ]
            }
        };

        Object.entries(templates).forEach(([templateId, template]) => {
            this.permissionTemplates.set(templateId, template);
        });
    }

    /**
     * Check if user has specific permission
     */
    async userHasPermission(userId, permissionId) {
        try {
            const user = await this.getUser(userId);
            if (!user) return false;

            const userPermissions = await this.getUserPermissions(userId);
            return userPermissions.includes(permissionId);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to check user permission');
            return false;
        }
    }

    /**
     * Get all permissions for a user
     */
    async getUserPermissions(userId) {
        try {
            const user = await this.getUser(userId);
            if (!user || !user.role) return [];

            return this.getRolePermissions(user.role);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to get user permissions');
            return [];
        }
    }

    /**
     * Get permissions for a role (including inherited permissions)
     */
    getRolePermissions(roleName) {
        const permissions = new Set();
        const visited = new Set();

        const collectPermissions = (role) => {
            if (visited.has(role)) return; // Prevent infinite loops
            visited.add(role);

            const roleData = this.roleHierarchy.get(role);
            if (!roleData) return;

            // Add role's own permissions
            roleData.permissions.forEach(permission => permissions.add(permission));

            // Add inherited permissions
            roleData.inherits.forEach(inheritedRole => {
                collectPermissions(inheritedRole);
            });
        };

        collectPermissions(roleName);
        return Array.from(permissions);
    }

    /**
     * Create custom role
     */
    async createRole(roleName, permissions, description = '', inherits = [], color = '#6c757d') {
        try {
            const roleData = {
                permissions: [...permissions],
                description,
                inherits: [...inherits],
                color,
                custom: true,
                createdAt: new Date().toISOString()
            };

            this.roleHierarchy.set(roleName, roleData);
            
            // Save to database
            await dbService.put('roles', { 
                id: roleName, 
                name: roleName, 
                ...roleData 
            });

            return roleData;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to create role');
            throw error;
        }
    }

    /**
     * Update existing role
     */
    async updateRole(roleName, updates) {
        try {
            const existingRole = this.roleHierarchy.get(roleName);
            if (!existingRole) {
                throw new Error(`Role ${roleName} not found`);
            }

            const updatedRole = {
                ...existingRole,
                ...updates,
                modifiedAt: new Date().toISOString()
            };

            this.roleHierarchy.set(roleName, updatedRole);
            
            // Save to database
            await dbService.put('roles', { 
                id: roleName, 
                name: roleName, 
                ...updatedRole 
            });

            return updatedRole;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to update role');
            throw error;
        }
    }

    /**
     * Delete custom role
     */
    async deleteRole(roleName) {
        try {
            const role = this.roleHierarchy.get(roleName);
            if (!role || !role.custom) {
                throw new Error(`Cannot delete system role: ${roleName}`);
            }

            this.roleHierarchy.delete(roleName);
            await dbService.delete('roles', roleName);

            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to delete role');
            throw error;
        }
    }

    /**
     * Get all available roles
     */
    getAllRoles() {
        return Array.from(this.roleHierarchy.entries()).map(([name, data]) => ({
            name,
            ...data
        }));
    }

    /**
     * Get all available permissions
     */
    getAllPermissions() {
        return Array.from(this.permissionRegistry.values());
    }

    /**
     * Get permissions by category
     */
    getPermissionsByCategory() {
        const categories = {};
        
        this.permissionRegistry.forEach(permission => {
            if (!categories[permission.category]) {
                categories[permission.category] = [];
            }
            categories[permission.category].push(permission);
        });

        return categories;
    }

    /**
     * Get permission templates
     */
    getPermissionTemplates() {
        return Array.from(this.permissionTemplates.values());
    }

    /**
     * Apply permission template to user
     */
    async applyPermissionTemplate(userId, templateId) {
        try {
            const template = this.permissionTemplates.get(templateId);
            if (!template) {
                throw new Error(`Template ${templateId} not found`);
            }

            // Create a custom role based on the template
            const roleName = `${template.name}_${Date.now()}`;
            await this.createRole(
                roleName,
                template.permissions,
                `Custom role based on ${template.name} template`
            );

            // Assign role to user
            await this.assignRoleToUser(userId, roleName);

            return roleName;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to apply permission template');
            throw error;
        }
    }

    /**
     * Assign role to user
     */
    async assignRoleToUser(userId, roleName) {
        try {
            const user = await this.getUser(userId);
            if (!user) {
                throw new Error(`User ${userId} not found`);
            }

            const role = this.roleHierarchy.get(roleName);
            if (!role) {
                throw new Error(`Role ${roleName} not found`);
            }

            user.role = roleName;
            user.roleAssignedAt = new Date().toISOString();

            await dbService.put('users', user);
            
            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to assign role to user');
            throw error;
        }
    }

    /**
     * Get user from database
     */
    async getUser(userId) {
        try {
            return await dbService.getById('users', userId);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to get user');
            return null;
        }
    }

    /**
     * Log permission change for audit
     */
    async logPermissionChange(userId, action, details) {
        try {
            const auditEntry = {
                userId,
                action,
                details: JSON.stringify(details),
                timestamp: new Date().toISOString(),
                type: 'permission_change'
            };

            await dbService.add('auditLog', auditEntry);
            return auditEntry;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to log permission change');
        }
    }

    /**
     * Validate role hierarchy (prevent circular inheritance)
     */
    validateRoleHierarchy(roleName, inherits) {
        const visited = new Set();
        
        const checkCircular = (role, path) => {
            if (path.includes(role)) {
                return false; // Circular dependency found
            }
            
            if (visited.has(role)) {
                return true; // Already validated
            }
            
            visited.add(role);
            const roleData = this.roleHierarchy.get(role);
            
            if (!roleData) return true;
            
            const newPath = [...path, role];
            return roleData.inherits.every(inheritedRole => 
                checkCircular(inheritedRole, newPath)
            );
        };

        return inherits.every(inheritedRole => 
            checkCircular(inheritedRole, [roleName])
        );
    }
}

export const permissionService = new PermissionService();
