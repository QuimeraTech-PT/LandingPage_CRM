import { createServerFn } from "@tanstack/react-start";
/**
 * Server function to get GTM/GA4 IDs from environment variables.
 * In a real production app, you might want to fetch these from a database or secure vault.
 */
export const getAnalyticsConfig = createServerFn({ method: "GET" })
    .handler(async () => {
    return {
        gtmId: process.env.VITE_GTM_ID || "",
        gaId: process.env.VITE_GA_ID || "",
    };
});
