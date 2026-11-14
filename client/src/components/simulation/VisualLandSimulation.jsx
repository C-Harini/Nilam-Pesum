import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../../context/VoiceContext';
import { useField } from '../../context/FieldContext';
import { 
  Play, Pause, RotateCcw, Maximize2, Minimize2, 
  Volume2, VolumeX, Droplets, Sparkles, Sun, 
  CloudRain, ShieldAlert, Award, ArrowRight, CheckCircle2 
} from 'lucide-react';

/**
 * Visual Land Simulation for Farmers
 * - Full Screen mode
 * - Strategy selection as master control
 * - Voice speech narration (Tamil / English)
 * - Large synchronized subtitles
 * - Living visual simulation of sky, crops, soil moisture & nitrogen bank
 */
export default function VisualLandSimulation({
  initialFieldId = 'field_tn01',
  isFullScreenMode = false,
  onToggleFullScreen = null
}) {
  const { t, i18n } = useTranslation();
  const { speak, stopSpeaking, isSpeaking } = useVoice();
  const { currentFieldId } = useField();

  const isTamil = i18n.language === 'ta';

  // Local full-screen fallback if not managed by parent
  const [internalFullScreen, setInternalFullScreen] = useState(isFullScreenMode);
  const isFullScreen = onToggleFullScreen ? isFullScreenMode : internalFullScreen;
  const toggleFullScreen = () => {
    if (onToggleFullScreen) {
      onToggleFullScreen();
    } else {
      setInternalFullScreen(!internalFullScreen);
    }
  };

  // Strategies available for selection
  const strategies = [
    {
      id: 'strat_cauvery_smart',
      name: isTamil ? 'உத்தி 1: காவிரி சுழற்சி (பரிந்துரைக்கப்பட்டது)' : 'Strategy 1: Climate-Smart Cauvery (Recommended)',
      crops: isTamil ? 'குறுவை நெல் ➔ உளுந்து ➔ எள்' : 'Kuruvai Paddy ➔ Black Gram ➔ Sesame',
      tag: isTamil ? '42% நீர் சேமிப்பு + 45 lb தழைச்சத்து உயர்வு' : '42% Water Saved + 45 lbs N Added',
      color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
      waterSavingPct: 42,
      nitrogenBalance: '+45 lbs/ac',
      profitEstimate: isTamil ? '₹54,000 / ஏக்கர்' : '$650 / acre',
      resilience: isTamil ? 'அதிக வறட்சி தாங்குதிறன்' : 'High Drought Resilience',
      legumeInRotation: true,
      stages: [
        {
          name: isTamil ? 'பருவம் 1: விதைப்பு (குறுவை நெல்)' : 'Stage 1: Sowing (Kuruvai Paddy)',
          day: 15,
          date: '2023-06-15',
          ndvi: 0.32,
          rainMm: 12,
          tempC: 31,
          rootWetness: 65,
          speech: isTamil 
            ? 'குறுவை நெல் விதைப்பு பருவம். மண்ணில் நல்ல ஈரப்பதம் உள்ளது. நாற்று நடவு செய்ய உகந்த காலம்.' 
            : 'Kuruvai Paddy sowing stage. Root zone soil moisture is healthy at 65 percent. Ideal sowing window.',
          caption: isTamil 
            ? 'குறுவை நெல் விதைப்பு: மண்ணில் போதுமான ஈரப்பதம் உள்ளது, விதைக்க உகந்த நேரம்.' 
            : 'Kuruvai Paddy Sowing: Soil moisture is adequate for transplantation.'
        },
        {
          name: isTamil ? 'பருவம் 2: நெல் வளர்ச்சி & தூர்கட்டுதல்' : 'Stage 2: Tillering & Peak Growth',
          day: 55,
          date: '2023-07-25',
          ndvi: 0.76,
          rainMm: 4,
          tempC: 34,
          rootWetness: 58,
          speech: isTamil 
            ? 'பயிர் செழிப்பாக வளர்ந்துள்ளது. செயற்கைக்கோள் பசுமை குறியீடு புள்ளி ஏழு ஆறு ஆக உயர்ந்துள்ளது.' 
            : 'Crops are vigorously tillering. Satellite greenness NDVI has peaked at 0.76.',
          caption: isTamil 
            ? 'நெல் செழிப்பான வளர்ச்சி: பசுமை குறியீடு 0.76 ஆக உயர்வு, பாசன நீர் மேலாண்மை சீரானது.' 
            : 'Vigorous Tillering: High NDVI greenness of 0.76, water management optimal.'
        },
        {
          name: isTamil ? 'பருவம் 3: உளுந்து சுழற்சி & இயற்கை தழைச்சத்து' : 'Stage 3: Black Gram Rotation (Nitrogen Fixation)',
          day: 110,
          date: '2023-09-18',
          ndvi: 0.65,
          rainMm: 28,
          tempC: 29,
          rootWetness: 72,
          speech: isTamil 
            ? 'நெல் அறுவடைக்கு பின் உளுந்து செழிப்பாக வளர்ந்து வருகிறது. வேர் முடிச்சுகள் வழியே நிலத்தில் 45 பவுண்ட் இயற்கை தழைச்சத்து சேமிக்கப்படுகிறது.' 
            : 'Black Gram legume rotation is active. Root nodules are capturing 45 pounds of natural nitrogen per acre, saving fertilizer costs.',
          caption: isTamil 
            ? 'உளுந்து சுழற்சி: வேர் முடிச்சுகள் மூலம் நிலத்தில் 45 பவுண்ட் இயற்கை தழைச்சத்து கூடுகிறது.' 
            : 'Legume Rotation: Biological nitrogen fixation adding +45 lbs N/acre.'
        },
        {
          name: isTamil ? 'பருவம் 4: எள் பயிர் & அறுவடை நிறைவு' : 'Stage 4: Sesame Crop & Final Harvest',
          day: 160,
          date: '2023-11-05',
          ndvi: 0.48,
          rainMm: 16,
          tempC: 28,
          rootWetness: 60,
          speech: isTamil 
            ? 'குறைந்த நீரில் எள் நன்கு விளைந்துள்ளது. பருவத்தின் முழு சுழற்சி முடிவில் நாற்பத்தி இரண்டு சதவீத நீர் சேமிக்கப்பட்டுள்ளது.' 
            : 'Sesame crop matured with minimal water. Season ends with 42% water savings and high net return.',
          caption: isTamil 
            ? 'பருவ அறுவடை நிறைவு: 42% நீர் மிச்சம், நல்ல வருமானம், மண் வளம் உயர்ந்துள்ளது.' 
            : 'Season Complete: 42% irrigation water saved, excellent soil nitrogen bank.'
        }
      ]
    },
    {
      id: 'strat_traditional_double',
      name: isTamil ? 'உத்தி 2: பாரம்பரிய இருபோக நெல் (அதிக நீர் தேவை)' : 'Strategy 2: Traditional Double Paddy (Water Heavy)',
      crops: isTamil ? 'குறுவை நெல் ➔ தாளடி நெல் ➔ தரிசு' : 'Kuruvai Paddy ➔ Thaladi Paddy ➔ Fallow',
      tag: isTamil ? '0% நீர் சேமிப்பு, -65 lb தழைச்சத்து இழப்பு' : 'High Water Depletion, -65 lbs N Deficit',
      color: 'border-amber-500 bg-amber-950/40 text-amber-300',
      waterSavingPct: 0,
      nitrogenBalance: '-65 lbs/ac',
      profitEstimate: isTamil ? '₹38,000 / ஏக்கர்' : '$460 / acre',
      resilience: isTamil ? 'வறட்சிக்கு அதிக வாய்ப்பு' : 'Vulnerable to Drought Stress',
      legumeInRotation: false,
      stages: [
        {
          name: isTamil ? 'பருவம் 1: முதல் போக நெல்' : 'Stage 1: First Paddy Crop',
          day: 20,
          date: '2023-06-20',
          ndvi: 0.35,
          rainMm: 8,
          tempC: 33,
          rootWetness: 60,
          speech: isTamil 
            ? 'பாரம்பரிய இருபோக நெல் உத்தி. முதல் போக நெல் விதைப்பு நடந்துள்ளது. நீர் தேவை அதிகம்.' 
            : 'Traditional double paddy strategy started. High water demand right from start.',
          caption: isTamil 
            ? 'முதல் போக நெல்: தொடர்ந்து பாசன நீர் தேவைப்படுகிறது.' 
            : 'First Paddy Crop: Continuous flood irrigation required.'
        },
        {
          name: isTamil ? 'பருவம் 2: நீர் தட்டுப்பாடு & வறட்சி எச்சரிக்கை' : 'Stage 2: Water Scarcity & Stress Period',
          day: 80,
          date: '2023-08-20',
          ndvi: 0.52,
          rainMm: 0,
          tempC: 36,
          rootWetness: 32,
          speech: isTamil 
            ? 'எச்சரிக்கை: மழை பொய்த்ததால் வேர் மண்டல ஈரம் 32 சதவீதமாக குறைந்துள்ளது. பயிர்கள் வாட வாய்ப்புள்ளது.' 
            : 'Warning: Rain deficit has dropped soil moisture to 32 percent. Crops entering water stress.',
          caption: isTamil 
            ? 'எச்சரிக்கை: மழை குறைவால் நிலம் வறண்டுள்ளது, பயிர் நீர் தகைவில் உள்ளது.' 
            : 'Warning: Soil moisture dropped to 32%, severe water stress.'
        },
        {
          name: isTamil ? 'பருவம் 3: இரண்டாவது போக தாளடி நெல்' : 'Stage 3: Second Paddy Crop (Nitrogen Depletion)',
          day: 130,
          date: '2023-10-10',
          ndvi: 0.58,
          rainMm: 18,
          tempC: 28,
          rootWetness: 62,
          speech: isTamil 
            ? 'இரண்டாவது போக நெல்லுக்கு கூடுதல் ரசாயன உரம் தேவைப்படுகிறது. நிலத்தின் இயற்கை சத்து குறைந்துள்ளது.' 
            : 'Second paddy crop requires heavy synthetic fertilizers. Soil nitrogen bank is depleted by 65 pounds.',
          caption: isTamil 
            ? 'இரண்டாம் போகம்: ரசாயன உரம் அதிகம் தேவைப்படுகிறது, மண் தழைச்சத்து இழப்பு -65 lbs.' 
            : 'Second Paddy: High chemical fertilizer cost, -65 lbs N depletion.'
        }
      ]
    },
    {
      id: 'strat_soil_rejuvenate',
      name: isTamil ? 'உத்தி 3: இயற்கை மண்வளப் பெருக்கம் (பசுந்தாள் உரம்)' : 'Strategy 3: Organic Soil Revival (Sunn Hemp)',
      crops: isTamil ? 'தக்கைப்பூண்டு ➔ சம்பா நெல் ➔ நிலக்கடலை' : 'Sunn Hemp ➔ Samba Paddy ➔ Groundnut',
      tag: isTamil ? '35% நீர் சேமிப்பு + 60 lb அதிகபட்ச தழைச்சத்து' : '35% Water Saved + 60 lbs Max N Recharge',
      color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300',
      waterSavingPct: 35,
      nitrogenBalance: '+60 lbs/ac',
      profitEstimate: isTamil ? '₹58,000 / ஏக்கர்' : '$710 / acre',
      resilience: isTamil ? 'மிக அதிக மண்வளம்' : 'Maximum Soil Organic Carbon',
      legumeInRotation: true,
      stages: [
        {
          name: isTamil ? 'பருவம் 1: தக்கைப்பூண்டு பசுந்தாள் உரம்' : 'Stage 1: Sunn Hemp Green Manuring',
          day: 25,
          date: '2023-06-25',
          ndvi: 0.60,
          rainMm: 14,
          tempC: 30,
          rootWetness: 70,
          speech: isTamil 
            ? 'தக்கைப்பூண்டு பசுந்தாள் பயிர் நிலத்தில் மடக்கி உழப்படுகிறது. நிலத்தின் நுண்ணுயிர் வளம் அதிகரிக்கிறது.' 
            : 'Sunn Hemp green manure plowed into soil. Microorganisms flourish and organic carbon increases.',
          caption: isTamil 
            ? 'பசுந்தாள் உரம் மடக்கி உழவு: நிலத்தின் கரிம வளம் மற்றும் இயற்கை நுண்ணுயிர்கள் கூடுகிறது.' 
            : 'Green Manure Incorporation: Boosting organic matter & soil biology.'
        },
        {
          name: isTamil ? 'பருவம் 2: செழிப்பான சம்பா நெல்' : 'Stage 2: Robust Samba Paddy Growth',
          day: 90,
          date: '2023-08-30',
          ndvi: 0.82,
          rainMm: 35,
          tempC: 28,
          rootWetness: 78,
          speech: isTamil 
            ? 'பசுந்தாள் உரத்தால் சம்பா நெல் அபரிமிதமாக வளர்ந்துள்ளது. செயற்கைக்கோள் பசுமை குறியீடு புள்ளி எட்டு இரண்டு!' 
            : 'Samba paddy is thriving on biological green manure nutrients. Peak satellite NDVI 0.82!',
          caption: isTamil 
            ? 'சம்பா நெல் உச்ச வளர்ச்சி: இயற்கை உரத்தால் NDVI 0.82, நோய் எதிர்ப்புத் திறன் அதிகரிப்பு.' 
            : 'Peak Samba Paddy: Superb vegetation greenness (NDVI 0.82).'
        },
        {
          name: isTamil ? 'பருவம் 3: நிலக்கடலை அறுவடை' : 'Stage 3: Groundnut Harvest & High Income',
          day: 155,
          date: '2023-11-02',
          ndvi: 0.54,
          rainMm: 10,
          tempC: 27,
          rootWetness: 64,
          speech: isTamil 
            ? 'நிலக்கடலை அறுவடைக்கு தயாராக உள்ளது. மண் வளம் கூடி, அதிக லாபம் தரும் சுழற்சி வெற்றிகரமாக நிறைவுபெறுகிறது.' 
            : 'Groundnut pods fully matured. Excellent harvest with 60 lbs nitrogen remaining in soil.',
          caption: isTamil 
            ? 'நிலக்கடலை அறுவடை: அதிக சந்தை மதிப்பு, நிலத்தில் +60 lbs தழைச்சத்து இருப்பு.' 
            : 'Groundnut Harvest: High market value, soil bank enriched by +60 lbs N.'
        }
      ]
    }
  ];

  // Active state
  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const currentStrategy = strategies[selectedStrategyIndex];
  const currentStage = currentStrategy.stages[currentStageIndex];

  // Timer loop for simulation playback
  const playTimerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev + 1 < currentStrategy.stages.length) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return 0; // Loop or stop
          }
        });
      }, 5000); // 5 seconds per stage during autoplay
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, currentStrategy]);

  // Trigger speech whenever stage or strategy changes
  useEffect(() => {
    if (audioEnabled && currentStage?.speech) {
      speak(currentStage.speech);
    }
  }, [selectedStrategyIndex, currentStageIndex, audioEnabled]);

  // Strategy selection handler
  const handleSelectStrategy = (idx) => {
    setIsPlaying(false);
    setSelectedStrategyIndex(idx);
    setCurrentStageIndex(0);
    const chosen = strategies[idx];
    const introMsg = isTamil 
      ? `${chosen.name} தேர்ந்தெடுக்கப்பட்டது. ${chosen.tag}.`
      : `${chosen.name} selected. ${chosen.tag}.`;
    if (audioEnabled) {
      speak(introMsg);
    }
  };

  const handleStageJump = (stageIdx) => {
    setIsPlaying(false);
    setCurrentStageIndex(stageIdx);
  };

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState && audioEnabled) {
      const playMsg = isTamil ? 'பருவ உருவகப்படுத்துதல் இயங்குகிறது.' : 'Playing season simulation.';
      speak(playMsg);
    }
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      stopSpeaking();
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
      if (currentStage?.speech) {
        speak(currentStage.speech);
      }
    }
  };

  // Environmental visual parameters derived from NASA values
  const rootWetness = currentStage.rootWetness || 60;
  const rainMm = currentStage.rainMm || 0;
  const tempC = currentStage.tempC || 30;
  const ndvi = currentStage.ndvi || 0.5;

  // Plant growth scale factor (0.3 to 1.0 based on NDVI)
  const plantScale = Math.min(1.0, Math.max(0.35, ndvi * 1.25));

  // Determine soil color based on moisture
  let soilGradient = 'from-amber-900 via-yellow-950 to-stone-900'; // dry
  let soilStatusText = isTamil ? 'மண் ஈரம் குறைவு' : 'Dry Soil';
  let soilStatusColor = 'text-amber-400';

  if (rootWetness > 68) {
    soilGradient = 'from-emerald-950 via-teal-950 to-stone-950'; // rich saturated
    soilStatusText = isTamil ? 'மண் ஈரம் நிறைந்தது (செழுமை)' : 'Moisture Rich';
    soilStatusColor = 'text-cyan-400';
  } else if (rootWetness >= 45) {
    soilGradient = 'from-amber-950 via-stone-900 to-stone-950'; // optimal
    soilStatusText = isTamil ? 'மிதமான உகந்த ஈரம்' : 'Optimal Moisture';
    soilStatusColor = 'text-emerald-400';
  }

  return (
    <div className={`relative transition-all duration-300 font-sans ${
      isFullScreen 
        ? 'fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col overflow-y-auto' 
        : 'w-full rounded-3xl bg-stone-900 text-stone-100 border-2 border-stone-700 shadow-2xl p-4 sm:p-6 space-y-4'
    }`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-display font-extrabold text-emerald-400">
                {isTamil ? '🌾 நில நேரடி உருவகப்படுத்துதல்' : '🌾 Interactive Field Simulation'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                {isTamil ? 'நாசா நேரடி மாதிரி' : 'NASA Powered'}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              {isTamil ? 'உத்திகளைத் தேர்ந்தெடுத்து நிலத்தில் மாற்றத்தைக் காணுங்கள்' : 'Select a rotation strategy to control simulation and voice guidance'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Audio Narration Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2.5 rounded-2xl border transition flex items-center gap-1.5 active:scale-95 ${
              audioEnabled 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30' 
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:bg-stone-700'
            }`}
            title={audioEnabled ? 'குரல் ஒலியை அணைக்க / Mute Voice' : 'குரல் ஒலியை இயக்க / Enable Voice'}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden sm:inline text-xs font-bold font-mono">
              {audioEnabled ? (isSpeaking ? 'பேசுகிறது...' : 'குரல் ஆன்') : 'குரல் ஆஃப்'}
            </span>
          </button>

          {/* Full Screen Toggle Button */}
          <button
            onClick={toggleFullScreen}
            className="p-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 transition active:scale-95 flex items-center gap-1.5"
            title={isFullScreen ? 'சாதாரண காட்சி / Normal View' : 'முழுத்திரை / Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="w-5 h-5 text-amber-400" /> : <Maximize2 className="w-5 h-5 text-emerald-400" />}
            <span className="hidden sm:inline text-xs font-bold">
              {isFullScreen ? (isTamil ? 'மூடுக' : 'Exit') : (isTamil ? 'முழுத்திரை' : 'Full Screen')}
            </span>
          </button>
        </div>
      </div>

      {/* Strategy Selector Carousel / Control Buttons */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          {isTamil ? 'பயிர் சுழற்சி உத்திகள் (Strategy Controller):' : 'Select Crop Rotation Strategy:'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {strategies.map((strat, idx) => {
            const isSelected = idx === selectedStrategyIndex;
            return (
              <button
                key={strat.id}
                onClick={() => handleSelectStrategy(idx)}
                className={`p-3 rounded-2xl text-left border-2 transition-all duration-200 active:scale-98 ${
                  isSelected 
                    ? `${strat.color} ring-2 ring-emerald-400/50 shadow-lg scale-[1.02]` 
                    : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{strat.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                </div>
                <div className="text-[11px] font-semibold text-stone-300 mt-0.5 truncate">{strat.crops}</div>
                <div className="text-[10px] mt-1 font-mono text-emerald-400 font-bold bg-stone-950/40 px-2 py-0.5 rounded-md inline-block">
                  {strat.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synchronized Voice Captions / Subtitle Bar */}
      <div className="bg-stone-950/90 border-2 border-emerald-500/40 rounded-2xl p-3.5 flex items-start gap-3 shadow-inner">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          {isSpeaking ? (
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-emerald-400 animate-[bounce_0.6s_infinite]" />
              <span className="w-1 bg-emerald-400 animate-[bounce_0.8s_infinite]" />
              <span className="w-1 bg-emerald-400 animate-[bounce_0.5s_infinite]" />
            </div>
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span>{isTamil ? 'குரல் உரை (Voice Subtitles):' : 'Voice Narration:'}</span>
            {isSpeaking && <span className="text-[10px] text-amber-400 animate-pulse font-sans">● {isTamil ? 'பேசுகிறது...' : 'Speaking...'}</span>}
          </div>
          <div className="text-sm sm:text-base font-display font-extrabold text-stone-100 leading-snug mt-0.5">
            "{currentStage.caption}"
          </div>
        </div>
      </div>

      {/* Main Visual Canvas: Sky, Crops, & Underground Soil Cross-Section */}
      <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border-2 border-stone-800 shadow-2xl flex flex-col select-none">
        {/* Dynamic Sky & Weather Section (Top 55%) */}
        <div className="relative h-[55%] w-full bg-gradient-to-b from-sky-900 via-sky-800 to-amber-950/40 overflow-hidden flex flex-col justify-between p-3">
          {/* Sun / Heat Aura */}
          <div className="absolute top-2 right-4 flex items-center gap-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-amber-400/90 blur-[1px] shadow-[0_0_40px_rgba(251,191,36,0.8)] animate-pulse" />
              <Sun className="w-10 h-10 text-amber-100 absolute inset-0 m-auto" />
            </div>
          </div>

          {/* Rain droplet animation when raining */}
          {rainMm > 5 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {[...Array(18)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-cyan-300/80 w-0.5 h-6 rounded-full animate-fall"
                  style={{
                    left: `${(i * 5.8) + 2}%`,
                    top: `-${Math.random() * 20}px`,
                    animationDuration: `${0.6 + (i % 4) * 0.15}s`,
                    animationIterationCount: 'infinite'
                  }}
                />
              ))}
            </div>
          )}

          {/* Current Weather Indicators in Sky */}
          <div className="z-10 flex items-center gap-2 flex-wrap">
            <div className="bg-stone-900/80 backdrop-blur px-2.5 py-1 rounded-xl border border-stone-700/60 text-xs font-bold text-stone-200 flex items-center gap-1.5 shadow">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{tempC}°C</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-2.5 py-1 rounded-xl border border-stone-700/60 text-xs font-bold text-stone-200 flex items-center gap-1.5 shadow">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>{rainMm} mm மழை</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-2.5 py-1 rounded-xl border border-stone-700/60 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>NDVI {ndvi.toFixed(2)}</span>
            </div>
          </div>

          {/* Living Crops on Surface */}
          <div className="relative z-10 w-full flex items-end justify-around px-4 pb-0">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center origin-bottom transition-all duration-700"
                style={{ transform: `scale(${plantScale}) translateY(${5 - plantScale * 5}px)` }}
              >
                {/* Crop Plants Rendering */}
                <div className="relative flex flex-col items-center">
                  {/* Golden grains for harvest stage */}
                  {currentStageIndex === currentStrategy.stages.length - 1 ? (
                    <div className="flex gap-0.5 mb-0.5 animate-bounce">
                      <div className="w-1.5 h-4 bg-amber-400 rounded-full rotate-[-12deg]" />
                      <div className="w-1.5 h-4.5 bg-yellow-400 rounded-full" />
                      <div className="w-1.5 h-4 bg-amber-400 rounded-full rotate-[12deg]" />
                    </div>
                  ) : (
                    /* Lush Green Leaves */
                    <div className="flex gap-0.5 mb-0.5">
                      <div className="w-2 h-6 bg-emerald-400 rounded-full rotate-[-25deg] origin-bottom shadow-sm" />
                      <div className="w-2 h-7 bg-emerald-500 rounded-full rotate-[-5deg] origin-bottom shadow-sm" />
                      <div className="w-2 h-6 bg-emerald-400 rounded-full rotate-[20deg] origin-bottom shadow-sm" />
                    </div>
                  )}
                  {/* Stalk */}
                  <div className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Underground Soil Profile Cross-Section (Bottom 45%) */}
        <div className={`relative h-[45%] w-full bg-gradient-to-b ${soilGradient} p-3 flex flex-col justify-between border-t-4 border-amber-900/60 shadow-inner`}>
          {/* Surface Boundary & Root Systems */}
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 font-bold z-10">
            <span className="flex items-center gap-1.5 bg-stone-950/60 px-2 py-0.5 rounded-md">
              <span className={`w-2 h-2 rounded-full ${rootWetness > 45 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {soilStatusText} ({rootWetness}%)
            </span>
            <span className="bg-stone-950/60 px-2 py-0.5 rounded-md text-emerald-400 font-bold">
              {isTamil ? 'மண் தழைச்சத்து இருப்பு:' : 'Soil Nitrogen Bank:'} {currentStrategy.nitrogenBalance}
            </span>
          </div>

          {/* Biological Nitrogen Bubbles from Legumes */}
          {currentStrategy.legumeInRotation && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-around overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 text-[9px] font-bold text-emerald-300 flex items-center justify-center shadow-lg">
                    N₂
                  </div>
                  <span className="text-[8px] text-emerald-300/80 font-mono">+உரம்</span>
                </div>
              ))}
            </div>
          )}

          {/* Plant Roots Rendering Underground */}
          <div className="flex justify-around items-start w-full opacity-60">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-stone-400/80" />
                <div className="flex gap-1">
                  <div className="w-0.5 h-3 bg-stone-400/60 rotate-[-25deg]" />
                  <div className="w-0.5 h-3 bg-stone-400/60 rotate-[25deg]" />
                </div>
              </div>
            ))}
          </div>

          {/* Soil Layer Depth Markers */}
          <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 border-t border-stone-800/80 pt-1 z-10">
            <span>0 cm (மேல்மண் / Topsoil)</span>
            <span>-50 cm (வேர் மண்டலம் / Root Zone)</span>
            <span>-100 cm (நிலத்தடி நீர் / Water Table)</span>
          </div>
        </div>
      </div>

      {/* Stage Controller Timeline (Sowing ➔ Vegetative ➔ Flowering ➔ Harvest) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {isTamil ? 'நடப்பு பருவம்:' : 'Current Phase:'} <span className="text-emerald-400 font-extrabold">{currentStage.name}</span>
          </span>
          <span className="font-mono text-stone-400">{currentStage.date} (Day {currentStage.day})</span>
        </div>

        {/* Milestone Stage Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {currentStrategy.stages.map((stg, sIdx) => {
            const isActive = sIdx === currentStageIndex;
            return (
              <button
                key={sIdx}
                onClick={() => handleStageJump(sIdx)}
                className={`py-2 px-3 rounded-xl text-left border transition active:scale-95 ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-600 text-stone-950 font-extrabold shadow-lg'
                    : 'border-stone-800 bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
              >
                <div className="text-[10px] font-mono opacity-80">Phase {sIdx + 1}</div>
                <div className="text-xs font-bold truncate">{stg.name.split(':')[1] || stg.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Main Playback Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`min-h-[48px] px-6 rounded-2xl font-display font-extrabold text-sm flex items-center gap-2 shadow-tactile transition active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 ring-2 ring-amber-300'
                : 'bg-emerald-500 text-stone-950 hover:bg-emerald-400 ring-2 ring-emerald-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>{isTamil ? 'நிறுத்து (Pause)' : 'Pause Simulation'}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{isTamil ? 'இயக்கு (Play Simulation)' : 'Play Simulation'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleStageJump(0)}
            className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition active:scale-95"
            title="மீண்டும் தொடங்கு / Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Strategy Outcome Badges */}
        <div className="hidden sm:flex items-center gap-3 text-right">
          <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
            <div className="text-[10px] text-stone-400 font-bold uppercase">{isTamil ? 'நீர் சேமிப்பு' : 'Water Saved'}</div>
            <div className="text-sm font-extrabold text-cyan-400">+{currentStrategy.waterSavingPct}%</div>
          </div>
          <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
            <div className="text-[10px] text-stone-400 font-bold uppercase">{isTamil ? 'வருமானம்' : 'Net Income'}</div>
            <div className="text-sm font-extrabold text-emerald-400">{currentStrategy.profitEstimate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
