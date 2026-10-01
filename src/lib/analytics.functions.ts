import { createServerFn } from "@tanstack/react-start";

/**
 * Server function to get GTM/GA4 IDs from environment variables.
 */
export const getAnalyticsConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    gtmId: process.env.GOOGLE_TAG_MANAGER_ID || "",
    gaId: process.env.GOOGLE_ANALYTICS_ID || "",
  };
});
