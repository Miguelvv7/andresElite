"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

const POSTER_ALT = "Andrés Ruiz corriendo en una pista de atletismo";

export function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);
  // Una vez arranca, el vídeo sigue visible aunque se pause, en el fotograma actual.
  const [started, setStarted] = useState(false);
  const userPaused = useRef(false);

  // La fuente se asigna aquí para no descargar el vídeo cuando no se va a reproducir.
  function loadSource(el: HTMLVideoElement) {
    if (el.getAttribute("src")) return;
    // iOS exige que esté silenciado antes de cargar para permitir autoplay.
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    const landscape = window.matchMedia("(min-aspect-ratio: 1/1)").matches;
    el.src = landscape ? "/media/hero/hero-desktop.mp4" : "/media/hero/hero-mobile.mp4";
    el.load();
  }

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    setAvailable(true);

    // Sin autoplay si la persona pide menos movimiento o ahorro de datos:
    // se queda el póster y puede arrancarlo con el botón.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reducedMotion || saveData) return;

    loadSource(el);
    el.autoplay = true;

    let inView = true;
    const play = () => {
      if (!inView || userPaused.current || !el.paused) return;
      el.play().catch(() => setPlaying(false));
    };
    play();

    // iOS puede rechazar el primer intento (modo de bajo consumo, navegadores dentro
    // de otras apps): se reintenta con los datos listos y con el primer gesto.
    const gestures = ["touchend", "click", "keydown"] as const;
    for (const type of gestures) window.addEventListener(type, play, { passive: true });
    el.addEventListener("canplay", play);
    window.addEventListener("pageshow", play);
    document.addEventListener("visibilitychange", play);

    // Ahorra batería: no reproducir fuera de vista.
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) play();
      else el.pause();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      for (const type of gestures) window.removeEventListener(type, play);
      el.removeEventListener("canplay", play);
      window.removeEventListener("pageshow", play);
      document.removeEventListener("visibilitychange", play);
    };
  }, []);

  function toggle() {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      loadSource(el);
      el.play().catch(() => setPlaying(false));
    } else {
      userPaused.current = true;
      el.pause();
    }
  }

  return (
    <section aria-label="Portada" className="relative h-svh min-h-[20rem] w-full overflow-hidden bg-ink">

      {/* Siempre visible, bajo el póster: iOS no reproduce lo que considera oculto */}
      <video
        ref={video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 size-full object-cover object-center"
      />

      <picture>
        <source media="(min-aspect-ratio: 1/1)" srcSet="/media/hero/poster-desktop.avif" type="image/avif" />
        <source media="(min-aspect-ratio: 1/1)" srcSet="/media/hero/poster-desktop.webp" type="image/webp" />
        <source srcSet="/media/hero/poster-mobile.avif" type="image/avif" />
        <img
          src="/media/hero/poster-mobile.webp"
          alt={POSTER_ALT}
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-700 ${
            started ? "opacity-0" : "opacity-100"
          }`}
        />
      </picture>

      {/* Degradados sutiles para la cabecera y el texto */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 to-transparent" />

      <div className="gutter hero-text absolute inset-x-0 top-[58%] -translate-y-1/2 text-center text-white md:top-[56%]">
        <p className="text-[clamp(0.95rem,4.1vw,1.25rem)] font-semibold tracking-[-0.005em]">
          ANDRÉS RUIZ | ELITE FILMS®
        </p>
        <h1 className="hero-title mt-3 md:mt-4">
          CREO VÍDEOS
          <br className="md:hidden" /> DE CINE
          <br className="hidden md:block" /> PARA
          <br className="md:hidden" /> QUE TU EMPRESA
          <br /> DESTAQUE:
        </h1>
        <p className="mt-4 text-[clamp(0.9rem,3.8vw,1.25rem)] font-semibold tracking-[0.01em] md:mt-5">
          NEGOCIOS | MARCAS | CREADORES
        </p>
      </div>

      <a
        href="#sobre-mi"
        aria-label="Ir a la siguiente sección"
        className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 grid size-14 -translate-x-1/2 place-items-center text-white transition-colors hover:text-gold"
      >
        <svg aria-hidden="true" width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="3.2">
          <path d="M6 6l17 17M24 8v15.5H8.5" />
        </svg>
      </a>

      {available && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar vídeo de portada" : "Reproducir vídeo de portada"}
          className="absolute right-[max(0.5rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))] grid size-11 place-items-center text-white/70 transition-colors hover:text-gold md:right-7"
        >
          {playing ? (
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M2 1h3v12H2zM9 1h3v12H9z" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1l10 6-10 6z" />
            </svg>
          )}
        </button>
      )}
    </section>
  );
}
