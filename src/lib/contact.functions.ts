import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const contactSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de email inválido"),
  assunto: z.string().min(3, "O assunto deve ter pelo menos 3 caracteres"),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
  hp_field: z.string().optional(), // Honeypot field
});

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator((data) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    // 0. Spam Protection: Honeypot check
    if (data.hp_field && data.hp_field.length > 0) {
      console.warn("Spam detected via honeypot field");
      return { success: true, spam: true }; // Silent rejection
    }

    // 1. Gravar a submissão principal no Supabase
    const { data: submission, error: dbError } = await supabaseAdmin
      .from("contact_submissions")
      .insert([
        {
          nome: data.nome,
          email: data.email,
          assunto: data.assunto,
          mensagem: data.mensagem,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Erro ao gravar contacto:", dbError);
      throw new Error("Erro ao processar o seu pedido.");
    }

    // 2. Criar Lead no CRM automaticamente
    const { error: crmError } = await supabaseAdmin.from("crm_leads").insert([
      {
        name: data.nome,
        email: data.email,
        notes: `Assunto: ${data.assunto}\n\nMensagem: ${data.mensagem}`,
        source: "website",
      },
    ]);

    if (crmError) {
      console.error("Erro ao criar lead no CRM:", crmError);
      // Não bloqueamos o formulário se o CRM falhar, apenas logamos
    }

    // 3. Local Audit Status
    const submissionStatus = "stored_locally_and_crm";
    const errorMessage = null;

    // 4. Registar no audit log
    await supabaseAdmin.from("contact_audit_logs").insert([
      {
        submission_id: submission.id,
        email_to: data.email,
        status: submissionStatus,
        error_message: errorMessage,
      },
    ]);

    return { success: true };
  });
