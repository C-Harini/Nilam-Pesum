import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const VoiceContext = createContext();

export function VoiceProvider({ children }) {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const speechIdRef = useRef(0);

  // Initialize available voices and listen for voiceschanged event
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Web Audio Context for Game Sound FX
  const playSound = (type = 'chime') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'plant') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'water') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'harvest') {
        // Joyful 3-tone victory chime
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.2, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.3);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.35);
        });
      } else {
        // default chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio FX error', e);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Set recognition language based on current i18n language
      recognition.lang = i18n.language === 'ta' ? 'ta-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event) => {
        console.warn('[Web Speech Error]', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, [i18n.language]);

  const startListening = (onFinal) => {
    // Conflict Prevention: Stop any active speech immediately so microphone doesn't hear computer's voice
    stopSpeaking();

    if (!recognitionRef.current) return;
    setTranscript('');
    try {
      recognitionRef.current.lang = i18n.language === 'ta' ? 'ta-IN' : 'en-US';
      recognitionRef.current.onresult = (event) => {
        let current = '';
        let isFinal = false;
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
        setTranscript(current);
        if (isFinal && onFinal) {
          onFinal(current);
        }
      };
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Speech recognition start failed', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
    }
    setIsListening(false);
  };

  // Conflict-free Stop Speaking: increments session token to invalidate any in-flight requests or callbacks
  const stopSpeaking = () => {
    speechIdRef.current++;

    if (audioPlayerRef.current) {
      try {
        const audio = audioPlayerRef.current;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.src = '';
        audio.load();
      } catch (e) {}
      audioPlayerRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    setIsSpeaking(false);
  };

  // Dedicated Browser Male Voice Fallback (valluvar for Tamil Male; David/Mark for English Male)
  const fallbackSpeechSynthesis = (cleanText, isTamil, currentId) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (speechIdRef.current === currentId) setIsSpeaking(false);
      return;
    }

    // If another speech action started since this was triggered, abort immediately
    if (speechIdRef.current !== currentId) {
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.90;
      utterance.pitch = 0.78; // Deep, natural adult male frequency
      utterance.lang = isTamil ? 'ta-IN' : 'en-US';

      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      
      const maleTamilVoice = voices.find(v => 
        (v.lang === 'ta-IN' || v.lang.startsWith('ta')) && 
        (v.name.toLowerCase().includes('valluvar') || 
         v.name.toLowerCase().includes('male') || 
         v.name.toLowerCase().includes('ravi') ||
         v.name.toLowerCase().includes('kumar') ||
         v.name.toLowerCase().includes('man'))
      ) || voices.find(v => v.lang === 'ta-IN' || v.lang.startsWith('ta'));

      const maleEnglishVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('david') || 
         v.name.toLowerCase().includes('mark') || 
         v.name.toLowerCase().includes('male') ||
         v.name.toLowerCase().includes('george') ||
         v.name.toLowerCase().includes('guy'))
      ) || voices.find(v => v.lang.startsWith('en'));

      const selectedVoice = isTamil ? maleTamilVoice : maleEnglishVoice;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        if (speechIdRef.current === currentId) {
          setIsSpeaking(true);
        }
      };

      utterance.onend = () => {
        if (speechIdRef.current === currentId) {
          setIsSpeaking(false);
        }
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e?.error || e);
        if (speechIdRef.current === currentId) {
          setIsSpeaking(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed', err);
      if (speechIdRef.current === currentId) {
        setIsSpeaking(false);
      }
    }
  };

  /**
   * Conflict-Free Universal Male Voice Engine:
   * - Monotonic session token prevents race conditions and double speech
   * - Mic listening is immediately silenced before speaking
   * - Fallback is strictly guarded against duplicate invocations
   */
  const speak = (text) => {
    if (!text || typeof text !== 'string') return;

    // 1. Conflict Prevention: Stop any active microphone listening so it doesn't hear speech
    if (isListening || recognitionRef.current) {
      stopListening();
    }

    // 2. Stop any existing audio or synthesis and assign fresh monotonic session token
    stopSpeaking();
    const currentId = speechIdRef.current;

    // Clean text: strip markdown bold/italics, headers, emojis, and brackets
    const cleanSpeechText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#+\s*/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[^\p{L}\p{N}\s.,!?'"()-]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpeechText) return;

    const isTamil = i18n.language === 'ta' || /[\u0B80-\u0BFF]/.test(cleanSpeechText);
    const lang = isTamil ? 'ta' : 'en';

    let fallbackFired = false;
    const safeFallback = () => {
      if (fallbackFired) return;
      fallbackFired = true;
      if (speechIdRef.current !== currentId) return;
      fallbackSpeechSynthesis(cleanSpeechText, isTamil, currentId);
    };

    try {
      const audioUrl = `/api/voice/tts?text=${encodeURIComponent(cleanSpeechText)}&lang=${lang}`;
      const audio = new Audio(audioUrl);
      
      // Male Voice Formant Shaping:
      // Disabling pitch preservation and lowering playback rate shifts formants down by 14%
      // converting female/neutral TTS into a rich, natural male tone
      audio.preservesPitch = false;
      audio.mozPreservesPitch = false;
      audio.webkitPreservesPitch = false;
      audio.playbackRate = 0.88;

      audioPlayerRef.current = audio;
      setIsSpeaking(true);

      audio.onended = () => {
        if (speechIdRef.current === currentId) {
          setIsSpeaking(false);
        }
      };

      audio.onerror = (err) => {
        if (speechIdRef.current !== currentId) return;
        console.warn('[Native TTS Audio error, switching to browser male voice synthesis]', err);
        safeFallback();
      };

      audio.play().catch((playErr) => {
        if (speechIdRef.current !== currentId) return;
        // If autoplay is blocked by browser policy before first click, do not spam fallback
        if (playErr.name === 'NotAllowedError') {
          console.info('[Speech playback awaiting user click/interaction]');
          setIsSpeaking(false);
          return;
        }
        console.warn('[Audio play interrupted, switching to browser male voice]', playErr);
        safeFallback();
      });
    } catch (err) {
      console.warn('[Audio constructor error]', err);
      safeFallback();
    }
  };

  return (
    <VoiceContext.Provider value={{
      isListening,
      transcript,
      isSpeaking,
      speechSupported,
      startListening,
      stopListening,
      speak,
      stopSpeaking,
      playSound
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => useContext(VoiceContext);
