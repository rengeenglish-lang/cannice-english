import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cannice-english.example.com";
  return [
    { url: `${base}/` },
    { url: `${base}/packages` },
    { url: `${base}/books` },
    { url: `${base}/blog` },
    { url: `${base}/tools` },
  ];
}
