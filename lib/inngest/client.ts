import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: 'signalist',
  isDev: process.env.NODE_ENV !== 'production',
  ai: { gemini: { apiKey: process.env.GEMINI_API_KEY! } }
});