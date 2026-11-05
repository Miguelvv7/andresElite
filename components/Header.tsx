"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navLinks, site } from "@/lib/site";
import { Arrow } from "./Arrow";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // Sobre mí tiene fondo claro: ahí el logo y el menú blancos necesitan fondo oscuro.
  const solid = scrolled || pathname === "/sobre-mi";
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  // Contáctame abre WhatsApp en otra pestaña.
  const externalProps = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {});
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    document.documentElement.classList.toggle("scroll-locked", open);
    return () => document.documentElement.classList.remove("scroll-locked");
  }, [open]);

  return (
    <header
      className={`gutter fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-colors duration-300 ${
        solid ? "bg-ink/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center justify-between md:h-20">
        <Link href="/" aria-label={`${site.name}, inicio`} className="-ml-1 flex h-11 items-center px-1">
          <Image src="/media/brand/logo-mark.png" alt="" width={300} height={218} priority className="h-9 w-auto md:h-11" />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-9">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  {...externalProps(link.href)}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  className="inline-flex min-h-11 items-center text-[0.95rem] font-medium text-bone transition-colors hover:text-gold aria-[current=page]:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label="Abrir menú"
          className="-mr-2.5 grid size-11 place-items-center md:hidden"
        >
          <span aria-hidden="true" className="flex w-6 flex-col gap-[7px]">
            <span className="block h-0.5 bg-bone" />
            <span className="block h-0.5 bg-bone" />
          </span>
        </button>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-label="Menú"
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-ink text-bone"
      >
        <div className="gutter flex min-h-full flex-col pt-[env(safe-area-inset-top)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex h-16 items-center justify-between">
            <Image src="/media/brand/logo-mark.png" alt="" width={300} height={218} className="h-9 w-auto" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="-mr-2.5 grid size-11 place-items-center"
            >
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l16 16M19 3L3 19" />
              </svg>
            </button>
          </div>

          <nav aria-label="Principal, móvil" className="my-auto py-8">
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    {...externalProps(link.href)}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    className="block py-1 font-serif text-[clamp(3rem,15vw,4.5rem)] leading-[1.05] active:text-gold aria-[current=page]:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <a href={site.instagram} target="_blank" rel="noreferrer" className="eyebrow inline-flex min-h-11 items-center self-start">
            Instagram <Arrow className="ml-1.5" />
          </a>
        </div>
      </dialog>
    </header>
  );
}
