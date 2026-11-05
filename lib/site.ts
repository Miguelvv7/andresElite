const WHATSAPP_MESSAGE = "¡Hola, Andrés! He visto tu trabajo y me gustaría recibir más información sobre tus servicios. ¡Hablamos! 😁";

export const site = {
  name: "ANDRÉS RUIZ | ELITE FILMS®",
  description:
    "Andrés Ruiz, filmmaker y creador audiovisual en Sevilla. Vídeos de cine para negocios, marcas y creadores.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  instagram: "https://www.instagram.com/andresruizelite/",
  // No usar wa.me: su redirección rompe los emoji del mensaje.
  whatsapp: `https://api.whatsapp.com/send?phone=34644384806&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
  city: "Sevilla",
} as const;

export const navLinks = [
  { label: "Sobre mí", href: "/sobre-mi" },
  { label: "Filmmaking", href: "/filmmaking" },
  { label: "Shooting", href: "/shooting" },
  { label: "Tarifas", href: "/tarifas" },
  { label: "Contáctame", href: site.whatsapp },
] as const;
