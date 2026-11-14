import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

// Custom Leaflet Pin Icon
const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapClickHandler({ onLocationSelected }) {
  useMapEvents({
    click(e) {
      onLocationSelected({ lat: Number(e.latlng.lat.toFixed(4)), lng: Number(e.latlng.lng.toFixed(4)) });
    }
  });
  return null;
}

export default function FieldMap({ center = { lat: 42.0308, lng: -93.6319 }, fields = [], onFieldSelect, selectedFieldId }) {
  const [currentPos, setCurrentPos] = useState(center);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [snappedMsg, setSnappedMsg] = useState(null);

  useEffect(() => {
    if (center && (center.lat !== currentPos.lat || center.lng !== currentPos.lng)) {
      setCurrentPos(center);
    }
  }, [center]);

  const handleLocationClick = (loc) => {
    setCurrentPos(loc);
    // Find nearest field
    if (fields.length > 0) {
      let nearest = fields[0];
      let minDist = Infinity;
      fields.forEach(f => {
        const dLat = f.location.lat - loc.lat;
        const dLng = f.location.lng - loc.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < minDist) {
          minDist = dist;
          nearest = f;
        }
      });

      if (onFieldSelect) {
        onFieldSelect(nearest.fieldId);
        setSnappedMsg(`Snapped to nearest NASA observation parcel: ${nearest.name} (${nearest.county}, ${nearest.state})`);
      }
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4))
        };
        handleLocationClick(loc);
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS failed', err);
        setGpsLoading(false);
        // Default to Story County, IA
        handleLocationClick({ lat: 42.0308, lng: -93.6319 });
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-[280px] rounded-3xl overflow-hidden border border-soil-300 shadow-sm">
      <MapContainer
        center={[currentPos.lat, currentPos.lng]}
        zoom={9}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onLocationSelected={handleLocationClick} />

        {fields.map((f) => (
          <Marker
            key={f.fieldId}
            position={[f.location.lat, f.location.lng]}
            icon={pinIcon}
            eventHandlers={{
              click: () => {
                if (onFieldSelect) onFieldSelect(f.fieldId);
              }
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold text-soil-900">{f.name}</div>
                <div className="text-soil-600">{f.county}, {f.state}</div>
                <div className="text-field-700 font-medium mt-1">{f.areaAcres} acres • {f.currentCrop}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* GPS Trigger Button */}
      <button
        onClick={handleGPS}
        disabled={gpsLoading}
        className="absolute top-3 right-3 z-[1000] bg-cream-50 hover:bg-cream-200 text-soil-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-md border border-soil-300 flex items-center gap-1.5 active:scale-95 transition"
      >
        <Navigation className={`w-3.5 h-3.5 text-skyaccent-600 ${gpsLoading ? 'animate-spin' : ''}`} />
        <span>{gpsLoading ? 'Locating...' : 'Use My GPS'}</span>
      </button>

      {/* Snapping Feedback Notification */}
      {snappedMsg && (
        <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-soil-900/90 text-cream-50 text-[11px] px-3 py-1.5 rounded-xl text-center backdrop-blur shadow-md">
          {snappedMsg}
        </div>
      )}
    </div>
  );
}
