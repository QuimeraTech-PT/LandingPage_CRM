import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import { z } from "zod";

// Helper to log activities
export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  details = {},
  status = "success",
  oldValue,
  newValue,
}: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Json;
  status?: "success" | "failure" | "warning";
  oldValue?: Json;
  newValue?: Json;
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
        old_value: oldValue,
        new_value: newValue,
      },
    ]);
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}

export * from "./crm.companies.functions";
export * from "./crm.tasks.functions";

export const getCRMStats = createServerFn({ method: "GET" })

  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [leads, projects, finances] = await Promise.all([
      supabase.from("crm_leads").select("id, status, created_at"),
      supabase.from("crm_projects").select("id, status, budget, end_date"),
      supabase.from("crm_finances").select("amount, type, status"),
    ]);

    const leadsData = leads.data || [];
    const projectsData = projects.data || [];
    const financesData = finances.data || [];

    const totalLeads = leadsData.length;
    const activeProjects = projectsData.filter(p => p.status === 'active' || p.status === 'planning').length;
    
    const wonLeads = leadsData.filter(l => l.status === 'closed_won').length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    let revenue = 0;
    let expenses = 0;
    let pendingPayments = 0;

    for (const f of financesData) {
      const amount = Number(f.amount);
      if (f.type === "income") {
        if (f.status === 'paid') revenue += amount;
        else pendingPayments += amount;
      } else {
        expenses += amount;
      }
    }

    const avgBudget = projectsData.length > 0 
      ? projectsData.reduce((acc, p) => acc + Number(p.budget || 0), 0) / projectsData.length 
      : 0;

    const upcomingDeadlines = projectsData.filter(p => 
      p.end_date && 
      p.status !== 'completed' && 
      p.status !== 'cancelled' &&
      new Date(p.end_date) > new Date()
    ).length;

    return {
      totalLeads,
      activeProjects,
      revenue,
      profit: revenue - expenses,
      conversionRate,
      avgBudget,
      pendingPayments,
      upcomingDeadlines
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
        company_id: (data as any).company_id // Safely handle company_id if provided
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

    // 1. Get lead info with company reference if it exists
    const { data: lead, error: leadError } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("id", data.leadId)
      .single();

    if (leadError || !lead) throw new Error("Lead não encontrada");

    let companyId = lead.company_id;

    // 2. Resolve/Create Company
    if (!companyId) {
      // Try to find by name first
      if (lead.company) {
        const { data: existingCompany } = await supabase
          .from("crm_companies")
          .select("id")
          .ilike("name", lead.company)
          .maybeSingle();
        
        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          // Create new company
          const { data: newCompany, error: companyError } = await supabase
            .from("crm_companies")
            .insert([{
              name: lead.company,
              email: lead.email,
              phone: lead.phone,
              owner_id: userId,
              status: "active"
            }])
            .select("id")
            .single();
          
          if (!companyError) companyId = newCompany.id;
        }
      }
    }

    // 3. Create/Update Contact
    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .insert([{
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company_id: companyId,
        is_primary: true,
        notes: `Convertido da lead: ${lead.notes || ''}`
      }])
      .select()
      .single();

    // 4. Create Project linked to Company
    const { data: project, error: projectError } = await supabase
      .from("crm_projects")
      .insert([
        {
          name: data.projectName,
          lead_id: data.leadId,
          company_id: companyId,
          status: "planning",
          start_date: new Date().toISOString().split("T")[0],
          total_value: lead.estimated_value
        },
      ])
      .select()
      .single();

    if (projectError) throw projectError;

    // 5. Audit & Activity
    await logActivity({
      userId,
      action: "convert_lead",
      entityType: "project",
      entityId: project.id,
      details: { leadId: data.leadId, companyId, contactId: contact?.id },
    });

    // 6. Update Lead status
    await supabase.from("crm_leads").update({ 
      status: "closed_won" as any,
      company_id: companyId 
    }).eq("id", data.leadId);

    // 7. Drive Folder (Async)
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
      console.warn("Drive failed:", e);
    }

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
