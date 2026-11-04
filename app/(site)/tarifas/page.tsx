import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import pricing from "@/content/pricing.json";

export const metadata: Metadata = {
  title: "Tarifas",
  description: "Tarifas de redes sociales, vídeos y reels para negocios, marcas y creadores.",
  alternates: { canonical: "/tarifas" },
};

type Picture = { src: string; alt: string; position?: string };

const panels = [
  { id: "inicio", name: pricing.intro.title },
  ...pricing.plans.map((plan) => ({ id: plan.id, name: plan.name })),
];

function SectionIndex({ current }: { current: string }) {
  return (
    <nav aria-label="Secciones de tarifas" className="absolute top-28 left-[max(2.5rem,env(safe-area-inset-left))] z-10 hidden lg:block">
      <ul className="flex flex-col gap-0.5">
        {panels.map((panel) => (
          <li key={panel.id}>
            <a
              href={`#${panel.id}`}
              aria-current={panel.id === current ? "true" : undefined}
              className="font-condensed inline-flex min-h-7 items-center gap-2 text-sm tracking-[0.08em] text-ash transition-colors hover:text-bone aria-[current=true]:text-gold"
            >
              {panel.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Panel({ id, image, thumb, children }: { id: string; image: Picture; thumb: Picture; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="relative isolate flex -scroll-mt-20 flex-col overflow-hidden border-b border-white/10 bg-ink md:min-h-svh md:justify-center"
    >
      <SectionIndex current={id} />

      {/* Imagen fundida con el negro: arriba en móvil, a la derecha en pantallas grandes */}
      <div className="relative aspect-[4/5] w-full md:absolute md:inset-y-0 md:right-0 md:-z-10 md:aspect-auto md:w-[68%]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 68vw, 100vw"
          style={{ objectPosition: image.position }}
          className="object-cover brightness-[0.82]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/30 md:hidden" />
        <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-r from-ink via-ink/35 to-transparent md:block" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 hidden h-1/4 bg-gradient-to-b from-ink/70 to-transparent md:block" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-1/4 bg-gradient-to-t from-ink/80 to-transparent md:block" />
      </div>

      <div className="gutter relative -mt-24 pb-14 md:mt-0 md:w-[62%] md:py-28 lg:w-[66%]">
        {/* El margen deja sitio al índice lateral */}
        <Reveal className="lg:ml-32 xl:ml-40">{children}</Reveal>
      </div>

      <div className="absolute right-[max(2.5rem,env(safe-area-inset-right))] bottom-16 hidden w-[11vw] min-w-28 border border-white/25 p-1 lg:block">
        <Image src={thumb.src} alt={thumb.alt} width={1440} height={2560} sizes="12vw" className="aspect-[4/3] w-full object-cover" />
      </div>
    </section>
  );
}

export default function PricingPage() {
  const { intro, plans, notes } = pricing;
  return (
    <>
      <Panel id="inicio" image={intro.image} thumb={intro.thumb}>
        <p className="font-condensed text-[clamp(1.2rem,2.4vw,2rem)] tracking-[0.04em] text-bone">{intro.tagline}</p>
        <h1 className="font-condensed mt-1 text-[clamp(6rem,16vw,14rem)] leading-[0.86] tracking-[0.005em]">{intro.title}</h1>
        <p className="mt-5 max-w-md text-lg leading-snug text-bone/85">{intro.text}</p>
        <p className="font-condensed mt-7 text-[clamp(1.1rem,1.6vw,1.4rem)] tracking-[0.34em] text-gold">300 € · 600 € · 900 €</p>
      </Panel>

      {plans.map((plan, index) => (
        <Panel key={plan.id} id={plan.id} image={plan.image} thumb={plan.thumb}>
          <p className="font-condensed text-xl tracking-[0.1em] text-gold">0{index + 1}</p>
          <h2 className="font-condensed mt-1 text-[clamp(4.5rem,10.5vw,10rem)] leading-[0.88] tracking-[0.005em]">{plan.name}</h2>
          <p className="mt-4 flex items-baseline gap-2 text-gold">
            <span className="font-condensed text-[clamp(2.75rem,5vw,4.5rem)] leading-none">{plan.price}</span>
            {plan.period && <span className="text-sm text-ash">{plan.period}</span>}
          </p>
          <p className="mt-5 max-w-md text-lg leading-snug text-bone">{plan.summary}</p>
          <ul className="mt-5 flex max-w-md flex-col gap-1.5 text-[0.95rem] text-bone/85">
            {plan.includes.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="text-gold">—</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/contacto"
            className="font-condensed mt-8 inline-flex min-h-12 items-center border border-gold/70 px-6 text-lg tracking-[0.1em] text-bone transition-colors hover:bg-gold hover:text-ink"
          >
            LO QUIERO ↗
          </Link>
          {index === plans.length - 1 && <p className="mt-8 max-w-md text-xs leading-relaxed text-ash">{notes}</p>}
        </Panel>
      ))}
    </>
  );
}
