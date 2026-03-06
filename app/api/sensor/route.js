import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ward_id, pm25, pm10, gas } = body;

    // Validate required fields
    if (!ward_id || pm25 === undefined || pm10 === undefined || gas === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: ward_id, pm25, pm10, gas' },
        { status: 400 }
      );
    }

    // Insert sensor data into Supabase
    const { data, error } = await supabase
      .from('aqi_readings')
      .insert([
        {
          ward_id: parseInt(ward_id),
          pm25_level: parseFloat(pm25),
          pm10_level: parseFloat(pm10),
          gas_level: parseFloat(gas),
        },
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json(
        { error: 'Failed to insert sensor data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Sensor data received and stored',
        data: data[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sensor API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Sensor endpoint is working. Use POST to submit sensor data.' },
    { status: 200 }
  );
}
