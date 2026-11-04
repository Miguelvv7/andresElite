import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { requireAdmin } from "@/lib/auth";
import { isMuxConfigured } from "@/lib/mux";
import { getAllProjectsForAdmin } from "@/lib/store";
import type { Project } from "@/lib/types";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const all = await getAllProjectsForAdmin();

  const empty: Project = {
    id: "",
    slug: "",
    title: "",
    category: "",
    year: new Date().getFullYear(),
    description: "",
    poster: null,
    video: { provider: "none" },
    gallery: [],
    published: false,
    order: all.reduce((max, p) => Math.max(max, p.order), 0) + 1,
  };

  const project = id === "nuevo" ? empty : all.find((p) => p.id === id);
  if (!project) notFound();

  return <ProjectEditor initial={project} muxEnabled={isMuxConfigured()} />;
}
