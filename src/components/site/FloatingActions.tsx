import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUp, MessageCircle, ChevronUp } from "lucide-react";
import { transitions } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // WhatsApp Configuration
  const phoneNumber = "351912345678"; 
  const message = encodeURIComponent("Olá QuimeraTech, gostaria de saber mais sobre as vossas soluções.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false);
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
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 lg:bottom-8 lg:right-8 print:hidden">
      <AnimatePresence>
        {!isVisible && (
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={shouldReduceMotion ? {} : { scale: 1.1, y: -4 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[#25D366]/50 transition-shadow active:brightness-90 sm:h-12 sm:w-12 md:h-14 md:w-14"
            aria-label="Contactar via WhatsApp (Abre em nova janela)"
          >
            <MessageCircle className="h-7 w-7 fill-current sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="flex flex-col items-end gap-4 mb-2 sm:gap-3"
                  role="menu"
                  aria-label="Opções de contacto e navegação"
                >
                  <motion.a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05, x: -4 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    className="flex min-h-[48px] items-center gap-3 rounded-full bg-[#25D366] px-5 py-2.5 text-white shadow-lg transition-all hover:bg-[#20ba5a] hover:shadow-xl focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 active:brightness-90 sm:px-4 sm:py-2"
                  >
                    <span className="text-sm font-semibold tracking-wide">WhatsApp</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                      <MessageCircle className="h-5 w-5 fill-current sm:h-4 sm:w-4" />
                    </div>
                  </motion.a>

                  <motion.button
                    onClick={scrollToTop}
                    role="menuitem"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05, x: -4 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    className="flex min-h-[48px] items-center gap-3 rounded-full bg-primary px-5 py-2.5 text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:brightness-95 sm:px-4 sm:py-2"
                  >
                    <span className="text-sm font-semibold tracking-wide">Voltar ao topo</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white sm:h-8 sm:w-8">
                      <ArrowUp className="h-5 w-5 sm:h-4 sm:w-4" />
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-primary/50 active:scale-95 sm:h-12 sm:w-12 md:h-14 md:w-14",
                isOpen && "bg-white text-black border border-border ring-1 ring-border shadow-md"
              )}
              aria-label={isOpen ? "Fechar menu de ações" : "Abrir menu de ações rápidas"}
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              <div className="relative h-6 w-6 flex items-center justify-center">
                 <motion.div
                  animate={{ 
                    opacity: isOpen ? 0 : 1,
                    scale: isOpen ? 0.5 : 1,
                    rotate: isOpen ? 90 : 0
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ChevronUp className="h-6 w-6 sm:h-5 sm:w-5" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: isOpen ? 1 : 0,
                    scale: isOpen ? 1 : 0.5,
                    rotate: isOpen ? 0 : -90
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="h-0.5 w-5 bg-current rotate-45 absolute rounded-full" />
                  <div className="h-0.5 w-5 bg-current -rotate-45 absolute rounded-full" />
                </motion.div>
              </div>
              
              {!isOpen && (
                <span className="absolute inset-0 rounded-full bg-primary/30 animate-[ping_3s_infinite] group-hover:hidden pointer-events-none" />
              )}
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}