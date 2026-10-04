CREATE TABLE "seo_article_drafts" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "keywordId" TEXT NOT NULL,
 "postId" TEXT NOT NULL,
 "brief" JSONB NOT NULL,
 "briefReady" BOOLEAN NOT NULL DEFAULT false,
 "revision" INTEGER NOT NULL DEFAULT 0 CHECK ("revision" >= 0),
 "reviewedHash" TEXT,
 "reviewedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "seo_article_drafts_keywordId_key" ON "seo_article_drafts"("keywordId");
CREATE UNIQUE INDEX "seo_article_drafts_postId_key" ON "seo_article_drafts"("postId");
CREATE INDEX "seo_article_drafts_updatedAt_idx" ON "seo_article_drafts"("updatedAt");
ALTER TABLE "seo_article_drafts" ADD CONSTRAINT "seo_article_drafts_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "seo_keywords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_article_drafts" ADD CONSTRAINT "seo_article_drafts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
