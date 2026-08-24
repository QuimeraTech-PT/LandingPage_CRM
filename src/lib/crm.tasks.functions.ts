import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      projectId: z.string().uuid().optional(),
      leadId: z.string().uuid().optional(),
      status: z.string().optional(),
    }).parse(data || {})
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // @ts-ignore
    let query = supabase.from("crm_tasks").select("*, crm_projects(name), crm_leads(name)");
    // @ts-ignore
    if (data.projectId) query = query.eq("project_id", data.projectId);
    // @ts-ignore
    if (data.leadId) query = query.eq("lead_id", data.leadId);
    // @ts-ignore
    if (data.status) query = query.eq("status", data.status);
    const { data: tasks, error } = await query.order("due_date", { ascending: true });
    if (error) throw error;
    return tasks as any[];
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      project_id: z.string().uuid().optional(),
      lead_id: z.string().uuid().optional(),
      due_date: z.string().optional(),
      priority: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // @ts-ignore
    const { data: task, error } = await supabase.from("crm_tasks").insert([{ ...data, assigned_to: userId }]).select().single();
    if (error) throw error;
    return task;
  });

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      id: z.string().uuid(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      due_date: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...updates } = data;
    // @ts-ignore
    const { data: task, error } = await supabase.from("crm_tasks").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return task;
  });
