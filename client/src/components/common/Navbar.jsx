import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useField } from '../../context/FieldContext';
import { useTranslation } from 'react-i18next';
import { Sprout, Clock, Database, ShieldCheck, MapPin, LogOut, Globe } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currentFieldId, fieldList, switchField, fieldToday } = useField();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isLive = fieldToday?.mode === 'LIVE';

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ta' ? 'en' : 'ta';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('nilam_pesum_lang', nextLang);
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-50/98 backdrop-blur border-b border-soil-200 px-3 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Identity */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-field-600 flex items-center justify-center text-wheat-400 shadow-sm flex-shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="font-display font-extrabold text-base sm:text-lg text-soil-900 leading-tight">
              {i18n.language === 'ta' ? 'நிலம் பேசும்' : 'Nilam Pesum'}{' '}
              <span className="text-field-700 font-sans text-[10px] uppercase px-1.5 py-0.5 bg-field-100 rounded-md ml-1 font-bold">
                NASA
              </span>
            </div>
            <div className="text-[10px] text-soil-600 font-medium">
              {i18n.language === 'ta' ? 'விவசாய வழிகாட்டி' : 'FieldVoice Advisory'}
            </div>
          </div>
        </Link>

        {/* Field Selector & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {fieldList.length > 0 && (
            <div className="relative flex items-center max-w-[130px] sm:max-w-none">
              <MapPin className="w-3.5 h-3.5 text-soil-600 absolute left-2 pointer-events-none" />
              <select
                value={currentFieldId}
                onChange={(e) => switchField(e.target.value)}
                className="pl-6 pr-2 py-1.5 text-[11px] font-bold bg-cream-200 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600 truncate"
              >
                {fieldList.map((f) => (
                  <option key={f.fieldId} value={f.fieldId}>
                    {f.name} ({f.county})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-wheat-100 hover:bg-wheat-200 text-soil-900 text-xs font-bold border border-wheat-400 shadow-sm active:scale-95 transition"
            title="Switch Language / மொழி மாற்றம்"
          >
            <Globe className="w-3.5 h-3.5 text-wheat-700" />
            <span>{i18n.language === 'ta' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Live vs Cached Badge */}
          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 ${
            isLive ? 'bg-field-100 text-field-800 border border-field-500' : 'bg-wheat-100 text-soil-800 border border-wheat-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-field-600 animate-pulse' : 'bg-wheat-500'}`} />
            {isLive ? (i18n.language === 'ta' ? 'நேரலை' : 'LIVE') : (i18n.language === 'ta' ? 'சேமிப்பு' : 'CACHED')}
          </span>

          {/* Desktop Links */}
          <div className="hidden sm:flex items-center gap-1 border-l border-soil-200 pl-2">
            <Link
              to="/timemachine"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                location.pathname === '/timemachine' ? 'bg-wheat-200 text-soil-900' : 'text-soil-700 hover:bg-cream-200'
              }`}
            >
              <Clock className="w-4 h-4 text-wheat-600" />
              <span className="hidden md:inline">{t('nav.timemachine')}</span>
            </Link>

            <Link
              to="/data-check"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                location.pathname === '/data-check' ? 'bg-field-100 text-field-900' : 'text-soil-700 hover:bg-cream-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-field-700" />
              <span className="hidden md:inline">{t('nav.datacheck')}</span>
            </Link>

            {user && (
              <button
                onClick={logout}
                className="p-2 text-soil-600 hover:text-red-700 rounded-xl hover:bg-red-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
