import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatbotResponse } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, ward_id } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Fetch latest AQI readings for context
    let query = supabase
      .from('aqi_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (ward_id) {
      query = query.eq('ward_id', parseInt(ward_id));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AQI context', details: error.message },
        { status: 500 }
      );
    }

    // Generate chatbot response with AQI context
    const answer = await chatbotResponse(question, data || []);

    return NextResponse.json(
      {
        success: true,
        question,
        answer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('QnA API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}
