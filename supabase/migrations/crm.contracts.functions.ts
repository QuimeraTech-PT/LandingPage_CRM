import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logActivity } from "./crm.functions";
import { z } from "zod";

const contractStatusValues = [
  "draft",
  "sent",
  "signed",
  "active",
  "expired",
  "cancelled",
] as const;

export const getContracts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        status: z.enum(contractStatusValues).nullable().optional(),
        companyId: z.string().uuid().nullable().optional(),
        expiringWithinDays: z.number().nullable().optional(),
        limit: z.number().optional().default(50),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("crm_contracts")
      .select("*, crm_companies(name), crm_projects(name)")
      .order("end_date", { ascending: true, nullsFirst: false });

    if (data.status) query = query.eq("status", data.status);
    if (data.companyId) query = query.eq("company_id", data.companyId);
    if (data.expiringWithinDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + data.expiringWithinDays);
      query = query
        .lte("end_date", cutoff.toISOString().split("T")[0])
        .gte("end_date", new Date().toISOString().split("T")[0]);
    }

    const { data: contracts, error } = await query.limit(data.limit);
    if (error) throw error;
    return contracts;
  });

export const createContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        companyId: z.string().uuid(),
        projectId: z.string().uuid().nullable().optional(),
        contractNumber: z.string().optional(),
        type: z.string().optional(),
        value: z.number().nullable().optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        documentUrl: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: contract, error } = await supabase
      .from("crm_contracts")
      .insert([
        {
          company_id: data.companyId,
          project_id: data.projectId,
          contract_number: data.contractNumber,
          type: data.type,
          value: data.value,
          start_date: data.startDate,
          end_date: data.endDate,
          document_url: data.documentUrl,
          notes: data.notes,
          status: "draft",
        },
      ])
      .select()
      .single();
    if (error) throw error;

    await logActivity({
      userId,
      action: "create_contract",
      entityType: "contract",
      entityId: contract.id,
      details: { companyId: data.companyId },
    });

    return contract;
  });

export const updateContractStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(contractStatusValues),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("crm_contracts")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const updateContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        contractNumber: z.string().optional(),
        value: z.number().nullable().optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        documentUrl: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, contractNumber, startDate, endDate, documentUrl, ...rest } = data;
    const { error } = await supabase
      .from("crm_contracts")
      .update({
        ...rest,
        ...(contractNumber !== undefined ? { contract_number: contractNumber } : {}),
        ...(startDate !== undefined ? { start_date: startDate } : {}),
        ...(endDate !== undefined ? { end_date: endDate } : {}),
        ...(documentUrl !== undefined ? { document_url: documentUrl } : {}),
      })
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  });

/**
 * Contracts expiring in the next N days — used by the admin dashboard
 * "upcoming deadlines" widget. The actual notification insert runs
 * server-side in crm_run_scheduled_maintenance() on a cron; this is a
 * read-only query for on-screen display.
 */
export const getExpiringContracts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ days: z.number().default(14) }).parse(data || {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + data.days);

    const { data: contracts, error } = await supabase
      .from("crm_contracts")
      .select("*, crm_companies(name)")
      .eq("status", "active")
      .gte("end_date", new Date().toISOString().split("T")[0])
      .lte("end_date", cutoff.toISOString().split("T")[0])
      .order("end_date", { ascending: true });

    if (error) throw error;
    return contracts;
  });

/**
 * Read-only access to the field-level audit trail (crm_audit_logs), which
 * is written exclusively by the fn_audit_row_changes DB trigger — no app
 * code ever inserts into this table directly. Kept separate from
 * getActivityLogs (crm.functions.ts), which serves the human-readable
 * timeline instead.
 */
export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        entityType: z.string().nullable().optional(),
        entityId: z.string().uuid().nullable().optional(),
        limit: z.number().optional().default(100),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("crm_audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.entityType) query = query.eq("entity_type", data.entityType);
    if (data.entityId) query = query.eq("entity_id", data.entityId);

    const { data: logs, error } = await query.limit(data.limit);
    if (error) throw error;
    return logs;
  });
