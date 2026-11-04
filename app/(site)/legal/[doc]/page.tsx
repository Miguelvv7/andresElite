import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Estructura preparada: los datos legales los debe aportar el titular.
// No publicar en producción hasta completar los campos pendientes.
const docs: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  "aviso-legal": {
    title: "Aviso legal",
    sections: [
      { heading: "Titular", body: "[PENDIENTE: nombre o razón social, NIF, domicilio y correo de contacto]" },
      { heading: "Propiedad intelectual", body: "Las imágenes y vídeos de esta web pertenecen a sus respectivos titulares. No se permite su reproducción sin autorización." },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    sections: [
      { heading: "Responsable", body: "[PENDIENTE: nombre o razón social, NIF, domicilio y correo de contacto]" },
      { heading: "Datos y finalidad", body: "El formulario de contacto recoge nombre, email, empresa o marca, tipo de proyecto y mensaje, con la única finalidad de responder a tu consulta." },
      { heading: "Conservación y proveedores", body: "[PENDIENTE: plazo de conservación y proveedores de correo y alojamiento finalmente contratados]" },
      { heading: "Derechos", body: "[PENDIENTE: dirección para ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad]" },
    ],
  },
};

type Props = { params: Promise<{ doc: string }> };

export const generateStaticParams = () => Object.keys(docs).map((doc) => ({ doc }));
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = docs[(await params).doc];
  return { title: doc?.title, robots: { index: false } };
}

export default async function LegalPage({ params }: Props) {
  const doc = docs[(await params).doc];
  if (!doc) notFound();
  return (
    <article className="gutter mx-auto max-w-3xl pt-[calc(env(safe-area-inset-top)+7rem)] pb-24 md:pt-40">
      <h1 className="font-serif text-[clamp(2.75rem,10vw,5rem)] leading-none">{doc.title}</h1>
      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="eyebrow">{section.heading}</h2>
          <p className="mt-3 leading-relaxed text-bone/90">{section.body}</p>
        </section>
      ))}
    </article>
  );
}
