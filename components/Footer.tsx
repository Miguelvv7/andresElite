import Link from "next/link";
import { site } from "@/lib/site";
import { Arrow } from "./Arrow";

const link = "link-gold inline-flex min-h-11 items-center";

export function Footer() {
  return (
    <footer className="gutter border-t border-carbon bg-ink pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-6">
        <p className="text-sm font-semibold">
          {site.name} <span className="font-normal text-ash">· {site.city}</span>
        </p>
        <ul className="flex items-center justify-between gap-x-4 text-xs text-ash md:justify-end md:gap-x-7 md:text-sm">
          <li>
            <a href={site.instagram} target="_blank" rel="noreferrer" className={link}>
              Instagram
            </a>
          </li>
          <li>
            <Link href="/legal/aviso-legal" className={link}>Aviso legal</Link>
          </li>
          <li>
            <Link href="/legal/privacidad" className={link}>Privacidad</Link>
          </li>
          <li>
            <a href="#contenido" className={`${link} gap-1 whitespace-nowrap`}>Volver arriba <Arrow direction="up" /></a>
          </li>
        </ul>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4 text-[0.6875rem] text-ash/80 md:mt-2">
        <p>© 2026 {site.name}</p>
        <p className="whitespace-nowrap">Creado por Mvictorio</p>
      </div>
    </footer>
  );
}
