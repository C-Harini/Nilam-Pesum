const axios = require('axios');

/**
 * Agronomic Voice Entity Extractor
 * Extracts acres, soil, water source, crops, and priorities from spoken audio transcript.
 * Has strict fallback: unknown fields remain null; never invents measurements.
 */
class VoiceExtractor {
  async extractEntities(transcript) {
    if (!transcript || transcript.trim().length === 0) {
      return this.emptyProfile();
    }

    // Attempt LLM if configured
    if (process.env.LLM_API_KEY) {
      try {
        const llmResult = await this.extractWithLLM(transcript);
        if (llmResult) return llmResult;
      } catch (err) {
        console.warn(`[AI] LLM extraction error (${err.message}). Using rule-based fallback.`);
      }
    }

    // Agronomic Rule-Based Fallback
    return this.extractWithRules(transcript);
  }

  emptyProfile() {
    return {
      areaAcres: null,
      soilTexture: null,
      waterSource: null,
      currentCrop: null,
      previousCrops: [],
      priorities: []
    };
  }

  /**
   * Rule-based entity extraction
   */
  extractWithRules(text) {
    const lower = text.toLowerCase();
    const result = this.emptyProfile();

    // 1. Area Acres extraction (e.g. "160 acres", "80 acre", "320 ac")
    const acreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:acres?|acre|ac)\b/);
    if (acreMatch) {
      result.areaAcres = parseFloat(acreMatch[1]);
    } else {
      // Word numbers
      const wordAcreMatch = lower.match(/\b(eighty|one hundred|one hundred sixty|two hundred|three hundred|forty)\s*acres?\b/);
      if (wordAcreMatch) {
        const map = {
          'forty': 40,
          'eighty': 80,
          'one hundred': 100,
          'one hundred sixty': 160,
          'two hundred': 200,
          'three hundred': 300
        };
        result.areaAcres = map[wordAcreMatch[1]] || null;
      }
    }

    // 2. Soil Texture extraction
    const soilTextures = [
      'silt loam',
      'sandy loam',
      'clay loam',
      'silty clay loam',
      'sandy clay',
      'silty clay',
      'clay',
      'loam',
      'sand',
      'silt'
    ];
    for (const st of soilTextures) {
      if (lower.includes(st)) {
        // Capitalize properly
        result.soilTexture = st.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    // 3. Water Source / Irrigation extraction
    if (lower.includes('no irrigation') || lower.includes('rainfed') || lower.includes('dryland') || lower.includes('rain fed')) {
      result.waterSource = 'rainfed';
    } else if (lower.includes('irrigated') || lower.includes('pivot') || lower.includes('drip irrigation') || lower.includes('center pivot')) {
      result.waterSource = 'irrigated';
    }

    // 4. Crops extraction
    const cropAliases = [
      { id: 'corn', terms: ['corn', 'maize'] },
      { id: 'soybean', terms: ['soybean', 'soybeans', 'beans', 'soya'] },
      { id: 'winter_wheat', terms: ['winter wheat', 'wheat'] },
      { id: 'oats', terms: ['oats', 'spring oats'] },
      { id: 'alfalfa', terms: ['alfalfa', 'hay'] },
      { id: 'sorghum', terms: ['sorghum', 'milo'] },
      { id: 'cereal_rye', terms: ['cereal rye', 'rye cover', 'rye'] },
      { id: 'crimson_clover', terms: ['crimson clover', 'clover'] }
    ];

    const foundCrops = [];
    cropAliases.forEach(crop => {
      for (const term of crop.terms) {
        if (new RegExp(`\\b${term}\\b`).test(lower)) {
          if (!foundCrops.includes(crop.id)) {
            foundCrops.push(crop.id);
          }
          break;
        }
      }
    });

    if (foundCrops.length > 0) {
      // Check for past phrasing
      if (lower.includes('last year') || lower.includes('previously') || lower.includes('grew') || lower.includes('past')) {
        result.previousCrops = foundCrops;
        result.currentCrop = foundCrops[0];
      } else {
        result.currentCrop = foundCrops[0];
        result.previousCrops = foundCrops.slice(1);
      }
    }

    // 5. Priorities extraction
    const priorities = [];
    if (lower.includes('save water') || lower.includes('drought') || lower.includes('water conservation') || lower.includes('conserve water')) {
      priorities.push('Save water');
    }
    if (lower.includes('earn more') || lower.includes('profit') || lower.includes('higher income') || lower.includes('make more money') || lower.includes('yield')) {
      priorities.push('Earn more');
    }
    if (lower.includes('protect') || lower.includes('soil health') || lower.includes('soil conservation') || lower.includes('erosion')) {
      priorities.push('Protect my soil');
    }
    if (lower.includes('risk') || lower.includes('lower risk') || lower.includes('resilience') || lower.includes('insurance')) {
      priorities.push('Lower my risk');
    }

    result.priorities = priorities;
    return result;
  }

  /**
   * LLM Extraction (Gemini / OpenAI / custom)
   */
  async extractWithLLM(transcript) {
    const provider = process.env.LLM_PROVIDER || 'gemini';
    const apiKey = process.env.LLM_API_KEY;

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are a strict agricultural voice assistant. Extract the farmer's land parameters from this spoken sentence:
"${transcript}"

Output valid JSON ONLY with this exact schema:
{
  "areaAcres": number or null,
  "soilTexture": string or null (e.g. "Silt loam"),
  "waterSource": "rainfed" | "irrigated" | null,
  "currentCrop": string or null,
  "previousCrops": array of strings,
  "priorities": array of strings from ["Save water", "Earn more", "Protect my soil", "Lower my risk"]
}
STRICT RULE: Do NOT invent or infer unmentioned data. Unspoken fields must be null.`;

      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      }, { timeout: 10000 });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return JSON.parse(text);
      }
    }

    return null;
  }
}

module.exports = new VoiceExtractor();
