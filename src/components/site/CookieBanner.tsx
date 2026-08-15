import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { updateAnalyticsConsent } from "@/lib/analytics";
import FocusTrap from "focus-trap-react";

export interface CookieBannerHandle {
  open: () => void;
}

export const CookieBanner = forwardRef<CookieBannerHandle>((_, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => {
      lastActiveElement.current = document.activeElement as HTMLElement;
      setIsVisible(true);
    },
  }));

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    updateAnalyticsConsent("all");
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    updateAnalyticsConsent("essential");
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  return (
    <FocusTrap
      active={isVisible}
      focusTrapOptions={{
        onDeactivate: () => {
          setIsVisible(false);
          lastActiveElement.current?.focus();
        },
        clickOutsideDeactivates: true,
        escapeDeactivates: true,
        fallbackFocus: "[role='region']",
      }}
    >
      <div
        role="region"
        aria-label="Gestão de Cookies"
        className={cn(
          "fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-6xl md:bottom-8 animate-in fade-in slide-in-from-bottom-5 duration-300",
        )}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
              <Cookie className="h-6 w-6" />
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-foreground" id="cookie-heading">
                Valorizamos a sua privacidade
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Utilizamos cookies para melhorar a sua experiência de navegação, servir anúncios ou conteúdos personalizados e analisar o nosso tráfego. Ao clicar em "Aceitar Todos", concorda com o nosso uso de cookies. Leia a nossa{" "}
                <Link
                  to="/politica-de-privacidade"
                  className="text-primary font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Política de Cookies
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              <Button
                variant="secondary"
                size="sm"
                onClick={acceptEssential}
                className="text-xs"
                aria-label="Aceitar apenas cookies essenciais"
              >
                Apenas Essenciais
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={acceptAll}
                className="text-xs"
                aria-label="Aceitar todos os cookies"
              >
                Aceitar Todos
              </Button>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-sm p-1"
            aria-label="Fechar banner de cookies"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </FocusTrap>
  );
});

CookieBanner.displayName = "CookieBanner";
