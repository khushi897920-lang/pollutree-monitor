import { NextResponse } from 'next/server'

// Helper function to handle CORS
function handleCORS(response) {
    response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
}

export async function OPTIONS() {
    return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function GET(request) {
    return handleCORS(NextResponse.json({ message: "Hello World" }))
}
