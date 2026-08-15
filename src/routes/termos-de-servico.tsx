import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronLeft, Gavel, Scale, FileCheck, AlertCircle, Bookmark } from "lucide-react";
import { SITE_URL, seoMeta, seoLinks, breadcrumbList, jsonLd } from "@/lib/seo";
import { PageTransition } from "@/components/site/PageTransition";

const title = "Termos de Serviço — QuimeraTech";
const description =
  "Termos e Condições de Serviço da QuimeraTech. Regras e diretrizes para a utilização das nossas soluções digitais.";
const path = "/termos-de-servico";

export const Route = createFileRoute("/termos-de-servico")({
  head: () => ({
    meta: seoMeta({
      title,
      description,
      path,
      type: "article",
      image: "/og-termos.jpg",
      imageAlt: "Termos de Serviço da QuimeraTech",
      keywords: "termos de serviço, condições de uso, legal, quimeratech, termos e condições, contrato de serviço, regras de utilização",
    }),
    links: seoLinks(path),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "additionalType": "http://schema.org/TermsOfService",
        "@id": `${SITE_URL}${path}#webpage`,
        name: "Termos de Serviço",
        url: `${SITE_URL}${path}`,
        description,
        inLanguage: "pt-PT",
        datePublished: "2026-08-09",
        dateModified: "2026-08-15",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: breadcrumbList([
          { name: "Início", path: "/" },
          { name: "Termos de Serviço", path },
        ]),
      }),
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
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
              <Gavel className="h-10 w-10 text-primary" />
              Termos de Serviço
            </h1>
            
            <p className="mt-4 text-sm text-muted-foreground italic">
              Última atualização: 15 de agosto de 2026
            </p>

            <div className="mt-8 p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center gap-6 not-prose">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bookmark className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Transparência Legal</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Estes termos regem o uso do nosso website e serviços. Ao utilizar a nossa plataforma, aceita estas condições na íntegra. O nosso objetivo é manter uma relação clara e profissional com todos os nossos utilizadores.
                </p>
              </div>
            </div>

            <section className="mt-12 space-y-12">
              <div>
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <FileCheck className="h-6 w-6 text-primary" />
                  1. Aceitação dos Termos
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Ao aceder ao website da QuimeraTech, concorda em cumprir estes termos de serviço e todas as leis aplicáveis. O acesso continuado ao site constitui a aceitação de quaisquer alterações futuras a estes termos.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <Scale className="h-6 w-6 text-primary" />
                  2. Propriedade Intelectual
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Todo o conteúdo deste website, incluindo textos, gráficos, logótipos e código de software, é propriedade da QuimeraTech ou dos seus licenciadores e está protegido por leis de direitos de autor e propriedade intelectual.
                </p>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">3. Condições de Utilização</h2>
                <div className="space-y-6">
                  <div className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h3 className="text-lg font-medium text-primary mb-2">Uso Permitido</h3>
                    <p className="text-sm text-muted-foreground">
                      É concedida uma licença limitada para visualizar e interagir com o conteúdo do site para fins informativos e de contacto profissional.
                    </p>
                  </div>
                  <div className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h3 className="text-lg font-medium text-primary mb-2">Restrições</h3>
                    <p className="text-sm text-muted-foreground">
                      É proibida qualquer tentativa de engenharia reversa, extração de dados automatizada (scraping) ou uso do site para atividades ilícitas ou que prejudiquem a integridade dos nossos sistemas.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  4. Limitação de Responsabilidade
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  A QuimeraTech envida todos os esforços para garantir a precisão da informação, mas não garante que os materiais no site sejam isentos de erros. Não seremos responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar o nosso website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground">5. Alterações aos Termos</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Reservamo-nos o direito de atualizar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a sua publicação no website.
                </p>
              </div>

              <div className="border-t border-border pt-8">
                <h2 className="text-2xl font-semibold text-foreground">6. Jurisdição</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Estes termos são regidos e interpretados de acordo com a legislação portuguesa. Para qualquer litígio, as partes submetem-se à jurisdição exclusiva dos tribunais portugueses.
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
