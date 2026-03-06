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
  Shield
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
          }))
          .sort((a, b) => b.aqi - a.aqi); // Sort by AQI descending
        
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
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
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
  const criticalAlerts = alerts.filter(a => a.aqi > 200).length;
  const avgAQI = readings.length > 0
    ? Math.round(readings.reduce((sum, r) => sum + calculateAQI(r.pm25_level), 0) / readings.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Admin Header */}
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
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
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

      <main className="container mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Total Wards</p>
                      <p className="text-3xl font-bold text-white mt-1">{totalWards}</p>
                    </div>
                    <MapPin className="w-10 h-10 text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-900/50 to-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Critical Alerts</p>
                      <p className="text-3xl font-bold text-red-400 mt-1">{criticalAlerts}</p>
                    </div>
                    <Bell className="w-10 h-10 text-red-400 animate-pulse" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-amber-900/50 to-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Active Alerts</p>
                      <p className="text-3xl font-bold text-amber-400 mt-1">{alerts.length}</p>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/50 to-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Avg City AQI</p>
                      <p className="text-3xl font-bold text-white mt-1">{avgAQI}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content: Map + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Large Map - Takes 75% width */}
              <div className="lg:col-span-3">
                <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl h-[700px]">
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-400" />
                        Live City-wide AQI Map
                      </h2>
                      <Badge className="bg-purple-600">
                        {totalWards} Wards Monitored
                      </Badge>
                    </div>
                    <div className="flex-1 rounded-lg overflow-hidden border border-slate-700">
                      <AQIMap readings={readings} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Sidebar - 25% width */}
              <div className="space-y-6">
                {/* Alerts Panel */}
                <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                  <div className="p-4">
                    <h2 className="text-md font-semibold text-slate-200 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Pollution Alerts
                    </h2>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="text-center py-6">
                          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">All wards safe</p>
                        </div>
                      ) : (
                        alerts.slice(0, 5).map((alert, index) => (
                          <Alert key={index} className={`${
                            alert.aqi > 200 ? 'bg-red-950/40 border-red-900' : 'bg-orange-950/40 border-orange-900'
                          } p-3`}>
                            <AlertTriangle className="h-3 w-3" />
                            <AlertDescription>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-white text-sm">Ward {alert.ward_id}</p>
                                  <p className="text-xs text-slate-300">AQI: {alert.aqi}</p>
                                </div>
                                <Badge 
                                  variant="destructive" 
                                  className="text-xs"
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

                {/* Quick Mitigation */}
                <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-xl">
                  <div className="p-4">
                    <h2 className="text-md font-semibold text-slate-200 mb-3">Quick Actions</h2>
                    <div className="space-y-2">
                      {alerts.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No actions needed</p>
                      ) : (
                        alerts.slice(0, 3).map((alert, index) => (
                          <Card key={index} className="bg-slate-800/50 border-slate-700 p-3">
                            <p className="text-xs font-semibold text-white mb-2">Ward {alert.ward_id}</p>
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
                          </Card>
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
