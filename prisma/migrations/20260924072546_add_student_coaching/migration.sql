-- CreateEnum
CREATE TYPE "CoachingPathway" AS ENUM ('IELTS', 'TOEFL', 'PTE', 'YDS', 'YOKDIL', 'YDT');

-- CreateEnum
CREATE TYPE "StudyTaskKind" AS ENUM ('LESSON', 'PRACTICE', 'TIMED_PRACTICE', 'MOCK', 'LEVEL_TEST', 'VOCAB_REVIEW', 'MISTAKE_REVIEW', 'SPEAKING', 'WRITING', 'LISTENING', 'READING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StudyTaskStatus" AS ENUM ('PLANNED', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "CoachingReportKind" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "coaching_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "pathway" "CoachingPathway" NOT NULL,
    "examVersion" TEXT NOT NULL,
    "contentExamSlug" TEXT,
    "targetScore" TEXT,
    "skillTargets" JSONB,
    "examDate" DATE,
    "currentLevel" TEXT,
    "recentScore" TEXT,
    "recentScoreKind" TEXT,
    "studyDays" INTEGER[],
    "dailyMinutes" INTEGER NOT NULL,
    "commitment" TEXT,
    "difficulties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reminderTime" TEXT NOT NULL DEFAULT '19:00',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "notifyInApp" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT NOT NULL DEFAULT 'NORMAL',
    "quietStart" TEXT NOT NULL DEFAULT '22:00',
    "quietEnd" TEXT NOT NULL DEFAULT '08:00',
    "pausedUntil" TIMESTAMP(3),
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "guardianConsentAt" TIMESTAMP(3),
    "vocabSourceCursor" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaching_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plan_weeks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "basis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_plan_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_tasks" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "kind" "StudyTaskKind" NOT NULL,
    "skill" TEXT,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "href" TEXT,
    "refType" TEXT,
    "refId" TEXT,
    "isGap" BOOLEAN NOT NULL DEFAULT false,
    "minutes" INTEGER NOT NULL,
    "busyMinutes" INTEGER,
    "status" "StudyTaskStatus" NOT NULL DEFAULT 'PLANNED',
    "skipReason" TEXT,
    "completion" TEXT,
    "completedAt" TIMESTAMP(3),
    "selfMinutes" INTEGER,
    "attemptId" TEXT,
    "startedAt" TIMESTAMP(3),
    "postponedCount" INTEGER NOT NULL DEFAULT 0,
    "editedByStudent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_proposals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "plan_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example" TEXT,
    "source" TEXT NOT NULL,
    "sourceRef" TEXT,
    "box" INTEGER NOT NULL DEFAULT 1,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "masteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocab_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistake_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT,
    "note" TEXT,
    "topicTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL,
    "timesWrong" INTEGER NOT NULL DEFAULT 1,
    "correctStreak" INTEGER NOT NULL DEFAULT 0,
    "lastWrongAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRetryDay" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "masteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mistake_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_check_ins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "manageable" TEXT NOT NULL,
    "hardestSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workloadChange" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT,
    "useful" BOOLEAN,
    "workloadRealistic" BOOLEAN,
    "reminderFrequency" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "CoachingReportKind" NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notificationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coaching_profiles_userId_key" ON "coaching_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "study_plan_weeks_userId_weekStart_key" ON "study_plan_weeks"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "study_tasks_userId_date_idx" ON "study_tasks"("userId", "date");

-- CreateIndex
CREATE INDEX "plan_proposals_userId_status_idx" ON "plan_proposals"("userId", "status");

-- CreateIndex
CREATE INDEX "vocab_cards_userId_dueAt_idx" ON "vocab_cards"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "vocab_cards_userId_term_key" ON "vocab_cards"("userId", "term");

-- CreateIndex
CREATE INDEX "mistake_entries_userId_dueAt_idx" ON "mistake_entries"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "mistake_entries_userId_questionId_key" ON "mistake_entries"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "coaching_check_ins_userId_weekStart_key" ON "coaching_check_ins"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "coaching_feedback_userId_createdAt_idx" ON "coaching_feedback"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "coaching_reports_userId_kind_periodStart_key" ON "coaching_reports"("userId", "kind", "periodStart");

-- CreateIndex
CREATE INDEX "coaching_notification_logs_userId_createdAt_idx" ON "coaching_notification_logs"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "coaching_notification_logs_userId_dedupeKey_key" ON "coaching_notification_logs"("userId", "dedupeKey");

-- AddForeignKey
ALTER TABLE "coaching_profiles" ADD CONSTRAINT "coaching_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_weeks" ADD CONSTRAINT "study_plan_weeks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_tasks" ADD CONSTRAINT "study_tasks_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "study_plan_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_tasks" ADD CONSTRAINT "study_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_proposals" ADD CONSTRAINT "plan_proposals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_cards" ADD CONSTRAINT "vocab_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistake_entries" ADD CONSTRAINT "mistake_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_check_ins" ADD CONSTRAINT "coaching_check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_feedback" ADD CONSTRAINT "coaching_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_reports" ADD CONSTRAINT "coaching_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_notification_logs" ADD CONSTRAINT "coaching_notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
