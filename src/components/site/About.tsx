import { motion, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";
import { Cpu, Rocket, Users } from "lucide-react";

export function About() {
  const shouldReduceMotion = useReducedMotion();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { ...variants.fadeIn.initial, y: 20 },
    visible: { 
      ...variants.fadeIn.animate,
      y: 0,
      transition: transitions.medium
    }
  };

  const stats = [
    { icon: Rocket, label: "Missão", value: "Impulsionar a transformação digital com propósito." },
    { icon: Cpu, label: "Visão", value: "Ser referência global em engenharia de software." },
    { icon: Users, label: "Valores", value: "Transparência, qualidade técnica e foco no cliente." }
  ];

  return (
    <section 
      id="sobre" 
      className="relative overflow-hidden bg-surface py-24 text-surface-foreground md:py-32"
      aria-labelledby="about-heading"
    >
      {/* Background Orbs para profundidade (Glassmorphism context) */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid gap-12 lg:grid-cols-12 lg:items-center"
        >
          {/* Conteúdo Principal */}
          <div className="lg:col-span-7">
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                <span className="text-xs font-bold tracking-[0.15em] text-primary uppercase">
                  Quem Somos
                </span>
              </div>

              <h2 id="about-heading" className="text-4xl leading-[1.1] font-bold tracking-tight md:text-5xl lg:text-6xl">
                QuimeraTech: <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                  Inovação em Software.
                </span>
              </h2>

              <p className="max-w-2xl text-lg leading-[1.8] text-surface-muted md:text-xl">
                A QuimeraTech é uma software house de excelência, dedicada ao desenvolvimento de
                soluções digitais personalizadas que impulsionam a eficiência, a inovação e o
                crescimento dos negócios dos nossos clientes.
              </p>

              <div className="grid grid-cols-1 gap-6 pt-8 sm:grid-cols-3">
                {stats.map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    variants={itemVariants}
                    className="group focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-surface focus-within:outline-hidden rounded-2xl border border-surface-border bg-surface-card/40 p-5 backdrop-blur-md transition-all hover:bg-surface-card/60"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <stat.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold text-surface-foreground">{stat.label}</h3>
                    <p className="text-sm leading-relaxed text-surface-muted">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Visual Tech-Forward */}
          <div className="lg:col-span-5">
            <motion.div 
              variants={itemVariants}
              className="relative aspect-square lg:aspect-auto lg:h-[600px]"
            >
              {/* Moldura Glassmorphism */}
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent shadow-2xl backdrop-blur-2xl" />
              
              <div className="absolute inset-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-surface-card to-secondary/20">
                <div className="flex h-full w-full items-center justify-center p-12">
                  <div className="relative h-full w-full opacity-40 mix-blend-overlay">
                    {/* Visual Abstrato 3D via CSS/SVG para evitar imagens "Off" */}
                    <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-20" />
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                      <path fill="var(--color-primary)" d="M44.7,-76.4C58.1,-69.2,69.2,-56.1,76.4,-41.4C83.6,-26.7,86.9,-10.4,85.1,5.2C83.3,20.8,76.5,35.7,66.8,48.6C57.1,61.5,44.6,72.4,30.3,77.5C16.1,82.6,0.1,81.9,-15.8,78C-31.7,74.1,-47.5,67,-59.8,55.5C-72.1,43.9,-81,27.8,-83.8,11.2C-86.6,-5.4,-83.4,-22.6,-74.6,-36.8C-65.8,-51.1,-51.5,-62.4,-36.8,-69C-22.1,-75.6,-7.1,-77.4,8.5,-88.9C24.1,-100.4,44.7,-76.4,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                  </div>
                  <motion.div 
                    animate={shouldReduceMotion ? {} : { 
                      rotate: [0, 5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 flex h-48 w-48 items-center justify-center rounded-[2rem] border border-white/20 bg-white/5 shadow-2xl backdrop-blur-3xl"
                  >
                    <Cpu className="h-24 w-24 text-primary opacity-80" strokeWidth={1} />
                  </motion.div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
              </div>

              {/* Elementos Flutuantes */}
              <motion.div 
                animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-1/4 max-w-[200px] rounded-2xl border border-white/10 bg-surface-card/90 p-4 shadow-2xl backdrop-blur-xl md:-right-8"
              >
                <p className="text-sm font-semibold italic leading-relaxed text-surface-foreground">
                  “Soluções inteligentes que transformam o amanhã.”
                </p>
              </motion.div>

              <motion.div 
                animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-4 bottom-1/4 rounded-2xl border border-primary/20 bg-primary/10 p-4 shadow-2xl backdrop-blur-xl md:-left-8"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Status</p>
                    <p className="text-sm font-semibold text-surface-foreground">Deploy Ativo</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}