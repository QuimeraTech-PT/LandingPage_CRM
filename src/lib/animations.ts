export const transitions = {
  default: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1],
  },
  slow: {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1],
  },
  spring: {
    type: "spring",
    stiffness: 260,
    damping: 20,
  } as const,
};

export const variants = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  hoverScale: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tapScale: {
    scale: 0.95,
  },
};
