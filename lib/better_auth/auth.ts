import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authInstance: any = null;

export const getAuth = async () => {
    if (authInstance) {
        return authInstance;
    }
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("Failed to connect to the database");
    }
    authInstance = betterAuth({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        database: mongodbAdapter(db as any),
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },
        plugins: [nextCookies()]
    });
    return authInstance;
}