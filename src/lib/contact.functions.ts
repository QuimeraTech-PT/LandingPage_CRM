import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const contactSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.email("Endereço de email inválido"),
  assunto: z.string().min(3, "O assunto deve ter pelo menos 3 caracteres"),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
  hp_field: z.string().optional(), // Honeypot field
});

// Common free email providers to filter out for B2B org naming
const freeEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "sapo.pt",
  "icloud.com",
];

export const submitContactForm = createServerFn({ method: "POST" })
  .validator((data) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    // 0. Spam Protection: Honeypot check
    if (data.hp_field && data.hp_field.length > 0) {
      console.warn("Spam detected via honeypot field");
      return { success: true, spam: true }; // Silent rejection
    }

    try {
      // 1. Determine Organization Name from Email Domain
      const domain = data.email.split("@")[1];
      const isCorporate = !freeEmailDomains.includes(domain.toLowerCase());
      const orgName = isCorporate
        ? domain.split(".")[0].toUpperCase()
        : `${data.nome} (Individual)`;

      // 2. Upsert Organization
      let { data: org } = await supabaseAdmin
        .from("organizations")
        .select("id")
        .eq("name", orgName)
        .maybeSingle();

      if (!org) {
        const { data: newOrg, error: insertOrgError } = await supabaseAdmin
          .from("organizations")
          .insert([{ name: orgName, industry: "Inbound Lead" }])
          .select("id")
          .single();

        if (insertOrgError) throw insertOrgError;
        org = newOrg;
      }

      // 3. Upsert Contact
      const { data: existingContact } = await supabaseAdmin
        .from("contacts")
        .select("id")
        .eq("email", data.email)
        .maybeSingle();

      if (!existingContact) {
        await supabaseAdmin.from("contacts").insert([
          {
            org_id: org.id,
            name: data.nome,
            email: data.email,
            role: "Inbound Prospect",
            is_primary: true,
          },
        ]);
      }

      // 4. Create the Deal in the CRM Pipeline
      const { data: deal, error: dealError } = await supabaseAdmin
        .from("deals")
        .insert([
          {
            org_id: org.id,
            title: data.assunto || `Inquiry from ${data.nome}`,
            stage: "Lead", // Drops exactly into your Kanban board
            priority: "Medium",
            expected_value: 0,
            service_type: "Inbound Request",
          },
        ])
        .select("id")
        .single();

      if (dealError) throw dealError;

      // 5. Log the raw message in the Client360 Activity Logger
      await supabaseAdmin.from("activity_logs").insert([
        {
          organization_id: org.id,
          type: "Email",
          summary: "Landing Page Form Submission",
          description: data.mensagem,
          created_by: "System Webhook",
        },
      ]);

      // 6. Fire Notification to the ERP TopHeader
      await supabaseAdmin.from("notifications").insert([
        {
          title: "New Inbound Lead!",
          message: `${data.nome} just submitted a request: "${data.assunto}"`,
          type: "success",
          target_view: "pipeline",
          target_id: deal.id,
          is_read: false,
        },
      ]);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Erro ao processar formulário de contacto:", errorMessage);
      throw new Error("Erro ao processar o seu pedido.");
    }
  });
