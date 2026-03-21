'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function AQIForecastChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true);
        const res = await fetch('/api/forecast');
        const json = await res.json();
        if (json.success && json.forecast) {
          setData(json.forecast);
        }
      } catch (e) {
        console.error('Failed to fetch forecast:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, []);

  const getColor = (aqi) => {
    if (aqi < 50) return '#22c55e'; // green
    if (aqi < 100) return '#eab308'; // yellow
    if (aqi < 150) return '#f97316'; // orange
    if (aqi < 200) return '#ef4444'; // red
    return '#a855f7'; // purple
  };

  if (loading) {
    return (
      <Card className="glass-panel mt-6">
        <div className="p-6 h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="glass-panel mt-6">
        <div className="p-6 h-[400px] flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-6xl text-slate-400">🛰️</div>
          <div>
            <h3 className="text-lg font-semibold text-white">Waiting for sensor data...</h3>
            <p className="text-sm text-slate-400">Forecast will appear once hardware is connected</p>
          </div>
        </div>
      </Card>
    );
  }

  const currentAqi = data.length > 0 ? data[0].aqi : 0;
  const gradientColor = getColor(currentAqi);

  return (
    <Card className="glass-panel mt-6">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-3 tracking-wide flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(153,50,204,0.8)]" />
          6-Hour AQI Forecast (AI POWERED)
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAqiForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 500]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="aqi" stroke={gradientColor} fillOpacity={1} fill="url(#colorAqiForecast)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
