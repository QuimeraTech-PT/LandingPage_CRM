import { useEffect, useState } from "react";
2: import { motion, useSpring, useMotionValue, useReducedMotion } from "framer-motion";
3: 
4: export function CursorFollower() {
5:   const shouldReduceMotion = useReducedMotion();
6:   const [isVisible, setIsVisible] = useState(false);
7:   const [isPointer, setIsPointer] = useState(false);
8:   const [isEnabled, setIsEnabled] = useState(true);
9: 
10:   const cursorX = useMotionValue(-100);
11:   const cursorY = useMotionValue(-100);
12: 
13:   const springConfig = { damping: 25, stiffness: 250 };
14:   const springX = useSpring(cursorX, springConfig);
15:   const springY = useSpring(cursorY, springConfig);
16: 
17:   useEffect(() => {
18:     const checkEnabled = () => {
19:       const interactions = localStorage.getItem("a11y-interactions") !== "false";
20:       setIsEnabled(interactions);
21:     };
22:     
23:     checkEnabled();
24:     
25:     // Listen for changes (e.g. from AccessibilityMenu)
26:     const observer = new MutationObserver(() => {
27:       setIsEnabled(!document.documentElement.classList.contains("disable-interactions"));
28:     });
29:     
30:     observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
31:     
32:     if (shouldReduceMotion || !isEnabled) return;
33: 
34:     const moveCursor = (e: MouseEvent) => {
35:       cursorX.set(e.clientX);
36:       cursorY.set(e.clientY);
37:       
38:       const target = e.target as HTMLElement;
39:       const isClickable = 
40:         target.closest('button') || 
41:         target.closest('a') || 
42:         target.closest('[role="button"]') ||
43:         window.getComputedStyle(target).cursor === 'pointer';
44:       
45:       setIsPointer(!!isClickable);
46:       if (!isVisible) setIsVisible(true);
47:     };
48: 
49:     const handleMouseLeave = () => setIsVisible(false);
50:     const handleMouseEnter = () => setIsVisible(true);
51: 
52:     window.addEventListener("mousemove", moveCursor);
53:     document.documentElement.addEventListener("mouseleave", handleMouseLeave);
54:     document.documentElement.addEventListener("mouseenter", handleMouseEnter);
55: 
56:     return () => {
57:       window.removeEventListener("mousemove", moveCursor);
58:       document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
59:       document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
60:       observer.disconnect();
61:     };
62:   }, [cursorX, cursorY, isVisible, shouldReduceMotion, isEnabled]);
63: 
64:   if (shouldReduceMotion || !isEnabled) return null;
65: 
66:   return (
67:     <motion.div
68:       className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block cursor-follower-container"
69:       style={{
70:         x: springX,
71:         y: springY,
72:         translateX: "-50%",
73:         translateY: "-50%",
74:       }}
75:     >
76:       <motion.div
77:         animate={{
78:           scale: isPointer ? 1.5 : 1,
79:           opacity: isVisible ? 1 : 0,
80:         }}
81:         transition={{ duration: 0.2 }}
82:         className="flex items-center justify-center"
83:       >
84:         {/* Main core circle */}
85:         <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
86:         
87:         {/* Outer ring */}
88:         <motion.div 
89:           animate={{
90:             scale: isPointer ? 1.2 : 1,
91:             rotate: 360
92:           }}
93:           transition={{
94:             rotate: { duration: 8, repeat: Infinity, ease: "linear" },
95:             scale: { duration: 0.2 }
96:           }}
97:           className="absolute h-8 w-8 rounded-full border border-primary/30"
98:         />
99:         
100:         {/* Tech crosshairs */}
101:         <div className="absolute h-10 w-[1px] bg-primary/20" />
102:         <div className="absolute h-[1px] w-10 bg-primary/20" />
103:       </motion.div>
104:     </motion.div>
105:   );
106: }