const express = require('express');
const router = express.Router();
const https = require('https');

// In-memory LRU cache for synthesized speech buffers to ensure instant 1ms replay
const ttsCache = new Map();
const MAX_CACHE_ENTRIES = 120;

function fetchChunk(text, lang) {
  return new Promise((resolve, reject) => {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=' + encodeURIComponent(lang) + '&client=tw-ob';
    const req = https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/mpeg, audio/*; q=0.9, */*; q=0.5'
      },
      timeout: 2500
    }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`TTS upstream returned status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('TTS request timed out'));
    });
  });
}

async function synthesizeText(text, lang = 'ta') {
  const cacheKey = `${lang}:${text.trim()}`;
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey);
  }

  // Split long text into natural sentence or word chunks <= 150 chars
  const words = text.replace(/[\r\n]+/g, ' ').split(' ');
  const chunks = [];
  let current = '';

  for (const w of words) {
    if ((current + ' ' + w).trim().length > 150) {
      if (current.trim()) chunks.push(current.trim());
      current = w;
    } else {
      current = current ? current + ' ' + w : w;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const buffers = [];
  for (const chunk of chunks) {
    if (!chunk) continue;
    try {
      const buf = await fetchChunk(chunk, lang);
      buffers.push(buf);
    } catch (err) {
      console.warn(`[TTS] Chunk synthesis error for "${chunk}":`, err.message);
    }
  }

  if (buffers.length === 0) {
    throw new Error('Could not synthesize any audio chunk');
  }

  const combined = Buffer.concat(buffers);

  // Cache result
  if (ttsCache.size > MAX_CACHE_ENTRIES) {
    const firstKey = ttsCache.keys().next().value;
    ttsCache.delete(firstKey);
  }
  ttsCache.set(cacheKey, combined);

  return combined;
}

/**
 * GET /api/voice/tts?text=...&lang=ta
 * Returns authentic, high-quality native Tamil (or English) MP3 stream
 */
router.get('/tts', async (req, res) => {
  try {
    const text = req.query.text;
    const lang = req.query.lang || (text && /[\u0B80-\u0BFF]/.test(text) ? 'ta' : 'en');

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text query parameter is required' });
    }

    const audioBuffer = await synthesizeText(text.trim(), lang);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400, immutable',
      'Accept-Ranges': 'bytes'
    });

    return res.end(audioBuffer);
  } catch (err) {
    console.warn('[TTS API Error]', err.message);
    return res.status(500).json({ error: 'TTS Synthesis failed: ' + err.message });
  }
});

/**
 * POST /api/voice/tts
 * Body: { text: string, lang?: string }
 */
router.post('/tts', async (req, res) => {
  try {
    const { text, lang = 'ta' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const audioBuffer = await synthesizeText(text.trim(), lang);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400',
      'Accept-Ranges': 'bytes'
    });

    return res.end(audioBuffer);
  } catch (err) {
    return res.status(500).json({ error: 'TTS Synthesis failed: ' + err.message });
  }
});

module.exports = router;
