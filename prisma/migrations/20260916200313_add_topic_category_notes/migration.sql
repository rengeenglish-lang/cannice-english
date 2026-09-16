-- AlterTable
ALTER TABLE "exam_topics" ADD COLUMN     "category" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "skillsTested" TEXT;

-- CreateTable
CREATE TABLE "topic_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examTopicId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topic_notes_userId_examTopicId_key" ON "topic_notes"("userId", "examTopicId");

-- AddForeignKey
ALTER TABLE "topic_notes" ADD CONSTRAINT "topic_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_notes" ADD CONSTRAINT "topic_notes_examTopicId_fkey" FOREIGN KEY ("examTopicId") REFERENCES "exam_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
