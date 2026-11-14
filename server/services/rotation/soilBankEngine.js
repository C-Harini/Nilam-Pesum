class SoilBankEngine {
  /**
   * Calculate 3-year biological nitrogen ledger for a sequence of crops
   */
  calculateLedger(cropSequence, cropsCatalogue) {
    let currentBalance = 0;
    const ledger = [];

    cropSequence.forEach((cropId, index) => {
      const crop = cropsCatalogue.find(c => c.id === cropId);
      if (!crop) return;

      const deltaN = crop.nitrogenEffectLbsPerAcre || 0;
      const startingBalance = currentBalance;
      currentBalance += deltaN;

      const isDeposit = deltaN >= 0;

      ledger.push({
        year: index + 1,
        cropId: crop.id,
        cropName: crop.name,
        type: crop.type,
        action: isDeposit ? 'Biological Nitrogen Deposit' : 'Crop Nutrient Uptake / Withdrawal',
        deltaNLbsPerAcre: deltaN,
        startingBalanceLbs: startingBalance,
        endingBalanceLbs: currentBalance,
        description: isDeposit
          ? `${crop.name} biological nitrogen fixation adds +${deltaN} lbs N/acre to the soil profile.`
          : `${crop.name} harvest uptake removes ${Math.abs(deltaN)} lbs N/acre from available soil reserves.`
      });
    });

    return {
      ledger,
      finalNetBalanceLbsPerAcre: currentBalance,
      status: currentBalance >= 0 ? 'Surplus / Regenerative' : currentBalance >= -80 ? 'Balanced with standard synthetic top-dress' : 'High Nitrogen Deficit',
      fertilizerSavingsPerAcreUsd: Number((Math.max(0, currentBalance) * 0.72).toFixed(2)) // ~$0.72 per lb of synthetic N
    };
  }
}

module.exports = new SoilBankEngine();
