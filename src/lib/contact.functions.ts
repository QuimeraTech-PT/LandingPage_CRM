import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const contactSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  assunto: z.string().min(1),
  mensagem: z.string().min(1),
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
