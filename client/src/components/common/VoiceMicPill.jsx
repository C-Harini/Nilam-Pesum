import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../../context/VoiceContext';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

export default function VoiceMicPill() {
  const { isListening, transcript, startListening, stopListening, isSpeaking, stopSpeaking } = useVoice();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleMicClick = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      setModalOpen(true);
      startListening((text) => {
        // When speech recognition produces final text, send to talk tab
        if (text && text.trim().length > 0) {
          navigate('/talk', { state: { autoAsk: text } });
          setModalOpen(false);
        }
      });
    }
  };

  return (
    <>
      {/* Floating Microphone Trigger */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6">
        <button
          onClick={handleMicClick}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 ${
            isListening
              ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
              : isSpeaking
              ? 'bg-wheat-500 text-soil-900 ring-4 ring-wheat-200'
              : 'bg-field-700 hover:bg-field-800 text-cream-50'
          }`}
          title={isListening ? 'Stop Listening' : 'Speak to Nilam Pesum'}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 animate-bounce" />
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6 animate-pulse" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Voice Capture Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-soil-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream-50 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-soil-200 text-center relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                stopListening();
                setModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-soil-500 hover:text-soil-800 rounded-full hover:bg-cream-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-field-100 mx-auto flex items-center justify-center text-field-700 mb-4 animate-pulse">
              <Mic className="w-8 h-8" />
            </div>

            <h3 className="font-display font-bold text-lg text-soil-900 mb-1">
              {isListening ? 'Listening to your voice...' : 'Speak your question'}
            </h3>
            <p className="text-xs text-soil-600 mb-4">
              Ask about soil wetness, rainfall, planting windows, or crop rotations.
            </p>

            <div className="min-h-[70px] bg-cream-200 rounded-2xl p-3 flex items-center justify-center mb-5 text-sm font-medium text-soil-800 italic">
              {transcript ? `"${transcript}"` : 'Listening... speak clearly into your mic.'}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  stopListening();
                  if (transcript) {
                    navigate('/talk', { state: { autoAsk: transcript } });
                  }
                  setModalOpen(false);
                }}
                className="btn-primary flex-1 py-2 text-sm"
              >
                Send Question
              </button>
              <button
                onClick={() => {
                  stopListening();
                  setModalOpen(false);
                }}
                className="btn-secondary py-2 text-sm px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
