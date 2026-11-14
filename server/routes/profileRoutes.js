const express = require('express');
const router = express.Router();
const FieldProfileModel = require('../models/FieldProfile');
const { authenticateToken, optionalToken } = require('../middleware/auth');
const voiceExtractor = require('../services/ai/voiceExtractor');
const dataLoader = require('../services/data/dataLoader');

/**
 * Get current user's profile
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let profile = await FieldProfileModel.findByUserId(req.user.userId);
    if (!profile) {
      // Create blank default profile linked to field01
      const defaultField = dataLoader.loadFieldMeta('field01');
      const defaultSoil = dataLoader.loadSoilData('field01');

      profile = await FieldProfileModel.createOrUpdate(req.user.userId, {
        userId: req.user.userId,
        phone: req.user.phone,
        name: defaultField.name,
        county: defaultField.county,
        state: defaultField.state,
        fieldId: 'field01',
        location: defaultField.location,
        areaAcres: defaultField.areaAcres,
        soil: defaultSoil || {
          texture: 'Silt loam',
          organicMatterPct: 3.8,
          pH: 6.5,
          drainage: 'Well drained',
          awcInches: 2.4,
          source: 'USDA NRCS SSURGO'
        },
        waterSource: 'rainfed',
        currentCrop: 'corn',
        previousCrops: ['soybean', 'corn'],
        priorities: ['Protect my soil', 'Lower my risk']
      });
    }

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: 'Profile retrieval failed: ' + err.message });
  }
});

/**
 * Update current user's profile
 */
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const profile = await FieldProfileModel.createOrUpdate(req.user.userId, updates);
    return res.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    return res.status(500).json({ error: 'Profile update failed: ' + err.message });
  }
});

/**
 * Voice entity extraction endpoint: POST /api/profile/extract
 */
router.post('/extract', optionalToken, async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Audio transcript is required' });
    }

    const extracted = await voiceExtractor.extractEntities(transcript);

    // Generate spoken feedback confirmation
    let feedbackPhrases = [];
    if (extracted.areaAcres) feedbackPhrases.push(`${extracted.areaAcres} acres`);
    if (extracted.soilTexture) feedbackPhrases.push(`${extracted.soilTexture} soil`);
    if (extracted.waterSource) feedbackPhrases.push(`${extracted.waterSource}`);
    if (extracted.currentCrop) feedbackPhrases.push(`growing ${extracted.currentCrop}`);

    const confirmationText = feedbackPhrases.length > 0
      ? `I heard: ${feedbackPhrases.join(', ')}. Does that look right?`
      : `I couldn't quite catch the specific field details. You can tap below to specify your acres or soil.`;

    return res.json({
      transcript,
      extracted,
      confirmationText,
      missingFields: {
        areaAcres: extracted.areaAcres === null,
        soilTexture: extracted.soilTexture === null,
        waterSource: extracted.waterSource === null,
        currentCrop: extracted.currentCrop === null
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Voice extraction failed: ' + err.message });
  }
});

module.exports = router;
