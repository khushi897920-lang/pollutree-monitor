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
  User
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { calculateAQI, getAQICategory } from '@/lib/aqiCalculator';

const AQIMap = dynamic(() => import('@/components/AQIMap'), { ssr: false });

export default function AdminDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/readings?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setReadings(data.latestByWard);
        
        // Generate alerts for high AQI
        const newAlerts = data.latestByWard
          .filter(reading => calculateAQI(reading.pm25_level) > 100)
          .map(reading => ({
            ward_id: reading.ward_id,
            aqi: calculateAQI(reading.pm25_level),
            category: getAQICategory(reading.pm25_level),
            timestamp: reading.created_at,
          }));
        
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

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, isSignedIn]);

  const handleMitigation = (wardId, action) => {
    alert(`Mitigation action "${action}" dispatched to Ward ${wardId}`);
    // In production, this would call an API to trigger mitigation actions
  };

  // Show loading while auth is being checked
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  // If not signed in, this should be handled by middleware
  // But as a safety check:
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
  const alertCount = alerts.length;
  const avgAQI = readings.length > 0
    ? Math.round(readings.reduce((sum, r) => sum + calculateAQI(r.pm25_level), 0) / readings.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-sm text-slate-400 mt-1">Smart City AQI Monitoring System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              <Button
                onClick={fetchData}
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Total Wards</p>
                      <p className="text-3xl font-bold text-white mt-1">{totalWards}</p>
                    </div>
                    <MapPin className="w-10 h-10 text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Active Alerts</p>
                      <p className="text-3xl font-bold text-red-400 mt-1">{alertCount}</p>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Average AQI</p>
                      <p className="text-3xl font-bold text-white mt-1">{avgAQI}</p>
                    </div>
                    <Activity className="w-10 h-10 text-green-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Map and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl h-[600px]">
                  <div className="p-6 h-full flex flex-col">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4">Live AQI Map</h2>
                    <div className="flex-1">
                      <AQIMap readings={readings} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Alerts & Mitigation */}
              <div className="space-y-6">
                {/* Alerts */}
                <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Pollution Alerts
                    </h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">All wards within safe limits</p>
                        </div>
                      ) : (
                        alerts.map((alert, index) => (
                          <Alert key={index} className="bg-red-950/30 border-red-900">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-white">Ward {alert.ward_id}</p>
                                  <p className="text-xs text-slate-300">AQI: {alert.aqi} - {alert.category.category}</p>
                                </div>
                                <Badge variant="destructive">{alert.category.category}</Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))
                      )}
                    </div>
                  </div>
                </Card>

                {/* Mitigation Controls */}
                <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-200 mb-4">Mitigation Actions</h2>
                    <div className="space-y-3">
                      {alerts.map((alert, index) => (
                        <Card key={index} className="bg-slate-800/50 border-slate-700">
                          <div className="p-4">
                            <p className="text-sm font-semibold text-white mb-3">Ward {alert.ward_id}</p>
                            <div className="space-y-2">
                              <Button
                                onClick={() => handleMitigation(alert.ward_id, 'Water Sprinklers')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                                size="sm"
                              >
                                <Droplets className="w-3 h-3 mr-2" />
                                Deploy Sprinklers
                              </Button>
                              <Button
                                onClick={() => handleMitigation(alert.ward_id, 'Traffic Control')}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-sm"
                                size="sm"
                              >
                                <Wind className="w-3 h-3 mr-2" />
                                Traffic Control
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {alerts.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">No mitigation actions required</p>
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
