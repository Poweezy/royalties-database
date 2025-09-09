/**
 * Enhanced Royalty Calculator
 * Advanced calculation engine with multiple rate structures, tax handling, and validation
 */

export class EnhancedRoyaltyCalculator {
  constructor() {
    this.calculationMethods = {
      fixed: this.calculateFixedRate.bind(this),
      tiered: this.calculateTieredRate.bind(this),
      sliding_scale: this.calculateSlidingScale.bind(this),
      hybrid: this.calculateHybridRate.bind(this),
      production_based: this.calculateProductionBased.bind(this),
      value_based: this.calculateValueBased.bind(this)
    };

    this.validationRules = {
      required: ['entity', 'mineral', 'quantity', 'calculationType'],
      ranges: {
        quantity: { min: 0, max: 1000000 },
        rate: { min: 0, max: 100 },
        price: { min: 0, max: 10000 }
      }
    };

    this.taxRates = {
      vat: 0.15, // 15% VAT
      withholding: 0.10, // 10% Withholding tax
      corporate: 0.275 // 27.5% Corporate tax
    };
  }

  /**
   * Calculate royalty with comprehensive validation
   */
  async calculateRoyalty(record) {
    try {
      // Validate input
      const validation = this.validateInput(record);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Get calculation method
      const calculator = this.calculationMethods[record.calculationType];
      if (!calculator) {
        throw new Error(`Unknown calculation type: ${record.calculationType}`);
      }

      // Perform base calculation
      const baseCalculation = await calculator(record);

      // Apply taxes and adjustments
      const finalCalculation = this.applyTaxesAndAdjustments(baseCalculation, record);

      // Generate audit trail
      const auditTrail = this.generateAuditTrail(record, baseCalculation, finalCalculation);

      return {
        ...finalCalculation,
        auditTrail,
        calculatedAt: new Date().toISOString(),
        calculatorVersion: '2.0.0'
      };

    } catch (error) {
      console.error('Royalty calculation error:', error);
      throw error;
    }
  }

  /**
   * Validate input data
   */
  validateInput(record) {
    const errors = [];

    // Check required fields
    this.validationRules.required.forEach(field => {
      if (!record[field] || record[field] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Check ranges
    Object.entries(this.validationRules.ranges).forEach(([field, range]) => {
      if (record[field] !== undefined) {
        const value = parseFloat(record[field]);
        if (isNaN(value) || value < range.min || value > range.max) {
          errors.push(`${field} must be between ${range.min} and ${range.max}`);
        }
      }
    });

    // Business logic validation
    if (record.calculationType === 'sliding_scale' && !record.marketPrice) {
      errors.push('Market price is required for sliding scale calculations');
    }

    if (record.calculationType === 'tiered' && (!record.tiers || !Array.isArray(record.tiers))) {
      errors.push('Tier structure is required for tiered calculations');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Fixed rate calculation
   */
  async calculateFixedRate(record) {
    const rate = parseFloat(record.rate) / 100;
    const quantity = parseFloat(record.quantity);
    const price = parseFloat(record.price || record.marketPrice || 50);

    const grossValue = quantity * price;
    const royaltyAmount = grossValue * rate;

    return {
      method: 'fixed',
      grossValue,
      rate: rate * 100,
      royaltyAmount,
      breakdown: {
        quantity,
        unitPrice: price,
        appliedRate: rate * 100
      }
    };
  }

  /**
   * Tiered rate calculation
   */
  async calculateTieredRate(record) {
    const quantity = parseFloat(record.quantity);
    const price = parseFloat(record.price || record.marketPrice || 50);
    const tiers = record.tiers || [];

    let remainingQuantity = quantity;
    let totalRoyalty = 0;
    const tierBreakdown = [];

    for (const tier of tiers.sort((a, b) => a.from - b.from)) {
      if (remainingQuantity <= 0) break;

      const tierMin = tier.from || 0;
      const tierMax = tier.to || Infinity;
      const tierRate = parseFloat(tier.rate) / 100;

      const tierQuantity = Math.min(remainingQuantity, tierMax - tierMin);
      if (tierQuantity > 0) {
        const tierValue = tierQuantity * price;
        const tierRoyalty = tierValue * tierRate;

        totalRoyalty += tierRoyalty;
        remainingQuantity -= tierQuantity;

        tierBreakdown.push({
          tier: `${tierMin}-${tierMax === Infinity ? '∞' : tierMax}`,
          quantity: tierQuantity,
          rate: tierRate * 100,
          value: tierValue,
          royalty: tierRoyalty
        });
      }
    }

    return {
      method: 'tiered',
      grossValue: quantity * price,
      royaltyAmount: totalRoyalty,
      breakdown: {
        quantity,
        unitPrice: price,
        tiers: tierBreakdown
      }
    };
  }

  /**
   * Sliding scale calculation based on market price
   */
  async calculateSlidingScale(record) {
    const quantity = parseFloat(record.quantity);
    const marketPrice = parseFloat(record.marketPrice);
    const basePrice = parseFloat(record.basePrice || 50);
    const baseRate = parseFloat(record.baseRate || 15) / 100;
    const scales = record.scales || [];

    // Determine applicable rate based on market price
    let appliedRate = baseRate;
    
    for (const scale of scales.sort((a, b) => a.from - b.from)) {
      if (marketPrice >= (scale.from || 0) && marketPrice <= (scale.to || Infinity)) {
        appliedRate = parseFloat(scale.rate) / 100;
        break;
      }
    }

    const grossValue = quantity * marketPrice;
    const royaltyAmount = grossValue * appliedRate;

    return {
      method: 'sliding_scale',
      grossValue,
      royaltyAmount,
      breakdown: {
        quantity,
        marketPrice,
        basePrice,
        appliedRate: appliedRate * 100,
        priceScaling: ((marketPrice - basePrice) / basePrice * 100).toFixed(2) + '%'
      }
    };
  }

  /**
   * Hybrid calculation (combination of methods)
   */
  async calculateHybridRate(record) {
    const methods = record.hybridMethods || ['fixed', 'tiered'];
    const weights = record.hybridWeights || [0.5, 0.5];

    let totalRoyalty = 0;
    const methodBreakdown = [];

    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      const weight = weights[i] || 0;
      
      if (weight > 0 && this.calculationMethods[method]) {
        const methodRecord = { ...record, calculationType: method };
        const methodResult = await this.calculationMethods[method](methodRecord);
        
        const weightedRoyalty = methodResult.royaltyAmount * weight;
        totalRoyalty += weightedRoyalty;

        methodBreakdown.push({
          method,
          weight: weight * 100,
          baseRoyalty: methodResult.royaltyAmount,
          weightedRoyalty
        });
      }
    }

    return {
      method: 'hybrid',
      grossValue: parseFloat(record.quantity) * parseFloat(record.price || 50),
      royaltyAmount: totalRoyalty,
      breakdown: {
        methods: methodBreakdown,
        totalWeight: weights.reduce((sum, w) => sum + w, 0) * 100
      }
    };
  }

  /**
   * Production-based calculation
   */
  async calculateProductionBased(record) {
    const quantity = parseFloat(record.quantity);
    const dailyProduction = parseFloat(record.dailyProduction || quantity / 30);
    const productionCapacity = parseFloat(record.productionCapacity || dailyProduction * 1.5);
    const baseRate = parseFloat(record.baseRate || 15) / 100;
    const price = parseFloat(record.price || 50);

    // Adjust rate based on production efficiency
    const efficiency = dailyProduction / productionCapacity;
    const efficiencyMultiplier = Math.min(1.2, Math.max(0.8, 0.8 + (efficiency * 0.4)));
    
    const adjustedRate = baseRate * efficiencyMultiplier;
    const grossValue = quantity * price;
    const royaltyAmount = grossValue * adjustedRate;

    return {
      method: 'production_based',
      grossValue,
      royaltyAmount,
      breakdown: {
        quantity,
        unitPrice: price,
        baseRate: baseRate * 100,
        efficiency: (efficiency * 100).toFixed(1) + '%',
        efficiencyMultiplier: efficiencyMultiplier.toFixed(2),
        adjustedRate: (adjustedRate * 100).toFixed(2)
      }
    };
  }

  /**
   * Value-based calculation with quality adjustments
   */
  async calculateValueBased(record) {
    const quantity = parseFloat(record.quantity);
    const basePrice = parseFloat(record.price || 50);
    const quality = parseFloat(record.quality || 100); // Quality percentage
    const baseRate = parseFloat(record.baseRate || 15) / 100;

    // Adjust price based on quality
    const qualityMultiplier = quality / 100;
    const adjustedPrice = basePrice * qualityMultiplier;

    // Adjust rate based on value
    const valueThreshold = parseFloat(record.valueThreshold || 75);
    const rateAdjustment = adjustedPrice > valueThreshold ? 1.1 : 1.0;
    const finalRate = baseRate * rateAdjustment;

    const grossValue = quantity * adjustedPrice;
    const royaltyAmount = grossValue * finalRate;

    return {
      method: 'value_based',
      grossValue,
      royaltyAmount,
      breakdown: {
        quantity,
        basePrice,
        quality: quality + '%',
        qualityMultiplier: qualityMultiplier.toFixed(2),
        adjustedPrice: adjustedPrice.toFixed(2),
        rateAdjustment: rateAdjustment.toFixed(2),
        finalRate: (finalRate * 100).toFixed(2)
      }
    };
  }

  /**
   * Apply taxes and adjustments
   */
  applyTaxesAndAdjustments(baseCalculation, record) {
    const royaltyAmount = baseCalculation.royaltyAmount;
    
    // Calculate taxes
    const vat = royaltyAmount * this.taxRates.vat;
    const withholdingTax = royaltyAmount * this.taxRates.withholding;
    
    // Apply discounts or penalties
    const discount = parseFloat(record.discount || 0) / 100;
    const penalty = parseFloat(record.penalty || 0) / 100;
    
    const discountAmount = royaltyAmount * discount;
    const penaltyAmount = royaltyAmount * penalty;
    
    // Calculate net amount
    const netRoyalty = royaltyAmount - discountAmount + penaltyAmount;
    const totalTax = vat + withholdingTax;
    const finalAmount = netRoyalty + totalTax;

    return {
      ...baseCalculation,
      taxes: {
        vat: {
          rate: this.taxRates.vat * 100,
          amount: vat
        },
        withholding: {
          rate: this.taxRates.withholding * 100,
          amount: withholdingTax
        },
        total: totalTax
      },
      adjustments: {
        discount: {
          rate: discount * 100,
          amount: discountAmount
        },
        penalty: {
          rate: penalty * 100,
          amount: penaltyAmount
        }
      },
      summary: {
        baseRoyalty: royaltyAmount,
        netRoyalty: netRoyalty,
        totalTax: totalTax,
        finalAmount: finalAmount
      }
    };
  }

  /**
   * Generate detailed audit trail
   */
  generateAuditTrail(record, baseCalculation, finalCalculation) {
    return {
      input: {
        entity: record.entity,
        mineral: record.mineral,
        quantity: record.quantity,
        calculationType: record.calculationType,
        timestamp: new Date().toISOString()
      },
      calculation: {
        method: baseCalculation.method,
        steps: this.getCalculationSteps(record, baseCalculation),
        grossValue: baseCalculation.grossValue,
        baseRoyalty: baseCalculation.royaltyAmount
      },
      taxes: finalCalculation.taxes,
      adjustments: finalCalculation.adjustments,
      final: finalCalculation.summary,
      validation: {
        rules_applied: this.validationRules.required,
        passed: true
      }
    };
  }

  /**
   * Get detailed calculation steps
   */
  getCalculationSteps(record, calculation) {
    const steps = [
      `Input: ${record.quantity} ${record.mineral} units`,
      `Method: ${calculation.method}`,
      `Gross Value: E ${calculation.grossValue.toFixed(2)}`
    ];

    if (calculation.breakdown) {
      if (calculation.breakdown.tiers) {
        steps.push('Tiered calculation applied:');
        calculation.breakdown.tiers.forEach(tier => {
          steps.push(`  Tier ${tier.tier}: ${tier.quantity} units @ ${tier.rate}% = E ${tier.royalty.toFixed(2)}`);
        });
      } else if (calculation.breakdown.appliedRate) {
        steps.push(`Applied Rate: ${calculation.breakdown.appliedRate}%`);
      }
    }

    steps.push(`Base Royalty: E ${calculation.royaltyAmount.toFixed(2)}`);

    return steps;
  }

  /**
   * Bulk calculate royalties
   */
  async bulkCalculateRoyalties(records) {
    const results = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      try {
        const result = await this.calculateRoyalty(records[i]);
        results.push({ 
          index: i, 
          record: records[i], 
          calculation: result, 
          status: 'success' 
        });
      } catch (error) {
        errors.push({ 
          index: i, 
          record: records[i], 
          error: error.message, 
          status: 'failed' 
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      summary: {
        total: records.length,
        successful: results.length,
        failed: errors.length,
        totalRoyalty: results.reduce((sum, r) => sum + r.calculation.summary.finalAmount, 0)
      }
    };
  }

  /**
   * Get available calculation methods
   */
  getAvailableCalculationMethods() {
    return Object.keys(this.calculationMethods).map(method => ({
      id: method,
      name: method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: this.getMethodDescription(method)
    }));
  }

  /**
   * Get method description
   */
  getMethodDescription(method) {
    const descriptions = {
      fixed: 'Fixed percentage rate applied to total value',
      tiered: 'Different rates applied to quantity tiers',
      sliding_scale: 'Rate varies based on market price',
      hybrid: 'Combination of multiple calculation methods',
      production_based: 'Rate adjusted based on production efficiency',
      value_based: 'Rate adjusted based on product quality and value'
    };
    return descriptions[method] || 'Advanced calculation method';
  }
}
