import logoAsset from "@/assets/quimeratech-logo.png.asset.json";
import { Link } from "@tanstack/react-router";


export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-5 text-center lg:flex-row lg:justify-between lg:px-8 lg:text-left">
        <img
          src={logoAsset.url}
          alt="Logótipo QuimeraTech"
          className="h-9 w-auto"
          width={1774}
          height={887}
        />

        <p className="text-xs leading-[1.4] font-light text-muted-foreground">
          © {year} QuimeraTech. Todos os direitos reservados.
        </p>

        <nav className="flex items-center gap-6" aria-label="Ligações legais">
          <Link
            to="/politica-de-privacidade"
            className="text-xs font-light text-muted-foreground transition-colors hover:text-accent"
          >
            Política de Privacidade
          </Link>
          <Link
            to="/termos-de-servico"
            className="text-xs font-light text-muted-foreground transition-colors hover:text-accent"
          >
            Termos de Serviço
          </Link>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-settings"))}
            className="text-xs font-light text-muted-foreground transition-colors hover:text-accent"
          >
            Definições de Cookies
          </button>
        </nav>
      </div>
    </footer>
  );
}
