import Image from "next/image";
import Link from "next/link";
import about from "@/content/about.json";
import { site } from "@/lib/site";
import { Arrow } from "./Arrow";
import { Reveal } from "./Reveal";

export function About({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section
      id="sobre-mi"
      // Tono tomado del cielo de la fotografía; la sección queda bajo la cabecera al llegar.
      className="on-light relative isolate flex -scroll-mt-20 flex-col overflow-hidden bg-[#e1e1e4] text-ink xl:grid xl:min-h-svh xl:grid-cols-12 xl:grid-rows-[1fr_auto]"
    >
      <div className="gutter order-1 pt-28 xl:col-span-5 xl:pt-[max(6.5rem,14svh)]">
        <Reveal>
          <p className="border-l border-ink/50 pl-4 text-xs font-medium tracking-[0.28em] uppercase">Sobre mí</p>
          <Heading className="mt-6 text-[clamp(3.25rem,15.5vw,6.5rem)] leading-[0.95] font-semibold tracking-[-0.035em] xl:mt-4 xl:text-[clamp(3.25rem,min(5.6vw,9svh),6.5rem)]">
            BEHIND
            <br /> <span className="text-[#6b6b6e]">THE LENS.</span>
          </Heading>
          <div className="mt-6 max-w-xl space-y-4 text-[1.0625rem] leading-[1.45] text-[#3d3d40] xl:mt-4 xl:max-w-[min(26rem,30vw)] xl:space-y-3 xl:text-[clamp(1rem,min(1.2vw,2.3svh),1.25rem)]">
            <p>
              Soy Andrés Ruiz y me dedico al filmmaking, shooting y gestión de redes sociales para negocios, marcas y
              creadores. Me apasiona transformar ideas en contenido audiovisual que transmita, conecte y tenga
              personalidad.
            </p>
            <p>
              Busco captar la esencia de cada proyecto a través de vídeos, fotografías y contenido para redes sociales
              que ayuden a destacar y mostrar cada marca de una forma auténtica y diferente.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 xl:mt-6">
            <Link
              href="/filmmaking"
              className="inline-flex min-h-13 items-center gap-4 rounded-full bg-ink py-1.5 pr-1.5 pl-6 text-sm font-medium text-bone transition-colors hover:bg-carbon"
            >
              Ver mi trabajo
              <span className="grid size-10 place-items-center rounded-full bg-bone text-ink">
                <Arrow direction="right" className="!size-4" />
              </span>
            </Link>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-13 items-center rounded-full bg-white/60 px-7 backdrop-blur-sm text-sm font-medium transition-colors hover:bg-white/90"
            >
              Contáctame
            </a>
          </div>
        </Reveal>
      </div>

      {/* El título de fondo usa "darken": se ve sobre el cielo y queda detrás de la figura. */}
      <div className="relative order-2 mt-6 aspect-[9/10] w-full md:aspect-[4/3] [mask-image:linear-gradient(to_bottom,transparent,black_18%)] xl:absolute xl:inset-0 xl:-z-10 xl:mt-0 xl:aspect-auto xl:[mask-image:none]">
        <Image
          src="/media/photos/sobre-mi.jpg"
          alt="Andrés Ruiz de perfil, con gafas de sol doradas y camiseta negra, sobre un cielo claro"
          fill
          quality={80}
          sizes="(min-width: 1280px) 135vw, (min-width: 768px) 160vw, 235vw"
          className="object-cover object-center"
        />
        <p
          aria-hidden="true"
          className="absolute inset-x-0 bottom-[51.5%] text-center text-[14.6vw] md:bottom-[5%] xl:text-[min(14.6vw,18svh)] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-[#c3c4c8] mix-blend-darken select-none xl:bottom-[5.5rem]"
        >
          ELITE FILMS
        </p>
      </div>

      <div className="gutter order-3 mt-10 pb-8 xl:col-span-12 xl:mt-0 xl:pb-6">
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/70 bg-white/35 px-4 py-4 text-[clamp(0.7rem,3.2vw,0.875rem)] backdrop-blur-md xl:flex-row xl:justify-between xl:rounded-full xl:px-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-[2.2vw] gap-y-1 md:gap-x-4 xl:gap-x-0">
            {about.tags.map((tag, index) => (
              <li key={tag} className="flex items-center">
                {index > 0 && <span aria-hidden="true" className="mx-2.5 hidden text-ink/40 xl:inline">/</span>}
                {tag}
              </li>
            ))}
          </ul>
          <p className="text-[#3d3d40]">{about.location}</p>
        </div>
      </div>
    </section>
  );
}
