import type { Metadata } from "next";
import { About } from "@/components/About";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Soy Andrés Ruiz, filmmaker y creador audiovisual. Trabajo con negocios, marcas y creadores que quieren destacar.",
  alternates: { canonical: "/sobre-mi" },
};

export default function AboutPage() {
  return <About headingLevel={1} />;
}
