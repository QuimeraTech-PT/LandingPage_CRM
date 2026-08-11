import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { seoMeta, seoLinks, jsonLd } from "@/lib/seo";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HeroSkeleton, AboutSkeleton, SpecialtiesSkeleton, MethodologySkeleton, PillarsSkeleton, ContactSkeleton } from "@/components/site/Skeletons";
import { PageTransition } from "@/components/site/PageTransition";

const Hero = lazy(() => import("@/components/site/Hero").then(m => ({ default: m.Hero })));
const About = lazy(() => import("@/components/site/About").then(m => ({ default: m.About })));
const Specialties = lazy(() => import("@/components/site/Specialties").then(m => ({ default: m.Specialties })));
const Methodology = lazy(() => import("@/components/site/Methodology").then(m => ({ default: m.Methodology })));
const Pillars = lazy(() => import("@/components/site/Pillars").then(m => ({ default: m.Pillars })));
const Contact = lazy(() => import("@/components/site/Contact").then(m => ({ default: m.Contact })));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: seoMeta({
      title: "QuimeraTech — Software House de Excelência em Portugal",
      description: "Soluções inteligentes com impacto real em Portugal. Desenvolvimento de software à medida, consultoria tecnológica, Cloud e inovação digital.",
      path: "/",
      image: "/og-home.jpg",
      keywords: "software house portugal, desenvolvimento software a medida, consultoria tecnologica, cloud computing portugal, inovacao digital",
    }),
    links: seoLinks("/"),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": "Início",
          "item": "https://quimeratech.pt/"
        }]
      }),
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://quimeratech.pt/#website",
        url: "https://quimeratech.pt",
        name: "QuimeraTech",
        description: "Software House de Excelência",
        publisher: { "@id": "https://quimeratech.pt/#organization" },
        inLanguage: "pt-PT",
      }),
      jsonLd({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://quimeratech.pt/#organization",
        name: "QuimeraTech",
        url: "https://quimeratech.pt",
        logo: {
          "@type": "ImageObject",
          url: "https://quimeratech.pt/logo.png",
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://www.linkedin.com/company/quimeratech/",
          "https://github.com/quimeratech",
        ],
      }),
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={<HeroSkeleton />}>
            <Hero />
          </Suspense>
          <Suspense fallback={<AboutSkeleton />}>
            <About />
          </Suspense>
          <Suspense fallback={<SpecialtiesSkeleton />}>
            <Specialties />
          </Suspense>
          <Suspense fallback={<MethodologySkeleton />}>
            <Methodology />
          </Suspense>
          <Suspense fallback={<PillarsSkeleton />}>
            <Pillars />
          </Suspense>
          <Suspense fallback={<ContactSkeleton />}>
            <Contact />
          </Suspense>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
