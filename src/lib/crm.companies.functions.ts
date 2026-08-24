import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      limit: z.number().optional().default(20),
      search: z.string().optional(),
    }).parse(data || {})
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // @ts-ignore - Tables generated after SQL execution
    let query = supabase.from("crm_companies").select("*").order("name");
    if (data.search) query = query.ilike("name", `%${data.search}%`);
    const { data: companies, error } = await query.limit(data.limit);
    if (error) throw error;
    return companies;
  });

export const createCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      name: z.string(),
      nif: z.string().optional(),
      website: z.string().optional(),
      sector: z.string().optional(),
      size: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // @ts-ignore - Tables generated after SQL execution
    const { data: company, error } = await supabase.from("crm_companies").insert([{ ...data, owner_id: userId }]).select().single();
    if (error) throw error;
    return company;
  });

export const getContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      companyId: z.string().uuid().optional(),
    }).parse(data || {})
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // @ts-ignore - Tables generated after SQL execution
    let query = supabase.from("crm_contacts").select("*, crm_companies(name)");
    if (data.companyId) query = query.eq("company_id", data.companyId);
    const { data: contacts, error } = await query;
    if (error) throw error;
    return contacts;
  });
