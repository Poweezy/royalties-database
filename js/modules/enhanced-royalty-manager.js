/**
 * Enhanced Royalty Records Manager
 * Advanced royalty calculation, validation, and management system
 */

import { dbService } from '../services/database.service.js';
import { notificationManager } from './NotificationManager.js';

export class EnhancedRoyaltyManager {
  constructor() {
    this.calculationRules = new Map();
    this.validationRules = new Map();
    this.auditTrail = [];
    this.batchOperations = [];
    this.initialized = false;
  }

  /**
   * Initialize the enhanced royalty manager
   */
  async init() {
    if (this.initialized) return;
    
    await this.loadCalculationRules();
    await this.loadValidationRules();
    this.setupEventListeners();
    this.initialized = true;
  }

  /**
   * Load calculation rules from database or configuration
   */
  async loadCalculationRules() {
    // Default calculation rules - in real app would load from database
    const rules = [
      {
        id: 'tiered-percentage',
        name: 'Tiered Percentage',
        description: 'Progressive rates based on production volume',
        formula: (volume, params) => {
          let totalRoyalty = 0;
          let remainingVolume = volume;
          
          for (const tier of params.tiers) {
            const tierVolume = tier.max ? Math.min(remainingVolume, tier.max - tier.min + 1) : remainingVolume;
            if (tierVolume <= 0) break;
            
            totalRoyalty += tierVolume * (tier.rate / 100);
            remainingVolume -= tierVolume;
            
            if (remainingVolume <= 0) break;
          }
          
          return totalRoyalty;
        }
      },
      {
        id: 'sliding-scale',
        name: 'Sliding Scale',
        description: 'Rate varies with market price',
        formula: (volume, params) => {
          const marketPrice = params.marketPrice || params.basePrice;
          let rate = params.baseRate;
          
          // Adjust rate based on price brackets
          for (const bracket of params.priceBrackets || []) {
            if (marketPrice >= bracket.minPrice && marketPrice <= bracket.maxPrice) {
              rate = bracket.rate;
              break;
            }
          }
          
          return volume * marketPrice * (rate / 100);
        }
      },
      {
        id: 'fixed-rate',
        name: 'Fixed Rate',
        description: 'Fixed percentage of production value',
        formula: (volume, params) => {
          const unitPrice = params.unitPrice || params.marketPrice || 0;
          return volume * unitPrice * (params.rate / 100);
        }
      },
      {
        id: 'minimum-guaranteed',
        name: 'Minimum Guaranteed',
        description: 'Calculated royalty with minimum guarantee',
        formula: (volume, params) => {
          const calculatedRoyalty = volume * (params.unitPrice || 0) * (params.rate / 100);
          return Math.max(calculatedRoyalty, params.minimumAmount || 0);
        }
      }
    ];

    rules.forEach(rule => {
      this.calculationRules.set(rule.id, rule);
    });
  }

  /**
   * Load validation rules
   */
  async loadValidationRules() {
    const rules = [
      {
        id: 'production-volume',
        field: 'productionVolume',
        validate: (value, record) => {
          if (!value || value <= 0) return 'Production volume must be greater than zero';
          if (value > 1000000) return 'Production volume seems unusually high';
          return null;
        }
      },
      {
        id: 'royalty-amount',
        field: 'royaltyAmount',
        validate: (value, record) => {
          if (!value || value < 0) return 'Royalty amount must be non-negative';
          const maxExpected = record.productionVolume * 1000; // Example max
          if (value > maxExpected) return 'Royalty amount seems unusually high';
          return null;
        }
      },
      {
        id: 'date-range',
        field: 'reportingPeriod',
        validate: (value, record) => {
          if (!value || !value.start || !value.end) return 'Reporting period is required';
          const start = new Date(value.start);
          const end = new Date(value.end);
          if (start >= end) return 'End date must be after start date';
          if (end > new Date()) return 'End date cannot be in the future';
          return null;
        }
      },
      {
        id: 'entity-verification',
        field: 'entityId',
        validate: async (value, record) => {
          if (!value) return 'Entity is required';
          // In real app, would verify entity exists and is active
          return null;
        }
      }
    ];

    rules.forEach(rule => {
      this.validationRules.set(rule.id, rule);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'royalty-record-form') {
        e.preventDefault();
        this.handleFormSubmission(e.target);
      }
    });

    // Listen for calculation requests
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('calculate-royalty-btn')) {
        this.calculateRoyalty(e.target.dataset.recordId);
      }
    });
  }

  /**
   * Calculate royalty based on production data and contract terms
   */
  async calculateRoyalty(recordData) {
    try {
      // Get contract details
      const contract = await this.getContractDetails(recordData.entityId, recordData.mineral);
      if (!contract) {
        throw new Error('No active contract found for this entity and mineral type');
      }

      // Get calculation rule
      const rule = this.calculationRules.get(contract.calculationType);
      if (!rule) {
        throw new Error(`Unknown calculation type: ${contract.calculationType}`);
      }

      // Prepare calculation parameters
      const params = {
        ...contract.calculationParams,
        marketPrice: await this.getMarketPrice(recordData.mineral, recordData.reportingPeriod),
        unitPrice: recordData.unitPrice || contract.calculationParams.unitPrice
      };

      // Calculate royalty
      const royaltyAmount = rule.formula(recordData.productionVolume, params);

      // Apply any adjustments
      const adjustedAmount = this.applyAdjustments(royaltyAmount, recordData, contract);

      // Create calculation details
      const calculation = {
        recordId: recordData.id,
        calculationType: contract.calculationType,
        baseAmount: royaltyAmount,
        adjustedAmount: adjustedAmount,
        adjustments: recordData.adjustments || [],
        parameters: params,
        calculatedAt: new Date().toISOString(),
        calculatedBy: this.getCurrentUser()
      };

      // Log calculation in audit trail
      this.auditTrail.push({
        action: 'calculate_royalty',
        recordId: recordData.id,
        details: calculation,
        timestamp: new Date().toISOString(),
        userId: this.getCurrentUser()
      });

      return calculation;

    } catch (error) {
      console.error('Royalty calculation failed:', error);
      throw error;
    }
  }

  /**
   * Apply adjustments to calculated royalty
   */
  applyAdjustments(baseAmount, recordData, contract) {
    let adjustedAmount = baseAmount;
    const adjustments = recordData.adjustments || [];

    adjustments.forEach(adjustment => {
      switch (adjustment.type) {
        case 'percentage':
          adjustedAmount += baseAmount * (adjustment.value / 100);
          break;
        case 'fixed':
          adjustedAmount += adjustment.value;
          break;
        case 'penalty':
          adjustedAmount -= Math.abs(adjustment.value);
          break;
        case 'bonus':
          adjustedAmount += Math.abs(adjustment.value);
          break;
      }
    });

    // Apply minimum guaranteed amount if specified
    if (contract.calculationParams.minimumAmount) {
      adjustedAmount = Math.max(adjustedAmount, contract.calculationParams.minimumAmount);
    }

    return Math.max(0, adjustedAmount); // Ensure non-negative
  }

  /**
   * Validate royalty record
   */
  async validateRecord(recordData) {
    const errors = [];
    const warnings = [];

    // Run all validation rules
    for (const [ruleId, rule] of this.validationRules) {
      try {
        const fieldValue = this.getFieldValue(recordData, rule.field);
        const result = await rule.validate(fieldValue, recordData);
        
        if (result) {
          if (result.severity === 'warning') {
            warnings.push({ field: rule.field, message: result.message || result });
          } else {
            errors.push({ field: rule.field, message: result.message || result });
          }
        }
      } catch (error) {
        errors.push({ field: rule.field, message: `Validation error: ${error.message}` });
      }
    }

    // Cross-field validations
    await this.performCrossFieldValidation(recordData, errors, warnings);

    return { errors, warnings };
  }

  /**
   * Perform cross-field validation
   */
  async performCrossFieldValidation(recordData, errors, warnings) {
    // Check for duplicate submissions
    const existing = await this.findSimilarRecords(recordData);
    if (existing.length > 0) {
      warnings.push({
        field: 'general',
        message: `Similar record found for the same period and entity`
      });
    }

    // Validate calculation consistency
    if (recordData.royaltyAmount && recordData.productionVolume) {
      try {
        const calculation = await this.calculateRoyalty(recordData);
        const difference = Math.abs(recordData.royaltyAmount - calculation.adjustedAmount);
        const tolerance = calculation.adjustedAmount * 0.05; // 5% tolerance

        if (difference > tolerance) {
          warnings.push({
            field: 'royaltyAmount',
            message: `Calculated amount (${calculation.adjustedAmount.toFixed(2)}) differs from entered amount`
          });
        }
      } catch (error) {
        errors.push({
          field: 'general',
          message: `Unable to verify calculation: ${error.message}`
        });
      }
    }
  }

  /**
   * Get field value from nested object
   */
  getFieldValue(obj, fieldPath) {
    return fieldPath.split('.').reduce((value, key) => value?.[key], obj);
  }

  /**
   * Find similar records
   */
  async findSimilarRecords(recordData) {
    try {
      const records = await dbService.getAll('royalties');
      return records.filter(record => 
        record.id !== recordData.id &&
        record.entityId === recordData.entityId &&
        record.mineral === recordData.mineral &&
        this.periodsOverlap(record.reportingPeriod, recordData.reportingPeriod)
      );
    } catch (error) {
      console.error('Error finding similar records:', error);
      return [];
    }
  }

  /**
   * Check if periods overlap
   */
  periodsOverlap(period1, period2) {
    if (!period1 || !period2) return false;
    
    const start1 = new Date(period1.start);
    const end1 = new Date(period1.end);
    const start2 = new Date(period2.start);
    const end2 = new Date(period2.end);
    
    return start1 <= end2 && start2 <= end1;
  }

  /**
   * Handle form submission
   */
  async handleFormSubmission(form) {
    try {
      const formData = new FormData(form);
      const recordData = this.parseFormData(formData);

      // Validate record
      const validation = await this.validateRecord(recordData);
      
      if (validation.errors.length > 0) {
        this.displayValidationErrors(validation.errors);
        return false;
      }

      if (validation.warnings.length > 0) {
        const proceed = await this.confirmWithWarnings(validation.warnings);
        if (!proceed) return false;
      }

      // Calculate royalty if not provided
      if (!recordData.royaltyAmount && recordData.productionVolume) {
        const calculation = await this.calculateRoyalty(recordData);
        recordData.royaltyAmount = calculation.adjustedAmount;
        recordData.calculationDetails = calculation;
      }

      // Save record
      const savedRecord = await this.saveRecord(recordData);
      
      notificationManager.show('Royalty record saved successfully', 'success');
      this.refreshRecordsList();
      
      return true;

    } catch (error) {
      console.error('Form submission failed:', error);
      notificationManager.show(`Failed to save record: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Parse form data into record object
   */
  parseFormData(formData) {
    const record = {};
    
    for (const [key, value] of formData.entries()) {
      if (key.includes('.')) {
        // Handle nested fields
        const keys = key.split('.');
        let current = record;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = this.parseFieldValue(value);
      } else {
        record[key] = this.parseFieldValue(value);
      }
    }

    // Add metadata
    record.createdAt = new Date().toISOString();
    record.createdBy = this.getCurrentUser();
    record.status = 'draft';
    
    return record;
  }

  /**
   * Parse field value based on type
   */
  parseFieldValue(value) {
    if (!value) return null;
    
    // Try to parse as number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    
    // Try to parse as date
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(value).toISOString();
    }
    
    return value;
  }

  /**
   * Save record to database
   */
  async saveRecord(recordData) {
    try {
      // Generate ID if new record
      if (!recordData.id) {
        recordData.id = `RR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Save to database
      const savedRecord = await dbService.save('royalties', recordData);

      // Log in audit trail
      this.auditTrail.push({
        action: recordData.createdAt === recordData.updatedAt ? 'create_record' : 'update_record',
        recordId: recordData.id,
        details: recordData,
        timestamp: new Date().toISOString(),
        userId: this.getCurrentUser()
      });

      return savedRecord;

    } catch (error) {
      console.error('Failed to save record:', error);
      throw error;
    }
  }

  /**
   * Get contract details for entity and mineral
   */
  async getContractDetails(entityId, mineral) {
    try {
      const contracts = await dbService.getAll('contracts');
      return contracts.find(contract => 
        contract.entity === entityId && 
        contract.mineral === mineral &&
        new Date(contract.endDate || '2099-12-31') > new Date()
      );
    } catch (error) {
      console.error('Error getting contract details:', error);
      return null;
    }
  }

  /**
   * Get market price for mineral
   */
  async getMarketPrice(mineral, reportingPeriod) {
    // In real app, would fetch from market data API
    const prices = {
      'coal': 75,
      'iron-ore': 120,
      'stone': 25,
      'gravel': 30,
      'sand': 20
    };
    
    return prices[mineral] || 50;
  }

  /**
   * Display validation errors
   */
  displayValidationErrors(errors) {
    const errorContainer = document.getElementById('validation-errors');
    if (!errorContainer) return;

    errorContainer.innerHTML = errors.map(error => 
      `<div class="validation-error">
        <strong>${error.field}:</strong> ${error.message}
      </div>`
    ).join('');

    errorContainer.style.display = 'block';
  }

  /**
   * Confirm with warnings
   */
  async confirmWithWarnings(warnings) {
    const message = 'Warnings found:\n\n' + 
      warnings.map(w => `• ${w.message}`).join('\n') +
      '\n\nDo you want to continue?';
    
    return confirm(message);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    // In real app, would get from authentication service
    return 'current-user-id';
  }

  /**
   * Refresh records list
   */
  refreshRecordsList() {
    // Trigger refresh event
    window.dispatchEvent(new CustomEvent('royaltyRecordsUpdated'));
  }

  /**
   * Generate batch processing template
   */
  generateBatchTemplate() {
    const template = [
      ['Entity ID', 'Mineral', 'Production Volume', 'Unit Price', 'Period Start', 'Period End', 'Notes'],
      ['ENTITY001', 'coal', '50000', '75', '2024-01-01', '2024-01-31', 'January production'],
      ['ENTITY002', 'stone', '35000', '25', '2024-01-01', '2024-01-31', 'January production']
    ];

    return template;
  }

  /**
   * Process batch upload
   */
  async processBatchUpload(csvData) {
    const results = {
      successful: [],
      errors: [],
      warnings: []
    };

    try {
      const records = this.parseCsvData(csvData);
      
      for (const recordData of records) {
        try {
          const validation = await this.validateRecord(recordData);
          
          if (validation.errors.length > 0) {
            results.errors.push({
              record: recordData,
              errors: validation.errors
            });
            continue;
          }

          if (validation.warnings.length > 0) {
            results.warnings.push({
              record: recordData,
              warnings: validation.warnings
            });
          }

          const savedRecord = await this.saveRecord(recordData);
          results.successful.push(savedRecord);

        } catch (error) {
          results.errors.push({
            record: recordData,
            errors: [{ field: 'general', message: error.message }]
          });
        }
      }

      return results;

    } catch (error) {
      console.error('Batch processing failed:', error);
      throw error;
    }
  }

  /**
   * Parse CSV data
   */
  parseCsvData(csvData) {
    // Simple CSV parsing - in real app would use proper CSV library
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record = {};

      headers.forEach((header, index) => {
        if (values[index]) {
          record[this.mapHeaderToField(header)] = this.parseFieldValue(values[index]);
        }
      });

      records.push(record);
    }

    return records;
  }

  /**
   * Map CSV header to database field
   */
  mapHeaderToField(header) {
    const mappings = {
      'Entity ID': 'entityId',
      'Mineral': 'mineral',
      'Production Volume': 'productionVolume',
      'Unit Price': 'unitPrice',
      'Period Start': 'reportingPeriod.start',
      'Period End': 'reportingPeriod.end',
      'Notes': 'notes'
    };

    return mappings[header] || header.toLowerCase().replace(/\s+/g, '');
  }

  /**
   * Get audit trail for record
   */
  getAuditTrail(recordId) {
    return this.auditTrail.filter(entry => entry.recordId === recordId);
  }

  /**
   * Export records to CSV
   */
  async exportToCSV(filters = {}) {
    try {
      const records = await this.getFilteredRecords(filters);
      
      const headers = [
        'ID', 'Entity', 'Mineral', 'Production Volume', 'Royalty Amount',
        'Period Start', 'Period End', 'Status', 'Created Date'
      ];

      const rows = records.map(record => [
        record.id,
        record.entityId,
        record.mineral,
        record.productionVolume,
        record.royaltyAmount,
        record.reportingPeriod?.start || '',
        record.reportingPeriod?.end || '',
        record.status,
        new Date(record.createdAt).toLocaleDateString()
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');

    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Get filtered records
   */
  async getFilteredRecords(filters) {
    try {
      let records = await dbService.getAll('royalties');

      // Apply filters
      if (filters.entityId) {
        records = records.filter(r => r.entityId === filters.entityId);
      }

      if (filters.mineral) {
        records = records.filter(r => r.mineral === filters.mineral);
      }

      if (filters.status) {
        records = records.filter(r => r.status === filters.status);
      }

      if (filters.dateRange) {
        records = records.filter(r => {
          const recordDate = new Date(r.createdAt);
          return recordDate >= new Date(filters.dateRange.start) &&
                 recordDate <= new Date(filters.dateRange.end);
        });
      }

      return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    } catch (error) {
      console.error('Error filtering records:', error);
      return [];
    }
  }
}

export const enhancedRoyaltyManager = new EnhancedRoyaltyManager();
