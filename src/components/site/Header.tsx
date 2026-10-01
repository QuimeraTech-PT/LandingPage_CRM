import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/animations";
import { scrollToSection as performScroll } from "@/utils/scroll";

const links = [
  { href: "#sobre", label: "Sobre" },
  { href: "#especialidades", label: "Especialidades" },
  { href: "#metodologia", label: "Metodologia" },
  { href: "#valores", label: "Valores" },
  { href: "#contactos", label: "Contactos" },
];

export function Header() {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpen = useRef(false);
  const pendingSectionRef = useRef<string | null>(null);

  const closeMenu = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open: false } }));
  };

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }

    setOpen(true);
    window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open: true } }));
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");

    if (!isHome) {
      navigate({ to: "/", hash: targetId });
      if (open) closeMenu();
      return;
    }

    if (open) {
      pendingSectionRef.current = targetId;
      closeMenu();
      return;
    }

    performScroll(targetId);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;

    if (open) root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open || !pendingSectionRef.current) return;

    const targetId = pendingSectionRef.current;
    pendingSectionRef.current = null;
    performScroll(targetId);
  }, [open]);

  useEffect(() => {
    if (wasMenuOpen.current && !open) menuButtonRef.current?.focus();
    wasMenuOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
      }
    };

    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-border/50 dark:border-white/5 bg-background/80 backdrop-blur-xl py-0 shadow-lg"
            : "bg-transparent py-2"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo size="md" />

          <nav className="hidden items-center gap-10 lg:flex" aria-label="Navegação principal">
            {links.map((l) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={(e) => scrollToSection(e, l.href)}
                whileHover={shouldReduceMotion ? {} : { y: -2 }}
                transition={transitions.default}
                className="group relative py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {l.label}
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"
                  aria-hidden="true"
                />
              </motion.a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-border/50">
            <ThemeToggle />
            <AccessibilityMenu />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <AccessibilityMenu />
            <button
              ref={menuButtonRef}
              type="button"
              onClick={toggleMenu}
              className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navegação principal"
            className="fixed inset-0 z-10000 h-dvh w-screen overflow-y-auto bg-background lg:hidden"
          >
            <FocusTrap
              focusTrapOptions={{
                escapeDeactivates: false,
                initialFocus: "#mobile-menu-close",
              }}
            >
              <div className="min-h-dvh">
                <div className="flex h-20 items-center justify-between px-5">
                  <Logo size="md" />
                  <button
                    id="mobile-menu-close"
                    type="button"
                    onClick={closeMenu}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                    aria-label="Fechar menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2 px-5 py-8">
                  {links.map((l) => (
                    <Button
                      key={l.href}
                      variant="ghost"
                      asChild
                      className="justify-start text-lg font-semibold h-14"
                    >
                      <a href={l.href} onClick={(e) => scrollToSection(e, l.href)}>
                        {l.label}
                      </a>
                    </Button>
                  ))}
                </nav>
              </div>
            </FocusTrap>
          </div>,
          document.body,
        )}
    </>
  );
}
