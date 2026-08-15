import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

/**
 * Middleware para garantir que apenas administradores podem aceder a funções do CRM.
 */
export const requireAdmin = async (ctx: { supabase: any; userId?: string }) => {
  if (!ctx.userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await ctx.supabase
    .rpc("has_role", { _user_id: ctx.userId, _role: "admin" });

  if (error || !data) {
    throw new Response("Forbidden", { status: 403 });
  }

  return ctx;
};

export const getCRMStats = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    // A validação de admin será feita pelo middleware quando adicionado, 
    // mas por segurança extra usamos supabaseAdmin para queries privilegiadas 
    // ou validamos o contexto.
    
    // NOTA: Para este protótipo, vamos buscar dados reais do CRM
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
  .handler(async () => {
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
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("crm_leads")
      .insert([data]);
    
    if (error) throw error;
    return { success: true };
  });
