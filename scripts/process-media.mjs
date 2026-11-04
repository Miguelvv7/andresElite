#!/usr/bin/env node
// Genera todas las versiones web a partir de los originales de `fotos/video`,
// sin modificarlos. Requiere ffmpeg. Uso: npm run media
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
// Finder muestra `fotos/video`; en el sistema de archivos el nombre es `fotos:video`.
const source = ["fotos:video", "fotos/video"].map((d) => join(root, d)).find(existsSync);
if (!source) throw new Error("No se encuentra la carpeta fotos/video");

const out = (...p) => join(root, "public", "media", ...p);
for (const d of ["hero", "brand", "photos", "projects/en-pista"]) mkdirSync(out(d), { recursive: true });

const manifest = [];
const record = (original, output, use) => manifest.push({ original, output: output.replace(root + "/", ""), use });
const ffmpeg = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

const FILM = "IMG_9525.MOV";
const filmPath = join(source, FILM);

// Hero: la pieza entera, sin cortes y con un 5 % menos de exposición.
const GRADE = "curves=all='0/0 1/0.95'";
// Pantallas horizontales: pantalla completa en 16:9, con la pieza entera. El vídeo es
// vertical, así que `y` elige por plano qué franja se ve (altura 1215 sobre 3840).
const SHOTS = [
  { from: 0, to: 5.52, y: 480 },
  { from: 5.52, to: 6.64, y: 2300 },
  { from: 6.64, to: 9.6, y: 1350 },
  { from: 9.6, to: 11.32, y: 1050 },
  { from: 11.32, to: 12.1, y: 1400 },
  { from: 12.1, to: 13.12, y: 1000 },
  { from: 13.12, to: 15.68, y: 330 },
  { from: 15.68, to: 18.44, y: 560 },
];

function heroVideo(file, frame, crf, maxrate) {
  const encode = ["-an", "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", String(crf), "-maxrate", maxrate, "-bufsize", "8M", "-movflags", "+faststart", out("hero", file)];
  if (frame === "landscape") {
    const parts = SHOTS.map((s, i) => `[0:v]trim=${s.from}:${s.to},setpts=PTS-STARTPTS,crop=2160:1215:0:${s.y},scale=1920:1080,setsar=1[s${i}]`);
    const inputs = SHOTS.map((_, i) => `[s${i}]`).join("");
    ffmpeg("-i", filmPath, "-filter_complex", `${parts.join(";")};${inputs}concat=n=${SHOTS.length}:v=1:a=0,${GRADE},format=yuv420p[v]`, "-map", "[v]", ...encode);
  } else {
    ffmpeg("-i", filmPath, "-vf", `scale=720:1280,setsar=1,${GRADE},format=yuv420p`, ...encode);
  }
  record(FILM, out("hero", file), `Vídeo de portada (${frame})`);
}

async function heroPoster(name, filter, width) {
  const tmp = out("hero", `.${name}.png`);
  ffmpeg("-ss", "13.2", "-i", filmPath, "-frames:v", "1", "-vf", `${filter},${GRADE}`, tmp);
  await sharp(tmp).avif({ quality: 50 }).toFile(out("hero", `${name}.avif`));
  await sharp(tmp).webp({ quality: 72 }).toFile(out("hero", `${name}.webp`));
  record(FILM, out("hero", `${name}.avif`), `Poster de portada (${width}px)`);
  return tmp;
}

// Convierte un logo sobre negro en PNG/WebP con transparencia real:
// alfa = canal más brillante, y el color se recupera dividiendo por ese alfa.
async function logoWithAlpha(inputFile, { crop, width, white = false }) {
  const { data, info } = await sharp(join(source, inputFile))
    .extract(crop).resize({ width }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const alpha = max < 14 ? 0 : max;
    const k = alpha ? 255 / alpha : 0;
    rgba[j] = white ? 255 : Math.min(255, data[i] * k);
    rgba[j + 1] = white ? 255 : Math.min(255, data[i + 1] * k);
    rgba[j + 2] = white ? 255 : Math.min(255, data[i + 2] * k);
    rgba[j + 3] = alpha;
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } });
}

const PHOTOS = [
  ["IMG_7079.JPG", "londres-06"],
  ["IMG_6941.JPG", "londres-01"],
  ["IMG_7078.JPG", "londres-02"],
  ["IMG_7084.JPG", "londres-03"],
  ["IMG_6942.JPG", "londres-04"],
  ["IMG_7082.JPG", "londres-05"],
  ["DSC01500.JPG", "morelove-01"],
  ["DSC01531.JPG", "morelove-02"],
  ["DSC01114.JPG", "morelove-03"],
  ["DSC01412.JPG", "morelove-04"],
  ["DSC01465.JPG", "morelove-05"],
  ["DSC01341.JPG", "morelove-06"],
  ["DSC01439.JPG", "morelove-07"],
  ["DSC01451.JPG", "morelove-08"],
];

const SKY_RIGHT = 680;
const SKY_TOP = 170;

// Rellena el cielo nuevo con la media suavizada del borde de la foto, de modo que
// no aparezcan rayas, y añade un grano mínimo que evita las bandas de color.
async function extendSky(path) {
  const { data, info } = await sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const at = (x, y, c) => data[(y * w + x) * 3 + c];
  const smooth = (count, read, radius = 30) => Array.from({ length: count }, (_, i) => {
    const from = Math.max(0, i - radius), to = Math.min(count - 1, i + radius);
    const sum = [0, 0, 0];
    for (let k = from; k <= to; k++) for (let c = 0; c < 3; c++) sum[c] += read(k, c);
    return sum.map((v) => v / (to - from + 1));
  });
  const rightEdge = smooth(h, (y, c) => at(w - 1, y, c));
  const topEdge = smooth(w, (x, c) => at(x, 0, c));

  const width = w + SKY_RIGHT, height = h + SKY_TOP;
  const output = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const sy = y - SKY_TOP;
      if (x < w && sy >= 0) {
        for (let c = 0; c < 3; c++) output[i + c] = at(x, sy, c);
        continue;
      }
      const base = sy >= 0 ? rightEdge[sy] : x < w ? topEdge[x] : rightEdge[0];
      const grain = (Math.random() - 0.5) * 1.5;
      for (let c = 0; c < 3; c++) output[i + c] = Math.round(base[c] + grain);
    }
  }
  return { data: output, width, height };
}

const STILLS = [
  [4.9, "01-retrato"], [5.95, "02-cordones"], [7.6, "03-pista"],
  [10.4, "04-espalda"], [12.6, "05-frontal"], [14.2, "06-lateral"],
];

// Proyectos de la carpeta `proyectos/`: máster, logo y fotogramas sin subtítulos.
const PROJECTS = [
  { slug: "habanera", dir: "habanera", video: "IMG_8329.MOV", logo: "IMG_9530.JPG", stills: [[7, "poster"], [0.6, "01"], [1.6, "02"], [9.6, "03"], [10.6, "04"]] },
  { slug: "morelove", dir: "marcaropa", video: "IMG_9402.MOV", logo: "IMG_9528.JPG", stills: [[44, "poster"], [5.5, "01"], [26, "02"], [26.8, "03"], [47.7, "04"]] },
  { slug: "sema-con-s-tattoo", dir: "tatuador", video: "IMG_8303.MOV", logo: "IMG_9529.JPG", stills: [[43.5, "poster"], [22, "01"], [25, "02"], [46, "03"], [50, "04"]] },
];

const only = process.argv[2];

if (!only || only === "video") {
  heroVideo("hero-mobile.mp4", "portrait", 24, "2600k");
  heroVideo("hero-desktop.mp4", "landscape", 24, "5000k");

  // Versión web de la pieza completa, con sonido, para la página del proyecto
  // mientras no exista streaming en Mux. Nunca se sirve el máster.
  const film = out("projects", "en-pista", "film-1080.mp4");
  ffmpeg(
    "-i", filmPath, "-vf", "scale=1080:1920,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-maxrate", "6M", "-bufsize", "12M",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", film,
  );
  record(FILM, film, "Pieza completa 1080p (demostración local)");
}

if (!only || only === "projects") {
  for (const project of PROJECTS) {
    const master = join(root, "proyectos", project.dir, project.video);
    const origin = `proyectos/${project.dir}/${project.video}`;
    mkdirSync(out("projects", project.slug), { recursive: true });

    const film = out("projects", project.slug, "film-1080.mp4");
    ffmpeg(
      "-i", master, "-vf", "scale=1080:1920,format=yuv420p",
      "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-maxrate", "4500k", "-bufsize", "9M",
      "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", film,
    );
    record(origin, film, "Pieza completa 1080p (demostración local)");
    console.log(project.slug, (statSync(film).size / 1e6).toFixed(1) + " MB");

    for (const [time, name] of project.stills) {
      const tmp = out("projects", project.slug, `.${name}.png`);
      ffmpeg("-ss", String(time), "-i", master, "-frames:v", "1", "-vf", "scale=1440:2560", tmp);
      const target = out("projects", project.slug, `${name}.jpg`);
      await sharp(tmp).jpeg({ quality: 82, mozjpeg: true }).toFile(target);
      execFileSync("rm", [tmp]);
      record(origin, target, "Fotograma de la pieza");
    }

    const logoFile = `proyectos/${project.dir}/${project.logo}`;
    const logo = out("projects", project.slug, "logo.jpg");
    await sharp(join(root, logoFile)).resize(320, 320).jpeg({ quality: 88, mozjpeg: true }).toFile(logo);
    record(logoFile, logo, "Logo del cliente");
  }
}

const images = {};
if (!only || only === "images") {
  const tmpA = await heroPoster("poster-mobile", "scale=1080:1920", 1080);
  const tmpB = await heroPoster("poster-desktop", "crop=2160:1215:0:330,scale=1920:1080", 1920);

  // Logos
  const fullCrop = { left: 280, top: 380, width: 700, height: 460 };
  await (await logoWithAlpha("IMG_7647.PNG", { crop: fullCrop, width: 700 })).webp({ quality: 88, alphaQuality: 90 }).toFile(out("brand", "logo-full.webp"));
  record("IMG_7647.PNG", out("brand", "logo-full.webp"), "Logo oficial metálico (preloader)");

  const markCrop = { left: 225, top: 295, width: 565, height: 410 };
  await (await logoWithAlpha("IMG_7653.PNG", { crop: markCrop, width: 300, white: true })).png({ compressionLevel: 9 }).toFile(out("brand", "logo-mark.png"));
  record("IMG_7653.PNG", out("brand", "logo-mark.png"), "Monograma oficial blanco (cabecera)");

  // Iconos: monograma sobre negro.
  const iconSquare = { left: 170, top: 170, width: 660, height: 660 };
  for (const [size, file] of [[512, "icon.png"], [180, "apple-icon.png"]]) {
    await sharp(join(source, "IMG_7653.PNG")).extract(iconSquare).resize(size, size).flatten({ background: "#000" }).png({ compressionLevel: 9 }).toFile(join(root, "app", file));
    record("IMG_7653.PNG", join(root, "app", file), "Icono");
  }

  // Open Graph: fotograma real + logo.
  const logoOg = await (await logoWithAlpha("IMG_7647.PNG", { crop: fullCrop, width: 460 })).png().toBuffer();
  await sharp(tmpB).resize(1200, 630, { fit: "cover", position: "top" }).modulate({ brightness: 0.42 })
    .composite([{ input: logoOg, gravity: "center" }]).jpeg({ quality: 82, mozjpeg: true }).toFile(out("brand", "og.jpg"));
  record(FILM, out("brand", "og.jpg"), "Imagen Open Graph");

  // Fotografías: máximo 1800 px de ancho; next/image sirve AVIF/WebP por tamaño.
  for (const [file, name] of PHOTOS) {
    const target = out("photos", `${name}.jpg`);
    const info = await sharp(join(source, file)).rotate().resize({ width: 1800, withoutEnlargement: true })
      .flatten({ background: "#050505" }).jpeg({ quality: 84, mozjpeg: true }).toFile(target);
    images[name] = { src: `/media/photos/${name}.jpg`, width: info.width, height: info.height };
    record(file, target, "Fotografía");
  }

  // Sobre mí: en el retrato el sujeto está a la derecha y pegado al borde superior.
  // Se prolonga el cielo a la derecha y arriba para centrarlo, sin tocar a la persona.
  {
    const file = "Retrato deportivo con gafas doradas.png";
    const target = out("photos", "sobre-mi.jpg");
    const info = await sharp(await extendSky(join(source, file)).then(({ data, width, height }) =>
      sharp(data, { raw: { width, height, channels: 3 } }).png().toBuffer()))
      .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(target);
    images["sobre-mi"] = { src: "/media/photos/sobre-mi.jpg", width: info.width, height: info.height };
    record(file, target, "Retrato de Sobre mí, con el cielo ampliado");
  }

  // Fotogramas de la pieza para póster y galería del proyecto.
  for (const [time, name] of STILLS) {
    const tmp = out("projects", "en-pista", `.${name}.png`);
    ffmpeg("-ss", String(time), "-i", filmPath, "-frames:v", "1", "-vf", "scale=1440:2560", tmp);
    const target = out("projects", "en-pista", `${name}.jpg`);
    await sharp(tmp).jpeg({ quality: 82, mozjpeg: true }).toFile(target);
    execFileSync("rm", [tmp]);
    record(FILM, target, "Fotograma de la pieza");
  }
  execFileSync("rm", [tmpA, tmpB]);

  console.log(images);
}

// Solo una pasada completa conoce todos los archivos.
if (!only) {
  writeFileSync(join(root, "content", "media-manifest.json"), JSON.stringify({ note: "Generado por scripts/process-media.mjs. Relación original → versión web.", files: manifest }, null, 2) + "\n");
}

for (const f of ["hero-mobile.mp4", "hero-desktop.mp4"]) {
  if (existsSync(out("hero", f))) console.log(f, (statSync(out("hero", f)).size / 1e6).toFixed(1) + " MB");
}
const film = out("projects", "en-pista", "film-1080.mp4");
if (existsSync(film)) console.log("film-1080.mp4", (statSync(film).size / 1e6).toFixed(1) + " MB");
