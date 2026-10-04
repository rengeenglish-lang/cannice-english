CREATE TABLE "seo_keywords" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "keyword" TEXT NOT NULL,
 "normalized" TEXT NOT NULL,
 "languageCode" TEXT NOT NULL,
 "market" TEXT NOT NULL,
 "intent" TEXT NOT NULL,
 "examId" TEXT,
 "sourceNote" TEXT NOT NULL,
 "monthlySearches" INTEGER,
 "demandSource" TEXT,
 "demandCheckedAt" TIMESTAMP(3),
 "archived" BOOLEAN NOT NULL DEFAULT false,
 "revision" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "seo_keyword_demand_evidence" CHECK (
  ("monthlySearches" IS NULL AND "demandSource" IS NULL AND "demandCheckedAt" IS NULL)
  OR ("monthlySearches" IS NOT NULL AND "monthlySearches" >= 0 AND "demandSource" IS NOT NULL AND "demandCheckedAt" IS NOT NULL)
 ),
 CONSTRAINT "seo_keyword_revision" CHECK ("revision" >= 0)
);
CREATE UNIQUE INDEX "seo_keywords_normalized_languageCode_market_key" ON "seo_keywords"("normalized", "languageCode", "market");
CREATE INDEX "seo_keywords_archived_updatedAt_idx" ON "seo_keywords"("archived", "updatedAt");
CREATE INDEX "seo_keywords_examId_idx" ON "seo_keywords"("examId");
ALTER TABLE "seo_keywords" ADD CONSTRAINT "seo_keywords_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
