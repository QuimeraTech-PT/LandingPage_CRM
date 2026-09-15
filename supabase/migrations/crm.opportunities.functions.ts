import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logActivity } from "./crm.functions";
import { z } from "zod";

const opportunityStatusValues = [
  "qualified",
  "meeting",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

/**
 * Promotes a lead into the opportunity pipeline. This is the "qualify"
 * action — the lead itself keeps existing (for traceability) but its
 * status moves to 'qualified' and a linked opportunity is created.
 * Company/contact are resolved the same way convertLeadToProject already
 * does, so we never duplicate a company when the same lead later wins.
 */
export const qualifyLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        leadId: z.string().uuid(),
        name: z.string().min(2),
        estimatedValue: z.number().nullable().optional(),
        expectedCloseDate: z.string().nullable().optional(),
        priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("id", data.leadId)
      .single();
    if (leadError || !lead) throw new Error("Lead não encontrada");

    let companyId = lead.company_id;
    if (!companyId && lead.company) {
      const { data: existingCompany } = await supabase
        .from("crm_companies")
        .select("id")
        .ilike("name", lead.company)
        .maybeSingle();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from("crm_companies")
          .insert([
            {
              name: lead.company,
              email: lead.email,
              phone: lead.phone,
              owner_id: userId,
              status: "prospective",
            },
          ])
          .select("id")
          .single();
        if (!companyError) companyId = newCompany.id;
      }
    }

    let contactId: string | null = null;
    if (companyId) {
      const { data: contact } = await supabase
        .from("crm_contacts")
        .insert([
          {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company_id: companyId,
            is_primary: true,
          },
        ])
        .select("id")
        .single();
      contactId = contact?.id ?? null;
    }

    const { data: opportunity, error: oppError } = await supabase
      .from("crm_opportunities")
      .insert([
        {
          lead_id: data.leadId,
          company_id: companyId,
          contact_id: contactId,
          name: data.name,
          status: "qualified",
          estimated_value: data.estimatedValue ?? lead.estimated_value ?? 0,
          expected_close_date: data.expectedCloseDate,
          priority: data.priority,
          owner_id: userId,
        },
      ])
      .select()
      .single();
    if (oppError) throw oppError;

    await supabase.from("crm_leads").update({ status: "qualified", company_id: companyId }).eq("id", data.leadId);

    await logActivity({
      userId,
      action: "qualify_lead",
      entityType: "opportunity",
      entityId: opportunity.id,
      details: { leadId: data.leadId, name: data.name },
    });

    return opportunity;
  });

export const getOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        status: z.enum(opportunityStatusValues).nullable().optional(),
        companyId: z.string().uuid().nullable().optional(),
        limit: z.number().optional().default(50),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("crm_opportunities")
      .select("*, crm_companies(name), crm_contacts(name, email), crm_leads(name)")
      .order("created_at", { ascending: false });

    if (data.status) query = query.eq("status", data.status);
    if (data.companyId) query = query.eq("company_id", data.companyId);

    const { data: opportunities, error } = await query.limit(data.limit);
    if (error) throw error;
    return opportunities;
  });

/**
 * Moves an opportunity in the pipeline (Kanban drag & drop). WON/LOST
 * side effects (marking the lead converted, promoting the company to an
 * active client, activity logging) are handled by the
 * fn_handle_opportunity_won trigger in the database — this function only
 * needs to write the new status. Field-level audit is also automatic via
 * fn_audit_row_changes.
 */
export const updateOpportunityStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(opportunityStatusValues),
        lostReason: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("crm_opportunities")
      .update({
        status: data.status,
        ...(data.status === "lost" ? { lost_reason: data.lostReason } : {}),
      })
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const updateOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().optional(),
        estimatedValue: z.number().optional(),
        probability: z.number().min(0).max(100).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        expectedCloseDate: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, estimatedValue, expectedCloseDate, ...rest } = data;
    const { error } = await supabase
      .from("crm_opportunities")
      .update({
        ...rest,
        ...(estimatedValue !== undefined ? { estimated_value: estimatedValue } : {}),
        ...(expectedCloseDate !== undefined ? { expected_close_date: expectedCloseDate } : {}),
      })
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  });

export const getPipelineSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("crm_opportunities")
      .select("status, estimated_value, probability");
    if (error) throw error;

    const summary = opportunityStatusValues.reduce(
      (acc, status) => {
        const items = (data || []).filter((o) => o.status === status);
        acc[status] = {
          count: items.length,
          value: items.reduce((sum, o) => sum + Number(o.estimated_value || 0), 0),
        };
        return acc;
      },
      {} as Record<(typeof opportunityStatusValues)[number], { count: number; value: number }>,
    );

    const openOpps = (data || []).filter((o) => o.status !== "won" && o.status !== "lost");
    const weightedPipelineValue = openOpps.reduce(
      (sum, o) => sum + (Number(o.estimated_value || 0) * (o.probability ?? 0)) / 100,
      0,
    );

    return { summary, weightedPipelineValue, openCount: openOpps.length };
  });
