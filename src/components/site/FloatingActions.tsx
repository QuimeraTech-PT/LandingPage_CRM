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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 lg:bottom-8 lg:right-8">
      <AnimatePresence>
        {!isVisible && (
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={shouldReduceMotion ? {} : { scale: 1.1, y: -4 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[#25D366]/50"
            aria-label="Contactar via WhatsApp"
          >
            <MessageCircle className="h-7 w-7 fill-current" />
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
                  className="flex flex-col items-end gap-3 mb-2"
                >
                  <motion.a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05, x: -4 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    className="flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-2 text-white shadow-lg transition-colors hover:bg-[#20ba5a] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                  >
                    <span className="text-sm font-medium">WhatsApp</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <MessageCircle className="h-5 w-5 fill-current" />
                    </div>
                  </motion.a>

                  <motion.button
                    onClick={scrollToTop}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05, x: -4 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    className="flex items-center gap-3 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span className="text-sm font-medium">Voltar ao topo</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                      <ArrowUp className="h-5 w-5" />
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-primary/50",
                isOpen && "bg-white text-black border border-border"
              )}
              aria-label={isOpen ? "Fechar menu de ações" : "Abrir menu de ações"}
              aria-expanded={isOpen}
            >
              <div className="relative h-6 w-6">
                 <motion.div
                  animate={{ 
                    opacity: isOpen ? 0 : 1,
                    scale: isOpen ? 0.5 : 1
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ChevronUp className="h-6 w-6" />
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
                  <div className="h-0.5 w-5 bg-current rotate-45 absolute" />
                  <div className="h-0.5 w-5 bg-current -rotate-45 absolute" />
                </motion.div>
              </div>
              
              {/* Pulse effect when closed */}
              {!isOpen && (
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping group-hover:hidden" />
              )}
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}