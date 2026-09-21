import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/server/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api", "/checkout", "/cart"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
