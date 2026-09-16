-- CreateTable
CREATE TABLE "exam_topics" (
    "id" TEXT NOT NULL,
    "examTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "questionCount" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_lessons" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "videoUrl" TEXT,
    "durationMinutes" INTEGER,
    "contentBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_lesson_progresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicLessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_lesson_progresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_topics_examTypeId_idx" ON "exam_topics"("examTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_topics_examTypeId_slug_key" ON "exam_topics"("examTypeId", "slug");

-- CreateIndex
CREATE INDEX "topic_lessons_topicId_idx" ON "topic_lessons"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_lesson_progresses_userId_topicLessonId_key" ON "topic_lesson_progresses"("userId", "topicLessonId");

-- AddForeignKey
ALTER TABLE "exam_topics" ADD CONSTRAINT "exam_topics_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "exam_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_lessons" ADD CONSTRAINT "topic_lessons_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "exam_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_lesson_progresses" ADD CONSTRAINT "topic_lesson_progresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_lesson_progresses" ADD CONSTRAINT "topic_lesson_progresses_topicLessonId_fkey" FOREIGN KEY ("topicLessonId") REFERENCES "topic_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
