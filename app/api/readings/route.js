import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const ward_name = searchParams.get('ward_name'); // Keep optional filter from UI

    let query = supabase
      .from('aqi_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // If we wanted to filter by ward_name, we'd have to find the matching ID, 
    // but for now let's just fetch all and transform them.
    const { data, error } = await query;

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch readings', details: error.message },
        { status: 500 }
      );
    }

    // Delhi Map Wards mapping standard (Demo)
    const wardMapping = {
      1: 'Anand Vihar',
      2: 'Connaught Place',
      3: 'Lodhi Road',
      4: 'Dwarka Sector 8',
      5: 'R.K. Puram'
    };

    const transformedData = data.map(raw => ({
      id: raw.id,
      created_at: raw.created_at,
      ward_id: raw.ward_id,
      ward_name: raw.ward_name || wardMapping[raw.ward_id] || `Ward ${raw.ward_id}`,
      pm25: raw.pm25 !== undefined ? raw.pm25 : raw.pm25_level,
      pm10: raw.pm10 !== undefined ? raw.pm10 : raw.pm10_level,
      gas_level: raw.gas_level,
      aqi_score: raw.aqi_score
    })).filter(r => r.pm25 !== undefined); // Remove invalid rows

    // Group by ward_name and get the latest reading for each ward
    const latestByWard = {};
    transformedData.forEach((reading) => {
      if (!latestByWard[reading.ward_name] ||
        new Date(reading.created_at) > new Date(latestByWard[reading.ward_name].created_at)) {
        latestByWard[reading.ward_name] = reading;
      }
    });

    return NextResponse.json(
      {
        success: true,
        readings: transformedData,
        latestByWard: Object.values(latestByWard),
      },
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
