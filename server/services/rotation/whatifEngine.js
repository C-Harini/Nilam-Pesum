class WhatIfEngine {
  /**
   * Recalculate rotation viability under simulated climate stress
   * @param {Object} baselineScores - Original scores { overall, yield, water, soil, income, risk }
   * @param {Object} adjustments - { tempDeltaF: 0 to 4, rainDeltaPct: -30 to 20, plantingDelayDays: -14 to 28 }
   */
  simulate(baselineScores, adjustments = {}) {
    const tempDelta = parseFloat(adjustments.tempDeltaF || 0);
    const rainDelta = parseFloat(adjustments.rainDeltaPct || 0);
    const delayDays = parseInt(adjustments.plantingDelayDays || 0);

    const scores = { ...baselineScores };
    const impactNotes = [];

    // 1. Temperature Impact
    // Each +1°F increases evapotranspiration and increases heat stress during pollination
    if (tempDelta > 0) {
      const heatPenalty = Math.round(tempDelta * 3.5);
      scores.water = Math.max(10, scores.water - heatPenalty);
      scores.risk = Math.max(10, scores.risk - Math.round(tempDelta * 2.0));
      impactNotes.push(`+${tempDelta}°F temperature rise accelerates evapotranspiration by ~${(tempDelta * 4.2).toFixed(1)}%, reducing soil water buffer.`);
    }

    // 2. Rainfall Impact
    if (rainDelta < 0) {
      const droughtPenalty = Math.round(Math.abs(rainDelta) * 0.85);
      scores.water = Math.max(10, scores.water - droughtPenalty);
      scores.yield = Math.max(10, scores.yield - Math.round(Math.abs(rainDelta) * 0.6));
      scores.income = Math.max(10, scores.income - Math.round(Math.abs(rainDelta) * 0.7));
      impactNotes.push(`${rainDelta}% rainfall deficit increases soil moisture deficit risk during reproductive stages.`);
    } else if (rainDelta > 0) {
      const rainBonus = Math.round(rainDelta * 0.3);
      scores.water = Math.min(100, scores.water + rainBonus);
      if (rainDelta > 15) {
        scores.soil = Math.max(10, scores.soil - 4); // Leaching/erosion risk
        impactNotes.push(`+${rainDelta}% excessive spring moisture raises nitrogen leaching and erosion potential.`);
      }
    }

    // 3. Planting Delay Impact
    if (delayDays > 7) {
      const delayPenalty = Math.round((delayDays - 7) * 0.7);
      scores.yield = Math.max(10, scores.yield - delayPenalty);
      scores.income = Math.max(10, scores.income - delayPenalty);
      scores.risk = Math.max(10, scores.risk - Math.round(delayPenalty * 0.5));
      impactNotes.push(`${delayDays}-day planting delay shifts grain fill into hotter July/August periods, trimming yield potential.`);
    } else if (delayDays < 0) {
      scores.risk = Math.max(10, scores.risk - 5); // Early spring frost risk
      impactNotes.push(`${Math.abs(delayDays)} days early planting increases exposure to late spring frost events.`);
    }

    // Recalculate composite overall score
    const total = scores.yield + scores.water + scores.soil + scores.income + scores.risk;
    scores.overall = Math.round(total / 5);

    const deltaOverall = scores.overall - baselineScores.overall;

    return {
      adjustedScores: scores,
      deltaOverall,
      impactNotes,
      resilienceRating: deltaOverall >= -5 ? 'Highly Resilient' : deltaOverall >= -15 ? 'Moderately Sensitive' : 'High Vulnerability'
    };
  }
}

module.exports = new WhatIfEngine();
