import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";



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
import { scrollToSection as performScroll } from "@/utils/scroll";


export function Header() {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        setIsAdmin(!!data);
      }
    };
    checkAdmin();
  }, []);

  const toggleMenu = () => {
    const newState = !open;
    setOpen(newState);
    
    // Sync with FloatingActions via custom event
    window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open: newState } }));
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    
    if (!isHome) {
      navigate({ to: "/", hash: targetId });
      if (open) {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open: false } }));
      }
      return;
    }

    performScroll(targetId);
    
    if (open) {
      setOpen(false);
      window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open: false } }));
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-white/5 bg-background/80 backdrop-blur-xl py-0 shadow-lg" : "bg-transparent py-2"
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
              className="group relative py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" aria-hidden="true" />
            </motion.a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-border/50">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mr-4"
              title="Aceder ao CRM"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          )}
          <AccessibilityMenu />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
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

      <div
        className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-xl lg:hidden transition-all ${
          shouldReduceMotion ? "duration-0" : "duration-300"
        } ${
          open ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Logo size="md" />
          <button
            ref={(el) => {
              if (open && el) {
                // We'll let FocusTrap handle the initial focus, 
                // but we keep this ref logic simple
              }
            }}
            type="button"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open: false } }));
            }}
            className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <FocusTrap
          active={open}
          focusTrapOptions={{
            onDeactivate: () => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open: false } }));
              menuButtonRef.current?.focus();
            },
            clickOutsideDeactivates: true,
            escapeDeactivates: true,
            initialFocus: false, // Prevents jumping before transition
          }}
        >
          <nav className="flex flex-col gap-2 px-5 py-8">
            {links.map((l) => (
              <Button
                key={l.href}
                variant="ghost"
                asChild
                className="justify-start text-lg font-semibold h-14"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: { open: false } }));
                }}
              >
                <a href={l.href} onClick={(e) => scrollToSection(e, l.href)}>{l.label}</a>
              </Button>
            ))}
          </nav>
        </FocusTrap>
      </div>
    </header>
  );
}
