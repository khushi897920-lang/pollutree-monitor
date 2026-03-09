import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateHealthAdvisory } from '@/lib/gemini';

export const maxDuration = 60;

// In-memory cache: avoid calling Gemini on every request
let advisoryCache = null;
let cacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const wardMapping = {
  1: 'Anand Vihar',
  2: 'Connaught Place',
  3: 'Lodhi Road',
  4: 'Dwarka Sector 8',
  5: 'R.K. Puram'
};

function getFallbackAdvisory(aqi = 0) {
  if (aqi >= 300) return `🚨 AQI ${aqi} — HAZARDOUS. All outdoor activities should be completely avoided today. Keep doors and windows tightly closed. Wear an N95/KN95 mask even indoors if you have respiratory issues. Run air purifiers continuously. Elderly, children, and those with heart or lung conditions are at serious risk — seek medical attention if you experience shortness of breath or chest pain.`;

  if (aqi >= 200) return `⛔ AQI ${aqi} — VERY UNHEALTHY. Avoid any outdoor exercise or prolonged time outside. If you must go out, wear an N95 or KN95 mask at all times. Keep windows and doors closed; use an air purifier if available. Sensitive groups including children, elderly, and people with asthma or heart disease should stay indoors for the entire day.`;

  if (aqi >= 150) return `⚠️ AQI ${aqi} — UNHEALTHY. Outdoor jogging, cycling, or heavy exercise is not recommended today. If you must be outside, keep it brief and wear a mask. Sensitive groups (children, elderly, asthma/heart patients) should remain indoors. Close windows during peak traffic hours and ventilate only in the late evening when levels may drop.`;

  if (aqi >= 100) return `🟠 AQI ${aqi} — UNHEALTHY FOR SENSITIVE GROUPS. Healthy adults can do light outdoor activities, but children, elderly, and people with respiratory or heart conditions should limit outdoor time. Avoid strenuous exercise outdoors. A 3-ply surgical mask is advisable if you're staying outside for extended periods.`;

  if (aqi >= 50) return `🟡 AQI ${aqi} — MODERATE. Air quality is acceptable for most people. Unusually sensitive individuals may experience mild discomfort during prolonged outdoor activity. Consider doing heavy exercise early morning or evening when pollution levels are typically lower. No mask required for healthy adults.`;

  return `✅ AQI ${aqi} — GOOD. Air quality is excellent and poses little or no health risk. It's a great day for outdoor activities — jogging, cycling, or spending time in parks is perfectly safe. Enjoy the fresh air!`;
}

export async function GET(request) {
  try {
    // Return cached advisory if still fresh
    if (advisoryCache && Date.now() - cacheTime < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, ...advisoryCache }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('aqi_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AQI data', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No AQI data available' },
        { status: 404 }
      );
    }

    const rawReading = data[0];
    const uiReading = {
      id: rawReading.id,
      created_at: rawReading.created_at,
      ward_id: rawReading.ward_id,
      ward_name: rawReading.ward_name || wardMapping[rawReading.ward_id] || `Ward ${rawReading.ward_id}`,
      pm25: rawReading.pm25 !== undefined ? rawReading.pm25 : rawReading.pm25_level,
      pm10: rawReading.pm10 !== undefined ? rawReading.pm10 : rawReading.pm10_level,
      gas_level: rawReading.gas_level,
      aqi_score: rawReading.aqi_score
    };

    // Try AI with 8s timeout, fall back to rule-based if too slow
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 8000)
    );

    let advisory;
    try {
      advisory = await Promise.race([generateHealthAdvisory(uiReading), timeout]);
    } catch {
      advisory = getFallbackAdvisory(uiReading.aqi_score);
    }

    // Cache the result
    advisoryCache = { advisory, aqiData: uiReading };
    cacheTime = Date.now();

    return NextResponse.json(
      { success: true, advisory, aqiData: uiReading },
      { status: 200 }
    );
  } catch (error) {
    console.error('Advisory API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate advisory', details: error.message },
      { status: 500 }
    );
  }
}
