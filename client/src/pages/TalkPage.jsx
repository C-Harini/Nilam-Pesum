import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useField } from '../context/FieldContext';
import { useVoice } from '../context/VoiceContext';
import { talkAPI } from '../services/api';
import { MessageSquare, Mic, MicOff, Send, Volume2, VolumeX, Sparkles, User, Bot, AlertCircle } from 'lucide-react';

export default function TalkPage() {
  const { currentFieldId, fieldToday } = useField();
  const { isListening, transcript, startListening, stopListening, speak, isSpeaking, stopSpeaking } = useVoice();
  const location = useLocation();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am Nilam Pesum, your NASA-powered farm advisor. How can I help with your soil, weather, or crop plan today?",
      mode: 'greeting'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "Is my soil dry?",
    "Should I irrigate this week?",
    "Why did you recommend this rotation?",
    "Which NASA datasets did you use?",
    "What should I do next?",
    "How did my previous season perform?"
  ];

  // Auto-ask if navigated from floating mic
  useEffect(() => {
    if (location.state?.autoAsk) {
      handleAsk(location.state.autoAsk);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAsk = async (questionText) => {
    const q = questionText || inputQuestion || transcript;
    if (!q || q.trim().length === 0) return;

    // Append user message
    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await talkAPI.ask(q, currentFieldId);
      const { answer, mode } = res.data;

      const botMsg = { sender: 'bot', text: answer, mode };
      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak the response aloud
      speak(answer);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I encountered an issue connecting to the advisory engine. Please try asking again.",
          mode: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        if (text && text.trim().length > 0) {
          handleAsk(text);
        }
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 flex flex-col min-h-[85vh] justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-soil-600">
              Conversational Voice Advisor
            </span>
            <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight">
              Talk to Nilam Pesum
            </h1>
          </div>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-wheat-200 text-soil-900 text-xs font-bold animate-pulse"
            >
              <VolumeX className="w-4 h-4" /> Stop Audio
            </button>
          )}
        </div>

        {/* Suggested Quick Questions Chips */}
        <div className="mb-4 pt-1">
          <div className="text-[11px] font-bold text-soil-500 mb-1.5 uppercase tracking-wider">
            Suggested Farm Inquiries:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleAsk(sq)}
                className="text-xs bg-cream-50 hover:bg-cream-200 text-soil-800 border border-soil-200 font-medium px-3 py-1.5 rounded-full shadow-sm transition active:scale-95"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 space-y-3.5 my-3 overflow-y-auto max-h-[50vh] pr-1">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-wheat-500 text-soil-900'
                    : 'bg-field-700 text-cream-50 shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-soil-800 text-cream-50 font-medium'
                    : 'bg-cream-50 text-soil-900 border border-soil-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {!isUser && m.mode && (
                  <div className="mt-2 pt-1 border-t border-soil-100 flex items-center justify-between text-[10px] text-soil-500 font-mono">
                    <span>Engine: {m.mode}</span>
                    <button
                      onClick={() => speak(m.text)}
                      className="text-field-700 hover:text-field-900 flex items-center gap-0.5"
                    >
                      <Volume2 className="w-3 h-3" /> Replay
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-soil-500 font-medium animate-pulse pl-10">
            <Bot className="w-4 h-4 text-field-700 animate-spin" />
            <span>Analyzing field datasets and generating spoken response...</span>
          </div>
        )}
      </div>

      {/* Voice & Text Input Bar */}
      <div className="bg-cream-50 border border-soil-300 rounded-3xl p-2 shadow-tactile">
        {transcript && isListening && (
          <div className="px-3 py-1.5 text-xs text-soil-700 italic border-b border-soil-200">
            Listening: "{transcript}"
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition active:scale-95 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-field-100 text-field-800 hover:bg-field-200'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak Your Question'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={isListening ? 'Listening to speech...' : 'Type or speak a question...'}
            className="flex-1 px-3 py-2.5 text-xs bg-transparent focus:outline-none text-soil-900 font-medium"
          />

          <button
            type="submit"
            disabled={loading || (!inputQuestion && !transcript)}
            className="w-12 h-12 rounded-2xl bg-field-700 hover:bg-field-800 text-cream-50 flex items-center justify-center flex-shrink-0 active:scale-95 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
