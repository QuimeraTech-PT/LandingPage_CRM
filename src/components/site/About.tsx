import isoAsset from "@/assets/quimeratech-iso.png.asset.json";

export function About() {
  return (
    <section id="sobre" className="bg-surface py-24 text-surface-foreground md:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Quem Somos
            </p>
            <h2 className="text-3xl leading-[1.2] font-bold tracking-tight md:text-4xl">
              QuimeraTech: Inovação e Excelência em Software.
            </h2>
            <p className="mt-6 text-base leading-[1.6] text-surface-muted md:text-lg">
              A QuimeraTech é uma software house de excelência, dedicada ao desenvolvimento de
              soluções digitais personalizadas que impulsionam a eficiência, a inovação e o
              crescimento dos negócios dos nossos clientes. Construímos desde websites
              institucionais a plataformas SaaS complexas e sistemas empresariais à medida, com
              foco absoluto na qualidade do produto e na experiência do utilizador.
            </p>

            <blockquote className="mt-10 border-l-4 border-primary pl-6">
              <p className="text-xl leading-[1.3] font-semibold text-surface-foreground md:text-2xl">
                “Soluções Inteligentes. Impacto Real.”
              </p>
            </blockquote>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div
              aria-hidden
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/20 blur-2xl"
            />
            <div className="relative rounded-3xl border border-surface-border bg-surface-card p-12 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]">
              <img
                src={isoAsset.url}
                alt="Isotipo QuimeraTech"
                className="mx-auto h-auto w-full"
                width={2000}
                height={2000}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
