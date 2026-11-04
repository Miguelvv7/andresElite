"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { getAllProjectsForAdmin, PROJECTS_TAG, saveAllProjects } from "@/lib/store";
import type { Project } from "@/lib/types";

export async function login(_: string | null, form: FormData) {
  if (isRateLimited(`login:${clientIp(await headers())}`, 8, 15 * 60 * 1000)) {
    return "Demasiados intentos. Espera 15 minutos.";
  }
  if (!checkPassword(String(form.get("password") ?? ""))) return "Contraseña incorrecta.";
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

function refreshSite() {
  updateTag(PROJECTS_TAG);
  revalidatePath("/", "layout");
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function validate(project: Project, all: Project[]) {
  if (!project.title.trim()) return "El título es obligatorio.";
  if (!SLUG.test(project.slug)) return "El slug solo admite minúsculas, números y guiones.";
  if (all.some((p) => p.slug === project.slug && p.id !== project.id)) return "Ya existe un proyecto con ese slug.";
  if (!Number.isInteger(project.year) || project.year < 1900 || project.year > 2100) return "Año no válido.";
  if (project.published) {
    if (!project.category.trim()) return "Para publicar, indica la categoría.";
    if (!project.description.trim()) return "Para publicar, escribe una descripción.";
    if (!project.poster) return "Para publicar, añade una portada.";
    if (project.poster && !project.poster.alt.trim()) return "Describe la portada (texto alternativo).";
  }
  return null;
}

export async function saveProject(project: Project): Promise<{ error?: string; id?: string }> {
  await requireAdmin();
  const all = await getAllProjectsForAdmin();
  const record: Project = { ...project, id: project.id || randomUUID() };
  const error = validate(record, all);
  if (error) return { error };

  const exists = all.some((p) => p.id === record.id);
  try {
    await saveAllProjects(exists ? all.map((p) => (p.id === record.id ? record : p)) : [...all, record]);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo guardar." };
  }
  refreshSite();
  return { id: record.id };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const all = await getAllProjectsForAdmin();
  await saveAllProjects(all.filter((p) => p.id !== id));
  refreshSite();
  redirect("/admin");
}
