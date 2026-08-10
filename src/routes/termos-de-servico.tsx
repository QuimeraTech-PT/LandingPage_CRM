import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/termos-de-servico")({
  head: () => ({
    meta: [
      { title: "Termos de Serviço — QuimeraTech" },
      { name: "description", content: "Termos e Condições de Serviço da QuimeraTech. Regras e diretrizes para a utilização das nossas soluções digitais." },
      { property: "og:title", content: "Termos de Serviço — QuimeraTech" },
      { property: "og:description", content: "Consulte os termos de utilização do website e serviços da QuimeraTech." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://quimeratech.pt/termos-de-servico" },
      { property: "og:locale", content: "pt_PT" },
      { property: "og:image", content: "https://quimeratech.pt/og-termos.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Termos de Serviço da QuimeraTech" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Termos de Serviço — QuimeraTech" },
      { name: "twitter:description", content: "Consulte os termos de utilização do website e serviços da QuimeraTech." },
      { name: "twitter:image", content: "https://quimeratech.pt/og-termos.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://quimeratech.pt/termos-de-servico" },
      { rel: "alternate", hrefLang: "pt-PT", href: "https://quimeratech.pt/termos-de-servico" },
      { rel: "alternate", hrefLang: "pt", href: "https://quimeratech.pt/termos-de-servico" },
      { rel: "alternate", hrefLang: "x-default", href: "https://quimeratech.pt/termos-de-servico" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://quimeratech.pt/termos-de-servico#webpage",
          name: "Termos de Serviço",
          url: "https://quimeratech.pt/termos-de-servico",
          description:
            "Termos e Condições de Serviço da QuimeraTech. Regras e diretrizes para a utilização das nossas soluções digitais.",
          inLanguage: "pt-PT",
          dateModified: "2026-08-09",
          isPartOf: { "@id": "https://quimeratech.pt/#website" },
          publisher: { "@id": "https://quimeratech.pt/#organization" },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: "https://quimeratech.pt/" },
              { "@type": "ListItem", position: 2, name: "Termos de Serviço", item: "https://quimeratech.pt/termos-de-servico" },
            ],
          },
        }),
      },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-24 lg:px-8 lg:py-32">
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
  );
}
