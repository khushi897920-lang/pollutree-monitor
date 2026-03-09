'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card } from '@/components/ui/card';

export default function AQITrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800">
        <p className="text-slate-400 text-center">No trend data available</p>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map((reading) => ({
    time: new Date(reading.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    pm25: parseFloat(reading.pm25),
    pm10: parseFloat(reading.pm10),
    gas: parseFloat(reading.gas_level) / 10, // Scale down for better visualization
  }));

  return (
    <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">24-Hour AQI Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPm10" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            label={{ value: 'µg/m³', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f1f5f9'
            }}
          />
          <Area
            type="monotone"
            dataKey="pm25"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorPm25)"
            name="PM2.5"
          />
          <Area
            type="monotone"
            dataKey="pm10"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorPm10)"
            name="PM10"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-slate-300">PM2.5</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-slate-300">PM10</span>
        </div>
      </div>
    </Card>
  );
}
