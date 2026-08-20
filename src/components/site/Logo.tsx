import logoAsset from "@/assets/quimeratech-logo-dark-v2.png.asset.json";
import logoLightAsset from "@/assets/quimeratech-logo-light.png.asset.json";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const router = useRouterState();
  const isHome = router.location.pathname === "/" || router.location.pathname === "";

  const sizeClasses = {
    sm: "h-7 md:h-8",
    md: "h-8 md:h-10",
    lg: "h-12 md:h-14",
  };

  const content = (
    <>
      <img
        src={logoAsset.url}
        alt="Logótipo QuimeraTech"
        className={cn(
          "w-auto brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] hidden dark:block",
          sizeClasses[size],
          className
        )}
        width={1920}
        height={720}
        decoding="async"
        loading="eager"
        fetchPriority="high"
      />
      <img
        src={logoLightAsset.url}
        alt="Logótipo QuimeraTech"
        className={cn(
          "w-auto block dark:hidden opacity-90",
          sizeClasses[size],
          className
        )}
        width={1920}
        height={720}
        decoding="async"
        loading="eager"
        fetchPriority="high"
      />
    </>
  );

  const commonClasses = "flex items-center rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-shadow";

  if (isHome) {
    return (
      <a
        href="#top"
        className={commonClasses}
        aria-label="QuimeraTech — Voltar ao topo da página"
        onClick={(e) => {
          e.preventDefault();
          const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
                                  document.documentElement.classList.contains("force-reduced-motion");
          window.scrollTo({ top: 0, behavior: isReducedMotion ? "auto" : "smooth" });
          // Move focus to the top of the page for keyboard users
          const topElement = document.getElementById("top") || document.body;
          topElement.focus();
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to="/" className={commonClasses} aria-label="QuimeraTech — Ir para a página inicial">
      {content}
    </Link>
  );
}
