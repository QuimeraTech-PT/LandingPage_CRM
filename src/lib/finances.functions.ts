import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getRevenueForecast = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [leads, finances] = await Promise.all([
      supabase.from("crm_leads").select("status, estimated_value"),
      supabase.from("crm_finances").select("amount, type, date, status"),
    ]);

    if (leads.error) throw leads.error;
    if (finances.error) throw finances.error;

    const leadsData = leads.data || [];
    const financesData = finances.data || [];

    // Only paid income is confirmed revenue.
    const confirmedRevenue = financesData
      .filter((f) => f.type === "income" && f.status === "paid")
      .reduce((acc, f) => acc + Number(f.amount), 0);

    // Probable revenue from funnel
    const probableRevenue = leadsData.reduce((acc, l) => {
      if (l.status === "proposal") return acc + Number(l.estimated_value || 0) * 0.7;
      if (l.status === "negotiation") return acc + Number(l.estimated_value || 0) * 0.4;
      return acc;
    }, 0);

    return { confirmedRevenue, probableRevenue };
  });
