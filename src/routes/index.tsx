import { createFileRoute } from "@tanstack/react-router";
import logoAsset from "@/assets/quimeratech-logo.png.asset.json";

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
    ],
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content:
          "consultoria tecnológica, desenvolvimento de software, soluções digitais, plataformas SaaS, sistemas empresariais, React Tailwind, Flutter, SQL Server, Firebase, Azure, gestão de projetos ágil, web design, modelagem de dados",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
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
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "QuimeraTech",
            description,
            url: "https://quimeratech.pt",
            email: "hello@quimeratech.pt",
          }),
        }}
      />
    </div>
  );
}
