import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { useField } from '../context/FieldContext';
import { useTranslation } from 'react-i18next';
import { profileAPI } from '../services/api';
import FieldMap from '../components/map/FieldMap';
import { Mic, MicOff, Check, Edit2, Volume2, Shield, DollarSign, Droplets, AlertTriangle, ArrowRight } from 'lucide-react';

export default function VoiceOnboarding() {
  const { isListening, transcript, startListening, stopListening, speak } = useVoice();
  const { fieldList, switchField, currentFieldId } = useField();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [spokenText, setSpokenText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [confirmationMsg, setConfirmationMsg] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  // Editable Form fields
  const [acres, setAcres] = useState(5);
  const [soilTexture, setSoilTexture] = useState('Alluvial Clay Loam (வண்டல் மண்)');
  const [waterSource, setWaterSource] = useState('irrigated');
  const [currentCrop, setCurrentCrop] = useState('paddy');
  const [selectedPriorities, setSelectedPriorities] = useState(['Protect my soil', 'Earn more']);

  const isTamil = i18n.language === 'ta';

  const prioritiesList = [
    { id: 'Save water', label: isTamil ? 'நீர் சேமிப்பு' : 'Save water', icon: Droplets, color: 'text-skyaccent-600' },
    { id: 'Earn more', label: isTamil ? 'அதிக லாபம்' : 'Earn more', icon: DollarSign, color: 'text-field-700' },
    { id: 'Protect my soil', label: isTamil ? 'மண் வளம் காத்தல்' : 'Protect my soil', icon: Shield, color: 'text-soil-700' },
    { id: 'Lower my risk', label: isTamil ? 'இடர் குறைப்பு' : 'Lower my risk', icon: AlertTriangle, color: 'text-wheat-600' }
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
          organicMatterPct: 1.8,
          pH: 7.2,
          drainage: 'Well drained',
          awcInches: 2.5,
          source: 'TNAU Soil Survey'
        },
        waterSource,
        currentCrop,
        previousCrops: [currentCrop === 'paddy' ? 'black_gram' : 'paddy'],
        priorities: selectedPriorities
      });

      speak(isTamil
        ? "உங்கள் நில விவரக்குறிப்பு பதிவு செய்யப்பட்டது. நாசா நேரடித் தரவுகளுடன் பகுப்பாய்வு துவங்குகிறது."
        : "Your farm profile is verified. Retrieving NASA Earth observation data.");
      navigate('/today');
    } catch (e) {
      alert('Could not save profile: ' + e.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Header */}
      <div className="text-center">
        <span className="text-xs font-bold text-field-700 uppercase tracking-widest bg-field-100 px-3 py-1 rounded-full">
          {isTamil ? 'குரல் வழி பதிவு' : 'Phase 2: Voice Profile'}
        </span>
        <h1 className="font-display font-extrabold text-2xl text-soil-900 mt-2">
          {t('onboarding.prompt')}
        </h1>
        <p className="text-xs text-soil-600 mt-1 max-w-md mx-auto">
          {isTamil ? 'உதாரணம்:' : 'Example:'} <span className="italic font-medium text-soil-800">{t('onboarding.example')}</span>
        </p>
      </div>

      {/* Voice Trigger Box */}
      <div className="card-heartland text-center border-2 border-field-600/30">
        <button
          onClick={isListening ? stopListening : handleStartSpeaking}
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-tactile transition-all transform active:scale-95 mb-3 ${
            isListening
              ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-200'
              : 'bg-field-600 hover:bg-field-700 text-cream-50'
          }`}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <div className="font-display font-bold text-sm text-soil-900">
          {isListening ? t('onboarding.listening') : t('onboarding.tap_to_speak')}
        </div>

        {/* Transcript / Spoken Feedback */}
        {(transcript || spokenText) && (
          <div className="mt-4 bg-cream-200 rounded-2xl p-3.5 text-xs text-soil-800 italic border border-soil-300">
            "{transcript || spokenText}"
          </div>
        )}

        {extracting && (
          <div className="text-xs text-field-700 font-bold mt-2 animate-pulse">
            {isTamil ? 'பேசிய வேளாண் விவரங்களை பகுப்பாய்வு செய்கிறது...' : 'Analyzing spoken agronomic parameters...'}
          </div>
        )}

        {confirmationMsg && !extracting && (
          <div className="mt-3 bg-field-50 border border-field-300 text-field-900 rounded-xl p-3 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-field-700 flex-shrink-0" />
            <span>{confirmationMsg}</span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => processTranscript(isTamil
              ? "எனக்கு 5 ஏக்கர் வண்டல் மண் நிலம் இருக்கு, வாய்க்கால் பாசனம், போன வருஷம் சம்பா நெல் போட்டேன். மண் வளம் காத்து அதிக லாபம் பெற விரும்புகிறேன்."
              : "I have 5 acres of alluvial clay loam soil, irrigated, and I grew paddy last year. I want to protect my soil and earn more.")}
            className="text-xs font-semibold text-field-800 hover:underline"
          >
            {isTamil ? 'மாதிரி குரல் உள்ளீடு (டெல்டா நிலம்)' : 'Simulate Example Speech'}
          </button>
          <span className="text-soil-400">•</span>
          <button
            onClick={() => setManualMode(!manualMode)}
            className="text-xs font-semibold text-soil-700 hover:underline"
          >
            {manualMode ? (isTamil ? 'கைமுறை பதிப்பை மூடு' : 'Hide Manual Editor') : (isTamil ? 'கைமுறையாக திருத்து' : 'Edit Manually')}
          </button>
        </div>
      </div>

      {/* Interactive Field Selection & Snapping */}
      <div className="card-heartland space-y-3">
        <div>
          <h3 className="font-display font-bold text-sm text-soil-900">
            {t('onboarding.location_heading')}
          </h3>
          <p className="text-[11px] text-soil-600">
            {isTamil ? 'வரைபடத்தில் உங்கள் வயலைத் தேர்ந்தெடுக்கவும்; அருகிலுள்ள நாசா ஆய்வு மையத்துடன் இணையும்.' : 'Tap the map to select or snap to the nearest NASA observation parcel.'}
          </p>
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
          {isTamil ? 'வயலின் தன்மைகள்' : 'Field Characteristics'}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-soil-600 font-semibold mb-1">
              {isTamil ? 'நிலப்பரப்பு (ஏக்கர்)' : 'Field Size (Acres)'}
            </label>
            <input
              type="number"
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold"
            />
          </div>

          <div>
            <label className="block text-soil-600 font-semibold mb-1">
              {isTamil ? 'மண் வகை' : 'Soil Texture Class'}
            </label>
            <select
              value={soilTexture}
              onChange={(e) => setSoilTexture(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold"
            >
              <option value="Alluvial Clay Loam (வண்டல் மண்)">வண்டல் மண் (Alluvial)</option>
              <option value="Red Loam (செம்மண்)">செம்மண் (Red Loam)</option>
              <option value="Black Clay (கரிசல் மண்)">கரிசல் மண் (Black Clay)</option>
              <option value="Sandy Loam (மணல் மண்)">மணல் மண் (Sandy Loam)</option>
              <option value="Clay (களிமண்)">களிமண் (Clay)</option>
            </select>
          </div>

          <div>
            <label className="block text-soil-600 font-semibold mb-1">
              {isTamil ? 'பாசன வசதி' : 'Water Management'}
            </label>
            <select
              value={waterSource}
              onChange={(e) => setWaterSource(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold"
            >
              <option value="irrigated">{isTamil ? 'பாசன வசதி (வாய்க்கால் / கிணறு)' : 'Irrigated (Canal / Well)'}</option>
              <option value="rainfed">{isTamil ? 'மானாவாரி (மழை நீர்)' : 'Rainfed (Dryland)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-soil-600 font-semibold mb-1">
              {isTamil ? 'முந்தைய பயிர்' : 'Current / Previous Crop'}
            </label>
            <select
              value={currentCrop}
              onChange={(e) => setCurrentCrop(e.target.value)}
              className="w-full p-2.5 bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold"
            >
              <option value="paddy">{isTamil ? 'சம்பா நெல்' : 'Paddy / Rice'}</option>
              <option value="black_gram">{isTamil ? 'உளுந்து' : 'Black Gram'}</option>
              <option value="groundnut">{isTamil ? 'நிலக்கடலை' : 'Groundnut'}</option>
              <option value="sesame">{isTamil ? 'எள்' : 'Sesame'}</option>
              <option value="corn">{isTamil ? 'மக்காச்சோளம்' : 'Corn'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Priorities Selection */}
      <div className="card-heartland space-y-3">
        <div>
          <h3 className="font-display font-bold text-sm text-soil-900">
            {t('onboarding.priorities_heading')}
          </h3>
          <p className="text-[11px] text-soil-600">
            {isTamil ? 'உங்கள் விருப்பங்களை தேர்வு செய்யுங்கள்; பயிர் சுழற்சி மதிப்பீடு தானாக சரிசெய்யப்படும்.' : 'Select one or more goals to steer your crop rotation recommendation.'}
          </p>
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
        {t('onboarding.btn_confirm')}
        <ArrowRight className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
}
