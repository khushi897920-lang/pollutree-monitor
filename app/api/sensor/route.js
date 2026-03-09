import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Delhi wards only — no hardware yet, using simulated local data
const WARD_NAME_TO_ID = {
  'anand vihar': 1,
  'connaught place': 2,
  'lodhi road': 3,
  'dwarka sector 8': 4,
  'r.k. puram': 5,
  'rk puram': 5,
};

function resolveWardId(ward_id, ward_name) {
  if (ward_id !== undefined && ward_id !== null && !isNaN(Number(ward_id))) {
    return Number(ward_id);
  }
  if (ward_name) {
    const key = ward_name.trim().toLowerCase();
    if (WARD_NAME_TO_ID[key] !== undefined) return WARD_NAME_TO_ID[key];
  }
  return null;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const raw_ward_id = body.ward_id;
    const ward_name = body.ward_name;
    const pm25 = body.pm25_level ?? body.pm25;
    const pm10 = body.pm10_level ?? body.pm10;
    const gas = body.gas_level ?? body.gas;
    const aqi = body.aqi_score ?? body.aqi;

    const ward_id = resolveWardId(raw_ward_id, ward_name);

    if (ward_id === null || pm25 === undefined) {
      return NextResponse.json({
        success: false,
        error: `Unrecognised ward: ward_id="${raw_ward_id}", ward_name="${ward_name}"`
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('aqi_readings')
      .insert([{
        ward_id,
        ward_name: ward_name || `Ward ${ward_id}`,
        pm25_level: Number(pm25),
        pm10_level: pm10 !== undefined ? Number(pm10) : null,
        gas_level: gas !== undefined ? Number(gas) : null,
        aqi_score: aqi !== undefined ? Number(aqi) : null,
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (err) {
    console.error('Sensor POST error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}