"use client";

import { useEffect, useRef, useState } from "react";

const POSTER_ALT = "Andrés Ruiz corriendo en una pista de atletismo";

const SOURCES = { landscape: "/media/hero/hero-desktop.mp4", portrait: "/media/hero/hero-mobile.mp4" };

// Se ejecuta nada más leer el vídeo: sin autoplay si se pide menos movimiento o ahorro de datos.
const respectPreferences = `(function(){var v=document.currentScript.previousElementSibling;if(matchMedia('(prefers-reduced-motion: reduce)').matches||(navigator.connection&&navigator.connection.saveData)){v.removeAttribute('autoplay');v.autoplay=false;v.preload='none';v.pause();}})();`;

export function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);
  // Una vez arranca, el vídeo sigue visible aunque se pause, en el fotograma actual.
  const [started, setStarted] = useState(false);
  // Plan B si el sistema bloquea el vídeo: Safari reproduce un MP4 dentro de una imagen.
  const [imageFallback, setImageFallback] = useState<string | null>(null);
  const usingImage = useRef(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    setAvailable(true);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reducedMotion || saveData) return;

    let inView = true;
    const useImage = () => {
      if (usingImage.current || userPaused.current || !el.paused) return;
      usingImage.current = true;
      const landscape = window.matchMedia("(min-aspect-ratio: 1/1)").matches;
      setImageFallback(landscape ? SOURCES.landscape : SOURCES.portrait);
    };
    const play = () => {
      if (usingImage.current || !inView || userPaused.current || !el.paused) return;
      el.play().catch((error: DOMException) => {
        setPlaying(false);
        if (error.name === "NotAllowedError") useImage();
      });
    };
    play();

    // Por si el rechazo no llega como error: un vídeo aún parado a los 3 s está bloqueado.
    const watchdog = setTimeout(useImage, 3000);

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
      clearTimeout(watchdog);
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
    if (usingImage.current) {
      // La imagen no se puede pausar: se retira y el toque ya permite usar el vídeo.
      usingImage.current = false;
      setImageFallback(null);
      userPaused.current = true;
      setStarted(false);
      return;
    }
    if (el.paused) {
      userPaused.current = false;
      el.preload = "auto";
      el.play().catch(() => setPlaying(false));
    } else {
      userPaused.current = true;
      el.pause();
    }
  }

  const moving = playing || imageFallback !== null;

  return (
    <section aria-label="Portada" className="relative h-svh min-h-[20rem] w-full overflow-hidden bg-ink">
      {/* En el HTML desde el principio y siempre visible bajo el póster: es lo más fiable en iOS */}
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
      >
        <source media="(min-aspect-ratio: 1/1)" src={SOURCES.landscape} type="video/mp4" />
        <source src={SOURCES.portrait} type="video/mp4" />
      </video>
      <script dangerouslySetInnerHTML={{ __html: respectPreferences }} />

      {imageFallback && (
        <img
          src={imageFallback}
          alt=""
          aria-hidden="true"
          onLoad={() => setStarted(true)}
          onError={() => {
            usingImage.current = false;
            setImageFallback(null);
          }}
          className="absolute inset-0 size-full object-cover object-center"
        />
      )}

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
          aria-label={moving ? "Pausar vídeo de portada" : "Reproducir vídeo de portada"}
          className="absolute right-[max(0.5rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))] grid size-11 place-items-center text-white/70 transition-colors hover:text-gold md:right-7"
        >
          {moving ? (
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
