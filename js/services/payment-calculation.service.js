/**
 * @service PaymentCalculationService
 * @description Advanced payment calculation service with multiple royalty calculation methods,
 * penalty calculations, interest calculations, and currency handling
 */

class PaymentCalculationService {
  constructor() {
    this.calculationMethods = {
      fixed: this.calculateFixed.bind(this),
      tiered: this.calculateTiered.bind(this),
      sliding_scale: this.calculateSlidingScale.bind(this),
      ad_valorem: this.calculateAdValorem.bind(this),
      percentage: this.calculatePercentage.bind(this),
      hybrid: this.calculateHybrid.bind(this),
    };

    this.exchangeRates = {
      SZL: 1.0,
      USD: 18.75,
      EUR: 20.45,
      ZAR: 1.08,
      GBP: 23.8,
    };

    this.interestRates = {
      default: 0.12, // 12% annual
      overdue: 0.15, // 15% for overdue payments
      disputed: 0.08, // 8% for disputed amounts
    };

    this.penaltyRates = {
      early: 0.01, // 1% early payment penalty (first 30 days)
      standard: 0.02, // 2% standard penalty (31-90 days)
      severe: 0.05, // 5% severe penalty (90+ days)
      compound: true, // Whether to compound penalties
    };

    this.commodityPrices = {
      Coal: { current: 85, baseline: 75, unit: "USD/ton" },
      "Iron Ore": { current: 120, baseline: 100, unit: "USD/ton" },
      Diamond: { current: 15000, baseline: 12000, unit: "USD/carat" },
      Gold: { current: 1950, baseline: 1800, unit: "USD/oz" },
      "Quarried Stone": { current: 25, baseline: 22, unit: "USD/ton" },
      Gravel: { current: 18, baseline: 15, unit: "USD/ton" },
    };
  }

  /**
   * Main calculation method that handles all payment calculations
   * @param {Object} recordData - The royalty record data
   * @param {Object} options - Additional calculation options
   * @returns {Object} Complete calculation breakdown
   */
  async calculateRoyaltyPayment(recordData, options = {}) {
    try {
      const calculation = {
        recordId: recordData.id,
        calculationDate: new Date().toISOString(),
        method: recordData.calculationMethod || "fixed",
        currency: recordData.currency || "SZL",

        // Base calculations
        baseCalculation: {},

        // Additional calculations
        penalties: {},
        interest: {},
        adjustments: {},

        // Summary
        breakdown: {},
        total: 0,

        // Metadata
        exchangeRate: this.exchangeRates[recordData.currency || "SZL"],
        commodityPrices: this.getCommodityPrice(recordData.mineral),
        calculationRules: {},

        // Validation
        isValid: true,
        validationErrors: [],
        warnings: [],
      };

      // 1. Base royalty calculation
      await this.performBaseCalculation(recordData, calculation, options);

      // 2. Apply penalties if applicable
      await this.calculatePenalties(recordData, calculation, options);

      // 3. Calculate interest if applicable
      await this.calculateInterest(recordData, calculation, options);

      // 4. Apply currency adjustments
      await this.applyCurrencyAdjustments(recordData, calculation, options);

      // 5. Calculate final totals
      this.calculateTotals(calculation);

      // 6. Validate calculation
      await this.validateCalculation(recordData, calculation, options);

      return calculation;
    } catch (error) {
      throw new Error(`Payment calculation failed: ${error.message}`);
    }
  }

  /**
   * Perform base royalty calculation based on method
   */
  async performBaseCalculation(recordData, calculation, options) {
    const method = recordData.calculationMethod || "fixed";
    const calculator = this.calculationMethods[method];

    if (!calculator) {
      throw new Error(`Unknown calculation method: ${method}`);
    }

    calculation.baseCalculation = await calculator(recordData, options);
    calculation.calculationRules.method = method;
    calculation.calculationRules.appliedRules =
      calculation.baseCalculation.appliedRules || [];
  }

  /**
   * Fixed rate calculation
   */
  async calculateFixed(recordData, options) {
    const { volume, tariff } = recordData;

    return {
      method: "fixed",
      volume: volume,
      rate: tariff,
      baseAmount: volume * tariff,
      appliedRules: [`Fixed rate: ${tariff} per unit`],
      breakdown: {
        "Volume (tons)": volume,
        "Rate (per ton)": tariff,
        "Base Amount": volume * tariff,
      },
    };
  }

  /**
   * Tiered calculation with progressive rates
   */
  async calculateTiered(recordData, options) {
    const contract =
      options.contract || this.getContractData(recordData.contractId);
    const tiers =
      contract?.calculationParams?.tiers ||
      this.getDefaultTiers(recordData.mineral);

    let totalAmount = 0;
    let remainingVolume = recordData.volume;
    const appliedTiers = [];
    const breakdown = {};

    for (const tier of tiers) {
      if (remainingVolume <= 0) break;

      const tierCapacity = tier.to ? tier.to - tier.from : Infinity;
      const volumeInTier = Math.min(remainingVolume, tierCapacity);
      const tierAmount = volumeInTier * tier.rate;

      totalAmount += tierAmount;
      remainingVolume -= volumeInTier;

      appliedTiers.push({
        range: `${tier.from} - ${tier.to || "∞"}`,
        rate: tier.rate,
        volume: volumeInTier,
        amount: tierAmount,
      });

      breakdown[`Tier ${tier.from}-${tier.to || "∞"} @ ${tier.rate}`] =
        tierAmount;
    }

    return {
      method: "tiered",
      volume: recordData.volume,
      baseAmount: totalAmount,
      appliedTiers: appliedTiers,
      appliedRules: appliedTiers.map(
        (t) => `${t.volume} tons @ ${t.rate} = ${t.amount}`,
      ),
      breakdown: breakdown,
    };
  }

  /**
   * Sliding scale calculation based on commodity prices
   */
  async calculateSlidingScale(recordData, options) {
    const contract =
      options.contract || this.getContractData(recordData.contractId);
    const scales =
      contract?.calculationParams?.scales ||
      this.getDefaultScales(recordData.mineral);
    const commodityPrice = this.getCommodityPrice(recordData.mineral);

    // Find applicable scale based on price or volume
    let applicableScale = scales[0];
    for (const scale of scales) {
      if (
        commodityPrice.current >= scale.priceFrom &&
        (!scale.priceTo || commodityPrice.current <= scale.priceTo)
      ) {
        applicableScale = scale;
        break;
      }
    }

    // Calculate price adjustment factor
    const basePrice =
      contract?.calculationParams?.basePrice || commodityPrice.baseline;
    const priceAdjustmentFactor = commodityPrice.current / basePrice;

    // Apply sliding scale
    const baseRate = applicableScale.rate;
    const adjustedRate = baseRate * priceAdjustmentFactor;
    const baseAmount = recordData.volume * adjustedRate;

    return {
      method: "sliding_scale",
      volume: recordData.volume,
      baseRate: baseRate,
      adjustedRate: adjustedRate,
      commodityPrice: commodityPrice.current,
      basePrice: basePrice,
      priceAdjustmentFactor: priceAdjustmentFactor,
      baseAmount: baseAmount,
      appliedRules: [
        `Base rate: ${baseRate}`,
        `Current price: ${commodityPrice.current} ${commodityPrice.unit}`,
        `Adjustment factor: ${priceAdjustmentFactor.toFixed(3)}`,
        `Adjusted rate: ${adjustedRate.toFixed(2)}`,
      ],
      breakdown: {
        Volume: recordData.volume,
        "Base Rate": baseRate,
        "Price Adjustment": `${((priceAdjustmentFactor - 1) * 100).toFixed(1)}%`,
        "Final Rate": adjustedRate,
        "Base Amount": baseAmount,
      },
    };
  }

  /**
   * Ad valorem calculation (percentage of value)
   */
  async calculateAdValorem(recordData, options) {
    const marketValue =
      recordData.marketValue || this.calculateMarketValue(recordData);
    const adValoremRate = recordData.adValoremRate || 0.05; // 5% default

    const baseAmount = marketValue * adValoremRate;

    return {
      method: "ad_valorem",
      marketValue: marketValue,
      rate: adValoremRate,
      baseAmount: baseAmount,
      appliedRules: [
        `Market value: ${marketValue}`,
        `Ad valorem rate: ${(adValoremRate * 100).toFixed(1)}%`,
      ],
      breakdown: {
        "Market Value": marketValue,
        "Ad Valorem Rate": `${(adValoremRate * 100).toFixed(1)}%`,
        "Base Amount": baseAmount,
      },
    };
  }

  /**
   * Percentage calculation (percentage of gross value)
   */
  async calculatePercentage(recordData, options) {
    const grossValue =
      recordData.grossValue || this.calculateGrossValue(recordData);
    const percentageRate = recordData.percentageRate || 0.1; // 10% default

    const baseAmount = grossValue * percentageRate;

    return {
      method: "percentage",
      grossValue: grossValue,
      rate: percentageRate,
      baseAmount: baseAmount,
      appliedRules: [
        `Gross value: ${grossValue}`,
        `Percentage rate: ${(percentageRate * 100).toFixed(1)}%`,
      ],
      breakdown: {
        "Gross Value": grossValue,
        "Percentage Rate": `${(percentageRate * 100).toFixed(1)}%`,
        "Base Amount": baseAmount,
      },
    };
  }

  /**
   * Hybrid calculation combining multiple methods
   */
  async calculateHybrid(recordData, options) {
    const hybridConfig =
      options.hybridConfig || this.getDefaultHybridConfig(recordData.mineral);

    let totalAmount = 0;
    const components = [];
    const appliedRules = [];
    const breakdown = {};

    for (const component of hybridConfig.components) {
      const componentData = { ...recordData, ...component.overrides };
      const componentCalc = await this.calculationMethods[component.method](
        componentData,
        options,
      );

      const componentAmount = componentCalc.baseAmount * component.weight;
      totalAmount += componentAmount;

      components.push({
        method: component.method,
        weight: component.weight,
        amount: componentAmount,
        calculation: componentCalc,
      });

      appliedRules.push(
        `${component.method} (${component.weight * 100}%): ${componentAmount.toFixed(2)}`,
      );
      breakdown[`${component.method} Component`] = componentAmount;
    }

    return {
      method: "hybrid",
      components: components,
      baseAmount: totalAmount,
      appliedRules: appliedRules,
      breakdown: breakdown,
    };
  }

  /**
   * Calculate penalties for overdue payments
   */
  async calculatePenalties(recordData, calculation, options) {
    const paymentDate = new Date(recordData.paymentDate);
    const today = new Date();
    const daysPastDue = Math.max(
      0,
      Math.ceil((today - paymentDate) / (1000 * 60 * 60 * 24)),
    );

    calculation.penalties = {
      daysPastDue: daysPastDue,
      penaltyAmount: 0,
      penaltyRate: 0,
      appliedRules: [],
    };

    if (daysPastDue <= 0 || recordData.status === "Paid") {
      calculation.penalties.appliedRules.push(
        "No penalties - payment not overdue",
      );
      return;
    }

    let penaltyRate = 0;
    let penaltyDescription = "";

    if (daysPastDue <= 30) {
      penaltyRate = this.penaltyRates.early;
      penaltyDescription = "Early overdue penalty";
    } else if (daysPastDue <= 90) {
      penaltyRate = this.penaltyRates.standard;
      penaltyDescription = "Standard overdue penalty";
    } else {
      penaltyRate = this.penaltyRates.severe;
      penaltyDescription = "Severe overdue penalty";
    }

    const baseAmount = calculation.baseCalculation.baseAmount;
    let penaltyAmount = baseAmount * penaltyRate;

    // Apply compound penalties if enabled
    if (this.penaltyRates.compound && daysPastDue > 30) {
      const compoundPeriods = Math.floor(daysPastDue / 30);
      penaltyAmount =
        baseAmount * Math.pow(1 + penaltyRate, compoundPeriods) - baseAmount;
      penaltyDescription += " (compounded)";
    }

    calculation.penalties = {
      daysPastDue: daysPastDue,
      penaltyRate: penaltyRate,
      penaltyAmount: penaltyAmount,
      description: penaltyDescription,
      appliedRules: [
        `${daysPastDue} days overdue`,
        `${penaltyDescription}: ${(penaltyRate * 100).toFixed(1)}%`,
        `Penalty amount: ${penaltyAmount.toFixed(2)}`,
      ],
    };
  }

  /**
   * Calculate interest on late payments
   */
  async calculateInterest(recordData, calculation, options) {
    const paymentDate = new Date(recordData.paymentDate);
    const today = new Date();
    const daysLate = Math.max(
      0,
      Math.ceil((today - paymentDate) / (1000 * 60 * 60 * 24)),
    );

    calculation.interest = {
      daysLate: daysLate,
      interestAmount: 0,
      interestRate: 0,
      appliedRules: [],
    };

    // Interest typically starts after a grace period (e.g., 60 days)
    const gracePeriod = options.interestGracePeriod || 60;

    if (daysLate <= gracePeriod || recordData.status === "Paid") {
      calculation.interest.appliedRules.push(
        `No interest - within ${gracePeriod} day grace period`,
      );
      return;
    }

    const interestPeriod = daysLate - gracePeriod;
    const annualRate =
      recordData.status === "Disputed"
        ? this.interestRates.disputed
        : this.interestRates.overdue;

    const dailyRate = annualRate / 365;
    const baseAmount = calculation.baseCalculation.baseAmount;

    // Compound interest calculation
    const interestAmount =
      baseAmount * (Math.pow(1 + dailyRate, interestPeriod) - 1);

    calculation.interest = {
      daysLate: daysLate,
      gracePeriod: gracePeriod,
      interestPeriod: interestPeriod,
      annualRate: annualRate,
      dailyRate: dailyRate,
      interestAmount: interestAmount,
      appliedRules: [
        `${daysLate} days late (${interestPeriod} days beyond grace period)`,
        `Annual interest rate: ${(annualRate * 100).toFixed(1)}%`,
        `Interest amount: ${interestAmount.toFixed(2)}`,
      ],
    };
  }

  /**
   * Apply currency adjustments
   */
  async applyCurrencyAdjustments(recordData, calculation, options) {
    const baseCurrency = "SZL";
    const targetCurrency = recordData.currency || baseCurrency;

    calculation.adjustments = {
      baseCurrency: baseCurrency,
      targetCurrency: targetCurrency,
      exchangeRate: this.exchangeRates[targetCurrency],
      adjustmentAmount: 0,
      appliedRules: [],
    };

    if (targetCurrency === baseCurrency) {
      calculation.adjustments.appliedRules.push(
        "No currency adjustment needed",
      );
      return;
    }

    // Convert all amounts to target currency
    const exchangeRate = this.exchangeRates[targetCurrency];
    const baseAmount = calculation.baseCalculation.baseAmount;

    // Note: In this implementation, we assume base calculations are in SZL
    // and we adjust to target currency
    calculation.adjustments = {
      baseCurrency: baseCurrency,
      targetCurrency: targetCurrency,
      exchangeRate: exchangeRate,
      originalAmount: baseAmount,
      adjustedAmount: baseAmount, // Amounts stay the same, just currency label changes
      appliedRules: [
        `Currency: ${targetCurrency}`,
        `Exchange rate: 1 ${baseCurrency} = ${exchangeRate} ${targetCurrency}`,
      ],
    };
  }

  /**
   * Calculate final totals
   */
  calculateTotals(calculation) {
    const baseAmount = calculation.baseCalculation.baseAmount || 0;
    const penaltyAmount = calculation.penalties.penaltyAmount || 0;
    const interestAmount = calculation.interest.interestAmount || 0;
    const adjustmentAmount = calculation.adjustments.adjustmentAmount || 0;

    calculation.breakdown = {
      baseAmount: baseAmount,
      penalties: penaltyAmount,
      interest: interestAmount,
      adjustments: adjustmentAmount,
      subtotal: baseAmount + penaltyAmount + interestAmount + adjustmentAmount,
      total: baseAmount + penaltyAmount + interestAmount + adjustmentAmount,
    };

    calculation.total = calculation.breakdown.total;
  }

  /**
   * Validate calculation results
   */
  async validateCalculation(recordData, calculation, options) {
    // Validate that calculations are reasonable
    if (calculation.total < 0) {
      calculation.validationErrors.push("Total payment cannot be negative");
      calculation.isValid = false;
    }

    if (calculation.total > 1000000) {
      // 1M threshold
      calculation.warnings.push("Payment amount is unusually high");
    }

    // Validate against business rules
    const minAmount = this.getMinimumPayment(recordData.mineral);
    if (calculation.baseCalculation.baseAmount < minAmount) {
      calculation.warnings.push(
        `Payment below minimum threshold for ${recordData.mineral}`,
      );
    }
  }

  // Utility methods
  getCommodityPrice(mineral) {
    return (
      this.commodityPrices[mineral] || {
        current: 50,
        baseline: 50,
        unit: "USD/ton",
      }
    );
  }

  calculateMarketValue(recordData) {
    const commodityPrice = this.getCommodityPrice(recordData.mineral);
    return recordData.volume * commodityPrice.current;
  }

  calculateGrossValue(recordData) {
    const unitPrice =
      recordData.unitPrice ||
      this.getCommodityPrice(recordData.mineral).current;
    return recordData.volume * unitPrice;
  }

  getContractData(contractId) {
    // This would typically fetch from database or app state
    return window.app?.state?.contracts?.find((c) => c.id === contractId);
  }

  getDefaultTiers(mineral) {
    // Default tiered structure based on mineral type
    const defaultTiers = {
      Coal: [
        { from: 0, to: 1000, rate: 20 },
        { from: 1001, to: 5000, rate: 25 },
        { from: 5001, to: null, rate: 30 },
      ],
      "Iron Ore": [
        { from: 0, to: 500, rate: 30 },
        { from: 501, to: 2000, rate: 35 },
        { from: 2001, to: null, rate: 40 },
      ],
    };

    return (
      defaultTiers[mineral] || [
        { from: 0, to: 1000, rate: 15 },
        { from: 1001, to: null, rate: 20 },
      ]
    );
  }

  getDefaultScales(mineral) {
    // Default sliding scales based on price ranges
    return [
      { priceFrom: 0, priceTo: 50, rate: 0.05 },
      { priceFrom: 51, priceTo: 100, rate: 0.07 },
      { priceFrom: 101, priceTo: null, rate: 0.1 },
    ];
  }

  getDefaultHybridConfig(mineral) {
    // Default hybrid configuration
    return {
      components: [
        { method: "fixed", weight: 0.6, overrides: {} },
        { method: "ad_valorem", weight: 0.4, overrides: {} },
      ],
    };
  }

  getMinimumPayment(mineral) {
    const minimums = {
      Diamond: 1000,
      Gold: 5000,
      Coal: 100,
      "Iron Ore": 200,
    };
    return minimums[mineral] || 50;
  }

  /**
   * Get calculation summary for display
   */
  getCalculationSummary(calculation) {
    return {
      method: calculation.method,
      currency: calculation.currency,
      baseAmount: calculation.baseCalculation.baseAmount,
      penalties: calculation.penalties.penaltyAmount || 0,
      interest: calculation.interest.interestAmount || 0,
      total: calculation.total,
      breakdown: calculation.breakdown,
      warnings: calculation.warnings,
      appliedRules: [
        ...calculation.baseCalculation.appliedRules,
        ...calculation.penalties.appliedRules,
        ...calculation.interest.appliedRules,
        ...calculation.adjustments.appliedRules,
      ],
    };
  }

  /**
   * Export calculation details for audit
   */
  exportCalculationAudit(calculation) {
    return {
      calculationId: `CALC-${Date.now()}`,
      timestamp: calculation.calculationDate,
      recordId: calculation.recordId,
      method: calculation.method,
      fullBreakdown: calculation,
      auditTrail: {
        baseCalculation: calculation.baseCalculation,
        penalties: calculation.penalties,
        interest: calculation.interest,
        adjustments: calculation.adjustments,
        validation: {
          isValid: calculation.isValid,
          errors: calculation.validationErrors,
          warnings: calculation.warnings,
        },
      },
    };
  }
}

// Export singleton instance
export const paymentCalculationService = new PaymentCalculationService();
export default paymentCalculationService;
