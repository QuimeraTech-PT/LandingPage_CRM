import { Cpu, Handshake, Lightbulb, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" } as any,
    },
  };
  return (
    <section id="valores" className="relative overflow-hidden bg-background py-24 md:py-32" aria-labelledby="pillars-heading">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/15 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Nossos Pilares
          </p>
          <h2 id="pillars-heading" className="text-3xl leading-[1.1] font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
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
            <motion.li
              key={title}
              role="listitem"
              variants={itemVariants}
              className="rounded-2xl border border-border bg-gradient-to-b from-card to-background p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg leading-[1.3] font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">{description}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
