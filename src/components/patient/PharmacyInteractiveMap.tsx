import React, { useState } from 'react';
import {
  Coordinates,
  NASHIK_PHARMACIES,
  PharmacyLocation,
  calculateHaversineDistance,
  DEFAULT_NASHIK_CENTER
} from '../../services/geoService';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LocateFixed,
  RotateCw
} from 'lucide-react';

interface PharmacyInteractiveMapProps {
  userLocation: Coordinates | null;
  onDetectLocation: () => void;
  isLocating: boolean;
  selectedMedicineName: string;
  onReserveAtPharmacy?: (pharmacyName: string) => void;
}

export const PharmacyInteractiveMap: React.FC<PharmacyInteractiveMapProps> = ({
  userLocation,
  onDetectLocation,
  isLocating,
  selectedMedicineName,
  onReserveAtPharmacy
}) => {
  const [activePharmacyId, setActivePharmacyId] = useState<string>('pharm-1');
  const [filter24h, setFilter24h] = useState<boolean>(false);

  const activePharm = NASHIK_PHARMACIES[activePharmacyId] || Object.values(NASHIK_PHARMACIES)[0];
  const effectiveUserCoords = userLocation || DEFAULT_NASHIK_CENTER;

  const pharmaciesList = Object.values(NASHIK_PHARMACIES).filter((p) =>
    filter24h ? p.isOpen24Hours : true
  );

  // SVG coordinate transformation centered around Nashik
  // Nashik bounds roughly: Lat 19.94 to 20.03, Lon 73.74 to 73.84
  const mapWidth = 540;
  const mapHeight = 320;
  const minLat = 19.94;
  const maxLat = 20.03;
  const minLon = 73.74;
  const maxLon = 73.85;

  const projectToSvg = (coords: Coordinates) => {
    const x = ((coords.longitude - minLon) / (maxLon - minLon)) * (mapWidth - 80) + 40;
    // Invert Y because SVG coordinates increase downwards
    const y = (1 - (coords.latitude - minLat) / (maxLat - minLat)) * (mapHeight - 60) + 30;
    return { x: Math.max(30, Math.min(mapWidth - 30, x)), y: Math.max(25, Math.min(mapHeight - 25, y)) };
  };

  const userSvgPos = projectToSvg(effectiveUserCoords);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl border border-slate-800 space-y-3">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white">Live Nashik Pharmacy Network Map</h3>
            <p className="text-[10px] text-slate-400">
              {userLocation ? 'GPS Calibrated to your current coordinates' : 'Centered at Nashik Core Hub'}
            </p>
          </div>
        </div>

        <button
          onClick={onDetectLocation}
          disabled={isLocating}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-[11px] font-semibold transition-all shadow-xs"
          title="Detect GPS location"
        >
          {isLocating ? (
            <RotateCw className="w-3 h-3 animate-spin" />
          ) : (
            <LocateFixed className="w-3 h-3" />
          )}
          <span>{userLocation ? 'Update GPS' : 'Use My GPS'}</span>
        </button>
      </div>

      {/* Stylized Interactive SVG Map */}
      <div className="relative w-full h-[240px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <rect width={mapWidth} height={mapHeight} fill="url(#mapGrid)" />

          {/* Godavari River representation */}
          <path
            d="M 30,120 Q 140,80 240,140 T 420,130 T 520,180"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <text x="320" y="115" fill="#38bdf8" fontSize="8" opacity="0.6" fontWeight="bold">
            Godavari River
          </text>

          {/* Major Nashik Arterial Roads */}
          <path
            d="M 40,240 L 220,130 L 480,80"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          <text x="70" y="225" fill="#64748b" fontSize="7">Trimbak Rd</text>
          <text x="240" y="145" fill="#64748b" fontSize="7">College Rd / Canada Corner</text>

          {/* Distance vectors from user to active pharmacy */}
          {(() => {
            const activePos = projectToSvg(activePharm.coordinates);
            return (
              <line
                x1={userSvgPos.x}
                y1={userSvgPos.y}
                x2={activePos.x}
                y2={activePos.y}
                stroke="#14b8a6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
            );
          })()}

          {/* User Location Marker */}
          <g transform={`translate(${userSvgPos.x}, ${userSvgPos.y})`}>
            <circle r="12" fill="#0ea5e9" opacity="0.25" className="animate-ping" />
            <circle r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="-10" fill="#bae6fd" fontSize="8" fontWeight="bold" textAnchor="middle">
              You (GPS)
            </text>
          </g>

          {/* Pharmacy Pins */}
          {pharmaciesList.map((pharm) => {
            const pos = projectToSvg(pharm.coordinates);
            const isSelected = pharm.id === activePharm.id;
            const distance = calculateHaversineDistance(effectiveUserCoords, pharm.coordinates);

            return (
              <g
                key={pharm.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setActivePharmacyId(pharm.id)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Ping on selected */}
                {isSelected && (
                  <circle r="14" fill="#14b8a6" opacity="0.3" className="animate-pulse" />
                )}
                <circle
                  r={isSelected ? 9 : 7}
                  fill={isSelected ? '#0d9488' : '#047857'}
                  stroke="#ffffff"
                  strokeWidth="1.8"
                />
                <circle r={isSelected ? 4 : 3} fill="#ffffff" />

                {/* Pharmacy Label Tag */}
                <rect
                  x="-35"
                  y="12"
                  width="70"
                  height="16"
                  rx="4"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={isSelected ? '#14b8a6' : '#334155'}
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="23"
                  fill={isSelected ? '#2dd4bf' : '#e2e8f0'}
                  fontSize="7.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {pharm.name.split(' ')[0]} ({distance}km)
                </text>
              </g>
            );
          })}
        </svg>

        {/* 24/7 Filter Pill in Map Corner */}
        <div className="absolute top-2 left-2 flex items-center space-x-1.5">
          <button
            onClick={() => setFilter24h(!filter24h)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
              filter24h
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {filter24h ? '✓ 24/7 Chemist Only' : 'Show 24/7 Chemist'}
          </button>
        </div>
      </div>

      {/* Active Pharmacy Detail Card */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-white">{activePharm.name}</span>
              {activePharm.isOpen24Hours && (
                <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-semibold">
                  24/7 Open
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3 h-3 text-teal-400" />
              <span>{activePharm.address}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-teal-300">
              {calculateHaversineDistance(effectiveUserCoords, activePharm.coordinates)} km away
            </span>
            <p className="text-[9px] text-slate-400">Live GPS Distance</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px]">
          <div className="flex items-center space-x-3 text-slate-300">
            <a
              href={`tel:${activePharm.phone}`}
              className="inline-flex items-center space-x-1 text-teal-300 hover:text-teal-200"
            >
              <Phone className="w-3 h-3" />
              <span>{activePharm.phone}</span>
            </a>
          </div>

          {onReserveAtPharmacy && (
            <button
              onClick={() => onReserveAtPharmacy(activePharm.name)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all"
            >
              Reserve {selectedMedicineName} Here
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
