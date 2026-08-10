import logoAsset from "@/assets/quimeratech-logo.png.asset.json";
import { Link } from "@tanstack/react-router";


export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-16" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Rodapé</h2>
      
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Logo & Sobre */}
          <div className="flex flex-col gap-6 items-center lg:items-start lg:col-span-1">
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
          </div>

          {/* Sitemaps */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            <div>
              <h3 className="text-sm font-bold tracking-wider text-foreground uppercase mb-6">Navegação</h3>
              <ul role="list" className="space-y-4">
                <li>
                  <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Início</Link>
                </li>
                <li>
                  <a href="/#about" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Quem Somos</a>
                </li>
                <li>
                  <a href="/#specialties" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Especialidades</a>
                </li>
                <li>
                  <a href="/#methodology" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Metodologia</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold tracking-wider text-foreground uppercase mb-6">Legal</h3>
              <ul role="list" className="space-y-4">
                <li>
                  <Link to="/politica-de-privacidade" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Política de Privacidade</Link>
                </li>
                <li>
                  <Link to="/termos-de-servico" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Termos de Serviço</Link>
                </li>
                <li>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-settings"))}
                    className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    Definições de Cookies
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold tracking-wider text-foreground uppercase mb-6">Contacto</h3>
              <ul role="list" className="space-y-4">
                <li>
                  <a href="/#contact" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Fale Connosco</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs font-light text-muted-foreground">
            © {year} QuimeraTech. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {/* Espaço para redes sociais no futuro */}
          </div>
        </div>
      </div>
    </footer>
  );
}
