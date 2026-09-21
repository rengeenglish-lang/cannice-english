-- AlterTable
ALTER TABLE "diagnostic_topics" ADD COLUMN     "examTypeId" TEXT;

-- CreateIndex
CREATE INDEX "diagnostic_topics_examTypeId_idx" ON "diagnostic_topics"("examTypeId");

-- AddForeignKey
ALTER TABLE "diagnostic_topics" ADD CONSTRAINT "diagnostic_topics_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "exam_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
