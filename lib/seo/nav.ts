/** Single source of truth for SEO admin navigation, grouped by the order people actually work in. */
export type NavItem = { slug: string; href: string; label: string; hint: string; soon?: string };
export type NavGroup = { id: string; title: string; items: NavItem[] };

const item = (slug: string, label: string, hint: string, href = `/admin/seo/${slug}`): NavItem => ({ slug, href, label, hint });

export const NAV_HOME: NavItem = item("overview", "Başlangıç", "Durum özeti ve sıradaki işler");
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "plan",
    title: "1 · Planla",
    items: [
      item("opportunities", "Fırsatlar", "Hangi konulara yazılmalı"),
      item("keywords", "Anahtar kelimeler", "Anahtar kelime listesi ve amaçları"),
      item("clusters", "Konu kümeleri", "Ana sayfa ve destekleyen sayfalar"),
      item("topics", "Konu haritası", "Kelimelerin sınav ve dil dağılımı"),
    ],
  },
  {
    id: "write",
    title: "2 · Yaz",
    items: [
      item("studio", "Makale stüdyosu", "Brief, yazı, inceleme, onay ve yayın"),
      item("links", "İç bağlantılar", "Taslaklar için bağlantı önerileri"),
      item("inventory", "Mevcut içerik", "Sitedeki sayfaların envanteri"),
    ],
  },
  {
    id: "publish",
    title: "3 · Yayınla",
    items: [item("calendar", "İçerik takvimi", "Onaylı, zamanlanan ve yayındaki yazılar")],
  },
  {
    id: "measure",
    title: "4 · Ölç ve geliştir",
    items: [
      item("performance", "Performans", "Search Console verisi ve düşen sayfalar"),
      item("quick-wins", "Hızlı kazanımlar", "Küçük değişikliklerle kazanılacak tıklamalar"),
      item("refresh", "İçerik yenileme", "Hangi sayfa güncellenmeli"),
      { ...item("conversions", "Dönüşümler", "Hangi yazı kayıt ve satış getiriyor"), soon: "Faz 6" },
    ],
  },
  {
    id: "system",
    title: "Sistem",
    items: [
      item("settings", "Ayarlar", "Sınavlar, limitler, güvenlik eşikleri"),
      item("activity", "İşlem geçmişi", "Kim ne zaman ne yaptı"),
      { ...item("competitors", "Rakipler", "Rakip içerik boşlukları"), soon: "Faz 8" },
    ],
  },
];
export const ALL_NAV_ITEMS = [NAV_HOME, ...NAV_GROUPS.flatMap((g) => g.items)];
export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
export function currentLabel(pathname: string) {
  return ALL_NAV_ITEMS.find((i) => isActive(pathname, i.href))?.label ?? "SEO Autopilot";
}
