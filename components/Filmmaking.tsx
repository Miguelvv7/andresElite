import { site } from "@/lib/site";
import type { Project } from "@/lib/types";
import { ProjectTile } from "./ProjectTile";
import { Reveal } from "./Reveal";

export function Filmmaking({ projects, headingLevel = 2 }: { projects: Project[]; headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section id="filmmaking" className="gutter bg-ink-2 py-20 md:py-28">
      <Reveal>
        <p className="eyebrow">Filmmaking</p>
        <Heading className="display-serif mt-4 !text-[clamp(3.25rem,10vw,9rem)]">SELECTED WORK.</Heading>
      </Reveal>

      <ol className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-4 md:gap-5">
        {projects.map((project, index) => (
          <li key={project.id}>
            <Reveal delay={index * 70}>
              <ProjectTile project={project} />
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
          Más trabajo en Instagram ↗
        </a>
      </Reveal>
    </section>
  );
}
