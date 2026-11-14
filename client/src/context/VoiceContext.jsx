import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const VoiceContext = createContext();

export function VoiceProvider({ children }) {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);

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
      } catch (e) {}
    }
    setIsListening(false);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const isTamil = i18n.language === 'ta' || /[\u0B80-\u0BFF]/.test(text);
    utterance.lang = isTamil ? 'ta-IN' : 'en-US';

    // Pick Tamil voice if available in browser
    if (isTamil) {
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
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
      stopSpeaking
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoice = () => useContext(VoiceContext);
