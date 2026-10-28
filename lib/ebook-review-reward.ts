export const EBOOK_REVIEW_TRIAL_DAYS = 7;
export const EBOOK_REVIEW_TRIAL_TIER = "CIRAK" as const;
export const EBOOK_REVIEW_UNLOCK_MESSAGE = "İkinci ve sonraki PDF kitaplarını indirmek için Netfener deneyiminle ilgili dürüst bir yorum paylaş. Yorumunu gönderdiğinde kampanya süresince tüm e-kitapların PDF indirmeleri açılır ve 7 günlük ücretsiz Çırak dijital denemen başlar. Olumlu yorum veya belirli bir puan şartı yoktur.";
export const EBOOK_REVIEW_REWARD_DISCLOSURE = "Bu yorum karşılığında ücretsiz e-kitap erişimi ve 7 günlük dijital deneme hakkı verildi. Ödül puandan bağımsızdır.";

export type EbookPromotionState = {
  firstBookSlug: string | null;
  reviewUnlocked: boolean;
  trialEndsAt: string | null;
};

export function needsEbookReview(state: EbookPromotionState | undefined, slug: string): boolean {
  return Boolean(state?.firstBookSlug && state.firstBookSlug !== slug && !state.reviewUnlocked);
}
