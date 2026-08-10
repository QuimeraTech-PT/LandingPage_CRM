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
    // 1. Gravar na base de dados (usando admin para garantir sucesso independentemente de RLS se necessário, 
    // embora o cliente já o fizesse. Aqui centralizamos a lógica).
    const { error: dbError } = await supabaseAdmin
      .from("contact_submissions")
      .insert([data]);

    if (dbError) {
      console.error("Erro ao gravar contacto:", dbError);
      throw new Error("Erro ao processar o seu pedido.");
    }

    // Nota: O envio de email real requer um domínio configurado no Lovable Cloud.
    // Como ainda não está configurado, deixamos a lógica preparada ou simulada.
    // Se houvesse templates, usaríamos o helper de email.
    
    console.log(`[Simulação Email] Enviando feedback para ${data.email}: "Olá ${data.nome}, recebemos a sua mensagem sobre ${data.assunto}."`);

    return { success: true };
  });
