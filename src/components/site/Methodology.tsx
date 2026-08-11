import { CheckCircle2 } from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";

const containerVariants = variants.staggerContainer;


const phases = [
  {
    step: "01",
    title: "Descoberta",
    description: "Entender profundamente o negócio, os objetivos e os requisitos do cliente.",
  },
  {
    step: "02",
    title: "Planeamento",
    description: "Definição da estratégia, arquitetura, recursos e cronograma detalhado.",
  },
  {
    step: "03",
    title: "Desenvolvimento",
    description: "Construção da solução com foco em qualidade e boas práticas.",
  },
  {
    step: "04",
    title: "Testes e Validação",
    description: "Garantia de que a solução funciona conforme o esperado e acordado.",
  },
  {
    step: "05",
    title: "Entrega e Suporte",
    description: "Implementação em produção e acompanhamento contínuo.",
  },
];

const principles = [
  "Transparência Total",
  "Qualidade Primeiro",
  "Entrega Iterativa",
  "Parceria Estratégica",
];

export function Methodology() {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: variants.fadeIn.initial,
    visible: {
      ...variants.fadeIn.animate,
      transition: transitions.default
    },
  };

  return (
    <section id="metodologia" className="bg-surface py-24 text-surface-foreground md:py-32" aria-labelledby="methodology-heading">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Como Trabalhamos
          </p>
          <h2 id="methodology-heading" className="text-3xl leading-[1.1] font-bold tracking-tight md:text-4xl lg:text-5xl">
            Abordagem Ágil e Colaborativa para o Sucesso.
          </h2>
          <p className="mt-5 text-base leading-[1.6] text-surface-muted md:text-lg">
            Acreditamos num processo transparente e iterativo, garantindo que o cliente esteja
            sempre envolvido e informado em cada etapa do projeto.
          </p>
        </div>

        <motion.ol 
          className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {phases.map((phase) => (
            <motion.li
              key={phase.step}
              variants={itemVariants}
              role="listitem"
              className="relative flex flex-col rounded-2xl border border-surface-border bg-surface-card p-6 transition-shadow duration-300 hover:shadow-[0_20px_45px_-28px_rgba(37,99,235,0.6)]"
            >
              <span className="text-sm font-bold tracking-widest text-primary">{phase.step}</span>
              <h3 className="mt-3 text-lg leading-[1.3] font-semibold">{phase.title}</h3>
              <p className="mt-3 text-sm leading-[1.6] text-surface-muted">{phase.description}</p>
              <span
                aria-hidden
                className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-primary to-accent"
              />
            </motion.li>
          ))}
        </motion.ol>

        <div className="mt-12 flex flex-wrap gap-3">
          {principles.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-card px-4 py-2 text-sm font-semibold text-surface-foreground"
            >
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
