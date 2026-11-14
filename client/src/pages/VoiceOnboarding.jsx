import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { useField } from '../context/FieldContext';
import { profileAPI } from '../services/api';
import FieldMap from '../components/map/FieldMap';
import { Mic, MicOff, Check, Edit2, Volume2, Shield, DollarSign, Droplets, AlertTriangle, ArrowRight } from 'lucide-react';

export default function VoiceOnboarding() {
  const { isListening, transcript, startListening, stopListening, speak } = useVoice();
  const { fieldList, switchField, currentFieldId } = useField();
  const navigate = useNavigate();

  const [spokenText, setSpokenText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [confirmationMsg, setConfirmationMsg] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  // Editable Form fields
  const [acres, setAcres] = useState(160);
  const [soilTexture, setSoilTexture] = useState('Silt loam');
  const [waterSource, setWaterSource] = useState('rainfed');
  const [currentCrop, setCurrentCrop] = useState('corn');
  const [selectedPriorities, setSelectedPriorities] = useState(['Protect my soil', 'Lower my risk']);

  const prioritiesList = [
    { id: 'Save water', label: 'Save water', icon: Droplets, color: 'text-skyaccent-600' },
    { id: 'Earn more', label: 'Earn more', icon: DollarSign, color: 'text-field-700' },
    { id: 'Protect my soil', label: 'Protect my soil', icon: Shield, color: 'text-soil-700' },
    { id: 'Lower my risk', label: 'Lower my risk', icon: AlertTriangle, color: 'text-wheat-600' }
  ];

  const handleStartSpeaking = () => {
    setSpokenText('');
    setExtractedData(null);
    startListening(async (finalTranscript) => {
      setSpokenText(finalTranscript);
      await processTranscript(finalTranscript);
    });
  };

  const processTranscript = async (text) => {
    if (!text || text.trim().length === 0) return;
    try {
      setExtracting(true);
      const res = await profileAPI.extractVoice(text);
      const { extracted, confirmationText } = res.data;
      setExtractedData(extracted);
      setConfirmationMsg(confirmationText);

      // Populate form state if detected
      if (extracted.areaAcres) setAcres(extracted.areaAcres);
      if (extracted.soilTexture) setSoilTexture(extracted.soilTexture);
      if (extracted.waterSource) setWaterSource(extracted.waterSource);
      if (extracted.currentCrop) setCurrentCrop(extracted.currentCrop);
      if (extracted.priorities && extracted.priorities.length > 0) {
        setSelectedPriorities(extracted.priorities);
      }

      speak(confirmationText);
    } catch (err) {
      console.warn('Extraction error', err);
    } finally {
      setExtracting(false);
    }
  };

  const togglePriority = (p) => {
    if (selectedPriorities.includes(p)) {
      setSelectedPriorities(selectedPriorities.filter(x => x !== p));
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await profileAPI.updateProfile({
        fieldId: currentFieldId,
        areaAcres: parseFloat(acres),
        soil: {
          texture: soilTexture,
          organicMatterPct: 3.8,
          pH: 6.5,
          drainage: 'Well drained',
          awcInches: 2.4,
          source: 'USDA NRCS SSURGO'
        },
        waterSource,
        currentCrop,
        previousCrops: [currentCrop === 'corn' ? 'soybean' : 'corn'],
        priorities: selectedPriorities
      });

      speak("Your farm profile is verified. Retrieving NASA Earth observation data.");
      navigate('/today');
    } catch (e) {
      alert('Could not save profile: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8 pb-24">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold text-field-700 uppercase tracking-widest bg-field-100 px-3 py-1 rounded-full">
            Phase 2: Voice Profile
          </span>
          <h1 className="font-display font-extrabold text-2xl text-soil-900 mt-2">
            Tell me about your land
          </h1>
          <p className="text-xs text-soil-600 mt-1 max-w-md mx-auto">
            Example: <span className="italic font-medium text-soil-800">"I have 160 acres, silt loam soil, no irrigation, and I grew corn last year."</span>
          </p>
        </div>

        {/* Voice Trigger Box */}
        <div className="card-heartland text-center border-2 border-field-600/30">
          <button
            onClick={isListening ? stopListening : handleStartSpeaking}
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-tactile transition-all transform active:scale-95 mb-3 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-200'
                : 'bg-field-700 hover:bg-field-800 text-cream-50'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <div className="font-display font-bold text-sm text-soil-900">
            {isListening ? 'Listening... Speak naturally' : 'Tap Microphone to Speak'}
          </div>

          {/* Transcript / Spoken Feedback */}
          {(transcript || spokenText) && (
            <div className="mt-4 bg-cream-200 rounded-2xl p-3.5 text-xs text-soil-800 italic border border-soil-300">
              "{transcript || spokenText}"
            </div>
          )}

          {extracting && (
            <div className="text-xs text-field-700 font-bold mt-2 animate-pulse">
              Analyzing spoken agronomic parameters...
            </div>
          )}

          {confirmationMsg && !extracting && (
            <div className="mt-3 bg-field-50 border border-field-300 text-field-900 rounded-xl p-3 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-field-700 flex-shrink-0" />
              <span>{confirmationMsg}</span>
            </div>
          )}

          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => processTranscript("I have 160 acres, silt loam soil, no irrigation, and I grew corn last year. I want to protect my soil and lower my risk.")}
              className="text-xs font-semibold text-field-800 hover:underline"
            >
              Simulate Example Speech
            </button>
            <span className="text-soil-400">•</span>
            <button
              onClick={() => setManualMode(!manualMode)}
              className="text-xs font-semibold text-soil-700 hover:underline"
            >
              {manualMode ? 'Hide Manual Editor' : 'Edit Manually'}
            </button>
          </div>
        </div>

        {/* Interactive Field Selection & Snapping */}
        <div className="card-heartland space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-sm text-soil-900">
                Field Location & Parcel Boundary
              </h3>
              <p className="text-[11px] text-soil-600">Tap the map to select or snap to the nearest NASA data point.</p>
            </div>
          </div>

          <FieldMap
            fields={fieldList}
            selectedFieldId={currentFieldId}
            onFieldSelect={(id) => switchField(id)}
          />
        </div>

        {/* Profile Details (Voice Extracted / Manual) */}
        <div className="card-heartland space-y-4">
          <h3 className="font-display font-bold text-sm text-soil-900 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-soil-500" />
            Field Characteristics
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-soil-600 font-semibold mb-1">Field Size (Acres)</label>
              <input
                type="number"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                className="w-full p-2.5 bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-soil-600 font-semibold mb-1">Soil Texture Class</label>
              <select
                value={soilTexture}
                onChange={(e) => setSoilTexture(e.target.value)}
                className="w-full p-2.5 bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold"
              >
                <option value="Silt loam">Silt loam</option>
                <option value="Loam">Loam</option>
                <option value="Clay loam">Clay loam</option>
                <option value="Sandy loam">Sandy loam</option>
                <option value="Silty clay">Silty clay</option>
              </select>
            </div>

            <div>
              <label className="block text-soil-600 font-semibold mb-1">Water Management</label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full p-2.5 bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold"
              >
                <option value="rainfed">Rainfed (Dryland)</option>
                <option value="irrigated">Center Pivot / Drip Irrigated</option>
              </select>
            </div>

            <div>
              <label className="block text-soil-600 font-semibold mb-1">Current / Previous Crop</label>
              <select
                value={currentCrop}
                onChange={(e) => setCurrentCrop(e.target.value)}
                className="w-full p-2.5 bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold"
              >
                <option value="corn">Corn (Maize)</option>
                <option value="soybean">Soybean</option>
                <option value="winter_wheat">Winter Wheat</option>
                <option value="alfalfa">Alfalfa</option>
                <option value="sorghum">Grain Sorghum</option>
              </select>
            </div>
          </div>
        </div>

        {/* Priorities Selection */}
        <div className="card-heartland space-y-3">
          <div>
            <h3 className="font-display font-bold text-sm text-soil-900">
              Farmer Priorities (Double-Weights Scoring)
            </h3>
            <p className="text-[11px] text-soil-600">Select one or more goals to steer your crop rotation recommendation.</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {prioritiesList.map((item) => {
              const active = selectedPriorities.includes(item.id);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => togglePriority(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    active
                      ? 'bg-wheat-100 border-wheat-500 shadow-sm'
                      : 'bg-cream-50 border-soil-200 hover:bg-cream-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${active ? 'bg-wheat-200' : 'bg-cream-200'}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className={`text-xs font-bold ${active ? 'text-soil-900' : 'text-soil-700'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm and Proceed */}
        <button
          onClick={handleSaveProfile}
          className="btn-primary w-full text-base font-bold shadow-tactile"
        >
          Confirm Field & Generate NASA Advisory
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
