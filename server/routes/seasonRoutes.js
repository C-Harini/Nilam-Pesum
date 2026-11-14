const express = require('express');
const router = express.Router();
const seasonEngine = require('../services/season/seasonEngine');
const FieldProfileModel = require('../models/FieldProfile');
const { optionalToken } = require('../middleware/auth');

// In-memory or file-backed storage for voice notes & commitments
const committedPlans = new Map();
const voiceNotes = [];

/**
 * GET /api/season - Retrieve current active season calendar and active alerts
 */
router.get('/season', optionalToken, async (req, res) => {
  try {
    const fieldId = req.query.fieldId || 'field01';
    const cropId = req.query.crop || 'corn';

    const calendar = seasonEngine.generateSeasonCalendar(cropId, 2024);
    const alerts = seasonEngine.evaluateAlerts(fieldId);
    const notes = voiceNotes.filter(n => n.fieldId === fieldId);

    return res.json({
      fieldId,
      cropId,
      calendar,
      alerts,
      voiceNotes: notes,
      summary: `${calendar.filter(t => t.completed).length} of ${calendar.length} seasonal tasks completed. ${alerts.length} active weather alert(s).`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve season companion: ' + err.message });
  }
});

/**
 * POST /api/season/commit - Commit a rotation to the active season
 */
router.post('/season/commit', optionalToken, async (req, res) => {
  try {
    const { fieldId, rotationId, sequence } = req.body;
    committedPlans.set(fieldId, {
      fieldId,
      rotationId,
      sequence,
      committedAt: new Date().toISOString()
    });

    const calendar = seasonEngine.generateSeasonCalendar(sequence ? sequence[0] : 'corn', 2024);

    return res.json({
      message: 'Crop rotation successfully committed to your season plan!',
      plan: committedPlans.get(fieldId),
      calendar
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to commit rotation: ' + err.message });
  }
});

/**
 * POST /api/season/notes - Save a voice note transcript
 */
router.post('/season/notes', optionalToken, (req, res) => {
  try {
    const { fieldId, text, stage } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Note text is required.' });
    }

    const note = {
      id: 'note_' + Date.now(),
      fieldId: fieldId || 'field01',
      text,
      stage: stage || 'Vegetative Scouting',
      timestamp: new Date().toISOString()
    };

    voiceNotes.unshift(note);
    return res.status(201).json({ message: 'Voice note recorded', note });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save note: ' + err.message });
  }
});

module.exports = router;
