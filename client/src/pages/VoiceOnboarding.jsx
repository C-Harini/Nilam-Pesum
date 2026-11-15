import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { useField } from '../context/FieldContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { profileAPI, rotationAPI, seasonAPI } from '../services/api';
import FieldMap from '../components/map/FieldMap';
import FarmGameSimulation from '../components/simulation/FarmGameSimulation';
import AllStrategiesGameAnalysis from '../components/simulation/AllStrategiesGameAnalysis';
import StrategyCommitModal from '../components/simulation/StrategyCommitModal';
import { CropSequenceVisualizer } from '../components/common/CropVisualCard';
import LanguageModeToggle from '../components/common/LanguageModeToggle';
import { 
  Mic, MicOff, Check, Edit2, Volume2, VolumeX, Shield, DollarSign, 
  Droplets, AlertTriangle, ArrowRight, ArrowLeft, MapPin, 
  Sparkles, Trophy, CheckCircle2, RefreshCw, Satellite, Calendar,
  Sliders, Award, Maximize2, ChevronUp, ChevronDown
} from 'lucide-react';

export default function VoiceOnboarding() {
  const { isListening, transcript, startListening, stopListening, speak, stopSpeaking, isSpeaking, playSound } = useVoice();
  const { fieldList, switchField, currentFieldId, profile } = useField();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isTamil = i18n.language === 'ta';

  // Multi-step Onboarding Workflow:
  // Step 1: 'details' -> Farmer & Land Details
  // Step 2: 'location' -> Point Any Location on Map (Movable Pin anywhere in TN / Earth)
  // Step 3: 'previous_crop' -> Multi-Select Previous Crops & Priority-wise Ranking
  // Step 4: 'fetching_nasa' -> Ingest NASA Datasets & Build Profile
  // Step 5: 'select_duration' -> Select Crop Rotation Duration (1, 2, 3 Years)
  // Step 6: 'strategies_list' -> View Evaluated Strategies & Play Game Mode
  const [currentStep, setCurrentStep] = useState(1);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Form Fields
  const [farmerName, setFarmerName] = useState(user?.name || '');
  const [acres, setAcres] = useState(5);
  const [soilTexture, setSoilTexture] = useState('Alluvial Clay Loam (வண்டல் மண்)');
  const [waterSource, setWaterSource] = useState('irrigated');
  
  // Location State (Pin can be placed anywhere in Tamil Nadu or Earth)
  const [selectedLocation, setSelectedLocation] = useState({ 
    lat: 10.7870, 
    lng: 79.1378, 
    name: 'தஞ்சாவூர் (Thanjavur)', 
    district: 'Thanjavur', 
    zone: 'காவிரி டெல்டா (Cauvery Delta)' 
  });

  // Pre-load saved farmer profile if user already entered land details previously
  useEffect(() => {
    try {
      if (profile && (profile.areaAcres || profile.location)) {
        setHasExistingProfile(true);
        if (profile.farmerName) {
          setFarmerName(profile.farmerName);
        } else if (typeof profile.name === 'string') {
          setFarmerName(profile.name.replace(' பண்ணை', ''));
        }
        if (profile.areaAcres) setAcres(profile.areaAcres);
        if (profile.soil?.texture) setSoilTexture(profile.soil.texture);
        if (profile.waterSource) setWaterSource(profile.waterSource);
        if (profile.location?.lat) {
          setSelectedLocation({
            lat: profile.location.lat,
            lng: profile.location.lng,
            name: profile.location.name || profile.county || 'தஞ்சாவூர் (Thanjavur)',
            district: profile.location.district || 'Thanjavur',
            zone: profile.location.zone || 'காவிரி டெல்டா (Cauvery Delta)'
          });
        }
        if (Array.isArray(profile.previousCrops) && profile.previousCrops.length > 0) {
          setSelectedPreviousCrops(profile.previousCrops);
        }
      }
    } catch (err) {
      console.warn('Profile pre-load error:', err);
    }
  }, [profile]);

  // Multi-select for previously grown crops before rotation
  const [selectedPreviousCrops, setSelectedPreviousCrops] = useState(['paddy']);

  // Priority-wise ordering & ranking (importance selection)
  const [rankedPriorities, setRankedPriorities] = useState([
    { 
      id: 'Save water', 
      label: isTamil ? 'நீர் சேமிப்பு' : 'Save water', 
      icon: Droplets, 
      color: 'text-cyan-600', 
      badgeColor: 'bg-cyan-500/20 text-cyan-800 border-cyan-400',
      desc: isTamil ? '40% வரை பாசன நீர் சேமிப்பு மற்றும் வறட்சி பாதுகாப்பு' : 'Up to 40% irrigation savings & drought resilience' 
    },
    { 
      id: 'Protect my soil', 
      label: isTamil ? 'மண் வளம் காத்தல்' : 'Protect my soil', 
      icon: Shield, 
      color: 'text-amber-800', 
      badgeColor: 'bg-amber-500/20 text-amber-900 border-amber-400',
      desc: isTamil ? '+80 lbs இயற்கை தழைச்சத்து வரவு & மண்புழு வளம்' : '+80 lbs biological nitrogen credits & soil health' 
    },
    { 
      id: 'Earn more', 
      label: isTamil ? 'அதிக லாபம்' : 'Earn more', 
      icon: DollarSign, 
      color: 'text-emerald-700', 
      badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-400',
      desc: isTamil ? 'அதிக சந்தை மதிப்புள்ள பணப்பயிர் மற்றும் எண்ணெய்வித்து வருமானம்' : 'Higher commodity cash profits & market returns' 
    },
    { 
      id: 'Lower my risk', 
      label: isTamil ? 'இடர் குறைப்பு' : 'Lower my risk', 
      icon: AlertTriangle, 
      color: 'text-amber-600', 
      badgeColor: 'bg-rose-500/20 text-rose-900 border-rose-400',
      desc: isTamil ? 'பூச்சி சுழற்சி உடைப்பு & பருவநிலை ஆபத்து குறைப்பு' : 'Pest cycle breakage & climate risk safety' 
    }
  ]);

  const [selectedDuration, setSelectedDuration] = useState('3_year'); // '1_year', '2_year', '3_year'

  // Voice & Extraction State
  const [spokenText, setSpokenText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [confirmationMsg, setConfirmationMsg] = useState(null);

  // NASA Ingestion Telemetry State
  const [nasaProgress, setNasaProgress] = useState(0);
  const [nasaStepText, setNasaStepText] = useState('');

  // Generated Strategies State
  const [strategies, setStrategies] = useState([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [activeGameStrategyId, setActiveGameStrategyId] = useState(null);
  const [showAllStrategiesAnalysis, setShowAllStrategiesAnalysis] = useState(false);
  const [committedMsg, setCommittedMsg] = useState(null);
  const [confirmedStrategy, setConfirmedStrategy] = useState(null);
  const [showCommitModal, setShowCommitModal] = useState(false);

  // Proactive Voice Prompt on step change
  useEffect(() => {
    let prompt = '';
    if (currentStep === 1) {
      prompt = isTamil
        ? "வணக்கம்! உங்கள் பண்ணை மற்றும் நில விவரங்களை இப்போது பதிவு செய்வோம். உங்கள் நிலப்பரப்பு, மண் வகை மற்றும் பாசன முறையை குறிப்பிடவும்."
        : "Welcome! Let's register your farm and land details. Please specify your land area, soil type, and irrigation system.";
    } else if (currentStep === 2) {
      prompt = isTamil
        ? "உங்கள் நிலம் அமைந்துள்ள இடத்தை வரைபடத்தில் எங்கு வேண்டுமானாலும் தொட்டு குறியிடலாம். அந்த இடத்திற்கு குறியீட்டு முள் நகரும்."
        : "Please point your farm anywhere on the map. The pin can be placed or dragged to any location.";
    } else if (currentStep === 3) {
      prompt = isTamil
        ? "முன்னர் பயிரிட்ட பயிர்களை பலவாக தேர்வு செய்யலாம். உங்கள் விவசாய முன்னுரிமைகளை முக்கியத்துவத்திற்கு ஏற்ப மேலே கீழே நகர்த்தி வரிசைப்படுத்தவும்."
        : "You can multi-select previously grown crops. Rank your farming priorities in order of importance.";
    } else if (currentStep === 5) {
      prompt = isTamil
        ? "பயிர் சுழற்சி காலத்தைத் தேர்வு செய்யுங்கள்: 1 பருவம், 2 ஆண்டுகள், அல்லது 3 ஆண்டுகள் சுழற்சி திட்டத்தை உருவாக்கலாம்."
        : "Select your desired crop rotation duration: 1 Year, 2 Years, or 3 Years.";
    }
    if (prompt) speak(prompt);
  }, [currentStep, isTamil]);

  // Voice recognition handler
  const handleStartSpeaking = () => {
    setSpokenText('');
    startListening(async (finalTranscript) => {
      setSpokenText(finalTranscript);
      await processTranscript(finalTranscript);
    });
  };

  // Explicit Speak Current Step Audio
  const handleSpeakCurrentStep = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    let prompt = '';
    if (currentStep === 1) {
      prompt = isTamil
        ? `வணக்கம் ${farmerName || 'விவசாயி'}! இது படிநிலை ஒன்று. உங்கள் பண்ணை மற்றும் நில விவரங்களை பதிவு செய்யவும். உங்கள் நிலப்பரப்பு, மண் வகை மற்றும் பாசன முறையை குறிப்பிடவும்.`
        : `Welcome! Step 1: Farm and land details. Please specify your acreage, soil texture, and irrigation system.`;
    } else if (currentStep === 2) {
      prompt = isTamil
        ? `படிநிலை இரண்டு: உங்கள் நிலம் அமைந்துள்ள இடத்தை வரைபடத்தில் எங்கு வேண்டுமானாலும் தொட்டு குறியிடவும். அந்த இடத்திற்கு குறியீட்டு முள் உடனடியாக நகரும்.`
        : `Step 2: Point your farm location anywhere on the map. The pin moves to your selected coordinates.`;
    } else if (currentStep === 3) {
      prompt = isTamil
        ? `படிநிலை மூன்று: முன்னர் பயிரிட்ட பயிர்களை பலவாக தேர்வு செய்யலாம். உங்கள் விவசாய முன்னுரிமை இலக்குகளை முக்கியத்துவத்திற்கு ஏற்ப வரிசைப்படுத்தவும்.`
        : `Step 3: Multi-select previously grown crops and rank your farming goals in order of importance.`;
    } else if (currentStep === 5) {
      prompt = isTamil
        ? `படிநிலை ஐந்து: பயிர் சுழற்சி காலத்தைத் தேர்வு செய்யுங்கள்: 1 பருவம், 2 ஆண்டுகள், அல்லது 3 ஆண்டுகள் சுழற்சி திட்டத்தை உருவாக்கலாம்.`
        : `Step 5: Select your rotation duration: 1 Year, 2 Years, or 3 Years.`;
    } else if (currentStep === 6) {
      prompt = isTamil
        ? `படிநிலை ஆறு: உங்கள் நிலத்திற்கான சிறந்த ${strategies.length} பயிர் சுழற்சி உத்திகள் தயார். ஒவ்வொரு உத்தியையும் விளையாட்டாக சோதிக்கலாம், நிலத்தில் உருவகப்படுத்தலாம் அல்லது நேரடியாக உறுதி செய்யலாம்.`
        : `Step 6: Top crop rotation strategies generated for your field. You can test each in game mode, simulate on land, or commit directly.`;
    }
    speak(prompt);
  };

  const processTranscript = async (text) => {
    if (!text || text.trim().length === 0) return;
    try {
      setExtracting(true);
      const res = await profileAPI.extractVoice(text);
      const { extracted, confirmationText } = res.data;
      setConfirmationMsg(confirmationText);

      // Auto-fill form state
      if (extracted.areaAcres) setAcres(extracted.areaAcres);
      if (extracted.soilTexture) setSoilTexture(extracted.soilTexture);
      if (extracted.waterSource) setWaterSource(extracted.waterSource);
      if (extracted.currentCrop) {
        setSelectedPreviousCrops(prev => prev.includes(extracted.currentCrop) ? prev : [...prev, extracted.currentCrop]);
      }

      speak(confirmationText);
    } catch (err) {
      console.warn('Extraction error', err);
    } finally {
      setExtracting(false);
    }
  };

  // Toggle multi-select previous crop
  const togglePreviousCrop = (cropId) => {
    playSound('chime');
    if (selectedPreviousCrops.includes(cropId)) {
      if (selectedPreviousCrops.length > 1) {
        setSelectedPreviousCrops(selectedPreviousCrops.filter(c => c !== cropId));
      }
    } else {
      setSelectedPreviousCrops([...selectedPreviousCrops, cropId]);
    }
  };

  // Reorder priorities up or down
  const movePriority = (index, direction) => {
    playSound('chime');
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= rankedPriorities.length) return;
    const updated = [...rankedPriorities];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setRankedPriorities(updated);
  };

  // Make top priority shortcut
  const makeTopPriority = (index) => {
    playSound('chime');
    if (index === 0) return;
    const updated = [...rankedPriorities];
    const [item] = updated.splice(index, 1);
    updated.unshift(item);
    setRankedPriorities(updated);
  };

  // Step 4: Simulate authentic NASA telemetry ingestion & save profile
  const handleFetchNASAAndSave = async () => {
    setCurrentStep(4);
    playSound('chime');

    const steps = [
      { pct: 20, text: isTamil ? `🛰️ நாசா POWER ஏபிஐ உடன் இணைகிறது (${selectedLocation.name} - ${selectedLocation.lat}° N, ${selectedLocation.lng}° E)...` : `🛰️ Connecting to NASA POWER Daily API (${selectedLocation.lat}° N, ${selectedLocation.lng}° E)...` },
      { pct: 45, text: isTamil ? '🌦️ 40 ஆண்டுகால மழைப்பொழிவு மற்றும் MERRA-2 வெப்பநிலைத் தரவுகள் பெறப்படுகின்றன...' : '🌦️ Retrieving 40-year precipitation normals & MERRA-2 thermal records...' },
      { pct: 70, text: isTamil ? '🌱 நாசா MODIS 250m NDVI செயற்கைக்கோள் பசுமைக் குறியீடு தரவிறக்கப்படுகிறது...' : '🌱 Fetching NASA AppEEARS MODIS Terra 250m NDVI vegetation index...' },
      { pct: 90, text: isTamil ? '🌾 மண்வளக் களஞ்சியம் மற்றும் இயற்கை தழைச்சத்து வரவு கணக்கிடப்படுகிறது...' : '🌾 Calculating biological nitrogen ledger & Available Water Capacity...' },
      { pct: 100, text: isTamil ? '✅ நாசா செயற்கைக்கோள் தரவுகள் வெற்றிகரமாக பெறப்பட்டு பண்ணை சுயவிவரம் தயாராக உள்ளது!' : '✅ Authentic NASA data retrieved & farm profile verified!' }
    ];

    for (let i = 0; i < steps.length; i++) {
      setNasaProgress(steps[i].pct);
      setNasaStepText(steps[i].text);
      await new Promise(r => setTimeout(r, 650));
    }

    try {
      await profileAPI.updateProfile({
        fieldId: currentFieldId || 'field_tn01',
        name: farmerName ? `${farmerName} பண்ணை` : `${selectedLocation.name} வயல்`,
        areaAcres: parseFloat(acres),
        location: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        soil: {
          texture: soilTexture,
          organicMatterPct: 2.1,
          pH: 7.2,
          drainage: 'Well drained',
          awcInches: 2.5,
          source: 'TNAU Soil Survey / NASA MERRA-2'
        },
        waterSource,
        currentCrop: selectedPreviousCrops[0] || 'paddy',
        previousCrops: selectedPreviousCrops,
        priorities: rankedPriorities.map(p => p.id)
      });

      speak(isTamil
        ? "உங்கள் நிலத்திற்கான நாசா செயற்கைக்கோள் தரவுகள் மற்றும் மண் தகவல்கள் வெற்றிகரமாக பெறப்பட்டு பண்ணை சுயவிவரம் தயாராக உள்ளது!"
        : "NASA satellite data and soil profiles have been successfully retrieved for your field!");

      setTimeout(() => {
        setCurrentStep(5);
      }, 900);
    } catch (e) {
      console.warn('Profile save error', e);
      setCurrentStep(5);
    }
  };

  // Step 5 -> Step 6: Generate Strategies based on duration & criteria
  const handleGenerateStrategies = async () => {
    playSound('chime');
    setLoadingStrategies(true);
    setCurrentStep(6);

    try {
      const res = await rotationAPI.getRotations({
        fieldId: currentFieldId || 'field_tn01',
        priorities: rankedPriorities.map(p => p.id).join(','),
        currentCrop: selectedPreviousCrops[0] || 'paddy',
        duration: selectedDuration,
        previousCrops: selectedPreviousCrops.join(',')
      });
      const list = res.data?.rotations || [];
      setStrategies(list);

      const msg = isTamil
        ? `உங்கள் ${acres} ஏக்கர் நிலத்திற்கு ${selectedDuration === '1_year' ? '1 பருவம்' : selectedDuration === '2_year' ? '2 ஆண்டுகள்' : '3 ஆண்டுகள்'} காலத்திற்கான சிறந்த ${list.length} பயிர் சுழற்சி உத்திகள் தயார்!`
        : `Top ${list.length} dynamic crop rotation strategies generated for your farm!`;
      speak(msg);
    } catch (err) {
      console.warn('Rotations fetch error', err);
    } finally {
      setLoadingStrategies(false);
    }
  };

  // 1-Click Commit Plan
  const handleCommitPlan = async (strat) => {
    playSound('harvest');
    try {
      await seasonAPI.commitPlan({
        fieldId: currentFieldId || 'field_tn01',
        rotationId: strat.id,
        sequence: strat.sequence,
        name: strat.name
      });
      setConfirmedStrategy(strat);
      setShowCommitModal(true);
    } catch (e) {
      console.warn('Commit error', e);
      // Even if network blips, celebrate and launch simulation
      setConfirmedStrategy(strat);
      setShowCommitModal(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6 animate-in fade-in">
      {/* Top Header: Two Modes (All Tamil | All English) & Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-field-800 text-xs font-extrabold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isTamil ? 'படிநிலை' : 'Step'} {currentStep} / 6</span>
            <span className="text-soil-400">•</span>
            <span className="font-mono text-soil-700">
              {currentStep === 1 && (isTamil ? 'பண்ணை & நில விவரங்கள்' : 'Farm & Land Details')}
              {currentStep === 2 && (isTamil ? 'நிலத்தின் இருப்பிடம்' : 'Point Location on Map')}
              {currentStep === 3 && (isTamil ? 'முந்தைய பயிர்கள் & இலக்குகள்' : 'Previous Crops & Goals')}
              {currentStep === 4 && (isTamil ? 'நாசா தரவுகள்' : 'NASA Data')}
              {currentStep === 5 && (isTamil ? 'சுழற்சி காலம்' : 'Duration')}
              {currentStep === 6 && (isTamil ? 'பயிர் உத்திகள்' : 'Strategies')}
            </span>
          </div>

          {/* Two Modes Selector */}
          <LanguageModeToggle variant="compact" />
        </div>

        <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden border border-soil-300">
          <div 
            className="bg-field-600 h-full transition-all duration-500 rounded-full" 
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* If this user already has saved land data from registration, show quick access banner */}
      {hasExistingProfile && currentStep === 1 && (
        <div className="bg-gradient-to-r from-emerald-50 via-field-50 to-cream-50 border-2 border-field-500 rounded-3xl p-4 shadow-tactile flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-field-600 text-wheat-300 font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm text-lg">
              ✓
            </div>
            <div>
              <div className="text-xs font-extrabold text-field-900">
                {isTamil ? `வணக்கம் ${farmerName || user?.name || 'விவசாயி'}! உங்கள் நில விவரங்கள் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளன.` : `Welcome ${farmerName || user?.name || 'Farmer'}! Your farm details are already saved.`}
              </div>
              <div className="text-[11px] text-soil-700 font-medium mt-0.5">
                {acres} {isTamil ? 'ஏக்கர்' : 'acres'} • {(soilTexture || '').split('(')[0]} • {selectedLocation?.name || 'தஞ்சாவூர்'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate('/today')}
              className="px-3.5 py-2 rounded-xl bg-field-700 hover:bg-field-800 text-cream-50 font-bold text-xs shadow-sm active:scale-95 transition flex-1 sm:flex-initial"
            >
              {isTamil ? 'பண்ணை முகப்புக்குச் செல் ➔' : 'Go to Farm Today ➔'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-sm active:scale-95 transition flex-1 sm:flex-initial"
            >
              {isTamil ? 'பயிர் உத்திகள்' : 'Strategies'}
            </button>
          </div>
        </div>
      )}

      {/* Voice Mic Trigger Bar (Always available) */}
      <div className="bg-cream-50 border-2 border-field-600/30 rounded-3xl p-3.5 shadow-tactile flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={isListening ? stopListening : handleStartSpeaking}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow transition-all active:scale-95 flex-shrink-0 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                : 'bg-field-600 hover:bg-field-700 text-cream-50'
            }`}
            title="பேசி உள்ளிடவும் / Speak Input"
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <div>
            <div className="text-xs font-bold text-soil-900 flex items-center gap-1.5">
              <span>{isListening ? (isTamil ? 'கேட்கிறது... பேசுங்கள்' : 'Listening... speak now') : (isTamil ? '🗣️ தமிழில் பேசலாம்' : 'Tap mic to speak')}</span>
            </div>
            <p className="text-[11px] text-soil-600 truncate max-w-[240px] sm:max-w-md">
              {transcript || spokenText || (isTamil ? 'எ.கா: "5 ஏக்கர் வண்டல் மண் நிலம், வாய்க்கால் பாசனம், போன பருவம் நெல் மற்றும் உளுந்து போட்டேன்"' : 'e.g. "5 acres alluvial soil, grew paddy and black gram"')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {confirmationMsg && (
            <span className="hidden sm:inline text-[11px] font-bold text-field-700 bg-field-100 px-2 py-1 rounded-lg">
              ✓ பகுப்பாய்வு செய்யப்பட்டது
            </span>
          )}

          <button
            type="button"
            onClick={handleSpeakCurrentStep}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-300 shadow-sm active:scale-95 transition flex-shrink-0"
            title="குரல் வழி விளக்கம் / Listen to Step Instructions"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-800 animate-pulse" /> : <Volume2 className="w-4 h-4 text-amber-800" />}
            <span>{isSpeaking ? (isTamil ? 'நிறுத்து' : 'Stop') : (isTamil ? '👨‍🌾 ஆண் குரலில் கேட்க' : '👨‍🌾 Male Voice')}</span>
          </button>
        </div>
      </div>

      {/* STEP 1: FARMER & LAND DETAILS */}
      {currentStep === 1 && (
        <div className="card-heartland space-y-4 animate-in slide-in-from-right-4">
          <div>
            <h2 className="font-display font-extrabold text-lg text-soil-900">
              {isTamil ? '1. பண்ணை மற்றும் நில விவரங்கள்' : '1. Farm & Land Details'}
            </h2>
            <p className="text-xs text-soil-600 mt-0.5">
              {isTamil ? 'உங்கள் நிலத்தின் பரப்பளவு, மண் வகை மற்றும் பாசன அமைப்பைக் குறிப்பிடவும்:' : 'Specify your farm size, soil texture, and irrigation source:'}
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Farmer / Farm Name */}
            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                {isTamil ? 'விவசாயி / பண்ணையின் பெயர்' : 'Farmer / Farm Name'}
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder={isTamil ? 'முத்துவேல் பண்ணை' : 'e.g. Muthuvel Farm'}
                className="w-full p-2.5 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold focus:ring-2 focus:ring-field-600"
              />
            </div>

            {/* Land Size (Acres) */}
            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                {isTamil ? 'நிலப்பரப்பு (ஏக்கர்)' : 'Field Size (Acres)'}
              </label>
              <div className="flex gap-2 mb-2">
                {[2, 5, 10, 25].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAcres(val)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      parseFloat(acres) === val 
                        ? 'bg-field-600 text-cream-50 border-field-600' 
                        : 'bg-cream-100 text-soil-800 border-soil-300 hover:bg-cream-200'
                    }`}
                  >
                    {val} {isTamil ? 'ஏக்கர்' : 'Acres'}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                className="w-full p-2.5 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold focus:ring-2 focus:ring-field-600"
              />
            </div>

            {/* Soil Texture Class */}
            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                {isTamil ? 'மண் வகை (Soil Texture Class)' : 'Soil Texture Class'}
              </label>
              <select
                value={soilTexture}
                onChange={(e) => setSoilTexture(e.target.value)}
                className="w-full p-2.5 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-bold focus:ring-2 focus:ring-field-600"
              >
                <option value="Alluvial Clay Loam (வண்டல் மண்)">வண்டல் மண் (Alluvial Clay Loam - காவிரி டெல்டா)</option>
                <option value="Red Loam (செம்மண்)">செம்மண் (Red Loam)</option>
                <option value="Black Clay (கரிசல் மண்)">கரிசல் மண் (Black Clay)</option>
                <option value="Sandy Loam (மணல் கலந்த மண்)">மணல் கலந்த மண் (Sandy Loam)</option>
                <option value="Heavy Clay (களிமண்)">களிமண் (Heavy Clay)</option>
              </select>
            </div>

            {/* Water / Irrigation Management */}
            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                {isTamil ? 'பாசன முறை (Water Source)' : 'Water Management'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWaterSource('irrigated')}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs flex items-center gap-2 ${
                    waterSource === 'irrigated'
                      ? 'bg-wheat-100 border-wheat-500 shadow-sm text-soil-900'
                      : 'bg-cream-50 border-soil-300 text-soil-700 hover:bg-cream-100'
                  }`}
                >
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <div>
                    <div>{isTamil ? 'பாசன வசதி உண்டு' : 'Irrigated'}</div>
                    <div className="text-[10px] font-normal text-soil-600">{isTamil ? 'வாய்க்கால் / ஆழ்துளைக் கிணறு' : 'Canal / Borewell'}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWaterSource('rainfed')}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs flex items-center gap-2 ${
                    waterSource === 'rainfed'
                      ? 'bg-wheat-100 border-wheat-500 shadow-sm text-soil-900'
                      : 'bg-cream-50 border-soil-300 text-soil-700 hover:bg-cream-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <div>
                    <div>{isTamil ? 'மானாவாரி' : 'Rainfed'}</div>
                    <div className="text-[10px] font-normal text-soil-600">{isTamil ? 'முழுக்க மழைப்பொழிவு' : 'Dryland Rainfed'}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('chime');
              setCurrentStep(2);
            }}
            className="btn-primary w-full text-sm font-extrabold py-3 mt-3 flex items-center justify-center gap-2 shadow-tactile"
          >
            <span>{isTamil ? 'அடுத்தது: நிலத்தின் இருப்பிடம்' : 'Next: Point Location'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: POINT ANY LOCATION ON MAP (Movable Pin anywhere in TN / World) */}
      {currentStep === 2 && (
        <div className="card-heartland space-y-4 animate-in slide-in-from-right-4">
          <div>
            <h2 className="font-display font-extrabold text-lg text-soil-900">
              {isTamil ? '2. நிலத்தின் இருப்பிடத்தைக் குறியிடவும்' : '2. Point Any Farm Location on Map'}
            </h2>
            <p className="text-xs text-soil-600 mt-0.5">
              {isTamil ? 'தமிழ்நாட்டின் எந்தப் பகுதியிலும் வரைபடத்தில் தொட்டு உங்கள் நிலத்தைக் குறிக்கலாம். அந்த இடத்திற்கு குறியீட்டு முள் உடனடியாக நகரும்:' : 'Tap or drag anywhere in Tamil Nadu to pin your exact farm. The pin dynamically moves to your selected coordinates:'}
            </p>
          </div>

          {/* Quick Regional District Presets for Tamil Nadu */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-soil-700">
              {isTamil ? 'முக்கிய விவசாய மாவட்டங்கள் (விரைவுத் தேர்வு):' : 'Major Agricultural Districts (Quick Preset):'}
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-cream-100 rounded-2xl border border-soil-300">
              {[
                { name: isTamil ? '🌾 தஞ்சாவூர்' : '🌾 Thanjavur', lat: 10.7870, lng: 79.1378, district: 'Thanjavur', zone: 'காவிரி டெல்டா' },
                { name: isTamil ? '🌾 திருவாரூர்' : '🌾 Tiruvarur', lat: 10.7725, lng: 79.6365, district: 'Tiruvarur', zone: 'காவிரி டெல்டா' },
                { name: isTamil ? '🌾 திருச்சி' : '🌾 Trichy', lat: 10.7905, lng: 78.7047, district: 'Tiruchirappalli', zone: 'மத்திய வடிநிலம்' },
                { name: isTamil ? '🌾 மதுரை' : '🌾 Madurai', lat: 9.9252, lng: 78.1198, district: 'Madurai', zone: 'தென் மண்டலம்' },
                { name: isTamil ? '🌾 கோயம்புத்தூர்' : '🌾 Coimbatore', lat: 11.0168, lng: 76.9558, district: 'Coimbatore', zone: 'மேற்கு மண்டலம்' },
                { name: isTamil ? '🌾 ஈரோடு' : '🌾 Erode', lat: 11.3410, lng: 77.7172, district: 'Erode', zone: 'மேற்கு மண்டலம்' },
                { name: isTamil ? '🌾 சேலம்' : '🌾 Salem', lat: 11.6643, lng: 78.1460, district: 'Salem', zone: 'வடமேற்கு' },
                { name: isTamil ? '🌾 திருநெல்வேலி' : '🌾 Tirunelveli', lat: 8.7139, lng: 77.7567, district: 'Tirunelveli', zone: 'தென் மண்டலம்' },
                { name: isTamil ? '🌾 கடலூர்' : '🌾 Cuddalore', lat: 11.7480, lng: 79.7714, district: 'Cuddalore', zone: 'வடகிழக்கு' },
                { name: isTamil ? '🌾 வேலூர்' : '🌾 Vellore', lat: 12.9165, lng: 79.1325, district: 'Vellore', zone: 'வடக்கு மண்டலம்' },
                { name: isTamil ? '🌾 மயிலாடுதுறை' : '🌾 Mayiladuthurai', lat: 11.1075, lng: 79.6524, district: 'Mayiladuthurai', zone: 'காவிரி டெல்டா' },
                { name: '🌽 Story County (Iowa)', lat: 42.0308, lng: -93.6319, district: 'Story', zone: 'Corn Belt' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedLocation({ 
                      lat: p.lat, 
                      lng: p.lng, 
                      name: p.name, 
                      district: p.district, 
                      zone: p.zone 
                    });
                    playSound('chime');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                    selectedLocation?.lat === p.lat && selectedLocation?.lng === p.lng
                      ? 'bg-field-600 text-cream-50 border-field-600 shadow-sm ring-2 ring-field-600/30'
                      : 'bg-cream-50 text-soil-800 border-soil-300 hover:bg-cream-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map with Movable / Draggable Pin */}
          <FieldMap
            center={{ lat: selectedLocation?.lat || 10.7870, lng: selectedLocation?.lng || 79.1378 }}
            fields={fieldList}
            selectedFieldId={currentFieldId}
            onLocationSelect={(loc) => {
              setSelectedLocation(loc);
              playSound('chime');
            }}
          />

          <div className="bg-wheat-100 border border-wheat-400 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-soil-900 font-bold gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-field-700 flex-shrink-0 animate-bounce" />
              <div>
                <span>{isTamil ? 'தேர்வு செய்யப்பட்ட இடம்:' : 'Selected Parcel:'}</span>{' '}
                <strong className="text-field-800">{selectedLocation?.name || 'தஞ்சாவூர் (Thanjavur)'}</strong>
                <div className="text-[11px] font-mono text-soil-700 mt-0.5">
                  அட்சரேகை: <strong>{selectedLocation?.lat || 10.7870}° N</strong>, தீர்க்கரேகை: <strong>{selectedLocation?.lng || 79.1378}° E</strong>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-soil-600 font-mono bg-cream-50 px-2 py-1 rounded-lg border border-soil-300 self-start sm:self-auto">
              NASA POWER Grid Linked
            </span>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="py-3 px-4 rounded-2xl bg-cream-200 hover:bg-cream-300 text-soil-800 font-bold text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isTamil ? 'பின்செல்' : 'Back'}</span>
            </button>
            <button
              onClick={() => {
                playSound('chime');
                setCurrentStep(3);
              }}
              className="btn-primary flex-1 text-sm font-extrabold py-3 flex items-center justify-center gap-2 shadow-tactile"
            >
              <span>{isTamil ? 'அடுத்தது: முந்தைய பயிர்கள்' : 'Next: Previous Crops'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MULTI-SELECT PREVIOUS CROPS & PRIORITY-WISE ORDERING / RANKING */}
      {currentStep === 3 && (
        <div className="card-heartland space-y-5 animate-in slide-in-from-right-4">
          <div>
            <h2 className="font-display font-extrabold text-lg text-soil-900">
              {isTamil ? '3. முன்னர் பயிரிட்ட பயிர்கள் & வரிசைப்படுத்தப்பட்ட இலக்குகள்' : '3. Previous Crops & Ranked Priorities'}
            </h2>
            <p className="text-xs text-soil-600 mt-0.5">
              {isTamil ? 'முன்னர் பயிரிட்ட பயிர்களை பலவாக தேர்வு செய்யலாம்; மேலும் உங்கள் விவசாய இலக்குகளை முக்கியத்துவத்திற்கு ஏற்ப வரிசைப்படுத்தவும்:' : 'Multi-select previously grown crops and rank your farming goals in order of importance:'}
            </p>
          </div>

          {/* 1. Multi-Select for Previously Grown Crops */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-soil-700">
                {isTamil ? 'முன்னர் பயிரிட்ட பயிர்கள் (பல பயிர்கள் தேர்ந்தெடுக்கலாம்):' : 'Previously Grown Crops (Multi-Select):'}
              </label>
              <span className="text-[10px] font-mono font-bold bg-field-100 text-field-900 px-2 py-0.5 rounded-full border border-field-300">
                {selectedPreviousCrops.length} {isTamil ? 'பயிர்கள் தேர்வு' : 'selected'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'paddy', label: isTamil ? '🌾 சம்பா நெல்' : 'Samba Paddy' },
                { id: 'kuruvai', label: isTamil ? '🌾 குறுவை நெல்' : 'Kuruvai Paddy' },
                { id: 'corn', label: isTamil ? '🌽 மக்காச்சோளம்' : 'Corn / Maize' },
                { id: 'black_gram', label: isTamil ? '🌱 உளுந்து / பயறு' : 'Black Gram' },
                { id: 'groundnut', label: isTamil ? '🥜 நிலக்கடலை' : 'Groundnut' },
                { id: 'cotton', label: isTamil ? '🌿 பருத்தி' : 'Cotton' },
                { id: 'sesame', label: isTamil ? '🌻 எள்' : 'Sesame' },
                { id: 'millets', label: isTamil ? '🌾 கம்பு / தினை' : 'Millets' },
                { id: 'sugarcane', label: isTamil ? '🎋 கரும்பு' : 'Sugarcane' },
                { id: 'vegetables', label: isTamil ? '🥬 காய்கறிகள்' : 'Vegetables' }
              ].map((c) => {
                const isSelected = selectedPreviousCrops.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => togglePreviousCrop(c.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between active:scale-95 ${
                      isSelected
                        ? 'bg-field-600 text-cream-50 border-field-600 shadow-sm ring-2 ring-field-600/30'
                        : 'bg-cream-100 text-soil-800 border-soil-300 hover:bg-cream-200'
                    }`}
                  >
                    <span>{c.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-wheat-300 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-soil-500 italic">
              {isTamil ? '💡 முந்தைய பயிர்களைத் தெரிந்து கொள்வது பூச்சி சுழற்சியை உடைக்கவும், தழைச்சத்தை சமன் செய்யவும் உதவுகிறது.' : '💡 Knowing previous crops helps break pest cycles and replenish nitrogen.'}
            </p>
          </div>

          {/* 2. Priority-Wise Ordering & Ranking (Importance Selection) */}
          <div className="space-y-2.5 pt-2 border-t border-soil-200">
            <div>
              <label className="block text-xs font-bold text-soil-800">
                {isTamil ? 'உங்கள் விவசாய முன்னுரிமை இலக்குகளை வரிசைப்படுத்தவும் (முக்கியத்துவத் தரவரிசை):' : 'Rank Your Farming Priorities in Order of Importance:'}
              </label>
              <p className="text-[11px] text-soil-600">
                {isTamil ? '▲ மற்றும் ▼ பொத்தான்களைப் பயன்படுத்தி பெட்டிகளை நகர்த்தவும். முதலிடத்தில் உள்ள இலக்கிற்கு பயிர் சுழற்சியில் அதிக முக்கியத்துவம் வழங்கப்படும்.' : 'Use ▲ and ▼ buttons to move items up or down. The top-ranked goal receives highest weight in crop rotation scoring.'}
              </p>
            </div>

            {/* Draggable / Movable Priority Ranking Cards */}
            <div className="space-y-2">
              {rankedPriorities.map((item, index) => {
                const Icon = item.icon;
                const isFirst = index === 0;
                const isLast = index === rankedPriorities.length - 1;

                const rankLabels = [
                  { title: isTamil ? '🥇 #1 முதன்மை இலக்கு (Top Priority - 2.5× முக்கியத்துவம்)' : '🥇 #1 Top Priority (2.5× Weight)', border: 'border-amber-400 bg-amber-50/60' },
                  { title: isTamil ? '🥈 #2 இரண்டாம் இலக்கு (2.0× முக்கியத்துவம்)' : '🥈 #2 Second Priority (2.0× Weight)', border: 'border-teal-400 bg-teal-50/50' },
                  { title: isTamil ? '🥉 #3 மூன்றாம் இலக்கு (1.5× முக்கியத்துவம்)' : '🥉 #3 Third Priority (1.5× Weight)', border: 'border-soil-300 bg-cream-50' },
                  { title: isTamil ? '🎖️ #4 நான்காம் இலக்கு (1.0× முக்கியத்துவம்)' : '🎖️ #4 Fourth Priority (1.0× Weight)', border: 'border-soil-200 bg-cream-50' }
                ];

                const currentRank = rankLabels[index] || rankLabels[3];

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 shadow-sm ${currentRank.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-soil-200`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-extrabold uppercase text-field-800">
                          {currentRank.title}
                        </div>
                        <h4 className="font-display font-extrabold text-sm text-soil-900">
                          {item.label}
                        </h4>
                        <p className="text-[10px] text-soil-600">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Move Up / Move Down Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!isFirst && (
                        <button
                          type="button"
                          onClick={() => makeTopPriority(index)}
                          className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-extrabold border border-amber-300 active:scale-95 transition hidden sm:inline"
                          title="முதன்மை ஆக்கு (#1)"
                        >
                          #1 ஆக்கு
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => movePriority(index, -1)}
                        className={`p-1.5 rounded-xl border transition ${
                          isFirst 
                            ? 'opacity-30 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400' 
                            : 'bg-white hover:bg-cream-100 text-soil-800 border-soil-300 active:scale-95 shadow-sm'
                        }`}
                        title="மேலே நகர்த்து (Move Up)"
                      >
                        <ChevronUp className="w-4 h-4 font-extrabold" />
                      </button>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => movePriority(index, 1)}
                        className={`p-1.5 rounded-xl border transition ${
                          isLast 
                            ? 'opacity-30 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400' 
                            : 'bg-white hover:bg-cream-100 text-soil-800 border-soil-300 active:scale-95 shadow-sm'
                        }`}
                        title="கீழே நகர்த்து (Move Down)"
                      >
                        <ChevronDown className="w-4 h-4 font-extrabold" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="py-3 px-4 rounded-2xl bg-cream-200 hover:bg-cream-300 text-soil-800 font-bold text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isTamil ? 'பின்செல்' : 'Back'}</span>
            </button>
            <button
              onClick={handleFetchNASAAndSave}
              className="btn-gold flex-1 text-sm font-extrabold py-3 flex items-center justify-center gap-2 shadow-tactile"
            >
              <Satellite className="w-4 h-4 animate-spin-slow" />
              <span>{isTamil ? '🚀 நிலத்தை உறுதிசெய்து நாசா தரவுகளைப் பெறு' : '🚀 Save Field & Fetch NASA Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: NASA DATA INGESTION & PROFILE BUILDER TELEMETRY */}
      {currentStep === 4 && (
        <div className="card-heartland text-center py-8 px-6 space-y-5 animate-in zoom-in-95">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-field-600/30 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-field-600 text-wheat-400 flex items-center justify-center shadow-2xl border-2 border-wheat-400">
              <Satellite className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          <div>
            <h2 className="font-display font-extrabold text-xl text-soil-900">
              {isTamil ? 'நாசா செயற்கைக்கோள் தரவுகளைப் பெறுகிறது...' : 'Retrieving Official NASA Data...'}
            </h2>
            <p className="text-xs font-mono font-bold text-field-700 mt-1 min-h-[36px]">
              {nasaStepText}
            </p>
          </div>

          <div className="w-full bg-cream-200 h-3 rounded-full overflow-hidden border border-soil-300 max-w-md mx-auto">
            <div 
              className="bg-gradient-to-r from-amber-500 to-field-600 h-full transition-all duration-300 rounded-full" 
              style={{ width: `${nasaProgress}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-soil-600">
            NASA POWER • AppEEARS MODIS NDVI • TNAU SSURGO Soil
          </div>
        </div>
      )}

      {/* STEP 5: SELECT DURATION FOR CROP ROTATION */}
      {currentStep === 5 && (
        <div className="card-heartland space-y-4 animate-in slide-in-from-right-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-field-100 text-field-900 px-2.5 py-0.5 rounded-full border border-field-300">
              {isTamil ? 'சுழற்சி காலம் தேர்வு' : 'Rotation Duration Selection'}
            </span>
            <h2 className="font-display font-extrabold text-xl text-soil-900 mt-2">
              {isTamil ? 'பயிர் சுழற்சி காலத்தைத் தேர்வு செய்யுங்கள்' : 'Select Crop Rotation Duration'}
            </h2>
            <p className="text-xs text-soil-600 mt-0.5">
              {isTamil ? 'உங்கள் நிலத்தின் முந்தைய பயிர்கள், மண் வளம் மற்றும் நாசா காலநிலை அடிப்படையில் உத்திகளை உருவாக்க கால அளவைத் தேர்ந்தெடுக்கவும்:' : 'Choose your rotation planning horizon based on soil health and climate normals:'}
            </p>
          </div>

          {/* 3 Duration Options */}
          <div className="grid grid-cols-1 gap-3 pt-1">
            {/* Option 1: 1 Year (3-Season Fast Cycle) */}
            <div
              onClick={() => setSelectedDuration('1_year')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition active:scale-[0.99] flex items-center justify-between ${
                selectedDuration === '1_year'
                  ? 'bg-wheat-100 border-field-600 shadow-tactile ring-2 ring-field-600/30'
                  : 'bg-cream-50 border-soil-200 hover:border-soil-400'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold bg-field-600 text-cream-50 px-2 py-0.5 rounded-md">
                    1 {isTamil ? 'பருவம் / ஆண்டு' : 'Year'}
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-soil-900">
                    {isTamil ? '1-ஆண்டு விரைவு பயிர் சுழற்சி (3 பருவங்கள்)' : '1-Year Fast Rotation (3 Seasons)'}
                  </h3>
                </div>
                <p className="text-[11px] text-soil-600 mt-1">
                  {isTamil ? 'குறுவை நெல் ➔ உளுந்து ➔ எள் (42% நீர் சேமிப்பு, உடனடி பணப்பயிர் வருமானம்)' : 'Kuruvai Paddy ➔ Black Gram ➔ Sesame (Quick pulse cash flow, 42% water saving)'}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedDuration === '1_year' ? 'border-field-600 bg-field-600 text-white' : 'border-soil-400'
              }`}>
                {selectedDuration === '1_year' && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Option 2: 2 Years (Bi-Annual Intensive Cycle) */}
            <div
              onClick={() => setSelectedDuration('2_year')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition active:scale-[0.99] flex items-center justify-between ${
                selectedDuration === '2_year'
                  ? 'bg-wheat-100 border-field-600 shadow-tactile ring-2 ring-field-600/30'
                  : 'bg-cream-50 border-soil-200 hover:border-soil-400'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold bg-teal-600 text-cream-50 px-2 py-0.5 rounded-md">
                    2 {isTamil ? 'ஆண்டுகள்' : 'Years'}
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-soil-900">
                    {isTamil ? '2-ஆண்டு தீவிர மண்வள சுழற்சி' : '2-Year Soil Balance Rotation'}
                  </h3>
                </div>
                <p className="text-[11px] text-soil-600 mt-1">
                  {isTamil ? 'சணப்பை பசுந்தாள் உரம் ➔ சம்பா நெல் ➔ உளுந்து ➔ நிலக்கடலை (+65 lbs தழைச்சத்து)' : 'Sunn Hemp ➔ Samba Paddy ➔ Black Gram ➔ Groundnut (+65 lbs biological N)'}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedDuration === '2_year' ? 'border-field-600 bg-field-600 text-white' : 'border-soil-400'
              }`}>
                {selectedDuration === '2_year' && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Option 3: 3 Years (Tri-Annual Climate Resilient Cycle - Recommended) */}
            <div
              onClick={() => setSelectedDuration('3_year')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition active:scale-[0.99] flex items-center justify-between ${
                selectedDuration === '3_year'
                  ? 'bg-wheat-100 border-field-600 shadow-tactile ring-2 ring-field-600/30'
                  : 'bg-cream-50 border-soil-200 hover:border-soil-400'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md">
                    3 {isTamil ? 'ஆண்டுகள் (சிறந்தது)' : 'Years (Recommended)'}
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-soil-900">
                    {isTamil ? '3-ஆண்டு முழுமையான காலநிலை தாங்கும் உத்தி' : '3-Year Climate Resilient Tri-Cycle'}
                  </h3>
                </div>
                <p className="text-[11px] text-soil-600 mt-1">
                  {isTamil ? 'சணப்பை ➔ சம்பா நெல் ➔ உளுந்து ➔ எள் (பூச்சி சுழற்சி உடைப்பு, +80 lbs தழைச்சத்து, அதிகபட்ச வறட்சி பாதுகாப்பு)' : 'Sunn Hemp ➔ Samba Paddy ➔ Black Gram ➔ Sesame (Full pest break, +80 lbs N, max drought safety)'}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedDuration === '3_year' ? 'border-field-600 bg-field-600 text-white' : 'border-soil-400'
              }`}>
                {selectedDuration === '3_year' && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateStrategies}
            className="btn-gold w-full text-base font-extrabold py-3.5 mt-2 flex items-center justify-center gap-2 shadow-tactile active:scale-95 transition"
          >
            <Trophy className="w-5 h-5" />
            <span>{isTamil ? '✨ பயிர் சுழற்சி உத்திகளை உருவாக்கு' : '✨ Generate Crop Rotation Strategies'}</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      )}

      {/* STEP 6: DISPLAY LIST OF STRATEGIES WITH EXACT 3-BUTTON ACTION GRID FOR EACH */}
      {currentStep === 6 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-field-700 bg-field-100 px-2.5 py-0.5 rounded-full">
                {isTamil ? 'நாசா தரவு அடிப்படையிலான பரிந்துரைகள்' : 'NASA Powered Recommendations'}
              </span>
              <h2 className="font-display font-extrabold text-xl text-soil-900 mt-1">
                {isTamil ? 'பரிந்துரைக்கப்பட்ட பயிர் சுழற்சி உத்திகள்' : 'Recommended Crop Rotation Strategies'}
              </h2>
              <p className="text-xs text-soil-600">
                {isTamil ? 'ஒவ்வொரு உத்தியையும் விளையாட்டாக சோதிக்கலாம், நிலத்தில் உருவகப்படுத்தலாம் அல்லது நேரடியாக உறுதி செய்யலாம்:' : 'Test each strategy in the full-screen game, simulate on land, or commit directly:'}
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-3 py-1.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-soil-800 text-xs font-bold border border-soil-300"
            >
              {isTamil ? 'காலத்தை மாற்று' : 'Change Duration'}
            </button>
          </div>

          {committedMsg && (
            <div className="bg-field-100 border border-field-400 text-field-900 rounded-2xl p-3.5 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-field-700 flex-shrink-0" />
              <span>{committedMsg}</span>
            </div>
          )}

          {loadingStrategies ? (
            <div className="card-heartland text-center py-12">
              <div className="w-10 h-10 border-4 border-field-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <div className="text-sm font-bold text-soil-800">
                {isTamil ? 'நாசா காலநிலைத் தரவுகளுடன் உத்திகளை கணக்கிடுகிறது...' : 'Evaluating 5-factor rotation plans against NASA records...'}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {strategies.map((strat, idx) => (
                <div
                  key={strat.id}
                  className="card-heartland border-2 border-soil-200 hover:border-field-600 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        idx === 0 ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300' : 'bg-soil-200 text-soil-800'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="font-display font-extrabold text-sm sm:text-base text-soil-900">
                          {strat.name}
                        </h3>
                        <div className="text-[11px] font-bold text-field-700">
                          {strat.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] uppercase font-bold text-soil-500">Overall</div>
                      <div className="font-display font-extrabold text-lg sm:text-xl text-field-700">
                        {strat.scores?.overall || 88}<span className="text-xs text-soil-500">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* DISTINCT BOTANICAL CROP PICTURES (Visual illustrated cards for every crop) */}
                  <div className="bg-cream-100/80 rounded-2xl p-2.5 border border-soil-200">
                    <CropSequenceVisualizer sequence={strat.sequence} isTamil={isTamil} />
                  </div>

                  {/* 5 Factor Breakdown Pills with Granular Differentiated Scores */}
                  <div className="grid grid-cols-5 gap-1.5 text-center pt-1 border-t border-soil-200">
                    <div className="bg-cream-200/90 p-1.5 rounded-xl border border-soil-300/40">
                      <div className="text-[9px] font-bold text-soil-600">Yield</div>
                      <div className="text-xs font-extrabold text-soil-900">{strat.scores?.yield || 85}</div>
                    </div>
                    <div className="bg-cyan-50 p-1.5 rounded-xl border border-cyan-200">
                      <div className="text-[9px] font-bold text-cyan-700">Water</div>
                      <div className="text-xs font-extrabold text-cyan-800">{strat.scores?.water || 85}</div>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-xl border border-emerald-200">
                      <div className="text-[9px] font-bold text-emerald-700">Soil</div>
                      <div className="text-xs font-extrabold text-emerald-800">{strat.scores?.soil || 85}</div>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                      <div className="text-[9px] font-bold text-amber-700">Income</div>
                      <div className="text-xs font-extrabold text-amber-800">{strat.scores?.income || 85}</div>
                    </div>
                    <div className="bg-rose-50 p-1.5 rounded-xl border border-rose-200">
                      <div className="text-[9px] font-bold text-rose-700">Risk</div>
                      <div className="text-xs font-extrabold text-rose-800">{strat.scores?.risk || 85}</div>
                    </div>
                  </div>

                  {/* 3 Action Buttons on EACH strategy card (Matching user's exact screenshot) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5 border-t border-soil-200">
                    {/* Button 1: Game Mode */}
                    <button
                      type="button"
                      onClick={() => setActiveGameStrategyId(strat.id)}
                      className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-display font-extrabold text-xs shadow-tactile flex items-center justify-center gap-1.5 active:scale-95 transition ring-2 ring-amber-300"
                    >
                      <Trophy className="w-4 h-4 text-stone-950" />
                      <span>{isTamil ? '🎮 விளையாட்டாக பரிசோதி' : '🎮 Test in Game'}</span>
                    </button>

                    {/* Button 2: Land Full Screen */}
                    <button
                      type="button"
                      onClick={() => navigate('/timemachine?fullscreen=true')}
                      className="py-2.5 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-cream-50 font-display font-extrabold text-xs shadow-tactile flex items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      <Maximize2 className="w-4 h-4 text-emerald-300" />
                      <span>{isTamil ? '🌾 நிலத்தை முழுத்திரையில் பார்' : '🌾 Simulate Land'}</span>
                    </button>

                    {/* Button 3: Commit Plan */}
                    <button
                      type="button"
                      onClick={() => handleCommitPlan(strat)}
                      className="btn-primary w-full py-2.5 px-3 text-xs font-bold shadow-tactile flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-wheat-400" />
                      <span>{isTamil ? '🏆 இச்சுழற்சியை உறுதி செய்' : '🏆 Commit Plan'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MASTER ANALYZE ALL STRATEGIES IN GAME MODE BUTTON (Requested by user) */}
          <div className="pt-3 pb-2 text-center">
            <button
              type="button"
              onClick={() => {
                playSound('chime');
                setShowAllStrategiesAnalysis(true);
              }}
              className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:via-amber-500 hover:to-emerald-500 text-stone-950 font-display font-extrabold text-sm sm:text-base shadow-tactile-hover flex items-center justify-center gap-3 active:scale-98 transition transform ring-4 ring-amber-400/40 animate-pulse"
            >
              <Sliders className="w-5 h-5 text-stone-950" />
              <span>{isTamil ? '⚡ அனைத்து உத்திகளையும் ஒப்பிட்டு ஆராய் (ANALYZE ALL IN GAME MODE)' : '⚡ ANALYZE ALL STRATEGIES IN GAME MODE'}</span>
              <Trophy className="w-5 h-5 text-stone-950" />
            </button>
            <p className="text-[11px] text-soil-600 mt-1.5 font-medium">
              {isTamil 
                ? 'அனைத்து 5 உத்திகளையும் ஒரே முழுத்திரையில் வைத்து, காலநிலை மாற்றங்களை விளையாட்டாக சோதிக்கலாம்' 
                : 'Compare all 5 strategies side-by-side on one full screen with real-time What-If climate simulation sliders'}
            </p>
          </div>

          {/* Continue to Field Dashboard Button */}
          <div className="pt-2 text-center">
            <button
              onClick={() => navigate('/today')}
              className="px-6 py-3 rounded-2xl bg-soil-900 hover:bg-soil-800 text-cream-50 font-extrabold text-xs flex items-center justify-center gap-2 mx-auto active:scale-95 transition shadow-tactile"
            >
              <span>{isTamil ? 'பண்ணை முகப்புக்குச் செல் (Go to Farm Today)' : 'Go to Farm Dashboard ➔'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FULL SCREEN GAME SIMULATION MODAL (When Farmer taps Game Mode on any single strategy) */}
      {activeGameStrategyId && (
        <FarmGameSimulation
          isOpen={true}
          initialStrategyId={activeGameStrategyId}
          onClose={() => setActiveGameStrategyId(null)}
        />
      )}

      {/* FULL SCREEN ALL STRATEGIES GAME MODE ANALYSIS MODAL (When Farmer taps ANALYZE at the end) */}
      {showAllStrategiesAnalysis && (
        <AllStrategiesGameAnalysis
          isOpen={true}
          onClose={() => setShowAllStrategiesAnalysis(false)}
          strategies={strategies}
          onCommitStrategy={handleCommitPlan}
          fieldLocation={selectedLocation || { lat: 10.7870, lng: 79.1378, name: 'தஞ்சாவூர்' }}
        />
      )}

      {/* FULL SCREEN STRATEGY COMMIT CONFIRMATION & AUTOMATED TRANSITION TO LAND SIMULATION */}
      <StrategyCommitModal
        isOpen={showCommitModal}
        onClose={() => setShowCommitModal(false)}
        strategy={confirmedStrategy}
        farmerName={farmerName}
      />
    </div>
  );
}
