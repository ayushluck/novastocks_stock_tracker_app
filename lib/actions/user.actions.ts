'use server';

import { connectToDatabase } from "@/database/mongoose";

type BetterAuthUserRecord = {
    _id: unknown;
    id?: string;
    email?: string | null;
    name?: string | null;
    country?: string | null;
};

export const getAllUsersForNewsEmail = async (): Promise<User[]> => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('Mongoose connection not connected');

        const users = await db.collection<BetterAuthUserRecord>('user').find(
            { email: { $exists: true, $ne: null } },
            { projection: { _id: 1, id: 1, email: 1, name: 1, country: 1 } }
        ).toArray();

        return users
            .filter((user) => Boolean(user.email && user.name))
            .map((user) => ({
                id: user.id || String(user._id) || '',
                email: user.email!,
                name: user.name!,
            }))
    } catch (e) {
        console.error('Error fetching users for news email:', e)
        return []
    }
}