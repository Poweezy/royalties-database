export class ContractActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewContractDetails(contractId) {
        const contract = this.dataManager.findContractById(contractId);
        if (!contract) {
            this.notificationManager.show('Contract not found', 'error');
            return;
        }

        const modal = this.createContractDetailsModal(contract);
        document.body.appendChild(modal);
        this.setupContractDetailsHandlers(modal);
    }

    createContractDetailsModal(contract) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-file-contract"></i> Contract Details: ${contract.id}</h3>
                    <button class="modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="contract-details-grid">
                        ${this.createBasicInfoSection(contract)}
                        ${this.createFinancialTermsSection(contract)}
                        ${this.createPaymentScheduleSection(contract)}
                        ${this.createEscalationClauseSection(contract)}
                        ${this.createConditionsSection(contract)}
                        ${this.createTimelineSection(contract)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary">
                        <i class="fas fa-print"></i> Print Contract
                    </button>
                    <button type="button" class="btn btn-info" onclick="window.contractActions.generateContractReport('${contract.id}')">
                        <i class="fas fa-chart-line"></i> Generate Report
                    </button>
                    <button type="button" class="btn btn-warning" onclick="window.contractActions.editContract('${contract.id}')">
                        <i class="fas fa-edit"></i> Edit Contract
                    </button>
                    <button type="button" class="btn btn-success" onclick="window.contractActions.downloadContract('${contract.id}')">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                    <button type="button" class="btn btn-primary modal-close-btn">
                        <i class="fas fa-check"></i> Close
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    createBasicInfoSection(contract) {
        return `
            <div class="details-section">
                <h5><i class="fas fa-info-circle"></i> Basic Information</h5>
                <div class="details-row">
                    <span class="label">Contract ID:</span>
                    <span class="value"><strong>${contract.id}</strong></span>
                </div>
                <div class="details-row">
                    <span class="label">Stakeholder:</span>
                    <span class="value">
                        ${contract.stakeholder}
                        <span class="contract-type-badge ${contract.stakeholderType}">
                            ${contract.stakeholderType.toUpperCase()}
                        </span>
                    </span>
                </div>
                <div class="details-row">
                    <span class="label">Mining Entity:</span>
                    <span class="value">${contract.entity}</span>
                </div>
                <div class="details-row">
                    <span class="label">Contract Type:</span>
                    <span class="value">${contract.contractType}</span>
                </div>
                <div class="details-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status-badge ${contract.status.replace('-', '_')}">
                            ${contract.status.replace('-', ' ').toUpperCase()}
                        </span>
                    </span>
                </div>
                <div class="details-row">
                    <span class="label">Signed Date:</span>
                    <span class="value">${new Date(contract.signedDate).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }

    createFinancialTermsSection(contract) {
        return `
            <div class="details-section">
                <h5><i class="fas fa-calculator"></i> Financial Terms</h5>
                <div class="details-row">
                    <span class="label">Calculation Method:</span>
                    <span class="value">
                        <span class="method-badge ${contract.calculationMethod}">
                            ${this.formatCalculationMethod(contract.calculationMethod)}
                        </span>
                    </span>
                </div>
                <div class="details-row">
                    <span class="label">Royalty Rate:</span>
                    <span class="value"><strong>${contract.royaltyRate}</strong></span>
                </div>
                <div class="details-row">
                    <span class="label">Base Rate:</span>
                    <span class="value">${contract.baseRate}${contract.rateType === 'percentage' ? '%' : ''}</span>
                </div>
                ${contract.fixedAmount ? `
                <div class="details-row">
                    <span class="label">Fixed Amount:</span>
                    <span class="value">E ${contract.fixedAmount}</span>
                </div>
                ` : ''}
                <div class="details-row">
                    <span class="label">Total Contract Value:</span>
                    <span class="value"><strong class="royalty-amount">E ${contract.totalValue.toLocaleString()}</strong></span>
                </div>
                <div class="details-row">
                    <span class="label">Late Fee Rate:</span>
                    <span class="value">${contract.lateFeeRate}% per month</span>
                </div>
                <div class="details-row">
                    <span class="label">Grace Period:</span>
                    <span class="value">${contract.gracePeriod} days</span>
                </div>
            </div>
        `;
    }

    createPaymentScheduleSection(contract) {
        return `
            <div class="details-section">
                <h5><i class="fas fa-calendar-alt"></i> Payment Schedule</h5>
                <div class="details-row">
                    <span class="label">Payment Frequency:</span>
                    <span class="value">${contract.paymentSchedule.charAt(0).toUpperCase() + contract.paymentSchedule.slice(1)}</span>
                </div>
                <div class="details-row">
                    <span class="label">Payment Due:</span>
                    <span class="value">${typeof contract.paymentDue === 'number' ? `Day ${contract.paymentDue} of period` : contract.paymentDue}</span>
                </div>
                <div class="details-row">
                    <span class="label">Next Payment Due:</span>
                    <span class="value">${this.calculateNextPaymentDate(contract)}</span>
                </div>
                <div class="details-row">
                    <span class="label">Payment Method:</span>
                    <span class="value">Electronic Transfer</span>
                </div>
            </div>
        `;
    }

    createEscalationClauseSection(contract) {
        if (!contract.escalationClause?.enabled) {
            return `
                <div class="details-section">
                    <h5><i class="fas fa-arrow-up"></i> Escalation Clause</h5>
                    <div class="details-row">
                        <span class="label">Status:</span>
                        <span class="value">Not applicable</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="details-section">
                <h5><i class="fas fa-arrow-up"></i> Escalation Clause</h5>
                <div class="details-row">
                    <span class="label">Status:</span>
                    <span class="value"><span class="status-badge active">ACTIVE</span></span>
                </div>
                <div class="details-row">
                    <span class="label">Frequency:</span>
                    <span class="value">${contract.escalationClause.frequency.charAt(0).toUpperCase() + contract.escalationClause.frequency.slice(1)}</span>
                </div>
                <div class="details-row">
                    <span class="label">Escalation Rate:</span>
                    <span class="value">${contract.escalationClause.rate}% increase</span>
                </div>
                <div class="details-row">
                    <span class="label">Next Escalation:</span>
                    <span class="value">
                        ${new Date(contract.escalationClause.nextEscalation).toLocaleDateString()}
                        ${this.getEscalationUrgency(contract.escalationClause.nextEscalation)}
                    </span>
                </div>
            </div>
        `;
    }

    createConditionsSection(contract) {
        return `
            <div class="details-section">
                <h5><i class="fas fa-list-check"></i> Contract Conditions</h5>
                <div class="conditions-list">
                    ${contract.conditions.map(condition => `
                        <div class="condition-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${condition}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createTimelineSection(contract) {
        const duration = this.calculateContractDuration(contract.startDate, contract.endDate);
        const progress = this.calculateContractProgress(contract.startDate, contract.endDate);
        
        return `
            <div class="details-section">
                <h5><i class="fas fa-clock"></i> Contract Timeline</h5>
                <div class="details-row">
                    <span class="label">Start Date:</span>
                    <span class="value">${new Date(contract.startDate).toLocaleDateString()}</span>
                </div>
                <div class="details-row">
                    <span class="label">End Date:</span>
                    <span class="value">${new Date(contract.endDate).toLocaleDateString()}</span>
                </div>
                <div class="details-row">
                    <span class="label">Duration:</span>
                    <span class="value">${duration}</span>
                </div>
                <div class="details-row">
                    <span class="label">Progress:</span>
                    <span class="value">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                        ${progress.toFixed(1)}% complete
                    </span>
                </div>
                <div class="details-row">
                    <span class="label">Last Review:</span>
                    <span class="value">${new Date(contract.lastReview).toLocaleDateString()}</span>
                </div>
                <div class="details-row">
                    <span class="label">Next Review:</span>
                    <span class="value">
                        ${new Date(contract.nextReview).toLocaleDateString()}
                        ${this.getReviewUrgency(contract.nextReview)}
                    </span>
                </div>
            </div>
        `;
    }

    setupContractDetailsHandlers(modal) {
        const closeBtn = modal.querySelector('.modal-close');
        const closeFooterBtn = modal.querySelector('.modal-close-btn');
        
        [closeBtn, closeFooterBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    modal.remove();
                });
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    editContract(contractId) {
        const contract = this.dataManager.findContractById(contractId);
        if (!contract) {
            this.notificationManager.show('Contract not found', 'error');
            return;
        }

        const modal = this.createEditContractModal(contract);
        document.body.appendChild(modal);
        this.setupEditContractHandlers(modal, contract);
    }

    createEditContractModal(contract) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Contract: ${contract.id}</h3>
                    <button class="modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="edit-contract-form">
                        <div class="form-tabs">
                            <button type="button" class="tab-btn active" data-tab="basic">Basic Info</button>
                            <button type="button" class="tab-btn" data-tab="financial">Financial Terms</button>
                            <button type="button" class="tab-btn" data-tab="conditions">Conditions</button>
                            <button type="button" class="tab-btn" data-tab="timeline">Timeline</button>
                        </div>

                        <div class="tab-content active" id="basic-tab">
                            <div class="grid-4">
                                <div class="form-group">
                                    <label for="edit-stakeholder">Stakeholder *</label>
                                    <input type="text" id="edit-stakeholder" name="stakeholder" value="${contract.stakeholder}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-stakeholder-type">Stakeholder Type *</label>
                                    <select id="edit-stakeholder-type" name="stakeholderType" required>
                                        <option value="government" ${contract.stakeholderType === 'government' ? 'selected' : ''}>Government</option>
                                        <option value="private" ${contract.stakeholderType === 'private' ? 'selected' : ''}>Private</option>
                                        <option value="landowner" ${contract.stakeholderType === 'landowner' ? 'selected' : ''}>Landowner</option>
                                        <option value="joint-venture" ${contract.stakeholderType === 'joint-venture' ? 'selected' : ''}>Joint Venture</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="edit-entity">Mining Entity *</label>
                                    <input type="text" id="edit-entity" name="entity" value="${contract.entity}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-contract-type">Contract Type *</label>
                                    <input type="text" id="edit-contract-type" name="contractType" value="${contract.contractType}" required>
                                </div>
                            </div>
                        </div>

                        <div class="tab-content" id="financial-tab">
                            <div class="grid-4">
                                <div class="form-group">
                                    <label for="edit-calculation-method">Calculation Method *</label>
                                    <select id="edit-calculation-method" name="calculationMethod" required>
                                        <option value="ad-valorem" ${contract.calculationMethod === 'ad-valorem' ? 'selected' : ''}>Ad Valorem</option>
                                        <option value="profit-based" ${contract.calculationMethod === 'profit-based' ? 'selected' : ''}>Profit Based</option>
                                        <option value="quantity-based" ${contract.calculationMethod === 'quantity-based' ? 'selected' : ''}>Quantity Based</option>
                                        <option value="hybrid" ${contract.calculationMethod === 'hybrid' ? 'selected' : ''}>Hybrid</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="edit-royalty-rate">Royalty Rate *</label>
                                    <input type="text" id="edit-royalty-rate" name="royaltyRate" value="${contract.royaltyRate}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-base-rate">Base Rate *</label>
                                    <input type="number" id="edit-base-rate" name="baseRate" value="${contract.baseRate}" step="0.1" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-total-value">Total Contract Value *</label>
                                    <input type="number" id="edit-total-value" name="totalValue" value="${contract.totalValue}" required>
                                </div>
                            </div>
                        </div>

                        <!-- Additional tabs would be implemented here -->
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                    <button type="button" class="btn btn-warning" id="validate-contract-btn">
                        <i class="fas fa-check-double"></i> Validate
                    </button>
                    <button type="submit" class="btn btn-success" id="save-contract-btn">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    setupEditContractHandlers(modal, contract) {
        // Tab navigation
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabContents = modal.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });

        // Close handlers
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Save changes
        const saveBtn = modal.querySelector('#save-contract-btn');
        saveBtn.addEventListener('click', () => {
            this.saveContractChanges(modal, contract);
        });

        // Validation
        const validateBtn = modal.querySelector('#validate-contract-btn');
        validateBtn.addEventListener('click', () => {
            this.validateContract(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveContractChanges(modal, contract) {
        const form = modal.querySelector('#edit-contract-form');
        const formData = new FormData(form);
        
        // Update contract with new values
        const updatedContract = {
            ...contract,
            stakeholder: formData.get('stakeholder'),
            stakeholderType: formData.get('stakeholderType'),
            entity: formData.get('entity'),
            contractType: formData.get('contractType'),
            calculationMethod: formData.get('calculationMethod'),
            royaltyRate: formData.get('royaltyRate'),
            baseRate: parseFloat(formData.get('baseRate')),
            totalValue: parseFloat(formData.get('totalValue'))
        };

        // Update in data manager
        const index = this.dataManager.contracts.findIndex(c => c.id === contract.id);
        if (index !== -1) {
            this.dataManager.contracts[index] = updatedContract;
        }

        // Add audit entry
        this.dataManager.addAuditEntry({
            user: 'currentUser',
            action: 'Modify Contract',
            target: contract.id,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `Updated contract ${contract.id}`
        });

        this.notificationManager.show(`Contract ${contract.id} updated successfully`, 'success');
        modal.remove();

        // Reload section
        document.dispatchEvent(new CustomEvent('reloadSection', {
            detail: { sectionId: 'contract-management' }
        }));
    }

    validateContract(modal) {
        const form = modal.querySelector('#edit-contract-form');
        const formData = new FormData(form);
        
        const errors = [];
        
        // Basic validation
        if (!formData.get('stakeholder')) errors.push('Stakeholder is required');
        if (!formData.get('entity')) errors.push('Mining entity is required');
        if (!formData.get('royaltyRate')) errors.push('Royalty rate is required');
        
        const baseRate = parseFloat(formData.get('baseRate'));
        if (isNaN(baseRate) || baseRate < 0) errors.push('Base rate must be a valid positive number');
        
        const totalValue = parseFloat(formData.get('totalValue'));
        if (isNaN(totalValue) || totalValue <= 0) errors.push('Total contract value must be a valid positive number');

        if (errors.length > 0) {
            this.notificationManager.show(`Validation errors: ${errors.join(', ')}`, 'error');
        } else {
            this.notificationManager.show('Contract validation passed successfully', 'success');
        }
    }

    setupRenewalModalHandlers(modal, contract) {
        // Preview renewal terms
        const previewBtn = modal.querySelector('#preview-renewal-btn');
        previewBtn.addEventListener('click', () => {
            this.generateRenewalPreview(modal, contract);
        });

        // Confirm renewal
        const confirmBtn = modal.querySelector('#confirm-renewal-btn');
        confirmBtn.addEventListener('click', () => {
            this.processContractRenewal(modal, contract);
        });

        // Close handlers
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Custom period handling
        const renewalPeriodSelect = modal.querySelector('#renewal-period');
        renewalPeriodSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                this.showCustomPeriodInput(modal);
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    generateRenewalPreview(modal, contract) {
        const form = modal.querySelector('#renewal-form');
        const formData = new FormData(form);
        const previewContainer = modal.querySelector('#renewal-preview');
        
        const renewalPeriod = formData.get('renewalPeriod');
        const rateAdjustment = formData.get('rateAdjustment');
        const newStartDate = new Date(formData.get('newStartDate'));
        
        let newEndDate = new Date(newStartDate);
        if (renewalPeriod !== 'custom') {
            newEndDate.setFullYear(newEndDate.getFullYear() + parseInt(renewalPeriod));
        }
        
        let adjustedRate = contract.baseRate;
        let adjustmentText = 'No rate adjustment';
        
        if (rateAdjustment === 'inflation') {
            adjustedRate = contract.baseRate * 1.025; // 2.5% inflation adjustment
            adjustmentText = '2.5% inflation adjustment applied';
        } else if (rateAdjustment === 'market') {
            adjustedRate = contract.baseRate * 1.05; // 5% market adjustment
            adjustmentText = '5% market rate adjustment applied';
        }
        
        const estimatedValue = adjustedRate * 1000000; // Rough estimate
        
        previewContainer.innerHTML = `
            <div class="renewal-preview-content">
                <h5>Renewal Preview</h5>
                <div class="preview-details">
                    <div class="preview-row">
                        <span class="label">New Contract Period:</span>
                        <span class="value">${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}</span>
                    </div>
                    <div class="preview-row">
                        <span class="label">Current Rate:</span>
                        <span class="value">${contract.royaltyRate}</span>
                    </div>
                    <div class="preview-row">
                        <span class="label">New Rate:</span>
                        <span class="value">${adjustedRate.toFixed(2)}% (${adjustmentText})</span>
                    </div>
                    <div class="preview-row">
                        <span class="label">Estimated Contract Value:</span>
                        <span class="value"><strong>E ${estimatedValue.toLocaleString()}</strong></span>
                    </div>
                    <div class="preview-row">
                        <span class="label">Automatic Renewal:</span>
                        <span class="value">${formData.get('automaticRenewal') === 'true' ? 'Yes, with 90-day notice' : 'No'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    processContractRenewal(modal, contract) {
        const form = modal.querySelector('#renewal-form');
        const formData = new FormData(form);
        
        if (!formData.get('renewalPeriod') || !formData.get('newStartDate')) {
            this.notificationManager.show('Please fill in all required renewal fields', 'error');
            return;
        }

        // Update contract with renewal terms
        const renewedContract = {
            ...contract,
            status: 'active',
            startDate: formData.get('newStartDate'),
            lastReview: new Date().toISOString().split('T')[0],
            nextReview: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        };

        // Update contract in data manager
        const index = this.dataManager.contracts.findIndex(c => c.id === contract.id);
        if (index !== -1) {
            this.dataManager.contracts[index] = renewedContract;
        }

        // Add audit entry
        this.dataManager.addAuditEntry({
            user: 'currentUser',
            action: 'Renew Contract',
            target: contract.id,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `Contract ${contract.id} renewed for ${formData.get('renewalPeriod')} year(s)`
        });

        this.notificationManager.show(`Contract ${contract.id} renewed successfully`, 'success');
        modal.remove();

        // Reload section
        document.dispatchEvent(new CustomEvent('reloadSection', {
            detail: { sectionId: 'contract-management' }
        }));
    }

    showCustomPeriodInput(modal) {
        const renewalPeriodContainer = modal.querySelector('#renewal-period').parentElement;
        
        // Add custom period inputs
        const customInputs = document.createElement('div');
        customInputs.className = 'custom-period-inputs';
        customInputs.innerHTML = `
            <div class="grid-2" style="margin-top: 1rem;">
                <div class="form-group">
                    <label for="custom-years">Years</label>
                    <input type="number" id="custom-years" name="customYears" min="0" max="10" value="1">
                </div>
                <div class="form-group">
                    <label for="custom-months">Months</label>
                    <input type="number" id="custom-months" name="customMonths" min="0" max="11" value="0">
                </div>
            </div>
        `;
        
        renewalPeriodContainer.appendChild(customInputs);
    }

    addContract() {
        const modal = this.createAddContractModal();
        document.body.appendChild(modal);
        this.setupAddContractHandlers(modal);
    }

    createAddContractModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Add New Contract</h3>
                    <button class="modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="add-contract-form">
                        <div class="form-tabs">
                            <button type="button" class="tab-btn active" data-tab="basic">Basic Information</button>
                            <button type="button" class="tab-btn" data-tab="financial">Financial Terms</button>
                            <button type="button" class="tab-btn" data-tab="schedule">Schedule & Terms</button>
                            <button type="button" class="tab-btn" data-tab="conditions">Conditions</button>
                        </div>

                        <div class="tab-content active" id="basic-tab">
                            <div class="grid-4">
                                <div class="form-group">
                                    <label for="new-stakeholder">Stakeholder *</label>
                                    <input type="text" id="new-stakeholder" name="stakeholder" required placeholder="Stakeholder name">
                                </div>
                                <div class="form-group">
                                    <label for="new-stakeholder-type">Stakeholder Type *</label>
                                    <select id="new-stakeholder-type" name="stakeholderType" required>
                                        <option value="">Select type</option>
                                        <option value="government">Government</option>
                                        <option value="private">Private</option>
                                        <option value="landowner">Landowner</option>
                                        <option value="joint-venture">Joint Venture</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="new-entity">Mining Entity *</label>
                                    <input type="text" id="new-entity" name="entity" required placeholder="Mining entity name">
                                </div>
                                <div class="form-group">
                                    <label for="new-contract-type">Contract Type *</label>
                                    <input type="text" id="new-contract-type" name="contractType" required placeholder="e.g., Mining License Agreement">
                                </div>
                            </div>
                        </div>

                        <div class="tab-content" id="financial-tab">
                            <div class="grid-4">
                                <div class="form-group">
                                    <label for="new-calculation-method">Calculation Method *</label>
                                    <select id="new-calculation-method" name="calculationMethod" required>
                                        <option value="">Select method</option>
                                        <option value="ad-valorem">Ad Valorem</option>
                                        <option value="profit-based">Profit Based</option>
                                        <option value="quantity-based">Quantity Based</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="new-royalty-rate">Royalty Rate *</label>
                                    <input type="text" id="new-royalty-rate" name="royaltyRate" required placeholder="e.g., 2.5% of gross value">
                                </div>
                                <div class="form-group">
                                    <label for="new-base-rate">Base Rate *</label>
                                    <input type="number" id="new-base-rate" name="baseRate" step="0.1" required placeholder="2.5">
                                </div>
                                <div class="form-group">
                                    <label for="new-total-value">Total Contract Value *</label>
                                    <input type="number" id="new-total-value" name="totalValue" required placeholder="15500000">
                                </div>
                            </div>
                        </div>

                        <div class="tab-content" id="schedule-tab">
                            <div class="grid-4">
                                <div class="form-group">
                                    <label for="new-start-date">Start Date *</label>
                                    <input type="date" id="new-start-date" name="startDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="new-end-date">End Date *</label>
                                    <input type="date" id="new-end-date" name="endDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="new-payment-schedule">Payment Schedule *</label>
                                    <select id="new-payment-schedule" name="paymentSchedule" required>
                                        <option value="">Select schedule</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="annual">Annual</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="new-grace-period">Grace Period (days)</label>
                                    <input type="number" id="new-grace-period" name="gracePeriod" value="30" min="0">
                                </div>
                            </div>
                        </div>

                        <div class="tab-content" id="conditions-tab">
                            <div class="form-group">
                                <label for="new-conditions">Contract Conditions</label>
                                <textarea id="new-conditions" name="conditions" rows="5" placeholder="Enter contract conditions (one per line)"></textarea>
                                <small class="form-help">Enter each condition on a separate line</small>
                            </div>
                            <div class="grid-2">
                                <div class="form-group">
                                    <label for="new-late-fee-rate">Late Fee Rate (%)</label>
                                    <input type="number" id="new-late-fee-rate" name="lateFeeRate" step="0.1" value="2.0">
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="new-escalation-enabled" name="escalationEnabled"> 
                                        Enable Escalation Clause
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                    <button type="button" class="btn btn-warning" id="validate-new-contract-btn">
                        <i class="fas fa-check-double"></i> Validate
                    </button>
                    <button type="submit" class="btn btn-success" id="save-new-contract-btn">
                        <i class="fas fa-save"></i> Create Contract
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    setupAddContractHandlers(modal) {
        // Tab navigation
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabContents = modal.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });

        // Close handlers
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Save new contract
        const saveBtn = modal.querySelector('#save-new-contract-btn');
        saveBtn.addEventListener('click', () => {
            this.saveNewContract(modal);
        });

        // Validation
        const validateBtn = modal.querySelector('#validate-new-contract-btn');
        validateBtn.addEventListener('click', () => {
            this.validateNewContract(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveNewContract(modal) {
        const form = modal.querySelector('#add-contract-form');
        const formData = new FormData(form);
        
        // Generate new contract ID
        const contractId = `MC-${new Date().getFullYear()}-${String(this.dataManager.contracts.length + 1).padStart(3, '0')}`;
        
        // Process conditions
        const conditionsText = formData.get('conditions') || '';
        const conditions = conditionsText.split('\n').filter(condition => condition.trim().length > 0);
        
        const newContract = {
            id: contractId,
            stakeholder: formData.get('stakeholder'),
            stakeholderType: formData.get('stakeholderType'),
            entity: formData.get('entity'),
            contractType: formData.get('contractType'),
            calculationMethod: formData.get('calculationMethod'),
            royaltyRate: formData.get('royaltyRate'),
            baseRate: parseFloat(formData.get('baseRate')),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            status: 'active',
            totalValue: parseFloat(formData.get('totalValue')),
            paymentSchedule: formData.get('paymentSchedule'),
            lateFeeRate: parseFloat(formData.get('lateFeeRate')) || 2.0,
            gracePeriod: parseInt(formData.get('gracePeriod')) || 30,
            escalationClause: {
                enabled: formData.get('escalationEnabled') === 'on'
            },
            conditions: conditions,
            signedDate: new Date().toISOString().split('T')[0],
            lastReview: new Date().toISOString().split('T')[0],
            nextReview: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        };

        // Validation
        const requiredFields = ['stakeholder', 'entity', 'contractType', 'calculationMethod', 'royaltyRate', 'baseRate', 'startDate', 'endDate', 'totalValue'];
        const missingFields = requiredFields.filter(field => !formData.get(field));
        
        if (missingFields.length > 0) {
            this.notificationManager.show('Please fill in all required fields', 'error');
            return;
        }

        // Add to data manager
        this.dataManager.contracts.push(newContract);

        // Add audit entry
        this.dataManager.addAuditEntry({
            user: 'currentUser',
            action: 'Create Contract',
            target: contractId,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `Created new contract ${contractId} for ${newContract.stakeholder}`
        });

        this.notificationManager.show(`Contract ${contractId} created successfully`, 'success');
        modal.remove();

        // Reload section
        document.dispatchEvent(new CustomEvent('reloadSection', {
            detail: { sectionId: 'contract-management' }
        }));
    }

    validateNewContract(modal) {
        const form = modal.querySelector('#add-contract-form');
        const formData = new FormData(form);
        
        const errors = [];
        
        // Validation logic
        if (!formData.get('stakeholder')) errors.push('Stakeholder is required');
        if (!formData.get('entity')) errors.push('Mining entity is required');
        
        const startDate = new Date(formData.get('startDate'));
        const endDate = new Date(formData.get('endDate'));
        if (endDate <= startDate) errors.push('End date must be after start date');
        
        const baseRate = parseFloat(formData.get('baseRate'));
        if (isNaN(baseRate) || baseRate <= 0) errors.push('Base rate must be a positive number');
        
        const totalValue = parseFloat(formData.get('totalValue'));
        if (isNaN(totalValue) || totalValue <= 0) errors.push('Total contract value must be a positive number');

        if (errors.length > 0) {
            this.notificationManager.show(`Validation errors: ${errors.join(', ')}`, 'error');
        } else {
            this.notificationManager.show('Contract validation passed successfully', 'success');
        }
    }
}
