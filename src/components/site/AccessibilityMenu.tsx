import { useState, useEffect, useRef } from "react";
import { Accessibility, X, Type, Eye, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import FocusTrap from "focus-trap-react";

export const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra">("normal");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Load preferences
    const savedContrast = localStorage.getItem("a11y-high-contrast") === "true";
    const savedMotion = localStorage.getItem("a11y-reduced-motion") === "true";
    const savedFontSize = (localStorage.getItem("a11y-font-size") as any) || "normal";

    setHighContrast(savedContrast);
    setReducedMotion(savedMotion);
    setFontSize(savedFontSize);
    
    applySettings({ contrast: savedContrast, motion: savedMotion, size: savedFontSize });

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

  const applySettings = ({ contrast, motion, size }: { contrast: boolean, motion: boolean, size: string }) => {
    const root = document.documentElement;
    
    // Contrast
    if (contrast) root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");
    
    // Motion
    if (motion) root.classList.add("force-reduced-motion");
    else root.classList.remove("force-reduced-motion");
    
    // Font size
    root.classList.remove("text-large", "text-extra");
    if (size === "large") root.classList.add("text-large");
    if (size === "extra") root.classList.add("text-extra");
  };

  const toggleContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    localStorage.setItem("a11y-high-contrast", String(newVal));
    applySettings({ contrast: newVal, motion: reducedMotion, size: fontSize });
  };

  const toggleMotion = () => {
    const newVal = !reducedMotion;
    setReducedMotion(newVal);
    localStorage.setItem("a11y-reduced-motion", String(newVal));
    applySettings({ contrast: highContrast, motion: newVal, size: fontSize });
  };

  const updateFontSize = (size: "normal" | "large" | "extra") => {
    setFontSize(size);
    localStorage.setItem("a11y-font-size", size);
    applySettings({ contrast: highContrast, motion: reducedMotion, size });
  };

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="h-10 w-10 text-muted-foreground hover:text-accent focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Menu de acessibilidade"
        aria-expanded={isOpen}
      >
        <Accessibility className="h-5 w-5" />
      </Button>

      {isOpen && (
        <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
          <div 
            ref={menuRef}
            className="fixed top-20 right-5 w-72 rounded-xl border border-border bg-card p-6 shadow-2xl z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-menu-title"
          aria-hidden={!isOpen}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 id="accessibility-menu-title" className="text-sm font-bold uppercase tracking-wider text-foreground">Acessibilidade</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                </div>
                <span id="label-contrast" className="text-sm font-medium">Alto Contraste</span>
              </div>
              <button
                role="switch"
                aria-checked={highContrast}
                aria-labelledby="label-contrast"
                onClick={toggleContrast}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer ${
                  highContrast ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highContrast ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Move className="h-4 w-4" aria-hidden="true" />
                </div>
                <span id="label-motion" className="text-sm font-medium">Reduzir Movimento</span>
              </div>
              <button
                role="switch"
                aria-checked={reducedMotion}
                aria-labelledby="label-motion"
                onClick={toggleMotion}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer ${
                  reducedMotion ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reducedMotion ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
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
                  <button
                    key={size}
                    onClick={() => updateFontSize(size)}
                    className={`flex flex-col items-center justify-center rounded-lg border-2 py-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      fontSize === size 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border hover:border-primary/40"
                    }`}
                    aria-pressed={fontSize === size}
                  >
                    <span className={`font-bold ${size === 'normal' ? 'text-xs' : size === 'large' ? 'text-sm' : 'text-base'}`}>A</span>
                    <span className="text-[10px] uppercase font-semibold mt-1">{size === 'normal' ? 'Padrão' : size === 'large' ? 'Grande' : 'Extra'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        </FocusTrap>
      )}
    </div>
  );
};