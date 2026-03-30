import { connectToDatabase } from '@/database/mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('🧪 Testing MongoDB Connection via API...');

        // Attempt to connect
        await connectToDatabase();

        return NextResponse.json(
            {
                success: true,
                message: '✅ Successfully connected to MongoDB!',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('❌ Database connection failed:', error);

        return NextResponse.json(
            {
                success: false,
                message: '❌ Failed to connect to MongoDB',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
                troubleshooting: [
                    'Check your MONGODB_URI in .env file',
                    'Ensure MongoDB cluster is active and running',
                    'Verify network access in MongoDB Atlas',
                    'Check your IP is whitelisted in MongoDB Atlas',
                    'Verify the connection string is correct',
                ],
            },
            { status: 500 }
        );
    }
}
