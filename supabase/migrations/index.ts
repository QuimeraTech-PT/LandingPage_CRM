// Supabase Edge Function: cron-crm-maintenance
//
// Purpose: time-based CRM automations that don't belong on a row-level
// trigger (they aren't fired by a single row change, they run on a
// schedule): marking overdue invoices, notifying about contracts nearing
// expiry, and recalculating the per-client health score.
//
// All the actual logic lives in the Postgres function
// public.crm_run_scheduled_maintenance() (see the sales_pipeline_completion
// migration) — this function's only job is to invoke it with the service
// role, so it runs with elevated privileges regardless of who/what
// triggers the schedule.
//
// Scheduling: configure in the Supabase Dashboard under
// Edge Functions -> cron-crm-maintenance -> Cron, e.g. "0 * * * *" (hourly).
// This avoids depending on the pg_cron extension being enabled on the
// project's Postgres instance, which varies by plan.
//
// Deploy: supabase functions deploy cron-crm-maintenance

import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  // Optional shared-secret guard so this can't be triggered by anyone who
  // finds the URL. Set CRON_SECRET as a function secret and configure the
  // scheduler to send it as a header.
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret) {
    const provided = req.headers.get("x-cron-secret");
    if (provided !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { error } = await supabase.rpc("crm_run_scheduled_maintenance");
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, ranAt: new Date().toISOString() }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  } catch (error) {
    console.error("cron-crm-maintenance failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
});
