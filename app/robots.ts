import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/server/env";

const BLOCKED_CRAWLERS = [
  "AhrefsBot",
  "SERankingBacklinksBot",
  "MJ12bot",
  "SemrushBot",
  "DotBot",
  "BLEXBot",
  "DataForSeoBot",
  "Amazonbot",
  "PetalBot",
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api", "/checkout", "/cart"] },
      // SEO-tool and bulk crawlers (they gave no search traffic but ran ~250k dictionary renders in 3 days).
      { userAgent: BLOCKED_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
