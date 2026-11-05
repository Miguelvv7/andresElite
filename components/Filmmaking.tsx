import type { ReactNode } from "react";
import { site } from "@/lib/site";
import type { Project } from "@/lib/types";
import { Arrow } from "./Arrow";
import { ProjectTile } from "./ProjectTile";
import { Reveal } from "./Reveal";

// La portada muestra una fila de 4 en PC; la página de Filmmaking, 3 columnas. En móvil, siempre 2.
export function Filmmaking({
  projects,
  headingLevel = 2,
  columns = 3,
  children,
}: {
  projects: Project[];
  headingLevel?: 1 | 2;
  columns?: 3 | 4;
  children?: ReactNode;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section id="filmmaking" className="gutter bg-ink-2 py-20 md:py-28">
      <Reveal>
        <p className="eyebrow">Filmmaking</p>
        <Heading className="display-serif mt-4 !text-[clamp(3.25rem,10vw,9rem)]">SELECTED WORK.</Heading>
      </Reveal>

      {children}

      <ol className={`mt-10 grid grid-cols-2 gap-3 md:mt-14 md:gap-5 ${columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {projects.map((project, index) => (
          <li key={project.id}>
            <Reveal delay={index * 70}>
              <ProjectTile project={project} sizes={`(min-width: 768px) ${columns === 4 ? 25 : 33}vw, 50vw`} />
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className="mt-8 md:mt-10">
        <a
          href={site.instagram}
          target="_blank"
          rel="noreferrer"
          className="link-gold inline-flex min-h-11 items-center text-sm font-medium text-ash"
        >
          Más trabajo en Instagram <Arrow className="ml-1.5" />
        </a>
      </Reveal>
    </section>
  );
}
