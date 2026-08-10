export function About() {
  return (
    <section 
      id="sobre" 
      className="bg-surface py-24 text-surface-foreground md:py-32"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-surface-border bg-surface-card shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)]">
          <div className="grid lg:grid-cols-2">
            {/* Texto */}
            <div className="flex flex-col justify-center space-y-8 p-8 lg:p-16">
              <div className="space-y-5">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-[0.15em] text-primary uppercase">
                  Quem Somos
                </span>
                <h2 id="about-heading" className="text-3xl leading-[1.15] font-bold tracking-tight md:text-4xl lg:text-[2.75rem]">
                  QuimeraTech: Inovação e Excelência em{" "}
                  <span className="text-primary">Software.</span>
                </h2>
                <p className="text-base leading-[1.7] text-surface-muted md:text-lg">
                  A QuimeraTech é uma software house de excelência, dedicada ao desenvolvimento de
                  soluções digitais personalizadas que impulsionam a eficiência, a inovação e o
                  crescimento dos negócios dos nossos clientes. Construímos desde websites
                  institucionais a plataformas SaaS complexas e sistemas empresariais à medida, com
                  foco absoluto na qualidade do produto e na experiência do utilizador.
                </p>
              </div>
            </div>

            {/* Imagem apelativa */}
            <div className="relative min-h-[320px] overflow-hidden lg:min-h-full">
              <img
                src="/quimeratech-about-visual.jpg"
                alt="Visualização tecnológica da QuimeraTech"
                className="absolute inset-0 h-full w-full object-cover"
                width={1344}
                height={768}
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/20 to-transparent" />

              {/* Citação como cartão flutuante */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-auto">
                <div className="max-w-xs rounded-2xl border border-surface-border bg-surface-card/95 p-5 shadow-2xl backdrop-blur-xl">
                  <p className="text-base font-semibold leading-snug text-surface-foreground">
                    “Soluções Inteligentes. Impacto Real.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
