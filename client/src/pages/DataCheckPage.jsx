import React, { useState, useEffect } from 'react';
import { fieldAPI } from '../services/api';
import { ShieldCheck, AlertCircle, CheckCircle2, FileText, Database, RefreshCw, ExternalLink } from 'lucide-react';

export default function DataCheckPage() {
  const [auditReports, setAuditReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const res = await fieldAPI.getDataCheck();
      setAuditReports(res.data || []);
    } catch (e) {
      console.warn('Audit fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-soil-600">
            Scientific Provenance & Quality Audit
          </span>
          <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight">
            Data Check Page
          </h1>
          <p className="text-xs text-soil-600 mt-1">
            Verification of local NASA datasets, row counts, temporal bounds, and fill-value sanitization.
          </p>
        </div>

        <button
          onClick={fetchAudit}
          className="p-2.5 rounded-2xl bg-cream-50 border border-soil-200 text-soil-800 hover:bg-cream-200"
          title="Re-run Data Validation"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-soil-600 animate-pulse">
          Validating local file integrity and provenance records...
        </div>
      ) : (
        auditReports.map((report) => (
          <div key={report.fieldId} className="card-heartland space-y-4">
            <div className="flex items-start justify-between border-b border-soil-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-field-800 bg-field-100 px-2 py-0.5 rounded-md">
                  {report.fieldId}
                </span>
                <h2 className="font-display font-bold text-base text-soil-900 mt-1">
                  {report.meta?.name || report.fieldId}
                </h2>
                <div className="text-xs text-soil-600">
                  {report.meta?.county}, {report.meta?.state} • Coordinates: ({report.meta?.lat}, {report.meta?.lng})
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-soil-500">Last Refreshed</span>
                <div className="text-xs font-semibold text-soil-800">
                  {report.meta?.lastRefreshed ? new Date(report.meta.lastRefreshed).toLocaleDateString() : 'Cached Archive'}
                </div>
              </div>
            </div>

            {/* Datasets Breakdown Table */}
            <div className="space-y-3">
              {Object.keys(report.datasets).map((key) => {
                const ds = report.datasets[key];
                const isAvailable = ds.status === 'AVAILABLE';

                return (
                  <div
                    key={key}
                    className={`rounded-2xl p-3.5 border text-xs space-y-2 ${
                      isAvailable ? 'bg-cream-100 border-soil-200' : 'bg-soil-100/50 border-soil-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isAvailable ? (
                          <CheckCircle2 className="w-4 h-4 text-field-700 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-soil-500 flex-shrink-0" />
                        )}
                        <span className="font-bold text-soil-900">{ds.name}</span>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isAvailable ? 'bg-field-100 text-field-800' : 'bg-soil-200 text-soil-700'
                      }`}>
                        {ds.status}
                      </span>
                    </div>

                    {isAvailable && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-soil-700">
                        <div>
                          <span className="text-soil-500 block">Row Count:</span>
                          <span className="font-mono font-bold">{ds.rowCount} daily</span>
                        </div>
                        <div>
                          <span className="text-soil-500 block">Date Range:</span>
                          <span className="font-mono">{ds.startDate} to {ds.endDate}</span>
                        </div>
                        <div>
                          <span className="text-soil-500 block">Missing Data:</span>
                          <span className="font-mono font-bold text-field-700">{ds.missingPct}%</span>
                        </div>
                        <div>
                          <span className="text-soil-500 block">File Size:</span>
                          <span className="font-mono">{ds.fileSizeKb} KB</span>
                        </div>
                      </div>
                    )}

                    {ds.warnings && ds.warnings.length > 0 && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 rounded-xl p-2 font-medium">
                        {ds.warnings.join(' • ')}
                      </div>
                    )}

                    {ds.note && (
                      <div className="text-[11px] text-soil-500 italic">
                        {ds.note}
                      </div>
                    )}

                    {ds.reason && (
                      <div className="text-[11px] text-soil-600 bg-soil-200/50 rounded-xl p-2 font-medium">
                        {ds.reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
