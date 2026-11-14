import React, { useState, useEffect } from 'react';
import { useField } from '../context/FieldContext';
import { useVoice } from '../context/VoiceContext';
import { seasonAPI } from '../services/api';
import { CalendarCheck, AlertTriangle, Mic, Volume2, CheckCircle2, Clock, ShieldAlert, Sparkles, Plus } from 'lucide-react';

export default function SeasonCompanion() {
  const { currentFieldId } = useField();
  const { speak, isSpeaking, stopSpeaking, startListening, isListening, transcript } = useVoice();
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchSeason = async () => {
    try {
      setLoading(true);
      const res = await seasonAPI.getSeason({ fieldId: currentFieldId });
      setSeasonData(res.data);
    } catch (e) {
      console.warn('Season fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeason();
  }, [currentFieldId]);

  const handleSaveNote = async () => {
    const textToSave = noteText || transcript;
    if (!textToSave || textToSave.trim().length === 0) return;

    try {
      setSavingNote(true);
      await seasonAPI.saveNote({
        fieldId: currentFieldId,
        text: textToSave,
        stage: 'Active Season Scouting'
      });
      setNoteText('');
      fetchSeason();
    } catch (e) {
      alert('Could not save note: ' + e.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleReadTask = (task) => {
    speak(`${task.title} scheduled for ${task.date}. Agronomic reason: ${task.reason}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-field-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm font-bold text-soil-800">Synchronizing Season Calendar & NASA Alerts...</div>
        </div>
      </div>
    );
  }

  const { calendar = [], alerts = [], voiceNotes = [] } = seasonData || {};

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider text-soil-600">
          Field Companion & Guidance
        </span>
        <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight">
          Season Companion
        </h1>
        <p className="text-xs text-soil-600 mt-1">
          Phenological milestones, dated activities, and meteorological alerts computed from daily NASA observations.
        </p>
      </div>

      {/* Real-Time Weather Stress Alerts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-soil-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Active NASA Weather Alerts ({alerts.length})
          </h2>
          <span className="text-[10px] text-soil-500 font-semibold">Rule-Based Detection</span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-field-50 border border-field-200 rounded-2xl p-4 text-xs text-field-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-field-700 flex-shrink-0" />
            <span>No active extreme heat or dry spell alerts. Growing conditions remain within normal thresholds.</span>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl p-4 border shadow-sm space-y-2 ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="font-bold text-xs">{alert.title}</div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-white/70">
                  {alert.metric}
                </span>
              </div>
              <p className="text-xs text-soil-800 leading-relaxed">{alert.impact}</p>
              <div className="bg-white/80 rounded-xl p-2.5 text-[11px] space-y-1">
                <div className="font-semibold text-soil-900">Recommended Action:</div>
                <div className="text-soil-700">{alert.action}</div>
                <div className="text-[10px] text-soil-500 pt-1 border-t border-soil-200">
                  <span className="font-bold">Transparent Rule:</span> {alert.rule}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Voice Notes & Scouting Log */}
      <div className="card-heartland space-y-3 border-2 border-soil-200">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-soil-900 flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-field-700" />
            Record Field Voice Note
          </h3>
          <span className="text-[10px] text-soil-500">Audio Transcribed Locally</span>
        </div>

        <div className="relative">
          <textarea
            rows={2}
            value={transcript || noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tap mic or type note (e.g. 'Scouted south 40 acres; silk emergence uniform; soil surface dry.')"
            className="w-full p-3 text-xs bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-cream-200 text-soil-800 hover:bg-cream-300'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
          </button>

          <button
            onClick={handleSaveNote}
            disabled={savingNote || (!noteText && !transcript)}
            className="btn-primary py-2 px-4 text-xs font-bold"
          >
            Save Note to Log
          </button>
        </div>

        {voiceNotes.length > 0 && (
          <div className="pt-2 border-t border-soil-200 space-y-2">
            <div className="text-[10px] font-bold text-soil-500 uppercase tracking-wider">Past Notes</div>
            {voiceNotes.slice(0, 3).map((n) => (
              <div key={n.id} className="bg-cream-200 rounded-xl p-2.5 text-xs text-soil-800">
                <div className="text-[10px] text-soil-500 mb-0.5">{new Date(n.timestamp).toLocaleDateString()} • {n.stage}</div>
                <div className="font-medium italic">"{n.text}"</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Season Calendar Milestones */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-sm text-soil-900 flex items-center gap-1.5">
          <CalendarCheck className="w-4 h-4 text-field-700" />
          Season Calendar & Activity Guide
        </h2>

        <div className="space-y-3">
          {calendar.map((task) => (
            <div
              key={task.id}
              className={`card-heartland transition border-l-4 ${
                task.completed
                  ? 'border-l-field-600 bg-cream-50/70'
                  : 'border-l-wheat-500 bg-cream-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-field-800 bg-field-100 px-2 py-0.5 rounded-md">
                      {task.date}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-soil-500">
                      {task.stage}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-soil-900 mt-1">
                    {task.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleReadTask(task)}
                  className="p-1.5 text-soil-500 hover:text-field-700 rounded-lg hover:bg-cream-200"
                  title="Read task aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 text-xs text-soil-700 space-y-1">
                <div>
                  <span className="font-bold text-soil-900">Why: </span>
                  {task.reason}
                </div>
                <div className="text-soil-600 italic">
                  {task.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
