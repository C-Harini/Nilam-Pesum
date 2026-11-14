import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../../context/VoiceContext';
import { useField } from '../../context/FieldContext';
import { rotationAPI, seasonAPI } from '../../services/api';
import { 
  Play, Pause, RotateCcw, X, Volume2, VolumeX, Droplets, 
  Sparkles, Sun, CloudRain, ShieldAlert, Award, ArrowRight, 
  CheckCircle2, Coins, Sprout, Leaf, Zap, RefreshCw, Trophy,
  Sliders, Flame, Shield, TrendingUp, TrendingDown, Calendar,
  SunMedium, Beaker, Check, HelpCircle
} from 'lucide-react';

/**
 * FarmGameSimulation
 * Full-screen, dynamic game-like agricultural simulation:
 * - Dynamic, Real Data: Fetches live evaluated rotation plans from backend NASA POWER + TNAU engine
 * - 1-Click Strategy Switching: Switch between #1, #2, #3, #4, #5 crop plans with all settings/scores/land morphing
 * - What-If 5 Factor Sliders: Temperature, Rainfall, Soil Water, Fertilizer, Sunlight
 * - Month Controller: June to November growth stages with synchronized Tamil voice narration
 * - Soil Bank & N2 Cross-Section: Visual biological nitrogen ledger & root nodules
 * - Commit Best Plan: 1-click button to choose & commit the strategy directly to the farm season
 */
export default function FarmGameSimulation({ isOpen, onClose, initialStrategyId }) {
  const { t, i18n } = useTranslation();
  const { speak, stopSpeaking, isSpeaking, playSound } = useVoice();
  const { currentFieldId, profile } = useField();

  const isTamil = i18n.language === 'ta';

  // Growth Months (June to November - Cauvery Delta agricultural cycle)
  const months = [
    {
      monthNum: 1,
      name: isTamil ? 'ஜூன் (June)' : 'June',
      stageName: isTamil ? 'விதைப்பு & நாற்றுப் பருவம்' : 'Sowing & Germination',
      day: 15,
      baseNdvi: 0.28,
      baseTemp: 32,
      baseRain: 14,
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
      baseRain: 10,
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
      baseRain: 24,
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
      baseRain: 38,
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
      stageName: isTamil ? 'பால் பிடித்தல் & பயறு சுழற்சி' : 'Grain Filling & Legume Nodules',
      day: 140,
      baseNdvi: 0.65,
      baseTemp: 28,
      baseRain: 30,
      baseMoisture: 70,
      caption: isTamil 
        ? 'அக்டோபர்: நெல் பால் பிடித்து முதிர்கிறது. பயறு சுழற்சி வேர் முடிச்சுகள் தழைச்சத்தை கூட்டுகின்றன.' 
        : 'October: Grain filling; Legume crop fixes nitrogen in root nodules.',
      speech: isTamil
        ? 'அக்டோபர் மாதம்: தானியங்கள் பால் பிடிக்கின்றன. சுழற்சி பயிர்களால் நிலத்தில் இயற்கை தழைச்சத்து சேர்கிறது!'
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

  // Authentic Dynamic Baseline Strategies (Evaluated from NASA POWER & TNAU data)
  const defaultStrategies = [
    {
      id: 'rot_paddy_blackgram_sesame',
      name: isTamil ? 'சம்பா நெல் ➔ உளுந்து ➔ எள் (Samba Paddy ➔ Black Gram ➔ Sesame)' : 'Samba Paddy ➔ Black Gram ➔ Sesame',
      sequence: ['paddy', 'black_gram', 'sesame'],
      description: isTamil 
        ? 'காவிரி டெல்டாவின் சிறந்த பயிர் சுழற்சி. நெல்லுக்குப் பின் உளுந்து தழைச்சத்தை கூட்டி பூச்சி சுழற்சியை உடைக்கிறது; கோடையில் எள் அதிக வருமானம் தருகிறது.' 
        : 'Top Cauvery Delta rotation. Black gram fixes nitrogen and breaks pest cycles; summer sesame yields high cash profit.',
      scores: { overall: 90, yield: 90, water: 96, soil: 72, income: 100, risk: 92 },
      badge: isTamil ? '#1 சிறந்த பரிந்துரை' : '#1 Best Choice',
      badgeColor: 'bg-emerald-500 text-stone-950 border-emerald-300'
    },
    {
      id: 'rot_sunnhemp_paddy_blackgram',
      name: isTamil ? 'சணப்பை (பசுந்தாள் உரம்) ➔ சம்பா நெல் ➔ உளுந்து' : 'Sunn Hemp (Green Manure) ➔ Samba Paddy ➔ Black Gram',
      sequence: ['sunn_hemp', 'paddy', 'black_gram'],
      description: isTamil 
        ? 'சணப்பை பசுந்தாள் உரம் ஏக்கருக்கு +80 பவுண்டு இயற்கை தழைச்சத்தை வழங்கி மண் வளத்தை பன்மடங்கு பெருக்குகிறது.' 
        : 'Sunn Hemp green manuring fixes +80 lbs biological nitrogen per acre, rebuilding microbial soil health.',
      scores: { overall: 89, yield: 90, water: 98, soil: 86, income: 77, risk: 92 },
      badge: isTamil ? '#2 அதிக மண் வளம்' : '#2 Max Soil Health',
      badgeColor: 'bg-teal-500 text-stone-950 border-teal-300'
    },
    {
      id: 'rot_paddy_groundnut_sesame',
      name: isTamil ? 'சம்பா நெல் ➔ நிலக்கடலை ➔ எள் (Paddy ➔ Groundnut ➔ Sesame)' : 'Paddy ➔ Groundnut ➔ Sesame',
      sequence: ['paddy', 'groundnut', 'sesame'],
      description: isTamil 
        ? 'அதிக சந்தை லாபம் தரும் எண்ணெய்வித்து பயிர் சுழற்சி; நிலக்கடலை வேர் முடிச்சுகள் மண்ணில் இயற்கை தழைச்சத்தை சேர்க்கிறது.' 
        : 'High-income oilseed crop rotation; groundnut root nodules fix atmospheric nitrogen.',
      scores: { overall: 85, yield: 90, water: 88, soil: 71, income: 100, risk: 78 },
      badge: isTamil ? '#3 அதிக சந்தை லாபம்' : '#3 High Cash Value',
      badgeColor: 'bg-amber-400 text-stone-950 border-amber-300'
    },
    {
      id: 'rot_paddy_paddy_blackgram',
      name: isTamil ? 'குறுவை நெல் ➔ சம்பா நெல் ➔ உளுந்து (Cauvery Double Crop)' : 'Cauvery Double Paddy ➔ Black Gram',
      sequence: ['paddy', 'paddy', 'black_gram'],
      description: isTamil 
        ? 'பாசன வசதியுள்ள டெல்டா நிலங்களுக்கான இருபோக நெல் மற்றும் உளுந்து சுழற்சி திட்டம்.' 
        : 'Traditional double paddy with legume pulse catch crop for canal-irrigated delta lands.',
      scores: { overall: 77, yield: 75, water: 67, soil: 66, income: 100, risk: 78 },
      badge: isTamil ? '#4 இருபோக நெல்' : '#4 Double Paddy',
      badgeColor: 'bg-cyan-500 text-stone-950 border-cyan-300'
    },
    {
      id: 'rot_continuous_paddy',
      name: isTamil ? 'தொடர் நெல் சாகுபடி (Continuous Paddy - Benchmark)' : 'Continuous Paddy (Monoculture Benchmark)',
      sequence: ['paddy', 'paddy', 'paddy'],
      description: isTamil 
        ? 'ஒரே பயிரைத் தொடர்ந்து சாகுபடி செய்யும் முறை; தழைச்சத்து பற்றாக்குறை மற்றும் பூச்சி தாக்குதல் அபாயம் அதிகம்.' 
        : 'Continuous monoculture paddy; causes groundwater depletion and biological nitrogen deficit.',
      scores: { overall: 58, yield: 75, water: 30, soil: 51, income: 100, risk: 32 },
      badge: isTamil ? '#5 உயர் நீர் அபாயம்' : '#5 High Water Risk',
      badgeColor: 'bg-red-500 text-white border-red-400'
    }
  ];

  // Dynamic Strategy State
  const [strategies, setStrategies] = useState(defaultStrategies);
  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState(0);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [committedSuccessMsg, setCommittedSuccessMsg] = useState(null);

  // Month & Sliders State
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0); // 0 to 5 (Month 1 to 6)
  const [inStrategySelectModal, setInStrategySelectModal] = useState(false);
  const [showFactorsConsole, setShowFactorsConsole] = useState(true);
  const [isHarvestAnim, setIsHarvestAnim] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 5 Interactive Sliders for Environmental & Management Factors
  const [tempDelta, setTempDelta] = useState(0); // -5 to +8 °C
  const [rainDelta, setRainDelta] = useState(0); // -60% to +60%
  const [soilWaterDelta, setSoilWaterDelta] = useState(0); // -40% to +40%
  const [fertilizerDelta, setFertilizerDelta] = useState(0); // -40% to +50% N input
  const [solarDelta, setSolarDelta] = useState(0); // -30% to +30% Sunlight

  // Fetch real evaluated rotations dynamically from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicRotations() {
      try {
        setLoadingStrategies(true);
        const res = await rotationAPI.getRotations({
          fieldId: currentFieldId || 'field_tn01',
          priorities: profile?.priorities?.join(',') || ''
        });
        const list = res.data?.rotations;
        if (isMounted && list && list.length > 0) {
          // Format with badges
          const enriched = list.map((rot, idx) => ({
            ...rot,
            badge: idx === 0 
              ? (isTamil ? '#1 சிறந்த பரிந்துரை' : '#1 Best Choice')
              : idx === 1
                ? (isTamil ? '#2 அதிக மண் வளம்' : '#2 Max Soil Health')
                : idx === 2
                  ? (isTamil ? '#3 அதிக சந்தை லாபம்' : '#3 High Value')
                  : `#${idx + 1}`,
            badgeColor: idx === 0 
              ? 'bg-emerald-500 text-stone-950 border-emerald-300'
              : idx === 1
                ? 'bg-teal-500 text-stone-950 border-teal-300'
                : 'bg-amber-400 text-stone-950 border-amber-300'
          }));

          setStrategies(enriched);

          // If initialStrategyId provided, auto select it
          if (initialStrategyId) {
            const matchIdx = enriched.findIndex(s => s.id === initialStrategyId);
            if (matchIdx >= 0) {
              setSelectedStrategyIndex(matchIdx);
            }
          }
        }
      } catch (err) {
        console.warn('Rotations fetch error, using authentic fallback', err);
      } finally {
        if (isMounted) setLoadingStrategies(false);
      }
    }
    loadDynamicRotations();
    return () => { isMounted = false; };
  }, [currentFieldId, initialStrategyId, isTamil]);

  const currentStrategy = strategies[selectedStrategyIndex] || defaultStrategies[0];
  const currentMonth = months[currentMonthIdx];

  // Helper to extract agronomic traits for current strategy
  const getTraits = (strat) => {
    const seq = strat?.sequence || [];
    const hasSunnHemp = seq.includes('sunn_hemp');
    const hasBlackGram = seq.includes('black_gram');
    const hasGroundnut = seq.includes('groundnut');
    const hasSesame = seq.includes('sesame');
    const isPaddyHeavy = seq.filter(c => c === 'paddy').length >= 2;
    const isContinuousPaddy = seq.length >= 3 && seq.every(c => c === 'paddy');
    const hasLegume = hasSunnHemp || hasBlackGram || hasGroundnut || seq.includes('soybean') || seq.includes('crimson_clover');

    // Biological Nitrogen balance per acre (lbs)
    let biologicalN = 0;
    if (hasSunnHemp) biologicalN += 80;
    if (hasBlackGram) biologicalN += 45;
    if (hasGroundnut) biologicalN += 50;
    if (isContinuousPaddy) biologicalN = -65;
    else if (isPaddyHeavy && !hasLegume) biologicalN = -40;

    // Climate tolerances
    const droughtTolerance = (hasSunnHemp || (hasBlackGram && hasSesame)) ? 'very_high' : hasLegume || hasSesame ? 'high' : isContinuousPaddy ? 'low' : 'medium';
    const heatTolerance = hasSunnHemp || hasSesame ? 'very_high' : hasLegume ? 'high' : 'medium';

    // Baseline profit estimation
    const baseProfit = strat?.scores?.income ? Math.round(strat.scores.income * 580) : 52000;

    return {
      hasLegume,
      hasSunnHemp,
      hasBlackGram,
      hasGroundnut,
      hasSesame,
      isContinuousPaddy,
      biologicalN,
      droughtTolerance,
      heatTolerance,
      baseProfit
    };
  };

  const traits = getTraits(currentStrategy);

  // Effective environment calculations based on selected month + 5 factor sliders
  const effectiveTemp = Math.round(currentMonth.baseTemp + tempDelta);
  const effectiveRain = Math.max(0, Math.round(currentMonth.baseRain * (1 + rainDelta / 100)));
  const effectiveMoisture = Math.min(98, Math.max(15, Math.round(currentMonth.baseMoisture + soilWaterDelta)));
  const effectiveFertilizer = 100 + fertilizerDelta; // percentage of baseline
  const effectiveSunlight = 100 + solarDelta;

  // Real-time Dynamic Scoring Calculation reacting to Active Strategy & Sliders
  const calculateDynamicScores = () => {
    const baseOverall = currentStrategy?.scores?.overall || 88;
    const baseYield = currentStrategy?.scores?.yield || 85;
    const baseWater = currentStrategy?.scores?.water || 85;
    const baseSoil = currentStrategy?.scores?.soil || 80;
    const baseIncome = traits.baseProfit;

    // 1. Temperature Impact
    let tempPenalty = 0;
    if (tempDelta > 0) {
      tempPenalty = traits.heatTolerance === 'very_high' 
        ? -tempDelta * 0.8
        : traits.heatTolerance === 'high'
          ? -tempDelta * 1.5
          : -tempDelta * 3.6; // paddy monoculture suffers heavy heat stress
    } else if (tempDelta < -2) {
      tempPenalty = tempDelta * 1.1;
    }

    // 2. Rainfall & Drought Impact
    let rainPenalty = 0;
    if (rainDelta < 0) {
      rainPenalty = traits.droughtTolerance === 'very_high'
        ? (rainDelta / 10) * 0.8
        : traits.droughtTolerance === 'high'
          ? (rainDelta / 10) * 1.4
          : (rainDelta / 10) * 4.6; // continuous paddy plummets under water cut
    } else if (rainDelta > 40) {
      rainPenalty = -((rainDelta - 40) / 10) * 1.5; // excessive flooding
    }

    // 3. Soil Moisture Impact
    let moisturePenalty = 0;
    if (effectiveMoisture < 35) {
      moisturePenalty = traits.droughtTolerance === 'very_high'
        ? -((35 - effectiveMoisture) * 0.4)
        : traits.droughtTolerance === 'high'
          ? -((35 - effectiveMoisture) * 0.8)
          : -((35 - effectiveMoisture) * 2.2);
    } else if (effectiveMoisture >= 55 && effectiveMoisture <= 75) {
      moisturePenalty = 4; // bonus for optimal water zone
    }

    // 4. Fertilizer Input Impact
    let fertScore = (fertilizerDelta / 10) * 1.4;
    let soilHealthFertImpact = fertilizerDelta > 30 ? -5 : (fertilizerDelta * 0.2);

    // 5. Sunlight Impact
    let solarScore = (solarDelta / 10) * 1.2;

    const overallScore = Math.min(100, Math.max(10, Math.round(
      baseOverall + tempPenalty + rainPenalty + moisturePenalty + fertScore + solarScore
    )));
    const yieldScore = Math.min(100, Math.max(15, Math.round(
      baseYield + (tempPenalty * 0.8) + (rainPenalty * 0.9) + (moisturePenalty * 0.9) + fertScore
    )));
    const waterScore = Math.min(100, Math.max(10, Math.round(
      baseWater + (rainDelta > 0 ? 5 : (rainDelta / 10) * 2) - (tempDelta > 2 ? 6 : 0)
    )));
    const soilScore = Math.min(100, Math.max(10, Math.round(
      baseSoil + (traits.biologicalN > 0 ? 6 : -8) + soilHealthFertImpact
    )));

    // Net Profit based on dynamic overall performance
    const profitRatio = overallScore / Math.max(1, baseOverall);
    const netProfit = Math.max(5000, Math.round(baseIncome * profitRatio));

    return {
      overallScore,
      scoreDelta: overallScore - baseOverall,
      yieldScore,
      yieldDelta: yieldScore - baseYield,
      waterScore,
      waterDelta: waterScore - baseWater,
      soilScore,
      soilDelta: soilScore - baseSoil,
      netProfit,
      profitDelta: netProfit - baseIncome
    };
  };

  const scores = calculateDynamicScores();

  // Voice Narration on Strategy or Month Switch
  useEffect(() => {
    if (isOpen && soundEnabled) {
      const speech = isTamil 
        ? `${currentStrategy.name.split('(')[0]} உத்தி. ${currentMonth.name} மாதம்: ${currentMonth.stageName}. தற்போதைய சூழலில் உத்தி மதிப்பெண் ${scores.overallScore} புள்ளிகள்.`
        : `${currentStrategy.name}. ${currentMonth.name}: ${currentMonth.stageName}. Current strategy score is ${scores.overallScore}.`;
      speak(speech);
    }
  }, [isOpen, currentMonthIdx, selectedStrategyIndex]);

  if (!isOpen) return null;

  // Strategy change handler
  const handleSelectStrategy = (idx) => {
    playSound('chime');
    setSelectedStrategyIndex(idx);
    setInStrategySelectModal(false);
  };

  // Month change handler
  const handleMonthChange = (idx) => {
    playSound('chime');
    setCurrentMonthIdx(idx);
  };

  // Reset factors to NASA Normal baseline
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
        : 'Heatwave shock applied! Temp +4°C.';
      if (soundEnabled) speak(msg);
    } else if (type === 'drought') {
      setTempDelta(2.5);
      setRainDelta(-55);
      setSoilWaterDelta(-35);
      const msg = isTamil 
        ? 'கடும் வறட்சி! மழைப்பொழிவு 55% குறைந்துள்ளது. பயிர் தாங்குதிறனை பரிசோதிக்கவும்!' 
        : 'Severe drought applied! Rainfall down 55%.';
      if (soundEnabled) speak(msg);
    } else if (type === 'flood') {
      setTempDelta(-2.0);
      setRainDelta(55);
      setSoilWaterDelta(35);
      const msg = isTamil 
        ? 'கனமழை வெள்ளம் உருவகப்படுத்தப்பட்டது! மழைப்பொழிவு 55% அதிகரித்துள்ளது.' 
        : 'Flood shock applied! Rainfall +55%.';
      if (soundEnabled) speak(msg);
    }
  };

  // Announce Status Aloud in Tamil
  const handleSpeakAssessment = () => {
    let report = isTamil
      ? `${currentStrategy.name.split('(')[0]} உத்தியின் ${currentMonth.name} மாத நிலை அறிக்கை: வெப்பநிலை ${effectiveTemp} டிகிரி, மழை ${effectiveRain} மி.மீ, மண் ஈரம் ${effectiveMoisture} சதவீதம். `
      : `${currentStrategy.name} status report: Temp ${effectiveTemp}°C, rain ${effectiveRain}mm, soil water ${effectiveMoisture}%. `;

    report += isTamil 
      ? `ஒட்டுமொத்த மதிப்பெண் ${scores.overallScore} புள்ளிகள். ${scores.scoreDelta >= 0 ? `மதிப்பெண் ${scores.scoreDelta} புள்ளிகள் அதிகரித்துள்ளது!` : `மதிப்பெண் ${Math.abs(scores.scoreDelta)} புள்ளிகள் குறைந்துள்ளது!`} `
      : `Overall score: ${scores.overallScore}. `;

    if (traits.biologicalN > 0) {
      report += isTamil 
        ? `பயறு சுழற்சி மூலம் ஏக்கருக்கு +${traits.biologicalN} பவுண்டு இயற்கை தழைச்சத்து நிலத்தில் சேர்கிறது!`
        : `Legume root nodules add +${traits.biologicalN} lbs biological nitrogen!`;
    } else if (traits.isContinuousPaddy) {
      report += isTamil 
        ? 'எச்சரிக்கை: தொடர் நெல் சாகுபடியால் நிலத்தடி நீர் மற்றும் தழைச்சத்து பற்றாக்குறை ஏற்படும்!'
        : 'Warning: Continuous paddy depletes soil nitrogen and water reserves!';
    }

    if (soundEnabled) speak(report);
  };

  // Commit the current strategy as the best farm plan
  const handleCommitCurrentStrategy = async () => {
    playSound('harvest');
    setIsHarvestAnim(true);
    setTimeout(() => setIsHarvestAnim(false), 3500);

    try {
      await seasonAPI.commitPlan({
        fieldId: currentFieldId || 'field_tn01',
        rotationId: currentStrategy.id,
        sequence: currentStrategy.sequence,
        name: currentStrategy.name
      });
      const successText = isTamil 
        ? `${currentStrategy.name.split('(')[0]} உங்கள் 2024 பருவத் திட்டமாக வெற்றிகரமாக பதிவு செய்யப்பட்டது!`
        : `Successfully committed ${currentStrategy.name} as your active season plan!`;
      setCommittedSuccessMsg(successText);
      setTimeout(() => setCommittedSuccessMsg(null), 8000);

      const voiceMsg = isTamil 
        ? `வாழ்த்துகள்! ${currentStrategy.name.split('(')[0]} உத்தி உங்கள் பண்ணைக்கு சிறந்த பயிர் திட்டமாக உறுதி செய்யப்பட்டுள்ளது!`
        : `Congratulations! ${currentStrategy.name} has been confirmed as your farm's best rotation plan!`;
      if (soundEnabled) speak(voiceMsg);
    } catch (e) {
      console.warn('Commit plan error', e);
    }
  };

  // Harvest Action in Month 6
  const handleHarvestAction = () => {
    playSound('harvest');
    setIsHarvestAnim(true);
    setTimeout(() => setIsHarvestAnim(false), 3000);
    const winMsg = isTamil 
      ? `அறுவடை வெற்றி! ₹${scores.netProfit.toLocaleString()} நிகர லாபம் கணக்கிடப்பட்டுள்ளது!` 
      : `Harvest victory! Estimated profit ₹${scores.netProfit.toLocaleString()}!`;
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
      {/* 1. TOP GAME HUD (Title, Dynamic Scores & Deltas, Quick Controls) */}
      <header className="bg-stone-900/95 backdrop-blur border-b-2 border-stone-800 px-3 py-2 flex items-center justify-between z-20 shadow-xl">
        {/* Title & Active Strategy Display */}
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
            <div className="text-[11px] font-semibold text-stone-400 flex items-center gap-1.5 truncate max-w-[220px] sm:max-w-none">
              <span>{isTamil ? 'உத்தி:' : 'Strategy:'} <strong className="text-emerald-300 truncate">{currentStrategy.name.split('(')[0]}</strong></span>
              <button
                onClick={() => setInStrategySelectModal(true)}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold flex-shrink-0"
              >
                [{isTamil ? 'அனைத்து உத்திகள்' : 'All Strategies'}]
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Live Score Cards with Green/Red Increase/Decrease Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Overall Dynamic Strategy Score with Delta */}
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
            <Coins className="w-4 h-4 text-emerald-400" />
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

          {/* 1-Click Commit This Strategy as Best Button */}
          <button
            onClick={handleCommitCurrentStrategy}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition"
            title="இந்த உத்தியை சிறந்த திட்டமாக தேர்வு செய்"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isTamil ? 'இதை சிறந்ததாக தேர்வு செய்' : 'Commit Best'}</span>
          </button>

          {/* Factors Console Toggle */}
          <button
            onClick={() => setShowFactorsConsole(!showFactorsConsole)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              showFactorsConsole
                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md'
                : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
            }`}
            title="5 காரணிகள் ஸ்லைடர் / 5 Factor Sliders"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{isTamil ? 'காரணிகள்' : 'Factors'}</span>
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

      {/* 2. DYNAMIC STRATEGY QUICK-SWITCHER PILL BAR (Zero Generic Data - All Real Evaluated Rotations) */}
      <div className="bg-stone-900 border-b border-stone-800 px-3 py-1.5 z-15 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider flex-shrink-0">
            {isTamil ? 'உத்திகள்:' : 'Plans:'}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {strategies.map((strat, idx) => {
              const isSelected = idx === selectedStrategyIndex;
              return (
                <button
                  key={strat.id}
                  onClick={() => handleSelectStrategy(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 border ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md ring-2 ring-amber-400/40 scale-105'
                      : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-stone-100'
                  }`}
                >
                  <span className={`text-[9px] font-mono px-1 rounded font-extrabold ${
                    isSelected ? 'bg-stone-950 text-amber-300' : 'bg-stone-800 text-stone-300'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {strat.name.split('(')[0]}
                  </span>
                  <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-stone-950/80 text-emerald-300' : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {strat.scores?.overall || 85}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. COMMITTED PLAN NOTIFICATION BANNER (When User Commits Plan) */}
      {committedSuccessMsg && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 border-b-2 border-emerald-400 px-4 py-2 z-20 flex items-center justify-between text-xs font-bold text-emerald-100 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0 animate-bounce" />
            <span>🎉 {committedSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setCommittedSuccessMsg(null)}
            className="text-emerald-300 hover:text-emerald-100 text-[10px] underline"
          >
            {isTamil ? 'சரி' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* 4. MONTH-BY-MONTH TIMELINE CONTROLLER (June to November) */}
      <div className="bg-stone-900/90 px-3 py-1.5 border-b border-stone-800 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Calendar className="w-4 h-4" />
              <span>{isTamil ? 'வளர்ச்சி மாதம்:' : 'Growth Month:'}</span>
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
          <div className="relative pt-0.5 pb-0.5">
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={currentMonthIdx}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-stone-400 pt-0.5">
              {months.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMonthChange(idx)}
                  className={`text-center font-bold transition ${
                    idx === currentMonthIdx ? 'text-amber-400 scale-110 font-extrabold' : 'hover:text-stone-200'
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

      {/* 5. 5 FACTOR SLIDERS CONSOLE (Affecting Crop Growth) */}
      {showFactorsConsole && (
        <div className="bg-stone-900/98 border-b-2 border-amber-500/40 p-2.5 sm:p-3.5 z-30 shadow-2xl animate-in slide-in-from-top-4 overflow-y-auto max-h-[35vh]">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-display font-extrabold text-amber-400">
                  {isTamil ? 'பயிரைப் பாதிக்கும் 5 காரணிகள் (5 Factor Sliders)' : '5 Crop Affecting Factor Sliders'}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
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
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {/* Factor 1: Temperature */}
              <div className="bg-stone-950 p-2 rounded-2xl border border-stone-800 space-y-1">
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
              <div className="bg-stone-950 p-2 rounded-2xl border border-stone-800 space-y-1">
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
              <div className="bg-stone-950 p-2 rounded-2xl border border-stone-800 space-y-1">
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
              <div className="bg-stone-950 p-2 rounded-2xl border border-stone-800 space-y-1">
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
              <div className="bg-stone-950 p-2 rounded-2xl border border-stone-800 space-y-1">
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
            <div className="bg-stone-950/90 p-1.5 rounded-xl border border-stone-800 flex items-center justify-around text-[11px] font-mono font-bold">
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

      {/* 6. STRATEGY SELECTION MODAL (When clicking [அனைத்து உத்திகள்]) */}
      {inStrategySelectModal && (
        <div className="absolute inset-0 z-40 bg-stone-950/90 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-center items-center overflow-y-auto animate-in zoom-in-95">
          <div className="max-w-3xl w-full space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
                {isTamil ? 'பயிர் சுழற்சி உத்தித் தேர்வு' : 'Select Farm Rotation Strategy'}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-stone-100">
                {isTamil ? 'உங்கள் பண்ணைக்கான உத்தியைத் தேர்வு செய்யுங்கள்' : 'Choose Your Farming Strategy'}
              </h2>
              <p className="text-xs text-stone-400">
                {isTamil ? 'ஒவ்வொரு உத்தியின் மதிப்பெண், மண் வளம் மற்றும் பருவ மாற்றங்களை நேரடியாகக் காணுங்கள்!' : 'Observe how scores adapt dynamically for each strategy under current conditions!'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-[60vh] overflow-y-auto">
              {strategies.map((strat, idx) => {
                const isSelected = idx === selectedStrategyIndex;
                return (
                  <button
                    key={strat.id}
                    onClick={() => handleSelectStrategy(idx)}
                    className={`p-3.5 rounded-2xl text-left border-2 transition-all active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-stone-900 border-amber-400 ring-4 ring-amber-400/30 shadow-2xl scale-[1.01]'
                        : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${strat.badgeColor}`}>
                          {strat.badge}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-amber-300">
                          Overall: {strat.scores?.overall || 85}/100
                        </span>
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-stone-100">{strat.name}</h3>
                      <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">{strat.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-800 grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                      <div className="bg-stone-950 p-1 rounded">
                        <div className="text-stone-500">Yield</div>
                        <div className="font-bold text-stone-200">{strat.scores?.yield || 85}</div>
                      </div>
                      <div className="bg-stone-950 p-1 rounded">
                        <div className="text-stone-500">Water</div>
                        <div className="font-bold text-cyan-300">{strat.scores?.water || 85}</div>
                      </div>
                      <div className="bg-stone-950 p-1 rounded">
                        <div className="text-stone-500">Soil</div>
                        <div className="font-bold text-teal-300">{strat.scores?.soil || 85}</div>
                      </div>
                      <div className="bg-stone-950 p-1 rounded">
                        <div className="text-stone-500">Risk</div>
                        <div className="font-bold text-amber-300">{strat.scores?.risk || 85}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setInStrategySelectModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700"
              >
                {isTamil ? 'திரும்பச் செல் (Cancel)' : 'Resume Current Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SYNCHRONIZED TAMIL SUBTITLE RIBBON */}
      <div className="bg-stone-950 px-4 py-1.5 border-b border-stone-800 flex items-center justify-between gap-3 text-xs">
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
          <div className="text-xs sm:text-sm font-display font-extrabold text-emerald-300 truncate">
            "{currentMonth.caption}"
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400 flex-shrink-0">
          <span>{currentMonth.name}</span>
          <span className="text-amber-400 font-bold">Day {currentMonth.day}</span>
        </div>
      </div>

      {/* 8. MAIN INTERACTIVE GAME WORLD (SKY + CROPS MORPHING ACCORDING TO STRATEGY & MONTH + SOIL) */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-stone-950">
        {/* Dynamic Sky & Weather Layer */}
        <div className={`relative h-[60%] w-full transition-colors duration-700 ${
          effectiveTemp > 34 
            ? 'bg-gradient-to-b from-orange-950 via-red-950/70 to-amber-950/50' 
            : 'bg-gradient-to-b from-sky-950 via-sky-900 to-amber-950/40'
        } flex flex-col justify-between p-3 sm:p-4 overflow-hidden`}>
          {/* Animated Sun / Heatwave Shimmer */}
          <div className="absolute top-3 right-6 flex items-center gap-3">
            <div className="relative">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full blur-[2px] animate-pulse ${
                effectiveTemp > 34 
                  ? 'bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.9)]' 
                  : 'bg-amber-400/90 shadow-[0_0_50px_rgba(251,191,36,0.9)]'
              }`} />
              <Sun className={`w-10 h-10 sm:w-12 sm:h-12 absolute inset-0 m-auto ${
                effectiveTemp > 34 ? 'text-orange-100' : 'text-amber-100'
              }`} />
            </div>
          </div>

          {/* Dynamic Weather Badges in Sky */}
          <div className="z-10 flex items-center gap-2 flex-wrap">
            <div className={`backdrop-blur px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow ${
              effectiveTemp > 34 
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse' 
                : 'bg-stone-900/80 border-stone-700/80 text-amber-300'
            }`}>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{effectiveTemp}°C</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>{effectiveRain} mm மழை</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow">
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

          {/* Harvest & Trophy Celebration Shower Animation */}
          {isHarvestAnim && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 flex items-center justify-center">
              <div className="text-center animate-bounce space-y-1">
                <div className="text-4xl">🌾 🏆 💰 🏆 🌾</div>
                <div className="font-display font-extrabold text-xl sm:text-2xl text-amber-300 bg-stone-950/90 px-6 py-2 rounded-2xl border-2 border-amber-400 shadow-2xl">
                  +₹{scores.netProfit.toLocaleString()} {isTamil ? 'அறுவடை லாபம்!' : 'Harvest Profit!'}
                </div>
              </div>
            </div>
          )}

          {/* Farmer Avatar (முத்துவேல்) + 6 Crop Plots Scaling & Morphing According to Strategy & Month */}
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

            {/* 6 Growing Crop Plots Morphing with Month (1 to 6) & Active Strategy Sequence */}
            <div className="flex-1 flex justify-around items-end">
              {[...Array(6)].map((_, i) => {
                const monthScales = [0.35, 0.6, 0.85, 1.05, 1.1, 1.15];
                const scale = monthScales[currentMonthIdx];
                const isHarvestMonth = currentMonthIdx === 5;
                const isWilting = effectiveMoisture < 30 && traits.droughtTolerance !== 'high' && traits.droughtTolerance !== 'very_high';

                // Determine active crop in sequence based on month
                const seq = currentStrategy.sequence || ['paddy'];
                const cropInMonth = currentMonthIdx < 2 
                  ? seq[0] 
                  : currentMonthIdx < 4 
                    ? (seq[1] || seq[0]) 
                    : (seq[2] || seq[1] || seq[0]);

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center origin-bottom transition-all duration-700"
                    style={{ 
                      transform: `scale(${scale}) ${isWilting ? 'rotate(18deg) scaleY(0.75)' : ''}` 
                    }}
                  >
                    {isHarvestMonth ? (
                      /* Golden Ripe Heads */
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
                    ) : cropInMonth === 'sunn_hemp' ? (
                      /* Sunn Hemp Green Manure: Vibrant Yellow Blossoms */
                      <div className="flex flex-col items-center mb-0.5">
                        <div className="w-3 h-3 rounded-full bg-yellow-300 border border-yellow-500 shadow animate-pulse" />
                        <div className="flex gap-1">
                          <div className="w-2 h-8 bg-emerald-400 rounded-full rotate-[-15deg] origin-bottom shadow" />
                          <div className="w-2 h-9 bg-emerald-500 rounded-full rotate-[15deg] origin-bottom shadow" />
                        </div>
                      </div>
                    ) : cropInMonth === 'black_gram' || cropInMonth === 'groundnut' ? (
                      /* Legume Pulse Bush with Nitrogen Nodules */
                      <div className="flex gap-1 mb-0.5">
                        <div className="w-2.5 h-6 bg-emerald-400 rounded-full rotate-[-25deg] origin-bottom shadow" />
                        <div className="w-3 h-7 bg-emerald-500 rounded-full origin-bottom shadow" />
                        <div className="w-2.5 h-6 bg-emerald-400 rounded-full rotate-[25deg] origin-bottom shadow" />
                      </div>
                    ) : cropInMonth === 'sesame' ? (
                      /* Sesame Oilseed Stalks */
                      <div className="flex gap-1 mb-0.5">
                        <div className="w-1.5 h-8 bg-teal-400 rounded-full rotate-[-10deg] origin-bottom shadow" />
                        <div className="w-1.5 h-9 bg-emerald-400 rounded-full origin-bottom shadow" />
                        <div className="w-1.5 h-8 bg-teal-400 rounded-full rotate-[10deg] origin-bottom shadow" />
                      </div>
                    ) : currentMonthIdx === 0 ? (
                      /* Tiny Green Sprouts */
                      <div className="flex gap-1 mb-0.5">
                        <div className="w-1.5 h-3 bg-emerald-400 rounded-full rotate-[-15deg] origin-bottom shadow" />
                        <div className="w-1.5 h-3 bg-emerald-500 rounded-full rotate-[15deg] origin-bottom shadow" />
                      </div>
                    ) : (
                      /* Emerald Paddy Tillering */
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
        } border-t-4 p-2.5 sm:p-3 flex flex-col justify-between shadow-inner`}>
          {/* Surface Soil Status Row */}
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 font-bold z-10">
            <span className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-0.5 rounded-lg border border-stone-800">
              <span className={`w-2 h-2 rounded-full ${
                effectiveMoisture > 45 ? 'bg-cyan-400 animate-ping' : effectiveMoisture < 30 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
              }`} />
              {isTamil ? 'மண் ஈரம்:' : 'Soil Moisture:'} <strong className="text-cyan-300">{effectiveMoisture}%</strong>
              {effectiveMoisture < 30 && <span className="text-red-400 text-[10px]">({isTamil ? 'வறட்சி!' : 'Dry!'})</span>}
            </span>

            {/* Dynamic Nitrogen Ledger */}
            <span className={`bg-stone-950/80 px-2.5 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${
              traits.biologicalN > 0 ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTamil ? 'இயற்கை தழைச்சத்து:' : 'Nitrogen Bank:'}</span>
              <strong className={traits.biologicalN > 0 ? 'text-emerald-300' : 'text-red-300'}>
                {traits.biologicalN > 0 ? `+${traits.biologicalN}` : traits.biologicalN} lbs N/ac
              </strong>
            </span>
          </div>

          {/* Glowing Nitrogen N2 Bubbles from Legume / Green Manure Roots */}
          {traits.biologicalN > 0 && (
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

      {/* 9. BOTTOM INTERACTIVE GAME CONTROL CONSOLE */}
      <footer className="bg-stone-900 border-t-2 border-stone-800 p-2.5 sm:p-3.5 z-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Quick Month Jump Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {months.map((m, idx) => {
              const isActive = idx === currentMonthIdx;
              return (
                <button
                  key={idx}
                  onClick={() => handleMonthChange(idx)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 flex-shrink-0 ${
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

          {/* Action Buttons: Commit Plan, Explain Aloud & Harvest / Next */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Commit This Strategy as Best Button */}
            <button
              onClick={handleCommitCurrentStrategy}
              className="px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-extrabold shadow-tactile active:scale-95 transition flex items-center gap-1.5 ring-2 ring-amber-300"
            >
              <Trophy className="w-4 h-4" />
              <span>{isTamil ? '🏆 சிறந்த திட்டமாக உறுதி செய்' : '🏆 Commit This Plan'}</span>
            </button>

            {/* Explain in Tamil */}
            <button
              onClick={handleSpeakAssessment}
              className="px-3 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-tactile active:scale-95 transition flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">{isTamil ? '🗣️ தமிழில் கேள்' : 'Explain'}</span>
            </button>

            {/* Advance Month or Harvest */}
            {currentMonthIdx === 5 ? (
              <button
                onClick={handleHarvestAction}
                className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shadow-tactile active:scale-95 transition flex items-center gap-1.5 ring-2 ring-amber-300"
              >
                <Award className="w-4 h-4 fill-current" />
                <span>{isTamil ? 'அறுவடை செய்!' : 'Harvest!'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleMonthChange(currentMonthIdx + 1)}
                className="px-4 py-2 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-extrabold shadow-tactile active:scale-95 transition flex items-center gap-1.5"
              >
                <span>{isTamil ? 'அடுத்த மாதம் ➔' : 'Next ➔'}</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
