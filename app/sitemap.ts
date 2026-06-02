import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://ahenk.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/hakkinda", "/indir", "/guvenlik", "/gizlilik", "/kosullar", "/kvkk"];
  return routes.map((r) => ({
    url: `${BASE}${r}`,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.6,
  }));
}
