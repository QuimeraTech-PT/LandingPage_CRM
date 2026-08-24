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
    // @ts-ignore - Tables generated after SQL execution
    let query = supabase.from("crm_tasks").select("*, crm_projects(name), crm_leads(name)");
    if (data.projectId) query = query.eq("project_id", data.projectId);
    if (data.leadId) query = query.eq("lead_id", data.leadId);
    if (data.status) query = query.eq("status", data.status);
    const { data: tasks, error } = await query.order("due_date", { ascending: true });
    if (error) throw error;
    return tasks;
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
    // @ts-ignore - Tables generated after SQL execution
    const { data: task, error } = await supabase.from("crm_tasks").insert([{ ...data, assigned_to: userId }]).select().single();
    if (error) throw error;
    return task;
  });
