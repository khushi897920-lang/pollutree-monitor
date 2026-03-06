import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const ward_id = searchParams.get('ward_id');

    let query = supabase
      .from('aqi_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (ward_id) {
      query = query.eq('ward_id', parseInt(ward_id));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch readings', details: error.message },
        { status: 500 }
      );
    }

    // Group by ward_id and get the latest reading for each ward
    const latestByWard = {};
    data.forEach((reading) => {
      if (!latestByWard[reading.ward_id] || 
          new Date(reading.created_at) > new Date(latestByWard[reading.ward_id].created_at)) {
        latestByWard[reading.ward_id] = reading;
      }
    });

    return NextResponse.json(
      {
        success: true,
        readings: data,
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
