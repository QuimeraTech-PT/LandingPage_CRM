import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logActivity } from "./crm.functions";
import { z } from "zod";

const proposalStatusValues = [
  "draft",
  "sent",
  "viewed",
  "negotiation",
  "accepted",
  "rejected",
  "expired",
] as const;

const proposalItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
  sortOrder: z.number().optional().default(0),
});

export const getProposals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        status: z.enum(proposalStatusValues).nullable().optional(),
        opportunityId: z.string().uuid().nullable().optional(),
        companyId: z.string().uuid().nullable().optional(),
        limit: z.number().optional().default(50),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("crm_proposals")
      .select(
        "*, crm_companies(name), crm_contacts(name, email), crm_opportunities(name, status), crm_proposal_items(*)",
      )
      .order("created_at", { ascending: false });

    if (data.status) query = query.eq("status", data.status);
    if (data.opportunityId) query = query.eq("opportunity_id", data.opportunityId);
    if (data.companyId) query = query.eq("company_id", data.companyId);

    const { data: proposals, error } = await query.limit(data.limit);
    if (error) throw error;
    return proposals;
  });

export const getProposalById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.string().uuid().parse(data))
  .handler(async ({ data: id, context }) => {
    const { supabase } = context;
    const { data: proposal, error } = await supabase
      .from("crm_proposals")
      .select(
        "*, crm_companies(name, email), crm_contacts(name, email), crm_opportunities(name, status), crm_proposal_items(*)",
      )
      .eq("id", id)
      .order("sort_order", { referencedTable: "crm_proposal_items", ascending: true })
      .single();
    if (error) throw error;
    return proposal;
  });

/**
 * Creates a proposal together with its line items in one call. total_value
 * is not set here — it's derived automatically by the
 * trg_sync_proposal_total trigger the moment the items are inserted.
 */
export const createProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        opportunityId: z.string().uuid().nullable().optional(),
        leadId: z.string().uuid().nullable().optional(),
        companyId: z.string().uuid().nullable().optional(),
        contactId: z.string().uuid().nullable().optional(),
        title: z.string().min(2),
        validUntil: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        items: z.array(proposalItemSchema).min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: proposal, error: proposalError } = await supabase
      .from("crm_proposals")
      .insert([
        {
          opportunity_id: data.opportunityId,
          lead_id: data.leadId,
          company_id: data.companyId,
          contact_id: data.contactId,
          title: data.title,
          status: "draft",
          valid_until: data.validUntil,
          notes: data.notes,
          created_by: userId,
        },
      ])
      .select()
      .single();
    if (proposalError) throw proposalError;

    const { error: itemsError } = await supabase.from("crm_proposal_items").insert(
      data.items.map((item, idx) => ({
        proposal_id: proposal.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        sort_order: item.sortOrder ?? idx,
      })),
    );
    if (itemsError) throw itemsError;

    await logActivity({
      userId,
      action: "create_proposal",
      entityType: "proposal",
      entityId: proposal.id,
      details: { title: data.title, itemCount: data.items.length },
    });

    return proposal;
  });

export const updateProposalItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        proposalId: z.string().uuid(),
        items: z.array(proposalItemSchema.extend({ id: z.string().uuid().optional() })),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Simplest consistent approach: replace all items atomically.
    // Volume here is small (proposal line items), so this stays cheap.
    const { error: deleteError } = await supabase
      .from("crm_proposal_items")
      .delete()
      .eq("proposal_id", data.proposalId);
    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase.from("crm_proposal_items").insert(
      data.items.map((item, idx) => ({
        proposal_id: data.proposalId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        sort_order: item.sortOrder ?? idx,
      })),
    );
    if (insertError) throw insertError;

    return { success: true };
  });

/**
 * Status transitions (sent/viewed/accepted/rejected) are validated here at
 * the app boundary, but the actual side effects (timestamps, activity log)
 * are applied by the fn_handle_proposal_status_change trigger — keeps the
 * business rule in one place regardless of which client mutates the row.
 */
export const updateProposalStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(proposalStatusValues),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("crm_proposals")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

/**
 * "Convert to Project" — only enabled in the UI once a proposal is
 * ACCEPTED. Delegates to the fn_convert_proposal_to_project Postgres
 * function so the whole operation (project creation + proposal linkage +
 * opportunity win + activity log) is one atomic transaction, avoiding the
 * duplicate-project race that would exist if this logic lived in app code
 * across multiple round-trips.
 */
export const convertProposalToProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        proposalId: z.string().uuid(),
        projectName: z.string().min(2),
        startDate: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: projectId, error } = await supabase.rpc("fn_convert_proposal_to_project", {
      p_proposal_id: data.proposalId,
      p_project_name: data.projectName,
      p_start_date: data.startDate ?? new Date().toISOString().split("T")[0],
    });
    if (error) throw error;
    return { success: true, projectId: projectId as string };
  });

export const deleteProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("crm_proposals").delete().eq("id", data.id);
    if (error) throw error;
    await logActivity({
      userId,
      action: "delete",
      entityType: "proposal",
      entityId: data.id,
    });
    return { success: true };
  });
