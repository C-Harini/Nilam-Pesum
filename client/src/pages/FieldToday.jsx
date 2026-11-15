import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useField } from '../context/FieldContext';
import { useVoice } from '../context/VoiceContext';
import { useTranslation } from 'react-i18next';
import DataPassportModal from '../components/common/DataPassportModal';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Droplets, Thermometer, Sprout, ShieldAlert, Volume2, Info, ArrowUpRight, ArrowDownRight, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export default function FieldToday() {
  const { fieldToday, profile, loading, error, refreshFieldData } = useField();
  const { user } = useAuth();
  const { speak, isSpeaking, stopSpeaking } = useVoice();
  const { t, i18n } = useTranslation();
  const [activePassport, setActivePassport] = useState(null);

  const isTamil = i18n.language === 'ta';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-field-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm font-bold text-soil-800">
            {isTamil ? 'நாசா புவி கண்காணிப்புத் தரவுகளைப் பெறுகிறது...' : 'Retrieving NASA Agroclimatology Records...'}
          </div>
        </div>
      </div>
    );
  }

  if (error || !fieldToday) {
    return (
      <div className="p-6 text-center max-w-md mx-auto">
        <div className="card-heartland border-red-300">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h2 className="font-bold text-soil-900 mb-1">
            {isTamil ? 'வயல் தரவை ஏற்ற முடியவில்லை' : 'Could Not Load Field Data'}
          </h2>
          <p className="text-xs text-soil-600 mb-4">{error}</p>
          <button onClick={refreshFieldData} className="btn-primary py-2 text-xs">
            {isTamil ? 'மீண்டும் முயற்சிக்க' : 'Retry Connection'}
          </button>
        </div>
      </div>
    );
  }

  const { metrics, passports, health, spokenSummary, fieldName, latestDate } = fieldToday;

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const summaryText = isTamil
        ? `இன்றைய நில நிலவரம்: உங்கள் நிலத்தின் வேர் மண்டல மண் ஈரப்பதம் ${metrics.rootZoneWetnessPct}% ஆக உள்ளது. கடந்த 30 நாட்களில் ${metrics.rainfall30d.totalLast30dInches} அங்குல மழை பதிவாகியுள்ளது. நிலத்தின் தற்போதைய நிலை: ${health.status}.`
        : spokenSummary;
      speak(summaryText);
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
            {isTamil ? `நாசா ஆய்வுத் தேதி: ${latestDate}` : `Observation As Of ${latestDate}`}
          </span>
          <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight">
            {t('today.title')}
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
          <span>{isSpeaking ? t('today.pause_audio') : t('today.read_aloud')}</span>
        </button>
      </div>

      {/* Particular Farmer's Personalized Land Overview Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-field-950 text-cream-50 rounded-3xl p-4 sm:p-5 border-2 border-field-600/50 shadow-tactile space-y-3 animate-in fade-in">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-field-600/40 border border-field-400 flex items-center justify-center text-wheat-400 font-extrabold text-xl flex-shrink-0 shadow-sm">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isTamil ? 'உறுதிசெய்யப்பட்ட விவசாயி சுயவிவரம்' : 'Verified Farmer Profile'}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-cream-100 mt-0.5">
                {profile?.name || (user?.name ? `${user.name} பண்ணை` : fieldName)}
              </h2>
              <div className="text-xs text-soil-300 flex items-center gap-1.5 mt-0.5">
                <span>👤 {user?.name || profile?.farmerName || (isTamil ? 'விவசாயி' : 'Farmer')}</span>
                <span>•</span>
                <span>📍 {profile?.location?.name || profile?.county || (isTamil ? 'தஞ்சாவூர், தமிழ்நாடு' : 'Thanjavur, TN')}</span>
              </div>
            </div>
          </div>

          <Link
            to="/plan"
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-sm active:scale-95 transition flex items-center gap-1 flex-shrink-0"
          >
            <span>{isTamil ? 'பயிர் திட்டம்' : 'View Plan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Key Farmer Details Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-soil-800 text-xs">
          <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
            <div className="text-[10px] text-soil-400">{isTamil ? 'நிலப்பரப்பு' : 'Land Area'}</div>
            <div className="font-extrabold text-amber-300">{profile?.areaAcres || 5} {isTamil ? 'ஏக்கர்' : 'Acres'}</div>
          </div>
          <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
            <div className="text-[10px] text-soil-400">{isTamil ? 'மண் வகை' : 'Soil Texture'}</div>
            <div className="font-extrabold text-cream-200 truncate">{profile?.soil?.texture?.split('(')[0] || (isTamil ? 'வண்டல் மண்' : 'Clay Loam')}</div>
          </div>
          <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
            <div className="text-[10px] text-soil-400">{isTamil ? 'பாசன முறை' : 'Water Source'}</div>
            <div className="font-extrabold text-cyan-300 capitalize">{profile?.waterSource === 'irrigated' ? (isTamil ? 'பாசனம்' : 'Irrigated') : (isTamil ? 'மானாவாரி' : 'Rainfed')}</div>
          </div>
          <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
            <div className="text-[10px] text-soil-400">{isTamil ? 'முந்தைய பயிர்' : 'Previous Crop'}</div>
            <div className="font-extrabold text-emerald-300 capitalize">{profile?.currentCrop || (isTamil ? 'சம்பா நெல்' : 'Paddy')}</div>
          </div>
        </div>
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
              {isTamil ? 'வயலின் தற்போதைய நிலை' : 'Field Status'}: {health.status}
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

      {/* 1-Tap Shortcut to Full-Screen Farm Game Simulation */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 rounded-3xl p-4 text-stone-950 shadow-tactile flex items-center justify-between border-2 border-amber-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-950 text-amber-400 flex items-center justify-center flex-shrink-0 text-2xl shadow-lg border border-amber-400/50">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-stone-950 text-amber-300">
                {isTamil ? 'முழுத்திரை விளையாட்டு' : 'Full Screen Game'}
              </span>
              <span className="text-[10px] font-bold text-stone-900">Tamil Voice+</span>
            </div>
            <h3 className="font-display font-extrabold text-base text-stone-950 mt-0.5">
              {isTamil ? 'விவசாய விளையாட்டு மாதிரி' : 'Interactive Farm Game Simulation'}
            </h3>
            <p className="text-[11px] font-semibold text-stone-900 leading-snug">
              {isTamil ? 'உத்திகளைத் தேர்வு செய்து, விதைத்து, நீர் பாய்ச்சி அறுவடை செய்யுங்கள்!' : 'Choose strategy quests, irrigate, bio-fertilize & harvest in full screen!'}
            </p>
          </div>
        </div>
        <Link
          to="/game"
          className="px-4 py-3 rounded-2xl bg-stone-950 hover:bg-stone-900 text-amber-300 font-display font-extrabold text-xs shadow-tactile active:scale-95 transition flex items-center gap-1.5 flex-shrink-0 border border-amber-400/50"
        >
          <span>{isTamil ? 'விளையாடு' : 'Play Game'}</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </Link>
      </div>

      {/* 2x2 Primary Measurements Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Metric 1: Root-Zone Soil Wetness */}
        <div className="card-heartland flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-soil-600 uppercase">
                {t('today.root_wetness')}
              </span>
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
              {isTamil ? 'வேர் மண்டல மண் பூரித அளவு' : '0-100cm profile saturation'}
            </div>
          </div>
          <button
            onClick={() => setActivePassport(passports.rootZoneWetness)}
            className="mt-3 text-[11px] font-bold text-field-700 flex items-center gap-1 hover:underline"
          >
            {t('today.passport_btn')} <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 2: 30-Day Rainfall */}
        <div className="card-heartland flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-soil-600 uppercase">
                {t('today.rainfall_30d')}
              </span>
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
              <span>{isTamil ? 'சராசரியை விட' : 'vs normal'}</span>
            </div>
          </div>
          <button
            onClick={() => setActivePassport(passports.rainfall30d)}
            className="mt-3 text-[11px] font-bold text-field-700 flex items-center gap-1 hover:underline"
          >
            {t('today.passport_btn')} <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 3: Air Temperature */}
        <div className="card-heartland flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-soil-600 uppercase">
                {t('today.temp_trend')}
              </span>
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
              {isTamil ? `அதிகபட்சம்: ${metrics.temperature.maxF}°F • குறைவு: ${metrics.temperature.minF}°F` : `High: ${metrics.temperature.maxF}°F • Low: ${metrics.temperature.minF}°F`}
            </div>
          </div>
          <button
            onClick={() => setActivePassport(passports.temperature7d)}
            className="mt-3 text-[11px] font-bold text-field-700 flex items-center gap-1 hover:underline"
          >
            {t('today.passport_btn')} <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 4: Satellite NDVI */}
        <div className="card-heartland flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-soil-600 uppercase">
                {t('today.ndvi')}
              </span>
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
              {metrics.ndvi?.interpolated
                ? (isTamil ? 'இடைச்செருகல் மதிப்பீடு' : 'Interpolated estimate')
                : (isTamil ? 'MODIS நேரடி செயற்கைக்கோள் பதிவு' : 'Measured satellite radiometry')}
            </div>
          </div>
          <button
            onClick={() => setActivePassport(passports.ndvi)}
            className="mt-3 text-[11px] font-bold text-field-700 flex items-center gap-1 hover:underline"
          >
            {t('today.passport_btn')} <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 7-Day Temperature Trend Chart */}
      <div className="card-heartland space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-soil-900">
              {isTamil ? '7-நாள் வெப்பநிலை போக்கு (°F)' : '7-Day Temperature Range (°F)'}
            </h3>
            <p className="text-[11px] text-soil-600">
              {isTamil ? 'நாசா POWER தினசரி வெப்பநிலை பதிவுகள்' : 'Daily high and low observations via NASA POWER'}
            </p>
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
              {t('today.soil_profile')}
            </h4>
            <button
              onClick={() => setActivePassport(passports.soilProfile)}
              className="text-[11px] font-bold text-field-700 hover:underline flex items-center gap-1"
            >
              {t('today.passport_btn')} <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-cream-200 p-2.5 rounded-xl border border-soil-300">
              <div className="text-[10px] text-soil-600">{isTamil ? 'மண் வகை' : 'Texture'}</div>
              <div className="font-bold text-soil-900">{metrics.soil.texture}</div>
            </div>
            <div className="bg-cream-200 p-2.5 rounded-xl border border-soil-300">
              <div className="text-[10px] text-soil-600">{isTamil ? 'அங்கக கரிம அளவு' : 'Organic Matter'}</div>
              <div className="font-bold text-soil-900">{metrics.soil.organicMatterPct}%</div>
            </div>
            <div className="bg-cream-200 p-2.5 rounded-xl border border-soil-300">
              <div className="text-[10px] text-soil-600">{isTamil ? 'நீர் தக்கவைப்பு' : 'Avail. Water Cap.'}</div>
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
