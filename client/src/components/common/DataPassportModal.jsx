import React from 'react';
import { ShieldCheck, ExternalLink, X, FileText, Database, CheckCircle2 } from 'lucide-react';

export default function DataPassportModal({ passport, onClose }) {
  if (!passport) return null;

  return (
    <div className="fixed inset-0 z-50 bg-soil-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream-50 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-soil-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-soil-500 hover:text-soil-900 rounded-full hover:bg-cream-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Passport Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-field-100 flex items-center justify-center text-field-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-soil-900 leading-tight">
              Data Passport
            </h3>
            <p className="text-xs text-soil-600">NASA Earth Observation Provenance</p>
          </div>
        </div>

        {/* Metric Highlight */}
        <div className="bg-cream-200 rounded-2xl p-3.5 mb-4 border border-soil-300">
          <div className="text-[11px] font-semibold text-soil-600 uppercase tracking-wider mb-0.5">
            {passport.metric}
          </div>
          <div className="text-xl font-display font-extrabold text-soil-900">
            {passport.value}
          </div>
        </div>

        {/* Provenance Details */}
        <div className="space-y-2.5 text-xs text-soil-800 mb-6">
          <div className="flex justify-between py-1 border-b border-soil-200">
            <span className="text-soil-600 font-medium">Dataset:</span>
            <span className="font-semibold text-right">{passport.dataset}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-soil-200">
            <span className="text-soil-600 font-medium">Data Provider:</span>
            <span className="font-semibold text-right">{passport.provider}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-soil-200">
            <span className="text-soil-600 font-medium">Measurement Classification:</span>
            <span className="font-bold text-field-700 text-right bg-field-50 px-2 py-0.5 rounded-md">
              {passport.type}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-soil-200">
            <span className="text-soil-600 font-medium">Local Cache File:</span>
            <span className="font-mono text-[11px] text-soil-700 text-right">{passport.sourceFile}</span>
          </div>

          {passport.observationDate && (
            <div className="flex justify-between py-1 border-b border-soil-200">
              <span className="text-soil-600 font-medium">Observation Date:</span>
              <span className="font-semibold text-right">{passport.observationDate}</span>
            </div>
          )}

          {passport.dateRange && (
            <div className="flex justify-between py-1 border-b border-soil-200">
              <span className="text-soil-600 font-medium">Observation Period:</span>
              <span className="font-semibold text-right">{passport.dateRange}</span>
            </div>
          )}
        </div>

        {/* Official Portal Link */}
        <div className="flex gap-2">
          {passport.officialUrl && (
            <a
              href={passport.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 py-3 text-xs"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Official NASA Portal
            </a>
          )}
          <button
            onClick={onClose}
            className="btn-secondary py-3 text-xs px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
