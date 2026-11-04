"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";

export function ProjectTile({ project }: { project: Project }) {
  const frame = useRef<HTMLAnchorElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  // Plan B si el sistema bloquea el vídeo: Safari reproduce un MP4 dentro de una imagen.
  const [useImage, setUseImage] = useState(false);
  const [inView, setInView] = useState(false);

  const previewSrc = project.preview ?? (project.video.provider === "local" ? project.video.src : undefined);

  useEffect(() => {
    const el = video.current;
    const link = frame.current;
    if (!el || !link || !previewSrc) return;

    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    let blocked = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;

    const toImage = () => {
      if (!visible || !el.paused) return;
      blocked = true;
      setUseImage(true);
    };
    const play = () => {
      if (!visible || blocked || !el.paused) return;
      el.preload = "auto";
      el.play().catch((error: DOMException) => {
        if (error.name === "NotAllowedError") toImage();
      });
    };

    // Solo descarga y reproduce mientras la tarjeta está en pantalla.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        setInView(visible);
        clearTimeout(watchdog);
        if (visible) {
          play();
          // Por si el rechazo no llega como error: parado a los 3 s, está bloqueado.
          if (!blocked) watchdog = setTimeout(toImage, 3000);
        } else {
          el.pause();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(link);

    document.addEventListener("visibilitychange", play);
    window.addEventListener("pageshow", play);
    return () => {
      clearTimeout(watchdog);
      observer.disconnect();
      document.removeEventListener("visibilitychange", play);
      window.removeEventListener("pageshow", play);
    };
  }, [previewSrc]);

  return (
    <Link
      ref={frame}
      href={`/filmmaking/${project.slug}`}
      className="group relative block aspect-[9/16] overflow-hidden rounded-md bg-black"
    >
      {previewSrc && (
        // Siempre visible bajo el póster, porque iOS no reproduce lo que considera oculto.
        // object-contain: la pieza se ve entera, nunca recortada.
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setStarted(true)}
          className="absolute inset-0 size-full object-contain"
        >
          <source src={previewSrc} type="video/mp4" />
        </video>
      )}

      {useImage && inView && previewSrc && (
        <img
          src={previewSrc}
          alt=""
          aria-hidden="true"
          onLoad={() => setStarted(true)}
          onError={() => setUseImage(false)}
          className="absolute inset-0 size-full object-contain"
        />
      )}

      {project.poster && (
        <Image
          src={project.poster.src}
          alt={project.poster.alt}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className={`object-contain transition-opacity duration-500 ${started ? "opacity-0" : "opacity-100"}`}
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
