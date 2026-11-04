# ANDRÉS RUIZ | ELITE FILMS®

Portfolio audiovisual, mobile first. Next.js (App Router), React, TypeScript y Tailwind CSS.

## Arrancar

```bash
npm install
cp .env.example .env.local   # opcional: la web arranca sin servicios
npm run dev                  # http://localhost:3000
```

Producción: `npm run build && npm start`. Comprobación de tipos: `npm run lint`.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `app/(site)` | Inicio, `/sobre-mi`, `/filmmaking`, `/filmmaking/[slug]`, `/shooting`, `/tarifas`, `/contacto` y legales |
| `app/admin` | Panel privado |
| `app/api` | Formulario de contacto, subida de imágenes y Mux |
| `components` | Interfaz |
| `content/projects.json` | Catálogo inicial de proyectos |
| `content/shooting.json` | Galería de Shooting |
| `content/pricing.json` | Secciones, precios e imágenes de Tarifas |
| `content/about.json` | Etiquetas y ciudad de Sobre mí |
| `content/media-manifest.json` | Relación entre cada original y su versión web |
| `scripts/process-media.mjs` | Genera las versiones web desde los originales |
| `public/media` | Solo versiones optimizadas; nunca másteres |

## Añadir material desde `fotos/video`

Finder muestra la carpeta como `fotos/video`; en terminal se llama `fotos:video`. Los originales no se modifican y están fuera de git.

- **Regenerar todo:** `npm run media` (requiere ffmpeg). Con `npm run media video` o `npm run media images` se limita a una parte.
- **Fotos de Shooting:** añade el archivo a la lista `PHOTOS` del script, ejecútalo y crea su entrada en `content/shooting.json` con dimensiones y texto alternativo.
- **Cambiar el vídeo de portada:** edita `FILM` en el script. La exposición se ajusta en `GRADE`, y el encuadre por plano para pantallas horizontales en `SHOTS`.
- **Proyectos:** desde el panel; o, sin él, en `content/projects.json`.
- **Carpeta `proyectos/`:** cada subcarpeta guarda el máster y el logo de un cliente, fuera de git. Para añadir una, créala con esos dos archivos, añádela a `PROJECTS` en el script con los segundos de sus fotogramas (sin subtítulos), ejecuta `npm run media projects` y crea su entrada en `content/projects.json`.
- **Si reemplazas una imagen conservando el nombre:** borra `.next/cache/images` para que el optimizador no sirva la anterior.

Cada proyecto sigue el esquema de `lib/types.ts`: `id`, `slug`, `title`, `category`, `year`, `client?`, `role?`, `description`, `poster`, `video`, `gallery`, `credits?`, `published`, `order`.

## Variables de entorno

Todas están en `.env.example`. Si falta alguna, ese servicio queda desactivado y lo indica; nada se simula.

| Servicio | Variables | Sin configurar |
| --- | --- | --- |
| SEO | `NEXT_PUBLIC_SITE_URL` | Los enlaces absolutos apuntan a localhost |
| Formulario (Resend) | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Avisa de que el mensaje no se ha enviado y lo conserva |
| Panel | `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (mínimo 32 caracteres) | `/admin` desactivado |
| Almacenamiento (Vercel Blob) | `BLOB_READ_WRITE_TOKEN` | En producción no se puede guardar; en local escribe en disco |
| Streaming (Mux) | `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` | Subida de vídeo desactivada |

## Streaming 4K con Mux

1. Crea una cuenta en Mux y un Access Token con permiso **Mux Video**.
2. Define `MUX_TOKEN_ID` y `MUX_TOKEN_SECRET`.
3. En `/admin`, abre el proyecto, elige el formato (16:9 o 9:16) y sube el máster. Va directo del navegador a Mux con una URL autorizada de un solo uso.
4. Guarda el proyecto. Cuando el estado pase a `ready`, guárdalo otra vez: el reproductor pasa a usar HLS adaptativo.

Las subidas piden `video_quality: premium` y `max_resolution_tier: 2160p`. Es un tope, no una garantía: 2160p solo existe si el máster, el plan y el dispositivo lo permiten. El selector de calidad de Mux Player muestra únicamente lo disponible. Comprueba precios y límites de tu plan en Mux antes de subir.

## Panel privado

`/admin` usa una contraseña y una sesión firmada en una cookie `httpOnly`, con límite de intentos. Permite crear, editar, publicar y borrar proyectos, subir portadas y galería (máximo 4 MB por imagen) y vídeo.

El catálogo guardado en Blob es un JSON en una URL pública difícil de adivinar pero no protegida: **no pongas en un borrador nada que deba ser secreto**. La galería de Shooting se edita en `content/shooting.json`, no en el panel.

## Despliegue en Vercel

1. Sube el proyecto a un repositorio e impórtalo en Vercel.
2. Crea un Blob Store público en el proyecto, lo que añade `BLOB_READ_WRITE_TOKEN`.
3. Define el resto de variables y despliega.

Los límites antiabuso (formulario y login) son en memoria por instancia: frenan abusos simples, no ataques distribuidos. Si llega spam real, añade Cloudflare Turnstile.

## Antes de publicar

- Rellena los campos `[PENDIENTE]` de `app/(site)/legal/[doc]/page.tsx`.
- **Tarifas:** los precios y lo que incluye cada paquete son inventados; sustitúyelos en `content/pricing.json` por los reales.
- Confirma los datos de `content/projects.json`: títulos, categorías, años y descripciones son provisionales; falta el rol de Andrés en cada pieza.
- Mide Core Web Vitals en el dominio real: LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1 son objetivos, no resultados medidos.
