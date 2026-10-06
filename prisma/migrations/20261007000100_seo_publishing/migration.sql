ALTER TABLE "seo_article_drafts"
  ADD COLUMN "approvedHash" TEXT,
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "approvedById" TEXT,
  ADD COLUMN "scheduledFor" TIMESTAMP(3),
  ADD COLUMN "scheduleError" TEXT;
CREATE INDEX "seo_article_drafts_scheduledFor_idx" ON "seo_article_drafts"("scheduledFor");

CREATE TABLE "seo_article_versions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "draftId" TEXT NOT NULL,
  "version" INTEGER NOT NULL CHECK ("version" >= 1),
  "reason" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "score" INTEGER,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_article_versions_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "seo_article_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "seo_article_versions_draftId_version_key" ON "seo_article_versions"("draftId", "version");

CREATE TABLE "seo_slug_redirects" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fromSlug" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_slug_redirects_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "seo_slug_redirects_fromSlug_key" ON "seo_slug_redirects"("fromSlug");
CREATE INDEX "seo_slug_redirects_postId_idx" ON "seo_slug_redirects"("postId");
