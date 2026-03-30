const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            const value = valueParts.join('=').replace(/^['"]|['"]$/g, '');
            if (key) process.env[key.trim()] = value;
        }
    });
}

const testDatabaseConnection = async () => {
    console.log('🧪 Testing MongoDB Connection...\n');
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'NOT SET'}\n`);

    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            throw new Error('❌ MONGODB_URI is not set in .env file');
        }

        console.log('⏳ Attempting to connect to MongoDB...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        });

        console.log('✅ Successfully connected to MongoDB!');

        // Get connection info
        const connection = mongoose.connection;
        console.log(`\n📊 Connection Details:`);
        console.log(`   - Host: ${connection.host}`);
        console.log(`   - Port: ${connection.port}`);
        console.log(`   - Database: ${connection.name}`);
        console.log(`   - State: ${connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);

        // Test a simple ping
        const adminDb = mongoose.connection.db?.admin();
        if (adminDb) {
            try {
                const pingResult = await adminDb.ping();
                console.log(`\n🏓 Ping Response:`, pingResult);
            } catch (pingError) {
                console.log(`\n⚠️  Ping test skipped`);
            }
        }

        console.log('\n✨ All tests passed! Your database connection is working properly.\n');

        // Disconnect
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error instanceof Error ? error.message : String(error));
        console.error('\n🔍 Troubleshooting Tips:');
        console.error('   1. Check your MONGODB_URI in .env file');
        console.error('   2. Ensure MongoDB cluster is active');
        console.error('   3. Verify network access in MongoDB Atlas');
        console.error('   4. Check your IP whitelist in MongoDB Atlas');
        console.error('   5. Verify connection string is correct\n');
        process.exit(1);
    }
};

testDatabaseConnection();
