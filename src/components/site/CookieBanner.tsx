import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { updateAnalyticsConsent } from "@/lib/analytics";

export interface CookieBannerHandle {
  open: () => void;
}

export const CookieBanner = forwardRef<CookieBannerHandle>((_, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsVisible(true),
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

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Consentimento de Cookies"
      className={cn(
        "fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-500 md:bottom-8",
        !isVisible && "hidden"
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
                className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Política de Cookies
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={acceptEssential}
              className="border-white/10 text-xs font-medium hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Aceitar apenas cookies essenciais"
            >
              Apenas Essenciais
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Aceitar todos os cookies"
            >
              Aceitar Todos
            </Button>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          aria-label="Fechar banner de cookies"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
