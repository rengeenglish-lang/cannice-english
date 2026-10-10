-- Yazma ve Çeviri Geri Bildirimi: AI-graded writing and translation answers.
CREATE TABLE "writing_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "taskPrompt" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "errorMessage" TEXT,
    "model" TEXT NOT NULL,
    "estimatedUsd" DECIMAL(10,5) NOT NULL,
    "actualUsd" DECIMAL(10,5),
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "writing_feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "writing_feedback_userId_createdAt_idx" ON "writing_feedback"("userId", "createdAt");
CREATE INDEX "writing_feedback_createdAt_status_idx" ON "writing_feedback"("createdAt", "status");

ALTER TABLE "writing_feedback" ADD CONSTRAINT "writing_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
