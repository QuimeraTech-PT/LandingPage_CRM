import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronLeft, Shield, Lock, Eye, FileText, Scale } from "lucide-react";
import { SITE_URL, seoMeta, seoLinks, breadcrumbList, jsonLd } from "@/lib/seo";
import { PageTransition } from "@/components/site/PageTransition";

const title = "Política de Privacidade — QuimeraTech";
const description =
  "Política de Privacidade da QuimeraTech. Saiba como recolhemos, utilizamos e protegemos os seus dados pessoais.";
const path = "/politica-de-privacidade";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: seoMeta({
      title,
      description,
      path,
      type: "article",
      image: "/og-privacidade.jpg",
      imageAlt: "Política de Privacidade da QuimeraTech",
      keywords: "privacidade, proteção de dados, quimeratech, rgpd",
    }),
    links: seoLinks(path),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "PrivacyPolicy",
        "@id": `${SITE_URL}${path}#webpage`,
        name: "Política de Privacidade",
        url: `${SITE_URL}${path}`,
        description,
        inLanguage: "pt-PT",
        datePublished: "2026-08-09",
        dateModified: "2026-08-15",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: breadcrumbList([
          { name: "Início", path: "/" },
          { name: "Política de Privacidade", path },
        ]),
      }),
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
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
              <Shield className="h-10 w-10 text-primary" />
              Política de Privacidade
            </h1>
            
            <p className="mt-4 text-sm text-muted-foreground italic">
              Última atualização: 15 de agosto de 2026
            </p>

            <div className="mt-8 p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center gap-6 not-prose">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Compromisso de Segurança</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Na QuimeraTech, tratamos os seus dados com o mesmo rigor com que desenvolvemos o nosso software. A sua privacidade não é apenas um requisito legal, é a base da nossa confiança.
                </p>
              </div>
            </div>

            <section className="mt-12 space-y-12">
              <div>
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary" />
                  1. Introdução
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Esta Política de Privacidade descreve como a QuimeraTech recolhe, utiliza e protege as informações pessoais que nos fornece. Estamos empenhados em garantir que a sua privacidade está protegida em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD).
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Para informações detalhadas sobre a utilização de cookies, consulte a nossa <Link to="/politica-de-cookies" className="text-primary hover:underline">Política de Cookies</Link>.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  2. Recolha de Dados
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Recolhemos dados pessoais apenas quando nos são fornecidos voluntariamente através dos nossos formulários de contacto ou comunicação direta. Estes podem incluir o seu nome, endereço de e-mail e informações profissionais.
                </p>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-6">3. Tratamento e Finalidade</h2>
                <div className="space-y-6">
                  <div className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h3 className="text-lg font-medium text-primary mb-2">Comunicação e Suporte</h3>
                    <p className="text-sm text-muted-foreground">
                      Utilizamos os seus dados para responder a pedidos de informação e prestar suporte técnico sobre os nossos serviços.
                    </p>
                  </div>
                  <div className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h3 className="text-lg font-medium text-primary mb-2">Melhoria de Serviços</h3>
                    <p className="text-sm text-muted-foreground">
                      Analisamos dados de utilização de forma anónima para otimizar a performance e usabilidade das nossas plataformas.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <Scale className="h-6 w-6 text-primary" />
                  4. Os seus Direitos
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  De acordo com a legislação vigente, tem o direito de aceder, retificar, apagar ou limitar o tratamento dos seus dados pessoais a qualquer momento.
                </p>
              </div>

              <div className="border-t border-border pt-8">
                <h2 className="text-2xl font-semibold text-foreground">5. Contacto</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Para exercer os seus direitos ou esclarecer qualquer dúvida, contacte-nos através do e-mail:
                  <br /><br />
                  <a href="mailto:hello@quimeratech.pt" className="text-primary font-medium hover:underline">hello@quimeratech.pt</a>
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
