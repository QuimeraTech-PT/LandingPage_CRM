import { useEffect } from "react";
import logoAsset from "@/assets/quimeratech-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  
  // High priority for hero visuals
  useEffect(() => {
    const heroVisuals = document.querySelectorAll('#top img, #top svg');
    heroVisuals.forEach(el => {
      if (el instanceof HTMLImageElement) {
        el.loading = 'eager';
        el.fetchPriority = 'high';
      }
    });
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: variants.fadeIn.initial,
    visible: {
      ...variants.fadeIn.animate,
      transition: transitions.slow,
    },
  };
  return (
    <section id="top" className="relative overflow-hidden bg-background pt-32 pb-24 md:pt-44 md:pb-32" aria-labelledby="hero-heading">
      {/* Abstract geometric background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-tech opacity-40 dark:opacity-70 transition-opacity duration-700 will-change-[opacity] interaction-pulse" />
      
      {/* Enhanced aurora effects */}
      <div
        aria-hidden
        className="glow-aurora -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 bg-primary/30"
      />
      <div
        aria-hidden
        className="glow-aurora -bottom-40 right-0 h-[500px] w-[500px] bg-accent/25"
      />
      <div
        aria-hidden
        className="glow-aurora top-1/4 -left-20 h-[400px] w-[400px] bg-blue-500/15"
      />

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0%" y1="78%" x2="100%" y2="18%" stroke="url(#hero-line)" strokeWidth="1" />
        <line x1="0%" y1="96%" x2="100%" y2="40%" stroke="url(#hero-line)" strokeWidth="1" />
        <line x1="12%" y1="0%" x2="88%" y2="100%" stroke="url(#hero-line)" strokeWidth="1" />
      </svg>

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          [18, 28],
          [34, 68],
          [58, 22],
          [72, 58],
          [86, 36],
          [46, 84],
        ].map(([x, y]) => (
          <span
            key={`${x}-${y}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_25px_6px_rgba(6,182,212,0.6)] interaction-pulse"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 text-sm font-semibold tracking-wide text-primary/80 dark:text-primary/90 md:text-base lg:mb-8"
          >
            Excelência em Desenvolvimento de Software
          </motion.div>
          <motion.h1 
            id="hero-heading"
            variants={itemVariants}
            className="text-4xl leading-[1.1] font-bold tracking-tight text-foreground md:text-5xl lg:text-7xl lg:tracking-[-0.03em]"
          >
            Sua Visão, Nossa <span className="text-gradient-brand selection:bg-accent selection:text-accent-foreground">Engenharia de Elite.</span>
          </motion.h1>

          <motion.div 
            variants={itemVariants}
            className="mt-6 flex flex-wrap justify-center gap-2 text-[10px] font-bold tracking-widest text-primary/60 uppercase"
          >
            <span>• Alta Performance</span>
            <span>• Cloud Native</span>
            <span>• UX Premium</span>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-base leading-[1.6] font-medium text-muted-foreground md:text-lg"
          >
            Desenvolvemos ecossistemas digitais escaláveis e infraestruturas robustas. Do código à cloud, focamos em performance extrema e segurança intransigente.
            {"'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Adicionar no ecrã de login (/auth) a opção para entrar como developer apenas quando o ambiente estiver em Desenvolvimento."}
          </motion.p>
          

          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button 
              asChild 
              variant="primary" 
              size="lg" 
              className="w-full sm:w-auto" 
              rightIcon={<ArrowRight className="h-5 w-5" />}
              onClick={() => import("@/lib/analytics").then(({ trackEvent }) => trackEvent("hero_cta_click", { target: "especialidades", type: "primary" }))}
            >
              <a href="#especialidades">
                Descubra as Nossas Soluções
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => import("@/lib/analytics").then(({ trackEvent }) => trackEvent("hero_cta_click", { target: "contactos", type: "secondary" }))}
            >
              <a href="#contactos">Fale Connosco</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
