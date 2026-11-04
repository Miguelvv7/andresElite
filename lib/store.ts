import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { unstable_cache } from "next/cache";
import { head, put } from "@vercel/blob";
import type { Project } from "./types";

const LOCAL_FILE = join(process.cwd(), "content", "projects.json");
const BLOB_PATH = "cms/projects.json";
export const PROJECTS_TAG = "projects";

export const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** En producción sin Blob el sistema de archivos es de solo lectura. */
export const canWrite = () => hasBlob() || process.env.NODE_ENV !== "production";

async function readLocal(): Promise<Project[]> {
  return JSON.parse(await readFile(LOCAL_FILE, "utf8"));
}

async function readAll(): Promise<Project[]> {
  if (!hasBlob()) return readLocal();
  let url: string;
  try {
    url = (await head(BLOB_PATH)).url;
  } catch (error) {
    // Primer arranque: aún no se ha guardado nada en Blob.
    if (error instanceof Error && error.name === "BlobNotFoundError") return readLocal();
    throw error;
  }
  const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo leer el catálogo (${res.status})`);
  return res.json();
}

const byOrder = (a: Project, b: Project) => a.order - b.order;

// Solo se cachea Blob, que es una llamada de red. Esta caché sobrevive entre
// compilaciones, así que el archivo local se lee siempre para no servir datos antiguos.
const cachedBlob = unstable_cache(readAll, ["projects-all"], { tags: [PROJECTS_TAG] });

export async function getPublishedProjects(): Promise<Project[]> {
  const all = await (hasBlob() ? cachedBlob() : readLocal());
  return all.filter((p) => p.published).sort(byOrder);
}

export async function getPublishedProject(slug: string) {
  const all = await getPublishedProjects();
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  return { project: all[index], next };
}

/** Lectura sin caché para el panel, con borradores incluidos. */
export async function getAllProjectsForAdmin(): Promise<Project[]> {
  return (await readAll()).sort(byOrder);
}

export async function saveAllProjects(projects: Project[]) {
  const body = JSON.stringify(projects, null, 2) + "\n";
  if (hasBlob()) {
    await put(BLOB_PATH, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Falta BLOB_READ_WRITE_TOKEN: en producción no se puede guardar.");
  }
  await writeFile(LOCAL_FILE, body);
}
