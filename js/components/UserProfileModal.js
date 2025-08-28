/**
 * User Profile Modal Component
 * Provides detailed user profile management interface
 */

import { permissionService } from '../services/permission.service.js';
import { userSecurityService } from '../services/user-security.service.js';

export class UserProfileModal {
    constructor(userManager) {
        this.userManager = userManager;
        this.currentUser = null;
        this.activeTab = 'profile';
    }

    /**
     * Show user profile modal
     */
    async showProfile(userId) {
        try {
            this.currentUser = await this.userManager.getUserProfile(userId);
            if (!this.currentUser) {
                throw new Error('User not found');
            }

            const modal = this.createProfileModal();
            document.body.appendChild(modal);
            modal.style.display = 'block';
            
            await this.loadProfileData();
        } catch (error) {
            console.error('Failed to show user profile:', error);
            alert('Failed to load user profile');
        }
    }

    /**
     * Create profile modal HTML
     */
    createProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal profile-modal';
        modal.innerHTML = this.getProfileModalHTML();
        
        // Setup event listeners
        this.setupModalEventListeners(modal);
        
        return modal;
    }

    /**
     * Get profile modal HTML
     */
    getProfileModalHTML() {
        return `
            <div class="modal-content profile-modal-content">
                <div class="modal-header">
                    <div class="user-header">
                        <div class="user-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-info">
                            <h3>${this.currentUser.username}</h3>
                            <p>${this.currentUser.email}</p>
                            <span class="status-badge ${this.currentUser.status.toLowerCase()}">${this.currentUser.status}</span>
                        </div>
                    </div>
                    <span class="close">&times;</span>
                </div>
                
                <div class="modal-body">
                    <div class="profile-tabs">
                        <button class="tab-btn active" data-tab="profile">
                            <i class="fas fa-user"></i> Profile
                        </button>
                        <button class="tab-btn" data-tab="security">
                            <i class="fas fa-shield-alt"></i> Security
                        </button>
                        <button class="tab-btn" data-tab="permissions">
                            <i class="fas fa-key"></i> Permissions
                        </button>
                        <button class="tab-btn" data-tab="activity">
                            <i class="fas fa-chart-line"></i> Activity
                        </button>
                        <button class="tab-btn" data-tab="onboarding">
                            <i class="fas fa-tasks"></i> Onboarding
                        </button>
                    </div>
                    
                    <div class="profile-content">
                        <!-- Profile Tab -->
                        <div class="tab-content active" id="profile-tab">
                            ${this.getProfileTabHTML()}
                        </div>
                        
                        <!-- Security Tab -->
                        <div class="tab-content" id="security-tab">
                            ${this.getSecurityTabHTML()}
                        </div>
                        
                        <!-- Permissions Tab -->
                        <div class="tab-content" id="permissions-tab">
                            ${this.getPermissionsTabHTML()}
                        </div>
                        
                        <!-- Activity Tab -->
                        <div class="tab-content" id="activity-tab">
                            ${this.getActivityTabHTML()}
                        </div>
                        
                        <!-- Onboarding Tab -->
                        <div class="tab-content" id="onboarding-tab">
                            ${this.getOnboardingTabHTML()}
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button type="button" class="btn btn-primary" id="save-profile">Save Changes</button>
                </div>
            </div>
        `;
    }

    /**
     * Get profile tab HTML
     */
    getProfileTabHTML() {
        return `
            <div class="profile-form">
                <div class="form-section">
                    <h5><i class="fas fa-user"></i> Basic Information</h5>
                    <div class="grid-2">
                        <div class="form-group">
                            <label for="profile-username">Username</label>
                            <input type="text" id="profile-username" class="form-control" value="${this.currentUser.username}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="profile-email">Email</label>
                            <input type="email" id="profile-email" class="form-control" value="${this.currentUser.email}">
                        </div>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label for="profile-role">Role</label>
                            <select id="profile-role" class="form-control">
                                <option value="Administrator" ${this.currentUser.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
                                <option value="Editor" ${this.currentUser.role === 'Editor' ? 'selected' : ''}>Editor</option>
                                <option value="Auditor" ${this.currentUser.role === 'Auditor' ? 'selected' : ''}>Auditor</option>
                                <option value="Finance Officer" ${this.currentUser.role === 'Finance Officer' ? 'selected' : ''}>Finance Officer</option>
                                <option value="Viewer" ${this.currentUser.role === 'Viewer' ? 'selected' : ''}>Viewer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="profile-department">Department</label>
                            <select id="profile-department" class="form-control">
                                <option value="Administration" ${this.currentUser.department === 'Administration' ? 'selected' : ''}>Administration</option>
                                <option value="Finance" ${this.currentUser.department === 'Finance' ? 'selected' : ''}>Finance</option>
                                <option value="Operations" ${this.currentUser.department === 'Operations' ? 'selected' : ''}>Operations</option>
                                <option value="Audit & Compliance" ${this.currentUser.department === 'Audit & Compliance' ? 'selected' : ''}>Audit & Compliance</option>
                                <option value="Legal Affairs" ${this.currentUser.department === 'Legal Affairs' ? 'selected' : ''}>Legal Affairs</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label for="profile-status">Status</label>
                            <select id="profile-status" class="form-control">
                                <option value="Active" ${this.currentUser.status === 'Active' ? 'selected' : ''}>Active</option>
                                <option value="Inactive" ${this.currentUser.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="Locked" ${this.currentUser.status === 'Locked' ? 'selected' : ''}>Locked</option>
                                <option value="Expired" ${this.currentUser.status === 'Expired' ? 'selected' : ''}>Expired</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="profile-created">Created Date</label>
                            <input type="text" id="profile-created" class="form-control" value="${new Date(this.currentUser.created).toLocaleDateString()}" readonly>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h5><i class="fas fa-info-circle"></i> Additional Information</h5>
                    <div class="grid-2">
                        <div class="form-group">
                            <label for="profile-phone">Phone Number</label>
                            <input type="tel" id="profile-phone" class="form-control" value="${this.currentUser.profile?.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label for="profile-title">Job Title</label>
                            <input type="text" id="profile-title" class="form-control" value="${this.currentUser.profile?.title || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profile-bio">Bio/Notes</label>
                        <textarea id="profile-bio" class="form-control" rows="3" placeholder="Additional notes or bio">${this.currentUser.profile?.bio || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get security tab HTML
     */
    getSecurityTabHTML() {
        return `
            <div class="security-settings">
                <div class="security-section">
                    <h5><i class="fas fa-lock"></i> Authentication Settings</h5>
                    <div class="security-options">
                        <div class="security-option">
                            <div class="option-info">
                                <strong>Two-Factor Authentication</strong>
                                <p>Add an extra layer of security to the account</p>
                            </div>
                            <div class="option-control">
                                <label class="switch">
                                    <input type="checkbox" id="profile-2fa" ${this.currentUser.twoFactorEnabled ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="security-option">
                            <div class="option-info">
                                <strong>Force Password Change</strong>
                                <p>Require user to change password on next login</p>
                            </div>
                            <div class="option-control">
                                <label class="switch">
                                    <input type="checkbox" id="profile-force-password" ${this.currentUser.forcePasswordChange ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="security-section">
                    <h5><i class="fas fa-key"></i> Password Policy</h5>
                    <div class="form-group">
                        <label for="profile-password-policy">Password Policy</label>
                        <select id="profile-password-policy" class="form-control">
                            <option value="default" ${(this.currentUser.passwordPolicy || 'default') === 'default' ? 'selected' : ''}>Default Policy</option>
                            <option value="strict" ${this.currentUser.passwordPolicy === 'strict' ? 'selected' : ''}>Strict Policy</option>
                            <option value="relaxed" ${this.currentUser.passwordPolicy === 'relaxed' ? 'selected' : ''}>Relaxed Policy</option>
                        </select>
                    </div>
                    <div class="password-policy-info">
                        <small class="text-muted">
                            Password policies define minimum requirements for password strength and expiration.
                        </small>
                    </div>
                </div>
                
                <div class="security-section">
                    <h5><i class="fas fa-chart-line"></i> Login Activity</h5>
                    <div class="login-stats">
                        <div class="stat-item">
                            <span class="stat-label">Last Login:</span>
                            <span class="stat-value">${this.currentUser.lastLogin === 'Never' ? 'Never' : new Date(this.currentUser.lastLogin).toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Failed Login Attempts (24h):</span>
                            <span class="stat-value" id="failed-attempts">Loading...</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Account Created:</span>
                            <span class="stat-value">${new Date(this.currentUser.created).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="security-actions">
                    <button class="btn btn-warning btn-sm" id="reset-password">
                        <i class="fas fa-key"></i> Reset Password
                    </button>
                    <button class="btn btn-info btn-sm" id="send-security-notification">
                        <i class="fas fa-bell"></i> Send Security Notification
                    </button>
                    <button class="btn btn-danger btn-sm" id="revoke-sessions">
                        <i class="fas fa-sign-out-alt"></i> Revoke All Sessions
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get permissions tab HTML
     */
    getPermissionsTabHTML() {
        const permissions = this.currentUser.permissions || [];
        const allPermissions = permissionService.getPermissionsByCategory();
        
        let permissionsHTML = '<div class="permissions-overview">';
        
        Object.entries(allPermissions).forEach(([category, categoryPermissions]) => {
            permissionsHTML += `
                <div class="permission-category">
                    <h6><i class="fas fa-folder"></i> ${category}</h6>
                    <div class="permission-list">
            `;
            
            categoryPermissions.forEach(permission => {
                const hasPermission = permissions.includes(permission.id);
                permissionsHTML += `
                    <div class="permission-item ${hasPermission ? 'granted' : 'denied'}">
                        <div class="permission-info">
                            <span class="permission-name">${permission.name}</span>
                            <small class="permission-description">${permission.description}</small>
                        </div>
                        <div class="permission-status">
                            <i class="fas ${hasPermission ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'}"></i>
                        </div>
                    </div>
                `;
            });
            
            permissionsHTML += `
                    </div>
                </div>
            `;
        });
        
        permissionsHTML += '</div>';
        
        return `
            <div class="permissions-tab">
                <div class="permissions-header">
                    <h5><i class="fas fa-key"></i> User Permissions</h5>
                    <div class="permission-summary">
                        <span class="permission-count">
                            ${permissions.length} permissions granted via <strong>${this.currentUser.role}</strong> role
                        </span>
                    </div>
                </div>
                
                ${permissionsHTML}
                
                <div class="permission-actions">
                    <button class="btn btn-info btn-sm" id="apply-permission-template">
                        <i class="fas fa-stamp"></i> Apply Permission Template
                    </button>
                    <button class="btn btn-primary btn-sm" id="edit-role-permissions">
                        <i class="fas fa-edit"></i> Edit Role Permissions
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get activity tab HTML
     */
    getActivityTabHTML() {
        return `
            <div class="activity-tab">
                <div class="activity-summary">
                    <h5><i class="fas fa-chart-line"></i> Activity Summary</h5>
                    <div class="activity-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-sign-in-alt"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-number" id="login-count">-</span>
                                <span class="stat-label">Total Logins</span>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-number" id="session-duration">-</span>
                                <span class="stat-label">Avg Session</span>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-number" id="failed-logins">-</span>
                                <span class="stat-label">Failed Logins</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="activity-timeline">
                    <h6><i class="fas fa-history"></i> Recent Activity</h6>
                    <div class="timeline" id="activity-timeline">
                        <div class="timeline-item">
                            <div class="timeline-content">
                                <div class="loading-spinner">Loading activity...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get onboarding tab HTML
     */
    getOnboardingTabHTML() {
        const onboardingStatus = this.userManager.getUserOnboardingStatus(this.currentUser.id);
        
        if (!onboardingStatus) {
            return `
                <div class="onboarding-tab">
                    <div class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <p>No onboarding process configured for this user</p>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="onboarding-tab">
                <div class="onboarding-header">
                    <h5><i class="fas fa-tasks"></i> Onboarding Progress</h5>
                    <div class="progress-summary">
                        <div class="progress-circle">
                            <span class="progress-percentage">${Math.round(onboardingStatus.progress)}%</span>
                        </div>
                        <div class="progress-info">
                            <span>${onboardingStatus.completed.length} of ${onboardingStatus.template.steps.length} steps completed</span>
                            <small>${onboardingStatus.isComplete ? 'Onboarding Complete!' : 'In Progress'}</small>
                        </div>
                    </div>
                </div>
                
                <div class="onboarding-steps">
                    ${onboardingStatus.template.steps.map((step, index) => {
                        const isCompleted = onboardingStatus.completed.includes(step.id);
                        return `
                            <div class="onboarding-step ${isCompleted ? 'completed' : 'pending'} ${step.required ? 'required' : 'optional'}">
                                <div class="step-marker">
                                    <span class="step-number">${index + 1}</span>
                                    ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
                                </div>
                                <div class="step-content">
                                    <h6>${step.name}</h6>
                                    <div class="step-actions">
                                        ${step.required ? '<span class="badge badge-danger">Required</span>' : '<span class="badge badge-secondary">Optional</span>'}
                                        <button class="btn btn-sm ${isCompleted ? 'btn-warning' : 'btn-success'}" 
                                                onclick="this.toggleStepCompletion('${step.id}', ${!isCompleted})">
                                            ${isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners(modal) {
        // Close modal
        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Save profile
        modal.querySelector('#save-profile').addEventListener('click', () => {
            this.saveProfile();
        });

        // Security actions
        const resetPasswordBtn = modal.querySelector('#reset-password');
        if (resetPasswordBtn) {
            resetPasswordBtn.addEventListener('click', () => this.resetPassword());
        }

        const securityNotificationBtn = modal.querySelector('#send-security-notification');
        if (securityNotificationBtn) {
            securityNotificationBtn.addEventListener('click', () => this.sendSecurityNotification());
        }

        const revokeSessionsBtn = modal.querySelector('#revoke-sessions');
        if (revokeSessionsBtn) {
            revokeSessionsBtn.addEventListener('click', () => this.revokeSessions());
        }
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.activeTab = tabName;

        // Load tab-specific data
        if (tabName === 'activity') {
            this.loadActivityData();
        } else if (tabName === 'security') {
            this.loadSecurityData();
        }
    }

    /**
     * Load profile data
     */
    async loadProfileData() {
        // Profile data is already loaded in this.currentUser
    }

    /**
     * Load activity data
     */
    async loadActivityData() {
        try {
            const activity = await this.userManager.getUserActivitySummary(this.currentUser.id);
            
            // Update stats
            document.getElementById('login-count').textContent = activity.loginAttempts.filter(a => a.successful).length;
            document.getElementById('failed-logins').textContent = activity.loginAttempts.filter(a => !a.successful).length;
            
            // Calculate average session duration
            const avgDuration = this.calculateAverageSessionDuration(activity.sessions);
            document.getElementById('session-duration').textContent = avgDuration;

            // Update timeline
            this.updateActivityTimeline(activity);
        } catch (error) {
            console.error('Failed to load activity data:', error);
        }
    }

    /**
     * Load security data
     */
    async loadSecurityData() {
        try {
            const recentAttempts = await userSecurityService.getRecentLoginAttempts(this.currentUser.username, 24);
            document.getElementById('failed-attempts').textContent = recentAttempts.length;
        } catch (error) {
            console.error('Failed to load security data:', error);
        }
    }

    /**
     * Calculate average session duration
     */
    calculateAverageSessionDuration(sessions) {
        if (!sessions || sessions.length === 0) return '0m';
        
        const durations = sessions
            .filter(s => s.endTime)
            .map(s => new Date(s.endTime) - new Date(s.startTime));
        
        if (durations.length === 0) return '0m';
        
        const avgMs = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
        const avgMinutes = Math.round(avgMs / (1000 * 60));
        
        return avgMinutes > 60 ? `${Math.round(avgMinutes / 60)}h` : `${avgMinutes}m`;
    }

    /**
     * Update activity timeline
     */
    updateActivityTimeline(activity) {
        const timeline = document.getElementById('activity-timeline');
        
        // Combine all activities and sort by timestamp
        const allActivities = [
            ...activity.loginAttempts.map(a => ({ ...a, type: 'login', icon: 'fa-sign-in-alt' })),
            ...activity.securityEvents.map(e => ({ ...e, type: 'security', icon: 'fa-shield-alt' }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

        if (allActivities.length === 0) {
            timeline.innerHTML = '<div class="empty-state">No recent activity</div>';
            return;
        }

        timeline.innerHTML = allActivities.map(activity => `
            <div class="timeline-item">
                <div class="timeline-marker">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-title">${this.getActivityTitle(activity)}</span>
                        <span class="timeline-time">${new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="timeline-details">
                        ${this.getActivityDetails(activity)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Get activity title
     */
    getActivityTitle(activity) {
        if (activity.type === 'login') {
            return activity.successful ? 'Successful Login' : 'Failed Login Attempt';
        } else if (activity.type === 'security') {
            return activity.eventType.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        return 'Unknown Activity';
    }

    /**
     * Get activity details
     */
    getActivityDetails(activity) {
        if (activity.type === 'login') {
            return `IP: ${activity.ipAddress || 'unknown'}`;
        } else if (activity.type === 'security') {
            return activity.details ? JSON.stringify(JSON.parse(activity.details)) : '';
        }
        return '';
    }

    /**
     * Save profile changes
     */
    async saveProfile() {
        try {
            const profileData = {
                email: document.getElementById('profile-email').value,
                role: document.getElementById('profile-role').value,
                department: document.getElementById('profile-department').value,
                status: document.getElementById('profile-status').value,
                twoFactorEnabled: document.getElementById('profile-2fa')?.checked || false,
                forcePasswordChange: document.getElementById('profile-force-password')?.checked || false,
                passwordPolicy: document.getElementById('profile-password-policy')?.value || 'default',
                profile: {
                    phone: document.getElementById('profile-phone').value,
                    title: document.getElementById('profile-title').value,
                    bio: document.getElementById('profile-bio').value
                }
            };

            await this.userManager.updateUserProfile(this.currentUser.id, profileData);
            
            // Show success message
            this.userManager.showNotification('Profile updated successfully', 'success');
            
            // Close modal
            document.querySelector('.profile-modal').remove();
            
        } catch (error) {
            console.error('Failed to save profile:', error);
            this.userManager.showNotification('Failed to save profile changes', 'error');
        }
    }

    /**
     * Reset user password
     */
    async resetPassword() {
        if (!confirm('Are you sure you want to reset this user\'s password?')) {
            return;
        }

        try {
            // Generate temporary password
            const tempPassword = this.generateTemporaryPassword();
            
            console.log(`Password reset for ${this.currentUser.username}. Temporary password: ${tempPassword}`);
            
            // Update user to force password change
            await this.userManager.updateUserProfile(this.currentUser.id, {
                forcePasswordChange: true,
                passwordChangedAt: new Date().toISOString()
            });

            // Log security event
            await userSecurityService.logSecurityEvent('password_reset', this.currentUser.username, {
                resetBy: 'admin',
                temporary: true
            });

            alert(`Password has been reset. Temporary password: ${tempPassword}\nUser must change password on next login.`);
            
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert('Failed to reset password. Please try again.');
        }
    }

    /**
     * Send security notification
     */
    async sendSecurityNotification() {
        try {
            await userSecurityService.sendSecurityNotification(
                this.currentUser.username, 
                'security_review', 
                { 
                    message: 'Your account has been reviewed by an administrator',
                    reviewDate: new Date().toISOString()
                }
            );

            this.userManager.showNotification('Security notification sent', 'success');
        } catch (error) {
            console.error('Failed to send security notification:', error);
            this.userManager.showNotification('Failed to send notification', 'error');
        }
    }

    /**
     * Revoke all user sessions
     */
    async revokeSessions() {
        if (!confirm('Are you sure you want to revoke all active sessions for this user?')) {
            return;
        }

        try {
            // This would normally revoke all active sessions
            console.log(`Revoking all sessions for ${this.currentUser.username}`);
            
            await userSecurityService.logSecurityEvent('sessions_revoked', this.currentUser.username, {
                revokedBy: 'admin'
            });

            this.userManager.showNotification('All sessions revoked', 'success');
            
        } catch (error) {
            console.error('Failed to revoke sessions:', error);
            this.userManager.showNotification('Failed to revoke sessions', 'error');
        }
    }

    /**
     * Toggle onboarding step completion
     */
    async toggleStepCompletion(stepId, completed) {
        try {
            await this.userManager.updateOnboardingProgress(this.currentUser.id, stepId, completed);
            
            // Refresh the onboarding tab
            if (this.activeTab === 'onboarding') {
                document.getElementById('onboarding-tab').innerHTML = this.getOnboardingTabHTML();
            }
            
        } catch (error) {
            console.error('Failed to toggle step completion:', error);
            this.userManager.showNotification('Failed to update onboarding progress', 'error');
        }
    }

    /**
     * Generate temporary password
     */
    generateTemporaryPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
}
