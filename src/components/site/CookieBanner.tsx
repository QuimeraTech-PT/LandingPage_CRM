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
      className={cn(
        "fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-500 md:bottom-8",
        !isVisible && "hidden"
      )}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cookie className="h-6 w-6" />
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Valorizamos a sua privacidade
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Utilizamos cookies para melhorar a sua experiência de navegação, servir anúncios ou conteúdos personalizados e analisar o nosso tráfego. Ao clicar em "Aceitar Todos", concorda com o nosso uso de cookies. Leia a nossa{" "}
              <Link
                to="/politica-de-privacidade"
                className="text-primary hover:underline"
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
              className="border-white/10 text-xs font-medium hover:bg-white/5"
            >
              Apenas Essenciais
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Aceitar Todos
            </Button>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
