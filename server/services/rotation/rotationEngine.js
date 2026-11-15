const dataLoader = require('../data/dataLoader');

class RotationEngine {
  /**
   * Generate valid 3-season crop rotations and rank them based on 5 factors
   */
  generateRotations({ fieldId, priorities = [], currentCrop = 'corn', soil = null, duration = '3_year', previousCrops = [] }) {
    const crops = dataLoader.loadCrops();
    const powerRecords = dataLoader.loadPowerDaily(fieldId);
    const soilData = soil || dataLoader.loadSoilData(fieldId) || {
      texture: 'Silt loam',
      organicMatterPct: 3.5,
      awcInches: 2.2
    };

    // Calculate historical climate normals from real NASA POWER observations
    const climateNormals = this.calculateClimateNormals(powerRecords);

    // Candidates of viable crop sequences
    const isTamilField = fieldId === 'field_tn01' || currentCrop === 'paddy' || (soilData && soilData.surveyArea && soilData.surveyArea.includes('Tamil Nadu'));

    let candidates = [];
    if (isTamilField) {
      if (duration === '1_year') {
        candidates = [
          {
            id: 'rot_1yr_paddy_blackgram',
            name: 'சம்பா நெல் → உளுந்து (Samba Paddy → Black Gram Relay)',
            sequence: ['paddy', 'black_gram'],
            description: '1 ஆண்டுக் காவிரி டெல்டா சுழற்சி: சம்பா நெல்லுக்குப் பின் எஞ்சிய ஈரப்பதத்தில் உளுந்து விதைத்து +55 பவுண்டு தழைச்சத்து பெறலாம்.'
          },
          {
            id: 'rot_1yr_sunnhemp_paddy',
            name: 'சணப்பை (பசுந்தாள்) → சம்பா நெல் (Sunn Hemp → Samba Paddy)',
            sequence: ['sunn_hemp', 'paddy'],
            description: '1 ஆண்டு இயற்கை உர உத்தி: சம்பா நடவுக்கு முன் சணப்பை மடக்கி உழுது ஏக்கருக்கு +80 பவுண்டு இயற்கை தழைச்சத்து வரவு.'
          },
          {
            id: 'rot_1yr_paddy_sesame',
            name: 'சம்பா நெல் → கோடை எள் (Samba Paddy → Summer Sesame)',
            sequence: ['paddy', 'sesame'],
            description: '1 ஆண்டுக் குறைந்த நீர் உத்தி: நெல்லுக்குப் பின் கோடையில் குறைந்த நீரில் எள் பயிரிட்டு அதிக சந்தை லாபம் ஈட்டலாம்.'
          },
          {
            id: 'rot_1yr_kuruvai_samba',
            name: 'குறுவை நெல் → சம்பா நெல் (Cauvery Double Paddy)',
            sequence: ['paddy', 'paddy'],
            description: 'பாசன வசதியுள்ள டெல்டா நிலங்களுக்கான 1 ஆண்டு இருபோக நெல் சாகுபடி உத்தி.'
          },
          {
            id: 'rot_1yr_continuous_paddy',
            name: 'தொடர் நெல் சாகுபடி (Continuous Paddy Monoculture)',
            sequence: ['paddy', 'paddy'],
            description: 'சுழற்சி இல்லாத தொடர் நெல் சாகுபடி; தழைச்சத்து விரயம் மற்றும் பூச்சி தாக்குதல் அபாயம் அதிகம்.'
          }
        ];
      } else if (duration === '2_year') {
        candidates = [
          {
            id: 'rot_2yr_paddy_blackgram_sesame',
            name: 'சம்பா நெல் → உளுந்து → எள் (2-Yr High Yield Cycle)',
            sequence: ['paddy', 'black_gram', 'sesame'],
            description: '2 ஆண்டுகளுக்கான காவிரி டெல்டா திட்டம்: நெல், பயறு, மற்றும் எண்ணெய்வித்து பயிர்களுடன் சமநிலையான லாபம்.'
          },
          {
            id: 'rot_2yr_sunnhemp_paddy_blackgram',
            name: 'சணப்பை → சம்பா நெல் → உளுந்து (2-Yr Soil Rebuilder)',
            sequence: ['sunn_hemp', 'paddy', 'black_gram'],
            description: 'மண்வளத்தை மீட்டெடுக்கும் 2 ஆண்டு உத்தி: சணப்பை மற்றும் உளுந்து இரண்டும் மண்ணில் இயற்கை தழைச்சத்தை பன்மடங்கு சேர்க்கும்.'
          },
          {
            id: 'rot_2yr_paddy_groundnut_sesame',
            name: 'சம்பா நெல் → நிலக்கடலை → எள் (2-Yr High Income Oilseeds)',
            sequence: ['paddy', 'groundnut', 'sesame'],
            description: 'அதிக சந்தை மதிப்புள்ள 2 ஆண்டு எண்ணெய்வித்து சுழற்சி: நெல்லுக்குப் பின் நிலக்கடலை மற்றும் எள் மூலம் உச்சபட்ச லாபம்.'
          },
          {
            id: 'rot_2yr_paddy_paddy_blackgram',
            name: 'குறுவை → சம்பா → உளுந்து (2-Yr Double Rice & Pulse)',
            sequence: ['paddy', 'paddy', 'black_gram'],
            description: 'இருபோக நெல் மற்றும் உளுந்து அடங்கிய தீவிர உற்பத்தி முறை; நீர் பாசன வசதி கட்டாயம் தேவை.'
          },
          {
            id: 'rot_2yr_continuous_paddy',
            name: 'தொடர் நெல் சாகுபடி (2-Yr Continuous Monoculture)',
            sequence: ['paddy', 'paddy', 'paddy'],
            description: '2 ஆண்டுகள் ஒரே பயிரைத் தொடர்ந்து சாகுபடி செய்யும் முறை; தழைச்சத்து பற்றாக்குறை மற்றும் இடர் அதிகம்.'
          }
        ];
      } else {
        // 3-Year Rotations (Default)
        candidates = [
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
        ];
      }
    } else {
      candidates = [
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
    }

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
    const count = Math.max(1, cropObjects.length);

    // 1. Yield Score (synergy, pest break, nitrogen rotational bump)
    let yieldSynergyBonus = 0;
    const isMonoculture = candidate.sequence.every(c => c === candidate.sequence[0]);
    const hasCover = candidate.sequence.some(c => c.includes('cover') || c.includes('rye') || c.includes('clover') || c.includes('hemp'));
    const hasLegume = candidate.sequence.some(c => c.includes('gram') || c.includes('soy') || c.includes('hemp') || c.includes('groundnut') || c.includes('clover') || c.includes('alfalfa'));

    if (!isMonoculture) yieldSynergyBonus += 12;
    if (hasLegume) yieldSynergyBonus += 10;
    if (hasCover) yieldSynergyBonus += 6;
    if (candidate.sequence.includes('sesame')) yieldSynergyBonus += 2;
    if (candidate.sequence.includes('sunn_hemp')) yieldSynergyBonus += 4;
    if (candidate.sequence.includes('groundnut')) yieldSynergyBonus += 1;

    let baseYieldScore = isMonoculture ? 58 : 72;
    let yieldScore = Math.min(99, Math.max(35, baseYieldScore + yieldSynergyBonus));

    // 2. Water Score (demand vs AWC & rainfall)
    const totalWaterDemand = cropObjects.reduce((sum, c) => sum + (c.waterRequirementInches || 18), 0) / count;
    const availableWaterCapacity = soil.awcInches || 2.4;
    const avgSeasonRainfall = (climate.avgAnnualRainInches || 34) * 0.65; // ~65% falls in growing season
    
    let waterScore = 70;
    if (avgSeasonRainfall + availableWaterCapacity * 4 >= totalWaterDemand) {
      waterScore = 74 + (avgSeasonRainfall - totalWaterDemand) * 2.8;
    } else {
      waterScore = 70 - (totalWaterDemand - avgSeasonRainfall) * 4.5;
    }
    if (totalWaterDemand > 32) waterScore -= 18;
    else if (totalWaterDemand > 25) waterScore -= 8;
    else if (totalWaterDemand < 15) waterScore += 10;

    waterScore = Math.round(Math.min(99, Math.max(22, waterScore)));

    // 3. Soil Score (organic matter, erosion index, nitrogen balance)
    let totalNBalance = 0;
    let livingRootsScore = 0;
    cropObjects.forEach(c => {
      totalNBalance += (c.nitrogenEffectLbsPerAcre || 0);
      livingRootsScore += (c.erosionProtectionScore || 60);
    });
    livingRootsScore = livingRootsScore / count;
    const avgAnnualNBalance = totalNBalance / count;

    let soilScore = Math.round(52 + (avgAnnualNBalance * 0.65) + (livingRootsScore * 0.35));
    if (hasCover) soilScore += 8;
    if (isMonoculture) soilScore -= 15;
    soilScore = Math.min(98, Math.max(25, soilScore));

    // 4. Income Score (net gross margin scaled without flat-capping at 100)
    let totalNetMargin = 0;
    cropObjects.forEach(c => {
      const gross = (c.typicalYield || 0) * (c.marketPricePerUnit || 0);
      const net = gross - (c.inputCostPerAcre || 0);
      totalNetMargin += net;
    });
    const avgAnnualNetMargin = Math.round(totalNetMargin / count);

    let fertilizerCredit = 0;
    if (hasLegume) fertilizerCredit += 35;
    if (hasCover) fertilizerCredit += 25;
    if (isMonoculture) fertilizerCredit -= 50;

    const netAdjustedMargin = avgAnnualNetMargin + fertilizerCredit;
    let incomeScore = Math.round(38 + (netAdjustedMargin / 900) * 58);
    incomeScore = Math.min(99, Math.max(30, incomeScore));

    // 5. Risk Score (diversity, heat stress resilience, drought buffer)
    const uniqueFamilies = new Set(cropObjects.map(c => c.category)).size;
    let riskScore = 40;
    if (uniqueFamilies >= 3) riskScore = 86;
    else if (uniqueFamilies === 2) riskScore = 72;
    else riskScore = 30; // Monoculture

    if (hasCover) riskScore += 6;
    if (candidate.sequence.includes('sesame')) riskScore += 4;
    if (candidate.sequence.includes('black_gram')) riskScore += 3;
    if (candidate.sequence.includes('sunn_hemp')) riskScore += 5;
    if (isMonoculture) riskScore = 32;

    riskScore = Math.min(98, Math.max(20, riskScore));

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
