import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { transitions, variants } from "@/lib/animations";
import { useReducedMotion } from "framer-motion";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const isReducedMotion = document.documentElement.classList.contains("force-reduced-motion");
    window.scrollTo({
      top: 0,
      behavior: isReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.2, ease: "linear" }
              : transitions.spring
          }
          whileHover={
            shouldReduceMotion
              ? {
                  backgroundColor: "oklch(0.65 0.2 260)",
                  color: "oklch(0.984 0.003 247.858)",
                }
              : {
                  scale: 1.1,
                  y: -4,
                  backgroundColor: "oklch(0.65 0.2 260)",
                  color: "oklch(0.984 0.003 247.858)",
                }
          }
          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:shadow-xl hover:shadow-primary/30"
          aria-label="Voltar ao topo"
        >
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, -2, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ArrowUp className="h-6 w-6" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
