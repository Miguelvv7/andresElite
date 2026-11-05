"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Photo } from "@/lib/types";
import { Arrow } from "./Arrow";
import { Reveal } from "./Reveal";

export function Shooting({ photos, children }: { photos: Photo[]; children?: ReactNode }) {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);

  const step = useCallback(
    (delta: number) => setActive((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  const isOpen = active !== null;
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
    document.documentElement.classList.toggle("scroll-locked", isOpen);
    return () => document.documentElement.classList.remove("scroll-locked");
  }, [isOpen]);

  const current = active === null ? null : photos[active];

  return (
    <section id="shooting" className="gutter bg-ink py-20 md:py-28">
      <Reveal>
        <p className="eyebrow">Fotografía</p>
        <h1 className="display-serif mt-4 !text-[clamp(3.25rem,10vw,9rem)]">SHOOTING.</h1>
      </Reveal>

      {children}

      {/* Mosaico: cada foto conserva su proporción y se ve entera */}
      <ul className="mt-10 columns-2 gap-3 md:mt-14 md:columns-3 md:gap-5">
        {photos.map((photo, index) => (
          <li key={photo.id} className="mb-3 break-inside-avoid md:mb-5">
            <Reveal>
              <button
                type="button"
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setActive(index);
                }}
                aria-label={`Ampliar fotografía: ${photo.alt}`}
                className="group block w-full cursor-zoom-in overflow-hidden rounded-md bg-carbon"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="w-full transition-transform duration-[1200ms] ease-cine group-hover:scale-[1.02]"
                />
              </button>
            </Reveal>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Visor de fotografías"
        onClose={() => {
          setActive(null);
          opener.current?.focus();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
        onTouchStart={(event) => {
          touchX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchX.current === null) return;
          const delta = event.changedTouches[0].clientX - touchX.current;
          if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
          touchX.current = null;
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-ink text-bone"
      >
        {current && (
          <div className="relative flex h-full flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <div className="gutter flex h-16 shrink-0 items-center justify-between">
              <p className="eyebrow" aria-live="polite">
                {(active as number) + 1} / {photos.length}
                {current.caption ? ` — ${current.caption}` : ""}
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => setActive(null)}
                aria-label="Cerrar visor"
                className="-mr-2.5 grid size-11 place-items-center"
              >
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l16 16M19 3L3 19" />
                </svg>
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <Image
                key={current.id}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="flex h-16 shrink-0 items-center justify-center gap-6">
              <button type="button" onClick={() => step(-1)} aria-label="Fotografía anterior" className="grid size-11 place-items-center text-xl hover:text-gold">
                <Arrow direction="left" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Fotografía siguiente" className="grid size-11 place-items-center text-xl hover:text-gold">
                <Arrow direction="right" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
