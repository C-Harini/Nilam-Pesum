const axios = require('axios');
const speechFallback = require('./speechFallback');
const dataLoader = require('../data/dataLoader');
const rotationEngine = require('../rotation/rotationEngine');
const seasonEngine = require('../season/seasonEngine');

class TalkAssistant {
  /**
   * Build structured JSON context and formulate reply
   */
  async respondToFarmer({ question, fieldId = 'field01' }) {
    if (!question || question.trim().length === 0) {
      return {
        answer: 'I am listening! Ask me about your soil moisture, rainfall, crop rotations, or upcoming field tasks.',
        mode: 'fallback'
      };
    }

    // 1. Build structured context from authentic local data
    const meta = dataLoader.loadFieldMeta(fieldId);
    const soil = dataLoader.loadSoilData(fieldId);
    const powerRecords = dataLoader.loadPowerDaily(fieldId);
    const latestPower = powerRecords.length > 0 ? powerRecords[powerRecords.length - 1] : null;
    const rain30d = dataLoader.getRainfallLast30Days(fieldId);
    const ndviRecords = dataLoader.loadNdvi(fieldId);
    const latestNdvi = ndviRecords.length > 0 ? ndviRecords[ndviRecords.length - 1] : null;
    const alerts = seasonEngine.evaluateAlerts(fieldId);
    const rotations = rotationEngine.generateRotations({ fieldId, priorities: meta.priorities || [] });
    const topRotation = rotations.length > 0 ? rotations[0] : null;

    const structuredContext = {
      field: {
        id: fieldId,
        name: meta.name,
        county: meta.county,
        state: meta.state,
        acres: meta.areaAcres,
        waterSource: meta.waterSource,
        currentCrop: meta.currentCrop
      },
      soil: soil ? {
        texture: soil.texture,
        organicMatterPct: soil.organicMatterPct,
        pH: soil.pH,
        awcInches: soil.awcInches
      } : null,
      weather: latestPower ? {
        latestDate: latestPower.date,
        tempF: latestPower.tempF,
        tempMaxF: latestPower.tempMaxF,
        tempMinF: latestPower.tempMinF,
        rootWetnessPct: latestPower.rootWetnessPct,
        surfaceWetnessPct: latestPower.surfaceWetnessPct,
        rainLast30dInches: rain30d.totalLast30dInches,
        rainHistoricalAvg30dInches: rain30d.historicalAvg30dInches,
        rainAnomalyPct: rain30d.diffPct
      } : null,
      ndvi: latestNdvi ? {
        value: latestNdvi.ndvi,
        date: latestNdvi.date
      } : null,
      alerts: alerts.map(a => a.title),
      rotation: topRotation ? {
        name: topRotation.name,
        score: topRotation.scores.overall,
        sequence: topRotation.sequence
      } : null
    };

    // 2. Attempt LLM if API Key is configured
    const apiKey = process.env.LLM_API_KEY;
    const provider = process.env.LLM_PROVIDER || 'gemini';

    if (apiKey && apiKey.trim().length > 0) {
      try {
        const llmAnswer = await this.queryLLM(question, structuredContext, apiKey, provider);
        if (llmAnswer) {
          return {
            answer: llmAnswer,
            mode: `llm_${provider}`,
            context: structuredContext
          };
        }
      } catch (err) {
        console.warn(`[Talk] LLM query failed (${err.message}). Using deterministic fallback.`);
      }
    }

    // 3. Deterministic rule-based fallback
    const fallbackAnswer = speechFallback.answer(question, structuredContext);
    return {
      answer: fallbackAnswer,
      mode: 'deterministic_fallback',
      context: structuredContext
    };
  }

  async queryLLM(question, context, apiKey, provider) {
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemPrompt = `You are Nilam Pesum (FieldVoice), an expert agricultural AI assistant designed for the NASA Space Apps Challenge 2026.
You are talking directly to a farmer. Be helpful, clear, and concise.

CRITICAL INTEGRITY RULES:
1. Base all answers strictly on the following JSON context.
2. NEVER invent or fabricate measurements, dates, or NDVI values.
3. If information is not in the context, explicitly say that NASA data has not recorded it.
4. Keep spoken responses under 3 sentences for natural text-to-speech audio playback.

STRUCTURED CONTEXT:
${JSON.stringify(context, null, 2)}`;

      const res = await axios.post(url, {
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nFarmer's Question: "${question}"` }] }
        ]
      }, { timeout: 12000 });

      return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    }

    return null;
  }
}

module.exports = new TalkAssistant();
