-- AlterTable
ALTER TABLE "diagnostic_attempts" ADD COLUMN     "mockSetNumber" INTEGER;

-- AlterTable
ALTER TABLE "diagnostic_questions" ADD COLUMN     "mockSetNumber" INTEGER;

-- CreateIndex
CREATE INDEX "diagnostic_questions_examTypeId_mockSetNumber_idx" ON "diagnostic_questions"("examTypeId", "mockSetNumber");
