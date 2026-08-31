import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type CrmTaskWithRelations = {
  id: string;
  title: string;
  description?: string | null;
  status?: "todo" | "in_progress" | "blocked" | "review" | "done" | null;
  priority?: "low" | "medium" | "high" | null;
  project_id?: string | null;
  lead_id?: string | null;
  assigned_to?: string | null;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
  crm_projects?: { name: string } | null;
  crm_leads?: { name: string } | null;
};

export const getTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        projectId: z.string().uuid().optional(),
        leadId: z.string().uuid().optional(),
        status: z.enum(["todo", "in_progress", "blocked", "review", "done"]).optional(),
        search: z.string().optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase.from("crm_tasks").select("*, crm_projects(name), crm_leads(name)");
    if (data.projectId) query = query.eq("project_id", data.projectId);
    if (data.leadId) query = query.eq("lead_id", data.leadId);
    if (data.status) query = query.eq("status", data.status);
    if (data.search) query = query.ilike("title", `%${data.search}%`);
    const { data: tasks, error } = await query.order("due_date", { ascending: true });
    if (error) throw error;
    return (tasks ?? []) as CrmTaskWithRelations[];
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        title: z.string(),
        description: z.string().optional(),
        project_id: z.string().uuid().optional(),
        lead_id: z.string().uuid().optional(),
        due_date: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: task, error } = await supabase
      .from("crm_tasks")
      .insert([{ ...data, assigned_to: userId }])
      .select()
      .single();
    if (error) throw error;
    return task;
  });

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "blocked", "review", "done"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        due_date: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...updates } = data;
    const { data: task, error } = await supabase
      .from("crm_tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return task;
  });
