import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitContactForm } from "@/lib/contact.functions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const contactSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de email inválido"),
  assunto: z.string().min(3, "O assunto deve ter pelo menos 3 caracteres"),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const submitContact = useServerFn(submitContactForm);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      await submitContact({ data });
      setSent(true);
      toast.success("Mensagem enviada com sucesso!");
      reset();
    } catch (error: any) {
      console.error("Erro ao enviar contacto:", error);
      toast.error(
        error.message || "Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contactos" className="bg-surface py-24 text-surface-foreground md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Contactos
            </p>
            <h2 className="text-3xl leading-[1.2] font-bold tracking-tight md:text-4xl">
              Vamos Construir o Futuro Juntos.
            </h2>
            <p className="mt-5 text-base leading-[1.6] text-surface-muted md:text-lg">
              Tem um projeto em mente ou gostaria de saber mais sobre como podemos ajudar a sua
              empresa? Entre em contacto connosco.
            </p>

            <div className="mt-10 space-y-4">
              <a
                href="mailto:hello@quimeratech.pt"
                className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-card p-5 transition-colors hover:border-primary"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-light tracking-wide text-surface-muted uppercase">
                    Email
                  </span>
                  <span className="text-base font-semibold">hello@quimeratech.pt</span>
                </span>
              </a>
              <a
                href="https://quimeratech.pt"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-card p-5 transition-colors hover:border-primary"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-light tracking-wide text-surface-muted uppercase">
                    Website
                  </span>
                  <span className="text-base font-semibold">quimeratech.pt</span>
                </span>
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-surface-border bg-surface-card p-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] md:p-9"
          >
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="nome" className="text-surface-foreground">
                  Nome
                </Label>
                <Input
                  id="nome"
                  {...register("nome")}
                  placeholder="O seu nome"
                  autoComplete="name"
                  className={errors.nome ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.nome && (
                  <p className="text-xs text-destructive">{errors.nome.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-surface-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="nome@empresa.pt"
                  autoComplete="email"
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assunto" className="text-surface-foreground">
                  Assunto
                </Label>
                <Input
                  id="assunto"
                  {...register("assunto")}
                  placeholder="Como podemos ajudar?"
                  className={errors.assunto ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.assunto && (
                  <p className="text-xs text-destructive">{errors.assunto.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mensagem" className="text-surface-foreground">
                  Mensagem
                </Label>
                <Textarea
                  id="mensagem"
                  {...register("mensagem")}
                  rows={5}
                  placeholder="Descreva brevemente o seu projeto..."
                  className={errors.mensagem ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.mensagem && (
                  <p className="text-xs text-destructive">{errors.mensagem.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="h-12 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    A enviar...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Enviar Mensagem
                    <Send className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>

              {sent && (
                <p role="status" className="text-sm font-medium text-primary">
                  Obrigado! A sua mensagem foi registada — entraremos em contacto brevemente.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
