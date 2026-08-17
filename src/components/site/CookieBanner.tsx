import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, ShieldCheck, ChevronRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { updateAnalyticsConsent, getAnalyticsConsent } from "@/lib/analytics";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

export interface CookieBannerHandle {
  open: () => void;
}

export const CookieBanner = forwardRef<CookieBannerHandle>((_, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const lastActiveElement = useRef<HTMLElement | null>(null);
  const location = useLocation();

  // Granular settings
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    setMounted(true);
    const savedConsent = getAnalyticsConsent();
    
    if (savedConsent) {
      if (typeof savedConsent === "object") {
        setPreferences({ essential: true, analytics: savedConsent.analytics ?? false, marketing: savedConsent.marketing ?? false });
        updateAnalyticsConsent(savedConsent);
      } else {
        const isAll = savedConsent === "all";
        setPreferences({ essential: true, analytics: isAll, marketing: isAll });
        updateAnalyticsConsent(isAll ? "all" : "essential");
      }
    }
    
    if (!savedConsent && location.pathname !== "/politica-de-cookies") {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useImperativeHandle(ref, () => ({
    open: () => {
      lastActiveElement.current = document.activeElement as HTMLElement;
      setShowDetails(true);
      setIsVisible(true);
    },
  }));

  const savePreferences = () => {
    updateAnalyticsConsent(preferences);
    setIsVisible(false);
    import("@/lib/analytics").then(({ trackEvent }) => {
      trackEvent("cookie_consent_saved", { ...preferences });
    });
  };

  const acceptAll = () => {
    const all = { essential: true, analytics: true, marketing: true };
    setPreferences(all);
    updateAnalyticsConsent("all");
    setIsVisible(false);
    import("@/lib/analytics").then(({ trackEvent }) => {
      trackEvent("cookie_consent_accepted", { type: "all" });
    });
  };

  const acceptEssential = () => {
    const essential = { essential: true, analytics: false, marketing: false };
    setPreferences(essential);
    updateAnalyticsConsent("essential");
    setIsVisible(false);
    import("@/lib/analytics").then(({ trackEvent }) => {
      trackEvent("cookie_consent_accepted", { type: "essential" });
    });
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          role="region"
          aria-label="Gestão de Cookies"
          className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-4xl md:bottom-8"
        >
          <div className="relative overflow-hidden rounded-3xl border border-border dark:border-white/10 bg-card/90 dark:bg-card/90 p-6 shadow-2xl backdrop-blur-xl md:p-8 glass-card">
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary">
                  <Cookie className="h-6 w-6" />
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    A sua privacidade é a nossa prioridade
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Utilizamos cookies para otimizar o desempenho do site, analisar o tráfego e personalizar a sua experiência. 
                    Personalize as suas preferências abaixo ou aceite todas para a melhor experiência. Leia a nossa{" "}
                    <Link to="/politica-de-cookies" className="text-primary font-semibold hover:underline">
                      Política de Cookies
                    </Link>.
                  </p>
                </div>

                <button
                  onClick={() => setIsVisible(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Granular Settings Toggle */}
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-fit"
              >
                {showDetails ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {showDetails ? "Ocultar configurações detalhadas" : "Configurações detalhadas"}
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 border-t border-border dark:border-white/5 pt-4"
                  >
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          Essenciais
                          <ShieldCheck className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">Necessários para o site funcionar.</p>
                      </div>
                      <Switch checked={true} disabled aria-label="Cookies essenciais sempre ativos" />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold">Analíticos</div>
                        <p className="text-xs text-muted-foreground">Ajudam-nos a perceber como os utilizadores interagem com o site.</p>
                      </div>
                      <Switch 
                        checked={preferences.analytics} 
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
                        aria-label="Ativar cookies analíticos"
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold">Marketing</div>
                        <p className="text-xs text-muted-foreground">Utilizados para apresentar anúncios mais relevantes.</p>
                      </div>
                      <Switch 
                        checked={preferences.marketing} 
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked }))}
                        aria-label="Ativar cookies de marketing"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-border dark:border-white/5 pt-6">
                {showDetails ? (
                  <Button variant="secondary" size="sm" onClick={savePreferences}>
                    Guardar Preferências
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={acceptEssential}>
                    Apenas Essenciais
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={acceptAll}>
                  Aceitar Todos
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CookieBanner.displayName = "CookieBanner";
