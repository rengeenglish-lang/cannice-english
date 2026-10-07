CREATE TABLE "seo_competitors" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "seo_competitors_domain_key" ON "seo_competitors"("domain");

CREATE TABLE "seo_competitor_topics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "competitorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "normalized" TEXT NOT NULL,
  "url" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_competitor_topics_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "seo_competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "seo_competitor_topics_competitorId_normalized_key" ON "seo_competitor_topics"("competitorId", "normalized");

CREATE TABLE "seo_serp_results" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "keywordId" TEXT NOT NULL,
  "rank" INTEGER NOT NULL CHECK ("rank" >= 1 AND "rank" <= 20),
  "domain" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "competitorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_serp_results_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "seo_keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "seo_serp_results_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "seo_competitors"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "seo_serp_results_keywordId_rank_key" ON "seo_serp_results"("keywordId", "rank");
CREATE INDEX "seo_serp_results_domain_idx" ON "seo_serp_results"("domain");
