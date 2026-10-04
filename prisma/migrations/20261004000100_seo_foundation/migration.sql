-- CreateTable
CREATE TABLE "seo_content_items" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "examSlug" TEXT,
    "topic" TEXT,
    "languageCode" TEXT,
    "access" TEXT NOT NULL,
    "publication" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "internalLinks" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "sourceUpdatedAt" TIMESTAMP(3),
    "scannedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "seo_content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_activity_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_content_items_sourceKey_key" ON "seo_content_items"("sourceKey");

-- CreateIndex
CREATE INDEX "seo_content_items_url_idx" ON "seo_content_items"("url");

-- CreateIndex
CREATE INDEX "seo_content_items_available_sourceType_idx" ON "seo_content_items"("available", "sourceType");

-- CreateIndex
CREATE INDEX "seo_content_items_examSlug_idx" ON "seo_content_items"("examSlug");

-- CreateIndex
CREATE INDEX "seo_content_items_scannedAt_idx" ON "seo_content_items"("scannedAt");

-- CreateIndex
CREATE INDEX "seo_activity_logs_createdAt_idx" ON "seo_activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "seo_activity_logs_actorId_action_createdAt_idx" ON "seo_activity_logs"("actorId", "action", "createdAt");

-- AddForeignKey
ALTER TABLE "seo_activity_logs" ADD CONSTRAINT "seo_activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
