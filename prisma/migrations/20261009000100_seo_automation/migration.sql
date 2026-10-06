CREATE TABLE "seo_jobs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "dedupeKey" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "runAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "lockedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "result" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_jobs_status_check" CHECK ("status" IN ('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED'))
);
CREATE UNIQUE INDEX "seo_jobs_dedupeKey_key" ON "seo_jobs"("dedupeKey");
CREATE INDEX "seo_jobs_status_runAt_idx" ON "seo_jobs"("status", "runAt");

CREATE TABLE "seo_ai_usage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "month" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RESERVED',
  "estimatedUsd" DECIMAL(10,4) NOT NULL CHECK ("estimatedUsd" >= 0),
  "actualUsd" DECIMAL(10,4) CHECK ("actualUsd" >= 0),
  "inputTokens" INTEGER,
  "outputTokens" INTEGER,
  "draftId" TEXT,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "settledAt" TIMESTAMP(3),
  CONSTRAINT "seo_ai_usage_status_check" CHECK ("status" IN ('RESERVED','SETTLED','RELEASED'))
);
CREATE INDEX "seo_ai_usage_month_status_idx" ON "seo_ai_usage"("month", "status");
CREATE INDEX "seo_ai_usage_createdAt_idx" ON "seo_ai_usage"("createdAt");
