"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ImageAsset, ProjectVideo, VideoAspect } from "@/lib/types";

// Mux Player y su HLS solo se descargan al pulsar reproducir.
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

const aspectClass = (aspect: VideoAspect) =>
  aspect === "9:16"
    ? "aspect-[9/16] w-full max-w-[min(100%,calc(85svh*9/16))]"
    : "aspect-video w-full";

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

export function VideoPlayer({ video, poster, title }: { video: ProjectVideo; poster: ImageAsset | null; title: string }) {
  if (video.provider === "local") return <LocalPlayer src={video.src} aspect={video.aspect} note={video.note} poster={poster} title={title} />;
  if (video.provider === "mux" && video.playbackId && video.status === "ready") {
    return <StreamPlayer playbackId={video.playbackId} aspect={video.aspect} poster={poster} title={title} />;
  }
  return null;
}

function PlayOverlay({ poster, title, onPlay }: { poster: ImageAsset | null; title: string; onPlay: () => void }) {
  return (
    <button type="button" onClick={onPlay} aria-label={`Reproducir ${title}`} className="group absolute inset-0 block size-full">
      {poster && <Image src={poster.src} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" priority className="object-cover" />}
      <span className="absolute inset-0 bg-black/20" />
      <span className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-bone/80 text-bone transition-colors group-hover:border-gold group-hover:text-gold">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1l10 6-10 6z" /></svg>
      </span>
    </button>
  );
}

function StreamPlayer({ playbackId, aspect, poster, title }: { playbackId: string; aspect: VideoAspect; poster: ImageAsset | null; title: string }) {
  const [started, setStarted] = useState(false);
  return (
    <figure className={`relative mx-auto bg-black ${aspectClass(aspect)}`}>
      {started ? (
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay
          playsInline
          poster={poster?.src}
          title={title}
          accentColor="#C6A667"
          primaryColor="#F5F3EE"
          secondaryColor="transparent"
          style={{ width: "100%", height: "100%", aspectRatio: aspect.replace(":", "/") }}
        />
      ) : (
        <PlayOverlay poster={poster} title={title} onPlay={() => setStarted(true)} />
      )}
    </figure>
  );
}

function LocalPlayer({ src, aspect, note, poster, title }: { src: string; aspect: VideoAspect; note?: string; poster: ImageAsset | null; title: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  // Se detiene al salir de la vista.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) el.pause();
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function start() {
    const el = video.current;
    if (!el) return;
    setStarted(true);
    setLoading(true);
    el.src = src; // preload real solo al pulsar
    el.play().catch(() => setLoading(false));
  }

  const toggle = () => {
    const el = video.current;
    if (el) void (el.paused ? el.play().catch(() => undefined) : el.pause());
  };

  function fullscreen() {
    const el = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (frame.current?.requestFullscreen) void frame.current.requestFullscreen();
    else el.webkitEnterFullscreen?.(); // iPhone
  }

  const progress = duration ? (time / duration) * 100 : 0;
  const control = "grid size-11 shrink-0 place-items-center text-bone transition-colors hover:text-gold";

  return (
    <figure className="mx-auto max-w-full" style={{ width: aspect === "9:16" ? "min(100%, calc(85svh * 9 / 16))" : "100%" }}>
      <div ref={frame} className="relative w-full bg-black" style={{ aspectRatio: aspect.replace(":", "/") }}>
        {/* object-contain: la pieza nunca se recorta dentro de su página */}
        <video
          ref={video}
          playsInline
          preload="none"
          aria-label={title}
          onClick={toggle}
          onPlaying={() => { setPlaying(true); setLoading(false); }}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
          onError={() => { if (started) { setFailed(true); setLoading(false); } }}
          className="size-full object-contain"
        />

        {!started && <PlayOverlay poster={poster} title={title} onPlay={start} />}

        {loading && (
          <span role="status" aria-label="Cargando vídeo" className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-bone/25 border-t-gold" />
        )}
        {failed && (
          <p role="alert" className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-sm">
            No se ha podido cargar el vídeo.
          </p>
        )}

        {started && !failed && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent px-1 pt-8 pb-[env(safe-area-inset-bottom)]">
            <button type="button" onClick={toggle} aria-label={playing ? "Pausar" : "Reproducir"} className={control}>
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 14 14" fill="currentColor">
                <path d={playing ? "M2 1h3v12H2zM9 1h3v12H9z" : "M3 1l10 6-10 6z"} />
              </svg>
            </button>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={time}
              aria-label="Progreso del vídeo"
              aria-valuetext={`${formatTime(time)} de ${formatTime(duration)}`}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (video.current) video.current.currentTime = value;
                setTime(value);
              }}
              className="player-range min-w-0 flex-1"
              style={{ "--progress": `${progress}%` } as React.CSSProperties}
            />
            <span className="shrink-0 px-1 text-xs tabular-nums text-bone">{formatTime(time)}</span>
            <button
              type="button"
              onClick={() => { if (video.current) video.current.muted = !video.current.muted; }}
              aria-label={muted ? "Activar sonido" : "Silenciar"}
              aria-pressed={muted}
              className={control}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 7v4h3l4 3V4L5 7H2z" fill="currentColor" stroke="none" />
                {muted ? <path d="M12 7l4 4M16 7l-4 4" /> : <path d="M12 6.5a3.5 3.5 0 010 5M14 4.5a6.5 6.5 0 010 9" />}
              </svg>
            </button>
            <button type="button" onClick={fullscreen} aria-label="Pantalla completa" className={control}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 5V1h4M11 1h4v4M15 11v4h-4M5 15H1v-4" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {note && <figcaption className="mt-3 text-xs text-ash">{note}</figcaption>}
    </figure>
  );
}
