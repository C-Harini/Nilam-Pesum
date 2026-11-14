import React, { useState, useEffect } from 'react';
import { extensionAPI } from '../services/api';
import { Users, Droplets, MapPin, ShieldAlert, Award, Sprout, CheckCircle2 } from 'lucide-react';

export default function ExtensionOfficer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    extensionAPI.getOverview().then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(e => {
      console.warn(e);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-xs font-bold text-soil-600 animate-pulse">Loading County Extension Dashboard...</div>;
  }

  const { title, region, notice, aggregates, farms = [] } = data || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Title */}
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider text-field-700 bg-field-100 px-3 py-0.5 rounded-full">
          Phase 9 Stretch Feature
        </span>
        <h1 className="font-display font-extrabold text-2xl text-soil-900 leading-tight mt-1.5">
          {title}
        </h1>
        <p className="text-xs text-soil-600">{region}</p>
      </div>

      {/* Prominent Sample Label Notice */}
      <div className="bg-wheat-100 border-2 border-wheat-500 rounded-2xl p-3.5 text-xs text-soil-900 font-bold flex items-center gap-2">
        <Award className="w-5 h-5 text-wheat-700 flex-shrink-0" />
        <span>{notice}</span>
      </div>

      {/* Regional Aggregates */}
      {aggregates && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
          <div className="card-heartland p-3">
            <div className="text-[10px] text-soil-500 font-bold uppercase">Enrolled Farms</div>
            <div className="font-display font-extrabold text-2xl text-soil-900 mt-0.5">{aggregates.totalEnrolledFarms}</div>
          </div>
          <div className="card-heartland p-3">
            <div className="text-[10px] text-soil-500 font-bold uppercase">Enrolled Acres</div>
            <div className="font-display font-extrabold text-2xl text-soil-900 mt-0.5">{aggregates.totalEnrolledAcres}</div>
          </div>
          <div className="card-heartland p-3">
            <div className="text-[10px] text-soil-500 font-bold uppercase">Regional Soil Wetness</div>
            <div className="font-display font-extrabold text-2xl text-field-700 mt-0.5">{aggregates.avgRegionalRootZoneWetnessPct}%</div>
          </div>
          <div className="card-heartland p-3">
            <div className="text-[10px] text-soil-500 font-bold uppercase">Cover Crop Adoption</div>
            <div className="font-display font-extrabold text-2xl text-wheat-600 mt-0.5">{aggregates.coverCropAdoptionRate}</div>
          </div>
        </div>
      )}

      {/* Enrolled Farmers Roster */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-sm text-soil-900 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-field-700" />
          Monitored Regional Farm Parcels
        </h2>

        {farms.map((f) => (
          <div key={f.id} className="card-heartland space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-soil-900">{f.farmName}</h3>
                  <span className="text-[10px] font-bold bg-wheat-200 text-soil-900 px-2 py-0.5 rounded-full">
                    DEMO FARMER
                  </span>
                </div>
                <div className="text-xs text-soil-600">{f.farmerName} • {f.county}, {f.state} ({f.acres} acres)</div>
              </div>

              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                f.waterStressIndex === 'Low'
                  ? 'bg-field-100 text-field-800'
                  : f.waterStressIndex === 'Moderate'
                  ? 'bg-wheat-100 text-soil-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {f.waterStressIndex} Water Stress
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-soil-200 text-soil-700">
              <div>
                <span className="text-soil-500">Rotation Plan: </span>
                <span className="font-bold">{f.rotation}</span>
              </div>
              <div>
                <span className="text-soil-500">Soil Texture: </span>
                <span>{f.soilTexture}</span>
              </div>
              <div>
                <span className="text-soil-500">Root-Zone Wetness: </span>
                <span className="font-bold text-field-700">{f.rootWetnessPct}%</span>
              </div>
              <div>
                <span className="text-soil-500">Soil Bank Status: </span>
                <span>{f.nitrogenStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
