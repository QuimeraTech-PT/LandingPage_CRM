import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logActivity } from "./crm.functions";

export const getTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => 
    z.object({
      companyId: z.string().uuid().optional(),
      projectId: z.string().uuid().optional(),
      status: z.string().optional(),
      limit: z.number().default(20),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase.from("crm_tickets").select("*, crm_companies(name), crm_projects(name)").order("created_at", { ascending: false });

    if (data.companyId) query = query.eq("company_id", data.companyId);
    if (data.projectId) query = query.eq("project_id", data.projectId);
    if (data.status) query = query.eq("status", data.status);
    
    const { data: tickets, error } = await query.limit(data.limit);
    if (error) throw error;
    return tickets;
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      company_id: z.string().uuid(),
      project_id: z.string().uuid().optional(),
      subject: z.string().min(3),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ticket, error } = await supabase.from("crm_tickets").insert([{
      ...data,
      status: "open",
    }]).select().single();

    if (error) throw error;

    await logActivity({
      userId,
      action: "create",
      entityType: "ticket",
      entityId: ticket.id,
      details: { subject: data.subject },
    });

    return ticket;
  });

export const updateTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["open", "in_progress", "waiting_client", "resolved", "closed"]),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    
    const { data: oldTicket } = await supabase
      .from("crm_tickets")
      .select("status")
      .eq("id", data.id)
      .single();

    const { error } = await supabase
      .from("crm_tickets")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) throw error;

    await logActivity({
      userId,
      action: "update_status",
      entityType: "ticket",
      entityId: data.id,
      oldValue: oldTicket,
      newValue: { status: data.status },
      details: `Ticket alterado para ${data.status}`
    });

    return { success: true };
  });
