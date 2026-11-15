import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../../context/VoiceContext';
import { CropSequenceVisualizer } from '../common/CropVisualCard';
import { Trophy, CheckCircle2, ArrowRight, Sparkles, MapPin, Calendar, Sprout } from 'lucide-react';

/**
 * StrategyCommitModal
 * Full-screen confirmation celebration modal that displays the locked strategy
 * and automatically transitions to the Land Simulation page (/timemachine?fullscreen=true).
 */
export default function StrategyCommitModal({ isOpen, onClose, strategy, farmerName = 'விவசாயி' }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { speak, playSound } = useVoice();
  const [countdown, setCountdown] = useState(3);

  const isTamil = i18n.language === 'ta';

  useEffect(() => {
    if (!isOpen || !strategy) return;

    playSound('harvest');
    setCountdown(3);

    // Spoken voice celebration
    const stratTitle = strategy.name ? strategy.name.split('(')[0].trim() : 'பயிர் சுழற்சி உத்தி';
    const speechText = isTamil
      ? `வாழ்த்துகள்! ${stratTitle} உங்கள் பண்ணையின் அதிகாரப்பூர்வ பருவத் திட்டமாக உறுதி செய்யப்பட்டுள்ளது! நிலப் பக்கத்திற்கு தானாக அழைத்துச் செல்லப்படுகிறது.`
      : `Congratulations! ${strategy.name} is now your official season plan! Transitioning to live land simulation.`;
    speak(speechText);

    // 3-second countdown then automate to land page
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          goToLandPage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, strategy, isTamil]);

  const goToLandPage = () => {
    playSound('chime');
    if (onClose) onClose();
    navigate('/timemachine?fullscreen=true');
  };

  const goToDashboard = () => {
    playSound('chime');
    if (onClose) onClose();
    navigate('/today');
  };

  if (!isOpen || !strategy) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-2xl w-full bg-gradient-to-b from-stone-900 via-stone-900 to-field-950 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-7 text-center shadow-2xl relative space-y-5 ring-4 ring-amber-400/20">
        
        {/* Glowing Trophy Badge */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
          <div className="absolute inset-0 bg-amber-400/30 rounded-3xl blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 flex items-center justify-center text-stone-950 shadow-tactile ring-4 ring-amber-300">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-stone-950" />
          </div>
        </div>

        {/* Celebration Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isTamil ? 'அதிகாரப்பூர்வ பருவத் திட்டம் உறுதி செய்யப்பட்டது!' : 'Season Plan Confirmed & Locked!'}</span>
          </div>

          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-cream-100 leading-tight">
            {strategy.name}
          </h2>

          <p className="text-xs text-soil-300 max-w-lg mx-auto mt-1 leading-relaxed">
            {strategy.description}
          </p>
        </div>

        {/* Botanical Crop Pictures Sequence */}
        <div className="bg-stone-950/80 rounded-2xl p-3 border border-stone-800">
          <CropSequenceVisualizer sequence={strategy.sequence} isTamil={isTamil} />
        </div>

        {/* Score Badges */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
            <div className="text-[10px] text-soil-400 font-bold">Yield</div>
            <div className="font-extrabold text-amber-300 text-sm">{strategy.scores?.yield || 90}</div>
          </div>
          <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
            <div className="text-[10px] text-cyan-400 font-bold">Water</div>
            <div className="font-extrabold text-cyan-300 text-sm">{strategy.scores?.water || 92}</div>
          </div>
          <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
            <div className="text-[10px] text-emerald-400 font-bold">Soil</div>
            <div className="font-extrabold text-emerald-300 text-sm">{strategy.scores?.soil || 85}</div>
          </div>
          <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
            <div className="text-[10px] text-yellow-400 font-bold">Income</div>
            <div className="font-extrabold text-yellow-300 text-sm">{strategy.scores?.income || 88}</div>
          </div>
          <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
            <div className="text-[10px] text-rose-400 font-bold">Risk</div>
            <div className="font-extrabold text-rose-300 text-sm">{strategy.scores?.risk || 85}</div>
          </div>
        </div>

        {/* Automated Transition Countdown Bar */}
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{isTamil ? 'தானாக நில உருவகப் பக்கத்திற்குச் செல்கிறது...' : 'Automating to Live Land Simulation...'}</span>
            </span>
            <span className="font-mono text-sm font-extrabold text-amber-300">
              {countdown}s
            </span>
          </div>

          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${((4 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={goToLandPage}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-display font-extrabold text-xs sm:text-sm shadow-tactile flex items-center justify-center gap-2 active:scale-95 transition ring-2 ring-emerald-300"
          >
            <Sprout className="w-5 h-5 text-stone-950" />
            <span>{isTamil ? '🌾 இப்போதே நிலத்தைப் பார் (Go to Land Now)' : '🌾 View Land Simulation Now ➔'}</span>
          </button>

          <button
            type="button"
            onClick={goToDashboard}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700 active:scale-95 transition"
          >
            {isTamil ? 'பண்ணை முகப்பு' : 'Dashboard'}
          </button>
        </div>

      </div>
    </div>
  );
}
