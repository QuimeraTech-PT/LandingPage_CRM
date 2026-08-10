import { useEffect, useState, useRef } from "react";
import logoAsset from "@/assets/quimeratech-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { AccessibilityMenu } from "./AccessibilityMenu";

const links = [
  { href: "#sobre", label: "Sobre" },
  { href: "#especialidades", label: "Especialidades" },
  { href: "#metodologia", label: "Metodologia" },
  { href: "#valores", label: "Valores" },
  { href: "#contactos", label: "Contactos" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
        <a href="#top" className="flex items-center" aria-label="QuimeraTech — início">
          <img
            src={logoAsset.url}
            alt="Logótipo QuimeraTech"
            className="h-9 w-auto md:h-10"
            width={1774}
            height={887}
          />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <AccessibilityMenu />
          <Button asChild size="lg" className="font-semibold">
            <a href="#contactos">Fale Connosco</a>
          </Button>
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
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-semibold text-foreground/90 transition-colors hover:bg-secondary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary min-h-12 flex items-center"
                >
                  {l.label}
                </a>
              ))}
              <Button asChild size="lg" className="mt-2 font-semibold">
                <a href="#contactos" onClick={() => setOpen(false)}>
                  Fale Connosco
                </a>
              </Button>
            </nav>
          </div>
        </FocusTrap>
      )}
    </header>
  );
}
