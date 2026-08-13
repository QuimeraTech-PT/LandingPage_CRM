import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, useReducedMotion } from "framer-motion";

export function CursorFollower() {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      const target = e.target as HTMLElement;
      const isClickable = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(!!isClickable);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        animate={{
          scale: isPointer ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {/* Main core circle */}
        <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
        
        {/* Outer ring */}
        <motion.div 
          animate={{
            scale: isPointer ? 1.2 : 1,
            rotate: 360
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.2 }
          }}
          className="absolute h-8 w-8 rounded-full border border-primary/30"
        />
        
        {/* Tech crosshairs */}
        <div className="absolute h-10 w-[1px] bg-primary/20" />
        <div className="absolute h-[1px] w-10 bg-primary/20" />
      </motion.div>
    </motion.div>
  );
}
