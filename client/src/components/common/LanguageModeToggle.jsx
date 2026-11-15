import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../../context/VoiceContext';
import { Globe } from 'lucide-react';

/**
 * Two Modes Language Selector:
 * 1) 🇮🇳 முழுக்க தமிழ் (All Tamil Mode)
 * 2) 🌐 All English (All English Mode)
 */
export default function LanguageModeToggle({ className = '', variant = 'pill' }) {
  const { i18n } = useTranslation();
  const { speak, playSound } = useVoice();

  const isTamil = i18n.language === 'ta';

  const switchMode = (mode) => {
    if (i18n.language === mode) return;
    playSound('chime');
    i18n.changeLanguage(mode);
    localStorage.setItem('nilam_pesum_lang', mode);

    if (mode === 'ta') {
      speak('தமிழ் பயன்முறை தேர்வு செய்யப்பட்டுள்ளது.');
    } else {
      speak('All English mode activated.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center bg-stone-900/90 p-1 rounded-2xl border border-stone-700 shadow-sm ${className}`}>
        <button
          type="button"
          onClick={() => switchMode('ta')}
          className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
            isTamil 
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' 
              : 'text-stone-300 hover:text-white'
          }`}
          title="முழுக்க தமிழ் பயன்முறை (All Tamil Mode)"
        >
          <span>🇮🇳</span>
          <span>தமிழ்</span>
        </button>
        <button
          type="button"
          onClick={() => switchMode('en')}
          className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
            !isTamil 
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' 
              : 'text-stone-300 hover:text-white'
          }`}
          title="All English Mode"
        >
          <span>🌐</span>
          <span>English</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center bg-cream-200/90 p-1 rounded-2xl border border-soil-300 shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => switchMode('ta')}
        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 ${
          isTamil 
            ? 'bg-field-700 text-cream-50 shadow-sm ring-1 ring-field-600' 
            : 'text-soil-700 hover:text-soil-900'
        }`}
      >
        <span>🇮🇳</span>
        <span>முழுக்க தமிழ்</span>
      </button>
      <button
        type="button"
        onClick={() => switchMode('en')}
        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 ${
          !isTamil 
            ? 'bg-field-700 text-cream-50 shadow-sm ring-1 ring-field-600' 
            : 'text-soil-700 hover:text-soil-900'
        }`}
      >
        <span>🌐</span>
        <span>All English</span>
      </button>
    </div>
  );
}
