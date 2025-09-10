/**
 * Enhanced Royalty Records Management
 * Advanced features for royalty calculation, validation, and workflow management
 */

import { dbService } from '../services/database.service.js';
import { notificationManager } from './NotificationManager.js';

export class RoyaltyRecordsEnhanced {
  constructor() {
    this.records = [];
    this.validationRules = [];
    this.calculationFormulas = new Map();
    this.workflowStates = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid'];
    this.auditTrail = [];
    this.templates = new Map();
    
    this.initializeValidationRules();
    this.initializeCalculationFormulas();
    this.initializeTemplates();
  }

  /**
   * Initialize validation rules
   */
  initializeValidationRules() {
    this.validationRules = [
      {
        name: 'production_volume',
        field: 'productionVolume',
        type: 'range',
        min: 0,
        max: 1000000,
        message: 'Production volume must be between 0 and 1,000,000'
      },
      {
        name: 'royalty_rate',
        field: 'royaltyRate',
        type: 'range',
        min: 0,
        max: 50,
        message: 'Royalty rate must be between 0% and 50%'
      },
      {
        name: 'unit_price',
        field: 'unitPrice',
        type: 'range',
        min: 0,
        max: 10000,
        message: 'Unit price must be positive and reasonable'
      },
      {
        name: 'production_date',
        field: 'productionDate',
        type: 'date',
        maxAge: 365,
        message: 'Production date cannot be more than 1 year ago'
      },
      {
        name: 'required_fields',
        type: 'custom',
        validator: this.validateRequiredFields.bind(this),
        message: 'All required fields must be completed'
      },
      {
        name: 'duplicate_check',
        type: 'custom',
        validator: this.validateDuplicate.bind(this),
        message: 'Duplicate record detected for this period and entity'
      }
    ];
  }

  /**
   * Initialize calculation formulas
   */
  initializeCalculationFormulas() {
    // Basic percentage calculation
    this.calculationFormulas.set('percentage', (volume, price, rate) => {
      return (volume * price * rate) / 100;
    });

    // Tiered calculation
    this.calculationFormulas.set('tiered', (volume, price, tiers) => {
      let total = 0;
      let remainingVolume = volume;
      
      for (const tier of tiers) {
        const tierVolume = Math.min(remainingVolume, tier.to ? tier.to - tier.from + 1 : remainingVolume);
        if (tierVolume <= 0) break;
        
        total += tierVolume * price * (tier.rate / 100);
        remainingVolume -= tierVolume;
      }
      
      return total;
    });

    // Sliding scale based on market price
    this.calculationFormulas.set('sliding_scale', (volume, marketPrice, scales, basePrice) => {
      const priceRatio = marketPrice / basePrice;
      let applicableRate = 0;
      
      for (const scale of scales) {
        if (priceRatio >= scale.from && (scale.to === null || priceRatio <= scale.to)) {
          applicableRate = scale.rate;
          break;
        }
      }
      
      return volume * marketPrice * (applicableRate / 100);
    });

    // Progressive calculation with bonuses
    this.calculationFormulas.set('progressive', (volume, price, baseRate, progressiveRates) => {
      let total = volume * price * (baseRate / 100);
      
      // Apply progressive bonuses
      for (const progressive of progressiveRates) {
        if (volume >= progressive.threshold) {
          const bonusVolume = volume - progressive.threshold;
          total += bonusVolume * price * (progressive.bonusRate / 100);
        }
      }
      
      return total;
    });
  }

  /**
   * Initialize record templates
   */
  initializeTemplates() {
    this.templates.set('coal_mining', {
      name: 'Coal Mining Royalty',
      fields: {
        mineralType: 'Coal',
        unitOfMeasure: 'tonnes',
        calculationType: 'sliding_scale',
        requiredDocuments: ['production_report', 'quality_certificate', 'transport_manifest'],
        defaultRate: 25,
        environmentalFee: 2.5
      }
    });

    this.templates.set('quarry_stone', {
      name: 'Quarry Stone Royalty',
      fields: {
        mineralType: 'Stone',
        unitOfMeasure: 'cubic_meters',
        calculationType: 'tiered',
        requiredDocuments: ['production_report', 'quality_test'],
        defaultRate: 15,
        environmentalFee: 1.5
      }
    });

    this.templates.set('iron_ore', {
      name: 'Iron Ore Royalty',
      fields: {
        mineralType: 'Iron Ore',
        unitOfMeasure: 'tonnes',
        calculationType: 'progressive',
        requiredDocuments: ['production_report', 'quality_certificate', 'export_permit'],
        defaultRate: 30,
        environmentalFee: 3.0
      }
    });
  }

  /**
   * Create new royalty record with template
   */
  async createRecord(templateId, data) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const record = {
      id: this.generateRecordId(),
      ...template.fields,
      ...data,
      status: 'draft',
      createdAt: new Date().toISOString(),
      createdBy: data.userId || 'system',
      workflow: {
        state: 'draft',
        history: [{
          state: 'draft',
          timestamp: new Date().toISOString(),
          user: data.userId || 'system',
          comment: 'Record created'
        }]
      },
      validationStatus: 'pending',
      calculationStatus: 'pending'
    };

    // Perform initial validation
    const validation = await this.validateRecord(record);
    record.validationStatus = validation.isValid ? 'valid' : 'invalid';
    record.validationErrors = validation.errors;

    // Perform calculation if validation passes
    if (validation.isValid) {
      const calculation = await this.calculateRoyalty(record);
      record.calculationStatus = 'completed';
      record.calculationResult = calculation;
    }

    // Save to database
    await dbService.create('royalties', record);
    this.records.push(record);

    // Log audit trail
    this.addAuditTrail('record_created', record.id, data.userId, {
      templateId,
      recordData: { ...data }
    });

    notificationManager.show('Royalty record created successfully', 'success');
    return record;
  }

  /**
   * Validate record against rules
   */
  async validateRecord(record) {
    const errors = [];
    const warnings = [];

    for (const rule of this.validationRules) {
      try {
        const result = await this.applyValidationRule(rule, record);
        if (!result.isValid) {
          if (result.severity === 'error') {
            errors.push({
              rule: rule.name,
              field: rule.field,
              message: result.message || rule.message,
              value: record[rule.field]
            });
          } else {
            warnings.push({
              rule: rule.name,
              field: rule.field,
              message: result.message || rule.message,
              value: record[rule.field]
            });
          }
        }
      } catch (error) {
        errors.push({
          rule: rule.name,
          field: rule.field,
          message: `Validation error: ${error.message}`,
          value: record[rule.field]
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Apply individual validation rule
   */
  async applyValidationRule(rule, record) {
    switch (rule.type) {
      case 'range':
        const value = record[rule.field];
        if (value === undefined || value === null) {
          return { isValid: false, severity: 'error' };
        }
        if (value < rule.min || value > rule.max) {
          return { isValid: false, severity: 'error' };
        }
        return { isValid: true };

      case 'date':
        const dateValue = new Date(record[rule.field]);
        const now = new Date();
        const daysDiff = (now - dateValue) / (1000 * 60 * 60 * 24);
        if (daysDiff > rule.maxAge) {
          return { 
            isValid: false, 
            severity: 'warning',
            message: `Date is ${Math.floor(daysDiff)} days old (max: ${rule.maxAge})`
          };
        }
        return { isValid: true };

      case 'custom':
        return await rule.validator(record);

      default:
        return { isValid: true };
    }
  }

  /**
   * Validate required fields
   */
  validateRequiredFields(record) {
    const requiredFields = [
      'entityName', 'mineralType', 'productionVolume', 
      'unitPrice', 'productionDate', 'royaltyRate'
    ];

    const missingFields = requiredFields.filter(field => 
      record[field] === undefined || record[field] === null || record[field] === ''
    );

    return {
      isValid: missingFields.length === 0,
      severity: 'error',
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  /**
   * Check for duplicate records
   */
  async validateDuplicate(record) {
    const existing = this.records.find(r => 
      r.entityName === record.entityName &&
      r.mineralType === record.mineralType &&
      r.productionDate === record.productionDate &&
      r.id !== record.id
    );

    return {
      isValid: !existing,
      severity: 'warning',
      message: existing ? `Duplicate of record #${existing.id}` : null
    };
  }

  /**
   * Calculate royalty amount
   */
  async calculateRoyalty(record) {
    const formula = this.calculationFormulas.get(record.calculationType);
    if (!formula) {
      throw new Error(`Unknown calculation type: ${record.calculationType}`);
    }

    let royaltyAmount = 0;
    let breakdown = {};

    try {
      switch (record.calculationType) {
        case 'percentage':
          royaltyAmount = formula(record.productionVolume, record.unitPrice, record.royaltyRate);
          breakdown = {
            volume: record.productionVolume,
            unitPrice: record.unitPrice,
            rate: record.royaltyRate,
            grossAmount: royaltyAmount
          };
          break;

        case 'tiered':
          royaltyAmount = formula(record.productionVolume, record.unitPrice, record.calculationParams.tiers);
          breakdown = this.calculateTieredBreakdown(record);
          break;

        case 'sliding_scale':
          const marketPrice = await this.getMarketPrice(record.mineralType, record.productionDate);
          royaltyAmount = formula(
            record.productionVolume, 
            marketPrice, 
            record.calculationParams.scales,
            record.calculationParams.basePrice
          );
          breakdown = {
            volume: record.productionVolume,
            marketPrice,
            basePrice: record.calculationParams.basePrice,
            applicableRate: this.getApplicableRate(marketPrice, record.calculationParams.scales, record.calculationParams.basePrice),
            grossAmount: royaltyAmount
          };
          break;

        case 'progressive':
          royaltyAmount = formula(
            record.productionVolume,
            record.unitPrice,
            record.royaltyRate,
            record.calculationParams.progressiveRates || []
          );
          breakdown = this.calculateProgressiveBreakdown(record);
          break;

        default:
          throw new Error(`Unsupported calculation type: ${record.calculationType}`);
      }

      // Apply additional fees and deductions
      const environmentalFee = royaltyAmount * (record.environmentalFee || 0) / 100;
      const processingFee = 50; // Fixed processing fee
      const netAmount = royaltyAmount + environmentalFee + processingFee;

      return {
        grossRoyalty: Math.round(royaltyAmount * 100) / 100,
        environmentalFee: Math.round(environmentalFee * 100) / 100,
        processingFee,
        totalAmount: Math.round(netAmount * 100) / 100,
        breakdown,
        calculatedAt: new Date().toISOString(),
        formula: record.calculationType
      };

    } catch (error) {
      throw new Error(`Calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate tiered breakdown
   */
  calculateTieredBreakdown(record) {
    const breakdown = { tiers: [] };
    let remainingVolume = record.productionVolume;
    let totalAmount = 0;

    for (const tier of record.calculationParams.tiers) {
      const tierVolume = Math.min(remainingVolume, tier.to ? tier.to - tier.from + 1 : remainingVolume);
      if (tierVolume <= 0) break;

      const tierAmount = tierVolume * record.unitPrice * (tier.rate / 100);
      breakdown.tiers.push({
        range: `${tier.from} - ${tier.to || '∞'}`,
        volume: tierVolume,
        rate: tier.rate,
        amount: tierAmount
      });

      totalAmount += tierAmount;
      remainingVolume -= tierVolume;
    }

    breakdown.totalAmount = totalAmount;
    return breakdown;
  }

  /**
   * Calculate progressive breakdown
   */
  calculateProgressiveBreakdown(record) {
    const baseAmount = record.productionVolume * record.unitPrice * (record.royaltyRate / 100);
    const breakdown = {
      baseAmount,
      bonuses: []
    };

    let totalBonuses = 0;
    for (const progressive of record.calculationParams.progressiveRates || []) {
      if (record.productionVolume >= progressive.threshold) {
        const bonusVolume = record.productionVolume - progressive.threshold;
        const bonusAmount = bonusVolume * record.unitPrice * (progressive.bonusRate / 100);
        breakdown.bonuses.push({
          threshold: progressive.threshold,
          bonusVolume,
          bonusRate: progressive.bonusRate,
          bonusAmount
        });
        totalBonuses += bonusAmount;
      }
    }

    breakdown.totalBonuses = totalBonuses;
    breakdown.totalAmount = baseAmount + totalBonuses;
    return breakdown;
  }

  /**
   * Get market price for mineral
   */
  async getMarketPrice(mineralType, date) {
    // In real application, this would fetch from external API or database
    const marketPrices = {
      'Coal': 75,
      'Stone': 25,
      'Iron Ore': 120,
      'Gravel': 20
    };

    return marketPrices[mineralType] || 50;
  }

  /**
   * Get applicable rate for sliding scale
   */
  getApplicableRate(marketPrice, scales, basePrice) {
    const priceRatio = marketPrice / basePrice;
    
    for (const scale of scales) {
      if (priceRatio >= scale.from && (scale.to === null || priceRatio <= scale.to)) {
        return scale.rate;
      }
    }
    
    return scales[0].rate; // Default to first scale
  }

  /**
   * Update record workflow state
   */
  async updateWorkflowState(recordId, newState, userId, comment = '') {
    const record = this.records.find(r => r.id === recordId);
    if (!record) {
      throw new Error('Record not found');
    }

    if (!this.workflowStates.includes(newState)) {
      throw new Error(`Invalid workflow state: ${newState}`);
    }

    const oldState = record.workflow.state;
    record.workflow.state = newState;
    record.workflow.history.push({
      state: newState,
      timestamp: new Date().toISOString(),
      user: userId,
      comment
    });

    // Update database
    await dbService.update('royalties', recordId, record);

    // Log audit trail
    this.addAuditTrail('workflow_updated', recordId, userId, {
      oldState,
      newState,
      comment
    });

    // Send notifications based on state
    this.handleWorkflowNotifications(record, newState, userId);

    return record;
  }

  /**
   * Handle workflow notifications
   */
  handleWorkflowNotifications(record, newState, userId) {
    const notifications = {
      'submitted': {
        message: `Royalty record #${record.id} submitted for review`,
        type: 'info',
        recipients: ['reviewer', 'admin']
      },
      'approved': {
        message: `Royalty record #${record.id} has been approved`,
        type: 'success',
        recipients: ['submitter', 'finance']
      },
      'rejected': {
        message: `Royalty record #${record.id} has been rejected`,
        type: 'warning',
        recipients: ['submitter']
      },
      'paid': {
        message: `Royalty payment processed for record #${record.id}`,
        type: 'success',
        recipients: ['submitter', 'accounting']
      }
    };

    const notification = notifications[newState];
    if (notification) {
      notificationManager.show(notification.message, notification.type);
    }
  }

  /**
   * Generate batch records from template
   */
  async generateBatchRecords(templateId, batchData) {
    const results = {
      successful: [],
      failed: []
    };

    for (const data of batchData) {
      try {
        const record = await this.createRecord(templateId, data);
        results.successful.push(record);
      } catch (error) {
        results.failed.push({
          data,
          error: error.message
        });
      }
    }

    // Log batch operation
    this.addAuditTrail('batch_created', null, data.userId, {
      templateId,
      total: batchData.length,
      successful: results.successful.length,
      failed: results.failed.length
    });

    return results;
  }

  /**
   * Generate record ID
   */
  generateRecordId() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(this.records.length + 1).padStart(4, '0');
    return `RR${year}${month}${sequence}`;
  }

  /**
   * Add audit trail entry
   */
  addAuditTrail(action, recordId, userId, details) {
    const entry = {
      id: Date.now().toString(),
      action,
      recordId,
      userId: userId || 'system',
      timestamp: new Date().toISOString(),
      details: details || {}
    };

    this.auditTrail.push(entry);
    
    // Keep only latest 1000 entries
    if (this.auditTrail.length > 1000) {
      this.auditTrail = this.auditTrail.slice(-1000);
    }
  }

  /**
   * Get audit trail for record
   */
  getAuditTrail(recordId) {
    return this.auditTrail.filter(entry => entry.recordId === recordId);
  }

  /**
   * Get records summary
   */
  getRecordsSummary() {
    const summary = {
      total: this.records.length,
      byStatus: {},
      byMineral: {},
      totalRoyalties: 0,
      averageProcessingTime: 0
    };

    this.records.forEach(record => {
      // Count by status
      summary.byStatus[record.workflow.state] = (summary.byStatus[record.workflow.state] || 0) + 1;
      
      // Count by mineral type
      summary.byMineral[record.mineralType] = (summary.byMineral[record.mineralType] || 0) + 1;
      
      // Sum total royalties
      if (record.calculationResult) {
        summary.totalRoyalties += record.calculationResult.totalAmount || 0;
      }
    });

    return summary;
  }

  /**
   * Export records to various formats
   */
  async exportRecords(format, filters = {}) {
    let records = this.records;
    
    // Apply filters
    if (filters.status) {
      records = records.filter(r => r.workflow.state === filters.status);
    }
    if (filters.mineralType) {
      records = records.filter(r => r.mineralType === filters.mineralType);
    }
    if (filters.dateFrom) {
      records = records.filter(r => new Date(r.productionDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      records = records.filter(r => new Date(r.productionDate) <= new Date(filters.dateTo));
    }

    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(records);
      case 'excel':
        return this.exportToExcel(records);
      case 'pdf':
        return this.exportToPDF(records);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to CSV format
   */
  exportToCSV(records) {
    const headers = [
      'Record ID', 'Entity Name', 'Mineral Type', 'Production Volume',
      'Unit Price', 'Production Date', 'Royalty Rate', 'Total Amount',
      'Status', 'Created Date'
    ];

    const rows = records.map(record => [
      record.id,
      record.entityName,
      record.mineralType,
      record.productionVolume,
      record.unitPrice,
      record.productionDate,
      record.royaltyRate,
      record.calculationResult?.totalAmount || 0,
      record.workflow.state,
      record.createdAt
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Get records
   */
  getRecords(filters = {}) {
    let records = [...this.records];
    
    // Apply filters
    if (filters.status) {
      records = records.filter(r => r.workflow.state === filters.status);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      records = records.filter(r => 
        r.entityName.toLowerCase().includes(searchTerm) ||
        r.mineralType.toLowerCase().includes(searchTerm) ||
        r.id.toLowerCase().includes(searchTerm)
      );
    }

    return records;
  }

  /**
   * Get record by ID
   */
  getRecord(id) {
    return this.records.find(r => r.id === id);
  }

  /**
   * Delete record
   */
  async deleteRecord(id, userId) {
    const recordIndex = this.records.findIndex(r => r.id === id);
    if (recordIndex === -1) {
      throw new Error('Record not found');
    }

    const record = this.records[recordIndex];
    
    // Check if record can be deleted (only drafts can be deleted)
    if (record.workflow.state !== 'draft') {
      throw new Error('Only draft records can be deleted');
    }

    this.records.splice(recordIndex, 1);
    await dbService.delete('royalties', id);

    // Log audit trail
    this.addAuditTrail('record_deleted', id, userId, { recordData: record });

    notificationManager.show('Royalty record deleted successfully', 'success');
    return true;
  }
}
