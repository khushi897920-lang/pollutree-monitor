'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Droplets,
  Wind,
  Loader2,
  Activity,
  MapPin,
  User,
  TrendingUp,
  Bell,
  Shield,
  Cpu,
  AlertCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { calculateAQI, getAQICategory } from '@/lib/aqiCalculator';
import { detectPollutionSource, getPollutionContributions } from '@/lib/pollutionDetector';

const AQIMap = dynamic(() => import('@/components/AQIMap'), { ssr: false });

export default function AdminDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [readings, setReadings] = useState([]);
  const [historicalReadings, setHistoricalReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/readings?limit=100');
      const data = await response.json();

      if (data.success) {
        setReadings(data.latestByWard);
        setHistoricalReadings(data.readings);

        const newAlerts = data.latestByWard
          .filter(reading => (reading.aqi || 0) > 100)
          .map(reading => ({
            ward_id: reading.ward_id,
            ward_name: reading.ward_name,
            aqi: reading.aqi || 0,
            category: getAQICategory(reading.aqi || 0),
            timestamp: reading.created_at,
            pm25: reading.pm25 || 0,
            pm10: reading.pm10 || 0,
            gas_level: reading.gas_level || 0,
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

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn]);

  const handleMitigation = (wardId, action) => {
    alert(`✅ Mitigation action "${action}" dispatched to Ward ${wardId}`);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-900/50 backdrop-blur border-slate-800">
          <p className="text-white">Redirecting to sign in...</p>
        </Card>
      </div>
    );
  }

  const totalWards = readings.length;
  const avgAQI = readings.length > 0
    ? Math.round(
      readings.reduce((sum, r) => sum + (r.aqi || 0), 0) / readings.length
    )
    : 0;

  // Most polluted and safest ward
  const sortedByAQI = [...readings].map(r => ({ ...r, aqi: r.aqi || 0 })).sort((a, b) => b.aqi - a.aqi);
  const mostPolluted = sortedByAQI[0];
  const safestWard = sortedByAQI[sortedByAQI.length - 1];

  // AI Source Detection — use the most polluted ward's readings
  const aiSource = mostPolluted
    ? detectPollutionSource(
      mostPolluted.pm25 || 0,
      mostPolluted.pm10 || 0,
      mostPolluted.gas_level || 0
    )
    : null;

  const aiContributions = mostPolluted
    ? getPollutionContributions(
      mostPolluted.pm25 || mostPolluted.pm25_level || 0,
      mostPolluted.pm10 || mostPolluted.pm10_level || 0,
      mostPolluted.gas_level || 0
    )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                Admin Control Center
              </h1>
              <p className="text-sm text-slate-400 mt-1">City-wide AQI Monitoring & Mitigation System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500">Logged in as Admin</p>
                <p className="font-semibold text-sm flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
              <Button
                onClick={fetchData}
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-panel">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Total Wards</p>
                      <p className="text-3xl font-bold text-white mt-1">{totalWards}</p>
                    </div>
                    <MapPin className="w-10 h-10 text-blue-400 opacity-60" />
                  </div>
                </div>
              </Card>
              <Card className="glass-panel">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Most Polluted</p>
                      {mostPolluted ? (
                        <>
                          <p className="text-lg font-bold text-red-400 mt-1 leading-tight">{mostPolluted.ward_name}</p>
                          <p className="text-xs text-slate-500">({mostPolluted.aqi})</p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-slate-400 mt-1">N/A</p>
                      )}
                    </div>
                    <AlertTriangle className="w-10 h-10 text-red-400 opacity-60" />
                  </div>
                </div>
              </Card>
              <Card className="glass-panel">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Safest Ward</p>
                      {safestWard ? (
                        <>
                          <p className="text-lg font-bold text-emerald-400 mt-1 leading-tight">{safestWard.ward_name}</p>
                          <p className="text-xs text-slate-500">({safestWard.aqi})</p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-slate-400 mt-1">N/A</p>
                      )}
                    </div>
                    <CheckCircle className="w-10 h-10 text-emerald-400 opacity-60" />
                  </div>
                </div>
              </Card>
              <Card className="glass-panel">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Active Alerts</p>
                      <p className="text-3xl font-bold text-amber-400 mt-1">{alerts.length}</p>
                    </div>
                    <Bell className="w-10 h-10 text-amber-400 animate-pulse opacity-60" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
              <div className="lg:col-span-3 space-y-3">
                <Card className="glass-panel">
                  <div className="p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                      <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(153,50,204,0.8)]" />
                        Live City-wide AQI Map
                      </h2>
                      <Badge className="bg-purple-600">
                        {totalWards} Wards Monitored
                      </Badge>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-slate-700" style={{ height: '460px' }}>
                      <AQIMap readings={readings} historicalReadings={historicalReadings} />
                    </div>
                  </div>
                </Card>
                <Card className="glass-panel">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                      <h2 className="text-base font-semibold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                        Live Sensor Monitoring Data
                      </h2>
                      <Badge className="bg-blue-600 text-xs">Latest Readings</Badge>
                    </div>
                    <div className="hidden md:block overflow-x-auto">
                      <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
                        <table className="w-full text-left">
                          <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                            <tr className="border-b border-white/20 text-slate-200 text-xs uppercase tracking-widest">
                              <th className="pb-2 px-3">Ward Name</th>
                              <th className="pb-2 px-3">PM2.5 (µg/m³)</th>
                              <th className="pb-2 px-3">PM10 (µg/m³)</th>
                              <th className="pb-2 px-3">Gas Level</th>
                              <th className="pb-2 px-3">AQI Score</th>
                              <th className="pb-2 px-3">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {readings.map((reading) => {
                              const pm25 = reading.pm25 || reading.pm25_level || 0;
                              const pm10 = reading.pm10 || reading.pm10_level || 0;
                              const gas = reading.gas_level || 0;
                              const aqiVal = reading.aqi || 0;
                              const cat = getAQICategory(aqiVal);
                              return (
                                <tr key={reading.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                  <td className="py-2.5 px-3 font-medium text-white text-sm">{reading.ward_name}</td>
                                  <td className="py-2.5 px-3 text-cyan-400 font-medium text-sm">{Number(pm25).toFixed(1)}</td>
                                  <td className="py-2.5 px-3 text-orange-400 font-medium text-sm">{Number(pm10).toFixed(1)}</td>
                                  <td className="py-2.5 px-3 text-amber-300 font-medium text-sm">{Number(gas).toFixed(1)}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="font-bold text-sm px-2 py-0.5 rounded" style={{ color: cat.color }}>
                                      {aqiVal}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500 text-xs">
                                    {new Date(reading.created_at).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {readings.length === 0 && (
                          <div className="text-center py-8 text-slate-500 uppercase tracking-widest text-xs">No sensor data available.</div>
                        )}
                      </div>
                    </div>
                    <div className="md:hidden space-y-3 max-h-[280px] overflow-y-auto">
                      {readings.map((reading) => {
                        const pm25 = reading.pm25 || reading.pm25_level || 0;
                        const aqiVal = reading.aqi || 0;
                        const cat = getAQICategory(aqiVal);
                        return (
                          <div key={reading.id} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                              <span className="font-semibold text-white">{reading.ward_name}</span>
                              <span className="font-bold text-sm" style={{ color: cat.color }}>
                                AQI: {reading.aqi || 0}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-slate-500 uppercase">PM2.5</p>
                                <p className="text-cyan-400 font-medium">{Number(pm25).toFixed(1)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase">PM10</p>
                                <p className="text-orange-400 font-medium">{Number(reading.pm10 || reading.pm10_level || 0).toFixed(1)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase">Gas</p>
                                <p className="text-amber-300 font-medium">{Number(reading.gas_level || 0).toFixed(1)}</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-600 text-right">{new Date(reading.created_at).toLocaleString()}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="glass-panel">
                  <div className="p-4">
                    <h2 className="text-md font-semibold text-white tracking-wide mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                      <AlertTriangle className="w-4 h-4 text-neon-red drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                      Pollution Alerts
                    </h2>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                      {alerts.length === 0 ? (
                        <div className="text-center py-6">
                          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          <p className="text-xs text-slate-400 uppercase tracking-widest">All wards safe</p>
                        </div>
                      ) : (
                        alerts.map((alert, index) => (
                          <Alert key={index} className={`${alert.aqi > 200 ? 'bg-red-950/40 border-red-500/50 glow-pulse-critical' : 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                            } p-2.5 rounded-xl backdrop-blur-sm transition-all`}>
                            <AlertTriangle className={`h-3.5 w-3.5 ${alert.aqi > 200 ? 'text-red-400' : 'text-orange-400'}`} />
                            <AlertDescription>
                              <div className="flex items-center justify-between ml-2">
                                <div>
                                  <p className="font-semibold text-white text-sm">{alert.ward_name}</p>
                                  <p className="text-xs text-slate-400">AQI {alert.aqi}</p>
                                </div>
                                <Badge
                                  className={`text-[9px] tracking-wider uppercase border border-white/20 ${alert.aqi <= 200 ? 'text-black font-extrabold' : 'text-white'}`}
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
                {aiSource && mostPolluted && (
                  <Card className="glass-panel">
                    <div className="p-4">
                      <h2 className="text-md font-semibold text-white tracking-wide mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Cpu className="w-4 h-4 text-purple-400 drop-shadow-[0_0_5px_rgba(153,50,204,0.8)]" />
                        AI Source Detection
                      </h2>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 leading-tight">
                          <span className="text-white font-semibold">{mostPolluted.ward_name}</span>
                          <span className="text-slate-500"> &mdash; most polluted</span>
                        </p>
                        <Badge
                          className="text-[9px] tracking-wider uppercase text-white border border-white/20"
                          style={{ backgroundColor: aiSource.color }}
                        >
                          {aiSource.source}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {aiContributions.map((src) => (
                          <div key={src.label}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[11px] text-slate-300 flex items-center gap-1">
                                <span>{src.icon}</span>
                                {src.label}
                              </span>
                              <span
                                className="text-[11px] font-bold"
                                style={{ color: src.color }}
                              >
                                {src.pct}%
                              </span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${src.pct}%`,
                                  backgroundColor: src.color,
                                  boxShadow: `0 0 6px ${src.color}80`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs mt-3 pt-2 border-t border-white/10">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">PM10:</span>
                          <span className="text-cyan-400 font-bold ml-1">{Number(mostPolluted.pm10 || mostPolluted.pm10_level || 0).toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">PM2.5:</span>
                          <span className="text-cyan-400 font-bold ml-1">{Number(mostPolluted.pm25 || mostPolluted.pm25_level || 0).toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase">Gas:</span>
                          <span className="text-red-400 font-bold ml-1">{Number(mostPolluted.gas_level || 0).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
                <Card className="glass-panel">
                  <div className="p-4">
                    <h2 className="text-md font-semibold text-white tracking-wide mb-3 border-b border-white/10 pb-2">Quick Actions</h2>
                    <div className="space-y-3">
                      {alerts.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No actions needed</p>
                      ) : (
                        alerts.slice(0, 3).map((alert, index) => (
                          <div key={index}>
                            <p className="text-xs font-semibold text-white mb-1.5">{alert.ward_name}</p>
                            <div className="space-y-1">
                              <Button
                                onClick={() => handleMitigation(alert.ward_id, 'Water Sprinklers')}
                                className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                              >
                                <Droplets className="w-3 h-3 mr-1" />
                                Deploy Sprinklers
                              </Button>
                              <Button
                                onClick={() => handleMitigation(alert.ward_id, 'Traffic Control')}
                                className="w-full bg-amber-600 hover:bg-amber-700 h-8 text-xs"
                              >
                                <Wind className="w-3 h-3 mr-1" />
                                Traffic Control
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>


          </div>
        )}
      </main>
    </div>
  );
}
