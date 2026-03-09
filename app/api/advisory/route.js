import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateHealthAdvisory } from '@/lib/gemini';

export const maxDuration = 60;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ward_name = searchParams.get('ward_name');

    // Fetch the latest AQI reading
    // No longer filtering by ward_name in the query since Supabase is using ward_id natively
    let query = supabase
      .from('aqi_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    const { data, error } = await query;

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

    // Delhi Map Wards mapping standard (Demo)
    const wardMapping = {
      1: 'Anand Vihar',
      2: 'Connaught Place',
      3: 'Lodhi Road',
      4: 'Dwarka Sector 8',
      5: 'R.K. Puram'
    };

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

    // Generate health advisory using Gemini
    const advisory = await generateHealthAdvisory(uiReading);

    return NextResponse.json(
      {
        success: true,
        advisory,
        aqiData: uiReading,
      },
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
