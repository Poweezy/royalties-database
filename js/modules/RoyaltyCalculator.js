/**
 * RoyaltyCalculator Module
 *
 * This module encapsulates all logic for calculating royalties based on different contract types.
 */
export class RoyaltyCalculator {
  calculate(contract, productionData) {
    switch (contract.calculationType) {
      case "fixed":
        return this.calculateFixed(contract, productionData);
      case "tiered":
        return this.calculateTiered(contract, productionData);
      case "sliding_scale":
        return this.calculateSlidingScale(contract, productionData);
      default:
        throw new Error(
          `Unknown calculation type: ${contract.calculationType}`,
        );
    }
  }

  calculateFixed(contract, productionData) {
    const rate = contract.calculationParams.rate;
    return productionData.volume * rate;
  }

  calculateTiered(contract, productionData) {
    const tiers = contract.calculationParams.tiers;
    const volume = productionData.volume;
    let royalty = 0;

    for (const tier of tiers) {
      if (volume > tier.from) {
        const taxableVolume = tier.to
          ? Math.min(volume, tier.to) - tier.from
          : volume - tier.from;
        royalty += taxableVolume * tier.rate;
      }
    }
    return royalty;
  }

  calculateSlidingScale(contract, productionData) {
    // A more realistic calculation that incorporates a mock commodity price.
    const scales = contract.calculationParams.scales;
    const basePrice = contract.calculationParams.basePrice || 50; // Assume a base price of 50 if not specified
    const commodityPrice = productionData.commodityPrice || basePrice; // Use base price if no commodity price is provided
    const volume = productionData.volume;
    let baseRate = 0;

    for (const scale of scales) {
      if (volume >= scale.from && (scale.to === null || volume <= scale.to)) {
        baseRate = scale.rate;
        break;
      }
    }

    // Adjust the rate based on the commodity price.
    const priceAdjustmentFactor = commodityPrice / basePrice;
    const finalRate = baseRate * priceAdjustmentFactor;

    return volume * finalRate;
  }
}
