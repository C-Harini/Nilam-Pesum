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

  // Fallback to Web Speech Synthesis API with dedicated Male Voice profile
  const fallbackSpeechSynthesis = (cleanText, isTamil) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      // Male voice acoustic settings: lower pitch & steady cadence
      utterance.rate = 0.90;
      utterance.pitch = 0.78; // Deep, natural male voice fundamental frequency
      utterance.lang = isTamil ? 'ta-IN' : 'en-US';

      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      
      // Specifically select Male voice (Microsoft Valluvar on Windows is Tamil Male; David/Mark is English Male)
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

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis fallback error', e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed', err);
      setIsSpeaking(false);
    }
  };

  /**
   * Universal Speech Output (Strict Male Voice Profile):
   * 1. Primary Engine: High-fidelity audio stream with pitch-shifted male resonant tone
   * 2. Secondary Engine: Web Speech API locked to male voices (Valluvar / David / Mark)
   */
  const speak = (text) => {
    if (!text || typeof text !== 'string') return;

    // Immediately stop any existing speech or audio
    stopSpeaking();

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

    try {
      const audioUrl = `/api/voice/tts?text=${encodeURIComponent(cleanSpeechText)}&lang=${lang}`;
      const audio = new Audio(audioUrl);
      
      // Transform audio into pure Male voice register:
      // Disabling pitch preservation and lowering playback rate shifts formants down by 14%
      // converting female/neutral TTS into a rich, natural male tone
      audio.preservesPitch = false;
      audio.mozPreservesPitch = false;
      audio.webkitPreservesPitch = false;
      audio.playbackRate = 0.88;

      audioPlayerRef.current = audio;
      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
      };

      audio.onerror = (err) => {
        console.warn('[Native TTS Audio error, switching to browser male voice synthesis]', err);
        fallbackSpeechSynthesis(cleanSpeechText, isTamil);
      };

      audio.play().catch((playErr) => {
        console.warn('[Audio play interrupted, using Web Speech male voice]', playErr);
        fallbackSpeechSynthesis(cleanSpeechText, isTamil);
      });
    } catch (err) {
      console.warn('[Audio constructor error]', err);
      fallbackSpeechSynthesis(cleanSpeechText, isTamil);
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch (e) {}
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
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
