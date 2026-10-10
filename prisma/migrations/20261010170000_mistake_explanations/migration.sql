-- Hatalarım "Neden yanlış yaptım?": cached AI explanations per question + wrong option, and per-student views.
-- CreateTable
CREATE TABLE "mistake_explanations" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "mistake_explanations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistake_explanation_views" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "explanationId" TEXT NOT NULL,
    "charged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mistake_explanation_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mistake_explanations_createdAt_status_idx" ON "mistake_explanations"("createdAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "mistake_explanations_questionId_answer_key" ON "mistake_explanations"("questionId", "answer");

-- CreateIndex
CREATE INDEX "mistake_explanation_views_userId_createdAt_idx" ON "mistake_explanation_views"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "mistake_explanation_views_explanationId_idx" ON "mistake_explanation_views"("explanationId");

-- AddForeignKey
ALTER TABLE "mistake_explanations" ADD CONSTRAINT "mistake_explanations_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "diagnostic_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistake_explanation_views" ADD CONSTRAINT "mistake_explanation_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistake_explanation_views" ADD CONSTRAINT "mistake_explanation_views_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "mistake_explanations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

