import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getPublishedProjects } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();
  return [
    { url: site.url, priority: 1 },
    ...["sobre-mi", "filmmaking", "shooting", "tarifas"].map((path) => ({ url: `${site.url}/${path}`, priority: 0.9 })),
    ...projects.map((p) => ({ url: `${site.url}/filmmaking/${p.slug}`, priority: 0.8 })),
  ];
}
