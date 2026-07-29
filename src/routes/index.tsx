import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Specialties } from "@/components/site/Specialties";
import { Methodology } from "@/components/site/Methodology";
import { Pillars } from "@/components/site/Pillars";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

const title = "QuimeraTech — Desenvolvimento de Software e Consultoria Tecnológica";
const description =
  "Software house de excelência: soluções digitais à medida, plataformas SaaS, sistemas empresariais, cloud Azure e consultoria tecnológica. Soluções Inteligentes. Impacto Real.";

export const Route = createFileRoute("/")({
  head: () => ({
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
      <Header />
      <main>
        <Hero />
        <About />
        <Specialties />
        <Methodology />
        <Pillars />
        <Contact />
      </main>
      <Footer />
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
