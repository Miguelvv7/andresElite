import { redirect } from "next/navigation";
import { site } from "@/lib/site";

// La antigua página de contacto ahora abre WhatsApp. No va en `redirects` de next.config
// porque ahí se decodifica el mensaje y sus acentos y emoji no caben en la cabecera.
export function GET() {
  redirect(site.whatsapp);
}
