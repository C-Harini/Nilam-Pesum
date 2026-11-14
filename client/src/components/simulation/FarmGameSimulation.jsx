import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../../context/VoiceContext';
import { useField } from '../../context/FieldContext';
import { 
  Play, Pause, RotateCcw, X, Volume2, VolumeX, Droplets, 
  Sparkles, Sun, CloudRain, ShieldAlert, Award, ArrowRight, 
  CheckCircle2, Coins, Sprout, Leaf, Zap, RefreshCw, Trophy
} from 'lucide-react';

/**
 * FarmGameSimulation
 * An engaging, game-like full-screen farm simulation for farmers:
 * - Full Screen mode opened with 1 click
 * - Strategy selection as game quests
 * - Tamil Voice+ narration on every action
 * - Interactive game actions: Sow, Irrigate, Bio-Fertilize, Harvest
 * - Real-time animated crop growth, weather, and soil moisture HUD
 */
export default function FarmGameSimulation({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { speak, stopSpeaking, isSpeaking, playSound } = useVoice();
  const { currentFieldId, profile } = useField();

  const isTamil = i18n.language === 'ta';

  // Game Strategies / Quests
  const quests = [
    {
      id: 'quest_cauvery_smart',
      title: isTamil ? 'காவிரி ஸ்மார்ட் சுழற்சி' : 'Climate-Smart Cauvery',
      badge: isTamil ? 'பரிந்துரைக்கப்பட்டது (Best Choice)' : 'Recommended',
      crops: isTamil ? 'குறுவை நெல் ➔ உளுந்து ➔ எள்' : 'Kuruvai Paddy ➔ Black Gram ➔ Sesame',
      desc: isTamil 
        ? '42% நீர் சேமிப்பு, +45 lbs இயற்கை தழைச்சத்து வரவு. வறட்சியை தாங்கும் அதிக லாப உத்தி!'
        : 'Saves 42% water, adds +45 lbs biological nitrogen. High profit drought-smart rotation!',
      waterSaving: 42,
      nitrogenXP: 45,
      profitBonus: 54000,
      color: 'from-emerald-600 to-teal-700 border-emerald-400',
      tagColor: 'bg-emerald-500 text-stone-950',
      legume: true,
      stages: [
        {
          name: isTamil ? 'விதைப்பு பருவம் (குறுவை நெல்)' : 'Sowing (Kuruvai Paddy)',
          day: 15,
          phase: 'sowing',
          ndvi: 0.32,
          temp: 31,
          rain: 12,
          moisture: 65,
          speech: isTamil 
            ? 'குறுவை நெல் விதைப்பு பருவம் தொடங்கியது! மண்ணில் நல்ல ஈரம் உள்ளது. விதைகளை நடுவோம்!'
            : 'Kuruvai Paddy sowing started! Soil moisture is healthy. Let us sow the seeds!',
          caption: isTamil 
            ? 'குறுவை நெல் விதைப்பு: மண்ணில் 65% ஈரப்பதம் உள்ளது, நாற்று நடவு செய்ய உகந்த நேரம்!'
            : 'Kuruvai Sowing: 65% soil moisture, optimal time for transplantation!'
        },
        {
          name: isTamil ? 'தூர்கட்டும் வளர்ச்சிப் பருவம்' : 'Tillering & Peak Growth',
          day: 55,
          phase: 'vegetative',
          ndvi: 0.78,
          temp: 33,
          rain: 5,
          moisture: 58,
          speech: isTamil 
            ? 'நெற்பயிர்கள் பசுமையாக செழித்து வளர்கின்றன! செயற்கைக்கோள் பசுமை குறியீடு புள்ளி ஏழு எட்டு ஆக உயர்ந்துள்ளது.'
            : 'Paddy is vigorously tillering! Satellite greenness NDVI has surged to 0.78.',
          caption: isTamil 
            ? 'பயிர் தூர்கட்டுதல்: பசுமை குறியீடு 0.78, பயிர்கள் செழிப்பாக வளர்கின்றன.'
            : 'Tillering Phase: High NDVI of 0.78, lush crop canopy.'
        },
        {
          name: isTamil ? 'உளுந்து சுழற்சி (தழைச்சத்து வரவு)' : 'Black Gram (Nitrogen Fixation)',
          day: 110,
          phase: 'flowering',
          ndvi: 0.65,
          temp: 29,
          rain: 28,
          moisture: 74,
          speech: isTamil 
            ? 'அற்புதம்! உளுந்து பயிர் வேர் முடிச்சுகள் வழியே நாற்பத்தைந்து பவுண்ட் இயற்கை தழைச்சத்தை மண்ணில் சேர்க்கிறது!'
            : 'Excellent! Black Gram root nodules are generating 45 pounds of natural nitrogen into the soil!',
          caption: isTamil 
            ? 'உளுந்து உத்தி: வேர் முடிச்சுகள் மூலம் நிலத்தில் +45 lbs இயற்கை தழைச்சத்து சேமிப்பு!'
            : 'Legume Nodules: Capturing +45 lbs biological nitrogen per acre!'
        },
        {
          name: isTamil ? 'பொன்னிற அறுவடை நிறைவு!' : 'Golden Harvest Complete!',
          day: 165,
          phase: 'harvest',
          ndvi: 0.45,
          temp: 28,
          rain: 15,
          moisture: 60,
          speech: isTamil 
            ? 'வெற்றிகரமான அறுவடை! நாற்பத்தி இரண்டு சதவீத நீர் மிச்சம், ஐம்பத்து நான்காயிரம் ரூபாய் நிகர லாபம் கிடைத்துள்ளது!'
            : 'Successful harvest! 42% water saved and 54,000 rupees profit earned!',
          caption: isTamil 
            ? 'அறுவடை வெற்றி! +42% நீர் சேமிப்பு, ₹54,000 லாபம், மண் வளம் பாதுகாக்கப்பட்டு வெற்றி!'
            : 'Harvest Victory: 42% water saved, ₹54,000 profit earned!'
        }
      ]
    },
    {
      id: 'quest_soil_rejuvenate',
      title: isTamil ? 'இயற்கை மண்வள உத்தி' : 'Organic Soil Rejuvenation',
      badge: isTamil ? 'அதிகபட்ச மண் வளம் (Max Soil Health)' : 'Max Soil XP',
      crops: isTamil ? 'தக்கைப்பூண்டு ➔ சம்பா நெல் ➔ நிலக்கடலை' : 'Sunn Hemp ➔ Samba Paddy ➔ Groundnut',
      desc: isTamil 
        ? 'தக்கைப்பூண்டு பசுந்தாள் உரம் மூலம் +60 lbs தழைச்சத்து. நிலத்தின் இயற்கை நுண்ணுயிர் வளம் இருமடங்காகும்!'
        : 'Sunn Hemp green manuring provides +60 lbs nitrogen, doubling soil microbial organic health!',
      waterSaving: 35,
      nitrogenXP: 60,
      profitBonus: 58000,
      color: 'from-cyan-600 to-blue-800 border-cyan-400',
      tagColor: 'bg-cyan-400 text-stone-950',
      legume: true,
      stages: [
        {
          name: isTamil ? 'தக்கைப்பூண்டு பசுந்தாள் உழவு' : 'Sunn Hemp Green Manuring',
          day: 30,
          phase: 'sowing',
          ndvi: 0.62,
          temp: 30,
          rain: 16,
          moisture: 72,
          speech: isTamil 
            ? 'தக்கைப்பூண்டு பசுந்தாள் பயிர் நிலத்தில் மடக்கி உழப்படுகிறது! நிலத்தின் இயற்கை கரிம வளம் பெருகுகிறது.'
            : 'Sunn Hemp green manure plowed into soil! Organic carbon and soil health surging.',
          caption: isTamil 
            ? 'பசுந்தாள் உழவு: தக்கைப்பூண்டு மண்ணில் மடக்கி உழப்பட்டு இயற்கை கரிம வளம் கூடுகிறது.'
            : 'Green Manure: Enriching soil biology with organic biomass.'
        },
        {
          name: isTamil ? 'செழிப்பான சம்பா நெல் வளர்ச்சி' : 'Thriving Samba Paddy',
          day: 95,
          phase: 'vegetative',
          ndvi: 0.84,
          temp: 28,
          rain: 32,
          moisture: 80,
          speech: isTamil 
            ? 'இயற்கை உரத்தால் சம்பா நெல் அபரிமிதமாக வளர்ந்துள்ளது! செயற்கைக்கோள் பசுமை குறியீடு புள்ளி எட்டு நான்கு!'
            : 'Samba paddy is flourishing on biological nutrients! Satellite NDVI reaches peak 0.84!',
          caption: isTamil 
            ? 'சம்பா நெல் உச்ச வளர்ச்சி: NDVI 0.84, இயற்கை உரத்தால் நோய் எதிர்ப்புத் திறன் அதிகரிப்பு.'
            : 'Peak Samba Growth: High vigor NDVI 0.84, zero chemical dependence.'
        },
        {
          name: isTamil ? 'நிலக்கடலை அறுவடை & பெரும் லாபம்' : 'Groundnut Harvest & High Profit',
          day: 160,
          phase: 'harvest',
          ndvi: 0.52,
          temp: 27,
          rain: 10,
          moisture: 65,
          speech: isTamil 
            ? 'வாழ்த்துகள்! நிலக்கடலை அறுவடை முடிந்தது. அறுபது பவுண்ட் இயற்கை தழைச்சத்து நிலத்தில் தங்கியுள்ளது!'
            : 'Congratulations! Groundnut harvest complete with 60 pounds of residual nitrogen in your soil!',
          caption: isTamil 
            ? 'நிலக்கடலை அறுவடை: ₹58,000 லாபம், நிலத்தில் +60 lbs தழைச்சத்து இருப்புடன் நிறைவு!'
            : 'Groundnut Harvest: ₹58,000 profit with +60 lbs natural nitrogen bank!'
        }
      ]
    },
    {
      id: 'quest_traditional_risk',
      title: isTamil ? 'பாரம்பரிய தீவிர நெல்' : 'Traditional Double Paddy',
      badge: isTamil ? 'வறட்சி ஆபத்து (Drought Risk)' : 'High Water Risk',
      crops: isTamil ? 'குறுவை நெல் ➔ தாளடி நெல் ➔ தரிசு' : 'Kuruvai Paddy ➔ Thaladi Paddy ➔ Fallow',
      desc: isTamil 
        ? 'தொடர் நெல் சாகுபடியால் நிலத்தடி நீர் மற்றும் தழைச்சத்து குறையும். வறட்சி வந்தால் நஷ்டம் ஏற்படும் அபாயம்.'
        : 'Double paddy causes continuous groundwater depletion and -65 lbs nitrogen deficit.',
      waterSaving: 0,
      nitrogenXP: -65,
      profitBonus: 36000,
      color: 'from-amber-700 to-orange-900 border-amber-500',
      tagColor: 'bg-amber-400 text-stone-950',
      legume: false,
      stages: [
        {
          name: isTamil ? 'முதல் போக நெல் சாகுபடி' : 'First Season Paddy',
          day: 20,
          phase: 'sowing',
          ndvi: 0.35,
          temp: 33,
          rain: 8,
          moisture: 60,
          speech: isTamil 
            ? 'பாரம்பரிய இருபோக முறை தொடங்கியது. தொடர்ந்து அதிக பாசன நீர் தேவைப்படுகிறது.'
            : 'Traditional double paddy begun. Continuous high water pumping required.',
          caption: isTamil 
            ? 'முதல் போகம்: நிலத்தடி நீர் பம்பிங் அதிகம் தேவைப்படுகிறது.'
            : 'Season 1: Heavy groundwater pumping required.'
        },
        {
          name: isTamil ? 'மழை பொய்ப்பு & வறட்சி அபாயம்' : 'Monsoon Deficit & Water Stress',
          day: 80,
          phase: 'vegetative',
          ndvi: 0.50,
          temp: 36,
          rain: 0,
          moisture: 32,
          speech: isTamil 
            ? 'எச்சரிக்கை! மழை இல்லாததால் வேர் மண்டல ஈரம் முப்பத்திரண்டு சதவீதமாக குறைந்து பயிர்கள் வாடுகின்றன.'
            : 'Warning! Rain deficit dropped soil moisture to 32 percent. Crops suffering water stress.',
          caption: isTamil 
            ? 'எச்சரிக்கை: மழை குறைவால் நிலம் வறண்டுள்ளது, பயிர் நீர் தகைவில் வாடுகிறது.'
            : 'Warning: Soil moisture down to 32%, severe water stress.'
        },
        {
          name: isTamil ? 'இரண்டாம் போகம் & தழைச்சத்து இழப்பு' : 'Second Paddy & Soil Depletion',
          day: 140,
          phase: 'harvest',
          ndvi: 0.55,
          temp: 29,
          rain: 18,
          moisture: 62,
          speech: isTamil 
            ? 'அறுவடை முடிந்தது. ஆனால் நிலத்தில் அறுபத்தைந்து பவுண்ட் தழைச்சத்து குறைந்துள்ளது. அதிக உரம் தேவைப்பட்டது.'
            : 'Harvest finished, but soil has lost 65 pounds of nitrogen. Fertilizer expenses were high.',
          caption: isTamil 
            ? 'பருவம் நிறைவு: -65 lbs தழைச்சத்து இழப்பு, அதிக உரச் செலவால் நிகர லாபம் குறைவு.'
            : 'Season Ended: -65 lbs nitrogen deficit, lower net margin.'
        }
      ]
    }
  ];

  // Game Engine State
  const [selectedQuestIndex, setSelectedQuestIndex] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [inQuestSelectMode, setInQuestSelectMode] = useState(false);
  const [coins, setCoins] = useState(25000);
  const [waterTank, setWaterTank] = useState(65);
  const [nitrogenXP, setNitrogenXP] = useState(20);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [isIrrigatingAnim, setIsIrrigatingAnim] = useState(false);
  const [isHarvestAnim, setIsHarvestAnim] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentQuest = quests[selectedQuestIndex];
  const currentStage = currentQuest.stages[currentStageIdx];

  // Sync state when quest changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStageIdx(0);
      setWaterTank(currentQuest.stages[0].moisture);
      setNitrogenXP(Math.max(10, currentQuest.nitrogenXP > 0 ? currentQuest.nitrogenXP : 10));
      // Announce quest in Tamil
      if (soundEnabled) {
        const welcomeSpeech = isTamil 
          ? `விவசாய விளையாட்டுக்கு நல்வரவு! ${currentQuest.title} தேர்ந்தெடுக்கப்பட்டுள்ளது. ${currentQuest.stages[0].speech}`
          : `Welcome to Farm Simulation! ${currentQuest.title} is active. ${currentQuest.stages[0].speech}`;
        speak(welcomeSpeech);
      }
    }
  }, [isOpen, selectedQuestIndex]);

  // Autoplay game loop
  const autoLoopRef = useRef(null);
  useEffect(() => {
    if (isPlayingAuto) {
      autoLoopRef.current = setInterval(() => {
        setCurrentStageIdx((prev) => {
          if (prev + 1 < currentQuest.stages.length) {
            const nextIdx = prev + 1;
            const nextStage = currentQuest.stages[nextIdx];
            setWaterTank(nextStage.moisture);
            if (soundEnabled && nextStage.speech) {
              speak(nextStage.speech);
            }
            return nextIdx;
          } else {
            setIsPlayingAuto(false);
            return prev;
          }
        });
      }, 6000);
    } else {
      if (autoLoopRef.current) clearInterval(autoLoopRef.current);
    }
    return () => {
      if (autoLoopRef.current) clearInterval(autoLoopRef.current);
    };
  }, [isPlayingAuto, currentQuest]);

  if (!isOpen) return null;

  // Game Action 1: Sow Seeds (விதை விதை)
  const handleActionSow = () => {
    playSound('plant');
    setCurrentStageIdx(0);
    setWaterTank(68);
    const msg = isTamil 
      ? 'விதைகள் வெற்றிகரமாக நடப்பட்டன! இளம் பயிர்கள் துளிர்க்கத் தொடங்கியுள்ளன.'
      : 'Seeds successfully planted! Sprouts are emerging from rich soil.';
    if (soundEnabled) speak(msg);
  };

  // Game Action 2: Irrigate (நீர் பாய்ச்சு)
  const handleActionIrrigate = () => {
    playSound('water');
    setIsIrrigatingAnim(true);
    setTimeout(() => setIsIrrigatingAnim(false), 2500);
    setWaterTank((prev) => Math.min(95, prev + 25));
    const msg = isTamil 
      ? 'வயலில் நீர் பாய்ச்சப்பட்டது! வேர் மண்டல ஈரப்பதம் நிறைவடைந்தது.'
      : 'Field irrigated! Root zone moisture replenished to healthy saturation.';
    if (soundEnabled) speak(msg);
  };

  // Game Action 3: Bio-Fertilize (உயிர் உரம் / Legume nodule care)
  const handleActionBioFertilize = () => {
    playSound('chime');
    setNitrogenXP((prev) => prev + 15);
    setCoins((prev) => prev + 2000);
    const msg = isTamil 
      ? 'இயற்கை உயிர் உரம் இடப்பட்டது! வேர் முடிச்சுகள் வழியே இயற்கை தழைச்சத்து நிலத்தில் கூடுகிறது!'
      : 'Biological nutrients added! Root nodules releasing natural nitrogen into soil bank.';
    if (soundEnabled) speak(msg);
  };

  // Game Action 4: Advance Season (அடுத்த பருவம்)
  const handleActionAdvance = () => {
    playSound('chime');
    if (currentStageIdx + 1 < currentQuest.stages.length) {
      const nextIdx = currentStageIdx + 1;
      setCurrentStageIdx(nextIdx);
      const nextStage = currentQuest.stages[nextIdx];
      setWaterTank(nextStage.moisture);
      if (soundEnabled) speak(nextStage.speech);
    } else {
      handleActionHarvest();
    }
  };

  // Game Action 5: Harvest (அறுவடை செய்)
  const handleActionHarvest = () => {
    playSound('harvest');
    setIsHarvestAnim(true);
    setTimeout(() => setIsHarvestAnim(false), 3000);
    setCurrentStageIdx(currentQuest.stages.length - 1);
    setCoins((prev) => prev + currentQuest.profitBonus);
    const victoryMsg = isTamil 
      ? `வாழ்த்துகள்! பொன்னிற அறுவடை நிறைவடைந்தது! ${currentQuest.title} உத்தியால் நிகர லாபம் மற்றும் மண் வளம் அதிகரித்துள்ளது!`
      : `Congratulations! Bountiful harvest achieved with high profit bonus and enriched soil!`;
    if (soundEnabled) speak(victoryMsg);
  };

  // Toggle Sound
  const toggleSound = () => {
    if (soundEnabled) {
      stopSpeaking();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      if (currentStage?.speech) speak(currentStage.speech);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-300">
      {/* 1. TOP GAME HUD (Heads-Up Display) */}
      <header className="bg-stone-900/95 backdrop-blur border-b-2 border-stone-800 px-3 py-2.5 flex items-center justify-between z-20 shadow-xl">
        {/* Game Title & Field Badge */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-sm">
            <Trophy className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-display font-extrabold text-amber-400">
                {isTamil ? 'நிலம் பேசும்: விவசாய விளையாட்டு' : 'Nilam Farm Simulation Game'}
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                NASA Live
              </span>
            </div>
            <div className="text-[11px] font-semibold text-stone-400 flex items-center gap-2">
              <span>{isTamil ? 'உத்தி:' : 'Quest:'} <strong className="text-emerald-300">{currentQuest.title}</strong></span>
              <button
                onClick={() => setInQuestSelectMode(!inQuestSelectMode)}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold"
              >
                [{isTamil ? 'உத்தியை மாற்று' : 'Change Strategy'}]
              </button>
            </div>
          </div>
        </div>

        {/* Live Gauges & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Farm Coins / Profit */}
          <div className="bg-stone-950 px-2.5 py-1.5 rounded-xl border border-amber-500/40 flex items-center gap-1.5 shadow">
            <Coins className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <div className="text-right">
              <div className="text-[9px] text-stone-400 font-bold uppercase">{isTamil ? 'வருமானம்' : 'Coins'}</div>
              <div className="text-xs font-mono font-extrabold text-amber-300">₹{coins.toLocaleString()}</div>
            </div>
          </div>

          {/* Soil Moisture Tank */}
          <div className="hidden xs:flex bg-stone-950 px-2.5 py-1.5 rounded-xl border border-cyan-500/40 items-center gap-1.5 shadow">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <div className="text-[9px] text-stone-400 font-bold uppercase">{isTamil ? 'மண் ஈரம்' : 'Moisture'}</div>
              <div className="text-xs font-mono font-extrabold text-cyan-300">{waterTank}%</div>
            </div>
          </div>

          {/* Nitrogen Bank XP */}
          <div className="hidden sm:flex bg-stone-950 px-2.5 py-1.5 rounded-xl border border-emerald-500/40 items-center gap-1.5 shadow">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <div className="text-[9px] text-stone-400 font-bold uppercase">{isTamil ? 'தழைச்சத்து XP' : 'Nitrogen XP'}</div>
              <div className="text-xs font-mono font-extrabold text-emerald-300">+{nitrogenXP} XP</div>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
            title={soundEnabled ? 'ஒலியை அணைக்க / Mute' : 'ஒலியை இயக்க / Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Exit Full Screen */}
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 transition active:scale-95 flex items-center gap-1"
            title="விளையாட்டை மூடு / Exit Game"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold">{isTamil ? 'மூடு' : 'Exit'}</span>
          </button>
        </div>
      </header>

      {/* 2. QUEST / STRATEGY SELECTION OVERLAY (If Clicked) */}
      {inQuestSelectMode && (
        <div className="absolute inset-0 z-40 bg-stone-950/90 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-center items-center overflow-y-auto animate-in zoom-in-95">
          <div className="max-w-2xl w-full space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
                {isTamil ? 'பயிர் சுழற்சி உத்தித் தேர்வு' : 'Choose Your Farming Strategy'}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-stone-100">
                {isTamil ? 'உங்கள் பண்ணைக்கான உத்தியைத் தேர்வு செய்யுங்கள்' : 'Select Farm Rotation Strategy'}
              </h2>
              <p className="text-xs text-stone-400">
                {isTamil ? 'ஒவ்வொரு உத்தியும் நீர், தழைச்சத்து மற்றும் லாபத்தில் தனித்துவமான பலனைத் தரும்!' : 'Each strategy impacts water consumption, soil nitrogen bank, and net farm profit!'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {quests.map((q, idx) => {
                const isSelected = idx === selectedQuestIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestIndex(idx);
                      setInQuestSelectMode(false);
                      playSound('chime');
                    }}
                    className={`p-4 rounded-3xl text-left border-2 transition-all active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? `bg-gradient-to-b ${q.color} ring-4 ring-amber-400/50 shadow-2xl scale-[1.02]`
                        : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mb-1.5 ${q.tagColor}`}>
                        {q.badge}
                      </span>
                      <h3 className="font-display font-extrabold text-sm text-stone-100">{q.title}</h3>
                      <p className="text-[11px] font-bold text-amber-300 mt-0.5">{q.crops}</p>
                      <p className="text-[10px] text-stone-300/90 mt-2 leading-relaxed">{q.desc}</p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-cyan-300">💧 +{q.waterSaving}%</span>
                      <span className="text-emerald-300">🌱 {q.nitrogenXP > 0 ? `+${q.nitrogenXP}` : q.nitrogenXP} lbs N</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setInQuestSelectMode(false)}
                className="px-6 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700"
              >
                {isTamil ? 'திரும்பச் செல் (Cancel)' : 'Resume Current Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SYNCHRONIZED TAMIL SUBTITLE RIBBON */}
      <div className="bg-stone-950 px-4 py-2 border-b border-stone-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 truncate">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            {isSpeaking ? (
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-emerald-400 animate-bounce" />
                <span className="w-0.5 bg-emerald-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-0.5 bg-emerald-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </span>
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="text-sm font-display font-extrabold text-emerald-300 truncate">
            "{currentStage.caption}"
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400 flex-shrink-0">
          <span>{currentStage.name}</span>
          <span className="text-amber-400 font-bold">Day {currentStage.day}</span>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE GAME WORLD (SKY + CROPS + SOIL PROFILE) */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-stone-950">
        {/* Top Sky / Atmosphere Layer (60% height) */}
        <div className="relative h-[60%] w-full bg-gradient-to-b from-sky-950 via-sky-900 to-amber-950/40 flex flex-col justify-between p-4 overflow-hidden">
          {/* Animated Sun / Weather */}
          <div className="absolute top-3 right-6 flex items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber-400/90 blur-[2px] shadow-[0_0_50px_rgba(251,191,36,0.9)] animate-pulse" />
              <Sun className="w-12 h-12 text-amber-100 absolute inset-0 m-auto" />
            </div>
          </div>

          {/* Weather status badge in sky */}
          <div className="z-10 flex items-center gap-2">
            <div className="bg-stone-900/80 backdrop-blur px-3 py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentStage.temp}°C வெயில்</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-3 py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentStage.rain} mm மழை</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-3 py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>NDVI {currentStage.ndvi.toFixed(2)} பசுமை</span>
            </div>
          </div>

          {/* Active Rain Animation (if rain > 5mm or irrigating) */}
          {(currentStage.rain > 5 || isIrrigatingAnim) && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-cyan-300/90 w-0.5 h-8 rounded-full animate-fall"
                  style={{
                    left: `${(i * 4.2) + 1}%`,
                    animationDuration: `${0.5 + (i % 5) * 0.1}s`,
                    animationIterationCount: 'infinite'
                  }}
                />
              ))}
            </div>
          )}

          {/* Harvest Coin Shower Animation */}
          {isHarvestAnim && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 flex items-center justify-center">
              <div className="text-center animate-bounce space-y-1">
                <div className="text-4xl">🌾 💰 🏆 💰 🌾</div>
                <div className="font-display font-extrabold text-2xl text-amber-300 bg-stone-950/90 px-6 py-2 rounded-2xl border-2 border-amber-400 shadow-2xl">
                  +₹{currentQuest.profitBonus.toLocaleString()} {isTamil ? 'அறுவடை லாபம்!' : 'Harvest Profit!'}
                </div>
              </div>
            </div>
          )}

          {/* Farmer Avatar (முத்துவேல்) + 4 Interactive Crop Plots */}
          <div className="relative z-10 w-full flex items-end justify-between px-2 sm:px-8 pb-0">
            {/* Animated Farmer Sprite / Avatar */}
            <div className="flex flex-col items-center mr-2 animate-bounce-slow">
              <div className="relative">
                {/* Farmer Hat */}
                <div className="w-8 h-3 bg-amber-600 rounded-t-full border border-amber-400 shadow" />
                {/* Farmer Head */}
                <div className="w-5 h-5 mx-auto bg-amber-200 rounded-full border border-amber-500 shadow-sm flex items-center justify-center text-[10px]">
                  👨🏽‍🌾
                </div>
                {/* Farmer Kurta */}
                <div className="w-6 h-6 mx-auto bg-emerald-700 rounded-lg shadow-sm border border-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">
                  🌾
                </div>
              </div>
              <span className="text-[9px] font-bold text-amber-300 font-mono mt-0.5">முத்துவேல்</span>
            </div>

            {/* 4 Growing Crop Plots */}
            <div className="flex-1 flex justify-around items-end">
              {[...Array(6)].map((_, i) => {
                // Growth scale from NDVI
                const scale = Math.max(0.4, currentStage.ndvi * 1.3);
                const isHarvest = currentStageIdx === currentQuest.stages.length - 1;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center origin-bottom transition-all duration-700"
                    style={{ transform: `scale(${scale})` }}
                  >
                    {isHarvest ? (
                      /* Golden Ripe Grain Heads */
                      <div className="flex gap-1 mb-0.5 animate-pulse">
                        <div className="w-2 h-7 bg-amber-400 rounded-full rotate-[-12deg] shadow" />
                        <div className="w-2 h-8 bg-yellow-400 rounded-full shadow" />
                        <div className="w-2 h-7 bg-amber-400 rounded-full rotate-[12deg] shadow" />
                      </div>
                    ) : (
                      /* Vibrant Green Tillering Foliage */
                      <div className="flex gap-1 mb-0.5">
                        <div className="w-2 h-7 bg-emerald-400 rounded-full rotate-[-20deg] origin-bottom shadow" />
                        <div className="w-2.5 h-8 bg-emerald-500 rounded-full rotate-[-4deg] origin-bottom shadow" />
                        <div className="w-2 h-7 bg-emerald-400 rounded-full rotate-[18deg] origin-bottom shadow" />
                      </div>
                    )}
                    <div className="w-2 h-5 bg-emerald-700 rounded-full" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Soil Cross-Section Layer (40% height) */}
        <div className="relative h-[40%] w-full bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 border-t-4 border-amber-900 p-3 flex flex-col justify-between shadow-inner">
          {/* Surface info row */}
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 font-bold z-10">
            <span className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-0.5 rounded-lg border border-stone-800">
              <span className={`w-2 h-2 rounded-full ${waterTank > 45 ? 'bg-cyan-400 animate-ping' : 'bg-red-500'}`} />
              {isTamil ? 'மண் ஈரப்பதம்:' : 'Moisture:'} <strong className="text-cyan-300">{waterTank}%</strong>
            </span>
            <span className="bg-stone-950/80 px-2.5 py-0.5 rounded-lg border border-stone-800 text-emerald-400 font-bold">
              {isTamil ? 'இயற்கை தழைச்சத்து இருப்பு:' : 'Nitrogen Bank:'} +{nitrogenXP} lbs N/ac
            </span>
          </div>

          {/* Glowing Nitrogen N2 Bubbles from Legume Roots */}
          {currentQuest.legume && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-around overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center animate-pulse"
                  style={{ animationDelay: `${i * 0.25}s` }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/40 border border-emerald-400 text-[10px] font-bold text-emerald-300 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                    N₂
                  </div>
                  <span className="text-[8px] text-emerald-300 font-mono font-bold">+உயிர் உரம்</span>
                </div>
              ))}
            </div>
          )}

          {/* Plant Roots Extending Deep Underground */}
          <div className="flex justify-around items-start w-full opacity-60">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-0.5 h-7 bg-stone-400/80" />
                <div className="flex gap-1.5">
                  <div className="w-0.5 h-4 bg-stone-400/60 rotate-[-25deg]" />
                  <div className="w-0.5 h-4 bg-stone-400/60 rotate-[25deg]" />
                </div>
              </div>
            ))}
          </div>

          {/* Depth Indicators */}
          <div className="flex items-center justify-between text-[9px] font-mono text-stone-500 border-t border-stone-800 pt-1 z-10">
            <span>0 cm (மேல்மண்)</span>
            <span>-50 cm (வேர் மண்டலம்)</span>
            <span>-100 cm (நிலத்தடி நீர்)</span>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM INTERACTIVE GAME CONTROL CONSOLE */}
      <footer className="bg-stone-900 border-t-2 border-stone-800 p-3 sm:p-4 z-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Stage Progression Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {currentQuest.stages.map((stg, sIdx) => {
              const isActive = sIdx === currentStageIdx;
              return (
                <button
                  key={sIdx}
                  onClick={() => {
                    setCurrentStageIdx(sIdx);
                    setWaterTank(stg.moisture);
                    playSound('chime');
                    if (soundEnabled) speak(stg.speech);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 flex-shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md font-extrabold'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  <span>{sIdx + 1}.</span>
                  <span>{stg.name.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Giant Tactile Game Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Action 1: Sowing */}
            <button
              onClick={handleActionSow}
              className="px-3.5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-tactile active:scale-95 transition flex items-center gap-1.5"
              title="விதை விதை"
            >
              <Sprout className="w-4 h-4 text-emerald-200" />
              <span>{isTamil ? 'விதை' : 'Plant'}</span>
            </button>

            {/* Action 2: Irrigate */}
            <button
              onClick={handleActionIrrigate}
              className="px-3.5 py-2.5 rounded-2xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold shadow-tactile active:scale-95 transition flex items-center gap-1.5"
              title="நீர் பாய்ச்சு"
            >
              <Droplets className="w-4 h-4 text-cyan-200" />
              <span>{isTamil ? 'நீர் பாய்ச்சு' : 'Irrigate'}</span>
            </button>

            {/* Action 3: Bio-Fertilize */}
            <button
              onClick={handleActionBioFertilize}
              className="px-3.5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-tactile active:scale-95 transition flex items-center gap-1.5"
              title="உயிர் உரம்"
            >
              <Leaf className="w-4 h-4 text-teal-200" />
              <span>{isTamil ? 'உயிர் உரம்' : 'Bio-N'}</span>
            </button>

            {/* Action 4: Advance / Harvest */}
            <button
              onClick={handleActionAdvance}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-tactile active:scale-95 transition flex items-center gap-1.5 ring-2 ring-amber-300"
            >
              {currentStageIdx === currentQuest.stages.length - 1 ? (
                <>
                  <Award className="w-4 h-4 fill-current" />
                  <span>{isTamil ? 'அறுவடை செய்!' : 'Harvest!'}</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>{isTamil ? 'அடுத்த பருவம்' : 'Next Stage'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
