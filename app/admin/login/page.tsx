import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdminConfigured, isAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");
  return (
    <main className="mx-auto mt-[18svh] max-w-sm">
      <h1 className="font-serif text-5xl">Panel privado</h1>
      {isAdminConfigured() ? (
        <LoginForm />
      ) : (
        <p role="alert" className="mt-6 text-ash">
          El panel está desactivado. Define <code>ADMIN_PASSWORD</code> y <code>ADMIN_SESSION_SECRET</code> (mínimo 32
          caracteres) en las variables de entorno del servidor.
        </p>
      )}
    </main>
  );
}
