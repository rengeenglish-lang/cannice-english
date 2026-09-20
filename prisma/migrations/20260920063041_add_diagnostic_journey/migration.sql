-- CreateEnum
CREATE TYPE "ExamFamily" AS ENUM ('ACADEMIC_SKILLS', 'TRANSLATION_GRAMMAR');

-- CreateEnum
CREATE TYPE "GoalTimeframe" AS ENUM ('EXACT_DATE', 'ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DiagnosticTopicKind" AS ENUM ('SKILL', 'SUBSKILL', 'TOPIC');

-- CreateEnum
CREATE TYPE "DiagnosticQuestionType" AS ENUM ('MCQ', 'LISTENING_MCQ', 'CLOZE', 'TRANSLATION_EN_TR', 'TRANSLATION_TR_EN', 'SENTENCE_COMPLETION', 'PARAGRAPH_COMPLETION', 'READING_COMPREHENSION', 'RESTATEMENT', 'WRITING_TASK', 'SPEAKING_TASK');

-- CreateEnum
CREATE TYPE "DiagnosticDifficulty" AS ENUM ('KOLAY', 'ORTA', 'ZOR');

-- CreateEnum
CREATE TYPE "DiagnosticAttemptKind" AS ENUM ('FULL_DIAGNOSTIC', 'MASTERY_CHECK');

-- CreateEnum
CREATE TYPE "DiagnosticAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "DiagnosticSeverity" AS ENUM ('CRITICAL', 'NEEDS_IMPROVEMENT', 'DEVELOPING', 'STRONG');

-- CreateEnum
CREATE TYPE "RoadmapItemStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'MASTERY_CHECK_REQUIRED', 'COMPLETED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "diagnosticTopicIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "topic_lessons" ADD COLUMN     "diagnosticTopicIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "exam_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examTypeId" TEXT NOT NULL,
    "currentScoreRaw" TEXT,
    "currentScoreKnown" BOOLEAN NOT NULL DEFAULT false,
    "targetScoreRaw" TEXT NOT NULL,
    "targetTimeframe" "GoalTimeframe" NOT NULL DEFAULT 'UNKNOWN',
    "targetDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_topics" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "DiagnosticTopicKind" NOT NULL,
    "examFamilies" "ExamFamily"[],
    "parentTopicId" TEXT,
    "importanceWeight" INTEGER NOT NULL DEFAULT 1,
    "estimatedMinutes" INTEGER,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_dependencies" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "dependsOnTopicId" TEXT NOT NULL,

    CONSTRAINT "topic_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_questions" (
    "id" TEXT NOT NULL,
    "examFamily" "ExamFamily" NOT NULL,
    "examTypeId" TEXT,
    "topicId" TEXT NOT NULL,
    "secondaryTopicIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questionType" "DiagnosticQuestionType" NOT NULL,
    "difficulty" "DiagnosticDifficulty" NOT NULL DEFAULT 'ORTA',
    "prompt" TEXT NOT NULL,
    "passageText" TEXT,
    "audioUrl" TEXT,
    "options" JSONB,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examTypeId" TEXT NOT NULL,
    "examFamily" "ExamFamily" NOT NULL,
    "kind" "DiagnosticAttemptKind" NOT NULL DEFAULT 'FULL_DIAGNOSTIC',
    "scopeTopicId" TEXT,
    "goalId" TEXT,
    "status" "DiagnosticAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "questionOrder" TEXT[],
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_responses" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerRaw" TEXT,
    "isCorrect" BOOLEAN,
    "gradingStatus" "SubmissionStatus",
    "teacherFeedback" TEXT,
    "score" DECIMAL(5,2),
    "reviewedAt" TIMESTAMP(3),
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_topic_results" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "questionsAnswered" INTEGER NOT NULL,
    "questionsCorrect" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "severity" "DiagnosticSeverity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_topic_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_roadmap_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "priorityRank" INTEGER NOT NULL,
    "severityAtCreation" "DiagnosticSeverity" NOT NULL,
    "status" "RoadmapItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "sourceAttemptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "study_roadmap_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_goals_userId_examTypeId_isActive_idx" ON "exam_goals"("userId", "examTypeId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_topics_slug_key" ON "diagnostic_topics"("slug");

-- CreateIndex
CREATE INDEX "diagnostic_topics_kind_idx" ON "diagnostic_topics"("kind");

-- CreateIndex
CREATE INDEX "diagnostic_topics_parentTopicId_idx" ON "diagnostic_topics"("parentTopicId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_dependencies_topicId_dependsOnTopicId_key" ON "topic_dependencies"("topicId", "dependsOnTopicId");

-- CreateIndex
CREATE INDEX "diagnostic_questions_examFamily_topicId_isActive_idx" ON "diagnostic_questions"("examFamily", "topicId", "isActive");

-- CreateIndex
CREATE INDEX "diagnostic_questions_examTypeId_idx" ON "diagnostic_questions"("examTypeId");

-- CreateIndex
CREATE INDEX "diagnostic_attempts_userId_examTypeId_status_idx" ON "diagnostic_attempts"("userId", "examTypeId", "status");

-- CreateIndex
CREATE INDEX "diagnostic_attempts_goalId_idx" ON "diagnostic_attempts"("goalId");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_responses_attemptId_questionId_key" ON "diagnostic_responses"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "diagnostic_topic_results_userId_topicId_createdAt_idx" ON "diagnostic_topic_results"("userId", "topicId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_topic_results_attemptId_topicId_key" ON "diagnostic_topic_results"("attemptId", "topicId");

-- CreateIndex
CREATE INDEX "study_roadmap_items_userId_goalId_priorityRank_idx" ON "study_roadmap_items"("userId", "goalId", "priorityRank");

-- CreateIndex
CREATE UNIQUE INDEX "study_roadmap_items_userId_goalId_topicId_key" ON "study_roadmap_items"("userId", "goalId", "topicId");

-- CreateIndex
CREATE INDEX "analytics_events_event_createdAt_idx" ON "analytics_events"("event", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_userId_createdAt_idx" ON "analytics_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "products_diagnosticTopicIds_idx" ON "products" USING GIN ("diagnosticTopicIds");

-- CreateIndex
CREATE INDEX "topic_lessons_diagnosticTopicIds_idx" ON "topic_lessons" USING GIN ("diagnosticTopicIds");

-- AddForeignKey
ALTER TABLE "exam_goals" ADD CONSTRAINT "exam_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_goals" ADD CONSTRAINT "exam_goals_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "exam_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_topics" ADD CONSTRAINT "diagnostic_topics_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "diagnostic_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_dependencies" ADD CONSTRAINT "topic_dependencies_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "diagnostic_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_dependencies" ADD CONSTRAINT "topic_dependencies_dependsOnTopicId_fkey" FOREIGN KEY ("dependsOnTopicId") REFERENCES "diagnostic_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_questions" ADD CONSTRAINT "diagnostic_questions_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "exam_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_questions" ADD CONSTRAINT "diagnostic_questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "diagnostic_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_attempts" ADD CONSTRAINT "diagnostic_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_attempts" ADD CONSTRAINT "diagnostic_attempts_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "exam_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_attempts" ADD CONSTRAINT "diagnostic_attempts_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "exam_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_responses" ADD CONSTRAINT "diagnostic_responses_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "diagnostic_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_responses" ADD CONSTRAINT "diagnostic_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "diagnostic_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_topic_results" ADD CONSTRAINT "diagnostic_topic_results_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "diagnostic_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_topic_results" ADD CONSTRAINT "diagnostic_topic_results_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "diagnostic_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_roadmap_items" ADD CONSTRAINT "study_roadmap_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_roadmap_items" ADD CONSTRAINT "study_roadmap_items_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "exam_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_roadmap_items" ADD CONSTRAINT "study_roadmap_items_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "diagnostic_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
