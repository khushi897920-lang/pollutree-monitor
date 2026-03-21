import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateForecast } from '@/lib/gemini';

export const maxDuration = 60;

// In-memory cache: 15 minutes
let forecastCache = null;
let cacheTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function GET(request) {
  try {
    if (forecastCache && Date.now() - cacheTime < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, forecast: forecastCache }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('aqi_readings')
      .select('*')
      .order('aqi_score', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase Query Error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: true, forecast: [] },
        { status: 200 }
      );
    }

    const rawReading = data[0];

    let forecast;
    try {
      forecast = await generateForecast(rawReading);
    } catch (e) {
      console.error('Forecast generation failed:', e);
      const fallbackAqi = rawReading.aqi_score || 0;
      forecast = Array.from({ length: 6 }).map((_, i) => ({
        time: `+${i + 1}H`,
        aqi: fallbackAqi,
        label: fallbackAqi > 100 ? 'Unhealthy' : 'Moderate'
      }));
    }

    forecastCache = forecast;
    cacheTime = Date.now();

    return NextResponse.json({ success: true, forecast }, { status: 200 });
  } catch (error) {
    console.error('Forecast API Error:', error);
    // On error return fallback array of 6 items with current aqi value 
    const fallbackAqi = 0;
    const fallbackForecast = Array.from({ length: 6 }).map((_, i) => ({
      time: `+${i + 1}H`,
      aqi: fallbackAqi,
      label: 'Unknown'
    }));

    return NextResponse.json(
      { success: true, forecast: fallbackForecast },
      { status: 200 }
    );
  }
}
