// Action Handlers Module

export class UserActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    editUser(userId) {
        const user = this.dataManager.findUserById(userId);
        if (user) {
            this.notificationManager.show(`Edit functionality for ${user.username} would be implemented here`, 'info');
        }
    }

    deleteUser(userId) {
        const user = this.dataManager.findUserById(userId);
        if (!user) return;
        
        if (confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
            const deletedUser = this.dataManager.deleteUser(userId);
            
            if (deletedUser) {
                // Add audit entry
                this.dataManager.addAuditEntry({
                    user: 'currentUser', // Would get from auth manager
                    action: 'Delete User',
                    target: user.username,
                    ipAddress: '192.168.1.100',
                    status: 'Success',
                    details: `User ${user.username} deleted`
                });
                
                this.notificationManager.show(`User "${user.username}" deleted successfully`, 'success');
                
                // Reload section
                document.dispatchEvent(new CustomEvent('reloadSection', {
                    detail: { sectionId: 'user-management' }
                }));
            }
        }
    }

    viewUserDetails(userId) {
        const user = this.dataManager.findUserById(userId);
        if (!user) {
            this.notificationManager.show('User not found', 'error');
            return;
        }

        const modal = this.createUserDetailsModal(user);
        document.body.appendChild(modal);

        // Setup close handlers
        const closeBtn = modal.querySelector('.modal-close');
        const okBtn = modal.querySelector('.btn-primary');
        
        [closeBtn, okBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    createUserDetailsModal(user) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-user"></i> User Details: ${user.username}</h3>
                    <button class="modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="user-details-grid">
                        <div class="details-section">
                            <h5><i class="fas fa-id-card"></i> Personal Information</h5>
                            <div class="details-row">
                                <span class="label">Username:</span>
                                <span class="value">${user.username}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Email:</span>
                                <span class="value">${user.email}</span>
                            </div>
                        </div>

                        <div class="details-section">
                            <h5><i class="fas fa-briefcase"></i> Work Information</h5>
                            <div class="details-row">
                                <span class="label">Role:</span>
                                <span class="value"><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></span>
                            </div>
                            <div class="details-row">
                                <span class="label">Department:</span>
                                <span class="value">${user.department}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Status:</span>
                                <span class="value"><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></span>
                            </div>
                        </div>

                        <div class="details-section">
                            <h5><i class="fas fa-shield-alt"></i> Security Information</h5>
                            <div class="details-row">
                                <span class="label">Last Login:</span>
                                <span class="value">${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Failed Attempts:</span>
                                <span class="value">${user.failedAttempts || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary">
                        <i class="fas fa-check"></i> OK
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    resetUserPassword(userId) {
        const user = this.dataManager.findUserById(userId);
        if (!user) {
            this.notificationManager.show('User not found', 'error');
            return;
        }

        if (confirm(`Reset password for user "${user.username}"? They will be required to change it on next login.`)) {
            // Generate temporary password
            const tempPassword = this.generateTempPassword();
            
            // Add audit entry
            this.dataManager.addAuditEntry({
                user: 'currentUser',
                action: 'Reset Password',
                target: user.username,
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Password reset for user ${user.username}`
            });

            // Show temporary password to admin
            alert(`Password reset for ${user.username}\nTemporary password: ${tempPassword}\n\nPlease provide this to the user securely.`);
            
            this.notificationManager.show(`Password reset for ${user.username}`, 'success');
        }
    }

    generateTempPassword() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    bulkDeleteUsers() {
        if (this.selectedUsers.size === 0) {
            this.notificationManager.show('No users selected', 'warning');
            return;
        }

        if (confirm(`Delete ${this.selectedUsers.size} selected users? This cannot be undone.`)) {
            let deletedCount = 0;
            this.selectedUsers.forEach(userId => {
                const deleted = this.dataManager.deleteUser(userId);
                if (deleted) deletedCount++;
            });

            this.dataManager.addAuditEntry({
                user: 'currentUser',
                action: 'Bulk Delete Users',
                target: `${deletedCount} users`,
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Bulk deleted ${deletedCount} user accounts`
            });

            this.notificationManager.show(`${deletedCount} users deleted successfully`, 'success');
            this.selectedUsers.clear();
            
            // Reload section
            document.dispatchEvent(new CustomEvent('reloadSection', {
                detail: { sectionId: 'user-management' }
            }));
        }
    }
}

export class RecordActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewRecord(recordId) {
        const record = this.dataManager.findRecordById(recordId);
        if (record) {
            alert(`Record: ${record.referenceNumber}\nEntity: ${record.entity}\nMineral: ${record.mineral}\nVolume: ${record.volume}\nRoyalties: E${record.royalties}\nStatus: ${record.status}`);
        }
    }

    editRecord(recordId) {
        this.notificationManager.show(`Edit functionality for record ${recordId} would be implemented here`, 'info');
    }

    showAddRecordForm() {
        this.notificationManager.show('Add record form would be implemented here', 'info');
    }

    exportRecords() {
        this.notificationManager.show('Export functionality would be implemented here', 'info');
    }
}

export class ContractActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewContractDetails(contractId) {
        const contract = this.dataManager.findContractById(contractId);
        if (!contract) return;
        
        const details = `
Contract Details for ${contractId}:

Stakeholder: ${contract.stakeholder}
Type: ${contract.contractType}
Calculation Method: ${contract.calculationMethod}
Royalty Rate: ${contract.royaltyRate}
Payment Schedule: ${contract.paymentSchedule}
Contract Period: ${contract.startDate} to ${contract.endDate}
Status: ${contract.status}
Total Value: E ${(contract.totalValue / 1000000).toFixed(1)}M

Escalation Clause: ${contract.escalationClause?.enabled ? 'Yes' : 'No'}
${contract.escalationClause?.enabled ? `Next Escalation: ${contract.escalationClause.nextEscalation}` : ''}

Conditions:
${contract.conditions.map(condition => `• ${condition}`).join('\n')}

Late Fee: ${contract.lateFeeRate}% after ${contract.gracePeriod} days
Last Review: ${contract.lastReview}
Next Review: ${contract.nextReview}
        `;
        
        alert(details);
    }

    editContract(contractId) {
        this.notificationManager.show(`Edit functionality for contract ${contractId} would open a comprehensive contract editing form`, 'info');
    }

    downloadContract(contractId) {
        this.notificationManager.show(`Downloading contract ${contractId} as PDF`, 'success');
    }

    showAddContractForm() {
        this.notificationManager.show('Add contract form would open with fields for all contract terms, stakeholder details, and calculation methods', 'info');
    }

    showContractTemplates() {
        this.notificationManager.show('Contract templates library would show pre-configured templates for different stakeholder types', 'info');
    }

    exportContracts() {
        this.notificationManager.show('Exporting all contracts with detailed terms and conditions', 'success');
    }
}
