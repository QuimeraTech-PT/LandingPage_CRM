import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronLeft } from "lucide-react";
import { SITE_URL, seoMeta, seoLinks, breadcrumbList, jsonLd } from "@/lib/seo";
import { PageTransition } from "@/components/site/PageTransition";

const title = "Política de Privacidade — QuimeraTech";
const description =
  "Política de Privacidade e Cookies da QuimeraTech. Saiba como protegemos os seus dados e gerimos a sua privacidade.";
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
      keywords: "privacidade, cookies, proteção de dados, quimeratech",
    }),
    links: seoLinks(path),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "PrivacyPolicy",
        "@id": `${SITE_URL}${path}#webpage`,
        name: "Política de Privacidade e Cookies",
        url: `${SITE_URL}${path}`,
        description,
        inLanguage: "pt-PT",
        datePublished: "2026-08-09",
        dateModified: "2026-08-09",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/og-privacidade.jpg`,
          width: 1200,
          height: 630,
        },
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
            Política de Privacidade e Cookies
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Última atualização: 9 de agosto de 2026
          </p>

          <section className="mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">1. Introdução</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Na QuimeraTech, a sua privacidade é uma prioridade. Esta política explica como recolhemos, utilizamos e protegemos os seus dados pessoais e como gerimos os cookies no nosso website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">2. Recolha de Dados</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Recolhemos informações que nos fornece diretamente através do formulário de contacto, tais como o seu nome e endereço de e-mail. Estes dados são utilizados exclusivamente para responder às suas solicitações.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">3. O que são Cookies?</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Cookies são pequenos ficheiros de texto armazenados no seu dispositivo para melhorar a experiência do utilizador. Alguns são essenciais para o funcionamento do site, enquanto outros ajudam-nos a analisar o desempenho.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">4. Tipos de Cookies que utilizamos</h2>
              <ul className="mt-4 list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Cookies Essenciais:</strong> Necessários para a navegação básica e segurança.
                </li>
                <li>
                  <strong className="text-foreground">Cookies Analíticos:</strong> Ajudam-nos a entender como os visitantes interagem com o site (ex: Google Analytics).
                </li>
                <li>
                  <strong className="text-foreground">Cookies de Funcionalidade:</strong> Lembram-se das suas preferências, como a escolha de consentimento de cookies.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">5. Gestão de Consentimento</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Pode alterar as suas preferências de cookies a qualquer momento através das definições do seu navegador ou limpando a cache do mesmo para que o banner de consentimento reapareça.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground">6. Contacto</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Para qualquer questão sobre esta política, por favor contacte-nos através do e-mail: <a href="mailto:hello@quimeratech.pt" className="text-primary hover:underline">hello@quimeratech.pt</a>.
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
