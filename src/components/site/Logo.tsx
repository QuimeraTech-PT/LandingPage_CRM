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
        "w-auto brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]",
        sizeClasses[size],
        className
      )}
      width={1774}
      height={887}
    />
  );

  if (isHome) {
    return (
      <a href="#top" className="flex items-center" aria-label="QuimeraTech — voltar ao topo">
        {content}
      </a>
    );
  }

  return (
    <Link to="/" className="flex items-center" aria-label="QuimeraTech — página inicial">
      {content}
    </Link>
  );
}
