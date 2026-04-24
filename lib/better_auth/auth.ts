import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authInstance: any = null;

const getBaseURL = () => {
    if (process.env.BETTER_AUTH_URL) {
        return process.env.BETTER_AUTH_URL;
    }

    // Vercel auto-provides VERCEL_URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Fallback for local development
    return 'http://localhost:3000';
};

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
        baseURL: getBaseURL(),
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