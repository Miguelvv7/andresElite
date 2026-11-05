#!/usr/bin/env node
// Fotos de Tarifas: fondo en blanco y negro, personas en su color. Requiere macOS
// (la máscara la genera Vision, en scripts/person-mask.swift). Uso: npm run media:tarifas
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const source = ["fotos:video", "fotos/video"].map((d) => join(root, d)).find(existsSync);
const media = join(root, "public", "media");
const target = join(media, "tarifas");
mkdirSync(target, { recursive: true });

const PHOTOS = [
  [join(source, "tarifa-intro-recorte.png"), "intro-portatil"],
  [join(media, "projects/en-pista/03-pista.jpg"), "intro-mini"],
  [join(source, "IMG_7085.JPG"), "impulso"],
  [join(media, "photos/londres-05.jpg"), "impulso-mini"],
  [join(source, "IMG_7968.JPG"), "premium"],
  [join(media, "projects/en-pista/05-frontal.jpg"), "premium-mini"],
  [join(source, "tarifa-elite-recorte.png"), "elite"],
  [join(source, "DSC00692.JPG"), "a-medida"],
];

// Recorta el borde semitransparente de la máscara, que es lo que deja halo de color.
const EDGE_LOW = 0.7;
const EDGE_HIGH = 0.98;

const work = mkdtempSync(join(tmpdir(), "tarifas-bn-"));
const maskTool = join(work, "person-mask");
execFileSync("xcrun", ["swiftc", "-O", join(root, "scripts/person-mask.swift"), "-o", maskTool], { stdio: "inherit" });

for (const [file, name] of PHOTOS) {
  const maskFile = join(work, `${name}.png`);
  execFileSync(maskTool, [file, maskFile], { stdio: "inherit" });

  const { data: color, info } = await sharp(file).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const mask = await sharp(maskFile).resize(width, height).blur(0.6).grayscale().toColourspace("b-w").raw().toBuffer();

  const output = Buffer.alloc(width * height * 3);
  for (let pixel = 0, i = 0; pixel < width * height; pixel++, i += 3) {
    const alpha = Math.min(1, Math.max(0, (mask[pixel] / 255 - EDGE_LOW) / (EDGE_HIGH - EDGE_LOW)));
    const [r, g, b] = [color[i], color[i + 1], color[i + 2]];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    output[i] = gray + (r - gray) * alpha;
    output[i + 1] = gray + (g - gray) * alpha;
    output[i + 2] = gray + (b - gray) * alpha;
  }
  await sharp(output, { raw: { width, height, channels: 3 } })
    .resize({ width: 1800, withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(join(target, `${name}.jpg`));
  console.log(name, `${width}x${height}`);
}

rmSync(work, { recursive: true });
const manifestFile = join(root, "content", "media-manifest.json");
const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
manifest.files = manifest.files.filter((entry) => !entry.output.startsWith("public/media/tarifas/"));
for (const [file, name] of PHOTOS) {
  manifest.files.push({ original: file.replace(`${root}/`, ""), output: `public/media/tarifas/${name}.jpg`, use: "Foto de Tarifas: fondo en blanco y negro" });
}
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
