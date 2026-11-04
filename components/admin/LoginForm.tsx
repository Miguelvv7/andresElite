"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-8 grid gap-6">
      <div>
        <label htmlFor="password" className="eyebrow">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" autoFocus className="field" />
      </div>
      {error && <p role="alert" className="text-[#e7a697]">{error}</p>}
      <button disabled={pending} className="min-h-12 bg-bone font-semibold text-ink hover:bg-gold disabled:opacity-60">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
