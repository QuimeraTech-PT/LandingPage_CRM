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

          {/* Visual Técnico - Código Animado */}
          <div className="lg:col-span-5">
            <motion.div 
              variants={itemVariants}
              className="relative mx-auto max-w-[450px] lg:max-w-none"
            >
              {/* Moldura Glassmorphism com efeito de código */}
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl backdrop-blur-sm transition-transform duration-500 hover:scale-[1.02] lg:aspect-square">
                {/* Header de janela de código */}
                <div className="flex items-center space-x-2 border-b border-white/5 bg-white/5 px-4 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-4 text-[10px] font-mono text-white/40">quimeratech.ts</span>
                </div>

                <div className="p-6 font-mono text-xs leading-relaxed md:text-sm">
                  <div className="flex space-x-4">
                    <div className="select-none text-white/20">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <div className="text-purple-400">class <span className="text-blue-400">SoftwareHouse</span> {"{"}</div>
                      <div className="pl-4 text-blue-400">private <span className="text-white">stack</span> = [<span className="text-green-400">"React"</span>, <span className="text-green-400">"Node"</span>];</div>
                      <div className="pl-4 text-blue-400">private <span className="text-white">mision</span> = <span className="text-green-400">"Innovation"</span>;</div>
                      <div className="h-4" />
                      <div className="pl-4 text-purple-400">async <span className="text-yellow-400">buildFuture</span>() {"{"}</div>
                      <div className="pl-8 text-purple-400">await <span className="text-white">this</span>.<span className="text-yellow-400">transform</span>({"{"}</div>
                      <div className="pl-12 text-white">quality: <span className="text-orange-400">true</span>,</div>
                      <div className="pl-12 text-white">speed: <span className="text-orange-400">Infinity</span></div>
                      <div className="pl-8 text-purple-400">{"})"};</div>
                      <div className="pl-4 text-purple-400">{"}"}</div>
                      <div className="text-purple-400">{"}"}</div>
                    </div>
                  </div>
                </div>

                {/* Efeito de brilho/scanner */}
                <motion.div 
                  animate={shouldReduceMotion ? {} : { top: ["-10%", "110%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-primary/10 to-transparent"
                />
              </div>

              {/* Badge de Tecnologia */}
              <div className="absolute -top-3 -right-3 flex items-center space-x-2 rounded-full border border-primary/20 bg-surface/90 px-3 py-1.5 shadow-xl backdrop-blur-md">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Clean Code</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}