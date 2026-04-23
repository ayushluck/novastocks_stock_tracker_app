'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { getAuth } from '@/lib/better_auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

type BetterAuthUserRecord = {
    _id?: { toString(): string };
    id?: string;
    email?: string | null;
};

type WatchlistEntry = {
    symbol: string;
    company: string;
    addedAt: Date;
};

const getDbAndUserByEmail = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
        return { db: null as null, userId: null as null | string };
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

    const userId = user?.id || user?._id?.toString() || null;
    return { db, userId };
};

const getCurrentSessionUser = async () => {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
};

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
    try {
        const { userId } = await getDbAndUserByEmail(email);
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

export const getWatchlistByEmail = async (email: string): Promise<WatchlistEntry[]> => {
    try {
        const { userId } = await getDbAndUserByEmail(email);
        if (!userId) {
            return [];
        }

        const items = await Watchlist.find({ userId })
            .select({ symbol: 1, company: 1, addedAt: 1, _id: 0 })
            .sort({ addedAt: -1 })
            .lean<Array<WatchlistEntry>>();

        return items;
    } catch (error) {
        console.error('Error fetching watchlist by email:', error);
        return [];
    }
};

export const getMyWatchlist = async (): Promise<WatchlistEntry[]> => {
    const user = await getCurrentSessionUser();
    if (!user?.email) {
        return [];
    }

    return getWatchlistByEmail(user.email);
};

export const addToMyWatchlist = async (symbol: string, company: string) => {
    try {
        const user = await getCurrentSessionUser();
        if (!user?.email) {
            return { success: false, error: 'Not authenticated' };
        }

        const { userId } = await getDbAndUserByEmail(user.email);
        if (!userId) {
            return { success: false, error: 'User not found' };
        }

        const normalizedSymbol = symbol.trim().toUpperCase();
        const normalizedCompany = company.trim() || normalizedSymbol;
        if (!normalizedSymbol) {
            return { success: false, error: 'Invalid symbol' };
        }

        await Watchlist.updateOne(
            { userId, symbol: normalizedSymbol },
            {
                $setOnInsert: {
                    userId,
                    symbol: normalizedSymbol,
                    company: normalizedCompany,
                    addedAt: new Date(),
                },
            },
            { upsert: true }
        );

        revalidatePath('/');
        revalidatePath(`/stocks/${normalizedSymbol}`);
        revalidatePath('/watchlist');
        return { success: true };
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return { success: false, error: 'Failed to add to watchlist' };
    }
};

export const removeFromMyWatchlist = async (symbol: string) => {
    try {
        const user = await getCurrentSessionUser();
        if (!user?.email) {
            return { success: false, error: 'Not authenticated' };
        }

        const { userId } = await getDbAndUserByEmail(user.email);
        if (!userId) {
            return { success: false, error: 'User not found' };
        }

        const normalizedSymbol = symbol.trim().toUpperCase();
        if (!normalizedSymbol) {
            return { success: false, error: 'Invalid symbol' };
        }

        await Watchlist.deleteOne({ userId, symbol: normalizedSymbol });

        revalidatePath('/');
        revalidatePath(`/stocks/${normalizedSymbol}`);
        revalidatePath('/watchlist');
        return { success: true };
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return { success: false, error: 'Failed to remove from watchlist' };
    }
};