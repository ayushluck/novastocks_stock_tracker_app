'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

type BetterAuthUserRecord = {
    _id?: { toString(): string };
    id?: string;
    email?: string | null;
};

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            return [];
        }

        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Mongoose connection not connected');
        }

        const userCollection = db.collection<BetterAuthUserRecord>('user');
        const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const user = await userCollection.findOne(
            { email: { $regex: `^${escapedEmail}$`, $options: 'i' } },
            { projection: { _id: 1, id: 1, email: 1 } }
        );

        const userId = user?.id || user?._id?.toString();
        if (!userId) {
            return [];
        }

        const watchlistItems = await Watchlist.find({ userId }).select({ symbol: 1, _id: 0 }).lean<Array<{ symbol: string }>>();

        return watchlistItems.map((item) => item.symbol);
    } catch (error) {
        console.error('Error fetching watchlist symbols by email:', error);
        return [];
    }
};