'use server';
import { getAuth as auth } from "@/lib/better_auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const authClient = await auth();
        const response = await authClient.api.signUpEmail({
            body: {
                email,
                password,
                name: fullName,
                // ensure Better Auth redirects / sets callback to dashboard on success
                callbackURL: '/dashboard'
            }
        })

        if (response) {
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry
                }
            })
        }

        return { success: true, data: response };

    } catch (e) {
        console.log('Sign up failed', e)
        return { success: false, error: 'Sign up failed' }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const authClient = await auth();
        const response = await authClient.api.signInEmail({
            body: {
                email,
                password
            }
        })
        return { success: true, data: response };
    } catch (e) {
        console.log('Sign In failed', e)
        return { success: false, error: 'Sign In failed' }
    }
}

export const signOut = async () => {
    try {
        const authClient = await auth();
        await authClient.api.signOut({ headers: await headers() });
        return { success: true };
    } catch (e) {
        console.error('Sign out failed', e);
        return { success: false, error: 'Sign out failed' };
    }
}