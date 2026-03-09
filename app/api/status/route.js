import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URL)
        await client.connect()
        db = client.db(process.env.DB_NAME)
    }
    return db
}

// Helper function to handle CORS
function handleCORS(response) {
    response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
}

export async function OPTIONS() {
    return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
    try {
        const db = await connectToMongo()
        const body = await request.json()

        if (!body.client_name) {
            return handleCORS(NextResponse.json(
                { error: "client_name is required" },
                { status: 400 }
            ))
        }

        const statusObj = {
            id: uuidv4(),
            client_name: body.client_name,
            timestamp: new Date()
        }

        await db.collection('status_checks').insertOne(statusObj)
        return handleCORS(NextResponse.json(statusObj))
    } catch (error) {
        console.error('API Error:', error)
        return handleCORS(NextResponse.json({ error: "Internal server error" }, { status: 500 }))
    }
}

export async function GET(request) {
    try {
        const db = await connectToMongo()
        const statusChecks = await db.collection('status_checks')
            .find({})
            .limit(1000)
            .toArray()

        // Remove MongoDB's _id field from response
        const cleanedStatusChecks = statusChecks.map(({ _id, ...rest }) => rest)

        return handleCORS(NextResponse.json(cleanedStatusChecks))
    } catch (error) {
        console.error('API Error:', error)
        return handleCORS(NextResponse.json({ error: "Internal server error" }, { status: 500 }))
    }
}
