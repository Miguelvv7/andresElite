import type { Metadata } from "next";
import { Offers } from "@/components/Offers";
import { Shooting } from "@/components/Shooting";
import offers from "@/content/shooting-offers.json";
import shooting from "@/content/shooting.json";
import type { Photo } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shooting",
  description: "Galería fotográfica de Andrés Ruiz.",
  alternates: { canonical: "/shooting" },
};

export default function ShootingPage() {
  return (
    <Shooting photos={shooting as Photo[]}>
      <Offers intro={offers.intro} offers={offers.offers} />
    </Shooting>
  );
}
