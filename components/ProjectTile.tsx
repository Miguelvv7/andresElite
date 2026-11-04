"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";

// Solo una tarjeta en reproducción: ratón y teclado podrían activar dos a la vez.
let activeVideo: HTMLVideoElement | null = null;
const HOVER_DELAY_MS = 120;

export function ProjectTile({ project }: { project: Project }) {
  const video = useRef<HTMLVideoElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [playing, setPlaying] = useState(false);

  // Las piezas en Mux muestran solo el póster: su HLS no se carga para una vista previa.
  const previewSrc = project.video.provider === "local" ? project.video.src : undefined;

  function start() {
    const el = video.current;
    if (!el || !previewSrc) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Pequeña espera: cruzar la cuadrícula con el ratón no debe descargar cada vídeo.
    timer.current = setTimeout(() => {
      if (activeVideo && activeVideo !== el) activeVideo.pause();
      activeVideo = el;
      if (!el.getAttribute("src")) el.src = previewSrc;
      el.play().catch(() => setPlaying(false));
    }, HOVER_DELAY_MS);
  }

  function stop() {
    clearTimeout(timer.current);
    const el = video.current;
    if (!el) return;
    el.pause();
    if (el.getAttribute("src")) el.currentTime = 0;
    if (activeVideo === el) activeVideo = null;
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Link
      href={`/filmmaking/${project.slug}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") start();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") stop();
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) start();
      }}
      onBlur={stop}
      className="group relative block aspect-[9/16] overflow-hidden rounded-md bg-black"
    >
      {project.poster && (
        <Image
          src={project.poster.src}
          alt={project.poster.alt}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-contain"
        />
      )}

      {previewSrc && (
        // object-contain: la pieza se ve entera, nunca recortada.
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className={`absolute inset-0 size-full object-contain transition-opacity duration-300 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {project.logo && (
        <Image
          src={project.logo.src}
          alt=""
          width={project.logo.width}
          height={project.logo.height}
          sizes="44px"
          className="absolute top-2.5 right-2.5 size-8 rounded-lg object-cover md:top-3 md:right-3 md:size-11"
        />
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pt-16 pb-3 md:px-4 md:pb-4">
        <h3 className="font-serif text-[clamp(1.35rem,2.1vw,2.1rem)] leading-[1.05] text-white transition-colors group-hover:text-gold">
          {project.title}
        </h3>
        <p className="mt-1.5 text-xs leading-snug text-white/75">
          {project.category} · {project.year}
        </p>
      </div>
    </Link>
  );
}
