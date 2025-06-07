// Section Managers Module

export class UserManagementManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    loadSection() {
        const section = document.getElementById('user-management');
        if (!section || section.innerHTML.trim()) return;
        
        const userAccounts = this.dataManager.getUserAccounts();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>User Management</h1>
                    <p>Manage system users and permissions</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-user-btn">
                        <i class="fas fa-plus"></i> Add User
                    </button>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Active Users</h3>
                    </div>
                    <div class="card-body">
                        <p id="active-users-count">${userAccounts.filter(u => u.status === 'Active').length}</p>
                    </div>
                </div>
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Failed Logins</h3>
                    </div>
                    <div class="card-body">
                        <p id="failed-logins-count">${userAccounts.reduce((sum, u) => sum + (u.failedAttempts || 0), 0)}</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>User Accounts</h3>
                </div>
                <div class="table-container">
                    <table class="data-table" id="users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-tbody">
                            ${userAccounts.map(user => `
                                <tr>
                                    <td>${user.username}</td>
                                    <td>${user.email}</td>
                                    <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                                    <td>${user.department}</td>
                                    <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                                    <td>${user.lastLogin || 'Never'}</td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-secondary" onclick="window.userActions.editUser(${user.id})">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="window.userActions.deleteUser(${user.id})">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

export class RoyaltyRecordsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    loadSection() {
        const section = document.getElementById('royalty-records');
        if (!section) return;
        
        const royaltyRecords = this.dataManager.getRoyaltyRecords();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Royalty Records</h1>
                    <p>Manage royalty payments and records</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.recordActions.showAddRecordForm()">
                        <i class="fas fa-plus"></i> Add Record
                    </button>
                    <button class="btn btn-info" onclick="window.recordActions.exportRecords()">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Royalty Records</h3>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Entity</th>
                                <th>Mineral</th>
                                <th>Volume</th>
                                <th>Tariff</th>
                                <th>Royalties</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${royaltyRecords.map(record => `
                                <tr>
                                    <td>${record.referenceNumber}</td>
                                    <td>${record.entity}</td>
                                    <td>${record.mineral}</td>
                                    <td>${record.volume.toLocaleString()}</td>
                                    <td>E${record.tariff}</td>
                                    <td>E${record.royalties.toLocaleString()}</td>
                                    <td>${record.date}</td>
                                    <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-secondary" onclick="window.recordActions.viewRecord(${record.id})">
                                                <i class="fas fa-eye"></i> View
                                            </button>
                                            <button class="btn btn-sm btn-info" onclick="window.recordActions.editRecord(${record.id})">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

export class ContractManagementManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    loadSection() {
        const section = document.getElementById('contract-management');
        if (!section) return;
        
        const contracts = this.dataManager.getContracts();
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>📋 Contract Management</h1>
                    <p>Securely store and manage diverse royalty agreements with various stakeholders</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-success" onclick="window.contractActions.showAddContractForm()">
                        <i class="fas fa-plus"></i> New Contract
                    </button>
                    <button class="btn btn-info" onclick="window.contractActions.showContractTemplates()">
                        <i class="fas fa-file-contract"></i> Templates
                    </button>
                    <button class="btn btn-primary" onclick="window.contractActions.exportContracts()">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            
            <!-- Contract Overview Metrics -->
            <div class="charts-grid">
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-contract"></i> Active Contracts</h3>
                    </div>
                    <div class="card-body">
                        <p>${contracts.filter(c => c.status === 'active').length}</p>
                        <small><i class="fas fa-arrow-up trend-positive"></i> ${contracts.filter(c => new Date(c.signedDate) > new Date(Date.now() - 90*24*60*60*1000)).length} new this quarter</small>
                    </div>
                </div>
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-calendar-alt"></i> Expiring Soon</h3>
                    </div>
                    <div class="card-body">
                        <p>${contracts.filter(c => new Date(c.endDate) < new Date(Date.now() + 90*24*60*60*1000)).length}</p>
                        <small><i class="fas fa-exclamation-triangle trend-negative"></i> Within 90 days</small>
                    </div>
                </div>
                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-handshake"></i> Total Value</h3>
                    </div>
                    <div class="card-body">
                        <p>E ${(contracts.reduce((sum, c) => sum + c.totalValue, 0) / 1000000).toFixed(1)}M</p>
                        <small><i class="fas fa-arrow-up trend-positive"></i> +12% YTD</small>
                    </div>
                </div>

                <div class="metric-card card">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Stakeholder Types</h3>
                    </div>
                    <div class="card-body">
                        <p>4</p>
                        <small>
                            Gov: ${contracts.filter(c => c.stakeholderType === 'government').length} | 
                            Private: ${contracts.filter(c => c.stakeholderType === 'private').length} | 
                            Landowners: ${contracts.filter(c => c.stakeholderType === 'landowner').length} |
                            JV: ${contracts.filter(c => c.stakeholderType === 'joint-venture').length}
                        </small>
                    </div>
                </div>
            </div>

            <!-- Contracts Registry Table -->
            <div class="table-container">
                <div class="section-header">
                    <h4>📋 Contract Registry</h4>
                    <div class="table-actions">
                        <button class="btn btn-info btn-sm">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                        <button class="btn btn-secondary btn-sm">
                            <i class="fas fa-sort"></i> Sort
                        </button>
                        <button class="btn btn-warning btn-sm">
                            <i class="fas fa-bell"></i> Alerts
                        </button>
                    </div>
                </div>
                <table class="data-table" id="contracts-table">
                    <thead>
                        <tr>
                            <th>Contract ID</th>
                            <th>Stakeholder</th>
                            <th>Type</th>
                            <th>Calculation Method</th>
                            <th>Royalty Rate</th>
                            <th>Payment Schedule</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contracts.map(contract => `
                            <tr>
                                <td>${contract.id}</td>
                                <td>${contract.stakeholder}</td>
                                <td><span class="contract-type-badge ${contract.stakeholderType}">${contract.stakeholderType.charAt(0).toUpperCase() + contract.stakeholderType.slice(1)}</span></td>
                                <td><span class="method-badge ${contract.calculationMethod}">${contract.calculationMethod.charAt(0).toUpperCase() + contract.calculationMethod.slice(1)}</span></td>
                                <td>${contract.royaltyRate}</td>
                                <td>${contract.paymentSchedule.charAt(0).toUpperCase() + contract.paymentSchedule.slice(1)}</td>
                                <td>${contract.endDate}</td>
                                <td><span class="status-badge ${contract.status.replace('-', '_')}">${contract.status.charAt(0).toUpperCase() + contract.status.slice(1).replace('-', ' ')}</span></td>
                                <td>E ${(contract.totalValue / 1000000).toFixed(1)}M</td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-info btn-sm" onclick="window.contractActions.viewContractDetails('${contract.id}')"><i class="fas fa-eye"></i></button>
                                        <button class="btn btn-warning btn-sm" onclick="window.contractActions.editContract('${contract.id}')"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-secondary btn-sm" onclick="window.contractActions.downloadContract('${contract.id}')"><i class="fas fa-download"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}