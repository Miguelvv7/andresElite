"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { projectTypes, site } from "@/lib/site";

type Errors = Partial<Record<"name" | "email" | "type" | "message", string>>;
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const inputs = {
  label: "mb-1 block text-xs font-medium tracking-[0.12em] text-ash uppercase",
  error: "mt-2 text-sm text-[#e7a697]",
};

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const startedAt = useRef(Date.now());

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setErrors({});
    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, elapsedMs: Date.now() - startedAt.current }),
      });
      const body = (await res.json().catch(() => ({}))) as { errors?: Errors; message?: string };

      if (res.ok) {
        form.reset();
        setStatus({ kind: "sent" });
        return;
      }
      if (body.errors) {
        setErrors(body.errors);
        setStatus({ kind: "idle" });
        form.querySelector<HTMLElement>(`[name="${Object.keys(body.errors)[0]}"]`)?.focus();
        return;
      }
      setStatus({ kind: "error", message: body.message || "No se ha podido enviar. Inténtalo de nuevo." });
    } catch {
      setStatus({ kind: "error", message: "Sin conexión. Tu mensaje sigue aquí: inténtalo de nuevo." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div role="status" className="border-t border-gold-dim pt-8">
        <p className="font-serif text-4xl leading-tight">Mensaje enviado.</p>
        <p className="mt-3 text-ash">Gracias. Te responderé lo antes posible.</p>
        <button type="button" onClick={() => setStatus({ kind: "idle" })} className="link-gold mt-6 min-h-11 text-sm font-medium">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const field = (name: keyof Errors) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 md:grid-cols-2 md:gap-x-10">
      <div>
        <label htmlFor="name" className={inputs.label}>Nombre</label>
        <input id="name" name="name" required maxLength={120} autoComplete="name" className="field" {...field("name")} />
        {errors.name && <p id="name-error" className={inputs.error}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className={inputs.label}>Email</label>
        <input id="email" name="email" type="email" inputMode="email" required maxLength={200} autoComplete="email" className="field" {...field("email")} />
        {errors.email && <p id="email-error" className={inputs.error}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="company" className={inputs.label}>Empresa / marca</label>
        <input id="company" name="company" maxLength={160} autoComplete="organization" className="field" />
      </div>

      <div>
        <label htmlFor="type" className={inputs.label}>Tipo de proyecto</label>
        <select id="type" name="type" required defaultValue="" className="field" {...field("type")}>
          <option value="" disabled>Selecciona una opción</option>
          {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        {errors.type && <p id="type-error" className={inputs.error}>{errors.type}</p>}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="message" className={inputs.label}>Mensaje</label>
        <textarea id="message" name="message" required rows={5} maxLength={4000} className="field resize-y" {...field("message")} />
        {errors.message && <p id="message-error" className={inputs.error}>{errors.message}</p>}
      </div>

      {/* Trampa antispam: invisible para personas */}
      <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
        <label htmlFor="website">No rellenes este campo</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="min-h-14 w-full bg-bone px-8 text-sm font-semibold tracking-[0.08em] text-ink transition-colors hover:bg-gold disabled:opacity-60 md:w-auto"
        >
          {status.kind === "sending" ? "ENVIANDO…" : "ENVIAR PROYECTO ↗"}
        </button>

        <div aria-live="assertive">
          {status.kind === "error" && (
            <p className="mt-5 text-[#e7a697]">
              {status.message}{" "}
              <a href={site.instagram} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                Escríbeme por Instagram
              </a>
              .
            </p>
          )}
        </div>

        <p className="mt-6 max-w-xl text-xs leading-relaxed text-ash">
          Al enviar, tus datos se usan solo para responder a tu consulta. Más información en la{" "}
          <Link href="/legal/privacidad" className="underline underline-offset-4">política de privacidad</Link>.
        </p>
      </div>
    </form>
  );
}
