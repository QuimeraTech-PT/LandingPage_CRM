import type { Transition } from "framer-motion";

// Helper to check for reduced motion
const isReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return (
    document.documentElement.classList.contains("force-reduced-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
};

export const transitions = {
  get default() {
    return isReducedMotion()
      ? { duration: 0 }
      : {
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        };
  },
  get slow() {
    return isReducedMotion()
      ? { duration: 0 }
      : {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        };
  },
  get spring() {
    return isReducedMotion()
      ? { type: "tween", duration: 0 }
      : {
          type: "spring",
          stiffness: 260,
          damping: 20,
        };
  },
} as Record<string, Transition>;

export const variants = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    get animate() {
      return isReducedMotion() ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 };
    },
    exit: { opacity: 0, y: -10 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  get hoverScale() {
    return isReducedMotion()
      ? {}
      : {
          scale: 1.05,
          transition: { duration: 0.2 },
        };
  },
  get tapScale() {
    return isReducedMotion()
      ? {}
      : {
          scale: 0.95,
        };
  },
};
