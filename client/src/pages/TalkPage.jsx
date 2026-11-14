import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useField } from '../context/FieldContext';
import { useVoice } from '../context/VoiceContext';
import { useTranslation } from 'react-i18next';
import { talkAPI } from '../services/api';
import { MessageSquare, Mic, MicOff, Send, Volume2, VolumeX, Sparkles, User, Bot, AlertCircle } from 'lucide-react';

export default function TalkPage() {
  const { currentFieldId } = useField();
  const { isListening, transcript, startListening, stopListening, speak, isSpeaking, stopSpeaking } = useVoice();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isTamil = i18n.language === 'ta';

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: isTamil
        ? "வணக்கம்! நான் நிலம் பேசும் உதவியாளர். உங்கள் மண் ஈரப்பதம், வானிலை, அல்லது பயிர் சுழற்சி குறித்து என்ன தெரிந்து கொள்ள வேண்டும்?"
        : "Hello! I am Nilam Pesum, your NASA-powered farm advisor. How can I help with your soil, weather, or crop plan today?",
      mode: 'greeting'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = isTamil ? [
    "என் மண் உலர்ந்துவிட்டதா?",
    "இந்த வாரம் நீர்ப்பாசனம் செய்ய வேண்டுமா?",
    "இந்த பயிர் சுழற்சியை ஏன் பரிந்துரை செய்தீர்கள்?",
    "நாசாவின் எந்த செயற்கைக்கோள் தரவுகளை பயன்படுத்தினீர்கள்?",
    "அடுத்ததாக நான் என்ன செய்ய வேண்டும்?",
    "முந்தைய பருவத்தின் வளர்ச்சி எப்படி இருந்தது?"
  ] : [
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

      // Automatically speak response aloud in matching language
      speak(answer);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: isTamil
            ? "பதில் பெறுவதில் சிறு தாமதம் ஏற்பட்டது. தயவுசெய்து மீண்டும் ஒருமுறை கேட்கவும்."
            : "I encountered an issue connecting to the advisory engine. Please try asking again.",
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
              {isTamil ? 'குரல் வழி ஆலோசகர்' : 'Conversational Voice Advisor'}
            </span>
            <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight">
              {t('talk.title')}
            </h1>
          </div>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-wheat-200 text-soil-900 text-xs font-bold animate-pulse"
            >
              <VolumeX className="w-4 h-4" /> {isTamil ? 'ஒலியை நிறுத்து' : 'Stop Audio'}
            </button>
          )}
        </div>

        {/* Suggested Quick Questions Chips */}
        <div className="mb-4 pt-1">
          <div className="text-[11px] font-bold text-soil-500 mb-1.5 uppercase tracking-wider">
            {t('talk.suggested_questions')}
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
                    : 'bg-field-600 text-cream-50 shadow-sm'
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
                      <Volume2 className="w-3 h-3" /> {isTamil ? 'மீண்டும் கேள்' : 'Replay'}
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
            <span>{isTamil ? 'நாசா தரவுகளை ஆய்வு செய்து பதிலளிக்கிறது...' : 'Analyzing field datasets and generating spoken response...'}</span>
          </div>
        )}
      </div>

      {/* Voice & Text Input Bar */}
      <div className="bg-cream-50 border border-soil-300 rounded-3xl p-2 shadow-tactile">
        {transcript && isListening && (
          <div className="px-3 py-1.5 text-xs text-soil-700 italic border-b border-soil-200">
            {isTamil ? 'கேட்டறிதல்:' : 'Listening:'} "{transcript}"
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
            placeholder={isListening ? (isTamil ? 'பேசுங்கள்...' : 'Listening to speech...') : (isTamil ? 'கேள்வியைத் தட்டச்சு செய்க அல்லது பேசவும்...' : 'Type or speak a question...')}
            className="flex-1 px-3 py-2.5 text-xs bg-transparent focus:outline-none text-soil-900 font-medium"
          />

          <button
            type="submit"
            disabled={loading || (!inputQuestion && !transcript)}
            className="w-12 h-12 rounded-2xl bg-field-600 hover:bg-field-700 text-cream-50 flex items-center justify-center flex-shrink-0 active:scale-95 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
