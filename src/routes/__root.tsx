import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";

import appCss from "../styles.css?url";
import { CookieBanner, type CookieBannerHandle } from "@/components/site/CookieBanner";
import { Toaster } from "@/components/ui/sonner";
import { FloatingActions } from "@/components/site/FloatingActions";
import {
  initAnalytics,
  updateAnalyticsConsent,
  getAnalyticsConsent,
  trackWebVitals,
  initScrollTracking,
  applyCspNonce,
} from "@/lib/analytics";
import { getAnalyticsConfig } from "@/lib/analytics.functions";
import { CursorFollower } from "@/components/site/CursorFollower";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function reportRuntimeError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  console.error("Application error", context, error);
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportRuntimeError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "QuimeraTech — Software House de Excelência" },
      {
        name: "description",
        content:
          "Desenvolvimento de software à medida, consultoria tecnológica e soluções digitais inteligentes.",
      },
      { name: "author", content: "QuimeraTech" },
      { property: "og:site_name", content: "QuimeraTech" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@QuimeraTech" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <HeadContent />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Theme Setting
                  const savedTheme = localStorage.getItem('app-theme');
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const theme = savedTheme || systemTheme;
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');

                  // A11y Settings
                  const contrast = localStorage.getItem('a11y-high-contrast') === 'true';
                  if (contrast) document.documentElement.classList.add('high-contrast');
                  
                  const savedMotion = localStorage.getItem('a11y-reduced-motion');
                  const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  const motion = savedMotion === 'true' || (savedMotion === null && systemMotion);
                  if (motion) document.documentElement.classList.add('force-reduced-motion');
                  
                  const fontSize = localStorage.getItem('a11y-font-size');
                  if (fontSize === 'large') document.documentElement.classList.add('text-large');
                  if (fontSize === 'extra') document.documentElement.classList.add('text-extra');

                  const interactions = localStorage.getItem('a11y-interactions');
                  if (interactions === 'false') {
                    document.documentElement.classList.add('disable-interactions');
                  }

                  // Analytics Consent Mode v2 Initial State
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;

                  const getConsent = () => {
                    const local = localStorage.getItem('cookie-consent');
                    if (local) return local;
                    const match = document.cookie.match(new RegExp('(^| )cookie-consent=([^;]+)'));
                    if (match) return match[2];
                    return null;
                  };
                  const consent = getConsent();
                  const isGranted = consent === 'all';
                  
                  const granular = consent && consent.startsWith('{') ? JSON.parse(decodeURIComponent(consent)) : null;
                  const analyticsGranted = isGranted || (granular && granular.analytics === true);
                  const marketingGranted = isGranted || (granular && granular.marketing === true);
                  
                  gtag('consent', 'default', {
                    'ad_storage': marketingGranted ? 'granted' : 'denied',
                    'analytics_storage': analyticsGranted ? 'granted' : 'denied',
                    'ad_user_data': marketingGranted ? 'granted' : 'denied',
                    'ad_personalization': marketingGranted ? 'granted' : 'denied',
                    'wait_for_update': 500
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const cookieBannerRef = useRef<CookieBannerHandle>(null);

  useEffect(() => {
    const handleOpenConsent = () => {
      cookieBannerRef.current?.open();
    };
    window.addEventListener("open-cookie-settings", handleOpenConsent);
    return () => window.removeEventListener("open-cookie-settings", handleOpenConsent);
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const config = await getAnalyticsConfig();
        const currentConsent = getAnalyticsConsent();

        if (config.gtmId) {
          initAnalytics(config.gtmId);
        }

        // GA4 only loads after analytics consent is granted.
        if (config.gaId && currentConsent?.analytics) {
          if (!window.gtag) {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function (...args: unknown[]) {
              window.dataLayer.push(args);
            };
          }

          const existingGaScript = document.querySelector(
            `script[src*="googletagmanager.com/gtag/js"]`,
          );
          if (!existingGaScript) {
            const gaScript = document.createElement("script");
            applyCspNonce(gaScript);
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${config.gaId}`;
            document.head.appendChild(gaScript);
          }

          window.gtag("js", new Date());
          window.gtag("config", config.gaId);

          if (config.gtmId) {
            trackWebVitals();
            initScrollTracking();
          }
        }
      } catch (error) {
        console.error("Failed to load analytics config:", error);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Saltar para o conteúdo principal
      </a>
      <CursorFollower />
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
      <CookieBanner ref={cookieBannerRef} />
      <FloatingActions />
      <Toaster />
    </QueryClientProvider>
  );
}
