/**
 * Royalty Calculation Service
 * Advanced calculation methods for different royalty types
 */

class RoyaltyCalculationService {
  constructor() {
    this.exchangeRates = {
      SZL: 1.0, // Emalangeni (base)
      ZAR: 1.0, // South African Rand (pegged)
      USD: 0.055, // US Dollar
      EUR: 0.051, // Euro
      GBP: 0.044, // British Pound
    };

    this.penaltyRates = {
      monthly: 0.02, // 2% per month
      daily: 0.0007, // 0.07% per day (roughly 2% monthly)
    };
  }

  /**
   * Calculate royalty payment based on calculation type
   */
  calculateRoyalty(params) {
    const {
      calculationType,
      volume,
      price = null,
      calculationParams = {},
      mineral,
      entity,
    } = params;

    try {
      switch (calculationType) {
        case "fixed":
          return this.calculateFixed(volume, calculationParams.rate);

        case "tiered":
          return this.calculateTiered(volume, calculationParams.tiers);

        case "sliding_scale":
          return this.calculateSlidingScale(volume, price, calculationParams);

        case "ad_valorem":
          return this.calculateAdValorem(
            volume,
            price,
            calculationParams.percentage,
          );

        case "progressive":
          return this.calculateProgressive(volume, calculationParams);

        default:
          throw new Error(`Unknown calculation type: ${calculationType}`);
      }
    } catch (error) {
      console.error("Royalty calculation error:", error);
      return { error: error.message, amount: 0 };
    }
  }

  /**
   * Fixed rate calculation
   */
  calculateFixed(volume, rate) {
    const amount = volume * rate;
    return {
      amount,
      breakdown: `${volume} units × E${rate} = E${amount.toFixed(2)}`,
      method: "Fixed Rate",
    };
  }

  /**
   * Tiered rate calculation
   */
  calculateTiered(volume, tiers) {
    let totalAmount = 0;
    let remainingVolume = volume;
    const breakdown = [];

    for (const tier of tiers) {
      if (remainingVolume <= 0) break;

      const tierMax = tier.to || Number.MAX_SAFE_INTEGER;
      const tierVolume = Math.min(remainingVolume, tierMax - tier.from + 1);
      const tierAmount = tierVolume * tier.rate;

      totalAmount += tierAmount;
      remainingVolume -= tierVolume;

      breakdown.push(
        `Tier ${tier.from}-${tier.to || "∞"}: ${tierVolume} units × E${tier.rate} = E${tierAmount.toFixed(2)}`,
      );
    }

    return {
      amount: totalAmount,
      breakdown: breakdown.join("\n"),
      method: "Tiered Rate",
    };
  }

  /**
   * Sliding scale calculation based on market price
   */
  calculateSlidingScale(volume, price, params) {
    if (!price) {
      throw new Error("Market price required for sliding scale calculation");
    }

    const { scales, basePrice = 50 } = params;
    const priceRatio = price / basePrice;

    let applicableRate = scales[scales.length - 1].rate; // Default to highest rate

    for (const scale of scales) {
      const scaleMax = scale.to || Number.MAX_SAFE_INTEGER;
      if (priceRatio >= scale.from && priceRatio <= scaleMax) {
        applicableRate = scale.rate;
        break;
      }
    }

    const amount = volume * price * (applicableRate / 100);

    return {
      amount,
      breakdown: `${volume} units × E${price} × ${applicableRate}% = E${amount.toFixed(2)}`,
      method: "Sliding Scale",
      details: {
        marketPrice: price,
        basePrice,
        priceRatio: priceRatio.toFixed(2),
        applicableRate: `${applicableRate}%`,
      },
    };
  }

  /**
   * Ad valorem (percentage of value) calculation
   */
  calculateAdValorem(volume, price, percentage) {
    if (!price) {
      throw new Error("Market price required for ad valorem calculation");
    }

    const totalValue = volume * price;
    const amount = totalValue * (percentage / 100);

    return {
      amount,
      breakdown: `${volume} units × E${price} × ${percentage}% = E${amount.toFixed(2)}`,
      method: "Ad Valorem",
      details: {
        totalValue,
        percentage: `${percentage}%`,
      },
    };
  }

  /**
   * Progressive calculation (increases with production levels)
   */
  calculateProgressive(volume, params) {
    const { baseRate, progressionFactor = 0.1, threshold = 1000 } = params;

    let rate = baseRate;
    if (volume > threshold) {
      const excess = volume - threshold;
      const progressionMultiplier =
        1 + (excess / threshold) * progressionFactor;
      rate = baseRate * progressionMultiplier;
    }

    const amount = volume * rate;

    return {
      amount,
      breakdown:
        volume > threshold
          ? `${volume} units × E${rate.toFixed(2)} (progressive rate) = E${amount.toFixed(2)}`
          : `${volume} units × E${rate} (base rate) = E${amount.toFixed(2)}`,
      method: "Progressive Rate",
      details: {
        baseRate,
        finalRate: rate.toFixed(2),
        threshold,
        isProgressive: volume > threshold,
      },
    };
  }

  /**
   * Calculate penalties for overdue payments
   */
  calculatePenalties(
    dueDate,
    currentDate = new Date(),
    baseAmount,
    penaltyType = "monthly",
  ) {
    const due = new Date(dueDate);
    const current = new Date(currentDate);

    if (current <= due) {
      return {
        penaltyAmount: 0,
        daysPastDue: 0,
        breakdown: "Payment not overdue",
      };
    }

    const daysPastDue = Math.ceil((current - due) / (1000 * 60 * 60 * 24));
    let penaltyAmount = 0;
    let breakdown = "";

    if (penaltyType === "monthly") {
      const monthsPastDue = Math.ceil(daysPastDue / 30);
      penaltyAmount = baseAmount * this.penaltyRates.monthly * monthsPastDue;
      breakdown = `E${baseAmount.toFixed(2)} × ${this.penaltyRates.monthly * 100}% × ${monthsPastDue} months = E${penaltyAmount.toFixed(2)}`;
    } else {
      penaltyAmount = baseAmount * this.penaltyRates.daily * daysPastDue;
      breakdown = `E${baseAmount.toFixed(2)} × ${this.penaltyRates.daily * 100}% × ${daysPastDue} days = E${penaltyAmount.toFixed(2)}`;
    }

    return {
      penaltyAmount,
      daysPastDue,
      breakdown,
      penaltyRate:
        penaltyType === "monthly"
          ? `${this.penaltyRates.monthly * 100}% per month`
          : `${this.penaltyRates.daily * 100}% per day`,
    };
  }

  /**
   * Calculate interest on late payments
   */
  calculateInterest(principal, annualRate, days) {
    const dailyRate = annualRate / 365;
    const interest = principal * dailyRate * days;

    return {
      interestAmount: interest,
      dailyRate: `${(dailyRate * 100).toFixed(4)}%`,
      annualRate: `${(annualRate * 100).toFixed(2)}%`,
      breakdown: `E${principal.toFixed(2)} × ${(dailyRate * 100).toFixed(4)}% × ${days} days = E${interest.toFixed(2)}`,
    };
  }

  /**
   * Convert amount between currencies
   */
  convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return { convertedAmount: amount, rate: 1 };
    }

    const fromRate = this.exchangeRates[fromCurrency];
    const toRate = this.exchangeRates[toCurrency];

    if (!fromRate || !toRate) {
      throw new Error(
        `Exchange rate not available for ${fromCurrency} to ${toCurrency}`,
      );
    }

    // Convert to SZL first, then to target currency
    const szlAmount = amount / fromRate;
    const convertedAmount = szlAmount * toRate;
    const exchangeRate = toRate / fromRate;

    return {
      convertedAmount,
      rate: exchangeRate,
      breakdown: `${amount} ${fromCurrency} × ${exchangeRate.toFixed(4)} = ${convertedAmount.toFixed(2)} ${toCurrency}`,
    };
  }

  /**
   * Validate calculation parameters
   */
  validateCalculationParams(calculationType, params) {
    const errors = [];

    switch (calculationType) {
      case "fixed":
        if (!params.rate || params.rate <= 0) {
          errors.push("Fixed rate must be positive");
        }
        break;

      case "tiered":
        if (!params.tiers || !Array.isArray(params.tiers)) {
          errors.push("Tiers must be an array");
        } else {
          params.tiers.forEach((tier, index) => {
            if (!tier.rate || tier.rate <= 0) {
              errors.push(`Tier ${index + 1} rate must be positive`);
            }
            if (tier.from < 0) {
              errors.push(`Tier ${index + 1} 'from' value cannot be negative`);
            }
          });
        }
        break;

      case "sliding_scale":
        if (!params.scales || !Array.isArray(params.scales)) {
          errors.push("Scales must be an array");
        }
        if (!params.basePrice || params.basePrice <= 0) {
          errors.push("Base price must be positive");
        }
        break;

      case "ad_valorem":
        if (
          !params.percentage ||
          params.percentage <= 0 ||
          params.percentage > 100
        ) {
          errors.push("Percentage must be between 0 and 100");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get suggested calculation method based on mineral type
   */
  getSuggestedCalculationMethod(mineral) {
    const suggestions = {
      Coal: { method: "sliding_scale", reason: "Variable market prices" },
      "Iron Ore": { method: "ad_valorem", reason: "High value commodity" },
      Gold: {
        method: "ad_valorem",
        reason: "Precious metal with volatile prices",
      },
      Diamond: { method: "ad_valorem", reason: "High value precious stone" },
      "Quarried Stone": {
        method: "fixed",
        reason: "Stable low-value commodity",
      },
      Gravel: { method: "fixed", reason: "Standard construction material" },
      Sand: { method: "fixed", reason: "Basic construction material" },
      Limestone: { method: "tiered", reason: "Volume-based production" },
    };

    return (
      suggestions[mineral] || {
        method: "fixed",
        reason: "Default method for unknown mineral type",
      }
    );
  }
}

export const royaltyCalculationService = new RoyaltyCalculationService();
