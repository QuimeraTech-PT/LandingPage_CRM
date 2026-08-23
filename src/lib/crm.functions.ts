import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [leads, projects, finances] = await Promise.all([
      supabase.from("crm_leads").select("id", { count: "exact", head: true }),
      supabase.from("crm_projects").select("id", { count: "exact", head: true }),
      supabase.from("crm_finances").select("amount, type"),
    ]);

    const totalLeads = leads.count || 0;
    const activeProjects = projects.count || 0;

    const financesData = finances.data || [];
    let revenue = 0;
    let expenses = 0;

    for (const f of financesData) {
      if (f.type === "income") revenue += Number(f.amount);
      else expenses += Number(f.amount);
    }

    return {
      totalLeads,
      activeProjects,
      revenue,
      profit: revenue - expenses,
    };
  });

export const getLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        cursor: z.string().nullable().optional(),
        limit: z.number().optional().default(20),
        status: z.string().nullable().optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("crm_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.status) query = query.eq("status", data.status as any);
    if (data.cursor) query = query.lt("created_at", data.cursor);

    const { data: leads, error } = await query.limit(data.limit + 1);

    if (error) throw error;

    const hasNextPage = leads.length > data.limit;
    const items = hasNextPage ? leads.slice(0, -1) : leads;
    const nextCursor = hasNextPage ? items[items.length - 1].created_at : null;

    return { items, nextCursor };
  });

export const createLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("crm_leads").insert([data]);

    if (error) throw error;

    await logActivity({
      userId,
      action: "create",
      entityType: "lead",
      details: data,
    });

    return { success: true };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("crm_leads")
      .update({
        status: data.status,
        estimated_value: data.estimated_value,
      })
      .eq("id", data.id);

    if (error) throw error;

    await logActivity({
      userId,
      action: "update_status",
      entityType: "lead",
      entityId: data.id,
      details: { status: data.status },
    });

    return { success: true };
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...updateData } = data;
    const { error } = await supabase.from("crm_leads").update(updateData).eq("id", id);

    if (error) throw error;

    await logActivity({
      userId,
      action: "update",
      entityType: "lead",
      entityId: id,
      details: updateData,
    });

    return { success: true };
  });

export const convertLeadToProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        leadId: z.string().uuid(),
        projectName: z.string(),
        clientName: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // 1. Get lead info
    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("id", data.leadId)
      .single();

    if (leadError || !lead) throw new Error("Lead não encontrada");

    // 2. Create Project
    const { data: project, error: projectError } = await supabase
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
      userId,
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
    await supabase.from("crm_leads").update({ status: "closed_won" as any }).eq("id", data.leadId);

    return { success: true, project };
  });

export const getProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        cursor: z.string().nullable().optional(),
        limit: z.number().optional().default(20),
        status: z.string().nullable().optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("crm_projects")
      .select("*, crm_leads(name, company), crm_finances(amount, type)")
      .order("created_at", { ascending: false });

    if (data.status) query = query.eq("status", data.status as any);
    if (data.cursor) query = query.lt("created_at", data.cursor);

    const { data: projects, error } = await query.limit(data.limit + 1);

    if (error) throw error;

    const hasNextPage = projects.length > data.limit;
    const rawItems = hasNextPage ? projects.slice(0, -1) : projects;
    
    const items = rawItems.map((p) => ({
      ...p,
      total_income: (p.crm_finances as any[])
        .filter((f) => f.type === "income")
        .reduce((acc, f) => acc + Number(f.amount), 0),
      total_expenses: (p.crm_finances as any[])
        .filter((f) => f.type === "expense")
        .reduce((acc, f) => acc + Number(f.amount), 0),
    }));

    const nextCursor = hasNextPage ? items[items.length - 1].created_at : null;

    return { items, nextCursor };
  });

export const updateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...updateData } = data;
    const { error } = await supabase.from("crm_projects").update(updateData).eq("id", id);

    if (error) throw error;

    await logActivity({
      userId,
      action: "update_project",
      entityType: "project",
      entityId: id,
      details: updateData,
    });

    return { success: true };
  });

export const getTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        cursor: z.string().nullable().optional(),
        limit: z.number().optional().default(20),
        type: z.enum(["income", "expense"]).nullable().optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("crm_finances")
      .select("*, crm_projects(name)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (data.type) query = query.eq("type", data.type);
    if (data.cursor) query = query.lt("created_at", data.cursor);

    const { data: items, error } = await query.limit(data.limit + 1);

    if (error) throw error;

    const hasNextPage = items.length > data.limit;
    const finalItems = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? finalItems[finalItems.length - 1].created_at : null;

    return { items: finalItems, nextCursor };
  });

export const createTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("crm_finances").insert([data]);

    if (error) throw error;

    await logActivity({
      userId,
      action: "create_transaction",
      entityType: "finance",
      details: data,
    });

    return { success: true };
  });

export const getActivityLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
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
