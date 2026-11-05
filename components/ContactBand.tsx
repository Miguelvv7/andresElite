import { site } from "@/lib/site";
import { Arrow } from "./Arrow";
import { Reveal } from "./Reveal";

export function ContactBand() {
  return (
    <section className="gutter bg-ink py-24 md:py-40">
      <Reveal>
        <a href={site.whatsapp} target="_blank" rel="noreferrer" className="group block">
          <span className="eyebrow">Contáctame</span>
          <span className="display-serif mt-5 block !text-[clamp(3rem,12.5vw,11rem)] transition-colors group-hover:text-gold">
            LET&apos;S CREATE SOMETHING GREAT. <Arrow />
          </span>
        </a>
      </Reveal>
    </section>
  );
}
