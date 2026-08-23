import { Cpu, Handshake, Lightbulb, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";
import { ContentCard } from "./ContentCard";

const containerVariants = variants.staggerContainer;

const pillars = [
  {
    icon: Lightbulb,
    title: "Inovação",
    description: "Promovemos novas abordagens e tecnologias de ponta.",
  },
  {
    icon: Cpu,
    title: "Tecnologia",
    description: "Soluções aplicadas com mestria e precisão.",
  },
  {
    icon: Handshake,
    title: "Confiança",
    description: "Compromisso e transparência em todas as relações.",
  },
  {
    icon: TrendingUp,
    title: "Resultados",
    description: "Foco em valor e impacto mensurável.",
  },
];

export function Pillars() {
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
      id="valores"
      className="relative overflow-hidden bg-background py-24 md:py-32"
      aria-labelledby="pillars-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/10 dark:bg-accent/15 blur-[100px] dark:blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-primary/5 dark:bg-primary/10 blur-[100px] dark:blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Nossos Pilares
          </p>
          <h2
            id="pillars-heading"
            className="text-3xl leading-[1.1] font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
          >
            Os Valores que Nos Distinguem.
          </h2>
          <p className="mt-5 text-base leading-[1.6] text-muted-foreground md:text-lg">
            Os nossos pilares fundamentam cada projeto e cada interação, garantindo a excelência e o
            compromisso com o seu sucesso.
          </p>
        </div>

        <motion.ul
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {pillars.map(({ icon: Icon, title, description }) => (
            <ContentCard
              key={title}
              title={title}
              description={description}
              icon={Icon}
              variant="accent"
              className="p-8"
            />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
