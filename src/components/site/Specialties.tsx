import { Cloud, Database, KanbanSquare, PenTool, Code2, Lightbulb } from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";
import { ContentCard } from "./ContentCard";
import { trackEvent } from "@/lib/analytics";

const containerVariants = variants.staggerContainer;

const specialties = [
  {
    icon: Code2,
    title: "Desenvolvimento Web e Mobile",
    description:
      "Flutter, React + Tailwind, CSS, JavaScript. Aplicações responsivas e de alta performance.",
  },
  {
    icon: Database,
    title: "Bases de Dados e Backend",
    description: "SQL Server, Firebase, Azure, C#. Arquiteturas robustas e escaláveis.",
  },
  {
    icon: Cloud,
    title: "Cloud e Infraestrutura",
    description: "Azure, CloudFlare. Soluções cloud seguras e de elevada disponibilidade.",
  },
  {
    icon: PenTool,
    title: "Design e Arquitetura",
    description:
      "Web Design, Desenho de Mockups, Modelagem de Dados. Experiências visuais e funcionais.",
  },
  {
    icon: KanbanSquare,
    title: "Gestão de Projetos",
    description: "Metodologias ágeis com JIRA e Confluence. Transparência e entrega iterativa.",
  },
  {
    icon: Lightbulb,
    title: "Consultoria Tecnológica",
    description: "Análise estratégica, recomendações de tecnologia, otimização de processos.",
  },
];

export function Specialties() {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: variants.fadeIn.initial,
    visible: {
      ...variants.fadeIn.animate,
      transition: transitions.default,
    },
  };

  return (
    <section
      id="especialidades"
      className="relative overflow-hidden bg-background py-24 md:py-32"
      aria-labelledby="specialties-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-tech opacity-40 will-change-[opacity]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            <span className="text-xs font-bold tracking-[0.15em] text-foreground uppercase">
              O que Fazemos
            </span>
          </div>
          <h2
            id="specialties-heading"
            className="text-4xl leading-[1.1] font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Transformamos Ideias em Soluções Tecnológicas.
          </h2>
          <p className="mt-5 text-base leading-[1.6] text-muted-foreground md:text-lg">
            Oferecemos um leque abrangente de serviços para impulsionar a implementação de soluções
            tecnológicas, trabalhando com as mais recentes tendências e melhores práticas do setor.
          </p>
        </div>

        <motion.ul
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {specialties.map(({ icon: Icon, title, description }) => (
            <li key={title}>
              <ContentCard
                title={title}
                description={description}
                icon={Icon}
                className="h-full"
                showBottomHighlight={true}
                onClick={() => trackEvent("specialty_click", { title, type: "secondary_cta" })}
              />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
