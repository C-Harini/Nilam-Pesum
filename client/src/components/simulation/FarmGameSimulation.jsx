import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../../context/VoiceContext';
import { useField } from '../../context/FieldContext';
import { 
  Play, Pause, RotateCcw, X, Volume2, VolumeX, Droplets, 
  Sparkles, Sun, CloudRain, ShieldAlert, Award, ArrowRight, 
  CheckCircle2, Coins, Sprout, Leaf, Zap, RefreshCw, Trophy,
  Sliders, Flame, Shield, Info
} from 'lucide-react';

/**
 * FarmGameSimulation
 * Full-screen, game-like agricultural simulation for farmers:
 * - 1-Click Full Screen Game Launch
 * - Choose Strategy Quests (Cauvery Smart, Organic Revival, Traditional Paddy)
 * - What-If Climate & Environmental Controls (Temperature, Rain, Soil Water Available)
 * - Quick Climate Shock Presets (Heatwave, Drought, Flood, Normal)
 * - Real-time animated crop and soil visual physics
 * - Full Tamil Voice+ narration speaking with the farmer
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
      droughtTolerance: 'high',
      heatTolerance: 'high',
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
      droughtTolerance: 'high',
      heatTolerance: 'very_high',
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
      droughtTolerance: 'low',
      heatTolerance: 'low',
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

  // What-If Climate & Soil Controls State
  const [showWhatIfConsole, setShowWhatIfConsole] = useState(false);
  const [tempDelta, setTempDelta] = useState(0); // -5 to +6 deg C
  const [rainDelta, setRainDelta] = useState(0); // -60% to +60%
  const [soilWaterDelta, setSoilWaterDelta] = useState(0); // -40% to +40%
  const [activePreset, setActivePreset] = useState('normal'); // 'normal' | 'heatwave' | 'drought' | 'flood' | 'custom'

  const currentQuest = quests[selectedQuestIndex];
  const currentStage = currentQuest.stages[currentStageIdx];

  // Compute effective environmental metrics
  const effectiveTemp = Math.round(currentStage.temp + tempDelta);
  const effectiveRain = Math.max(0, Math.round(currentStage.rain * (1 + rainDelta / 100)));
  const effectiveMoisture = Math.min(98, Math.max(12, Math.round(waterTank + soilWaterDelta)));

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

  // What-If Shock Presets with Tamil Voice Narration
  const handleApplyPreset = (presetKey) => {
    playSound('chime');
    setActivePreset(presetKey);

    if (presetKey === 'heatwave') {
      setTempDelta(3.5);
      setRainDelta(-25);
      setSoilWaterDelta(-20);
      let speechText = '';
      if (currentQuest.id === 'quest_traditional_risk') {
        speechText = isTamil
          ? 'வெப்ப அலை எச்சரிக்கை! வெப்பநிலை 3.5 டிகிரி உயர்ந்துள்ளது. பாரம்பரிய நெற்பயிர் வெப்பத்தால் கருகும் அபாயம்! அதிக பாசன நீர் தேவைப்படும்.'
          : 'Heatwave shock applied! Traditional paddy cannot tolerate extreme heat and water loss!';
      } else {
        speechText = isTamil
          ? `வெப்ப அலை உருவகப்படுத்தப்பட்டது! வெப்பநிலை 3.5 டிகிரி உயர்ந்துள்ளது. எனினும் ${currentQuest.title} உத்தி வெப்பத்தைத் தாங்கி வளரும்!`
          : `Heatwave applied! ${currentQuest.title} shows high thermal resilience.`;
      }
      if (soundEnabled) speak(speechText);
    } else if (presetKey === 'drought') {
      setTempDelta(2.0);
      setRainDelta(-50);
      setSoilWaterDelta(-35);
      let speechText = '';
      if (currentQuest.id === 'quest_traditional_risk') {
        speechText = isTamil
          ? 'கடும் வறட்சி எச்சரிக்கை! மழை 50 சதவீதம் குறைந்துள்ளது. இருபோக நெல் உத்திக்கு நீர் பற்றாக்குறை ஏற்பட்டு பெரும் நஷ்டம் ஏற்படும்!'
          : 'Severe drought warning! Traditional double paddy collapses with severe water deficit!';
      } else {
        speechText = isTamil
          ? `கடும் வறட்சி உருவகப்படுத்தப்பட்டது! மழை 50 சதவீதம் குறைந்துள்ளது. எனினும் ${currentQuest.title} உத்தியின் ஆழமான வேர்கள் குறைந்த நீரிலும் தாக்குப்பிடிக்கும்!`
          : `Drought simulated! ${currentQuest.title} sustains growth with 42% water conservation!`;
      }
      if (soundEnabled) speak(speechText);
    } else if (presetKey === 'flood') {
      setTempDelta(-1.5);
      setRainDelta(50);
      setSoilWaterDelta(30);
      const speechText = isTamil
        ? 'கனமழை வெள்ள எச்சரிக்கை! மழைப்பொழிவு 50 சதவீதம் அதிகரித்துள்ளது. வயலில் நீர் தேங்குகிறது, வடிகால் அமைப்பை பரிசோதிக்கவும்.'
        : 'Excess rainfall simulated! Monitoring drainage and root aeration.';
      if (soundEnabled) speak(speechText);
    } else {
      // Normal Reset
      setTempDelta(0);
      setRainDelta(0);
      setSoilWaterDelta(0);
      const speechText = isTamil
        ? 'வானிலை மற்றும் மண் இயல்பு நிலைக்கு மாற்றப்பட்டது.'
        : 'Climate and soil reset to authentic NASA baseline.';
      if (soundEnabled) speak(speechText);
    }
  };

  // Announce What-If Impact Aloud in Tamil
  const handleSpeakWhatIfAnalysis = () => {
    let narrative = isTamil
      ? `தற்போதைய சூழல்: வெப்பநிலை ${effectiveTemp} டிகிரி, மழை ${effectiveRain} மில்லிமீட்டர், மண் ஈரம் ${effectiveMoisture} சதவீதம். `
      : `Current environment: Temp ${effectiveTemp} degrees, rain ${effectiveRain} mm, soil moisture ${effectiveMoisture} percent. `;

    if (effectiveMoisture < 35) {
      if (currentQuest.droughtTolerance === 'high') {
        narrative += isTamil
          ? `${currentQuest.title} உத்தி வறட்சியை எளிதில் தாங்குகிறது! உளுந்து மற்றும் எள் பயிர்கள் குறைந்த நீரிலும் நல்ல மகசூல் தரும்.`
          : `${currentQuest.title} handles drought effectively with low water requirement.`;
      } else {
        narrative += isTamil
          ? `எச்சரிக்கை! இந்த பாரம்பரிய உத்தி வறட்சியைத் தாங்காது! பயிர்கள் கருகும் அபாயம் உள்ளது!`
          : `Warning! Traditional rotation cannot withstand drought stress!`;
      }
    } else if (effectiveTemp > 33) {
      narrative += isTamil
        ? `அதிக வெப்ப நிலை நிலவுகிறது. வேர் மண்டல ஈரத்தை பாதுகாக்க தழை உரம் உதவுகிறது.`
        : `High thermal heatwave active. Bio-fertilizer protects root vitality.`;
    } else {
      narrative += isTamil
        ? `வானிலை மற்றும் மண் நிலை இந்த பயிர் சுழற்சிக்கு மிகச் சாதகமாக உள்ளது!`
        : `Weather and soil conditions are optimal for this rotation!`;
    }

    if (soundEnabled) speak(narrative);
  };

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
    
    // Penalize profit if severe drought & traditional paddy
    let reward = currentQuest.profitBonus;
    if (effectiveMoisture < 30 && currentQuest.id === 'quest_traditional_risk') {
      reward = Math.round(reward * 0.4); // 60% loss
    }
    setCoins((prev) => prev + reward);

    const victoryMsg = isTamil 
      ? `வாழ்த்துகள்! பொன்னிற அறுவடை நிறைவடைந்தது! ${currentQuest.title} உத்தியால் ₹${reward.toLocaleString()} நிகர லாபம் கிடைத்துள்ளது!`
      : `Congratulations! Harvest completed with ₹${reward.toLocaleString()} net profit earned!`;
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
      <header className="bg-stone-900/95 backdrop-blur border-b-2 border-stone-800 px-3 py-2 flex items-center justify-between z-20 shadow-xl">
        {/* Game Title & Field Badge */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-sm flex-shrink-0">
            <Trophy className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-display font-extrabold text-amber-400">
                {isTamil ? 'விவசாய விளையாட்டு' : 'Farm Simulation Game'}
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

        {/* Live Gauges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Farm Coins / Profit */}
          <div className="bg-stone-950 px-2.5 py-1 rounded-xl border border-amber-500/40 flex items-center gap-1.5 shadow">
            <Coins className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <div className="text-right">
              <div className="text-[9px] text-stone-400 font-bold uppercase">{isTamil ? 'வருமானம்' : 'Coins'}</div>
              <div className="text-xs font-mono font-extrabold text-amber-300">₹{coins.toLocaleString()}</div>
            </div>
          </div>

          {/* Soil Moisture Tank */}
          <div className="hidden xs:flex bg-stone-950 px-2.5 py-1 rounded-xl border border-cyan-500/40 items-center gap-1.5 shadow">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <div className="text-[9px] text-stone-400 font-bold uppercase">{isTamil ? 'மண் ஈரம்' : 'Moisture'}</div>
              <div className="text-xs font-mono font-extrabold text-cyan-300">{effectiveMoisture}%</div>
            </div>
          </div>

          {/* Nitrogen Bank XP */}
          <div className="hidden sm:flex bg-stone-950 px-2.5 py-1 rounded-xl border border-emerald-500/40 items-center gap-1.5 shadow">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <div className="text-[9px] text-stone-400 font-bold uppercase">{isTamil ? 'தழைச்சத்து XP' : 'Nitrogen XP'}</div>
              <div className="text-xs font-mono font-extrabold text-emerald-300">+{nitrogenXP} XP</div>
            </div>
          </div>

          {/* What-If Console Toggle Button */}
          <button
            onClick={() => setShowWhatIfConsole(!showWhatIfConsole)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              showWhatIfConsole 
                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-lg' 
                : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
            }`}
            title="காலநிலை மற்றும் மண் மாற்றக் கட்டுப்பாடு / What-If Climate Controls"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{isTamil ? 'What-If வானிலை' : 'What-If Sliders'}</span>
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

      {/* 2. WHAT-IF CLIMATE & ENVIRONMENTAL PRESET BAR */}
      <div className="bg-stone-900 px-3 py-1.5 border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto text-xs z-10">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            {isTamil ? 'காலநிலை அதிர்வு (Shocks):' : 'Climate Shocks:'}
          </span>
          {/* Quick Presets */}
          <button
            onClick={() => handleApplyPreset('heatwave')}
            className={`px-2.5 py-1 rounded-lg font-bold border transition text-[11px] flex items-center gap-1 ${
              activePreset === 'heatwave' 
                ? 'bg-orange-600 text-white border-orange-400 ring-2 ring-orange-300' 
                : 'bg-stone-950 text-orange-400 border-orange-500/40 hover:bg-stone-800'
            }`}
          >
            <span>☀️</span>
            <span>{isTamil ? 'வெப்ப அலை (+3.5°C)' : 'Heatwave (+3.5°C)'}</span>
          </button>

          <button
            onClick={() => handleApplyPreset('drought')}
            className={`px-2.5 py-1 rounded-lg font-bold border transition text-[11px] flex items-center gap-1 ${
              activePreset === 'drought' 
                ? 'bg-amber-600 text-white border-amber-400 ring-2 ring-amber-300' 
                : 'bg-stone-950 text-amber-400 border-amber-500/40 hover:bg-stone-800'
            }`}
          >
            <span>🌵</span>
            <span>{isTamil ? 'கடும் வறட்சி (-50% மழை)' : 'Drought (-50% Rain)'}</span>
          </button>

          <button
            onClick={() => handleApplyPreset('flood')}
            className={`px-2.5 py-1 rounded-lg font-bold border transition text-[11px] flex items-center gap-1 ${
              activePreset === 'flood' 
                ? 'bg-cyan-600 text-white border-cyan-400 ring-2 ring-cyan-300' 
                : 'bg-stone-950 text-cyan-400 border-cyan-500/40 hover:bg-stone-800'
            }`}
          >
            <span>⛈️</span>
            <span>{isTamil ? 'கனமழை (+50%)' : 'Flood (+50% Rain)'}</span>
          </button>

          <button
            onClick={() => handleApplyPreset('normal')}
            className={`px-2 py-1 rounded-lg font-bold border transition text-[11px] flex items-center gap-1 ${
              activePreset === 'normal' 
                ? 'bg-emerald-600 text-white border-emerald-400' 
                : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isTamil ? 'இயல்பு' : 'Normal'}</span>
          </button>
        </div>

        {/* Tamil Voice Explain Button */}
        <button
          onClick={handleSpeakWhatIfAnalysis}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold flex items-center gap-1 flex-shrink-0 active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isTamil ? '🗣️ நிலைமையை தமிழில் கேள்' : 'Explain Aloud'}</span>
        </button>
      </div>

      {/* 3. COLLAPSIBLE WHAT-IF SLIDERS CONSOLE */}
      {showWhatIfConsole && (
        <div className="bg-stone-900/98 border-b-2 border-amber-500/40 p-3 sm:p-4 z-30 shadow-2xl animate-in slide-in-from-top-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-display font-extrabold text-amber-400">
                  {isTamil ? 'கைமுறை காலநிலை & மண் மாற்றக் கட்டுப்பாடு (Manual Sliders)' : 'What-If Environmental Controls'}
                </h3>
              </div>
              <button 
                onClick={() => setShowWhatIfConsole(false)}
                className="text-xs text-stone-400 hover:text-stone-200 font-bold"
              >
                ✕ {isTamil ? 'மூடு' : 'Close'}
              </button>
            </div>

            {/* 3 Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Slider 1: Temperature */}
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-300 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    {isTamil ? 'வெப்பநிலை மாற்றம்:' : 'Temperature:'}
                  </span>
                  <span className="font-mono text-amber-300 font-extrabold">
                    {tempDelta > 0 ? `+${tempDelta}` : tempDelta}°C ({effectiveTemp}°C)
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="6"
                  step="0.5"
                  value={tempDelta}
                  onChange={(e) => {
                    setTempDelta(parseFloat(e.target.value));
                    setActivePreset('custom');
                    playSound('chime');
                  }}
                  className="w-full accent-amber-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-stone-500">
                  <span>-5°C (குளிர்)</span>
                  <span>0°C (இயல்பு)</span>
                  <span>+6°C (தீவிர வெப்பம்)</span>
                </div>
              </div>

              {/* Slider 2: Rainfall */}
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-300 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    {isTamil ? 'மழைப்பொழிவு மாற்றம்:' : 'Rainfall:'}
                  </span>
                  <span className="font-mono text-cyan-300 font-extrabold">
                    {rainDelta > 0 ? `+${rainDelta}` : rainDelta}% ({effectiveRain} mm)
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
                    setActivePreset('custom');
                    playSound('chime');
                  }}
                  className="w-full accent-cyan-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-stone-500">
                  <span>-60% (வறட்சி)</span>
                  <span>0% (இயல்பு)</span>
                  <span>+60% (வெள்ளம்)</span>
                </div>
              </div>

              {/* Slider 3: Soil Water Available */}
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-stone-300 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-teal-400" />
                    {isTamil ? 'மண் ஈரம் மாற்றம்:' : 'Soil Water Shift:'}
                  </span>
                  <span className="font-mono text-teal-300 font-extrabold">
                    {soilWaterDelta > 0 ? `+${soilWaterDelta}` : soilWaterDelta}% ({effectiveMoisture}%)
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
                    setActivePreset('custom');
                    playSound('chime');
                  }}
                  className="w-full accent-teal-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-stone-500">
                  <span>-40% (காய்ந்த மண்)</span>
                  <span>0% (இயல்பு)</span>
                  <span>+40% (தேங்கிய நீர்)</span>
                </div>
              </div>
            </div>

            {/* Strategy Resilience Assessment Card */}
            <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-stone-300">
                  {effectiveMoisture < 35 
                    ? (currentQuest.droughtTolerance === 'high' 
                        ? (isTamil ? '🛡️ வறட்சி தாங்குதிறன்: உளுந்து மற்றும் எள் ஆழமான வேர்களால் செழிப்பாக வளரும்!' : '🛡️ High Drought Resilience: Legume & sesame roots withstand water deficit!')
                        : (isTamil ? '⚠️ அபாயம்: பாரம்பரிய நெற்பயிருக்கு நீர் பற்றாக்குறை ஏற்பட்டு கருகும் அபாயம்!' : '⚠️ Warning: Traditional paddy collapses under this severe water deficit!'))
                    : (isTamil ? '✅ உகந்த சூழல்: இந்த உத்தி முழு மகசூலையும் ₹54,000 லாபத்தையும் உறுதி செய்கிறது.' : '✅ Optimal environment: Rotation delivers peak yield and profit.')
                  }
                </span>
              </div>
              <button
                onClick={handleSpeakWhatIfAnalysis}
                className="text-amber-400 hover:text-amber-300 font-bold underline text-[11px] flex-shrink-0 ml-2"
              >
                {isTamil ? 'குரல் வழியே கேள்' : 'Listen'}
              </button>
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
            "{currentStage.caption}"
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400 flex-shrink-0">
          <span>{currentStage.name}</span>
          <span className="text-amber-400 font-bold">Day {currentStage.day}</span>
        </div>
      </div>

      {/* 6. MAIN INTERACTIVE GAME WORLD (SKY + CROPS + SOIL PROFILE) */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-stone-950">
        {/* Top Sky / Atmosphere Layer (60% height) */}
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
              <span>{effectiveTemp}°C {effectiveTemp > 34 ? (isTamil ? 'வெப்ப அலை' : 'Heatwave') : (isTamil ? 'வெயில்' : 'Temp')}</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-3 py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>{effectiveRain} mm {isTamil ? 'மழை' : 'Rain'}</span>
            </div>
            <div className="bg-stone-900/80 backdrop-blur px-3 py-1 rounded-xl border border-stone-700/80 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>NDVI {currentStage.ndvi.toFixed(2)}</span>
            </div>
          </div>

          {/* Active Rain Droplets Animation (if effective rain > 5mm or irrigating) */}
          {(effectiveRain > 5 || isIrrigatingAnim) && (
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

          {/* Farmer Avatar (முத்துவேல்) + 6 Interactive Crop Plots */}
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

            {/* 6 Growing Crop Plots with Physical Droop under Drought */}
            <div className="flex-1 flex justify-around items-end">
              {[...Array(6)].map((_, i) => {
                const scale = Math.max(0.4, currentStage.ndvi * 1.3);
                const isHarvest = currentStageIdx === currentQuest.stages.length - 1;
                const isWilting = effectiveMoisture < 30 && currentQuest.droughtTolerance !== 'high';
                
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center origin-bottom transition-all duration-700"
                    style={{ 
                      transform: `scale(${scale}) ${isWilting ? 'rotate(18deg) scaleY(0.75)' : ''}` 
                    }}
                  >
                    {isHarvest ? (
                      /* Golden Ripe Grain Heads */
                      <div className="flex gap-1 mb-0.5 animate-pulse">
                        <div className="w-2 h-7 bg-amber-400 rounded-full rotate-[-12deg] shadow" />
                        <div className="w-2 h-8 bg-yellow-400 rounded-full shadow" />
                        <div className="w-2 h-7 bg-amber-400 rounded-full rotate-[12deg] shadow" />
                      </div>
                    ) : isWilting ? (
                      /* Wilting Dry Stalks */
                      <div className="flex gap-1 mb-0.5 opacity-80">
                        <div className="w-2 h-5 bg-amber-600 rounded-full rotate-[-35deg] origin-bottom shadow" />
                        <div className="w-2 h-6 bg-yellow-700 rounded-full rotate-[-10deg] origin-bottom shadow" />
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

      {/* 7. BOTTOM INTERACTIVE GAME CONTROL CONSOLE */}
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
