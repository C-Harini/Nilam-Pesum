const express = require('express');
const router = express.Router();
const talkAssistant = require('../services/ai/talkAssistant');
const { optionalToken } = require('../middleware/auth');

/**
 * POST /api/talk - Conversational voice assistant
 */
router.post('/talk', optionalToken, async (req, res) => {
  try {
    const { question, fieldId } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question text is required.' });
    }

    const response = await talkAssistant.respondToFarmer({
      question,
      fieldId: fieldId || 'field01'
    });

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ error: 'Talk assistant error: ' + err.message });
  }
});

module.exports = router;
