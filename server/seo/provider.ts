import "server-only";
import type { AIProvider } from "@/lib/seo/providers";
import type { SeoSettings } from "@/lib/seo/settings";

/** Phase 1 has no paid network adapter. A saved provider preference is not an active integration.
 * Phase 2 must implement validated adapters with usage accounting before exposing generation.
 */
export function getSeoProvider(settings: SeoSettings): AIProvider {
  throw new Error(
    `SEO üretim sağlayıcısı henüz etkin değil (${settings.provider}). Faz 1 yalnızca yapılandırma ve içerik envanteri sunar.`,
  );
}
