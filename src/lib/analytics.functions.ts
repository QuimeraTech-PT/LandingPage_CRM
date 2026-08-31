import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Server function to get GTM/GA4 IDs from environment variables.
 */
export const getAnalyticsConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    gtmId: process.env.GOOGLE_TAG_MANAGER_ID || "",
    gaId: process.env.GOOGLE_ANALYTICS_ID || "",
  };
});

/**
 * Persists user cookie preferences to the backend.
 * (Sync logic removed temporarily during auth refactor)
 */
export const syncCookiePreferences = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        analytics: z.boolean(),
        marketing: z.boolean(),
      })
      .parse(data),
  )
  .handler(async () => {
    return { success: true };
  });

/**
 * Retrieves cookie preferences from the backend.
 */
export const getSyncedCookiePreferences = createServerFn({ method: "GET" }).handler(async () => {
  return null;
});
