const dataLoader = require('../data/dataLoader');

class RotationEngine {
  /**
   * Generate valid 3-season crop rotations and rank them based on 5 factors
   */
  generateRotations({ fieldId, priorities = [], currentCrop = 'corn', soil = null }) {
    const crops = dataLoader.loadCrops();
    const powerRecords = dataLoader.loadPowerDaily(fieldId);
    const soilData = soil || dataLoader.loadSoilData(fieldId) || {
      texture: 'Silt loam',
      organicMatterPct: 3.5,
      awcInches: 2.2
    };

    // Calculate historical climate normals from real NASA POWER observations
    const climateNormals = this.calculateClimateNormals(powerRecords);

    // Candidates of viable crop sequences (Year 1 -> Year 2 -> Year 3)
    const isTamilField = fieldId === 'field_tn01' || currentCrop === 'paddy' || (soilData && soilData.surveyArea && soilData.surveyArea.includes('Tamil Nadu'));

    const candidates = isTamilField ? [
      {
        id: 'rot_paddy_blackgram_sesame',
        name: 'சம்பா நெல் → உளுந்து → எள் (Samba Paddy → Black Gram → Sesame)',
        sequence: ['paddy', 'black_gram', 'sesame'],
        description: 'காவிரி டெல்டாவின் சிறந்த பயிர் சுழற்சி. நெல்லுக்குப் பின் உளுந்து தழைச்சத்தை கூட்டி பூச்சி சுழற்சியை உடைக்கிறது; கோடையில் எள் அதிக வருமானம் தருகிறது.'
      },
      {
        id: 'rot_sunnhemp_paddy_blackgram',
        name: 'சணப்பை (பசுந்தாள் உரம்) → சம்பா நெல் → உளுந்து',
        sequence: ['sunn_hemp', 'paddy', 'black_gram'],
        description: 'சணப்பை பசுந்தாள் உரம் ஏக்கருக்கு +80 பவுண்டு இயற்கை தழைச்சத்தை வழங்கி மண் வளத்தை பன்மடங்கு பெருக்குகிறது.'
      },
      {
        id: 'rot_paddy_groundnut_sesame',
        name: 'சம்பா நெல் → நிலக்கடலை → எள் (Paddy → Groundnut → Sesame)',
        sequence: ['paddy', 'groundnut', 'sesame'],
        description: 'அதிக சந்தை லாபம் தரும் எண்ணெய்வித்து பயிர் சுழற்சி; நிலக்கடலை வேர் முடிச்சுகள் மண்ணில் இயற்கை தழைச்சத்தை சேர்க்கிறது.'
      },
      {
        id: 'rot_paddy_paddy_blackgram',
        name: 'குறுவை நெல் → சம்பா நெல் → உளுந்து (Cauvery Double Crop)',
        sequence: ['paddy', 'paddy', 'black_gram'],
        description: 'பாசன வசதியுள்ள டெல்டா நிலங்களுக்கான இருபோக நெல் மற்றும் உளுந்து சுழற்சி திட்டம்.'
      },
      {
        id: 'rot_continuous_paddy',
        name: 'தொடர் நெல் சாகுபடி (Continuous Paddy - Benchmark)',
        sequence: ['paddy', 'paddy', 'paddy'],
        description: 'ஒரே பயிரைத் தொடர்ந்து சாகுபடி செய்யும் முறை; தழைச்சத்து பற்றாக்குறை மற்றும் பூச்சி தாக்குதல் அபாயம் அதிகம்.'
      }
    ] : [
      {
        id: 'rot_corn_soy_rye',
        name: 'Corn → Soybean + Cereal Rye Cover → Corn',
        sequence: ['corn', 'soybean', 'cereal_rye'],
        description: 'The golden standard Corn Belt rotation enhanced with a winter cereal rye cover crop to prevent nitrate leaching.'
      },
      {
        id: 'rot_corn_soy_wheat',
        name: 'Corn → Soybean → Winter Wheat',
        sequence: ['corn', 'soybean', 'winter_wheat'],
        description: 'High-diversity 3-crop grain rotation breaking weed cycles and spreading labor across spring and autumn.'
      },
      {
        id: 'rot_clover_corn_soy',
        name: 'Crimson Clover Cover → Corn → Soybean',
        sequence: ['crimson_clover', 'corn', 'soybean'],
        description: 'Biological fertility booster utilizing crimson clover to fix 85 lbs of atmospheric nitrogen before high-demand corn.'
      },
      {
        id: 'rot_oats_alfalfa_corn',
        name: 'Spring Oats → Alfalfa (2-Yr) → Corn',
        sequence: ['oats', 'alfalfa', 'corn'],
        description: 'Deep-rooting perennial forage rotation rebuilding organic matter, soil structure, and massive subsoil nitrogen reserves.'
      },
      {
        id: 'rot_sorghum_soy_rye',
        name: 'Grain Sorghum → Soybean → Cereal Rye',
        sequence: ['sorghum', 'soybean', 'cereal_rye'],
        description: 'Climate-resilient low-water rotation suited for drought-prone seasons or lighter soil types.'
      },
      {
        id: 'rot_continuous_corn',
        name: 'Continuous Corn (Benchmark / High Risk)',
        sequence: ['corn', 'corn', 'corn'],
        description: 'Traditional continuous monoculture with elevated nitrogen requirements and pest accumulation risks.'
      }
    ];

    const scoredRotations = candidates.map(cand => {
      return this.scoreRotation(cand, crops, soilData, climateNormals, priorities);
    });

    // Sort by weighted composite score descending
    scoredRotations.sort((a, b) => b.scores.overall - a.scores.overall);

    // Return top 5
    return scoredRotations.slice(0, 5);
  }

  /**
   * Calculate 5 independent factors (0-100) and weighted overall score
   */
  scoreRotation(candidate, crops, soil, climate, priorities) {
    const cropObjects = candidate.sequence.map(id => crops.find(c => c.id === id)).filter(Boolean);

    // 1. Yield Score (synergy & pest break)
    let yieldSynergyBonus = 0;
    if (candidate.sequence[0] !== candidate.sequence[1] && candidate.sequence[1] !== candidate.sequence[2]) {
      yieldSynergyBonus += 15; // Rotational yield bump
    }
    const hasCover = candidate.sequence.some(c => c.includes('cover') || c.includes('rye') || c.includes('clover'));
    if (hasCover) yieldSynergyBonus += 10;
    const baseYieldScore = candidate.sequence.every(c => c === 'corn') ? 60 : 75;
    const yieldScore = Math.min(100, Math.max(0, baseYieldScore + yieldSynergyBonus));

    // 2. Water Score (demand vs AWC & rainfall)
    const totalWaterDemand = cropObjects.reduce((sum, c) => sum + (c.waterRequirementInches || 18), 0) / 3;
    const availableWaterCapacity = soil.awcInches || 2.4;
    const avgSeasonRainfall = climate.avgAnnualRainInches * 0.65; // ~65% falls in growing season
    let waterScore = 70;
    if (avgSeasonRainfall + availableWaterCapacity * 4 >= totalWaterDemand) {
      waterScore = Math.min(98, 75 + (avgSeasonRainfall - totalWaterDemand) * 3);
    } else {
      waterScore = Math.max(30, 70 - (totalWaterDemand - avgSeasonRainfall) * 5);
    }
    waterScore = Math.round(Math.min(100, Math.max(0, waterScore)));

    // 3. Soil Score (organic matter, erosion index, nitrogen balance)
    let totalNBalance = 0;
    let livingRootsScore = 0;
    cropObjects.forEach(c => {
      totalNBalance += (c.nitrogenEffectLbsPerAcre || 0);
      livingRootsScore += (c.erosionProtectionScore || 60);
    });
    livingRootsScore = livingRootsScore / 3;
    let soilScore = Math.round(50 + (totalNBalance / 10) + (livingRootsScore * 0.4));
    soilScore = Math.min(100, Math.max(15, soilScore));

    // 4. Income Score (net gross margin)
    let totalNetMargin = 0;
    cropObjects.forEach(c => {
      const gross = (c.typicalYield || 0) * (c.marketPricePerUnit || 0);
      const net = gross - (c.inputCostPerAcre || 0);
      totalNetMargin += net;
    });
    const avgAnnualNetMargin = Math.round(totalNetMargin / 3);
    // Scale $100-$450 net margin into 0-100 score
    let incomeScore = Math.round(((avgAnnualNetMargin - 50) / 400) * 100);
    incomeScore = Math.min(100, Math.max(10, incomeScore));

    // 5. Risk Score (diversity, heat stress resilience)
    const uniqueFamilies = new Set(cropObjects.map(c => c.category)).size;
    let riskScore = 40;
    if (uniqueFamilies === 3) riskScore = 92;
    else if (uniqueFamilies === 2) riskScore = 78;
    else riskScore = 32; // Monoculture
    if (hasCover) riskScore += 6;
    riskScore = Math.min(100, Math.max(10, riskScore));

    // Priority weighting
    const weights = {
      yield: 1.0,
      water: 1.0,
      soil: 1.0,
      income: 1.0,
      risk: 1.0
    };

    const explanations = [];

    priorities.forEach(p => {
      const pLower = p.toLowerCase();
      if (pLower.includes('water')) {
        weights.water = 2.0;
        explanations.push('Double-weighted Water Score based on your priority "Save water".');
      }
      if (pLower.includes('earn') || pLower.includes('profit')) {
        weights.income = 2.0;
        explanations.push('Double-weighted Income Score based on your priority "Earn more".');
      }
      if (pLower.includes('soil') || pLower.includes('protect')) {
        weights.soil = 2.0;
        explanations.push('Double-weighted Soil Score based on your priority "Protect my soil".');
      }
      if (pLower.includes('risk')) {
        weights.risk = 2.0;
        explanations.push('Double-weighted Risk Score based on your priority "Lower my risk".');
      }
    });

    const totalWeight = weights.yield + weights.water + weights.soil + weights.income + weights.risk;
    const weightedSum = (yieldScore * weights.yield) +
                        (waterScore * weights.water) +
                        (soilScore * weights.soil) +
                        (incomeScore * weights.income) +
                        (riskScore * weights.risk);

    const overallScore = Math.round(weightedSum / totalWeight);

    return {
      ...candidate,
      crops: cropObjects,
      scores: {
        overall: overallScore,
        yield: yieldScore,
        water: waterScore,
        soil: soilScore,
        income: incomeScore,
        risk: riskScore
      },
      weights,
      financials: {
        avgAnnualNetMargin,
        currency: 'USD/acre'
      },
      soilBank: {
        threeYearNBalanceLbs: totalNBalance,
        averageAnnualNChangeLbs: Math.round(totalNBalance / 3)
      },
      explanations
    };
  }

  /**
   * Derive climate normals from historical records
   */
  calculateClimateNormals(records) {
    if (!records || records.length === 0) {
      return { avgAnnualRainInches: 34.5, avgSummerTempF: 73.2, annualGDD: 2750 };
    }

    let totalRain = 0;
    records.forEach(r => {
      if (r.precipInches !== null) totalRain += r.precipInches;
    });

    const years = Math.max(1, records.length / 365);
    const avgAnnualRainInches = Number((totalRain / years).toFixed(1));

    return {
      avgAnnualRainInches,
      avgSummerTempF: 73.5,
      annualGDD: 2800
    };
  }
}

module.exports = new RotationEngine();
