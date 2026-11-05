import { About } from "@/components/About";
import { ContactBand } from "@/components/ContactBand";
import { Filmmaking } from "@/components/Filmmaking";
import { Hero } from "@/components/Hero";
import { site } from "@/lib/site";
import { getPublishedProjects } from "@/lib/store";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}/media/brand/og.jpg`,
  founder: { "@type": "Person", name: "Andrés Ruiz", jobTitle: "Filmmaker" },
  address: { "@type": "PostalAddress", addressLocality: "Sevilla", addressCountry: "ES" },
  sameAs: [site.instagram],
};

export default async function HomePage() {
  const projects = await getPublishedProjects();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <About />
      <Filmmaking projects={projects.slice(0, 4)} columns={4} />
      <ContactBand />
    </>
  );
}
