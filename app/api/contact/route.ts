import { NextResponse } from "next/server";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { projectTypes } from "@/lib/site";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_MS = 3000;

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: "Solicitud no válida." }, { status: 400 });

  // Sin saltos de línea en campos que acaban en el asunto.
  const name = text(body.name, 120).replace(/[\r\n]+/g, " ");
  const email = text(body.email, 200);
  const company = text(body.company, 160).replace(/[\r\n]+/g, " ");
  const type = text(body.type, 60);
  const message = text(body.message, 4000);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Escribe tu nombre.";
  if (!EMAIL.test(email)) errors.email = "Escribe un email válido.";
  if (!(projectTypes as readonly string[]).includes(type)) errors.type = "Elige un tipo de proyecto.";
  if (message.length < 10) errors.message = "Cuéntame algo más sobre tu proyecto.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  // Antispam, tras validar para que un formulario incompleto nunca parezca enviado.
  // A los bots se les responde como si nada, sin enviar correo.
  const looksLikeBot = Boolean(text(body.website, 200)) || Number(body.elapsedMs) < MIN_FILL_MS;
  if (looksLikeBot) return NextResponse.json({ ok: true });

  // Después de validar: corregir una errata no debe gastar intentos.
  if (isRateLimited(`contact:${clientIp(request.headers)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ message: "Demasiados envíos seguidos. Inténtalo más tarde." }, { status: 429 });
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error("Formulario de contacto sin configurar: faltan variables de Resend.");
    return NextResponse.json(
      { message: "El formulario todavía no está conectado y tu mensaje no se ha enviado." },
      { status: 503 },
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `Nuevo proyecto (${type}): ${name}`,
      text: [`Nombre: ${name}`, `Email: ${email}`, `Empresa / marca: ${company || "—"}`, `Tipo: ${type}`, "", message].join("\n"),
    }),
  }).catch(() => null);

  if (!res?.ok) {
    console.error("Resend no aceptó el mensaje", res?.status);
    return NextResponse.json({ message: "No se ha podido enviar. Inténtalo de nuevo en unos minutos." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
