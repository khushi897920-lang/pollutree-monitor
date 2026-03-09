import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// EPA PM2.5 → AQI formula
function computeAQI(pm25) {
  if (!pm25 || isNaN(pm25) || pm25 <= 0) return 0;
  if (pm25 <= 12)    return Math.round((50  / 12)           * pm25);
  if (pm25 <= 35.4)  return Math.round(50  + (50  / 23.4)  * (pm25 - 12));
  if (pm25 <= 55.4)  return Math.round(100 + (50  / 20)    * (pm25 - 35.4));
  if (pm25 <= 150.4) return Math.round(150 + (50  / 95)    * (pm25 - 55.4));
  if (pm25 <= 250.4) return Math.round(200 + (100 / 100)   * (pm25 - 150.4));
  return                     Math.round(300 + (200 / 250)   * (pm25 - 250.4));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Only the 5 Delhi demo wards — Varanasi wards excluded
    const { data, error } = await supabase
      .from('aqi_readings')
      .select('*')
      .in('ward_id', [1, 2, 3, 4, 5])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch readings', details: error.message },
        { status: 500 }
      );
    }

    const wardMapping = {
      1: 'Anand Vihar',
      2: 'Connaught Place',
      3: 'Lodhi Road',
      4: 'Dwarka Sector 8',
      5: 'R.K. Puram'
    };

    // Transform — compute AQI once here so every consumer gets the same value
    const transformedData = data.map(raw => {
      const pm25 = raw.pm25_level ?? raw.pm25 ?? 0;
      const pm10 = raw.pm10_level ?? raw.pm10 ?? 0;
      const aqi  = computeAQI(pm25);
      return {
        id:         raw.id,
        created_at: raw.created_at,
        ward_id:    raw.ward_id,
        ward_name:  raw.ward_name || wardMapping[raw.ward_id] || `Ward ${raw.ward_id}`,
        pm25,
        pm10,
        gas_level:  raw.gas_level ?? 0,
        aqi,          // single computed value — used everywhere in UI
      };
    }).filter(r => r.pm25 > 0);

    // Latest reading per ward
    const latestByWard = {};
    transformedData.forEach(r => {
      if (!latestByWard[r.ward_name] ||
          new Date(r.created_at) > new Date(latestByWard[r.ward_name].created_at)) {
        latestByWard[r.ward_name] = r;
      }
    });

    return NextResponse.json(
      { success: true, readings: transformedData, latestByWard: Object.values(latestByWard) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Readings API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
