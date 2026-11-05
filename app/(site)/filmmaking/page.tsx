import type { Metadata } from "next";
import { Filmmaking } from "@/components/Filmmaking";
import { Offers } from "@/components/Offers";
import offers from "@/content/filmmaking.json";
import { getPublishedProjects } from "@/lib/store";

export const metadata: Metadata = {
  title: "Filmmaking",
  description: "Proyectos audiovisuales de Andrés Ruiz para negocios, marcas y creadores.",
  alternates: { canonical: "/filmmaking" },
};

export default async function FilmmakingPage() {
  return (
    <Filmmaking projects={await getPublishedProjects()} headingLevel={1}>
      <Offers intro={offers.intro} offers={offers.offers} />
    </Filmmaking>
  );
}
