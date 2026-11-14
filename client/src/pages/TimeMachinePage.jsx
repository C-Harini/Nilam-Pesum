import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useField } from '../context/FieldContext';
import { useTranslation } from 'react-i18next';
import { timeMachineAPI } from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Clock, Play, Pause, SkipForward, FastForward, Award, ShieldAlert, CheckCircle2, Image as ImageIcon, Sparkles, X, Info, Maximize2 } from 'lucide-react';
import VisualLandSimulation from '../components/simulation/VisualLandSimulation';

export default function TimeMachinePage() {
  const { currentFieldId } = useField();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const isTamil = i18n.language === 'ta';

  // Full Screen Simulation State (auto-open if ?fullscreen=true)
  const [isFullScreenSim, setIsFullScreenSim] = useState(searchParams.get('fullscreen') === 'true');

  // Replay range for 2023 historical season
  const SEASON_START = '2023-04-15';
  const SEASON_END = '2023-10-31';

  const [currentDate, setCurrentDate] = useState('2023-06-15');
  const [snapshot, setSnapshot] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportCard, setReportCard] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const timerRef = useRef(null);

  const fetchSnapshot = async (dateStr) => {
    try {
      const res = await timeMachineAPI.getSnapshot(currentFieldId, dateStr);
      setSnapshot(res.data);
    } catch (e) {
      console.warn('Snapshot error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot(currentDate);
  }, [currentFieldId, currentDate]);

  // Autoplay playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentDate((prevDate) => {
          const d = new Date(prevDate);
          d.setDate(d.getDate() + 3); // Advance 3 days per tick
          const nextStr = d.toISOString().split('T')[0];
          if (nextStr > SEASON_END) {
            setIsPlaying(false);
            return SEASON_END;
          }
          return nextStr;
        });
      }, 900);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const stepDays = (days) => {
    setIsPlaying(false);
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    let nextStr = d.toISOString().split('T')[0];
    if (nextStr < SEASON_START) nextStr = SEASON_START;
    if (nextStr > SEASON_END) nextStr = SEASON_END;
    setCurrentDate(nextStr);
  };

  const handleOpenReport = async () => {
    try {
      const res = await timeMachineAPI.getReportCard(currentFieldId, 2023);
      setReportCard(res.data);
      setShowReportModal(true);
    } catch (e) {
      alert('Could not generate report: ' + e.message);
    }
  };

  // Convert dates to slider percentage (0 to 100)
  const startDateMs = new Date(SEASON_START).getTime();
  const endDateMs = new Date(SEASON_END).getTime();
  const currentDateMs = new Date(currentDate).getTime();
  const sliderVal = Math.round(((currentDateMs - startDateMs) / (endDateMs - startDateMs)) * 100);

  const handleSliderChange = (e) => {
    setIsPlaying(false);
    const pct = parseFloat(e.target.value);
    const targetMs = startDateMs + (pct / 100) * (endDateMs - startDateMs);
    const targetDateStr = new Date(targetMs).toISOString().split('T')[0];
    setCurrentDate(targetDateStr);
  };

  if (loading && !snapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-wheat-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm font-bold text-soil-800">Initializing Historical Time Machine Replay...</div>
        </div>
      </div>
    );
  }

  const { banner, currentWeather, seasonAccumulations, cropPhenology, ndviSeries, alerts = [], satelliteImagery } = snapshot || {};

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Historical Demonstration Banner with Full Screen Simulation Trigger */}
      <div className="bg-gradient-to-r from-wheat-500 to-wheat-600 rounded-3xl p-4 text-soil-900 shadow-tactile flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-soil-900 text-wheat-300 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-widest text-soil-800">
              Flagship Innovation Feature
            </div>
            <h1 className="font-display font-extrabold text-lg leading-tight text-soil-950">
              {isTamil ? 'விவசாய கால இயந்திரம்' : 'Agricultural Time Machine'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/game"
            className="px-3 py-2 bg-stone-950 hover:bg-stone-900 text-amber-300 border border-amber-400/50 rounded-xl text-xs font-display font-extrabold shadow-sm flex items-center gap-1.5 active:scale-95 transition"
          >
            <span>🎮</span>
            <span>{isTamil ? 'விவசாய விளையாட்டு' : 'Play Game'}</span>
          </Link>
          <button
            onClick={() => setIsFullScreenSim(true)}
            className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-cream-50 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 active:scale-95 transition"
          >
            <Maximize2 className="w-4 h-4 text-emerald-300" />
            <span>{isTamil ? 'முழுத்திரை' : 'Full Screen'}</span>
          </button>
          <button
            onClick={handleOpenReport}
            className="px-3 py-2 bg-cream-50 hover:bg-cream-100 text-soil-900 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95 transition"
          >
            <Award className="w-4 h-4 text-wheat-600" />
            <span className="hidden sm:inline">{isTamil ? 'அறிக்கை' : 'Report'}</span>
          </button>
        </div>
      </div>

      {/* Visual Living Land Simulation (Interactive Farmer View) */}
      <VisualLandSimulation 
        isFullScreenMode={isFullScreenSim} 
        onToggleFullScreen={() => setIsFullScreenSim(!isFullScreenSim)} 
      />

      {/* Official Data Notice */}
      <div className="text-center text-xs font-bold text-soil-700 bg-cream-50 border border-soil-200 rounded-2xl py-2 px-3">
        {banner}
      </div>

      {/* Replay Controls & Scrubber Card */}
      <div className="card-heartland space-y-4 border-2 border-soil-300 shadow-tactile">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-field-800 bg-field-100 px-3 py-1 rounded-xl">
              {currentDate}
            </span>
            <span className="text-xs font-semibold text-soil-600">
              Day {seasonAccumulations?.daysElapsed} of Season
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-soil-900">{cropPhenology?.currentStage}</span>
          </div>
        </div>

        {/* Scrubber Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={handleSliderChange}
            className="w-full accent-field-700 cursor-pointer h-2 bg-soil-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-soil-500 font-mono">
            <span>{SEASON_START} (Planting)</span>
            <span>{SEASON_END} (Harvest)</span>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => stepDays(-7)}
            className="p-2.5 rounded-2xl bg-cream-200 hover:bg-cream-300 text-soil-800 active:scale-95 transition"
            title="Step back 7 days"
          >
            <span className="text-xs font-bold">-7d</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`min-h-[52px] px-6 rounded-2xl font-display font-bold text-sm flex items-center gap-2 shadow-tactile active:scale-95 transition ${
              isPlaying
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-field-700 text-cream-50 hover:bg-field-800'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" /> Pause Replay
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Play Replay
              </>
            )}
          </button>

          <button
            onClick={() => stepDays(7)}
            className="p-2.5 rounded-2xl bg-cream-200 hover:bg-cream-300 text-soil-800 active:scale-95 transition"
            title="Next week (+7 days)"
          >
            <span className="text-xs font-bold">+7d</span>
          </button>

          <button
            onClick={() => stepDays(30)}
            className="p-2.5 rounded-2xl bg-cream-200 hover:bg-cream-300 text-soil-800 active:scale-95 transition"
            title="Next month (+30 days)"
          >
            <span className="text-xs font-bold">+30d</span>
          </button>
        </div>
      </div>

      {/* Real Historical Weather Metrics on this Date */}
      {currentWeather && (
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="card-heartland p-3">
            <div className="text-[10px] text-soil-500 font-bold uppercase">Root Wetness</div>
            <div className="font-display font-extrabold text-xl text-soil-900 mt-0.5">
              {currentWeather.rootWetnessPct}%
            </div>
            <div className="text-[10px] text-soil-600">Saturation</div>
          </div>

          <div className="card-heartland p-3">
            <div className="text-[10px] text-soil-500 font-bold uppercase">Season Rain</div>
            <div className="font-display font-extrabold text-xl text-soil-900 mt-0.5">
              {seasonAccumulations.cumulativeRainInches}"
            </div>
            <div className="text-[10px] text-soil-600">Cumulative</div>
          </div>

          <div className="card-heartland p-3">
            <div className="text-[10px] text-soil-500 font-bold uppercase">Heat (GDD)</div>
            <div className="font-display font-extrabold text-xl text-soil-900 mt-0.5">
              {seasonAccumulations.cumulativeGDD}
            </div>
            <div className="text-[10px] text-soil-600">Base 50°F</div>
          </div>
        </div>
      )}

      {/* Expected vs Actual NDVI Growth Chart */}
      <div className="card-heartland space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-soil-900">
              Canopy Growth: Expected vs. Actual Satellite NDVI
            </h3>
            <p className="text-[11px] text-soil-600">
              Solid dots = Measured MODIS observations; Hollow = Gap-filled estimates
            </p>
          </div>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ndviSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6D4C41' }} />
              <YAxis domain={[0.1, 1.0]} tick={{ fontSize: 9, fill: '#6D4C41' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #BCAAA4', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                name="Expected Phenology Curve"
                type="monotone"
                dataKey="expectedNdvi"
                stroke="#B45309"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                name="Actual Satellite NDVI"
                type="monotone"
                dataKey="actualNdvi"
                stroke="#16A34A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#16A34A' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NASA GIBS Satellite Imagery Tile */}
      <div className="card-heartland space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-soil-900 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-field-700" />
              NASA GIBS Satellite Earth Imagery
            </h3>
            <p className="text-[11px] text-soil-600">MODIS Terra True-Color Satellite Tile</p>
          </div>
          {satelliteImagery?.available && (
            <span className="font-mono text-[10px] text-soil-600 bg-cream-200 px-2 py-0.5 rounded-md font-bold">
              Tile Date: {satelliteImagery.imageDate}
            </span>
          )}
        </div>

        {satelliteImagery?.available ? (
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-soil-300 shadow-inner group">
            <img
              src={satelliteImagery.imageUrl}
              alt="NASA GIBS Satellite Imagery"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-soil-900/80 backdrop-blur text-cream-50 text-[10px] p-2 rounded-xl text-center">
              {satelliteImagery.provider}
            </div>
          </div>
        ) : (
          <div className="bg-cream-200 rounded-2xl p-4 text-center text-xs text-soil-600 italic border border-soil-300">
            {satelliteImagery?.reason || 'Satellite imagery unavailable for this date.'}
          </div>
        )}
      </div>

      {/* Replay Triggers / Alerts on this Day */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs space-y-1">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            Alert Triggered on {currentDate}
          </div>
          {alerts.map((a, i) => (
            <div key={i} className="text-soil-800">
              • <span className="font-semibold">{a.title}</span> ({a.metric})
            </div>
          ))}
        </div>
      )}

      {/* Season Final Report Card Modal */}
      {showReportModal && reportCard && (
        <div className="fixed inset-0 z-50 bg-soil-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream-50 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-soil-300 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 text-soil-500 hover:text-soil-900 rounded-full hover:bg-cream-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-wheat-700 bg-wheat-100 px-3 py-1 rounded-full">
                NASA Replay Verdict
              </span>
              <h2 className="font-display font-extrabold text-2xl text-soil-900 mt-2">
                2023 Season Report Card
              </h2>
              <p className="text-xs text-soil-600">{reportCard.fieldName}</p>
            </div>

            <div className="bg-cream-200 rounded-2xl p-4 text-center mb-4 border border-soil-300">
              <div className="text-xs uppercase font-bold text-soil-500">Season Grade</div>
              <div className="font-display font-extrabold text-4xl text-field-700 my-1">
                {reportCard.grade}
              </div>
              <div className="font-bold text-sm text-soil-900">{reportCard.verdict}</div>
            </div>

            <div className="space-y-2.5 text-xs text-soil-800 mb-4">
              <div className="flex justify-between py-1 border-b border-soil-200">
                <span className="text-soil-600">Total Rainfall:</span>
                <span className="font-bold">{reportCard.metrics.totalSeasonalRainInches}" ({reportCard.metrics.rainAnomalyPct}% vs normal)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-soil-200">
                <span className="text-soil-600">Peak Observed NDVI:</span>
                <span className="font-bold">{reportCard.metrics.peakNdviObserved} on {reportCard.metrics.peakNdviDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-soil-200">
                <span className="text-soil-600">Extreme Heat Days (&gt;95°F):</span>
                <span className="font-bold">{reportCard.metrics.heatStressDaysAbove95F} days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-soil-200">
                <span className="text-soil-600">Soil Bank Nitrogen Balance:</span>
                <span className="font-bold text-red-700">{reportCard.metrics.soilBankImpact.nitrogenRemovedLbsPerAcre} lbs N/ac uptake</span>
              </div>
            </div>

            {/* Next Season Suggestions */}
            <div className="bg-field-50 border border-field-200 rounded-2xl p-3.5 mb-4 space-y-1.5 text-xs">
              <div className="font-bold text-field-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-field-700" />
                Next Season Recommendations:
              </div>
              {reportCard.recommendations.map((rec, i) => (
                <div key={i} className="text-soil-800">• {rec}</div>
              ))}
            </div>

            {/* Scientific Transparency Notice */}
            <div className="bg-soil-100 rounded-xl p-3 text-[11px] text-soil-700 italic border border-soil-200 mb-4">
              {reportCard.disclaimer}
            </div>

            <button
              onClick={() => setShowReportModal(false)}
              className="btn-primary w-full py-3 text-xs font-bold"
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
