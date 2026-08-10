import { createFileRoute } from "@tanstack/react-router";
import logoAsset from "@/assets/quimeratech-logo.png.asset.json";
import { SITE_URL, seoMeta, seoLinks, breadcrumbList, jsonLd } from "@/lib/seo";

import { lazy, Suspense } from "react";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { 
  SpecialtiesSkeleton, 
  MethodologySkeleton, 
  ContactSkeleton 
} from "@/components/site/Skeletons";

const Specialties = lazy(() => import("@/components/site/Specialties").then(m => ({ default: m.Specialties })));
const Methodology = lazy(() => import("@/components/site/Methodology").then(m => ({ default: m.Methodology })));
const Pillars = lazy(() => import("@/components/site/Pillars").then(m => ({ default: m.Pillars })));
const Contact = lazy(() => import("@/components/site/Contact").then(m => ({ default: m.Contact })));
const Footer = lazy(() => import("@/components/site/Footer").then(m => ({ default: m.Footer })));

const title = "QuimeraTech — Desenvolvimento de Software e Consultoria Tecnológica";
const description =
  "Software house de excelência: soluções digitais à medida, plataformas SaaS, sistemas empresariais, cloud Azure e consultoria tecnológica. Soluções Inteligentes. Impacto Real.";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      { rel: "preload", href: logoAsset.url, as: "image", type: "image/png" },
      ...seoLinks("/"),
    ],
    meta: seoMeta({
      title,
      description,
      path: "/",
      image: "/og-home.jpg",
      imageAlt: "QuimeraTech — Soluções Inteligentes. Impacto Real.",
      keywords:
        "consultoria tecnológica, desenvolvimento de software, soluções digitais, plataformas SaaS, sistemas empresariais, React Tailwind, Flutter, SQL Server, Firebase, Azure, gestão de projetos ágil, web design, modelagem de dados",
    }),
    scripts: [
      jsonLd([
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "QuimeraTech",
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.png`,
          image: `${SITE_URL}/og-home.jpg`,
          description,
          email: "hello@quimeratech.pt",
          address: { "@type": "PostalAddress", addressCountry: "PT" },
          sameAs: [
            "https://www.linkedin.com/company/quimeratech/",
            "https://github.com/quimeratech",
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: "QuimeraTech",
          description,
          publisher: { "@id": `${SITE_URL}/#organization` },
          inLanguage: "pt-PT",
        },
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${SITE_URL}/#webpage`,
          url: `${SITE_URL}/`,
          name: title,
          description,
          inLanguage: "pt-PT",
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: { "@id": `${SITE_URL}/#organization` },
          primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630 },
          breadcrumb: breadcrumbList([{ name: "Início", path: "/" }]),
        },
        {
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "@id": `${SITE_URL}/#service`,
          name: "QuimeraTech",
          url: SITE_URL,
          description,
          areaServed: "PT",
          provider: { "@id": `${SITE_URL}/#organization` },
          serviceType: [
            "Desenvolvimento de software à medida",
            "Consultoria tecnológica",
            "Plataformas SaaS",
            "Soluções cloud Azure",
          ],
        },
      ]),
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Saltar para o conteúdo principal
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Suspense fallback={<SpecialtiesSkeleton />}>
          <Specialties />
        </Suspense>
        <Suspense fallback={<MethodologySkeleton />}>
          <Methodology />
        </Suspense>
        <Suspense fallback={<div className="h-[400px]" />}>
          <Pillars />
        </Suspense>
        <Suspense fallback={<ContactSkeleton />}>
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-20 border-t border-border bg-background" />}>
        <Footer />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://quimeratech.pt/#organization",
              "name": "QuimeraTech",
              "url": "https://quimeratech.pt",
              "logo": "https://quimeratech.pt/favicon.png",
              "description": description,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "PT"
              },
              "sameAs": [
                "https://www.linkedin.com/company/quimeratech/",
                "https://github.com/quimeratech"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://quimeratech.pt/#website",
              "url": "https://quimeratech.pt",
              "name": "QuimeraTech",
              "publisher": { "@id": "https://quimeratech.pt/#organization" },
              "inLanguage": "pt-PT"
            }
          ]),
        }}
      />
    </div>
  );
}
