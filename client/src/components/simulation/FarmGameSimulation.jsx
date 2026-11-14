import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../../context/VoiceContext';
import { useField } from '../../context/FieldContext';
import { 
  Play, Pause, RotateCcw, X, Volume2, VolumeX, Droplets, 
  Sparkles, Sun, CloudRain, ShieldAlert, Award, ArrowRight, 
  CheckCircle2, Coins, Sprout, Leaf, Zap, RefreshCw, Trophy,
  Sliders, Flame, Shield, TrendingUp, TrendingDown, Calendar,
  SunMedium, Beaker
} from 'lucide-react';

/**
 * FarmGameSimulation
 * Full-screen, game-like agricultural simulation for farmers:
 * - 1-Click Full Screen Game Launch
 * - Choose Strategy Quests with live scores & delta increase/decrease badges
 * - Month-by-Month Growth Controller (June to November)
 * - 5 Interactive Sliders for all factors affecting crops (Temp, Rain, Soil Water, Fertilizer, Sunlight)
 * - Real-time visual crop physics (sprout -> tillering -> flowering -> legume nodules -> golden harvest)
 * - Tamil Voice+ narration speaking directly with the farmer
 */
export default function FarmGameSimulation({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { speak, stopSpeaking, isSpeaking, playSound } = useVoice();
  const { currentFieldId, profile } = useField();

  const isTamil = i18n.language === 'ta';

  // 6 Growth Months (June to November in Tamil Nadu Cauvery Delta)
  const months = [
    {
      monthNum: 1,
      name: isTamil ? 'ஜூன் (June)' : 'June',
      stageName: isTamil ? 'விதைப்பு & நாற்றுப் பருவம்' : 'Sowing & Germination',
      day: 15,
      baseNdvi: 0.28,
      baseTemp: 32,
      baseRain: 12,
      baseMoisture: 65,
      caption: isTamil 
        ? 'ஜூன்: விதைப்பு மற்றும் நாற்றுப் பருவம். இளம் முளைகள் மண்ணில் துளிர்க்கின்றன.' 
        : 'June: Sowing & germination phase. Seedlings emerging.',
      speech: isTamil
        ? 'ஜூன் மாதம்: விதைப்பு பருவம். விதைகளை நடவு செய்ய மண்ணின் ஈரப்பதம் போதுமானதாக உள்ளது.'
        : 'June: Sowing phase. Soil moisture is adequate for seed transplantation.'
    },
    {
      monthNum: 2,
      name: isTamil ? 'ஜூலை (July)' : 'July',
      stageName: isTamil ? 'ஆரம்ப வேர் வளர்ச்சி' : 'Early Vegetative Growth',
      day: 45,
      baseNdvi: 0.55,
      baseTemp: 33,
      baseRain: 8,
      baseMoisture: 60,
      caption: isTamil 
        ? 'ஜூலை: பயிர்கள் வேர்விட்டு பச்சை நிறமாக வளர்கின்றன. தழைச்சத்து தேவைப்படுகிறது.' 
        : 'July: Early vegetative development and initial tillering.',
      speech: isTamil
        ? 'ஜூலை மாதம்: பயிர்கள் நன்றாக வேர்விட்டு பச்சையாக வளர்கின்றன. தேவையான நீர் மேலாண்மை செய்ய வேண்டும்.'
        : 'July: Vigorous root anchoring and leaf emergence.'
    },
    {
      monthNum: 3,
      name: isTamil ? 'ஆகஸ்ட் (August)' : 'August',
      stageName: isTamil ? 'தீவிர தூர்கட்டும் பருவம்' : 'Active Tillering & Canopy',
      day: 75,
      baseNdvi: 0.78,
      baseTemp: 31,
      baseRain: 22,
      baseMoisture: 72,
      caption: isTamil 
        ? 'ஆகஸ்ட்: நெற்பயிர்கள் அடர்த்தியாக தூர்கட்டி பசுமை உச்சத்தை எட்டுகின்றன (NDVI 0.78).' 
        : 'August: Peak tillering and full canopy greenness (NDVI 0.78).',
      speech: isTamil
        ? 'ஆகஸ்ட் மாதம்: பயிர் செழிப்பாக தூர்கட்டியுள்ளது! செயற்கைக்கோள் பசுமை குறியீடு 0.78 ஆக உயர்வு.'
        : 'August: Maximum tillering with high satellite greenness index.'
    },
    {
      monthNum: 4,
      name: isTamil ? 'செப்டம்பர் (September)' : 'September',
      stageName: isTamil ? 'கதிர் வருதல் & பூக்கும் பருவம்' : 'Panicle Initiation & Flowering',
      day: 105,
      baseNdvi: 0.82,
      baseTemp: 29,
      baseRain: 35,
      baseMoisture: 76,
      caption: isTamil 
        ? 'செப்டம்பர்: நெற்கதிர்கள் தோன்றி பூ பூக்கும் பருவம். நீர் தட்டுப்பாடு இல்லாமல் பாதுகாக்க வேண்டும்.' 
        : 'September: Panicle emergence and flowering. Sensitive to drought stress.',
      speech: isTamil
        ? 'செப்டம்பர் மாதம்: கதிர் வரும் பருவம். இந்த நேரத்தில் நீர் குறைவு ஏற்பட்டால் விளைச்சல் பாதிக்கப்படும்!'
        : 'September: Flowering phase. Adequate moisture is crucial for grain setting.'
    },
    {
      monthNum: 5,
      name: isTamil ? 'அக்டோபர் (October)' : 'October',
      stageName: isTamil ? 'பால் பிடித்தல் & உளுந்து சுழற்சி' : 'Grain Filling & Legume Nodules',
      day: 140,
      baseNdvi: 0.65,
      baseTemp: 28,
      baseRain: 26,
      baseMoisture: 70,
      caption: isTamil 
        ? 'அக்டோபர்: நெல் பால் பிடித்து முதிர்கிறது. உளுந்து சுழற்சி வேர் முடிச்சுகள் தழைச்சத்தை கூட்டுகின்றன.' 
        : 'October: Grain filling; Legume crop fixes nitrogen in root nodules.',
      speech: isTamil
        ? 'அக்டோபர் மாதம்: தானியங்கள் பால் பிடிக்கின்றன. உளுந்து சுழற்சியால் நிலத்தில் இயற்கை தழைச்சத்து சேர்கிறது!'
        : 'October: Grain filling while legume nodules recharge the soil nitrogen bank.'
    },
    {
      monthNum: 6,
      name: isTamil ? 'நவம்பர் (November)' : 'November',
      stageName: isTamil ? 'பொன்னிற முதிர்ச்சி & அறுவடை' : 'Maturity & Golden Harvest',
      day: 175,
      baseNdvi: 0.45,
      baseTemp: 27,
      baseRain: 12,
      baseMoisture: 58,
      caption: isTamil 
        ? 'நவம்பர்: கதிர்கள் பொன்னிறமாக முதிர்ந்துள்ளன! லாபகரமான அறுவடைக்கு தயாராக உள்ளது.' 
        : 'November: Crops fully golden ripe! Bountiful harvest achieved.',
      speech: isTamil
        ? 'நவம்பர் மாதம்: அறுவடை பருவம்! பொன்னிற கதிர்கள் முதிர்ந்து அறுவடைக்கு தயாராக உள்ளன.'
        : 'November: Harvest time! Crops are golden and ready for harvesting.'
    }
  ];

  // 3 Primary Rotation Strategies
  const quests = [
    {
      id: 'quest_cauvery_smart',
      title: isTamil ? 'காவிரி ஸ்மார்ட் சுழற்சி' : 'Climate-Smart Cauvery',
      badge: isTamil ? 'பரிந்துரைக்கப்பட்டது (Best Choice)' : 'Recommended',
      crops: isTamil ? 'குறுவை நெல் ➔ உளுந்து ➔ எள்' : 'Kuruvai Paddy ➔ Black Gram ➔ Sesame',
      desc: isTamil 
        ? '42% நீர் சேமிப்பு, +45 lbs இயற்கை தழைச்சத்து வரவு. வறட்சியை தாங்கும் அதிக லாப உத்தி!'
        : 'Saves 42% water, adds +45 lbs biological nitrogen. High profit drought-smart rotation!',
      baseScore: 88,
      baseYield: 90,
      baseWater: 92,
      baseSoil: 88,
      baseProfit: 54000,
      droughtTolerance: 'high',
      heatTolerance: 'high',
      color: 'from-emerald-600 to-teal-700 border-emerald-400',
      tagColor: 'bg-emerald-500 text-stone-950',
      legume: true
    },
    {
      id: 'quest_soil_rejuvenate',
      title: isTamil ? 'இயற்கை மண்வள உத்தி' : 'Organic Soil Rejuvenation',
      badge: isTamil ? 'அதிகபட்ச மண் வளம் (Max Soil Health)' : 'Max Soil XP',
      crops: isTamil ? 'தக்கைப்பூண்டு ➔ சம்பா நெல் ➔ நிலக்கடலை' : 'Sunn Hemp ➔ Samba Paddy ➔ Groundnut',
      desc: isTamil 
        ? 'தக்கைப்பூண்டு பசுந்தாள் உரம் மூலம் +60 lbs தழைச்சத்து. நிலத்தின் இயற்கை நுண்ணுயிர் வளம் இருமடங்காகும்!'
        : 'Sunn Hemp green manuring provides +60 lbs nitrogen, doubling soil microbial organic health!',
      baseScore: 85,
      baseYield: 86,
      baseWater: 84,
      baseSoil: 96,
      baseProfit: 58000,
      droughtTolerance: 'high',
      heatTolerance: 'very_high',
      color: 'from-cyan-600 to-blue-800 border-cyan-400',
      tagColor: 'bg-cyan-400 text-stone-950',
      legume: true
    },
    {
      id: 'quest_traditional_risk',
      title: isTamil ? 'பாரம்பரிய தீவிர நெல்' : 'Traditional Double Paddy',
      badge: isTamil ? 'வறட்சி ஆபத்து (Drought Risk)' : 'High Water Risk',
      crops: isTamil ? 'குறுவை நெல் ➔ தாளடி நெல் ➔ தரிசு' : 'Kuruvai Paddy ➔ Thaladi Paddy ➔ Fallow',
      desc: isTamil 
        ? 'தொடர் நெல் சாகுபடியால் நிலத்தடி நீர் மற்றும் தழைச்சத்து குறையும். வறட்சி வந்தால் நஷ்டம் ஏற்படும் அபாயம்.'
        : 'Double paddy causes continuous groundwater depletion and -65 lbs nitrogen deficit.',
      baseScore: 68,
      baseYield: 82,
      baseWater: 38,
      baseSoil: 45,
      baseProfit: 36000,
      droughtTolerance: 'low',
      heatTolerance: 'low',
      color: 'from-amber-700 to-orange-900 border-amber-500',
      tagColor: 'bg-amber-400 text-stone-950',
      legume: false
    }
  ];

  // Game Engine State
  const [selectedQuestIndex, setSelectedQuestIndex] = useState(0);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0); // 0 to 5 (Month 1 to 6)
  const [inQuestSelectMode, setInQuestSelectMode] = useState(false);
  const [showFactorsConsole, setShowFactorsConsole] = useState(true);
  const [coins, setCoins] = useState(25000);
  const [isHarvestAnim, setIsHarvestAnim] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 5 Interactive Sliders for Factors Affecting Crops
  const [tempDelta, setTempDelta] = useState(0); // -5 to +8 °C
  const [rainDelta, setRainDelta] = useState(0); // -60% to +60%
  const [soilWaterDelta, setSoilWaterDelta] = useState(0); // -40% to +40%
  const [fertilizerDelta, setFertilizerDelta] = useState(0); // -40% to +50% N input
  const [solarDelta, setSolarDelta] = useState(0); // -30% to +30% Sunlight

  const currentQuest = quests[selectedQuestIndex];
  const currentMonth = months[currentMonthIdx];

  // Effective environment calculations based on selected month + sliders
  const effectiveTemp = Math.round(currentMonth.baseTemp + tempDelta);
  const effectiveRain = Math.max(0, Math.round(currentMonth.baseRain * (1 + rainDelta / 100)));
  const effectiveMoisture = Math.min(98, Math.max(15, Math.round(currentMonth.baseMoisture + soilWaterDelta)));
  const effectiveFertilizer = 100 + fertilizerDelta; // percentage of baseline
  const effectiveSunlight = 100 + solarDelta;

  // Real-Time Scoring Algorithm with Strategy Tolerance
  const calculateScores = () => {
    // 1. Temperature Impact
    let tempPenalty = 0;
    if (tempDelta > 0) {
      tempPenalty = currentQuest.heatTolerance === 'very_high' 
        ? -tempDelta * 1.0 
        : currentQuest.heatTolerance === 'high' 
          ? -tempDelta * 1.6 
          : -tempDelta * 3.8;
    } else if (tempDelta < -2) {
      tempPenalty = tempDelta * 1.2;
    }

    // 2. Rainfall & Drought Impact
    let rainPenalty = 0;
    if (rainDelta < 0) {
      rainPenalty = currentQuest.droughtTolerance === 'high'
        ? (rainDelta / 10) * 1.3
        : (rainDelta / 10) * 4.2;
    } else if (rainDelta > 40) {
      rainPenalty = -((rainDelta - 40) / 10) * 1.5; // slight waterlogging
    }

    // 3. Soil Moisture Impact
    let moisturePenalty = 0;
    if (effectiveMoisture < 35) {
      moisturePenalty = currentQuest.droughtTolerance === 'high' 
        ? -((35 - effectiveMoisture) * 0.7)
        : -((35 - effectiveMoisture) * 1.8);
    } else if (effectiveMoisture >= 55 && effectiveMoisture <= 75) {
      moisturePenalty = 4; // bonus for optimal water
    }

    // 4. Fertilizer Input Impact
    let fertScore = (fertilizerDelta / 10) * 1.5;
    let soilHealthFertImpact = fertilizerDelta > 30 ? -4 : (fertilizerDelta * 0.2);

    // 5. Sunlight Impact
    let solarScore = (solarDelta / 10) * 1.2;

    // Totals
    const overallScore = Math.min(100, Math.max(15, Math.round(
      currentQuest.baseScore + tempPenalty + rainPenalty + moisturePenalty + fertScore + solarScore
    )));
    const yieldScore = Math.min(100, Math.max(20, Math.round(
      currentQuest.baseYield + (tempPenalty * 0.8) + (rainPenalty * 0.9) + (moisturePenalty * 0.9) + fertScore
    )));
    const waterScore = Math.min(100, Math.max(10, Math.round(
      currentQuest.baseWater + (rainDelta > 0 ? 5 : (rainDelta / 10) * 2) - (tempDelta > 2 ? 6 : 0)
    )));
    const soilScore = Math.min(100, Math.max(15, Math.round(
      currentQuest.baseSoil + (currentQuest.legume ? 8 : -8) + soilHealthFertImpact
    )));

    // Net Profit based on performance
    const profitRatio = overallScore / currentQuest.baseScore;
    const netProfit = Math.max(8000, Math.round(currentQuest.baseProfit * profitRatio));

    return {
      overallScore,
      scoreDelta: overallScore - currentQuest.baseScore,
      yieldScore,
      yieldDelta: yieldScore - currentQuest.baseYield,
      waterScore,
      waterDelta: waterScore - currentQuest.baseWater,
      soilScore,
      soilDelta: soilScore - currentQuest.baseSoil,
      netProfit,
      profitDelta: netProfit - currentQuest.baseProfit
    };
  };

  const scores = calculateScores();

  // Voice narration when month or strategy changes
  useEffect(() => {
    if (isOpen && soundEnabled) {
      const speech = isTamil 
        ? `${currentMonth.name} மாதம்: ${currentMonth.stageName}. தற்போதைய காரணிகளால் உத்தி மதிப்பெண் ${scores.overallScore} புள்ளிகள்.`
        : `${currentMonth.name}: ${currentMonth.stageName}. Current strategy score is ${scores.overallScore}.`;
      speak(speech);
    }
  }, [isOpen, currentMonthIdx, selectedQuestIndex]);

  if (!isOpen) return null;

  // Month change handler
  const handleMonthChange = (idx) => {
    playSound('chime');
    setCurrentMonthIdx(idx);
  };

  // Reset all factors to normal NASA baseline
  const handleResetFactors = () => {
    playSound('chime');
    setTempDelta(0);
    setRainDelta(0);
    setSoilWaterDelta(0);
    setFertilizerDelta(0);
    setSolarDelta(0);
    const msg = isTamil ? 'அனைத்து காரணிகளும் இயல்பு நிலைக்கு மாற்றப்பட்டன.' : 'All factors reset to NASA baseline.';
    if (soundEnabled) speak(msg);
  };

  // Quick Climate Shock Presets
  const applyPreset = (type) => {
    playSound('chime');
    if (type === 'heatwave') {
      setTempDelta(4.0);
      setRainDelta(-30);
      setSoilWaterDelta(-25);
      const msg = isTamil 
        ? 'வெப்ப அலை உருவகப்படுத்தப்பட்டது! வெப்பநிலை 4 டிகிரி அதிகரித்துள்ளது.'
        : 'Heatwave shock applied! Temperature +4°C.';
      if (soundEnabled) speak(msg);
    } else if (type === 'drought') {
      setTempDelta(2.5);
      setRainDelta(-55);
      setSoilWaterDelta(-35);
      const msg = isTamil 
        ? 'கடும் வறட்சி! மழைப்பொழிவு 55% குறைந்துள்ளது. பயிர் தாங்குதிறனை பரிசோதிக்கவும்!'
        : 'Severe drought! Rainfall dropped by 55%.';
      if (soundEnabled) speak(msg);
    } else if (type === 'flood') {
      setTempDelta(-2.0);
      setRainDelta(55);
      setSoilWaterDelta(35);
      const msg = isTamil 
        ? 'கனமழை வெள்ளம்! மழைப்பொழிவு 55% அதிகரித்துள்ளது.'
        : 'Heavy rain & flood shock applied!';
      if (soundEnabled) speak(msg);
    }
  };

  // Announce Status in Tamil
  const handleSpeakAssessment = () => {
    let report = isTamil
      ? `${currentMonth.name} மாத நிலை அறிக்கை: வெப்பநிலை ${effectiveTemp} டிகிரி, மழை ${effectiveRain} மி.மீ, மண் ஈரம் ${effectiveMoisture} சதவீதம். `
      : `${currentMonth.name} status report: Temp ${effectiveTemp} degrees, rain ${effectiveRain} mm, soil water ${effectiveMoisture} percent. `;

    report += isTamil 
      ? `உத்தி மதிப்பெண் ${scores.overallScore} புள்ளிகள். ${scores.scoreDelta >= 0 ? `மதிப்பெண் ${scores.scoreDelta} புள்ளிகள் உயர்ந்துள்ளது!` : `மதிப்பெண் ${Math.abs(scores.scoreDelta)} புள்ளிகள் குறைந்துள்ளது!`} `
      : `Strategy score is ${scores.overallScore}. `;

    if (effectiveMoisture < 35 && currentQuest.droughtTolerance === 'high') {
      report += isTamil ? 'உளுந்து மற்றும் எள் பயிர்களின் ஆழமான வேர்கள் வறட்சியை தாங்கி நிற்கின்றன!' : 'Legume roots withstand drought!';
    } else if (effectiveMoisture < 35) {
      report += isTamil ? 'எச்சரிக்கை! பாரம்பரிய நெற்பயிர் நீர் தட்டுப்பாட்டால் கருகுகிறது!' : 'Warning! Traditional paddy is suffering drought!';
    } else {
      report += isTamil ? 'பயிர்கள் செழிப்பான பசுமையுடன் வளர்கின்றன.' : 'Crops are healthy and vigorous.';
    }

    if (soundEnabled) speak(report);
  };

  // Harvest Action
  const handleHarvestAction = () => {
    playSound('harvest');
    setIsHarvestAnim(true);
    setTimeout(() => setIsHarvestAnim(false), 3000);
    setCoins((prev) => prev + scores.netProfit);
    const winMsg = isTamil 
      ? `அறுவடை வெற்றி! ₹${scores.netProfit.toLocaleString()} லாபம் கிடைத்துள்ளது!` 
      : `Harvest victory! Earned ₹${scores.netProfit.toLocaleString()} profit!`;
    if (soundEnabled) speak(winMsg);
  };

  // Toggle Audio
  const toggleSound = () => {
    if (soundEnabled) {
      stopSpeaking();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      handleSpeakAssessment();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-300">
      {/* 1. TOP GAME HUD (Scores + Live Deltas) */}
      <header className="bg-stone-900/95 backdrop-blur border-b-2 border-stone-800 px-3 py-2 flex items-center justify-between z-20 shadow-xl">
        {/* Title & Quest Switcher */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-sm flex-shrink-0">
            <Trophy className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-display font-extrabold text-amber-400">
                {isTamil ? 'விவசாய விளையாட்டு மாதிரி' : 'Farm Simulation Game'}
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                NASA Live
              </span>
            </div>
            <div className="text-[11px] font-semibold text-stone-400 flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none">
              <span>{isTamil ? 'உத்தி:' : 'Quest:'} <strong className="text-emerald-300">{currentQuest.title}</strong></span>
              <button
                onClick={() => setInQuestSelectMode(!inQuestSelectMode)}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold"
              >
                [{isTamil ? 'உத்தியை மாற்று' : 'Change'}]
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Score Cards with Green/Red Increase/Decrease Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Overall Strategy Score with Delta */}
          <div className="bg-stone-950 px-2.5 py-1 rounded-xl border border-amber-400/50 flex items-center gap-2 shadow">
            <Award className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[9px] text-stone-400 font-bold uppercase">{isTamil ? 'மதிப்பெண்' : 'Score'}</div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono font-extrabold text-stone-100">{scores.overallScore}</span>
                <span className={`text-[10px] font-mono font-bold px-1 rounded ${
                  scores.scoreDelta >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {scores.scoreDelta >= 0 ? `+${scores.scoreDelta}` : scores.scoreDelta}
                </span>
              </div>
            </div>
          </div>

          {/* Net Profit with Delta */}
          <div className="bg-stone-950 px-2.5 py-1 rounded-xl border border-emerald-500/40 flex items-center gap-2 shadow">
            <Coins className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <div>
              <div className="text-[9px] text-stone-400 font-bold uppercase">{isTamil ? 'லாபம்' : 'Profit'}</div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-extrabold text-amber-300">₹{scores.netProfit.toLocaleString()}</span>
                <span className={`text-[9px] font-mono font-bold px-1 rounded ${
                  scores.profitDelta >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {scores.profitDelta >= 0 ? `+₹${scores.profitDelta}` : `₹${scores.profitDelta}`}
                </span>
              </div>
            </div>
          </div>

          {/* Factors Console Toggle */}
          <button
            onClick={() => setShowFactorsConsole(!showFactorsConsole)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              showFactorsConsole
                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md'
                : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
            }`}
            title="காரணிகள் ஸ்லைடர் / Environmental Sliders"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{isTamil ? 'காரணிகள் ஸ்லைடர்' : 'Factors Sliders'}</span>
          </button>

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

      {/* 2. MONTH-BY-MONTH TIMELINE CONTROLLER (June to November) */}
      <div className="bg-stone-900 px-3 py-2 border-b border-stone-800 z-10 shadow-md">
        <div className="max-w-4xl mx-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-stone-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Calendar className="w-4 h-4" />
              <span>{isTamil ? 'பருவ வளர்ச்சி மாதம் (Month Controller):' : 'Crop Growth Month:'}</span>
              <strong className="text-stone-100 bg-stone-950 px-2 py-0.5 rounded-md border border-stone-800">
                {currentMonth.name} — {currentMonth.stageName} (Day {currentMonth.day})
              </strong>
            </span>
            <button
              onClick={handleSpeakAssessment}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isTamil ? '🗣️ தமிழில் கேள்' : 'Listen Status'}</span>
            </button>
          </div>

          {/* Month Slider & Discrete Steps */}
          <div className="relative pt-1 pb-1">
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={currentMonthIdx}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-2.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-stone-400 pt-1">
              {months.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMonthChange(idx)}
                  className={`text-center font-bold transition ${
                    idx === currentMonthIdx ? 'text-amber-400 scale-110' : 'hover:text-stone-200'
                  }`}
                >
                  <div>M{idx + 1}</div>
                  <div className="text-[9px]">{m.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 5 FACTOR SLIDERS CONSOLE (Affecting Crop Growth) */}
      {showFactorsConsole && (
        <div className="bg-stone-900/98 border-b-2 border-amber-500/40 p-3 sm:p-4 z-30 shadow-2xl animate-in slide-in-from-top-4 overflow-y-auto max-h-[35vh]">
          <div className="max-w-4xl mx-auto space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-display font-extrabold text-amber-400">
                  {isTamil ? 'பயிரைப் பாதிக்கும் காரணிகள் (5 Factor Sliders)' : '5 Crop Affecting Factor Sliders'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Quick Shocks */}
                <button
                  onClick={() => applyPreset('heatwave')}
                  className="px-2 py-0.5 rounded-lg bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-bold"
                >
                  ☀️ வெப்ப அலை
                </button>
                <button
                  onClick={() => applyPreset('drought')}
                  className="px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-bold"
                >
                  🌵 வறட்சி
                </button>
                <button
                  onClick={() => applyPreset('flood')}
                  className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold"
                >
                  ⛈️ கனமழை
                </button>
                <button
                  onClick={handleResetFactors}
                  className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 text-[10px] font-bold border border-stone-700"
                >
                  <RotateCcw className="w-3 h-3 inline mr-0.5" />
                  {isTamil ? 'இயல்பு' : 'Reset'}
                </button>
              </div>
            </div>

            {/* The 5 Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {/* Factor 1: Temperature */}
              <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-300 text-[11px] flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    {isTamil ? 'வெப்பநிலை' : 'Temp'}
                  </span>
                  <span className="font-mono text-amber-300 font-extrabold text-xs">
                    {effectiveTemp}°C ({tempDelta > 0 ? `+${tempDelta}` : tempDelta})
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="8"
                  step="0.5"
                  value={tempDelta}
                  onChange={(e) => {
                    setTempDelta(parseFloat(e.target.value));
                    playSound('chime');
                  }}
                  className="w-full accent-amber-500 h-2 bg-stone-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-stone-500">
                  <span>-5°C</span>
                  <span>0°C</span>
                  <span>+8°C</span>
                </div>
              </div>

              {/* Factor 2: Rainfall */}
              <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-300 text-[11px] flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    {isTamil ? 'மழைப்பொழிவு' : 'Rain'}
                  </span>
                  <span className="font-mono text-cyan-300 font-extrabold text-xs">
                    {effectiveRain}mm ({rainDelta > 0 ? `+${rainDelta}` : rainDelta}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="5"
                  value={rainDelta}
                  onChange={(e) => {
                    setRainDelta(parseFloat(e.target.value));
                    playSound('chime');
                  }}
                  className="w-full accent-cyan-500 h-2 bg-stone-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-stone-500">
                  <span>-60%</span>
                  <span>0%</span>
                  <span>+60%</span>
                </div>
              </div>

              {/* Factor 3: Soil Water Available */}
              <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-300 text-[11px] flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-teal-400" />
                    {isTamil ? 'மண் ஈரம்' : 'Moisture'}
                  </span>
                  <span className="font-mono text-teal-300 font-extrabold text-xs">
                    {effectiveMoisture}% ({soilWaterDelta > 0 ? `+${soilWaterDelta}` : soilWaterDelta}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="5"
                  value={soilWaterDelta}
                  onChange={(e) => {
                    setSoilWaterDelta(parseFloat(e.target.value));
                    playSound('chime');
                  }}
                  className="w-full accent-teal-500 h-2 bg-stone-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-stone-500">
                  <span>-40%</span>
                  <span>0%</span>
                  <span>+40%</span>
                </div>
              </div>

              {/* Factor 4: Fertilizer / Nitrogen Input */}
              <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-300 text-[11px] flex items-center gap-1">
                    <Beaker className="w-3.5 h-3.5 text-emerald-400" />
                    {isTamil ? 'உர அளவு (N)' : 'Fertilizer'}
                  </span>
                  <span className="font-mono text-emerald-300 font-extrabold text-xs">
                    {effectiveFertilizer}% ({fertilizerDelta > 0 ? `+${fertilizerDelta}` : fertilizerDelta}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="50"
                  step="5"
                  value={fertilizerDelta}
                  onChange={(e) => {
                    setFertilizerDelta(parseFloat(e.target.value));
                    playSound('chime');
                  }}
                  className="w-full accent-emerald-500 h-2 bg-stone-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-stone-500">
                  <span>-40%</span>
                  <span>0%</span>
                  <span>+50%</span>
                </div>
              </div>

              {/* Factor 5: Solar Radiation / Sunlight */}
              <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-300 text-[11px] flex items-center gap-1">
                    <SunMedium className="w-3.5 h-3.5 text-yellow-400" />
                    {isTamil ? 'சூரிய ஒளி' : 'Sunlight'}
                  </span>
                  <span className="font-mono text-yellow-300 font-extrabold text-xs">
                    {effectiveSunlight}% ({solarDelta > 0 ? `+${solarDelta}` : solarDelta}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="5"
                  value={solarDelta}
                  onChange={(e) => {
                    setSolarDelta(parseFloat(e.target.value));
                    playSound('chime');
                  }}
                  className="w-full accent-yellow-500 h-2 bg-stone-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-stone-500">
                  <span>-30%</span>
                  <span>0%</span>
                  <span>+30%</span>
                </div>
              </div>
            </div>

            {/* Real-Time Breakdown Chips */}
            <div className="bg-stone-950/90 p-2 rounded-xl border border-stone-800 flex items-center justify-around text-[11px] font-mono font-bold">
              <span className="text-stone-300">
                {isTamil ? 'விளைச்சல்:' : 'Yield:'} <strong className="text-emerald-400">{scores.yieldScore}%</strong> ({scores.yieldDelta >= 0 ? `+${scores.yieldDelta}` : scores.yieldDelta})
              </span>
              <span className="text-stone-300">
                {isTamil ? 'நீர் சேமிப்பு:' : 'Water:'} <strong className="text-cyan-400">{scores.waterScore}%</strong> ({scores.waterDelta >= 0 ? `+${scores.waterDelta}` : scores.waterDelta})
              </span>
              <span className="text-stone-300">
                {isTamil ? 'மண் வளம்:' : 'Soil:'} <strong className="text-teal-400">{scores.soilScore}%</strong> ({scores.soilDelta >= 0 ? `+${scores.soilDelta}` : scores.soilDelta})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUEST / STRATEGY SELECTION OVERLAY (If Clicked) */}
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
                {isTamil ? 'ஒவ்வொரு உத்தியின் மதிப்பெண் மற்றும் விளைச்சல் மாற்றங்களை நேரடியாகக் காணுங்கள்!' : 'Observe how scores adapt dynamically for each strategy under current conditions!'}
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
                      <span className="text-stone-100">Score: {q.baseScore}</span>
                      <span className="text-amber-300 font-bold">₹{q.baseProfit.toLocaleString()}</span>
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

      {/* 5. SYNCHRONIZED TAMIL SUBTITLE RIBBON */}
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
            "{currentMonth.caption}"
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400 flex-shrink-0">
          <span>{currentMonth.name}</span>
          <span className="text-amber-400 font-bold">Day {currentMonth.day}</span>
        </div>
      </div>

      {/* 6. MAIN INTERACTIVE GAME WORLD (SKY + CROPS ACCORDING TO MONTH & FACTORS + SOIL) */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-stone-950">
        {/* Dynamic Sky & Weather Layer */}
        <div className={`relative h-[60%] w-full transition-colors duration-700 ${
          effectiveTemp > 34 
            ? 'bg-gradient-to-b from-orange-950 via-red-950/70 to-amber-950/50' 
            : 'bg-gradient-to-b from-sky-950 via-sky-900 to-amber-950/40'
        } flex flex-col justify-between p-4 overflow-hidden`}>
          {/* Animated Sun / Heatwave Shimmer */}
          <div className="absolute top-3 right-6 flex items-center gap-3">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full blur-[2px] animate-pulse ${
                effectiveTemp > 34 
                  ? 'bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.9)]' 
                  : 'bg-amber-400/90 shadow-[0_0_50px_rgba(251,191,36,0.9)]'
              }`} />
              <Sun className={`w-12 h-12 absolute inset-0 m-auto ${
                effectiveTemp > 34 ? 'text-orange-100' : 'text-amber-100'
              }`} />
            </div>
          </div>

          {/* Dynamic Weather Badges in Sky */}
          <div className="z-10 flex items-center gap-2 flex-wrap">
            <div className={`backdrop-blur px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow ${
              effectiveTemp > 34 
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse' 
                : 'bg-stone-900/80 border-stone-700/80 text-amber-300'
            }`}>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{effectiveTemp}°C</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-3 py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>{effectiveRain} mm மழை</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-3 py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>NDVI {currentMonth.baseNdvi.toFixed(2)}</span>
            </div>
          </div>

          {/* Active Rain Droplets Animation */}
          {effectiveRain > 6 && (
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
                  +₹{scores.netProfit.toLocaleString()} {isTamil ? 'அறுவடை லாபம்!' : 'Harvest Profit!'}
                </div>
              </div>
            </div>
          )}

          {/* Farmer Avatar (முத்துவேல்) + Dynamic Crop Growth According to Month */}
          <div className="relative z-10 w-full flex items-end justify-between px-2 sm:px-8 pb-0">
            {/* Animated Farmer Avatar */}
            <div className="flex flex-col items-center mr-2 animate-bounce-slow">
              <div className="relative">
                <div className="w-8 h-3 bg-amber-600 rounded-t-full border border-amber-400 shadow" />
                <div className="w-5 h-5 mx-auto bg-amber-200 rounded-full border border-amber-500 shadow-sm flex items-center justify-center text-[10px]">
                  👨🏽‍🌾
                </div>
                <div className="w-6 h-6 mx-auto bg-emerald-700 rounded-lg shadow-sm border border-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">
                  🌾
                </div>
              </div>
              <span className="text-[9px] font-bold text-amber-300 font-mono mt-0.5">முத்துவேல்</span>
            </div>

            {/* 6 Growing Crop Plots Scaling & Morphing with Month (1 to 6) */}
            <div className="flex-1 flex justify-around items-end">
              {[...Array(6)].map((_, i) => {
                // Month scale: M1=0.35, M2=0.6, M3=0.85, M4=1.05, M5=1.1, M6=1.15
                const monthScales = [0.35, 0.6, 0.85, 1.05, 1.1, 1.15];
                const scale = monthScales[currentMonthIdx];
                const isHarvestMonth = currentMonthIdx === 5;
                const isWilting = effectiveMoisture < 30 && currentQuest.droughtTolerance !== 'high';
                
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center origin-bottom transition-all duration-700"
                    style={{ 
                      transform: `scale(${scale}) ${isWilting ? 'rotate(18deg) scaleY(0.75)' : ''}` 
                    }}
                  >
                    {isHarvestMonth ? (
                      /* Golden Ripe Grain Heads */
                      <div className="flex gap-1 mb-0.5 animate-pulse">
                        <div className="w-2 h-7 bg-amber-400 rounded-full rotate-[-12deg] shadow" />
                        <div className="w-2 h-8 bg-yellow-400 rounded-full shadow" />
                        <div className="w-2 h-7 bg-amber-400 rounded-full rotate-[12deg] shadow" />
                      </div>
                    ) : isWilting ? (
                      /* Wilting Dry Stalks under drought */
                      <div className="flex gap-1 mb-0.5 opacity-80">
                        <div className="w-2 h-5 bg-amber-600 rounded-full rotate-[-35deg] origin-bottom shadow" />
                        <div className="w-2 h-6 bg-yellow-700 rounded-full rotate-[-10deg] origin-bottom shadow" />
                      </div>
                    ) : currentMonthIdx === 0 ? (
                      /* Month 1: Tiny Green Sprouts */
                      <div className="flex gap-1 mb-0.5">
                        <div className="w-1.5 h-3 bg-emerald-400 rounded-full rotate-[-15deg] origin-bottom shadow" />
                        <div className="w-1.5 h-3 bg-emerald-500 rounded-full rotate-[15deg] origin-bottom shadow" />
                      </div>
                    ) : (
                      /* Vibrant Green Tillering / Flowering Foliage */
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
        <div className={`relative h-[40%] w-full transition-colors duration-700 ${
          effectiveMoisture < 30 
            ? 'bg-gradient-to-b from-amber-900 via-yellow-950 to-stone-900 border-amber-800' 
            : effectiveMoisture > 75 
              ? 'bg-gradient-to-b from-teal-950 via-stone-900 to-stone-950 border-cyan-700' 
              : 'bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 border-amber-900'
        } border-t-4 p-3 flex flex-col justify-between shadow-inner`}>
          {/* Surface info row */}
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 font-bold z-10">
            <span className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-0.5 rounded-lg border border-stone-800">
              <span className={`w-2 h-2 rounded-full ${
                effectiveMoisture > 45 ? 'bg-cyan-400 animate-ping' : effectiveMoisture < 30 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
              }`} />
              {isTamil ? 'மண் ஈரம்:' : 'Soil Moisture:'} <strong className="text-cyan-300">{effectiveMoisture}%</strong>
              {effectiveMoisture < 30 && <span className="text-red-400 text-[10px]">({isTamil ? 'வறட்சி!' : 'Dry!'})</span>}
            </span>
            <span className="bg-stone-950/80 px-2.5 py-0.5 rounded-lg border border-stone-800 text-emerald-400 font-bold">
              {isTamil ? 'இயற்கை தழைச்சத்து:' : 'Nitrogen Bank:'} +{currentQuest.legume ? '45' : '0'} lbs N/ac
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

      {/* 7. BOTTOM INTERACTIVE GAME CONTROL CONSOLE */}
      <footer className="bg-stone-900 border-t-2 border-stone-800 p-3 sm:p-4 z-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Month Jump Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {months.map((m, idx) => {
              const isActive = idx === currentMonthIdx;
              return (
                <button
                  key={idx}
                  onClick={() => handleMonthChange(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 flex-shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md font-extrabold'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  <span>{m.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Explain Aloud & Harvest */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSpeakAssessment}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-tactile active:scale-95 transition flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-emerald-200" />
              <span>{isTamil ? '🗣️ தமிழில் கேள்' : 'Explain Aloud'}</span>
            </button>

            {/* Advance Month or Harvest */}
            {currentMonthIdx === 5 ? (
              <button
                onClick={handleHarvestAction}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-tactile active:scale-95 transition flex items-center gap-1.5 ring-2 ring-amber-300"
              >
                <Award className="w-4 h-4 fill-current" />
                <span>{isTamil ? 'அறுவடை செய்!' : 'Harvest!'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleMonthChange(currentMonthIdx + 1)}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-tactile active:scale-95 transition flex items-center gap-1.5 ring-2 ring-amber-300"
              >
                <span>{isTamil ? 'அடுத்த மாதம் ➔' : 'Next Month ➔'}</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
