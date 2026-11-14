class SpeechFallbackEngine {
  /**
   * Deterministic rule-based agricultural assistant fallback
   * Supports both Tamil (தமிழ்) and English agricultural inquiries.
   */
  answer(question, context) {
    const q = (question || '').trim().toLowerCase();
    const raw = (question || '').trim();
    const { field, weather, soil, alerts, rotation } = context;

    const isTamil = /[\u0B80-\u0BFF]/.test(raw) || field?.state === 'Tamil Nadu' || field?.id === 'field_tn01';

    // 1. "Is my soil dry?" / மண் ஈரம் பற்றிய கேள்வி
    if (q.includes('soil dry') || q.includes('moisture') || raw.includes('ஈரம்') || raw.includes('உலர்ந்து') || raw.includes('மண் காஞ்சு')) {
      const wet = weather?.rootWetnessPct ?? 36;
      if (isTamil) {
        const condition = wet < 25 ? 'கடுமையான வறட்சி' : wet < 35 ? 'மிதமான ஈரப்பதம்' : 'ஏதுவான ஈரப்பதம்';
        return `நாசா POWER தரவுகளின்படி, உங்கள் நிலத்தின் வேர் மண்டல மண் ஈரப்பதம் தற்போது ${wet}% ஆக உள்ளது (${condition}). கடந்த 30 நாட்களில் உங்கள் வயல் ${weather?.rainLast30dInches || 2.4} அங்குல மழையைப் பெற்றுள்ளது.`;
      }
      const condition = wet < 25 ? 'critically dry' : wet < 35 ? 'somewhat dry' : 'adequately moist';
      return `Your root-zone soil wetness is currently at ${wet}% saturation, which indicates ${condition} conditions. Over the past 30 days, your field received ${weather?.rainLast30dInches || 2.8} inches of rain.`;
    }

    // 2. "Should I irrigate this week?" / நீர்ப்பாசனம் செய்ய வேண்டுமா?
    if (q.includes('irrigate') || q.includes('irrigation') || raw.includes('பாசனம்') || raw.includes('தண்ணீர் பாய்ச்ச') || raw.includes('தண்ணி கட்ட')) {
      const wet = weather?.rootWetnessPct ?? 36;
      if (isTamil) {
        if (field?.waterSource === 'rainfed') {
          return `உங்கள் வயல் மானாவாரி நிலமாகப் பதிவு செய்யப்பட்டுள்ளது. மண் ஈரப்பதம் ${wet}% உள்ளது. ஈரப்பதத்தை பாதுகாக்க மேலோட்டமான உழவைத் தவிர்த்து, மூடு பயிர்களைப் பயன்படுத்துங்கள்.`;
        }
        if (wet < 30) {
          return `ஆம், நாசா ஆய்வின்படி வேர் மண்டல மண் ஈரப்பதம் ${wet}% ஆகக் குறைந்துள்ளது. இந்த வாரம் 1.0 முதல் 1.5 அங்குலம் வரை பாசனம் செய்வது பயிருக்கு அவசியமானது.`;
        } else {
          return `தற்போது பாசனம் தேவையில்லை. உங்கள் நிலத்தின் வேர் மண்டல ஈரப்பதம் ${wet}% அளவுக்குப் போதுமானதாக உள்ளது.`;
        }
      }
      if (field?.waterSource === 'rainfed') {
        return `Your field profile is registered as rainfed (no irrigation). Root-zone moisture is at ${wet}%. To conserve soil moisture, avoid deep tillage and consider cover crops to retain subsoil moisture.`;
      }
      if (wet < 30) {
        return `Yes, based on NASA POWER observations, your root-zone soil wetness is at ${wet}%, below optimal capacity. Applying 1.0 to 1.5 inches of irrigation this week is recommended.`;
      } else {
        return `No need to irrigate right now. Your root-zone soil wetness is favorable at ${wet}% saturation with sufficient available water.`;
      }
    }

    // 3. "Why did you recommend this rotation?" / பயிர் சுழற்சி பரிந்துரை ஏன்?
    if (q.includes('why') && (q.includes('recommend') || q.includes('rotation') || q.includes('crop')) || raw.includes('சுழற்சி') || raw.includes('பரிந்துரை')) {
      const topName = rotation?.name || 'சம்பா நெல் → உளுந்து → எள்';
      const score = rotation?.score || 92;
      if (isTamil) {
        return `${topName} பயிர் சுழற்சியை (ஒட்டுமொத்த மதிப்பெண்: ${score}/100) பரிந்துரைக்கிறோம். நெல்லுக்குப் பின் உளுந்து பயிரிடுவது வேர் முடிச்சுகள் மூலம் ஏக்கருக்கு +55 பவுண்டு இயற்கை தழைச்சத்தை மண்ணில் சேர்க்கிறது மற்றும் பூச்சி தாக்கத்தை உடைக்கிறது.`;
      }
      return `I recommended ${topName} (Overall Score: ${score}/100) because it provides the optimal balance between high income and soil health. Rotating legumes provides biological nitrogen credits while breaking pest and weed cycles.`;
    }

    // 4. "Which NASA datasets did you use?" / நாசா தரவுகள் எவை?
    if (q.includes('nasa') || q.includes('dataset') || raw.includes('நாசா') || raw.includes('செயற்கைக்கோள்') || raw.includes('தரவு')) {
      if (isTamil) {
        return `நிலம் பேசும் தளம் அதிகாரப்பூர்வ நாசா விண்வெளித் தரவுகளைப் பயன்படுத்துகிறது: நாசா POWER (மழை, வெப்பநிலை, மண் ஈரப்பதம்), டெர்ரா MODIS செயற்கைக்கோள் (250 மீட்டர் NDVI பயிர் பசுமை), நாசா GIBS (உண்மை வண்ண செயற்கைக்கோள் படங்கள்), மற்றும் மண் கணக்கெடுப்புத் தரவுகள்.`;
      }
      return `Nilam Pesum uses official NASA Earth observation datasets: NASA POWER Daily Point API for precipitation, temperature, and root-zone soil wetness; AppEEARS Terra MODIS for 250-meter NDVI vegetation vigor; NASA GIBS for true-color satellite imagery; and USDA/TNAU surveyed soil texture.`;
    }

    // 5. "What should I do next?" / அடுத்த பணி என்ன?
    if (q.includes('next') || q.includes('what should i do') || raw.includes('அடுத்த') || raw.includes('என்ன செய்ய வேண்டும்') || raw.includes('பணி')) {
      if (isTamil) {
        return `உங்கள் அடுத்த வேளாண் பணி: பூக்கும் தருணத்தில் அதிக வெப்பம் (95°F மேல்) மற்றும் வேர் மண்டல மண் ஈரப்பதத்தைக் கண்காணித்து, மேலுரம் மற்றும் பாசனத்தை ஒழுங்குபடுத்துங்கள்.`;
      }
      return `Your next seasonal priority is to monitor the pollination/flowering window and check for heat stress above 95°F. Keep an eye on root-zone soil wetness, and prepare for side-dress nutrient timing.`;
    }

    // General fallback
    if (isTamil) {
      return `${field?.county || 'தஞ்சாவூர்'} பகுதியிலுள்ள உங்கள் நிலத்தில், வேர் மண்டல ஈரப்பதம் ${weather?.rootWetnessPct ?? 35}%, வெப்பநிலை ${weather?.tempF ?? 84}°F ஆக உள்ளது. உங்கள் வயல் குறித்து வேறு என்ன தெரிந்து கொள்ள வேண்டும்?`;
    }
    return `Based on your field in ${field?.county || 'Story'} County, your root-zone moisture is ${weather?.rootWetnessPct ?? 35}%, recent temperature is ${weather?.tempF ?? 72}°F, and your top recommended rotation is ${rotation?.name || 'Corn-Soybean-Rye'}. What specific field question can I answer for you?`;
  }
}

module.exports = new SpeechFallbackEngine();
