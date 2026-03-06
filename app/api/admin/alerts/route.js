import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateAQI } from '@/lib/aqiCalculator';

// Get pollution alerts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const acknowledged = searchParams.get('acknowledged');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = supabase
      .from('pollution_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (acknowledged !== null) {
      query = query.eq('acknowledged', acknowledged === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch alerts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        alerts: data,
        count: data.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get Alerts Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create alert from current AQI readings
export async function POST(request) {
  try {
    const body = await request.json();
    const { ward_id, aqi_level, alert_type, message } = body;

    if (!ward_id || !aqi_level || !alert_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pollution_alerts')
      .insert([
        {
          ward_id: parseInt(ward_id),
          aqi_level: parseFloat(aqi_level),
          alert_type,
          message: message || `Ward ${ward_id} AQI ${aqi_level} - ${alert_type} air quality detected`,
          acknowledged: false,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json(
        { error: 'Failed to create alert', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        alert: data[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Alert Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
