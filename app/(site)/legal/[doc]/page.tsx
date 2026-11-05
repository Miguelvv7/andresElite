import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Textos legales aportados por el titular.
type Section = { heading: string; body: string[]; list?: string[]; after?: string[] };

const docs: Record<string, { title: string; updated?: string; sections: Section[] }> = {
  "aviso-legal": {
    title: "Aviso legal",
    updated: "Última actualización: noviembre de 2026",
    sections: [
      {
        heading: "1. Datos identificativos",
        body: ["En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos:"],
        list: [
          "Titular: Andrés Ruiz Prat",
          "Nombre comercial: Andrés Ruiz Élite",
          "Correo electrónico: andresruiz.elite@gmail.com",
          "Teléfono: +34 644 38 48 06",
          "Sitio web: elitefilms.es",
        ],
      },
      {
        heading: "2. Objeto",
        body: ["El presente sitio web tiene como finalidad presentar los servicios profesionales de Andrés Ruiz en el ámbito de la producción audiovisual, filmmaking, fotografía, creación de contenido y gestión de redes sociales para empresas, marcas y creadores."],
      },
      {
        heading: "3. Condiciones de uso",
        body: [
          "El acceso y navegación por este sitio web atribuye la condición de usuario e implica la aceptación de las condiciones recogidas en este aviso legal.",
          "El usuario se compromete a utilizar la web de forma responsable, legal y respetuosa, evitando cualquier actividad que pueda perjudicar su funcionamiento o los derechos de terceros.",
        ],
      },
      {
        heading: "4. Propiedad intelectual e industrial",
        body: [
          "Todos los contenidos de esta página web, incluyendo fotografías, vídeos, diseños, textos, logotipos, elementos gráficos y demás materiales audiovisuales, están protegidos por la normativa de propiedad intelectual e industrial.",
          "Queda prohibida su reproducción, distribución, modificación o utilización sin autorización expresa del titular, salvo en los casos legalmente permitidos.",
        ],
      },
      {
        heading: "5. Responsabilidad",
        body: [
          "El titular no se hace responsable del uso indebido que los usuarios puedan realizar de los contenidos de la web, ni de posibles interrupciones técnicas, errores o incidencias ajenas a su control.",
          "Asimismo, no se responsabiliza de los contenidos o políticas de privacidad de páginas web externas a las que se pueda acceder mediante enlaces.",
        ],
      },
      {
        heading: "6. Enlaces externos",
        body: [
          "Este sitio web puede incluir enlaces a plataformas externas, como Instagram, Facebook o WhatsApp, con el objetivo de facilitar la comunicación y mostrar trabajos realizados.",
          "El acceso a dichas plataformas se realiza bajo las condiciones y políticas propias de cada servicio.",
        ],
      },
      {
        heading: "7. Legislación aplicable",
        body: [
          "El presente aviso legal se rige por la legislación española y europea que resulte aplicable.",
          "Para cualquier controversia se estará a lo dispuesto por los juzgados y tribunales competentes conforme a la normativa vigente.",
        ],
      },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    updated: "Última actualización: noviembre de 2026",
    sections: [
      {
        heading: "1. Responsable del tratamiento",
        body: ["El responsable del tratamiento de los datos personales recogidos a través de este sitio web es:"],
        list: [
          "Responsable: Andrés Ruiz Prat",
          "Nombre comercial: Andrés Ruiz Élite",
          "Correo electrónico: andresruiz.elite@gmail.com",
          "Teléfono: +34 644 38 48 06",
        ],
      },
      {
        heading: "2. Datos personales que podemos recopilar",
        body: ["A través de esta página web podemos recoger los siguientes datos:"],
        list: [
          "Nombre y apellidos.",
          "Dirección de correo electrónico.",
          "Número de teléfono.",
          "Nombre del negocio, marca o empresa.",
          "Información facilitada voluntariamente a través de WhatsApp o correo electrónico.",
          "Cualquier otra información necesaria para atender consultas o prestar nuestros servicios.",
        ],
      },
      {
        heading: "3. Finalidad del tratamiento",
        body: ["Los datos personales podrán utilizarse para:"],
        list: [
          "Responder a consultas y solicitudes de información.",
          "Facilitar presupuestos personalizados.",
          "Gestionar la contratación de servicios audiovisuales y de redes sociales.",
          "Mantener la comunicación con clientes.",
          "Gestionar la relación comercial y administrativa.",
          "Enviar comunicaciones comerciales cuando exista una base legal que lo permita.",
        ],
      },
      {
        heading: "4. Legitimación",
        body: ["El tratamiento de los datos se realiza sobre las siguientes bases jurídicas:"],
        list: [
          "El consentimiento del usuario al contactar voluntariamente.",
          "La aplicación de medidas precontractuales cuando solicita un presupuesto.",
          "La ejecución de un contrato cuando contrata alguno de nuestros servicios.",
          "El cumplimiento de obligaciones legales aplicables.",
        ],
      },
      {
        heading: "5. Conservación de los datos",
        body: [
          "Los datos personales se conservarán durante el tiempo necesario para cumplir la finalidad para la que fueron recogidos.",
          "Cuando exista una relación comercial, se conservarán durante su vigencia y, posteriormente, durante los plazos exigidos por la legislación aplicable.",
          "Los datos utilizados para comunicaciones comerciales se conservarán hasta que el usuario retire su consentimiento o se oponga a recibirlas, cuando corresponda.",
        ],
      },
      {
        heading: "6. Cesión de datos a terceros",
        body: [
          "Los datos personales no se venderán ni cederán a terceros con fines comerciales.",
          "Podrán tener acceso a ellos proveedores tecnológicos o profesionales que presten servicios necesarios para el funcionamiento de la actividad, como servicios de alojamiento web, correo electrónico o gestión de comunicaciones, siempre bajo las garantías legales correspondientes.",
          "También podrán comunicarse a las administraciones públicas cuando exista una obligación legal.",
        ],
      },
      {
        heading: "7. Derechos de los usuarios",
        body: ["El usuario puede ejercer en cualquier momento los siguientes derechos:"],
        list: [
          "Acceso a sus datos personales.",
          "Rectificación de datos incorrectos.",
          "Supresión de sus datos.",
          "Limitación del tratamiento.",
          "Oposición al tratamiento.",
          "Portabilidad de sus datos.",
          "Retirada del consentimiento previamente otorgado.",
        ],
        after: [
          "Para ejercer estos derechos, puede enviar una solicitud a andresruiz.elite@gmail.com, indicando el derecho que desea ejercer y acreditando su identidad cuando sea necesario.",
          "Asimismo, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD), a través de www.aepd.es.",
        ],
      },
      {
        heading: "8. Seguridad de los datos",
        body: ["Se adoptarán las medidas técnicas y organizativas adecuadas para proteger los datos personales y evitar su pérdida, alteración, acceso no autorizado o tratamiento indebido."],
      },
      {
        heading: "9. Enlaces a terceros",
        body: [
          "Esta página web puede contener enlaces a servicios externos como Instagram, Facebook y WhatsApp.",
          "Al acceder a ellos, el usuario queda sujeto a las políticas de privacidad de dichas plataformas, que actúan conforme a sus propias condiciones.",
        ],
      },
      {
        heading: "10. Modificaciones de la política de privacidad",
        body: [
          "El titular se reserva el derecho de modificar esta política de privacidad cuando sea necesario para adaptarla a cambios legislativos, técnicos o relacionados con la actividad profesional.",
          "Cualquier modificación será publicada en esta misma página.",
        ],
      },
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
      {doc.updated && <p className="mt-5 text-sm text-ash">{doc.updated}</p>}
      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="eyebrow">{section.heading}</h2>
          <div className="mt-3 space-y-3 leading-relaxed text-bone/90">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.list && (
              <ul className="space-y-1.5">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="text-gold">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {section.after?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
