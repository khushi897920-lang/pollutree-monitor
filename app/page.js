'use client';

import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Shield, Activity, MapPin, Brain, Wifi } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white">
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">Smart City AQI</h1>
          </div>
          <div className="flex gap-3">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/admin')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <Activity className="w-20 h-20 mx-auto mb-6 text-blue-400" />
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Smart City AQI Monitoring
          </h1>
          <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
            Real-time hyperlocal air quality monitoring with AI-powered health insights for any city
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
            onClick={() => router.push('/citizen')}>
            <div className="p-10 text-center">
              <Users className="w-20 h-20 mx-auto mb-6 text-blue-400 group-hover:scale-110 transition-transform" />
              <h2 className="text-3xl font-bold mb-3 text-white">Citizen Dashboard</h2>
              <p className="text-slate-400 mb-8 text-lg">
                View real-time AQI, AI health advisories, and interactive city maps
              </p>
              <div className="space-y-2 text-sm text-slate-300 text-left">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span>Live AQI readings for all city localities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>AI-powered health recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Interactive Leaflet maps</span>
                </div>
              </div>
              <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-lg py-6">
                View Public Dashboard
              </Button>
            </div>
          </Card>
          <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group"
            onClick={() => isSignedIn ? router.push('/admin') : router.push('/sign-in')}>
            <div className="p-10 text-center">
              <Shield className="w-20 h-20 mx-auto mb-6 text-purple-400 group-hover:scale-110 transition-transform" />
              <h2 className="text-3xl font-bold mb-3 text-white">Admin Panel</h2>
              <p className="text-slate-400 mb-8 text-lg">
                Monitor alerts, control mitigations, and manage city-wide AQI
              </p>
              <div className="space-y-2 text-sm text-slate-300 text-left">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span>Secure authentication required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  <span>Real-time pollution alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span>Mitigation control system</span>
                </div>
              </div>
              <Button className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-lg py-6">
                {isSignedIn ? 'Open Admin Panel' : 'Sign In Required'}
              </Button>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-slate-900/30 backdrop-blur rounded-xl border border-slate-800">
            <div className="text-4xl font-bold text-blue-400 mb-2">Real-time</div>
            <div className="text-slate-400">ESP32 Sensor Data</div>
            <p className="text-xs text-slate-500 mt-2">Live Environmental Metrics</p>
          </div>
          <div className="p-6 bg-slate-900/30 backdrop-blur rounded-xl border border-slate-800">
            <div className="text-4xl font-bold text-green-400 mb-2">AI-Powered</div>
            <div className="text-slate-400">Health Advisories</div>
            <p className="text-xs text-slate-500 mt-2">Google Gemini 2.5 Flash</p>
          </div>
          <div className="p-6 bg-slate-900/30 backdrop-blur rounded-xl border border-slate-800">
            <div className="text-4xl font-bold text-purple-400 mb-2">Ward-level</div>
            <div className="text-slate-400">City Monitoring</div>
            <p className="text-xs text-slate-500 mt-2">Configurable localities</p>
          </div>
        </div>
        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto bg-slate-900/50 backdrop-blur border-slate-800">
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4">ESP32 Hardware Integration</h3>
              <p className="text-slate-300 mb-4">
                Public API endpoint available for sensor data ingestion - no authentication required
              </p>
              <code className="block bg-slate-950 p-4 rounded text-sm text-green-400 font-mono">
                POST /api/sensor
              </code>
              <p className="text-xs text-slate-500 mt-4">
                Hardware devices can directly submit PM2.5, PM10, and gas readings
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
