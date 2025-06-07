export class RecordActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewRecord(recordId) {
        const record = this.dataManager.findRecordById(recordId);
        if (!record) {
            this.notificationManager.show('Record not found', 'error');
            return;
        }

        const modal = this.createRecordDetailsModal(record);
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

    createRecordDetailsModal(record) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-file-invoice-dollar"></i> Royalty Record Details: ${record.referenceNumber}</h3>
                    <button class="modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="record-details-grid">
                        <div class="details-section">
                            <h5><i class="fas fa-info-circle"></i> Basic Information</h5>
                            <div class="details-row">
                                <span class="label">Reference Number:</span>
                                <span class="value"><strong>${record.referenceNumber}</strong></span>
                            </div>
                            <div class="details-row">
                                <span class="label">Entity:</span>
                                <span class="value">${record.entity}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Mineral Type:</span>
                                <span class="value"><span class="mineral-badge">${record.mineral}</span></span>
                            </div>
                            <div class="details-row">
                                <span class="label">Date:</span>
                                <span class="value">${new Date(record.date).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>

                        <div class="details-section">
                            <h5><i class="fas fa-calculator"></i> Calculation Details</h5>
                            <div class="details-row">
                                <span class="label">Volume Extracted:</span>
                                <span class="value">${record.volume.toLocaleString()} ${record.mineral.includes('Stone') || record.mineral.includes('Sand') || record.mineral.includes('Gravel') ? 'm³' : 'tonnes'}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Tariff Rate:</span>
                                <span class="value">E ${record.tariff} per ${record.mineral.includes('Stone') || record.mineral.includes('Sand') || record.mineral.includes('Gravel') ? 'm³' : 'tonne'}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Calculation:</span>
                                <span class="value">${record.volume.toLocaleString()} × E ${record.tariff} = E ${record.royalties.toLocaleString()}</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Total Royalties Due:</span>
                                <span class="value"><strong class="royalty-amount">E ${record.royalties.toLocaleString()}</strong></span>
                            </div>
                        </div>

                        <div class="details-section">
                            <h5><i class="fas fa-credit-card"></i> Payment Information</h5>
                            <div class="details-row">
                                <span class="label">Payment Status:</span>
                                <span class="value"><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></span>
                            </div>
                            <div class="details-row">
                                <span class="label">Due Date:</span>
                                <span class="value">${this.calculateDueDate(record.date)}</span>
                            </div>
                            ${record.status === 'Overdue' ? `
                            <div class="details-row">
                                <span class="label">Days Overdue:</span>
                                <span class="value"><span class="overdue-days">${this.calculateOverdueDays(record.date)} days</span></span>
                            </div>
                            <div class="details-row">
                                <span class="label">Late Fees:</span>
                                <span class="value">E ${this.calculateLateFees(record.royalties, this.calculateOverdueDays(record.date))}</span>
                            </div>
                            ` : ''}
                        </div>

                        <div class="details-section">
                            <h5><i class="fas fa-history"></i> Audit Trail</h5>
                            <div class="details-row">
                                <span class="label">Created:</span>
                                <span class="value">${record.date} by System</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Last Modified:</span>
                                <span class="value">${record.date} by System</span>
                            </div>
                            <div class="details-row">
                                <span class="label">Invoice Generated:</span>
                                <span class="value">${record.status !== 'Paid' ? 'Not yet generated' : 'Generated and sent'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary">
                        <i class="fas fa-print"></i> Print Details
                    </button>
                    <button type="button" class="btn btn-warning">
                        <i class="fas fa-file-invoice"></i> Generate Invoice
                    </button>
                    <button type="button" class="btn btn-primary">
                        <i class="fas fa-check"></i> Close
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    calculateDueDate(recordDate) {
        const date = new Date(recordDate);
        date.setDate(date.getDate() + 30); // 30 days payment terms
        return date.toLocaleDateString('en-GB');
    }

    calculateOverdueDays(recordDate) {
        const dueDate = new Date(recordDate);
        dueDate.setDate(dueDate.getDate() + 30);
        const today = new Date();
        const diffTime = today - dueDate;
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    calculateLateFees(royaltyAmount, overdueDays) {
        const lateFeeRate = 0.02; // 2% per month
        const monthsOverdue = Math.ceil(overdueDays / 30);
        return Math.round(royaltyAmount * lateFeeRate * monthsOverdue);
    }

    editRecord(recordId) {
        const record = this.dataManager.findRecordById(recordId);
        if (!record) {
            this.notificationManager.show('Record not found', 'error');
            return;
        }

        const modal = this.createEditRecordModal(record);
        document.body.appendChild(modal);
        this.setupEditRecordHandlers(modal, record);
    }

    createEditRecordModal(record) {
        const entities = this.dataManager.getEntities();
        const minerals = this.dataManager.getMinerals();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Royalty Record: ${record.referenceNumber}</h3>
                    <button class="modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="edit-record-form">
                        <div class="grid-4">
                            <div class="form-group">
                                <label for="edit-entity">
                                    <i class="fas fa-industry"></i> Entity *
                                </label>
                                <select id="edit-entity" name="entity" required>
                                    ${entities.map(entity => `
                                        <option value="${entity.name}" ${entity.name === record.entity ? 'selected' : ''}>${entity.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-mineral">
                                    <i class="fas fa-gem"></i> Mineral *
                                </label>
                                <select id="edit-mineral" name="mineral" required>
                                    ${minerals.map(mineral => `
                                        <option value="${mineral.name}" data-tariff="${mineral.tariff}" ${mineral.name === record.mineral ? 'selected' : ''}>${mineral.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-volume">
                                    <i class="fas fa-cubes"></i> Volume *
                                </label>
                                <input type="number" id="edit-volume" name="volume" value="${record.volume}" required min="0" step="0.01">
                                <small class="form-help">Volume extracted in appropriate units</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-date">
                                    <i class="fas fa-calendar"></i> Extraction Date *
                                </label>
                                <input type="date" id="edit-date" name="date" value="${record.date}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-tariff">
                                    <i class="fas fa-tag"></i> Tariff Rate *
                                </label>
                                <input type="number" id="edit-tariff" name="tariff" value="${record.tariff}" required min="0" step="0.01">
                                <small class="form-help">Rate per unit (auto-populated from mineral selection)</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-royalties">
                                    <i class="fas fa-money-bill-wave"></i> Calculated Royalties
                                </label>
                                <input type="number" id="edit-royalties" name="royalties" value="${record.royalties}" readonly>
                                <small class="form-help">Automatically calculated: Volume × Tariff Rate</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-status">
                                    <i class="fas fa-flag"></i> Payment Status
                                </label>
                                <select id="edit-status" name="status">
                                    <option value="Pending" ${record.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Paid" ${record.status === 'Paid' ? 'selected' : ''}>Paid</option>
                                    <option value="Overdue" ${record.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                                    <option value="Cancelled" ${record.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-notes">
                                    <i class="fas fa-sticky-note"></i> Notes (Optional)
                                </label>
                                <textarea id="edit-notes" name="notes" rows="3" placeholder="Additional notes or comments">${record.notes || ''}</textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                    <button type="button" class="btn btn-warning" id="recalculate-btn">
                        <i class="fas fa-calculator"></i> Recalculate
                    </button>
                    <button type="submit" class="btn btn-success" id="save-record-btn">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    setupEditRecordHandlers(modal, record) {
        // Auto-calculate royalties when volume or tariff changes
        const volumeInput = modal.querySelector('#edit-volume');
        const tariffInput = modal.querySelector('#edit-tariff');
        const royaltiesInput = modal.querySelector('#edit-royalties');
        const mineralSelect = modal.querySelector('#edit-mineral');

        const calculateRoyalties = () => {
            const volume = parseFloat(volumeInput.value) || 0;
            const tariff = parseFloat(tariffInput.value) || 0;
            royaltiesInput.value = (volume * tariff).toFixed(2);
        };

        // Update tariff when mineral changes
        mineralSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            const tariff = selectedOption.dataset.tariff;
            tariffInput.value = tariff;
            calculateRoyalties();
        });

        [volumeInput, tariffInput].forEach(input => {
            input.addEventListener('input', calculateRoyalties);
        });

        // Recalculate button
        const recalculateBtn = modal.querySelector('#recalculate-btn');
        recalculateBtn.addEventListener('click', calculateRoyalties);

        // Close handlers
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Save changes
        const saveBtn = modal.querySelector('#save-record-btn');
        saveBtn.addEventListener('click', () => {
            this.saveRecordChanges(modal, record);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveRecordChanges(modal, record) {
        const form = modal.querySelector('#edit-record-form');
        const formData = new FormData(form);
        
        // Update record with new values
        const updatedRecord = {
            ...record,
            entity: formData.get('entity'),
            mineral: formData.get('mineral'),
            volume: parseFloat(formData.get('volume')),
            tariff: parseFloat(formData.get('tariff')),
            royalties: parseFloat(formData.get('royalties')),
            date: formData.get('date'),
            status: formData.get('status'),
            notes: formData.get('notes')
        };

        // Update in data manager
        const index = this.dataManager.royaltyRecords.findIndex(r => r.id === record.id);
        if (index !== -1) {
            this.dataManager.royaltyRecords[index] = updatedRecord;
        }

        // Add audit entry
        this.dataManager.addAuditEntry({
            user: 'currentUser',
            action: 'Modify Record',
            target: record.referenceNumber,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `Updated royalty record ${record.referenceNumber}`
        });

        this.notificationManager.show(`Record ${record.referenceNumber} updated successfully`, 'success');
        modal.remove();

        // Reload section
        document.dispatchEvent(new CustomEvent('reloadSection', {
            detail: { sectionId: 'royalty-records' }
        }));
    }

    markAsPaid(recordId) {
        const record = this.dataManager.findRecordById(recordId);
        if (!record) return;

        if (record.status === 'Paid') {
            this.notificationManager.show('Record is already marked as paid', 'info');
            return;
        }

        if (confirm(`Mark record ${record.referenceNumber} as paid?`)) {
            // Update status
            record.status = 'Paid';
            record.paidDate = new Date().toISOString().split('T')[0];

            // Add audit entry
            this.dataManager.addAuditEntry({
                user: 'currentUser',
                action: 'Payment Received',
                target: record.referenceNumber,
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Payment received for ${record.referenceNumber} - E ${record.royalties.toLocaleString()}`
            });

            this.notificationManager.show(`Payment recorded for ${record.referenceNumber}`, 'success');

            // Reload section
            document.dispatchEvent(new CustomEvent('reloadSection', {
                detail: { sectionId: 'royalty-records' }
            }));
        }
    }

    generateInvoice(recordId) {
        const record = this.dataManager.findRecordById(recordId);
        if (!record) return;

        // Simulate invoice generation
        this.notificationManager.show(`Generating invoice for ${record.referenceNumber}...`, 'info');
        
        setTimeout(() => {
            this.notificationManager.show(`Invoice ${record.referenceNumber}-INV generated successfully`, 'success');
            
            // Add audit entry
            this.dataManager.addAuditEntry({
                user: 'currentUser',
                action: 'Generate Invoice',
                target: record.referenceNumber,
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Invoice generated for ${record.referenceNumber}`
            });
        }, 2000);
    }

    showAddRecordForm() {
        const modal = this.createAddRecordModal();
        document.body.appendChild(modal);
        this.setupAddRecordHandlers(modal);
    }

    createAddRecordModal() {
        const entities = this.dataManager.getEntities();
        const minerals = this.dataManager.getMinerals();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Add New Royalty Record</h3>
                    <button class="modal-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="add-record-form">
                        <div class="grid-4">
                            <div class="form-group">
                                <label for="new-entity">
                                    <i class="fas fa-industry"></i> Entity *
                                </label>
                                <select id="new-entity" name="entity" required>
                                    <option value="">Select Entity</option>
                                    ${entities.filter(e => e.status === 'Active').map(entity => `
                                        <option value="${entity.name}">${entity.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="new-mineral">
                                    <i class="fas fa-gem"></i> Mineral *
                                </label>
                                <select id="new-mineral" name="mineral" required>
                                    <option value="">Select Mineral</option>
                                    ${minerals.map(mineral => `
                                        <option value="${mineral.name}" data-tariff="${mineral.tariff}">${mineral.name} (E ${mineral.tariff}/${mineral.unit})</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="new-volume">
                                    <i class="fas fa-cubes"></i> Volume Extracted *
                                </label>
                                <input type="number" id="new-volume" name="volume" required min="0" step="0.01" placeholder="0.00">
                                <small class="form-help">Volume in appropriate units (m³ or tonnes)</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="new-date">
                                    <i class="fas fa-calendar"></i> Extraction Date *
                                </label>
                                <input type="date" id="new-date" name="date" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="new-tariff">
                                    <i class="fas fa-tag"></i> Tariff Rate *
                                </label>
                                <input type="number" id="new-tariff" name="tariff" readonly>
                                <small class="form-help">Automatically set based on mineral selection</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="new-royalties">
                                    <i class="fas fa-money-bill-wave"></i> Calculated Royalties
                                </label>
                                <input type="number" id="new-royalties" name="royalties" readonly>
                                <small class="form-help">Automatically calculated: Volume × Tariff</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="new-reference">
                                    <i class="fas fa-barcode"></i> Reference Number
                                </label>
                                <input type="text" id="new-reference" name="referenceNumber" readonly>
                                <small class="form-help">Auto-generated on save</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="new-notes">
                                    <i class="fas fa-sticky-note"></i> Notes (Optional)
                                </label>
                                <textarea id="new-notes" name="notes" rows="3" placeholder="Additional notes or comments"></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                    <button type="button" class="btn btn-warning" id="calculate-btn">
                        <i class="fas fa-calculator"></i> Calculate Royalties
                    </button>
                    <button type="submit" class="btn btn-success" id="save-new-record-btn">
                        <i class="fas fa-save"></i> Save Record
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    setupAddRecordHandlers(modal) {
        const volumeInput = modal.querySelector('#new-volume');
        const tariffInput = modal.querySelector('#new-tariff');
        const royaltiesInput = modal.querySelector('#new-royalties');
        const mineralSelect = modal.querySelector('#new-mineral');
        const dateInput = modal.querySelector('#new-date');
        const referenceInput = modal.querySelector('#new-reference');

        // Set today's date as default
        dateInput.value = new Date().toISOString().split('T')[0];

        const calculateRoyalties = () => {
            const volume = parseFloat(volumeInput.value) || 0;
            const tariff = parseFloat(tariffInput.value) || 0;
            royaltiesInput.value = (volume * tariff).toFixed(2);
        };

        // Update tariff and generate reference when mineral changes
        mineralSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if (selectedOption.value) {
                const tariff = selectedOption.dataset.tariff;
                tariffInput.value = tariff;
                calculateRoyalties();
                this.generateReferenceNumber(referenceInput);
            } else {
                tariffInput.value = '';
                royaltiesInput.value = '';
                referenceInput.value = '';
            }
        });

        volumeInput.addEventListener('input', calculateRoyalties);

        // Calculate button
        const calculateBtn = modal.querySelector('#calculate-btn');
        calculateBtn.addEventListener('click', calculateRoyalties);

        // Close handlers
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Save new record
        const saveBtn = modal.querySelector('#save-new-record-btn');
        saveBtn.addEventListener('click', () => {
            this.saveNewRecord(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    generateReferenceNumber(input) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const existingRecords = this.dataManager.getRoyaltyRecords();
        const nextId = String(existingRecords.length + 1).padStart(3, '0');
        input.value = `ROY-${year}-${month}-${nextId}`;
    }

    saveNewRecord(modal) {
        const form = modal.querySelector('#add-record-form');
        const formData = new FormData(form);
        
        // Validation
        const entity = formData.get('entity');
        const mineral = formData.get('mineral');
        const volume = formData.get('volume');
        const date = formData.get('date');

        if (!entity || !mineral || !volume || !date) {
            this.notificationManager.show('Please fill in all required fields', 'error');
            return;
        }

        const newRecord = {
            id: this.dataManager.royaltyRecords.length + 1,
            entity: entity,
            mineral: mineral,
            volume: parseFloat(volume),
            tariff: parseFloat(formData.get('tariff')),
            royalties: parseFloat(formData.get('royalties')),
            date: date,
            status: 'Pending',
            referenceNumber: formData.get('referenceNumber'),
            notes: formData.get('notes')
        };

        // Add to data manager
        this.dataManager.royaltyRecords.push(newRecord);

        // Add audit entry
        this.dataManager.addAuditEntry({
            user: 'currentUser',
            action: 'Create Record',
            target: newRecord.referenceNumber,
            ipAddress: '192.168.1.100',
            status: 'Success',
            details: `Created new royalty record ${newRecord.referenceNumber} for ${newRecord.entity}`
        });

        this.notificationManager.show(`Royalty record ${newRecord.referenceNumber} created successfully`, 'success');
        modal.remove();

        // Reload section
        document.dispatchEvent(new CustomEvent('reloadSection', {
            detail: { sectionId: 'royalty-records' }
        }));
    }

    exportRecords() {
        const records = this.dataManager.getRoyaltyRecords();
        
        // Simulate export
        this.notificationManager.show('Preparing export file...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show(`Successfully exported ${records.length} royalty records to Excel`, 'success');
            
            // Add audit entry
            this.dataManager.addAuditEntry({
                user: 'currentUser',
                action: 'Export Records',
                target: 'Royalty Records',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Exported ${records.length} royalty records`
            });
        }, 2000);
    }
}

// Global filter functions
window.filterByStatus = function(status) {
    const statusFilter = document.getElementById('filter-status');
    if (statusFilter) {
        statusFilter.value = status;
        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) applyBtn.click();
    }
};

window.filterByThisMonth = function() {
    const dateFilter = document.getElementById('filter-date-range');
    if (dateFilter) {
        dateFilter.value = 'this-month';
        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) applyBtn.click();
    }
};

window.showPaymentReminders = function() {
    if (typeof notificationManager !== 'undefined') {
        notificationManager.show('Payment reminders sent to all entities with overdue payments', 'success');
    }
};
