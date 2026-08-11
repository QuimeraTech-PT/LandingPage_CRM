import logoAsset from "@/assets/quimeratech-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

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
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-tech opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[130px]"
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.7" />
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
            className="absolute h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_18px_4px_rgba(6,182,212,0.55)]"
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
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 text-sm font-semibold tracking-wide text-primary/90 md:text-base lg:mb-8"
          >
            Excelência em Desenvolvimento de Software
          </motion.div>
          <motion.h1 
            id="hero-heading"
            variants={itemVariants}
            className="text-4xl leading-[1.1] font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Soluções Inteligentes.{" "}
            <span className="text-gradient-brand">Impacto Real.</span>
          </motion.h1>

          <motion.h2 
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-base leading-[1.6] font-medium text-muted-foreground md:text-lg"
          >
            A sua parceira estratégica em desenvolvimento de software e consultoria tecnológica.
          </motion.h2>

          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <a href="#especialidades">
                Descubra as Nossas Soluções
                <ArrowRight className="ml-2.5 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 force-reduced-motion:group-hover:translate-x-0" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <a href="#contactos">Fale Connosco</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
