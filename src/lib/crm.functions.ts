import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const getCRMStats = createServerFn({ method: "GET" })
  .handler(async ({ context }: { context: any }) => {
    if (!context?.userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const [leads, projects, finances] = await Promise.all([
      supabaseAdmin.from("crm_leads").select("*", { count: "exact" }),
      supabaseAdmin.from("crm_projects").select("*", { count: "exact" }),
      supabaseAdmin.from("crm_finances").select("*")
    ]);

    const totalLeads = leads.count || 0;
    const activeProjects = projects.count || 0;
    
    const revenue = (finances.data || [])
      .filter(f => f.type === 'income')
      .reduce((acc, f) => acc + Number(f.amount), 0);
      
    const expenses = (finances.data || [])
      .filter(f => f.type === 'expense')
      .reduce((acc, f) => acc + Number(f.amount), 0);

    return {
      totalLeads,
      activeProjects,
      revenue,
      profit: revenue - expenses
    };
  });

export const getLeads = createServerFn({ method: "GET" })
  .handler(async ({ context }: { context: any }) => {
    if (!context?.userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const { data, error } = await supabaseAdmin
      .from("crm_leads")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  });

export const createLead = createServerFn({ method: "POST" })
  .inputValidator((data: any) => z.object({
    name: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    estimated_value: z.number().nullable().optional(),
    notes: z.string().nullable().optional(),
    status: z.enum(['new', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional()
  }).parse(data))
  .handler(async ({ data, context }: { data: any, context: any }) => {
    if (!context?.userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const { error } = await supabaseAdmin
      .from("crm_leads")
      .insert([data]);
    
    if (error) throw error;
    return { success: true };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .inputValidator((data: any) => z.object({
    id: z.string().uuid(),
    status: z.enum(['new', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
    estimated_value: z.number().nullable().optional(),
  }).parse(data))
  .handler(async ({ data, context }: { data: any, context: any }) => {
    if (!context?.userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const { error } = await supabaseAdmin
      .from("crm_leads")
      .update({ 
        status: data.status,
        estimated_value: data.estimated_value
      })
      .eq("id", data.id);
    
    if (error) throw error;
    return { success: true };
  });

export const convertLeadToProject = createServerFn({ method: "POST" })
  .inputValidator((data: any) => z.object({
    leadId: z.string().uuid(),
    projectName: z.string(),
    clientName: z.string(),
  }).parse(data))
  .handler(async ({ data, context }: { data: any, context: any }) => {
    if (!context?.userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

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
      .insert([{
        name: data.projectName,
        lead_id: data.leadId,
        status: 'planning',
        start_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (projectError) throw projectError;

    // 2.1 Trigger Drive Folder Creation (async, don't wait if not configured)
    try {
      const { createProjectFolder } = await import('./google-drive.functions');
      await createProjectFolder({
        data: {
          projectId: project.id,
          clientName: data.clientName,
          projectName: data.projectName
        }
      });
    } catch (e) {
      console.warn("Google Drive folder creation failed or not configured:", e);
    }


    if (projectError) throw projectError;

    // 3. Update Lead status
    await supabaseAdmin
      .from("crm_leads")
      .update({ status: 'closed_won' })
      .eq("id", data.leadId);

    return { success: true, project };
  });


export const getProjects = createServerFn({ method: "GET" })
  .handler(async ({ context }: { context: any }) => {
    if (!context?.userId) throw new Response("Unauthorized", { status: 401 });
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    const { data, error } = await supabaseAdmin
      .from("crm_projects")
      .select("*, crm_leads(name, company)")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  });

