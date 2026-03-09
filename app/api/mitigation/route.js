import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const { wardId, action, adminId } = await request.json();

        if (!wardId || !action) {
            return NextResponse.json(
                { error: 'wardId and action are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('mitigation_actions')
            .insert([
                {
                    ward_id: parseInt(wardId),
                    action_taken: action,
                    admin_id: adminId || 'admin-system',
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Error (Insert mitigation):', error);
            return NextResponse.json(
                { error: 'Failed to record mitigation action', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Mitigation recorded successfully', data },
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
