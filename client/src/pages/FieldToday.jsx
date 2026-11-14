import React, { useState } from 'react';
import { useField } from '../context/FieldContext';
import { useVoice } from '../context/VoiceContext';
import DataPassportModal from '../components/common/DataPassportModal';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Droplets, Thermometer, Sprout, ShieldAlert, Volume2, Info, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export default function FieldToday() {
  const { fieldToday, loading, error, refreshFieldData } = useField();
  const { speak, isSpeaking, stopSpeaking } = useVoice();
  const [activePassport, setActivePassport] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-field-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm font-bold text-soil-800">Retrieving NASA Agroclimatology Records...</div>
        </div>
      </div>
    );
  }

  if (error || !fieldToday) {
    return (
      <div className="p-6 text-center max-w-md mx-auto">
        <div className="card-heartland border-red-300">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h2 className="font-bold text-soil-900 mb-1">Could Not Load Field Data</h2>
          <p className="text-xs text-soil-600 mb-4">{error || 'Please check that data/fields directory exists.'}</p>
          <button onClick={refreshFieldData} className="btn-primary py-2 text-xs">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { metrics, passports, health, spokenSummary, fieldName, latestDate, mode } = fieldToday;

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(spokenSummary);
    }
  };

  const tempChartData = metrics.temperature?.trend7d?.map(d => ({
    date: d.date.substring(5), // MM-DD
    Max: d.tempMaxF,
    Min: d.tempMinF
  })) || [];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-5">
      {/* Top Header Card */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-soil-600">
            Observation As Of {latestDate}
          </span>
          <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight">
            Field Today
          </h1>
          <p className="text-xs font-semibold text-field-700">{fieldName}</p>
        </div>

        {/* Spoken Audio Readout Button */}
        <button
          onClick={handleReadAloud}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition active:scale-95 ${
            isSpeaking
              ? 'bg-wheat-200 border-wheat-500 text-soil-900 animate-pulse'
              : 'bg-cream-50 border-soil-200 text-soil-800 hover:bg-cream-200'
          }`}
        >
          <Volume2 className="w-4 h-4 text-field-700" />
          <span>{isSpeaking ? 'Pause Audio' : 'Read Aloud'}</span>
        </button>
      </div>

      {/* Field Health Status Banner */}
      <div
        className="rounded-3xl p-4 border flex items-start gap-3 shadow-tactile"
        style={{
          backgroundColor: health.status === 'Healthy' ? '#F0FDF4' : health.status === 'Dry' ? '#FFFBEB' : '#FEF2F2',
          borderColor: health.color
        }}
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
          style={{ backgroundColor: health.color }}
        >
          {health.status === 'Healthy' ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-soil-900">
              Field Status: {health.status}
            </h3>
            <span
              className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${health.color}20`, color: health.color }}
            >
              {health.badge}
            </span>
          </div>
          <p className="text-xs text-soil-700 mt-1 leading-relaxed">
            {health.summary}
          </p>
        </div>
      </div>

      {/* 2x2 Primary Measurements Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Metric 1: Root-Zone Soil Wetness */}
        <div className="card-heartland flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-soil-600 uppercase">Root Wetness</span>
              <button
                onClick={() => setActivePassport(passports.rootZoneWetness)}
                className="text-soil-400 hover:text-field-700"
                title="View NASA Data Passport"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="font-display font-extrabold text-2xl text-soil-900">
              {metrics.rootZoneWetnessPct}%
            </div>
            <div className="text-[11px] text-soil-600 mt-0.5">
              0-100cm profile saturation
            </div>
          </div>
          <button
            onClick={() => setActivePassport(passports.rootZoneWetness)}
            className="mt-3 text-[11px] font-bold text-field-700 flex items-center gap-1 hover:underline"
          >
            Data Passport <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 2: 30-Day Rainfall */}
        <div className="card-heartland flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-soil-600 uppercase">30-Day Rain</span>
              <button
                onClick={() => setActivePassport(passports.rainfall30d)}
                className="text-soil-400 hover:text-field-700"
                title="View NASA Data Passport"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="font-display font-extrabold text-2xl text-soil-900">
              {metrics.rainfall30d.totalLast30dInches}"
            </div>
            <div className="text-[11px] text-soil-600 flex items-center gap-1 mt-0.5">
              {metrics.rainfall30d.diffPct >= 0 ? (
                <span className="text-field-700 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3" />+{metrics.rainfall30d.diffPct}%
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center">
                  <ArrowDownRight className="w-3 h-3" />{metrics.rainfall30d.diffPct}%
                </span>
              )}
              <span>vs normal ({metrics.rainfall30d.historicalAvg30dInches}")</span>
            </div>
          </div>
          <button
            onClick={() => setActivePassport(passports.rainfall30d)}
            className="mt-3 text-[11px] font-bold text-field-700 flex items-center gap-1 hover:underline"
          >
            Data Passport <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 3: Air Temperature */}
        <div className="card-heartland flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-soil-600 uppercase">Temperature</span>
              <button
                onClick={() => setActivePassport(passports.temperature7d)}
                className="text-soil-400 hover:text-field-700"
                title="View NASA Data Passport"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="font-display font-extrabold text-2xl text-soil-900">
              {metrics.temperature.currentF}°F
            </div>
            <div className="text-[11px] text-soil-600 mt-0.5">
              High: {metrics.temperature.maxF}°F • Low: {metrics.temperature.minF}°F
            </div>
          </div>
          <button
            onClick={() => setActivePassport(passports.temperature7d)}
            className="mt-3 text-[11px] font-bold text-field-700 flex items-center gap-1 hover:underline"
          >
            Data Passport <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 4: Satellite NDVI */}
        <div className="card-heartland flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-soil-600 uppercase">Satellite NDVI</span>
              <button
                onClick={() => setActivePassport(passports.ndvi)}
                className="text-soil-400 hover:text-field-700"
                title="View NASA Data Passport"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="font-display font-extrabold text-2xl text-soil-900">
              {metrics.ndvi ? metrics.ndvi.value.toFixed(3) : 'N/A'}
            </div>
            <div className="text-[11px] text-soil-600 mt-0.5">
              {metrics.ndvi?.interpolated ? 'Interpolated estimate' : 'Measured satellite radiometry'}
            </div>
          </div>
          <button
            onClick={() => setActivePassport(passports.ndvi)}
            className="mt-3 text-[11px] font-bold text-field-700 flex items-center gap-1 hover:underline"
          >
            Data Passport <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 7-Day Temperature Trend Chart */}
      <div className="card-heartland space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-soil-900">
              7-Day Temperature Range (°F)
            </h3>
            <p className="text-[11px] text-soil-600">Daily high and low observations via NASA POWER</p>
          </div>
          <Thermometer className="w-5 h-5 text-wheat-600" />
        </div>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6D4C41' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#6D4C41' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #BCAAA4', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="Max" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Min" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Soil Horizon Specs */}
      {metrics.soil && (
        <div className="card-heartland bg-cream-50 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-xs text-soil-900 uppercase tracking-wider">
              Soil Profile (USDA SSURGO Ground Truth)
            </h4>
            <button
              onClick={() => setActivePassport(passports.soilProfile)}
              className="text-[11px] font-bold text-field-700 hover:underline flex items-center gap-1"
            >
              Passport <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-cream-200 p-2.5 rounded-xl border border-soil-300">
              <div className="text-[10px] text-soil-600">Texture</div>
              <div className="font-bold text-soil-900">{metrics.soil.texture}</div>
            </div>
            <div className="bg-cream-200 p-2.5 rounded-xl border border-soil-300">
              <div className="text-[10px] text-soil-600">Organic Matter</div>
              <div className="font-bold text-soil-900">{metrics.soil.organicMatterPct}%</div>
            </div>
            <div className="bg-cream-200 p-2.5 rounded-xl border border-soil-300">
              <div className="text-[10px] text-soil-600">Avail. Water Cap.</div>
              <div className="font-bold text-soil-900">{metrics.soil.awcInches}"/ft</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Data Passport Modal */}
      {activePassport && (
        <DataPassportModal
          passport={activePassport}
          onClose={() => setActivePassport(null)}
        />
      )}
    </div>
  );
}
