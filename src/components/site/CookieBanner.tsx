import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, Settings } from "lucide-react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { updateAnalyticsConsent } from "@/lib/analytics";

export interface CookieBannerHandle {
  open: () => void;
}

export const CookieBanner = forwardRef<CookieBannerHandle>((_, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastActiveElement = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    // Auto-show logic
    const getConsent = () => {
      const local = localStorage.getItem('cookie-consent');
      if (local) return local;
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )cookie-consent=([^;]+)'));
        if (match) return match[2];
      }
      return null;
    };
    const consent = getConsent();
    
    // Sync state with analytics on load if consent already exists
    if (consent) {
      updateAnalyticsConsent(consent as "all" | "essential" | "none");
    }
    
    // Don't auto-show if on the policy page (it has its own controls)
    if (!consent && location.pathname !== "/politica-de-cookies") {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useImperativeHandle(ref, () => ({
    open: () => {
      lastActiveElement.current = document.activeElement as HTMLElement;
      setIsVisible(true);
    },
  }));

  const acceptAll = () => {
    updateAnalyticsConsent("all");
    setIsVisible(false);
    // Track consent acceptance
    import("@/lib/analytics").then(({ trackEvent }) => {
      trackEvent("cookie_consent_accepted", { type: "all" });
    });
  };

  const acceptEssential = () => {
    updateAnalyticsConsent("essential");
    setIsVisible(false);
    // Track consent acceptance
    import("@/lib/analytics").then(({ trackEvent }) => {
      trackEvent("cookie_consent_accepted", { type: "essential" });
    });
  };

  if (!mounted) return null;

  return (
    <div
      role="region"
      aria-label="Gestão de Cookies"
      className={cn(
        "fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-6xl md:bottom-8 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"
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
                to="/politica-de-cookies"
                className="text-primary font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Política de Cookies
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={acceptEssential}
              className="text-xs w-full sm:w-auto md:w-full lg:w-auto"
              aria-label="Aceitar apenas cookies essenciais"
            >
              Apenas Essenciais
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={acceptAll}
              className="text-xs w-full sm:w-auto md:w-full lg:w-auto"
              aria-label="Aceitar todos os cookies"
            >
              Aceitar Todos
            </Button>
          </div>
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            lastActiveElement.current?.focus();
          }}
          className="absolute top-4 right-4 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-sm p-1"
          aria-label="Fechar banner de cookies"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

CookieBanner.displayName = "CookieBanner";