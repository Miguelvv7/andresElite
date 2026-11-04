import "server-only";
import type { ProjectVideo } from "./types";

const API = "https://api.mux.com/video/v1";

export const isMuxConfigured = () =>
  Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);

async function mux<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString("base64");
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Mux respondió ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

/** URL de subida directa y de un solo uso. El navegador nunca ve las credenciales. */
export function createDirectUpload(origin: string) {
  return mux<{ id: string; url: string }>("/uploads", {
    method: "POST",
    body: JSON.stringify({
      cors_origin: origin,
      new_asset_settings: {
        playback_policy: ["public"],
        video_quality: "premium",
        // Tope, no garantía: Mux genera 2160p solo si el máster y el plan lo permiten.
        max_resolution_tier: "2160p",
      },
    }),
  });
}

type MuxStatus = Extract<ProjectVideo, { provider: "mux" }>["status"];

/** Sigue el camino subida → asset → playbackId. */
export async function getUploadState(uploadId: string) {
  const upload = await mux<{ status: string; asset_id?: string }>(`/uploads/${encodeURIComponent(uploadId)}`);
  if (["errored", "cancelled", "timed_out"].includes(upload.status)) {
    return { status: "errored" as MuxStatus };
  }
  if (!upload.asset_id) return { status: "waiting" as MuxStatus };

  const asset = await mux<{
    status: "preparing" | "ready" | "errored";
    resolution_tier?: string;
    playback_ids?: { id: string }[];
  }>(`/assets/${upload.asset_id}`);

  const status: MuxStatus =
    asset.status === "ready" ? "ready" : asset.status === "errored" ? "errored" : "processing";
  return {
    status,
    assetId: upload.asset_id,
    playbackId: asset.playback_ids?.[0]?.id,
    maxResolution: asset.resolution_tier,
  };
}
