-- Beceri Analizi "Çalıştığım süre": active reading time per Konu Anlatımı topic.
-- CreateTable
CREATE TABLE "topic_study_times" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examTopicId" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "lastPingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_study_times_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topic_study_times_userId_examTopicId_key" ON "topic_study_times"("userId", "examTopicId");

-- AddForeignKey
ALTER TABLE "topic_study_times" ADD CONSTRAINT "topic_study_times_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_study_times" ADD CONSTRAINT "topic_study_times_examTopicId_fkey" FOREIGN KEY ("examTopicId") REFERENCES "exam_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Gelen Koçluk Önerileri: admins mark suggestions as handled.
-- AlterTable
ALTER TABLE "coaching_feedback" ADD COLUMN "handledAt" TIMESTAMP(3);
