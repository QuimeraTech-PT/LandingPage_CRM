import logoAsset from "@/assets/quimeratech-logo.png.asset.json";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";



export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-16" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Rodapé</h2>
      
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Logo & Sobre */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 items-center lg:items-start lg:col-span-1"
          >
            <img
              src={logoAsset.url}
              alt="Logótipo QuimeraTech"
              className="h-9 w-auto"
              width={1774}
              height={887}
            />
            <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-xs text-center lg:text-left">
              Transformamos ideias visionárias em soluções tecnológicas robustas e escaláveis. A sua software house de confiança.
            </p>
          </motion.div>

          {/* Sitemaps */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            <motion.nav 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              aria-labelledby="footer-nav-heading"
            >
              <h3 id="footer-nav-heading" className="text-sm font-bold tracking-wider text-foreground uppercase mb-6">Navegação</h3>
              <ul role="list" className="space-y-4">
                <li>
                  <Link to="/" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    <span className="relative">
                      Início
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
                    </span>
                  </Link>
                </li>
                <li>
                  <a href="/#about" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    <span className="relative">
                      Quem Somos
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/#specialties" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    <span className="relative">
                      Especialidades
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/#methodology" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    <span className="relative">
                      Metodologia
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
                    </span>
                  </a>
                </li>
              </ul>
            </motion.nav>

            <motion.nav 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              aria-labelledby="footer-legal-heading"
            >
              <h3 id="footer-legal-heading" className="text-sm font-bold tracking-wider text-foreground uppercase mb-6">Legal</h3>
              <ul role="list" className="space-y-4">
                <li>
                  <Link to="/politica-de-privacidade" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    <span className="relative">
                      Política de Privacidade
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/termos-de-servico" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    <span className="relative">
                      Termos de Serviço
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
                    </span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-settings"))}
                    className="group cursor-pointer inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <span className="relative">
                      Definições de Cookies
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
                    </span>
                  </button>
                </li>
              </ul>
            </motion.nav>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-sm font-bold tracking-wider text-foreground uppercase mb-6">Contacto</h3>
              <ul role="list" className="space-y-4">
                <li>
                  <a href="/#contact" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    <span className="relative">
                      Fale Connosco
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
                    </span>
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-border flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <p className="text-xs font-light text-muted-foreground text-center sm:text-left">
            © {year} QuimeraTech. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {/* Espaço para redes sociais no futuro */}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
