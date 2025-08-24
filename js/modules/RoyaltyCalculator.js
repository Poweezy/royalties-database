/**
 * RoyaltyCalculator Module
 *
 * This module encapsulates all logic for calculating royalties based on different contract types.
 */
export class RoyaltyCalculator {
    calculate(contract, productionData) {
        switch (contract.calculationType) {
            case 'fixed':
                return this.calculateFixed(contract, productionData);
            case 'tiered':
                return this.calculateTiered(contract, productionData);
            case 'sliding_scale':
                return this.calculateSlidingScale(contract, productionData);
            default:
                throw new Error(`Unknown calculation type: ${contract.calculationType}`);
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
                const taxableVolume = tier.to ? Math.min(volume, tier.to) - tier.from : volume - tier.from;
                royalty += taxableVolume * tier.rate;
            }
        }
        return royalty;
    }

    calculateSlidingScale(contract, productionData) {
        // This is a placeholder for a more complex calculation that would likely involve fetching the commodity price.
        // For now, we will use a simple calculation based on the production volume.
        const scales = contract.calculationParams.scales;
        const volume = productionData.volume;
        let rate = 0;

        for (const scale of scales) {
            if (volume >= scale.from && (scale.to === null || volume <= scale.to)) {
                rate = scale.rate;
                break;
            }
        }
        return volume * rate;
    }
}
