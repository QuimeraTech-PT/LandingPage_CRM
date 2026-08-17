import logoAsset from "@/assets/quimeratech-logo.png.asset.json";
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
    sm: "h-8 md:h-10",
    md: "h-10 md:h-12",
    lg: "h-14 md:h-16",
  };

  const content = (
    <img
      src={logoAsset.url}
      alt="Logótipo QuimeraTech"
      className={cn(
        "w-auto transition-all duration-300",
        // In Light Theme, we use invert to turn black to white, then we'll need to handle the "Quimera" part.
        // Wait, if it's already black, we want it black in light mode and white in dark mode.
        "dark:invert dark:brightness-200",
        sizeClasses[size],
        className
      )}
      width={1774}
      height={887}
      decoding="async"
      loading="eager"
      fetchPriority="high"
    />
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
