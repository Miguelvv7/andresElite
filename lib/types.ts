export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type VideoAspect = "16:9" | "9:16";

export type ProjectVideo =
  | { provider: "none" }
  /** Versión web servida desde /public. Solo para demostración hasta tener Mux. */
  | { provider: "local"; src: string; aspect: VideoAspect; note?: string }
  | {
      provider: "mux";
      aspect: VideoAspect;
      uploadId?: string;
      assetId?: string;
      playbackId?: string;
      /** Estado de procesamiento devuelto por Mux. */
      status: "waiting" | "processing" | "ready" | "errored";
      maxResolution?: string;
    };

export type Credit = { role: string; name: string };

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: number;
  client?: string;
  role?: string;
  /** Logo del cliente, si lo hay. */
  logo?: ImageAsset;
  description: string;
  poster: ImageAsset | null;
  video: ProjectVideo;
  /** Vídeo ligero y sin sonido para la tarjeta. Es independiente del streaming. */
  preview?: string;
  gallery: ImageAsset[];
  credits?: Credit[];
  published: boolean;
  order: number;
};

export type Photo = ImageAsset & { id: string; caption?: string };
