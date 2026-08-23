import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";
import { seoMeta, seoLinks, jsonLd, faqSchema, breadcrumbList } from "@/lib/seo";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  HeroSkeleton,
  AboutSkeleton,
  SpecialtiesSkeleton,
  MethodologySkeleton,
  PillarsSkeleton,
  ContactSkeleton,
} from "@/components/site/Skeletons";
import { PageTransition } from "@/components/site/PageTransition";
import { scrollToSection, waitForElement } from "@/utils/scroll";

const Hero = lazy(() => import("@/components/site/Hero").then((m) => ({ default: m.Hero })));
const About = lazy(() => import("@/components/site/About").then((m) => ({ default: m.About })));
const Specialties = lazy(() =>
  import("@/components/site/Specialties").then((m) => ({ default: m.Specialties })),
);
const Methodology = lazy(() =>
  import("@/components/site/Methodology").then((m) => ({ default: m.Methodology })),
);
const Pillars = lazy(() =>
  import("@/components/site/Pillars").then((m) => ({ default: m.Pillars })),
);
const Contact = lazy(() =>
  import("@/components/site/Contact").then((m) => ({ default: m.Contact })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: seoMeta({
      title: "QuimeraTech — Inovação Digital e Cloud de Elite em Portugal",
      description:
        "Lideramos a transformação digital com software à medida, consultoria estratégica e arquitetura Cloud. Excelência tecnológica para empresas que exigem o melhor.",
      path: "/",
      image: "/og-home.jpg",
      keywords:
        "software house portugal, desenvolvimento software, consultoria cloud, inovação tecnológica, crm personalizado, transformação digital",
    }),
    links: seoLinks("/"),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        ...breadcrumbList([{ name: "Início", path: "/" }]),
      }),
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://quimeratech.pt/#website",
        url: "https://quimeratech.pt",
        name: "QuimeraTech",
        description:
          "Software House de Excelência em Portugal, especializada em CRM personalizado e Cloud Architecture.",
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
        description:
          "Lideramos a transformação digital com software à medida, consultoria estratégica e arquitetura Cloud.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Portugal",
          addressCountry: "PT",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "hello@quimeratech.pt",
          availableLanguage: ["Portuguese", "English"],
        },
        sameAs: ["https://www.linkedin.com/company/quimeratech/", "https://github.com/quimeratech"],
      }),
      jsonLd(
        faqSchema([
          {
            q: "Quais os serviços que a QuimeraTech oferece?",
            a: "A QuimeraTech especializa-se em desenvolvimento de software à medida, consultoria em Cloud Architecture, criação de CRMs personalizados e transformação digital para empresas.",
          },
          {
            q: "Onde está localizada a QuimeraTech?",
            a: "A QuimeraTech opera a partir de Portugal, servindo clientes globalmente com foco na excelência tecnológica e inovação.",
          },
          {
            q: "Como posso entrar em contacto para um projeto?",
            a: "Pode contactar-nos através do e-mail hello@quimeratech.pt ou preencher o formulário na nossa secção de contactos para agendar uma consultoria gratuita.",
          },
        ]),
      ),
    ],
  }),
  component: Index,
});

function Index() {
  const router = useRouterState();

  useEffect(() => {
    const hash = router.location.hash;
    if (hash) {
      const targetId = hash.replace("#", "");

      // Use the utility to wait for the element then scroll
      waitForElement(`#${targetId}`).then((elem) => {
        if (elem) {
          // Additional slight delay to allow layout to settle after lazy load
          setTimeout(() => {
            scrollToSection(targetId);
          }, 100);
        }
      });
    }
  }, [router.location.hash]);

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="grow">
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
