import type { Metadata } from "next";
import { About } from "@/components/About";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Soy Andrés Ruiz y me dedico al filmmaking, shooting y gestión de redes sociales para negocios, marcas y creadores.",
  alternates: { canonical: "/sobre-mi" },
};

export default function AboutPage() {
  return <About headingLevel={1} />;
}
