import { inngest } from "@/lib/inngest/client";
import { sendWelcomeEmail } from "../nodemailer";

const withTimeout = async <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${label} timed out after ${ms}ms`));
        }, ms);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
};

export const sendSignUpEmail = inngest.createFunction(
    {
        id: 'sign-up-email',
        triggers: [{ event: 'app/user.created' }],
    },
    async ({ event }) => {
        const {
            email,
            name = 'there',
            country = '',
            investmentGoals = '',
            riskTolerance = '',
            preferredIndustry = '',
        } = event.data ?? {};

        if (!email) {
            console.error('Missing email in app/user.created event payload', event.data);
            return {
                success: false,
                message: 'Missing email in event payload',
            };
        }

        const userProfile = `
      - Country: ${country}
      - Investment goals: ${investmentGoals}
      - Risk tolerance: ${riskTolerance}
      - Preferred industry: ${preferredIndustry}
    `

        const introText = `
<p class="mobile-text" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">
Great to have you with us. Based on your profile (${userProfile.trim().replace(/\n\s*/g, ', ')}), Signalist will help you track relevant opportunities with clearer, faster market signals.
</p>`;

        try {
            await withTimeout(
                sendWelcomeEmail({
                    email,
                    name,
                    intro: introText,
                }),
                10000,
                'Welcome email send'
            );
        } catch (error) {
            console.error('Failed to send welcome email', error);
            return {
                success: false,
                message: 'Welcome email generation succeeded but sending failed',
            };
        }


        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)