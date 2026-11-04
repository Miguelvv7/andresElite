export const site = {
  name: "ANDRÉS RUIZ | ELITE FILMS®",
  description:
    "Andrés Ruiz, filmmaker y creador audiovisual en Sevilla. Vídeos de cine para negocios, marcas y creadores.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  instagram: "https://www.instagram.com/andresruizelite/",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
  city: "Sevilla",
} as const;

export const navLinks = [
  { label: "Sobre mí", href: "/sobre-mi" },
  { label: "Filmmaking", href: "/filmmaking" },
  { label: "Shooting", href: "/shooting" },
  { label: "Tarifas", href: "/tarifas" },
  { label: "Contáctame", href: "/contacto" },
] as const;

export const projectTypes = [
  "Negocio",
  "Marca",
  "Creador",
  "Deporte / fitness",
  "Otro",
] as const;
