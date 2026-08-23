import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Search,
  Layout,
  Cpu,
  ShieldCheck,
  Zap,
  IterationCcw,
  Shield,
  BadgeCheck,
  Handshake,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";

const phases = [
  {
    step: "01",
    title: "Descoberta",
    icon: Search,
    description:
      "Entender profundamente o negócio, os objetivos e os requisitos do cliente para definir uma base sólida para o projeto.",
    details: [
      "Análise do negócio e contexto",
      "Levantamento de requisitos",
      "Mapeamento de utilizadores e stakeholders",
      "Definição de objetivos e métricas",
    ],
    checklist: [
      "Requisitos funcionais documentados",
      "Objetivos e KPIs definidos",
      "Scope e prioridades alinhados",
      "Stakeholders e utilizadores identificados",
    ],
  },
  {
    step: "02",
    title: "Planeamento",
    icon: Layout,
    description:
      "Transformamos os objetivos definidos na descobertanum plano técnico e estratégico claro. \n Definimos como o produto será construído, quais astecnologias a utilizar e como será organizada a execução.",
    details: [
      "Arquitetura & Tecnologia",
      "UX & Design System",
      "Planeamento Técnico",
      "Gestão de Risco",
    ],
    checklist: [
      "Arquitetura definida",
      "Roadmap aprovado",
      "Stack tecnológica escolhida",
      "Plano de execução preparado",
    ],
  },
  {
    step: "03",
    title: "Desenvolvimento",
    icon: Cpu,
    description:
      "Construção da solução de forma iterativa, combinando qualidade técnica, boas práticas de engenharia e feedback contínuo.",
    details: [
      "Desenvolvimento iterativo por sprints",
      "Implementação de funcionalidades e integrações",
      "Code Reviews e controlo de qualidade",
      "CI/CD e entregas contínuas",
    ],
    checklist: [
      "Funcionalidades implementadas",
      "Integrações concluídas",
      "Código revisto e validado",
      "Documentação técnica atualizada",
    ],
  },
  {
    step: "04",
    title: "Testes e Validação",
    icon: ShieldCheck,
    description:
      "Validamos a solução de forma rigorosa para garantir qualidade, segurança, performance e conformidade com os objetivos definidos.",
    details: [
      "Testes funcionais e automatizados",
      "Validação de segurança e performance",
      "Testes de integração e compatibilidade",
      "Validação final com o cliente",
    ],
    checklist: [
      "Testes funcionais aprovados",
      "Segurança e performance validadas",
      "Critérios de aceitação cumpridos",
      "Release aprovado para produção",
    ],
  },
  {
    step: "05",
    title: "Entrega e Suporte",
    icon: Zap,
    description:
      "Deployment em produção e acompanhamos a sua evolução para garantir continuidade e estabilidade.",
    details: [
      "Preparação e deployment em produção",
      "Monitorização e acompanhamento",
      "Suporte e resolução de incidentes",
      "Evolução contínua da solução",
    ],
    checklist: [
      "Solução implantada em produção",
      "Monitorização e suporte ativos",
      "Documentação e handover concluídos",
      "Plano de evolução definido",
    ],
  },
];

const principles = [
  {
    Icon: Shield,
    title: "Transparência Total",
  },
  {
    Icon: BadgeCheck,
    title: "Qualidade em Primeiro",
  },
  {
    Icon: IterationCcw,
    title: "Entrega Iterativa",
  },
  {
    Icon: Handshake,
    title: "Parceria Estratégica",
  },
];

export function Methodology() {
  const [activeStep, setActiveStep] = useState<string | null>("01");
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const containerVariants = variants.staggerContainer;

  const itemVariants = {
    hidden: variants.fadeIn.initial,
    visible: {
      ...variants.fadeIn.animate,
      transition: transitions.default,
    },
  };

  const handleStepClick = (step: string, title: string) => {
    setActiveStep(activeStep === step ? null : step);
    import("@/lib/analytics").then(({ trackEvent }) =>
      trackEvent("methodology_step_click", {
        step,
        title,
        action: activeStep === step ? "collapse" : "expand",
      }),
    );
  };

  return (
    <section
      id="metodologia"
      className="relative bg-background py-24 text-foreground md:py-32"
      aria-labelledby="methodology-heading"
    >
      {/* Background aurora effect */}
      <div className="glow-aurora left-1/4 top-1/2 h-125 w-125 bg-primary/20" aria-hidden="true" />
      <div className="glow-aurora right-1/4 bottom-0 h-100 w-100 bg-accent/10" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Nossa Metodologia
          </p>
          <h2
            id="methodology-heading"
            className="text-3xl leading-[1.1] font-bold tracking-tight md:text-4xl lg:text-5xl"
          >
            Abordagem <span className="text-gradient-brand">Ágil e Estratégica</span> para o
            Sucesso.
          </h2>
          <p className="mt-5 text-base leading-[1.6] text-muted-foreground md:text-lg">
            Combinamos rigor técnico com agilidade para transformar ideias complexas em soluções
            digitais de alto impacto.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-12" ref={containerRef}>
          {/* Steps Navigation */}
          <motion.div
            className="lg:col-span-5 flex flex-col justify-between"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isActive = activeStep === phase.step;

              return (
                <motion.button
                  key={phase.step}
                  variants={itemVariants}
                  onClick={() => handleStepClick(phase.step, phase.title)}
                  className={`w-full group relative flex items-center gap-4 rounded-3xl border p-5 text-left transition-all duration-300 glass-card-hover ${
                    isActive
                      ? "border-accent/50 bg-accent/10 dark:bg-accent/10 shadow-lg shadow-accent/20 -translate-y-1"
                      : "border-border bg-card/40 dark:bg-white/5 hover:border-primary/30"
                  }`}
                  aria-expanded={isActive}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-primary/5 dark:bg-white/5 text-primary group-hover:text-accent"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest text-primary/60">
                        {phase.step}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isActive ? "rotate-90 text-accent" : ""}`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${isActive ? "text-accent" : "text-foreground group-hover:text-primary"}`}
                    >
                      {phase.title}
                    </h3>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Step Details Panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeStep ? (
                <motion.div
                  key={activeStep}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 20, filter: "blur(10px)" }
                  }
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: -20, filter: "blur(10px)" }
                  }
                  transition={transitions.default}
                  className="glass-card h-full min-h-100 p-8 md:p-12 flex flex-col rounded-[2.5rem] border-white/5 bg-[#0F172A]/80 backdrop-blur-xl relative overflow-hidden"
                >
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-5xl font-black text-accent/10 tabular-nums leading-none">
                        {activeStep}
                      </span>
                      <h4 className="text-3xl font-bold tracking-tight text-white">
                        {phases.find((p) => p.step === activeStep)?.title}
                      </h4>
                    </div>

                    <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-2xl">
                      {phases.find((p) => p.step === activeStep)?.description}
                    </p>

                    <div className="mb-10">
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent mb-6 block">
                        O que fazemos
                      </span>

                      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
                        {phases
                          .find((p) => p.step === activeStep)
                          ?.details?.map((detail, idx) => (
                            <motion.div
                              key={detail}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 + idx * 0.06 }}
                              className="flex gap-4 items-baseline"
                            >
                              <span className="text-sm font-bold text-accent tabular-nums shrink-0">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <h5 className="text-[15px] font-medium text-slate-300 leading-snug">
                                {detail}
                              </h5>
                            </motion.div>
                          ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {phases
                        .find((p) => p.step === activeStep)
                        ?.checklist.map((checkitem, idx) => (
                          <motion.div
                            key={checkitem}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                            className="flex items-center gap-4 p-5 rounded-[1.25rem] bg-white/5 border border-white/10 hover:border-accent/30 transition-colors group"
                          >
                            <div className="h-6 w-6 rounded-full border border-accent/30 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                              <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                            </div>
                            <span className="text-sm font-medium text-slate-200">
                              {checkitem}
                            </span>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border dark:border-white/10 rounded-3xl"
                >
                  <div className="h-16 w-16 rounded-full bg-card dark:bg-white/5 flex items-center justify-center mb-6 shadow-inner">
                    <ChevronRight className="h-8 w-8 text-primary/40" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Explore a nossa Metodologia</h4>
                  <p className="text-muted-foreground max-w-sm">
                    Selecione uma etapa para ver em detalhe como garantimos a excelência técnica em
                    cada projeto.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-4">
          {principles.map((p) => (
            <span
              key={p.title}
              className="inline-flex items-center gap-2 rounded-full border border-border dark:border-white/10 bg-card dark:bg-white/5 px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-card-hover dark:hover:bg-white/10 transition-colors shadow-sm"
            >
              <p.Icon className="h-4 w-4 text-accent" />
              {p.title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
