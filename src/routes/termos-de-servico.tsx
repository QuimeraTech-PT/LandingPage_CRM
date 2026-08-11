import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronLeft } from "lucide-react";
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
      keywords: "termos de serviço, condições de uso, legal, quimeratech",
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
        dateModified: "2026-08-09",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/og-termos.jpg`,
          width: 1200,
          height: 630,
        },
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
      <main className="mx-auto max-w-4xl px-5 py-24 lg:px-8 lg:py-32 focus:outline-hidden" tabIndex={-1}>
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para a página inicial
        </Link>

        <article className="prose prose-invert prose-blue max-w-none">
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Termos de Serviço
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Última atualização: 9 de agosto de 2026
          </p>

          <section className="mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Ao aceder ao website da QuimeraTech, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. Se não concordar com algum destes termos, está proibido de usar ou aceder a este site.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">2. Uso de Licença</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                É concedida permissão para descarregar temporariamente uma cópia dos materiais no site da QuimeraTech apenas para visualização pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">3. Isenção de Responsabilidade</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Os materiais no site da QuimeraTech são fornecidos "como estão". A QuimeraTech não oferece garantias, expressas ou implícitas, e por este meio isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas de comercialização ou adequação a um fim específico.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">4. Limitações</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Em nenhum caso a QuimeraTech ou os seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar os materiais no site da QuimeraTech.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">5. Precisão dos Materiais</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Os materiais exibidos no site podem incluir erros técnicos, tipográficos ou fotográficos. A QuimeraTech não garante que qualquer material no seu site seja preciso, completo ou atual.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">6. Alterações</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                A QuimeraTech pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
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
