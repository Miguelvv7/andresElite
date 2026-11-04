import type { Metadata } from "next";

// La sesión y las variables de entorno se evalúan siempre en cada petición.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="gutter mx-auto min-h-svh max-w-4xl py-10">{children}</div>;
}
