import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useField } from '../context/FieldContext';
import { rotationAPI, seasonAPI } from '../services/api';
import AllStrategiesGameAnalysis from '../components/simulation/AllStrategiesGameAnalysis';
import { CropSequenceVisualizer } from '../components/common/CropVisualCard';
import { Sprout, CheckCircle2, Sliders, TrendingUp, ShieldAlert, Award, Calendar, DollarSign, Droplets, Shield, ArrowRight, RefreshCw, AlertCircle, Maximize2, Trophy } from 'lucide-react';

export default function RotationPlan() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const { currentFieldId, profile } = useField();
  const [rotations, setRotations] = useState([]);
  const [selectedRotation, setSelectedRotation] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [plantingWindow, setPlantingWindow] = useState(null);
  const [soilBank, setSoilBank] = useState(null);
  const [loading, setLoading] = useState(true);

  // What-If Simulation State
  const [tempDelta, setTempDelta] = useState(0);
  const [rainDelta, setRainDelta] = useState(0);
  const [plantingDelay, setPlantingDelay] = useState(0);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [showAllAnalysis, setShowAllAnalysis] = useState(false);
  const [committedMsg, setCommittedMsg] = useState(null);

  const fetchRotations = async () => {
    try {
      setLoading(true);
      const res = await rotationAPI.getRotations({
        fieldId: currentFieldId,
        priorities: profile?.priorities?.join(',') || ''
      });
      const list = res.data.rotations || [];
      setRotations(list);
      if (list.length > 0) {
        selectRotation(list[0]);
      }
    } catch (e) {
      console.warn('Rotations fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const selectRotation = async (rot) => {
    setSelectedRotation(rot);
    setWhatIfResult(null);
    setTempDelta(0);
    setRainDelta(0);
    setPlantingDelay(0);

    // Fetch backtest and soil bank
    try {
      const [btRes, pwRes, sbRes] = await Promise.all([
        rotationAPI.getBacktest(rot.id, currentFieldId),
        rotationAPI.getPlantingWindow(currentFieldId),
        rotationAPI.getSoilBank(rot.sequence)
      ]);
      setBacktest(btRes.data);
      setPlantingWindow(pwRes.data);
      setSoilBank(sbRes.data);
    } catch (err) {
      console.warn('Sub-analyses fetch error', err);
    }
  };

  useEffect(() => {
    fetchRotations();
  }, [currentFieldId]);

  // Handle What-If simulation
  const handleWhatIfSimulate = async () => {
    if (!selectedRotation) return;
    try {
      setSimulating(true);
      const res = await rotationAPI.simulateWhatIf(selectedRotation.id, {
        baselineScores: selectedRotation.scores,
        adjustments: {
          tempDeltaF: tempDelta,
          rainDeltaPct: rainDelta,
          plantingDelayDays: plantingDelay
        }
      });
      setWhatIfResult(res.data);
    } catch (e) {
      console.warn('Simulation error', e);
    } finally {
      setSimulating(false);
    }
  };

  const handleCommitSeason = async (rot) => {
    const target = rot || selectedRotation;
    if (!target) return;
    try {
      await seasonAPI.commitPlan({
        fieldId: currentFieldId,
        rotationId: target.id,
        sequence: target.sequence
      });
      const msg = isTamil
        ? `${target.name.split('(')[0]} உங்கள் 2024 பருவத் திட்டமாக வெற்றிகரமாக உறுதி செய்யப்பட்டது!`
        : `Successfully committed ${target.name} to your active 2024 season!`;
      setCommittedMsg(msg);
      setTimeout(() => setCommittedMsg(null), 6000);
    } catch (e) {
      alert('Could not commit plan: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-field-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm font-bold text-soil-800">Calculating 3-Season Rotation Scores...</div>
        </div>
      </div>
    );
  }

  const activeScores = whatIfResult ? whatIfResult.adjustedScores : (selectedRotation?.scores || {});

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Title */}
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider text-soil-600">
          Agronomic Rotation Optimization
        </span>
        <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight">
          Recommended Crop Plans
        </h1>
        <p className="text-xs text-soil-600 mt-1">
          Top 5 valid 3-season rotations scored against your priorities and historical NASA POWER climate records.
        </p>
      </div>

      {committedMsg && (
        <div className="bg-field-100 border border-field-400 text-field-900 rounded-2xl p-4 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-field-700 flex-shrink-0" />
          <span>{committedMsg}</span>
        </div>
      )}

      {/* Full Screen Game Simulation Launch Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 border-2 border-amber-500/50 rounded-3xl p-4 text-cream-50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-tactile">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              {isTamil ? 'விவசாய விளையாட்டு மாதிரி (Simulation Game)' : 'Farm Simulation Game'}
            </div>
            <div className="text-xs sm:text-sm font-display font-extrabold text-cream-100 mt-0.5">
              {isTamil ? 'ஒவ்வொரு உத்தியையும் விளையாட்டாக மாற்றி அமைத்து சிறந்ததைத் தேர்வு செய்யுங்கள்!' : 'Test each strategy dynamically with 5 factor sliders & choose the best!'}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/game')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Trophy className="w-4 h-4" />
          <span>{isTamil ? '🎮 விளையாட்டைத் தொடங்கு' : '🎮 Play Game'}</span>
        </button>
      </div>

      {/* Top 5 Rotation Cards Carousel / Selector */}
      <div className="space-y-3">
        {rotations.map((rot, idx) => {
          const isSelected = selectedRotation?.id === rot.id;
          return (
            <div
              key={rot.id}
              onClick={() => selectRotation(rot)}
              className={`card-heartland cursor-pointer transition-all border-2 ${
                isSelected
                  ? 'border-field-600 bg-cream-50 shadow-tactile-hover ring-2 ring-field-600/20'
                  : 'border-soil-200 hover:border-soil-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    idx === 0 ? 'bg-wheat-400 text-soil-900' : 'bg-soil-200 text-soil-800'
                  }`}>
                    #{idx + 1}
                  </span>
                  <h3 className="font-display font-bold text-sm text-soil-900">
                    {rot.name}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase font-semibold text-soil-500">Overall</div>
                  <div className="font-display font-extrabold text-xl text-field-700">
                    {rot.scores.overall}<span className="text-xs text-soil-500">/100</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-soil-600 mt-2 leading-relaxed">
                {rot.description}
              </p>

              {/* DISTINCT BOTANICAL CROP PICTURES (Visual illustrated cards for every crop) */}
              <div className="bg-cream-100/80 rounded-2xl p-2.5 mt-2 border border-soil-200">
                <CropSequenceVisualizer sequence={rot.sequence} isTamil={isTamil} />
              </div>

              {/* 5-Factor Score Pills */}
              <div className="grid grid-cols-5 gap-1.5 mt-3 pt-3 border-t border-soil-200 text-center">
                <div className="bg-cream-200/90 p-1.5 rounded-xl border border-soil-300/40">
                  <div className="text-[10px] font-bold text-soil-600">Yield</div>
                  <div className="text-xs font-extrabold text-soil-900">{rot.scores.yield}</div>
                </div>
                <div className="bg-cyan-50 p-1.5 rounded-xl border border-cyan-200">
                  <div className="text-[10px] font-bold text-cyan-700">Water</div>
                  <div className="text-xs font-extrabold text-cyan-800">{rot.scores.water}</div>
                </div>
                <div className="bg-emerald-50 p-1.5 rounded-xl border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-700">Soil</div>
                  <div className="text-xs font-extrabold text-emerald-800">{rot.scores.soil}</div>
                </div>
                <div className="bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-700">Income</div>
                  <div className="text-xs font-extrabold text-amber-800">{rot.scores.income}</div>
                </div>
                <div className="bg-rose-50 p-1.5 rounded-xl border border-rose-200">
                  <div className="text-[10px] font-bold text-rose-700">Risk</div>
                  <div className="text-xs font-extrabold text-rose-800">{rot.scores.risk}</div>
                </div>
              </div>

              {/* 3 Action Buttons on EACH strategy card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-soil-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/game?strategy=${rot.id}`);
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-display font-extrabold text-xs shadow-tactile flex items-center justify-center gap-1.5 active:scale-95 transition ring-2 ring-amber-300"
                >
                  <Trophy className="w-4 h-4 text-stone-950" />
                  <span>{isTamil ? '🎮 விளையாட்டாக பரிசோதி' : '🎮 Test in Game'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectRotation(rot);
                    navigate('/timemachine?fullscreen=true');
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-cream-50 font-display font-extrabold text-xs shadow-tactile flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Maximize2 className="w-4 h-4 text-emerald-300" />
                  <span>{isTamil ? '🌾 நிலத்தை முழுத்திரையில் பார்' : '🌾 Simulate Land'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommitSeason(rot);
                  }}
                  className="btn-primary w-full py-2.5 px-3 text-xs font-bold shadow-tactile flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-wheat-400" />
                  <span>{isTamil ? '🏆 இச்சுழற்சியை உறுதி செய்' : '🏆 Commit Plan'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MASTER ANALYZE ALL STRATEGIES IN GAME MODE BUTTON */}
      <div className="pt-2 pb-2 text-center">
        <button
          type="button"
          onClick={() => setShowAllAnalysis(true)}
          className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:via-amber-500 hover:to-emerald-500 text-stone-950 font-display font-extrabold text-sm sm:text-base shadow-tactile-hover flex items-center justify-center gap-3 active:scale-98 transition transform ring-4 ring-amber-400/40 animate-pulse"
        >
          <Sliders className="w-5 h-5 text-stone-950" />
          <span>{isTamil ? '⚡ அனைத்து உத்திகளையும் ஒப்பிட்டு ஆராய் (ANALYZE ALL IN GAME MODE)' : '⚡ ANALYZE ALL STRATEGIES IN GAME MODE'}</span>
          <Trophy className="w-5 h-5 text-stone-950" />
        </button>
        <p className="text-[11px] text-soil-600 mt-1.5 font-medium">
          {isTamil 
            ? 'அனைத்து 5 உத்திகளையும் ஒரே முழுத்திரையில் வைத்து, காலநிலை மாற்றங்களை விளையாட்டாக சோதிக்கலாம்' 
            : 'Compare all 5 strategies on one full screen with real-time What-If climate simulation sliders'}
        </p>
      </div>

      {/* Selected Rotation Deep-Dive Section */}
      {selectedRotation && (
        <div className="space-y-6 pt-2">
          {/* Action Buttons: Full-Screen Simulation & Commit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate(`/game?strategy=${selectedRotation.id}`)}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-display font-extrabold text-xs sm:text-sm shadow-tactile flex items-center justify-center gap-2 active:scale-95 transition ring-2 ring-amber-300"
            >
              <Trophy className="w-5 h-5 text-stone-950" />
              <span>{isTamil ? '🎮 விளையாட்டாக பரிசோதி' : '🎮 Test in Game'}</span>
            </button>
            <button
              onClick={() => navigate('/timemachine?fullscreen=true')}
              className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-cream-50 font-display font-extrabold text-xs sm:text-sm shadow-tactile flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Maximize2 className="w-5 h-5 text-emerald-300" />
              <span>{isTamil ? '🌾 நிலத்தை முழுத்திரையில் பார்' : '🌾 Simulate Land'}</span>
            </button>
            <button
              onClick={handleCommitSeason}
              className="btn-primary w-full text-xs sm:text-sm font-bold shadow-tactile flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-wheat-400" />
              <span>{isTamil ? '🏆 இச்சுழற்சியை உறுதி செய்' : '🏆 Commit Plan'}</span>
            </button>
          </div>

          {/* Priority Weighting Transparency Box */}
          {selectedRotation.explanations && selectedRotation.explanations.length > 0 && (
            <div className="bg-wheat-50 border border-wheat-300 rounded-2xl p-4 text-xs text-soil-800 space-y-1">
              <div className="font-bold text-soil-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-wheat-600" />
                Transparent Priority Double-Weighting
              </div>
              {selectedRotation.explanations.map((exp, i) => (
                <div key={i} className="text-soil-700">• {exp}</div>
              ))}
            </div>
          )}

          {/* Soil Bank Nitrogen Ledger */}
          {soilBank && (
            <div className="card-heartland space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-soil-900">
                    Soil Bank (Biological Nitrogen Ledger)
                  </h3>
                  <p className="text-[11px] text-soil-600">Tracks nitrogen deposits from legumes vs corn withdrawals.</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-soil-500">Net 3-Yr N</div>
                  <div className={`font-display font-extrabold text-lg ${
                    soilBank.finalNetBalanceLbsPerAcre >= 0 ? 'text-field-700' : 'text-amber-700'
                  }`}>
                    {soilBank.finalNetBalanceLbsPerAcre >= 0 ? '+' : ''}{soilBank.finalNetBalanceLbsPerAcre} lbs N/ac
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {soilBank.ledger.map((entry) => (
                  <div key={entry.year} className="bg-cream-200 rounded-xl p-2.5 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-soil-900">Year {entry.year}: {entry.cropName}</span>
                      <div className="text-[11px] text-soil-600">{entry.description}</div>
                    </div>
                    <span className={`font-mono font-bold text-xs ${
                      entry.deltaNLbsPerAcre >= 0 ? 'text-field-700' : 'text-red-700'
                    }`}>
                      {entry.deltaNLbsPerAcre >= 0 ? '+' : ''}{entry.deltaNLbsPerAcre} lbs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical Climate Backtesting Box */}
          {backtest && (
            <div className="card-heartland space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-soil-900">
                    Historical Climate Backtest
                  </h3>
                  <p className="text-[11px] text-soil-600">Replayed across verified NASA POWER years</p>
                </div>
                <TrendingUp className="w-5 h-5 text-field-700" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-field-50 border border-field-200 p-3 rounded-2xl">
                  <div className="text-[10px] font-bold text-field-700 uppercase">Best Year: {backtest.bestYear?.year}</div>
                  <div className="font-bold text-soil-900 text-sm mt-0.5">{backtest.bestYear?.verdict}</div>
                  <div className="text-[11px] text-soil-600 mt-1">
                    Rain: {backtest.bestYear?.totalPrecipInches}" • {backtest.bestYear?.extremeHeatDays} days &gt;95°F
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl">
                  <div className="text-[10px] font-bold text-amber-700 uppercase">Worst Year: {backtest.worstYear?.year}</div>
                  <div className="font-bold text-soil-900 text-sm mt-0.5">{backtest.worstYear?.verdict}</div>
                  <div className="text-[11px] text-soil-600 mt-1">
                    Rain: {backtest.worstYear?.totalPrecipInches}" • {backtest.worstYear?.extremeHeatDays} days &gt;95°F
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-soil-700 italic">{backtest.summary}</p>
            </div>
          )}

          {/* Interactive What-If Stress Simulator */}
          <div className="card-heartland space-y-4 border-2 border-wheat-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-soil-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-wheat-600" />
                  What-If Climate Stress Simulator
                </h3>
                <p className="text-[11px] text-soil-600">Simulate warming, drought, or delayed planting</p>
              </div>
              {whatIfResult && (
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-soil-500">Simulated Score</div>
                  <div className="font-display font-extrabold text-xl text-wheat-700">
                    {activeScores.overall} <span className="text-xs text-soil-500">({whatIfResult.deltaOverall >= 0 ? '+' : ''}{whatIfResult.deltaOverall})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Slider Controls */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-soil-700 mb-1">
                  <span>Temperature Shift:</span>
                  <span className="font-bold">+{tempDelta}°F</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={tempDelta}
                  onChange={(e) => setTempDelta(parseFloat(e.target.value))}
                  className="w-full accent-field-700"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-soil-700 mb-1">
                  <span>Precipitation Anomaly:</span>
                  <span className="font-bold">{rainDelta >= 0 ? `+${rainDelta}` : rainDelta}%</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="20"
                  step="5"
                  value={rainDelta}
                  onChange={(e) => setRainDelta(parseFloat(e.target.value))}
                  className="w-full accent-field-700"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-soil-700 mb-1">
                  <span>Planting Date Delay:</span>
                  <span className="font-bold">{plantingDelay} days</span>
                </div>
                <input
                  type="range"
                  min="-14"
                  max="28"
                  step="7"
                  value={plantingDelay}
                  onChange={(e) => setPlantingDelay(parseInt(e.target.value))}
                  className="w-full accent-field-700"
                />
              </div>

              <button
                onClick={handleWhatIfSimulate}
                disabled={simulating}
                className="btn-gold w-full text-xs font-bold py-2.5 mt-2"
              >
                {simulating ? 'Calculating Impacts...' : 'Recalculate Scores Dynamically'}
              </button>
            </div>

            {/* Simulation Impact Feedback */}
            {whatIfResult && (
              <div className="bg-cream-200 rounded-2xl p-3.5 space-y-2 text-xs border border-soil-300 animate-in fade-in">
                <div className="font-bold text-soil-900 flex items-center justify-between">
                  <span>Resilience: {whatIfResult.resilienceRating}</span>
                  <span className="text-soil-600">{whatIfResult.deltaOverall} pts impact</span>
                </div>
                <div className="space-y-1 text-soil-700">
                  {whatIfResult.impactNotes.map((note, i) => (
                    <div key={i}>• {note}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Planting Window Test */}
          {plantingWindow && (
            <div className="card-heartland space-y-3">
              <div>
                <h3 className="font-display font-bold text-sm text-soil-900">
                  Planting Window Test
                </h3>
                <p className="text-[11px] text-soil-600">Historical last spring frost and 50°F soil warm-up thresholds</p>
              </div>

              <div className="bg-cream-200 p-3 rounded-2xl border border-soil-300 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-soil-600">Target Planting Window:</span>
                  <span className="font-bold text-field-800">{plantingWindow.optimalWindowSummary.targetStart} – {plantingWindow.optimalWindowSummary.targetEnd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soil-600">Average Last Frost (≤32°F):</span>
                  <span className="font-bold text-soil-900">{plantingWindow.optimalWindowSummary.averageLastFrost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soil-600">Soil Warm-Up (≥50°F):</span>
                  <span className="font-bold text-soil-900">{plantingWindow.optimalWindowSummary.springSoilWarmupAvg}</span>
                </div>
                <p className="text-[11px] text-soil-700 pt-1 leading-relaxed italic">
                  {plantingWindow.optimalWindowSummary.insight}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL SCREEN ALL STRATEGIES GAME MODE ANALYSIS MODAL */}
      {showAllAnalysis && (
        <AllStrategiesGameAnalysis
          isOpen={true}
          onClose={() => setShowAllAnalysis(false)}
          strategies={rotations}
          onCommitStrategy={handleCommitSeason}
          fieldLocation={{ name: profile?.name || 'தஞ்சாவூர்' }}
        />
      )}
    </div>
  );
}
