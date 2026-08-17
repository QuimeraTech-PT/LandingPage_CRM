import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Accessibility, X, Type, Eye, Move, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import FocusTrap from "focus-trap-react";
import { motion, AnimatePresence } from "framer-motion";
import { transitions } from "@/lib/animations";
import { useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [interactions, setInteractions] = useState(true);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra">("normal");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useLayoutEffect(() => {
    // Load preferences
    const savedContrast = localStorage.getItem("a11y-high-contrast") === "true";
    const savedMotion = localStorage.getItem("a11y-reduced-motion") === "true";
    const savedInteractions = localStorage.getItem("a11y-interactions") !== "false";
    const savedFontSize = (localStorage.getItem("a11y-font-size") as any) || "normal";

    setHighContrast(savedContrast);
    setReducedMotion(savedMotion);
    setInteractions(savedInteractions);
    setFontSize(savedFontSize);
    
    applySettings({ contrast: savedContrast, motion: savedMotion, interactions: savedInteractions, size: savedFontSize });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const applySettings = ({ contrast, motion, interactions: interactionsVal, size }: { contrast: boolean, motion: boolean, interactions: boolean, size: string }) => {
    const root = document.documentElement;
    
    // Contrast
    if (contrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    // Motion
    if (motion) {
      root.classList.add("force-reduced-motion");
    } else {
      root.classList.remove("force-reduced-motion");
    }

    // Interactions
    if (!interactionsVal) {
      root.classList.add("disable-interactions");
    } else {
      root.classList.remove("disable-interactions");
    }
    
    // Font size
    root.classList.remove("text-large", "text-extra");
    if (size === "large") root.classList.add("text-large");
    if (size === "extra") root.classList.add("text-extra");
  };

  const toggleContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    localStorage.setItem("a11y-high-contrast", String(newVal));
    applySettings({ contrast: newVal, motion: reducedMotion, interactions, size: fontSize });
  };

  const toggleMotion = () => {
    const newVal = !reducedMotion;
    setReducedMotion(newVal);
    localStorage.setItem("a11y-reduced-motion", String(newVal));
    applySettings({ contrast: highContrast, motion: newVal, interactions, size: fontSize });
    
    // Invalidate router state if needed, though scroll behavior is mostly CSS/global
    router.invalidate();
  };

  const toggleInteractions = () => {
    const newVal = !interactions;
    setInteractions(newVal);
    localStorage.setItem("a11y-interactions", String(newVal));
    applySettings({ contrast: highContrast, motion: reducedMotion, interactions: newVal, size: fontSize });
  };

  const updateFontSize = (size: "normal" | "large" | "extra") => {
    setFontSize(size);
    localStorage.setItem("a11y-font-size", size);
    applySettings({ contrast: highContrast, motion: reducedMotion, interactions, size });
  };

  return (
    <div className="relative">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isOpen ? "Menu de acessibilidade aberto" : "Menu de acessibilidade fechado"}
      </div>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="text-muted-foreground hover:text-accent focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Menu de acessibilidade"
        aria-expanded={isOpen}
      >
        <Accessibility className="h-5 w-5" />
      </Button>

      <AnimatePresence>
      {isOpen && (
        <FocusTrap focusTrapOptions={{ allowOutsideClick: true, initialFocus: '#accessibility-menu-title' }}>
          <motion.div 
            ref={menuRef}
            className="fixed top-20 right-5 w-72 rounded-xl border border-border dark:border-white/10 bg-card p-6 shadow-2xl z-[9999] framer-motion-container"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={transitions.default}
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-menu-title"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="accessibility-menu-title" tabIndex={-1} className="text-sm font-bold uppercase tracking-wider text-foreground outline-hidden">Acessibilidade</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer flex items-center justify-center"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* High Contrast */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary" aria-hidden="true">
                      <Eye className="h-4 w-4" />
                    </div>
                    <span id="label-contrast" className="text-sm font-medium">Modo de Alto Contraste</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={highContrast}
                    aria-labelledby="label-contrast"
                    aria-describedby="desc-contrast"
                    onClick={toggleContrast}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border dark:border-white/10 p-0 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      highContrast ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-in-out",
                        highContrast ? "left-[calc(100%-1.25rem)]" : "left-1"
                      )}
                    />
                  </button>
                </div>
                <p id="desc-contrast" className="text-[10px] text-muted-foreground ml-11">Aumenta o contraste entre o texto e o fundo para melhor legibilidade.</p>
              </div>

              {/* Movimento Reduzido */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary" aria-hidden="true">
                      <Move className="h-4 w-4" />
                    </div>
                    <span id="label-motion" className="text-sm font-medium">Movimento Reduzido</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={reducedMotion}
                    aria-labelledby="label-motion"
                    aria-describedby="desc-motion"
                    onClick={toggleMotion}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border/60 p-0 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      reducedMotion ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-in-out",
                        reducedMotion ? "left-[calc(100%-1.25rem)]" : "left-1"
                      )}
                    />
                  </button>
                </div>
                <p id="desc-motion" className="text-[10px] text-muted-foreground ml-11">Desativa animações e transições para reduzir o cansaço visual ou enjoo.</p>
              </div>

              {/* Micro-interações */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary" aria-hidden="true">
                      <Zap className="h-4 w-4" />
                    </div>
                    <span id="label-interactions" className="text-sm font-medium">Micro-interações</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={interactions}
                    aria-labelledby="label-interactions"
                    aria-describedby="desc-interactions"
                    onClick={toggleInteractions}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border/60 p-0 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      interactions ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-in-out",
                        interactions ? "left-[calc(100%-1.25rem)]" : "left-1"
                      )}
                    />
                  </button>
                </div>
                <p id="desc-interactions" className="text-[10px] text-muted-foreground ml-11">Controla efeitos visuais como o seguidor do cursor e micro-animações técnicas.</p>
              </div>

              {/* Font Size */}
              <div className="space-y-3" role="group" aria-labelledby="label-font-size">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Type className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span id="label-font-size" className="text-sm font-medium">Tamanho da Fonte</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["normal", "large", "extra"] as const).map((size) => (
                    <Button
                      key={size}
                      variant={fontSize === size ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => updateFontSize(size)}
                      className="flex-col h-auto py-3 px-1 gap-1"
                      aria-pressed={fontSize === size}
                    >
                      <span className={`font-bold ${size === 'normal' ? 'text-xs' : size === 'large' ? 'text-sm' : 'text-base'}`}>A</span>
                      <span className="text-[10px] uppercase font-semibold">{size === 'normal' ? 'Padrão' : size === 'large' ? 'Grande' : 'Extra'}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </FocusTrap>
      )}
      </AnimatePresence>
    </div>
  );
};