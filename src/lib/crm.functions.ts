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

export const createActivityLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        entityType: z.string().min(1),
        entityId: z.string().uuid(),
        details: z.string().min(1).max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await logActivity({
      userId: context.userId,
      action: "note",
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details,
    });
    return { success: true };
  });

type ProjectHealthProject = {
  id?: string;
  budget?: number | string;
  total_value?: number | string;
  end_date?: string | null;
  status?: string;
};

type ProjectHealthTask = {
  project_id?: string;
  status?: string;
};

type ProjectHealthTransaction = {
  project_id?: string;
  type?: string;
  amount?: number | string | null;
};

type ProjectHealthActivity = {
  entity_id?: string;
  created_at?: string | null;
};

export function calculateProjectHealth(
  project: ProjectHealthProject,
  tasks: ProjectHealthTask[] = [],
  transactions: ProjectHealthTransaction[] = [],
  activities: ProjectHealthActivity[] = [],
) {
  let score = 70; // Baseline
  const rationale: string[] = [];

  // Check budget
  if (project.budget && project.total_value) {
    const budget = Number(project.budget);
    const budgetUsed = transactions
      .filter((t) => t.project_id === project.id && t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    if (Number.isFinite(budget) && budget > 0) {
      if (budgetUsed > budget) {
        score -= 30;
        rationale.push("Orçamento excedido");
      } else if (budgetUsed > budget * 0.8) {
        score -= 10;
        rationale.push("Orçamento próximo do limite (80%+)");
      } else {
        score += 10;
      }
    }
  }

  // Check deadline
  if (project.end_date) {
    const deadline = new Date(project.end_date);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && project.status !== "completed") {
      score -= 25;
      rationale.push("Prazo ultrapassado");
    } else if (diffDays < 7 && project.status !== "completed") {
      score -= 10;
      rationale.push("Deadline próximo (menos de 7 dias)");
    }
  }

  // Check tasks
  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  if (projectTasks.length > 0) {
    const completedTasks = projectTasks.filter((t) => t.status === "done").length;
    const completionRate = completedTasks / projectTasks.length;

    if (completionRate === 1) {
      score += 15;
      rationale.push("Todas as tarefas concluídas");
    } else if (completionRate < 0.2 && projectTasks.length > 5) {
      score -= 10;
      rationale.push("Baixa taxa de conclusão de tarefas");
    }
  }

  // Check activity
  const recentActivity = activities.filter((a) => {
    if (a.entity_id !== project.id || !a.created_at) return false;

    const createdAt = new Date(a.created_at);
    return (
      Number.isFinite(createdAt.getTime()) &&
      createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
  });
  if (recentActivity.length > 0) {
    score += 10;
  } else if (project.status === "in_progress") {
    score -= 15;
    rationale.push("Sem atividade recente (7 dias)");
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let status: "Healthy" | "At Risk" | "Critical" = "Healthy";
  if (score < 40) status = "Critical";
  else if (score < 70) status = "At Risk";

  return { score, status, rationale };
}

export * from "./crm.companies.functions";
export * from "./crm.tasks.functions";
export * from "./crm.support.functions";

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
    const activeProjects = projectsData.filter(
      (p) => p.status === "active" || p.status === "planning",
    ).length;

    const wonLeads = leadsData.filter((l) => l.status === "closed_won").length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    let revenue = 0;
    let expenses = 0;
    let pendingPayments = 0;

    for (const f of financesData) {
      const amount = Number(f.amount);
      if (f.type === "income") {
        if (f.status === "paid") revenue += amount;
        else pendingPayments += amount;
      } else {
        expenses += amount;
      }
    }

    const avgBudget =
      projectsData.length > 0
        ? projectsData.reduce((acc, p) => acc + Number(p.budget || 0), 0) / projectsData.length
        : 0;

    const upcomingDeadlines = projectsData.filter(
      (p) =>
        p.end_date &&
        p.status !== "completed" &&
        p.status !== "cancelled" &&
        new Date(p.end_date) > new Date(),
    ).length;

    return {
      totalLeads,
      activeProjects,
      revenue,
      profit: revenue - expenses,
      conversionRate,
      avgBudget,
      pendingPayments,
      upcomingDeadlines,
    };
  });

export const getLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        cursor: z.string().nullable().optional(),
        limit: z.number().optional().default(20),
        status: z
          .enum(["new", "contacted", "proposal", "negotiation", "closed_won", "closed_lost"])
          .nullable()
          .optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase.from("crm_leads").select("*").order("created_at", { ascending: false });

    if (data.status) query = query.eq("status", data.status);
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

    // Fetch old value for audit
    const { data: oldLead } = await supabase
      .from("crm_leads")
      .select("status, estimated_value")
      .eq("id", data.id)
      .single();

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
      oldValue: oldLead,
      newValue: { status: data.status, estimated_value: data.estimated_value },
      details: `Estado alterado para ${data.status}`,
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

    // Fetch old value for audit
    const { data: oldLead } = await supabase.from("crm_leads").select("*").eq("id", id).single();

    const { error } = await supabase.from("crm_leads").update(updateData).eq("id", id);
    if (error) throw error;

    await logActivity({
      userId,
      action: "update",
      entityType: "lead",
      entityId: id,
      oldValue: oldLead,
      newValue: updateData,
      details: "Lead atualizada manualmente",
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
            .insert([
              {
                name: lead.company,
                email: lead.email,
                phone: lead.phone,
                owner_id: userId,
                status: "active",
              },
            ])
            .select("id")
            .single();

          if (!companyError) companyId = newCompany.id;
        }
      }
    }

    // 3. Create/Update Contact
    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .insert([
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company_id: companyId,
          is_primary: true,
          notes: `Convertido da lead: ${lead.notes || ""}`,
        },
      ])
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
          total_value: lead.estimated_value,
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
    await supabase
      .from("crm_leads")
      .update({
        status: "closed_won",
        company_id: companyId,
      })
      .eq("id", data.leadId);

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
        status: z
          .enum(["planning", "active", "on_hold", "completed", "cancelled"])
          .nullable()
          .optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("crm_projects")
      .select("*, crm_leads(name, company), crm_finances(amount, type)")
      .order("created_at", { ascending: false });

    if (data.status) query = query.eq("status", data.status);
    if (data.cursor) query = query.lt("created_at", data.cursor);

    const { data: projects, error } = await query.limit(data.limit + 1);

    if (error) throw error;

    const hasNextPage = projects.length > data.limit;
    const rawItems = hasNextPage ? projects.slice(0, -1) : projects;

    const items = rawItems.map((p) => {
      const finances =
        (p.crm_finances as Array<{ type: string | null; amount: number | string | null }> | null) ??
        [];

      return {
        ...p,
        total_income: finances
          .filter((f) => f.type === "income")
          .reduce((acc, f) => acc + Number(f.amount ?? 0), 0),
        total_expenses: finances
          .filter((f) => f.type === "expense")
          .reduce((acc, f) => acc + Number(f.amount ?? 0), 0),
      };
    });

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
    // Fetch old value for audit
    const { data: oldProject } = await supabase
      .from("crm_projects")
      .select("*")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("crm_projects").update(updateData).eq("id", id);
    if (error) throw error;

    await logActivity({
      userId,
      action: "update_project",
      entityType: "project",
      entityId: id,
      oldValue: oldProject,
      newValue: updateData,
      details: "Projeto atualizado manualmente",
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
      .order("created_at", { ascending: false });

    if (data.type) query = query.eq("type", data.type);
    if (data.cursor) query = query.lt("created_at", data.cursor);

    const { data: transactions, error } = await query.limit(data.limit + 1);

    if (error) throw error;

    const hasNextPage = transactions.length > data.limit;
    const items = hasNextPage ? transactions.slice(0, -1) : transactions;
    const nextCursor = hasNextPage ? items[items.length - 1].created_at : null;

    return { items, nextCursor };
  });

export const getNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("crm_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  });

export const markNotificationAsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("crm_notifications")
      .update({ read: true })
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
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

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lead, error: readError } = await supabase
      .from("crm_leads")
      .select("name")
      .eq("id", data.id)
      .single();
    if (readError) throw readError;
    const { error } = await supabase.from("crm_leads").delete().eq("id", data.id);
    if (error) throw error;
    await logActivity({
      userId,
      action: "delete",
      entityType: "lead",
      entityId: data.id,
      details: { name: lead.name },
    });
    return { success: true };
  });
