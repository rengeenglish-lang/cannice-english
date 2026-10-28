ALTER TYPE "AuthTokenKind" ADD VALUE 'BOOK_SIGNIN';

CREATE TABLE "user_ebook_selections" (
  "userId" TEXT NOT NULL,
  "bookSlug" TEXT NOT NULL,
  "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_ebook_selections_pkey" PRIMARY KEY ("userId", "bookSlug")
);
ALTER TABLE "user_ebook_selections" ADD CONSTRAINT "user_ebook_selections_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ebook_promotion_access" (
  "userId" TEXT NOT NULL,
  "firstBookSlug" TEXT,
  "firstDownloadedAt" TIMESTAMP(3),
  "unlockedAt" TIMESTAMP(3),
  "reviewId" TEXT,
  "trialSubscriptionId" TEXT,
  CONSTRAINT "ebook_promotion_access_pkey" PRIMARY KEY ("userId")
);
CREATE UNIQUE INDEX "ebook_promotion_access_reviewId_key" ON "ebook_promotion_access"("reviewId");
CREATE UNIQUE INDEX "ebook_promotion_access_trialSubscriptionId_key" ON "ebook_promotion_access"("trialSubscriptionId");
ALTER TABLE "ebook_promotion_access" ADD CONSTRAINT "ebook_promotion_access_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ebook_promotion_access" ADD CONSTRAINT "ebook_promotion_access_reviewId_fkey"
  FOREIGN KEY ("reviewId") REFERENCES "site_reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ebook_promotion_access" ADD CONSTRAINT "ebook_promotion_access_trialSubscriptionId_fkey"
  FOREIGN KEY ("trialSubscriptionId") REFERENCES "plan_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
