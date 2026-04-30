import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authInstance: any = null;

const trimEnv = (value: string | undefined) => value?.trim();

const getBaseURL = () => {
    const configuredUrl = trimEnv(process.env.BETTER_AUTH_URL);
    if (configuredUrl) {
        return configuredUrl;
    }

    // Vercel auto-provides VERCEL_URL
    const vercelUrl = trimEnv(process.env.VERCEL_URL);
    if (vercelUrl) {
        return `https://${vercelUrl}`;
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
    const secret = trimEnv(process.env.BETTER_AUTH_SECRET);
    if (!secret) {
        throw new Error("BETTER_AUTH_SECRET must be set in .env");
    }
    authInstance = betterAuth({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        database: mongodbAdapter(db as any),
        secret,
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