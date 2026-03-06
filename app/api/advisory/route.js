import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateHealthAdvisory } from '@/lib/gemini';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ward_id = searchParams.get('ward_id');

    // Fetch the latest AQI reading
    let query = supabase
      .from('aqi_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (ward_id) {
      query = query.eq('ward_id', parseInt(ward_id));
    }

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

    const latestReading = data[0];

    // Generate health advisory using Gemini
    const advisory = await generateHealthAdvisory(latestReading);

    return NextResponse.json(
      {
        success: true,
        advisory,
        aqiData: latestReading,
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
