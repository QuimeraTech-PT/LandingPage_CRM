import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { getProjects } from "./crm.functions";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getRevenueForecast = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!context?.userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const [leads, finances] = await Promise.all([
      supabaseAdmin.from("crm_leads").select("status, estimated_value"),
      supabaseAdmin.from("crm_finances").select("amount, type, date"),
    ]);

    const leadsData = leads.data || [];
    const financesData = finances.data || [];

    // Confirmed revenue = paid income
    const confirmedRevenue = financesData
      .filter((f) => f.type === "income")
      .reduce((acc, f) => acc + Number(f.amount), 0);

    // Probable revenue from funnel
    const probableRevenue = leadsData.reduce((acc, l) => {
      if (l.status === "proposal") return acc + Number(l.estimated_value || 0) * 0.7;
      if (l.status === "negotiation") return acc + Number(l.estimated_value || 0) * 0.4;
      return acc;
    }, 0);

    return { confirmedRevenue, probableRevenue };
  });
