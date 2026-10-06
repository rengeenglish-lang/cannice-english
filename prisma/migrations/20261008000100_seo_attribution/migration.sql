CREATE TABLE "seo_article_days" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "day" DATE NOT NULL,
  "organicViews" INTEGER NOT NULL DEFAULT 0 CHECK ("organicViews" >= 0),
  "otherViews" INTEGER NOT NULL DEFAULT 0 CHECK ("otherViews" >= 0),
  CONSTRAINT "seo_article_days_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "seo_article_days_postId_day_key" ON "seo_article_days"("postId", "day");

CREATE TABLE "seo_attributions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "postId" TEXT,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_attributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "seo_attributions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "seo_attributions_userId_key" ON "seo_attributions"("userId");
CREATE INDEX "seo_attributions_postId_createdAt_idx" ON "seo_attributions"("postId", "createdAt");
