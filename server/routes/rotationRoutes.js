const express = require('express');
const router = express.Router();
const rotationEngine = require('../services/rotation/rotationEngine');
const backtestEngine = require('../services/rotation/backtestEngine');
const whatifEngine = require('../services/rotation/whatifEngine');
const soilBankEngine = require('../services/rotation/soilBankEngine');
const plantingWindowEngine = require('../services/rotation/plantingWindow');
const dataLoader = require('../services/data/dataLoader');

/**
 * GET /api/rotations - Generate and score top 5 rotations
 */
router.get('/rotations', (req, res) => {
  try {
    const fieldId = req.query.fieldId || 'field01';
    let priorities = [];
    if (req.query.priorities) {
      priorities = Array.isArray(req.query.priorities)
        ? req.query.priorities
        : req.query.priorities.split(',');
    }

    const duration = req.query.duration || '3_year';
    let previousCrops = [];
    if (req.query.previousCrops) {
      previousCrops = Array.isArray(req.query.previousCrops)
        ? req.query.previousCrops
        : req.query.previousCrops.split(',');
    }

    const rotations = rotationEngine.generateRotations({
      fieldId,
      priorities,
      currentCrop: req.query.currentCrop || 'corn',
      duration,
      previousCrops
    });

    return res.json({
      fieldId,
      priorities,
      duration,
      rotations
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate rotations: ' + err.message });
  }
});

/**
 * GET /api/rotations/:id/backtest - Historical climate backtesting
 */
router.get('/rotations/:id/backtest', (req, res) => {
  try {
    const fieldId = req.query.fieldId || 'field01';
    const rotationId = req.params.id;

    const backtest = backtestEngine.backtestRotation(fieldId, rotationId);
    return res.json(backtest);
  } catch (err) {
    return res.status(500).json({ error: 'Backtest failed: ' + err.message });
  }
});

/**
 * POST /api/rotations/:id/whatif - What-if simulation
 */
router.post('/rotations/:id/whatif', (req, res) => {
  try {
    const { baselineScores, adjustments } = req.body;
    if (!baselineScores) {
      return res.status(400).json({ error: 'Baseline scores are required for What-If analysis.' });
    }

    const result = whatifEngine.simulate(baselineScores, adjustments || {});
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'What-If simulation failed: ' + err.message });
  }
});

/**
 * GET /api/planting-window - Planting Window Test
 */
router.get('/planting-window', (req, res) => {
  try {
    const fieldId = req.query.fieldId || 'field01';
    const analysis = plantingWindowEngine.analyzePlantingWindow(fieldId);
    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ error: 'Planting window analysis failed: ' + err.message });
  }
});

/**
 * GET /api/soil-bank - Soil Bank calculation for a sequence
 */
router.get('/soil-bank', (req, res) => {
  try {
    const sequence = req.query.sequence ? req.query.sequence.split(',') : ['corn', 'soybean', 'cereal_rye'];
    const crops = dataLoader.loadCrops();
    const result = soilBankEngine.calculateLedger(sequence, crops);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Soil bank calculation failed: ' + err.message });
  }
});

module.exports = router;
