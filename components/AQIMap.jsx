'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Loader2 } from 'lucide-react';
import { calculateAQI, getMarkerColor, getAQICategory } from '@/lib/aqiCalculator';

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

// Ward locations (Delhi)
const WARD_LOCATIONS = {
  1: { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  2: { name: 'Rohini', lat: 28.7496, lng: 77.0669 },
  3: { name: 'Dwarka', lat: 28.5921, lng: 77.0460 },
  4: { name: 'Mayur Vihar', lat: 28.6077, lng: 77.2987 },
  5: { name: 'Nehru Place', lat: 28.5494, lng: 77.2501 },
};

export default function AQIMap({ readings = [] }) {
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
          background: #0f172a;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>
      
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {readings.map((reading) => {
          const ward = WARD_LOCATIONS[reading.ward_id];
          if (!ward) return null;

          const aqi = calculateAQI(reading.pm25_level);
          const aqiCategory = getAQICategory(reading.pm25_level);
          const markerColor = getMarkerColor(reading.pm25_level);

          // Create custom colored marker
          const L = require('leaflet');
          const coloredIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">${aqi}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          return (
            <Marker
              key={reading.id}
              position={[ward.lat, ward.lng]}
              icon={coloredIcon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{ward.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="font-semibold">AQI:</span>
                      <span className="font-bold" style={{ color: markerColor }}>{aqi}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Status:</span>
                      <span style={{ color: markerColor }}>{aqiCategory.category}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">PM2.5:</span>
                      <span>{reading.pm25_level.toFixed(1)} µg/m³</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">PM10:</span>
                      <span>{reading.pm10_level.toFixed(1)} µg/m³</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">Gas:</span>
                      <span>{reading.gas_level.toFixed(1)}</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
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
