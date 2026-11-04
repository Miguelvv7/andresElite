import Link from "next/link";

export default function NotFound() {
  return (
    <main className="gutter flex min-h-svh flex-col items-start justify-center">
      <p className="eyebrow">404</p>
      <h1 className="display-serif mt-4">Fuera de plano.</h1>
      <Link href="/" className="link-gold mt-8 inline-flex min-h-11 items-center font-medium">
        Volver al inicio
      </Link>
    </main>
  );
}
