import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronLeft, Cookie, ShieldCheck, Settings2, Trash2 } from "lucide-react";
import { SITE_URL, seoMeta, seoLinks, breadcrumbList, jsonLd } from "@/lib/seo";
import { PageTransition } from "@/components/site/PageTransition";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateAnalyticsConsent, initAnalytics } from "@/lib/analytics";

const title = "Política de Cookies — QuimeraTech";
const description =
  "Saiba como a QuimeraTech utiliza cookies para melhorar a sua experiência. Gerencie as suas preferências de privacidade e cookies aqui.";
const path = "/politica-de-cookies";

export const Route = createFileRoute("/politica-de-cookies")({
  head: () => ({
    meta: seoMeta({
      title,
      description,
      path,
      type: "article",
      image: "/og-cookies.jpg",
      imageAlt: "Política de Cookies da QuimeraTech",
      keywords: "cookies, privacidade, gestão de cookies, proteção de dados, quimeratech",
    }),
    links: seoLinks(path),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${SITE_URL}${path}#webpage`,
        name: "Política de Cookies",
        url: `${SITE_URL}${path}`,
        description,
        inLanguage: "pt-PT",
        datePublished: "2026-08-15",
        dateModified: "2026-08-15",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: breadcrumbList([
          { name: "Início", path: "/" },
          { name: "Política de Cookies", path },
        ]),
      }),
    ],
  }),
  component: CookiesPolicy,
});

function CookiesPolicy() {
  const handleOpenSettings = () => {
    window.dispatchEvent(new CustomEvent("open-cookie-settings"));
  };

  const handleClearCookies = () => {
    localStorage.removeItem("cookie-consent");
    updateAnalyticsConsent("essential");
    toast.success("Preferências de cookies repostas com sucesso.");
    
    // Re-initialize analytics with default (denied) consent
    const gtmId = import.meta.env.VITE_GTM_ID;
    if (gtmId) {
      initAnalytics(gtmId);
    }

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-4xl px-5 py-24 lg:px-8 lg:py-32 focus:outline-hidden" tabIndex={-1} id="main-content">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para a página inicial
          </Link>

          <article className="prose prose-invert prose-blue max-w-none">
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl flex items-center gap-4">
              <Cookie className="h-10 w-10 text-primary" />
              Política de Cookies
            </h1>
            
            <p className="mt-4 text-sm text-muted-foreground italic">
              Última atualização: 15 de agosto de 2026
            </p>

            <div className="mt-8 p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center gap-6 not-prose">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Gestão Instantânea
                </h3>
                <p className="text-muted-foreground text-sm">
                  Pode alterar as suas preferências de consentimento ou revogar o seu consentimento a qualquer momento utilizando as ferramentas abaixo.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Button onClick={handleOpenSettings} variant="primary" size="sm">
                  Configurar Preferências
                </Button>
                <Button onClick={handleClearCookies} variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Consentimento
                </Button>
              </div>
            </div>

            <section className="mt-12 space-y-12">
              <div>
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  1. O que são cookies?
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Cookies são pequenos ficheiros de texto que são descarregados para o seu dispositivo quando visita um website. Estes permitem que o website reconheça o seu dispositivo e armazene algumas informações sobre as suas preferências ou ações passadas.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground">2. Como utilizamos os cookies?</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Na QuimeraTech, utilizamos cookies para garantir que o nosso website funciona corretamente, para analisar o desempenho do site e para personalizar a sua experiência. Não utilizamos cookies para fins publicitários intrusivos.
                </p>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">3. Tipos de cookies que utilizamos</h2>
                
                <div className="space-y-6">
                  <div className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h3 className="text-lg font-medium text-primary mb-2">Cookies Essenciais</h3>
                    <p className="text-sm text-muted-foreground">
                      Estes cookies são estritamente necessários para fornecer os serviços disponíveis através do nosso website e para utilizar algumas das suas funcionalidades, como o acesso a áreas seguras. Como estes cookies são estritamente necessários para o funcionamento do site, não pode recusá-los sem afetar o funcionamento do mesmo.
                    </p>
                  </div>

                  <div className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h3 className="text-lg font-medium text-primary mb-2">Cookies de Analítica e Desempenho</h3>
                    <p className="text-sm text-muted-foreground">
                      Estes cookies recolhem informações que são utilizadas de forma agregada para nos ajudar a compreender como o nosso website está a ser utilizado ou a eficácia das nossas campanhas de marketing, ou para nos ajudar a personalizar o nosso website para si.
                      <br /><br />
                      Utilizamos o <strong className="text-foreground">Google Analytics</strong> e o <strong className="text-foreground">Google Tag Manager</strong> para este fim, mas apenas se nos der o seu consentimento explícito.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-primary mb-2">Cookies de Funcionalidade</h3>
                    <p className="text-sm text-muted-foreground">
                      Estes cookies são utilizados para melhorar a funcionalidade do nosso website, mas não são essenciais para a sua utilização. No entanto, sem estes cookies, certas funcionalidades podem tornar-se indisponíveis.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground">4. Como controlar os cookies?</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Tem o direito de decidir se aceita ou rejeita cookies. Pode exercer os seus direitos de preferência de cookies configurando as suas preferências no nosso "Banner de Cookies" que aparece na sua primeira visita ou através do botão "Configurar Preferências" no topo desta página.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Além disso, a maioria dos navegadores permite-lhe controlar os cookies através das suas definições. No entanto, se limitar a capacidade dos websites de definir cookies, poderá piorar a sua experiência de utilizador global.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground">5. Atualizações a esta Política</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Podemos atualizar esta Política de Cookies periodicamente para refletir, por exemplo, alterações nos cookies que utilizamos ou por outros motivos operacionais, legais ou regulamentares. Por favor, revisite esta página regularmente para se manter informado.
                </p>
              </div>

              <div className="border-t border-border pt-8">
                <h2 className="text-2xl font-semibold text-foreground">6. Mais informações</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Se tiver alguma dúvida sobre a nossa utilização de cookies ou outras tecnologias, envie-nos um e-mail para <a href="mailto:hello@quimeratech.pt" className="text-primary hover:underline">hello@quimeratech.pt</a> ou consulte a nossa <Link to="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
                </p>
              </div>
            </section>
          </article>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
