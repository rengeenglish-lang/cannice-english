-- CreateEnum
CREATE TYPE "StudyGoalPeriod" AS ENUM ('DAY', 'WEEK', 'MONTH');

-- CreateEnum
CREATE TYPE "StudyGoalStatus" AS ENUM ('ACTIVE', 'REACHED', 'FAILED');

-- CreateEnum
CREATE TYPE "StudyGoalItemKind" AS ENUM ('TOPIC', 'PRACTICE', 'MOCK_EXAM', 'CUSTOM');

-- CreateTable
CREATE TABLE "study_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" "StudyGoalPeriod" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "StudyGoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "reachedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_goal_items" (
    "id" TEXT NOT NULL,
    "studyGoalId" TEXT NOT NULL,
    "kind" "StudyGoalItemKind" NOT NULL,
    "examTopicId" TEXT,
    "quantity" INTEGER,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_goal_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_goals_userId_period_periodStart_idx" ON "study_goals"("userId", "period", "periodStart");

-- CreateIndex
CREATE INDEX "study_goals_userId_status_idx" ON "study_goals"("userId", "status");

-- CreateIndex
CREATE INDEX "study_goal_items_studyGoalId_idx" ON "study_goal_items"("studyGoalId");

-- AddForeignKey
ALTER TABLE "study_goals" ADD CONSTRAINT "study_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_goal_items" ADD CONSTRAINT "study_goal_items_studyGoalId_fkey" FOREIGN KEY ("studyGoalId") REFERENCES "study_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_goal_items" ADD CONSTRAINT "study_goal_items_examTopicId_fkey" FOREIGN KEY ("examTopicId") REFERENCES "exam_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
