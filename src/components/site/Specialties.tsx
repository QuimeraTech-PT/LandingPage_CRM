import { Cloud, Database, KanbanSquare, PenTool, Smartphone } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const specialties = [
  {
    icon: Smartphone,
    title: "Desenvolvimento Web e Mobile",
    description: "Flutter, React + Tailwind, CSS, JavaScript.",
  },
  {
    icon: Database,
    title: "Bases de Dados e Backend",
    description: "SQL Server, Firebase, Azure, C#, Outsystems.",
  },
  {
    icon: Cloud,
    title: "Cloud e Infraestrutura",
    description: "Azure, CloudFlare.",
  },
  {
    icon: PenTool,
    title: "Design e Arquitetura",
    description: "Web Design, Desenho de Mockups, Modelagem de Dados.",
  },
  {
    icon: KanbanSquare,
    title: "Gestão de Projetos",
    description: "Metodologias ágeis com JIRA e Confluence.",
  },
];

export function Specialties() {
  return (
    <section id="especialidades" className="relative overflow-hidden bg-background py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-tech opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            O Que Fazemos
          </p>
          <h2 className="text-3xl leading-[1.2] font-bold tracking-tight text-foreground md:text-4xl">
            Transformamos Ideias em Realidade Digital.
          </h2>
          <p className="mt-5 text-base leading-[1.6] text-muted-foreground md:text-lg">
            Com uma equipa multidisciplinar e expertise em tecnologias de ponta, oferecemos um leque
            abrangente de serviços para impulsionar a sua transformação digital.
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
            <motion.li
              key={title}
              variants={itemVariants}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-accent transition-colors group-hover:bg-accent/20">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg leading-[1.3] font-semibold text-card-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">{description}</p>
              <span
                aria-hidden
                className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
