import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const shouldReduceMotion = useReducedMotion();
  
  // Replace with actual number
  const phoneNumber = "351912345678"; 
  const message = encodeURIComponent("Olá QuimeraTech, gostaria de saber mais sobre as vossas soluções.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={shouldReduceMotion ? {} : { scale: 1.1, y: -4 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-[#25D366]/50 transition-shadow lg:bottom-8"
      aria-label="Contactar via WhatsApp"
    >
      <MessageCircle className="h-7 w-7 fill-current" />
      <span className="sr-only">WhatsApp</span>
    </motion.a>
  );
}
