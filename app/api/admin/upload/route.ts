import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAuthenticated } from "@/lib/auth";
import { canWrite, hasBlob } from "@/lib/store";

const MAX_BYTES = 4 * 1024 * 1024; // límite práctico de las funciones de Vercel

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  if (!canWrite()) return NextResponse.json({ message: "Falta configurar BLOB_READ_WRITE_TOKEN." }, { status: 503 });

  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "No se ha recibido ningún archivo." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ message: "La imagen supera los 4 MB." }, { status: 413 });

  // Se recodifica siempre: confirma que es una imagen y elimina metadatos (GPS, etc.).
  let output: { data: Buffer; info: { width: number; height: number } };
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .flatten({ background: "#050505" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return NextResponse.json({ message: "El archivo no es una imagen válida." }, { status: 415 });
  }

  const name = `${randomUUID()}.jpg`;
  let src: string;
  if (hasBlob()) {
    src = (await put(`cms/images/${name}`, output.data, { access: "public", contentType: "image/jpeg" })).url;
  } else {
    const dir = join(process.cwd(), "public", "media", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), output.data);
    src = `/media/uploads/${name}`;
  }

  return NextResponse.json({ src, width: output.info.width, height: output.info.height });
}
