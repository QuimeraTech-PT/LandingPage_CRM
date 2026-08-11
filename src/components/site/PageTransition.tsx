import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

export function PageTransition({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const { location } = useRouterState();
  const transitionRef = useRef<HTMLDivElement>(null);

  // Manage focus on route change for screen readers
  useEffect(() => {
    // We skip the initial mount to avoid stealing focus from the skip link or main nav
    // unless the path has actually changed.
    if (transitionRef.current) {
      // Small timeout to ensure DOM is ready and animation has started
      const timer = setTimeout(() => {
        // Focus the container to ensure screen readers start at the beginning of the new content
        // We make it programmatically focusable
        transitionRef.current?.focus({ preventScroll: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <motion.div
      ref={transitionRef}
      tabIndex={-1} // Make programmatically focusable
      role="main"
      id="main-content"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="outline-hidden" // Hide focus ring for this container
    >
      {/* Route Announcement for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Página carregada: {document.title}
      </div>
      {children}
    </motion.div>
  );
}
