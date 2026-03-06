'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Shield, Activity } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <Activity className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Smart City AQI Monitoring
          </h1>
          <p className="text-xl text-slate-300">
            Real-time hyperlocal air quality monitoring and AI-powered insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Citizen Dashboard */}
          <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/citizen')}>
            <div className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2 text-white">Citizen Dashboard</h2>
              <p className="text-slate-400 mb-6">
                View real-time AQI, health advisories, and interactive maps
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Enter Dashboard
              </Button>
            </div>
          </Card>

          {/* Admin Dashboard */}
          <Card className="bg-slate-900/50 backdrop-blur border-slate-800 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/admin')}>
            <div className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2 text-white">Admin Panel</h2>
              <p className="text-slate-400 mb-6">
                Monitor alerts, control mitigations, and manage city-wide AQI
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Admin Login
              </Button>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-2xl font-bold text-blue-400">Real-time</div>
              <div className="text-slate-400 mt-1">ESP32 Sensor Data</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">AI-Powered</div>
              <div className="text-slate-400 mt-1">Health Advisories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">Ward-level</div>
              <div className="text-slate-400 mt-1">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
