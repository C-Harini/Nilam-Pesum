import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Check } from 'lucide-react';

// Custom Farm Marker Pin Icon (Amber/Gold with High Visibility)
const farmPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -38],
  shadowSize: [41, 41]
});

// Standard Blue Landmark Pin for existing NASA reference parcels
const referencePinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  popupAnchor: [1, -30],
  shadowSize: [35, 35]
});

// Major Tamil Nadu Agro-Climatic Districts for accurate nearest-district identification
export const TN_DISTRICTS = [
  { name: 'தஞ்சாவூர் (Thanjavur)', district: 'Thanjavur', lat: 10.7870, lng: 79.1378, zone: 'காவிரி டெல்டா (Cauvery Delta)' },
  { name: 'திருவாரூர் (Tiruvarur)', district: 'Tiruvarur', lat: 10.7725, lng: 79.6365, zone: 'காவிரி டெல்டா (Cauvery Delta)' },
  { name: 'நாகப்பட்டினம் (Nagapattinam)', district: 'Nagapattinam', lat: 10.7656, lng: 79.8424, zone: 'கடலோர டெல்டா (Coastal Delta)' },
  { name: 'மயிலாடுதுறை (Mayiladuthurai)', district: 'Mayiladuthurai', lat: 11.1075, lng: 79.6524, zone: 'காவிரி டெல்டா (Cauvery Delta)' },
  { name: 'திருச்சிராப்பள்ளி (Tiruchirappalli)', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, zone: 'மத்திய மண்டலம் (Central Basin)' },
  { name: 'மதுரை (Madurai)', district: 'Madurai', lat: 9.9252, lng: 78.1198, zone: 'தென் மண்டலம் (Southern Zone)' },
  { name: 'கோயம்புத்தூர் (Coimbatore)', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, zone: 'மேற்கு மண்டலம் (Western Zone)' },
  { name: 'ஈரோடு (Erode)', district: 'Erode', lat: 11.3410, lng: 77.7172, zone: 'மேற்கு மண்டலம் (Western Zone)' },
  { name: 'சேலம் (Salem)', district: 'Salem', lat: 11.6643, lng: 78.1460, zone: 'வடமேற்கு மண்டலம் (North Western)' },
  { name: 'திண்டுக்கல் (Dindigul)', district: 'Dindigul', lat: 10.3673, lng: 77.9803, zone: 'தென் மண்டலம் (Southern Zone)' },
  { name: 'திருநெல்வேலி (Tirunelveli)', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567, zone: 'தென் மண்டலம் (Southern Zone)' },
  { name: 'தூத்துக்குடி (Thoothukudi)', district: 'Thoothukudi', lat: 8.7642, lng: 78.1348, zone: 'தென் மண்டலம் (Southern Zone)' },
  { name: 'கன்னியாகுமரி (Kanyakumari)', district: 'Kanyakumari', lat: 8.0883, lng: 77.5385, zone: 'அதிக மழை மண்டலம் (High Rainfall)' },
  { name: 'கடலூர் (Cuddalore)', district: 'Cuddalore', lat: 11.7480, lng: 79.7714, zone: 'வடகிழக்கு மண்டலம் (North Eastern)' },
  { name: 'விழுப்புரம் (Villupuram)', district: 'Villupuram', lat: 11.9401, lng: 79.4861, zone: 'வடகிழக்கு மண்டலம் (North Eastern)' },
  { name: 'வேலூர் (Vellore)', district: 'Vellore', lat: 12.9165, lng: 79.1325, zone: 'வடக்கு மண்டலம் (Northern Zone)' },
  { name: 'காஞ்சிபுரம் (Kanchipuram)', district: 'Kanchipuram', lat: 12.8342, lng: 79.7036, zone: 'வடகிழக்கு மண்டலம் (North Eastern)' },
  { name: 'செங்கல்பட்டு (Chengalpattu)', district: 'Chengalpattu', lat: 12.6841, lng: 79.9836, zone: 'வடகிழக்கு மண்டலம் (North Eastern)' },
  { name: 'திருவள்ளூர் (Tiruvallur)', district: 'Tiruvallur', lat: 13.1230, lng: 79.9120, zone: 'வடகிழக்கு மண்டலம் (North Eastern)' },
  { name: 'சென்னை (Chennai)', district: 'Chennai', lat: 13.0827, lng: 80.2707, zone: 'கடலோர மண்டலம் (Coastal)' },
  { name: 'தர்மபுரி (Dharmapuri)', district: 'Dharmapuri', lat: 12.1211, lng: 78.1582, zone: 'வடமேற்கு மண்டலம் (North Western)' },
  { name: 'கிருஷ்ணகிரி (Krishnagiri)', district: 'Krishnagiri', lat: 12.5186, lng: 78.2137, zone: 'வடமேற்கு மண்டலம் (North Western)' },
  { name: 'புதுக்கோட்டை (Pudukkottai)', district: 'Pudukkottai', lat: 10.3833, lng: 78.8001, zone: 'தெற்கு மண்டலம் (Southern Zone)' },
  { name: 'கரூர் (Karur)', district: 'Karur', lat: 10.9601, lng: 78.0766, zone: 'மத்திய மண்டலம் (Central Basin)' },
  { name: 'நாமக்கல் (Namakkal)', district: 'Namakkal', lat: 11.2189, lng: 78.1674, zone: 'மேற்கு மண்டலம் (Western Zone)' },
  { name: 'திருப்பூர் (Tiruppur)', district: 'Tiruppur', lat: 11.1085, lng: 77.3411, zone: 'மேற்கு மண்டலம் (Western Zone)' },
  { name: 'விருதுநகர் (Virudhunagar)', district: 'Virudhunagar', lat: 9.5680, lng: 77.9624, zone: 'தென் மண்டலம் (Southern Zone)' },
  { name: 'சிவகங்கை (Sivaganga)', district: 'Sivaganga', lat: 9.8433, lng: 78.4809, zone: 'தென் மண்டலம் (Southern Zone)' },
  { name: 'ராமநாதபுரம் (Ramanathapuram)', district: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, zone: 'வறண்ட தென் மண்டலம் (Dry South)' },
  { name: 'தென்காசி (Tenkasi)', district: 'Tenkasi', lat: 8.9594, lng: 77.3152, zone: 'தென் மண்டலம் (Southern Zone)' },
  { name: 'தேனி (Theni)', district: 'Theni', lat: 10.0104, lng: 77.4768, zone: 'மேற்கு தொடர்ச்சி மலை அடிவாரம்' },
  { name: 'நீலகிரி (Nilgiris)', district: 'Nilgiris', lat: 11.4102, lng: 76.6950, zone: 'மலைப் பகுதி (Hilly Zone)' },
  { name: 'அரியலூர் (Ariyalur)', district: 'Ariyalur', lat: 11.1400, lng: 79.0786, zone: 'காவிரி வடிநிலம் (Cauvery Basin)' },
  { name: 'பெரம்பலூர் (Perambalur)', district: 'Perambalur', lat: 11.2342, lng: 78.8820, zone: 'மத்திய மண்டலம் (Central)' },
  { name: 'கள்ளக்குறிச்சி (Kallakurichi)', district: 'Kallakurichi', lat: 11.7383, lng: 78.9639, zone: 'வடக்கு மண்டலம் (Northern)' },
  { name: 'ராணிப்பேட்டை (Ranipet)', district: 'Ranipet', lat: 12.9279, lng: 79.3330, zone: 'வடக்கு மண்டலம் (Northern)' },
  { name: 'திருப்பத்தூர் (Tirupathur)', district: 'Tirupathur', lat: 12.4958, lng: 78.5678, zone: 'வடக்கு மண்டலம் (Northern)' },
  { name: 'திருவண்ணாமலை (Tiruvannamalai)', district: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, zone: 'வடக்கு மண்டலம் (Northern)' }
];

export function getNearestDistrict(lat, lng) {
  if (!lat || !lng) return TN_DISTRICTS[0];
  
  // Check if near Iowa/US
  if (lat > 35 && lng < -70) {
    return { name: 'Story County, Iowa', district: 'Story', lat, lng, zone: 'US Midwest Corn Belt' };
  }

  let nearest = TN_DISTRICTS[0];
  let minDist = Infinity;

  TN_DISTRICTS.forEach(d => {
    const dLat = d.lat - lat;
    const dLng = d.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDist) {
      minDist = dist;
      nearest = d;
    }
  });

  return nearest;
}

// Controller to fly the map when center changes
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { animate: true, duration: 0.8 });
    }
  }, [center, map]);
  return null;
}

// Click listener to place pin wherever farmer taps
function MapClickHandler({ onLocationSelected }) {
  useMapEvents({
    click(e) {
      const lat = Number(e.latlng.lat.toFixed(4));
      const lng = Number(e.latlng.lng.toFixed(4));
      onLocationSelected({ lat, lng });
    }
  });
  return null;
}

export default function FieldMap({ 
  center = { lat: 10.7870, lng: 79.1378 }, 
  fields = [], 
  onFieldSelect, 
  onLocationSelect 
}) {
  const [currentPos, setCurrentPos] = useState(center);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [activeInfo, setActiveInfo] = useState(() => getNearestDistrict(center.lat, center.lng));

  useEffect(() => {
    if (center && (center.lat !== currentPos.lat || center.lng !== currentPos.lng)) {
      setCurrentPos(center);
      setActiveInfo(getNearestDistrict(center.lat, center.lng));
    }
  }, [center]);

  const handleLocationClick = (loc) => {
    setCurrentPos(loc);
    const nearest = getNearestDistrict(loc.lat, loc.lng);
    setActiveInfo(nearest);

    // Notify parent callback with exact coordinates and district name
    if (onLocationSelect) {
      onLocationSelect({
        lat: loc.lat,
        lng: loc.lng,
        name: nearest.name,
        district: nearest.district,
        zone: nearest.zone
      });
    }

    if (onFieldSelect) {
      onFieldSelect(nearest.district.toLowerCase() === 'story' ? 'field01' : 'field_tn01');
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
        handleLocationClick({ lat: 10.7870, lng: 79.1378 });
      },
      { timeout: 10000 }
    );
  };

  const nasaGridLat = (Math.round(currentPos.lat * 2) / 2).toFixed(1);
  const nasaGridLng = (Math.round(currentPos.lng * 2) / 2).toFixed(1);

  return (
    <div className="relative w-full h-[320px] rounded-3xl overflow-hidden border-2 border-field-600/40 shadow-tactile">
      <MapContainer
        center={[currentPos.lat, currentPos.lng]}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full cursor-crosshair"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterController center={currentPos} />
        <MapClickHandler onLocationSelected={handleLocationClick} />

        {/* 1. MOVABLE & DRAGGABLE CUSTOM FARM PIN (Always places where clicked or dragged) */}
        <Marker
          position={[currentPos.lat, currentPos.lng]}
          icon={farmPinIcon}
          draggable={true}
          eventHandlers={{
            dragend(e) {
              const marker = e.target;
              const position = marker.getLatLng();
              handleLocationClick({
                lat: Number(position.lat.toFixed(4)),
                lng: Number(position.lng.toFixed(4))
              });
            }
          }}
        >
          <Popup autoPan={false}>
            <div className="text-xs p-1">
              <div className="font-extrabold text-soil-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>உங்கள் பண்ணை இருப்பிடம் (Your Farm)</span>
              </div>
              <div className="font-bold text-field-700 mt-0.5">{activeInfo.name}</div>
              <div className="text-[10px] text-soil-600 mt-0.5">
                மண்டலம்: <strong className="text-soil-800">{activeInfo.zone}</strong>
              </div>
              <div className="text-[10px] font-mono text-soil-700 mt-1 bg-cream-100 p-1 rounded border border-soil-200">
                {currentPos.lat}° N, {currentPos.lng}° E
              </div>
              <div className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded mt-1 border border-emerald-200 font-bold">
                NASA POWER Grid: {nasaGridLat}° N, {nasaGridLng}° E
              </div>
              <div className="text-[9px] text-soil-500 italic mt-1">
                (இதை நகர்த்த இழுக்கலாம் / Drag pin to move)
              </div>
            </div>
          </Popup>
        </Marker>

        {/* 2. Reference NASA Observation Parcels */}
        {fields.map((f) => (
          <Marker
            key={f.fieldId}
            position={[f.location.lat, f.location.lng]}
            icon={referencePinIcon}
            eventHandlers={{
              click: () => {
                handleLocationClick({ lat: f.location.lat, lng: f.location.lng });
              }
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold text-soil-900">{f.name}</div>
                <div className="text-soil-600">{f.county}, {f.state}</div>
                <div className="text-field-700 font-medium mt-0.5">{f.areaAcres} acres • {f.currentCrop}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating GPS Button */}
      <button
        type="button"
        onClick={handleGPS}
        disabled={gpsLoading}
        className="absolute top-3 right-3 z-[1000] bg-cream-50 hover:bg-cream-200 text-soil-900 text-xs font-extrabold px-3 py-2 rounded-2xl shadow-tactile border border-soil-300 flex items-center gap-1.5 active:scale-95 transition"
      >
        <Navigation className={`w-3.5 h-3.5 text-field-600 ${gpsLoading ? 'animate-spin' : ''}`} />
        <span>{gpsLoading ? 'கண்டறிகிறது...' : 'எனது GPS இருப்பிடம்'}</span>
      </button>

      {/* Real-time Dynamic Pin Location Badge at bottom */}
      <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-stone-950/90 text-stone-100 text-xs px-3 py-2 rounded-2xl backdrop-blur-md shadow-xl border border-amber-400/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <span className="truncate">
            <strong>{activeInfo.name}</strong> • <span className="font-mono text-emerald-300">{currentPos.lat}° N, {currentPos.lng}° E</span>
          </span>
        </div>
        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40 flex-shrink-0">
          Grid: {nasaGridLat}°, {nasaGridLng}°
        </span>
      </div>
    </div>
  );
}
