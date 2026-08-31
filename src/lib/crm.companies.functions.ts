import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

export const getCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        limit: z.number().optional().default(50),
        search: z.string().optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase.from("crm_companies").select("*").order("name");
    if (data.search) query = query.ilike("name", `%${data.search}%`);
    const { data: companies, error } = await query.limit(data.limit);
    if (error) throw error;
    return companies;
  });

export const getCompanyById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.string().uuid().parse(data))
  .handler(async ({ data: id, context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("crm_companies")
      .select("*, crm_contacts(*), crm_projects(*), crm_leads(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  });

export const createCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string(),
        nif: z.string().optional().nullable(),
        website: z.string().optional().nullable(),
        sector: z.string().optional().nullable(),
        size: z.string().optional().nullable(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: company, error } = await supabase
      .from("crm_companies")
      .insert([{ ...data, owner_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return company;
  });

export const updateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().optional(),
        nif: z.string().optional().nullable(),
        website: z.string().optional().nullable(),
        sector: z.string().optional().nullable(),
        size: z.string().optional().nullable(),
        status: z.enum(["active", "inactive", "prospective"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...updateData } = data;
    const { error } = await supabase.from("crm_companies").update(updateData).eq("id", id);
    if (error) throw error;
    return { success: true };
  });

export const getContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        companyId: z.string().uuid().optional(),
      })
      .parse(data || {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase.from("crm_contacts").select("*, crm_companies(name)");
    if (data.companyId) query = query.eq("company_id", data.companyId);
    const { data: contacts, error } = await query;
    if (error) throw error;
    return contacts;
  });

export const createContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        role: z.string().optional().nullable(),
        company_id: z.string().uuid(),
        is_primary: z.boolean().optional().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: contact, error } = await supabase
      .from("crm_contacts")
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return contact;
  });
