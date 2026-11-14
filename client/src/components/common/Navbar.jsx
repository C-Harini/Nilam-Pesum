import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useField } from '../../context/FieldContext';
import { Sprout, Clock, Database, ShieldCheck, MapPin, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currentFieldId, fieldList, switchField, fieldToday } = useField();
  const location = useLocation();

  const isLive = fieldToday?.mode === 'LIVE';

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-soil-100 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Identity */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-field-700 flex items-center justify-center text-wheat-400 shadow-sm">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="font-display font-extrabold text-lg text-soil-900 leading-tight">
              Nilam Pesum <span className="text-field-700 font-sans text-xs uppercase px-1.5 py-0.5 bg-field-100 rounded-md ml-1 font-semibold">NASA</span>
            </div>
            <div className="text-[11px] text-soil-600 font-medium">FieldVoice Advisory</div>
          </div>
        </Link>

        {/* Field Selector & Mode Badge */}
        <div className="flex items-center gap-2">
          {fieldList.length > 0 && (
            <div className="relative flex items-center">
              <MapPin className="w-3.5 h-3.5 text-soil-600 absolute left-2.5 pointer-events-none" />
              <select
                value={currentFieldId}
                onChange={(e) => switchField(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs font-semibold bg-cream-200 border border-soil-300 rounded-xl text-soil-800 focus:outline-none focus:ring-2 focus:ring-field-600"
              >
                {fieldList.map((f) => (
                  <option key={f.fieldId} value={f.fieldId}>
                    {f.name} ({f.county}, {f.state})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Live vs Cached Badge */}
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 ${
            isLive ? 'bg-field-100 text-field-800 border border-field-500' : 'bg-wheat-100 text-soil-800 border border-wheat-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-field-600 animate-pulse' : 'bg-wheat-500'}`} />
            {isLive ? 'LIVE' : 'CACHED'}
          </span>

          {/* Quick Header Links for Desktop/Tablet */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-soil-200 pl-2">
            <Link
              to="/timemachine"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                location.pathname === '/timemachine' ? 'bg-wheat-200 text-soil-900' : 'text-soil-700 hover:bg-cream-200'
              }`}
              title="Historical Time Machine"
            >
              <Clock className="w-4 h-4 text-wheat-600" />
              <span className="hidden md:inline">Time Machine</span>
            </Link>

            <Link
              to="/data-check"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                location.pathname === '/data-check' ? 'bg-field-100 text-field-900' : 'text-soil-700 hover:bg-cream-200'
              }`}
              title="Data Quality Audit"
            >
              <ShieldCheck className="w-4 h-4 text-field-700" />
              <span className="hidden md:inline">Data Check</span>
            </Link>

            <Link
              to="/sources"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                location.pathname === '/sources' ? 'bg-field-100 text-field-900' : 'text-soil-700 hover:bg-cream-200'
              }`}
              title="NASA Attribution"
            >
              <Database className="w-4 h-4 text-soil-600" />
              <span className="hidden md:inline">Credits</span>
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
