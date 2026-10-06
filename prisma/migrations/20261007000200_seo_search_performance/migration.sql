CREATE TABLE "seo_search_snapshots" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "periodStart" DATE NOT NULL,
  "periodEnd" DATE NOT NULL,
  "kind" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "droppedRows" INTEGER NOT NULL DEFAULT 0,
  "importedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_search_snapshots_period_check" CHECK ("periodEnd" >= "periodStart")
);
CREATE UNIQUE INDEX "seo_search_snapshots_kind_periodStart_periodEnd_key" ON "seo_search_snapshots"("kind", "periodStart", "periodEnd");
CREATE INDEX "seo_search_snapshots_kind_periodEnd_idx" ON "seo_search_snapshots"("kind", "periodEnd");

CREATE TABLE "seo_search_rows" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "snapshotId" TEXT NOT NULL,
  "page" TEXT NOT NULL DEFAULT '',
  "query" TEXT NOT NULL DEFAULT '',
  "clicks" INTEGER NOT NULL CHECK ("clicks" >= 0),
  "impressions" INTEGER NOT NULL CHECK ("impressions" >= 0),
  "ctr" DOUBLE PRECISION NOT NULL,
  "position" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "seo_search_rows_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "seo_search_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "seo_search_rows_snapshotId_page_query_key" ON "seo_search_rows"("snapshotId", "page", "query");
CREATE INDEX "seo_search_rows_snapshotId_page_idx" ON "seo_search_rows"("snapshotId", "page");
