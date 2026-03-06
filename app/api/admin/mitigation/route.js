import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Create mitigation action
export async function POST(request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = sessionClaims?.publicMetadata?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { ward_id, action_type, aqi_at_trigger, notes } = body;

    if (!ward_id || !action_type) {
      return NextResponse.json(
        { error: 'Missing required fields: ward_id, action_type' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('mitigation_actions')
      .insert([
        {
          ward_id: parseInt(ward_id),
          action_type,
          status: 'pending',
          triggered_by: sessionClaims?.email || 'admin',
          aqi_at_trigger: aqi_at_trigger || null,
          notes: notes || null,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json(
        { error: 'Failed to create mitigation action', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Mitigation action "${action_type}" dispatched to Ward ${ward_id}`,
        data: data[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mitigation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Get mitigation actions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ward_id = searchParams.get('ward_id');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = supabase
      .from('mitigation_actions')
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
        { error: 'Failed to fetch mitigation actions', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        actions: data,
        count: data.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get Mitigation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
