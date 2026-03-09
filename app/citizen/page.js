'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wind, Droplets, Activity, AlertCircle, RefreshCw, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Chatbot from '@/components/Chatbot';
import { calculateAQI, getAQICategory } from '@/lib/aqiCalculator';
import AQITrendChart from '@/components/AQITrendChart';

const AQIMap = dynamic(() => import('@/components/AQIMap'), { ssr: false });

export default function CitizenDashboard() {
  const [readings, setReadings] = useState([]);
  const [historicalReadings, setHistoricalReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [advisory, setAdvisory] = useState('');
  const [loading, setLoading] = useState(true);
  const [advisoryLoading, setAdvisoryLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/readings?limit=100');
      const data = await response.json();

      if (data.success) {
        setReadings(data.latestByWard);
        setHistoricalReadings(data.readings);
        if (data.latestByWard.length > 0) {
          setLatestReading(data.latestByWard[0]);
        }

        const newAlerts = data.latestByWard
          .filter(reading => (reading.aqi || 0) > 100)
          .map(reading => ({
            ward_name: reading.ward_name,
            aqi: reading.aqi || 0,
            category: getAQICategory(reading.aqi || 0),
            timestamp: reading.created_at,
          }))
          .sort((a, b) => b.aqi - a.aqi);

        setAlerts(newAlerts);
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisory = async () => {
    try {
      setAdvisoryLoading(true);
      const response = await fetch('/api/advisory');
      const data = await response.json();
      if (data.success) setAdvisory(data.advisory);
    } catch (error) {
      console.error('Error fetching advisory:', error);
      setAdvisory('Unable to fetch health advisory at this time.');
    } finally {
      setAdvisoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAdvisory();
    // Auto-refresh disabled — use the Refresh button instead
  }, []);

  const pm25Val = latestReading?.pm25 ?? latestReading?.pm25_level ?? 0;
  const pm10Val = latestReading?.pm10 ?? latestReading?.pm10_level ?? 0;
  const gasVal = latestReading?.gas_level ?? 0;
  const aqi = latestReading ? (latestReading.aqi || 0) : 0;
  const aqiCategory = latestReading ? getAQICategory(aqi) : { category: 'Unknown', color: '#6b7280' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neon-cyan tracking-wider drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
                Smart City AQI Monitor
              </h1>
              <p className="text-sm text-gray-400 mt-1">Real-time Air Quality Dashboard</p>
            </div>
            <Button
              onClick={() => { fetchData(); fetchAdvisory(); }}
              variant="outline"
              className="border-slate-700 hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass-panel">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <h2 className="text-lg font-semibold text-white tracking-wide">Current AQI</h2>
                    <Activity className="w-5 h-5 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                  </div>

                  <div className="text-center py-8">
                    <div className="relative inline-block">
                      <div className="w-40 h-40 rounded-full bg-black/40 flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]" style={{ boxShadow: `0 0 30px ${aqiCategory.color}40, inset 0 0 20px ${aqiCategory.color}20`, borderColor: aqiCategory.color }}>
                        <div className="text-center">
                          <div className="text-5xl font-bold drop-shadow-[0_0_10px_currentColor]" style={{ color: aqiCategory.color }}>
                            {aqi}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest">AQI</div>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className="mt-6 px-4 py-1 text-sm shadow-[0_0_15px_currentColor] border border-white/20"
                      style={{ backgroundColor: `${aqiCategory.color}dd` }}
                    >
                      {aqiCategory.category}
                    </Badge>
                  </div>

                  {latestReading && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-neon-cyan" />
                          <span className="text-sm text-slate-300">PM2.5</span>
                        </div>
                        <span className="font-semibold text-white">{Number(pm25Val).toFixed(1)} µg/m³</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-neon-purple" />
                          <span className="text-sm text-slate-300">PM10</span>
                        </div>
                        <span className="font-semibold text-white">{Number(pm10Val).toFixed(1)} µg/m³</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-neon-red" />
                          <span className="text-sm text-slate-300">Gas Level</span>
                        </div>
                        <span className="font-semibold text-white">{Number(gasVal).toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              <Card className="glass-panel">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3 tracking-wide">
                    <AlertCircle className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    AI Health Advisory
                  </h2>
                  {advisoryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
                    </div>
                  ) : (
                    <p className="text-slate-300 leading-relaxed font-light">{advisory}</p>
                  )}
                </div>
              </Card>
              <Card className="glass-panel">
                <div className="p-4">
                  <h2 className="text-md font-semibold text-white tracking-wide mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                    <AlertTriangle className="w-4 h-4 text-neon-red drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                    Pollution Alerts
                  </h2>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                    {alerts.length === 0 ? (
                      <div className="text-center py-6">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <p className="text-xs text-slate-400 uppercase tracking-widest">All wards safe</p>
                      </div>
                    ) : (
                      alerts.slice(0, 5).map((alert, index) => (
                        <Alert key={index} className={`${alert.aqi > 200 ? 'bg-red-950/40 border-red-500/50 glow-pulse-critical' : 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                          } p-3 rounded-xl backdrop-blur-sm transition-all`}>
                          <AlertTriangle className={`h-4 w-4 ${alert.aqi > 200 ? 'text-red-400' : 'text-orange-400'}`} />
                          <AlertDescription>
                            <div className="flex items-center justify-between ml-2">
                              <div>
                                <p className="font-semibold text-white text-sm">{alert.ward_name}</p>
                                <p className="text-xs text-slate-300">AQI: {alert.aqi}</p>
                              </div>
                              <Badge
                                variant="destructive"
                                className={`text-[10px] tracking-wider uppercase border border-white/20 shadow-[0_0_10px_currentColor] ${alert.aqi <= 200 ? 'text-black font-bold' : 'text-white'}`}
                                style={{ backgroundColor: alert.category.color }}
                              >
                                {alert.aqi > 200 ? 'CRITICAL' : 'HIGH'}
                              </Badge>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="glass-panel h-[600px]">
                <div className="p-6 h-full flex flex-col">
                  <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-3 tracking-wide flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-purple drop-shadow-[0_0_8px_rgba(153,50,204,0.8)]" />
                    Ward-wise AQI Map
                  </h2>
                  <div className="flex-1 min-h-[400px] border border-white/10 rounded-lg overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    <AQIMap readings={readings} historicalReadings={historicalReadings} />
                  </div>
                </div>
              </Card>

              <div className="mt-6">
                <AQITrendChart data={historicalReadings} />
              </div>
            </div>
          </div>
        )}
      </main>
      <Chatbot />
    </div>
  );
}
