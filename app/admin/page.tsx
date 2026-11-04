import Link from "next/link";
import { logout } from "./actions";
import { requireAdmin } from "@/lib/auth";
import { isMuxConfigured } from "@/lib/mux";
import { canWrite, getAllProjectsForAdmin, hasBlob } from "@/lib/store";

const videoLabel = (p: Awaited<ReturnType<typeof getAllProjectsForAdmin>>[number]) => {
  if (p.video.provider === "local") return "Vídeo local (demo)";
  if (p.video.provider === "mux") return `Mux: ${p.video.status}`;
  return "Sin vídeo";
};

export default async function AdminPage() {
  await requireAdmin();
  const projects = await getAllProjectsForAdmin();

  return (
    <main>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-5xl">Proyectos</h1>
        <div className="flex items-center gap-4">
          <form action={logout}>
            <button className="min-h-11 text-sm text-ash hover:text-bone">Salir</button>
          </form>
          <Link href="/admin/proyectos/nuevo" className="inline-flex min-h-11 items-center bg-bone px-5 text-sm font-semibold text-ink hover:bg-gold">
            Nuevo proyecto
          </Link>
        </div>
      </header>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ash">
        <li>Almacenamiento: {hasBlob() ? "Vercel Blob" : canWrite() ? "archivo local (desarrollo)" : "sin configurar: solo lectura"}</li>
        <li>Streaming: {isMuxConfigured() ? "Mux conectado" : "Mux sin configurar"}</li>
      </ul>

      <ul className="mt-8 divide-y divide-carbon border-y border-carbon">
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/proyectos/${p.id}`} className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3 hover:text-gold">
              <span className="font-serif text-2xl">{p.order}. {p.title}</span>
              <span className="text-xs text-ash">{p.published ? "Publicado" : "Borrador"} · {videoLabel(p)}</span>
            </Link>
          </li>
        ))}
        {projects.length === 0 && <li className="py-6 text-ash">Todavía no hay proyectos.</li>}
      </ul>
    </main>
  );
}
