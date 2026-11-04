import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="gutter border-t border-carbon bg-ink pt-10 pb-[max(2rem,env(safe-area-inset-bottom))] text-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="font-semibold">{site.name}</p>
        <ul className="flex flex-wrap items-center gap-x-7 text-ash">
          <li className="flex min-h-11 items-center">{site.city}</li>
          <li>
            <a href={site.instagram} target="_blank" rel="noreferrer" className="link-gold inline-flex min-h-11 items-center">
              Instagram
            </a>
          </li>
          <li>
            <Link href="/legal/aviso-legal" className="link-gold inline-flex min-h-11 items-center">Aviso legal</Link>
          </li>
          <li>
            <Link href="/legal/privacidad" className="link-gold inline-flex min-h-11 items-center">Privacidad</Link>
          </li>
          <li>
            <a href="#contenido" className="link-gold inline-flex min-h-11 items-center">Volver arriba ↑</a>
          </li>
        </ul>
      </div>
      <p className="mt-6 text-xs text-ash">© 2026 {site.name}</p>
    </footer>
  );
}
