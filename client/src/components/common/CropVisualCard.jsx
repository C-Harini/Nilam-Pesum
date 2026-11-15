import React from 'react';
import { Droplets, Sprout, Calendar, Sparkles } from 'lucide-react';

/**
 * Botanical & Agronomic Crop Visual Card
 * Displays distinctive, illustrated SVG graphic and agronomic data
 * for each crop in Tamil Nadu and global rotation sequences.
 */
export const CROP_VISUAL_DATA = {
  paddy: {
    tamilName: 'சம்பா நெல்',
    englishName: 'Samba Paddy (Rice)',
    variety: 'CR-1009 / BPT-5204',
    season: 'சம்பா பருவம் (Sep - Jan)',
    durationDays: 135,
    waterInches: 38.0,
    waterLevel: 'அதிக நீர் (High)',
    nitrogenLbs: -110,
    bgGradient: 'from-amber-500/20 via-emerald-600/15 to-stone-900/40',
    borderColor: 'border-amber-400/60',
    badgeColor: 'bg-amber-400/20 text-amber-800 border-amber-400',
    accentColor: '#f59e0b',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="paddyGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="paddyLeaf" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        {/* Water puddle base */}
        <ellipse cx="50" cy="88" rx="35" ry="8" fill="#38bdf8" opacity="0.35" />
        <ellipse cx="50" cy="88" rx="24" ry="4" fill="#0284c7" opacity="0.4" />
        {/* Stems */}
        <path d="M48 88 Q46 65 44 40" stroke="url(#paddyLeaf)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M52 88 Q56 60 62 35" stroke="url(#paddyLeaf)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Curving Rice Leaves */}
        <path d="M47 70 Q30 60 18 68 Q32 50 46 62" fill="url(#paddyLeaf)" />
        <path d="M53 66 Q72 55 84 64 Q68 46 53 58" fill="url(#paddyLeaf)" />
        {/* Arching Golden Panicle */}
        <path d="M44 40 Q40 22 28 16 Q36 26 44 38" fill="none" stroke="url(#paddyGold)" strokeWidth="2.5" />
        {/* Rice Grains */}
        <ellipse cx="30" cy="18" rx="3.5" ry="2" transform="rotate(-30 30 18)" fill="url(#paddyGold)" stroke="#854d0e" strokeWidth="0.5" />
        <ellipse cx="35" cy="22" rx="3.5" ry="2" transform="rotate(-40 35 22)" fill="url(#paddyGold)" stroke="#854d0e" strokeWidth="0.5" />
        <ellipse cx="39" cy="28" rx="3.5" ry="2" transform="rotate(-50 39 28)" fill="url(#paddyGold)" stroke="#854d0e" strokeWidth="0.5" />
        <ellipse cx="43" cy="34" rx="3.5" ry="2" transform="rotate(-60 43 34)" fill="url(#paddyGold)" stroke="#854d0e" strokeWidth="0.5" />
        <ellipse cx="26" cy="22" rx="3" ry="1.8" transform="rotate(-20 26 22)" fill="url(#paddyGold)" />
        {/* Second panicle */}
        <path d="M62 35 Q68 20 78 16 Q72 26 62 33" fill="none" stroke="url(#paddyGold)" strokeWidth="2.5" />
        <ellipse cx="76" cy="18" rx="3.5" ry="2" transform="rotate(30 76 18)" fill="url(#paddyGold)" stroke="#854d0e" strokeWidth="0.5" />
        <ellipse cx="71" cy="23" rx="3.5" ry="2" transform="rotate(40 71 23)" fill="url(#paddyGold)" stroke="#854d0e" strokeWidth="0.5" />
        <ellipse cx="66" cy="29" rx="3.5" ry="2" transform="rotate(50 66 29)" fill="url(#paddyGold)" stroke="#854d0e" strokeWidth="0.5" />
      </svg>
    )
  },

  black_gram: {
    tamilName: 'உளுந்து (பயறு)',
    englishName: 'Black Gram (Urad)',
    variety: 'VBN-8 / ADT-5 Relay',
    season: 'தாளடிப் பருவம் (Jan - Apr)',
    durationDays: 75,
    waterInches: 11.0,
    waterLevel: 'குறைந்த நீர் (Low)',
    nitrogenLbs: 55,
    bgGradient: 'from-emerald-600/20 via-teal-800/15 to-stone-900/40',
    borderColor: 'border-emerald-500/60',
    badgeColor: 'bg-emerald-500/20 text-emerald-800 border-emerald-400',
    accentColor: '#10b981',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="podGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="podDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
        </defs>
        {/* Soil Base with Rhizobium root nodules */}
        <ellipse cx="50" cy="88" rx="32" ry="6" fill="#78350f" opacity="0.3" />
        <circle cx="46" cy="85" r="2.5" fill="#f43f5e" opacity="0.8" title="Rhizobium N2 nodule" />
        <circle cx="53" cy="86" r="2" fill="#f43f5e" opacity="0.8" />
        <circle cx="50" cy="83" r="2.2" fill="#fb7185" opacity="0.9" />
        {/* Main Stem */}
        <path d="M50 85 Q49 55 51 25" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Trifoliate Leaves */}
        <ellipse cx="36" cy="45" rx="10" ry="6" transform="rotate(-30 36 45)" fill="url(#podDark)" />
        <ellipse cx="64" cy="42" rx="10" ry="6" transform="rotate(30 64 42)" fill="url(#podDark)" />
        <ellipse cx="50" cy="22" rx="9" ry="6" transform="rotate(0 50 22)" fill="url(#podDark)" />
        {/* Pod Cluster with black gram pods */}
        <path d="M49 50 Q36 58 24 55 Q36 62 48 54" fill="url(#podGreen)" stroke="#14532d" strokeWidth="1" />
        <path d="M51 52 Q64 62 76 58 Q64 65 52 56" fill="url(#podGreen)" stroke="#14532d" strokeWidth="1" />
        <path d="M50 42 Q40 34 32 30 Q42 38 49 44" fill="url(#podGreen)" stroke="#14532d" strokeWidth="1" />
        <path d="M51 40 Q62 33 70 28 Q60 38 52 42" fill="url(#podGreen)" stroke="#14532d" strokeWidth="1" />
        {/* Black Seeds inside peek */}
        <circle cx="34" cy="57" r="1.8" fill="#18181b" stroke="#f4f4f5" strokeWidth="0.5" />
        <circle cx="66" cy="60" r="1.8" fill="#18181b" stroke="#f4f4f5" strokeWidth="0.5" />
      </svg>
    )
  },

  sesame: {
    tamilName: 'எள் (எண்ணெய்வித்து)',
    englishName: 'Sesame (Gingelly)',
    variety: 'TMV-7 / VRI-3',
    season: 'கோடைப் பட்டம் (Mar - Jun)',
    durationDays: 85,
    waterInches: 9.5,
    waterLevel: 'வறட்சி தாங்கும் (Very Low)',
    nitrogenLbs: -20,
    bgGradient: 'from-amber-600/20 via-yellow-700/15 to-stone-900/40',
    borderColor: 'border-yellow-500/60',
    badgeColor: 'bg-yellow-500/20 text-yellow-800 border-yellow-400',
    accentColor: '#eab308',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="sesameFlower" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>
        {/* Dry Sandy Soil Base */}
        <ellipse cx="50" cy="88" rx="30" ry="5" fill="#a16207" opacity="0.3" />
        {/* Upright Central Stem */}
        <path d="M50 88 L50 20" stroke="#65a30d" strokeWidth="3.2" strokeLinecap="round" />
        {/* Slender Lanceolate Leaves */}
        <path d="M50 72 Q30 70 20 62 Q35 60 50 68" fill="#4d7c0f" />
        <path d="M50 68 Q70 66 80 58 Q65 56 50 64" fill="#4d7c0f" />
        <path d="M50 50 Q32 46 25 38 Q40 40 50 46" fill="#4d7c0f" />
        <path d="M50 46 Q68 42 75 34 Q60 36 50 42" fill="#4d7c0f" />
        {/* Tubular Sesame Flowers (White-Yellow bells) */}
        <path d="M48 35 C42 32 38 28 42 24 C46 22 48 26 49 32 Z" fill="url(#sesameFlower)" stroke="#ca8a04" strokeWidth="0.8" />
        <path d="M52 32 C58 29 62 25 58 21 C54 19 52 23 51 29 Z" fill="url(#sesameFlower)" stroke="#ca8a04" strokeWidth="0.8" />
        {/* Capsule Seed Pods */}
        <rect x="44" y="55" width="4" height="8" rx="2" fill="#84cc16" stroke="#4d7c0f" strokeWidth="0.8" />
        <rect x="52" y="53" width="4" height="8" rx="2" fill="#84cc16" stroke="#4d7c0f" strokeWidth="0.8" />
        <rect x="44" y="40" width="3.5" height="7" rx="1.8" fill="#a3e635" stroke="#4d7c0f" strokeWidth="0.8" />
        {/* Golden Sesame Seeds Floating */}
        <ellipse cx="72" cy="74" rx="2.5" ry="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <ellipse cx="78" cy="72" rx="2.5" ry="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
        <ellipse cx="74" cy="78" rx="2.5" ry="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
      </svg>
    )
  },

  sunn_hemp: {
    tamilName: 'சணப்பை (பசுந்தாள்)',
    englishName: 'Sunn Hemp (Green Manure)',
    variety: 'Co-1 Green Manure',
    season: 'கோடை இடைப்பருவம் (May - Jul)',
    durationDays: 45,
    waterInches: 6.0,
    waterLevel: 'மிகக் குறைந்த நீர் (Super Low)',
    nitrogenLbs: 80,
    bgGradient: 'from-yellow-400/25 via-emerald-700/20 to-stone-900/40',
    borderColor: 'border-yellow-400/70',
    badgeColor: 'bg-yellow-400/25 text-yellow-900 border-yellow-400',
    accentColor: '#facc15',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="sunnFlower" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
        {/* Soil with Active Root Biomass */}
        <ellipse cx="50" cy="88" rx="34" ry="6" fill="#451a03" opacity="0.4" />
        <path d="M47 88 Q40 94 36 98" stroke="#f43f5e" strokeWidth="1.5" fill="none" />
        <path d="M53 88 Q60 95 65 98" stroke="#f43f5e" strokeWidth="1.5" fill="none" />
        {/* Robust Vigorous Shoot */}
        <path d="M50 88 L50 24" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
        {/* Abundant Foliage */}
        <ellipse cx="36" cy="68" rx="11" ry="5" transform="rotate(-20 36 68)" fill="#22c55e" />
        <ellipse cx="64" cy="66" rx="11" ry="5" transform="rotate(20 64 66)" fill="#22c55e" />
        <ellipse cx="38" cy="50" rx="10" ry="4.5" transform="rotate(-15 38 50)" fill="#16a34a" />
        <ellipse cx="62" cy="48" rx="10" ry="4.5" transform="rotate(15 62 48)" fill="#16a34a" />
        {/* Bright Golden Butterfly Flowers at Apex */}
        <path d="M46 22 C38 16 38 8 46 12 C48 14 47 18 46 22 Z" fill="url(#sunnFlower)" stroke="#a16207" strokeWidth="0.8" />
        <path d="M54 22 C62 16 62 8 54 12 C52 14 53 18 54 22 Z" fill="url(#sunnFlower)" stroke="#a16207" strokeWidth="0.8" />
        <circle cx="50" cy="18" r="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        {/* +80 lbs N Badge Sparkle */}
        <path d="M78 24 L80 18 L86 20 L81 24 L84 30 L79 26 L74 30 L76 24 Z" fill="#22c55e" opacity="0.9" />
      </svg>
    )
  },

  groundnut: {
    tamilName: 'நிலக்கடலை',
    englishName: 'Groundnut (Peanut)',
    variety: 'VRI-2 / TMV-13',
    season: 'சித்திரை / ஆடி (Apr - Jul)',
    durationDays: 105,
    waterInches: 18.0,
    waterLevel: 'மிதமான நீர் (Medium)',
    nitrogenLbs: 45,
    bgGradient: 'from-amber-700/25 via-orange-800/15 to-stone-900/40',
    borderColor: 'border-orange-500/60',
    badgeColor: 'bg-orange-500/20 text-orange-800 border-orange-400',
    accentColor: '#ea580c',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="peanutShell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
        </defs>
        {/* Soil Level Cross Section */}
        <rect x="15" y="62" width="70" height="30" rx="6" fill="#78350f" opacity="0.35" />
        <line x1="15" y1="62" x2="85" y2="62" stroke="#a16207" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Canopy Stems */}
        <path d="M50 62 L50 35" stroke="#15803d" strokeWidth="3" />
        <path d="M50 48 Q35 38 24 44" stroke="#16a34a" strokeWidth="2.5" fill="none" />
        <path d="M50 46 Q65 36 76 42" stroke="#16a34a" strokeWidth="2.5" fill="none" />
        {/* Four Leaflets */}
        <circle cx="22" cy="40" r="6" fill="#22c55e" />
        <circle cx="28" cy="34" r="5.5" fill="#16a34a" />
        <circle cx="78" cy="38" r="6" fill="#22c55e" />
        <circle cx="72" cy="32" r="5.5" fill="#16a34a" />
        {/* Yellow Flower at Soil Level */}
        <polygon points="48,32 50,26 52,32 56,33 52,36 53,41 50,38 47,41 48,36 44,33" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
        {/* Pegs diving down into soil */}
        <path d="M48 55 Q42 66 38 74" stroke="#ca8a04" strokeWidth="2" fill="none" />
        <path d="M52 56 Q58 67 62 76" stroke="#ca8a04" strokeWidth="2" fill="none" />
        {/* Textured Underground Peanut Pods */}
        <ellipse cx="36" cy="76" rx="9" ry="5" transform="rotate(-15 36 76)" fill="url(#peanutShell)" stroke="#78350f" strokeWidth="1" />
        <ellipse cx="43" cy="74" rx="7" ry="4.5" transform="rotate(-15 43 74)" fill="url(#peanutShell)" stroke="#78350f" strokeWidth="0.8" />
        <ellipse cx="64" cy="78" rx="9" ry="5" transform="rotate(20 64 78)" fill="url(#peanutShell)" stroke="#78350f" strokeWidth="1" />
        <ellipse cx="58" cy="76" rx="7" ry="4.5" transform="rotate(20 58 76)" fill="url(#peanutShell)" stroke="#78350f" strokeWidth="0.8" />
      </svg>
    )
  },

  corn: {
    tamilName: 'மக்காச்சோளம்',
    englishName: 'Corn (Maize)',
    variety: 'CoH(M)-6 Hybrid',
    season: 'ஆடிப் பட்டம் / தை (Jul - Nov)',
    durationDays: 110,
    waterInches: 22.0,
    waterLevel: 'மிதமான நீர் (Medium)',
    nitrogenLbs: -140,
    bgGradient: 'from-yellow-500/25 via-amber-600/15 to-stone-900/40',
    borderColor: 'border-yellow-500/60',
    badgeColor: 'bg-yellow-500/20 text-yellow-800 border-yellow-400',
    accentColor: '#eab308',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="cornCob" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="88" rx="28" ry="6" fill="#78350f" opacity="0.3" />
        {/* Thick Central Corn Stalk */}
        <path d="M50 88 L50 20" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
        {/* Broad Arching Corn Leaves */}
        <path d="M50 70 Q25 60 12 74 Q28 48 50 62" fill="#16a34a" />
        <path d="M50 65 Q75 55 88 68 Q72 44 50 58" fill="#16a34a" />
        {/* Ripe Corn Ear with Golden Kernels */}
        <ellipse cx="56" cy="46" rx="8" ry="16" transform="rotate(25 56 46)" fill="url(#cornCob)" stroke="#854d0e" strokeWidth="1" />
        {/* Green Husk wrapping */}
        <path d="M48 58 Q54 48 52 36 Q46 48 48 58" fill="#22c55e" />
        {/* Brown Corn Silk */}
        <path d="M62 34 Q66 28 68 22" stroke="#b45309" strokeWidth="1.5" fill="none" />
        <path d="M64 36 Q70 30 74 24" stroke="#b45309" strokeWidth="1.2" fill="none" />
        {/* Tassel at apex */}
        <path d="M50 20 Q44 10 38 8" stroke="#ca8a04" strokeWidth="2" fill="none" />
        <path d="M50 20 Q56 10 62 8" stroke="#ca8a04" strokeWidth="2" fill="none" />
        <path d="M50 20 L50 8" stroke="#ca8a04" strokeWidth="2" fill="none" />
      </svg>
    )
  },

  cotton: {
    tamilName: 'பருத்தி',
    englishName: 'Cotton',
    variety: 'Surabhi / MCU-5',
    season: 'ஆடிப் பட்டம் (Aug - Jan)',
    durationDays: 150,
    waterInches: 24.0,
    waterLevel: 'மிதமான நீர் (Medium)',
    nitrogenLbs: -90,
    bgGradient: 'from-slate-200/25 via-sky-800/15 to-stone-900/40',
    borderColor: 'border-slate-300/60',
    badgeColor: 'bg-slate-200/30 text-slate-900 border-slate-300',
    accentColor: '#94a3b8',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <ellipse cx="50" cy="88" rx="28" ry="6" fill="#78350f" opacity="0.3" />
        <path d="M50 88 L50 35" stroke="#78350f" strokeWidth="3" />
        {/* Brown Open Calyx (Bracts) */}
        <path d="M38 52 L50 56 L62 52 L58 64 L42 64 Z" fill="#854d0e" stroke="#451a03" strokeWidth="1" />
        {/* Fluffy White Cotton Boll */}
        <circle cx="44" cy="46" r="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        <circle cx="56" cy="46" r="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        <circle cx="50" cy="38" r="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        <circle cx="50" cy="48" r="8" fill="#f1f5f9" />
      </svg>
    )
  },

  // Fallback generic cover crop
  cereal_rye: {
    tamilName: 'மூடு பயிர் (ரை)',
    englishName: 'Cereal Rye Cover',
    variety: 'Winter Rye',
    season: 'குளிர்கால மூடு பயிர்',
    durationDays: 90,
    waterInches: 6.0,
    waterLevel: 'குறைந்த நீர் (Low)',
    nitrogenLbs: 25,
    bgGradient: 'from-emerald-700/20 via-stone-800/20 to-stone-900/40',
    borderColor: 'border-emerald-500/50',
    badgeColor: 'bg-emerald-500/20 text-emerald-800 border-emerald-400',
    accentColor: '#10b981',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <path d="M50 88 L50 25" stroke="#15803d" strokeWidth="2.5" />
        <path d="M50 50 Q30 45 20 52" stroke="#16a34a" strokeWidth="2" fill="none" />
        <path d="M50 40 Q70 35 80 42" stroke="#16a34a" strokeWidth="2" fill="none" />
        <ellipse cx="50" cy="20" rx="3" ry="10" fill="#84cc16" stroke="#4d7c0f" strokeWidth="0.8" />
      </svg>
    )
  }
};

/**
 * Single Crop Visual Card Component
 */
export default function CropVisualCard({ cropId, isCompact = false, showDetails = true, isTamil = true }) {
  const data = CROP_VISUAL_DATA[cropId] || CROP_VISUAL_DATA['paddy'];

  if (isCompact) {
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-gradient-to-br ${data.bgGradient} border ${data.borderColor} shadow-sm backdrop-blur-sm`}>
        <div className="w-8 h-8 flex-shrink-0">
          {data.svg}
        </div>
        <div className="truncate text-left">
          <div className="text-xs font-extrabold text-soil-900 leading-tight truncate">
            {isTamil ? data.tamilName : data.englishName}
          </div>
          <div className="text-[10px] text-soil-600 font-mono flex items-center gap-1.5">
            <span>{data.durationDays} நாட்கள்</span>
            <span>•</span>
            <span className={data.nitrogenLbs > 0 ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
              {data.nitrogenLbs > 0 ? `+${data.nitrogenLbs} lbs N` : `${data.nitrogenLbs} lbs N`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${data.bgGradient} border-2 ${data.borderColor} p-2.5 shadow-tactile transition-all hover:scale-[1.02] flex flex-col justify-between`}>
      {/* Top Banner: Season & Duration */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${data.badgeColor}`}>
          {isTamil ? data.tamilName.split(' ')[0] : data.englishName.split(' ')[0]}
        </span>
        <span className="text-[10px] font-mono font-bold text-soil-700 bg-white/70 px-1.5 py-0.5 rounded-md border border-soil-200 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-soil-500" />
          <span>{data.durationDays}d</span>
        </span>
      </div>

      {/* Central Illustration */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto my-1 flex items-center justify-center">
        {data.svg}
      </div>

      {/* Crop Name */}
      <div className="text-center mt-1">
        <h4 className="font-display font-extrabold text-xs text-soil-900 leading-tight">
          {isTamil ? data.tamilName : data.englishName}
        </h4>
        <div className="text-[9px] text-soil-600 truncate mt-0.5 font-medium">
          {data.variety}
        </div>
      </div>

      {/* Agronomic Details Footer */}
      {showDetails && (
        <div className="mt-2 pt-1.5 border-t border-soil-200/60 grid grid-cols-2 gap-1 text-[9px] font-mono text-center">
          <div className="bg-white/80 rounded p-1 border border-soil-100 flex items-center justify-center gap-1 text-cyan-800">
            <Droplets className="w-2.5 h-2.5 text-cyan-600 flex-shrink-0" />
            <span>{data.waterInches}"</span>
          </div>
          <div className={`rounded p-1 border font-bold flex items-center justify-center gap-0.5 ${
            data.nitrogenLbs > 0 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <Sprout className="w-2.5 h-2.5 flex-shrink-0" />
            <span>{data.nitrogenLbs > 0 ? `+${data.nitrogenLbs}` : data.nitrogenLbs} N</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Render complete horizontal sequence of visual crop cards
 */
export function CropSequenceVisualizer({ sequence = [], isTamil = true }) {
  if (!sequence || sequence.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 py-1">
      {sequence.map((cropId, idx) => (
        <React.Fragment key={`${cropId}-${idx}`}>
          <div className="flex-1 min-w-0">
            <CropVisualCard cropId={cropId} isTamil={isTamil} showDetails={true} />
          </div>
          {idx < sequence.length - 1 && (
            <div className="flex flex-col items-center justify-center px-0.5 text-soil-400 flex-shrink-0">
              <span className="text-lg font-extrabold text-amber-600 select-none">➔</span>
              <span className="text-[8px] font-mono text-soil-500 uppercase font-bold">
                {idx === 0 ? 'பருவம் 1' : 'பருவம் 2'}
              </span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
