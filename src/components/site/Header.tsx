import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { Logo } from "./Logo";



const links = [
  { href: "#sobre", label: "Sobre" },
  { href: "#especialidades", label: "Especialidades" },
  { href: "#metodologia", label: "Metodologia" },
  { href: "#valores", label: "Valores" },
  { href: "#contactos", label: "Contactos" },
];

import { transitions, variants } from "@/lib/animations";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";

export function Header() {
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log("Mobile menu state:", open);
  }, [open]);

  const toggleMenu = () => {
    console.log("Toggle menu clicked, current state:", open);
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo size="md" />

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Navegação principal">
          {links.map((l) => (
            <motion.a
              key={l.href}
              href={l.href}
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              transition={transitions.default}
              className="group relative py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" aria-hidden="true" />
            </motion.a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-border/50">
          <AccessibilityMenu />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <AccessibilityMenu />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <FocusTrap
          focusTrapOptions={{
            onDeactivate: () => {
              setOpen(false);
              // Ensure focus returns to the toggle button when closed
              menuButtonRef.current?.focus();
            },
            clickOutsideDeactivates: true,
            escapeDeactivates: true,
          }}
        >
          <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <Button
                  key={l.href}
                  variant="ghost"
                  asChild
                  className="justify-start text-base font-semibold text-foreground/90 w-full"
                  onClick={() => setOpen(false)}
                >
                  <a href={l.href}>
                    {l.label}
                  </a>
                </Button>
              ))}
            </nav>
          </div>
        </FocusTrap>
      )}
    </header>
  );
}
