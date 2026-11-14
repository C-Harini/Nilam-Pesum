const express = require('express');
const router = express.Router();
const timeMachineEngine = require('../services/timemachine/timeMachineEngine');

/**
 * GET /api/timemachine/snapshot - Progressive time-travel replay state
 */
router.get('/snapshot', (req, res) => {
  try {
    const fieldId = req.query.fieldId || 'field01';
    const date = req.query.date || '2023-07-15';

    const snapshot = timeMachineEngine.getSnapshot(fieldId, date);
    return res.json(snapshot);
  } catch (err) {
    return res.status(500).json({ error: 'Time machine snapshot failed: ' + err.message });
  }
});

/**
 * GET /api/timemachine/report - End-of-season report card
 */
router.get('/report', (req, res) => {
  try {
    const fieldId = req.query.fieldId || 'field01';
    const year = parseInt(req.query.year || '2023');

    const report = timeMachineEngine.generateReportCard(fieldId, year);
    return res.json(report);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate season report card: ' + err.message });
  }
});

module.exports = router;
