import React, { useState, useEffect } from 'react';
import { fieldAPI } from '../services/api';
import { Database, ShieldCheck, ExternalLink, XCircle, Info, CheckCircle2 } from 'lucide-react';

export default function SourcesCreditsPage() {
  const [sourcesData, setSourcesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fieldAPI.getSources().then(res => {
      setSourcesData(res.data);
      setLoading(false);
    }).catch(e => {
      console.warn(e);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-xs font-bold text-soil-600 animate-pulse">Loading NASA Source Catalog...</div>;
  }

  const { catalog = {}, notUsed = [], lastAudit } = sourcesData || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Title */}
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider text-soil-600">
          Open Science Provenance
        </span>
        <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight">
          Data Catalog & NASA Credits
        </h1>
        <p className="text-xs text-soil-600 mt-1">
          Official attribution for open-access NASA Earth observation products, USDA soil surveys, and data governance policies.
        </p>
      </div>

      {/* Verified NASA Sources */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-sm text-soil-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-field-700" />
          Verified NASA & USDA Earth Observation Products
        </h2>

        {Object.keys(catalog).map((key) => {
          const s = catalog[key];
          return (
            <div key={key} className="card-heartland space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-soil-900">
                    {s.name}
                  </h3>
                  <div className="text-xs text-field-700 font-semibold">{s.provider}</div>
                </div>

                <a
                  href={s.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-soil-800"
                  title="Visit official portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-soil-200">
                <div>
                  <span className="text-soil-500">Classification: </span>
                  <span className="font-bold text-soil-800">{s.dataType}</span>
                </div>
                <div>
                  <span className="text-soil-500">Spatial Resolution: </span>
                  <span className="font-mono text-soil-800">{s.spatialResolution}</span>
                </div>
                <div>
                  <span className="text-soil-500">Temporal Cadence: </span>
                  <span className="text-soil-800">{s.temporalResolution}</span>
                </div>
                <div>
                  <span className="text-soil-500">Endpoint: </span>
                  <span className="font-mono text-[10px] text-soil-700 truncate block">{s.endpoint}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Section: What this app does NOT use */}
      <div className="card-heartland bg-soil-100/70 border-2 border-soil-300 space-y-3">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-700 flex-shrink-0" />
          <h2 className="font-display font-bold text-sm text-soil-900">
            What Nilam Pesum Does NOT Use (Scientific Transparency)
          </h2>
        </div>

        <p className="text-xs text-soil-700 leading-relaxed">
          To maintain strict scientific honesty and avoid misleading claims, Nilam Pesum explicitly documents datasets and sensors that are deliberately excluded:
        </p>

        <div className="space-y-2.5">
          {notUsed.map((item, i) => (
            <div key={i} className="bg-cream-50 rounded-2xl p-3 border border-soil-200 text-xs">
              <div className="font-bold text-soil-900">{item.dataset}</div>
              <div className="text-soil-600 mt-0.5 leading-relaxed">{item.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
