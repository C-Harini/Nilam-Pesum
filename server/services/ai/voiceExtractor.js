const axios = require('axios');

/**
 * Agronomic Voice Entity Extractor
 * Supports both Tamil and English spoken language transcripts.
 * Extracts acres, soil, water source, crops, and priorities.
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

    // Agronomic Rule-Based Fallback (Tamil + English)
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
   * Rule-based entity extraction supporting Tamil & English
   */
  extractWithRules(text) {
    const raw = text.trim();
    const lower = text.toLowerCase();
    const result = this.emptyProfile();

    // 1. Area Acres extraction (e.g. "5 ஏக்கர்", "160 acres", "80 acre", "பத்து ஏக்கர்")
    const acreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:acres?|acre|ac|ஏக்கர்)\b/i);
    if (acreMatch) {
      result.areaAcres = parseFloat(acreMatch[1]);
    } else {
      // Word numbers in English and Tamil
      const tamilWordAcre = raw.match(/(ஐந்து|பத்து|இரண்டு|மூன்று|நான்கு|இருபது|ஐம்பது|நூறு)\s*ஏக்கர்/);
      if (tamilWordAcre) {
        const taMap = {
          'இரண்டு': 2,
          'மூன்று': 3,
          'நான்கு': 4,
          'ஐந்து': 5,
          'பத்து': 10,
          'இருபது': 20,
          'ஐம்பது': 50,
          'நூறு': 100
        };
        result.areaAcres = taMap[tamilWordAcre[1]] || null;
      } else {
        const wordAcreMatch = lower.match(/\b(eighty|one hundred|one hundred sixty|two hundred|three hundred|forty|five|ten)\s*acres?\b/);
        if (wordAcreMatch) {
          const map = {
            'five': 5,
            'ten': 10,
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
    }

    // 2. Soil Texture extraction (Tamil & English)
    if (raw.includes('வண்டல்') || raw.includes('வண்டல் மண்')) {
      result.soilTexture = 'Alluvial Clay Loam (வண்டல் மண்)';
    } else if (raw.includes('செம்மண்')) {
      result.soilTexture = 'Red Loam (செம்மண்)';
    } else if (raw.includes('கரிசல்') || raw.includes('கரிசல் மண்')) {
      result.soilTexture = 'Black Clay (கரிசல் மண்)';
    } else if (raw.includes('மணல்') || raw.includes('மணல் மண்')) {
      result.soilTexture = 'Sandy Loam (மணல் மண்)';
    } else if (raw.includes('களிமண்')) {
      result.soilTexture = 'Clay (களிமண்)';
    } else {
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
          result.soilTexture = st.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }
    }

    // 3. Water Source / Irrigation (Tamil & English)
    if (raw.includes('மானாவாரி') || raw.includes('பாசனம் இல்லை') || raw.includes('மழை நீர்') ||
        lower.includes('no irrigation') || lower.includes('rainfed') || lower.includes('dryland')) {
      result.waterSource = 'rainfed';
    } else if (raw.includes('வாய்க்கால்') || raw.includes('பாசனம்') || raw.includes('போர்வெல்') || raw.includes('கிணறு') ||
               lower.includes('irrigated') || lower.includes('pivot') || lower.includes('drip')) {
      result.waterSource = 'irrigated';
    }

    // 4. Crops extraction (Tamil & English)
    const cropAliases = [
      { id: 'paddy', terms: ['நெல்', 'சம்பா', 'குறுவை', 'அரிசி', 'paddy', 'rice'] },
      { id: 'black_gram', terms: ['உளுந்து', 'உளுந்தம்பயறு', 'black gram', 'urad'] },
      { id: 'groundnut', terms: ['நிலக்கடலை', 'வேர்க்கடலை', 'கடலை', 'groundnut', 'peanut'] },
      { id: 'sesame', terms: ['எள்', 'நல்லெண்ணெய்', 'sesame', 'gingelly'] },
      { id: 'sunn_hemp', terms: ['சணப்பை', 'தக்கைப்பூண்டு', 'sunn hemp', 'green manure'] },
      { id: 'corn', terms: ['மக்காச்சோளம்', 'சோளம்', 'corn', 'maize'] },
      { id: 'soybean', terms: ['சோயாபீன்ஸ்', 'சோயா', 'soybean', 'soybeans'] },
      { id: 'winter_wheat', terms: ['கோதுமை', 'winter wheat', 'wheat'] },
      { id: 'alfalfa', terms: ['குதிரை மசால்', 'alfalfa'] },
      { id: 'cereal_rye', terms: ['மூடு பயிர்', 'ரை', 'cereal rye', 'rye'] }
    ];

    const foundCrops = [];
    cropAliases.forEach(crop => {
      for (const term of crop.terms) {
        if (raw.includes(term) || new RegExp(`\\b${term}\\b`, 'i').test(lower)) {
          if (!foundCrops.includes(crop.id)) {
            foundCrops.push(crop.id);
          }
          break;
        }
      }
    });

    if (foundCrops.length > 0) {
      result.currentCrop = foundCrops[0];
      result.previousCrops = foundCrops.length > 1 ? foundCrops.slice(1) : [foundCrops[0]];
    }

    // 5. Priorities extraction (Tamil & English)
    const priorities = [];
    if (raw.includes('நீர்') || raw.includes('தண்ணீர்') || lower.includes('save water') || lower.includes('drought')) {
      priorities.push('Save water');
    }
    if (raw.includes('லாபம்') || raw.includes('வருமானம்') || lower.includes('earn more') || lower.includes('profit')) {
      priorities.push('Earn more');
    }
    if (raw.includes('மண்') || raw.includes('மண் வளம்') || lower.includes('protect') || lower.includes('soil health')) {
      priorities.push('Protect my soil');
    }
    if (raw.includes('இடர்') || raw.includes('பாதுகாப்பு') || lower.includes('risk') || lower.includes('lower risk')) {
      priorities.push('Lower my risk');
    }

    result.priorities = priorities;
    return result;
  }

  /**
   * LLM Extraction with bilingual support
   */
  async extractWithLLM(transcript) {
    const provider = process.env.LLM_PROVIDER || 'gemini';
    const apiKey = process.env.LLM_API_KEY;

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const prompt = `You are a strict agricultural voice assistant supporting Tamil and English. Extract the farmer's land parameters from this spoken sentence:
"${transcript}"

Output valid JSON ONLY with this exact schema:
{
  "areaAcres": number or null,
  "soilTexture": string or null (e.g. "Alluvial Clay Loam (வண்டல் மண்)" or "Silt loam"),
  "waterSource": "rainfed" | "irrigated" | null,
  "currentCrop": string or null (e.g. "paddy", "black_gram", "corn", "groundnut"),
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
