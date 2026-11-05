import { site } from "@/lib/site";
import { Arrow } from "./Arrow";
import { Reveal } from "./Reveal";

type Offer = { title: string; price: string; features: string[] };

export function Offers({ intro, offers }: { intro: string; offers: Offer[] }) {
  return (
    <div className="mt-8 md:mt-10">
      <Reveal>
        <p className="max-w-4xl text-[clamp(1.125rem,1.6vw,1.5rem)] leading-snug text-balance text-bone">{intro}</p>
      </Reveal>

      <div className="mt-8 grid grid-cols-2 gap-x-3 md:mt-14 md:gap-x-10">
        {offers.map((offer, index) => (
          <Reveal key={offer.title} delay={index * 70}>
            <p className="font-condensed text-base tracking-[0.1em] text-gold md:text-xl">0{index + 1}</p>
            <h2 className="font-condensed mt-1 text-[clamp(1.875rem,8.6vw,2.5rem)] leading-[0.9] tracking-[0.005em] uppercase md:text-[clamp(2.75rem,6vw,6.5rem)]">
              {offer.title}
            </h2>
            <p className="font-condensed mt-2 text-[clamp(1.875rem,8.6vw,2.5rem)] leading-none text-gold uppercase md:mt-4 md:text-[clamp(2.75rem,5vw,4.5rem)]">{offer.price}</p>
            {offer.features.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm leading-snug text-ash md:mt-6 md:space-y-2.5 md:text-lg">
                {offer.features.map((feature) => (
                  <li key={feature} className="flex gap-2 md:gap-3">
                    <span aria-hidden="true" className="text-gold">—</span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="font-condensed mt-5 inline-flex min-h-11 items-center border border-gold/70 px-3.5 text-base whitespace-nowrap tracking-[0.1em] text-bone transition-colors hover:bg-gold hover:text-ink md:mt-8 md:min-h-12 md:px-6 md:text-lg"
            >
              LO QUIERO <Arrow className="ml-2" />
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
