import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
 * This is used to maintain choice across devices for authenticated users.
 */
export const syncCookiePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        analytics: z.boolean(),
        marketing: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    if (!context?.userId) return { success: false };

    const { error } = await context.supabase
      .from("profiles")
      .update({
        cookie_preferences: data as any,
      })
      .eq("id", context.userId);

    if (error) {
      console.error("Error syncing cookie preferences:", error);
      return { success: false };
    }

    return { success: true };
  });

/**
 * Retrieves cookie preferences from the backend.
 */
export const getSyncedCookiePreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!context?.userId) return null;

    const { data, error } = await context.supabase
      .from("profiles")
      .select("cookie_preferences")
      .eq("id", context.userId)
      .single();

    if (error || !data?.cookie_preferences) return null;

    return data.cookie_preferences as { analytics: boolean; marketing: boolean };
  });
