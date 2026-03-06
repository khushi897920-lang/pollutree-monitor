'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wind, Droplets, Activity, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Chatbot from '@/components/Chatbot';
import { calculateAQI, getAQICategory } from '@/lib/aqiCalculator';

const AQIMap = dynamic(() => import('@/components/AQIMap'), { ssr: false });

export default function CitizenDashboard() {
  const [readings, setReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [advisory, setAdvisory] = useState('');
  const [loading, setLoading] = useState(true);
  const [advisoryLoading, setAdvisoryLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/readings?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setReadings(data.latestByWard);
        if (data.latestByWard.length > 0) {
          setLatestReading(data.latestByWard[0]);
        }
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
      
      if (data.success) {
        setAdvisory(data.advisory);
      }
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

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchData();
      fetchAdvisory();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const aqi = latestReading ? calculateAQI(latestReading.pm25_level) : 0;
  const aqiCategory = latestReading ? getAQICategory(latestReading.pm25_level) : { category: 'Unknown', color: 'gray' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Smart City AQI Monitor
              </h1>
              <p className="text-sm text-slate-400 mt-1">Real-time Air Quality Dashboard</p>
            </div>
            <Button
              onClick={() => {
                fetchData();
                fetchAdvisory();
              }}
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
            {/* Main AQI Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-200">Current AQI</h2>
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  
                  <div className="text-center py-8">
                    <div className="relative inline-block">
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-4" style={{ borderColor: aqiCategory.color }}>
                        <div className="text-center">
                          <div className="text-5xl font-bold" style={{ color: aqiCategory.color }}>
                            {aqi}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">AQI</div>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className="mt-4"
                      style={{ backgroundColor: aqiCategory.color }}
                    >
                      {aqiCategory.category}
                    </Badge>
                  </div>

                  {latestReading && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-slate-300">PM2.5</span>
                        </div>
                        <span className="font-semibold text-white">{latestReading.pm25_level.toFixed(1)} µg/m³</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-slate-300">PM10</span>
                        </div>
                        <span className="font-semibold text-white">{latestReading.pm10_level.toFixed(1)} µg/m³</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-slate-300">Gas Level</span>
                        </div>
                        <span className="font-semibold text-white">{latestReading.gas_level.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Health Advisory */}
              <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    AI Health Advisory
                  </h2>
                  {advisoryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <p className="text-slate-300 leading-relaxed">{advisory}</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl h-[600px]">
                <div className="p-6 h-full flex flex-col">
                  <h2 className="text-lg font-semibold text-slate-200 mb-4">Ward-wise AQI Map</h2>
                  <div className="flex-1">
                    <AQIMap readings={readings} />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
