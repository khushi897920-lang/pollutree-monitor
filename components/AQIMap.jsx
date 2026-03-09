'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Loader2 } from 'lucide-react';
import { calculateAQI, getMarkerColor, getAQICategory } from '@/lib/aqiCalculator';
import { LineChart, Line, YAxis } from 'recharts';

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const useMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMap),
  { ssr: false }
);

const MapLegend = dynamic(
  () => import('./MapLegend'),
  { ssr: false }
);

// Ward locations (Delhi Demo)
const WARD_LOCATIONS = {
  'Anand Vihar': { name: 'Anand Vihar', lat: 28.6502, lng: 77.3027 },
  'Connaught Place': { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  'Lodhi Road': { name: 'Lodhi Road', lat: 28.5880, lng: 77.2280 },
  'Dwarka Sector 8': { name: 'Dwarka Sector 8', lat: 28.5714, lng: 77.0682 },
  'R.K. Puram': { name: 'R.K. Puram', lat: 28.5658, lng: 77.1724 },
};

export default function AQIMap({ readings = [], historicalReadings = [] }) {
  const [isClient, setIsClient] = useState(false);
  const [customIcon, setCustomIcon] = useState(null);

  useEffect(() => {
    setIsClient(true);

    // Create custom marker icon
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      setCustomIcon(L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }));
    }
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Center of Delhi
  const center = [28.6139, 77.2090];



  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      <style jsx global>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          background: #09090b; /* Match tailwind dark background */
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        /* Customize leaflet popup to remove default styling and blend with glassmorphism */
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          background: rgba(0,0,0,0.8) !important;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.2) !important;
          border-top: none !important;
          border-left: none !important;
        }
        /* Make map tiles dark */
        .leaflet-tile {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}</style>

      <MapContainer
        key="aqi-map-instance"
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapLegend />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {readings.map((reading) => {
          const ward = WARD_LOCATIONS[reading.ward_name];
          if (!ward) return null;

          const aqi = reading.aqi_score || calculateAQI(reading.pm25);
          const aqiCategory = getAQICategory(reading.pm25);
          const markerColor = getMarkerColor(reading.pm25);

          // Create custom neon colored marker
          const L = require('leaflet');
          const coloredIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 0 15px ${markerColor}, inset 0 0 10px rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; text-shadow: 0 0 4px black; backdrop-filter: blur(4px);">${aqi}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const wardHistory = historicalReadings
            .filter(r => r.ward_name === reading.ward_name)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .slice(-20); // Last 20 data points for sparkline

          return (
            <Marker
              key={reading.id}
              position={[ward.lat, ward.lng]}
              icon={coloredIcon}
            >
              <Popup className="glass-popup">
                <div className="p-3 min-w-[220px] bg-black/80 backdrop-blur-xl border border-white/20 text-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <h3 className="font-bold text-lg mb-2 text-neon-cyan pb-1 border-b border-white/10">{ward.name}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between items-center">
                      <span className="font-semibold text-gray-400">AQI:</span>
                      <span className="font-bold px-2 py-0.5 rounded text-black" style={{ backgroundColor: markerColor }}>{aqi}</span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="font-semibold text-gray-400">Status:</span>
                      <span style={{ color: markerColor, textShadow: `0 0 10px ${markerColor}` }}>{aqiCategory.category}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-gray-400">PM2.5:</span>
                      <span>{reading.pm25.toFixed(1)} µg/m³</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-gray-400">PM10:</span>
                      <span>{reading.pm10.toFixed(1)} µg/m³</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-gray-400">Gas:</span>
                      <span>{reading.gas_level.toFixed(1)}</span>
                    </p>
                  </div>
                  {wardHistory.length > 2 && (
                    <div className="mt-4 border-t border-white/10 pt-3">
                      <p className="text-[10px] text-gray-400 mb-1 ml-1 uppercase tracking-widest font-semibold">1-Hour PM2.5 Trend</p>
                      <div className="h-[60px] w-full mt-1 -ml-4">
                        <LineChart width={240} height={60} data={wardHistory}>
                          <Line
                            type="monotone"
                            dataKey="pm25"
                            stroke={markerColor}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                          />
                          <YAxis domain={['auto', 'auto']} hide />
                        </LineChart>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 mt-3 text-right">
                    {new Date(reading.created_at).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
