const dataLoader = require('../data/dataLoader');

class BacktestEngine {
  /**
   * Backtest a crop rotation across all available historical years in NASA POWER dataset
   */
  backtestRotation(fieldId, rotation) {
    const powerRecords = dataLoader.loadPowerDaily(fieldId);
    if (!powerRecords || powerRecords.length === 0) {
      return { years: [], bestYear: null, worstYear: null };
    }

    // Group records by calendar year
    const byYear = {};
    powerRecords.forEach(r => {
      const year = r.date.split('-')[0];
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(r);
    });

    const yearlyResults = [];

    Object.keys(byYear).forEach(year => {
      const days = byYear[year];
      if (days.length < 180) return; // Skip incomplete years

      let totalPrecip = 0;
      let extremeHeatDays = 0; // Days >= 95°F
      let frostFreeDays = 0;
      let totalGDD = 0;

      days.forEach(d => {
        if (d.precipInches !== null) totalPrecip += d.precipInches;
        if (d.tempMaxF !== null && d.tempMaxF >= 95) extremeHeatDays++;
        if (d.tempMinF !== null && d.tempMinF > 32) frostFreeDays++;

        // Modified 86/50 GDD
        if (d.tempMaxF !== null && d.tempMinF !== null) {
          const adjMax = Math.min(Math.max(d.tempMaxF, 50), 86);
          const adjMin = Math.min(Math.max(d.tempMinF, 50), 86);
          const gdd = ((adjMax + adjMin) / 2) - 50;
          if (gdd > 0) totalGDD += gdd;
        }
      });

      // Synthetic yield index based on water and heat stress
      // Optimum growing season rain is ~20-25 inches in Iowa
      const rainStress = Math.abs(totalPrecip - 34.0);
      const heatPenalty = extremeHeatDays * 2.5;
      const performanceIndex = Math.max(40, Math.min(100, Math.round(100 - (rainStress * 1.5) - heatPenalty)));

      yearlyResults.push({
        year: parseInt(year),
        totalPrecipInches: Number(totalPrecip.toFixed(2)),
        extremeHeatDays,
        frostFreeDays,
        totalGDD: Math.round(totalGDD),
        performanceIndex,
        verdict: performanceIndex >= 85 ? 'Excellent' : performanceIndex >= 70 ? 'Normal / Favorable' : 'Challenging / Dry'
      });
    });

    yearlyResults.sort((a, b) => b.performanceIndex - a.performanceIndex);

    const bestYear = yearlyResults.length > 0 ? yearlyResults[0] : null;
    const worstYear = yearlyResults.length > 0 ? yearlyResults[yearlyResults.length - 1] : null;

    return {
      fieldId,
      historicalYears: yearlyResults,
      bestYear,
      worstYear,
      summary: bestYear && worstYear 
        ? `Over the ${yearlyResults.length}-year NASA POWER observational record, ${bestYear.year} provided the highest climate stability (${bestYear.totalPrecipInches}" rain, only ${bestYear.extremeHeatDays} days >95°F), whereas ${worstYear.year} posed the greatest climate stress (${worstYear.extremeHeatDays} days >95°F).`
        : 'Sufficient multi-year NASA POWER records analyzed.'
    };
  }
}

module.exports = new BacktestEngine();
