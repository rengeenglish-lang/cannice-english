import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com https://www.sandbox.paypal.com https://embed.tawk.to https://*.tawk.to https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://*.tawk.to https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://*.tawk.to https://fonts.gstatic.com",
  "connect-src 'self' https: wss://*.tawk.to",
  "media-src 'self' https:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.paypal.com https://www.sandbox.paypal.com https://*.tawk.to",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/ebooks/*": ["./content/ebooks/*.pdf"],
    // the reader rasterises pages from the same PDFs
    "/api/ebooks/*/sayfa/*": ["./content/ebooks/*.pdf"],
    // the blog cover renderer reads this font at runtime
    "/blog/[slug]/cover": ["./lib/fonts/**"],
  },
  serverExternalPackages: ["mupdf"],
  images: {
    minimumCacheTTL: 2_678_400,
    formats: ["image/webp"],
  },
  poweredByHeader: false,
  experimental: { authInterrupts: true },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...(process.env.NODE_ENV === "production"
            ? [
                { key: "Content-Security-Policy", value: contentSecurityPolicy },
                { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
              ]
            : []),
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

