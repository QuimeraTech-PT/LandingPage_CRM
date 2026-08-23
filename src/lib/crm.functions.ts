import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { z } from "zod";

// Helper to log activities
async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  details = {},
  status = "success",
}: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Json;
  status?: "success" | "failure" | "warning";
}) {
  try {
    await supabaseAdmin.from("crm_activity_logs").insert([
      {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        status,
      },
    ]);
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}

export const getCRMStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const [leads, projects, finances] = await Promise.all([
      supabaseAdmin.from("crm_leads").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("crm_projects").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("crm_finances").select("amount, type"),
    ]);

    const totalLeads = leads.count || 0;
    const activeProjects = projects.count || 0;

    const revenue = (finances.data || [])
      .filter((f) => f.type === "income")
      .reduce((acc, f) => acc + Number(f.amount), 0);

    const expenses = (finances.data || [])
      .filter((f) => f.type === "expense")
      .reduce((acc, f) => acc + Number(f.amount), 0);

    return {
      totalLeads,
      activeProjects,
      revenue,
      profit: revenue - expenses,
    };
  });

export const getLeads = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("crm_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const createLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        company: z.string().nullable().optional(),
        estimated_value: z.number().nullable().optional(),
        notes: z.string().nullable().optional(),
        status: z
          .enum(["new", "contacted", "proposal", "negotiation", "closed_won", "closed_lost"])
          .optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("crm_leads").insert([data]);

    if (error) throw error;
    return { success: true };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum([
          "new",
          "contacted",
          "proposal",
          "negotiation",
          "closed_won",
          "closed_lost",
        ]),
        estimated_value: z.number().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("crm_leads")
      .update({
        status: data.status,
        estimated_value: data.estimated_value,
      })
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

export const updateLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().optional(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        company: z.string().nullable().optional(),
        estimated_value: z.number().nullable().optional(),
        notes: z.string().nullable().optional(),
        status: z
          .enum(["new", "contacted", "proposal", "negotiation", "closed_won", "closed_lost"])
          .optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { id, ...updateData } = data;
    const { error } = await supabaseAdmin.from("crm_leads").update(updateData).eq("id", id);

    if (error) throw error;

    await logActivity({
      action: "update",
      entityType: "lead",
      entityId: id,
      details: updateData,
    });

    return { success: true };
  });

export const convertLeadToProject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        leadId: z.string().uuid(),
        projectName: z.string(),
        clientName: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    // 1. Get lead info
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("crm_leads")
      .select("*")
      .eq("id", data.leadId)
      .single();

    if (leadError || !lead) throw new Error("Lead não encontrada");

    // 2. Create Project
    const { data: project, error: projectError } = await supabaseAdmin
      .from("crm_projects")
      .insert([
        {
          name: data.projectName,
          lead_id: data.leadId,
          status: "planning",
          start_date: new Date().toISOString().split("T")[0],
        },
      ])
      .select()
      .single();

    if (projectError) throw projectError;

    await logActivity({
      action: "convert_lead",
      entityType: "project",
      entityId: project.id,
      details: { leadId: data.leadId },
    });

    // 2.1 Trigger Drive Folder Creation
    try {
      const { createProjectFolder } = await import("./google-drive.functions");
      await createProjectFolder({
        data: {
          projectId: project.id,
          clientName: data.clientName,
          projectName: data.projectName,
        },
      });
    } catch (e) {
      console.warn("Google Drive folder creation failed or not configured:", e);
    }

    // 3. Update Lead status
    await supabaseAdmin.from("crm_leads").update({ status: "closed_won" }).eq("id", data.leadId);

    return { success: true, project };
  });

export const getProjects = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("crm_projects")
      .select("*, crm_leads(name, company), crm_finances(amount, type)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map((p) => ({
      ...p,
      total_income: (p.crm_finances as any[])
        .filter((f) => f.type === "income")
        .reduce((acc, f) => acc + Number(f.amount), 0),
      total_expenses: (p.crm_finances as any[])
        .filter((f) => f.type === "expense")
        .reduce((acc, f) => acc + Number(f.amount), 0),
    }));
  });

export const updateProject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().optional(),
        status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
        google_drive_folder_id: z.string().nullable().optional(),
        start_date: z.string().nullable().optional(),
        end_date: z.string().nullable().optional(),
        budget: z.number().optional(),
        budget_alert_threshold: z.number().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { id, ...updateData } = data;
    const { error } = await supabaseAdmin.from("crm_projects").update(updateData).eq("id", id);

    if (error) throw error;

    await logActivity({
      action: "update_project",
      entityType: "project",
      entityId: id,
      details: updateData,
    });

    return { success: true };
  });

export const getTransactions = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("crm_finances")
      .select("*, crm_projects(name)")
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  });

export const createTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        description: z.string(),
        amount: z.number(),
        type: z.enum(["income", "expense"]),
        date: z.string(),
        due_date: z.string().nullable().optional(),
        project_id: z.string().uuid().nullable().optional(),
        category: z.string().nullable().optional(),
        status: z.string().optional().default("pending"),
        invoice_url: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("crm_finances").insert([data]);

    if (error) throw error;

    await logActivity({
      action: "create_transaction",
      entityType: "finance",
      details: data,
    });

    return { success: true };
  });

export const getActivityLogs = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        limit: z.number().optional().default(50),
        entityType: z.string().nullable().optional(),
        action: z.string().nullable().optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from("crm_activity_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.entityType) query = query.eq("entity_type", data.entityType);
    if (data.action) query = query.eq("action", data.action);
    if (data.startDate) query = query.gte("created_at", data.startDate);
    if (data.endDate) query = query.lte("created_at", data.endDate);

    const { data: logs, error } = await query.limit(data.limit || 50);

    if (error) throw error;
    return logs;
  });