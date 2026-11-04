import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createDirectUpload, getUploadState, isMuxConfigured } from "@/lib/mux";

async function guard() {
  if (!(await isAuthenticated())) return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  if (!isMuxConfigured()) return NextResponse.json({ message: "Mux no está configurado." }, { status: 503 });
  return null;
}

/** Crea una URL de subida directa autorizada. */
export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const origin = request.headers.get("origin") || new URL(request.url).origin;
  try {
    const upload = await createDirectUpload(origin);
    return NextResponse.json({ uploadId: upload.id, url: upload.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Mux ha rechazado la subida." }, { status: 502 });
  }
}

/** Estado de procesamiento de una subida. */
export async function GET(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const uploadId = new URL(request.url).searchParams.get("uploadId");
  if (!uploadId) return NextResponse.json({ message: "Falta uploadId." }, { status: 400 });
  try {
    return NextResponse.json(await getUploadState(uploadId));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "No se pudo consultar Mux." }, { status: 502 });
  }
}
