import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitContactForm } from "@/lib/contact.functions";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";
import { trackEvent, trackOutboundClick } from "@/lib/analytics";

type ContactFormValues = {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  hp_field?: string;
};

function validateContactForm(data: ContactFormValues) {
  const errors: Partial<Record<keyof ContactFormValues, string>> = {};
  if (data.nome.trim().length < 2) errors.nome = "O nome deve ter pelo menos 2 caracteres";
  if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Endereço de email inválido";
  if (data.assunto.trim().length < 3) errors.assunto = "O assunto deve ter pelo menos 3 caracteres";
  if (data.mensagem.trim().length < 10)
    errors.mensagem = "A mensagem deve ter pelo menos 10 caracteres";
  return errors;
}

export function Contact() {
  const shouldReduceMotion = useReducedMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const submitContact = useServerFn(submitContactForm);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>();

  const onSubmit = async (data: ContactFormValues) => {
    const validationErrors = validateContactForm(data);
    if (Object.entries(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field as keyof ContactFormValues, { type: "validate", message });
      });
      return;
    }

    setIsSubmitting(true);
    setSent(false);

    try {
      const result = await submitContact({ data });

      if (result.spam) {
        setSent(true);
        reset();
        return;
      }

      // Track conversion in analytics
      trackEvent("contact_form_submit", {
        assunto: data.assunto,
        method: "web_form",
      });

      setSent(true);
      toast.success("Mensagem enviada com sucesso!", {
        description: "Entraremos em contacto brevemente.",
      });
      reset();
    } catch (error: unknown) {
      console.error("Erro ao enviar contacto:", error);
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.";
      toast.error("Erro no envio", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contactos"
      className="bg-background py-24 text-foreground md:py-32"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 ">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={variants.fadeIn.initial}
            whileInView={variants.fadeIn.animate}
            viewport={{ once: true }}
            transition={transitions.default}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
              </span>
              <span className="text-xs font-bold tracking-[0.15em] text-foreground uppercase">
                Contactos
              </span>
            </div>
            <h2
              id="contact-heading"
              className="text-3xl leading-[1.2] font-bold tracking-tight md:text-4xl"
            >
              Vamos Construir o Futuro Juntos.
            </h2>
            <p className="mt-5 text-base leading-[1.6] text-surface-muted md:text-lg">
              Tem um projeto em mente ou gostaria de saber mais sobre como podemos ajudar a sua
              empresa? Entre em contacto connosco.
            </p>

            <div className="mt-10 space-y-4">
              <a
                href="mailto:general@quimeratech.com"
                onClick={() => trackOutboundClick("mailto:general@quimeratech.com")}
                className="flex items-center gap-4 rounded-3xl border border-border dark:border-white/10 bg-card/60 dark:bg-card/60 p-5 transition-all duration-500 hover:border-primary/50 shadow-premium hover:shadow-premium-hover hover:-translate-y-2 glass-card-hover backdrop-blur-xl"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-light tracking-wide text-surface-muted uppercase">
                    Email
                  </span>
                  <span className="text-base font-semibold">general@quimeratech.com</span>
                </span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={variants.fadeIn.initial}
            whileInView={variants.fadeIn.animate}
            viewport={{ once: true }}
            transition={transitions.default}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-3xl border border-border dark:border-white/10 bg-card/60 dark:bg-card/60 backdrop-blur-xl p-7 shadow-premium md:p-9"
            >
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="nome" className="text-surface-foreground font-semibold">
                    Nome próprio e apelido
                  </Label>
                  <Input
                    id="nome"
                    {...register("nome")}
                    placeholder="O seu nome"
                    autoComplete="name"
                    className={cn(
                      errors.nome ? "border-destructive focus-visible:ring-destructive" : "",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    )}
                    aria-invalid={!!errors.nome}
                    aria-describedby={errors.nome ? "nome-error" : "nome-description"}
                    required
                  />
                  <p id="nome-description" className="sr-only">
                    Introduza o seu nome completo.
                  </p>
                  {errors.nome && (
                    <p className="text-xs text-destructive" id="nome-error" role="alert">
                      {errors.nome.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-surface-foreground font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="nome@empresa.pt"
                    autoComplete="email"
                    className={cn(
                      errors.email ? "border-destructive focus-visible:ring-destructive" : "",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    )}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : "email-description"}
                    required
                  />
                  <p id="email-description" className="sr-only">
                    Introduza um endereço de email válido.
                  </p>
                  {errors.email && (
                    <p className="text-xs text-destructive" id="email-error" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assunto" className="text-surface-foreground font-semibold">
                    Assunto
                  </Label>
                  <Input
                    id="assunto"
                    {...register("assunto")}
                    placeholder="Como podemos ajudar?"
                    className={cn(
                      errors.assunto ? "border-destructive focus-visible:ring-destructive" : "",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    )}
                    aria-invalid={!!errors.assunto}
                    aria-describedby={errors.assunto ? "assunto-error" : "assunto-description"}
                    required
                  />
                  <p id="assunto-description" className="sr-only">
                    Indique o motivo do seu contacto.
                  </p>
                  {errors.assunto && (
                    <p className="text-xs text-destructive" id="assunto-error" role="alert">
                      {errors.assunto.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mensagem" className="text-surface-foreground font-semibold">
                    Mensagem
                  </Label>
                  <Textarea
                    id="mensagem"
                    {...register("mensagem")}
                    rows={5}
                    placeholder="Descreva brevemente o seu projeto..."
                    className={cn(
                      errors.mensagem ? "border-destructive focus-visible:ring-destructive" : "",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    )}
                    aria-invalid={!!errors.mensagem}
                    aria-describedby={errors.mensagem ? "mensagem-error" : "mensagem-description"}
                    required
                  />
                  <p id="mensagem-description" className="sr-only">
                    Descreva o seu projeto ou dúvida detalhadamente.
                  </p>
                  {errors.mensagem && (
                    <p className="text-xs text-destructive" id="mensagem-error" role="alert">
                      {errors.mensagem.message}
                    </p>
                  )}
                </div>

                {/* Honeypot field - hidden from users */}
                <div className="sr-only" aria-hidden="true">
                  <Input
                    tabIndex={-1}
                    autoComplete="off"
                    {...register("hp_field")}
                    placeholder="Leave this empty"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-premium hover:shadow-premium-hover transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  rightIcon={
                    isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )
                  }
                >
                  {isSubmitting ? "A enviar..." : "Enviar Mensagem"}
                </Button>

                <div aria-live="polite" className="mt-2 min-h-5">
                  {sent && (
                    <p role="status" className="text-sm font-semibold text-primary">
                      Obrigado! A sua mensagem foi registada — entraremos em contacto brevemente.
                    </p>
                  )}
                  {Object.keys(errors).length > 0 && (
                    <p role="alert" className="sr-only">
                      O formulário contém erros. Por favor, verifique os campos destacados.
                    </p>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
