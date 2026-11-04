import { site } from "@/lib/site";
import { ContactForm } from "./ContactForm";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section id="contacto" className="gutter bg-ink-2 py-24 md:py-40">
      <Reveal>
        <p className="eyebrow">Contáctame</p>
        <h1 className="display-serif mt-5 !text-[clamp(3rem,12.5vw,11rem)]">LET&apos;S CREATE SOMETHING GREAT.</h1>
        <p className="mt-6 font-serif text-[clamp(1.5rem,5.6vw,2.4rem)] leading-tight text-ash">
          ¿Tienes una idea en mente? Hagámosla realidad.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-14 md:mt-24 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-7">
          <ContactForm />
        </Reveal>
        <Reveal className="md:col-span-3 md:col-start-10" delay={120}>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <a href={site.instagram} target="_blank" rel="noreferrer" className="link-gold inline-flex min-h-11 items-center font-medium">
                Instagram ↗
              </a>
            </li>
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className="link-gold inline-flex min-h-11 items-center font-medium">
                  {site.email}
                </a>
              </li>
            )}
            <li className="flex min-h-11 items-center text-ash">{site.city}, España</li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
