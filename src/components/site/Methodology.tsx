import { useState, useRef, useEffect } from "react";
import { CheckCircle2, ChevronRight, Search, Layout, Cpu, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";

const phases = [
  {
    step: "01",
    title: "Descoberta",
    icon: Search,
    description: "Entender profundamente o negócio, os objetivos e os requisitos do cliente.",
    details: [
      "Auditoria de sistemas atuais",
      "Workshops de requisitos",
      "Definição de KPIs de sucesso",
      "Mapeamento de stakeholders"
    ]
  },
  {
    step: "02",
    title: "Planeamento",
    icon: Layout,
    description: "Definição da estratégia, arquitetura, recursos e cronograma detalhado.",
    details: [
      "Arquitetura Cloud & Microservices",
      "Design System & UI/UX",
      "Plano de contingência e riscos",
      "Seleção da Stack Tecnológica"
    ]
  },
  {
    step: "03",
    title: "Desenvolvimento",
    icon: Cpu,
    description: "Construção da solução com foco em qualidade e boas práticas.",
    details: [
      "Desenvolvimento ágil (Sprints)",
      "Code Reviews & CI/CD",
      "Documentação técnica viva",
      "Daily syncs e transparência"
    ]
  },
  {
    step: "04",
    title: "Testes e Validação",
    icon: ShieldCheck,
    description: "Garantia de que a solução funciona conforme o esperado e acordado.",
    details: [
      "Testes de QA automatizados",
      "Security Audit (Pen Tests)",
      "User Acceptance Testing (UAT)",
      "Otimização de Performance"
    ]
  },
  {
    step: "05",
    title: "Entrega e Suporte",
    icon: Zap,
    description: "Implementação em produção e acompanhamento contínuo.",
    details: [
      "Deployment Zero-Downtime",
      "Monitorização 24/7",
      "Manutenção Evolutiva",
      "Formação de equipas internas"
    ]
  },
];

const principles = [
  "Transparência Total",
  "Qualidade Primeiro",
  "Entrega Iterativa",
  "Parceria Estratégica",
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
      transition: transitions.default
    },
  };

  const handleStepClick = (step: string, title: string) => {
    setActiveStep(activeStep === step ? null : step);
    import("@/lib/analytics").then(({ trackEvent }) => 
      trackEvent("methodology_step_click", { 
        step, 
        title, 
        action: activeStep === step ? "collapse" : "expand" 
      })
    );
  };

  return (
    <section id="metodologia" className="relative bg-background py-24 text-foreground md:py-32" aria-labelledby="methodology-heading">
      {/* Background aurora effect */}
      <div className="glow-aurora left-1/4 top-1/2 h-[500px] w-[500px] bg-primary/20" aria-hidden="true" />
      <div className="glow-aurora right-1/4 bottom-0 h-[400px] w-[400px] bg-accent/10" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Nossa Metodologia
          </p>
          <h2 id="methodology-heading" className="text-3xl leading-[1.1] font-bold tracking-tight md:text-4xl lg:text-5xl">
            Abordagem <span className="text-gradient-brand">Ágil e Estratégica</span> para o Sucesso.
          </h2>
          <p className="mt-5 text-base leading-[1.6] text-muted-foreground md:text-lg">
            Combinamos rigor técnico com agilidade para transformar ideias complexas em soluções digitais de alto impacto.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-12" ref={containerRef}>
          {/* Steps Navigation */}
          <motion.div 
            className="lg:col-span-5 space-y-4"
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
                  className={`w-full group relative flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300 glass-card-hover ${
                    isActive 
                      ? "border-accent/50 bg-accent/10 shadow-lg shadow-accent/20 -translate-y-1" 
                      : "border-white/5 bg-white/5 hover:border-white/20"
                  }`}
                  aria-expanded={isActive}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                    isActive ? "bg-accent text-accent-foreground" : "bg-white/5 text-primary group-hover:text-accent"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest text-primary/60">{phase.step}</span>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isActive ? "rotate-90 text-accent" : ""}`} />
                    </div>
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${isActive ? "text-accent" : "text-foreground group-hover:text-primary"}`}>
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
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20, filter: "blur(10px)" }}
                  transition={transitions.default}
                  className="glass-card h-full min-h-[400px] p-8 md:p-10 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl font-black text-accent/20">{activeStep}</span>
                    <h4 className="text-2xl font-bold tracking-tight">{phases.find(p => p.step === activeStep)?.title}</h4>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {phases.find(p => p.step === activeStep)?.description}
                  </p>

                  <div className="mt-auto grid gap-4 sm:grid-cols-2">
                    {phases.find(p => p.step === activeStep)?.details.map((detail, idx) => (
                      <motion.div 
                        key={detail}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                        <span className="text-sm font-medium">{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-white/10 rounded-3xl"
                >
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <ChevronRight className="h-8 w-8 text-primary/40" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Explore a nossa Metodologia</h4>
                  <p className="text-muted-foreground max-w-sm">
                    Selecione uma etapa para ver em detalhe como garantimos a excelência técnica em cada projeto.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-4">
          {principles.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 text-accent" />
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}