import { useState, useEffect, useRef, useLayoutEffect } from "react";
2: import { Accessibility, X, Type, Eye, Move, Zap } from "lucide-react";
3: import { Button } from "@/components/ui/button";
4: import FocusTrap from "focus-trap-react";
5: import { motion, AnimatePresence } from "framer-motion";
6: import { transitions } from "@/lib/animations";
7: import { useRouter } from "@tanstack/react-router";
8: import { cn } from "@/lib/utils";
9: 
10: export const AccessibilityMenu = () => {
11:   const [isOpen, setIsOpen] = useState(false);
12:   const [highContrast, setHighContrast] = useState(false);
13:   const [reducedMotion, setReducedMotion] = useState(false);
14:   const [interactions, setInteractions] = useState(true);
15:   const [fontSize, setFontSize] = useState<"normal" | "large" | "extra">("normal");
16:   const triggerRef = useRef<HTMLButtonElement>(null);
17:   const menuRef = useRef<HTMLDivElement>(null);
18:   const router = useRouter();
19: 
20:   const toggleMenu = () => {
21:     setIsOpen(!isOpen);
22:   };
23: 
24:   useLayoutEffect(() => {
25:     // Load preferences
26:     const savedContrast = localStorage.getItem("a11y-high-contrast") === "true";
27:     const savedMotion = localStorage.getItem("a11y-reduced-motion") === "true";
28:     const savedInteractions = localStorage.getItem("a11y-interactions") !== "false";
29:     const savedFontSize = (localStorage.getItem("a11y-font-size") as any) || "normal";
30: 
31:     setHighContrast(savedContrast);
32:     setReducedMotion(savedMotion);
33:     setInteractions(savedInteractions);
34:     setFontSize(savedFontSize);
35:     
36:     applySettings({ contrast: savedContrast, motion: savedMotion, interactions: savedInteractions, size: savedFontSize });
37:   }, []);
38: 
39:   useEffect(() => {
40:     const handleClickOutside = (event: MouseEvent) => {
41:       if (
42:         isOpen && 
43:         menuRef.current && 
44:         !menuRef.current.contains(event.target as Node) &&
45:         triggerRef.current &&
46:         !triggerRef.current.contains(event.target as Node)
47:       ) {
48:         setIsOpen(false);
49:       }
50:     };
51: 
52:     const handleEscapeKey = (event: KeyboardEvent) => {
53:       if (isOpen && event.key === "Escape") {
54:         setIsOpen(false);
55:         triggerRef.current?.focus();
56:       }
57:     };
58: 
59:     document.addEventListener("mousedown", handleClickOutside);
60:     document.addEventListener("keydown", handleEscapeKey);
61:     return () => {
62:       document.removeEventListener("mousedown", handleClickOutside);
63:       document.removeEventListener("keydown", handleEscapeKey);
64:     };
65:   }, [isOpen]);
66: 
67:   const applySettings = ({ contrast, motion, interactions: interactionsVal, size }: { contrast: boolean, motion: boolean, interactions: boolean, size: string }) => {
68:     const root = document.documentElement;
69:     
70:     // Contrast
71:     if (contrast) {
72:       root.classList.add("high-contrast");
73:     } else {
74:       root.classList.remove("high-contrast");
75:     }
76:     
77:     // Motion
78:     if (motion) {
79:       root.classList.add("force-reduced-motion");
80:     } else {
81:       root.classList.remove("force-reduced-motion");
82:     }
83: 
84:     // Interactions
85:     if (!interactionsVal) {
86:       root.classList.add("disable-interactions");
87:     } else {
88:       root.classList.remove("disable-interactions");
89:     }
90:     
91:     // Font size
92:     root.classList.remove("text-large", "text-extra");
93:     if (size === "large") root.classList.add("text-large");
94:     if (size === "extra") root.classList.add("text-extra");
95:   };
96: 
97:   const toggleContrast = () => {
98:     const newVal = !highContrast;
99:     setHighContrast(newVal);
100:     localStorage.setItem("a11y-high-contrast", String(newVal));
101:     applySettings({ contrast: newVal, motion: reducedMotion, interactions, size: fontSize });
102:   };
103: 
104:   const toggleMotion = () => {
105:     const newVal = !reducedMotion;
106:     setReducedMotion(newVal);
107:     localStorage.setItem("a11y-reduced-motion", String(newVal));
108:     applySettings({ contrast: highContrast, motion: newVal, interactions, size: fontSize });
109:     
110:     // Invalidate router state if needed, though scroll behavior is mostly CSS/global
111:     router.invalidate();
112:   };
113: 
114:   const toggleInteractions = () => {
115:     const newVal = !interactions;
116:     setInteractions(newVal);
117:     localStorage.setItem("a11y-interactions", String(newVal));
118:     applySettings({ contrast: highContrast, motion: reducedMotion, interactions: newVal, size: fontSize });
119:   };
120: 
121:   const updateFontSize = (size: "normal" | "large" | "extra") => {
122:     setFontSize(size);
123:     localStorage.setItem("a11y-font-size", size);
124:     applySettings({ contrast: highContrast, motion: reducedMotion, interactions, size });
125:   };
126: 
127:   return (
128:     <div className="relative">
129:       <div className="sr-only" aria-live="polite" aria-atomic="true">
130:         {isOpen ? "Menu de acessibilidade aberto" : "Menu de acessibilidade fechado"}
131:       </div>
132:       <Button
133:         ref={triggerRef}
134:         variant="ghost"
135:         size="icon"
136:         onClick={toggleMenu}
137:         className="text-muted-foreground hover:text-accent focus-visible:ring-2 focus-visible:ring-primary"
138:         aria-label="Menu de acessibilidade"
139:         aria-expanded={isOpen}
140:       >
141:         <Accessibility className="h-5 w-5" />
142:       </Button>
143: 
144:       <AnimatePresence>
145:       {isOpen && (
146:         <FocusTrap focusTrapOptions={{ allowOutsideClick: true, initialFocus: '#accessibility-menu-title' }}>
147:           <motion.div 
148:             ref={menuRef}
149:             className="fixed top-20 right-5 w-72 rounded-xl border border-border bg-card p-6 shadow-2xl z-[9999] framer-motion-container"
150:             initial={{ opacity: 0, scale: 0.95, y: -10 }}
151:             animate={{ opacity: 1, scale: 1, y: 0 }}
152:             exit={{ opacity: 0, scale: 0.95, y: -10 }}
153:             transition={transitions.default}
154:             role="dialog"
155:             aria-modal="true"
156:             aria-labelledby="accessibility-menu-title"
157:           >
158:             <div className="flex items-center justify-between mb-6">
159:               <h2 id="accessibility-menu-title" tabIndex={-1} className="text-sm font-bold uppercase tracking-wider text-foreground outline-hidden">Acessibilidade</h2>
160:               <button 
161:                 onClick={() => setIsOpen(false)}
162:                 className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer flex items-center justify-center"
163:                 aria-label="Fechar menu"
164:               >
165:                 <X className="h-4 w-4" />
166:               </button>
167:             </div>
168: 
169:             <div className="space-y-6">
170:               {/* High Contrast */}
171:               <div className="flex items-center justify-between">
172:                 <div className="flex items-center gap-3">
173:                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
174:                     <Eye className="h-4 w-4" aria-hidden="true" />
175:                   </div>
176:                   <span id="label-contrast" className="text-sm font-medium">Modo de Alto Contraste</span>
177:                 </div>
178:                 <button
179:                   type="button"
180:                   role="switch"
181:                   aria-checked={highContrast}
182:                   aria-labelledby="label-contrast"
183:                   onClick={toggleContrast}
184:                   className={cn(
185:                     "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border/60 p-0 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
186:                     highContrast ? "bg-primary" : "bg-muted"
187:                   )}
188:                 >
189:                   <span
190:                     className={cn(
191:                       "pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-in-out",
192:                       highContrast ? "left-[calc(100%-1.25rem)]" : "left-1"
193:                     )}
194:                   />
195:                 </button>
196:               </div>
197: 
198:               {/* Movimento Reduzido */}
199:               <div className="flex items-center justify-between">
200:                 <div className="flex items-center gap-3">
201:                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
202:                     <Move className="h-4 w-4" aria-hidden="true" />
203:                   </div>
204:                   <span id="label-motion" className="text-sm font-medium">Movimento Reduzido</span>
205:                 </div>
206:                 <button
207:                   type="button"
208:                   role="switch"
209:                   aria-checked={reducedMotion}
210:                   aria-labelledby="label-motion"
211:                   onClick={toggleMotion}
212:                   className={cn(
213:                     "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border/60 p-0 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
214:                     reducedMotion ? "bg-primary" : "bg-muted"
215:                   )}
216:                 >
217:                   <span
218:                     className={cn(
219:                       "pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-in-out",
220:                       reducedMotion ? "left-[calc(100%-1.25rem)]" : "left-1"
221:                     )}
222:                   />
223:                 </button>
224:               </div>
225: 
226:               {/* Micro-interações */}
227:               <div className="flex items-center justify-between">
228:                 <div className="flex items-center gap-3">
229:                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
230:                     <Zap className="h-4 w-4" aria-hidden="true" />
231:                   </div>
232:                   <div className="flex flex-col">
233:                     <span id="label-interactions" className="text-sm font-medium">Micro-interações</span>
234:                     <span className="text-[10px] text-muted-foreground">Cursor e efeitos visuais</span>
235:                   </div>
236:                 </div>
237:                 <button
238:                   type="button"
239:                   role="switch"
240:                   aria-checked={interactions}
241:                   aria-labelledby="label-interactions"
242:                   onClick={toggleInteractions}
243:                   className={cn(
244:                     "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border/60 p-0 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
245:                     interactions ? "bg-primary" : "bg-muted"
246:                   )}
247:                 >
248:                   <span
249:                     className={cn(
250:                       "pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-in-out",
251:                       interactions ? "left-[calc(100%-1.25rem)]" : "left-1"
252:                     )}
253:                   />
254:                 </button>
255:               </div>
256: 
257:               {/* Font Size */}
258:               <div className="space-y-3" role="group" aria-labelledby="label-font-size">
259:                 <div className="flex items-center gap-3">
260:                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
261:                     <Type className="h-4 w-4" aria-hidden="true" />
262:                   </div>
263:                   <span id="label-font-size" className="text-sm font-medium">Tamanho da Fonte</span>
264:                 </div>
265:                 <div className="grid grid-cols-3 gap-2">
266:                   {(["normal", "large", "extra"] as const).map((size) => (
267:                     <Button
268:                       key={size}
269:                       variant={fontSize === size ? "primary" : "secondary"}
270:                       size="sm"
271:                       onClick={() => updateFontSize(size)}
272:                       className="flex-col h-auto py-3 px-1 gap-1"
273:                       aria-pressed={fontSize === size}
274:                     >
275:                       <span className={`font-bold ${size === 'normal' ? 'text-xs' : size === 'large' ? 'text-sm' : 'text-base'}`}>A</span>
276:                       <span className="text-[10px] uppercase font-semibold">{size === 'normal' ? 'Padrão' : size === 'large' ? 'Grande' : 'Extra'}</span>
277:                     </Button>
278:                   ))}
279:                 </div>
280:               </div>
281:             </div>
282:           </motion.div>
283:         </FocusTrap>
284:       )}
285:       </AnimatePresence>
286:     </div>
287:   );
288: };