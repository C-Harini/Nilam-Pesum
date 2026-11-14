const dataLoader = require('../data/dataLoader');

class SeasonEngine {
  /**
   * Generate agronomic calendar tasks for a selected crop and planting date
   */
  generateSeasonCalendar(cropId = 'corn', plantingYear = 2024) {
    const crops = dataLoader.loadCrops();
    const crop = crops.find(c => c.id === cropId) || crops[0];

    const calendar = [
      {
        id: 'task_burndown',
        date: `${plantingYear}-04-10`,
        stage: 'Pre-Planting Preparation',
        title: 'Spring Field Scout & Pre-Plant Herbicide / Burndown',
        priority: 'high',
        completed: true,
        reason: 'Eliminate early-season weed flushes and assess winter soil moisture recharge prior to field traffic.',
        details: 'Check root-zone soil wetness to prevent subsoil compaction from heavy machinery.'
      },
      {
        id: 'task_planting',
        date: `${plantingYear}-04-28`,
        stage: 'Planting Window',
        title: `Plant ${crop.name}`,
        priority: 'critical',
        completed: true,
        reason: `Soil temperature stabilized above ${crop.plantingWindow?.minSoilTempF || 50}°F with favorable 5-day dry forecast.`,
        details: `Target seed depth 1.75 - 2.0 inches for uniform germination and rapid emergence.`
      },
      {
        id: 'task_emergence',
        date: `${plantingYear}-05-12`,
        stage: 'Emergence (VE-V1)',
        title: 'Stand Count & Early Vegetative Scouting',
        priority: 'medium',
        completed: true,
        reason: 'Verify emergence uniformity and check for cutworm, wireworm, or early nitrogen deficiency.',
        details: 'Record plant population per 1/1000th acre to calculate final yield expectation.'
      },
      {
        id: 'task_sidedress',
        date: `${plantingYear}-06-05`,
        stage: 'Vegetative V6 (Rapid N Uptake)',
        title: 'Side-Dress Nitrogen Application',
        priority: 'high',
        completed: true,
        reason: 'Supply readily available nitrogen right before the exponential vegetative growth phase.',
        details: 'Credit +45 lbs N from previous soybean rotation in the Soil Bank to reduce synthetic fertilizer application.'
      },
      {
        id: 'task_pollination',
        date: `${plantingYear}-07-15`,
        stage: 'Reproductive R1 (Silking / Anthesis)',
        title: 'Critical Pollination Heat & Moisture Monitoring',
        priority: 'critical',
        completed: false,
        reason: 'Pollination is the highest vulnerability window for corn yield loss under temperatures >95°F.',
        details: 'Check daily NASA POWER maximum temperatures and root-zone soil wetness.'
      },
      {
        id: 'task_grain_fill',
        date: `${plantingYear}-08-20`,
        stage: 'Grain Fill (R3-R4 Dough Stage)',
        title: 'Canopy Health & Satellite NDVI Check',
        priority: 'medium',
        completed: false,
        reason: 'Compare actual MODIS NDVI against the expected curve to detect premature canopy senescence.',
        details: 'Assess kernel depth and inspect ear leaf health for foliar fungal disease.'
      },
      {
        id: 'task_harvest',
        date: `${plantingYear}-10-15`,
        stage: 'Physiological Maturity & Harvest',
        title: `Grain Harvest & Residue Management`,
        priority: 'high',
        completed: false,
        reason: 'Harvest at 15-18% grain moisture to minimize field drop loss and combine cylinder damage.',
        details: 'Prepare drill immediately if seeding winter cereal rye cover crop.'
      }
    ];

    return calendar;
  }

  /**
   * Scan NASA POWER daily observations for meteorological alert triggers
   */
  evaluateAlerts(fieldId, targetDateStr = null) {
    const powerRecords = dataLoader.loadPowerDaily(fieldId);
    if (!powerRecords || powerRecords.length === 0) return [];

    const targetIdx = targetDateStr
      ? powerRecords.findIndex(r => r.date === targetDateStr)
      : powerRecords.length - 1;

    const endIdx = targetIdx >= 0 ? targetIdx : powerRecords.length - 1;
    const currentDate = powerRecords[endIdx].date;
    const currentReading = powerRecords[endIdx];

    const alerts = [];

    // 1. Dry Spell Alert: < 0.25 inches rain in 14 days AND root-zone wetness < 30%
    const start14Idx = Math.max(0, endIdx - 13);
    const window14 = powerRecords.slice(start14Idx, endIdx + 1);
    let rain14 = 0;
    window14.forEach(r => { if (r.precipInches !== null) rain14 += r.precipInches; });

    if (rain14 < 0.25 && currentReading.rootWetnessPct < 30.0) {
      alerts.push({
        id: 'alert_dry_spell',
        type: 'warning',
        severity: 'high',
        title: 'Dry Spell Alert: Root-Zone Moisture Deficit',
        triggerDate: currentDate,
        metric: `${rain14.toFixed(2)}" rain in 14 days; Root wetness: ${currentReading.rootWetnessPct}%`,
        rule: 'Precipitation < 0.25" over 14 consecutive days AND Root-Zone Soil Wetness < 30%.',
        impact: 'Crop vegetative expansion is restricted; root uptake of dissolved nitrate is compromised.',
        action: 'If equipped with irrigation, initiate pivot run. In rainfed fields, avoid soil-disturbing tillage to preserve cap moisture.'
      });
    }

    // 2. Heat Stress Alert: 3 or more days >= 95°F in rolling 7 days
    const start7Idx = Math.max(0, endIdx - 6);
    const window7 = powerRecords.slice(start7Idx, endIdx + 1);
    let heatDays = 0;
    window7.forEach(r => { if (r.tempMaxF !== null && r.tempMaxF >= 95.0) heatDays++; });

    if (heatDays >= 3) {
      alerts.push({
        id: 'alert_heat_stress',
        type: 'danger',
        severity: 'critical',
        title: 'Heat Stress Alert: Elevated Temperatures',
        triggerDate: currentDate,
        metric: `${heatDays} days above 95°F in past 7 days (Peak: ${currentReading.tempMaxF}°F)`,
        rule: '3 or more days with maximum temperature >= 95°F.',
        impact: 'Pollination disruption, pollen desiccation, and accelerated kernel abortion during reproductive stages.',
        action: 'Scout pollination silk timing and delay foliar chemical applications that could exacerbate leaf scorch.'
      });
    }

    // 3. Heavy Rain Alert: > 2.0 inches in 24 hours
    if (currentReading.precipInches !== null && currentReading.precipInches >= 2.0) {
      alerts.push({
        id: 'alert_heavy_rain',
        type: 'warning',
        severity: 'high',
        title: 'Heavy Rainfall & Ponding Risk',
        triggerDate: currentDate,
        metric: `${currentReading.precipInches}" precipitation in 24 hours`,
        rule: '24-hour precipitation accumulation exceeds 2.0 inches.',
        impact: 'Topsoil sheet erosion, fertilizer nitrate leaching below root-zone, and severe equipment rutting.',
        action: 'Delay field machinery operations 48-72 hours until surface soil drains. Inspect waterways and terrace channels.'
      });
    }

    return alerts;
  }
}

module.exports = new SeasonEngine();
