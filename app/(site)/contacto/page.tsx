import type { Metadata } from "next";
import { Contact } from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contáctame",
  description: "¿Tienes una idea en mente? Hagámosla realidad.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return <Contact />;
}
