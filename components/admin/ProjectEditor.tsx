"use client";

import * as UpChunk from "@mux/upchunk";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { deleteProject, saveProject } from "@/app/admin/actions";
import type { ImageAsset, Project, VideoAspect } from "@/lib/types";
import { Arrow } from "@/components/Arrow";

async function uploadImage(file: File): Promise<ImageAsset> {
  const body = new FormData();
  body.set("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "No se pudo subir la imagen.");
  return { ...data, alt: "" };
}

const label = "eyebrow mb-1 block";
const ghost = "min-h-11 border border-carbon px-4 text-sm hover:border-gold-dim disabled:opacity-50";

export function ProjectEditor({ initial, muxEnabled }: { initial: Project; muxEnabled: boolean }) {
  const router = useRouter();
  const [project, setProject] = useState(initial);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [saving, startSaving] = useTransition();
  const [progress, setProgress] = useState<number | null>(null);
  const [aspect, setAspect] = useState<VideoAspect>(
    initial.video.provider === "none" ? "16:9" : initial.video.aspect,
  );

  const set = <K extends keyof Project>(key: K, value: Project[K]) =>
    setProject((p) => ({ ...p, [key]: value }));

  const fail = (error: unknown) =>
    setMessage({ tone: "error", text: error instanceof Error ? error.message : "Ha ocurrido un error." });

  // Consulta el procesamiento en Mux hasta que termina.
  const video = project.video;
  const pendingUpload = video.provider === "mux" && (video.status === "waiting" || video.status === "processing") ? video.uploadId : undefined;
  useEffect(() => {
    if (!pendingUpload) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/admin/mux?uploadId=${encodeURIComponent(pendingUpload)}`);
      if (!res.ok) return;
      const state = await res.json();
      setProject((p) => (p.video.provider === "mux" ? { ...p, video: { ...p.video, ...state } } : p));
    }, 5000);
    return () => clearInterval(timer);
  }, [pendingUpload]);

  async function startVideoUpload(file: File) {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/mux", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProgress(0);
      const upload = UpChunk.createUpload({ endpoint: data.url, file, chunkSize: 30720 });
      upload.on("progress", (e) => setProgress(Math.round(e.detail)));
      upload.on("error", (e) => {
        setProgress(null);
        setMessage({ tone: "error", text: `Error en la subida: ${e.detail.message}` });
      });
      upload.on("success", () => {
        setProgress(null);
        set("video", { provider: "mux", aspect, uploadId: data.uploadId, status: "waiting" });
        setMessage({ tone: "ok", text: "Vídeo subido. Mux lo está procesando; guarda el proyecto para no perder la referencia." });
      });
    } catch (error) {
      fail(error);
    }
  }

  async function onPoster(file?: File) {
    if (!file) return;
    try {
      set("poster", await uploadImage(file));
    } catch (error) {
      fail(error);
    }
  }

  async function onLogo(file?: File) {
    if (!file) return;
    try {
      set("logo", await uploadImage(file));
    } catch (error) {
      fail(error);
    }
  }

  async function onGallery(files: FileList | null) {
    if (!files) return;
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadImage));
      setProject((p) => ({ ...p, gallery: [...p.gallery, ...uploaded] }));
    } catch (error) {
      fail(error);
    }
  }

  function save() {
    setMessage(null);
    startSaving(async () => {
      const result = await saveProject(project);
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "ok", text: "Guardado." });
      if (!project.id && result.id) router.replace(`/admin/proyectos/${result.id}`);
      else router.refresh();
    });
  }

  return (
    <main>
      <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-ash hover:text-bone"><Arrow direction="left" className="mr-1.5" /> Proyectos</Link>
      <h1 className="mt-2 font-serif text-5xl">{project.title || "Nuevo proyecto"}</h1>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="title" className={label}>Título</label>
          <input id="title" className="field" value={project.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label htmlFor="slug" className={label}>Slug (URL)</label>
          <input id="slug" className="field" value={project.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} />
        </div>
        <div>
          <label htmlFor="category" className={label}>Categoría</label>
          <input id="category" className="field" value={project.category} onChange={(e) => set("category", e.target.value)} />
        </div>
        <div>
          <label htmlFor="year" className={label}>Año</label>
          <input id="year" type="number" className="field" value={project.year} onChange={(e) => set("year", Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor="client" className={label}>Cliente (opcional)</label>
          <input id="client" className="field" value={project.client ?? ""} onChange={(e) => set("client", e.target.value || undefined)} />
        </div>
        <div>
          <label htmlFor="role" className={label}>Rol (opcional)</label>
          <input id="role" className="field" value={project.role ?? ""} onChange={(e) => set("role", e.target.value || undefined)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className={label}>Descripción</label>
          <textarea id="description" rows={4} className="field" value={project.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label htmlFor="order" className={label}>Orden</label>
          <input id="order" type="number" className="field" value={project.order} onChange={(e) => set("order", Number(e.target.value))} />
        </div>
        <label className="flex min-h-11 items-center gap-3 self-end">
          <input type="checkbox" className="size-5 accent-[#c6a667]" checked={project.published} onChange={(e) => set("published", e.target.checked)} />
          Publicado
        </label>

        <section className="md:col-span-2">
          <h2 className={label}>Portada</h2>
          {project.poster && (
            <div className="mb-3 flex items-start gap-4">
              <Image src={project.poster.src} alt="" width={120} height={160} className="h-40 w-auto object-cover" />
              <div className="flex-1">
                <label htmlFor="poster-alt" className={label}>Texto alternativo</label>
                <input
                  id="poster-alt"
                  className="field"
                  value={project.poster.alt}
                  onChange={(e) => set("poster", { ...project.poster!, alt: e.target.value })}
                />
              </div>
            </div>
          )}
          <input type="file" accept="image/*" aria-label="Subir portada" className="min-h-11 text-sm" onChange={(e) => onPoster(e.target.files?.[0])} />
        </section>

        <section className="md:col-span-2">
          <h2 className={label}>Logo del cliente (opcional)</h2>
          {project.logo && (
            <div className="mb-3 flex items-start gap-4">
              <Image src={project.logo.src} alt="" width={80} height={80} className="size-20 rounded-xl object-cover" />
              <div className="flex-1">
                <label htmlFor="logo-alt" className={label}>Texto alternativo</label>
                <input id="logo-alt" className="field" value={project.logo.alt} onChange={(e) => set("logo", { ...project.logo!, alt: e.target.value })} />
                <button type="button" className="min-h-9 text-xs text-ash hover:text-bone" onClick={() => set("logo", undefined)}>Quitar</button>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" aria-label="Subir logo del cliente" className="min-h-11 text-sm" onChange={(e) => onLogo(e.target.files?.[0])} />
        </section>

        <section className="md:col-span-2">
          <h2 className={label}>Galería</h2>
          <ul className="mb-3 flex flex-wrap gap-3">
            {project.gallery.map((image, index) => (
              <li key={image.src} className="w-32">
                <Image src={image.src} alt="" width={128} height={180} className="h-40 w-32 object-cover" />
                <input
                  aria-label={`Texto alternativo de la imagen ${index + 1}`}
                  placeholder="Texto alternativo"
                  className="field !min-h-9 !py-1 !text-sm"
                  value={image.alt}
                  onChange={(e) => set("gallery", project.gallery.map((g, i) => (i === index ? { ...g, alt: e.target.value } : g)))}
                />
                <button type="button" className="min-h-9 text-xs text-ash hover:text-bone" onClick={() => set("gallery", project.gallery.filter((_, i) => i !== index))}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <input type="file" accept="image/*" multiple aria-label="Subir imágenes a la galería" className="min-h-11 text-sm" onChange={(e) => onGallery(e.target.files)} />
        </section>

        <section className="md:col-span-2">
          <h2 className={label}>Vídeo</h2>
          <p className="mb-3 text-sm text-ash">
            {video.provider === "none" && "Sin vídeo."}
            {video.provider === "local" && `Local de demostración: ${video.src}`}
            {video.provider === "mux" && `Mux · ${video.status}${video.maxResolution ? ` · hasta ${video.maxResolution}` : ""}`}
          </p>
          {muxEnabled ? (
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                Formato
                <select aria-label="Formato del vídeo" className="field !min-h-11 !w-24 !py-1" value={aspect} onChange={(e) => setAspect(e.target.value as VideoAspect)}>
                  <option>16:9</option>
                  <option>9:16</option>
                </select>
              </label>
              <input
                type="file"
                accept="video/*"
                aria-label="Subir vídeo a Mux"
                disabled={progress !== null}
                className="min-h-11 text-sm"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void startVideoUpload(f); }}
              />
              {progress !== null && <progress max={100} value={progress} aria-label="Progreso de la subida" className="w-full accent-[#c6a667]" />}
            </div>
          ) : (
            <p role="status" className="text-sm text-[#e7a697]">
              Subida desactivada: faltan <code>MUX_TOKEN_ID</code> y <code>MUX_TOKEN_SECRET</code>.
            </p>
          )}
        </section>
      </div>

      <div aria-live="polite" className="mt-8 min-h-6">
        {message && <p className={message.tone === "ok" ? "text-gold" : "text-[#e7a697]"}>{message.text}</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-carbon pt-6">
        <button type="button" onClick={save} disabled={saving || progress !== null} className="min-h-12 bg-bone px-8 font-semibold text-ink hover:bg-gold disabled:opacity-60">
          {saving ? "Guardando…" : "Guardar"}
        </button>
        {project.id && (
          <button
            type="button"
            className={ghost}
            onClick={() => {
              if (window.confirm(`¿Borrar «${project.title}» del catálogo? No se puede deshacer.`)) {
                startSaving(() => deleteProject(project.id));
              }
            }}
          >
            Borrar proyecto
          </button>
        )}
      </div>
    </main>
  );
}
