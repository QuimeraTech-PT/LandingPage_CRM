import { motion, useReducedMotion } from "framer-motion";
import { transitions, variants } from "@/lib/animations";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
  iconClassName?: string;
  variant?: "default" | "accent";
  showBottomHighlight?: boolean;
}

export function ContentCard({
  title,
  description,
  icon: Icon,
  onClick,
  className = "",
  children,
  iconClassName = "",
  variant = "default",
  showBottomHighlight = true,
}: CardProps) {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: variants.fadeIn.initial,
    visible: {
      ...variants.fadeIn.animate,
      transition: transitions.default,
    },
  };

  const bgStyles =
    variant === "accent"
      ? "bg-accent/5 dark:bg-accent/10 border-accent/20 dark:border-accent/30"
      : "bg-card/60 dark:bg-card/60 border-border dark:border-white/10";

  const iconBgStyles =
    variant === "accent" ? "bg-accent/5 dark:bg-accent/10" : "bg-primary/10 dark:bg-primary/20";

  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className={cn(
        "glass-card glass-card-hover group relative flex flex-col p-8 border backdrop-blur-xl rounded-2xl overflow-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
        bgStyles,
        className,
        onClick && "cursor-pointer",
      )}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        className={cn(
          "mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-accent transition-transform duration-300 group-hover:scale-110 aspect-square",
          iconBgStyles,
          iconClassName,
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg leading-[1.3] font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">{description}</p>
      )}
      {children}
      {showBottomHighlight && (
        <span
          aria-hidden
          className="absolute inset-x-8 bottom-0 h-px bg-linear-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </motion.div>
  );
}
