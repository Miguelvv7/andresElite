import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Arrow";
import { VideoPlayer } from "@/components/VideoPlayer";
import { site } from "@/lib/site";
import { getPublishedProject, getPublishedProjects } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getPublishedProject((await params).slug);
  if (!found) return {};
  const { project } = found;
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/filmmaking/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.poster ? [{ url: project.poster.src, alt: project.poster.alt }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const found = await getPublishedProject((await params).slug);
  if (!found) notFound();
  const { project, next } = found;

  const facts = [
    { label: "Categoría", value: project.category },
    { label: "Año", value: String(project.year) },
    ...(project.client ? [{ label: "Cliente", value: project.client }] : []),
    ...(project.role ? [{ label: "Rol", value: project.role }] : []),
  ];

  return (
    <article className="pt-[calc(env(safe-area-inset-top)+7rem)] md:pt-40">
      <header className="gutter">
        <Link href="/filmmaking" className="link-gold inline-flex min-h-11 items-center text-sm text-ash">
          <Arrow direction="left" className="mr-2" /> Selected work
        </Link>
        <h1 className="display-serif mt-4">{project.title}</h1>
      </header>

      <div className="gutter mt-12 md:mt-20">
        <VideoPlayer video={project.video} poster={project.poster} title={project.title} />
      </div>

      <section className="gutter mt-14 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          {project.logo && (
            <Image
              src={project.logo.src}
              alt={project.logo.alt}
              width={project.logo.width}
              height={project.logo.height}
              sizes="96px"
              className="mb-8 size-20 rounded-2xl object-cover md:size-24"
            />
          )}
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-1">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="eyebrow">{fact.label}</dt>
              <dd className="mt-1.5 text-bone">{fact.value}</dd>
            </div>
          ))}
          </dl>
        </div>
        <p className="font-serif text-[clamp(1.6rem,6vw,2.75rem)] leading-[1.15] md:col-span-7 md:col-start-6">
          {project.description}
        </p>
      </section>

      {project.gallery.length > 0 && (
        <section aria-label="Galería" className="gutter mt-20 grid grid-cols-2 gap-3 md:mt-32 md:grid-cols-4 md:gap-6">
          {project.gallery.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 768px) 25vw, 50vw"
              className={`w-full ${index % 2 ? "md:mt-16" : ""}`}
            />
          ))}
        </section>
      )}

      {project.credits && project.credits.length > 0 && (
        <section className="gutter mt-20 md:mt-32">
          <h2 className="eyebrow">Créditos</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {project.credits.map((credit) => (
              <div key={`${credit.role}-${credit.name}`} className="flex gap-3">
                <dt className="text-ash">{credit.role}</dt>
                <dd>{credit.name}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <nav aria-label="Siguiente" className="gutter mt-24 border-t border-carbon py-16 md:mt-40 md:py-24">
        {next ? (
          <Link href={`/filmmaking/${next.slug}`} className="group block">
            <span className="eyebrow">Siguiente proyecto</span>
            <span className="display-serif mt-3 block transition-colors group-hover:text-gold">{next.title} <Arrow /></span>
          </Link>
        ) : (
          <a href={site.whatsapp} target="_blank" rel="noreferrer" className="group block">
            <span className="eyebrow">Contáctame</span>
            <span className="display-serif mt-3 block transition-colors group-hover:text-gold">¿Hablamos? <Arrow /></span>
          </a>
        )}
      </nav>
    </article>
  );
}
