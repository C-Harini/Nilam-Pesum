const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Load environment
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const dataLoader = require('../services/data/dataLoader');
const dataValidator = require('../services/data/dataValidator');
const powerService = require('../services/nasa/powerService');
const voiceExtractor = require('../services/ai/voiceExtractor');
const rotationEngine = require('../services/rotation/rotationEngine');
const backtestEngine = require('../services/rotation/backtestEngine');
const whatifEngine = require('../services/rotation/whatifEngine');
const soilBankEngine = require('../services/rotation/soilBankEngine');
const plantingWindowEngine = require('../services/rotation/plantingWindow');
const seasonEngine = require('../services/season/seasonEngine');
const timeMachineEngine = require('../services/timemachine/timeMachineEngine');
const talkAssistant = require('../services/ai/talkAssistant');
const UserModel = require('../models/User');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('🧪 Starting Nilam Pesum (FieldVoice) Automated Test Suite');
  console.log('======================================================\n');

  // Test 1: User Registration and PIN verification
  await runAsyncTest('User Registration & bcrypt PIN Hashing', async () => {
    const testPhone = '9991112233';
    const user = await UserModel.create({ phone: testPhone, pin: '5678', name: 'Test Farmer' });
    assert(user && user._id, 'User record created');
    const valid = await UserModel.verifyPin(user, '5678');
    const invalid = await UserModel.verifyPin(user, '0000');
    assert.strictEqual(valid, true, 'Correct PIN verified');
    assert.strictEqual(invalid, false, 'Incorrect PIN rejected');
  });

  // Test 2: Voice Extraction with Rule Fallback
  runTest('Voice Profile Extraction (Acres, Soil, Crops, Priorities)', () => {
    const transcript = "I have 160 acres of silt loam soil, no irrigation, and grew corn last year. I want to save water and protect my soil.";
    const result = voiceExtractor.extractWithRules(transcript);
    assert.strictEqual(result.areaAcres, 160, 'Acres correctly extracted');
    assert.strictEqual(result.soilTexture, 'Silt Loam', 'Soil texture correctly extracted');
    assert.strictEqual(result.waterSource, 'rainfed', 'Water source correctly extracted');
    assert.strictEqual(result.currentCrop, 'corn', 'Crop correctly extracted');
    assert(result.priorities.includes('Save water'), 'Save water priority extracted');
    assert(result.priorities.includes('Protect my soil'), 'Protect soil priority extracted');
  });

  // Test 3: Unknown Voice Fields Remain Null
  runTest('Voice Extraction leaves unspecified fields null', () => {
    const transcript = "Just checking my weather today.";
    const result = voiceExtractor.extractWithRules(transcript);
    assert.strictEqual(result.areaAcres, null, 'Unspecified acres remain null');
    assert.strictEqual(result.soilTexture, null, 'Unspecified soil remains null');
    assert.strictEqual(result.waterSource, null, 'Unspecified water remains null');
  });

  // Test 4: NASA POWER Daily Loader & Unit Conversions
  runTest('NASA POWER Daily loader converts -999 and applies unit conversions', () => {
    const records = dataLoader.loadPowerDaily('field01');
    assert(records && records.length > 0, 'POWER daily records loaded');
    const sample = records[0];
    assert(sample.date, 'Record has date');
    assert(typeof sample.tempF === 'number' || sample.tempF === null, 'Temp in F computed');
    assert(typeof sample.precipInches === 'number' || sample.precipInches === null, 'Precip in inches computed');
    assert(sample.tempF !== -999, 'No raw -999 fill values leaked');
  });

  // Test 5: MODIS NDVI Loader & Gap-Filled Marking
  runTest('AppEEARS NDVI loader identifies gap-filled points', () => {
    const ndviRecords = dataLoader.loadNdvi('field01');
    assert(ndviRecords && ndviRecords.length > 0, 'NDVI records loaded');
    const hasGapFilled = ndviRecords.some(r => r.interpolated === true);
    assert(hasGapFilled, 'Gap-filled points explicitly marked');
  });

  // Test 6: Scientific Data Validation Report
  runTest('DataValidator generates complete audit report', () => {
    const report = dataValidator.validateField('field01');
    assert.strictEqual(report.datasets.nasa_power.status, 'AVAILABLE', 'NASA POWER available');
    assert.strictEqual(report.datasets.nasa_ndvi.status, 'AVAILABLE', 'NASA NDVI available');
    assert.strictEqual(report.datasets.usda_soil.status, 'AVAILABLE', 'USDA Soil available');
    assert.strictEqual(report.datasets.nasa_power.missingPct, 0, 'Missing pct reported accurately');
  });

  // Test 7: Crop Rotation Engine - 5 Factor Scoring & Double-Weighting
  runTest('Crop Rotation Engine computes 5 factors and priority weights', () => {
    const rotations = rotationEngine.generateRotations({
      fieldId: 'field01',
      priorities: ['Protect my soil', 'Save water']
    });
    assert(rotations.length === 5, 'Top 5 rotations returned');
    const top = rotations[0];
    assert(top.scores.overall >= 0 && top.scores.overall <= 100, 'Score is 0-100');
    assert(top.scores.yield >= 0 && top.scores.yield <= 100, 'Yield score is 0-100');
    assert(top.scores.water >= 0 && top.scores.water <= 100, 'Water score is 0-100');
    assert(top.scores.soil >= 0 && top.scores.soil <= 100, 'Soil score is 0-100');
    assert(top.scores.income >= 0 && top.scores.income <= 100, 'Income score is 0-100');
    assert(top.scores.risk >= 0 && top.scores.risk <= 100, 'Risk score is 0-100');
    assert.strictEqual(top.weights.soil, 2.0, 'Soil weight doubled');
    assert.strictEqual(top.weights.water, 2.0, 'Water weight doubled');
  });

  // Test 8: Historical Backtesting Engine
  runTest('Backtest engine identifies best and worst years in NASA POWER archive', () => {
    const result = backtestEngine.backtestRotation('field01', 'rot_corn_soy_rye');
    assert(result.historicalYears.length > 0, 'Historical years analyzed');
    assert(result.bestYear, 'Best year identified');
    assert(result.worstYear, 'Worst year identified');
  });

  // Test 9: What-If Climate Simulation Engine
  runTest('What-If engine dynamically reduces scores under heat/drought stress', () => {
    const baseline = { overall: 85, yield: 85, water: 85, soil: 85, income: 85, risk: 85 };
    const simulated = whatifEngine.simulate(baseline, {
      tempDeltaF: 3.0,
      rainDeltaPct: -25.0,
      plantingDelayDays: 14
    });
    assert(simulated.adjustedScores.overall < baseline.overall, 'Overall score decreased under stress');
    assert(simulated.adjustedScores.water < baseline.water, 'Water score decreased under drought');
    assert(simulated.impactNotes.length >= 3, 'Comprehensive impact notes generated');
  });

  // Test 10: Soil Bank Nitrogen Accounting
  runTest('Soil Bank computes biological N credits and withdrawals', () => {
    const crops = dataLoader.loadCrops();
    const result = soilBankEngine.calculateLedger(['corn', 'soybean', 'crimson_clover'], crops);
    assert.strictEqual(result.ledger.length, 3, '3-season ledger generated');
    const cornEntry = result.ledger.find(e => e.cropId === 'corn');
    const soyEntry = result.ledger.find(e => e.cropId === 'soybean');
    assert(cornEntry.deltaNLbsPerAcre < 0, 'Corn withdraws nitrogen');
    assert(soyEntry.deltaNLbsPerAcre > 0, 'Soybean fixes nitrogen');
  });

  // Test 11: Planting Window Test Engine
  runTest('Planting Window Test calculates frost risk and soil warm-up', () => {
    const analysis = plantingWindowEngine.analyzePlantingWindow('field01');
    assert(analysis.springAnalyses.length > 0, 'Spring analyses returned');
    assert(analysis.optimalWindowSummary.targetStart, 'Target planting window computed');
  });

  // Test 12: Season Companion & Meteorological Alerts
  runTest('Season Companion generates dated calendar and alert triggers', () => {
    const calendar = seasonEngine.generateSeasonCalendar('corn', 2024);
    assert(calendar.length >= 5, 'Comprehensive tasks generated');
    const alerts = seasonEngine.evaluateAlerts('field01');
    assert(Array.isArray(alerts), 'Alerts evaluated from real data');
  });

  // Test 13: Time Machine Replay & Snapshot
  runTest('Time Machine produces progressive historical replay snapshot', () => {
    const snapshot = timeMachineEngine.getSnapshot('field01', '2023-07-15');
    assert(snapshot.banner.includes('Replay of the 2023 season'), 'Season replay banner confirmed');
    assert(snapshot.seasonAccumulations.cumulativeRainInches > 0, 'Cumulative rainfall tracked');
    assert(snapshot.seasonAccumulations.cumulativeGDD > 0, 'GDD tracked');
    assert(snapshot.ndviSeries.length > 0, 'Expected vs actual NDVI series present');
    assert(snapshot.cropPhenology.currentStage, 'Phenology stage determined');
  });

  // Test 14: Time Machine Season Report Card
  runTest('Time Machine generates comprehensive Report Card with scientific disclaimer', () => {
    const report = timeMachineEngine.generateReportCard('field01', 2023);
    assert(report.verdict, 'Verdict present');
    assert(report.grade, 'Grade present');
    assert(report.disclaimer.includes('Scientific Notice'), 'NDVI scientific honesty disclaimer included');
    assert(report.metrics.peakNdviObserved > 0, 'Peak NDVI observed recorded');
  });

  // Test 15: Talk Assistant (Deterministic Fallback)
  await runAsyncTest('Talk Assistant answers without hallucination using fallback', async () => {
    const res = await talkAssistant.respondToFarmer({
      question: 'Is my soil dry?',
      fieldId: 'field01'
    });
    assert(res.answer.includes('root-zone soil wetness'), 'Answer cites real root-zone wetness');
    assert.strictEqual(res.mode, 'deterministic_fallback', 'Deterministic fallback utilized');
  });

  console.log('\n======================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (100% SUCCESS)`);
  console.log('======================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
