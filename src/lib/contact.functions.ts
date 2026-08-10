import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const contactSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de email inválido"),
  assunto: z.string().min(3, "O assunto deve ter pelo menos 3 caracteres"),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
});

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator((data) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Gravar a submissão principal
    const { data: submission, error: dbError } = await supabaseAdmin
      .from("contact_submissions")
      .insert([data])
      .select()
      .single();

    if (dbError) {
      console.error("Erro ao gravar contacto:", dbError);
      throw new Error("Erro ao processar o seu pedido.");
    }

    // 2. Simular/Preparar envio de email
    // Nota: O envio de email real requer um domínio configurado no Lovable Cloud.
    let emailStatus = "simulated";
    let errorMessage = null;

    try {
      console.log(`[Simulação Email] Enviando feedback para ${data.email}: "Olá ${data.nome}, recebemos a sua mensagem."`);
      // Aqui entraria a lógica de envio real quando o domínio estivesse pronto
    } catch (err: any) {
      emailStatus = "error";
      errorMessage = err.message || "Unknown email error";
    }

    // 3. Registar no audit log
    await supabaseAdmin
      .from("contact_audit_logs")
      .insert([{
        submission_id: submission.id,
        email_to: data.email,
        status: emailStatus,
        error_message: errorMessage
      }]);

    return { success: true };
  });
